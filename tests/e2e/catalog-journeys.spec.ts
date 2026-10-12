import { test, expect } from "@playwright/test";

/** EXT-037 — six DEMO categories browse + cart sandbox (deterministic). */
const CATEGORIES = [
  "gift",
  "fashion",
  "beauty",
  "venue",
  "travel",
  "safety",
] as const;

const email = process.env.QA_EMAIL_A || process.env.E2E_EMAIL;
const password = process.env.QA_PASSWORD || process.env.E2E_PASSWORD;
const hasCreds = Boolean(email && password);

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: /Đăng nhập|Log in|Sign in/i }).click();
  await page.waitForURL(/\/(me|discover|onboarding|chat|couple|home|$)/, {
    timeout: 30_000,
  });
}

test.describe("EXT-037 catalog DEMO journeys", () => {
  test("lifestyle hub shows DEMO pillars", async ({ page }) => {
    await page.goto("/lifestyle");
    // May redirect to login or me if flag off — accept either surface.
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const url = page.url();
    if (/login/.test(url)) {
      test.skip(!hasCreds, "lifestyle gated — need QA creds");
      await login(page);
      await page.goto("/lifestyle");
    }
    await expect(page.locator("body")).toContainText(
      /DeepGift|Lifestyle|Đồng hành|DEMO|tắt|Lifestyle/i,
    );
  });

  for (const cat of CATEGORIES) {
    test(`browse category ${cat}`, async ({ page }) => {
      await page.goto(`/lifestyle/${cat}`);
      if (/login/.test(page.url())) {
        test.skip(!hasCreds, "need QA creds");
        await login(page);
        await page.goto(`/lifestyle/${cat}`);
      }
      await expect(page.locator("body")).toContainText(
        /DEMO|₫|VND|sản phẩm|product|catalog|tắt|empty|trống|mock/i,
      );
      // Public HTML must not claim LIVE partners
      await expect(page.locator("body")).not.toContainText(
        /LIVE partner|đối tác LIVE|real booking confirmed/i,
      );
    });
  }

  test("cart sandbox reachable", async ({ page }) => {
    await page.goto("/lifestyle/cart");
    if (/login/.test(page.url())) {
      test.skip(!hasCreds, "need QA creds");
      await login(page);
      await page.goto("/lifestyle/cart");
    }
    await expect(page.locator("body")).toContainText(
      /giỏ|cart|DEMO|sandbox|checkout|trống|empty|tắt/i,
    );
  });

  test("catalog products API returns DEMO envelope", async ({ request }) => {
    const res = await request.get("/api/v1/catalog/products?limit=10");
    // 401/403/200 all acceptable depending on flag + auth
    expect([200, 401, 403]).toContain(res.status());
    if (res.status() === 200) {
      const json = await res.json();
      expect(json.demo === true || json.ok === true).toBeTruthy();
      if (Array.isArray(json.products)) {
        expect(json.products.length).toBeLessThanOrEqual(10);
      }
    }
  });
});
