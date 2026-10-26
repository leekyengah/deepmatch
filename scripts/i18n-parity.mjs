#!/usr/bin/env node
/**
 * Parity check: every key in vi-VN must exist in en-US (and vice versa),
 * and ICU placeholders must match.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "packages", "i18n", "locales");
const locales = ["vi-VN", "en-US"];

function walk(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") keys.push(...walk(v, p));
    else keys.push(p);
  }
  return keys;
}

function placeholders(s) {
  const set = new Set();
  for (const m of String(s).matchAll(/\{(\w+)(?:,|\})/g)) set.add(m[1]);
  return [...set].sort();
}

function loadLocale(locale) {
  const dir = path.join(root, locale);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const tree = {};
  for (const f of files) {
    const ns = f.replace(/\.json$/, "");
    tree[ns] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  }
  return tree;
}

const trees = Object.fromEntries(locales.map((l) => [l, loadLocale(l)]));
const keySets = Object.fromEntries(
  locales.map((l) => [l, new Set(walk(trees[l]))]),
);

let errors = 0;

function get(tree, dotted) {
  return dotted.split(".").reduce((a, k) => (a == null ? a : a[k]), tree);
}

const allKeys = new Set([...keySets["vi-VN"], ...keySets["en-US"]]);
for (const key of [...allKeys].sort()) {
  for (const locale of locales) {
    if (!keySets[locale].has(key)) {
      console.error(`[MISSING] ${locale}: ${key}`);
      errors++;
    }
  }
  if (keySets["vi-VN"].has(key) && keySets["en-US"].has(key)) {
    const a = placeholders(get(trees["vi-VN"], key));
    const b = placeholders(get(trees["en-US"], key));
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      console.error(
        `[PLACEHOLDER] ${key}: vi=${JSON.stringify(a)} en=${JSON.stringify(b)}`,
      );
      errors++;
    }
  }
}

if (errors) {
  console.error(`\ni18n parity FAILED: ${errors} issue(s)`);
  process.exit(1);
}
console.log(
  `i18n parity OK: ${keySets["vi-VN"].size} keys × ${locales.length} locales`,
);
