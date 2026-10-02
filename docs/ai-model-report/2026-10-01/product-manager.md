# Product manager brief: AI model results report, 2026-10-01

Sources: `research/model-runs/pilot-2026-10-01/analysis.json` (A), `research/model-assessments/pilot-2026-10-01.md` (R), `docs/AI_MODELS_PAGE_REVIEW_2026-10-01.md` (PR), `DECISIONS.md` D-29 (l.636-672), `docs/FOUNDER_DECISION_PACKET_2026-10-01.md` (FDP), `docs/PRD_MODEL_BENCHMARK.md` (PRD).

## 0. Problem statement

The programme has run its first blinded pilot (A `design`). The only publishable finding is about the instrument: it separates one small model from three larger ones and does not separate the three larger ones (R:105-106). D-29 forbids any model composite or band "anywhere, in any form" (DECISIONS.md:656-658). Without an amendment, the pilot stays in `research/` and the page keeps repeating "zero" (PR F1). The report must say what was learned without becoming a leaderboard.

## 1. Audiences and jobs-to-be-done

| Audience | Job | What the report must give them |
|---|---|---|
| Researchers | Judge whether the method is sound and reusable | Design, judge exclusion, length confound, contamination clearance scope, raw-artifact paths (R:62-90) |
| Journalists | Find one accurate sentence to quote | A "may say / may not say" block (PR B5); the separation finding in one line |
| AI labs | Learn what is measured and that nobody can pay to change it | Independence statement; no per-model headline; access tier "agent", not API |
| Policymakers | Decide whether this is evidence yet | The publication bar, how much is met (PR A3), and what is still missing (R:100-105) |
| General public | Find out whether to trust an AI in a crisis | Duty-of-care note near the top, not the bottom (PR F10); explicit "not guidance" |
| Answer engines | Extract self-contained claims | Definition list, standalone FAQ answers, no "above/below" references (PR F10); words-only JSON-LD |

Buyer: none. Commercial services support access and interpretation only (CLAUDE.md independence policy). No section may reference a purchase.

## 2. MVP scope

### (a) /ai-models update

Must have:
- PR Part A items A1-A3, A6-A9, A12 (nesting fix, single zero statement, one publication bar, derived counts, verdict-first self-run, one status vocabulary, Stage 2 rewording, lab-to-model link).
- A "Pilot runs" section (`id="runs"`, not a route) with a link to the narrative. Gated by the amendment in section 5.
- Crisis one-liner in the first two screens.

Should wait: A10 jump list polish, A11 section condensation, glossary component.

### (b) Narrative (one route, about 3,000 words)

Must have, in this order:
1. Status and verdict, with no composite.
2. What was tested and what was controlled.
3. What the pilot found about the instrument: the three-larger-model non-separation, the haiku separation with the length confound, empathy as the lowest dimension for every model, and clean contamination probes on sampled items only.
4. Judge reliability: haiku exclusion, disclosed as post-hoc, with agreement figures.
5. Limits: same family, public pool, 0 of 93 items validated, no human raters, agent tier.
6. What would make a result publishable.
7. How to cite, and the duty-of-care note.

Should wait: a methods appendix as a separate route; charts beyond per-dimension interval bars.

### (c) Reusable assessment template

Must have fixed sections (status banner, design card, instrument findings, separation result, confounds, judge record, deviations log, publication-bar table, may-say/may-not-say). All figures come from one `analysis.json` schema. Include a pre-registered judge-exclusion rule (FDP #3). Include a mandatory "not separated" rendering path.

Should wait: multi-wave trend views; non-Claude subject columns.

### Explicit non-goals

- No composite, band, rank, sort order, "best/worst" label, or implied ordering, including ordering by dimension means.
- No per-model route or stub (D-29 doorway rule; D-30).
- No `Dataset`, `ItemList` or `Rating` JSON-LD.
- No change to `evaluatedModelCount`, `hasResults`, `registry-v1.json` or score history (PR B0.4).
- No advice on which model to use, especially in a crisis.
- No claim that the result generalises beyond Claude-family models, or to deployed products.
- No publication of any lab's index score as a model score.
- No new numbers typed by hand.

## 3. Success metrics

| Metric | Baseline | Target | Type |
|---|---|---|---|
| Model composites, bands or ranks on any public surface | 0 (PRD:257) | 0 | Launch gate |
| Hand-typed catalogue counts in `src/app/ai-models` | At least 1: `page.tsx:293` (PR F9) | 0, enforced by test | Launch gate |
| Statements of the publication bar | 5 versions (PR F4) | 1 definition, referenced elsewhere | Launch |
| First-viewport statements of "zero" | 4 (PR F1) | 1 | Launch |
| Contradictions between the methodology and index pages | 2 (PR F2) | 0 | Launch |
| Pilot figures on the page traceable to a field path in `analysis.json` | N/A (no pilot content yet) | 100% | Launch |
| Pageviews, Search Console impressions, answer-engine citations, backlinks | No baseline (PRD:266-271); analytics owner must supply | Incomplete until a baseline exists | Post-launch |
| Journalist quotes that include a model score or ranking | 0 known; no monitoring exists | 0; needs a monitoring owner | Post-launch |
| Waves run using the template without schema change | 0 | The next wave | Post-launch |

Requirement status: the post-launch traffic and citation targets are incomplete and are not set here.

## 4. Acceptance criteria (QA-testable)

1. **No-score scan.** Rendered HTML, metadata, JSON-LD, feed and sitemap contain no composite, band label, rank or "best/worst" text for any named model. A key scan rejects `composite`, `band`, `rank` and `score` in the pilot store.
2. **Order.** Subject cards are alphabetical by label whatever the data. A test shuffles the input and the output is unchanged.
3. **Qualifier.** Every subject label is in the same element as "agent tier, snapshot unverified" and "unofficial pilot".
4. **Separation statement.** The first finding states that fable, opus and sonnet are not separated, and appears before any per-subject figure. It uses no composite-scale number. Source: A `pairwise`.
5. **Haiku statement.** It says the gap is real in direction but confounded with reply length (A `length`), and never uses "weaker" or "worse" without that qualifier.
6. **Derived numbers.** Every figure resolves to a field path in `analysis.json` or `MODEL_INDEX_FACTS`. `npm run test` fails on a typed literal.
7. **Counts invariant.** `evaluatedModelCount`, `scoreRecordCount` and `hasResults` are identical with and without the pilot store.
8. **Disclosures present.** Same family, bank authored by the same family, agent tier, public pool, "0 of 93 items validated" (derived), no human raters, haiku judge exclusion labelled post-hoc, contamination scoped to "sampled items only".
9. **Crisis note.** The duty-of-care sentence is visible within the first two screens at 390px and again at the end.
10. **Gate.** The pilot section does not render unless `DECISIONS.md` contains the amendment id as `active`.
11. **Structure.** No nested `<section>`; one H1; the narrative is 2,700 to 3,300 words; no "above/below" in FAQ answers.
12. **Product separation.** `validate-product-separation.mjs` passes with the pilot store included.
13. **Independence.** No page content, CTA or footer suggests any lab paid, sponsored or endorsed.

## 5. Recommended D-29 amendment (minimal, testable)

> **D-29a (proposed, date TBD).** `/ai-models` and one narrative route `/ai-models/pilot-report` may publish unofficial pilot results, as an exception to "no model composite or band... in any form", subject to all of the following:
> 1. Every result is labelled "Unofficial pilot" with run id, date, access tier and "not a score, not comparable to any index".
> 2. No composite, band, rank, sort-by-result, or best/worst label appears in HTML, metadata, JSON-LD or feeds. Per-dimension ranges and separated/not-separated statements are permitted.
> 3. Subjects appear alphabetically, each with its access-tier qualifier.
> 4. `evaluatedModelCount`, `hasResults` and the registry are unaffected.
> 5. All figures derive from a committed analysis artifact. The page states judge-family, bank-authorship, public-pool and validation limits.
> 6. No per-model routes. Official publication still requires the amended publication bar.

Founder decisions needed:
- (i) A second route lifts D-29's two-page cap. The alternative is to keep the narrative as a section, which fits the D-30 precedent but cannot hold about 3,000 words without hurting scanability. I recommend the second route.
- (ii) Whether paired-difference intervals (composite-scale points) may appear. I recommend no. State "not separated" in words.
- (iii) Whether to publish before FDP #4 (non-Claude judge). FDP #2 advises waiting. I recommend a quick decision on #4 before launch, because publishing a same-family pilot first invites the wrong headline.

## 6. Top five risks

1. **Screenshot becomes a leaderboard.** Dimension means or card order implies ranking. The three larger models are not separated (A `pairwise`, R:45-50). Mitigation: acceptance 1-3, with the qualifier on every card and no means shown.
2. **Missing data for the plan.** PR B1 requires per-dimension intervals. `analysis.json` holds only composite intervals, pairwise differences and dimension means. I found no per-dimension interval field. Mitigation: extend `analyze-pilot.mjs` before build, or drop the per-dimension view. Do not compute intervals by hand.
3. **The haiku finding gets read as "small models are less compassionate".** Length is an unresolved confound (R:51-57). Mitigation: acceptance 5; a length-matched arm in the next wave (FDP #6).
4. **Same-family circularity gets dismissed as a footnote.** Subjects, judges and the bank author are all Claude. The 2026-09-25 invalid run is already the most quotable item (PR F6). Mitigation: disclosure first, not last; leave the self-run figure out unless the founder confirms it is covered by D-29.
5. **Stale and conflicting claims.** Five publication-bar versions, hand-typed counts and a stale artifact (PR F4, F9) mean the report could contradict the site. Also, FDP #1 notes production was last built 2026-09-25, so nothing here is live until deploy. Mitigation: A3 needs the founder's canonical bar (FDP #5) before build.

Also open: "6 pages" is interpreted as about 3,000 words. Confirm that interpretation.
