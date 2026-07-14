#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { makeSuite } from "../lib/test-kit.mjs";

const { root, read, check, report } = makeSuite(import.meta.url);
const skill = read("skills/wf-debug/SKILL.md");
const loop = read("skills/wf-debug/references/investigation-loop.md");
const persist = read("skills/wf-debug/references/persistence-and-merge.md");
const checklist = read("skills/wf-debug/assets/checklist-template.md");
const evalSpec = JSON.parse(read("evals/debug/evals.json"));
const liveResults = JSON.parse(read("evals/debug/live-results-i4.json"));
const skillFlat = skill.replace(/\s+/g, " ");
const persistFlat = persist.replace(/\s+/g, " ");

check(skill.indexOf("## Step 0 — Resume") < skill.indexOf("## Step 1"), "resume must be first procedural step");
check(skill.indexOf("## Step 2 — Create or verify isolation") < skill.indexOf("## Step 3 — Reproduce"), "isolation must precede mutable reproduction artifacts");
check(skill.indexOf("## Step 3 — Reproduce") < skill.indexOf("## Step 4 — Gather independent evidence"), "reproduction must precede investigation");
check(skill.indexOf("## Step 4 — Gather independent evidence") < skill.indexOf("## Step 5 — Rank hypotheses"), "independent evidence must precede ranking");
check(skill.indexOf("## Step 5 — Rank hypotheses") < skill.indexOf("## Step 6 — Run the bounded hypothesis loop"), "ranking must precede attempts");
check(skillFlat.includes("Never create a replacement work item to escape a bailout or restart the counter"), "resume counter-reset prohibition missing");
check(skillFlat.includes("Never weaken an existing test or fabricate output"), "reproduction integrity guard missing");
check(skillFlat.includes("do not leak a favored hypothesis"), "independent investigation neutrality missing");
check(skillFlat.includes("persist in the checklist's `Delegation evidence` section") && checklist.includes("orchestrator citation validation"), "durable delegation brief/return evidence missing");
check(skill.includes("Repeating a command") && skill.includes("does not create a new hypothesis"), "genuinely different hypothesis rule missing");
check(skill.includes("After `BAILOUT_N` genuinely different failed hypotheses, do not try another"), "hard bailout boundary missing");
check(skill.includes("diagnosis-only") && skill.includes("Do not create a branch/worktree/checklist") && skill.includes("Stop before mutation"), "non-mutating diagnosis-only path missing");
check(skillFlat.includes("`infrastructure event`, never `attempt N/BAILOUT_N`") && loop.replace(/\s+/g, " ").includes("without incrementing the hypothesis count"), "infrastructure events must not consume hypotheses");
check(loop.includes("do not request permission to silently try N+1"), "N+1 prohibition missing");
check(loop.includes("revert failed speculative production edits") && loop.includes("commit speculative production code"), "clean bailout state missing");
check(loop.includes("supported facts versus inference") && loop.includes("hypotheses remaining"), "findings handback contract missing");
check(skill.includes("exact original reproduction/regression command") && skill.includes("broader regression/build/lint gates"), "independent fix verification missing");
check(persistFlat.includes("git merge --no-ff --no-commit <source>") && persistFlat.includes("`--no-commit` alone is forbidden"), "safe merge formation missing");
check(persist.includes("Only a new explicit confirmation") && persist.includes("Silence"), "protected merge confirmation missing");
check(persistFlat.includes("git worktree list") && persistFlat.includes("If anything is retained"), "cleanup/retained-state reporting missing");
check(checklist.includes("supported facts vs inference") && checklist.includes("remaining hypotheses/evidence needed"), "checklist bailout fields missing");
check(checklist.includes("branch: debug/{{NNN-slug}}") && checklist.includes("base commit: {{hash}}"), "debug isolation identity missing");

for (const file of [
  "skills/wf-debug/scripts/next-spec-number.sh",
  "skills/wf-debug/scripts/secrets-check.sh",
  "skills/wf-debug/assets/checklist-template.md",
  "skills/wf-debug/agents/openai.yaml",
  "evals/debug/evals.json",
  "evals/debug/infrastructure-event-test.mjs",
  "evals/debug/evidence-test.mjs",
  "evals/debug/trigger-evals.json",
  "evals/debug/trigger-holdout.json",
  "evals/debug/evidence/i3-bailout-with-skill.md",
  "evals/debug/evidence/i3-bailout-baseline.md",
  "evals/debug/evidence/i4-success-with-skill.md",
  "evals/debug/evidence/i4-success-baseline.md",
  "evals/debug/evidence/README.md",
  "evals/debug/evidence/artifacts/i3-bailout-with-skill.bundle",
  "evals/debug/evidence/artifacts/i3-bailout-with-skill-executor.txt",
  "evals/debug/evidence/artifacts/i3-bailout-baseline.bundle",
  "evals/debug/evidence/artifacts/i3-bailout-baseline-executor.txt",
  "evals/debug/evidence/artifacts/i4-success-with-skill.bundle",
  "evals/debug/evidence/artifacts/i4-success-with-skill-executor.txt",
  "evals/debug/evidence/artifacts/i4-success-baseline.bundle",
  "evals/debug/evidence/artifacts/i4-success-baseline-executor.txt"
]) check(existsSync(join(root, file)), `missing debug runtime/eval file: ${file}`);

for (const [canonical, vendored] of [
  ["scripts/next-spec-number.sh", "skills/wf-debug/scripts/next-spec-number.sh"],
  ["scripts/secrets-check.sh", "skills/wf-debug/scripts/secrets-check.sh"]
]) check(read(canonical) === read(vendored), `vendored script drift: ${vendored}`);

check(liveResults.results.every((result) => {
  const expected = evalSpec.evals.find((entry) => entry.id === result.eval_id)?.assertions;
  return expected && JSON.stringify(result.expectations.map(({ text }) => text)) === JSON.stringify(expected);
}), "live-result assertions drift from eval contract");
for (const config of ["with_skill", "baseline"]) {
  const passed = liveResults.results.filter((result) => result.config === config)
    .reduce((sum, result) => sum + result.passed, 0);
  check(passed === liveResults.aggregate[config].passed, `aggregate passed count drift: ${config}`);
}

report("debug contract", "workflow/packaging checks");
