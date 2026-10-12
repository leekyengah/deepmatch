-- Authenticated clients may enqueue domain events (service workers process them)
create or replace function public.enqueue_outbox(
  p_event_id text,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.outbox_events (event_id, event_type, payload)
  values (p_event_id, p_event_type, coalesce(p_payload, '{}'::jsonb))
  on conflict (event_id) do update
    set payload = excluded.payload
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.outbox_events where event_id = p_event_id;
  end if;
  return v_id;
end;
$$;

revoke all on function public.enqueue_outbox(text, text, jsonb) from public;
grant execute on function public.enqueue_outbox(text, text, jsonb) to authenticated;
