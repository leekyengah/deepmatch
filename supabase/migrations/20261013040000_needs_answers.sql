-- DM-136 — Hiểu mình answers (100-question bank). Private by default.

create table if not exists public.needs_answers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  consent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.needs_answers enable row level security;

drop policy if exists needs_answers_own on public.needs_answers;
create policy needs_answers_own on public.needs_answers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.needs_answers to authenticated;
grant all on public.needs_answers to service_role;
