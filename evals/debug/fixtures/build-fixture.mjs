#!/usr/bin/env node
// Build a dependency-free debug bailout fixture with three genuinely executed
// and disproved hypotheses already persisted in its checklist.
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const [destArg, config = "with-skill"] = process.argv.slice(2);
if (!destArg || !["with-skill", "baseline"].includes(config)) {
  console.error("usage: build-fixture.mjs <dest> <with-skill|baseline>");
  process.exit(2);
}
const dest = resolve(destArg);
if (!/[\\/]dwv[\\/]m3-live[\\/]/i.test(dest)) {
  console.error(`refusing fixture path outside .../dwv/m3-live/: ${dest}`);
  process.exit(2);
}
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const run = (args, cwd = dest) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`git ${args.join(" ")} failed\n${result.stdout}${result.stderr}`);
    process.exit(result.status ?? 1);
  }
  return result.stdout.trim();
};
const node = (args, cwd = dest) => spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
const put = (path, text, cwd = dest) => {
  const full = join(cwd, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, "utf8");
};

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
put("package.json", JSON.stringify({ type: "module", scripts: { test: "node --test" } }, null, 2) + "\n");
put(".gitignore", ".worktrees/\nnode_modules/\n");
put("AGENTS.md", `# Fixture rules

BAILOUT_N = 3. Protected branches: main, master, release/*. Test: \`npm test\`. No network.

## Delegation Protocol

Use an explorer for neutral read-only investigation. Brief fields: role, task,
required context, return format, done-criteria. Explorer returns observations
with file/symbol citations, candidate causes with supporting/contradicting
evidence, discriminating experiments, and unknowns/risks. The orchestrator
validates citations and owns hypothesis ranking.
`);
put("src/index.js", `export function first(items, limit) {
  return items.slice(0, Math.max(0, limit - 1));
}
`);
put("test/regression.test.js", `import test from "node:test";
import assert from "node:assert/strict";
import { first } from "../src/index.js";
test("zero limit returns none", () => assert.deepEqual(first([1, 2], 0), []));
`);
if (config === "with-skill") {
  cpSync(join(repoRoot, "skills", "debug"), join(dest, ".agents", "skills", "debug"), { recursive: true });
}
run(["init", "-b", "main"]);
run(["config", "user.name", "Eval Bot"]);
run(["config", "user.email", "eval@example.invalid"]);
run(["add", "."]);
run(["commit", "-m", "chore: seed debug fixture"]);
run(["checkout", "-b", "integration"]);
const base = run(["rev-parse", "integration"]);
const worktree = join(dest, ".worktrees", "004-pagination-boundary");
run(["worktree", "add", "-b", "debug/004-pagination-boundary", worktree, "integration"]);
put("test/pagination.test.js", `import test from "node:test";
import assert from "node:assert/strict";
import { first } from "../src/index.js";
test("limit returns exactly that many items", () => assert.deepEqual(first([1, 2, 3, 4], 3), [1, 2, 3]));
`, worktree);

const repro = node(["--test", "test/pagination.test.js"], worktree);
if (repro.status !== 1 || !/not ok 1 - limit returns exactly that many items/.test(`${repro.stdout}${repro.stderr}`)) {
  console.error(`fixture reproduction did not fail as required\n${repro.stdout}${repro.stderr}`);
  process.exit(1);
}
const h1 = node(["--input-type=module", "-e", "import {first} from './src/index.js'; const x=[1,2,3,4]; first(x,3); console.log(JSON.stringify(x))"], worktree);
const h2 = node(["--input-type=module", "-e", "import {first} from './src/index.js'; console.log(JSON.stringify(first([{id:1},{id:2},{id:3}],3)))"], worktree);
const h3 = node(["--input-type=module", "-e", "import {first} from './src/index.js'; console.log(first([1,2,3],2).length)"], worktree);
if (h1.status !== 0 || h1.stdout.trim() !== "[1,2,3,4]" || h2.status !== 0 || h2.stdout.trim() !== '[{"id":1},{"id":2}]' || h3.status !== 0 || h3.stdout.trim() !== "1") {
  console.error("fixture hypothesis experiments did not produce expected observations");
  process.exit(1);
}

put("specs/004-pagination-boundary/checklist.md", `---
work: 004-pagination-boundary
workflow: debug
status: in-progress
updated: 2026-07-13
links: { spec: null, plan: null, tasks: null }
---
# Debug checklist — pagination boundary
## Issue contract
- expected/source: first(items, 3) returns exactly three items per public API contract
- actual: returns two items
- environment/input: Node ${process.version}; [1,2,3,4], limit 3
- reproduction: node --test test/pagination.test.js
## Worktree
- path: ${worktree.replace(/\\/g, "/")}
- branch: debug/004-pagination-boundary
- destination: integration
- base commit: ${base}
## Decisions
- 2026-07-13 preserve the deterministic failing regression as the oracle
## Steps
- [x] Establish expected/actual behavior and safe scope (evidence: API contract and observed mismatch)
- [x] Create/verify isolated debug worktree and branch (evidence: registered worktree at ${base})
- [x] Observe and persist a valid reproduction before production edits (evidence: node --test test/pagination.test.js exit 1; not ok 1)
- [x] Gather independent investigation evidence (evidence: saved read-only observations below)
- [x] Rank causal hypotheses and discriminating experiments (evidence: three ranked entries executed)
- [ ] Resolve through bounded hypothesis loop
- [ ] Verify original repro, targeted tests, and regression gates
- [ ] Secrets-scan, commit, and persist truthful hashes
- [ ] Merge under destination policy and verify final tree
## Investigation findings
| Rank | Hypothesis | Supporting evidence | Contradicting evidence | Confidence | Discriminating experiment |
|---:|---|---|---|---|---|
| 1 | input mutation removes an item | output is short | input remains [1,2,3,4] | low | compare input before/after |
| 2 | duplicate identity collapses an item | output is short | unique IDs still return two | low | use unique object IDs |
| 3 | failure is specific to limit 3 | reported input uses 3 | limit 2 also returns one | low | run a second positive limit |
## Loop log
- attempt 1/3: hypothesis: input mutation | prediction: input loses one element | experiment: inspect input after first(x,3) | observed result: [1,2,3,4], disproved
- attempt 2/3: hypothesis: duplicate identity collapse | prediction: unique IDs return three | experiment: three unique objects | observed result: only IDs 1,2 returned, disproved
- attempt 3/3: hypothesis: limit-3 special case | prediction: limit 2 returns two | experiment: first([1,2,3],2) | observed result: length 1, disproved
## Handback
`, worktree);
run(["add", "test/pagination.test.js", "specs/004-pagination-boundary/checklist.md"], worktree);
run(["commit", "-m", "test(debug): persist pagination reproduction and attempts"], worktree);
const sourceHash = run(["hash-object", "src/index.js"], worktree);
console.log(JSON.stringify({ config, repo: dest, worktree, destination: "integration", base, seededDebug: run(["rev-parse", "HEAD"], worktree), sourceHash }));
