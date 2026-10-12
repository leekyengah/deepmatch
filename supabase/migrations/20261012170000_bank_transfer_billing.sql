-- Manual bank-transfer billing (HD Bank STK) — no Stripe required

create or replace function public.create_bank_transfer_payment(
  p_amount_vnd int default 99000,
  p_plan_code text default 'premium'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pay_id uuid;
  v_code text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_amount_vnd is null or p_amount_vnd < 1000 then
    raise exception 'invalid_amount';
  end if;

  v_code := 'DM' || upper(substr(replace(v_uid::text, '-', ''), 1, 8));

  insert into public.payments (
    user_id,
    amount_cents,
    currency,
    status,
    provider,
    provider_payment_ref,
    metadata
  )
  values (
    v_uid,
    p_amount_vnd, -- VND stored as whole đồng in amount_cents column for VN bank path
    'vnd',
    'pending',
    'bank_hd',
    v_code || '-' || to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISS'),
    jsonb_build_object(
      'plan_code', p_plan_code,
      'transfer_code', v_code,
      'channel', 'bank_transfer'
    )
  )
  returning id into v_pay_id;

  return jsonb_build_object(
    'payment_id', v_pay_id,
    'transfer_code', v_code,
    'amount_vnd', p_amount_vnd,
    'status', 'pending'
  );
end;
$$;

revoke all on function public.create_bank_transfer_payment(int, text) from public;
grant execute on function public.create_bank_transfer_payment(int, text) to authenticated;

create or replace function public.staff_confirm_bank_payment(
  p_payment_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay public.payments%rowtype;
  v_plan text;
  v_period_end timestamptz := now() + interval '30 days';
begin
  if not public.has_admin_role(
    array['owner', 'admin', 'support']::public.admin_role[]
  ) then
    raise exception 'forbidden';
  end if;

  select * into v_pay from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'payment_not_found';
  end if;
  if v_pay.provider <> 'bank_hd' then
    raise exception 'not_bank_payment';
  end if;
  if v_pay.status = 'paid' then
    return;
  end if;

  update public.payments
  set status = 'paid',
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'confirmed_by', auth.uid(),
        'confirmed_at', now(),
        'confirm_note', nullif(trim(coalesce(p_note, '')), '')
      )
  where id = p_payment_id;

  v_plan := coalesce(v_pay.metadata->>'plan_code', 'premium');

  insert into public.subscriptions (
    user_id, plan_code, status, provider, provider_subscription_id,
    current_period_end, updated_at
  )
  values (
    v_pay.user_id,
    v_plan,
    'active',
    'bank_hd',
    'bank-' || p_payment_id::text,
    v_period_end,
    now()
  )
  on conflict (provider, provider_subscription_id) do update
    set status = 'active',
        current_period_end = excluded.current_period_end,
        updated_at = now();

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, reason, metadata)
  values (
    auth.uid(),
    'payment.bank_confirm',
    'payments',
    p_payment_id::text,
    nullif(trim(coalesce(p_note, '')), ''),
    jsonb_build_object('user_id', v_pay.user_id, 'amount', v_pay.amount_cents)
  );
end;
$$;

revoke all on function public.staff_confirm_bank_payment(uuid, text) from public;
grant execute on function public.staff_confirm_bank_payment(uuid, text) to authenticated;

update public.feature_flags
set enabled = true, updated_at = now()
where name = 'ff_billing';
