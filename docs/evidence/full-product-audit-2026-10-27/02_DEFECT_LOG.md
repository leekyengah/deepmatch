# Defect Remediation Log

| Defect ID | Module | Platform | Sev | Expected | Actual | Root cause | Fix | Retest |
|-----------|--------|----------|-----|----------|--------|------------|-----|--------|
| DEF-AUD-001 | Admin / Auth | Mobile | P1 | Logout/login reachable | Admin shell no logout; Me logout buried | Admin tabs replace member chrome | `AdminHeaderActions` + Me logout top + `signOut` local+global | Needs APK with change (`6181c4a4` had admin UX; i18n copy needs newer build) |
| DEF-AUD-002 | Lifestyle / Commerce | Web+Mobile | P1 | Customer copy without engineer jargon | DEMO/Sandbox/LIVE/EXT-040 on Lifestyle | Staging honesty over-exposed | i18n + mobile hardcode removal | Web: after redeploy; Mobile: new APK |
| DEF-AUD-003 | Discover | Web | P2 | Profiles feel complete | All cards “Thiếu dữ liệu”, empty photo plane | Seed / media incomplete | **Open** — catalog/media seed quality | NOT_FIXED |
| DEF-AUD-004 | Discover | Web | P2 | No synthetic labels in bios | “Synthetic Mebertes” in detail | Seed bio text | **Open** — reseeds or sanitize display | NOT_FIXED |
| DEF-AUD-005 | AuthZ API | API | — | Unauth denied | 401 UNAUTHENTICATED | — | N/A (PASS) | PASS |
| DEF-AUD-006 | iOS device | Mobile | P1 gate | Device install | No Apple Dev/ASC | External | BLOCKED_EXTERNAL | — |
| DEF-AUD-007 | Login landing | Mobile | P2 | Post-login member tabs | Admin confusion | Missing exit + login replace | login `replace/(tabs)` | Covered with DEF-AUD-001 |
| DEF-AUD-008 | Checkout | Web | P1 | No member simulate pay | `sandbox_succeed`/`fail` CTAs | QA helper left on member UI | Removed simulate buttons from `CheckoutClient` | Needs staging redeploy |
| DEF-AUD-009 | Auth errors | Web | P1 | Generic i18n errors | Raw Supabase `error.message` in URL/UI | Reflected IdP errors | login/signup/forgot/reset → i18n keys | Needs staging redeploy |
| DEF-AUD-010 | Home / AI / Couple copy | Web+i18n | P2 | No DEMO/BETA/RLS jargon | Home DEMO, AI migration+RLS, couple R2/LIVE | Eng copy | Softened HomeDashboard + ai/couple i18n | Needs staging redeploy |
| DEF-AUD-011 | Premium/Places badges | Mobile | P2 | No BLOCKED_EXTERNAL | Hardcoded LIVE PSP / Maps keys | Eng badges | i18n preview labels | Needs new APK |

## Not claimed PASS

Anything with empty photos, DEMO partner seed names, iOS device, dual-account match/chat, Independent QA.  
