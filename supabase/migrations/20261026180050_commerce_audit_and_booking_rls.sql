-- W4 part 2/3: audit table + requester cancel/refund RLS (enum values already committed).

create table if not exists public.commerce_audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('booking', 'order')),
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  action text not null,
  actor_role text not null,
  actor_user_id uuid,
  request_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists commerce_audit_log_entity_idx
  on public.commerce_audit_log (entity_type, entity_id, created_at desc);

alter table public.commerce_audit_log enable row level security;

drop policy if exists commerce_audit_staff_read on public.commerce_audit_log;
create policy commerce_audit_staff_read on public.commerce_audit_log
  for select to authenticated
  using (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid()
        and ar.role in ('owner', 'admin', 'support', 'advisor')
    )
  );

grant select on public.commerce_audit_log to authenticated;
grant all on public.commerce_audit_log to service_role;

drop policy if exists service_bookings_requester_cancel on public.service_bookings;
create policy service_bookings_requester_cancel on public.service_bookings
  for update to authenticated
  using (requester_id = auth.uid())
  with check (
    requester_id = auth.uid()
    and status in ('cancelled', 'refund_requested')
  );
