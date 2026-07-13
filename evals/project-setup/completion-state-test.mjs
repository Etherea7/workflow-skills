#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = mkdtempSync(join(tmpdir(), "project-setup-completion-"));
const checker = join(root, "skills/project-setup/scripts/check-bootstrap.mjs");
let checks = 0;
const expect = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
const run = () => spawnSync(process.execPath, [checker, target], { cwd: root, encoding: "utf8" });
const replace = (relative, pattern, replacement) => {
  const path = join(target, relative);
  writeFileSync(path, readFileSync(path, "utf8").replace(pattern, replacement));
};
try {
  expect(spawnSync(process.execPath, [join(root, "evals/project-setup/build-fixture.mjs"), target], {
    cwd: root, encoding: "utf8",
  }).status === 0, "fixture build failed");
  expect(run().status === 0, "initial in-progress statuses should agree");

  replace("specs/000-bootstrap/spec.md", /^status: in-progress$/m, "status: done");
  const mismatch = run();
  expect(mismatch.status !== 0 && mismatch.stderr.includes("bootstrap status must agree"),
    "status mismatch was not rejected");

  replace("specs/000-bootstrap/checklist.md", /^status: in-progress$/m, "status: done");
  replace("specs/INDEX.md", "| in-progress | project-setup |", "| done | project-setup |");
  const unchecked = run();
  expect(unchecked.status !== 0 && unchecked.stderr.includes("done bootstrap cannot contain unchecked items"),
    "done state with unchecked work was not rejected");

  for (const relative of ["specs/000-bootstrap/spec.md", "specs/000-bootstrap/tasks.md", "specs/000-bootstrap/checklist.md"]) {
    replace(relative, /^- \[ \]/gm, "- [x]");
  }
  replace("specs/INDEX.md", "- 000-bootstrap: bootstrap is in progress; resume from its checklist.",
    "- None. Bootstrap completed locally; protected default branch remains intentionally absent.");
  expect(run().status === 0, "finalized done artifacts should pass structural consistency");
  console.log(`project-setup completion state: PASS (${checks} assertions)`);
} finally {
  rmSync(target, { recursive: true, force: true });
}
