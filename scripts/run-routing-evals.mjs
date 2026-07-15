#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const catalogMap = Object.freeze({
  "wf-explore": "evals/explore",
  "wf-plan": "evals/plan",
  "wf-feature": "evals/new-feature",
  "wf-debug": "evals/debug",
  "wf-improve": "evals/next-step-improve",
  "wf-setup": "evals/project-setup"
});
const stop = new Set("a an and are as at be before by can do does for from how i if in into is it me my of on or our the their them they this to use when with you your".split(" "));
const aliases = new Map(Object.entries({
  broken: "defect", bug: "defect", bugs: "defect", cause: "defect", crash: "defect", crashes: "defect", diagnose: "defect", diagnosis: "defect", error: "defect", errors: "defect", failing: "defect", fix: "defect", hypothesis: "defect", patch: "defect", reproduce: "defect", reproduction: "defect",
  add: "feature", build: "feature", functionality: "feature", implement: "feature", implementation: "feature",
  acceptance: "requirement", ambiguous: "requirement", choice: "requirement", clarify: "requirement", decide: "requirement", define: "requirement", expiry: "requirement", figure: "requirement", idea: "requirement", opinion: "requirement", role: "requirement", spec: "requirement", unsure: "requirement", unclear: "requirement", undecided: "requirement", unspecified: "requirement",
  bootstrap: "setup", bootstrapping: "setup", initialize: "setup", scaffold: "setup", scaffolding: "setup", greenfield: "setup",
  backlog: "improve", improvement: "improve", next: "improve", prioritize: "improve", priority: "improve", roadmap: "improve", survey: "improve",
  assess: "review", summarize: "review", summary: "review", optimize: "performance", speed: "performance", specced: "ready"
}));

function stem(token) {
  if (aliases.has(token)) return aliases.get(token);
  if (token.length > 5 && token.endsWith("ies")) token = `${token.slice(0, -3)}y`;
  else if (token.length > 5 && token.endsWith("ing")) token = token.slice(0, -3);
  else if (token.length > 4 && token.endsWith("ed")) token = token.slice(0, -2);
  else if (token.length > 4 && token.endsWith("es")) token = token.slice(0, -2);
  else if (token.length > 3 && token.endsWith("s")) token = token.slice(0, -1);
  return aliases.get(token) ?? token;
}

export function tokenize(text) {
  return [...text.normalize("NFKD").toLowerCase().matchAll(/[a-z0-9]+/g)]
    .map(([token]) => stem(token)).filter((token) => token.length > 1 && !stop.has(token));
}

export function parseDescription(skillText) {
  const match = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error("SKILL.md lacks initial frontmatter");
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1];
  if (!description) throw new Error("SKILL.md lacks description");
  const split = description.split(/\b(?:Do not use|Never use)\b/i);
  return { full: description, positive: split[0], negative: split.slice(1).join(" ") };
}

function frequencies(tokens) {
  const map = new Map();
  for (const token of tokens) map.set(token, (map.get(token) ?? 0) + 1);
  return map;
}

export function buildModel(descriptions) {
  const names = Object.keys(descriptions).sort();
  const documents = names.map((name) => new Set(tokenize(descriptions[name].positive)));
  const idf = new Map();
  for (const token of new Set(documents.flatMap((set) => [...set]))) {
    const count = documents.filter((set) => set.has(token)).length;
    idf.set(token, Math.log((names.length + 1) / (count + 1)) + 1);
  }
  const vector = (text) => {
    const counts = frequencies(tokenize(text));
    const result = new Map();
    for (const [token, count] of counts) result.set(token, count * (idf.get(token) ?? Math.log(names.length + 1)));
    return result;
  };
  const cosine = (left, right) => {
    let dot = 0, l2 = 0, r2 = 0;
    for (const value of left.values()) l2 += value * value;
    for (const value of right.values()) r2 += value * value;
    for (const [token, value] of left) dot += value * (right.get(token) ?? 0);
    return l2 && r2 ? dot / Math.sqrt(l2 * r2) : 0;
  };
  const positive = Object.fromEntries(names.map((name) => [name, vector(descriptions[name].positive)]));
  const negative = Object.fromEntries(names.map((name) => [name, vector(descriptions[name].negative)]));
  return {
    names, vector, cosine,
    rank(query) {
      const q = vector(query);
      return names.map((name) => ({
        name,
        positive: cosine(q, positive[name]),
        negative: cosine(q, negative[name])
      })).map((item) => ({
        ...item,
        score: item.positive - 1.25 * item.negative
      })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    },
    route(query) {
      const ranked = this.rank(query);
      const top = ranked[0];
      const abstain = top.score <= 0.02 || (top.negative >= 0.12 && top.positive < 0.3);
      return abstain ? [{ name: "no-route", score: Math.max(0.02, top.score + 0.001) }, ...ranked] : ranked;
    },
    similarity(left, right) { return cosine(vector(descriptions[left].full), vector(descriptions[right].full)); }
  };
}

export function evaluateCatalog({ descriptions, examples, topK = 3, aggregateRankOne = 0.7, perSkillRankOne = 0.5 }) {
  const model = buildModel(descriptions);
  const errors = [], warnings = [], stats = {};
  const owners = new Map();
  for (const [name, rows] of Object.entries(examples)) {
    for (const row of rows.filter((item) => item.should_trigger)) {
      const key = row.query.trim().toLowerCase();
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(name);
    }
  }
  let total = 0, rankOne = 0, topPass = 0;
  for (const name of model.names) {
    const positives = examples[name].filter((row) => row.should_trigger);
    const negatives = examples[name].filter((row) => !row.should_trigger);
    let first = 0, top = 0;
    for (const row of positives) {
      const ranking = model.rank(row.query);
      const rank = ranking.findIndex((item) => item.name === name) + 1;
      total += 1; first += Number(rank === 1); top += Number(rank <= topK);
      rankOne += Number(rank === 1); topPass += Number(rank <= topK);
      if (rank > topK) errors.push(`${name}: positive ranked ${rank} (top-${topK} required): ${row.query}`);
    }
    for (const row of negatives) {
      const ranking = model.route(row.query);
      if (ranking[0].name === name) errors.push(`${name}: negative ranked excluded skill first: ${row.query}`);
      const promptOwners = [...(owners.get(row.query.trim().toLowerCase()) ?? [])].filter((owner) => owner !== name).sort();
      for (const owner of promptOwners) {
        const ownerRank = ranking.findIndex((item) => item.name === owner);
        const excludedRank = ranking.findIndex((item) => item.name === name);
        if (ownerRank >= excludedRank) errors.push(`${name}: positive owner ${owner} did not outrank excluded skill: ${row.query}`);
      }
    }
    const rate = positives.length ? first / positives.length : 0;
    const topRate = positives.length ? top / positives.length : 0;
    stats[name] = { positives: positives.length, rankOne: rate, topK: topRate };
    if (rate < perSkillRankOne) errors.push(`${name}: rank-one ${(rate * 100).toFixed(1)}% < ${(perSkillRankOne * 100).toFixed(1)}%`);
    if (topRate < 1) errors.push(`${name}: top-${topK} ${(topRate * 100).toFixed(1)}% < 100.0%`);
  }
  const collisions = [];
  for (let i = 0; i < model.names.length; i++) for (let j = i + 1; j < model.names.length; j++) {
    const left = model.names[i], right = model.names[j], similarity = model.similarity(left, right);
    collisions.push({ left, right, similarity });
    if (similarity >= 0.75) errors.push(`${left}/${right}: description similarity ${similarity.toFixed(3)} >= 0.750`);
    else if (similarity >= 0.5) warnings.push(`${left}/${right}: description similarity ${similarity.toFixed(3)} >= 0.500`);
  }
  const aggregate = total ? rankOne / total : 0;
  const aggregateTopK = total ? topPass / total : 0;
  if (aggregate < aggregateRankOne) errors.push(`aggregate rank-one ${(aggregate * 100).toFixed(1)}% < ${(aggregateRankOne * 100).toFixed(1)}%`);
  return { stats, aggregate, aggregateTopK, collisions, warnings, errors };
}

function loadRows(directory) {
  const rows = [];
  for (const file of ["trigger-evals.json", "trigger-holdout.json"]) {
    try { rows.push(...JSON.parse(readFileSync(join(root, directory, file), "utf8"))); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return rows;
}

export function runCatalog() {
  const descriptions = {}, examples = {};
  for (const [name, directory] of Object.entries(catalogMap)) {
    descriptions[name] = parseDescription(readFileSync(join(root, "skills", name, "SKILL.md"), "utf8"));
    examples[name] = loadRows(directory);
  }
  const result = evaluateCatalog({ descriptions, examples });
  for (const name of Object.keys(result.stats).sort()) {
    const value = result.stats[name];
    console.log(`${name}: rank1=${(value.rankOne * 100).toFixed(1)}% (required 50.0%) top3=${(value.topK * 100).toFixed(1)}% (required 100.0%) n=${value.positives}`);
  }
  console.log(`aggregate: rank1=${(result.aggregate * 100).toFixed(1)}% (required 70.0%) top3=${(result.aggregateTopK * 100).toFixed(1)}%`);
  console.log(`collisions: ${result.collisions.map((item) => `${item.left}/${item.right}=${item.similarity.toFixed(3)}`).join(" ")}`);
  for (const warning of result.warnings) console.log(`WARNING: ${warning}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  console.log(`routing evals: ${result.errors.length ? "FAIL" : "PASS"} (${result.warnings.length} warnings, ${result.errors.length} errors)`);
  if (result.errors.length) process.exitCode = 1;
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) runCatalog();
