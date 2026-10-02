# AI Model Assessment Report Template (binding)

2026-10-01. Synthesis of `docs/ai-model-report/2026-10-01/*`. `A` = `research/model-runs/<run_id>/analysis.json`; field paths are A paths, mirrored in the wave file.

## A. Purpose and status

One standard so every wave report is status-first, traceable and unreadable as a leaderboard.

`export-wave.mjs` allow-lists A into committed `site/src/data/model-benchmark/waves/<run_id>.json` (plus `manifest.json`). Narrative: `.../reports/<run_id>.md`, route `/ai-models/reports/<run_id>`. Every figure is a token `{{path|format}}` resolved against the wave file only; a bare digit in prose fails the build (max five `lit` tokens, each with a source). Status comes from `official` and `comparability`, never A's prose `status`.

| | pilot | official |
|---|---|---|
| Flags | `official:false`, `comparability:none` | Disabled; exporter throws until amended |
| May show | Per-model 95% range with small point tick; dimension ranges and item counts; separation flags; paired-difference ranges; reply medians; judge, contamination, operations facts | Score-history records only |
| Never | Band label or colour, rank, sort by result, bare point headline, length-removed values for non-separated models, per-model routes | n/a |

Score keys are `subjects[].pilot_composite` and `pilot_composite_interval95`. Keys matching `band|rank|score|best|worst|leader|winner` are rejected.

## B. Fixed sections (order and H2s fixed; budgets total 3,120 words, allowed 2,700 to 3,300)

Count = rendered body incl. headings and captions; excludes chart tables, glossary, navigation. A missing field renders "Not measured in this wave".

1. **Status and verdict (150).** Fields: `run_id`, `design.subjects`, `pairwise[].separated`, `design.judge_family`, `design.access_tier`, `evaluatedModelCount`. Must say: unofficial, not a score, same-family circularity, no developer contacted or paying, larger group not separated. Forbidden: any per-model figure.
2. **May say / may not say (250).** Generated from `pairwise[].separated`; each non-separated set yields a "cannot order" line. No figures.
3. **Duty of care and content note (70).** `/ai-models` "On crisis use" text unchanged; within two screens at 390px; no CTA, model name or number adjacent.
4. **Why an unofficial pilot (150).** Tests the instrument, not the models.
5. **Design (300).** `design.*`, `method.interval`, bank `items_total`, `items_validated`. Must say: rubric unseen, no self-judging, two judges, public pool, bank authored with same-family help, interval covers item resampling only, snapshots unpinned.
6. **Separation (350).** G1, G2. Fields: `subjects[].pilot_composite_interval95`, `pilot_composite`, `pairwise[]`. The "Not separated" group sentence precedes every per-model figure. Say "cannot tell, not equal".
7. **Separated model and reply length (350).** G4. Fields: `median_reply_words`, `length.*`, `judges.*.by_subject`. Its figure shares a sentence or caption with: consistent across judges, cause unresolved, bound is not an estimate. Forbidden: "because", "driven by", "explains".
8. **Dimension ranges (250).** G3. Fields: `dimensions`, `dimension_intervals95`, `dimension_item_counts`, `dimension_pairwise[]`, `dimension_pairwise_note` (verbatim), derived counts. Say: items per dimension; Bonferroni flag is conservative. Only `bonferroni_separated:true` is a difference. "Lowest mean" claims are predicate-checked.
9. **Instrument health (300).** G5B. Fields: `judge_agreement`, `contamination`, `judges.*`, `routing`. Say: leniency is against the all-subject item mean including the separated model, so positives are partly artefact; one fixed judge pair per subject; contamination covers sampled items only; chance baseline "not measured" if absent. Forbidden: "clean", "cleared".
10. **Deviations and what went wrong (250).** Fields: `exclusion_record.disclosure`, `quote_grounding.*`, `operations.*`. Tag each deviation pre-registered or post-hoc. Quote figures only from `quote_grounding`; never `exclusion_record.measured_original_answer_stats`; no dropped-entry claim without a ledger field.
11. **Why these are not scores (250).** Disclosure stack by distortion risk: same family, no human raters, validated items (0 of `items_total`), public pool, agent tier. No comparison with lab-index scores or other waves.
12. **Publication bar and confound ledger (200).** Bar table (met, N of M); ledger open, in progress, closed.
13. **Next wave must change (100).** Each item tied to a ledger entry; no date.
14. **Cite, record, corrections (150).** Citation block, artifact paths, "No developer was contacted before publication. No developer paid, sponsored or reviewed this report.", append-only corrections, duty of care restated, glossary.

## C. Optional sections (inside the cap)

Leniency matrix (G5A); quoted replies (summarised, never crisis items); visible Q&A (required if FAQPage emitted). Prior-wave comparison never for pilots. Comprehension prompt off in v1.

## D. Copy rules

- **Banned** (text, titles, alt, JSON-LD, OG): best, worst, top, leads, beats, outperforms, wins, rank, #1, tied, ahead, behind, most/least compassionate (except the FAQ question refusing it), leaderboard, band names, contamination "clean/cleared". "Weaker/worse" only inside an approved qualifier span.
- **Allowed:** separated from, could not tell apart, range, includes zero, rated lower by the judges (separated model, with caveat), alphabetical order, extreme bound.
- **Non-separation:** "For each pair among A, B and C (alphabetical order), the range of the difference includes zero. The pilot cannot say which is higher; that is not the same as equal."
- **Separation:** "X was separated from the other three, and every judge rated X's replies below the item mean. The cause is unresolved: reply length is a confound."
- **Confound:** word counts first, then slopes, then the bound.
- **Numbers:** "lo to hi", one decimal, never ±. A point appears only in a table cell labelled "point estimate". One number per lead sentence. Model names carry "agent tier, snapshot unverified" in the same element. "Larger" glossed once as the developer's tier naming.
- **Citable sentence:** "[Date], Compassion Benchmark's unofficial pilot ([run_id]) [finding, separated terms] [qualifier]." Citable set: design; non-separation; separated model with range and caveat; empathy as instrument finding; contamination with scope; post-hoc judge exclusion (73 not found plus 29 normalisation-only of 498); status. The length bound is not citable. No "above/below".
- **Headline:** H1 "We tested the test: a first look at measuring compassion in AI models." Dek: separated one, could not separate three, all Claude, said first. `<title>` and JSON-LD headline: "Unofficial Pilot: Four Claude Models on the AI Model Compassion Benchmark (Oct 2026)" built from tokens. Social line: "The test told one model from three others, and could not tell the three apart."
- **Pre-empted headlines:** "Claude grades Claude" (circularity in dek); "Fable most compassionate" (separation first); "small models less compassionate" (caveat each mention); "AI scores N/100" (no bare points); "worst at empathy" (instrument finding).

## E. Visual standard

All charts: inline SVG, no new dependency. In-SVG footer: "UNOFFICIAL PILOT · not a ranking · Claude-family judges · compassionbenchmark.com/ai-models". Group order: size descending, then first label; alphabetical within; caption "Order carries no meaning." Shapes: fable circle, haiku square, opus triangle, sonnet diamond, plus text labels. No model colours or band zones. Predicate-generated annotations; false predicate fails the build. `role="img"`, `aria-labelledby` title and desc listing ranges, data table in `<details>` (open in print). Strokes at least 3:1 (never `--color-line`), text at least 14px, table replaces SVG at 480px and below, no animation, greyscale-safe.

- **G1:** whisker = `interval95`, small unlabelled tick = point, x 0 to 100, "Not separated" bracket per clique, caveat in-SVG on the separated row.
- **G2:** "Separated" and "Not separated" groups, shared axis; point only for separated pairs; matrix above 15 pairs.
- **G3:** 8 dimensions, 0 to 5 axis, range plus mean tick per model, item counts, multiple-comparison note in-SVG.
- **G4:** Panel A (log words against range; ghost bound for the separated model only, unlabelled; no fitted line) always with Panel B (within-model slopes). Non-causal title.
- **G5:** panel B (agreement) required; panel A (leniency) optional.

Page: skip links, `:focus-visible`, underlined links, one H1, non-sticky `role="region"` banner first in `<main>` and fixed on every printed page, light print theme.

## F. /ai-models changes now (ordered)

1. Gate: pilot content renders only when the wave's `publication.decision_status` is `active`. Ungated first: PR Part A items A1-A3, A6-A9, A12.
2. **Rule: "no model has an official score".** Never "scored" or "evaluated" without "official". `evaluatedModelCount` stays official-only; pilot count is separate, never summed.
3. `page.tsx` copy: title (l.35) "...No Official Model Scores Yet"; description (l.40), JSON-LD (l.49, 52), banner (l.154), hero (l.166), l.678 take the rule; banner adds the pilot clause; "Not accurate" (l.244) becomes "any official model score or ranking".
4. Hero: pilot sentence; primary "Read the pilot report" (derived reading time), secondary "Read the method"; AI Labs link moves to `#three-objects`.
5. Key facts: "Unofficial pilot reports: {count}. Not scores." under "Models with an official score".
6. `#runs`: verdict-only card directly after three objects, three bullets, no per-model figures.
7. The 2026-09-25 self-run becomes a run-log row, verdict first; "100 out of 100" (l.532) leaves the page (K1).
8. Can/cannot-say pilot lines unconditional; jump list "Pilot results (unofficial)".
9. FAQ: Q1 uses the rule; add "What did the pilot find?" and "Does it show smaller models are less compassionate?"; answers standalone, words only, no per-model figures.
10. Duty-of-care note moves after `#runs`; keep the key-facts one-liner. `llms.txt`: "no official scores; one unofficial pilot".

## G. SEO and structured data

Absolute self-canonical, indexable, sitemap from manifest (`never`). Meta and OG carry no per-model figure. JSON-LD: one `Report` (`creativeWorkStatus` unofficial; abstract from composite-free citable sentences), `BreadcrumbList`, `FAQPage` only if visible; `isBasedOn` is the wave file. Forbidden on `/ai-models/**`: `Review`, `Rating`, `AggregateRating`, `ClaimReview`, `Dataset`, `ItemList`, `Product`, `SoftwareApplication`, `ScholarlyArticle`, composites in `additionalProperty`, model `sameAs`. No links to or from AI Labs entity pages, homepage hero or rankings nav.

## H. CTA rules

No paid CTA, Gumroad, pricing, contact-sales, Score-Watch, supporter ask, share prefill, per-model CTA or urgency copy. None in the first screen, section 3 or before section 12. Order: artifacts text link (4); "Check this work, or answer it" (`/ai-models#run-it-yourself`; mailto corrections and proposals, open to anyone, never a fee); section 14; free next-wave signup last with `NewsletterSignup` overrides. One primary button per surface.

## I. Release gates and measurement

**Gates before publication**, each with a planted-probe control and fail-on-zero: QA G1 report-figures, G2 report-binding, G3 no-unseparated-ranking (lexicon per D), G4 no-implied-order (with shuffle), G5 status-banner, G6 no-rating-schema, G7 crisis-adjacency, G8 claims-vs-pairwise, G9 analysis-schema, G10 regeneration, G11 word-budget, G12 no-stale-counts, G13 wave2-dryrun, G14 product-separation. Added: G15 `test:model-waves`, G16 `export-wave --check`, G17 `test:model-wave-isolation`, G18 `build-model-reports` checks, G19 `test:model-html-leak`, G20 `test:model-report-seo`, G21 Docker smoke. Manual: 390px, print 5 to 7 pages (build fails above 8), screen reader, keyboard, five-second status test.

**Measurement, baselines first:** 28-day Umami snapshot of `/ai-models`; week-0 monitored-query log (faithful, rank-asserted, status-inflated, misattributed). Events with `report_id`: `report_open`, `report_section_view`, `report_cite_copy`, `report_artifacts_click`, `report_run_it_click`, `report_reply_click`, `newsletter_subscribed` (source `ai-model-report-end` or `ai-models-end`). No success claim before 28 days; a rising misreading rate cancels citation gains.

## J. D-29a (final text)

> **D-29a — [founder approval date] · Unofficial pilot reports. Amends D-29; D-29 otherwise stands.**
> 1. Pages: `/ai-models`, `/ai-models/methodology`, and one report at `/ai-models/reports/<run_id>` per run in `waves/manifest.json`. No reports index until two reports. No per-model routes or anchors.
> 2. Exception to "no model composite or band, anywhere, in any form": a report of a wave with `status:"pilot"` (`official:false`, `comparability:none`) may show per-model 95% ranges with a point tick, per-dimension ranges, separation statements and paired-difference ranges.
> 3. Still forbidden: band labels or colours on models, ranks, sorting by result, best/worst language, a bare point score in any headline, title, meta, JSON-LD, feed, OG image or FAQ, `Dataset`, `ItemList` or rating markup.
> 4. Every figure is labelled unofficial pilot with run id, date, access tier and "not a score, comparability none". Models are alphabetical; non-separated models are grouped as "Not separated" before any per-model figure; a separated model's figure carries each disclosed unresolved confound in the same sentence or caption.
> 5. Every figure derives from the committed, hash-checked wave file exported from the analysis artifact.
> 6. `evaluatedModelCount`, `scoreRecordCount`, `hasResults`, the registry and score history are unchanged; pilot counts are separate, never summed.
> 7. No developer or journalist is briefed before publication; none pays, sponsors or reviews. A corrections channel is open to all; corrections are dated, append-only.
> 8. Official publication still requires the amended publication bar; official wave rendering stays disabled.

## K. Open founder decisions

1. Approve D-29a and its date; may the 2026-09-25 "100 out of 100" return (default: removed).
2. Canonical publication bar (FDP #5); section 12 depends on it.
3. Paired-difference ranges (default: shown, point only for separated pairs; PM advised none).
4. Publish before a non-Claude judge (FDP #4)? Growth: yes, circularity first. PM and FDP #2: wait.
5. Confirm no pre-publication contact with Anthropic.
6. Will the Friday digest carry the next wave (else fallback signup copy)?
7. Correction-latency target (proposed 7 days); quote-monitoring owner.
8. Deploy first; production last built 2026-09-25.

## Conflicts resolved

| Conflict | Decision | Reason |
|---|---|---|
| Route (PM, UX, architect differ) | `/ai-models/reports/<run_id>` | Coordinator 1 |
| Architect: no composite in wave file | `pilot_*` keys allowed | Coordinator 7 |
| Section order: architect vs PM and knowledge | Order in B | Separation and may-say must come first |
| Dimension means (PM, architect no; dataviz means only) | Ranges with mean tick and correction note | Coordinator 3 |
| UX sticky banner vs a11y not sticky | Not sticky; print-fixed; in-SVG footers | Sticky obscures focus (SC 2.4.11) |
| G1 band zones and 40 line | Dropped | Bands would label models |
| G4 length bounds for all four | Separated model only | Others would impose an order |
| Quote figures: SEO "100" vs record 73/29 | `quote_grounding` only | Coordinator 5 |
| Growth headlines 2 and 3 | Rejected | 2 asserts size as cause; 3 says "winner" |
| SEO FAQ and meta with composite and bound | Body only | Index page and markup carry no per-model figure |
| Link to `/ai-evaluation-suite` | `/ai-models#run-it-yourself` | Suite page has "License the Platform" CTAs |
| Events `ai_report_*` vs `report_*`; comprehension prompt | `report_*`; prompt off in v1 | Reusable; traffic too low |
| Card position: knowledge vs UX | After three objects | Visitors ask what was found |
| UX `noindex` vs SEO index | Indexable | Citation is the channel |
| `isBasedOn` raw A | Wave file | Raw A holds bands and withheld bounds |
| Right of reply for labs only | Anyone | Coordinator 6 |

---

## Amendments — 2026-10-01 (after review round 1: compassion-steward, QA claim audit, SEO review)

These supersede the sections they name. Reasons are the review findings cited.

1. **Section order (B):** "Duty of care and content note" moves to **first**, directly under the title and dek, before
   "Status and verdict" — a person in distress must meet care text before any model name (compassion F1). It must
   state that crisis-content items were **not served** and that the report therefore says nothing about how any model
   responds to a person in crisis (QA blocker; source: wave `design`/bank serving rule). The content note names the
   topics of the unserved items without quoting them.
2. **No point estimates for a not-separated group (supersedes coordinator decision 2 "point as a small tick"):**
   members of any `derived.not_separated_groups` set show **ranges only** — in prose, tables and charts (no ticks).
   Reason: alphabetical order of the pilot group coincides with descending point order, so any point display reads
   as a ranking (SEO review #5). A separated subject may show its point, always with its confound in the same
   sentence or caption.
3. **Required sensitivity statement (new, in "Instrument health" or "Why these are not scores"):** from
   `sensitivity.*` — whether the separation pattern survives the post-hoc judge decision
   (`sensitivity.separation_pattern_unchanged`), and how far the levels move. Must say plainly that absolute
   figures depend on which judges are used and only the separation pattern is robust.
4. **Design facts:** say that each trial's items were answered in parts of about 28 per fresh conversation, not one
   conversation per item; and how many bank items were not served and why.
5. **Within-model length slopes:** report all of them or none; never single one out (QA blocker l.103).
6. **Interval and correction language:** say what the correction controls (false alarms across all comparisons, at
   the cost of missing some real differences); never "rarely invents".
7. **Developer contact line:** "No developer was contacted before publication" stays as a statement of fact; the
   founder confirms it at ratification (template K5).
8. **No point differences that reconstruct hidden points (added 2026-10-01, writer finding during revision):** if a
   separated subject's point is shown, do not also show point differences between it and members of a
   not-separated group — together they let a reader rebuild the group's hidden points and their order. Show the
   paired-difference *ranges* and the separated/not-separated flag instead. Coordinator-accepted; supersedes
   template K3's default.
