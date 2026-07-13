#!/usr/bin/env node
// Mechanical regression for the checklist counting convention: infrastructure
// failure plus one scoped retry stops awaiting-human without consuming a cause.
const checklist = `
## Loop log
- attempt 1/3: hypothesis: cache | observed result: disproved
- attempt 2/3: hypothesis: locale | observed result: disproved
## Infrastructure events
- event: test runner missing | scoped retry: install unavailable | result: still cannot execute | hypothesis count unchanged at 2
`;
const hypotheses = checklist.match(/^- attempt \d+\/3:/gm) ?? [];
const infra = checklist.match(/^- event:/gm) ?? [];
const shouldBailForCauses = hypotheses.length >= 3;
const shouldAwaitHumanForInfrastructure = infra.length === 1 && checklist.includes("scoped retry") && checklist.includes("hypothesis count unchanged at 2");
if (hypotheses.length !== 2 || shouldBailForCauses || !shouldAwaitHumanForInfrastructure) {
  throw new Error("infrastructure failure incorrectly changed the causal attempt count");
}
console.log("debug infrastructure accounting: PASS (2 hypotheses + failed retry => awaiting-human at count 2)");
