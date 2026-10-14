-- Staff RPCs: suspend user + assign concierge booking (audited)

create or replace function public.staff_set_user_suspended(
  p_user_id uuid,
  p_suspended boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_role(
    array['owner', 'admin', 'moderator']::public.admin_role[]
  ) then
    raise exception 'forbidden';
  end if;

  update public.profiles
  set suspended = p_suspended, updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'user_not_found';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, reason, metadata)
  values (
    auth.uid(),
    case when p_suspended then 'user.suspend' else 'user.unsuspend' end,
    'profiles',
    p_user_id::text,
    nullif(trim(coalesce(p_reason, '')), ''),
    jsonb_build_object('suspended', p_suspended)
  );
end;
$$;

revoke all on function public.staff_set_user_suspended(uuid, boolean, text) from public;
grant execute on function public.staff_set_user_suspended(uuid, boolean, text) to authenticated, service_role;

create or replace function public.staff_assign_booking(
  p_booking_id uuid,
  p_advisor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_admin_role(
    array['owner', 'admin', 'advisor', 'support']::public.admin_role[]
  ) then
    raise exception 'forbidden';
  end if;

  if not exists (
    select 1 from public.admin_roles
    where user_id = p_advisor_id
      and role in ('owner', 'admin', 'advisor', 'support')
  ) then
    raise exception 'advisor_not_staff';
  end if;

  update public.service_bookings
  set advisor_id = p_advisor_id, status = 'assigned'
  where id = p_booking_id
    and status in ('requested', 'assigned');

  if not found then
    raise exception 'booking_not_assignable';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'booking.assign',
    'service_bookings',
    p_booking_id::text,
    jsonb_build_object('advisor_id', p_advisor_id)
  );
end;
$$;

revoke all on function public.staff_assign_booking(uuid, uuid) from public;
grant execute on function public.staff_assign_booking(uuid, uuid) to authenticated, service_role;

-- Staff may list peer staff for assign dropdown
drop policy if exists admin_roles_staff_select on public.admin_roles;
create policy admin_roles_staff_select on public.admin_roles
  for select using (
    public.has_admin_role(
      array['owner', 'admin', 'advisor', 'support', 'moderator']::public.admin_role[]
    )
  );
