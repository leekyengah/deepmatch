#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

async function main() {
  try {
    const tsx = require.resolve("tsx/esm/api", {
      paths: [resolve(__dirname, ".."), resolve(__dirname, "../../..")],
    });
    const { register } = await import(pathToFileURL(tsx).href);
    register();
  } catch {
    /* tsx may already be registered by npm exec */
  }
  const cli = resolve(__dirname, "../src/cli.ts");
  await import(pathToFileURL(cli).href);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
