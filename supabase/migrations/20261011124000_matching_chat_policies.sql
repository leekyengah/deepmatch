create policy mutual_insert_participant on public.mutual_matches
  for insert with check (user_a = auth.uid() or user_b = auth.uid());

create policy conversations_insert_participant on public.conversations
  for insert with check (
    exists (
      select 1 from public.mutual_matches m
      where m.id = mutual_match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy messages_insert_sender on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      join public.mutual_matches m on m.id = c.mutual_match_id
      where c.id = conversation_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );
