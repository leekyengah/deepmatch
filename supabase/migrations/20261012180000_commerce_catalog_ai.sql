-- EXT-002/003/006/007 — Lifestyle commerce catalog + AI consent/usage + DeepSafe skeleton
-- Rollback: drop tables/types created below (staging only; never mix LIVE providers without Founder gate).

create type public.commerce_provider_status as enum (
  'DEMO', 'TEST', 'VERIFIED', 'LIVE'
);

create type public.commerce_fulfillment as enum (
  'SANDBOX_ONLY', 'QUOTE_ONLY', 'LIVE_FULFILL'
);

create type public.commerce_category_slug as enum (
  'gift', 'fashion', 'beauty', 'venue', 'travel', 'safety'
);

create type public.ai_task as enum (
  'profile_coach',
  'match_hints',
  'style',
  'beauty',
  'gift',
  'date_plan',
  'travel',
  'story',
  'safety_tips',
  'deepmind'
);

-- ---------- providers ----------
create table public.commerce_providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  category public.commerce_category_slug not null,
  status public.commerce_provider_status not null default 'DEMO',
  source_note text not null default 'Fictional seed — not a real business',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_providers_no_live_yet check (status <> 'LIVE')
);

create table public.commerce_categories (
  slug public.commerce_category_slug primary key,
  title_vi text not null,
  description text not null default '',
  sort_order int not null default 0
);

create table public.commerce_products (
  id uuid primary key default gen_random_uuid(),
  mock_id text not null unique,
  category public.commerce_category_slug not null
    references public.commerce_categories (slug),
  provider_id uuid not null references public.commerce_providers (id) on delete cascade,
  title text not null,
  kind text not null default 'product',
  description text not null default '',
  price_vnd int not null default 0 check (price_vnd >= 0),
  unit text not null default 'mẫu',
  fulfillment public.commerce_fulfillment not null default 'SANDBOX_ONLY',
  demo_banner text not null
    default 'BẢN MẪU / KHÔNG CÓ ĐẶT CHỖ HOẶC THANH TOÁN THẬT',
  features text not null default 'Browse → detail → compare → request demo → cancel',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index commerce_products_category_idx on public.commerce_products (category)
  where active;

create table public.commerce_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.commerce_products (id) on delete cascade,
  label text not null default 'DEMO offer',
  price_vnd int not null check (price_vnd >= 0),
  currency text not null default 'VND',
  valid_until timestamptz,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.commerce_demo_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.commerce_products (id),
  status text not null default 'DEMO_PENDING'
    check (status in (
      'DEMO_PENDING', 'DEMO_RESERVED', 'DEMO_CONFIRMED', 'CANCELLED', 'FAILED'
    )),
  idempotency_key text,
  quote_vnd int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

-- ---------- AI ----------
create table public.ai_consents (
  user_id uuid not null references public.profiles (id) on delete cascade,
  purpose public.ai_task not null,
  granted boolean not null default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  primary key (user_id, purpose)
);

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task public.ai_task not null,
  adapter text not null default 'stub',
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  ok boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ai_usage_events_user_day_idx
  on public.ai_usage_events (user_id, created_at desc);

-- ---------- DeepSafe (core free) ----------
create table public.safety_trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  channel text not null default 'phone',
  contact_value text not null,
  created_at timestamptz not null default now()
);

create table public.safety_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  window_ends_at timestamptz not null,
  share_approx_location boolean not null default false,
  note text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- feature flags ----------
insert into public.feature_flags (name, enabled)
values
  ('ff_lifestyle', true),
  ('ff_ai', true)
on conflict (name) do update
  set enabled = excluded.enabled,
      updated_at = now();

-- ---------- seed categories ----------
insert into public.commerce_categories (slug, title_vi, description, sort_order) values
  ('gift', 'Quà tặng', 'DeepGift — mẫu DEMO', 10),
  ('fashion', 'Thời trang', 'DeepStyle — mẫu DEMO', 20),
  ('beauty', 'Makeup & Beauty', 'DeepBeauty — mẫu DEMO', 30),
  ('venue', 'Địa điểm hẹn', 'DeepDate — mẫu DEMO', 40),
  ('travel', 'Du lịch', 'DeepTravel — mẫu DEMO', 50),
  ('safety', 'An toàn', 'DeepSafe — quy trình mô phỏng (không phải dịch vụ khẩn cấp)', 60)
on conflict (slug) do nothing;

-- ---------- RLS ----------
alter table public.commerce_providers enable row level security;
alter table public.commerce_categories enable row level security;
alter table public.commerce_products enable row level security;
alter table public.commerce_offers enable row level security;
alter table public.commerce_demo_bookings enable row level security;
alter table public.ai_consents enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.safety_trusted_contacts enable row level security;
alter table public.safety_checkins enable row level security;

-- Public read of DEMO catalog (authenticated + anon for browse)
create policy commerce_categories_read on public.commerce_categories
  for select using (true);

create policy commerce_providers_read_demo on public.commerce_providers
  for select using (status in ('DEMO', 'TEST', 'VERIFIED'));

create policy commerce_products_read_active on public.commerce_products
  for select using (
    active
    and exists (
      select 1 from public.commerce_providers p
      where p.id = provider_id and p.status in ('DEMO', 'TEST', 'VERIFIED')
    )
  );

create policy commerce_offers_read on public.commerce_offers
  for select using (
    exists (
      select 1 from public.commerce_products pr
      join public.commerce_providers p on p.id = pr.provider_id
      where pr.id = product_id and pr.active
        and p.status in ('DEMO', 'TEST', 'VERIFIED')
    )
  );

create policy commerce_demo_bookings_own on public.commerce_demo_bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy ai_consents_own on public.ai_consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy ai_usage_own_select on public.ai_usage_events
  for select using (auth.uid() = user_id);

create policy ai_usage_own_insert on public.ai_usage_events
  for insert with check (auth.uid() = user_id);

create policy safety_contacts_own on public.safety_trusted_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy safety_checkins_own on public.safety_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Staff read/write catalog via has_admin_role when available
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'has_admin_role'
  ) then
    execute $p$
      create policy commerce_providers_staff on public.commerce_providers
        for all using (public.has_admin_role(array['owner','admin']::public.admin_role[]))
        with check (
          public.has_admin_role(array['owner','admin']::public.admin_role[])
          and status <> 'LIVE'
        )
    $p$;
    execute $p$
      create policy commerce_products_staff on public.commerce_products
        for all using (public.has_admin_role(array['owner','admin']::public.admin_role[]))
        with check (public.has_admin_role(array['owner','admin']::public.admin_role[]))
    $p$;
  end if;
end $$;
