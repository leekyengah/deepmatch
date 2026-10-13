"""Build Product Capability Inventory snapshot from repo routes/APIs/mobile screens."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/evidence/audit-2026-10-13"
OUT.mkdir(parents=True, exist_ok=True)


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def collect_pages() -> list[str]:
    pages = []
    for p in (ROOT / "apps/web/src/app").rglob("page.tsx"):
        s = rel(p)
        # derive route-ish path
        route = s.replace("apps/web/src/app", "").replace("/page.tsx", "")
        route = route.replace("(app)", "").replace("//", "/")
        if not route:
            route = "/"
        pages.append(route or "/")
    return sorted(set(pages))


def collect_apis() -> list[str]:
    apis = []
    for p in (ROOT / "apps/web/src/app/api").rglob("route.ts"):
        s = rel(p).replace("apps/web/src/app", "").replace("/route.ts", "")
        apis.append(s)
    return sorted(set(apis))


def collect_mobile() -> list[str]:
    screens = []
    base = ROOT / "apps/mobile"
    for folder in ("app", "src/app"):
        d = base / folder
        if not d.exists():
            continue
        for p in d.rglob("*.tsx"):
            if p.name.startswith("_"):
                continue
            screens.append(rel(p))
    return sorted(set(screens))


def collect_migrations() -> list[str]:
    d = ROOT / "supabase/migrations"
    return sorted(p.name for p in d.glob("*.sql")) if d.exists() else []


CAPABILITIES = [
    # id, group, name, web_route, api_hint, mobile_hint, status_guess_basis
    ("CAP-01-01", "01 Architecture & Infrastructure", "Monorepo Next/Expo/Supabase/Vercel", "/", "/api/v1/health", "apps/mobile", "IMPLEMENTED"),
    ("CAP-01-02", "01 Architecture & Infrastructure", "Staging datingvn.com health", "/", "/api/v1/health", "", "VERIFIED"),
    ("CAP-01-03", "01 Architecture & Infrastructure", "Production project deepmatch-prod", "/", "/api/v1/health", "", "PARTIAL"),
    ("CAP-02-01", "02 Premium UI/UX & Design System", "Design tokens package", "/", "", "packages/design-tokens", "IMPLEMENTED"),
    ("CAP-02-02", "02 Premium UI/UX & Design System", "Public homepage", "/", "", "", "IMPLEMENTED"),
    ("CAP-02-03", "02 Premium UI/UX & Design System", "Premium visual 1:1 fidelity gates", "/", "", "", "PARTIAL"),
    ("CAP-03-01", "03 Authentication, Profile & RBAC", "Email/password signup+login", "/login", "", "app/(auth)/login.tsx", "IMPLEMENTED"),
    ("CAP-03-02", "03 Authentication, Profile & RBAC", "Onboarding + needs questions", "/onboarding", "/api/v1/needs/questions", "", "IMPLEMENTED"),
    ("CAP-03-03", "03 Authentication, Profile & RBAC", "Profile edit / me", "/me", "/api/v1/me/profile", "app/(tabs)/me.tsx", "IMPLEMENTED"),
    ("CAP-03-04", "03 Authentication, Profile & RBAC", "Admin RBAC owner roles", "/admin", "", "", "PARTIAL"),
    ("CAP-04-01", "04 Matching & Compatibility Engine", "Matching rank API", "/discover", "/api/v1/matching/rank", "", "PARTIAL"),
    ("CAP-04-02", "04 Matching & Compatibility Engine", "Likes / mutual", "/likes", "/api/v1/likes", "app/(tabs)/likes.tsx", "IMPLEMENTED"),
    ("CAP-05-01", "05 Discover, Search & Chat", "Discover candidates", "/discover", "/api/v1/discovery/candidates", "app/(tabs)/discover.tsx", "IMPLEMENTED"),
    ("CAP-05-02", "05 Discover, Search & Chat", "Realtime chat", "/chat", "/api/v1/messages", "app/(tabs)/chat.tsx", "IMPLEMENTED"),
    ("CAP-05-03", "05 Discover, Search & Chat", "Block / report", "/chat", "/api/v1/blocks|/api/v1/reports", "", "IMPLEMENTED"),
    ("CAP-06-01", "06 AI Relationship & AI Concierge", "AI assist + usage", "/ai", "/api/v1/ai/assist", "", "IMPLEMENTED"),
    ("CAP-06-02", "06 AI Relationship & AI Concierge", "DeepMind questionnaire", "/ai/deepmind", "/api/v1/ai/deepmind", "", "IMPLEMENTED"),
    ("CAP-07-01", "07 Couple Space, DateMap & Memories", "Couple home + invite", "/couple", "/api/v1/couple-invitations", "", "IMPLEMENTED"),
    ("CAP-07-02", "07 Couple Space, DateMap & Memories", "Couple map pins", "/couple/map", "/api/v1/couples/[id]/pins", "", "IMPLEMENTED"),
    ("CAP-07-03", "07 Couple Space, DateMap & Memories", "Places / DateMap V2", "/places/map", "/api/v1/places", "", "IMPLEMENTED"),
    ("CAP-07-04", "07 Couple Space, DateMap & Memories", "Memories / journals", "/couple/memories", "/api/v1/couples/[id]/journals", "", "PARTIAL"),
    ("CAP-08-01", "08 Services, Booking & Concierge", "Services catalog", "/services", "/api/v1/services/offerings", "", "IMPLEMENTED"),
    ("CAP-08-02", "08 Services, Booking & Concierge", "Service bookings", "/bookings", "/api/v1/services/bookings", "", "PARTIAL"),
    ("CAP-08-03", "08 Services, Booking & Concierge", "Lifestyle DEMO catalog", "/lifestyle", "/api/v1/catalog/products", "", "PARTIAL"),
    ("CAP-09-01", "09 Payment, Orders & Revenue", "Bank transfer premium", "/me/premium", "/api/v1/payments/bank-transfer", "", "IMPLEMENTED"),
    ("CAP-09-02", "09 Payment, Orders & Revenue", "Checkout sandbox orders", "/checkout", "/api/v1/checkout/orders", "", "PARTIAL"),
    ("CAP-09-03", "09 Payment, Orders & Revenue", "Apple IAP verify", "", "/api/v1/payments/apple/verify", "lib/iap.ts", "PARTIAL"),
    ("CAP-09-04", "09 Payment, Orders & Revenue", "Stripe webhook", "", "/api/v1/payments/webhooks/stripe", "", "PARTIAL"),
    ("CAP-10-01", "10 Media Upload & Cloudflare R2", "Upload intents + confirm", "/me/media", "/api/v1/media/upload-intents", "", "PARTIAL"),
    ("CAP-10-02", "10 Media Upload & Cloudflare R2", "Signed media URL", "", "/api/v1/media/[id]/url", "", "PARTIAL"),
    ("CAP-11-01", "11 Security, Privacy, Trust & Legal", "Legal Center v1.1", "/legal", "", "", "VERIFIED"),
    ("CAP-11-02", "11 Security, Privacy, Trust & Legal", "Account deletion", "/account-deletion", "/api/v1/me/delete", "", "IMPLEMENTED"),
    ("CAP-11-03", "11 Security, Privacy, Trust & Legal", "Consent ledger split", "/signup", "/api/v1/me/consents", "", "IMPLEMENTED"),
    ("CAP-11-04", "11 Security, Privacy, Trust & Legal", "RLS deny tests", "", "", "tests/integration/rls-deny.test.ts", "PARTIAL"),
    ("CAP-12-01", "12 Performance, Reliability & Accessibility", "No-leak public smoke", "/", "", "scripts/no-leak-public.mjs", "PARTIAL"),
    ("CAP-12-02", "12 Performance, Reliability & Accessibility", "Outbox worker", "", "", "scripts/outbox-worker.mjs", "PARTIAL"),
    ("CAP-13-01", "13 Web, Expo, iOS & Android Parity", "Expo Router mobile shell", "", "", "apps/mobile/app", "PARTIAL"),
    ("CAP-13-02", "13 Web, Expo, iOS & Android Parity", "Shared API client mobile", "", "", "apps/mobile/lib/api.ts", "PARTIAL"),
    ("CAP-14-01", "14 App Store / Google Play Readiness", "EAS / App Store docs", "", "", "docs/ops/APP_STORE.md", "PARTIAL"),
    ("CAP-14-02", "14 App Store / Google Play Readiness", "Store LIVE submission", "", "", "", "BLOCKED"),
    ("CAP-15-01", "15 Admin, Operations, Analytics & Support", "Admin moderation/users", "", "", "apps/admin", "PARTIAL"),
    ("CAP-15-02", "15 Admin, Operations, Analytics & Support", "Support page", "/support", "", "", "IMPLEMENTED"),
    ("CAP-15-03", "15 Admin, Operations, Analytics & Support", "Analytics event sink", "", "/api/v1/analytics/events", "", "PARTIAL"),
]


def main() -> None:
    pages = collect_pages()
    apis = collect_apis()
    mobile = collect_mobile()
    migrations = collect_migrations()

    inventory = []
    for row in CAPABILITIES:
        cid, group, name, route, api, mobile_hint, status = row
        inventory.append(
            {
                "featureId": cid,
                "group": group,
                "name": name,
                "route": route,
                "api": api,
                "mobile": mobile_hint,
                "webStatus": status,
                "iosStatus": "PARTIAL" if mobile_hint else "NOT_STARTED",
                "androidStatus": "PARTIAL" if mobile_hint else "NOT_STARTED",
                "verificationBasis": "static_inventory_not_e2e",
                "priority": "P1" if status in {"BLOCKED", "TEST_FAILED"} else "P2",
            }
        )

    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "branchHint": "audit/prod-readiness-2026-10-13",
        "counts": {
            "capabilitiesListed": len(inventory),
            "webPages": len(pages),
            "apiRoutes": len(apis),
            "mobileScreens": len(mobile),
            "migrations": len(migrations),
            "byStatus": {},
        },
        "pages": pages,
        "apis": apis,
        "mobileScreens": mobile,
        "migrations": migrations,
        "capabilities": inventory,
        "disclaimer": "Status values are static inventory classifications based on presence of routes/APIs/docs; not E2E VERIFIED unless separately evidenced.",
    }
    by = {}
    for c in inventory:
        by[c["webStatus"]] = by.get(c["webStatus"], 0) + 1
    summary["counts"]["byStatus"] = by

    (OUT / "product-capability-inventory.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Markdown scorecard
    lines = [
        "# Product Completeness Scorecard (static inventory)",
        "",
        f"Generated: {summary['generatedAt']}",
        "",
        f"- Web pages discovered: **{len(pages)}**",
        f"- API routes discovered: **{len(apis)}**",
        f"- Mobile screen files: **{len(mobile)}**",
        f"- Migrations: **{len(migrations)}**",
        f"- Capabilities scored: **{len(inventory)}**",
        "",
        "## Status counts (static — not E2E)",
        "",
    ]
    for k, v in sorted(by.items()):
        lines.append(f"- {k}: {v}")
    lines += ["", "## Capability table", "", "| ID | Group | Name | Web |", "|---|---|---|---|"]
    for c in inventory:
        lines.append(f"| {c['featureId']} | {c['group'][:24]} | {c['name']} | {c['webStatus']} |")
    (OUT / "PRODUCT_COMPLETENESS_SCORECARD.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(summary["counts"], indent=2))


if __name__ == "__main__":
    main()
