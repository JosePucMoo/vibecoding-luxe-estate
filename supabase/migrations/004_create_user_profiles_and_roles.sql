-- User profiles with roles, synced from auth.users.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  provider text,
  role text not null default 'viewer' check (role in ('admin', 'broker', 'agent', 'viewer')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);
create index if not exists user_profiles_status_idx on public.user_profiles (status);
create index if not exists user_profiles_email_lower_idx on public.user_profiles (lower(email));

-- Admin check used by RLS (SECURITY DEFINER avoids recursive policies).
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles
    where id = (select auth.uid()) and role = 'admin' and status = 'active'
  );
$$;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Sync auth.users -> user_profiles (never touches role/status on update).
create or replace function private.handle_auth_user_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url, provider, last_sign_in_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    new.raw_app_meta_data ->> 'provider',
    new.last_sign_in_at
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    provider = excluded.provider,
    last_sign_in_at = excluded.last_sign_in_at;
  return new;
end;
$$;
revoke execute on function private.handle_auth_user_sync() from public, anon, authenticated;

drop trigger if exists on_auth_user_sync on auth.users;
create trigger on_auth_user_sync
  after insert or update on auth.users
  for each row execute function private.handle_auth_user_sync();

-- Prevent an admin from demoting/suspending themselves; maintain updated_at.
create or replace function private.guard_profile_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (select auth.uid()) = old.id
     and old.role = 'admin'
     and (new.role <> 'admin' or new.status <> 'active') then
    raise exception 'Admins cannot demote or suspend themselves';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function private.guard_profile_update() from public, anon;
grant execute on function private.guard_profile_update() to authenticated;

drop trigger if exists guard_profile_update on public.user_profiles;
create trigger guard_profile_update
  before update on public.user_profiles
  for each row execute function private.guard_profile_update();

-- Privileges + RLS
alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from public, anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (role, status, updated_at) on public.user_profiles to authenticated;

drop policy if exists "Read own profile or admin reads all" on public.user_profiles;
create policy "Read own profile or admin reads all" on public.user_profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "Admins update profiles" on public.user_profiles;
create policy "Admins update profiles" on public.user_profiles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Backfill existing users; initial admins.
insert into public.user_profiles (id, email, full_name, avatar_url, provider, last_sign_in_at, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', u.raw_user_meta_data ->> 'user_name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'),
  u.raw_app_meta_data ->> 'provider',
  u.last_sign_in_at,
  case when lower(u.email) in ('josepucmoo25@gmail.com', 'pucjl07@gmail.com') then 'admin' else 'viewer' end
from auth.users u
on conflict (id) do nothing;
