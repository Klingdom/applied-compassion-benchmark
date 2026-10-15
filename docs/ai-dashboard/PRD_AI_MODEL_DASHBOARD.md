# PRD: AI Model Compassion Dashboard (`/ai-models/dashboard`)

**Owner:** Product Manager agent. **Date:** 2026-10-14.
**Status:** Draft for founder review. Changes no data, protocol, decision or page. The page cannot ship until Proposed D-29b (Appendix A) is ratified.
**Founder request (2026-10-14):** a complete, configurable dashboard of the main compassion-benchmarking measures for AI models, open to everyone, so compassionbenchmark.org becomes the first place people go to understand compassion in institutions and AI models.
**Inputs:** RES = `RESEARCH_AI_BENCHMARK_BEST_PRACTICES_2026-10-14.md`; METH = `METHODOLOGY_RELEASE_ASSESSMENT_2026-10-14.md`; `PRD_MODEL_BENCHMARK.md`; `UX_FLOWS_MODEL_BENCHMARK.md`; `KNOWLEDGE_ARCHITECTURE_MODEL_BENCHMARK.md`; DECISIONS D-29, D-29a, D-23; `AI_MODEL_ASSESSMENT_TEMPLATE.md` (section D, amendment 16); `model-report-html-gates.mjs` (L1-L7, G19, G20).
**Domain note.** The request says .org; the repo, canonicals and G20 use compassionbenchmark.com. This PRD names routes only. See OD-1.

---

## 1. Problem

**Who and pain.** People who need to understand how AI models treat people in distress have only lab marketing, anecdotes, or narrow benchmarks (EQ-Bench, HumaneBench, K-Bench, Spiral-Bench: each narrow, advocacy-built or single-developer; RES A12-A13). The program has real output (three unofficial pilot waves, 8 dimensions, bootstrap intervals, pre-registration, judge and contamination diagnostics) but it is readable only as long narrative reports. Nobody can filter by dimension, inspect instrument health, or export data.
Leaderboard sites train users to expect a sortable single number. This program must refuse that expectation (D-29a: no ranks, bands, sort by result) and still be more useful. No official model score exists and none is allowed (METH 1.4: 0 of 10 gates met), so a leaderboard-looking page would misstate the facts.

**Job to be done.** "Show me what has been measured about AI models, how certain it is, what has not been measured, and what must be true before an official score, in a view I can configure, cite and share."

**Why now.** The weekly wave program (commit 2845c2f9) will add waves about weekly once `weekly-v1` is ratified. A wave-aware configurable surface scales with that; narrative reports do not.

**Design stance.** A configurable reading surface over the public projection of committed wave files. Not a leaderboard, scoring tool or recommender. Its differentiation is what leaderboards omit: intervals on every figure, "Not separated" groups, "Not measured yet" states, provenance, instrument health and the official-score gates, in one place.

## 2. Users and jobs

| Persona | Job | Needs from the dashboard |
|---|---|---|
| General public | Learn whether anyone has measured AI compassion and how far to trust it | Program status, "How to read this", glossary, a default view needing no choices |
| Journalists | A citable, dated, defensible statement on deadline | Copy citation, permalink, CSV/JSON, the "cannot tell apart" statement |
| Researchers | Interrogate and reuse method and data | Instrument health, judge reliability, contamination, provenance hashes, downloads |
| AI builders | See how a build behaved and what the instrument can resolve | Dimension profiles, exploratory pairwise, bank coverage, reply link |
| Policymakers / procurement | Independent evidence and its limits | Gates checklist, release tiers, "Not measured yet" states, duty-of-care note |
| AI labs | See how they are presented; reply | Same view as everyone; corrections and reply link. No lab view, no pre-briefing (D-29a item 7) |

**Buyer context.** None at launch. No paid surface or CTA (independence policy). Success is audience and citation, not revenue.

## 3. Goals and non-goals

**Goals.** G1: every published pilot measure for one wave, configurable, with its uncertainty and limits attached. G2: make the "not a leaderboard" design the most useful part. G3: be the citable reference (permalinks, downloads, citation text, hash-linked provenance). G4: hold future waves, tiers and official scores without redesign (empty states built now). G5: pass all existing model gates plus new dashboard gates (section 11).

**Non-goals (excluded).**
- NG1 No leaderboard, rank, "#1", best/worst, sort by result, band label or band colour (D-29a item 3).
- NG2 No custom weighting of a composite: a re-weighted composite cannot get a valid interval from published data. The UI explains this (FR-11).
- NG3 No cross-wave comparison of any model figure. Cross-wave views are only instrument series (anchor drift, reference stability, operations) and only within one protocol version (METH section 5 rules 2, 12).
- NG4 No official scores; official rendering stays disabled (METH G-6).
- NG5 No per-model routes or anchors (D-29a item 1); model choice is URL-hash state.
- NG6 No live testing, "score my model" input, or user-submitted data. NG7 No recommendation of which model to use, least of all in a crisis.
- NG8 No hand-typed figures; no reading of `research/model-runs/*/analysis.json` or raw run files. NG9 No accounts, cookies, third-party scripts or paid tier.
- NG10 Unmeasured metrics (crisis handling, refusal/over-refusal, multi-turn, consistency) are never shown as values (FR-12).

## 4. Success metrics

Sources: Umami (cookie-less, first-party), build manifest, CI. The route does not exist, so dashboard baselines are zero by construction; baselines use the nearest surfaces and must be captured in a 14-day pre-launch window (MM-0, owner: analytics). All AFTER targets are founder-approval proposals with no prior data behind them; M2, M3, M4 are hypotheses until 30 days of data exist (requirement incomplete until then).

| # | Metric | BEFORE | AFTER (day 60 unless stated) | Source | Type |
|---|---|---|---|---|---|
| M1 | Unique visitors to pilot data surfaces, 30 days | Unique visitors to `/ai-models/reports/<run_id>` pages, 30-day trailing (MM-0) | Dashboard visitors at least equal to that baseline; report pages fall by no more than 20 percent | Umami | Post-launch |
| M2 | Visits with at least one `dash_config` event | n/a (new) | At least 25 percent | Umami events | Leading |
| M3 | `dash_download` + `dash_citation_copy` + `dash_permalink_copy` per 100 visits | 0 (features do not exist) | At least 8 | Umami events | Post-launch |
| M4 | Share of visits opening "How to read this" or glossary, among visits reaching Composite or Matrix panel | n/a | Diagnostic, no target | Umami events | Leading |
| M5 | Reports of the dashboard being read as a ranking or score | 0 known | 0; any instance triggers copy review within 7 days | Corrections log | Post-launch |
| M6 | Referring domains linking to dashboard or permalinks | Referring domains to `/ai-models` (MM-0) | At least equal by day 90 | Umami referrers | Post-launch |
| M7 | Days from a wave's `report_date` to the wave showing on the dashboard | n/a | 0 (same deploy; build fails otherwise) | Build check | Launch |
| M8 | Integrity gate failures reaching production | n/a | 0 | CI | Launch |
| M9 | LCP, mobile profile, default view | Report page LCP (MM-0) | Within section 9 budget | Lighthouse CI | Launch |
| M10 | axe-core serious/critical violations | n/a | 0 | CI | Launch |

Revenue is deliberately not a metric.

## 5. Functional requirements

"Default view" = server-rendered view with no hash state. Each FR maps to a user outcome (Appendix B).

### Page, data, wave

**FR-01 Route and gating**
- AC1 `/ai-models/dashboard` is a static page.
- AC2 It renders only if at least one `waves/manifest.json` wave is renderable under D-29a (`status:"pilot"`, `official:false`, decision active, report narrative present). Otherwise the route is not built and the sitemap has no entry.
- AC3 A manifest entry with `official:true` is ignored; a test proves it.

**FR-02 Data adapter**
- AC1 A server-side adapter builds data only from `projectWavePublic` (export-model-wave-public logic), `MODEL_INDEX_FACTS` and release-watch facts.
- AC2 The dashboard source never imports `analysis.json`, `research/model-runs/**` or non-projected wave fields (test greps).
- AC3 Each wave file's sha256 is recomputed at build and compared with the committed value; mismatch fails the build.
- AC4 A withheld point (not-separated subject, secondary-arm subject, any difference involving them) is absent from the props sent to the client, not hidden by CSS or JS.

**FR-03 Wave selector**
- AC1 Lists renderable waves by run id and report date, newest date first. Default: latest.
- AC2 Switching replaces all panels; selected models or dimensions absent from the new wave are dropped with a visible notice.
- AC3 No panel, chart, table or sentence shows subjects of two waves. "Comparability: none" is shown on every wave.

### Configuration

**FR-04 Choose models**
- AC1 Alphabetical multi-select of the wave's subjects; default all.
- AC2 Deselecting removes the model from every panel and from "current view" downloads.
- AC3 "Not separated" groups are computed from the full wave. If a subset hides group members, the group still shows under "Not separated" with "group members hidden by your selection"; a lone remaining member is never presented as separated.
- AC4 Zero selected shows an empty state, not an error.

**FR-05 Choose dimensions**
- AC1 Checklist of the 8 dimensions; default all.
- AC2 Matrix and profiles show only chosen dimensions. The composite panel states "The composite always covers all eight dimensions."
- AC3 Names come from `dimensions.ts`.

**FR-06 Show/hide panels**
- AC1 Every panel in FR-08 to FR-23 has a toggle; default shows all.
- AC2 Program status, "How to read this", and the duty-of-care note cannot be hidden.
- AC3 Provenance cannot be hidden while any per-model figure panel is visible.

**FR-07 Chart or table per panel**
- AC1 Each chart panel has a Chart / Table toggle. The table is always in the DOM (visually hidden when chart is chosen), including in the no-JS view.
- AC2 Chart and table come from one data object (test: equal values).
- AC3 At 480px and below, table is default (template section E).

**FR-07a Exploratory pairwise**
- AC1 Off by default; toggle "Show exploratory pairwise comparisons (exploratory, not a finding)".
- AC2 Only pre-registered primary-arm pairs with the corrected interval. Pairs separated only without correction are stated in words per amendment 16, never as a point or ordering.
- AC3 "Exploratory, not a finding" appears in the same element as every revealed pair.
- AC4 No point difference for any pair involving a withheld subject (L4/L4b), whatever the toggle state.

### Panels

**FR-08 Program status**
- AC1 Generated counts: official models scored; pilot waves published; models tracked; bank items and items validated; last wave date.
- AC2 "Official models scored" is `evaluatedModelCount` (official-only), never summed with pilot counts.
- AC3 When it is zero, the first sentence is "No model has an official score."

**FR-09 Composite ranges**
- AC1 Per model a 95% range ("lo to hi", one decimal, never ±) on a shared 0 to 100 axis.
- AC2 A point tick only for a subject separated after correction (amendment 16), with the unresolved confound in the same caption; in tables only under a "Point estimate" header (L2).
- AC3 The "Not separated" group comes before any per-model figure, with "The pilot cannot say which is higher; that is not the same as equal."
- AC4 Alphabetical within groups; "Order carries no meaning"; no sort control.
- AC5 Every SVG carries the footer "UNOFFICIAL PILOT, not a ranking" with judge family (template E).

**FR-10 Dimension matrix**
- AC1 Models x dimensions grid showing the dimension 95% range and item count per cell. Means only where allowed (L6: a not-separated member's dimension mean never appears).
- AC2 `bonferroni_separated:true` cells are marked with text and a shape, not colour. `dimension_pairwise_note` is shown verbatim.
- AC3 No value-scaled cell shading.

**FR-11 No custom weighting (explained)**
- AC1 A visible note in the Composite panel says why there is no re-weighting: the resampling needed for a valid interval is not published.
- AC2 No weighting control and no sort control exist in the DOM (test).

**FR-12 "Not measured yet" states**
- AC1 Crisis handling, refusal/over-refusal, multi-turn and trial-to-trial consistency render "Not measured yet" with the reason (for example "Crisis items have never been served").
- AC2 Visually distinct from values by text and outline shape, and contain no digits.
- AC3 A state becomes a value only when the field exists in the public projection; no manual override (fixture test both ways).

**FR-13 Dimension profiles**
- AC1 Small multiples, one per selected model, 8 axes, range plus mean tick only where allowed; no filled radar area.
- AC2 Same 0 to 5 scale for all; alphabetical.
- AC3 Each carries the access-tier label ("agent tier, snapshot unverified" where applicable) in the same element as the model name.

**FR-14 Separation and pre-registered comparisons**
- AC1 "Separated" and "Not separated" statements generated from `derived.*`; pairs from `comparisons[]` with corrected interval.
- AC2 Template section D banned words are absent.
- AC3 Shows the number of pre-registered pairs and the correction used.

**FR-15 Reply length**
- AC1 Median reply words per model, pooled and within-model slopes: all within-model slopes or none (amendment 5).
- AC2 The length-removed bound only for a separated subject and only beside "not an estimate" / "extreme bound" (L3).
- AC3 Non-causal title; no "because", "driven by", "explains".

**FR-16 Judge reliability**
- AC1 Per subject exact agreement, mean absolute difference, replies differing by 2 or more; per judge unfound-quote rate against threshold; anchor drift where the wave has it.
- AC2 Fixed caption: agreement among same-family judges measures consistency, not validity; no human raters; no chance-corrected statistic (while true).
- AC3 Any leniency figure carries "partly artefact".

**FR-17 Contamination probes**
- AC1 Recall items flagged of probed; identification correct of asked with p under no exposure.
- AC2 Words "clean" and "cleared" absent; caption "covers sampled items only; not flagged is not evidence of absence".

**FR-18 Instrument health**
- AC1 Bank coverage (total, served, validated, not served), served per dimension, batches and voids, requote sensitivity, deviations tagged pre-registered or post-hoc.
- AC2 Bank sha256 shows "not exported" until the exporter adds it (D-1); never computed from a run file.
- AC3 Validated is a count out of total.

**FR-19 Provenance**
- AC1 Run id, date, access tier, build tags and digests, judge set and families, preregistration sha256 (as written and with deviations), wave sha256 (build-computed), `source_sha256`, protocol version.
- AC2 Links to the wave JSON and the report. Hashes are selectable text with a copy button.

**FR-20 Release tracker**
- AC1 Tiers Tracked (T0), Unofficial pilot (T1), Official (T2) with generated counts.
- AC2 Empty states, for example "None yet. A release appears only with a cited primary source." T2: "No model has an official score."
- AC3 No SLA figures until two consecutive waves meet them (METH 2.3); measured latency only if derivable from the changelog, else "Not measured yet".
- AC4 The word "provisional" appears nowhere.

**FR-21 Official-score gates checklist**
- AC1 G-1 to G-10 from METH 1.4, each met / not met with evidence value from generated facts where one exists.
- AC2 Summary "N of M met" computed from the list.
- AC3 State lives in a committed file with a "last verified" date; older than 30 days shows a "stale" flag.

**FR-22 How to read this and glossary**
- AC1 Always-visible short panel: range, "Not separated" (cannot tell, not equal), why no ranks, what "unofficial pilot" means.
- AC2 Glossary terms defined once (range, separated, Bonferroni, bank, judge, reply length, pilot, tracked, official) and linked from use.
- AC3 Panel copy at or below grade 9 by automated readability check (OD-6).

**FR-23 Right of reply and corrections**
- AC1 Link to the corrections channel and the report's dated, append-only corrections block.
- AC2 Shows "No developer was contacted before publication. No developer paid, sponsored or reviewed this report." from report data.
- AC3 Replies, if any, are verbatim and dated (depends on OD-5).

### Output and sharing

**FR-24 Download**
- AC1 CSV and JSON of the public projection for the chosen wave, scope "Full wave" or "Current view".
- AC2 Static build-time assets; a test diffs them against the projection and runs withheld-token checks.
- AC3 CSV header lines and a JSON `meta` carry run id, date, access tier, "unofficial pilot, not a score, comparability none", licence, citation.

**FR-25 Copy citation**
- AC1 Copies the citable-sentence form (template D: "[Date], Compassion Benchmark's unofficial pilot ([run_id]) [finding] [qualifier]."), the permalink, and a BibTeX option.
- AC2 Only sentences from the template's citable set, generated from wave data; the length bound is never cited.

**FR-26 Permalink and state**
- AC1 Wave, models, dimensions, panels and chart/table modes are in the URL hash and restored on open.
- AC2 Hash changes visibility only, never data. Malformed hash falls back silently to the default view.
- AC3 A "Customised view" banner with "Reset view" appears whenever state differs from default, so screenshots are attributable.
- AC4 Hash holds no personal data and is never sent to a server.

**FR-27 No-JavaScript default**
- AC1 The default view is fully rendered in static HTML and readable with JS disabled.
- AC2 Without JS, controls are absent or inert with one line "Enable JavaScript to configure this view".
- AC3 The client explorer receives data as props; no runtime data fetch.

**FR-28 Duty of care**
- AC1 The crisis-use note from `/ai-models` is within two screens at 390px on every view, with no CTA, model name or number adjacent, and cannot be hidden.
- AC2 No text recommends or implies which model to use.

## 6. Data requirements

| Need | Source | Rule |
|---|---|---|
| Wave figures | Public projection of `waves/<run_id>.json` (`projectWavePublic`) | Allow-listed fields; withheld values never reach the client |
| Wave list | `waves/manifest.json` | Pilot, non-official, active only |
| Program counts | `MODEL_INDEX_FACTS` | Generated; official count official-only |
| Release facts | `release-watch-facts.ts`, `releases-v1.json`, `registry-v1.json` | Tracked rows need citations; else empty state |
| Bank facts | `tasks-v1.json` via generated facts | Items, validated, per dimension |
| Gates | New committed `dashboard-gates-v1.json` (proposal) with dated state | Founder-owned; stale flag |
| Dimension names | `site/src/data/dimensions.ts` | Never retyped |
| Downloads | Generated at prebuild | Hash-checked |

Exporter dependencies owned elsewhere; the dashboard must launch without them: D-1 bank sha256 in the wave; D-2 `stability` block (consistency); D-3 refusal classifier and crisis items; D-4 `weekly-v1` ratified. Today three waves exist; the adapter and selector must handle 50 without per-wave hand edits.

## 7. Integrity requirements

| ID | Requirement | Maps to |
|---|---|---|
| IR-01 | Route allowed only after D-29b; official rendering disabled | D-29a item 8, D-29b |
| IR-02 | Every figure labelled "Unofficial pilot, not a score, comparability none" with run id, date, access tier, judge family, in the same visual element | D-29a item 4; METH rule 1 |
| IR-03 | Models alphabetical; "Not separated" before any per-model figure | D-29a item 4 |
| IR-04 | Point only for subjects separated after correction, confound in same caption; tables only under "Point estimate" | Amendment 16; L2 |
| IR-05 | Group members' composites and dimension means never appear in any form | L1, L6; amendments 2, 8, 9 |
| IR-06 | Length-removed bound only beside "not an estimate"/"extreme bound" | L3 |
| IR-07 | No point difference for not-separated pairs or pairs with a withheld subject, including exploratory toggle and downloads | L4, L4b |
| IR-08 | No band names or colours near a model name | L5; D-29a item 3 |
| IR-09 | No per-model figure outside dashboard and report: index, methodology, feeds, OG, JSON-LD, sitemap | L7; D-29a item 3 |
| IR-10 | No ranks, sort by result, best/worst, leaderboard language; template D lexicon | D-29a item 3 |
| IR-11 | One wave at a time; no cross-wave model comparison | METH rule 2 |
| IR-12 | Pilot and official data separate; counts never summed | D-29a item 6 |
| IR-13 | No hand-typed figures | METH rule 5; `test:no-stale-counts` |
| IR-14 | Every figure traceable to a hash-checked wave file; mismatch fails build | D-29a item 5 |
| IR-15 | "Not measured yet" is a state, not zero, blank or dash | METH rule 8 |
| IR-16 | Duty-of-care note on every view, no adjacent CTA/model/number | D-29; METH rule 9 |
| IR-17 | No briefing, payment, sponsorship or review by developers; corrections dated, append-only | D-29a item 7 |
| IR-18 | No link to an AI Labs entity page; lab and model scores never fused | D-23; G20-links |
| IR-19 | Protocol version visible; no pooling across protocol versions without a labelled break | METH rule 12 |
| IR-20 | Independence: no paid inclusion, priority, suppression, certification; no paid CTA | CLAUDE.md |

## 8. Accessibility (WCAG 2.2 AA)

- A1 No colour-only encoding. Separated vs not, measured vs not measured, selection and model identity all use shape or text too. Model identity uses the template shape set (circle, square, triangle, diamond; further distinct shapes beyond four) plus text labels. No model colours.
- A2 Charts are inline SVG with `role="img"` and `aria-labelledby` title/desc listing ranges; the data table is the accessible equivalent (FR-07).
- A3 Keyboard operable, visible `:focus-visible`, no traps, targets at least 24 by 24 CSS px (2.5.8), no drag-only interaction.
- A4 Strokes at least 3:1, text at least 4.5:1 and 14px; usable at 200 percent zoom and 320px reflow (tables in a labelled scroll region).
- A5 Real `th` with `scope` and captions. A6 A live region announces config changes ("3 of 4 models shown"); focus is not moved. A7 No animation; greyscale-safe; light print theme with the label banner on every printed page. A8 Skip links, one H1, landmarks. A9 axe-core in CI plus a recorded manual keyboard and screen-reader pass.

## 9. Performance budget (proposals; engineering to confirm)

Default view HTML at most 150 KB gzip. Explorer JS at most 60 KB gzip, no charting library, no new runtime dependency. LCP (mobile) at most 2.5 s, CLS at most 0.05, INP on a config action at most 200 ms. Props for 12 models x 8 dimensions x 1 wave at most 120 KB uncompressed. Added build time at most 20 s. No third-party requests. Props are split per wave so weight does not grow with wave count (OD-7).

## 10. SEO and AEO

- Title starts "Unofficial Pilot:", names no model, no number beyond month and year, built from tokens (G20-title). Meta description names no model, no bare figure. One absolute canonical, indexable, OG complete, OG image has no figure.
- JSON-LD only `WebPage` or `CollectionPage`, `BreadcrumbList`, `Organization`, optional `FAQPage` with visible questions. Forbidden: `Dataset`, `ItemList`, `Rating`, `AggregateRating`, `Review`, `Product`, `sameAs` on non-Organization nodes.
- Sitemap entry with `lastmod` = latest wave `report_date`; `changefreq` rule is OD-8 (G20 demands "never" only for report pages).
- AEO: a static "What this dashboard shows" summary and a visible FAQ (what is it; is it a ranking; which model is most compassionate: refused, with reason; how to cite). No per-model figures in answers. `llms.txt` says "no official scores".
- No per-model anchors or headings used as links; no model names in `h1`. Hash views are not separately indexable.

## 11. Quality gates and tests

Must pass all existing model gates (G1-G21, G19 L1-L7, G20, `test:no-stale-counts`, product-separation guard) extended to the route, plus:
- T1 Props and downloads contain no withheld token. T2 HTML gates on the default view and five fixed hash-state views (headless browser). T3 Template D lexicon on all copy. T4 Chart equals table per panel. T5 No-JS render equals default view. T6 Group integrity under every subset of a four-model fixture.
- T7 "Not measured yet" fixture test (field absent / present). T8 No weighting or sort control in the DOM. T9 No DOM contains subjects of two run ids. T10 Official wave ignored; zero renderable waves means no route. T11 axe, keyboard-path, contrast. T12 Performance budget in CI.

## 12. Analytics events (Umami, cookie-less; no model names or hash contents in event data)

Events: `dash_view` (`run_id`, `has_hash`); `dash_config` (`kind`: wave, models, dimensions, panel, mode, pairwise; model count only); `dash_wave_switch` (`run_id`); `dash_panel_toggle` (`panel`, `state`); `dash_mode_toggle` (`panel`, `mode`); `dash_pairwise_toggle` (`state`); `dash_download` (`format`, `scope`); `dash_citation_copy` (`format`); `dash_permalink_copy`; `dash_howto_open` (`target`); `dash_gates_view`. Reuse `site/src/lib/analytics.ts`. The page states what is counted.

## 13. Release plan

| Phase | Content | Exit criteria |
|---|---|---|
| 0 | Founder ratifies D-29b and decides OD-1 to OD-8; MM-0 baselines captured | D-29b ratified; baselines recorded |
| 1 MVP | FR-01 to FR-12, FR-14, FR-19, FR-22, FR-24 to FR-28: latest-wave default view, wave/model/dimension choice, chart/table, downloads, citation, permalink | All gates and T1-T12 green; compassion-steward and QA claim audit; founder approves deploy (the agent never publishes) |
| 2 | FR-13, FR-15 to FR-18, FR-20, FR-21, FR-23, FR-07a | Same gates; M2 data reviewed |
| 3 | Instrument series across waves after at least two waves under one protocol version; "Not measured yet" flips as exporters land | Extended T9 green |
| 4 | Official rendering after G-1 to G-10 and the D-29 official amendment | Separate PRD |

MVP rationale: one workflow serves every persona (see a wave, configure, cite, export); later phases add depth, not workflows. Phases 1 and 2 may merge at the cost of a larger review surface. Rollback: remove the route by manifest or flag; no data migration.

## 14. Risks

| ID | Risk | L / I | Mitigation |
|---|---|---|---|
| R1 | A configured subset screenshot reads as a ranking | High / High | Customised-view banner, group integrity under subsets, non-hideable labels, label inside every SVG |
| R2 | Client filtering leaks a withheld point | Medium / Critical | Withheld values never in props (FR-02 AC4, T1) |
| R3 | Pilot read as "provisional score" | Medium / High | Label rules, word banned, FR-20 |
| R4 | Founder's "number one place" goal clashes with D-29a leaderboard bans | High / Medium | Non-goals explicit; OD-9; differentiate by rigor |
| R5 | Few waves, local quantised builds and one judge family make the page feel thin or weak | High / Medium | Empty and "Not measured yet" states are content; no padding; limits always shown |
| R6 | Gates file stale, misstates readiness | Medium / High | Last-verified stamp, stale flag |
| R7 | Dashboard invites optimising for the score (RES A10); 14 panels overload readers; labs pressure edits | Medium / Medium | No exemplar item text; phased release; independence policy and append-only corrections |
| R8 | Needed exporters not built; .org vs .com breaks canonical/G20 | High / Medium | Panels degrade to "not exported"/"Not measured yet"; OD-1 |
| R9 | Single-family judges and no human raters undercut "best place to understand compassion" | High / High | Always shown (FR-16, IR-02); P0 gaps (METH 4) are program risks the UI cannot fix |

## 15. Open founder decisions

- OD-1 Canonical domain: .org or .com (all code assumes .com).
- OD-2 Ratify Proposed D-29b (Appendix A). OD-3 Ratify `weekly-v1` (or first fix the anchor metric, METH D-1) so waves arrive on schedule.
- OD-4 Download licence (CC BY 4.0 proposed). OD-5 Right-of-reply design (METH 2.4); decides whether FR-23 AC3 ships. OD-6 Reading-level target (grade 9 proposed).
- OD-7 Wave switching as in-page hash state (proposed) or per-wave URL. OD-8 Sitemap `changefreq`/`lastmod` rule for a page that changes per wave.
- OD-9 Accept that the dashboard never offers a leaderboard or custom weights, unlike most competitors.
- OD-10 Owner of `dashboard-gates-v1.json` upkeep and the 30-day freshness check. OD-11 Whether public non-sensitive exemplar items may ever appear (excluded here).

## Appendix A. Proposed D-29b (draft; not ratified)

> **D-29b: 2026-10-14 · Proposed · AI Model Compassion Dashboard (extends D-29a item 1; D-29a otherwise stands).**
> 1. **Page.** One additional page is allowed: `/ai-models/dashboard`, extending the D-29a item 1 page list. No per-model routes or anchors; view state lives in the URL hash only.
> 2. **Same content rules as report pages.** D-29a items 2 to 5 apply as on a report: 95% ranges, with a point tick or point-estimate cell only for subjects separated after correction (template amendment 16, gate L2) and each with its unresolved confound in the same sentence or caption; models alphabetical; non-separated models grouped as "Not separated" before any per-model figure; every figure labelled unofficial pilot with run id, date, access tier and "not a score, comparability none".
> 3. **Still forbidden.** Band labels or colours on models, ranks, sorting by result, best/worst or "leaderboard" language, custom weighting of any composite, a bare point score in any headline, title, meta, JSON-LD, feed, OG image or FAQ, and `Dataset`, `ItemList` or rating markup.
> 4. **No cross-wave comparison.** One wave at a time; subjects of different waves never share an axis, order or sentence. Cross-wave views are limited to labelled instrument series (anchor drift, reference-build stability, operations counts).
> 5. **Mandatory pilot label per figure,** in the same visual element, in charts, tables and downloads.
> 6. **Render condition.** The page renders only when at least one wave in `waves/manifest.json` is renderable under D-29a; with none, the route is not built.
> 7. **Metrics not measured** are shown as "Not measured yet", never as zero, blank or dash.
> 8. **Data.** Only the public projection of committed, hash-checked wave files, generated model-index facts and release-watch facts. Downloads contain only the projection.
> 9. **Counts.** `evaluatedModelCount`, `scoreRecordCount`, `hasResults`, the registry and score history are unchanged; pilot counts are separate and never summed.
> 10. **Official rendering stays disabled.** Official scores on the dashboard need the amended publication bar and a separate decision.
> 11. **Independence.** No developer is briefed before publication; none pays, sponsors or reviews; no paid CTA on the page.

Template follow-ups for the template owner (not done here): add the page to the section F list; add dashboard copy rules (configuration banner, "Not measured yet" lexicon); extend G19/G20 and `test:no-stale-counts` to the route; define the title exception only if the title form differs.

Outcome mapping: program state FR-08/20/21; ranges without ordering FR-09/10/13/14; trace and trust FR-02/16-19; unmeasured FR-12/21; configure FR-03-07a/26; cite and reuse FR-24-26; plain reading FR-22/27; protection from misreading FR-11/28, IR-01-20.
