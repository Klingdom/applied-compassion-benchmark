# UX design: AI model pilot report and /ai-models update (2026-10-01)

Author: UX Designer. Inputs read: AI_MODELS_PAGE_REVIEW_2026-10-01.md (Parts A and B), D-29, ModelGlossary, SpecialBriefingJumpNav, and the print block in `/updates/special/[slug]/page.tsx`. No figure below is typed. Every number renders from `PILOT_FACTS` / `MODEL_INDEX_FACTS` / `analysis.json` at build time.

## 0. Gate

Nothing here may render until the founder amends D-29. D-29 allows two pages, bans "evaluation underway" language, and bans any composite or band. The review's Part A (page fixes) is not gated. The report route and the Part B block are.

## 1. User journeys

Four reader types. Each has an entry, a key action, a completion state and a failure state.

| Reader | Entry | Key action | Completion | Failure to design against |
|---|---|---|---|---|
| Journalist / answer engine | Search "AI compassion benchmark" -> /ai-models | Read key facts + "what you can cite", open report | Leaves with one quotable, correct sentence | Screenshot of a number without "unofficial" |
| Lab or researcher | Link from /ai-labs or press | Report -> methodology -> run-it-yourself | Runs `cb-probe` on own model, understands result is self-submitted | Thinks pilot = Tier 1 result |
| General reader / buyer | Search "which AI is most compassionate" | Reads banner, learns there is no ranking | Understands lab score is not model score | Reads a ranking into per-model cards |
| Person in distress | Same search | Sees crisis line before any result | Gets to a real service | Scrolls past it; reads results as advice |

Main path: /ai-models (hero answer, key facts) -> "Pilot runs" summary block -> "Read the report" -> report (banner, summary, sections) -> end-of-report next steps (Read the method / Run it yourself / Subscribe to the Score Watch update). Subscribe appears once, at the report end, and in the existing footer. No mid-report CTAs; the report is evidence, not a funnel. Independence rule: nothing in the report links to any paid product above the fold.

Completion state: reader can say, in their own words, "unofficial, tested the instrument, no ranking". QA check: five-second test on the first viewport.

## 2. The /ai-models update

Apply review Part A reading order unchanged. Insert one net-new block, **PilotSummaryCard**, at position 8 (`id="runs"`), replacing the "First complete run" heading. It is a section, not a route copy of the report (D-30 precedent).

Above the fold, desktop (1280 wide, about 800 tall):
1. Shortened banner (A2), full width.
2. H1 + answer lede + SubjectLine + one CTA pair ("Read the method", "Read the pilot report").
3. Start of key facts `<dl>`. Add one row: "Unofficial pilot reports: {count}" linking to the report.

Above the fold, 390px mobile: banner (max three lines), H1, lede (clamped to about six lines; remaining text follows), CTA pair stacked full-width. Key facts begin on screen two. Jump list wraps as a list, not a sticky bar (A10). Crisis one-liner sits directly under key facts, within the first three screens.

PilotSummaryCard contents, in this order: status line ("Unofficial pilot. Not a score, not a ranking.") -> one-sentence purpose -> three findings as plain-language bullets (judge agreement, what separated vs. what did not, ceiling/length caveat; each from data) -> "Why these are not scores" disclosure count with link -> button to the report. No per-model table, no chart on this page. The full per-subject ranges live only in the report so the index page stays a pre-registration page.

## 3. Report page template

Route component renders from one data object per wave. Layout, top to bottom:

1. **Status bar (StatusBanner)**. `position: sticky; top: 0`, always visible on screen, one line plus a "why" disclosure: "UNOFFICIAL PILOT. Not a Compassion Benchmark score. No ranking." It cannot be dismissed. On mobile it truncates to "Unofficial pilot. Not a score." with full text in the first paragraph. In print it becomes a fixed element at the top of every page (Chrome and Firefox repeat `position: fixed` per page) and the document title carries "Unofficial pilot".
2. **Header**: eyebrow ("Pilot report"), title, date, wave id, reading time (computed from word count), "Print / save as PDF" button (`window.print()`, no server).
3. **Crisis one-liner** (same copy as /ai-models), directly under the header.
4. **Answer box ("In short")**: five lines max, mirroring "what you can cite" accurate / not accurate.
5. **Sections** (a fixed section list defined in the template, not hand-picked per wave; see section 5): What was tested -> Publication bar for this run -> What the pilot found about the instrument -> Per-dimension ranges -> Why these are not scores -> Limits and what would change them -> What happens next -> How to cite / how to reproduce.
6. **Next steps**: methodology, run it yourself, subscribe.

Sticky TOC: yes on desktop at 1024px and above, as a left rail (reuse the jump-nav pattern). No sticky TOC on mobile; use an inline "On this page" list after the answer box, as A10 specifies. Only one sticky element on mobile (the status bar), to protect the viewport.

Per-subject ranges: cards in alphabetical order by label, never sorted by result. Every card carries the footer "Unofficial pilot · date · judged by models from the same developer · not a score" so crops keep the disclaimer. No colour encoding of better/worse, no highlighted card, no band colours. Where data show a separated and a non-separated group, use text ("this pilot could separate X from the rest; it could not separate the rest"), not ordering. The haiku result must sit beside its length caveat in the same panel.

Print stylesheet (the "six pages" test): target about 3,000 words at 11pt body, A4 and Letter, 2cm margins (`@page { margin: 2cm 2.5cm }` as in the special-briefing template). Rules: white background, black text; hide Navbar, footer, TOC, subscribe, buttons; expand all `<details>` (the briefing template hides them; this report must open them, since disclosures are content); `break-inside: avoid` on cards, tables and figures; `break-after: avoid` on headings; the repeated status line on every page; print link URLs after external links; the page footer shows the wave id and URL. Acceptance: print preview in Chrome A4 renders between five and seven pages; QA records the count for each wave and fails the build step if a wave exceeds eight. Note the briefing print block hides `details`, so do not copy it as is.

States: loading is not applicable (static). Empty: if a data field is missing the paragraph or card that depends on it does not render, per the review's render rule; the section heading then shows "Not measured in this wave" rather than disappearing. Error: a build fails if the status banner, disclosure list or crisis line is absent from the rendered wave object. Failed-run waves (no usable data) still render the banner and the operations record.

Accessibility: banner is `role="note"` not `alert`; one H1; heading order unbroken; intervals shown as text numbers plus an optional bar; contrast per existing theme; print is the accessible fallback.

## 4. Component inventory

Reuse as is: Container, SectionHead (needs optional `id`, already requested in A10), Panel, Card, Callout, Eyebrow, Pill, Stat (only for non-score facts), DefinedTerm, Button, NewsletterSignup, SubjectLine, PipelineStages (link target only), ModelGlossary (render at report end), SpecialBriefingJumpNav (extend to accept section lists from the wave), the special-briefing print block (as base only).

Net-new, in `components/model-benchmark/`:
- `StatusBanner` (sticky and print-fixed; props: kind "unofficial-pilot")
- `PilotSummaryCard` (for /ai-models)
- `ReportShell` (header, banner, TOC rail, print CSS, next steps)
- `AnswerBox` (in short plus cite / do-not-cite)
- `PublicationBarTable` (from A3, with a "met in this run" column)
- `FindingList` (question, plain answer, data basis; renders only present fields)
- `IntervalCard` (one subject, rows of code, range, n, footer; no point estimate)
- `DisclosureStack` (ordered, each item conditional on a data flag)
- `OperationsRecord` (deviations, dated)
- `CrisisNote` (single source used on both pages)

No chart library. Intervals use inline SVG or CSS bars on a shared 1 to 5 axis.

## 5. Reusable template and route

Recommendation: **`/ai-models/assessments/[waveId]`**, built with `generateStaticParams` over `site/src/data/model-benchmark/assessments/*.json`. One file per wave. The page file never contains copy; it renders `ReportShell` with the wave object. Content authors fill: wave id, date, subjects (label plus access path), judges, items served, findings, intervals, disclosure flags, operations record, next steps. Fixed template sections (section 3, item 5) are not editable per wave, so a later wave cannot drop a disclosure.

A wave type field (`pilot`, `official`) selects the banner: `pilot` shows the unofficial banner; `official` is unavailable until a future amendment defines what an official result page is. Wave schema validator rejects `composite`, `band`, `rank`, `score` keys (matching B1) and requires `bannerKind`.

Do not create `/ai-models/assessments` as an index page. Link waves from the PilotSummaryCard list on /ai-models; an index with one entry is the doorway pattern D-29 rejects.

Why this fits D-29, and what it still needs:
- D-29 caps pre-result pages at two. The report is a third route, so it needs an explicit amendment, not a quiet exception. D-30 declined a third route for release watch because it would be an empty doorway; this one has about 3,000 words of real content, which is the "earned" condition D-30 named.
- Rejected alternative A: put the whole report as an anchor section on /ai-models. It keeps D-29 intact but makes a page of about 15 blocks into a roughly 25-block page and cannot print as a stand-alone six pages. Rejected.
- Rejected alternative B: `/ai-models/<model>` per-model pages. Banned by D-29 (doorway, implies ranking).
- The route is per wave, not per model; it holds no leaderboard; it has no `Dataset` or `ItemList` JSON-LD; it carries `noindex` until the founder decides on indexing. Article JSON-LD only, if any, with the word "unofficial" in the headline.
- Fallback if the founder will not amend: ship the PilotSummaryCard as section `runs`, keep the report in `research/`, and offer the print-styled report as a PDF linked from the card.

## Edge cases for QA

- Banner visible in the viewport at every scroll position, desktop and 390px; present on every printed page.
- No element orders subjects by outcome; DOM order equals alphabetical label order.
- Every subject label sits in the same element as its access-path qualifier.
- Crisis note appears before the first result, on both pages.
- Dynamic text: counts match `analysis.json`; the stale-count guard passes.
- Print: details expanded, no clipped cards, page count within range.
- Reduced motion: no animated charts. JS disabled: banner, content and print still work (only the TOC highlight needs JS).
