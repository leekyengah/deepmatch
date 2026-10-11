-- Pair invites: creator can insert/select own; accept flow uses authenticated updates carefully
create policy pair_invites_insert_self on public.pair_invites
  for insert with check (created_by = auth.uid());

create policy pair_invites_select_related on public.pair_invites
  for select using (
    created_by = auth.uid()
    or accepted_by = auth.uid()
    or status = 'pending'
  );

create policy pair_invites_update_related on public.pair_invites
  for update using (
    created_by = auth.uid()
    or status = 'pending'
  );

create policy pairs_insert_member on public.pairs
  for insert with check (user_a = auth.uid() or user_b = auth.uid());
