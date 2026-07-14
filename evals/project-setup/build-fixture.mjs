#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = resolve(process.argv[2] ?? join(repo, ".tmp-project-setup-fixture"));
const assets = join(repo, "skills/wf-setup/assets");
const date = "2026-07-14";
const replacements = {
  PROJECT_NAME: "Signal Lamp",
  INSTALL_COMMAND: "npm install --ignore-scripts",
  TEST_COMMAND: "npm test",
  LINT_COMMAND_OR_NA: "npm run lint",
  TYPECHECK_COMMAND_OR_NA: "N/A: plain JavaScript fixture has no separate typecheck",
  BUILD_COMMAND_OR_NA: "N/A: runnable JavaScript fixture has no build step",
  RUN_COMMAND_OR_NA: "npm start",
  READINESS_COMMAND_OR_NA: "npm run readiness",
  RUNTIME_AND_VERSION: "Node.js 22",
  FRAMEWORK_AND_VERSION_OR_NONE: "None",
  TEST_RUNNER_AND_VERSION: "node:test (Node.js 22)",
  PACKAGE_MANAGER_AND_VERSION_OR_NONE: "npm 10",
  BAILOUT_N: "3",
  PROJECT_NOTES_OR_NONE: "- The bootstrap fixture is intentionally dependency-free.",
  STACK_RATIONALE: "Node.js provides a dependency-free, cross-platform deterministic fixture.",
  PROJECT_PRINCIPLES: "- Keep the initial runtime deterministic and dependency-free.",
  YYYY_MM_DD: date,
  PRODUCT_PURPOSE: "Create a tiny CLI whose readiness output proves the local loop works.",
  FIRST_OUTCOME: "running the CLI prints signal-lamp-ready",
  INITIAL_NON_GOALS: "network services, persistence, deployment, and external dependencies",
  ABSOLUTE_TARGET: target.replaceAll("\\", "/"),
  STARTING_STATE: "new empty directory created by the deterministic fixture builder",
  STACK_SUMMARY: "Node.js 22, node:test, npm 10",
  GENERATOR_OR_FILE_PLAN: "minimal files from the committed fixture builder",
  PRESERVED_PATHS_OR_NONE: "None; target was absent.",
  EXTERNAL_SIDE_EFFECTS_OR_NONE: "None.",
  PENDING: "pending",
};
const instantiate = (source, destination) => {
  let content = readFileSync(join(assets, source), "utf8").replace(/\r\n/g, "\n");
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  mkdirSync(dirname(join(target, destination)), { recursive: true });
  writeFileSync(join(target, destination), content);
};

mkdirSync(target, { recursive: true });
for (const [source, destination] of [
  ["project-AGENTS-template.md", "AGENTS.md"],
  ["project-CLAUDE-template.md", "CLAUDE.md"],
  ["constitution-template.md", "docs/CONSTITUTION.md"],
  ["bootstrap-spec-template.md", "specs/000-bootstrap/spec.md"],
  ["bootstrap-plan-template.md", "specs/000-bootstrap/plan.md"],
  ["bootstrap-tasks-template.md", "specs/000-bootstrap/tasks.md"],
  ["bootstrap-checklist-template.md", "specs/000-bootstrap/checklist.md"],
  ["INDEX-template.md", "specs/INDEX.md"],
]) instantiate(source, destination);

writeFileSync(join(target, ".gitignore"), ".worktrees/\nnode_modules/\n");
writeFileSync(join(target, "package.json"), JSON.stringify({
  name: "signal-lamp",
  version: "0.0.0",
  private: true,
  type: "module",
  scripts: {
    test: "node --test",
    lint: "node --check src/cli.mjs && node --check test/cli.test.mjs && node --check scripts/readiness.mjs",
    start: "node src/cli.mjs",
    readiness: "node scripts/readiness.mjs",
  },
}, null, 2) + "\n");
mkdirSync(join(target, "src"), { recursive: true });
mkdirSync(join(target, "test"), { recursive: true });
mkdirSync(join(target, "scripts"), { recursive: true });
writeFileSync(join(target, "test/cli.test.mjs"), "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { spawnSync } from 'node:child_process';\ntest('CLI reports readiness', () => {\n  const result = spawnSync(process.execPath, ['src/cli.mjs'], { encoding: 'utf8' });\n  assert.equal(result.status, 0, result.stderr);\n  assert.equal(result.stdout.trim(), 'signal-lamp-ready');\n});\n");
writeFileSync(join(target, "scripts/readiness.mjs"), "import { spawnSync } from 'node:child_process';\nconst result = spawnSync(process.execPath, ['src/cli.mjs'], { encoding: 'utf8' });\nif (result.status !== 0 || result.stdout.trim() !== 'signal-lamp-ready') {\n  console.error(result.stderr || result.stdout || 'readiness output missing');\n  process.exit(1);\n}\nconsole.log('readiness-probe-ok');\n");
console.log(target);
