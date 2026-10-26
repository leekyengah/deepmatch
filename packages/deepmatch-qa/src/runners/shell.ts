import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { redactSecrets } from "@tradingbase/qa-core";

export function runCommand(
  command: string,
  args: string[],
  opts: { cwd: string; env?: NodeJS.ProcessEnv; timeoutMs?: number },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    // node/script args: shell:false (paths with spaces stay intact).
    // npm/npx on Windows: shell:true required (spawn npm.cmd → EINVAL otherwise).
    const isWin = process.platform === "win32";
    const isNpm = command === "npm" || command === "npx";
    const bin = isWin && isNpm ? `${command}.cmd` : command;
    const child = spawn(bin, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      shell: isWin && isNpm,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      stderr += "\n[timeout]";
    }, opts.timeoutMs ?? 180_000);
    child.stdout?.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr?.on("data", (d) => {
      stderr += String(d);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        code: code ?? 1,
        stdout: redactSecrets(stdout),
        stderr: redactSecrets(stderr),
      });
    });
  });
}

export function hasQaCreds(): boolean {
  return Boolean(
    process.env.QA_EMAIL_A &&
      process.env.QA_EMAIL_B &&
      process.env.QA_PASSWORD &&
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
  );
}

export function loadQaEnv(projectRoot: string): void {
  try {
    const envLocal = readFileSync(join(projectRoot, ".env.local"), "utf8");
    for (const line of envLocal.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const m = t.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      let v = m[2] ?? "";
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  } catch {
    /* optional */
  }
  try {
    const raw = readFileSync(join(projectRoot, ".ai/qa.env.ps1"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\$env:([A-Z0-9_]+)="(.*)"$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* optional */
  }
}
