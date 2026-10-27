-- New users join Discover by default (photo upload not required for Discover).
alter table public.profiles
  alter column discovery_opt_in set default true;

comment on column public.profiles.discovery_opt_in is
  'Default true: new members participate in Discover; user may opt out in privacy.';

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

  insert into public.profiles (
    id,
    display_name,
    birth_date,
    mode,
    discovery_opt_in,
    hidden_from_discovery
  )
  values (
    new.id,
    v_name,
    v_birth,
    coalesce((new.raw_user_meta_data->>'mode')::user_mode, 'solo'),
    true,
    false
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

-- Existing active members: enable Discover (opt-out remains via privacy settings).
update public.profiles
set discovery_opt_in = true,
    updated_at = now()
where discovery_opt_in = false
  and suspended = false;
