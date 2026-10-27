-- Show premium catalog (price announced); payment still not wired
update public.feature_flags
set enabled = true, updated_at = now()
where name = 'ff_premium';
