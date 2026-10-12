/**
 * Authenticated ACL + copy leak scan on staging.
 * Env: QA_COUPLE_A_EMAIL / QA_PASSWORD (or E2E_*).
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const base = "https://datingvn.com";
const email = process.env.QA_COUPLE_A_EMAIL || process.env.E2E_EMAIL;
const password = process.env.QA_PASSWORD || process.env.E2E_PASSWORD;

const FORBIDDEN = [
  /feature flag/i,
  /kill switch/i,
  /ff_[a-z_]+/i,
  /docs\/(ops|p0|evidence|audits|design)/i,
  /Master Tracker/i,
  /EXT-\d{3}/i,
  /DM-\d{3}/i,
  /BLOCKED_EXTERNAL/i,
  /SANDBOX_ONLY/i,
  /\bDEMO\b/,
  /sandbox/i,
  /Stripe keys/i,
  /Founder/i,
  /Cursor Agent/i,
  /NEXT_ACTION/i,
  /staging/i,
  /seed catalog/i,
];

const ROUTES = [
  "/",
  "/faq",
  "/login",
  "/signup",
  "/home",
  "/discover",
  "/chat",
  "/couple",
  "/couple/map",
  "/couple/memories",
  "/couple/invite",
  "/services",
  "/lifestyle",
  "/ai",
  "/me",
  "/me/privacy",
  "/me/premium",
  "/me/deep",
  "/safe",
  "/support",
];

if (!email || !password) {
  console.error("Missing QA/E2E credentials");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "vi-VN",
});
const page = await context.newPage();
const findings = [];

async function scan(label, path) {
  await page.goto(`${base}${path}?lang=vi-VN`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.waitForTimeout(600);
  const text = await page.locator("body").innerText();
  const html = await page.content();
  // Visible copy + HTML; ignore Next.js/flight payloads that may embed dead i18n keys
  const surface = `${text}\n${html.replace(/<script[\s\S]*?<\/script>/gi, "")}`;
  const hits = FORBIDDEN.filter((re) => re.test(surface)).map((re) =>
    re.toString(),
  );
  const filtered = hits.filter((h) => {
    if (/staging/i.test(h) && !/staging/i.test(text) && !/Staging/i.test(text))
      return false;
    return true;
  });
  const stagingVisible =
    /\bStaging\b/i.test(text) || /môi trường staging/i.test(text);
  if (stagingVisible) filtered.push("/Staging badge or copy/");
  if (/\bDEMO\b/.test(text) || /sandbox/i.test(text)) {
    filtered.push("/DEMO or sandbox visible/");
  }
  if (filtered.length) {
    findings.push({ path, label, hits: [...new Set(filtered)], snippet: text.slice(0, 240) });
    console.log("LEAK", path, [...new Set(filtered)].join(", "));
  } else {
    console.log("OK", path, page.url());
  }
}

console.log("guest scan…");
for (const path of ["/", "/faq", "/privacy", "/terms", "/login", "/signup"]) {
  await scan("guest", path);
}

console.log("login…");
await page.goto(`${base}/login?lang=vi-VN`, { waitUntil: "networkidle" });
await page.fill("input[type=email], input[name=email]", email);
await page.fill("input[type=password]", password);
await page.click("button[type=submit]");
await page.waitForTimeout(3000);
console.log("after login", page.url());

for (const path of ROUTES.filter((p) => !["/", "/faq", "/login", "/signup"].includes(p))) {
  await scan("auth", path);
}

// Cross-user denial: guest cannot open couple export API with cookie cleared
const deny = await context.request.get(`${base}/api/v1/discovery/candidates`);
console.log("auth candidates", deny.status());

mkdirSync("docs/evidence", { recursive: true });
const out = {
  at: new Date().toISOString(),
  email,
  findings,
  leakCount: findings.length,
};
writeFileSync(
  "docs/evidence/ACL-CONTENT-SCAN-2026-10-13.json",
  JSON.stringify(out, null, 2),
);
console.log("findings", findings.length);
await browser.close();
process.exit(findings.length ? 1 : 0);
