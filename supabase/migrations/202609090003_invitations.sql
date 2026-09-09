revoke update on public.catalogs from authenticated;
drop policy catalog_update on public.catalogs;
create table public.invitations(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations,email text not null,role text not null check(role in ('administrator','estimator','project_manager','draftsperson','viewer')),token_hash text unique not null,expires_at timestamptz not null default now()+interval '7 days',accepted_at timestamptz,created_by uuid not null references auth.users);
alter table public.invitations enable row level security;
create policy invitation_read on public.invitations for select to authenticated using(public.member_role(organization_id) in ('owner','administrator'));
-- Token hashes are not exposed through a general SELECT grant.
create function public.create_invitation(org uuid,invite_email text,invite_role text) returns text language plpgsql security definer set search_path='' as $$declare token text;begin
 if coalesce(public.member_role(org),'') not in ('owner','administrator') then raise exception 'Owner/admin required';end if;
 if invite_role not in ('estimator','project_manager','draftsperson','viewer') and not (invite_role='administrator' and public.member_role(org)='owner') then raise exception 'Role not permitted';end if;
 if length(invite_email)>254 or position('@' in invite_email)<2 then raise exception 'Invalid email';end if;
 token=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into public.invitations(organization_id,email,role,token_hash,created_by) values(org,lower(trim(invite_email)),invite_role,encode(sha256(convert_to(token,'UTF8')),'hex'),auth.uid());
 insert into public.audit_events(organization_id,actor,action,after_value) values(org,auth.uid(),'INVITATION_CREATED',jsonb_build_object('email',lower(trim(invite_email)),'role',invite_role));
 return token;end$$;
create function public.accept_invitation(invite_token text) returns uuid language plpgsql security definer set search_path='' as $$declare invitation public.invitations;user_email text;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 select lower(email) into user_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 select * into invitation from public.invitations where token_hash=encode(sha256(convert_to(invite_token,'UTF8')),'hex') and email=user_email and accepted_at is null and expires_at>now() for update;
 if not found then raise exception 'Invalid, expired or already used invitation';end if;
 insert into public.memberships(organization_id,user_id,role) values(invitation.organization_id,auth.uid(),invitation.role) on conflict do nothing;
 update public.invitations set accepted_at=now() where id=invitation.id;
 insert into public.audit_events(organization_id,actor,action) values(invitation.organization_id,auth.uid(),'INVITATION_ACCEPTED');return invitation.organization_id;end$$;
revoke all on function public.create_invitation(uuid,text,text),public.accept_invitation(text) from public;
grant execute on function public.create_invitation(uuid,text,text),public.accept_invitation(text) to authenticated;
