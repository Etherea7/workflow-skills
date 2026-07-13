#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = mkdtempSync(join(tmpdir(), "project-setup-resume-"));
const preflight = join(root, "skills/project-setup/scripts/check-commit-readiness.mjs");
let checks = 0;
const expect = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
const run = (command, args, cwd = target) => spawnSync(command, args, { cwd, encoding: "utf8", shell: false });
const runNpm = (args) => process.platform === "win32"
  ? run(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", ...args])
  : run("npm", args);
const stamp = () => new Date().toISOString();
try {
  expect(run(process.execPath, [join(root, "evals/project-setup/build-fixture.mjs"), target], root).status === 0,
    "fixture build failed");
  expect(run("git", ["init", "-b", "setup/000-bootstrap"]).status === 0, "git init failed");
  const checklistPath = join(target, "specs/000-bootstrap/checklist.md");
  const updateLine = (label, replacement) => {
    const before = readFileSync(checklistPath, "utf8");
    const after = before.replace(new RegExp(`^- \\[.\\] ${label}:.*$`, "m"), replacement);
    expect(after !== before, `could not update ${label}`);
    writeFileSync(checklistPath, after);
  };

  expect(runNpm(["install", "--ignore-scripts"]).status === 0, "seed install failed");
  updateLine("Install/restore", `- [x] Install/restore: \`npm install --ignore-scripts\` — evidence: exit 0; observed ${stamp()}; output: dependency restore completed`);
  const red = runNpm(["test"]);
  expect(red.status !== 0, "seed test was not red");
  updateLine("First-outcome red", `- [x] First-outcome red: \`npm test\` — evidence: exit ${red.status}; observed ${stamp()}; output: CLI readiness test rejected missing behavior`);
  writeFileSync(join(target, "src/cli.mjs"), "console.log('signal-lamp-ready');\n");
  expect(runNpm(["test"]).status === 0, "seed green test failed");
  updateLine("Tests", `- [x] Tests: \`npm test\` — evidence: exit 0; observed ${stamp()}; output: one CLI subprocess test passed`);
  expect(runNpm(["run", "lint"]).status === 0, "seed lint failed");
  updateLine("Lint/format", `- [x] Lint/format: \`npm run lint\` — evidence: exit 0; observed ${stamp()}; output: both JavaScript files passed syntax check`);
  updateLine("Typecheck", "- [x] Typecheck: N/A: plain JavaScript fixture has no separate typecheck");
  updateLine("Build/package", "- [x] Build/package: N/A: runnable JavaScript fixture has no build step");
  const seededRun = runNpm(["start"]);
  expect(seededRun.status === 0 && seededRun.stdout.includes("signal-lamp-ready"), "seed run command failed");
  updateLine("Run", `- [x] Run: \`npm start\` — evidence: exit 0; observed ${stamp()}; output: CLI printed signal-lamp-ready and exited cleanly`);

  let checklist = readFileSync(checklistPath, "utf8");
  checklist = checklist.replace("## Decisions\n", "## Decisions\n\n- 2026-07-14 Preserve this pre-drop decision exactly.\n");
  writeFileSync(checklistPath, checklist);
  const protectedPaths = ["AGENTS.md", "CLAUDE.md", "docs/CONSTITUTION.md", "specs/INDEX.md",
    "specs/000-bootstrap/spec.md", "specs/000-bootstrap/plan.md", "specs/000-bootstrap/tasks.md"];
  const beforeDrop = new Map(protectedPaths.map((path) => [path, readFileSync(join(target, path), "utf8")]));
  const completedEvidence = readFileSync(checklistPath, "utf8").split("\n")
    .filter((line) => /^- \[x\] (?:First-outcome red|Install\/restore|Tests|Lint\/format|Typecheck|Build\/package):/.test(line));

  const paused = run(process.execPath, [preflight, target]);
  expect(paused.status !== 0 && paused.stderr.includes("Readiness gate is not checked"),
    "simulated drop did not preserve the single outstanding gate");
  const readiness = runNpm(["run", "readiness"]);
  expect(readiness.status === 0 && readiness.stdout.includes("readiness-probe-ok"), "resumed readiness failed");
  updateLine("Readiness", `- [x] Readiness: \`npm run readiness\` — evidence: exit 0; observed ${stamp()}; output: independent CLI probe printed readiness-probe-ok`);

  const resumed = run(process.execPath, [preflight, target]);
  expect(resumed.status === 0, `resumed preflight failed\n${resumed.stderr}`);
  const after = readFileSync(checklistPath, "utf8");
  expect(after.includes("Preserve this pre-drop decision exactly."), "resume lost the prior decision");
  for (const line of completedEvidence) expect(after.includes(line), `resume rewrote prior evidence: ${line}`);
  for (const [path, content] of beforeDrop) expect(readFileSync(join(target, path), "utf8") === content, `resume replaced ${path}`);
  expect(run("git", ["rev-parse", "--verify", "HEAD"]).status !== 0, "resume created an unrequested commit");
  console.log(`project-setup resume: PASS (${checks} assertions; prior state preserved, only outstanding gate executed)`);
} finally {
  rmSync(target, { recursive: true, force: true });
}
