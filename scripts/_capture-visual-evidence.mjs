/**
 * Staging visual evidence capture (QA credentials from env).
 * Usage: node scripts/_capture-visual-evidence.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const email = process.env.QA_COUPLE_A_EMAIL;
const password = process.env.QA_PASSWORD;
const out = "docs/evidence/visual-2026-10-13";
mkdirSync(out, { recursive: true });

if (!email || !password) {
  console.error("Missing QA_COUPLE_A_EMAIL / QA_PASSWORD");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "vi-VN",
});
const page = await context.newPage();

await page.goto("https://datingvn.com/login?lang=vi-VN", {
  waitUntil: "networkidle",
});
await page.fill("input[type=email], input[name=email]", email);
await page.fill("input[type=password]", password);
await page.click("button[type=submit]");
await page.waitForTimeout(2500);

const routes = [
  ["/chat", "DATING-04-chat"],
  ["/couple/map", "COUPLE-01-map"],
  ["/couple/memories", "COUPLE-02-memories"],
];

for (const [path, name] of routes) {
  await page.goto(`https://datingvn.com${path}?lang=vi-VN`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  console.log(name, page.url());
}

await browser.close();
