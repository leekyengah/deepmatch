-- Synthetic bootstrap cohort "Mebertes" (purge-gated; not real PII)
-- Real users keep cohort IS NULL.

alter table public.profiles
  add column if not exists cohort text;

comment on column public.profiles.cohort is
  'Synthetic seed marker (e.g. Mebertes). NULL = organic/real user. CEO-gated purge only.';

create index if not exists profiles_cohort_idx
  on public.profiles (cohort)
  where cohort is not null;

create table if not exists public.seed_cohort_registry (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  cohort text not null check (cohort = 'Mebertes'),
  email text not null unique,
  region text not null,
  taxonomy_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists seed_cohort_registry_cohort_idx
  on public.seed_cohort_registry (cohort);

alter table public.seed_cohort_registry enable row level security;

drop policy if exists seed_cohort_registry_staff_select on public.seed_cohort_registry;
create policy seed_cohort_registry_staff_select on public.seed_cohort_registry
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid()
        and ar.role in ('owner', 'admin', 'support')
    )
  );

grant select on public.seed_cohort_registry to authenticated;
grant all on public.seed_cohort_registry to service_role;
