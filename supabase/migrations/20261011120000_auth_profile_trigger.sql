-- Auto-create profile row on signup (DM-022)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_birth date;
  v_name text;
begin
  v_birth := nullif(new.raw_user_meta_data->>'birth_date', '')::date;
  if v_birth is null then
    v_birth := (current_date - interval '18 years')::date;
  end if;
  v_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'User');

  insert into public.profiles (id, display_name, birth_date, mode)
  values (
    new.id,
    v_name,
    v_birth,
    coalesce((new.raw_user_meta_data->>'mode')::user_mode, 'solo')
  )
  on conflict (id) do nothing;

  insert into public.profile_deep (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.match_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
