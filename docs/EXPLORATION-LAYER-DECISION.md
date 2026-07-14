# Exploration Layer Decision

Decision spike for `docs/FUTURE-WORK.md:17-32` (item 2: "code graphs plus
documentation context"). Produced under plan 007. Read together with
`docs/exploration-layer-results.json`, the machine-readable raw evidence this
document summarizes and cites.

## Decision

- **Code-intelligence provider: `native-only`.** No candidate (CodeGraph,
  Graphify, Serena, reserve challenger code-graph-mcp) was run. Selection is
  therefore forced to `native-only` by the plan's own rule ("Missing the
  minimum set forces `native-only`"), independent of how promising any
  candidate's metadata looks.
- **Documentation provider: `native-only`.** OpenWiki was not run. Selection is
  forced to `native-only` by the plan's own rule ("OpenWiki must complete both
  docs runs or the documentation decision is `native-only`").
- Both decisions are **NOT EVALUATED-driven**, not evidence-driven rejections.
  Nothing observed in this spike says any candidate is bad; nothing was
  observed at all beyond public package metadata. Treat this as "insufficient
  evidence to add a dependency," not "evidence against these tools."

## Hard gates

Hard gates require running a candidate to evaluate (local boundary, citation
accuracy, freshness behavior, host-mutation behavior, read-only-mode
enforcement — gates 2–7 in the plan). None of the five third-party candidates
were run, so none of those six gates could be evaluated for any of them; they
are recorded as `null`, never as a passing or failing score, per the plan's
explicit instruction that "a missing trial is `NOT EVALUATED`, never a zero
score or implicit pass."

Only hard gate 1 (OSI-approved license permitting commercial redistribution)
could be checked from metadata alone, and was checked for every candidate:

| Candidate | License | Gate 1 |
|---|---|---|
| CodeGraph (npm `@colbymchenry/codegraph@1.4.1`) | MIT | pass |
| Graphify (PyPI `graphifyy@0.9.15` latest; `0.3.20` on this host, see Notes) | MIT | pass |
| Serena (PyPI `serena-agent@1.5.3`) | MIT | pass |
| OpenWiki (npm `openwiki@0.1.2`) | MIT | pass |
| code-graph-mcp (npm `code-graph-mcp@0.2.7`, reserve only) | MIT | pass (but see provenance gap below) |
| jCodeMunch | commercial/non-commercial-only per plan | fail (recorded by name only, not re-verified; never a candidate to trial) |

For the native code baseline (`rg`/git/file reads) and the native documentation
baseline (`docs/queue.md`, the committed gold page), all seven hard gates were
directly observed and pass — see `docs/exploration-layer-results.json` trials
`native` and `native-maintained-docs`, field `hard_gates`. The native
documentation baseline fails gate 4 (freshness/explicit-status) in its raw
score record for `D2` — after the `F2` fixture change, `docs/queue.md` was
never told to regenerate and silently omits `queueSize` rather than erroring.
That is expected of a hand-maintained page with no refresh automation; it is
recorded honestly as a limitation of the fallback, not smoothed over.

**Package-provenance diligence** (beyond what the plan required, done because
the sandbox gap made it the only additional signal available): every required
candidate's npm/PyPI metadata was cross-checked against its claimed GitHub
repository using the GitHub REST API.

- CodeGraph: npm maintainer handle `colbymchenry` matches the claimed
  `github.com/colbymchenry/codegraph` (HTTP 200). Consistent.
- Graphify: PyPI's own `repository` field points to `github.com/safishamsi/graphify`,
  not the plan's `github.com/Graphify-Labs/graphify`. GitHub's API resolves the
  former with a `301` to the latter (same repository ID `1200597263`) — the
  project was transferred from an individual account to an org; PyPI's
  metadata is simply stale. Not a mismatch once resolved.
- Serena: PyPI `project_urls.Homepage` is exactly `github.com/oraios/serena`,
  matching the plan verbatim. Consistent.
- OpenWiki: npm maintainer `basproul <braceasproul@gmail.com>` is confirmed
  as GitHub contributor `bracesproul` on `github.com/langchain-ai/openwiki`
  (checked via the repo's contributors list). Consistent.
- code-graph-mcp (reserve only): npm's own `author` field is "Kynlo Akari
  (`github.com/Kynlos`)", but `github.com/Kynlos/code-graph-mcp` returns
  `404`. This does **not** match the plan's claimed
  `github.com/sdsrss/code-graph-mcp` (which exists, `200`, and has a
  thematically matching description). This identity gap is unresolved from
  public metadata alone. It has no effect on the decision — this candidate is
  reserve-only and was never eligible for promotion since none of the four
  required trials failed for a *platform* reason — but any future plan that
  wants to trial it should get the maintainer to confirm the repository first.

## Benchmark

**Scratch isolation.** No functional container/VM boundary exists on this
machine: `wsl.exe` fails with `HCS_E_HYPERV_NOT_INSTALLED` ("Virtual Machine
Platform" not enabled; Windows 10 Home has no Hyper-V); Docker CLI 27.3.1 is
present but `docker info`/`docker ps` fail with `open
//./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`
(the Linux engine cannot start without WSL2/Hyper-V); no `podman` binary is on
PATH. Per the plan: "If this boundary is unavailable, mark third-party trials
`NOT EVALUATED` and select `native-only`; redirected environment variables
alone are not a sandbox." No third-party candidate code was installed or
executed at any point in this spike.

**Fixture provenance.**

- `git bundle create <scratch>/dev-workflows.bundle --all` from this worktree
  at commit `2616753`, cloned to `<scratch>/dev-workflows`, checked out at
  `2616753` (verified: `git rev-parse --short HEAD` → `2616753`).
- `node evals/next-step-improve/fixtures/build-fixture.mjs <scratch>/roadmap-fixture with-skill`
  produced fixture head `bf85deeaf9f815192ff1b4be2f53ed5289d83967` on branch
  `main`. (The builder's only containment rule, read from its source, is that
  the destination must not exist or must be empty — `evals/next-step-improve/fixtures/build-fixture.mjs:59-61`
  — there is no `/dwv/`-specific path requirement in the script; a short
  scratch path was used only to dodge the Windows `MAX_PATH` landmine.)
- `docs/queue.md` (the native docs gold page) was added and committed
  (`docs: add queue API baseline`, commit `221b9aa`) before any provider run,
  containing exactly the `enqueue` signature/behavior/citation specified by
  the plan.
- `F2` fixture change: `export function queueSize(queue) { return queue.length; }`
  appended as `src/queue.js:2` and committed (`feat: add queueSize`, commit
  `25a57f9344669080fbb2b5e532e6e250f2cb096b`).
- Scratch root used: `%TEMP%\dwv7` (bundle, both clones, and the raw
  benchmark-run JSON all live there; disposable, outside the repository).

**Gold answers** (`R1`–`R6`, `F1`–`F2`, `D1`–`D2`) were established
independently, by reading repository source directly (`evals/lib/test-kit.mjs`,
`scripts/run-deterministic-tests.mjs`, `scripts/validate.sh` and siblings,
`docs/ARCHITECTURE.md:38-42`, and the fixture's own committed files), before
any query was run against them. Full text lives in
`docs/exploration-layer-results.json:gold_answers`. Every gold fact carries an
explicit `file:line` citation except `R6`, whose gold fact is the absence of
Postgres content (`rg -i postgres` over the whole repo: no match, `rg` exits
`1`) — the correct behavior is abstention, not fabrication.

**Provider versions checked** (2026-07-14, via `npm view <pkg> version
dist-tags license repository --json` and PyPI's JSON API — metadata reads
only, no install):

| Package | Version (latest) |
|---|---|
| `@colbymchenry/codegraph` | `1.4.1` |
| `openwiki` | `0.1.2` |
| `graphifyy` | `0.9.15` |
| `serena-agent` | `1.5.3` |
| `code-graph-mcp` | `0.2.7` |

**Native baseline was fully run** (this machine's own `rg`/`git`/Node `fs` —
"repository-native tooling," not a third-party install, and therefore inside
the ground-truth carve-out for what may run without a container). One
unscored warm-up plus three scored repeats per query, all on the pinned
fixture/repo state above:

- `R1`–`R6` against the `dev-workflows` copy at `2616753`: all correct and
  fully cited across all 3 attempts each.
- `F1`, `F2` against `roadmap-fixture`: `F2` located `queueSize` and its
  `src/queue.js:2` citation with zero index/rebuild step, immediately after
  the fixture commit — correct and cited across all 3 attempts.
- `D1`, `D2` against the native `docs/queue.md` gold page: `D1` passes (all
  three required facts present at commit `221b9aa`); `D2` fails (the page was
  never regenerated after `F2`, so it correctly retains the `enqueue` fact but
  has no `queueSize` mention at all — an honest, expected gap, not a
  contradiction or a fabricated citation).

Raw per-attempt `calls`, `elapsed_ms`, `output_bytes`, `correct`,
`fully_cited`, and `citations` are in
`docs/exploration-layer-results.json:trials[0].runs` (code) and
`trials[1].runs` (documentation).

## Provider contract

Unchanged from the plan's proposed default, because no benchmark evidence
requires a change (nothing was benchmarked that would justify one):

- No new executable adapter in v1.
- Portable skills request **generic capabilities** — `definition`,
  `references`, `flow`, `impact`, `architecture`, `documentation` — never a
  vendor's tool vocabulary.
- `rules/AGENTS.md` per-host sections map already-available CLI/MCP tools to
  those capabilities; portable `SKILL.md` bodies stay tool-agnostic (matches
  `docs/ARCHITECTURE.md:72-80`, the existing Delegation abstraction).
- Every provider result must carry provider/version, repository head or index
  timestamp, query, citations, and limitations — this is exactly the shape
  captured per-run in `exploration-layer-results.json`, so the contract and
  the measurement format agree by construction.
- Provider output is a lead, never the oracle: any workflow that reads one
  must verify consequential citations against repository files before acting
  on them — mirrors `wf-feature`'s existing instruction (`skills/wf-feature/SKILL.md:59-60`,
  "Verify useful claims from the return against repository files before
  basing the plan on them") and `wf-improve`'s (`skills/wf-improve/SKILL.md:102-104`,
  "Treat a subagent claim as a lead, never as the oracle").
- Fallback is the existing native explorer path, not an error branch —
  matches the currently-shipped `wf-improve`/`wf-feature` wording ("Optional
  sources such as OpenWiki may be read only when detected; their absence is
  not an error" — `skills/wf-improve/SKILL.md:88-89`; "If OpenWiki is detected
  by project config/lockfile, run its documented refresh command... if
  absent, skip silently" — `skills/wf-feature/SKILL.md:130-132`).

## Workflow integration map

Because the decision is `native-only` for both roles, no workflow gains a new
capability call in this spike. This table records the answer required by plan
Step 4 for all five workflows, framed against the unchanged contract above so
a future plan can act on it without re-deriving the reasoning.

| Workflow | Question | Answer given `native-only` |
|---|---|---|
| `wf-plan` | When does an existing-repo planning question merit provider context? | Never today — no code/doc provider is selected. If one is later selected, only when clarification needs cross-cutting impact/flow data that plain `rg`/file reads over the target repo cannot cheaply produce (e.g., "what calls this across N indirection layers"); `wf-plan`'s existing `references explorer` delegation (`skills/wf-plan/SKILL.md:52-55`) already covers the fallback path unchanged. |
| `wf-feature` | Which capabilities locate seams, callers, impacted tests; how is the existing OpenWiki wording reconciled? | `definition`/`references`/`impact` would locate seams/callers/impacted tests if a code provider existed; today Step 1's explorer delegation (`skills/wf-feature/SKILL.md:50-58`) is unchanged and is the only path. The existing direct OpenWiki mention at `skills/wf-feature/SKILL.md:130-132` ("If OpenWiki is detected by project config/lockfile, run its documented refresh command...") is **not contradicted** by this decision — it is already written exactly as the plan's fallback contract requires (detect-if-present, skip silently if absent, never invent a generic command) and needs no wording change today. It becomes generic `documentation` capability language only if/when a doc provider other than OpenWiki is ever added. |
| `wf-debug` | How are flow results recorded as evidence without becoming a favored hypothesis? | Unchanged: Step 4's existing "Delegation evidence" persistence (`skills/wf-debug/SKILL.md:118-124` — brief, structured return, and "the orchestrator's citation-validation result" all recorded before ranking) is already the exact shape a future `flow`/`impact` capability result would need to slot into: one more cited, validated observation among several, never elevated above the others by source. |
| `wf-improve` | How do architecture/docs augment, but never replace, cited repository evidence? | Unchanged: Step 3 already states "Treat a subagent claim as a lead, never as the oracle" (`skills/wf-improve/SKILL.md:102-104`) and already treats OpenWiki as an optional, absence-is-not-an-error source (`skills/wf-improve/SKILL.md:88-89`). A future `architecture`/`documentation` capability read joins the same evidence-gathering step under the same rule; no new bypass of citation verification is introduced. |
| `wf-setup` | What explicit opt-in may initialize a docs/index provider only after bootstrap is green, without installing host integrations? | None today (`native-only`). If a documentation provider is later selected, the only safe point is **after** Step 7 ("Persist only verified truth," `skills/wf-setup/SKILL.md:160-187`) — i.e., after the first commit and every development-loop gate are green — as an explicit, human-confirmed, project-scoped opt-in that writes only inside the target project (e.g., `openwiki/**` plus its own documented fenced block), never a host/global install and never blocking bootstrap itself. |

## Build handoff

No implementation file was edited in this spike (`git status --short` at
close shows only the two files listed under Scope). This section is the
ordered handoff for a future integration plan, written now so it does not
need re-deriving from scratch.

**Ordered file list for the follow-on plan** (none touched by this spike):

1. `rules/AGENTS.md` — add the capability-to-tool mapping table
   (`definition`/`references`/`flow`/`impact`/`architecture`/`documentation` →
   host CLI/MCP calls) under the per-host sections, once a provider is
   actually selected. Do not add this before a provider clears the hard gates.
2. `skills/wf-feature/SKILL.md:130-132` — only if a documentation provider
   other than OpenWiki is ever added: replace the OpenWiki-specific sentence
   with generic `documentation`-capability wording; until then, no change (see
   Workflow integration map above — the existing wording already matches the
   fallback contract).
3. `skills/wf-improve/SKILL.md:88-89` — same conditional migration as above,
   same "no change needed yet" status.
4. `skills/wf-debug/SKILL.md`, `skills/wf-plan/SKILL.md`, `skills/wf-setup/SKILL.md`
   — add capability-request language (not tool names) only once a provider is
   selected; today's wording is unaffected.
5. `evals/<skill>/` — new paired behavior-test fixtures (with-provider /
   without-provider) reusing `evals/next-step-improve/fixtures/build-fixture.mjs`'s
   pattern, added alongside whichever `SKILL.md` changes land.

**Migrations for the two existing direct OpenWiki mentions**
(`skills/wf-feature/SKILL.md:130-132`, `skills/wf-improve/SKILL.md:88-89`):
**no migration is required by this decision.** Both are already written in
the detect-if-present / skip-if-absent / never-invent-a-command shape the
plan's fallback contract requires. They only need rewording if a
*non-OpenWiki* documentation provider is ever selected, at which point the
OpenWiki-specific verb ("run its documented refresh command") should become
the generic `documentation` capability request, with host/tool mapping moved
to `rules/AGENTS.md`.

**Documentation/config ownership and uninstall story:** none created by this
spike — `native-only` writes nothing beyond the two scoped deliverables.
For a future selected provider: a code provider must declare its own index
paths and must be fully removable by deleting them (hard gate 7); a
documentation provider must confine writes to `<provider>/**` plus its own
documented fenced block in project instruction files, and uninstall must
mean deleting that directory and that fenced block only, never touching
human-authored instruction-file content (hard gate 5).

**STOP conditions / operator decisions still required before any future
provider spike can produce a different outcome:**

- Enable a functional container/VM boundary on the execution host (enable
  "Virtual Machine Platform" + a WSL2 distro, or get Docker Desktop's Linux
  engine running) — without this, no third-party trial can move past
  `NOT EVALUATED` regardless of how good its metadata looks.
- An explicit, separately-approved cost/credential decision before any
  model-backed OpenWiki trial (its own provider destination, a temporary
  scoped credential, network egress permitted only to that destination).
- A maintainer/operator confirmation of the `code-graph-mcp` package's
  actual repository, if it is ever promoted from reserve status (see the
  provenance gap under Hard gates).

**Estimated build effort and plan-008 recommendation:** given that this
decision is `native-only` for both roles, the smallest useful next experiment
is narrower than a full integration build: get one candidate running inside
an actual sandboxed boundary and re-score it against this same fixture and
these same gold answers (the fixture, gold answers, and native baseline
numbers in `exploration-layer-results.json` are all reusable as-is — nothing
here needs to be redone, only extended). That re-score is a **S-to-M** effort
(1 candidate × the existing R/F/D query set, once a working sandbox exists) —
materially smaller than the M-sized integration build this plan originally
scoped, because the integration-build questions (provider contract, workflow
wording, file list) are already answered above and would not need
re-deriving. **A new `plans/008-*.md` is warranted only after that re-score
produces a candidate that actually clears the hard gates and beats native by
the plan's thresholds** — writing an integration plan against untested
metadata would violate this plan's own "no implementation without evidence"
premise. Until then, `docs/FUTURE-WORK.md` item 2 should stay pinned to this
document rather than to specific product names.

## Rejected alternatives

- **Trialing candidates directly on the host, without a container.** Rejected
  per the plan's explicit ground rule: "redirected environment variables
  alone are not a sandbox." CodeGraph can edit agent config/instruction files,
  Graphify installs project skills, and OpenWiki maintains managed blocks in
  root `AGENTS.md`/`CLAUDE.md` and stores model credentials under the user
  home (`docs/FUTURE-WORK.md`'s own cited risk, restated in the plan) — none
  of that is acceptable to run unsandboxed against this repository or this
  machine's real home directory.
- **Treating already-installed `graphifyy` 0.3.20 on this host as a completed
  trial.** Rejected: that package was present on this machine before this
  session started (see Notes/deviation trail in the executor's report), was
  never invoked, and running it now — even read-only — would still be a
  third-party execution outside any sandbox boundary, which the ground rule
  forbids regardless of install provenance.
- **Promoting `code-graph-mcp` from reserve to a required trial.** Rejected:
  the plan authorizes this only when a required candidate "cannot start
  because of a verified package/platform failure," and none of the four
  required candidates failed to start for a platform reason — they were never
  started at all, uniformly, for the sandbox reason. Promoting the reserve
  would not fix that and would add an unresolved repository-provenance
  question (see Hard gates) on top.
- **Selecting `native-only` as a permanent architectural stance rather than a
  time-boxed evidentiary gap.** Rejected: the Provider contract section above
  keeps the capability-based skill wording and the host/tool mapping split
  exactly as `docs/ARCHITECTURE.md` already requires, specifically so that a
  future evidence-backed selection is a config/mapping change, not a rewrite
  of any `SKILL.md` body.
- **Scoring the `native-maintained-docs` trial against the documentation
  provider's selection bar (weighted total ≥ 90, 100% on `D1`-`D2`).**
  Rejected as a category error: that bar is for a *candidate competing to
  displace the fallback*, and the fallback does not compete against itself.
  Its raw scores (`docs/exploration-layer-results.json`, `weighted_total: 68`,
  driven entirely by the expected `D2` freshness gap) are published for
  transparency, not as a pass/fail judgment on keeping the native path as the
  default.
