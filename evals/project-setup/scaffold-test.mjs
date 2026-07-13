#!/usr/bin/env node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = mkdtempSync(join(tmpdir(), "project-setup-scaffold-"));
let checks = 0;
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: false });
  checks += 1;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  return result;
};
const raw = (command, args, cwd = root) => spawnSync(command, args, { cwd, encoding: "utf8", shell: false });
const runNpm = (args, cwd) => process.platform === "win32"
  ? run(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", ...args], cwd)
  : run("npm", args, cwd);
const rawNpm = (args, cwd) => process.platform === "win32"
  ? raw(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", ...args], cwd)
  : raw("npm", args, cwd);
try {
  run(process.execPath, ["evals/project-setup/build-fixture.mjs", target]);
  run(process.execPath, ["skills/wf-setup/scripts/check-bootstrap.mjs", target]);
  runNpm(["install", "--ignore-scripts"], target);
  const red = rawNpm(["test"], target);
  checks += 1;
  if (red.status === 0 || !`${red.stdout}\n${red.stderr}`.includes("CLI reports readiness")) {
    throw new Error("first-outcome test did not produce meaningful red");
  }
  writeFileSync(join(target, "src/cli.mjs"), "console.log('signal-lamp-ready');\n");
  runNpm(["test"], target);
  runNpm(["run", "lint"], target);
  const ready = runNpm(["start"], target);
  checks += 1;
  if (!ready.stdout.includes("signal-lamp-ready")) throw new Error("readiness output missing");
  const probe = runNpm(["run", "readiness"], target);
  checks += 1;
  if (!probe.stdout.includes("readiness-probe-ok")) throw new Error("distinct readiness probe failed");
  console.log(`project-setup scaffold: PASS (${checks} deterministic checks; red then green)`);
} finally {
  rmSync(target, { recursive: true, force: true });
}
