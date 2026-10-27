-- Staff ops: list profiles (limited), update suspend, manage bookings assign

drop policy if exists profiles_select_staff on public.profiles;
create policy profiles_select_staff on public.profiles
  for select using (
    public.has_admin_role(
      array['owner', 'admin', 'moderator', 'support', 'advisor']::public.admin_role[]
    )
  );

drop policy if exists profiles_update_staff on public.profiles;
create policy profiles_update_staff on public.profiles
  for update using (
    public.has_admin_role(
      array['owner', 'admin', 'moderator', 'support']::public.admin_role[]
    )
  )
  with check (
    public.has_admin_role(
      array['owner', 'admin', 'moderator', 'support']::public.admin_role[]
    )
  );

drop policy if exists service_bookings_staff_update on public.service_bookings;
create policy service_bookings_staff_update on public.service_bookings
  for update using (
    public.has_admin_role(
      array['owner', 'admin', 'advisor', 'support']::public.admin_role[]
    )
  )
  with check (
    public.has_admin_role(
      array['owner', 'admin', 'advisor', 'support']::public.admin_role[]
    )
  );

drop policy if exists feature_flags_select_staff on public.feature_flags;
create policy feature_flags_select_staff on public.feature_flags
  for select using (
    public.has_admin_role(
      array['owner', 'admin']::public.admin_role[]
    )
  );

alter table public.feature_flags enable row level security;

drop policy if exists feature_flags_update_staff on public.feature_flags;
create policy feature_flags_update_staff on public.feature_flags
  for update using (
    public.has_admin_role(array['owner', 'admin']::public.admin_role[])
  )
  with check (
    public.has_admin_role(array['owner', 'admin']::public.admin_role[])
  );
