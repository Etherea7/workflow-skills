#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const artifacts = join(root, "evals", "debug", "evidence", "artifacts");
const scratch = mkdtempSync(join(tmpdir(), "dwv-debug-evidence-"));
let checks = 0;

const assert = (condition, message) => {
  checks += 1;
  if (!condition) throw new Error(message);
};
const git = (args, cwd = root) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout;
};

const cases = [
  {
    name: "i3-bailout-with-skill",
    ref: "refs/heads/debug/004-pagination-boundary",
    refHead: "33e01f73a204b87f68a7907a0ba1c37b89d49172",
    commits: ["b41ac82", "2674caa", "430325c", "33e01f7"],
    checklist: "33e01f7:specs/004-pagination-boundary/checklist.md",
    checklistHas: ["status: awaiting-human", "attempt 3/3", "- supported facts:", "- remaining hypotheses", "- recommended next human decision:"],
    checklistLacks: ["attempt 4/3"],
    transcriptHas: ["# fail 1", "33e01f7"]
  },
  {
    name: "i3-bailout-baseline",
    ref: "refs/heads/debug/004-pagination-boundary",
    refHead: "1c43db0323a60e85d6e3ae075147bc8f0a3aae65",
    commits: ["28c01ac", "8f57f48", "1c43db0"],
    checklist: "1c43db0:specs/004-pagination-boundary/checklist.md",
    checklistHas: ["status: blocked", "attempt 3/3"],
    checklistLacks: ["status: awaiting-human", "attempt 4/3"],
    transcriptHas: ["# fail 1", "status: blocked"]
  },
  {
    name: "i4-success-with-skill",
    ref: "refs/heads/develop",
    refHead: "04938d23abbd787e9a7789dc9b0682fc2bba6a19",
    commits: ["ed68d36", "bdb81f7", "64d22c8", "8c9985c", "8123731", "7fa13f8", "596fac0", "7e6a36c", "04938d2"],
    checklist: "04938d2:specs/001-parseport-string-zero/checklist.md",
    checklistHas: ["status: done", "### Delegation evidence", "orchestrator citation validation", "cleanup/retained state"],
    checklistLacks: [],
    transcriptHas: ["# fail 1", "# pass 3", "boundary probes passed", "04938d2"]
  },
  {
    name: "i4-success-baseline",
    ref: "refs/heads/develop",
    refHead: "18f857bfdabf6900150f825ddf4b1f91fb5e0417",
    commits: ["cf0d3b6", "18f857b"],
    transcriptHas: ["# fail 1", "# pass 3", "boundary probes passed", "18f857b"]
  }
];

try {
  for (const item of cases) {
    const bundle = join(artifacts, `${item.name}.bundle`);
    const transcriptPath = join(artifacts, `${item.name}-executor.txt`);
    git(["bundle", "verify", bundle]);
    const heads = git(["bundle", "list-heads", bundle]);
    assert(heads.includes(`${item.refHead} ${item.ref}`), `${item.name}: expected bundle ref missing`);

    const clone = join(scratch, item.name);
    git(["clone", "--quiet", bundle, clone], scratch);
    for (const commit of item.commits) git(["cat-file", "-e", `${commit}^{commit}`], clone);

    if (item.checklist) {
      const checklist = git(["show", item.checklist], clone);
      for (const text of item.checklistHas) assert(checklist.includes(text), `${item.name}: checklist missing ${text}`);
      for (const text of item.checklistLacks) assert(!checklist.includes(text), `${item.name}: checklist unexpectedly contains ${text}`);
    }

    const transcript = readFileSync(transcriptPath, "utf8");
    assert(!/C:[\\/]Users[\\/]65876/i.test(transcript), `${item.name}: transcript contains ordinary unsanitized user path`);
    assert(!/C:\\\\Users\\\\65876/i.test(transcript), `${item.name}: transcript contains escaped unsanitized user path`);
    for (const text of item.transcriptHas) assert(transcript.includes(text), `${item.name}: transcript missing ${text}`);
  }
  console.log(`debug durable evidence: PASS (${checks} bundle/transcript checks; all cited commits readable)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
