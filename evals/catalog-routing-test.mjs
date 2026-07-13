#!/usr/bin/env node
import { buildModel, evaluateCatalog, parseDescription, tokenize } from "../scripts/run-routing-evals.mjs";

let checks = 0;
const check = (value, message) => { checks += 1; if (!value) throw new Error(message); };
const fm = (description) => `---\nname: fixture\ndescription: ${description}\n---\n`;

check(tokenize("Crashes while bootstrapping projects").includes("defect"), "token aliases did not normalize defect language");
check(tokenize("Crashes while bootstrapping projects").includes("setup"), "token aliases did not normalize setup language");
const parsed = parseDescription(fm("Alpha work. Do not use for beta work."));
check(parsed.positive.includes("Alpha") && parsed.negative.includes("beta"), "description boundary parsing failed");

const descriptions = {
  "wf-alpha": { full: "alpha beta gamma delta", positive: "alpha beta", negative: "gamma" },
  "wf-beta": { full: "alpha beta gamma zeta eta", positive: "beta gamma", negative: "alpha" }
};
const model = buildModel(descriptions);
check(model.rank("unseen vocabulary").map(({ name }) => name).join(",") === "wf-alpha,wf-beta", "tie ordering is not deterministic");
check(model.route("unseen vocabulary")[0].name === "no-route", "low-confidence routing did not abstain");
check(model.rank("alpha")[0].name === "wf-alpha", "positive/negative ranking did not separate owner");
const result = evaluateCatalog({
  descriptions,
  examples: {
    "wf-alpha": [
      { query: "alpha", should_trigger: true },
      { query: "beta gamma", should_trigger: false }
    ],
    "wf-beta": [
      { query: "beta gamma", should_trigger: true },
      { query: "alpha", should_trigger: false }
    ]
  },
  topK: 2,
  aggregateRankOne: 0,
  perSkillRankOne: 0
});
check(!result.errors.some((error) => error.includes("positive owner")), "positive owner did not outrank excluded skill");
check(result.collisions[0].similarity >= 0.5 && result.collisions[0].similarity < 0.75, "similarity fixture missed warning interval");
check(result.warnings.length === 1, "warning threshold edge was not applied");

const collision = evaluateCatalog({
  descriptions: {
    a: { full: "same exact words", positive: "alpha", negative: "" },
    b: { full: "same exact words", positive: "beta", negative: "" }
  },
  examples: { a: [{ query: "alpha", should_trigger: true }], b: [{ query: "beta", should_trigger: true }] },
  topK: 2,
  aggregateRankOne: 0,
  perSkillRankOne: 0
});
check(collision.errors.some((error) => error.includes(">= 0.750")), "collision error threshold was not enforced");

console.log(`catalog routing: PASS (${checks} token/rank/threshold checks)`);
