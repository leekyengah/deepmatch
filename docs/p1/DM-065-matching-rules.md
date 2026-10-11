# DM-065 — Discovery & Matching Rules Spec

1. Opt-in + not hidden + age ≥ 18
2. Hard filters: age range, fuzzy regions, required goals, exclusions (block/report/pass)
3. Soft score: shared goals/values/interests + same region; dealbreaker soft penalty
4. Reasons via `buildReasons` — never love %
5. Forbidden: private diary, exact GPS, advisor notes
6. Rule versions stored in `matching_rule_versions`
7. Mutual like → chat eligibility only; **not** pair creation
