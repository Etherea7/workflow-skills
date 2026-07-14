#!/usr/bin/env node
// Builds short-path, dependency-free git fixtures for live new-feature evals.
// Usage: node build-fixture.mjs <protected|resume|red-green> <dest> <with-skill|baseline>
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const [caseName, destArg, config = "with-skill"] = process.argv.slice(2);
if (!caseName || !destArg || !["protected", "resume", "red-green"].includes(caseName)) {
  console.error("usage: build-fixture.mjs <protected|resume|red-green> <dest> <with-skill|baseline>");
  process.exit(2);
}
const dest = resolve(destArg);
if (!/[\\/]dwv[\\/]m2-live[\\/]/i.test(dest)) {
  console.error(`refusing fixture path outside .../dwv/m2-live/: ${dest}`);
  process.exit(2);
}
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function run(args, cwd = dest) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`git ${args.join(" ")} failed\n${result.stdout}${result.stderr}`);
    process.exit(result.status ?? 1);
  }
  return result.stdout.trim();
}
function runNode(args, cwd = dest) {
  return spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
}
function put(path, text, root = dest) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text.replace(/^ {6}/gm, ""), "utf8");
}
function baseProject(specDir, spec, source, regressionTest, docs) {
  put("package.json", JSON.stringify({ type: "module", scripts: { test: "node --test" } }, null, 2) + "\n");
  put(".gitignore", ".worktrees/\nnode_modules/\n");
  put("AGENTS.md", `# Fixture rules\n\nBAILOUT_N = 3. Protected branches: main, master, release/*.\nTest: \`npm test\`. No network or dependencies. Keep docs/usage.md current.\n`);
  put(`specs/${specDir}/spec.md`, spec);
  put("src/index.js", source);
  put("test/regression.test.js", regressionTest);
  put("docs/usage.md", docs);
  if (config === "with-skill") {
    cpSync(join(repoRoot, "skills", "wf-feature"), join(dest, ".agents", "skills", "wf-feature"), { recursive: true });
  }
}
function init(branch = "main") {
  run(["init", "-b", branch]);
  run(["config", "user.name", "Eval Bot"]);
  run(["config", "user.email", "eval@example.invalid"]);
  run(["add", "."]);
  run(["commit", "-m", "chore: seed eval fixture"]);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

if (caseName === "protected") {
  baseProject("001-health-endpoint", `---
id: 001-health-endpoint
title: Health endpoint
status: ready
---
# Health endpoint
## Requirements
- R1. WHEN \`handle('/health')\` is called, it SHALL return status 200 and body \`{status:'ok'}\`.
## Acceptance criteria
- [ ] AC1 (R1): Given the application, when /health is handled, then the exact healthy response is returned.
`, `export function handle(path) {
  return { status: 404, body: { error: "not found", path } };
}
`, `import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/index.js";
test("unknown routes stay 404", () => assert.equal(handle("/missing").status, 404));
`, "# Usage\n\nCall `handle(path)` to route an in-process request.\n");
  init("main");
  console.log(JSON.stringify({ case: caseName, config, workdir: dest, destination: "main", initialDestination: run(["rev-parse", "main"]) }));
}

if (caseName === "red-green") {
  baseProject("003-todo-filter", `---
id: 003-todo-filter
title: Case-insensitive todo filter
status: ready
---
# Todo filter
## Requirements
- R1. WHEN \`filterTodos(todos, query)\` receives a non-empty query, it SHALL return todos whose title contains the query, ignoring case.
- R2. WHEN query is empty, it SHALL return all todos without mutating the input.
## Acceptance criteria
- [ ] AC1 (R1): Mixed-case titles and queries match case-insensitively.
- [ ] AC2 (R2): Empty query returns all items and leaves the array unchanged.
`, `export function filterTodos(todos, query) {
  return todos;
}
`, `import test from "node:test";
import assert from "node:assert/strict";
import { filterTodos } from "../src/index.js";
test("empty query returns all without mutation", () => {
  const todos = [{ title: "One" }];
  const result = filterTodos(todos, "");
  assert.deepEqual(result, todos);
  assert.deepEqual(todos, [{ title: "One" }]);
});
`, "# Todo filters\n\n`filterTodos(todos, query)` currently returns all todos.\n");
  init("main");
  run(["checkout", "-b", "develop"]);
  console.log(JSON.stringify({ case: caseName, config, workdir: dest, destination: "develop", initialDestination: run(["rev-parse", "develop"]) }));
}

if (caseName === "resume") {
  baseProject("002-slug-normalizer", `---
id: 002-slug-normalizer
title: Slug normalizer
status: ready
---
# Slug normalizer
## Requirements
- R1. WHEN \`normalizeSlug(text)\` is called, it SHALL trim outer whitespace, lowercase ASCII letters, and replace one or more inner spaces with one hyphen.
## Acceptance criteria
- [ ] AC1 (R1): \`"  Hello   World "\` becomes \`"hello-world"\`.
`, `export function normalizeSlug(text) {
  return text;
}
`, `import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSlug } from "../src/index.js";
test("already-normalized slug is unchanged", () => assert.equal(normalizeSlug("hello-world"), "hello-world"));
`, "# Slugs\n\n`normalizeSlug(text)` normalizes identifiers.\n");
  put("specs/002-slug-normalizer/plan.md", `# Implementation plan — Slug normalizer
## Test strategy
- Red: \`node --test test/slug.test.js\`
- Green/regression: \`npm test\`
`);
  put("specs/002-slug-normalizer/tasks.md", `# Tasks — Slug normalizer
| # | Task | Verifies |
|---|---|---|
| T1 | Add failing normalization test | R1 |
| T2 | Implement normalization | T1 green |
`);
  put("specs/002-slug-normalizer/checklist.md", `---
work: 002-slug-normalizer
workflow: new-feature
status: in-progress
---
# Checklist — Slug normalizer
## Decisions
- 2026-07-12 use ASCII lowercase and space runs only because the ready spec explicitly limits behavior
## Worktree
- path: ${join(dest, ".worktrees", "002-slug-normalizer").replace(/\\/g, "/")}
- branch: feature/002-slug-normalizer
- base branch: integration
- base commit: {{filled-by-builder}}
## Steps
- [x] Validate ready spec and gather context (evidence: spec R1/AC1 reviewed)
- [x] Create/verify isolated worktree and feature branch (evidence: seeded by fixture)
- [x] Write plan.md and test-mapped tasks.md inside the worktree (evidence: artifact paths)
- [x] Observe valid failing tests before implementation (evidence: {{red-evidence}})
- [ ] Implement through bounded red-green loop
- [ ] Update docs and run final validation
- [ ] Secrets-check, commit, verify hash, and persist checklist truth
- [ ] Merge under destination policy and verify result
## Loop log
## Handback
`);
  init("main");
  run(["checkout", "-b", "integration"]);
  const base = run(["rev-parse", "integration"]);
  const worktree = join(dest, ".worktrees", "002-slug-normalizer");
  run(["worktree", "add", "-b", "feature/002-slug-normalizer", worktree, "integration"]);
  put("test/slug.test.js", `import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSlug } from "../src/index.js";
test("normalizes words into a slug", () => assert.equal(normalizeSlug("  Hello   World "), "hello-world"));
`, worktree);
  const red = runNode(["--test", "test/slug.test.js"], worktree);
  const redOutput = `${red.stdout}${red.stderr}`;
  if (red.status !== 1 || !/not ok 1 - normalizes words into a slug/.test(redOutput) || !/# fail 1/.test(redOutput)) {
    console.error(`seeded red test did not produce the required failure\n${redOutput}`);
    process.exit(1);
  }
  const checklist = join(worktree, "specs", "002-slug-normalizer", "checklist.md");
  const seeded = (await import("node:fs")).readFileSync(checklist, "utf8")
    .replace("{{filled-by-builder}}", base)
    .replace("{{red-evidence}}", "`node --test test/slug.test.js` observed exit 1, `not ok 1 - normalizes words into a slug`, and `# fail 1`");
  writeFileSync(checklist, seeded, "utf8");
  run(["add", "specs/002-slug-normalizer/checklist.md", "test/slug.test.js"], worktree);
  run(["commit", "-m", "test(slug): establish failing normalization case"], worktree);
  console.log(JSON.stringify({ case: caseName, config, workdir: worktree, repo: dest, destination: "integration", initialDestination: base, seededFeature: run(["rev-parse", "HEAD"], worktree) }));
}
