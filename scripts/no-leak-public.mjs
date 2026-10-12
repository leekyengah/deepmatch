/**
 * LEAK-01/04/07/17 — guest public surface scan (deny-by-default canaries).
 *
 *   node scripts/no-leak-public.mjs [baseUrl]
 *   npm run test:no-leak
 */
const base = (process.argv[2] || process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

const FORBIDDEN = [
  /footerStaging/i,
  /Môi trường staging/i,
  /Feature flags/i,
  /docs\/ops\//i,
  /docs\/evidence\//i,
  /docs\/audits\//i,
  /Master Tracker/i,
  /EXT-\d{3}/i,
  /DM-\d{3}/i,
  /LEAK-\d{2}/i,
  /HOME-W\d{2}/i,
  /BLOCKED_EXTERNAL/i,
  /service[_-]?role/i,
  /SUPABASE_SERVICE_ROLE/i,
  /sk_live_/i,
  /sk_test_[A-Za-z0-9]{20,}/i,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\./i,
  /\.env\.local/i,
  /NEXT_ACTION\.md/i,
  /execution-status\.json/i,
  /stack trace/i,
  /approval notes/i,
];

const PATHS = ["/", "/faq", "/privacy", "/terms", "/login", "/signup", "/robots.txt", "/sitemap.xml"];
const SENSITIVE_PROBES = [
  "/.env",
  "/.git/config",
  "/.ai/NEXT_ACTION.md",
  "/docs/audits/DEEPMATCH_AUTONOMOUS_EXECUTION_REPORT.md",
  "/api/v1/admin/users",
];

let failed = 0;

async function checkHtml(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: "text/html,application/xml,text/plain,*/*" },
    redirect: "follow",
  });
  const text = await res.text();
  const hits = FORBIDDEN.filter((re) => re.test(text)).map((re) => re.toString());
  if (hits.length) {
    failed += 1;
    console.error(`FAIL ${path} status=${res.status} leaks=${hits.join(", ")}`);
  } else {
    console.log(`PASS ${path} status=${res.status} bytes=${text.length}`);
  }
}

async function checkProbe(path) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  const ok = res.status === 404 || res.status === 403 || res.status === 401 || res.status === 308 || res.status === 307;
  // Next may rewrite unknown to 200 app shell — body must not contain report contents
  const text = await res.text();
  // Ignore markers that only appear because the request path itself is echoed.
  const bodyLeak =
    /SERVICE_ROLE|Master Tracker|sk_live_/i.test(text) ||
    (/AUTONOMOUS_EXECUTION/i.test(text) && !path.includes("AUTONOMOUS_EXECUTION"));
  if (bodyLeak) {
    failed += 1;
    console.error(`FAIL probe ${path} status=${res.status} body contains sensitive markers`);
  } else if (!ok && res.status === 200 && path.startsWith("/.")) {
    // Serving .env/.git as 200 is a hard fail
    failed += 1;
    console.error(`FAIL probe ${path} unexpectedly 200`);
  } else {
    console.log(`PASS probe ${path} status=${res.status}`);
  }
}

console.log(`no-leak scan base=${base}`);
for (const p of PATHS) {
  try {
    await checkHtml(p);
  } catch (e) {
    failed += 1;
    console.error(`FAIL ${p} ${e.message}`);
  }
}
for (const p of SENSITIVE_PROBES) {
  try {
    await checkProbe(p);
  } catch (e) {
    failed += 1;
    console.error(`FAIL probe ${p} ${e.message}`);
  }
}

if (failed > 0) {
  console.error(`no-leak FAILED (${failed})`);
  process.exit(1);
}
console.log("no-leak PASSED");
