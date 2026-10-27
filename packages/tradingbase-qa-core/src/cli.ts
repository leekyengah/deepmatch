/**
 * Thin CLI entry. Project-specific wiring lives in @deepmatch/qa (or other adapters).
 * Usage (via deepmatch wrapper): tb-qa --help
 */
import { assertAutomatedTransition, canTransition } from "./status-machine.js";
import type { LifecycleState } from "./types.js";

const args = process.argv.slice(2);

function help() {
  console.log(`TradingBase Universal QA Core CLI

Commands:
  status-check <from> <to>   Validate lifecycle transition
  version

Project runs are invoked via adapter CLIs, e.g.:
  npm run qa:deepmatch -- --suite p0
`);
}

if (args[0] === "version" || args.includes("--version")) {
  console.log("@tradingbase/qa-core 1.0.0");
  process.exit(0);
}

if (args[0] === "status-check") {
  const from = args[1] as LifecycleState;
  const to = args[2] as LifecycleState;
  if (!from || !to) {
    console.error("usage: status-check <from> <to>");
    process.exit(2);
  }
  try {
    assertAutomatedTransition(from, to);
    console.log(`OK automated: ${from} → ${to}`);
  } catch (err) {
    if (canTransition(from, to)) {
      console.error(`HUMAN_ONLY: ${from} → ${to} (${(err as Error).message})`);
      process.exit(3);
    }
    console.error(`INVALID: ${(err as Error).message}`);
    process.exit(2);
  }
  process.exit(0);
}

help();
