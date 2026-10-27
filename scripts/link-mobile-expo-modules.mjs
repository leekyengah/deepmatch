/**
 * Ensure Expo config plugins resolve under apps/mobile (npm workspaces hoist).
 * Idempotent junctions (Win) / symlinks → root node_modules. No lockfile edits.
 */
import { existsSync, lstatSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mobileNm = join(root, "apps", "mobile", "node_modules");
const rootNm = join(root, "node_modules");

const pkgs = [
  "@expo",
  "expo",
  "expo-router",
  "expo-constants",
  "expo-font",
  "expo-image-picker",
  "expo-linking",
  "expo-secure-store",
  "expo-splash-screen",
  "expo-status-bar",
  "expo-symbols",
  "expo-updates",
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
      if (existsSync(join(dst, "package.json")) || name === "@expo") {
        return { name, status: "ok-existing" };
      }
      const st = lstatSync(dst);
      if (st.isSymbolicLink() || (st.isDirectory() && name === "@expo")) {
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

// Monorepo: keep a single React copy at repo root (web 19.3 / metro alias).
// Nested apps/mobile/node_modules/react@19.2.3 triggers expo-doctor duplicates.
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
const linked = results.filter((r) => r.status.startsWith("linked")).length;
const failed = results.filter((r) => r.status.startsWith("fail"));
console.log(
  `link-mobile-expo-modules: linked=${linked} failed=${failed.length} total=${results.length}`,
);
for (const r of results.filter((x) => x.status !== "ok-existing" && x.status !== "skip-missing-root")) {
  console.log(`  ${r.status} ${r.name}${r.detail ? ` (${r.detail.trim()})` : ""}`);
}
if (failed.length) process.exitCode = 1;
