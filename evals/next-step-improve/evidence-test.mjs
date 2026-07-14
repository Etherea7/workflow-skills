#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { makeSuite } from "../lib/test-kit.mjs";

const { root, checkThrow } = makeSuite(import.meta.url);
const artifacts = join(root, "evals", "next-step-improve", "evidence", "artifacts");
const scratch = mkdtempSync(join(tmpdir(), "dwv-m4-evidence-"));
let checks = 0;
const check = (condition, message) => { checks += 1; checkThrow(condition, message); };
const git = (args, cwd = root) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout;
};
const cases = [
  {
    name: "fresh-with-skill",
    refs: ["46bd74cc5a267c26e97883c02cff3487b30539d2 refs/heads/improve/005-improvement-survey", "2e2f34fe9ef0e1d3ce791b8118ec3638e1d2ea12 refs/heads/main"],
    commits: ["2e2f34f", "c860165", "46bd74c"],
    checklist: "46bd74c:specs/005-improvement-survey/checklist.md",
    checklistHas: ["status: awaiting-human", "role: explorer", "| P5 |", "artifact commit `c860165"],
    transcriptHas: ["index check: PASS (6 entries)", "secrets-check: clean", "46bd74c"]
  },
  {
    name: "fresh-baseline",
    refs: ["43f3a881c6a84d1cc69b0c3b6537070b1b983584 refs/heads/main"],
    commits: ["43f3a88"],
    transcriptHas: ["M specs/INDEX.md", "Choose `1`, `2`, `3`"],
    patchHash: "3636f0829b521fb929a1694f4d4c275ca2d04d778d76a5b8699458a6bd1a1c92"
  },
  {
    name: "resume-with-skill",
    refs: ["962225662d1a8bab3f0e29d8b6881a8a7f50f481 refs/heads/improve/005-improvement-survey", "a3973c6c9c1c6735219d58b601bcad4a41dcc452 refs/heads/main"],
    commits: ["a3973c6", "fde4438", "3a4e027", "bbe44cb", "d2d5076", "f0633af", "970b105", "30ca480", "9622256"],
    checklist: "9622256:specs/005-improvement-survey/checklist.md",
    checklistHas: ["human decision: selected P2", "specs/006-cli-json-contract/spec.md", "index check: seven entries, pass", "main remains a3973c6"],
    child: "9622256:specs/006-cli-json-contract/checklist.md",
    childHas: ["status: awaiting-human", "Q1-Q4", "artifact commit: f0633af"],
    transcriptHas: ["index check: PASS (7 entries)", "credential scan: clean", "9622256"]
  },
  {
    name: "resume-baseline",
    refs: ["5991c27b49543a38965a621831a80d2996ba11e3 refs/heads/improve/005-improvement-survey", "7901470008cd999526905835df3f74db032e2f17 refs/heads/plan/003-cli-json", "e30045a9c40fba7ba418cd5e8f4aa2e984b79adf refs/heads/main"],
    commits: ["e30045a", "674b3ee", "92f65aa", "baa4662", "0ead15e", "7901470", "6480d61", "5991c27"],
    checklist: "5991c27:specs/005-improvement-survey/checklist.md",
    checklistHas: ["human decision: selected P2", "plan/003-cli-json", "Scan and persist the selected decision", "protected main remains e30045a"],
    child: "5991c27:specs/003-cli-json/checklist.md",
    childHas: ["status: awaiting-human", "D1", "D7"],
    transcriptHas: ["Specs index check: PASS (6 directory-derived rows)", "Staged added-lines credential scan: PASS", "5991c27"]
  }
];

try {
  for (const item of cases) {
    const bundle = join(artifacts, `${item.name}.bundle`);
    git(["bundle", "verify", bundle]);
    const heads = git(["bundle", "list-heads", bundle]);
    for (const ref of item.refs) check(heads.includes(ref), `${item.name}: missing bundle ref ${ref}`);
    const clone = join(scratch, item.name);
    git(["clone", "--quiet", "--no-checkout", bundle, clone], scratch);
    for (const commit of item.commits) git(["cat-file", "-e", `${commit}^{commit}`], clone);
    if (item.checklist) {
      const text = git(["show", item.checklist], clone);
      for (const marker of item.checklistHas) check(text.includes(marker), `${item.name}: survey checklist missing ${marker}`);
    }
    if (item.child) {
      const text = git(["show", item.child], clone);
      for (const marker of item.childHas) check(text.includes(marker), `${item.name}: child checklist missing ${marker}`);
    }
    const transcript = readFileSync(join(artifacts, `${item.name}-executor.txt`), "utf8");
    check(!/C:[\\/]Users[\\/]65876/i.test(transcript), `${item.name}: ordinary user path remains`);
    check(!/C:\\\\Users\\\\65876/i.test(transcript), `${item.name}: escaped user path remains`);
    check(!/C:[\\/]Users[\\/]65876/i.test(transcript.replace(/\\\\/g, "\\")), `${item.name}: mixed escaped user path remains`);
    for (const marker of item.transcriptHas) check(transcript.includes(marker), `${item.name}: transcript missing ${marker}`);
    if (item.patchHash) {
      const patch = readFileSync(join(artifacts, `${item.name}-working.patch`));
      check(createHash("sha256").update(patch).digest("hex") === item.patchHash, `${item.name}: working patch hash drift`);
      check(patch.toString("utf8").includes("specs/INDEX.md"), `${item.name}: working patch does not preserve INDEX edit`);
    }
  }
  const results = JSON.parse(readFileSync(join(root, "evals", "next-step-improve", "live-results-i1.json"), "utf8"));
  check(results.totals.with_skill.passed === 12 && results.totals.baseline.passed === 5, "live result totals drifted");
  console.log(`next-step-improve durable evidence: PASS (${checks} bundle/transcript/grade checks)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
