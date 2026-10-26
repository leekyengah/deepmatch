-- DM-163: admin venue flags + review moderation (editorial fixture place_ids)
create table if not exists public.venue_admin_flags (
  place_id text primary key,
  closed boolean not null default false,
  notes text,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create table if not exists public.venue_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,
  review_id text not null,
  status text not null default 'open'
    check (status in ('open', 'removed', 'dismissed')),
  reason text,
  reporter_id uuid references public.profiles (id),
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (place_id, review_id, status)
);

alter table public.venue_admin_flags enable row level security;
alter table public.venue_moderation_queue enable row level security;

-- Authenticated can report (insert open); staff manage via service or staff policies
drop policy if exists venue_flags_staff on public.venue_admin_flags;
create policy venue_flags_staff on public.venue_admin_flags
  for all using (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  );

drop policy if exists venue_mod_report on public.venue_moderation_queue;
create policy venue_mod_report on public.venue_moderation_queue
  for insert with check (auth.uid() is not null and status = 'open');

drop policy if exists venue_mod_staff on public.venue_moderation_queue;
create policy venue_mod_staff on public.venue_moderation_queue
  for all using (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  );

-- Public read of removed set for filtering (no private album fields)
drop policy if exists venue_mod_public_removed on public.venue_moderation_queue;
create policy venue_mod_public_removed on public.venue_moderation_queue
  for select using (status = 'removed' or
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  );

drop policy if exists venue_flags_public_read on public.venue_admin_flags;
create policy venue_flags_public_read on public.venue_admin_flags
  for select using (true);

grant select on public.venue_admin_flags to anon, authenticated;
grant select, insert, update on public.venue_admin_flags to authenticated;
grant select, insert, update on public.venue_moderation_queue to authenticated;
grant all on public.venue_admin_flags to service_role;
grant all on public.venue_moderation_queue to service_role;
