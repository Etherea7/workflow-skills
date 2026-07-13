#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const scratch = mkdtempSync(join(tmpdir(), "dwv-m4-fixture-"));
const builder = join(root, "evals", "next-step-improve", "fixtures", "build-fixture.mjs");
try {
  const heads = [];
  for (const config of ["with-skill", "baseline"]) {
    const project = join(scratch, config);
    const built = spawnSync(process.execPath, [builder, project, config], { encoding: "utf8" });
    if (built.status !== 0) throw new Error(built.stderr);
    const data = JSON.parse(built.stdout);
    heads.push(data.head.slice(0, 7));
    const stale = readFileSync(join(project, "specs", "INDEX.md"), "utf8");
    if (!stale.includes("999-phantom")) throw new Error(`${config} INDEX is not observably stale`);
    const hasSkill = existsSync(join(project, ".agents", "skills", "next-step-improve", "SKILL.md"));
    if (hasSkill !== (config === "with-skill")) throw new Error(`${config} skill installation mismatch`);
    const test = spawnSync(process.execPath, ["--test"], { cwd: project, encoding: "utf8" });
    if (test.status !== 0 || !test.stdout.includes("# pass 1")) throw new Error(`${config} baseline test is not green`);
    const status = spawnSync("git", ["status", "--porcelain"], { cwd: project, encoding: "utf8" });
    if (status.stdout.trim()) throw new Error(`${config} fixture is not clean`);
  }
  console.log(`next-step-improve fixture: PASS (paired stale/green fixtures @ ${heads.join("/")})`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
