#!/usr/bin/env node
// Format gate for this repo: validates skills against the Agent Skills spec
// (agentskills.io/specification) plus suite conventions. No dependencies.
// Exit 0 = pass, 1 = violations found.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const notes = [];
const expectedSkills = ["wf-debug", "wf-design", "wf-explore", "wf-feature", "wf-improve", "wf-plan", "wf-setup"];
const legacySkills = ["debug", "new-feature", "next-step-improve", "plan", "project-setup"];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const fields = {};
  let current = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) {
      current = kv[1];
      fields[current] = kv[2].trim();
    } else if (current && /^\s+\S/.test(line)) {
      fields[current] += " " + line.trim(); // folded multi-line value
    }
  }
  return { fields, raw: m[0] };
}

// --- skills/ ---
const skillsDir = join(root, "skills");
if (!existsSync(skillsDir)) {
  notes.push("skills/ does not exist yet (pre-M1 state) — skipping skill checks");
} else {
  const dirs = readdirSync(skillsDir).filter((d) =>
    statSync(join(skillsDir, d)).isDirectory()
  ).sort();
  if (JSON.stringify(dirs) !== JSON.stringify(expectedSkills))
    errors.push(`skills/: expected exactly ${expectedSkills.join(", ")}; found ${dirs.join(", ") || "none"}`);
  for (const legacy of legacySkills) {
    if (existsSync(join(skillsDir, legacy))) errors.push(`skills/: legacy public directory still exists: ${legacy}`);
  }
  if (dirs.length === 0) notes.push("skills/ is empty — skipping skill checks");
  for (const dir of dirs) {
    const where = `skills/${dir}`;
    const skillFile = join(skillsDir, dir, "SKILL.md");
    if (!existsSync(skillFile)) {
      errors.push(`${where}: missing SKILL.md`);
      continue;
    }
    const text = readFileSync(skillFile, "utf8");
    const fm = parseFrontmatter(text);
    if (!fm) {
      errors.push(`${where}: SKILL.md has no YAML frontmatter block`);
      continue;
    }
    const { name, description } = fm.fields;
    if (!name) errors.push(`${where}: frontmatter missing required 'name'`);
    if (!description) errors.push(`${where}: frontmatter missing required 'description'`);
    if (name) {
      if (name !== dir) errors.push(`${where}: name '${name}' != directory name '${dir}'`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
        errors.push(`${where}: name '${name}' violates kebab-case rules`);
      if (name.length > 64) errors.push(`${where}: name exceeds 64 chars`);
    }
    if (description) {
      if (description.length > 1024)
        errors.push(`${where}: description exceeds 1024 chars (${description.length})`);
      if (description.length < 40)
        notes.push(`${where}: description is short (${description.length} chars) — pushy descriptions trigger better`);
    }
    const lines = text.split(/\r?\n/).length;
    if (lines > 500)
      errors.push(`${where}: SKILL.md is ${lines} lines (limit 500 — move depth to references/)`);

    const agentConfig = join(skillsDir, dir, "agents", "openai.yaml");
    if (!existsSync(agentConfig)) {
      errors.push(`${where}: missing agents/openai.yaml`);
    } else if (!readFileSync(agentConfig, "utf8").includes(`$${dir}`)) {
      errors.push(`${where}: agents/openai.yaml default prompt must name $${dir}`);
    }

    // Installed skills are self-contained. Vendored helpers with canonical
    // repo-level counterparts must remain byte-identical so fixes cannot drift.
    const vendoredScripts = join(skillsDir, dir, "scripts");
    if (existsSync(vendoredScripts)) {
      for (const script of readdirSync(vendoredScripts)) {
        const vendored = join(vendoredScripts, script);
        if (!statSync(vendored).isFile()) continue;
        const canonical = join(root, "scripts", basename(script));
        if (existsSync(canonical) && readFileSync(vendored, "utf8") !== readFileSync(canonical, "utf8"))
          errors.push(`${where}: scripts/${script} drifted from canonical scripts/${script}`);
      }
    }
  }
}

// --- native plugin manifests ---
function loadManifest(path, label) {
  if (!existsSync(path)) { errors.push(`${label} missing`); return null; }
  try {
    const raw = readFileSync(path, "utf8");
    if (/\[TODO:|<owner>|<this-repo>/i.test(raw)) errors.push(`${label}: contains a placeholder`);
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

const claudeManifest = loadManifest(join(root, ".claude-plugin", "plugin.json"), ".claude-plugin/plugin.json");
const codexManifest = loadManifest(join(root, ".codex-plugin", "plugin.json"), ".codex-plugin/plugin.json");
if (claudeManifest && codexManifest) {
  for (const [label, manifest] of [["Claude", claudeManifest], ["Codex", codexManifest]]) {
    if (manifest.name !== "dev-workflows") errors.push(`${label} manifest: name must be dev-workflows`);
    if (!/^\d+\.\d+\.\d+$/.test(String(manifest.version ?? "")))
      errors.push(`${label} manifest: version must be semver MAJOR.MINOR.PATCH`);
    if (String(manifest.skills ?? "").replace(/\/$/, "") !== "./skills")
      errors.push(`${label} manifest: skills must reference ./skills`);
  }
  if (claudeManifest.name !== codexManifest.name || claudeManifest.version !== codexManifest.version)
    errors.push("plugin manifests disagree on name/version");
  for (const unsupported of ["hooks", "apps", "mcpServers"])
    if (unsupported in codexManifest) errors.push(`Codex manifest: unsupported/unbacked field '${unsupported}'`);
}

// --- rules/ ---
const agents = join(root, "rules", "AGENTS.md");
const claude = join(root, "rules", "CLAUDE.md");
if (!existsSync(agents)) errors.push("rules/AGENTS.md missing (canonical rules)");
if (!existsSync(claude)) {
  errors.push("rules/CLAUDE.md missing");
} else {
  const first = readFileSync(claude, "utf8").split(/\r?\n/).find((l) => l.trim() !== "");
  if (first !== "@AGENTS.md")
    errors.push(`rules/CLAUDE.md must start with '@AGENTS.md' (found: '${first}')`);
}

// --- templates/ ---
const required = [
  "checklist.md", "spec.md", "plan.md", "tasks.md",
  "INDEX.md", "constitution.md", "project-AGENTS.md", "project-CLAUDE.md",
];
for (const t of required) {
  if (!existsSync(join(root, "templates", t))) errors.push(`templates/${t} missing`);
}

// --- report ---
for (const n of notes) console.log(`note: ${n}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  console.error(`\nvalidate: FAIL (${errors.length} error${errors.length > 1 ? "s" : ""})`);
  process.exit(1);
}
console.log("validate: PASS");
