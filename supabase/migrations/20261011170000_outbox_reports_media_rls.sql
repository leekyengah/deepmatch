-- Outbox + tighter RLS for reports/media (ARCH-03 / ADR-008 target)

create table if not exists public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'processed', 'dead_letter')),
  attempts int not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists outbox_events_pending_idx
  on public.outbox_events (status, available_at)
  where status in ('pending', 'processing');

alter table public.outbox_events enable row level security;

create policy outbox_deny_client on public.outbox_events
  for all using (false) with check (false);

-- Reports: reporter can insert/select own rows
create policy reports_insert_self on public.reports
  for insert with check (reporter_id = auth.uid());

create policy reports_select_own on public.reports
  for select using (reporter_id = auth.uid());

-- Media: owner read/write; pair members read when pair_id set and active
create policy media_owner_all on public.media_objects
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy media_pair_select on public.media_objects
  for select using (
    pair_id is not null and public.is_pair_member(pair_id)
  );

-- Pair members may update own active pair (disconnect)
create policy pairs_update_member on public.pairs
  for update using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());

-- Discovery: allow authenticated users to read opted-in public profiles (OR with self policy)
create policy profiles_discoverable_select on public.profiles
  for select using (
    discovery_opt_in = true
    and hidden_from_discovery = false
    and suspended = false
  );

create policy profile_deep_discoverable_select on public.profile_deep
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_deep.user_id
        and p.discovery_opt_in = true
        and p.hidden_from_discovery = false
        and p.suspended = false
    )
  );
