drop policy if exists entitlements_insert_own on public.entitlements;
create policy entitlements_insert_own on public.entitlements
  for insert
  with check (user_id = auth.uid() and sandbox = true);

grant insert on public.entitlements to authenticated;
