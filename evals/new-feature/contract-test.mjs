#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const skill = read("skills/new-feature/SKILL.md");
const merge = read("skills/new-feature/references/persistence-and-merge.md");
const loop = read("skills/new-feature/references/tdd-loop.md");
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
check(merge.includes("short-lived branch/worktree") && merge.includes("second explicit confirmation"), "post-merge truth persistence missing");
check(merge.includes("If Bash is unavailable") && merge.includes("If no equivalent scan can execute"), "portable secrets-scan fallback missing");
check(/Sonnet-class or stronger/.test(rules) && /Haiku-class/.test(rules), "empirical Claude model routing missing");

for (const file of [
  "skills/new-feature/scripts/next-spec-number.sh",
  "skills/new-feature/scripts/secrets-check.sh",
  "skills/new-feature/assets/spec-template.md",
  "skills/new-feature/assets/plan-template.md",
  "skills/new-feature/assets/tasks-template.md",
  "skills/new-feature/assets/checklist-template.md"
]) check(existsSync(join(root, file)), `missing vendored runtime file: ${file}`);

if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exit(1);
}
console.log(`new-feature contract: PASS (${checks} safety/packaging checks)`);
