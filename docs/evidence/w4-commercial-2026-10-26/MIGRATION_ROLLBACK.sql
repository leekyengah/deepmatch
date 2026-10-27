-- Rollback plan for W4 commerce refund migrations (STAGING ONLY)
-- Target: zzqpvjdyvjarpphqhaze (deepmatch). NEVER run on iofrimcbvqrhefqkkyrx (prod).
-- Prefer: restore from daily physical backup if data corruption suspected.
-- Soft schema rollback (loses audit rows):

drop function if exists public.staff_transition_order(uuid, text, text);
drop function if exists public.staff_transition_booking(uuid, text, text);

drop policy if exists commerce_audit_staff_read on public.commerce_audit_log;
drop table if exists public.commerce_audit_log;

-- Restore prior cancel policy (pre-refund)
drop policy if exists service_bookings_requester_cancel on public.service_bookings;
create policy service_bookings_requester_cancel on public.service_bookings
  for update to authenticated
  using (requester_id = auth.uid())
  with check (
    requester_id = auth.uid()
    and status = 'cancelled'
  );

-- NOTE: PostgreSQL cannot remove enum values safely.
-- 'refund_requested' / 'refunded_sandbox' remain on booking_status (harmless if unused).
-- Rows using those statuses must be moved to cancelled/completed before any enum shrink attempt.
