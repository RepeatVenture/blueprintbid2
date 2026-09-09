-- Minimal Supabase auth/storage contracts for testing app migrations on plain Postgres.
-- This does NOT simulate Auth email, JWT verification, Storage HTTP or signed URLs.
do $$begin create role authenticated nologin;exception when duplicate_object then null;end$$;
do $$begin create role anon nologin;exception when duplicate_object then null;end$$;
do $$begin create role service_role nologin bypassrls;exception when duplicate_object then null;end$$;
create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated,service_role;
grant execute on function auth.uid() to authenticated,service_role;
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;
grant usage on schema storage to authenticated;
grant select,insert,delete on storage.objects to authenticated;
