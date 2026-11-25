-- Soft-deactivation support for public.properties:
-- 1. Add is_active and deactivated_at columns + automatic timestamp trigger.
-- 2. Block physical DELETE operations under RLS while preserving all rows.
-- 3. Restrict public/non-admin SELECT RLS policies to active published properties,
--    while keeping deactivated properties visible & updatable by admins.

-- 1. Columns and indexes
alter table public.properties
  add column if not exists is_active boolean not null default true,
  add column if not exists deactivated_at timestamptz;

create index if not exists properties_is_active_idx
  on public.properties (is_active);

create index if not exists properties_active_published_sort_idx
  on public.properties (sort_order)
  where is_active = true and status = 'published';

-- Maintain deactivated_at automatically whenever is_active changes
create or replace function private.sync_property_deactivated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_active = false and new.deactivated_at is null then
      new.deactivated_at = now();
    elsif new.is_active = true then
      new.deactivated_at = null;
    end if;
    return new;
  end if;

  if new.is_active = false and (old.is_active = true or old.deactivated_at is null) then
    new.deactivated_at = now();
  elsif new.is_active = true then
    new.deactivated_at = null;
  end if;
  return new;
end;
$$;

grant execute on function private.sync_property_deactivated_at() to authenticated;

create or replace trigger sync_property_deactivated_at
  before insert or update on public.properties
  for each row execute function private.sync_property_deactivated_at();

-- 2. Block physical deletion via RLS and restrict non-admin SELECT to active published rows
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Admins delete properties'
  ) then
    alter policy "Admins delete properties" on public.properties
      to authenticated
      using (false);
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Public read properties'
  ) then
    alter policy "Public read properties" on public.properties
      to anon
      using (is_active = true and status = 'published');
  else
    create policy "Public read properties" on public.properties
      for select to anon
      using (is_active = true and status = 'published');
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Authenticated read published or admin reads all'
  ) then
    alter policy "Authenticated read published or admin reads all" on public.properties
      to authenticated
      using ((is_active = true and status = 'published') or (select private.is_admin()));
  else
    create policy "Authenticated read published or admin reads all" on public.properties
      for select to authenticated
      using ((is_active = true and status = 'published') or (select private.is_admin()));
  end if;
end $$;
