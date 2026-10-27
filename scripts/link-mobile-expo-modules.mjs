/**
 * Ensure Expo config plugins resolve under apps/mobile (npm workspaces hoist).
 * Idempotent junctions (Win) / symlinks → root node_modules. No lockfile edits.
 *
 * Also hardens EAS Android EAGER_BUNDLE: do NOT junction the whole `@expo` scope
 * (that lets post-prebuild `npm install` prune `@expo/json-file`). Instead copy
 * `@expo/json-file` beside expo's nested `@expo/cli`.
 */
import { existsSync, lstatSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mobileNm = join(root, "apps", "mobile", "node_modules");
const rootNm = join(root, "node_modules");

const pkgs = [
  "expo",
  "expo-dev-client",
  "expo-router",
  "expo-constants",
  "expo-font",
  "expo-image-picker",
  "expo-linking",
  "expo-secure-store",
  "expo-splash-screen",
  "expo-status-bar",
  "expo-symbols",
  "expo-web-browser",
  "react-native",
  "react-native-gesture-handler",
  "react-native-reanimated",
  "react-native-safe-area-context",
  "react-native-screens",
  "react-native-web",
  "react-native-worklets",
];

function linkOne(name) {
  const src = join(rootNm, name);
  const dst = join(mobileNm, name);
  if (!existsSync(src)) return { name, status: "skip-missing-root" };
  if (existsSync(dst)) {
    try {
      if (existsSync(join(dst, "package.json"))) {
        return { name, status: "ok-existing" };
      }
      const st = lstatSync(dst);
      if (st.isSymbolicLink()) {
        return { name, status: "ok-existing" };
      }
    } catch {
      /* recreate */
    }
    try {
      rmSync(dst, { recursive: true, force: true });
    } catch {
      return { name, status: "fail-remove" };
    }
  }
  mkdirSync(dirname(dst), { recursive: true });
  if (process.platform === "win32") {
    const r = spawnSync("cmd", ["/c", "mklink", "/J", dst, src], {
      encoding: "utf8",
    });
    if (r.status !== 0) {
      return { name, status: "fail-junction", detail: (r.stderr || r.stdout || "").slice(0, 200) };
    }
    return { name, status: "linked-junction" };
  }
  const r = spawnSync("ln", ["-s", src, dst], { encoding: "utf8" });
  if (r.status !== 0) {
    return { name, status: "fail-symlink", detail: (r.stderr || r.stdout || "").slice(0, 200) };
  }
  return { name, status: "linked-symlink" };
}

mkdirSync(mobileNm, { recursive: true });

// Whole-scope `@expo` junctions confuse npm prune on EAS — remove if present.
const mobileExpoScope = join(mobileNm, "@expo");
if (existsSync(mobileExpoScope)) {
  try {
    const st = lstatSync(mobileExpoScope);
    if (st.isSymbolicLink() || st.isDirectory()) {
      // Only remove if it looks like a scope root (has no single package.json).
      if (!existsSync(join(mobileExpoScope, "package.json"))) {
        rmSync(mobileExpoScope, { recursive: true, force: true });
        console.log("link-mobile-expo-modules: removed whole-scope apps/mobile/node_modules/@expo");
      }
    }
  } catch (e) {
    console.warn("link-mobile-expo-modules: could not remove @expo scope:", e.message);
  }
}

// Monorepo: keep a single React copy at repo root (web 19.3 / metro alias).
for (const name of ["react", "react-dom"]) {
  const nested = join(mobileNm, name);
  if (existsSync(nested)) {
    try {
      rmSync(nested, { recursive: true, force: true });
      console.log(`link-mobile-expo-modules: removed nested ${name}`);
    } catch (e) {
      console.warn(`link-mobile-expo-modules: could not remove ${name}:`, e.message);
    }
  }
}

const results = pkgs.map(linkOne);

function ensureExpoJsonFile() {
  const rootPkg = join(rootNm, "@expo", "json-file");
  const nestPkg = join(rootNm, "expo", "node_modules", "@expo", "json-file");
  const name = "@expo/json-file";

  if (!existsSync(join(rootPkg, "package.json"))) {
    if (process.env.DEEPMATCH_LINK_MOBILE_NESTED === "1") {
      return { name, status: "fail-reinstall", detail: "missing after nested reinstall guard" };
    }
    const r = spawnSync(
      "npm",
      ["install", "@expo/json-file@11.0.1", "--no-save", "--no-fund", "--no-audit", "--ignore-scripts"],
      {
        cwd: root,
        encoding: "utf8",
        shell: process.platform === "win32",
        env: { ...process.env, DEEPMATCH_LINK_MOBILE_NESTED: "1" },
      },
    );
    if (r.status !== 0 || !existsSync(join(rootPkg, "package.json"))) {
      return {
        name,
        status: "fail-reinstall",
        detail: ((r.stderr || r.stdout || "").trim() || "install did not produce package").slice(0, 300),
      };
    }
    console.log("link-mobile-expo-modules: reinstalled @expo/json-file at root");
  }

  if (existsSync(join(nestPkg, "package.json"))) {
    // Prefer a real directory copy over a dangling symlink to a pruned root.
    try {
      const st = lstatSync(nestPkg);
      if (!st.isSymbolicLink()) {
        return { name, status: "ok-existing-nested" };
      }
      rmSync(nestPkg, { recursive: true, force: true });
    } catch {
      /* recreate */
    }
  }

  mkdirSync(dirname(nestPkg), { recursive: true });
  if (existsSync(nestPkg)) {
    try {
      rmSync(nestPkg, { recursive: true, force: true });
    } catch {
      return { name, status: "fail-remove-nested" };
    }
  }
  try {
    cpSync(rootPkg, nestPkg, { recursive: true });
    return { name, status: "copied-nested" };
  } catch (e) {
    return { name, status: "fail-copy-nested", detail: String(e.message || e).slice(0, 200) };
  }
}

results.push(ensureExpoJsonFile());

const linked = results.filter((r) => r.status.startsWith("linked") || r.status.startsWith("copied")).length;
const failed = results.filter((r) => r.status.startsWith("fail"));
console.log(
  `link-mobile-expo-modules: linked=${linked} failed=${failed.length} total=${results.length}`,
);
for (const r of results.filter(
  (x) => x.status !== "ok-existing" && x.status !== "ok-existing-nested" && x.status !== "skip-missing-root",
)) {
  console.log(`  ${r.status} ${r.name}${r.detail ? ` (${r.detail.trim()})` : ""}`);
}
if (failed.length) process.exitCode = 1;
