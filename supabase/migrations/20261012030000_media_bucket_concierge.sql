-- DM-034 media private bucket + DM-041..043 concierge RLS/seed

-- ---------- Storage: private media bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_storage_owner_insert on storage.objects;
create policy media_storage_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists media_storage_owner_select on storage.objects;
create policy media_storage_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.media_objects mo
        where mo.storage_path = name
          and mo.pair_id is not null
          and public.is_pair_member(mo.pair_id)
      )
    )
  );

drop policy if exists media_storage_owner_update on storage.objects;
create policy media_storage_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists media_storage_owner_delete on storage.objects;
create policy media_storage_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- Concierge: offerings + bookings ----------
alter table public.service_offerings enable row level security;

drop policy if exists service_offerings_select_active on public.service_offerings;
create policy service_offerings_select_active on public.service_offerings
  for select to authenticated
  using (
    active = true
    or public.has_admin_role(array['owner', 'admin', 'advisor', 'support']::public.admin_role[])
  );

drop policy if exists service_bookings_requester_select on public.service_bookings;
create policy service_bookings_requester_select on public.service_bookings
  for select to authenticated
  using (
    requester_id = auth.uid()
    or advisor_id = auth.uid()
    or public.has_admin_role(array['owner', 'admin', 'advisor', 'support']::public.admin_role[])
  );

drop policy if exists service_bookings_requester_insert on public.service_bookings;
create policy service_bookings_requester_insert on public.service_bookings
  for insert to authenticated
  with check (
    requester_id = auth.uid()
    and exists (
      select 1 from public.service_offerings o
      where o.id = offering_id and o.active = true
    )
    and (
      pair_id is null
      or public.is_pair_member(pair_id)
    )
  );

drop policy if exists service_bookings_requester_cancel on public.service_bookings;
create policy service_bookings_requester_cancel on public.service_bookings
  for update to authenticated
  using (requester_id = auth.uid())
  with check (
    requester_id = auth.uid()
    and status = 'cancelled'
  );

insert into public.service_offerings (title, description, active)
select v.title, v.description, true
from (
  values
    (
      'Deep Profile 1:1',
      'Làm rõ hồ sơ và kỳ vọng quan hệ với chuyên viên. Không hứa kết quả ghép đôi.'
    ),
    (
      'Matching Strategy',
      'Chiến lược tìm và lọc hồ sơ phù hợp — không chấm EQ hay xác suất yêu.'
    ),
    (
      'Private Date Curation',
      'Gợi ý buổi hẹn riêng tư theo sở thích hai bên, trong phạm vi đồng ý.'
    ),
    (
      'After-Match Coaching',
      'Đồng hành sau khi đã kết nối; phản hồi riêng, không lộ nhật ký cá nhân.'
    )
) as v(title, description)
where not exists (
  select 1 from public.service_offerings s where s.title = v.title
);

-- Staging: allow concierge flag in DB (env FF_CONCIERGE still gates BFF)
update public.feature_flags
set enabled = true, updated_at = now()
where name = 'ff_concierge';
