/**
 * Triage npm audit JSON into severity buckets + fix recommendations.
 * Usage: node scripts/_audit_vuln_triage.mjs [path-to-audit.json]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const input =
  process.argv[2] ||
  "docs/evidence/audit-2026-10-13/phase2/npm-audit-prod.json";
const outDir = "docs/evidence/audit-2026-10-13/phase2";
mkdirSync(outDir, { recursive: true });

let raw = readFileSync(input, "utf8");
// PowerShell Out-File may add BOM
if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error("Failed to parse", input, e.message);
  process.exit(1);
}

const vulns = data.vulnerabilities || {};
const rows = [];

for (const [name, v] of Object.entries(vulns)) {
  const via = Array.isArray(v.via) ? v.via : [];
  const advisories = via.filter((x) => typeof x === "object" && x !== null);
  const range = v.range || "";
  const fixAvailable = v.fixAvailable;
  let disposition = "accepted_transitive";
  let action = "Monitor; avoid major Expo/RN force upgrade without validation";

  if (fixAvailable === true) {
    disposition = "patchable_same_major";
    action = `npm audit fix (non-force) for ${name}`;
  } else if (fixAvailable && typeof fixAvailable === "object") {
    const isMajor = Boolean(fixAvailable.isSemVerMajor);
    disposition = isMajor ? "blocked_major_upgrade" : "patchable_named";
    action = isMajor
      ? `BLOCKED major → ${fixAvailable.name}@${fixAvailable.version}`
      : `Upgrade ${fixAvailable.name}@${fixAvailable.version}`;
  }

  const severity = v.severity || "unknown";
  const title = advisories[0]?.title || name;
  const url = advisories[0]?.url || "";
  const cwe = (advisories[0]?.cwe || []).join(";");
  const cvss = advisories[0]?.cvss?.score ?? "";

  rows.push({
    package: name,
    severity,
    isDirect: Boolean(v.isDirect),
    range,
    effects: (v.effects || []).slice(0, 8).join(" | "),
    title,
    url,
    cwe,
    cvss,
    disposition,
    action,
    fixAvailable: JSON.stringify(fixAvailable ?? false),
  });
}

const order = { critical: 0, high: 1, moderate: 2, low: 3, info: 4, unknown: 5 };
rows.sort(
  (a, b) =>
    (order[a.severity] ?? 9) - (order[b.severity] ?? 9) ||
    a.package.localeCompare(b.package),
);

const counts = {};
const disp = {};
for (const r of rows) {
  counts[r.severity] = (counts[r.severity] || 0) + 1;
  disp[r.disposition] = (disp[r.disposition] || 0) + 1;
}

const md = [];
md.push("# npm vulnerability triage (prod omit=dev)");
md.push("");
md.push(`Source: \`${input}\``);
md.push(`Generated: ${new Date().toISOString()}`);
md.push("");
md.push("## Counts by severity");
md.push("");
for (const [k, v] of Object.entries(counts)) md.push(`- ${k}: ${v}`);
md.push("");
md.push("## Disposition");
md.push("");
for (const [k, v] of Object.entries(disp)) md.push(`- ${k}: ${v}`);
md.push("");
md.push("## Inventory");
md.push("");
md.push(
  "| Package | Sev | Direct | Disposition | Action | Advisory |",
);
md.push("|---|---|---|---|---|---|");
for (const r of rows) {
  md.push(
    `| ${r.package} | ${r.severity} | ${r.isDirect} | ${r.disposition} | ${r.action.replace(/\|/g, "/")} | ${r.url || r.title} |`,
  );
}

writeFileSync(join(outDir, "VULN_TRIAGE.md"), md.join("\n") + "\n", "utf8");
writeFileSync(join(outDir, "vuln-triage.json"), JSON.stringify({ counts, disp, rows }, null, 2), "utf8");
console.log(JSON.stringify({ total: rows.length, counts, disp }, null, 2));
