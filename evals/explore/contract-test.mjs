#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(root, path), "utf8");
let checks = 0;
const check = (value, message) => {
  checks += 1;
  if (!value) throw new Error(message);
};

const skill = read("skills/wf-explore/SKILL.md");
const dependency = read("skills/wf-explore/references/dependency-preflight.md");
const evidence = read("skills/wf-explore/references/evidence-and-providers.md");
const docs = read("skills/wf-explore/references/documentation-work.md");
const flat = [skill, dependency, evidence, docs].join("\n").replace(/\s+/g, " ");

check(skill.split("\n").length < 500, "SKILL.md must stay below 500 lines");
check(skill.indexOf("## Step 1 — Ask what outcome") < skill.indexOf("## Step 2 — Run the dependency preflight"), "outcome choice must precede dependency work");
check(skill.includes("If the request already names a concrete question and output") && skill.includes("Do not force a chooser"), "explicit requests must skip redundant clarification");
for (const outcome of ["Codebase map", "Trace or impact", "Documentation audit", "Create or refresh docs", "Code + docs"])
  check(skill.includes(outcome), `missing outcome choice: ${outcome}`);
for (const capability of ["`definition`", "`references`", "`flow`", "`impact`", "`architecture`", "`documentation`"])
  check(evidence.includes(capability), `missing generic capability: ${capability}`);
check(flat.includes("Assume required executables and project packages are absent until a probe succeeds"), "missing assume-absent dependency rule");
check(flat.includes("Request explicit approval before any install") && flat.includes("re-run the availability/version probe"), "missing approved-and-verified install sequence");
check(flat.includes("Never install an optional code graph") && dependency.includes("If any condition fails, skip it and use the native path"), "optional provider absence must fall back natively");
check(skill.includes("Provider and delegated output are leads, never oracles") && evidence.includes("Open the cited repository file"), "provider claims must be verified natively");
check(skill.includes("Never edit source code under this workflow"), "source implementation boundary missing");
check(docs.includes("Audit-only means read-only") && docs.includes("never promise automatic refresh"), "documentation audit/freshness boundaries missing");
check(skill.includes("`path:line` citations") && evidence.includes("repository head, index timestamp"), "citation and freshness result contract missing");
check(!/\b(?:CodeGraph|Graphify|Serena|OpenWiki|code-graph-mcp)\b/.test(flat), "vendor vocabulary leaked into portable workflow");
check(read("skills/wf-explore/agents/openai.yaml").includes("$wf-explore"), "UI prompt lost explicit skill token");

console.log(`wf-explore contract: PASS (${checks} checks)`);
