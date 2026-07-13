#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [destArg, config = "with-skill"] = process.argv.slice(2);
if (!destArg || !["with-skill", "baseline"].includes(config)) {
  console.error("usage: build-resume-fixture.mjs <dest> <with-skill|baseline>");
  process.exit(2);
}
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const baseBuilder = join(repoRoot, "evals", "next-step-improve", "fixtures", "build-fixture.mjs");
const generator = join(repoRoot, "skills", "next-step-improve", "scripts", "regenerate-index.mjs");
const scanner = join(repoRoot, "scripts", "secrets-check.sh");
const bash = ["C:\\Program Files\\Git\\bin\\bash.exe", "/bin/bash"].find(existsSync);
if (!bash) throw new Error("Bash is required to seed scanned resume history");
const dest = resolve(destArg);

const run = (command, args, cwd = dest, allowFailure = false) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}${result.stderr}`);
  }
  return result;
};
const git = (args, cwd = dest) => run("git", args, cwd).stdout.trim();
const put = (root, path, content) => {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
};
const scan = (cwd) => run(bash, [scanner], cwd);

const built = run(process.execPath, [baseBuilder, dest, config], repoRoot);
const base = JSON.parse(built.stdout).head;
const worktree = join(dest, ".worktrees", "005-improvement-survey");
mkdirSync(dirname(worktree), { recursive: true });
git(["worktree", "add", "-q", "-b", "improve/005-improvement-survey", worktree, base]);

put(worktree, "specs/005-improvement-survey/spec.md", `---
id: 005-improvement-survey
title: Repository improvement survey
status: awaiting-human
updated: 2026-07-13
parent: null
children: []
related: []
---

# Spec - Repository improvement survey

## Survey scope

Rank evidence-backed next actions without implementing them.

## Non-goals

- production implementation before a human selection
- inventing unresolved external behavior
`);

const checklistPath = join(worktree, "specs", "005-improvement-survey", "checklist.md");
const checklist = (artifactCommit) => `---
work: 005-improvement-survey
workflow: next-step-improve
status: awaiting-human
updated: 2026-07-13
links: { spec: spec.md, index: ../INDEX.md }
---

# Checklist - Repository improvement survey

## Worktree

- path: ${worktree.replace(/\\/g, "/")}
- branch: improve/005-improvement-survey
- destination: main
- base commit: ${base}
- repository commands: \`npm test\`; protected branches: main/master/release/*; BAILOUT_N=3

## Steps

- [x] Regenerate and check INDEX from directory truth
- [x] Gather and validate independent survey evidence
- [x] Rank no more than five proposals and recommend one
- [x] Scan and persist awaiting-human artifacts and truth
- [ ] Record human selection/defer/reject decision
- [ ] Scan and persist the selected decision before dispatch
- [ ] Decompose selected work and route downstream
- [ ] Reconcile exact advanced destination head after each child
- [ ] Refresh INDEX after downstream returns
- [ ] Scan, persist, integrate under policy, and record truth

## Index reconciliation log

- attempt 1/3: prediction: stale index will be replaced | command/change: regenerate then --check | observed result: six real directories, check passed

## Destination reconciliation log

- prior destination: main@${base} | current destination: same | merge/result: not needed | verified commit: n/a

## Delegation evidence

- neutral brief:
  - role: explorer
  - task: identify evidence-backed opportunities without ranking
  - required context: rules, index, active checklists, docs/code/tests/CI; read-only and no network
  - return format: cited observations, users/systems, risks, dependencies, unknowns
  - done-criteria: citations validated; no edits, ranking, or implementation
- structured return: CI uses Node 20 while package requires 22; CLI JSON lacks behavioral contract; queue test checks length but not appended value.
- orchestrator citation validation: confirmed package.json/.github runtime mismatch, specs/003-cli-json/spec.md ambiguity, and test/queue.test.js assertion gap.

## Proposals

| ID | Outcome | Evidence | Dependencies | Risk | Confidence | Impact | Urgency | Effort | Score | Next workflow |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| P1 | Align CI runtime and index check | package.json; .github/workflows/ci.yml; stale INDEX | none | delivery | 2 | 3 | 3 | 2 | 10 | new-feature |
| P2 | Define the CLI JSON behavioral contract | specs/003-cli-json/spec.md lacks invocation/schema/error/exit semantics | human behavior choices | external contract | 2 | 3 | 2 | 2 | 9 | plan |
| P3 | Assert queue contents in regression test | src/queue.js; test/queue.test.js | none | correctness | 2 | 2 | 2 | 1 | 9 | new-feature |

- recommended first: P1 because it establishes trustworthy verification before feature work.
- exclusions: blocked metrics and undecided webhook implementation remain out of scope.
- human decision: pending

## Downstream returns

- none; human selection required

## Decisions

- 2026-07-13: Ranked P1-P3 from validated repository evidence and paused before implementation.
- artifact commit: ${artifactCommit}

## Handback

- state: awaiting-human
- inspected scope and evidence: specs/checklists, docs, source/test/CI/package, local green test
- index generation/check: six entries, --check passed
- selection/downstream state: P1 recommended; P1-P3 pending human choice; no child dispatched
- commits/merge state: artifact commit ${artifactCommit}; truth commit is current HEAD; protected main remains ${base}
- cleanup/retained state: survey worktree retained at recorded path
- risks/unknowns and next human action: choose P1-P3, defer, reject, or request a bounded rerank
`;

put(worktree, "specs/005-improvement-survey/checklist.md", checklist("pending truth update"));
run(process.execPath, [generator, "--root", worktree], worktree);
run(process.execPath, [generator, "--root", worktree, "--check"], worktree);
git(["add", "specs/INDEX.md", "specs/005-improvement-survey"], worktree);
scan(worktree);
git(["commit", "-q", "-m", "docs: persist resumable improvement survey"], worktree);
const artifact = git(["rev-parse", "HEAD"], worktree);
writeFileSync(checklistPath, checklist(artifact), "utf8");
git(["add", "specs/005-improvement-survey/checklist.md"], worktree);
scan(worktree);
git(["commit", "-q", "-m", "docs: record survey artifact commit"], worktree);
const truth = git(["rev-parse", "HEAD"], worktree);
if (git(["status", "--porcelain"], worktree)) throw new Error("seeded survey worktree is dirty");

process.stdout.write(JSON.stringify({ config, project: dest, main: base, worktree, branch: "improve/005-improvement-survey", artifact, truth }));
