#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg || !outputArg) {
  console.error("usage: sanitize-evidence.mjs <input-transcript> <output-transcript>");
  process.exit(2);
}
const input = resolve(inputArg);
const output = resolve(outputArg);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const variants = (value) => [...new Set([
  value,
  value.replace(/\\/g, "/"),
  value.replace(/\\/g, "\\\\")
])].sort((left, right) => right.length - left.length);

let text = readFileSync(input, "utf8").replace(/\0/g, "").replace(/\r\n/g, "\n");
for (const [value, replacement] of [
  [process.env.TEMP, "%TEMP%"],
  [process.env.TMP, "%TEMP%"],
  [process.env.USERPROFILE, "%USERPROFILE%"]
]) {
  if (!value) continue;
  for (const form of variants(resolve(value))) {
    text = text.replace(new RegExp(escapeRegex(form), "gi"), replacement);
  }
}
text = text.split("\n").map((line) => line.replace(/[ \t]+$/g, "")).join("\n").replace(/\n*$/, "\n");
if (/C:[\\/]Users[\\/]/i.test(text) || /C:\\\\Users\\\\/i.test(text)) {
  throw new Error("sanitized transcript still contains an ordinary or escaped user-profile path");
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, text, "utf8");
console.log(`sanitized transcript: ${output}`);
