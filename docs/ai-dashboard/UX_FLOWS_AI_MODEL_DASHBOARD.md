# UX Flows — AI Model Compassion Dashboard (`/ai-models/dashboard`)

**Author:** ux-designer. **Date:** 2026-10-14. **Status:** design for frontend-engineer, qa-engineer, product-manager. No code, no data change.
**Sources:** methodology review §3 and §5 (metric contract, 12 hard rules), research §B3, `UX_FLOWS_MODEL_BENCHMARK.md`, template §D and amendment 16, D-29a, `ai-models/page.tsx`, `figure-kit.tsx`, `PilotFigures.tsx`.
**Notation:** `{token}` is a build-time value from the public wave projection. No digit is typed in copy (hard rule 5). Banned words are never used as copy: best, worst, top, leads, beats, wins, rank, tied, ahead, behind, leaderboard, band names, "clean/cleared".
**Assumptions to confirm:** (A1) host is compassionbenchmark.org per the brief; CLAUDE.md says .com. (A2) A committed gates file (G-1 to G-10 with state) and `changelog-v1.json` are produced; the dashboard cannot invent them. (A3) The public projection exports `derived.*`, `comparisons[]`, `design.*`, `bank.*`, `judge_validity`, `bridge_drift`, `deviations[]`; `stability` and `bank_sha256` are not exported yet (hence "Not measured yet" and "Not recorded"). (A4) Existing report pages `/ai-models/reports/<runId>` stay; the dashboard links to them and never replaces the narrative.

## 0. Principles

1. One wave at a time. The wave is always visible in the control bar, every panel header and every download.
2. Reading order is fixed: status, scope, separation groups, then figures. Users filter; they never sort. Nothing in the UI orders by result.
3. Same label on every figure and table: **FigureLabel** = `Unofficial pilot · {runId} · {reportDate} · {accessTier} · not a score · comparability none`. It is drawn inside the SVG footer, in each table `<caption>`, in the cite text and in every download row. A screenshot of any one panel is self-describing.
4. Four cell states, visibly distinct, never 0, dash or blank: **value**, **Withheld** (by rule), **Not measured yet** (metric does not exist), **Not recorded for this wave** (old wave lacks the field).
5. Fail closed. If `derived.point_withheld_subjects` or `derived.separated_subjects` is missing, withhold all points and show no grouping claim ("Grouping not recorded for this wave").
6. Shapes plus text labels identify builds; colour never carries meaning. Arm B variants are hollow shapes (as `figure-kit`), shown only in the exploratory toggle.

## 1. Page anatomy

### 1.1 Order, top to bottom (same source order on desktop and mobile; DOM order = visual order)

| # | Block | Desktop | Mobile (≤480px) |
|---|---|---|---|
| 1 | **Status banner** (page-level, not dismissible) | full-width bar, 2 lines | 3 to 4 lines, no truncation |
| 2 | **Hero**: H1, what it is, what it isn't, 3 links (How to read, Download, Methodology) | left text, right "Not a score" Callout | stacked |
| 3 | **Program status strip** (generated counts) | 5 stat cells in a row | 2-column grid, wraps |
| 4 | **Control bar** | one row, wraps to two | collapsed behind a "View controls" disclosure (button, not modal); wave selector always outside it |
| 5 | **Live summary line** (`aria-live=polite`): "Showing {modelsShown} of {modelsInWave} builds, {dimsShown} of {dimsTotal} dimensions, wave {runId}." | under controls | same |
| 6 | **Panel grid** (§2 order) | figures full width; P5, P6, P7 sit in a 2-column grid | single column, tables replace SVGs |
| 7 | **How to read this** (always-expanded, 5 short items; also linked from hero) | after grid | same |
| 8 | **Release tracker** | table | cards as stacked rows |
| 9 | **Official gates** | table, state shown by icon plus word | same |
| 10 | **Glossary** (`<dl>`) | 2 columns | 1 column |
| 11 | **Duty-of-care note** (no CTA, no model name, no number beside it) | full width | same |
| 12 | **Footer block**: corrections, right of reply, changelog, independence, funding, licence | 3 columns | stacked |

Sticky: nothing is sticky. A sticky control bar would obscure focus at 400% zoom (WCAG 2.4.11).
Page-level `<h1>` once; panels are `<h2>`; panel sub-blocks `<h3>`. A "Skip to panels" link follows "Skip to content".

### 1.2 Status banner
States: **pilot only** (today): "Unofficial pilot results. Not scores. {officialModelCount, none} AI models have an official Compassion Benchmark score." **Founder preview** (build flag, `mode:"preview"`): add a second line "Founder preview. Not public." and `noindex`. **Superseded wave selected**: adds "This wave was superseded on {date}. See {changelogLink}." If an official wave ever exists, a second banner type appears and official data is never on the same chart (rule 4); out of scope while official rendering is disabled.

### 1.3 Hero
H1: "AI Model Compassion Dashboard". Lede: "Unofficial pilot tests of {buildCount} open-weight AI model builds, run against a published bank of {itemsTotal} task items."
**What this is** (3 bullets): ranges, not scores; pre-registered plan, hash shown; every number traceable to a data file.
**What it isn't** (4 bullets): not an official score; not a ranking or recommendation; not a test of the company; not evidence about the model as released (local four-bit builds). Links to `/ai-models/methodology` and `/ai-labs` ("scores a company's governance, a different thing").

### 1.4 Program status strip (all tokens; each cell has label, value, one-line meaning)
`{waveCount}` pilot waves published · `{buildCountInWave}` builds in this wave · `{itemsValidated}` of `{itemsTotal}` task items human-validated · `{gatesMet}` of `{gatesTotal}` official gates met · `{officialModelCount}` official model scores. If `{itemsValidated}` is zero the cell reads "None of {itemsTotal}". "Last wave" date and protocol status ("Weekly protocol: proposed" or "ratified") sit beneath as plain text. The strip is not a result and carries no model name.

### 1.5 Control bar (order = tab order)
1. **Wave** (single-select, native `<select>`; options newest first by date, labelled `{runId} · {reportDate}`; superseded waves suffixed "(superseded)"). Changing the wave resets M and D to "all" (ids are wave-scoped) and announces it.
2. **Models** (multi-select popover = checkbox group in a `<details>`; alphabetical; "Select all / Clear" buttons; clear means all, never an empty chart). Items show shape glyph plus name. Arm is not a model choice.
3. **Dimensions** (checkbox group, eight codes with full names, dimension order from `dimensions.ts`; at least one stays on).
4. **Panels** (checkbox menu "Show or hide panels"; lists the ten panels; the four Help blocks cannot be hidden).
5. **Chart / Table** (segmented control, two `<button aria-pressed>`; disabled with explanation at ≤480px where table is forced).
6. **Exploratory comparisons** (switch, default off; label "Show exploratory comparisons", helper "Not planned in advance. Read with care.").
7. **Reset view** (restores defaults except the wave).
8. **Share link** (copies URL, then "Link copied" in the live region; fallback selects a read-only input).
9. **Download** (menu: "Whole wave, CSV", "Whole wave, JSON", "Current view, CSV", "Current view, JSON", "Provenance, JSON").
10. **Cite** (opens an inline disclosure with plain text and BibTeX, each with a Copy button).
There is no sort control, no "rank by", no weighting control, no search by model (the multi-select is the only model filter).

## 2. Panels

All panels share a frame: `<section aria-labelledby>`, header with title and purpose question, FigureLabel strip, body (chart or table), caption (confound sentence), "Data table" `<details>` (open when v=table), "Source" line (wave file path, `{waveSha256}` short form with copy, `{sourceSha256}`), and a Hide button. Every panel body also has the four cell states from §0.4.

**Default panel set (p):** P1 to P4, P8, P10 on; P5, P6, P7, P9 collapsed to header-only ("Show") to cut first-load scroll, still in the DOM and in no-JS.

### P1 Separation groups
- **Question:** "Which builds could the test tell apart, and which could it not?"
- **Body:** (a) one block "Not separated" listing members alphabetically with their shapes, before everything else; (b) then separated builds, alphabetical, one line each: "{name} was separated from the other {primaryArmOthers}." plus the confound sentence verbatim from the wave. Statement uses the template phrase: "For each pair among {names}, the range of the difference includes zero. The pilot cannot say which is higher; that is not the same as equal."
- **Model filter:** members hidden by the filter are collapsed to "Showing {k} of {n} in this group. Hidden members are not different from these." Group membership never recomputed client-side.
- **Edge:** all separated → "Not separated" block replaced by "No group of builds that could not be told apart." No builds separated → only the group. One primary-arm build → "Only one build in the primary arm. No comparison is possible." Uncorrected-only pairs: a separate small note "Separated only without correction for multiple comparisons: {pair}, range {lo} to {hi}. Not a separation claim." (inside the exploratory switch).
- **Caption:** "Order is alphabetical. Order carries no meaning."

### P2 Composite ranges
- **Question:** "What range of composite values is consistent with the data for each build?"
- **Body:** interval figure (shape at interval centre only as a *marker for the range*, not a point value; no point tick drawn on the chart for any build); table columns: Build · Range (95%) "{lo} to {hi}" one decimal · Point estimate · Group · Items. **Point estimate** cell shows a value only if the build is in `separated_subjects` and not in `point_withheld_subjects`, with the confound sentence in the same row's caption; otherwise "Withheld" with tooltip.
- **Why no custom weights (visible line under the panel):** "The composite uses the weights fixed before the data were collected. You cannot change them here: re-weighting after seeing results lets anyone reach the conclusion they want, and the intervals are valid only for the fixed formula. Use the dimension panel to look at one dimension." Also not offered because the cap on the scale is an unresolved methods question (D-45 Q3).
- **Edge:** dimension filter does not change this panel; note: "The composite always uses all eight dimensions."

### P3 Dimension ranges
- **Question:** "On each dimension, what range is consistent with the data, and how many items support it?"
- **Body:** small multiples, one block per selected dimension (code, full name, item count `{n}` beside each). Same range-only figure; table below with Range and Point estimate columns (dimension means are withheld for not-separated builds; cell "Withheld").
- **Edge:** a dimension with few items gets a visible "Few items ({n})" tag with text, not colour; copy "This range rests on few task items and is wide for that reason."
- **Old waves:** dimension intervals missing → "Not recorded for this wave".

### P4 Differences between builds
- **Question:** "For two builds, does the range of the difference include zero?"
- **Default (toggle off):** pre-registered, corrected primary-arm pairs only, for the selected models and (if D chosen) selected dimensions (`dimension_pairwise`). Per pair: "{a} minus {b}: range {lo} to {hi} (corrected). {Includes zero | Excludes zero}." Alphabetical by first then second name; difference point never shown (withheld rule); pair involving a withheld subject shows range only.
- **Toggle on (exploratory):** adds uncorrected-only pairs, secondary-arm pairs, cross-arm and "arm B minus arm A" ranges. Section header "Exploratory. Not planned in advance. No claim of separation is made from these." Each row tagged with the word "Exploratory". Arm B marks are hollow shapes with text "secondary arm, one trial per item, ranges only".
- **Edge:** fewer than two selected models → "Choose two or more builds to see differences." (empty state, with a button "Select all builds"). Wave without arms: B-minus-A rows and the secondary-arm explanation are absent, and no empty placeholder is shown.

### P5 Reply length (confound)
- **Question:** "Do longer replies get different ratings, and how long are replies?"
- **Body:** median reply words per build (alphabetical), pooled within-item slope, and the **extreme bound** only for a separated build, with the words "This is a bound, not an adjusted score." Per-build length-instruction check where present.
- **Edge:** no length-controlled score exists: a fixed "Not measured yet" row "Length-controlled score". Old wave lacking `length` → "Not recorded for this wave".

### P6 Judges
- **Question:** "Did the judges agree, and were their quotes valid?"
- **Body:** exact agreement, replies differing by two or more, unfound-quote rate against threshold, bridge drift (mean absolute difference, signed mean per judge, and in composite units). Banner line: "All judges are from one model family. Agreement shows consistency, not correctness. There is no chance-corrected statistic yet."
- **Edge:** no `bridge_drift` (first wave) → "Not recorded for this wave". Excluded judges listed with reason.

### P7 Contamination and blinding
- **Question:** "Is there sign the models had seen the task items, and did replies name their own model?"
- **Body:** recall items flagged of probed; identification correct of asked with the p value under no-exposure; self-identifying replies count by build. Mandatory sentence: "Not flagged is not evidence of no exposure. All task items are public. No cross-model comparison on a public pool is fully valid." Never uses "clean" or "cleared"; use "no flag raised".
- **Edge:** no contamination data in a wave → "Not recorded for this wave" plus the same sentence. Recall probe drew no recollection → "The recall probe could not have flagged anything in this wave."

### P8 Not measured yet
- **Question:** "What does this dashboard not tell me?"
- **Body:** fixed list, each row "Not measured yet" plus why: crisis and safety-sensitive handling (crisis items never served), refusal and over-refusal, trial-to-trial consistency, length-controlled score, multi-turn behaviour, languages other than English, human-rater agreement, frontier or API models, official score. Rows move out only when `wave` carries the field (feature-detected), never by editing copy.
- This panel is on by default and also lists "exemplar replies: not shown, by policy".

### P9 Instrument series (the only cross-wave panel)
- **Question:** "Is the instrument itself stable from wave to wave?"
- **Body:** reference build range per wave, anchor drift per wave, operations counts per wave (voids, deviations), each point labelled with its wave and protocol version; a visible labelled break where `protocol_version` changes. Header strip: "This panel describes the instrument, not the models. It never compares models across waves."
- **Rules:** no model other than the reference build appears; no composite of any non-reference build; the anchor verdict is shown as "Instrument drift check: {verdict}" and never as "comparable".
- **Edge:** fewer than two waves → "One wave so far. A series needs two or more." Reference build absent in a wave → "Not recorded for this wave".

### P10 How this wave was tested
- **Question:** "Exactly which builds, settings and files produced these figures?"
- **Body:** table per build (alphabetical): developer, family, tag, `digest_sha256` (copyable), quantisation, access tier, arm, trials, system message (verbatim in a `<pre>`, with hash), judges (set, per reply count), bank version and `{bankSha256}` (or "Not recorded"), protocol version and sha, pre-registration sha with "committed before data: {yes|no}", dated deviations (tagged planned or after the fact), run id, wave file path and sha, link to report and changelog. Judge-family conflict line: "{judgeProvider} supplied the judges and is also the developer of {subject}; see disclosure." when applicable.
- **Edge:** missing field → "Not recorded for this wave". Digest mismatch cannot reach users (build fails, rule 6).

## 3. Edge states (global)

| Situation | Behaviour |
|---|---|
| 0 renderable waves | Route is not emitted. No nav link, no sitemap entry, `/ai-models` shows no dashboard link. A direct URL 404s (same gate as reports). |
| 1 wave | Wave selector renders as static text "{runId} · {reportDate} (only wave)". P9 shows its one-wave state. |
| Wave without arms (pilot-01/02) | Hide arm controls, arm B marks, B-minus-A rows; P10 omits arm columns. |
| Withheld point | Cell "Withheld"; tooltip: "A point is shown only for a build separated from all others after correction. This build was not, or was tested in a secondary arm. Its range is shown." |
| Missing derived fields | Fail closed (§0.5). |
| Filter leaves zero data | Never allowed: Clear on models means all; dimensions keep at least one. Differences with <2 models show the P4 empty state. |
| Data/hash mismatch | Build fails; nothing partial ships. |
| JS error after hydrate | `<noscript>`-equivalent server HTML remains; an `ErrorBoundary` per panel shows "This panel could not load. The data table below still works." |
| Loading | No spinners: data ships with the page. Between hydrate and interactive, controls are `disabled` for under a second and the server-rendered tables are visible. No skeleton screens. |
| Print | All panels open, tables shown, FigureLabel in each, controls hidden, current wave id in page footer. |

## 4. Flows

Format: Entry, Steps, Success, Failure, QA check.

### (a) First-time visitor understands status in 10 seconds
- **Entry:** link from `/ai-models` or search. **Steps:** sees banner (no scroll) → hero "What it isn't" → status strip. Nothing numeric about any model above the fold on mobile; first model figure starts after the control bar.
- **Success:** can answer three questions on a 10-second test: Is this an official score? (no) Can I say which model is more compassionate? (no) Where do I read how it was tested? (visible link). Comprehension prompt is off in v1; test by moderated session.
- **Failure:** visitor reads a figure as a score. Mitigations: "Not a score" Callout beside hero, FigureLabel on figure, no point on chart.
- **QA:** at 375px and 1280px the banner text and "What it isn't" are inside the first viewport; banner is not collapsible; no banned word in rendered HTML (extend banned-lexicon gate to this route).

### (b) Journalist builds 3 models × 2 dimensions and shares a link
1. Opens page; Wave shows newest. 2. Opens Models, ticks three builds (alphabetical list; selection announced "Showing 3 of {n}"). 3. Opens Dimensions, clears all but two. 4. Reads P1 (group note appears if the three straddle a group: "Showing {k} of {n} in this group"), P3 (two dimension blocks), P4 (three pairs, ranges). 5. Share link → "Link copied". Checks that pasted URL reproduces the view. 6. Cite → copies text with run id, date, access tier, wave sha.
- **Success:** recipient opens link and sees identical state plus the status banner and FigureLabels. Screenshot of P3 includes the label in-SVG.
- **Failure:** the link carries a stale or invalid state → fallback per §5 with a visible notice "Some parts of this link were not valid and were reset: {list}." Journalist selects fewer than two models for P4 → empty-state message.
- **Guard:** no feature produces "which of the three is more compassionate"; the P4 copy "includes zero" is a range statement. Share text is copy-only, the page offers no social-card text containing a model name.
- **QA:** open the generated URL in a fresh session: same panels, same checkboxes, same live-summary line.

### (c) Researcher downloads data and provenance
1. Download menu → "Whole wave, JSON" (default focus) → file `ai-model-dashboard_{runId}.json`. 2. "Provenance, JSON" → build digests, shas, protocol, deviations. 3. Compares file sha shown in P10 with downloaded file's sha. 4. Cite → BibTeX.
- **Files:** produced at build from the public projection, never from `analysis.json`; CSV tidy long format: `status, run_id, report_date, access_tier, comparability, build, arm, metric, dimension, lo, hi, point_estimate, point_state, group` where `point_state` ∈ {value, withheld, not_recorded}; every row repeats the label columns; JSON has a top-level `label` string and `license` (CC BY 4.0, per research B3 item 12; confirm with founder). "Current view" files are generated client-side from the same JSON and carry the view hash in a `view` field.
- **Success:** file opens in a spreadsheet with no point for any withheld build. **Failure:** download blocked → fallback plain link to the static file (works with no JS).
- **QA:** diff of "Whole wave" CSV against `waves/<runId>.json` projection shows no withheld point and no `band`, `rank` or composite of withheld builds.

### (d) AI builder checks how their model was tested
1. Looks for the model in the Models list (alphabetical). Model not present → page text in P10 and release tracker states: "This model has not been tested. Tracked releases are listed below. Testing is not available on request and cannot be bought." 2. Present: selects it, scrolls to P10 (panel jump link "How this wave was tested") for tag, digest, quantisation, system message, judges, trials, bank sha. 3. Notes the access tier "local four-bit build" and the line "This describes this build, not the model as released." 4. Reads right of reply in the footer.
- **Success:** builder can copy the digest and verbatim system message and reproduce; can find where to submit a reply or correction and what happens ("Posted verbatim within {replySlaBusinessDays} business days; the report is not edited because of it unless a factual error is confirmed"; SLA text shown only after two consecutive waves met it, otherwise "Reply time is not yet measured").
- **Prompts:** the dashboard shows the system message and run settings; it does not show task item prompts or replies (exemplar rule; shows "Task item text is in the public bank: {bankLink}").
- **QA:** P10 has every field in the methodology review §3 Provenance row; absent fields use the "Not recorded" state.

### (e) Keyboard-only and screen-reader user
1. Tab: skip links → banner (static, readable first) → hero links → wave select → Models disclosure → … → Reset → Share → Download → Cite → first panel. 2. Space/Enter toggles a disclosure; Esc closes the disclosure and returns focus to its button. 3. Each filter change updates the live summary line; panels re-render without moving focus. 4. Each chart has a `role="img"` with title and description (existing pattern); a "Data table" `<details>` is the equivalent. v=table opens all tables. 5. Table cells are reachable via arrow keys in a screen reader's table mode; the scrollable table wrapper is a focusable region with a label.
- **Success:** every fact in every chart is in a table cell; SR hears label, range, point state, group.
- **Failure paths:** focus lost after Reset (must land on Reset button), live region spam (see §6 rules).

### (f) No-JS user
- Server HTML contains the **newest wave only**, all ten panels open, in table form (SVG figures included, with `<details>` open by default), static links to whole-wave CSV/JSON and provenance, and links to each older wave's report page `/ai-models/reports/<runId>` (wave selection without JS = those links). The controls render as a single `<p>`: "Filters, sharing and chart/table toggle need JavaScript. This page shows the full wave without them."
- URL hash is ignored without JS. Share link falls back to the page URL. Download buttons are plain `<a download>`.
- **QA:** disable JS: banner, hero, status strip, all tables, glossary, gates, footer render; no empty control shells; no layout shift on hydrate beyond the controls region.

## 5. URL hash state schema

Hash only (static export; nothing is sent to a server; no analytics event carries `m`). Keys joined by `&`; list values joined by `,`.

| Key | Meaning | Values | Default (omitted) |
|---|---|---|---|
| `w` | wave | a `run_id` from the manifest | newest renderable wave |
| `m` | models | build ids valid in `w`, alphabetical | all |
| `d` | dimensions | `AWR,EMP,ACT,INT,ACC,EQU,BND,SYS` | all |
| `p` | visible panels | `sep,comp,dims,diff,len,judg,cont,nm,inst,how` | default set (§2) |
| `v` | view | `chart` or `table` | `chart` (`table` when ≤480px) |
| `x` | exploratory | `1` only | off |

Example: `#w=pilot-2026-10-03&m=gemma2-9b,llama3.2-3b,qwen3-4b&d=ACT,EMP&p=sep,dims,diff&v=table`.

**Writing:** `replaceState` on every filter change (back button is not trapped); `pushState` only on wave change. Lists are written alphabetically so URL order carries no meaning. Defaults are omitted. Maximum length 512 characters.
**Reading and validation (fail soft, once, on load and on `hashchange`):**
1. Parse; ignore unknown keys. Keys `sort`, `order`, `rank`, `wt`, `weights`, `by` are recognised only to be dropped, with notice "Sorting and custom weighting are not offered."
2. `w` not in manifest → newest wave + notice "That wave was not found. Showing the newest wave." A superseded wave is valid and shows its banner.
3. `m` entries not in `w` → dropped with notice naming them; none valid → all.
4. `d`, `p` unknown codes → dropped; empty result → default.
5. `v` not `chart`/`table` → default. `x` anything but `1` → off.
6. Duplicates removed; case folded to lower for `w`,`m`,`p`, upper for `d`.
7. Percent-decoding errors or oversize hash → whole hash ignored, notice "This link could not be read. Showing the default view."
8. Notices are one dismissible `role="status"` block above the live summary; the corrected hash is written back via `replaceState`.
9. Hash is not an element id: no element has `id` equal to a build id or panel code that would scroll to a model (no per-model anchors). Panel jump links use `#panel-<code>` ids and are separate from state; to avoid collision, state keys live after `#` only when they contain `=`; a bare `#panel-comp` is a jump link and leaves state unchanged.

## 6. Accessibility checklist (WCAG 2.2 AA)

- [ ] **Focus order** equals DOM and visual order (§1.5, §4e). No tabindex above 0. Panel Hide returns focus to the panel's "Show" control; Reset returns focus to Reset.
- [ ] **Focus Not Obscured (2.4.11):** nothing sticky; the notices block is in flow. Focus ring 3:1 against background, 2px minimum.
- [ ] **Live regions:** one `aria-live="polite"` summary line; updated once per user action (debounced 300 ms for checkbox runs), message names counts, not content. Notices use `role="status"`. No `assertive`. Copy-confirm announcements in the same region. Chart redraw is silent.
- [ ] **Shapes plus labels (1.4.1):** every build has a unique shape and visible text name beside every mark; hollow vs filled for arm; no colour-only meaning anywhere, including gate states (icon plus word) and "Few items" tags. Text contrast 4.5:1, non-text 3:1.
- [ ] **Table alternatives (1.1.1, 1.3.1):** every figure has a visible data table in `<details>`; `<caption>` carries FigureLabel; `<th scope>` for rows and columns; ranges in one cell "lo to hi", not a symbol; "Withheld" and "Not measured yet" are text.
- [ ] **Charts:** `role="img"` with `aria-labelledby` title and description (existing); decorative glyphs `aria-hidden`; in-SVG caveat footer at 14px or larger equivalent; at ≤480px the SVG is replaced by the table, not shrunk.
- [ ] **Target size (2.5.8):** controls ≥ 44×44 CSS px on touch widths (24×24 minimum anywhere); checkbox rows 44px tall.
- [ ] **Reflow (1.4.10):** no horizontal scroll at 320 CSS px except inside table wrappers, which are `role="region"`, labelled, focusable, with sticky first column not required.
- [ ] **Reduced motion:** no animations needed; disclosure open/close and chart changes are instant. Respect `prefers-reduced-motion` for any hover transitions.
- [ ] **Input (3.3, 2.5):** multi-select is checkboxes in `<fieldset><legend>`, operable by keyboard and voice (visible labels equal accessible names, 2.5.3). No drag. No timeouts. No auto-updating content.
- [ ] **Consistent help (3.2.6):** "How to read this" and "Glossary" links appear in the same place in hero and in the control bar.
- [ ] **Language and tooltips:** tooltips are click/focus-triggered "?" buttons with `aria-expanded` and dismiss on Esc (1.4.13); the same text exists in the Glossary; no information only in tooltips.
- [ ] **Zoom and text spacing:** layout holds at 200% text and 400% zoom.
- [ ] **Print and high contrast:** forced-colours mode keeps shapes visible (use `currentColor`).

## 7. Microcopy library

Tokens in braces. Do not paraphrase in components; add keys to one `dashboardCopy` module so the banned-word and bare-digit gates scan it.

| Key | Copy |
|---|---|
| `banner.pilot` | Unofficial pilot results. Not scores. No AI model has an official Compassion Benchmark score. |
| `banner.preview` | Founder preview. Not public. |
| `banner.superseded` | This wave was replaced on {date}. It stays here, unchanged. See what changed. |
| `figureLabel` | Unofficial pilot · {runId} · {reportDate} · {accessTier} · not a score · comparability none |
| `hero.lede` | Unofficial pilot tests of {buildCount} open-weight AI model builds against {itemsTotal} published task items. |
| `hero.isnt` | Not an official score. Not a ranking. Not a recommendation. Not a test of the company. Not a test of the model as released. |
| `callout.notScore` | Ranges show what the data are consistent with. They are not scores, and builds from different waves cannot be compared. |
| `state.withheld` | Withheld |
| `state.withheldTip` | A point is shown only for a build separated from all others after correction, and only in its table row. This build was not, or was tested in a secondary arm. Its range is shown. |
| `state.notMeasured` | Not measured yet |
| `state.notMeasuredTip` | This dashboard has no measurement of this. It is not zero and not good. |
| `state.notRecorded` | Not recorded for this wave |
| `col.range` | Range (95%) |
| `col.point` | Point estimate |
| `range.fmt` | {lo} to {hi} |
| `group.notSeparated` | Not separated |
| `group.notSeparatedBody` | For each pair among {names}, the range of the difference includes zero. The pilot cannot say which is higher; that is not the same as equal. |
| `group.separated` | {name} was separated from the other {n}. The cause is unresolved: {confound}. |
| `group.subset` | Showing {k} of {n} in this group. |
| `order.note` | Order is alphabetical. Order carries no meaning. |
| `diff.includesZero` | The range includes zero. |
| `diff.excludesZero` | The range excludes zero (after correction). |
| `diff.exploratory` | Exploratory. Not planned in advance. No claim of separation is made from this. |
| `diff.empty` | Choose two or more builds to see differences. |
| `weights.why` | The composite uses weights fixed before the data were collected. Changing them after seeing results would let anyone reach the conclusion they want, and the ranges are valid only for the fixed formula. Look at one dimension instead. |
| `composite.alwaysAll` | The composite always uses all eight dimensions. |
| `fewItems` | Few items ({n}). This range rests on few task items and is wide for that reason. |
| `judges.family` | All judges are from one model family. Agreement shows consistency, not correctness. |
| `contam.caveat` | No flag raised is not evidence of no exposure. All task items are public. |
| `contam.probeBlind` | The recall probe could not have flagged anything in this wave. |
| `length.bound` | This is a bound, not an adjusted score. Reply length is an unresolved confound. |
| `series.scope` | This panel describes the instrument, not the models. It never compares models across waves. |
| `series.one` | One wave so far. A series needs two or more. |
| `crossWave.refuse` | Builds from different waves are not shown together. Each wave stands alone. |
| `controls.wave` | Wave |
| `controls.models` | Models (alphabetical) |
| `controls.dims` | Dimensions |
| `controls.panels` | Show or hide panels |
| `controls.exploratory` | Show exploratory comparisons |
| `controls.reset` | Reset view |
| `controls.share` | Copy share link |
| `controls.download` | Download data |
| `controls.cite` | Cite this view |
| `live.summary` | Showing {k} of {n} builds, {j} of {t} dimensions, wave {runId}. |
| `live.reset` | View reset. Showing all builds and all dimensions. |
| `live.copied` | Link copied. |
| `live.waveChanged` | Wave changed to {runId}. Filters were reset. |
| `hash.invalid` | Some parts of this link were not valid and were reset: {list}. |
| `hash.sortRefused` | Sorting and custom weighting are not offered. |
| `noscript` | Filters, sharing and the chart/table toggle need JavaScript. This page shows the full wave without them. |
| `tracker.none` | Release detection has not run yet. No release is tracked. |
| `tracker.tier` | Tracked, not evaluated · Unofficial pilot card · Official |
| `tracker.latency` | Not measured yet. Time from release to pilot card is shown only after two waves have been measured. |
| `tracker.notRequest` | Testing cannot be requested or bought. Releases are chosen by a published rule. |
| `gates.intro` | Official scores need all ten gates met. {gatesMet} of {gatesTotal} are met. |
| `gates.state` | Met · In progress · Not met (icon plus word) |
| `howto.1` | Each bar is a range, not a score. |
| `howto.2` | If two ranges overlap enough that their difference includes zero, the test cannot tell the builds apart. |
| `howto.3` | Builds are listed alphabetically. Position means nothing. |
| `howto.4` | Only one wave is shown at a time. Waves cannot be compared with each other. |
| `howto.5` | These are local four-bit builds, tested on a public set of task items. |
| `duty` | If you or someone you know is in crisis, contact local emergency services or a crisis line. Do not use this page to choose a tool for crisis support. |
| `footer.corrections` | Corrections are dated and added; published figures are never changed silently. Report an error. |
| `footer.reply` | Anyone, including developers, may reply after publication. Replies are posted verbatim and dated. Nobody sees results before publication, and nobody can pay for inclusion, a score change or silence. |
| `download.label` | {fileKind}, {scope}, {runId} |
| `cite.text` | Compassion Benchmark. AI Model Compassion Dashboard, unofficial pilot {runId}, {reportDate}. Not a score. Accessed {accessDate}. {url} |

**Glossary terms (each defined once, plain language):** unofficial pilot; range (95%); separated; not separated; point estimate; withheld; exploratory; arm A and arm B; access tier; local four-bit build; build digest; bank; validated item; judge; judge agreement; anchor drift; reference build; contamination probe; confound; extreme bound; comparability none; protocol version; pre-registration; official gate.

## 8. QA acceptance (testable)

1. No rendered text, alt, title, `aria-label`, JSON-LD, download or OG contains a banned word; no JSON-LD of type Dataset, ItemList, Rating, Review or Product.
2. No point value renders outside a table cell under header "Point estimate"; none for any id in `derived.point_withheld_subjects`; none when the field is missing.
3. Every SVG, table and download row carries FigureLabel.
4. "Not separated" block precedes every per-model figure in P1; every list of builds is alphabetical in DOM; no control reorders by value.
5. No panel except P9 uses data from more than one wave; P9 shows the reference build only.
6. Hash validation table in §5: 12 malformed-link fixtures produce the specified fallback and notice.
7. `0 waves` build omits the route and nav link.
8. Bare digits in dashboard copy fail the build (extend the report-figure gate and `test:no-stale-counts`).
9. No-JS snapshot contains all panels and static download links.
10. Axe-core passes on default, table, exploratory and 320px states; manual screen-reader pass on flows (b) and (e).
