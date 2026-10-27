-- DM-226: sandbox webhook dedupe + exactly-once entitlement per order
create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  order_id uuid references public.checkout_orders (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'processed'
    check (status in ('processed', 'ignored', 'rejected')),
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- Keep one entitlement per source order (dedupe prior sandbox double-grants)
delete from public.entitlements e
using public.entitlements newer
where e.source_order_id is not null
  and e.source_order_id = newer.source_order_id
  and e.created_at < newer.created_at;

create unique index if not exists entitlements_source_order_uidx
  on public.entitlements (source_order_id)
  where source_order_id is not null;

alter table public.payment_webhook_events enable row level security;
-- No authenticated access — service_role only
grant all on public.payment_webhook_events to service_role;
