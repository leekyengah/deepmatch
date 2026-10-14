-- Couple invite by email: optional invitee address for audit / UX (code still hashed)
alter table public.pair_invites
  add column if not exists invitee_email text;

comment on column public.pair_invites.invitee_email is
  'Optional invitee email for delivery tracking; plaintext invite code is never stored.';

create index if not exists pair_invites_invitee_email_idx
  on public.pair_invites (lower(invitee_email))
  where invitee_email is not null and status = 'pending';
