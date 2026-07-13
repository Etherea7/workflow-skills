#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [destArg, config = "with-skill"] = process.argv.slice(2);
if (!destArg || !["with-skill", "baseline"].includes(config)) {
  console.error("usage: build-fixture.mjs <dest> <with-skill|baseline>");
  process.exit(2);
}
const dest = resolve(destArg);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const put = (path, content) => {
  const target = join(dest, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
};
const git = (args) => {
  const result = spawnSync("git", args, { cwd: dest, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
};
const spec = (id, title, status, parent = "null", children = "[]") => `---
id: ${id}
title: ${title}
status: ${status}
updated: 2026-07-10
parent: ${parent}
children: ${children}
related: []
---

# Spec - ${title}

## Requirements

- R1. Repository evidence for ${title} remains authoritative.
`;
const checklist = (id, title, status, workflow, extra = "") => `---
work: ${id}
workflow: ${workflow}
status: ${status}
updated: 2026-07-11
links: { spec: spec.md }
---

# Checklist - ${title}

## Steps

- [x] Preserve observed state (evidence: fixture seed)

## Handback

${extra}
`;

if (existsSync(dest) && readdirSync(dest).length > 0) {
  throw new Error(`fixture destination must be absent or empty: ${dest}`);
}
mkdirSync(dest, { recursive: true });
put(".gitignore", ".worktrees/\nnode_modules/\n");
put("package.json", JSON.stringify({
  name: "roadmap-fixture",
  type: "module",
  engines: { node: ">=22" },
  scripts: { test: "node --test" }
}, null, 2) + "\n");
put("AGENTS.md", `# Fixture rules

Protected branches: main, master, release/*. BAILOUT_N = 3. Test: \`npm test\`.
No network or production operations. Every commit requires a staged added-lines
credential scan. Worktree root is \`.worktrees/\`.

## Delegation Protocol

Explorer briefs contain role, task, required context, return format, and
done-criteria. Explorers are read-only and return observations with citations,
risks, dependencies, and unknowns. The orchestrator validates citations and
owns ranking and selection handoff.
`);
put("README.md", "# Roadmap fixture\n\nNode 22 service. Specs are the planning source of truth.\n");
put("src/queue.js", "export function enqueue(queue, item) { queue.push(item); return queue.length; }\n");
put("test/queue.test.js", `import test from "node:test";
import assert from "node:assert/strict";
import { enqueue } from "../src/queue.js";
test("enqueue appends", () => { const q = []; assert.equal(enqueue(q, "x"), 1); });
`);
put(".github/workflows/ci.yml", `name: ci
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm test
`);
put("specs/INDEX.md", `<!-- stale hand-edited index -->
# Specs index - stale
| ID | Title | Status |
|---|---|---|
| 999-phantom | Phantom | ready |
| 001-profile | Profile | in-progress |
`);
put("specs/000-bootstrap/spec.md", spec("000-bootstrap", "Bootstrap", "done"));
put("specs/000-bootstrap/checklist.md", checklist("000-bootstrap", "Bootstrap", "done", "project-setup"));
put("specs/001-profile/spec.md", spec("001-profile", "Profile", "done"));
put("specs/001-profile/checklist.md", checklist("001-profile", "Profile", "done", "new-feature"));
put("specs/002-webhook-auth/spec.md", spec("002-webhook-auth", "Webhook authentication", "awaiting-human"));
put("specs/002-webhook-auth/checklist.md", checklist(
  "002-webhook-auth", "Webhook authentication", "awaiting-human", "plan",
  "- state: awaiting a human decision on signature rotation and replay window\n"
));
put("specs/003-cli-json/spec.md", spec("003-cli-json", "CLI JSON output", "ready"));
put("specs/004-metrics/spec.md", spec("004-metrics", "Metrics export", "blocked"));
put("specs/004-metrics/checklist.md", checklist(
  "004-metrics", "Metrics export", "blocked", "new-feature",
  "- state: blocked because the external metric naming contract is unavailable\n"
));

if (config === "with-skill") {
  for (const skill of ["wf-improve", "wf-plan", "wf-feature", "wf-debug"]) {
    cpSync(join(repoRoot, "skills", skill), join(dest, ".agents", "skills", skill), { recursive: true });
  }
}

git(["init", "-q", "-b", "main"]);
git(["config", "user.name", "Eval Fixture"]);
git(["config", "user.email", "eval@example.invalid"]);
git(["add", "."]);
git(["commit", "-q", "-m", "chore: seed roadmap fixture"]);
const head = git(["rev-parse", "HEAD"]);
process.stdout.write(JSON.stringify({ config, project: dest, branch: "main", head }));
