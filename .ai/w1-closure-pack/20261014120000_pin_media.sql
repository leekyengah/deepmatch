-- Couple memory media: attach media_objects to pins (Sánh đôi kỷ niệm)

alter table public.media_objects
  add column if not exists pin_id uuid references public.pins (id) on delete set null;

create index if not exists media_objects_pin_idx
  on public.media_objects (pin_id)
  where pin_id is not null and deleted_at is null;

comment on column public.media_objects.pin_id is
  'Optional pin (memory) this media belongs to; pair_id must match pin.pair_id';
