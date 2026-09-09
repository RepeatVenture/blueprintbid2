alter table public.subscriptions add column last_event_created bigint not null default 0;
create function public.apply_billing_event(event_id text,event_created bigint,org_id uuid,stripe_customer text,stripe_subscription text,plan_name text,subscription_status text) returns void language plpgsql security definer set search_path='' as $$begin
 perform pg_advisory_xact_lock(hashtextextended(org_id::text,0));
 insert into public.billing_events(id) values(event_id) on conflict do nothing;
 if not found then return;end if;
 insert into public.subscriptions(organization_id,customer_id,subscription_id,plan,status,last_event_created) values(org_id,stripe_customer,stripe_subscription,plan_name,subscription_status,event_created)
 on conflict(organization_id) do update set customer_id=excluded.customer_id,subscription_id=excluded.subscription_id,plan=excluded.plan,status=excluded.status,last_event_created=excluded.last_event_created,updated_at=now() where public.subscriptions.last_event_created<=excluded.last_event_created;
 end$$;
revoke all on function public.apply_billing_event(text,bigint,uuid,text,text,text,text) from public,authenticated;
grant execute on function public.apply_billing_event(text,bigint,uuid,text,text,text,text) to service_role;
-- Evaluation organizations receive three projects. Paid limits are enforced in Postgres too.
create function public.enforce_project_limit() returns trigger language plpgsql security definer set search_path='' as $$declare sub public.subscriptions;max_projects integer;begin
 perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text,1));
 select * into sub from public.subscriptions where organization_id=new.organization_id;
 if found then
 if sub.status not in ('active','trialing') then raise exception 'Subscription does not allow new projects';end if;
 max_projects=case sub.plan when 'starter' then 10 when 'pro' then 50 when 'studio' then 200 else 0 end;
 else max_projects=3;end if;
 if (select count(*) from public.projects where organization_id=new.organization_id)>=max_projects then raise exception 'Project limit reached';end if;
 return new;end$$;
create trigger enforce_project_limit before insert on public.projects for each row execute function public.enforce_project_limit();
