#!/usr/bin/env node
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const [destArg, config = "with-skill"] = process.argv.slice(2);
if (!destArg || !["with-skill", "baseline"].includes(config)) {
  console.error("usage: build-success-fixture.mjs <dest> <with-skill|baseline>");
  process.exit(2);
}
const dest = resolve(destArg);
if (!/[\\/]dwv[\\/]m3-live[\\/]/i.test(dest)) {
  console.error(`refusing fixture path outside .../dwv/m3-live/: ${dest}`);
  process.exit(2);
}
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const run = (args) => {
  const result = spawnSync("git", args, { cwd: dest, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`git ${args.join(" ")} failed\n${result.stdout}${result.stderr}`);
    process.exit(result.status ?? 1);
  }
  return result.stdout.trim();
};
const put = (path, text) => {
  const full = join(dest, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, "utf8");
};

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
put("package.json", JSON.stringify({ type: "module", scripts: { test: "node --test" } }, null, 2) + "\n");
put(".gitignore", ".worktrees/\nnode_modules/\n");
put("AGENTS.md", "# Fixture rules\n\nBAILOUT_N = 3. Protected branches: main, master, release/*. Test: `npm test`. No network.\n");
put("src/index.js", `export function parsePort(value) {
  const port = Number.parseInt(value, 10);
  if (!port || port < 0 || port > 65535) throw new RangeError("port must be 0..65535");
  return port;
}
`);
put("test/regression.test.js", `import test from "node:test";
import assert from "node:assert/strict";
import { parsePort } from "../src/index.js";
test("nonzero port parses", () => assert.equal(parsePort("8080"), 8080));
test("out-of-range port throws", () => assert.throws(() => parsePort("70000"), RangeError));
`);
put("docs/ports.md", "# Port parsing\n\n`parsePort(value)` accepts integer ports from 0 through 65535 inclusive and throws `RangeError` outside that range.\n");
if (config === "with-skill") {
  cpSync(join(repoRoot, "skills", "debug"), join(dest, ".agents", "skills", "debug"), { recursive: true });
}
run(["init", "-b", "main"]);
run(["config", "user.name", "Eval Bot"]);
run(["config", "user.email", "eval@example.invalid"]);
run(["add", "."]);
run(["commit", "-m", "chore: seed successful-debug fixture"]);
run(["checkout", "-b", "develop"]);
console.log(JSON.stringify({ config, repo: dest, destination: "develop", initialDestination: run(["rev-parse", "develop"]), main: run(["rev-parse", "main"]) }));
