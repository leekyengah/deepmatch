import { test, expect } from "@playwright/test";

/**
 * AUD-AUTH-01 regression: unauthenticated HTML routes must redirect to login.
 * Does not treat HTTP-only presence of a page body as PASS.
 */
const privatePaths = [
  "/discover",
  "/chat",
  "/me",
  "/likes",
  "/couple",
  "/home",
  "/services",
  "/bookings",
  "/ai",
  "/lifestyle",
  "/places/map",
];

test.describe("private route session gate", () => {
  for (const path of privatePaths) {
    test(`direct navigation ${path} → login?next=`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const encodedNext = encodeURIComponent(path);
      await expect(page).toHaveURL((url) => {
        return (
          url.pathname === "/login" &&
          url.searchParams.get("next") === path
        );
      });
      expect(page.url()).toContain(`next=${encodedNext}`);
      // Login shell may render VI or EN depending on Accept-Language / cookie.
      await expect(
        page
          .getByRole("heading", { name: /Đăng nhập|Sign in|Log in/i })
          .or(page.locator("body").getByText(/Đăng nhập|Sign in|Log in/i).first()),
      ).toBeVisible();
      await expect(
        page.locator('input[name="email"], input[type="email"]').first(),
      ).toBeVisible();
    });
  }

  test("refresh on gated URL keeps login redirect", async ({ page }) => {
    await page.goto("/discover", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?next=%2Fdiscover/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?next=%2Fdiscover/);
  });

  test("browser history back from login does not expose discover shell", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.goto("/discover", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?next=%2Fdiscover/);
    await page.goBack();
    // Either public home or still gated — never authenticated discover content
    await expect(page.locator("body")).not.toContainText(/Bật discovery|Gợi ý hôm nay/i);
    const url = page.url();
    expect(url.includes("/discover") && !url.includes("/login")).toBeFalsy();
  });

  test("public routes remain reachable", async ({ page }) => {
    for (const path of ["/", "/login", "/signup", "/legal", "/faq", "/support"]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.status() ?? 0).toBeLessThan(400);
      await expect(page).not.toHaveURL(/\/login\?next=/);
    }
  });
});
