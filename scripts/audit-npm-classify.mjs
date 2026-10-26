/**
 * Classify npm audit --omit=dev JSON into severity / fixability report.
 * Usage: node scripts/audit-npm-classify.mjs docs/evidence/audit-2026-10-13/npm-audit-phase2.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const input = resolve(process.argv[2] || "docs/evidence/audit-2026-10-13/npm-audit-phase2.json");
const outDir = resolve("docs/evidence/audit-2026-10-13/phase2");
mkdirSync(outDir, { recursive: true });

const raw = readFileSync(input, "utf8").replace(/^\uFEFF/, "");
const audit = JSON.parse(raw);
const vulns = audit.vulnerabilities || {};
const sevRank = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };

function viaEntries(via) {
  return (via || []).map((v) => {
    if (typeof v === "string") return { dep: v, advisory: null, title: null, url: null, severity: null };
    return {
      dep: v.name || null,
      advisory: v.source ? `GHSA/CVE via ${v.source}` : null,
      cve: Array.isArray(v.cve) ? v.cve.join(",") : v.cve || null,
      title: v.title || null,
      url: v.url || null,
      severity: v.severity || null,
      range: v.range || null,
    };
  });
}

const rows = Object.entries(vulns).map(([name, info]) => {
  const vias = viaEntries(info.via);
  const fix = info.fixAvailable;
  let disposition = "ACCEPTED_TRANSITIVE";
  let reason = "Transitive; no safe non-breaking fix without ecosystem upgrade";
  if (fix === true) {
    disposition = "FIXABLE_SAFE";
    reason = "npm audit fix available without force";
  } else if (fix && typeof fix === "object") {
    if (fix.isSemVerMajor) {
      disposition = "BLOCKED_MAJOR";
      reason = `Force fix would install ${fix.name}@${fix.version} (major/breaking)`;
    } else {
      disposition = "FIXABLE_MINOR";
      reason = `Fix via ${fix.name}@${fix.version}`;
    }
  }
  // Runtime exploitability heuristic for Expo/Metro/dev-toolchain chain
  const toolchain =
    /^(braces|micromatch|metro|@expo|expo|react-native|send|cookie|node-forge|image-size|@react-native)/.test(
      name,
    ) ||
    (info.effects || []).some((e) => /expo|metro|react-native/.test(e));
  const prodSurface = !toolchain && (info.isDirect || (info.effects || []).length === 0);
  return {
    package: name,
    severity: info.severity,
    isDirect: Boolean(info.isDirect),
    range: info.range,
    effects: info.effects || [],
    via: vias,
    fixAvailable: fix,
    disposition,
    reason,
    exploitability:
      info.severity === "critical" || info.severity === "high"
        ? toolchain
          ? "LOW_IN_PROD — build/tooling transitive; not user-facing request path unless attacker controls build inputs"
          : prodSurface
            ? "REVIEW — may touch runtime dependency"
            : "MODERATE — verify call path"
        : "LOW",
    impact:
      vias.map((v) => v.title).filter(Boolean)[0] ||
      `${info.severity} advisory on ${name}`,
  };
});

rows.sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || a.package.localeCompare(b.package));

const bySev = rows.reduce((acc, r) => {
  acc[r.severity] = (acc[r.severity] || 0) + 1;
  return acc;
}, {});
const byDisp = rows.reduce((acc, r) => {
  acc[r.disposition] = (acc[r.disposition] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  source: input,
  metadata: audit.metadata || {},
  counts: { total: rows.length, bySeverity: bySev, byDisposition: byDisp },
  vulnerabilities: rows,
};

writeFileSync(resolve(outDir, "npm-vuln-classification.json"), JSON.stringify(report, null, 2));

const md = [
  "# npm vulnerability classification (omit=dev)",
  "",
  `Generated: ${report.generatedAt}`,
  `Source: \`${input}\``,
  "",
  "## Summary",
  "",
  `- Total packages with advisories: **${rows.length}**`,
  `- Metadata vulns: ${JSON.stringify(audit.metadata?.vulnerabilities || {})}`,
  `- By severity: ${JSON.stringify(bySev)}`,
  `- By disposition: ${JSON.stringify(byDisp)}`,
  "",
  "## Policy",
  "",
  "- Do **not** `npm audit fix --force` if it downgrades Expo/RN major.",
  "- Prefer overrides only when compatible and regression-tested.",
  "- Maps / LIVE PSP / Store keys remain BLOCKED_EXTERNAL (unrelated).",
  "",
  "## Table",
  "",
  "| Package | Sev | Direct | Disposition | Exploitability | Notes |",
  "|---|---|---|---|---|---|",
  ...rows.map(
    (r) =>
      `| ${r.package} | ${r.severity} | ${r.isDirect} | ${r.disposition} | ${r.exploitability.split("—")[0].trim()} | ${r.reason.replace(/\|/g, "/")} |`,
  ),
  "",
];

writeFileSync(resolve(outDir, "NPM_VULN_CLASSIFICATION.md"), md.join("\n"));
console.log(JSON.stringify(report.counts, null, 2));
console.log(`Wrote ${outDir}/NPM_VULN_CLASSIFICATION.md`);
