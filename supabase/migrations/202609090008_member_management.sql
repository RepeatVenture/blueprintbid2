create function public.member_directory(org uuid) returns table(user_id uuid,email text,role text) language plpgsql security definer set search_path='' as $$begin
 if coalesce(public.member_role(org),'') not in ('owner','administrator') then raise exception 'Owner/admin required';end if;
 return query select m.user_id,u.email::text,m.role from public.memberships m join auth.users u on u.id=m.user_id where m.organization_id=org;
end$$;
create function public.revoke_member(org uuid,target_user uuid) returns void language plpgsql security definer set search_path='' as $$declare actor_role text;target_role text;target_email text;begin
 perform pg_advisory_xact_lock(hashtextextended(org::text,3));
 actor_role=public.member_role(org);
 if coalesce(actor_role,'') not in ('owner','administrator') then raise exception 'Owner/admin required';end if;
 if target_user=auth.uid() then raise exception 'Cannot revoke your own access';end if;
 select role into target_role from public.memberships where organization_id=org and user_id=target_user for update;
 if target_role is null or target_role='owner' or (target_role='administrator' and actor_role<>'owner') then raise exception 'Member cannot be revoked by this role';end if;
 select lower(email) into target_email from auth.users where id=target_user;
 delete from public.memberships where organization_id=org and user_id=target_user;
 update public.invitations set expires_at=now() where organization_id=org and email=target_email and accepted_at is null;
 insert into public.audit_events(organization_id,actor,action,before_value) values(org,auth.uid(),'MEMBER_REVOKED',jsonb_build_object('user_id',target_user,'role',target_role));
end$$;
revoke all on function public.member_directory(uuid),public.revoke_member(uuid,uuid) from public;
grant execute on function public.member_directory(uuid),public.revoke_member(uuid,uuid) to authenticated;
-- Coordinate acceptance with revocation so an old invitation cannot restore access mid-revocation.
create or replace function public.accept_invitation(invite_token text) returns uuid language plpgsql security definer set search_path='' as $$declare invitation public.invitations;user_email text;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 select lower(email) into user_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 select * into invitation from public.invitations where token_hash=encode(sha256(convert_to(invite_token,'UTF8')),'hex') and email=user_email and accepted_at is null and expires_at>now();
 if not found then raise exception 'Invalid, expired or already used invitation';end if;
 perform pg_advisory_xact_lock(hashtextextended(invitation.organization_id::text,3));
 select * into invitation from public.invitations where token_hash=encode(sha256(convert_to(invite_token,'UTF8')),'hex') and email=user_email and accepted_at is null and expires_at>now() for update;
 if not found then raise exception 'Invalid, expired or already used invitation';end if;
 insert into public.memberships(organization_id,user_id,role) values(invitation.organization_id,auth.uid(),invitation.role) on conflict do nothing;
 update public.invitations set accepted_at=now() where id=invitation.id;
 insert into public.audit_events(organization_id,actor,action) values(invitation.organization_id,auth.uid(),'INVITATION_ACCEPTED');return invitation.organization_id;end$$;
