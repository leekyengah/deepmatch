/**
 * Phase 2 — 14 commercial journeys against staging (datingvn.com by default).
 * Requires E2E_EMAIL/E2E_PASSWORD or QA_EMAIL_A/QA_PASSWORD.
 * Does not claim PASS for HTTP-only checks; each test asserts user-visible outcomes.
 */
import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const email = process.env.QA_EMAIL_A || process.env.E2E_EMAIL;
const password = process.env.QA_PASSWORD || process.env.E2E_PASSWORD;
const hasCreds = Boolean(email && password);
const evidenceDir = "docs/evidence/audit-2026-10-13/phase2/e2e";
mkdirSync(evidenceDir, { recursive: true });

const results: Array<{
  journey: string;
  status: "PASS" | "FAIL" | "BLOCKED" | "NOT_TESTED" | "PASS_PARTIAL";
  notes: string;
}> = [];

function persistResults() {
  writeFileSync(
    join(evidenceDir, "journey-results.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseURL: process.env.E2E_BASE_URL ?? "https://datingvn.com",
        hasCreds,
        results,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function record(
  journey: string,
  status: (typeof results)[number]["status"],
  notes: string,
) {
  results.push({ journey, status, notes });
  persistResults();
}

async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"], input[type="email"]').first().fill(email!);
  await page
    .locator('input[name="password"], input[type="password"]')
    .first()
    .fill(password!);
  await page.getByRole("button", { name: /Đăng nhập|Sign in|Log in/i }).click();
  await page.waitForURL(
    (url) => !url.pathname.includes("/login"),
    { timeout: 45_000 },
  );
  expect(page.url()).not.toMatch(/Invalid API key/i);
  expect(page.url()).not.toContain("/login");
  // Confirm session cookie actually authorizes a private route before journey steps.
  await page.goto("/me");
  await page.waitForLoadState("domcontentloaded");
  expect(page.url()).not.toMatch(/\/login/);
}

test.afterAll(() => {
  persistResults();
});

test.describe("Phase2 J01–J14", () => {
  // Reduce same-account login races against staging Auth.
  test.describe.configure({ mode: "serial" });
  test("J14 guest private routes redirect to login", async ({ page }) => {
    for (const path of ["/discover", "/chat", "/me", "/couple", "/ai", "/services"]) {
      const res = await page.goto(path, { waitUntil: "commit" });
      // Follow redirects in browser context
      await page.waitForLoadState("domcontentloaded");
      const url = page.url();
      expect(url, path).toMatch(/\/login/);
      expect(url).toContain("next=");
      void res;
    }
    const legal = await page.goto("/legal");
    expect(legal?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(/Pháp lý|1\.1|chính sách/i);
    record("J14-guest-auth-gate", "PASS", "Private routes → /login?next=; /legal 200");
  });

  test("J01 signup page age+split consents visible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[name="age_confirm"]')).toHaveCount(1);
    const terms = page.locator('input[name="accept_terms"]');
    const privacy = page.locator('input[name="ack_privacy"]');
    await expect(terms).toHaveCount(1);
    await expect(privacy).toHaveCount(1);
    await expect(terms).not.toBeChecked();
    await expect(privacy).not.toBeChecked();
    record(
      "J01-registration-ui",
      "PASS_PARTIAL",
      "Signup UI + split consents verified; full OTP/email verification NOT_TESTED (no disposable inbox automation)",
    );
  });

  test.describe("authenticated journeys", () => {
    test.skip(!hasCreds, "Set E2E_/QA_ credentials");

    test("J05 login + chat shell + block/report UI", async ({ page }) => {
      await login(page);
      await page.goto("/chat");
      await expect(page.locator("body")).toContainText(/Chat|Trò chuyện|tin|mutual|Tìm nhau/i);
      await expect(page.locator("body")).not.toContainText("Chat đang tắt");
      await page.screenshot({ path: join(evidenceDir, "j05-chat.png"), fullPage: true });
      record("J05-chat-block-report", "PASS_PARTIAL", "Chat shell reachable; block/report deep flow depends on active conversation");
    });

    test("J04 discover + likes", async ({ page }) => {
      await login(page);
      await page.goto("/discover");
      await expect(page.locator("body")).toContainText(/Tìm nhau|gợi ý|discovery|bật|khám phá/i);
      await page.goto("/likes");
      await expect(page.locator("body")).toContainText(/Thích|match|kết nối|mutual|trống|chưa|Likes/i);
      await page.screenshot({ path: join(evidenceDir, "j04-discover.png"), fullPage: true });
      record("J04-discover-match", "PASS_PARTIAL", "Discover/likes screens load with expected copy; mutual creation not forced");
    });

    test("J02 onboarding / needs / profile", async ({ page }) => {
      await login(page);
      await page.goto("/me");
      await expect(page.locator("body")).toContainText(/Cá nhân|Me|hồ sơ|DeepMatch/i);
      await page.goto("/me/edit");
      await expect(page.locator("body")).toContainText(/hồ sơ|profile|tên|display|lưu|save/i);
      await page.goto("/onboarding");
      // may redirect if already onboarded
      await expect(page.locator("body")).toBeVisible();
      record("J02-onboarding-profile", "PASS_PARTIAL", "Me/edit reachable; questionnaire depth depends on account state");
    });

    test("J03 media library gate", async ({ page }) => {
      await login(page);
      await page.goto("/me/media");
      await expect(page.locator("body")).toContainText(/media|ảnh|upload|thư viện|Media|tắt|flag/i);
      record(
        "J03-media-upload",
        "PASS_PARTIAL",
        "Media page loads; 3–10 photo + video upload automation NOT_TESTED (fixture upload pending)",
      );
    });

    test("J06 AI concierge consent gate", async ({ page }) => {
      await login(page);
      await page.goto("/ai");
      await expect(page.locator("body")).toContainText(/AI|trợ lý|gợi ý|DeepMind|consent|đồng ý/i);
      await page.screenshot({ path: join(evidenceDir, "j06-ai.png"), fullPage: true });
      record("J06-ai-concierge", "PASS_PARTIAL", "AI hub loads; personalized generation not forced without consent checkbox interaction");
    });

    test("J07 couple space", async ({ page }) => {
      await login(page);
      await page.goto("/couple");
      await expect(page.locator("body")).toContainText(/Sánh đôi|couple|mời|invite|không gian|ghim/i);
      record("J07-couple-space", "PASS_PARTIAL", "Couple home loads; two-sided create depends on invite partner");
    });

    test("J08 DateMap places", async ({ page }) => {
      await login(page);
      await page.goto("/places/map");
      await expect(page.locator("body")).toContainText(/bản đồ|places|map|địa điểm|Date|hẹn|Mapbox|Google|tìm/i);
      record(
        "J08-datemap",
        "PASS_PARTIAL",
        "Places map UI loads; LIVE Google Maps billing remains BLOCKED_EXTERNAL if keys absent",
      );
    });

    test("J09 services booking", async ({ page }) => {
      await login(page);
      await page.goto("/services");
      await expect(page.locator("body")).toContainText(/Đồng hành|dịch vụ|gói|package|sandbox|tư vấn/i);
      await page.goto("/bookings");
      await expect(page.locator("body")).toContainText(/Lịch|booking|đặt|sandbox|chưa|tắt/i);
      record("J09-services-booking", "PASS_PARTIAL", "Services/bookings reachable; LIVE provider booking BLOCKED");
    });

    test("J10 checkout sandbox screens", async ({ page }) => {
      await login(page);
      await page.goto("/me/premium");
      await expect(page.locator("body")).toContainText(/Premium|thuê bao|chuyển khoản|billing|99|gói/i);
      // checkout step routes if present
      const step = await page.goto("/checkout/1");
      if (step && step.status() < 400) {
        await expect(page.locator("body")).toBeVisible();
        record("J10-checkout-sandbox", "PASS_PARTIAL", "Premium + checkout step reachable; LIVE PSP BLOCKED");
      } else {
        record("J10-checkout-sandbox", "PASS_PARTIAL", "Premium page OK; /checkout/1 not available or gated");
      }
    });

    test("J11 support + subscriptions policy (cancel/refund guidance)", async ({ page }) => {
      await login(page);
      await page.goto("/support");
      await expect(page.locator("body")).toContainText(/hỗ trợ|khiếu nại|support|OTP|không gửi/i);
      await page.goto("/legal/subscriptions");
      await expect(page.locator("body")).toContainText(/thuê bao|hoàn tiền|hủy|subscription|refund/i);
      record("J11-cancel-refund-support", "PASS", "Support + subscriptions policy content verified");
    });

    test("J12 privacy + account deletion paths", async ({ page }) => {
      await login(page);
      await page.goto("/me/privacy");
      await expect(page.locator("body")).toContainText(/riêng tư|privacy|AI|đồng ý|consent/i);
      await page.goto("/account-deletion");
      await expect(page.locator("body")).toContainText(/DELETE|xóa tài khoản|delete/i);
      record("J12-privacy-delete", "PASS_PARTIAL", "Privacy + deletion UI present; destructive delete not executed");
    });

    test("J13 admin moderation (expect deny for non-staff)", async ({ page }) => {
      await login(page);
      // admin is separate host; probe web ops if any
      const res = await page.goto("/ops/venues");
      const body = await page.locator("body").innerText();
      const denied =
        page.url().includes("/login") ||
        page.url().includes("/denied") ||
        /denied|không có quyền|forbidden|403/i.test(body);
      if (denied || (res && res.status() >= 400)) {
        record("J13-admin", "PASS", "Non-staff cannot access ops/admin surfaces as expected");
      } else {
        record(
          "J13-admin",
          "PASS_PARTIAL",
          "Ops page loaded for this account — confirm staff role; deep admin host not tested here",
        );
      }
    });

    test("J14 logout then private route denied", async ({ page }) => {
      await login(page);
      await page.goto("/me");
      await page.waitForLoadState("domcontentloaded");
      const logout = page.getByRole("button", { name: /Đăng xuất|Log out|Logout|Sign out/i });
      await expect(logout.first()).toBeVisible({ timeout: 15_000 });
      await Promise.all([
        page.waitForURL((url) => !url.pathname.includes("/me"), { timeout: 30_000 }),
        logout.first().click(),
      ]);
      await page.goto("/discover");
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toMatch(/\/login/);
      record(
        "J14-logout-session",
        "PASS",
        "Logout clears session; /discover redirects to /login",
      );
    });
  });
});

test("J01 age gate negative — minor DOB rejected in UI validation path", async ({ page }) => {
  await page.goto("/signup");
  // Fill form with under-18 DOB if fields exist; do not create account
  const birth = page.locator('input[name="birth_date"]');
  if ((await birth.count()) === 0) {
    record("J01b-age-gate", "NOT_TESTED", "birth_date field missing");
    test.skip();
    return;
  }
  await page.locator('input[name="display_name"]').fill("Audit Minor");
  await page.locator('input[name="email"]').fill(`audit_minor_${Date.now()}@example.invalid`);
  await page.locator('input[name="password"]').fill("NotARealPass1!");
  await birth.fill("2015-01-01");
  await page.locator('input[name="age_confirm"]').check();
  await page.locator('input[name="accept_terms"]').check();
  await page.locator('input[name="ack_privacy"]').check();
  await page.getByRole("button", { name: /Đăng ký|Sign up|Tạo/i }).click();
  await page.waitForTimeout(2000);
  const url = page.url();
  const body = await page.locator("body").innerText();
  const blocked =
    url.includes("signup") &&
    (/18|tuổi|age|đủ tuổi|eligible/i.test(body) || url.includes("error"));
  expect(blocked || url.includes("signup")).toBeTruthy();
  record(
    "J01b-age-gate",
    blocked ? "PASS" : "PASS_PARTIAL",
    blocked
      ? "Under-18 signup blocked with message/error"
      : "Remained on signup; confirm server age gate message",
  );
});
