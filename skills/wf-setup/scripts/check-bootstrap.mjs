#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const target = resolve(process.argv[2] ?? ".");
const required = [
  "AGENTS.md",
  "CLAUDE.md",
  ".gitignore",
  "docs/CONSTITUTION.md",
  "specs/INDEX.md",
  "specs/000-bootstrap/spec.md",
  "specs/000-bootstrap/plan.md",
  "specs/000-bootstrap/tasks.md",
  "specs/000-bootstrap/checklist.md",
];
const errors = [];
const text = new Map();

for (const relative of required) {
  const path = join(target, relative);
  if (!existsSync(path)) {
    errors.push(`missing required file: ${relative}`);
    continue;
  }
  const content = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  text.set(relative, content);
  if (/\{\{[^}\n]+\}\}/.test(content)) errors.push(`unresolved template marker: ${relative}`);
}

const has = (file, pattern, message) => {
  if (text.has(file) && !pattern.test(text.get(file))) errors.push(`${file}: ${message}`);
};

has(".gitignore", /^(?:\/)?\.worktrees\/$/m, "must ignore .worktrees/");
has("AGENTS.md", /docs\/CONSTITUTION\.md/, "must link the constitution");
has("AGENTS.md", /^## Commands$/m, "must record exact commands");
has("AGENTS.md", /^## Stack$/m, "must record the stack");
has("AGENTS.md", /^## Branch policy$/m, "must record branch policy");
has("AGENTS.md", /Protected:[\s\S]*`main`/, "must identify protected main");
has("AGENTS.md", /BAILOUT_N:\s*[1-9][0-9]*/, "must record a positive BAILOUT_N");
has("AGENTS.md", /specs\/NNN-slug/, "must record artifact layout");
has("AGENTS.md", /Update `docs\//, "must record docs policy");

if (text.has("CLAUDE.md")) {
  const effective = text.get("CLAUDE.md").replace(/<!--[\s\S]*?-->/g, "")
    .split("\n").map((line) => line.trim()).find(Boolean);
  if (effective !== "@AGENTS.md") errors.push("CLAUDE.md: first effective line must be @AGENTS.md");
}

has("specs/000-bootstrap/spec.md", /^id:\s*000-bootstrap$/m, "id must be 000-bootstrap");
has("specs/000-bootstrap/spec.md", /no commit|uncommitted|before the first\s+commit/i,
  "must state the pre-commit development-loop gate");
has("specs/000-bootstrap/checklist.md", /^work:\s*000-bootstrap$/m, "work must be 000-bootstrap");
has("specs/000-bootstrap/checklist.md", /^workflow:\s*project-setup$/m, "workflow must be project-setup");
has("specs/000-bootstrap/checklist.md", /branch:\s*`setup\/000-bootstrap`/, "must record setup branch");
has("specs/000-bootstrap/checklist.md", /^## Development-loop gates/m, "must contain dev-loop gates");
has("specs/INDEX.md", /^\| 000-bootstrap \|.*\| project-setup \|/m,
  "must contain the bootstrap project-setup row");

if (text.has("specs/000-bootstrap/spec.md") && text.has("specs/000-bootstrap/checklist.md") && text.has("specs/INDEX.md")) {
  const specStatus = text.get("specs/000-bootstrap/spec.md").match(/^status:\s*([^\s#]+).*$/m)?.[1];
  const checklistStatus = text.get("specs/000-bootstrap/checklist.md").match(/^status:\s*([^\s#]+).*$/m)?.[1];
  const indexStatus = text.get("specs/INDEX.md").match(/^\| 000-bootstrap \|[^|]*\|\s*([^|\s]+)\s*\|/m)?.[1];
  if (!specStatus || specStatus !== checklistStatus || specStatus !== indexStatus) {
    errors.push("bootstrap status must agree across spec.md, checklist.md, and INDEX.md");
  }
  if (specStatus === "done") {
    for (const relative of ["specs/000-bootstrap/spec.md", "specs/000-bootstrap/tasks.md", "specs/000-bootstrap/checklist.md"]) {
      if (/^- \[ \]/m.test(text.get(relative))) errors.push(`${relative}: done bootstrap cannot contain unchecked items`);
    }
    if (/bootstrap is in progress/i.test(text.get("specs/INDEX.md"))) {
      errors.push("specs/INDEX.md: done bootstrap cannot retain in-progress attention text");
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exit(1);
}
console.log(`project-setup structure: PASS (${required.length} files checked at ${target})`);
