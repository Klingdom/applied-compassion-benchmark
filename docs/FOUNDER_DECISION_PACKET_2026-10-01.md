# Founder decision packet — 2026-10-01

Everything below is blocked on you. Each item has a recommended default; "approve" means adopt the default.
Sources: ITERATION_LOG Iterations 87–89, `research/model-assessments/pilot-2026-10-01.md`,
`docs/AI_MODELS_PAGE_REVIEW_2026-10-01.md`, `research/digests/2026-10-01.md`.

## Urgent — live on production now

| # | Decision | Why now | Default |
|---|---|---|---|
| 1 | **Merge and deploy (D-47).** | Production was last built 2026-09-25. The published **2026-09-24 briefing returns 301 → /404** (verified today, 8 days). 14+ commits of `/ai-models` work, the Oct 1 briefing, and the Part A corrections are unserved. | Commit by the pathspecs in ITERATION_LOG 87, 88, 89 (never "commit all"; exclude the held America-at-250 pair), merge, deploy, then V7 post-deploy check. |

## AI Models (your request: "start running models")

| # | Decision | Default |
|---|---|---|
| 2 | **Amend D-29 to allow a clearly labelled pilot section** on `/ai-models` (Part B of the page review). No composite, band or rank shown; per-dimension intervals only; alphabetical; the separation finding stated first ("does not separate the three larger models"). | Approve the amendment *text*, but publish only after #4 — a pilot built entirely inside one model family invites the wrong headline. |
| 3 | **Ratify the post-hoc exclusion of claude-haiku as a judge** (quote-grounding 14.7% vs ≤ 0.6% for the others). It was triggered by a pre-existing harness check, before scores were seen, and is fully disclosed. | Ratify, and pre-register for future runs: *a judge is excluded if > 5% of its evidence quotes are non-verbatim on a pilot calibration batch*. |
| 4 | **Provider credentials + a spend ceiling (F1–F3, unchanged since 2026-09-20).** The pipeline is now proven end to end; the binding constraint is that every subject and judge is a Claude model. One non-Claude judge and two non-Claude subjects would remove the largest disclosed bias. | Approve one key per provider for 2 external models, ceiling ~$50 for a full wave (API cost estimated at well under that; rater time remains the real cost). |
| 5 | **A3 — the canonical publication bar.** Five pages state five versions of what a model must clear before an official score (listed in the page review). Needs one list, owned by you. | Use D-43's list plus "two independent human raters + adjudication". |
| 6 | **Reply-length design.** The Haiku gap is confounded with reply length (137 vs 310–411 words). Options: length-matched prompts ("reply in about N words"), or a length-controlled analysis pre-registered as primary. | Add a length-matched replicate arm to the next wave. |

## Research cycle (Oct 1)

| # | Decision | Default |
|---|---|---|
| 7 | **7 pending proposals** — Valencia, Madrid, Glasgow (flag), Cornell, Vietnam, Bangladesh, Birmingham (flag). All independently re-verified (composites reproduce, 0 baseline drift). | Review in `research/PENDING_CHANGES.md`; six are first-ever individual assessments, not measured declines. |
| 8 | **Seed calibration question.** Across three cycles, 12 first assessments of seeded entities came in lower 11 times. The seed values may be systematically high. | Commission a calibration study before applying the six first-assessment downgrades as a batch. |
| 9 | **4 misdated-claims ledger additions** recommended by scanner/assessor. | Approve; agent adds them with tests next loop. |

## Still open from earlier packets (unchanged)
D-13 (waiver cliff 2026-11-17; RISK-015 T-30 is 2026-11-09) · D-48 · D-49 · D-50 · CS-2b · CS-3 · RS-7.
