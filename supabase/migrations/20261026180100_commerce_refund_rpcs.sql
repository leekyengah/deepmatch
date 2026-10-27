-- W4 part 2: staff transition RPCs (uses enum values from 20261026180000)

create or replace function public.staff_transition_booking(
  p_booking_id uuid,
  p_action text,
  p_request_id text default null
)
returns public.service_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.service_bookings;
  prev text;
  next_status text;
begin
  if not public.has_admin_role(
    array['owner', 'admin', 'advisor', 'support']::public.admin_role[]
  ) then
    raise exception 'forbidden';
  end if;

  select * into b from public.service_bookings where id = p_booking_id for update;
  if not found then
    raise exception 'booking_not_found';
  end if;

  prev := b.status::text;

  if p_action = 'complete' and b.status = 'assigned' then
    next_status := 'completed';
  elsif p_action = 'cancel' and b.status in ('requested', 'assigned') then
    next_status := 'cancelled';
  elsif p_action = 'approve_sandbox_refund' and b.status = 'refund_requested' then
    next_status := 'refunded_sandbox';
  elsif p_action = 'deny_refund' and b.status = 'refund_requested' then
    next_status := 'cancelled';
  else
    raise exception 'illegal_transition';
  end if;

  update public.service_bookings
  set status = next_status::booking_status
  where id = p_booking_id
  returning * into b;

  insert into public.commerce_audit_log (
    entity_type, entity_id, from_status, to_status, action,
    actor_role, actor_user_id, request_id, meta
  ) values (
    'booking', p_booking_id, prev, next_status, p_action,
    'staff', auth.uid(), p_request_id,
    jsonb_build_object('sandbox', true, 'live_psp', false)
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'booking.' || p_action,
    'service_bookings',
    p_booking_id::text,
    jsonb_build_object('to', next_status, 'sandbox', true)
  );

  return b;
end;
$$;

revoke all on function public.staff_transition_booking(uuid, text, text) from public;
grant execute on function public.staff_transition_booking(uuid, text, text) to authenticated, service_role;

create or replace function public.staff_transition_order(
  p_order_id uuid,
  p_action text,
  p_request_id text default null
)
returns public.checkout_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.checkout_orders;
  next_status text;
  prev text;
begin
  if not public.has_admin_role(
    array['owner', 'admin', 'support']::public.admin_role[]
  ) then
    raise exception 'forbidden';
  end if;

  select * into o from public.checkout_orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;

  prev := o.status;

  if p_action = 'approve_sandbox_refund' and o.status = 'refund_requested' then
    next_status := 'refunded_sandbox';
  elsif p_action = 'deny_refund' and o.status = 'refund_requested' then
    next_status := 'paid';
  elsif p_action = 'cancel' and o.status in (
    'draft', 'pending_payment', 'method_selected', 'processing', 'failed'
  ) then
    next_status := 'cancelled';
  else
    raise exception 'illegal_transition';
  end if;

  update public.checkout_orders
  set status = next_status, updated_at = now()
  where id = p_order_id
  returning * into o;

  insert into public.commerce_audit_log (
    entity_type, entity_id, from_status, to_status, action,
    actor_role, actor_user_id, request_id, meta
  ) values (
    'order', p_order_id, prev, next_status, p_action,
    'staff', auth.uid(), p_request_id,
    jsonb_build_object('sandbox', true, 'live_psp', false, 'amount_vnd', o.amount_vnd)
  );

  return o;
end;
$$;

revoke all on function public.staff_transition_order(uuid, text, text) from public;
grant execute on function public.staff_transition_order(uuid, text, text) to authenticated, service_role;
