/**
 * Classify Master Sheet16 "Hoàn thành" EXT rows vs repo evidence.
 * Does NOT mark VERIFIED — outputs READY_FOR_QA / PARTIAL / NO_ID_EVIDENCE only.
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const sheetPath = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/d-D-N-C-NG-NGH-DEEPMATCH/agent-tools/7c333165-3b16-4705-aae8-9f4812007ffd.txt",
);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(path.join(root, "docs"))
  .concat(walk(path.join(root, ".ai")))
  .filter((f) => /\.(md|json|txt|png)$/i.test(f));

const contentByFile = new Map();
for (const f of files) {
  try {
    contentByFile.set(f, fs.readFileSync(f, "utf8"));
  } catch {
    /* binary skip */
  }
}

function mentions(id) {
  const hits = [];
  for (const [f, t] of contentByFile) {
    if (!t) continue;
    if (t.includes(id) || f.includes(id)) hits.push(path.relative(root, f));
  }
  return hits;
}

const values = JSON.parse(fs.readFileSync(sheetPath, "utf8")).values.slice(1);
const rows = [];
for (const r of values) {
  const id = r[0];
  const status = r[8];
  if (!String(id || "").startsWith("EXT-")) continue;
  if (!/hoàn thành|done|complete/i.test(String(status || ""))) continue;
  const title = r[1] || "";
  const deliverable = r[4] || "";
  const hits = mentions(id);
  const idNamed = hits.filter((h) => h.includes(id));
  const waveOnly = hits.filter((h) => !h.includes(id));
  let bucket = "NO_ID_EVIDENCE";
  if (idNamed.length > 0) bucket = "ID_NAMED_EVIDENCE";
  else if (waveOnly.length > 0) bucket = "WAVE_MENTION_ONLY";
  rows.push({
    id,
    title: String(title).slice(0, 80),
    deliverable: String(deliverable).slice(0, 100),
    bucket,
    evidencePaths: hits.slice(0, 8),
    verdictHint:
      bucket === "ID_NAMED_EVIDENCE"
        ? "READY_FOR_QA"
        : bucket === "WAVE_MENTION_ONLY"
          ? "PARTIAL"
          : "PARTIAL",
    verified: false,
  });
}

const summary = {
  at: new Date().toISOString(),
  doneTotal: rows.length,
  byBucket: {
    ID_NAMED_EVIDENCE: rows.filter((r) => r.bucket === "ID_NAMED_EVIDENCE").length,
    WAVE_MENTION_ONLY: rows.filter((r) => r.bucket === "WAVE_MENTION_ONLY").length,
    NO_ID_EVIDENCE: rows.filter((r) => r.bucket === "NO_ID_EVIDENCE").length,
  },
  note: "No row marked VERIFIED. WAVE_MENTION_ONLY = covered in wave markdown without per-ID file. Attach evidence URL on Master before DONE_VERIFIED.",
  rows,
};

const outDir = path.join(root, "docs/evidence/remediation-w1-2026-10-26");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "EXT-DONE-EVIDENCE-EVAL.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ doneTotal: summary.doneTotal, byBucket: summary.byBucket }, null, 2));
