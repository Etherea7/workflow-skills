#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import { basename, join, resolve } from "node:path";

const VALID_CHECKLIST_STATUS = new Set(["in-progress", "blocked", "awaiting-human", "done"]);
const VALID_SPEC_STATUS = new Set(["draft", "clarifying", "ready", "in-progress", "blocked", "awaiting-human", "done"]);
const VALID_WORKFLOW = new Set(["plan", "new-feature", "debug", "next-step-improve", "project-setup"]);

function parseArgs(argv) {
  const options = { root: process.cwd(), check: false, projectName: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--root") options.root = argv[++index];
    else if (arg === "--project-name") options.projectName = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
    if ((arg === "--root" || arg === "--project-name") && !argv[index]) {
      throw new Error(`${arg} requires a value`);
    }
  }
  options.root = resolve(options.root);
  return options;
}

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  const text = trimmed.replace(/\s+#.*$/, "");
  return text;
}

function listValue(value, field) {
  const text = value.trim();
  if (text === "[]" || text === "null" || text === "~" || text === "") return [];
  if (text.startsWith("[") !== text.endsWith("]")) {
    throw new Error(`malformed ${field} list: ${text}`);
  }
  if (!text.startsWith("[") || !text.endsWith("]")) return [unquote(text)];
  return text.slice(1, -1).split(",").map((item) => unquote(item)).filter(Boolean);
}

function frontmatter(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) return null;
  const result = {};
  for (const line of normalized.slice(4, end).split("\n")) {
    if (!line || /^\s/.test(line) || !line.includes(":")) continue;
    const split = line.indexOf(":");
    result[line.slice(0, split).trim()] = unquote(line.slice(split + 1));
  }
  return result;
}

function readArtifact(path) {
  if (!existsSync(path)) return { exists: false, text: "", data: {}, frontmatterValid: false };
  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const parsed = frontmatter(text);
  return { exists: true, text, data: parsed || {}, frontmatterValid: parsed !== null };
}

function titleFrom(text, fallback) {
  const heading = text.split("\n").find((line) => /^#\s+/.test(line));
  if (!heading) return fallback.replace(/^\d{3}-/, "").replace(/-/g, " ");
  return heading.replace(/^#\s+/, "")
    .replace(/^(Spec|Checklist|Debug checklist)\s*[-:\u2014]\s*/i, "")
    .trim();
}

function handbackSummary(text) {
  const heading = text.search(/^## Handback\s*$/m);
  if (heading < 0) return "";
  const afterHeading = text.indexOf("\n", heading);
  const tail = text.slice(afterHeading + 1);
  const nextHeading = tail.search(/^## /m);
  const section = nextHeading < 0 ? tail : tail.slice(0, nextHeading);
  const line = section.split("\n")
    .map((item) => item.trim())
    .find((item) => /^-\s+/.test(item) && !/^(?:-\s+state:\s*(?:\.\.\.|pending)\s*)$/i.test(item));
  return line ? line.replace(/^-\s+/, "") : "";
}

function safeCell(value) {
  return String(value || "unknown").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function projectName(root, explicit) {
  if (explicit) return explicit;
  const packagePath = join(root, "package.json");
  if (existsSync(packagePath)) {
    try {
      const name = JSON.parse(readFileSync(packagePath, "utf8")).name;
      if (typeof name === "string" && name.trim()) return name.trim();
    } catch {
      // A malformed package file is unrelated to index generation; use dirname.
    }
  }
  return basename(root);
}

function collect(root) {
  const specs = join(root, "specs");
  if (!existsSync(specs)) return [];
  const ids = readdirSync(specs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{3}-[a-z0-9][a-z0-9-]*$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => Number(left.slice(0, 3)) - Number(right.slice(0, 3)) || left.localeCompare(right));

  return ids.map((id) => {
    const directory = join(specs, id);
    const spec = readArtifact(join(directory, "spec.md"));
    const checklist = readArtifact(join(directory, "checklist.md"));
    const plan = existsSync(join(directory, "plan.md"));
    const tasks = existsSync(join(directory, "tasks.md"));
    const status = checklist.data.status || spec.data.status || "missing";
    const workflow = checklist.data.workflow || spec.data.workflow || "unknown";
    const updated = checklist.data.updated || spec.data.updated || "unknown";
    return {
      id,
      title: spec.data.title || titleFrom(spec.text || checklist.text, id),
      status,
      workflow,
      updated,
      parent: listValue(spec.data.parent || "", `${id} parent`)[0] || null,
      children: listValue(spec.data.children || "[]", `${id} children`),
      related: listValue(spec.data.related || "[]", `${id} related`),
      spec,
      checklist,
      plan,
      tasks,
      handback: handbackSummary(checklist.text)
    };
  });
}

function validate(items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const attention = new Map(items.map((item) => [item.id, []]));
  const fatal = [];
  const prefixes = new Map();
  for (const item of items) {
    const prefix = item.id.slice(0, 3);
    if (prefixes.has(prefix)) fatal.push(`duplicate numeric prefix ${prefix}: ${prefixes.get(prefix)}, ${item.id}`);
    else prefixes.set(prefix, item.id);
    if (!item.spec.exists) attention.get(item.id).push("missing spec.md");
    if (!item.checklist.exists) attention.get(item.id).push("missing checklist.md");
    if (item.spec.exists && !item.spec.frontmatterValid) fatal.push(`${item.id}/spec.md has malformed or missing frontmatter`);
    if (item.checklist.exists && !item.checklist.frontmatterValid) fatal.push(`${item.id}/checklist.md has malformed or missing frontmatter`);
    if (item.spec.data.id && item.spec.data.id !== item.id) fatal.push(`${item.id}/spec.md id is ${item.spec.data.id}`);
    if (item.spec.data.status && item.checklist.data.status && item.spec.data.status !== item.checklist.data.status) {
      attention.get(item.id).push(`spec status ${item.spec.data.status} differs from checklist status ${item.checklist.data.status}`);
    }
    if (!VALID_SPEC_STATUS.has(item.status) && !VALID_CHECKLIST_STATUS.has(item.status)) {
      attention.get(item.id).push(`unknown status ${item.status}`);
    }
    if (!VALID_WORKFLOW.has(item.workflow)) attention.get(item.id).push(`unknown workflow ${item.workflow}`);
    if (["blocked", "awaiting-human"].includes(item.status)) {
      attention.get(item.id).push(item.handback || `status ${item.status}; no committed handback summary`);
    }
    if (item.parent === item.id) fatal.push(`${item.id} has a self parent link`);
    else if (item.parent && !byId.has(item.parent)) attention.get(item.id).push(`missing parent ${item.parent}`);
    for (const child of item.children) {
      if (child === item.id) fatal.push(`${item.id} has a self child link`);
      else if (!byId.has(child)) attention.get(item.id).push(`missing child ${child}`);
      else if (byId.get(child).parent !== item.id) attention.get(item.id).push(`child ${child} does not name this parent`);
    }
    for (const related of item.related) {
      if (related === item.id) fatal.push(`${item.id} has a self related link`);
      else if (!byId.has(related)) attention.get(item.id).push(`missing related ${related}`);
    }
  }

  for (const item of items) {
    const seen = new Set([item.id]);
    let cursor = item;
    while (cursor.parent && byId.has(cursor.parent)) {
      if (seen.has(cursor.parent)) {
        fatal.push(`${item.id} has a parent cycle through ${cursor.parent}`);
        break;
      }
      seen.add(cursor.parent);
      cursor = byId.get(cursor.parent);
    }
  }
  return { byId, attention, fatal: [...new Set(fatal)] };
}

function inventorySignature(root) {
  const specs = join(root, "specs");
  const hash = createHash("sha256");
  if (!existsSync(specs)) return hash.update("missing-specs").digest("hex");
  const directories = readdirSync(specs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{3}-[a-z0-9][a-z0-9-]*$/.test(entry.name))
    .map((entry) => entry.name).sort();
  for (const id of directories) {
    hash.update(id);
    for (const file of ["spec.md", "plan.md", "tasks.md", "checklist.md"]) {
      const path = join(specs, id, file);
      hash.update(file);
      hash.update(existsSync(path) ? readFileSync(path) : Buffer.from("<missing>"));
    }
  }
  return hash.digest("hex");
}

function links(item) {
  const values = [];
  if (item.spec.exists) values.push(`[spec](${item.id}/spec.md)`);
  if (item.plan) values.push(`[plan](${item.id}/plan.md)`);
  if (item.tasks) values.push(`[tasks](${item.id}/tasks.md)`);
  if (item.checklist.exists) values.push(`[checklist](${item.id}/checklist.md)`);
  return values.length ? values.join(" · ") : "-";
}

function renderTree(items, byId) {
  const children = new Map(items.map((item) => [item.id, []]));
  for (const item of items) {
    if (item.parent && byId.has(item.parent) && item.parent !== item.id) children.get(item.parent).push(item.id);
  }
  for (const values of children.values()) values.sort();
  const lines = [];
  const visited = new Set();
  const visit = (id, depth, path) => {
    if (path.has(id)) return;
    const item = byId.get(id);
    lines.push(`${"  ".repeat(depth)}- ${id} ${safeCell(item.title)}`);
    visited.add(id);
    const nextPath = new Set(path).add(id);
    for (const child of children.get(id)) visit(child, depth + 1, nextPath);
  };
  for (const item of items.filter((entry) => !entry.parent || !byId.has(entry.parent))) visit(item.id, 0, new Set());
  for (const item of items) if (!visited.has(item.id)) visit(item.id, 0, new Set());
  return lines.length ? lines : ["- No numbered spec directories found."];
}

function render(root, explicitProjectName) {
  const items = collect(root);
  const { byId, attention, fatal } = validate(items);
  if (fatal.length) throw new Error(`invalid directory truth:\n- ${fatal.join("\n- ")}`);
  const updated = items.map((item) => item.updated).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).sort().at(-1) || "unknown";
  const lines = [
    "<!-- GENERATED by next-step-improve - regenerate from specs/ directory contents.",
    "     Do not hand-edit; edits will be overwritten. -->",
    "",
    `# Specs index - ${safeCell(projectName(root, explicitProjectName))}`,
    "",
    `Updated: ${updated}`,
    "",
    "| ID | Title | Status | Workflow | Updated | Links |",
    "|---|---|---|---|---|---|"
  ];
  for (const item of items) {
    lines.push(`| ${item.id} | ${safeCell(item.title)} | ${safeCell(item.status)} | ${safeCell(item.workflow)} | ${safeCell(item.updated)} | ${links(item)} |`);
  }
  lines.push("", "## Tree", "", ...renderTree(items, byId), "", "## Attention needed", "");
  const attentionLines = [];
  for (const item of items) {
    for (const issue of [...new Set(attention.get(item.id))]) attentionLines.push(`- ${item.id}: ${safeCell(issue)}`);
  }
  lines.push(...(attentionLines.length ? attentionLines : ["- None."]), "");
  return lines.join("\n");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const specs = join(options.root, "specs");
  const output = join(specs, "INDEX.md");
  const before = inventorySignature(options.root);
  const expected = render(options.root, options.projectName);
  const after = inventorySignature(options.root);
  if (before !== after) throw new Error("specs directory changed during generation; rerun from fresh truth");
  if (options.check) {
    const actual = existsSync(output) ? readFileSync(output, "utf8").replace(/\r\n/g, "\n") : "";
    if (actual !== expected) {
      console.error(`index check: STALE ${output}`);
      process.exit(1);
    }
    console.log(`index check: PASS (${collect(options.root).length} entries)`);
    return;
  }
  mkdirSync(specs, { recursive: true });
  writeFileSync(output, expected, "utf8");
  console.log(`index regenerate: WROTE ${output} (${collect(options.root).length} entries)`);
}

try {
  main();
} catch (error) {
  console.error(`index regenerate: ERROR ${error.message}`);
  process.exit(2);
}
