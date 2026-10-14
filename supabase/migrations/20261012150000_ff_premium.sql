-- DM-057: premium / advanced pack flag (off by default — no billing)

insert into public.feature_flags (name, enabled)
values ('ff_premium', false)
on conflict (name) do update set updated_at = now();
