\set ON_ERROR_STOP on
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$begin
 begin update public.projects set data=jsonb_set(data,'{pricing,rate}','"100"')||jsonb_build_object('pricing',(data->'pricing')||'{"mode":"margin","rate":"100"}'::jsonb) where id='20000000-0000-4000-8000-000000000001';raise exception 'Singular margin bypass';exception when raise_exception then if sqlerrm<>'Invalid margin' then raise;end if;end;
 begin update public.projects set data=jsonb_set(data,'{scope,0,quantity}','"-1"') where id='20000000-0000-4000-8000-000000000001';raise exception 'Negative quantity bypass';exception when raise_exception then if sqlerrm<>'Invalid project aggregate' then raise;end if;end;
 begin update public.projects set data=jsonb_set(data,'{scope,0,components,0,waste}','"101"') where id='20000000-0000-4000-8000-000000000001';raise exception 'Waste bypass';exception when raise_exception then if sqlerrm<>'Invalid waste percentage' then raise;end if;end;
 begin update public.projects set data=data||'{"unexpectedPrivilegedField":true}' where id='20000000-0000-4000-8000-000000000001';raise exception 'Unknown field bypass';exception when raise_exception then if sqlerrm<>'Invalid project aggregate' then raise;end if;end;
 begin update public.projects set data=data||'{"id":"00000000-0000-4000-8000-000000000000"}' where id='20000000-0000-4000-8000-000000000001';raise exception 'Identity bypass';exception when raise_exception then if sqlerrm<>'Project identity mismatch' then raise;end if;end;
end$$;
reset role;
select 'PASS: direct aggregate shape, numeric, margin, waste and identity enforcement';
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$declare p jsonb;snapshot jsonb;begin
 select data into p from public.projects where id='20000000-0000-4000-8000-000000000001';
 snapshot=(p->'proposals'->0->>'snapshot')::jsonb;
 if snapshot->>'sellingPrice'<>'6244.34' then raise exception 'Database proposal arithmetic mismatch: %',snapshot->>'sellingPrice';end if;
 if snapshot ? 'pricing' or snapshot ? 'audit' or snapshot ? 'riskRegister' then raise exception 'Private proposal fields leaked';end if;
 begin update public.projects set data=jsonb_set(data,'{scope,0,status}','"Needs review"')||jsonb_build_object('proposals',(data->'proposals')||'[{"version":2,"issuedAt":"2026-09-09","snapshot":"forged"}]'::jsonb) where id='20000000-0000-4000-8000-000000000001';raise exception 'Unreviewed proposal bypass';exception when raise_exception then if sqlerrm<>'Resolve scope before issue' then raise;end if;end;
end$$;
reset role;
select 'PASS: server-generated customer snapshot arithmetic and review gate';
-- Reservations are consistent across repeated same-plan calls and reject cross-plan overlap.
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
select public.create_organization('Checkout test') as checkout_org \gset
select set_config('test.checkout_org',:'checkout_org',false);
do $$declare first jsonb;again jsonb;begin
 first=public.reserve_checkout(current_setting('test.checkout_org')::uuid,'starter');
 again=public.reserve_checkout(current_setting('test.checkout_org')::uuid,'starter');
 if first->>'attemptId'<>again->>'attemptId' then raise exception 'Checkout idempotency key changed';end if;
 begin perform public.reserve_checkout(current_setting('test.checkout_org')::uuid,'pro');raise exception 'Overlapping checkout permitted';exception when raise_exception then if sqlerrm<>'Checkout already started for another plan; finish it or wait for expiration' then raise;end if;end;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$begin
 begin perform public.reserve_checkout(current_setting('test.checkout_org')::uuid,'starter');raise exception 'Cross-tenant checkout permitted';exception when raise_exception then if sqlerrm<>'Owner/admin required' then raise;end if;end;
end$$;
reset role;
select 'PASS: stable checkout reservations, plan overlap and tenant checks';
create temporary table estimate_cases(data jsonb);
insert into estimate_cases select * from jsonb_array_elements(:'estimate_cases'::jsonb);
do $$declare c jsonb;actual jsonb;begin
 for c in select data from estimate_cases loop
 actual=public.customer_snapshot(c->'project',1,'2026-09-09');
 if actual is distinct from c->'expected' then raise exception 'Database/decimal.js proposal parity failure: % vs %',actual,c->'expected';end if;
 end loop;
end$$;
select 'PASS: database/decimal.js parity for markup, margin, waste, tax, allowances and alternates';
-- Revocation removes tenant access immediately, without deleting audit history.
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select organization_id as revoke_org from public.memberships where user_id='10000000-0000-4000-8000-000000000002' and role='estimator' limit 1 \gset
select public.revoke_member(:'revoke_org','10000000-0000-4000-8000-000000000002');
select set_config('test.revoke_org',:'revoke_org',false);
do $$begin
 begin perform public.revoke_member(current_setting('test.revoke_org')::uuid,auth.uid());raise exception 'Self-revocation allowed';exception when raise_exception then if sqlerrm<>'Cannot revoke your own access' then raise;end if;end;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
do $$begin
 if public.member_role(current_setting('test.revoke_org')::uuid) is not null then raise exception 'Revoked membership survived';end if;
 if exists(select 1 from public.projects where id='20000000-0000-4000-8000-000000000001') then raise exception 'Revoked member still reads project';end if;
 begin perform public.member_directory(current_setting('test.revoke_org')::uuid);raise exception 'Revoked member reads directory';exception when raise_exception then if sqlerrm<>'Owner/admin required' then raise;end if;end;
end$$;
reset role;
select 'PASS: member revocation, owner safety and immediate access removal';
