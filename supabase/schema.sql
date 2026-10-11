-- Anvira Reports – database setup
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ─────────────────────────────────────────────────────────────
-- 1. Reports table: one row per saved form.
--    Searchable fields get their own columns; every form field lives in `data`.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  form_type   text not null check (form_type in ('pm', 'breakdown', 'commissioning')),
  form_no     text unique,
  report_no   text,
  job_no      text,
  client      text,
  report_date date,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_form_type_idx  on public.reports (form_type);
create index if not exists reports_client_idx     on public.reports (lower(client));
create index if not exists reports_report_date_idx on public.reports (report_date desc);

-- ─────────────────────────────────────────────────────────────
-- 2. Automatic form numbers, one running sequence per form:
--    ASPL/PM/0001, ASPL/BDS/0001, ASPL/CR/0001
-- ─────────────────────────────────────────────────────────────
create sequence if not exists public.form_no_pm_seq;
create sequence if not exists public.form_no_breakdown_seq;
create sequence if not exists public.form_no_commissioning_seq;

create or replace function public.set_form_no()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.form_no is null then
    new.form_no := case new.form_type
      when 'pm'            then 'ASPL/PM/'  || lpad(nextval('form_no_pm_seq')::text, 4, '0')
      when 'breakdown'     then 'ASPL/BDS/' || lpad(nextval('form_no_breakdown_seq')::text, 4, '0')
      when 'commissioning' then 'ASPL/CR/'  || lpad(nextval('form_no_commissioning_seq')::text, 4, '0')
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists reports_set_form_no on public.reports;
create trigger reports_set_form_no
  before insert on public.reports
  for each row execute function public.set_form_no();

-- To start numbering from a different number (e.g. continue from paper forms):
--   select setval('form_no_pm_seq', 250);   -- next PM form becomes ASPL/PM/0251

-- Keep updated_at current on every edit
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists reports_touch_updated_at on public.reports;
create trigger reports_touch_updated_at
  before update on public.reports
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. Access rules. There is no login in this app, so the public (anon) key
--    may list, create and edit reports. Deleting is NOT allowed from the app;
--    remove rows from the Supabase dashboard if ever needed.
-- ─────────────────────────────────────────────────────────────
alter table public.reports enable row level security;

-- Table access for the app's public key (needed on projects that do not
-- expose new tables automatically). Row Level Security below still applies.
grant usage on schema public to anon;
grant select, insert, update on public.reports to anon;

drop policy if exists "anon can read reports"   on public.reports;
drop policy if exists "anon can create reports" on public.reports;
drop policy if exists "anon can edit reports"   on public.reports;

create policy "anon can read reports"   on public.reports for select to anon using (true);
create policy "anon can create reports" on public.reports for insert to anon with check (true);
create policy "anon can edit reports"   on public.reports for update to anon using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- 4. Signature images: private storage bucket "signatures".
--    Files are saved as signatures/<report id>/<field>.png and opened
--    through short-lived signed links (never public URLs).
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('signatures', 'signatures', false, 1048576, array['image/png', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "anon can read signatures"   on storage.objects;
drop policy if exists "anon can upload signatures" on storage.objects;
drop policy if exists "anon can replace signatures" on storage.objects;

create policy "anon can read signatures"
  on storage.objects for select to anon
  using (bucket_id = 'signatures');

create policy "anon can upload signatures"
  on storage.objects for insert to anon
  with check (bucket_id = 'signatures');

create policy "anon can replace signatures"
  on storage.objects for update to anon
  using (bucket_id = 'signatures')
  with check (bucket_id = 'signatures');
