-- DM-077: per-user last-read cursor for unread counts (no message body in notifications)

create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_reads_user_idx
  on public.conversation_reads (user_id);

alter table public.conversation_reads enable row level security;

drop policy if exists conversation_reads_self on public.conversation_reads;
create policy conversation_reads_self on public.conversation_reads
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Participants may count peer messages after their last_read_at via messages RLS already.
