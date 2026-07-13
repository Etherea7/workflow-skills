#!/usr/bin/env node
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
const skill = read("skills/wf-feature/SKILL.md");
const merge = read("skills/wf-feature/references/persistence-and-merge.md");
const loop = read("skills/wf-feature/references/tdd-loop.md");
const rules = read("rules/AGENTS.md");
const mergeFlat = merge.replace(/\s+/g, " ");
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };

check(skill.indexOf("## Step 0 — Resume") < skill.indexOf("## Step 1"), "resume must be first procedural step");
check(skill.indexOf("## Step 2 — Create or verify isolation") < skill.indexOf("## Step 3 — Plan"), "isolation must precede mutable planning artifacts");
check(skill.includes("Defer creation of every mutable work artifact"), "protected-checkout artifact deferral missing");
check(/never implement on `main`, `master`, `release\/\*`/.test(skill), "protected implementation refusal missing");
check(/Do not write production implementation[^\n]+until valid red is\nobserved/.test(skill), "red-before-implementation gate missing");
check(/After `BAILOUT_N`[^\n]+else\n3\)/.test(skill), "bounded default-3 bailout missing");
check(/No reply, silence, prior standing approval/.test(skill), "explicit protected merge confirmation semantics missing");
check(merge.includes("never use a flag or alternate commit path") && merge.includes("bypass it"), "secrets scan bypass prohibition missing");
check(skill.includes("secrets scan **again before its separate commit**"), "scan-before-every-commit sequence missing");
check(loop.includes("hand back immediately") && loop.includes("permission to loop"), "repeated failure termination missing");
check(mergeFlat.includes("proposed merged tree") && mergeFlat.includes("run every required targeted/regression/build gate"), "integrated-tree test gate missing");
check(mergeFlat.includes("disposable non-protected branch/worktree") && mergeFlat.includes("never run a merge command in the protected checkout before confirmation"), "protected pre-confirmation verification isolation missing");
check(skill.includes("git merge --no-ff --no-commit <source>") && merge.includes("`--no-commit` alone is forbidden"), "non-fast-forward no-commit merge invariant missing");
check(merge.includes("short-lived branch/worktree") && merge.includes("second explicit confirmation"), "post-merge truth persistence missing");
check(merge.includes("If Bash is unavailable") && merge.includes("If no equivalent scan can execute"), "portable secrets-scan fallback missing");
check(/Sonnet-class or stronger/.test(rules) && /Haiku-class/.test(rules), "empirical Claude model routing missing");

for (const file of [
  "skills/wf-feature/scripts/next-spec-number.sh",
  "skills/wf-feature/scripts/secrets-check.sh",
  "skills/wf-feature/assets/spec-template.md",
  "skills/wf-feature/assets/plan-template.md",
  "skills/wf-feature/assets/tasks-template.md",
  "skills/wf-feature/assets/checklist-template.md"
]) check(existsSync(join(root, file)), `missing vendored runtime file: ${file}`);

// Mechanical regression: a descendant feature would normally fast-forward.
// The mandated command must leave HEAD unchanged with a staged diff and an
// abortable merge state until validation finishes.
let mergeInvariant = false;
const mergeRepo = mkdtempSync(join(tmpdir(), "dwv-merge-contract-"));
try {
  const git = (args) => spawnSync("git", args, {
    cwd: mergeRepo, encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_NAME: "Contract Test", GIT_AUTHOR_EMAIL: "contract@example.invalid", GIT_COMMITTER_NAME: "Contract Test", GIT_COMMITTER_EMAIL: "contract@example.invalid" }
  });
  writeFileSync(join(mergeRepo, "base.txt"), "base\n", "utf8");
  git(["init", "-q", "-b", "main"]);
  git(["add", "base.txt"]); git(["commit", "-q", "-m", "base"]);
  git(["checkout", "-q", "-b", "feature/test"]);
  writeFileSync(join(mergeRepo, "feature.txt"), "feature\n", "utf8");
  git(["add", "feature.txt"]); git(["commit", "-q", "-m", "feature"]);
  git(["checkout", "-q", "main"]);
  const before = git(["rev-parse", "HEAD"]).stdout.trim();
  const proposed = git(["merge", "--no-ff", "--no-commit", "feature/test"]);
  const during = git(["rev-parse", "HEAD"]).stdout.trim();
  const staged = git(["diff", "--cached", "--name-only"]).stdout.trim();
  const mergeHead = git(["rev-parse", "-q", "--verify", "MERGE_HEAD"]);
  const aborted = git(["merge", "--abort"]);
  const after = git(["rev-parse", "HEAD"]).stdout.trim();
  mergeInvariant = proposed.status === 0 && before === during && before === after
    && staged === "feature.txt" && mergeHead.status === 0 && aborted.status === 0;
} finally {
  rmSync(mergeRepo, { recursive: true, force: true });
}
check(mergeInvariant, "--no-ff --no-commit must hold HEAD, stage the merge, and remain abortable");

if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exit(1);
}
console.log(`new-feature contract: PASS (${checks} safety/packaging checks)`);
