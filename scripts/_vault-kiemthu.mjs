import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
const u = listed.data.users.find((x) => x.email?.startsWith("qa_kiemthu_mv71b70a"));
if (!u) {
  console.error("user not found");
  process.exit(1);
}
const known = "DmQa!KiemThu14Oct";
await admin.auth.admin.updateUserById(u.id, { password: known, email_confirm: true });
writeFileSync(
  ".ai/qa-kiemthu.env.ps1",
  [
    `$env:QA_KIEMTHU_EMAIL='${u.email}'`,
    `$env:QA_KIEMTHU_ID='${u.id}'`,
    `$env:QA_KIEMTHU_PASSWORD='${known}'`,
    `$env:QA_KIEMTHU_NOTE='hidden_from_discovery=true; purge within 72h after 2026-10-14'`,
    "",
  ].join("\n"),
);
console.log("VAULT_OK", u.email, u.id);
