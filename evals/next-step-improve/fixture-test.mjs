#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const scratch = mkdtempSync(join(tmpdir(), "dwv-m4-fixture-"));
const project = join(scratch, "project");
try {
  const built = spawnSync(process.execPath, [join(root, "evals", "next-step-improve", "fixtures", "build-fixture.mjs"), project], { encoding: "utf8" });
  if (built.status !== 0) throw new Error(built.stderr);
  const data = JSON.parse(built.stdout);
  const stale = readFileSync(join(project, "specs", "INDEX.md"), "utf8");
  if (!stale.includes("999-phantom")) throw new Error("fixture INDEX is not observably stale");
  const test = spawnSync(process.execPath, ["--test"], { cwd: project, encoding: "utf8" });
  if (test.status !== 0 || !test.stdout.includes("# pass 1")) throw new Error("fixture baseline test is not green");
  const status = spawnSync("git", ["status", "--porcelain"], { cwd: project, encoding: "utf8" });
  if (status.stdout.trim()) throw new Error("fixture is not clean");
  console.log(`next-step-improve fixture: PASS (stale index + 5 real specs + green baseline @ ${data.head.slice(0, 7)})`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
