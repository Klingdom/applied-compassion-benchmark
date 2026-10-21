# UX Flows: AI Model Watch (MVP)

**Author:** ux-designer. **Date:** 2026-10-16. **Upstream:** `docs/PRD_AI_MODEL_WATCH.md`, `docs/UX_FLOWS_MODEL_BENCHMARK.md`. Changes no data, route or decision. Handoff to frontend-engineer and qa-engineer.

## 0. Global rules (apply to every screen)

- **Primitives only:** `Container`, `Eyebrow`, `SectionHead`, `Panel`, `Card` (default / featured, with `href`), `Callout`, `Stat`, `Pill`, `Button` (default / primary), `NewsletterSignup` (card variant with copy overrides), `BreadcrumbJsonLd`. Dark theme only; tokens from `globals.css`. No new colours. Kind and status badges are `Pill` (one style; meaning is carried by the text, never by colour alone).
- **Every `/ai-models/**` page:** breadcrumb (JSON-LD plus visible), one `h1`, an independence line ("No provider pays for inclusion, coverage, status or wording") in a closing `Callout`, and a corrections link. Provider-facing and press readers both land mid-page from search, so each page states what it is and is not in its first paragraph.
- **Counts and dates** come from build-time facts modules (catalog count, edition count, release count, as-of date). Nothing typed. If a fact is missing, the block hides itself; it never prints 0 or "N/A".
- **Never print "models tracked" without the clause** "tracked means listed with a source; it does not mean evaluated" within the same block. `evaluatedModelCount` and `catalogModelCount` are never adjacent in one figure row.
- **Banned on `/ai-models/**`:** best, worst, top, leads, beats, wins, #1, ahead, behind, "most/least compassionate" near a model name. "Leaderboard" and "rank" appear only in negating sentences or in the label for the AI Labs link. No band names in prose. No per-model figures.
- **Crisis line** (one sentence, from the existing hub) on hub and edition pages: not guidance on which AI to use in a crisis.
- **Analytics:** signup `source` values: `model-watch-hub`, `model-watch-tracker`, `model-watch-edition`, `model-watch-leaderboards`, `insights-<slug>`.

## 1. /ai-models hub refresh

**Goal:** a first-time visitor in 10 seconds knows (a) there is a current model list and weekly digest, (b) no model has an official score.

**Layout order**
1. Existing answer-first banner line (kept, still conditional on no official score).
2. Hero: `Eyebrow` "AI Model Watch"; `h1` existing question; one-paragraph lead (existing, trimmed to 3 sentences). Primary `Button` "Read this week's edition" (links the latest edition; hidden if no editions). Secondary "Browse the model list" to the tracker.
3. **"This week in AI models" block** (`Panel`, id `this-week`), above the fold at 1280x720 and first after the hero on mobile: edition date and window; derived sentence "{N} new releases logged in this edition from {P} providers" (N, P from the edition JSON); first three release lines (provider, model, kind `Pill`); link "Read the full edition". Footer line: "Catalog as of {asOf}: {catalogModelCount} models listed with sources. Listed is not evaluated." Zero-state (no edition): `Callout` "The first edition has not been published. Nothing is implied about the industry." No block heading numbers.
4. Key facts (existing `dl`), unchanged, but placed after the entry cards so the new content leads.
5. **Entry cards** (grid, `auto-fit minmax(250px,1fr)`, `Card href`; each: title, one-line description, no counts except derived ones): Tracker (model list with sources), Weekly Watch (dated editions), Leaderboards ("what exists, what does not": label avoids the word as a claim), Methodology, Pilot reports (only if the pilot gate renders any; otherwise the card is omitted, not greyed), Insights (cross-links to `/insights`). Whole card is the link; focus ring on the card.
6. Jump list, then the existing sections (three objects, pipeline, release watch, limits, runs, records, run it yourself, FAQ). Release watch section gains a pointer to the tracker and to the latest edition; its "no scan has ever run" callout is replaced by scan state from the edition once one exists.
7. Signup: `NewsletterSignup` card, source `model-watch-hub`, heading "Email me when a new edition publishes", button "Email me new editions", fine print "Free. No promise of weekly timing. We never share your email." Success: "Subscribed. We will email you when an edition publishes." Remove the existing "Friday highlights" success wording here (untrue for this list until FD-5 is confirmed).

**Mobile:** single column; entry cards stack in the order above; "This week" block stays first. Jump list wraps; no horizontal scroll except tables already in overflow wrappers.
**A11y:** `nav aria-label="On this page"` kept; each section `aria-labelledby`.

## 2. /ai-models/tracker

**Goal:** find a model, see who made it and how to get it, jump to the provider's own source.

**Layout order:** breadcrumb; `h1` "AI model tracker"; lead (2 sentences: neutral list, every row cites a source; listed is not evaluated, and not listed does not mean cleared); `Stat` row: models listed (`catalogModelCount`), providers, as-of date (three only); filter bar; result count line; table; "Tested by us" explainer `Panel`; independence `Callout`; signup (`model-watch-tracker`).

**Filter bar** (a `form role="search"`, `aria-label="Filter models"`): five `select`s with visible labels, each with first option "All": Provider, Access (open weights / API only / both, from data), Licence, Status (values from data, factual lifecycle words), Tested by us (pilot / queued / not yet). A text "Find a name" field is optional; if built it filters name only. Filters combine with AND. "Reset filters" button appears whenever any filter is set. Selection state lives in the URL query (`?provider=...`) so a filtered view can be shared and back-button works; the static page ignores the query without JS.

**Result count:** `aria-live="polite"` line: "Showing 12 of 87 models" (both numbers derived at runtime from the embedded JSON). On zero results: `Callout` "No models match these filters. Not listed does not mean not tested or not released. Reset filters to see the full list." plus a Reset button focused after the change.

**Table columns (fixed order):** Provider, Model, Released, Status, Access, Licence, Tested by us, Source. Default sort is provider then name, alphabetical. Column headers are NOT sort controls; no sort affordance anywhere. No row link, no anchor, no per-model route. Source cell: one or more links, text is the publisher's host ("anthropic.com model card"), `target="_blank" rel="noopener"`, with visually hidden "opens in a new tab". Release date is ISO or long form, consistent.

**Tested by us** is a neutral `Pill`: "Pilot" (links the unofficial report, no figure; shown only when the pilot gate renders), "Queued", or "Not yet". Never green/red. Explainer `Panel` (always visible under the table, not hidden in a tooltip): what each value means by the derivation rule; "Pilot is an unofficial test of the test, not a score"; "Not yet" is a status of our work, not a finding about the model.

**Mobile (<720px):** table is replaced by stacked cards, one per model, same field order as labelled definition rows (`dl`), source links last, tested-by-us `Pill` top-right of the card. Filter bar collapses into a `details` "Filters (n active)" opened by default only if a filter is active. Both renderings come from the same data; the hidden one uses `hidden` at the breakpoint (not `display:none` duplicated content for screen readers: use CSS so only one is exposed).

**No-JS fallback:** server-rendered full table with all rows, filters rendered inside `<noscript>`-safe `form method="get"` is NOT used (static export); instead, without JS the filter bar is absent and a line reads "Filters need JavaScript. The full list is below." The mobile card layout is CSS-only, so it still works.

**Loading:** none (data embedded). **Error:** if embedded JSON fails validation, build fails; no runtime error state.

**Edge cases:** very long model names wrap, never truncate; a model with 3+ sources shows the first two and "+N more" as an expandable `details`; a row with no `releaseDate` shows "Not stated" (not blank); a deprecated status is displayed as text, never struck-through styling alone.

## 3. /ai-models/watch and /ai-models/watch/[date]

### 3a. Listing
`h1` "AI Model Watch"; lead: dated editions of what shipped and what providers disclosed, with sources; not a ranking and not an evaluation. Signup (`model-watch-hub` variant tag `model-watch-edition` is reserved for edition pages; listing uses `model-watch-hub-list`). List of editions newest first as `Card href`: date, window, derived "{N} releases", one-sentence summary written by the author (no evaluative words). Zero-state: `Callout` "No edition has been published yet." plus signup and link to the tracker. Latest edition is labelled `Pill` "Latest". If more than 12 editions, group by year with `h2`; no pagination at MVP.

### 3b. Edition page (fixed six-part order, one `h2` each with anchor ids `window`, `releases`, `disclosures`, `measured`, `queue`, `corrections`)
Top: breadcrumb, `h1` "AI Model Watch, {long date}", window and as-of line, on-this-page list, prev/next nav (top and bottom).

1. **Window and coverage** (`Callout`): "Window {start} to {end}. Scanned: {providers list}. Not scanned: {list}. A source that was not scanned is not 'nothing found'." If a week was missed, the gap is stated here.
2. **New releases:** table on desktop (Date, Provider, Model, Kind, Summary, Sources), cards on mobile. Kind is a `Pill` from a closed vocabulary (new model, new version, open-weights release, deprecation, other); same text, same style for all kinds. Order: date descending, then provider alphabetical. Every row has at least one source link. Zero releases: "No releases logged in this window" plus coverage reminder.
3. **Safety and welfare disclosures:** header sentence "What providers said about their own releases. We quote; we do not assess." Each entry: provider and model, a `blockquote` with the quote, "Source: link, retrieved {date}". No paraphrase in the quote, no judgement words in the lead-in. Zero entries: "No relevant disclosures were logged. This does not mean none were made."
4. **What we measured this week:** honest status from the manifest: either "No assessment was published this week" or a link to the pilot report with "unofficial; not a score". No figures.
5. **Queue status:** derived counts (queued, measured, skipped) as three `Stat`s with the line "No timelines are promised."
6. **Corrections, sources, independence, signup:** append-only corrections list (dated; empty state "No corrections yet"); consolidated sources list; independence `Callout`; `NewsletterSignup` source `model-watch-edition`.

**Prev/next:** labelled by date ("Previous edition: 2026-10-09"); first edition shows only Next when it exists, and neither otherwise; both are `a` in `nav aria-label="Editions"`. Links to listing always present.
**Mobile:** sticky jump menu not used; the on-this-page list is a collapsible `details`. Quotes get left border, never truncated.
**A11y:** tables have `caption`, `th scope`; quotes use `blockquote` with `cite`; date is `time datetime`.

## 4. /ai-models/leaderboards

**Purpose:** answer "where is the model ranking?" honestly and route to what exists. Page title uses "Compassion leaderboards: what exists and what does not".

**Layout order**
1. `h1` and first sentence in a `Callout`: "No model ranking is published. This is not a ranking page." One line why (public item bank, no cross-family judging, not enough validated items), linking methodology.
2. **Primary route** (`Card variant="featured" href="/ai-labs"`): "The live compassion leaderboard is for organisations: AI Labs Index" with derived "{labCount} labs scored". States: "It describes how an organisation governs itself, not how any model behaves." Primary `Button` "Open the AI Labs Index".
3. **Optional preview** (build flag, default on only if the gates pass): three rows in published index order (lab name, region, link), caption "From the AI Labs Index. Organisations, not models. Shown in the index's published order." No score or band shown, so the preview cannot be read as a model figure. If any gate flags a lab name near a ranking word, the preview is dropped and the card alone remains. Rows never sit within 60 characters of a model name.
4. **Conditions checklist** (`Panel`, `ol`): one row per condition from PRD section 10 (protocol ratified, decision active, three-family judge panel, secure item pool, human-validated items in every dimension, human rating panel, variance and agreement floors, two clean waves, zero open claim audits, hosted/local never on one axis, legal and duty-of-care review). Each row: plain-language condition, a `Pill` status ("Not met", "In progress", "Met"), and a "since {date}" or "evidence" link where one exists. Status text values are derived from a small JSON; never all hand-coded as "Met". Summary line above: "{met} of {total} conditions met" (derived). Even when all are met the page says the first form would be groupings with ranges and the founder decides.
5. Independence `Callout`, signup (`model-watch-leaderboards`), links to Insights post 6.

**Edge:** if a condition's data is missing the row shows "Status unknown" rather than disappearing. Checklist is a list, not a table, so it reflows on mobile; status pill moves under the condition text.
**A11y:** status is text in the pill; the list has an `aria-label`.

## 5. /insights and /insights/[slug]

### 5a. Listing
`h1` "Insights"; lead: argued, cited pieces on compassion-first AI for labs, agent builders and press. Audience filter as a row of link-style buttons (All, Labs, Agent builders, Press and policy) working client-side; without JS all posts show with their tags. Post cards (`Card href`): title, date, reading minutes (derived from word count), audience `Pill`s, one-sentence dek. Newest first. Zero-state: "No posts yet." with signup. No pagination at MVP (six posts). Signup at the bottom (`insights-list`).

### 5b. Post page
- **Reading layout:** single column, max width about 70ch; `h1`, byline "Compassion Benchmark research", `time`, reading time, audience `Pill`s, a one-paragraph "In short" summary. On desktop at >=1100px an on-this-page list sits in a right rail; on mobile it is a `details` below the summary.
- **Body:** `h2`/`h3` hierarchy, no body images required. Claims that carry a figure or fact carry a **citation marker** `[n]` as a superscript link to `#ref-n`; the references list at the end holds title, publisher, date, URL, and a back-link. Marker link text includes accessible name "Source 3". A number with no marker fails the post lint (not a UX state).
- **Claim ledger** (`details`, closed by default, labelled "Claims and sources in this post"): table of claim, source or derivation. Evidence-thin sections carry an explicit "What we do not know" subsection.
- **Corrections** section (append-only) and independence statement on lab-facing posts.
- **Related posts:** up to three `Card`s, chosen by shared audience tag, then recency; excluded if fewer than one.
- **CTA block** (after the references): one primary and one secondary, only from: Weekly Watch signup (`insights-<slug>`), `/ai-labs` (`Button` "See the AI Labs Index"; purchase `GUMROAD.aiLabsIndex` only on lab-facing posts), `/ai-evaluation-suite` (agent post). No more than two actions.
- **Prev/next:** not used; related posts replace it.
- **Mobile:** body 16px minimum, line length natural, tables inside `overflow-x-auto`, citation targets 44px tall via padding.
- Posts never name a model next to a ranking word; the same lexicon gate runs on `/insights/**`.

## 6. Navigation

- **mainNav:** keep eight items; do not add a ninth. `AI Models` stays and becomes a link with a hover/focus submenu (Tracker, Weekly Watch, Leaderboards, Methodology) on desktop; on mobile it is an expandable row inside the existing menu. Add **Insights** as a single item replacing nothing by placing it inside the `Updates` group submenu (Daily, Special briefings, Insights), because both are editorial. If a submenu is judged too heavy for the current Navbar, fallback: no nav change and rely on the hub cards plus footer (still reachable in 2 clicks).
- **Footer:** add a "AI Models" column group under `research` or a new small `aiModels` list: Tracker, Weekly Watch, Leaderboards, Methodology, Pilot reports (conditional), Insights. Add Insights to the `research` list too for discoverability. Do not add Score-Watch.
- **Current-page state:** `aria-current="page"` on the active nav link; the AI Models parent is active for any `/ai-models/**` path.

## 7. QA checklist (testable)

1. Hub: "This week" block renders N from data; with no edition the zero-state shows; no hand-typed count.
2. Tracker: default alphabetical; filters AND; result count updates; zero-result message and Reset work; no JS shows the full table; each row has a source; no row link; mobile cards below 720px.
3. Tested-by-us values match the derivation rule; "Pilot" absent when the pilot gate does not render.
4. Edition: six sections in order; every release has a source; disclosures quote-only; prev/next correct at ends.
5. Leaderboards: contains "no model ranking is published"; `/ai-labs` card present; checklist statuses come from data; no lab score appears.
6. Insights: every figure has a marker; references link back; CTAs only to allowed assets.
7. Lexicon and 60-character gates pass on all new routes; no forbidden JSON-LD; keyboard-only completion of filter, reset, signup; focus never lost on filter change.

## 8. Assumptions affecting implementation

- A1: tracker data is embedded in the page bundle; for large catalogs, the client component receives JSON props, not a fetch.
- A2: query-string filter state is read client-side only; static HTML is unfiltered.
- A3: the Navbar can support a submenu; if not, use the fallback in section 6.
- A4: the existing `NewsletterSignup` success default mentions "Friday highlights", so every placement here must pass `successBody` and `buttonLabel` overrides (the `footer` and `inline-compact` variants cannot be overridden and are not used).
- A5: the AI Labs preview in section 4 depends on gate results; frontend builds it behind a flag.
