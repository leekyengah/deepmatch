-- Allow reading display_name of mutual-match peers (chat list)
drop policy if exists profiles_mutual_peer_select on public.profiles;
create policy profiles_mutual_peer_select on public.profiles
  for select using (
    exists (
      select 1 from public.mutual_matches m
      where (m.user_a = auth.uid() and m.user_b = profiles.id)
         or (m.user_b = auth.uid() and m.user_a = profiles.id)
    )
  );
