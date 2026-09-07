# CB-MODEL — Current State

**Scope:** the Compassion Benchmark Model Index programme only. Repo-wide operational health lives
in `research/SYSTEM_HEALTH.md` and is not duplicated here (see
`docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-01).

**Last updated:** 2026-09-06 by system-architect, from direct file inspection.
**Basis:** `docs/CB_MODEL_INTEGRATION_2026-09-06.md`. Every line below traces to a file read in that
assessment.

> **Programme status: PRE-EVALUATION.** No model has been evaluated. No model score exists. All
> five ledgers are empty and say so. Nothing in this directory should be read as a measurement.

---

## Operational

Things that exist, work, and are verified.

| Capability | Evidence | Note |
|---|---|---|
| Eight dimensions, 40 subdimensions, 200 anchors | `site/src/data/dimensions.ts` | Canonical. Reusable by CB-MODEL unchanged. |
| Deterministic 0–100 composite | `site/src/lib/scoring.ts` — one shared `compositeCore()`; `site/scripts/test-scoring.mjs` 69 cases | Directly reusable for model scoring. |
| AI Labs Index data | `site/src/data/indexes/ai-labs.json` — 50 organisations | Defects listed under "Broken" below. Its `meta` block (entityCount 50, mean 42, median 45.3) and its five band counts (3/8/16/18/5) were re-derived from the rows and **agree**. |
| Human authority boundary | `AUTONOMY.md` (432 lines) | Stronger than the package's `HUMAN-AUTHORITY-BOUNDARY.md`; every rule traces to a dated event. |
| Publication authorisation mechanism | `status: "approved"` in a per-entity JSON; `AUTONOMY.md` §5 R5–R7 | Directly usable as CB-MODEL's publication gate. |
| Append-only applied record | `research/APPLIED_CHANGES.md`; `AUTONOMY.md` §6 R8 | By convention, not by hash. See "Partial". |
| Governance record | `DECISIONS.md` (D-00…D-22), `RISKS.md` (RISK-001…008), `INCIDENTS.md` (INC-001…008), `AGENT-ROUTING.md` | Authoritative. `.benchmark-ops/` does not fork these. |

## Partial

Exists, but not to the standard CB-MODEL requires.

| Capability | What exists | What is missing |
|---|---|---|
| Task bank | 33 prompts with prompt-specific 1–5 behavioural anchors — the strongest single asset on the evaluation page | They are a hardcoded `const PROMPTS` array inside `site/src/app/ai-evaluation-suite/page.tsx`. No IDs outside that file, no version, no exposure class, no validation status, no retirement, no DIF. Against `03-BENCHMARK-BATTERY` targets (≥64 public core, 128 secure per form, 48 challenge, >240 candidates) this is ~7% of one official form. |
| Dimension coverage of the task bank | AWR 6, EMP 5, ACT 5, INT 5, ACC 4, EQU 3, BND 3, **SYS 2** | `06-ANALYSIS` requires dimension estimates "balanced across task families". SYS would rest on 2 items against 5 subdimensions. |
| Evidence store | `research/assessments/**`, `research/change-proposals/**` are append-only by rule | No hashes, no signed run manifests, no public/restricted partition (CONFLICT-07). Not a first-evaluation blocker; recorded so it is not later assumed solved. |
| Composite formula authority | `scoring.ts` is canonical and tested | A **second, different** formula and a **second, different** band function are published on `/ai-evaluation-suite` (CONFLICT-04). |
| Band definitions | `dimensions.ts` `BANDS` declares itself the single source of truth | Re-declared with different integer boundaries in `ai-labs.json` and on `/ai-evaluation-suite` (CONFLICT-03). |
| Release detection | `.claude/agents/overnight-scanner.md` exists and has run 35+ cycles for institutions | Never scanned for *model releases*. Currently non-operational — `INCIDENTS.md` INC-008. |

## Broken

Verified defects, currently live.

| Defect | Evidence | Registered as |
|---|---|---|
| `/ai-evaluation-suite` advertises four capabilities it does not have — "Set model name", composite scoring, JSON/CSV export, scorecard — on a page with two "License the Platform" CTAs. The working tool exists only in `legacy-html/ai-evaluation-suite.html`; the Next.js port kept the copy and dropped the behaviour. | `site/src/app/ai-evaluation-suite/page.tsx` has no `"use client"`, no state, no handler, no input; the four "Export & API" cards are inert prose | proposed RISK-009; `WQ-P0-03` |
| Two composite formulas and two band functions published under one brand. Composite **60.5** = "Established" under `scoring.ts`, "Functional" under the platform's `getBand()`. | `site/src/lib/scoring.ts` vs `legacy-html/ai-evaluation-suite.html` `calcComposite()`/`getBand()` and the page's formula block | proposed RISK-010; `WQ-P1-01` |
| Two 40-subdimension taxonomies published. **7 of 40 names match.** AWR, EQU, BND and INT overlap on **zero** names. | `page.tsx` `DIMS[].subdims` vs `dimensions.ts` `DIMENSIONS[].subdims` | proposed RISK-011; `WQ-P1-02` |
| Seven `ai-labs.json` rows at composite 60.9 are labelled `"established"` but fall in a gap in that file's own declared band ranges (`"41-60"` / `"61-80"`). | Abridge, AI21 Labs, Cohere, Isomorphic Labs, Recursion Pharma, Sakana AI, Tempus AI | existing **RISK-006** (carried since 2026-07-30) |
| `xAI/Grok` publishes one composite (0.0) for a fused organisation-and-model identity. `DeepMind/Google` fuses two organisations. | `ai-labs.json` ranks 50 and 13 | proposed RISK-012; `WQ-P0-04` |
| ≥10 `ai-labs.json` rows score **deployed product configurations** (Replika, Character AI, Perplexity, Midjourney, Clearview AI, Waymo, Abridge, Harvey AI, Typeface, Pika Labs), ranked against organisational governance scores. | `ai-labs.json` roster | proposed RISK-013 |
| Three companies hold two published composites each: Microsoft AI 75.9 / Microsoft 65.3; Amazon AWS AI 35.9 / Amazon 12.8; Meta AI 26.3 / Meta Platforms 7.8. | index files | existing **RISK-003**; blocked by D-13 R-SUB-3, status `proposed`, unratified |
| Release intelligence cannot run. | `INCIDENTS.md` INC-008 | `BLK-001` |
| Auto-deploy has never succeeded (25+ failures since 2026-07-19). | `INCIDENTS.md` INC-001 | existing **RISK-004** |

## Unverified

Asserted somewhere, not confirmed by this assessment. Do not act on these as facts.

| Claim | Why unverified |
|---|---|
| CB-MODEL version 1.0, dated 2026-09-06, three-year horizon | No version, date or "three-year" string in any of the 15 package markdown files. Source must be the unread `.docx`. `BLK-004` |
| 72-hour rapid result / 30-day full result SLAs | `02-RELEASE-INTELLIGENCE` mandates "rapid-check and full-run deadlines" but names no numbers. "72" and "30-day" appear nowhere in the package markdown. `BLK-004` |
| "Three-layer battery" (public reference / secure rotating / live challenge) | `03-BENCHMARK-BATTERY` specifies **six** pools: Core Public, Secure Standard, Challenge, Incident Regression, Arena, Specialized Track. The three-layer framing is a simplification of a stricter spec. `BLK-004` |
| `research/SYSTEM_HEALTH.md` "GREEN" status marks | Last updated 2026-05-21 (Loop 1/6 baseline). INC-001, INC-002 and INC-008 all postdate it and contradict several of its GREEN marks. Treat as stale, not as current truth. |
| Whether `docs/PRD_MONETIZATION.md` contemplates a model-index product | Not read in this pass. |

## Planned — not started

Everything in `docs/CB_MODEL_INTEGRATION_2026-09-06.md` §5 Phase 0–3. Nothing has begun. The
directory you are reading is the only CB-MODEL artifact that exists.

---

## What does NOT exist — stated explicitly so absence is never mistaken for omission

- No model. No model snapshot. No model identity record of any kind.
- No model score, anywhere, at any stage of draft.
- No model API credential, endpoint, adapter, client or key. Grep for `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`, `api.anthropic.com`, `api.openai.com` outside `node_modules`: **zero hits**.
- No approved spend budget. No cost has been incurred.
- No rater, no rating, no calibration set, no gold item, no adjudication.
- No reliability statistic, no confidence interval, no tie group.
- No Methods Committee.
- No release scan for models has ever run.
- No CB Model Index page, route, dataset or API surface.
