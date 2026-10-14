-- Allow blocked party to see that they are blocked (chat enforcement / UI)
drop policy if exists blocks_visible_blocked on public.blocks;
create policy blocks_visible_blocked on public.blocks
  for select using (blocked_id = auth.uid() or blocker_id = auth.uid());
