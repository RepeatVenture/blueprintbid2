-- The completed run records the actual analyzer prompt version, rather than
-- retaining the reservation function's original version label. Existing RLS
-- still requires editor access to the run's organization.
grant update(template_version) on public.processing_runs to authenticated;
-- Keep the lease longer than the 180-second visual route allowance.
create or replace function public.claim_document(doc_id uuid) returns setof public.documents language sql set search_path='' as $$
 update public.documents set status='Processing',processing_error=null,processing_started_at=now() where id=doc_id and (status<>'Processing' or processing_started_at<now()-interval '5 minutes' or processing_started_at is null) returning *;
$$;
