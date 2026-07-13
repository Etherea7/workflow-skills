#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const skill = read("skills/next-step-improve/SKILL.md");
const indexRef = read("skills/next-step-improve/references/index-contract.md");
const priority = read("skills/next-step-improve/references/survey-and-prioritization.md");
const decomposition = read("skills/next-step-improve/references/decomposition.md");
const persistence = read("skills/next-step-improve/references/persistence.md");
const checklist = read("skills/next-step-improve/assets/checklist-template.md");
const generator = read("skills/next-step-improve/scripts/regenerate-index.mjs");
const secrets = read("scripts/secrets-check.sh");
const description = skill.split("---", 3)[1];
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };

check(skill.split("\n").length < 500, "SKILL.md must stay below 500 lines");
check(skill.indexOf("## Step 0") < skill.indexOf("## Step 1"), "resume must be first");
check(skill.indexOf("## Step 1") < skill.indexOf("## Step 2"), "isolation must precede index write");
check(skill.indexOf("## Step 2") < skill.indexOf("## Step 3"), "index refresh must precede survey");
check(skill.indexOf("## Step 3") < skill.indexOf("## Step 4"), "evidence must precede ranking");
check(skill.indexOf("## Step 4") < skill.indexOf("## Step 5"), "ranking must precede choice");
check(skill.indexOf("## Step 5") < skill.indexOf("## Step 6"), "choice must precede decomposition");
check(skill.indexOf("## Step 6") < skill.indexOf("## Step 7"), "routing must precede persistence");
check(skill.includes("Never begin implementation from your own recommendation"), "human selection gate missing");
check(skill.includes("second scanned and\nverified truth commit") && skill.includes("Before asking the human"), "pre-choice durable pause sequence missing");
check(skill.includes("at most five proposals") && skill.includes("Recommend exactly one"), "bounded ranking contract missing");
check(skill.includes("improve/NNN-slug") && skill.includes(".worktrees/NNN-slug/"), "numbered isolation contract missing");
check(skill.includes("specs/NNN-slug/spec.md") && skill.includes("checklist.md"), "numbered survey artifact contract missing");
check(skill.includes("Never hand-edit or incrementally patch the index"), "generated index ownership missing");
check(skill.includes("structured return") && skill.includes("orchestrator validation"), "durable delegation evidence missing");
check(skill.includes("one ready increment at a time") && decomposition.includes("new-feature"), "sequential downstream routing missing");
check(decomposition.includes("observed defect") && decomposition.includes("debug"), "defect routing boundary missing");
check(priority.includes("impact + urgency + confidence + (4 - effort)"), "priority scoring contract missing");
check(indexRef.includes("checklist `status`") && indexRef.includes("spec frontmatter"), "status precedence missing");
check(indexRef.includes("byte-identical") && indexRef.includes("--check"), "deterministic index contract missing");
check(persistence.includes("git merge --no-ff --no-commit") && persistence.includes("explicit confirmation"), "safe protected integration missing");
check(persistence.includes("Destination reconciliation after child work") && persistence.includes("only conflict is\nthe generated `specs/INDEX.md`"), "post-child destination reconciliation missing");
check(skill.includes("recorded\n  `BAILOUT_N` evidence-distinct passes"), "configured rerank bailout threshold missing");
check(checklist.includes("human decision: pending") && checklist.includes("Downstream returns"), "choice/child persistence fields missing");
check(checklist.includes("role: explorer") && checklist.includes("orchestrator citation validation"), "delegation asset fields missing");
check(generator.includes("invalid directory truth") && generator.includes("inventorySignature"), "safe render-before-replace guard missing");
check(generator.includes("malformed ${field} list") && generator.includes("self related link"), "structural list/self-link validation missing");
check(generator.includes("checklist.data.updated || spec.data.updated"), "checklist-first updated precedence missing");
check(generator.includes("--check") && generator.includes("index check: STALE"), "non-mutating check mode missing");
check(secrets.includes("git diff failed; refusing to pass") && secrets.includes("pattern matching failed; refusing to pass") && !secrets.includes("git diff --cached -U0 --no-color | grep"), "credential scanner does not fail closed");
check(description.includes("what to build, fix, or improve next") && description.includes("prioritized engineering roadmap"), "positive trigger categories missing");
check(description.includes("Do not use for implementing") && description.includes("review-only"), "negative trigger boundaries missing");
check(!/\b(?:Claude|Codex|Sonnet|Haiku|Task tool|Agent tool)\b/.test([skill, indexRef, priority, decomposition, persistence].join("\n")), "host mechanics leaked into portable skill");

for (const file of [
  "skills/next-step-improve/agents/openai.yaml",
  "skills/next-step-improve/assets/INDEX-template.md",
  "skills/next-step-improve/assets/checklist-template.md",
  "skills/next-step-improve/assets/survey-spec-template.md",
  "skills/next-step-improve/scripts/regenerate-index.mjs",
  "skills/next-step-improve/scripts/next-spec-number.sh",
  "skills/next-step-improve/scripts/secrets-check.sh",
  "evals/next-step-improve/index-test.mjs",
  "evals/next-step-improve/reconciliation-test.mjs",
  "evals/next-step-improve/secrets-test.mjs",
  "evals/next-step-improve/fixture-test.mjs",
  "evals/next-step-improve/fixtures/build-fixture.mjs",
  "evals/next-step-improve/fixtures/build-resume-fixture.mjs",
  "evals/next-step-improve/evals.json",
  "evals/next-step-improve/trigger-evals.json",
  "evals/next-step-improve/trigger-holdout.json"
]) check(existsSync(join(root, file)), `missing M4 runtime/eval file: ${file}`);

for (const [canonical, vendored] of [
  ["scripts/next-spec-number.sh", "skills/next-step-improve/scripts/next-spec-number.sh"],
  ["scripts/secrets-check.sh", "skills/next-step-improve/scripts/secrets-check.sh"]
]) check(read(canonical) === read(vendored), `vendored script drift: ${vendored}`);

check(read("skills/next-step-improve/agents/openai.yaml").includes("$next-step-improve"), "UI prompt lost explicit skill token");

if (errors.length) {
  errors.forEach((error) => console.error(`FAIL: ${error}`));
  process.exit(1);
}
console.log(`next-step-improve contract: PASS (${checks} workflow/packaging checks)`);
