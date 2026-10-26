#!/usr/bin/env node
/**
 * Start web (Next) + mobile (Expo Go) with separate log prefixes.
 * Does not kill unrelated Node processes. Skips Expo if port 8081 is busy.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

function run(name, command, args, color) {
  const child = spawn(command, args, {
    cwd: root,
    shell: true,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const prefix = (stream) => (chunk) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (!line) continue;
      process[stream].write(`${color}[${name}]\x1b[0m ${line}\n`);
    }
  };
  child.stdout.on("data", prefix("stdout"));
  child.stderr.on("data", prefix("stderr"));
  child.on("exit", (code, signal) => {
    console.log(`[dev-all] ${name} exited code=${code} signal=${signal ?? ""}`);
  });
  return child;
}

const children = [];

async function main() {
  console.log("[dev-all] starting web on :3000 and Expo Go (LAN)…");
  children.push(run("web", "npm", ["run", "dev:web"], "\x1b[36m"));

  const metroBusy = await portOpen(8081);
  if (metroBusy) {
    console.log(
      "[dev-all] port 8081 already in use — not starting a second Metro. Attach Expo Go to the existing server.",
    );
  } else {
    children.push(run("mobile", "npm", ["run", "dev:mobile"], "\x1b[35m"));
  }

  const shutdown = () => {
    for (const c of children) {
      try {
        c.kill("SIGTERM");
      } catch {
        /* ignore */
      }
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
