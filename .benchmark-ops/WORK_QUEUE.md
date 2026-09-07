# CB-MODEL — Work Queue

**Scope:** CB-MODEL work only. Repo-wide improvement candidates stay in
`research/IMPROVEMENT_BACKLOG.md` under its Priority Score rubric. An item here that becomes
repo-wide **graduates** to that file rather than being copied (see
`docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-01).

**Format** per `OPERATING-STATE-SPEC.md`: P0–P3, owner, dependency, evidence, acceptance criteria,
status.

**Standing rule from `OPERATING-STATE-SPEC.md`:** *"Never mark work complete merely because code
exists. Completion requires verification."*

**Last updated:** 2026-09-06. **Nothing in this queue has been started.**

---

## P0 — The real blockers, and the two things that are wrong on the live site

P0 means: the programme cannot proceed correctly, or something currently published is wrong.

| ID | Item | Owner | Dependency | Evidence | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| **WQ-P0-01** | **Approve a model spend budget and provision provider access.** Decide providers, access tiers (consumer / API default / base / fine-tune — `07` requires these scored separately), a currency ceiling per wave, who may spend, and whether donated access is acceptable under the `11-FUNDING` 20% cap and disclosure rule. | **Founder** | `BLK-002` | No provider key, endpoint or adapter exists (grep: zero hits outside `node_modules`) | A written budget with a named ceiling exists; credentials provisioned; `COST_LEDGER.md` opens with the ceiling recorded and zero spend | **BLOCKED** |
| **WQ-P0-02** | **Restore release-intelligence capability.** Raise `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` or run each cycle in its own session. | **Founder** | `BLK-001` | `INCIDENTS.md` INC-008: 2000/2000 used; three scans failed 2026-09-02 → 09-06 | One scan completes and passes `validate-scan.mjs`; the 09-02 → 09-06 lookback is covered; `RELEASE_WATCH.md` carries a first dated scan record | **BLOCKED** |
| **WQ-P0-03** | **Stop `/ai-evaluation-suite` advertising capabilities it does not have.** Two options, founder chooses: **(a)** restore the scorer/exports from `legacy-html/ai-evaluation-suite.html` as a client component, rewired to the **canonical** `scoring.ts` formula and `getBand()`; or **(b)** rewrite the page in the present tense as a published reference prompt set and remove the four inert "Export & API" cards, the "Set model name" step, and the export claim. | frontend-engineer, on founder's choice | founder decision only | `page.tsx` has no `"use client"`, no state, no handler, no input; four `<Card>` elements describe exports that do not exist; two "License the Platform" CTAs to `/contact-sales` | The page describes only what it does. If (a): the restored tool reproduces `test-scoring.mjs` values exactly and refuses to emit a composite from an incomplete run. If (b): no present-tense claim survives that the page cannot satisfy | **OPEN — needs founder decision** |
| **WQ-P0-04** | **Rename `xAI/Grok` to the organisation before any model score publishes.** Same question for `DeepMind/Google` (two organisations in one row). | **Founder** (index write, `AUTONOMY.md` §1b) | ratify D-13 | `ai-labs.json` rank 50 `"name": "xAI/Grok"` composite 0.0; rank 13 `"name": "DeepMind/Google"` 56.9 | No published row name fuses a lab with a model. Executed as a **structural operation with no score change** (D-08 precedent), with its own `APPLIED_CHANGES.md` entry and rank-cascade remediation | **OPEN — founder authority** |
| **WQ-P0-05** | **Ratify or reject D-13** (index demarcation, PPT and R-SUB-1…4). It is `proposed`, was never ratified, and has been **cited as governing** in the 2026-08-21 and 2026-08-23 operations. Under R-SUB-3 it would delist Microsoft AI, Amazon AWS AI and Meta AI. | **Founder** | none | `DECISIONS.md` D-13: "adopted by practice but never ratified"; `RISKS.md` RISK-003 | D-13 status is `active` or `superseded`, not `proposed`. If active, the three R-SUB-3 violations have a dated disposition plan | **OPEN — founder authority** |

## P1 — Blocks a correct first result

| ID | Item | Owner | Dependency | Evidence | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| WQ-P1-01 | **Resolve the two-formula conflict.** One composite formula and one `getBand()` on the site. | founder + Methods Committee | `BLK-006` | CONFLICT-04: adjustment is `10 × consistency × weakness` (0…+10) vs discrete `+5/+3/−2/−5`; 60.5 bands as "Established" one place and "Functional" the other | Exactly one formula and one band function are published. A test asserts the platform page's stated formula equals `scoring.ts` | **BLOCKED** on `BLK-006` |
| WQ-P1-02 | **Resolve the two-taxonomy conflict.** 7 of 40 subdimension names match; AWR/EQU/BND/INT overlap on zero. | founder + Methods Committee | `BLK-006` | CONFLICT-05 table | One published set of 40. `page.tsx` imports from `dimensions.ts` rather than hardcoding | **BLOCKED** on `BLK-006` |
| WQ-P1-03 | **Fix the band-boundary gap.** Seven `ai-labs.json` rows at 60.9 fall in no declared range in their own file. | founder + Methods Committee | `BLK-006` | CONFLICT-03; existing `RISKS.md` RISK-006, open since 2026-07-30 | `dimensions.ts` `BANDS` is the only band declaration; `ai-labs.json` and the platform page derive from it; every published composite falls inside exactly one range | **BLOCKED** on `BLK-006` |
| WQ-P1-04 | **Extract the 33 prompts into a versioned task bank** at `research/model-index/tasks/v0/*.json` with the `03-BENCHMARK-BATTERY` item schema (immutable ID, construct, indicator, task family, expected behaviours, prohibited failures, 1–5 anchors, critical-harm rules, exposure class `public`, author, dates, validation status `unvalidated`, retirement). | backend-engineer | none — **buildable now** | The 33 items exist only as a hardcoded `const PROMPTS` array inside `page.tsx` | Every item is an addressable file; `page.tsx` renders from the bank; a schema validator passes; no item is marked `validated` (none has been) | **OPEN — buildable now** |
| WQ-P1-05 | **Resolve the 4 unexecutable prompts.** `ACC-1-A`, `INT-1-B`, `INT-1-C`, `INT-3-A` contain unfilled `[...]` slots with no specified filler, so two runs are not comparable. | benchmark-research | WQ-P1-04 | the four prompt strings in `page.tsx` | Each is either fully specified or marked `status: draft` and excluded from every form | **OPEN — buildable now** |
| WQ-P1-06 | **Build the analysis layer against synthetic fixtures**: bootstrap 95% CIs, statistical tie groups, weighted kappa / Krippendorff alpha, matched-pair equity gap, min-dimension gate, critical-harm rate. Reuse `compositeCore()` unchanged. | backend-engineer | none — **buildable now** | `scoring.ts` has no CI, no reliability, no gate logic | `test-model-analysis.mjs` passes alongside the existing 69 scoring cases; same manifest produces identical analysis on repeat runs | **OPEN — buildable now** |
| WQ-P1-07 | **Build the separation guard.** A validator asserting no model score and no lab score share an aggregate, and no entity holds two published composites anywhere. | backend-engineer | none — **buildable now** | `01-REPOSITORY-AND-PLATFORM-BUILD` required acceptance test; §2.1 shows three live double-publications | The guard runs inside the existing `validate-indexes.mjs` gate and **currently fails** on Microsoft/Amazon/Meta — which is the correct first result | **OPEN — buildable now** |
| WQ-P1-08 | **Model registry + run manifest schemas** with the acceptance test *"a changed model snapshot cannot overwrite an old identity"*. | system-architect / backend-engineer | none — **buildable now** | No `model_id`, endpoint or snapshot field exists in any schema | Typed schemas + fixtures; the overwrite test passes; `MODEL_REGISTRY.md` documents the schema and stays empty | **OPEN — buildable now** |
| WQ-P1-09 | **Reader-facing separation of the three products** before any model score publishes: distinct routes, distinct page furniture, and an explicit statement that a lab score and a model score are not comparable. | frontend-engineer + product | WQ-P0-05 | §2.2 — "Microsoft AI 75.9" will sit adjacent to a Microsoft model score, identically formatted, on the same 0–100 scale with the same band labels | A reader cannot mistake a lab score for a model score. Cross-product views are labelled correlation or comparison, never aggregation (`00-MASTER-CONDUCTOR`) | **OPEN** |

## P2 — Needed before publication, not before a pilot

| ID | Item | Owner | Dependency | Evidence | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| WQ-P2-01 | Evidence hashing and signed run manifests | backend-engineer | WQ-P1-08 | CONFLICT-07 — the repo has no hashing; append-only is convention-enforced (`AUTONOMY.md` §1c) | Every artifact carries a hash; the analysis reproduces from the manifest alone | OPEN |
| WQ-P2-02 | Provider adapters: retries, rate control, clean sessions, randomisation, ≥3 trials/item, tool capture, latency, tokens, cost | backend-engineer | **`BLK-002`** | none exist | Harness validation probes (easy/hard/refusal/tool/metadata) pass; no cherry-picking possible by construction | BLOCKED |
| WQ-P2-03 | Rating workspace: blinding, two raters, hidden gold items, adjudication routing (>1pt delta, all critical-harm flags, low-confidence, stratified sample) | backend-engineer | **`BLK-005`** | none exists | A rater cannot see model identity, provider, prior rank or another rater's score | BLOCKED |
| WQ-P2-04 | Rater welfare protocol before recruitment: exposure limits, rotation, breaks, opt-out, escalation | founder + qualified reviewer | `BLK-005` | `05-HUMAN-RATING`; the item set already contains suicide, DV, psychosis and miscarriage content (`ACT-1-A`, `ACT-5-A`, `ACT-5-B`, `EMP-1-B`) | Written, reviewed, in force **before** the first rater sees an item | OPEN |
| WQ-P2-05 | Secure form authoring toward the `03` targets (≥64 public core, 128 secure per form, 48 challenge, >240 candidates) with domain and paid lived-experience review | benchmark-research | `BLK-005`, WQ-P1-04 | 33 items exist ≈ 7% of one official form; all public with answer keys | Secure prompts never appear in logs, PRs, public CI, screenshots or model-facing docs (`03`) | BLOCKED |
| WQ-P2-06 | Restore automated deploy | **Founder** | — | `INCIDENTS.md` INC-001, `RISKS.md` RISK-004: 25+ failures since 2026-07-19, zero successes; SSH key cause open | One green `Deploy to VPS` run including the freshness assertion added 2026-08-19 | OPEN — pre-existing |

## P3 — Deferred, recorded so they are not rediscovered

| ID | Item | Note |
|---|---|---|
| WQ-P3-01 | Deployed AI Audit as a distinct product | ≥10 `ai-labs.json` rows are already its subjects (§2.3). Needs a product decision, not code. |
| WQ-P3-02 | Compassion Arena, multilingual equity, voice/vision, agentic tracks, domain audits, independent replication | `11-FUNDING` names each as a **separately fundable expansion**. None is on the critical path to a first result. |
| WQ-P3-03 | Public API, downloads, comparison views, changelog for the model index | Needs a result to serve first. |
| WQ-P3-04 | Quarterly wave and annual State of AI Compassion report machinery | `09`. Needs multiple results first. |

---

## Dependency summary

```
BLK-002 (budget + credentials) ─┬─> WQ-P2-02 ─> pilot run ─┐
BLK-005 (rating panel) ─────────┴─> WQ-P2-03/04/05 ────────┼─> first publishable result
BLK-006 (methods committee) ──────> WQ-P1-01/02/03 ────────┘
BLK-001 (websearch cap) ──────────> WQ-P0-02 ─> RELEASE_WATCH first scan
BLK-004 (.docx) ──────────────────> SLA + version commitments

Buildable with every blocker still open:
  WQ-P1-04, WQ-P1-05, WQ-P1-06, WQ-P1-07, WQ-P1-08
```
