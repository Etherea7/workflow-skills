---
id: {{NNN-slug}}
title: {{short title}}
status: draft         # draft | clarifying | awaiting-human | ready | in-progress | done | superseded
created: {{YYYY-MM-DD}}
updated: {{YYYY-MM-DD}}
parent: {{null | NNN-slug}}
children: []          # [NNN-slug, …] sub-features decomposed from this spec
related: []           # [NNN-slug, …] non-hierarchical links
---

# {{title}}

## Problem

{{What is wrong or missing today, in the user's language. One or two paragraphs.}}

## Goals

- {{observable outcome, phrased so a test could verify it}}

## Non-goals

- {{explicitly out of scope, to prevent drift}}

## Requirements

<!-- Each requirement is a testable statement — these are the "unit tests for
     English". Number them; acceptance criteria and tests reference them. -->

- R1. {{The system SHALL … / WHEN … the system SHALL …}}
- R2. …

## Open questions

<!-- plan's clarification loop drains this list; empty = ready for consistency pass -->

- [ ] Q1. {{question}} — options: {{A / B}}, leaning: {{A because …}}

## Decisions

- {{YYYY-MM-DD}} Q1 → {{answer}} ({{who decided}}; rationale: {{…}})

## Acceptance criteria

<!-- Mapped 1:1-ish to Requirements; the definition of done for implementation. -->

- [ ] AC1 (R1): {{given / when / then}}
