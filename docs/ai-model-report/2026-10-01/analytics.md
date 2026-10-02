# Analytics: does the AI model report work? (2026-10-01)

Scope: measurement design only. No tracking code is written here. Independence policy applies: no event, query log or dashboard may carry lab-identifying commercial signal, and no metric below may be optimised by changing a score or a finding.

## 1. Instrumentation that exists today

- **Umami, self-hosted**, loaded from `/u/script.js` in `site/src/app/layout.tsx` (line ~118). The layout comment forbids a second tracker (no Plausible/GA). Pageviews, referrers and custom events are therefore available site-wide, including on `/ai-models`.
- **`trackEvent()` and the `EVENTS` map** in `site/src/lib/analytics.ts`. Names are snake_case and permanent. Existing relevant events: `newsletter_subscribed` / `newsletter_subscribe_error` (`NewsletterSignup.tsx`), `share_click`, `embed_cited`, `briefing_citation_copied`, `briefing_read_depth` (`ReadingProgress.tsx`), `gumroad_click`, `purchase_confirmed`, `contact_sales_submitted`, `pricing_*_click`, `api_access_click`.
- **On `/ai-models` and `site/src/app/ai-models/`: none.** A grep for `trackEvent|analytics` returns no files. `EvaluationScorer.tsx` states it makes no network call and has no analytics (deliberate, line ~538). Run-it-yourself activity is therefore invisible except through pageviews and outbound-link clicks.
- **Documented specs:** `docs/METRICS_MONETIZATION.md`, `METRICS_ARCHIVE.md` and `METRICS_ENTITY_EVIDENCE.md` cover other surfaces. `OBSERVABILITY.md` has no Umami or traffic content.
- **Not instrumented anywhere:** answer-engine citation, off-site quoting, and inbound lab contact as a labelled category. `SalesInquiryForm` records contact-sales but has no "lab" or "AI lab" segment I could verify.
- **PRFAQ §8 (2026-09-14)** lists "CB-MODEL models evaluated: 0" and "validity studies: 0" as baselines. It lists no readership, comprehension, citation or conversion baseline for model results.

All "before" states below are therefore **no baseline** unless stated. Take a pre-publication snapshot of Umami for `/ai-models` (28 days) before shipping. That snapshot is the baseline; do not estimate one.

## 2. Metrics

Read each one as: before / expected after. "Expected" is a direction and threshold to test, not a forecast. With low traffic (METRICS_ARCHIVE: "traffic baseline is low"), counts will be small. Report raw counts alongside any rate.

| # | Metric | Before | Expected after | Measurement on a static site |
|---|---|---|---|---|
| 1 | **Report engagement** (reached the limits section / total report sessions) | no baseline | majority of sessions reaching the results table also reach the "what the results do not support" section | Reuse the `briefing_read_depth` pattern: a `report_section_view` event, once per section, via IntersectionObserver |
| 2 | **Comprehension check** (one-click "Which statement is supported?" after the limits section; right answer = "the top three cannot be distinguished") | no baseline | at least 70% correct (a threshold to confirm after the first 50 responses, not a forecast) | `report_comprehension_answer {correct: bool}`. No free text, no identifier. Report n |
| 3 | **Misreading rate** (see §3) | no baseline | a falling share of monitored quotes that state a rank or order among Fable/Opus/Sonnet | Manual monitored-query log, not Umami |
| 4 | **Citation rate** (copies of the cite block + inbound referrers to `/ai-models` from non-CB domains) | no baseline | rising, but read it alongside #3: more citations with a rising misreading rate is a failure | `report_cite_copy` (new) plus existing `embed_cited`; Umami referrer report |
| 5 | **Subscribe conversion** (`newsletter_subscribed` with `source=ai-models-report` / report sessions) | no baseline for this surface | any positive count; no target until a month of data exists | Existing event. Confirm `NewsletterSignup` passes a `source` property (METRICS_MONETIZATION refers to a source property; verify) |
| 6 | **Run-it-yourself intent** (clicks to the harness or scorer from the report / report sessions) | no baseline | rising | `report_run_it_click {target}`. Completions cannot be measured (no network call by design). Treat clicks as intent only |
| 7 | **Inbound lab contact** (contact-sales or email naming a model lab, referencing the report) | no baseline, likely 0 | any non-zero count is notable; count by hand | Add a "How did you hear about us / which report" option in `SalesInquiryForm`; the inbox is the source of truth. Do not infer from pageviews |
| 8 | **Correction latency** (days from a verified misreading or error report to a published correction) | no baseline | stated target of 7 days (proposed) | Manual log |

Metrics 1 to 3 judge whether the report communicates. Metrics 4 to 7 judge reach and conversion. Metric 8 is the guardrail.

## 3. Misreading detection

The main risk is that the report's honest result ("Haiku is separated; the top three are not") gets flattened into "Fable beats Opus beats Sonnet", or that the unofficial pilot is quoted as a "Model Index ranking". I could not find any existing mechanism that detects this.

**Monitored-query protocol (manual, weekly, 20 minutes, logged in a committed file):**
1. Fixed query set, kept stable so results are comparable week to week: for example "Compassion Benchmark AI model ranking", "which AI model is most compassionate benchmark", "compassionbenchmark Claude Fable score", "Compassion Benchmark Haiku", plus the same queries without the brand name. This also catches confusion with the similarly named CompassionBench (PRFAQ C6).
2. Run each in 3 to 4 answer engines and 1 web search. Record the date, engine and exact quoted text, and the cited URL.
3. Code each quote with a fixed rubric:
   - **Faithful**: carries the interval or "cannot be distinguished", and the unofficial status.
   - **Rank-asserted**: states an order among the top three.
   - **Status-inflated**: calls it official, a Model Index result, or a ranking.
   - **Misattributed**: attributes a score we did not publish, or one from CompassionBench.
4. Misreading rate = (rank-asserted + status-inflated + misattributed) / total coded quotes. Report n. Below about 20 quotes, report counts only.
5. Prerequisite: no baseline exists. Run the protocol once before publishing and keep that as week 0. A zero before publication means the pilot is not yet being quoted, which is also information.

Also check page-level leading signals: Umami referrers from answer-engine domains, and Umami search-term data is unavailable, so do not infer queries.

## 4. Events to add

All with no identifiers or free text. Names are proposals, to be confirmed against the `EVENTS` map before implementation.

- `report_section_view` {report_id, section}
- `report_comprehension_answer` {report_id, correct}
- `report_cite_copy` {report_id, format}
- `report_run_it_click` {report_id, target}
- Add a `source` property to `newsletter_subscribed` on report surfaces, if absent.
- A "report" option in the `SalesInquiryForm` referral field.

`report_id` makes the template reusable (e.g. `ai-models-2026-10-01`). Add the names to `EVENTS` in `site/src/lib/analytics.ts`; the repo's own rule is to keep names in one place.

## 5. What must be true before claiming success

1. A pre-publication Umami snapshot and a week-0 monitored-query log exist (otherwise every "improved" claim is unsupported).
2. At least 28 days since publication, and at least 50 comprehension responses; otherwise say "too early".
3. Event firing is verified against pageviews, in the same way METRICS_ENTITY_EVIDENCE verifies its events (a firing count far below pageviews means broken instrumentation, not a failed report).
4. Misreading rate is flat or falling, and no rank-asserted quote is traceable to our own copy. If one is, that is a report defect: correct it before reading any other metric.
5. Citation growth is not counted as success while misreading is rising.
6. Nothing is claimed about lab behaviour, or about demand for scoring, from fewer than a handful of contacts. The PRFAQ market review found zero evidenced demand, so the first inbound lab contact is a datum, not a trend.
7. No metric was used to alter a finding or its framing for a particular lab (independence policy).
