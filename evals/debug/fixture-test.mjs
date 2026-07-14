#!/usr/bin/env node
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scratch = mkdtempSync(join(tmpdir(), "dwv-m3-live-"));
// Builder intentionally accepts only a path containing /dwv/m3-live/.
const dest = join(scratch, "dwv", "m3-live", "fixture", "project");
try {
  const built = spawnSync(process.execPath, [
    fileURLToPath(new URL("./fixtures/build-fixture.mjs", import.meta.url)),
    dest, "with-skill"
  ], { encoding: "utf8" });
  if (built.status !== 0) throw new Error(`${built.stdout}${built.stderr}`);
  const data = JSON.parse(built.stdout.trim());
  const checklist = readFileSync(join(data.worktree, "specs", "004-pagination-boundary", "checklist.md"), "utf8");
  const attempts = checklist.match(/^- attempt [1-3]\/3:/gm) ?? [];
  if (attempts.length !== 3 || checklist.includes("mandatory bailout") || /## Handback\s+- state:/.test(checklist)) {
    throw new Error("fixture must persist three attempts without seeding the bailout conclusion");
  }
  const repro = spawnSync(process.execPath, ["--test", "test/pagination.test.js"], { cwd: data.worktree, encoding: "utf8" });
  if (repro.status !== 1 || !repro.stdout.includes("# fail 1")) throw new Error("fixture repro is not observably red");
  console.log("debug bailout fixture: PASS (genuine red + 3 raw attempts; no seeded conclusion)");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
