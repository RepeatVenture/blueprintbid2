\set ON_ERROR_STOP on
create temporary table fixture(data jsonb);
insert into fixture values(:'base_project');
grant select on fixture to authenticated;
insert into auth.users(id,email) values('10000000-0000-4000-8000-000000000001','a@example.invalid'),('10000000-0000-4000-8000-000000000002','b@example.invalid'),('10000000-0000-4000-8000-000000000003','viewer@example.invalid');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select public.create_organization('Tenant A') as org_a \gset
insert into public.projects(id,organization_id,data) values('20000000-0000-4000-8000-000000000001',:'org_a',(select data from fixture)||'{"name":"Tenant A secret","proposals":[{"version":1,"issuedAt":"2026-09-09","snapshot":"original"}]}'::jsonb);
select public.create_organization('Tenant A second') as org_a2 \gset
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
select public.create_organization('Tenant B') as org_b \gset
insert into public.projects(id,organization_id,data) values('20000000-0000-4000-8000-000000000002',:'org_b',(select data from fixture)||'{"id":"20000000-0000-4000-8000-000000000002","proposals":[]}'::jsonb);
do $$begin
 if (select count(*) from public.projects)<>1 then raise exception 'Cross-tenant project read leak';end if;
 if exists(select 1 from public.projects where id='20000000-0000-4000-8000-000000000001') then raise exception 'IDOR leak';end if;
 update public.projects set data='{}' where id='20000000-0000-4000-8000-000000000001';if found then raise exception 'Cross-tenant update succeeded';end if;
 if exists(select 1 from public.audit_events where project_id='20000000-0000-4000-8000-000000000001') then raise exception 'Audit leak';end if;
 begin update public.memberships set role='owner';raise exception 'Membership privilege escalation';exception when insufficient_privilege then null;end;
end$$;
reset role;
insert into public.memberships values(:'org_a','10000000-0000-4000-8000-000000000003','viewer');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
do $$begin
 if (select count(*) from public.projects)<>1 then raise exception 'Viewer cannot read own project';end if;
 update public.projects set data='{}' where id='20000000-0000-4000-8000-000000000001';if found then raise exception 'Viewer edit succeeded';end if;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$begin
 begin update public.projects set data=jsonb_set(data,'{proposals}','[]') where id='20000000-0000-4000-8000-000000000001';raise exception 'Immutable proposal deletion succeeded';exception when raise_exception then if sqlerrm<>'Issued versions cannot be removed' then raise;end if;end;
 update public.projects set data=jsonb_set(data,'{name}','"Changed"') where id='20000000-0000-4000-8000-000000000001';
 begin update public.projects set data=jsonb_set(data,'{revision}','0') where id='20000000-0000-4000-8000-000000000001';raise exception 'Stale update succeeded';exception when raise_exception then if sqlerrm<>'Stale revision; reload before saving' then raise;end if;end;
end$$;
-- Attempt a forged storage path for the other tenant; RLS must reject it.
select set_config('test.other_org',:'org_b',false);
do $$begin
 begin insert into storage.objects(bucket_id,name) values('bid-documents',current_setting('test.other_org')||'/20000000-0000-4000-8000-000000000002/f.pdf');raise exception 'Cross-tenant storage write';exception when insufficient_privilege then null;end;
end$$;
reset role;
select public.apply_billing_event('evt_test',10,:'org_a','cus_test','sub_test','pro','active');
select public.apply_billing_event('evt_test',10,:'org_a','cus_test','sub_test','starter','canceled');
select public.apply_billing_event('evt_older',9,:'org_a','cus_test','sub_test','starter','canceled');
do $$begin
 if (select status from public.subscriptions where customer_id='cus_test')<>'active' then raise exception 'Webhook duplicate or old event overwrote subscription';end if;
 if (select count(*) from public.billing_events where id='evt_test')<>1 then raise exception 'Webhook not idempotent';end if;
end$$;
select 'PASS: tenant reads/writes, viewer role, membership escalation, proposal immutability, revision checks, storage path, billing idempotency';

set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
select public.create_invitation(:'org_a','b@example.invalid','estimator') as invite_token \gset
select set_config('test.invite_token',:'invite_token',false);
do $$begin
 begin perform public.accept_invitation(current_setting('test.invite_token'));raise exception 'Wrong email accepted invitation';exception when raise_exception then if sqlerrm<>'Invalid, expired or already used invitation' then raise;end if;end;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
select public.accept_invitation(:'invite_token');
do $$begin
 begin perform public.accept_invitation(current_setting('test.invite_token'));raise exception 'Invitation replay succeeded';exception when raise_exception then if sqlerrm<>'Invalid, expired or already used invitation' then raise;end if;end;
 if (select count(*) from public.projects)<>2 then raise exception 'Invited member missing projects';end if;
end$$;
reset role;
select 'PASS: email-bound invitation and replay rejection';
-- Project quotas apply even to direct Data API-equivalent inserts.
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
insert into public.projects(id,organization_id,data) select id,:'org_b',(select data from fixture)||jsonb_build_object('id',id) from (select gen_random_uuid() id from generate_series(1,2)) ids;
select set_config('test.quota_org',:'org_b',false);
do $$begin
 begin insert into public.projects(id,organization_id,data) select id,current_setting('test.quota_org')::uuid,(select data from fixture)||jsonb_build_object('id',id) from (select gen_random_uuid() id) ids;raise exception 'Evaluation project quota bypassed';exception when raise_exception then if sqlerrm<>'Project limit reached' then raise;end if;end;
end$$;
-- Own-object visibility requires a document metadata row; unrelated tenant cannot read.
insert into public.documents(id,organization_id,project_id,name,path,version,category,status) values('30000000-0000-4000-8000-000000000002',:'org_b','20000000-0000-4000-8000-000000000002','synthetic.pdf',:'org_b'||'/20000000-0000-4000-8000-000000000002/30000000-0000-4000-8000-000000000002.pdf',1,'Drawings','Uploaded — not processed');
insert into storage.objects(bucket_id,name) values('bid-documents',:'org_b'||'/20000000-0000-4000-8000-000000000002/30000000-0000-4000-8000-000000000002.pdf');
do $$begin
 if (select count(*) from storage.objects)<>1 then raise exception 'Own source object missing';end if;
 if (select count(*) from public.claim_document('30000000-0000-4000-8000-000000000002'))<>1 then raise exception 'Cannot claim own document';end if;
 if (select count(*) from public.claim_document('30000000-0000-4000-8000-000000000002'))<>0 then raise exception 'Duplicate processing claim';end if;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$begin
 if exists(select 1 from storage.objects) then raise exception 'Cross-tenant source object leak';end if;
 if exists(select 1 from public.documents) then raise exception 'Cross-tenant document leak';end if;
 if (select count(*) from public.claim_document('30000000-0000-4000-8000-000000000002'))<>0 then raise exception 'Cross-tenant processing claim';end if;
end$$;
reset role;
select 'PASS: project quotas, private object reads and processing claims';
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
do $$begin
 for i in 1..25 loop perform public.reserve_visual_call('30000000-0000-4000-8000-000000000002');end loop;
 begin perform public.reserve_visual_call('30000000-0000-4000-8000-000000000002');raise exception 'Visual budget bypassed';exception when raise_exception then if sqlerrm<>'Daily visual analysis limit reached' then raise;end if;end;
end$$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',false);
do $$begin
 begin perform public.reserve_visual_call('30000000-0000-4000-8000-000000000002');raise exception 'Cross-tenant paid reservation';exception when raise_exception then if sqlerrm<>'Editor access required' then raise;end if;end;
end$$;
reset role;
select 'PASS: visual request cap and cross-tenant reservation rejection';
