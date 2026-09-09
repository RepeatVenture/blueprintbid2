-- Deterministic numeric projection closes the direct Data API proposal issuance path.
create function public.customer_snapshot(p jsonb,version integer,issued_at text) returns jsonb language plpgsql immutable set search_path='' as $$
declare s jsonb;c jsonb;i jsonb;r jsonb;scope_rows jsonb='[]';offers jsonb='[]';line_cost numeric;line_taxable numeric;extension numeric;direct numeric=0;taxable numeric=0;overhead numeric;contingency numeric;tax numeric;cost numeric;sell numeric;offer_cost numeric;offer_sell numeric;included integer=0;begin
 for s in select * from jsonb_array_elements(p->'scope') loop
 if s->>'status'='Excluded' or s->>'responsibility'='Excluded' then continue;end if;
 if s->>'status'<>'Confirmed' or s->>'responsibility'='Unknown' then raise exception 'Resolve scope before issue';end if;
 line_cost=0;line_taxable=0;
 for c in select * from jsonb_array_elements(s->'components') loop
 extension=round((c->>'quantity')::numeric*(c->>'unitCost')::numeric*(1+(c->>'waste')::numeric/100),2);
 line_cost=line_cost+extension;if(c->>'taxable')::boolean then line_taxable=line_taxable+extension;end if;
 end loop;
 if line_cost<=0 or (s->>'quantity')::numeric<=0 then raise exception 'Price scope before issue';end if;
 direct=direct+round(line_cost*(s->>'quantity')::numeric,2);taxable=taxable+round(line_taxable*(s->>'quantity')::numeric,2);
 scope_rows=scope_rows||jsonb_build_array(jsonb_build_object('description',s->>'description','room',s->>'room','quantity',s->>'quantity','unit',s->>'unit'));included=included+1;
 end loop;
 if included=0 or length(trim(p->>'terms'))=0 then raise exception 'Scope and terms required before issue';end if;
 for r in select * from jsonb_array_elements(p->'riskRegister') loop
 if (r->>'status'='Open' and r->>'impact'='High') or (r->>'status'<>'Open' and length(trim(r->>'resolution'))=0) then raise exception 'Resolve risk before issue';end if;
 end loop;
 direct=direct+round((p->'logistics'->>'trips')::numeric*((p->'logistics'->>'miles')::numeric*(p->'logistics'->>'costPerMile')::numeric+(p->'logistics'->>'driverHours')::numeric*(p->'logistics'->>'driverRate')::numeric),2)+round((p->'logistics'->>'installHours')::numeric*(p->'logistics'->>'installRate')::numeric,2);
 for i in select * from jsonb_array_elements(p->'commercial') loop
 offer_cost=round((i->>'quantity')::numeric*(i->>'unitCost')::numeric,2);
 if i->>'kind'='Allowance' then direct=direct+offer_cost;end if;
 offer_cost=round(offer_cost*(1+(p->'pricing'->>'overhead')::numeric/100),2);
 offer_cost=round(offer_cost*(1+(p->'pricing'->>'contingency')::numeric/100),2);
 offer_sell=case when p->'pricing'->>'mode'='markup' then round(offer_cost*(1+(p->'pricing'->>'rate')::numeric/100),2) else round(offer_cost/(1-(p->'pricing'->>'rate')::numeric/100),2) end;
 offers=offers||jsonb_build_array(jsonb_build_object('kind',i->>'kind','description',i->>'description','quantity',i->>'quantity','unit',i->>'unit','price',offer_sell::text));
 end loop;
 overhead=round(direct*(p->'pricing'->>'overhead')::numeric/100,2);
 contingency=round((direct+overhead)*(p->'pricing'->>'contingency')::numeric/100,2);
 tax=round(taxable*(p->'pricing'->>'tax')::numeric/100,2);cost=direct+overhead+contingency+tax;
 sell=case when p->'pricing'->>'mode'='markup' then round(cost*(1+(p->'pricing'->>'rate')::numeric/100),2) else round(cost/(1-(p->'pricing'->>'rate')::numeric/100),2) end;
 return jsonb_build_object('version',version,'issuedAt',issued_at,'documentStatus','Issued','company',p->>'company','project',p->>'name','client',p->>'client','address',p->>'address','scope',scope_rows,'sellingPrice',sell::text,'commercial',offers,'qualifications',p->>'qualifications','exclusions',p->>'exclusions','terms',p->>'terms','taxStatement','Price includes the estimator-entered tax allowance. Tax treatment must be confirmed for this project.');
end$$;
create function public.issue_project_snapshot() returns trigger language plpgsql set search_path='' as $$declare prior integer=0;next_count integer;v jsonb;begin
 if TG_OP='UPDATE' then prior=jsonb_array_length(old.data->'proposals');end if;
 next_count=jsonb_array_length(new.data->'proposals');
 if next_count>prior+1 then raise exception 'Save each issued version before issuing another';end if;
 if next_count=prior+1 then
 v=new.data->'proposals'->prior;
 v=jsonb_build_object('version',prior+1,'issuedAt',v->>'issuedAt','snapshot',public.customer_snapshot(new.data,prior+1,v->>'issuedAt')::text);
 new.data=jsonb_set(new.data,array['proposals',prior::text],v);
 end if;return new;
end$$;
create trigger b_issue_snapshot before insert or update on public.projects for each row execute function public.issue_project_snapshot();
