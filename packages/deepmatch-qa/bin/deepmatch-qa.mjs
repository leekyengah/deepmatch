#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

try {
  const tsx = require.resolve("tsx/esm/api", {
    paths: [resolve(__dirname, ".."), resolve(__dirname, "../../..")],
  });
  const { register } = await import(pathToFileURL(tsx).href);
  register();
} catch {
  /* optional */
}

await import(pathToFileURL(resolve(__dirname, "../src/cli.ts")).href);
