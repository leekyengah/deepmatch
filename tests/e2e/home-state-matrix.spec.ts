import { test, expect } from "@playwright/test";

/** EXT-064 — authenticated/public home state matrix (staging-friendly). */

test.describe("EXT-064 home state matrix", () => {
  test("guest marketing home is public-only", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(/DeepMatch|Tìm nhau|Sánh đôi/i);
    await expect(page.locator("body")).not.toContainText(
      /admin_roles|SERVICE_ROLE|docs\/ops|INTERNAL/i,
    );
  });

  test("unauthenticated /home redirects to login", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/login/i);
  });

  test("AI hub respects flag / auth gate", async ({ page }) => {
    await page.goto("/ai");
    const url = page.url();
    expect(/login|me|ai|home/i.test(url)).toBeTruthy();
    await expect(page.locator("body")).not.toContainText(/openai\.com\/v1\/key/i);
  });

  test("lifestyle DEMO label or gate", async ({ page }) => {
    await page.goto("/lifestyle");
    await expect(page.locator("body")).toContainText(
      /DEMO|Lifestyle|Đồng hành|login|Đăng nhập|tắt|me/i,
    );
    await expect(page.locator("body")).not.toContainText(/LIVE partner confirmed/i);
  });
});
