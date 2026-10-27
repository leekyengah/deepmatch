import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../../..");
const dmIds = Array.from({ length: 375 }, (_, i) => `DM-${String(i + 1).padStart(3, "0")}`);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(md|json|ts|tsx|mjs)$/i.test(ent.name)) acc.push(p);
  }
  return acc;
}

const files = walk(path.join(root, "docs")).concat(
  walk(path.join(root, ".ai")).filter((f) => f.endsWith(".json") || f.endsWith(".md")),
);
const hit = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  for (const m of t.matchAll(/DM-(\d{3})/g)) hit.add(`DM-${m[1]}`);
}
const dedicated = fs
  .readdirSync(path.join(root, "docs"), { recursive: true })
  .map(String)
  .filter((f) => /DM-\d+/i.test(f) && f.endsWith(".md"));

const mentioned = dmIds.filter((id) => hit.has(id));
const missing = dmIds.filter((id) => !hit.has(id));

const extRaw = fs.readFileSync(
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/d-D-N-C-NG-NGH-DEEPMATCH/agent-tools/7c333165-3b16-4705-aae8-9f4812007ffd.txt",
  ),
  "utf8",
);
const extJson = JSON.parse(extRaw);
const rows = extJson.values.slice(1);
const done = [];
const doneNoEvidenceHint = [];
for (const r of rows) {
  const [id, , , , deliverable, , , , status] = r;
  if (!id || !String(id).startsWith("EXT-")) continue;
  const st = String(status || "");
  if (/hoàn thành|done|complete/i.test(st)) {
    done.push({ id, status: st, deliverable: deliverable || "" });
    const evFiles = walk(path.join(root, "docs/evidence")).filter(
      (f) => f.includes(id) || path.basename(f).includes(id),
    );
    if (evFiles.length === 0) doneNoEvidenceHint.push(id);
  }
}

const out = {
  at: new Date().toISOString(),
  dm: {
    masterCount: dmIds.length,
    mentionedInDocs: mentioned.length,
    missingMentionSample: missing.slice(0, 50),
    missingCount: missing.length,
    dedicatedMdPaths: dedicated.slice(0, 80),
  },
  ext: {
    doneCount: done.length,
    doneSample: done.slice(0, 20),
    doneWithoutIdNamedEvidenceFile: doneNoEvidenceHint,
    note: "Evidence may live in wave markdown without EXT-id filename — PMO should attach evidence URL per Done row",
  },
};
fs.writeFileSync(new URL("./FIX26-002-003-map.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      dmMaster: out.dm.masterCount,
      dmMentioned: out.dm.mentionedInDocs,
      dmMissing: out.dm.missingCount,
      extDone: out.ext.doneCount,
      extDoneNoIdFile: out.ext.doneWithoutIdNamedEvidenceFile.length,
    },
    null,
    2,
  ),
);
