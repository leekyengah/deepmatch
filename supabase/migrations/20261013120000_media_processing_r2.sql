-- DM-MEDIA-002: processing / privacy / backend fields for unified media service

alter table public.media_objects
  add column if not exists storage_backend text not null default 'supabase',
  add column if not exists processing_status text not null default 'pending_upload',
  add column if not exists visibility text not null default 'private',
  add column if not exists media_type text,
  add column if not exists duration_seconds numeric,
  add column if not exists width int,
  add column if not exists height int,
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists thumb_path text,
  add column if not exists deleted_at timestamptz;

comment on column public.media_objects.storage_backend is 'supabase | r2';
comment on column public.media_objects.processing_status is 'pending_upload | uploaded | processing | ready | failed';
comment on column public.media_objects.visibility is 'public | private | couple_private | admin_restricted';

create index if not exists media_objects_owner_ready_idx
  on public.media_objects (owner_user_id, processing_status)
  where deleted_at is null;

create index if not exists media_objects_pair_idx
  on public.media_objects (pair_id)
  where pair_id is not null and deleted_at is null;
