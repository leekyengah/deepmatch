/**
 * P1 closure — authenticated customer UI leak scan (staging only).
 * Env: QA_EMAIL_A + QA_PASSWORD (or E2E_*).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const base = (process.env.PLAYWRIGHT_BASE_URL || "https://datingvn.com").replace(
  /\/$/,
  "",
);
const email =
  process.env.QA_EMAIL_A ||
  process.env.QA_COUPLE_A_EMAIL ||
  process.env.E2E_EMAIL;
const password =
  process.env.QA_PASSWORD ||
  process.env.QA_PASSWORD_A ||
  process.env.E2E_PASSWORD;

if (!email || !password) {
  console.error("Missing QA credentials");
  process.exit(1);
}

const BAD = [
  /SANDBOX_ONLY/i,
  /\bDEMO Partner\b/i,
  /Fictional seed/i,
  /Synthetic Mebertes/i,
  /BLOCKED_EXTERNAL/i,
  /LIVE PSP/i,
  /\bEXT-\d{3}\b/,
  /sandbox_succeed/i,
  /sandbox_fail/i,
  /service_role/i,
  /Maps key/i,
  /\bRLS\b/,
  /\bR2\b/,
  /PSP LIVE/i,
];

const ROUTES = [
  "/home",
  "/discover",
  "/lifestyle",
  "/lifestyle/gift",
  "/checkout/confirm",
  "/me/premium",
  "/ai",
  "/couple",
  "/services",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
});
const hits = [];

await page.goto(`${base}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.fill("input[type=email], input[name=email]", email);
await page.fill("input[type=password], input[name=password]", password);
await page.click("button[type=submit]");
await page.waitForTimeout(2800);
console.log("after_login", page.url());

for (const path of ROUTES) {
  await page.goto(`${base}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  });
  await page.waitForTimeout(900);
  const text = await page.locator("body").innerText();
  const found = BAD.filter((re) => re.test(text)).map(String);
  if (found.length) {
    hits.push({ path, found, snippet: text.slice(0, 280) });
    console.log("FAIL", path, found.join(", "));
  } else {
    console.log("PASS", path);
  }
}

// Negative auth error: wrong password should not echo supabase internals
await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.fill("input[type=email], input[name=email]", email);
await page.fill("input[type=password], input[name=password]", "wrong-password-p1-scan");
await page.click("button[type=submit]");
await page.waitForTimeout(2000);
const loginErr = await page.locator("body").innerText();
const authLeak = [/supabase/i, /AuthApiError/i, /status code/i, /JWT/i].filter(
  (re) => re.test(loginErr),
);
if (authLeak.length) {
  hits.push({ path: "/login#bad-password", found: authLeak.map(String) });
  console.log("FAIL /login bad-password", authLeak.join(", "));
} else {
  console.log("PASS /login bad-password sanitized");
}

const outDir = "docs/evidence/full-product-audit-2026-10-27";
mkdirSync(outDir, { recursive: true });
const out = {
  at: new Date().toISOString(),
  base,
  email,
  hitCount: hits.length,
  hits,
};
writeFileSync(`${outDir}/11_MEMBER_LEAKAGE_PW.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ hitCount: hits.length }, null, 2));
await browser.close();
process.exit(hits.length ? 1 : 0);
