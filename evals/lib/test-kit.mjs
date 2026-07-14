// Shared scaffolding for the deterministic evals suites: repo-root
// resolution, prose/raw file reads, a pass/fail check accumulator (or
// fail-fast variant), and a final report-and-exit tail. Extracted from
// fifteen near-identical copies so cross-cutting fixes (CRLF handling,
// output formatting, exit-code conventions) land in one place.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function makeSuite(importMetaUrl, { depth = 2 } = {}) {
  const root = join(dirname(fileURLToPath(importMetaUrl)), ...Array(depth).fill(".."));

  // Prose/source reads: normalize CRLF so suites are stable regardless of
  // the checkout's line-ending configuration.
  const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");

  // Byte-exact reads for hashing or byte-for-byte comparison — no CRLF
  // normalization, since that would change the bytes being verified.
  const readRaw = (path) => readFileSync(join(root, path));

  const errors = [];
  let checks = 0;

  // Accumulator variant: records every failure and keeps going.
  const check = (condition, message) => {
    checks += 1;
    if (!condition) errors.push(message);
  };

  // Fail-fast variant: throws on the first failure.
  const checkThrow = (condition, message) => {
    checks += 1;
    if (!condition) throw new Error(message);
  };

  // Reproduces the existing accumulator-suite tail exactly: FAIL lines to
  // stderr and exit 1 if anything failed, else a PASS summary and exit 0.
  const report = (suiteName, unitsLabel) => {
    if (errors.length) {
      errors.forEach((error) => console.error(`FAIL: ${error}`));
      process.exit(1);
    }
    console.log(`${suiteName}: PASS (${checks} ${unitsLabel})`);
    process.exit(0);
  };

  return { root, read, readRaw, check, checkThrow, report };
}
