#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { makeSuite } from "../lib/test-kit.mjs";

const { root, read, check, report } = makeSuite(import.meta.url);
const skill = read("skills/wf-design/SKILL.md");
const flat = skill.replace(/\s+/g, " ");
const principles = read("skills/wf-design/references/design-principles.md");
const responsive = read("skills/wf-design/references/responsive.md");
const animation = read("skills/wf-design/references/animation.md");
const optimization = read("skills/wf-design/references/optimization.md");
const variants = read("skills/wf-design/references/variants-mode.md");
const checklist = read("skills/wf-design/assets/checklist-template.md");
const openai = read("skills/wf-design/agents/openai.yaml");
const description = skill.split("---", 3)[1];
const triggers = JSON.parse(read("evals/design/trigger-evals.json"));
const holdout = JSON.parse(read("evals/design/trigger-holdout.json"));
const evals = JSON.parse(read("evals/design/evals.json"));
const runner = read("evals/design/run-triggers.py");

// --- step order chain 0 -> 10 ---
const steps = [
  "## Step 0 — Resume before anything else",
  "## Step 1 — Choose the mode: edit, overhaul, or variants",
  "## Step 2 — Gather design requirements",
  "## Step 3 — Learn the current implementation",
  "## Step 4 — Apply the design references",
  "## Step 5 — Plan the change",
  "## Step 6 — Review the plan",
  "## Step 7 — Implement",
  "## Step 8 — Run existing frontend tests",
  "## Step 9 — Sanity checks",
  "## Step 10 — User feedback loop",
  "## Persistence and merge",
  "## Final handback"
];
for (const s of steps) check(skill.includes(s), `missing heading: ${s}`);
for (let i = 0; i < steps.length - 1; i++) {
  check(skill.indexOf(steps[i]) < skill.indexOf(steps[i + 1]), `${steps[i]} must precede ${steps[i + 1]}`);
}

check(skill.split("\n").length < 500, "SKILL.md must stay below 500 lines");

// --- must-fire rules in the SKILL.md body ---
check(flat.includes("anti-timidity rule") || flat.includes("Anti-timidity rule") || flat.includes("anti-timidity"), "anti-timidity rule text missing");
check(flat.includes("must not default to preserving existing component structure, stylesheets, or layout"), "anti-timidity preservation clause missing");
check(flat.includes("Preserving any part of the current implementation requires a stated reason"), "anti-timidity stated-reason requirement missing");

check(flat.includes("**edit**") && flat.includes("**overhaul**") && flat.includes("**variants**"), "mode rubric missing edit/overhaul/variants entries");
check(flat.includes("dissatisfaction is bounded to named components or pages"), "edit-mode rubric criteria missing");
check(flat.includes("expresses overall dissatisfaction"), "overhaul-mode rubric criteria missing");

check(flat.includes("three") && flat.includes("maximum") && (flat.includes(" 5 ") || flat.includes("five")), "variants bound (three/maximum/5-or-five) wording missing");
check(flat.includes("mock") && (flat.includes("no network") || flat.includes("never wired to the backend")), "variants mock/no-backend rule missing from body");

check(flat.includes("recorded user opt-in from Step 2") && flat.includes("`prefers-reduced-motion` check"), "animation opt-in + reduced-motion mandate missing from body");
check(flat.includes("Optimization outranks decoration"), "optimization-outranks-decoration rule missing");

check(flat.includes("BAILOUT_N") && flat.includes("cycle counter") && flat.includes("never restart the cycle counter"), "BAILOUT_N/cycle-counter/never-restart rule missing");

check(flat.includes("require a fresh, explicit human confirmation for the exact merge") && flat.includes("standing approval or silence does not count"), "protected-merge confirmation text missing");

check(flat.includes("never fabricate a passing result") && flat.includes("green means the command executed"), "never-fabricate-green wording missing in Step 8");

// --- description: positive categories + all six use-wf-X boundaries ---
check(description.includes("Use to restyle, redesign, revamp, or modernize"), "positive trigger categories missing");
for (const other of ["wf-feature", "wf-debug", "wf-plan", "wf-improve", "wf-setup", "wf-explore"]) {
  check(description.includes(`use ${other}`), `description missing boundary reference to ${other}`);
}

// --- host-mechanics leak guard across skill + all five references ---
check(!/\b(?:Claude|Codex|Sonnet|Haiku|Task tool|Agent tool)\b/.test(
  [skill, principles, responsive, animation, optimization, variants].join("\n")
), "host mechanics leaked into portable skill");

// --- animation reference: all five tier labels + cost trade wording ---
for (const tier of ["T0 `none`", "T1 `subtle`", "T2 `rich`", "T3 `scroll-driven`", "T4 `immersive`"]) {
  check(animation.includes(tier), `animation reference missing tier label: ${tier}`);
}
check(animation.includes("Cost table") && animation.includes("Bundle cost"), "animation cost-trade table missing");

// --- responsive reference: default breakpoint matrix + 44px touch target ---
check(responsive.includes("360 / 768 / 1024 / 1440"), "responsive default breakpoint matrix missing");
check(responsive.includes("44"), "responsive 44px touch-target rule missing");

// --- file inventory ---
for (const file of [
  "skills/wf-design/SKILL.md",
  "skills/wf-design/references/design-principles.md",
  "skills/wf-design/references/responsive.md",
  "skills/wf-design/references/animation.md",
  "skills/wf-design/references/optimization.md",
  "skills/wf-design/references/variants-mode.md",
  "skills/wf-design/assets/checklist-template.md",
  "skills/wf-design/agents/openai.yaml",
  "skills/wf-design/scripts/next-spec-number.sh",
  "skills/wf-design/scripts/secrets-check.sh",
  "evals/design/trigger-evals.json",
  "evals/design/trigger-holdout.json",
  "evals/design/evals.json",
  "evals/design/run-triggers.py"
]) check(existsSync(join(root, file)), `missing wf-design file: ${file}`);

// --- vendored byte-identity pairs ---
for (const [canonical, vendored] of [
  ["scripts/next-spec-number.sh", "skills/wf-design/scripts/next-spec-number.sh"],
  ["scripts/secrets-check.sh", "skills/wf-design/scripts/secrets-check.sh"]
]) check(read(canonical) === read(vendored), `vendored script drift: ${vendored}`);

// --- checklist and openai.yaml shape ---
check(checklist.includes("workflow: design") && checklist.includes("## Mode decision") && checklist.includes("## Cycle log"), "checklist template missing core sections");
check(checklist.includes("## Sanity checks") && checklist.includes("## Variants") && checklist.includes("## Delegation evidence"), "checklist template missing sanity/variants/delegation sections");
check(openai.includes("$wf-design"), "UI prompt lost explicit skill token");

// --- trigger/eval package shape ---
check(triggers.length === 15 && triggers.filter(({ should_trigger }) => should_trigger).length === 8, "calibration trigger balance drift");
check(holdout.length === 6 && holdout.filter(({ should_trigger }) => should_trigger).length === 3, "holdout trigger balance drift");
check(evals.evals.length === 2 && evals.evals.every(({ assertions }) => assertions.length === 6), "behavior eval shape drift");
check(evals.methodology.includes("no model uplift claim"), "honest eval limitation missing");
check(runner.includes("TRIGGERED_WF_DESIGN") && runner.includes('skill_name="wf-design"'), "run-triggers.py missing skill token wiring");

report("wf-design contract", "workflow/packaging checks");
