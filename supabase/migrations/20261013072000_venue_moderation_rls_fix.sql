-- Fix venue_moderation_queue RLS: split staff ALL, require reporter_id = auth.uid()
drop policy if exists venue_mod_report on public.venue_moderation_queue;
drop policy if exists venue_mod_staff on public.venue_moderation_queue;
drop policy if exists venue_mod_public_removed on public.venue_moderation_queue;

create policy venue_mod_select_removed_or_staff on public.venue_moderation_queue
  for select using (
    status = 'removed'
    or exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  );

create policy venue_mod_insert_own_report on public.venue_moderation_queue
  for insert with check (
    auth.uid() is not null
    and reporter_id = auth.uid()
    and status = 'open'
  );

create policy venue_mod_staff_update on public.venue_moderation_queue
  for update using (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  )
  with check (
    exists (
      select 1 from public.admin_roles ar
      where ar.user_id = auth.uid() and ar.role in ('owner', 'admin', 'moderator')
    )
  );
