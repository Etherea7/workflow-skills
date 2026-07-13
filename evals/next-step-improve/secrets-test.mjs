#!/usr/bin/env node
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const script = join(root, "scripts", "secrets-check.sh");
const bash = process.env.BASH_PATH || [
  "C:\\Program Files\\Git\\bin\\bash.exe",
  "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
  "/bin/bash"
].find(existsSync);
if (!bash) throw new Error("Bash is required for the credential-scanner contract test");

const scratch = mkdtempSync(join(tmpdir(), "dwv-secrets-test-"));
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) throw new Error(message); };
const git = (...args) => {
  const result = spawnSync("git", args, { cwd: scratch, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
};
const scan = (env = {}) => spawnSync(bash, [script], {
  cwd: scratch,
  encoding: "utf8",
  env: { ...process.env, ...env }
});

try {
  git("init", "-q", "-b", "main");
  git("config", "user.email", "eval@example.invalid");
  git("config", "user.name", "Eval Fixture");
  writeFileSync(join(scratch, "README.md"), "fixture\n", "utf8");
  git("add", "README.md");
  git("commit", "-q", "-m", "chore: seed fixture");

  const empty = scan();
  check(empty.status === 0 && empty.stdout.includes("nothing staged"), "clean repository did not pass as empty");

  const brokenGit = scan({ GIT_DIR: join(scratch, "definitely-missing-git-dir") });
  check(brokenGit.status === 2, "git failure did not fail closed with exit 2");
  check(brokenGit.stderr.includes("git diff failed; refusing to pass"), "git failure did not report fail-closed reason");

  const syntheticCredential = "AKIA" + "A".repeat(16);
  writeFileSync(join(scratch, "unsafe.txt"), `${syntheticCredential}\n`, "utf8");
  git("add", "unsafe.txt");
  const brokenFilter = scan({ GREP_OPTIONS: "--definitely-invalid" });
  check(brokenFilter.status === 2 && brokenFilter.stderr.includes("pattern matching failed; refusing to pass"), "pattern-filter failure did not fail closed");
  const detected = scan();
  check(detected.status === 1 && detected.stderr.includes("POTENTIAL SECRETS"), "matching staged addition was not rejected");
  check(detected.stderr.includes("class: aws-access-key"), "matching staged addition did not report a stable class label");
  check(!detected.stdout.includes(syntheticCredential), "synthetic credential leaked to stdout");
  check(!detected.stderr.includes(syntheticCredential), "synthetic credential leaked to stderr");

  console.log(`secrets-check: PASS (${checks} fail-closed/detection checks)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
