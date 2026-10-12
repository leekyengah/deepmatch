import { test, expect } from "@playwright/test";

const email = process.env.QA_EMAIL_A || process.env.E2E_EMAIL;
const password = process.env.QA_PASSWORD || process.env.E2E_PASSWORD;
const hasCreds = Boolean(email && password);

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: /Đăng nhập/i }).click();
  await page.waitForURL(/\/(me|discover|onboarding|chat|couple|$)/, {
    timeout: 30_000,
  });
}

test.describe("QA seeded journeys", () => {
  test.skip(!hasCreds, "Set QA_EMAIL_A/QA_PASSWORD or E2E_*");

  test("discover + likes + services reachable after login", async ({ page }) => {
    await login(page);

    await page.goto("/discover");
    await expect(page.locator("body")).toContainText(/Tìm nhau|gợi ý|discovery|bật/i);

    await page.goto("/likes");
    await expect(page.locator("body")).toContainText(/Thích|match|kết nối|mutual|trống|chưa/i);

    await page.goto("/services");
    await expect(page.locator("body")).toContainText(/Đồng hành|dịch vụ|tư vấn|tắt/i);

    await page.goto("/bookings");
    await expect(page.locator("body")).toContainText(/Lịch hẹn|đăng ký|tiếp nhận|tắt|chưa/i);

    await page.goto("/couple/map");
    await expect(page.locator("body")).toContainText(/ghim|bản đồ|Chúng mình|mời|Mapbox|lớp/i);
  });

  test("chat with seeded conversation query", async ({ page }) => {
    await login(page);
    const conv = process.env.QA_CONVERSATION_ID;
    await page.goto(conv ? `/chat?c=${conv}` : "/chat");
    await expect(page.locator("body")).not.toContainText("Chat đang tắt");
    await expect(page.locator("body")).toContainText(/Chat|Trò chuyện|tin|mutual|Tìm nhau/i);
  });
});
