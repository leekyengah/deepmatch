alter table public.media_objects
  add column if not exists purpose text not null default 'profile',
  add column if not exists moderation_status text not null default 'pending';

create table if not exists public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sku text not null,
  package_code text,
  amount_vnd int not null,
  currency text not null default 'VND',
  status text not null default 'draft',
  sandbox boolean not null default true,
  price_snapshot jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.checkout_orders enable row level security;
drop policy if exists checkout_orders_own on public.checkout_orders;
create policy checkout_orders_own on public.checkout_orders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.checkout_orders to authenticated;
grant all on public.checkout_orders to service_role;

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sku text not null,
  package_code text,
  status text not null default 'active',
  quota_total int,
  quota_used int not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  source_order_id uuid references public.checkout_orders (id),
  sandbox boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;
drop policy if exists entitlements_own on public.entitlements;
create policy entitlements_own on public.entitlements
  for select using (user_id = auth.uid());
grant select on public.entitlements to authenticated;
grant all on public.entitlements to service_role;

create table if not exists public.matchmaking_invites (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.service_bookings (id),
  status text not null default 'proposed',
  note text,
  created_at timestamptz not null default now(),
  check (requester_id <> target_id)
);

alter table public.matchmaking_invites enable row level security;
drop policy if exists matchmaking_invites_parties on public.matchmaking_invites;
create policy matchmaking_invites_parties on public.matchmaking_invites
  for all using (requester_id = auth.uid() or target_id = auth.uid())
  with check (requester_id = auth.uid() or target_id = auth.uid());
grant select, insert, update on public.matchmaking_invites to authenticated;
grant all on public.matchmaking_invites to service_role;
