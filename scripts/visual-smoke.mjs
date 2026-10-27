/**
 * Public visual smoke for Love Map 4 screens + checkout gate.
 *   node scripts/visual-smoke.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const base = (process.env.E2E_BASE_URL || "https://datingvn.com").replace(
  /\/$/,
  "",
);

const screens = [
  {
    id: "LM-01",
    path: "/places/map",
    expect: ["Khám phá địa điểm hẹn", "mẫu", "Hà Nội"],
  },
  {
    id: "LM-02",
    path: "/places/top?city=" + encodeURIComponent("Hà Nội"),
    expect: ["Top điểm hẹn", "Bayesian", "score"],
  },
  {
    id: "LM-03",
    path: "/places/hn-cafe-01",
    expect: ["Góc Yên", "OpenStreetMap", "Đánh giá"],
  },
  {
    id: "LM-04",
    path: "/couple/map",
    expect: ["Sánh đôi", "Mapbox", "Mời kết nối"],
  },
  {
    id: "PAY-01",
    path: "/checkout/confirm?package=CMP-01",
    expectStatus: [307, 302, 200],
    expectLocation: "/login",
  },
];

const results = [];
for (const s of screens) {
  const res = await fetch(`${base}${s.path}`, { redirect: "manual" });
  const loc = res.headers.get("location") || "";
  let html = "";
  if (res.status === 200) html = await res.text();
  const missing = (s.expect || []).filter(
    (needle) => !html.toLowerCase().includes(needle.toLowerCase()),
  );
  const statusOk = s.expectStatus
    ? s.expectStatus.includes(res.status)
    : res.status === 200;
  const locOk = s.expectLocation
    ? loc.includes(s.expectLocation)
    : true;
  const ok =
    statusOk &&
    locOk &&
    (s.expectStatus ? true : missing.length === 0 || missing.length < 2);
  results.push({
    id: s.id,
    path: s.path,
    status: res.status,
    location: loc || null,
    missing,
    ok,
  });
  console.log(
    `${ok ? "PASS" : "FAIL"} ${s.id} ${res.status} ${s.path}${loc ? " -> " + loc : ""}${missing.length ? " missing=" + missing.join("|") : ""}`,
  );
}

let commit = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  /* ignore */
}

const pass = results.filter((r) => r.ok).length;
const report = {
  runId: `VISUAL-SMOKE-${new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)}`,
  timestampUtc: new Date().toISOString(),
  environment: base,
  commit,
  pass,
  fail: results.length - pass,
  results,
  notes:
    "HTML marker smoke + checkout auth gate. Pixel overlay vs Drive mockup still human-reviewed. Screenshots under docs/evidence/visual/ when captured.",
};

mkdirSync("docs/evidence", { recursive: true });
writeFileSync(
  "docs/evidence/VISUAL_SMOKE_LATEST.json",
  JSON.stringify(report, null, 2),
);
console.log(`\nPASS ${pass}/${results.length} → docs/evidence/VISUAL_SMOKE_LATEST.json`);
process.exit(pass === results.length ? 0 : 1);
