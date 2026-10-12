import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home and health", async ({ page, request }) => {
    const health = await request.get("/api/v1/health");
    expect(health.ok()).toBeTruthy();
    const body = await health.json();
    expect(body.ok).toBeTruthy();
    expect(body.flags.ff_chat).toBeTruthy();

    await page.goto("/");
    await expect(page.getByAltText(/DeepMatch/i).first()).toBeVisible();
  });

  test("login and signup pages render", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Đăng nhập/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole("link", { name: /Quên mật khẩu/i })).toBeVisible();

    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /Quên mật khẩu/i })).toBeVisible();

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /Tạo tài khoản/i })).toBeVisible();
  });

  test("chat route reachable (auth or shell)", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.locator("body")).toContainText(/Chat|Trò chuyện|Đăng nhập|tắt/i);
  });

  test("discover route reachable", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("body")).toContainText(/Tìm nhau|discovery|tắt/i);
  });

  test("faq guest page reachable", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: /Câu hỏi thường gặp/i })).toBeVisible();
  });
});
