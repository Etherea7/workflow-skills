#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
const skill = read("skills/project-setup/SKILL.md");
const flat = skill.replace(/\s+/g, " ");
const safety = read("skills/project-setup/references/target-safety.md").replace(/\s+/g, " ");
const loop = read("skills/project-setup/references/dev-loop-verification.md").replace(/\s+/g, " ");
const persist = read("skills/project-setup/references/persistence-and-default-branch.md").replace(/\s+/g, " ");
const checklist = read("skills/project-setup/assets/bootstrap-checklist-template.md");
const agents = read("skills/project-setup/assets/project-AGENTS-template.md");
const claude = read("skills/project-setup/assets/project-CLAUDE-template.md");
const triggers = JSON.parse(read("evals/project-setup/trigger-evals.json"));
const holdout = JSON.parse(read("evals/project-setup/trigger-holdout.json"));
const evals = JSON.parse(read("evals/project-setup/evals.json"));
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };

check(skill.indexOf("## Step 0 — Resume") < skill.indexOf("## Step 1 — Establish target safety"), "resume must be first");
check(skill.indexOf("## Step 1 — Establish target safety") < skill.indexOf("## Step 2 — Resolve requirements"), "target safety must precede requirements writes");
check(skill.indexOf("## Step 2 — Resolve requirements") < skill.indexOf("## Step 3 — Create bootstrap isolation"), "requirements must precede isolation artifacts");
check(skill.indexOf("## Step 3 — Create bootstrap isolation") < skill.indexOf("## Step 4 — Scaffold"), "isolation must precede scaffold");
check(skill.indexOf("## Step 4 — Scaffold") < skill.indexOf("## Step 5 — Prove the development loop"), "scaffold must precede dev-loop proof");
check(skill.indexOf("## Step 5 — Prove the development loop") < skill.indexOf("## Step 7 — Persist"), "dev-loop proof must precede persistence");
check(flat.includes("setup/000-bootstrap") && flat.includes("not on `main`, `master`, or `release/*`"), "non-protected bootstrap branch rule missing");
check(flat.includes("Never orphan, rename, or rewrite an existing branch"), "existing branch history safety missing");
check(flat.includes("Refuse destructive clearing") && flat.includes("blind generator overwrite"), "destructive target guard missing");
check(safety.includes("reparse point") && safety.includes("unrelated parent repository"), "Windows/parent target safety missing");
check(flat.includes("Invoke `plan`") && flat.includes("Do not scaffold through ambiguity"), "plan composition missing");
check(flat.includes("first effective line is `@AGENTS.md`") && flat.includes("shared rules belong only in `AGENTS.md`"), "thin CLAUDE contract missing");
check(flat.includes("Never use a force/overwrite flag"), "generator collision guard missing");
check(flat.includes("Subagent or generator claims are not verification"), "independent scaffold inspection missing");
check(loop.includes("Tests must exercise observable project behavior"), "meaningful-test reference missing");
check(flat.includes("Valid red") && flat.includes("Only after observing valid red may the behavior be implemented"),
  "first-outcome red-before-implementation rule missing");
check(flat.includes("Starting a process without probing readiness is not a verified run"), "readiness probe requirement missing");
check(flat.includes("terminate any process you started"), "process cleanup requirement missing");
check(flat.includes("After `BAILOUT_N` genuinely different failed attempts") && flat.includes("leave every commit gate unchecked"), "bounded setup bailout missing");
check(flat.includes("check-bootstrap.mjs <target>"), "structural checker invocation missing");
check(flat.includes("check-commit-readiness.mjs <target>") && flat.includes("Checklist text is not proof of execution"),
  "honest evidence-shape preflight contract missing");
check(flat.includes("**do not stage or commit**"), "hard pre-commit refusal missing");
check(flat.includes("staged `scripts/secrets-check.sh`") || flat.includes("vendored `scripts/secrets-check.sh`"), "vendored scanner requirement missing");
check(flat.includes("separate truth commit"), "initial-hash truth commit missing");
check(persist.includes("Creating `main` at the verified setup tip is still a protected-branch action"), "protected default-branch gate missing");
check(persist.includes("Never configure or push a remote") && persist.includes("publish a package"), "external side-effect boundary missing");
check(flat.includes("No prior approval") && flat.includes("or silence authorizes creating or updating protected"),
  "silence must not authorize protected action");

check(agents.includes("docs/CONSTITUTION.md") && agents.includes("## Commands") && agents.includes("## Stack"), "AGENTS core project rules missing");
check(agents.includes("BAILOUT_N") && agents.includes(".worktrees/NNN-slug"), "AGENTS bailout/worktree policy missing");
check(agents.includes("specs/NNN-slug") && agents.includes("Update `docs/`"), "AGENTS artifacts/docs policy missing");
check(claude.replace(/<!--[\s\S]*?-->/g, "").split("\n").map((line) => line.trim()).find(Boolean) === "@AGENTS.md",
  "CLAUDE first effective line must import AGENTS");
check(checklist.includes("## Development-loop gates — all required before any commit"), "checklist commit gate heading missing");
check(checklist.indexOf("Install/restore:") < checklist.indexOf("First-outcome red:"),
  "dependency restore must precede executing first-outcome red");
for (const gate of ["Install/restore", "Tests", "Lint/format", "Typecheck", "Build/package", "Run", "Readiness"]) {
  check(checklist.includes(`- [ ] ${gate}:`), `checklist missing ${gate}`);
}
check(checklist.includes("Initial commit verified") && checklist.includes("Completion truth prepared"), "checklist persistence evidence missing");
check(checklist.includes("First-outcome red"), "checklist red evidence gate missing");
check(checklist.includes("protected-branch state") && checklist.includes("no commit permitted"), "checklist no-commit handback missing");

for (const file of [
  "skills/project-setup/agents/openai.yaml",
  "skills/project-setup/scripts/check-bootstrap.mjs",
  "skills/project-setup/scripts/check-commit-readiness.mjs",
  "skills/project-setup/scripts/secrets-check.sh",
  "skills/project-setup/references/target-safety.md",
  "skills/project-setup/references/requirements-and-stack.md",
  "skills/project-setup/references/dev-loop-verification.md",
  "skills/project-setup/references/persistence-and-default-branch.md",
  "skills/project-setup/assets/project-AGENTS-template.md",
  "skills/project-setup/assets/project-CLAUDE-template.md",
  "skills/project-setup/assets/constitution-template.md",
  "skills/project-setup/assets/bootstrap-spec-template.md",
  "skills/project-setup/assets/bootstrap-plan-template.md",
  "skills/project-setup/assets/bootstrap-tasks-template.md",
  "skills/project-setup/assets/bootstrap-checklist-template.md",
  "skills/project-setup/assets/INDEX-template.md",
  "evals/project-setup/scaffold-test.mjs",
  "evals/project-setup/commit-gate-test.mjs",
  "evals/project-setup/resume-test.mjs",
  "evals/project-setup/completion-state-test.mjs",
  "evals/project-setup/trigger-evals.json",
  "evals/project-setup/trigger-holdout.json",
  "evals/project-setup/evals.json"
]) check(existsSync(join(root, file)), `missing project-setup file: ${file}`);

check(read("scripts/secrets-check.sh") === read("skills/project-setup/scripts/secrets-check.sh"), "vendored secrets scanner drift");
const readiness = read("skills/project-setup/scripts/check-commit-readiness.mjs");
check(readiness.includes("Tests gate can never be N/A") && readiness.includes("HEAD already exists"),
  "readiness regression guards missing");
const structural = read("skills/project-setup/scripts/check-bootstrap.mjs");
check(structural.includes("bootstrap status must agree") && structural.includes("done bootstrap cannot contain unchecked items"),
  "completion status/unchecked-item consistency guards missing");
check(persist.includes("Git-for-Windows Bash") && persist.includes("fail closed"), "Bash fallback/fail-closed scan missing");
check(triggers.length === 15 && triggers.filter(({ should_trigger }) => should_trigger).length === 7, "calibration trigger balance drift");
check(holdout.length === 6 && holdout.filter(({ should_trigger }) => should_trigger).length === 3, "holdout trigger balance drift");
check(evals.evals.length === 3 && evals.evals.every(({ assertions }) => assertions.length === 6), "behavior eval shape drift");
check(evals.methodology.includes("no model uplift claim"), "honest eval limitation missing");

if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exit(1);
}
console.log(`project-setup contract: PASS (${checks} workflow/packaging checks)`);
