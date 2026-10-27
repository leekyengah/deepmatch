-- DM-180: dual-consent meeting coordination (no auto couple creation)
create table if not exists public.matchmaking_meetings (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.matchmaking_invites (id) on delete set null,
  proposer_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid not null references public.profiles (id) on delete cascade,
  place_label text,
  scheduled_at timestamptz,
  status text not null default 'proposed'
    check (status in ('proposed', 'confirmed', 'completed', 'cancelled', 'withdrawn')),
  proposer_consent boolean not null default false,
  invitee_consent boolean not null default false,
  notes_private jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (proposer_id <> invitee_id)
);

create index if not exists matchmaking_meetings_parties_idx
  on public.matchmaking_meetings (proposer_id, invitee_id);

alter table public.matchmaking_meetings enable row level security;
drop policy if exists matchmaking_meetings_parties on public.matchmaking_meetings;
create policy matchmaking_meetings_parties on public.matchmaking_meetings
  for all using (proposer_id = auth.uid() or invitee_id = auth.uid())
  with check (proposer_id = auth.uid() or invitee_id = auth.uid());
grant select, insert, update on public.matchmaking_meetings to authenticated;
grant all on public.matchmaking_meetings to service_role;
