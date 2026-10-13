-- Sánh đôi premium: pair space meta + shared dates (tab38 SD-HERO / SD-DATE)

alter table public.pairs
  add column if not exists space_title text,
  add column if not exists cover_path text,
  add column if not exists motto text,
  add column if not exists started_on date;

comment on column public.pairs.space_title is 'Optional couple space display title; defaults to partner names in UI';
comment on column public.pairs.cover_path is 'Storage path in media bucket for cover; private to pair members';
comment on column public.pairs.motto is 'Short couple quote shown on hero; optional';
comment on column public.pairs.started_on is 'User-declared relationship start date; never invent default days';

do $$ begin
  create type public.couple_date_status as enum (
    'proposed',
    'awaiting',
    'confirmed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.couple_dates (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.pairs (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  place_label text,
  note text,
  status public.couple_date_status not null default 'proposed',
  confirmed_a boolean not null default false,
  confirmed_b boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists couple_dates_pair_starts_idx
  on public.couple_dates (pair_id, starts_at);

alter table public.couple_dates enable row level security;

drop policy if exists couple_dates_member on public.couple_dates;
drop policy if exists couple_dates_select on public.couple_dates;
drop policy if exists couple_dates_insert on public.couple_dates;
drop policy if exists couple_dates_update on public.couple_dates;
drop policy if exists couple_dates_delete on public.couple_dates;

create policy couple_dates_select on public.couple_dates
  for select using (public.is_pair_member(pair_id));

create policy couple_dates_insert on public.couple_dates
  for insert with check (
    public.is_pair_member(pair_id) and created_by = auth.uid()
  );

create policy couple_dates_update on public.couple_dates
  for update using (public.is_pair_member(pair_id))
  with check (public.is_pair_member(pair_id));

create policy couple_dates_delete on public.couple_dates
  for delete using (
    public.is_pair_member(pair_id) and created_by = auth.uid()
  );
