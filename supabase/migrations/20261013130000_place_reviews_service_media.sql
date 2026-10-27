-- DM-MEDIA-002 follow-up: place reviews + media entity_ref for places/services

alter table public.media_objects
  add column if not exists entity_ref text;

comment on column public.media_objects.entity_ref is 'Non-UUID entity key (place_id, package_code, etc.)';

create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null check (char_length(body) between 1 and 2000),
  media_id uuid references public.media_objects (id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (place_id, author_id)
);

create index if not exists place_reviews_place_idx
  on public.place_reviews (place_id)
  where deleted_at is null;

alter table public.place_reviews enable row level security;

drop policy if exists place_reviews_select on public.place_reviews;
create policy place_reviews_select on public.place_reviews
  for select to authenticated, anon
  using (deleted_at is null);

drop policy if exists place_reviews_insert_own on public.place_reviews;
create policy place_reviews_insert_own on public.place_reviews
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists place_reviews_update_own on public.place_reviews;
create policy place_reviews_update_own on public.place_reviews
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

grant select on public.place_reviews to anon, authenticated;
grant insert, update on public.place_reviews to authenticated;
grant all on public.place_reviews to service_role;
