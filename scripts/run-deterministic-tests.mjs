#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const evals = join(root, "evals");
const ignored = new Set([".git", ".worktrees", "node_modules", "__pycache__"]);

export function discoverTests(start = evals) {
  const found = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (ignored.has(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/-test\.(?:mjs|py)$/.test(entry.name)) found.push(path);
    }
  }
  if (existsSync(start)) walk(start);
  return found.sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
}

function resolvePython() {
  for (const candidate of [
    { command: "python3", prefix: [] },
    { command: "python", prefix: [] },
    { command: "py", prefix: ["-3"] }
  ]) {
    const probe = spawnSync(candidate.command, [...candidate.prefix, "--version"], { stdio: "ignore" });
    if (probe.status === 0) return candidate;
  }
  return null;
}

export function runTests(tests = discoverTests()) {
  const pythonTests = tests.filter((path) => extname(path) === ".py");
  const python = pythonTests.length ? resolvePython() : null;
  if (pythonTests.length && !python) throw new Error("Python tests exist but no usable python3, python, or py -3 interpreter was found");
  for (const [index, path] of tests.entries()) {
    const label = relative(root, path).replaceAll("\\", "/");
    console.log(`[${index + 1}/${tests.length}] ${label}`);
    const command = extname(path) === ".mjs" ? process.execPath : python.command;
    const args = extname(path) === ".mjs" ? [path] : [...python.prefix, path];
    const result = spawnSync(command, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${label} failed with exit ${result.status}`);
  }
  console.log(`deterministic tests: PASS (${tests.length} files)`);
  return tests.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { runTests(); } catch (error) { console.error(`deterministic tests: FAIL: ${error.message}`); process.exit(1); }
}
