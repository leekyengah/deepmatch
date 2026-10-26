-- EXT-008/019/041 — DeepMind answers, safety note, AI daily quota helper

create table if not exists public.ai_deepmind_answers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  insight_draft text,
  updated_at timestamptz not null default now()
);

alter table public.ai_deepmind_answers enable row level security;

drop policy if exists ai_deepmind_own on public.ai_deepmind_answers;
create policy ai_deepmind_own on public.ai_deepmind_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Soft daily AI quota (default 40 assists / UTC day). Service/BFF enforces.
create or replace function public.ai_usage_count_today(p_user uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.ai_usage_events e
  where e.user_id = p_user
    and e.created_at >= date_trunc('day', timezone('utc', now()));
$$;

revoke all on function public.ai_usage_count_today(uuid) from public;
grant execute on function public.ai_usage_count_today(uuid) to authenticated, service_role;
