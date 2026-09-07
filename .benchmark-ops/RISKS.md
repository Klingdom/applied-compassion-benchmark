# CB-MODEL — Risks (POINTER FILE)

> ## THIS FILE IS A POINTER, NOT A RISK REGISTER. DO NOT ORIGINATE RISKS HERE.
>
> **The authoritative risk register is `RISKS.md` at the repository root**, carrying RISK-001
> through RISK-008, each with evidence, mitigation, owner and status.
>
> CB-MODEL risks are added to that file as **RISK-009 onward**. This file indexes which existing
> risks bind CB-MODEL, and holds the new ones as **proposals awaiting founder acceptance**.

Rationale for the pointer treatment: `docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-01.

**Last updated:** 2026-09-06 (created).

---

## Existing root risks that bind CB-MODEL

| ID | Risk | Why CB-MODEL inherits it |
|---|---|---|
| **RISK-003** | 12+ entity-currency defects, including five cross-index double-publications with gaps up to 23.1 points | Microsoft AI / Microsoft, Amazon AWS AI / Amazon, Meta AI / Meta Platforms are three of them. Until resolved, the AI Labs Index — the product CB-MODEL must stay separate from — contains three duplicate identities. |
| **RISK-006** | Band-boundary ambiguity at composite 60.9, undocumented, ~30 entities | Open since 2026-07-30. CB-MODEL cannot publish band labels on top of an undocumented boundary. Confirmed independently: seven `ai-labs.json` rows at 60.9 fall in a gap in that file's own band table. |
| **RISK-005** | Two live scoring conventions for absence of disclosure in the ai-labs index (Cerebras at 3, ~56 peers at 2) | D-14 is `unresolved`. CB-MODEL must not inherit an unresolved convention. |
| **RISK-007** | Reputational/legal exposure from publishing scored judgments about named real institutions | Higher for CB-MODEL, not lower: a model score is a claim about a specific commercial product's behaviour, made by an independent party, on a permanent URL. |
| **RISK-004** | Auto-deploy broken; publication depends on a manual step | Any CB-MODEL result reaches the public through the same manual path. |
| **RISK-001** | ~59% of published entities sit on placeholder scores | Constrains what the AI Labs Index can honestly be compared against. |

## Proposed new risks — NOT YET IN THE ROOT REGISTER

Each needs the founder to accept, amend or reject, then be written into the root `RISKS.md`.

| Proposed | Risk | Likelihood | Impact | Evidence | Mitigation (proposed) |
|---|---|---|---|---|---|
| **RISK-009** | **`/ai-evaluation-suite` advertises four capabilities the live page does not have** — "Set model name", composite scoring, JSON export, CSV export, scorecard copy — on a page carrying two "License the Platform" CTAs to `/contact-sales`. The working tool exists only in `legacy-html/ai-evaluation-suite.html`; the Next.js port kept the copy and dropped the behaviour. | **Certain — it is the current state** | **High.** This is a capability claim to a prospective customer. It is the one finding here that could be characterised as a misrepresentation rather than a defect. | `page.tsx`: no `"use client"`, no state, no handler, no input; four inert `<Card>` elements under "Export & API" | `WQ-P0-03` — restore the tool under the canonical formula, or rewrite the page to describe what it is |
| **RISK-010** | **Two composite formulas and two band functions published under one brand.** Composite 60.5 = "Established" under `scoring.ts`, "Functional" under the platform's `getBand()`. | Certain | Medium-High — the contradiction is on the page that most resembles a methodology statement | CONFLICT-04 | `WQ-P1-01`; needs `BLK-006` |
| **RISK-011** | **Two 40-subdimension taxonomies published.** 7 of 40 names match; AWR, EQU, BND, INT overlap on **zero**. Both pages claim "40 indicators". | Certain | Medium-High | CONFLICT-05 | `WQ-P1-02`; needs `BLK-006` |
| **RISK-012** | **`xAI/Grok` publishes one composite (0.0) for a fused organisation-and-model identity.** `DeepMind/Google` fuses two organisations. | Certain | High — a literal, currently-published instance of the one rule the package calls non-negotiable, at the bottom of the table where being wrong is most damaging | `ai-labs.json` ranks 50 and 13 | `WQ-P0-04` — structural rename, no score change |
| **RISK-013** | **≥10 AI Labs Index rows score deployed product configurations**, ranked against organisational governance scores. Replika 21.9, Character AI 0.0, Perplexity 45.3, Midjourney 21.9, Clearview AI 10.9, Waymo 42.5, Abridge 60.9, Harvey AI 48.4, Typeface 48.4, Pika Labs 25.0. | Certain | Medium-High — a reader comparing "Replika 21.9" to "Anthropic 59.1" is comparing product behaviour to institutional governance, and the table presents it as a rank | `ai-labs.json` roster; `00-MASTER-CONDUCTOR` product definitions | Product decision (`WQ-P3-01`). Interim: disclose the mixed-subject composition on the index page |
| **RISK-014** | **The first CB-MODEL publication will place model scores adjacent to identically-formatted lab scores**, on the same 0–100 scale with the same five band labels and no reader-facing distinction. | **High, and it materialises on day one of publication** | **High** — this is how the model/lab merge actually happens: not in the data, in the reader | §2.2; index `meta.title` says "Companies" while rows are named like products ("Microsoft AI", "Palantir AI") | `WQ-P1-09` — distinct routes and page furniture, plus an explicit non-comparability statement, **before** first publication |
| **RISK-015** | **The entire public item pool is permanently published with its answer key.** All 33 prompts and 165 rubric anchors are on `/ai-evaluation-suite`. Any model trained after that page went live may have memorised them. | High | High for any score derived from the public pool alone | `page.tsx` `PROMPTS` array; `03-BENCHMARK-BATTERY` §saturation/leakage | The secure pool (`WQ-P2-05`). Until it exists, **no public-pool score may be published as a measurement** |
| **RISK-016** | **Rater welfare.** The existing item set contains active suicidal ideation (`ACT-1-A`), domestic violence with children (`ACT-5-A`), psychosis-adjacent disclosure (`ACT-5-B`) and miscarriage (`EMP-1-B`). Recruiting raters before exposure limits, rotation, opt-out and escalation exist would expose real people to this material without protection. | Medium — only if recruitment precedes protocol | **High** | `05-HUMAN-RATING` §rater protection | `WQ-P2-04` — protocol in force **before** the first rater sees an item. Sequencing, not paperwork |
| **RISK-017** | **Programme funding will likely come from, or require paid access to, the same organisations the programme scores.** | High — structural | Medium, if disclosed; High, if not | `11-FUNDING-AND-PARTNERSHIPS` safeguards; `CLAUDE.md` independence policy | `COST_LEDGER.md` `donated`/`donor` fields; the 20% cap after Year 1; funding disclosure as a required model-page field (`07`) |
