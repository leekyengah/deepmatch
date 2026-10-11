-- DeepMatch ERD v1 + RLS baselines (DM-013, DM-014)
-- Staging/prod: separate Supabase projects. Never use service role in client.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type user_mode as enum ('solo', 'has_partner');
create type pin_layer as enum ('visited', 'wishlist', 'milestone');
create type invite_status as enum ('pending', 'accepted', 'revoked', 'expired');
create type pair_status as enum ('active', 'unpaired');
create type like_action as enum ('like', 'pass');
create type admin_role as enum ('owner', 'admin', 'moderator', 'advisor', 'support');
create type report_status as enum ('open', 'triaged', 'resolved', 'appealed');
create type booking_status as enum ('requested', 'assigned', 'completed', 'cancelled');

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_path text,
  birth_date date not null,
  fuzzy_region text,
  job_title text,
  mode user_mode not null default 'solo',
  discovery_opt_in boolean not null default false,
  hidden_from_discovery boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_deep (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  goals text[] not null default '{}',
  values text[] not null default '{}',
  interests text[] not null default '{}',
  communication_style text,
  expectations text,
  dealbreakers text[] not null default '{}',
  field_visibility jsonb not null default '{}'::jsonb
);

create table public.match_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  min_age int not null default 18,
  max_age int not null default 99,
  regions text[] not null default '{}',
  required_goals text[] not null default '{}'
);

-- ---------- blocks / reports ----------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  target_user_id uuid references public.profiles (id),
  conversation_id uuid,
  message_id uuid,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ---------- pairs / invites ----------
create table public.pair_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  created_by uuid not null references public.profiles (id),
  status invite_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.pairs (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id),
  user_b uuid not null references public.profiles (id),
  status pair_status not null default 'active',
  created_at timestamptz not null default now(),
  unpaired_at timestamptz,
  check (user_a <> user_b)
);

create unique index pairs_active_users_idx
  on public.pairs (least(user_a, user_b), greatest(user_a, user_b))
  where status = 'active';

-- ---------- memories / pins ----------
create table public.pins (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs (id) on delete cascade,
  layer pin_layer not null,
  title text not null,
  note text,
  lat double precision,
  lng double precision,
  place_label text,
  visited_on date,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.private_notes (
  id uuid primary key default gen_random_uuid(),
  pin_id uuid not null references public.pins (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  shared_with_partner boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.media_objects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id),
  pair_id uuid references public.pairs (id),
  conversation_id uuid,
  storage_path text not null,
  content_type text not null,
  bytes bigint not null,
  created_at timestamptz not null default now()
);

-- ---------- matching / likes / chat ----------
create table public.likes (
  actor_id uuid not null references public.profiles (id),
  target_id uuid not null references public.profiles (id),
  action like_action not null,
  created_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);

create table public.mutual_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id),
  user_b uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

-- NOTE: mutual_matches does NOT create a row in pairs (QA11).

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  mutual_match_id uuid not null unique references public.mutual_matches (id),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text,
  media_id uuid references public.media_objects (id),
  client_dedupe_key text,
  created_at timestamptz not null default now(),
  unique (conversation_id, client_dedupe_key)
);

-- ---------- concierge ----------
create table public.service_offerings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  active boolean not null default true
);

create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  offering_id uuid not null references public.service_offerings (id),
  requester_id uuid not null references public.profiles (id),
  pair_id uuid references public.pairs (id),
  advisor_id uuid references public.profiles (id),
  status booking_status not null default 'requested',
  created_at timestamptz not null default now()
);

-- ---------- admin / flags / consent / audit ----------
create table public.admin_roles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  role admin_role not null
);

create table public.feature_flags (
  name text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (name, enabled) values
  ('ff_matching', true),
  ('ff_chat', true),
  ('ff_media_upload', true),
  ('ff_concierge', false),
  ('ff_discovery', true);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  consent_key text not null,
  version text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.matching_rule_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  config jsonb not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.profile_deep enable row level security;
alter table public.match_preferences enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.pair_invites enable row level security;
alter table public.pairs enable row level security;
alter table public.pins enable row level security;
alter table public.private_notes enable row level security;
alter table public.media_objects enable row level security;
alter table public.likes enable row level security;
alter table public.mutual_matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.service_bookings enable row level security;
alter table public.consent_events enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_pair_member(p uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.pairs
    where id = p and status = 'active'
      and (user_a = auth.uid() or user_b = auth.uid())
  );
$$;

create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy profile_deep_self on public.profile_deep
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy match_prefs_self on public.match_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy blocks_self on public.blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy pairs_member on public.pairs
  for select using (user_a = auth.uid() or user_b = auth.uid());

create policy pins_pair_member on public.pins
  for all using (public.is_pair_member(pair_id))
  with check (public.is_pair_member(pair_id) and created_by = auth.uid());

create policy private_notes_author on public.private_notes
  for select using (
    author_id = auth.uid()
    or (shared_with_partner = true and exists (
      select 1 from public.pins pin
      join public.pairs p on p.id = pin.pair_id
      where pin.id = private_notes.pin_id
        and p.status = 'active'
        and (p.user_a = auth.uid() or p.user_b = auth.uid())
    ))
  );

create policy private_notes_write_author on public.private_notes
  for all using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy likes_actor on public.likes
  for all using (actor_id = auth.uid()) with check (actor_id = auth.uid());

create policy mutual_participant on public.mutual_matches
  for select using (user_a = auth.uid() or user_b = auth.uid());

create policy conversations_participant on public.conversations
  for select using (
    exists (
      select 1 from public.mutual_matches m
      where m.id = mutual_match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy messages_participant on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      join public.mutual_matches m on m.id = c.mutual_match_id
      where c.id = conversation_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  ) with check (sender_id = auth.uid());

create policy consent_self on public.consent_events
  for select using (user_id = auth.uid());

-- Audit logs: no broad user read; service role / admin RPC only
create policy audit_deny_all on public.audit_logs
  for select using (false);
