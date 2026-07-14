#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const target = resolve(process.argv[2] ?? ".");
const structure = spawnSync(process.execPath, [join(import.meta.dirname, "check-bootstrap.mjs"), target], {
  encoding: "utf8",
});
const errors = [];
if (structure.status !== 0) errors.push("bootstrap structural check is not green");

const git = (...args) => spawnSync("git", args, { cwd: target, encoding: "utf8" });
const branch = git("branch", "--show-current");
if (branch.status !== 0 || branch.stdout.trim() !== "setup/000-bootstrap") {
  errors.push("current branch must be setup/000-bootstrap");
}
if (git("rev-parse", "--verify", "HEAD").status === 0) {
  errors.push("HEAD already exists; this preflight is only for the initial commit");
}

const load = (relative) => {
  try {
    return readFileSync(join(target, relative), "utf8").replace(/\r\n/g, "\n");
  } catch {
    errors.push(`${relative} is unreadable`);
    return "";
  }
};
const agents = load("AGENTS.md");
const plan = load("specs/000-bootstrap/plan.md");
const checklist = load("specs/000-bootstrap/checklist.md");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const commandFromAgents = (label) => agents.match(new RegExp("^- " + escape(label) + ": `([^`]+)`", "m"))?.[1];
const zone = "(?:Z|[+-]\\d{2}:\\d{2})";
const observedGreen = new RegExp(`exit\\s+0;\\s*observed\\s+\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?${zone};\\s*output:\\s*\\S.+`, "i");
const observedRed = new RegExp(`exit\\s+(?:[1-9][0-9]*|nonzero);\\s*observed\\s+\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?${zone};\\s*output:\\s*\\S.+`, "i");

const commands = {
  "Install/restore": [commandFromAgents("Install dependencies")],
  "Tests": [commandFromAgents("Run tests")],
  "Lint/format": [commandFromAgents("Lint/format check")],
  "Typecheck": [commandFromAgents("Typecheck")],
  "Build/package": [commandFromAgents("Build/package")],
  "Run": [commandFromAgents("Run locally")],
  "Readiness": [commandFromAgents("Readiness probe")],
};

const testCommand = commands.Tests[0];
const redLine = checklist.match(/^- \[x\] First-outcome red:.*$/mi)?.[0];
if (!redLine) {
  errors.push("First-outcome red gate is not checked");
} else {
  if (!testCommand || !redLine.includes(`\`${testCommand}\``)) errors.push("red gate command differs from AGENTS.md test command");
  if (!observedRed.test(redLine)) errors.push("red gate lacks timestamped nonzero exit and output summary");
}

for (const [label, expected] of Object.entries(commands)) {
  if (expected.some((command) => !command)) {
    errors.push(`${label} command is missing from AGENTS.md`);
    continue;
  }
  for (const command of new Set(expected)) {
    if (!plan.includes(`\`${command}\``)) errors.push(`${label} command differs between AGENTS.md and plan.md`);
  }

  const line = checklist.match(new RegExp(`^- \\[x\\] ${escape(label)}:.*$`, "mi"))?.[0];
  if (!line) {
    errors.push(`${label} gate is not checked`);
    continue;
  }
  if (label === "Tests" && /N\/A:/i.test(line)) {
    errors.push("Tests gate can never be N/A");
    continue;
  }

  const allNA = expected.every((command) => /^N\/A:\s*\S.+/i.test(command));
  if (label === "Tests" && allNA) {
    errors.push("Tests gate can never be N/A");
    continue;
  }
  if (allNA) {
    if (!/N\/A:\s*\S.+/i.test(line)) errors.push(`${label} gate lacks a concrete N/A reason`);
    continue;
  }
  if (expected.some((command) => /^N\/A:/i.test(command))) {
    errors.push(`${label} has inconsistent applicable/N/A commands in AGENTS.md`);
    continue;
  }
  for (const command of new Set(expected)) {
    if (!line.includes(`\`${command}\``)) errors.push(`${label} evidence command differs from AGENTS.md`);
  }
  if (!observedGreen.test(line)) errors.push(`${label} gate lacks timestamped exit 0 and output summary`);
}

if (errors.length) {
  for (const error of errors) console.error(`REFUSE: ${error}`);
  process.exit(1);
}
console.log("project-setup evidence-shape preflight: PASS (execution still requires orchestrator observation)");
