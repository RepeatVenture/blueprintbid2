-- One stable idempotency key per organization checkout attempt, across plans and retries.
create table public.checkout_attempts(organization_id uuid primary key references public.organizations,attempt_id uuid not null default gen_random_uuid(),plan text not null check(plan in ('starter','pro','studio')),created_at timestamptz not null default now());
alter table public.checkout_attempts enable row level security;
-- No client table grants/policies. Reservations can only be requested through the guarded RPC.
create function public.reserve_checkout(org uuid,requested_plan text) returns jsonb language plpgsql security definer set search_path='' as $$declare attempt public.checkout_attempts;sub public.subscriptions;begin
 if coalesce(public.member_role(org),'') not in ('owner','administrator') then raise exception 'Owner/admin required';end if;
 if requested_plan not in ('starter','pro','studio') then raise exception 'Unknown plan';end if;
 perform pg_advisory_xact_lock(hashtextextended(org::text,2));
 select * into sub from public.subscriptions where organization_id=org;
 if sub.subscription_id is not null then raise exception 'Manage existing subscription in billing portal';end if;
 select * into attempt from public.checkout_attempts where organization_id=org for update;
 -- A Stripe session is explicitly limited to 60 minutes. Retain the reservation longer
 -- to allow webhook delivery after completion; do not create an overlapping checkout.
 if not found or attempt.created_at<now()-interval '65 minutes' then
 insert into public.checkout_attempts(organization_id,plan) values(org,requested_plan) on conflict(organization_id) do update set attempt_id=gen_random_uuid(),plan=excluded.plan,created_at=now() returning * into attempt;
 elsif attempt.plan<>requested_plan then raise exception 'Checkout already started for another plan; finish it or wait for expiration';end if;
 return jsonb_build_object('attemptId',attempt.attempt_id,'plan',attempt.plan,'createdAt',attempt.created_at);
end$$;
revoke all on function public.reserve_checkout(uuid,text) from public;
grant execute on function public.reserve_checkout(uuid,text) to authenticated;
