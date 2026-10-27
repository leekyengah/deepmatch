import { test, expect } from "@playwright/test";

const FORBIDDEN = [
  /Môi trường staging/i,
  /Feature flags/i,
  /docs\/ops\//i,
  /docs\/evidence\//i,
  /docs\/audits\//i,
  /Master Tracker/i,
  /EXT-\d{3}/,
  /DM-\d{3}/,
  /LEAK-\d{2}/,
  /service[_-]?role/i,
  /SUPABASE_SERVICE_ROLE/i,
  /sk_live_/,
  /NEXT_ACTION\.md/,
];

test.describe("JOURNEY 12 — public no-leak", () => {
  for (const path of ["/", "/faq", "/privacy", "/terms"]) {
    test(`${path} has no internal markers`, async ({ page }) => {
      await page.goto(path);
      const html = await page.content();
      for (const re of FORBIDDEN) {
        expect(html, `leak pattern ${re} on ${path}`).not.toMatch(re);
      }
      await expect(page.locator("body")).not.toContainText(/Môi trường staging/i);
    });
  }

  test("home hero CTA present", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Mỗi kết nối|Every connection/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Tạo tài khoản|Create account|Khám phá DeepMatch|Explore DeepMatch/i }).first()).toBeVisible();
  });

  test("sensitive paths do not expose reports", async ({ request }) => {
    for (const path of ["/.env", "/.git/config", "/.ai/NEXT_ACTION.md"]) {
      const res = await request.get(path);
      const text = await res.text();
      expect(text).not.toMatch(/SUPABASE_SERVICE_ROLE|AUTONOMOUS_EXECUTION/i);
    }
  });
});
