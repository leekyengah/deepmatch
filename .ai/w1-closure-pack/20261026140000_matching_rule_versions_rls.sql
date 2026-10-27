-- FIX26 / Founder 8A: enable RLS on matching_rule_versions (deny-by-default for anon/auth)
-- Staff (owner/admin) may read/write; service_role bypasses RLS.

alter table public.matching_rule_versions enable row level security;

drop policy if exists matching_rule_versions_select_staff on public.matching_rule_versions;
create policy matching_rule_versions_select_staff on public.matching_rule_versions
  for select using (
    public.has_admin_role(array['owner', 'admin']::public.admin_role[])
  );

drop policy if exists matching_rule_versions_write_staff on public.matching_rule_versions;
create policy matching_rule_versions_write_staff on public.matching_rule_versions
  for all using (
    public.has_admin_role(array['owner', 'admin']::public.admin_role[])
  )
  with check (
    public.has_admin_role(array['owner', 'admin']::public.admin_role[])
  );

comment on table public.matching_rule_versions is
  'Matching engine rule configs; RLS staff-only (owner/admin). service_role bypasses RLS.';
