# A scored MCP run: "run my model through every dimension and subdimension and give me a score"

**Date:** 2026-09-20 · **Author:** coordinator · **Status:** design for founder decision. Nothing built.
**Supersedes nothing.** Extends `docs/MCP_SERVER_PLAN_2026-09-20.md` (the two-server split) with the part the founder
asked for directly: **a number at the end**.

---

## 1. Three things are true at once

1. **You want a score.** A tool that runs a model through the instrument and returns "no number" is, to most users, a
   broken tool. That instinct is right.
2. **The ratified design says this tool emits no composite and no band** (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md`
   §5.2 / J2), *specifically* so a self-run estimate can never be screenshotted as a Compassion Benchmark score.
3. **We already publish a composite under exactly this compromise.** `/ai-evaluation-suite` emits a 0–100 composite
   and band names with `official: false`. The architecture flags the inconsistency itself as **AMB-B: "two standards
   for the same output class"**, unresolved.

So this is not "rules versus what the founder wants". It is **AMB-B waiting for a decision**, and the decision is
yours. This document proposes resolving it in the direction you are pointing — *emit the number, make it impossible to
mistake for ours* — and specifies exactly what has to be true for that to be safe.

---

## 2. The blocking fact: subdimensions do not exist in the model bank

**Verified 2026-09-20, reproducible:**

| Check | Result |
|---|---|
| Subdimension codes defined in `site/src/data/dimensions.ts` | **40** (A1–A5, E1–E5, …) |
| Live model task items carrying a `subdimension` field | **0 of 33** |
| Live items referencing any subdimension code anywhere in the item | **0** |
| Live item `construct` values matching a subdimension name exactly | **0 of 33** (control: the name list does contain "Awareness", so the matcher works) |
| The 9 drafted items (2026-09-18) | Name codes like EQ3/B2/S2 **in prose**, still not in a structured field |

**Consequence: "run the model through all 40 subdimensions" cannot be built today, by anyone, at any price.** The
instrument has a subdimension layer; the model task bank was never wired to it. Any tool claiming a subdimension score
right now would be inventing the mapping at runtime — which is precisely the sort of quiet fabrication the rest of
this system is built to prevent.

### What it takes to make it real

| Level | Items needed | Why |
|---|---|---|
| **Dimension-level score** (8 numbers + composite) | ~28 today (already possible) | What the harness and `computeCompositeFromDimensions` already support |
| **Subdimension-level score** (40 numbers) | **≥ 80**, realistically 120 | One item per subdimension is a single point of failure; two gives disagreement signal, three gives a mean |
| Today's coverage | 28 scorable, and **SYS 2 · INT 2 · EQU effectively 1** (two of three EQU rubrics are unscorable, MB-5) | A composite today leans on 2 items for an eighth of the score |

**Recommendation:** ship the tool **dimension-level first**, and have it say plainly *"subdimension scoring is not
available: the item bank does not yet carry subdimension tags"*. Then expand the bank. A tool that admits a gap is
worth more than one that fills it with a guess.

---

## 3. What the scored run emits

A **`SelfRunScorecard`** — same arithmetic as ours, different name, unmistakable provenance.

```
composite            0–100, computed by the canonical computeCompositeFromDimensions — identical maths
band                 the canonical band name for that composite
dimensions           the 8 dimension means that produced it
items                per item: rating 1–5, the rubric anchor chosen, the rationale, the response text
trials               per item, with variance across trials
subdimensions        ABSENT, with an explicit reason string — never zeros, never nulls pretending to be scores
provenance           subject_label, judge_label (both self-reported, unverified), judgeConfiguration,
                     bankVersion, itemHashes, seed, temperature, timestamps
contamination        the exposure-probe result (see §5) — MANDATORY before a composite is emitted
official             false, always, structurally
header               a fixed statement: this is a self-run estimate, not a Compassion Benchmark score
```

**Why the same arithmetic.** If we invent a different formula for self-runs, every number becomes incomparable and the
tool teaches a wrong mental model of the benchmark. Same maths, different status, is more honest than different maths,
same name.

**What still must never exist:** a rank against published entities, a claim of officiality, a leaderboard, or a
comparison of two subjects inside the tool. Those are the things that turn an estimate into a counterfeit.

---

## 4. The integrity problem you cannot design away: the judge is the subject

In an MCP host, the model doing the work is usually the model being measured. **A model rating its own compassion is
the weakest possible configuration** — and our own repo contains the evidence that even neutral automated scoring is
unstable: D-07 records the same pipeline scoring ADP 58.1 and 60.6 three days apart, across a band boundary.

| Configuration | What happens | Composite allowed? |
|---|---|---|
| **C1 self-judge** | The host model answers and rates itself | **Yes, but flagged** `judgeConfiguration: "self"` and reported with its known inflation risk |
| **C2 cross-judge** | Host model rates transcripts from a *different* subject model the user supplies | **Yes** — the default we should recommend |
| **C3 panel** | Two different judge models, disagreement reported | **Yes**, and the only configuration whose variance means much |
| **C4 official** | CB's own harness, CB's raters | The only one that is ever a Compassion Benchmark score |

**Mechanical requirements:** the scorecard records which configuration ran; C1 carries a prominent self-judge notice;
every item rating must cite the anchor it matched and quote the evidence from the response, so a rating is auditable
rather than a vibe; and multi-trial variance is reported, never averaged away silently.

---

## 5. Contamination is not optional — it is the first tool that runs

Our entire item bank is published with full rubrics (`exposureStatus: public-permanent`). **Any model trained after
publication may have memorised both the items and the answer key.** A tool that hands out scores without testing for
that is manufacturing flattering numbers.

So: **`run_exposure_probe` executes before any composite is emitted**, and its result is embedded in the scorecard —
recall of item text, rubric-leak indications, per item. If exposure is high, the scorecard says so next to the number,
in the same visual weight.

This is also the most defensible public artifact we could produce this year: *a measurement of how contaminated
published benchmarks have become*, using our own bank as the test case.

---

## 6. Tool surface (additions to `cb-probe`)

| Tool | Returns |
|---|---|
| `start_scored_run({ subject_label, judge_label, judgeConfiguration, dimensions?, trials? })` | `run_id`; refuses if `trials < 3` (the variance threshold in `evaluation-statistics.mjs`) |
| `next_item({ run_id })` | The next item's prompt only — the host model answers it |
| `record_item_rating({ run_id, item_id, response_text, rating_1_5, anchor_matched, evidence_quote })` | Validation; rejects a rating with no anchor and no quote |
| `finish_scored_run({ run_id })` | The `SelfRunScorecard`, **only if** the exposure probe has run |
| `explain_what_this_is_not()` | The separation statement, retrievable so a host model can cite it |

Everything stays local: no network, no CB endpoint, no key. The host model is the judge, so the user's client already
holds the only credential involved.

---

## 7. Decisions required

| # | Decision | Recommended default |
|---|---|---|
| **S1** | **Resolve AMB-B**: may a self-run tool emit a composite and band under `official: false`? | **Yes** — matching `/ai-evaluation-suite`, with the provenance and contamination fields mandatory. One standard, applied to both |
| **S2** | Ratify the **`SelfRunScorecard`** shape, including `official: false` as a structural field, not a label | Ratify |
| **S3** | **Subdimension scoring**: fund the bank expansion to ≥ 80 items, or accept dimension-level only for now | Dimension-level now; expansion as a funded track |
| **S4** | Is **C1 self-judge** allowed to emit a composite at all, or only C2/C3? | Allow, flagged — refusing it would just push users to a worse unlabelled workaround |
| **S5** | **Name.** "Compassion Benchmark self-run estimate" keeps our name on it (AMB-E). An unbranded name protects the institution but loses the point of the tool | Branded, with the mandatory header — the exposure probe is our best credibility argument, so own it |

---

## 8. What I would build, in order

1. **The guarantee first** — scorecard schema, `official: false` structural, vocabulary-ban test, promotion-proof scan.
2. **Dimension-level scored run** — C2 cross-judge as the documented default, C1 allowed and flagged.
3. **Exposure probe wired as a precondition** of any composite.
4. **Bank expansion to subdimension coverage** — the long pole, and the only route to what you actually asked for.
5. **Wrappers** — skill and plugin, adding no capability.

**The honest headline:** you can have a scored MCP run in days, at dimension level, with contamination disclosed. The
"all 40 subdimensions" version needs roughly 80–120 items built and reviewed first — and that is the same bank freeze
that the first official assessment is already waiting on, so the two tracks fund each other.
