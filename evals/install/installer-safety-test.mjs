#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const installer = join(root, "install.sh");
const bash = process.env.BASH_PATH || [
  "C:\\Program Files\\Git\\bin\\bash.exe", "/bin/bash"
].find(existsSync);
if (!bash) throw new Error("Bash is required for installer safety tests");
const names = ["wf-debug", "wf-feature", "wf-improve", "wf-plan", "wf-setup"];
const scratch = mkdtempSync(join(tmpdir(), "dwv-install-test-"));
let checks = 0;
const check = (value, message) => { checks += 1; if (!value) throw new Error(message); };

function fixture(label) {
  const base = join(scratch, label);
  const paths = {
    base,
    claude: join(base, "claude-skills"),
    agents: join(base, "agents-skills"),
    rules: join(base, "claude-rules"),
    codex: join(base, "codex", "AGENTS.md")
  };
  mkdirSync(dirname(paths.codex), { recursive: true });
  writeFileSync(paths.codex, "user content\n", "utf8");
  return paths;
}

function run(paths, args = [], extra = {}) {
  return spawnSync(bash, [installer, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: paths.base,
      CLAUDE_SKILLS_DIR: paths.claude,
      AGENTS_SKILLS_DIR: paths.agents,
      CLAUDE_RULES_DIR: paths.rules,
      CODEX_AGENTS_FILE: paths.codex,
      ...extra
    }
  });
}

function dirs(path) {
  return existsSync(path) ? readdirSync(path, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !item.name.startsWith(".dev-workflows-"))
    .map((item) => item.name).sort() : [];
}

function ownedAt(path) {
  cpSync(join(root, "skills", "wf-debug"), path, { recursive: true });
}

try {
  const normal = fixture("normal");
  let result = run(normal);
  check(result.status === 0, `first install failed: ${result.stderr}`);
  check(JSON.stringify(dirs(normal.claude)) === JSON.stringify(names), "Claude did not receive exactly five namespaced skills");
  check(JSON.stringify(dirs(normal.agents)) === JSON.stringify(names), "Codex did not receive exactly five namespaced skills");
  writeFileSync(join(normal.claude, "wf-debug", "local-only.txt"), "stale", "utf8");
  result = run(normal);
  check(result.status === 0 && !existsSync(join(normal.claude, "wf-debug", "local-only.txt")), "reinstall did not replace an owned copy");
  result = run(normal, ["--uninstall"]);
  check(result.status === 0 && dirs(normal.claude).length === 0 && dirs(normal.agents).length === 0, "uninstall did not remove managed current copies");
  check(readFileSync(normal.codex, "utf8").includes("user content"), "uninstall damaged unrelated Codex rules content");

  const collision = fixture("collision");
  mkdirSync(join(collision.claude, "wf-debug"), { recursive: true });
  writeFileSync(join(collision.claude, "wf-debug", "SKILL.md"), "---\nname: personal\n---\n", "utf8");
  result = run(collision);
  check(result.status !== 0 && result.stderr.includes("refusing to replace unowned skill"), "unowned current collision was not rejected");
  check(dirs(collision.agents).length === 0 && !existsSync(join(collision.rules, "dev-workflows.md")), "collision was not fail-before-write");

  const legacy = fixture("legacy");
  ownedAt(join(legacy.claude, "debug"));
  mkdirSync(join(legacy.agents, "debug"), { recursive: true });
  writeFileSync(join(legacy.agents, "debug", "SKILL.md"), "---\nname: debug\n---\nbody suite: dev-workflows\n", "utf8");
  result = run(legacy);
  check(result.status === 0 && !existsSync(join(legacy.claude, "debug")), "owned legacy directory was not removed after upgrade");
  check(existsSync(join(legacy.agents, "debug")) && result.stderr.includes("preserving unowned legacy"), "unowned legacy directory was not preserved with warning");

  const malformed = fixture("malformed");
  mkdirSync(join(malformed.claude, "wf-debug"), { recursive: true });
  writeFileSync(join(malformed.claude, "wf-debug", "SKILL.md"), "---\nname: wf-debug\nmetadata:\n  suite: dev-workflows\n", "utf8");
  result = run(malformed);
  check(result.status !== 0 && existsSync(join(malformed.claude, "wf-debug")), "unclosed frontmatter authorized replacement");
  result = run(malformed, ["--uninstall"]);
  check(result.status === 0 && existsSync(join(malformed.claude, "wf-debug")), "unclosed frontmatter authorized deletion");

  const nested = fixture("nested-marker");
  mkdirSync(join(nested.claude, "wf-debug"), { recursive: true });
  writeFileSync(join(nested.claude, "wf-debug", "SKILL.md"), "---\nname: wf-debug\nmetadata:\n  example:\n    suite: dev-workflows\n---\n", "utf8");
  result = run(nested);
  check(result.status !== 0 && existsSync(join(nested.claude, "wf-debug")), "nested example marker authorized replacement as direct ownership");

  const rulesCollision = fixture("rules-collision");
  mkdirSync(rulesCollision.rules, { recursive: true });
  const personalRules = "personal rules\n";
  writeFileSync(join(rulesCollision.rules, "dev-workflows.md"), personalRules, "utf8");
  result = run(rulesCollision);
  check(result.status !== 0 && dirs(rulesCollision.claude).length === 0, "unowned Claude rules collision was not fail-before-write");
  result = run(rulesCollision, ["--uninstall"]);
  check(readFileSync(join(rulesCollision.rules, "dev-workflows.md"), "utf8") === personalRules && result.stderr.includes("preserving unowned rules"), "uninstall did not preserve unowned Claude rules");

  const rollback = fixture("rollback");
  result = run(rollback);
  check(result.status === 0, "rollback fixture install failed");
  writeFileSync(join(rollback.claude, "wf-debug", "sentinel.txt"), "before\n", "utf8");
  ownedAt(join(rollback.claude, "debug"));
  const beforeRules = readFileSync(join(rollback.rules, "dev-workflows.md"), "utf8");
  const beforeCodex = readFileSync(rollback.codex, "utf8");
  result = run(rollback, [], {
    DEV_WORKFLOWS_INSTALL_TESTING: "1",
    DEV_WORKFLOWS_INSTALL_FAIL_POINT: "after-first-skill-swap"
  });
  check(result.status !== 0 && result.stderr.includes("rolled back all changes"), "injected swap failure did not report rollback");
  check(readFileSync(join(rollback.claude, "wf-debug", "sentinel.txt"), "utf8") === "before\n", "rollback did not restore the first swapped skill byte-for-byte");
  check(readFileSync(join(rollback.rules, "dev-workflows.md"), "utf8") === beforeRules && readFileSync(rollback.codex, "utf8") === beforeCodex, "rollback changed rules files");
  check(existsSync(join(rollback.claude, "debug")), "rollback removed owned legacy before success");

  console.log(`installer safety: PASS (${checks} ownership/atomicity checks)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
