-- Staff can triage reports + list recent media (DM-082/084)

drop policy if exists media_select_staff on public.media_objects;
create policy media_select_staff on public.media_objects
  for select using (
    public.has_admin_role(
      array['owner', 'admin', 'moderator', 'support']::public.admin_role[]
    )
  );

drop policy if exists reports_select_staff on public.reports;
create policy reports_select_staff on public.reports
  for select using (
    public.has_admin_role(
      array['owner', 'admin', 'moderator', 'support']::public.admin_role[]
    )
  );

drop policy if exists reports_update_staff on public.reports;
create policy reports_update_staff on public.reports
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
