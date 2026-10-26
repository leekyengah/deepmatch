import fs from "fs";
import path from "path";

const root = process.cwd();
const outDir = path.join(root, "docs/evidence/remediation-w1-2026-10-26");

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

const dmIds = Array.from({ length: 375 }, (_, i) => `DM-${String(i + 1).padStart(3, "0")}`);
const scanRoots = [path.join(root, "docs"), path.join(root, ".ai")];
const files = scanRoots.flatMap((d) => walk(d)).filter((f) => /\.(md|json|txt)$/i.test(f));

const hit = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  for (const m of t.matchAll(/DM-(\d{3})\b/g)) hit.add(`DM-${m[1]}`);
}

const dedicated = files.filter((f) => /[/\\]DM-\d+/i.test(f) && f.endsWith(".md"));
const missing = dmIds.filter((id) => !hit.has(id));

const extTool = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/d-D-N-C-NG-NGH-DEEPMATCH/agent-tools/7c333165-3b16-4705-aae8-9f4812007ffd.txt",
);
const extValues = JSON.parse(fs.readFileSync(extTool, "utf8")).values.slice(1);
const done = [];
const doneNoIdFile = [];
for (const r of extValues) {
  const id = r[0];
  const status = r[8];
  if (!String(id || "").startsWith("EXT-")) continue;
  if (!/hoàn thành|done|complete/i.test(String(status || ""))) continue;
  done.push(id);
  const has = files.some((f) => f.includes(id));
  if (!has) doneNoIdFile.push(id);
}

const out = {
  at: new Date().toISOString(),
  dm: {
    masterCount: 375,
    mentionedInDocsAi: hit.size,
    missingMentionCount: missing.length,
    missingSample: missing.slice(0, 60),
    dedicatedDmMdCount: dedicated.length,
    dedicatedSample: dedicated.slice(0, 40).map((f) => path.relative(root, f)),
  },
  ext: {
    doneStatusCount: done.length,
    doneWithoutExtIdFilename: doneNoIdFile.length,
    doneWithoutExtIdFilenameSample: doneNoIdFile.slice(0, 50),
    note: "Wave docs (EXT-S0-S1…) may cover many IDs without per-ID filenames — attach evidence URL on each Done row.",
  },
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "FIX26-002-003-map.json"), JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      dmMentioned: out.dm.mentionedInDocsAi,
      dmMissing: out.dm.missingMentionCount,
      dedicatedMd: out.dm.dedicatedDmMdCount,
      extDone: out.ext.doneStatusCount,
      extDoneNoIdFile: out.ext.doneWithoutExtIdFilename,
    },
    null,
    2,
  ),
);
