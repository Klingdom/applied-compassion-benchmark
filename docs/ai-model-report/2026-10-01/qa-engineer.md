# TEST_PLAN: AI model results release, 2026-10-01 (QA engineer)

Sources read: `research/model-runs/pilot-2026-10-01/analysis.json` (A), `research/model-assessments/pilot-2026-10-01.md`, `docs/ai-model-report/2026-10-01/product-manager.md` (PM), `site/package.json` test chain, `test-no-stale-counts.mjs`, `test-bank-claims.mjs`, `test-product-separation.mjs`, `docs/DEFECT_CLASS_REGISTRY.md` (DC-01, 02, 15, 18, 20, 22).

Convention: expected values are always read from a field (A.x.y), never typed into a test or into this plan. Every new gate ships with a planted-probe negative control (NC): a synthetic bad input that the gate must reject, run in the same script. A gate with no NC is treated as vacuous (DC-15, vacuous zeros).

## 1. Acceptance criteria

### 1a. /ai-models page update
- AC-P1: Status wording uses one vocabulary. "Unofficial" appears in the pilot section, and no text on the page implies a Compassion Benchmark model score. Existing "not accurate: any ranking of AI models" copy survives.
- AC-P2: `id="runs"` section links to the report route. It shows no composite, band, order or sort. Subject names appear in a fixed alphabetical order, and the order is stated as non-ranking.
- AC-P3: Counts come from `model-index-facts.ts` or A (`design.items_served`, `design.responses`, `design.ratings`). `evaluatedModelCount` and `hasResults` are unchanged (PM non-goal; registry untouched). Reading: `hasResults` must still evaluate from `registryEntries.length`, not from the pilot.
- AC-P4: A crisis one-liner is in the first two screens (a DOM check of position, not just presence).
- AC-P5: No new `Review`, `AggregateRating`, `Rating`, `Dataset` or `ItemList` JSON-LD.

### 1b. Report route (about 3,000 words, about 6 printed pages)
- AC-R1: Status banner containing "unofficial" is the first content block of every report route, and sits inside `<main>` before the first heading's body text.
- AC-R2: The headline finding is that the instrument does not separate the three larger models and does separate the smaller one. Derived from `pairwise[].separated`: the claim set must equal the set of pairs where `separated` is true, in both directions (a missing separation and an invented one both fail).
- AC-R3: Every number resolves to an A field (see gate G1). Rounding follows A's own precision.
- AC-R4: The length confound is stated next to every haiku claim, within the same paragraph. The statement is tied to `length.pooled_within_item_r` and `composite_if_pooled_slope_removed`, flagged as "extreme bound, not an estimate" (A.length.note).
- AC-R5: The haiku-judge exclusion is disclosed as post-hoc, quoting A.exclusion_record.disclosure verbatim. All four subjects' `contamination.indicated` are reported with their scope: "3 recall items and 6 identification asks per subject", which come from the fields. Reading: "clean" must not be extended past sampled items.
- AC-R6: Limits section covers same-family judges (A.design.judge_family), agent access tier with unverifiable snapshot, no human raters, 0 validated items. The zero is stated once, with its source field or file.
- AC-R7: A duty-of-care note, "not guidance on which model to use in a crisis", appears in the first screen and again at the end. Crisis resources are never placed adjacent to a model name or a score.
- AC-R8: Independence statement present; no purchase link or Gumroad URL on any report route.
- AC-R9: No per-model route or stub; the route count increases by exactly the report routes the PM approved.
- AC-R10: Static export. The report builds from JSON at build time with no client fetch, and `out/` contains the route as HTML with the text present in the markup (not injected).

### 1c. Reusable template
- AC-T1: One schema (`analysis.schema.json` or equivalent) validates A. It rejects an A missing `status`, with `official` not false, or with `comparability` not "none".
- AC-T2: The template has fixed ordered sections (status banner, design card, instrument findings, separation, confounds, judge record, deviations, publication bar, may-say / may-not-say). A section list check fails if one is missing, renamed or reordered.
- AC-T3: The template contains no figure literal, only field references. The wave 2 dry run (below) passes every gate with no code change.
- AC-T4: Pre-registration slot exists. Deviations log entries carry "post-hoc" or "pre-registered" labels.

## 2. Automated gates to add

Add all as `test:*` scripts and append to the "test" chain (chain is 57 steps; new total is derived, not asserted). Each runs with `node` and no network.

| ID | Gate | Assertion | Planted-probe NC |
|---|---|---|---|
| G1 | `test:report-figures` | Extract every numeric token in report prose and tables (excluding years, dates, section numbers, ids and a short allow-list of structural integers declared in the template). Each must equal, after rounding to the displayed precision, some value reachable in A or the declared wave data. Unresolvable token fails and prints location. | Inject "71.3" and a composite changed by 0.1 into a copy of the rendered text: both must fail. Also inject an A value whose figure was swapped between two subjects: must fail via the labeled-binding check (figure plus nearby subject name must match `subjects[name]`). |
| G2 | `test:report-binding` | Figures bound to a subject, dimension or pair are verified against that exact path, not just anywhere in A (DC-15: a "value exists somewhere" check passes when labels are swapped). | Swap fable and sonnet dimension values: must fail. |
| G3 | `test:no-unseparated-ranking` | Scan visible text, headings, `<title>`, meta description, OG tags, JSON-LD and alt/aria text of all report routes and /ai-models. Reject ranking lexicon (best, worst, top, #1, leads, beats, outperforms, ranked, most/least compassionate, ahead, behind, winner, tier ordering, comparatives "higher/lower than" and ordinal adjectives next to a model name) when the named pair is not `separated:true` in A.pairwise. Pairs with `separated:true` are allowed only in neutral wording ("separated from"), still without "best/worst". | Probe set: "Fable leads the field", "Opus beats Sonnet", "#1", "top-scoring", "Sonnet ranked third", "the most compassionate model", plus a sentence sorted by composite. All must fail. Positive control: "does not separate opus from sonnet" must pass. Also a probe in JSON-LD and in `<title>`. |
| G4 | `test:no-implied-order` | Any table, list or chart series over subjects is in alphabetical or fixed-declared order, never sorted by a metric. Compute composite order and reject if tuple order equals it and is not also alphabetical. Chart series in markup also checked. | Fixture sorted by composite: must fail. Note fable, haiku, opus, sonnet is alphabetical and also, in part, a coincidence of composite order for three, so the NC uses a fixture where alphabetical differs. |
| G5 | `test:report-status-banner` | Every route under the report path, discovered by walking the built `out/` tree (not a hand-listed set), contains "unofficial" within the first banner block and the A.status string. | Add a dummy route with no banner: must fail. Gate also fails if the walk finds zero routes (vacuous zero). |
| G6 | `test:no-rating-schema` | Parse all JSON-LD on /ai-models and report routes. Forbid types Review, AggregateRating, Rating, Dataset, ItemList, Product. Allowed types: Article/Report, BreadcrumbList, FAQPage with words-only answers. | Inject each forbidden type: must fail. Fail if no JSON-LD found where the template requires it. |
| G7 | `test:crisis-adjacency` | Crisis block must exist in first screen and end; no crisis resource text within N DOM nodes of a subject name or numeric result; no sentence combining a model name with "safe", "recommend", "use" or "trust". | Place a crisis line inside the results table row: must fail. "Opus is safe to use" must fail. |
| G8 | `test:report-claims-vs-pairwise` (extends test-method-claims style) | Count and name of separated and non-separated pairs in prose derived from `pairwise[]`. The sentence "does not separate X, Y, Z" holds only if all pairs among them have `separated:false`. | Flip one `separated` flag in a fixture copy: prose must fail. |
| G9 | `test:analysis-schema` | A validates the template schema; `official===false` and `comparability==="none"` on every subject; interval contains composite or flags otherwise (check A.fable: composite 69.5 within interval95, field comparison only). | Mutate `official:true`: must fail. |
| G10 | `test:report-regeneration` | Report generator run twice on the same A yields identical bytes (DC-08 non-determinism). No `new Date()` in output. | Introduce timestamp in a copy: must fail. |
| G11 | `test:report-word-budget` | Word count within the 2,700 to 3,300 band and printable sections count; fail below band so a truncated report cannot pass. | 500-word fixture must fail. |
| G12 | `test:report-no-stale-counts` | Extend `test-no-stale-counts` globs to include new report sources and verify no hand-typed "83 items", "996 responses" outside generated blocks. | Probe literal in a fixture file. |
| G13 | `test:template-wave2-dryrun` | Synthetic wave fixture (different run_id, different numbers, a non-separated and a separated pair set flipped) renders and passes G1 to G9. This is the guard against fixtures that encode the implementation: the dry run uses values unlike the pilot's, and the pilot's figures appear nowhere in gate code. | Fixture with a figure absent from its A: must fail. |
| G14 | `test:product-separation` extension | No report text names a lab index score as a model score; no entity-index import in report components. | Probe "Anthropic scores N" fixture. |

Gate-quality rules: each gate prints a count of items examined and fails on zero; each NC asserts the specific rule that tripped, not just non-zero exit.

## 3. Manual checks (before merge, recorded with date and viewport)
1. 390px width: no horizontal scroll; banner, tables and charts legible; tables collapse to stacked or scroll within container; tap targets at least 44px.
2. Print to PDF (A4 and Letter): 5 to 7 pages; banner and "unofficial" on page 1; no table split mid-row; charts monochrome-safe; footer URL and date present.
3. Screen reader (NVDA or VoiceOver): each chart has a text alternative or data table giving subject, interval low/high, and states that intervals overlap where `separated:false`; reading order matches DOM; headings form a clean h1-h2-h3 outline; banner announced first.
4. Keyboard only: skip link, jump list, no trap.
5. View-source on built HTML: the text exists without JS; `<title>` and meta carry "unofficial".
6. Crisis block read in context by a human for tone; no model implied as a crisis tool.
7. Copy-paste a single paragraph out of context (answer-engine test): it still carries "unofficial pilot".
8. Contrast, dark theme, and 200% zoom.

## 4. Existing tests likely to break, and why
- `test:no-stale-counts`: matches "(entities|entries|institutions|files)" after 1,1xx to 1,3xx numbers and "N indexes". Report prose with "1,992 ratings" is safe, but "996 responses" is fine while a line like "1,325 entities" in citation text breaks. Watch the GAP matcher. It scans the whole file, so JSX-wrapped counts in the new page will also trip it.
- `test:bank-claims`: scans documented surfaces for item claims (EQU-1-B and EQU-1-C). Any report mention of item-level rubric defects must name the derived set. Cite or omit.
- `test:method-claims`: recomputes worked examples against `scoring.mjs`. Any scoring example in the report is recomputed; "dimension mean of item means" wording must match.
- `test:product-separation` / `validate:product-separation`: the live smoke test asserts the guard exits non-zero. New model-related rows must not leak into the index files; a report mentioning "Claude" next to lab entities may raise WARN.
- `test:model-registry`, `test:model-releases`, `test:model-score-history`, `validate:model-sources`: break if the update touches registry or histories. Expected: no change needed. Any diff here is a defect.
- `test:model-harness` acceptance and `test:evaluation-statistics`: break if analyze-pilot changes.
- `test:slug-conventions`, `test:nginx-redirect-parity`, `test:entity-href`: a new route may need a redirect parity entry or slug allow. Check that the new URL is trailing-slash consistent with nginx.
- `test:feed-freshness`, `test:iteration-log-coverage`, `test:iteration-log-silence`, `test:commit-message-tokens`, `test:content-loss`, `test:artifact-shrink`: process gates. A new iteration needs an ITERATION_LOG entry; the commit message must avoid CI-suppression tokens (DC-17); shrinking `ai-models/page.tsx` by condensing (PM "should wait" A11) may trigger artifact-shrink.
- `test:known-misdated-claims`, `test:claim-to-source`, `test:lint`: dated-content rules. Report dates must not be rewritten into prior dated artifacts (dated-content edits).
- `test:no-control-bytes`: heredoc or smart-quote and shell-quoted writes (DC-21, DC-23). Run after generation.
- Existing tests that already modified in the working tree (`test-no-stale-counts.mjs`, `model-index-facts.ts`, `PipelineStages.tsx`) overlap the work in progress. Re-run the full chain after merging; do not assume previous green.

## 5. Regression risks
- R1 (High): An implied ranking sneaks in via ordering, chart order, bar lengths, colour scale, or "Established" band words next to model names. Bands themselves (Established, Functional) are composite labels: the report must not show them as scores (PM: no composite, band). Verify A fields `band` are never rendered.
- R2 (High): Haiku-versus-rest read as capability ranking, when the length confound is unresolved (A.length). G3 plus manual read.
- R3 (High): Existing page copy "no model has been scored" (`noModelScored` conditions) goes stale or is contradicted by a new pilot section. Both statements must be consistent.
- R4 (Medium): `hasResults` flips and the page shows an empty results table or leaderboard component with the pilot data.
- R5 (Medium): DC-18, a detector measuring a proxy. "Contamination not indicated" over 3 recall items can read as a clearance. Wording and scope check.
- R6 (Medium): DC-22: template status text drifting from A. All status strings are generated, never typed.
- R7 (Medium): JSON-LD or OG text, which is easy to miss in review, carries a headline number or ranking phrase.
- R8 (Medium): Chart accessibility regressions in the shared components, such as `PipelineStages`.
- R9 (Low): Build determinism (DC-08): timestamps in generated JSON.
- R10 (Low): Sitemap and feed gain the report route without the "unofficial" marker in the feed title.

## Blocker criteria
Release blocks on any failure of G1 to G9 or G13, any AC-R1 to AC-R9 failure, or any ranking phrase found in any rendered surface. Follow-ups: manual items 4, 8, R8 to R10.
