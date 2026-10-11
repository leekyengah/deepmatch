-- Tighten invite visibility; accept via RPC by code_hash only
drop policy if exists pair_invites_select_related on public.pair_invites;
drop policy if exists pair_invites_update_related on public.pair_invites;

create policy pair_invites_select_own on public.pair_invites
  for select using (created_by = auth.uid() or accepted_by = auth.uid());

create policy pair_invites_update_creator on public.pair_invites
  for update using (created_by = auth.uid());

create or replace function public.accept_pair_invite(p_code_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.pair_invites%rowtype;
  v_uid uuid := auth.uid();
  v_a uuid;
  v_b uuid;
  v_pair uuid;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select * into v_invite
  from public.pair_invites
  where code_hash = p_code_hash
  for update;

  if not found then
    raise exception 'invalid_invite';
  end if;
  if v_invite.status <> 'pending' then
    raise exception 'invite_not_pending';
  end if;
  if v_invite.expires_at < now() then
    update public.pair_invites set status = 'expired' where id = v_invite.id;
    raise exception 'invite_expired';
  end if;
  if v_invite.created_by = v_uid then
    raise exception 'cannot_accept_own';
  end if;

  if v_invite.created_by < v_uid then
    v_a := v_invite.created_by; v_b := v_uid;
  else
    v_a := v_uid; v_b := v_invite.created_by;
  end if;

  insert into public.pairs (user_a, user_b, status)
  values (v_a, v_b, 'active')
  returning id into v_pair;

  update public.pair_invites
  set status = 'accepted', accepted_by = v_uid
  where id = v_invite.id;

  return v_pair;
end;
$$;

revoke all on function public.accept_pair_invite(text) from public;
grant execute on function public.accept_pair_invite(text) to authenticated;
