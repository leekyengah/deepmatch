-- Billing / payments (ADR-09) — Stripe-ready; no charge without provider keys

create type public.payment_status as enum (
  'pending',
  'requires_action',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_code text not null,
  status text not null default 'inactive'
    check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  subscription_id uuid references public.subscriptions (id),
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'vnd',
  status public.payment_status not null default 'pending',
  provider text not null default 'stripe',
  provider_payment_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_ref)
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (
    user_id = auth.uid()
    or public.has_admin_role(
      array['owner', 'admin', 'support']::public.admin_role[]
    )
  );

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select using (
    user_id = auth.uid()
    or public.has_admin_role(
      array['owner', 'admin', 'support']::public.admin_role[]
    )
  );

-- Writes only via service role / webhooks (no client insert)
drop policy if exists subscriptions_deny_client_write on public.subscriptions;
create policy subscriptions_deny_client_write on public.subscriptions
  for all using (false) with check (false);

drop policy if exists payments_deny_client_write on public.payments;
create policy payments_deny_client_write on public.payments
  for all using (false) with check (false);

insert into public.feature_flags (name, enabled)
values ('ff_billing', false)
on conflict (name) do nothing;
