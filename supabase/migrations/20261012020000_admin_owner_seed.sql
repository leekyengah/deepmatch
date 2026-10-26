-- DM-079: admin_roles RLS + founder owner bootstrap by email
-- Safe if user has not signed up yet (0-row insert).

alter table public.admin_roles enable row level security;

create or replace function public.has_admin_role(allowed public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.role = any (allowed)
  );
$$;

revoke all on function public.has_admin_role(public.admin_role[]) from public;
grant execute on function public.has_admin_role(public.admin_role[]) to authenticated, service_role;

-- Staff may read their own role row (for admin app gate).
drop policy if exists admin_roles_self_select on public.admin_roles;
create policy admin_roles_self_select on public.admin_roles
  for select
  to authenticated
  using (user_id = auth.uid());

-- No client insert/update/delete — service role / migration only.

create or replace function public.grant_admin_role_by_email(
  p_email text,
  p_role public.admin_role default 'owner'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_uid is null then
    raise exception 'auth user not found for email %', p_email
      using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.profiles where id = v_uid) then
    insert into public.profiles (id, display_name, birth_date)
    values (
      v_uid,
      coalesce(split_part(p_email, '@', 1), 'Owner'),
      (current_date - interval '21 years')::date
    );
  end if;

  insert into public.admin_roles (user_id, role)
  values (v_uid, p_role)
  on conflict (user_id) do update
    set role = excluded.role;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, reason, metadata)
  values (
    v_uid,
    'admin.role.grant',
    'admin_roles',
    v_uid::text,
    'bootstrap grant_admin_role_by_email',
    jsonb_build_object('email', lower(trim(p_email)), 'role', p_role::text)
  );

  return v_uid;
end;
$$;

revoke all on function public.grant_admin_role_by_email(text, public.admin_role) from public;
grant execute on function public.grant_admin_role_by_email(text, public.admin_role) to service_role;

-- Founder owner: apply when account exists
do $$
declare
  v_uid uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower('leekyengah@gmail.com')
  limit 1;

  if v_uid is null then
    raise notice 'admin owner seed skipped: leekyengah@gmail.com not in auth.users yet';
    return;
  end if;

  if not exists (select 1 from public.profiles where id = v_uid) then
    insert into public.profiles (id, display_name, birth_date)
    values (
      v_uid,
      'DeepMatch Owner',
      (current_date - interval '21 years')::date
    );
  end if;

  insert into public.admin_roles (user_id, role)
  values (v_uid, 'owner')
  on conflict (user_id) do update
    set role = excluded.role;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, reason, metadata)
  values (
    v_uid,
    'admin.role.grant',
    'admin_roles',
    v_uid::text,
    'migration founder owner seed',
    jsonb_build_object('email', 'leekyengah@gmail.com', 'role', 'owner')
  );
end;
$$;
