/**
 * Seed synthetic Mebertes cohort (taxonomy from Drive folder/file NAMES only).
 * NEVER imports Excel cell/PII. Discover-visible. Marked cohort=Mebertes for CEO purge.
 *
 *   MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --dry-run
 *   MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --count=50
 *   MEBERTES_ALLOW_SEED=1 node --env-file=.env.local scripts/seed-mebertes.mjs --count=5000
 *
 * Credentials → .ai/mebertes.env.ps1 (gitignored). Resumable by email.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const COHORT = "Mebertes";
const EMAIL_DOMAIN = "deepmatch.test";
const STAGING_HOST = "zzqpvjdyvjarpphqhaze.supabase.co";

const root = dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(
  readFileSync(join(root, "data", "mebertes-taxonomy.json"), "utf8"),
);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const countArg = args.find((a) => a.startsWith("--count="));
const startArg = args.find((a) => a.startsWith("--start="));
const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
const COUNT = Math.max(1, Number(countArg?.split("=")[1] ?? 5000));
const START = Math.max(1, Number(startArg?.split("=")[1] ?? 1));
const CONCURRENCY = Math.max(1, Math.min(8, Number(concurrencyArg?.split("=")[1] ?? 4)));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (process.env.MEBERTES_ALLOW_SEED !== "1") {
  console.error("Refusing: set MEBERTES_ALLOW_SEED=1");
  process.exit(1);
}
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!url.includes(STAGING_HOST)) {
  console.error(
    `Refusing: host must be staging (${STAGING_HOST}). Got ${new URL(url).host}`,
  );
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FIRST = [
  "An", "Bình", "Chi", "Dũng", "Hà", "Hùng", "Khoa", "Lan", "Linh", "Minh",
  "Nam", "Ngọc", "Phương", "Quân", "Quỳnh", "Sơn", "Thảo", "Trang", "Tuấn", "Vy",
  "Yến", "Đức", "Hạnh", "Khánh", "Mai", "Nhi", "Phúc", "Thành", "Uyên", "Vân",
];
const LAST = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
  "Bùi", "Đỗ", "Hồ", "Ngô", "Dương",
];
const JOBS = [
  "Designer", "Engineer", "Teacher", "Marketer", "Analyst", "Chef",
  "Architect", "Nurse", "Founder", "Product",
];
const INTERESTS = [
  ["coffee", "travel"],
  ["fitness", "music"],
  ["books", "cooking"],
  ["hiking", "photography"],
  ["cinema", "art"],
];
const GOALS = [["long_term"], ["dating"], ["friendship"], ["marriage"]];

function pad(n) {
  return String(n).padStart(5, "0");
}

function slugTaxonomy(key) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "cat";
}

function persona(index) {
  const entry = taxonomy.entries[(index - 1) % taxonomy.entries.length];
  const first = FIRST[index % FIRST.length];
  const last = LAST[(index * 7) % LAST.length];
  const age = 22 + (index % 28); // 22..49
  const year = new Date().getFullYear() - age;
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String((index % 27) + 1).padStart(2, "0");
  const email = `mebertes.${pad(index)}.${slugTaxonomy(entry.taxonomy_key)}@${EMAIL_DOMAIN}`;
  return {
    index,
    email,
    displayName: `${first} ${last}`,
    birthDate: `${year}-${month}-${day}`,
    region: entry.region,
    taxonomyKey: entry.taxonomy_key,
    category: entry.category,
    jobTitle: JOBS[index % JOBS.length],
    bio: `Synthetic ${COHORT} · ${entry.region} · ${entry.category}`,
    goals: GOALS[index % GOALS.length],
    interests: INTERESTS[index % INTERESTS.length],
  };
}

async function findByEmail(email) {
  const { data } = await admin
    .from("seed_cohort_registry")
    .select("user_id, email")
    .eq("email", email)
    .maybeSingle();
  if (data?.user_id) return data.user_id;

  // GoTrue admin list filter (orphans after transient fetch fail)
  const res = await fetch(
    `${url}/auth/v1/admin/users?page=1&per_page=200&email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${service}`,
        apikey: service,
      },
    },
  );
  if (!res.ok) return null;
  const body = await res.json();
  const users = body?.users ?? [];
  const hit = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return hit?.id ?? null;
}

async function ensureOne(p, password) {
  let userId = await findByEmail(p.email);
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: p.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: p.displayName,
        birth_date: p.birthDate,
        cohort: COHORT,
        synthetic: true,
      },
    });
    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        userId = await findByEmail(p.email);
        if (!userId) throw new Error(`exists_untracked:${p.email}:${error.message}`);
      } else {
        throw error;
      }
    } else {
      userId = data.user.id;
    }
  } else {
    await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        display_name: p.displayName,
        birth_date: p.birthDate,
        cohort: COHORT,
        synthetic: true,
      },
    });
  }

  const { error: pErr } = await admin.from("profiles").upsert({
    id: userId,
    display_name: p.displayName,
    birth_date: p.birthDate,
    fuzzy_region: p.region,
    job_title: p.jobTitle,
    bio: p.bio,
    mode: "solo",
    discovery_opt_in: true,
    hidden_from_discovery: false,
    suspended: false,
    cohort: COHORT,
  });
  if (pErr) throw pErr;

  await admin.from("profile_deep").upsert({
    user_id: userId,
    goals: p.goals,
    values: ["kindness", "growth"],
    interests: p.interests,
  });

  await admin.from("match_preferences").upsert({
    user_id: userId,
    min_age: 21,
    max_age: 55,
    regions: [p.region],
  });

  const { error: rErr } = await admin.from("seed_cohort_registry").upsert({
    user_id: userId,
    cohort: COHORT,
    email: p.email,
    region: p.region,
    taxonomy_key: p.taxonomyKey,
  });
  if (rErr) throw rErr;

  return userId;
}

async function mapPool(items, limit, fn) {
  let i = 0;
  const out = [];
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return out;
}

const vaultPath = join(root, "..", ".ai", "mebertes.env.ps1");
mkdirSync(join(root, "..", ".ai"), { recursive: true });
let password = process.env.MEBERTES_PASSWORD;
if (!password && existsSync(vaultPath)) {
  const prev = readFileSync(vaultPath, "utf8");
  const m = prev.match(/\$env:MEBERTES_PASSWORD\s*=\s*"([^"]+)"/);
  if (m) password = m[1];
}
if (!password) {
  password = `DmMeb!${randomBytes(12).toString("hex")}`;
}

const end = START + COUNT - 1;
const plan = [];
for (let i = START; i <= end; i++) plan.push(persona(i));

console.log(
  JSON.stringify(
    {
      dryRun,
      cohort: COHORT,
      start: START,
      end,
      count: plan.length,
      taxonomyEntries: taxonomy.entries.length,
      host: new URL(url).host,
      sample: plan.slice(0, 3).map((p) => ({
        email: p.email,
        region: p.region,
        category: p.category,
      })),
    },
    null,
    2,
  ),
);

if (dryRun) {
  process.exit(0);
}

// Verify migration applied
{
  const { error } = await admin.from("seed_cohort_registry").select("user_id").limit(1);
  if (error) {
    console.error(
      "seed_cohort_registry missing — apply migration 20261027150000_mebertes_cohort.sql first:",
      error.message,
    );
    process.exit(1);
  }
}

let ok = 0;
let fail = 0;
const failures = [];

await mapPool(plan, CONCURRENCY, async (p) => {
  try {
    await ensureOne(p, password);
    ok += 1;
    if (ok % 50 === 0) {
      console.log(JSON.stringify({ progress: ok, fail, last: p.email }));
    }
  } catch (e) {
    fail += 1;
    failures.push({ email: p.email, error: String(e?.message ?? e) });
    if (failures.length <= 20) {
      console.error(JSON.stringify({ fail: p.email, error: String(e?.message ?? e) }));
    }
  }
});

writeFileSync(
  vaultPath,
  [
    `# Mebertes synthetic cohort — STAGING ONLY — gitignored`,
    `# Created/updated ${new Date().toISOString()}`,
    `$env:MEBERTES_COHORT = "${COHORT}"`,
    `$env:MEBERTES_PASSWORD = "${password}"`,
    `$env:MEBERTES_EMAIL_PATTERN = "mebertes.*.@${EMAIL_DOMAIN}"`,
    `$env:MEBERTES_LAST_SEED_START = "${START}"`,
    `$env:MEBERTES_LAST_SEED_END = "${end}"`,
    `$env:MEBERTES_LAST_SEED_OK = "${ok}"`,
    `$env:MEBERTES_LAST_SEED_FAIL = "${fail}"`,
  ].join("\n") + "\n",
  "utf8",
);

const evidenceDir = join(root, "..", "docs", "evidence", "mebertes-2026-10-27");
mkdirSync(evidenceDir, { recursive: true });
writeFileSync(
  join(evidenceDir, "seed-summary.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      cohort: COHORT,
      start: START,
      end,
      ok,
      fail,
      failures: failures.slice(0, 50),
      note: "Synthetic only; no Drive PII. Password only in .ai/mebertes.env.ps1",
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ ok, fail, vaultPath, cohort: COHORT }, null, 2));
if (fail > 0) process.exit(2);
