-- Allow users to write their own consent journal entries
create policy consent_insert_self on public.consent_events
  for insert with check (user_id = auth.uid());
