alter table public.documents add column mime_type text not null default 'application/pdf' check(mime_type in ('application/pdf','image/png','image/jpeg'));
alter table public.documents add column extension text not null default 'pdf' check(extension in ('pdf','png','jpg'));
alter table public.documents drop constraint documents_check;
alter table public.documents add constraint document_path_matches_type check(path=organization_id::text||'/'||project_id::text||'/'||id::text||'.'||extension and ((mime_type='application/pdf' and extension='pdf') or (mime_type='image/png' and extension='png') or (mime_type='image/jpeg' and extension='jpg')));
update storage.buckets set allowed_mime_types=array['application/pdf','image/png','image/jpeg'] where id='bid-documents';
alter table public.processing_runs add column details jsonb;
-- The budget is reserved atomically BEFORE contacting the paid provider. Failed calls consume a slot.
create function public.reserve_visual_call(doc_id uuid) returns uuid language plpgsql security definer set search_path='' as $$declare d public.documents;run_id uuid;begin
 select * into d from public.documents where id=doc_id;
 if not found or not public.can_edit(d.organization_id) then raise exception 'Editor access required';end if;
 perform pg_advisory_xact_lock(hashtextextended(d.organization_id::text,4));
 if(select count(*) from public.processing_runs where organization_id=d.organization_id and provider='openai-vision' and created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=25 then raise exception 'Daily visual analysis limit reached';end if;
 insert into public.processing_runs(organization_id,project_id,document_id,provider,template_version,status,pages,estimated_cost) values(d.organization_id,d.project_id,d.id,'openai-vision','millwork-visual-v1','Reserved',1,null) returning id into run_id;
 return run_id;
end$$;
revoke all on function public.reserve_visual_call(uuid) from public;
grant execute on function public.reserve_visual_call(uuid) to authenticated;
grant update(status,latency_ms,details) on public.processing_runs to authenticated;
create policy run_finish on public.processing_runs for update to authenticated using(public.can_edit(organization_id)) with check(public.can_edit(organization_id));
