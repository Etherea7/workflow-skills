#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = mkdtempSync(join(tmpdir(), "project-setup-commit-gate-"));
let checks = 0;
const run = (command, args, options = {}) => spawnSync(command, args, {
  cwd: options.cwd ?? target,
  encoding: "utf8",
  shell: false,
});
const expect = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
const runNpm = (args) => process.platform === "win32"
  ? run(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", ...args])
  : run("npm", args);
const stamp = () => new Date().toISOString();
const scannerShell = () => {
  if (process.platform !== "win32") return "bash";
  const execPath = run("git", ["--exec-path"]).stdout.trim();
  const candidate = join(dirname(dirname(dirname(resolve(execPath)))), "bin", "bash.exe");
  return existsSync(candidate) ? candidate : null;
};
try {
  expect(run(process.execPath, [join(root, "evals/project-setup/build-fixture.mjs"), target], { cwd: root }).status === 0,
    "fixture build failed");
  expect(run("git", ["init", "-b", "setup/000-bootstrap"]).status === 0, "git init failed");
  run("git", ["config", "user.name", "Project Setup Eval"]);
  run("git", ["config", "user.email", "project-setup@example.invalid"]);

  const checklistPath = join(target, "specs/000-bootstrap/checklist.md");
  const updateLine = (label, replacement) => {
    const checklist = readFileSync(checklistPath, "utf8");
    const updated = checklist.replace(new RegExp(`^- \\[.\\] ${label}:.*$`, "m"), replacement);
    expect(updated !== checklist, `could not update ${label} evidence`);
    writeFileSync(checklistPath, updated);
  };

  const install = runNpm(["install", "--ignore-scripts"]);
  expect(install.status === 0, "dependency restore did not pass");
  updateLine("Install/restore", `- [x] Install/restore: \`npm install --ignore-scripts\` — evidence: exit 0; observed ${stamp()}; output: dependency restore completed`);

  const red = runNpm(["test"]);
  expect(red.status !== 0 && `${red.stdout}\n${red.stderr}`.includes("CLI reports readiness"), "meaningful first-outcome red missing");
  updateLine("First-outcome red", `- [x] First-outcome red: \`npm test\` — evidence: exit ${red.status}; observed ${stamp()}; output: CLI readiness test rejected missing behavior`);

  const preflightPath = join(root, "skills/wf-setup/scripts/check-commit-readiness.mjs");
  const refused = run(process.execPath, [preflightPath, target]);
  expect(refused.status !== 0 && refused.stderr.includes("Tests gate is not checked"),
    "preflight did not refuse an unverified test command");
  expect(run("git", ["rev-parse", "--verify", "HEAD"]).status !== 0,
    "repository gained a commit while tests were unverified");

  updateLine("Tests", "- [x] Tests: N/A: forged evidence must never satisfy a software scaffold");
  const forged = run(process.execPath, [preflightPath, target]);
  expect(forged.status !== 0 && forged.stderr.includes("Tests gate can never be N/A"),
    "preflight accepted forged Tests N/A evidence");
  updateLine("Tests", "- [ ] Tests: `npm test` — evidence: pending");

  writeFileSync(join(target, "src/cli.mjs"), "console.log('signal-lamp-ready');\n");
  const test = runNpm(["test"]);
  expect(test.status === 0 && test.stdout.includes("CLI reports readiness"), "test did not pass after behavior implementation");
  updateLine("Tests", `- [x] Tests: \`npm test\` — evidence: exit 0; observed ${stamp()}; output: one CLI subprocess test passed`);

  const lint = runNpm(["run", "lint"]);
  expect(lint.status === 0, "lint did not pass");
  updateLine("Lint/format", `- [x] Lint/format: \`npm run lint\` — evidence: exit 0; observed ${stamp()}; output: both JavaScript files passed syntax check`);
  updateLine("Typecheck", "- [x] Typecheck: N/A: plain JavaScript fixture has no separate typecheck");
  updateLine("Build/package", "- [x] Build/package: N/A: runnable JavaScript fixture has no build step");

  const readyRun = runNpm(["start"]);
  expect(readyRun.status === 0 && readyRun.stdout.includes("signal-lamp-ready"), "readiness command did not pass");
  updateLine("Run", `- [x] Run: \`npm start\` — evidence: exit 0; observed ${stamp()}; output: CLI printed signal-lamp-ready and exited cleanly`);
  const probe = runNpm(["run", "readiness"]);
  expect(probe.status === 0 && probe.stdout.includes("readiness-probe-ok"), "distinct readiness probe did not pass");
  updateLine("Readiness", `- [x] Readiness: \`npm run readiness\` — evidence: exit 0; observed ${stamp()}; output: independent CLI probe printed readiness-probe-ok`);

  const ready = run(process.execPath, [preflightPath, target]);
  expect(ready.status === 0 && ready.stdout.includes("evidence-shape preflight"),
    `preflight did not pass after observed green evidence\n${ready.stderr}`);

  expect(run("git", ["add", "."]).status === 0, "staging failed");
  expect(run("git", ["diff", "--cached", "--check"]).status === 0, "staged diff check failed");
  const staged = run("git", ["diff", "--cached", "--no-color"]);
  expect(staged.status === 0 && staged.stdout.includes("signal-lamp-ready"), "complete staged diff was not inspected");
  const bash = scannerShell();
  expect(Boolean(bash), "no usable Bash found for vendored scanner");
  const scan = run(bash, [join(root, "skills/wf-setup/scripts/secrets-check.sh")]);
  expect(scan.status === 0 && scan.stdout.includes("secrets-check: clean"), `staged secrets scan failed\n${scan.stderr}`);

  expect(run("git", ["commit", "-m", "chore: bootstrap verified project"]).status === 0, "verified commit failed");
  expect(run("git", ["rev-parse", "--verify", "HEAD"]).status === 0, "verified commit missing");
  const afterCommit = run(process.execPath, [preflightPath, target]);
  expect(afterCommit.status !== 0 && afterCommit.stderr.includes("HEAD already exists"),
    "initial-commit preflight did not refuse pre-existing history");
  console.log(`project-setup commit gate: PASS (${checks} assertions; red state remained uncommitted, staged scan preceded commit)`);
} finally {
  rmSync(target, { recursive: true, force: true });
}
