import { test, expect } from "@playwright/test";

/**
 * Runs only when E2E_EMAIL + E2E_PASSWORD are set (seeded staging user).
 */
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const hasCreds = Boolean(email && password);

test.describe("authenticated chat gate", () => {
  test.skip(!hasCreds, "Set E2E_EMAIL and E2E_PASSWORD to run");

  test("login then open chat shell", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(email!);
    await page.locator('input[name="password"]').fill(password!);
    await page.getByRole("button", { name: /Đăng nhập/i }).click();

    await page.waitForURL(/\/(me|discover|onboarding|chat|$)/, { timeout: 30_000 });
    await page.goto("/chat");
    await expect(page.locator("body")).not.toContainText("Chat đang tắt");
    await expect(page.locator("body")).toContainText(/Chat|Trò chuyện|mutual|Tìm nhau/i);
  });
});
