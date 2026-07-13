#!/usr/bin/env node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const script = join(repo, "skills", "next-step-improve", "scripts", "regenerate-index.mjs");
const scratch = mkdtempSync(join(tmpdir(), "dwv-index-test-"));
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
const put = (root, path, content) => {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
};
const run = (root, args = []) => spawnSync(process.execPath, [script, "--root", root, ...args], { encoding: "utf8" });
const spec = (id, title, status, parent = "null", children = "[]") => `---\nid: ${id}\ntitle: ${title}\nstatus: ${status}\nupdated: 2026-07-13\nparent: ${parent}\nchildren: ${children}\nrelated: []\n---\n\n# Spec - ${title}\n`;
const checklist = (id, title, status, workflow = "new-feature", handback = "") => `---\nwork: ${id}\nworkflow: ${workflow}\nstatus: ${status}\nupdated: 2026-07-14\nlinks: { spec: spec.md }\n---\n\n# Checklist - ${title}\n\n## Handback\n\n${handback}\n`;

try {
  const normal = join(scratch, "normal");
  put(normal, "package.json", JSON.stringify({ name: "fixture-project" }));
  put(normal, "specs/INDEX.md", "# stale\n\n| 999-phantom | old |\n");
  put(normal, "specs/000-bootstrap/spec.md", spec("000-bootstrap", "Bootstrap", "done"));
  put(normal, "specs/000-bootstrap/checklist.md", checklist("000-bootstrap", "Bootstrap", "done", "project-setup"));
  put(normal, "specs/001-parent/spec.md", spec("001-parent", "Parent | initiative", "in-progress", "null", "[002-child]"));
  put(normal, "specs/001-parent/checklist.md", checklist("001-parent", "Parent", "in-progress"));
  put(normal, "specs/001-parent/plan.md", "# Plan\n");
  put(normal, "specs/002-child/spec.md", spec("002-child", "Child", "awaiting-human", "001-parent"));
  put(normal, "specs/002-child/checklist.md", checklist("002-child", "Child", "awaiting-human", "new-feature", "- state: API decision required | owner: human\n"));
  put(normal, "specs/003-missing-spec/checklist.md", checklist("003-missing-spec", "Missing spec", "blocked", "debug", "- state: reproduction unavailable\n"));
  put(normal, "specs/004-status-mismatch/spec.md", spec("004-status-mismatch", "Mismatch", "ready"));
  put(normal, "specs/004-status-mismatch/checklist.md", checklist("004-status-mismatch", "Mismatch", "in-progress"));
  put(normal, "specs/005-checklist-precedence/spec.md", spec("005-checklist-precedence", "Precedence", "ready").replace("2026-07-13", "2026-07-20"));
  put(normal, "specs/005-checklist-precedence/checklist.md", checklist("005-checklist-precedence", "Precedence", "in-progress").replace("2026-07-14", "2026-07-10"));
  put(normal, "specs/not-numbered/spec.md", spec("not-numbered", "Ignored", "ready"));

  const generated = run(normal);
  check(generated.status === 0, `normal generation failed: ${generated.stderr}`);
  const first = readFileSync(join(normal, "specs", "INDEX.md"), "utf8");
  check(!first.includes("999-phantom") && !first.includes("not-numbered"), "stale/noncanonical rows survived");
  for (const id of ["000-bootstrap", "001-parent", "002-child", "003-missing-spec", "004-status-mismatch", "005-checklist-precedence"]) {
    check((first.match(new RegExp(`\\| ${id} \\|`, "g")) || []).length === 1, `${id} not present exactly once`);
  }
  check(first.indexOf("000-bootstrap") < first.indexOf("001-parent") && first.indexOf("001-parent") < first.indexOf("002-child"), "rows not numeric sorted");
  check(first.includes("Parent \\| initiative"), "markdown pipe was not escaped");
  check(first.includes("  - 002-child Child"), "parent-child tree missing");
  check(first.includes("002-child: state: API decision required \\| owner: human"), "awaiting-human handback missing/unsafe");
  check(first.includes("003-missing-spec: missing spec.md"), "missing artifact not surfaced");
  check(first.includes("004-status-mismatch: spec status ready differs from checklist status in-progress"), "status mismatch not surfaced");
  check(/\| 005-checklist-precedence \| Precedence \| in-progress \| new-feature \| 2026-07-10 \|/.test(first), "checklist updated/workflow/status did not take precedence");
  check(first.includes("Updated: 2026-07-14"), "updated date must derive from artifact truth");
  const secondRun = run(normal);
  check(secondRun.status === 0, "second generation failed");
  check(readFileSync(join(normal, "specs", "INDEX.md"), "utf8") === first, "second generation was not byte-identical");
  check(run(normal, ["--check"]).status === 0, "fresh index failed --check");
  writeFileSync(join(normal, "specs", "INDEX.md"), `${first}\nmanual edit\n`, "utf8");
  check(run(normal, ["--check"]).status === 1, "stale index did not fail --check");

  const unsafe = join(scratch, "unsafe");
  put(unsafe, "specs/INDEX.md", "PREVIOUS VALID INDEX\n");
  put(unsafe, "specs/010-a/spec.md", spec("010-a", "A", "ready", "011-b"));
  put(unsafe, "specs/010-a/checklist.md", checklist("010-a", "A", "in-progress"));
  put(unsafe, "specs/011-b/spec.md", spec("011-b", "B", "ready", "010-a"));
  put(unsafe, "specs/011-b/checklist.md", checklist("011-b", "B", "in-progress"));
  const rejected = run(unsafe);
  check(rejected.status === 2 && rejected.stderr.includes("parent cycle"), "cyclic truth was not rejected");
  check(readFileSync(join(unsafe, "specs", "INDEX.md"), "utf8") === "PREVIOUS VALID INDEX\n", "invalid render overwrote prior index");
  put(unsafe, "specs/011-b/spec.md", spec("011-b", "B", "ready", "null"));
  check(run(unsafe).status === 0, "repaired fixture did not regenerate");
  check(run(unsafe, ["--check"]).status === 0, "repaired fixture failed --check");

  const malformed = join(scratch, "malformed");
  put(malformed, "specs/INDEX.md", "KEEP\n");
  put(malformed, "specs/020-bad/spec.md", "# no frontmatter\n");
  const bad = run(malformed);
  check(bad.status === 2 && bad.stderr.includes("malformed or missing frontmatter"), "malformed frontmatter not rejected");
  check(readFileSync(join(malformed, "specs", "INDEX.md"), "utf8") === "KEEP\n", "malformed input overwrote index");

  const malformedList = join(scratch, "malformed-list");
  put(malformedList, "specs/INDEX.md", "KEEP LIST\n");
  put(malformedList, "specs/021-bad-list/spec.md", spec("021-bad-list", "Bad list", "ready").replace("children: []", "children: [022-child"));
  const badList = run(malformedList);
  check(badList.status === 2 && badList.stderr.includes("malformed 021-bad-list children list"), "unclosed list metadata was not rejected");
  check(readFileSync(join(malformedList, "specs", "INDEX.md"), "utf8") === "KEEP LIST\n", "malformed list overwrote index");

  const selfRelated = join(scratch, "self-related");
  put(selfRelated, "specs/INDEX.md", "KEEP SELF\n");
  put(selfRelated, "specs/022-self/spec.md", spec("022-self", "Self", "ready").replace("related: []", "related: [022-self]"));
  const badSelf = run(selfRelated);
  check(badSelf.status === 2 && badSelf.stderr.includes("self related link"), "self-related metadata was not rejected");
  check(readFileSync(join(selfRelated, "specs", "INDEX.md"), "utf8") === "KEEP SELF\n", "self-related input overwrote index");

  console.log(`next-step-improve index: PASS (${checks} directory-truth checks)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
