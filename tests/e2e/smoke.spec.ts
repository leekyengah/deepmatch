import { test, expect } from "@playwright/test";

/** Staging may serve vi-VN or en-US depending on Accept-Language. */
const loginHeading = /Đăng nhập|Sign in|Log in/i;
const signupHeading = /Tạo tài khoản|Create account|Sign up/i;
const forgotHeading = /Quên mật khẩu|Forgot password/i;
const faqHeading = /Câu hỏi thường gặp|Frequently asked questions/i;

test.describe("public smoke", () => {
  test("home and health", async ({ page, request }) => {
    const health = await request.get("/api/v1/health");
    expect(health.ok()).toBeTruthy();
    const body = await health.json();
    expect(body.ok).toBeTruthy();
    expect(body.flags.ff_chat).toBeTruthy();

    await page.goto("/");
    // BrandLogo "full" uses decorative img (alt="") + visible wordmark text.
    await expect(page.getByText("DeepMatch").first()).toBeVisible();
  });

  test("login and signup pages render", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: loginHeading })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole("link", { name: forgotHeading })).toBeVisible();

    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: forgotHeading })).toBeVisible();

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: signupHeading })).toBeVisible();
  });

  test("chat route redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login\?next=%2Fchat/);
    await expect(page.locator("body")).toContainText(loginHeading);
  });

  test("discover route redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/discover");
    await expect(page).toHaveURL(/\/login\?next=%2Fdiscover/);
    await expect(page.locator("body")).toContainText(loginHeading);
  });

  test("faq guest page reachable", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: faqHeading })).toBeVisible();
  });
});
