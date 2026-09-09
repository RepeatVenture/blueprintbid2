alter table public.documents add column processing_started_at timestamptz;
create function public.claim_document(doc_id uuid) returns setof public.documents language sql set search_path='' as $$
 update public.documents set status='Processing',processing_error=null,processing_started_at=now() where id=doc_id and (status<>'Processing' or processing_started_at<now()-interval '2 minutes' or processing_started_at is null) returning *;
$$;
revoke all on function public.claim_document(uuid) from public;
grant execute on function public.claim_document(uuid) to authenticated;
