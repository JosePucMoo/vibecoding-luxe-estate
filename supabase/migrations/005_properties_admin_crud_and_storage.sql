-- Add year_built & status to public.properties, admin CRUD RLS policies,
-- and the public property-images Supabase Storage bucket with admin write RLS.

-- 1. Schema additions on public.properties
alter table public.properties
  add column if not exists year_built integer,
  add column if not exists status text not null default 'published';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'properties_year_built_check'
  ) then
    alter table public.properties
      add constraint properties_year_built_check
      check (year_built is null or (year_built >= 1800 and year_built <= 2100));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'properties_status_check'
  ) then
    alter table public.properties
      add constraint properties_status_check
      check (status in ('published', 'draft', 'sold'));
  end if;
end $$;

create index if not exists properties_status_idx on public.properties (status);

-- 2. RLS policies on public.properties
alter table public.properties enable row level security;
grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Public read properties'
  ) then
    alter policy "Public read properties" on public.properties
      to anon
      using (status = 'published');
  else
    create policy "Public read properties" on public.properties
      for select to anon
      using (status = 'published');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Authenticated read published or admin reads all'
  ) then
    create policy "Authenticated read published or admin reads all" on public.properties
      for select to authenticated
      using (status = 'published' or (select private.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Admins insert properties'
  ) then
    create policy "Admins insert properties" on public.properties
      for insert to authenticated
      with check ((select private.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Admins update properties'
  ) then
    create policy "Admins update properties" on public.properties
      for update to authenticated
      using ((select private.is_admin()))
      with check ((select private.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and policyname = 'Admins delete properties'
  ) then
    create policy "Admins delete properties" on public.properties
      for delete to authenticated
      using ((select private.is_admin()));
  end if;
end $$;

-- 3. Public Storage bucket for property images (5MB max, JPG/PNG/WEBP)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read property images'
  ) then
    create policy "Public read property images" on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'property-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins upload property images'
  ) then
    create policy "Admins upload property images" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'property-images' and (select private.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins update property images'
  ) then
    create policy "Admins update property images" on storage.objects
      for update to authenticated
      using (bucket_id = 'property-images' and (select private.is_admin()))
      with check (bucket_id = 'property-images' and (select private.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins delete property images'
  ) then
    create policy "Admins delete property images" on storage.objects
      for delete to authenticated
      using (bucket_id = 'property-images' and (select private.is_admin()));
  end if;
end $$;
