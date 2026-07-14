#!/usr/bin/env node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { makeSuite } from "../lib/test-kit.mjs";

const { root: suite, checkThrow } = makeSuite(import.meta.url);
const generator = join(suite, "skills", "wf-improve", "scripts", "regenerate-index.mjs");
const root = mkdtempSync(join(tmpdir(), "dwv-reconcile-test-"));
let checks = 0;
const check = (condition, message) => { checks += 1; checkThrow(condition, message); };
const put = (path, content) => {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
};
const run = (command, args, allowFailure = false) => {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (!allowFailure && result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr}`);
  return result;
};
const git = (...args) => run("git", args).stdout.trim();
const spec = (id, title, status) => `---\nid: ${id}\ntitle: ${title}\nstatus: ${status}\nupdated: 2026-07-13\nparent: null\nchildren: []\nrelated: []\n---\n\n# Spec - ${title}\n`;
const checklist = (id, title, status, workflow) => `---\nwork: ${id}\nworkflow: ${workflow}\nstatus: ${status}\nupdated: 2026-07-13\nlinks: { spec: spec.md }\n---\n\n# Checklist - ${title}\n`;
const regenerate = (...args) => run(process.execPath, [generator, "--root", root, ...args]);

try {
  git("init", "-q", "-b", "develop");
  git("config", "user.email", "eval@example.invalid");
  git("config", "user.name", "Eval Fixture");
  put("specs/000-bootstrap/spec.md", spec("000-bootstrap", "Bootstrap", "done"));
  put("specs/000-bootstrap/checklist.md", checklist("000-bootstrap", "Bootstrap", "done", "project-setup"));
  regenerate();
  git("add", ".");
  git("commit", "-q", "-m", "chore: seed directory truth");
  const base = git("rev-parse", "HEAD");

  git("checkout", "-q", "-b", "improve/010-survey");
  put("specs/010-survey/spec.md", spec("010-survey", "Survey", "awaiting-human"));
  put("specs/010-survey/checklist.md", checklist("010-survey", "Survey", "awaiting-human", "next-step-improve"));
  regenerate();
  git("add", ".");
  git("commit", "-q", "-m", "docs: persist survey ranking");

  git("checkout", "-q", "develop");
  put("specs/011-child/spec.md", spec("011-child", "Child", "done"));
  put("specs/011-child/checklist.md", checklist("011-child", "Child", "done", "new-feature"));
  regenerate();
  git("add", ".");
  git("commit", "-q", "-m", "feat: complete selected child");
  const destination = git("rev-parse", "HEAD");
  check(run("git", ["merge-base", "--is-ancestor", base, destination], true).status === 0, "destination no longer descends from recorded head");

  git("checkout", "-q", "improve/010-survey");
  const merge = run("git", ["merge", "--no-ff", "--no-commit", destination], true);
  check(merge.status === 1, "generated INDEX topology did not produce the expected resolvable conflict");
  const unresolved = git("diff", "--name-only", "--diff-filter=U").replace(/\\/g, "/");
  check(unresolved === "specs/INDEX.md", `unexpected reconciliation conflicts: ${unresolved}`);
  regenerate();
  git("add", "specs/INDEX.md");
  check(git("diff", "--name-only", "--diff-filter=U") === "", "generated INDEX conflict remained unresolved");
  git("commit", "-q", "-m", "merge: reconcile destination truth");
  const reconciliation = git("rev-parse", "HEAD");
  check(git("rev-list", "--parents", "-n", "1", reconciliation).split(" ").length === 3, "reconciliation is not a two-parent merge");
  regenerate("--check");
  const index = readFileSync(join(root, "specs", "INDEX.md"), "utf8");
  check(index.includes("010-survey") && index.includes("011-child"), "reconciled index omitted survey or child truth");

  git("checkout", "-q", "develop");
  const beforeCandidate = git("rev-parse", "HEAD");
  const candidate = run("git", ["merge", "--no-ff", "--no-commit", reconciliation], true);
  check(candidate.status === 0, `integrated candidate merge failed: ${candidate.stderr}`);
  regenerate("--check");
  git("merge", "--abort");
  check(git("rev-parse", "HEAD") === beforeCandidate, "candidate verification changed destination HEAD");

  console.log(`next-step-improve reconciliation: PASS (${checks} branch-topology checks)`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
