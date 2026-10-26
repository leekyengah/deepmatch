alter table public.needs_answers
  add column if not exists match_prefs jsonb not null default '{}'::jsonb;

alter table public.service_bookings
  add column if not exists meta jsonb not null default '{}'::jsonb;
