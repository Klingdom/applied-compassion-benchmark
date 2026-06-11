# Pages Review — Frontend Feasibility & Improvement Plan (2026-06-11)

Scoring key: Impact / Strategic Alignment / Learning Value / Confidence / Effort / Risk (each 1–5)
Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## Current-state health — Special Report pages

Special Briefing pages (`/updates/special/[slug]`) are structurally sound: type-safe JSON pipeline, correct `generateStaticParams`, working breadcrumb, clean scoped prose CSS, JSON-LD Article schema, and a build-time script that strips internal reviewer language before any content reaches the public surface.

Two gaps are material: (1) every shared social card is blank — `openGraph` in `generateMetadata` has `title` and `description` but no `images` array, so Twitter/OG cards render as text-only; (2) long pages (8–10 sections, sometimes 3,000+ words) have no in-page navigation — the `BriefingJumpNav` pattern that already ships on daily briefings has not been ported, leaving readers with no scroll-back affordance. A third gap — absence of `data-pagefind-body` — means special reports are invisible to the site's own search index.

---

## Candidates

---

### SR-1 — Build-time Section TOC for Special Reports

**Page:** `/updates/special/[slug]`
**Type:** Navigation / UX

**Problem (evidence):**
`site/src/app/updates/special/[slug]/page.tsx:218–251` renders `briefing.bodySections` as a plain sequential block. The `exemplars-2026-06-11.json` brief has 9 sections totalling 5,000+ words of prose. There is no sticky nav, no back-to-top, no jump links — the user has only browser scroll. Compare: the daily briefing wires a full `BriefingJumpNav` (`site/src/components/updates/briefing/BriefingJumpNav.tsx`) with IntersectionObserver active-section highlighting.

**Proposed change + approach:**
At build time, derive a `NavItem[]` from `briefing.bodySections` whose `level === 2` entries (the major numbered sections). Each section already receives `id={section-${i}-heading}` at line 225. Pass that list as `presentSections` to `BriefingJumpNav` — identical prop contract to the daily briefing. Because `BriefingJumpNav` is `"use client"` it just needs wrapping in a client-component import from the server page.

No new components. The only addition is the import and a 4-line `navItems` derivation above the return. Mobile horizontal-scroll behaviour comes free from the existing component.

**Benefit:** Readers can orient in a long analytical document and jump to the section they want. Reduces bounce on heavy content. Reuses a tested, accessible, analytics-instrumented component with zero new code.

**Independence check:** Navigation UI only. No content changes, no data mutations.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 3 | 2 | 5 | 1 | 1 | **12** |

---

### SR-2 — Pagefind Inclusion for Special Reports

**Page:** `/updates/special/[slug]`
**Type:** SEO / Search

**Problem (evidence):**
`site/src/app/updates/special/[slug]/page.tsx` has no `data-pagefind-body` attribute anywhere. `site/src/app/updates/[date]/page.tsx:181` shows the correct pattern: a wrapping `<div data-pagefind-body data-pagefind-meta="…">` around the content area. The build script runs `pagefind` over the static export after `next build` (`package.json` line 8: `node scripts/build-search-index.mjs`). Without `data-pagefind-body`, all special-briefing text is invisible to the site's search, meaning a reader searching "Exemplary band" or "Open Bionics" will not find the special report.

**Proposed change + approach:**
Add `data-pagefind-body` to the outer wrapper `<>` — specifically, wrap the post-header content in a `<div data-pagefind-body data-pagefind-meta={...}>`. Meta fields: `type:special-briefing,date:${briefing.date},edition:${briefing.edition}`. Mark the breadcrumb and footer nav `data-pagefind-ignore` so navigation boilerplate does not pollute results. This is a single-pass edit — roughly 5 lines added to the page component.

**Benefit:** Special reports become discoverable via site search immediately. The briefings contain the densest analytical text on the site (scoring mechanics, cross-type comparisons, evidence citations) — exactly what a researcher would search for.

**Independence check:** Search indexing only. No content impact.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 4 | 2 | 5 | 1 | 1 | **13** |

---

### SR-3 — OG Image Gap (missing `images` in `openGraph` metadata)

**Page:** `/updates/special/[slug]` and `/updates/special`
**Type:** SEO / Social sharing

**Problem (evidence):**
`site/src/app/updates/special/[slug]/page.tsx:62–80` — `openGraph` object has `title`, `description`, `url`, `type`, `publishedTime` but no `images` array. Same gap in `site/src/app/updates/special/page.tsx:13–19`. `twitter.card` is set to `"summary_large_image"` (line 77) but there is no image to fill it, so Twitter will render the text-only fallback card. The daily briefing pages (`site/src/app/updates/[date]/page.tsx:63–75`) have the identical gap — `og:image` is empty site-wide.

The Graphics Backlog (`docs/GRAPHICS_BACKLOG_2026-06-11.md:39`) rates a Satori/resvg build-time OG card generator at Effort=Med (Wave G2 #7). For special reports, a simpler intermediate fix is feasible before that.

**Proposed change + approach:**
Two-phase:
- **Phase A (cheap, does not require Satori):** Add a single static fallback image — a 1200×630 PNG of the site wordmark and tagline committed to `site/public/og-default.jpg`. Add `images: [{ url: "https://compassionbenchmark.com/og-default.jpg", width: 1200, height: 630, alt: "Compassion Benchmark" }]` to `openGraph` in both special pages and the daily briefing pages. This turns blank cards into branded cards immediately.
- **Phase B (full — Wave G2 #7):** Satori prebuild script generating per-briefing PNGs with the title, dek, date, and edition badge baked in. Static-export safe (build time only, no edge runtime needed). At build time, iterate `manifest.briefings`, render each card with Satori, write to `site/public/og/special-[slug].png`, reference from `generateMetadata`.

Phase A is 1-2 hours. Phase B is the medium-effort Wave G2 item.

**Benefit:** Every social share of a special report becomes a branded card. `summary_large_image` actually works. Phase A eliminates the blank-card problem immediately.

**Independence check:** Visual branding only. No content/score data involved.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 4 | 1 | 5 | 2 | 1 | **11** |

---

### SR-4 — Band-Distribution Bar Chart in Special Reports (Wave G1 #6 adaptation)

**Page:** `/updates/special/[slug]`
**Type:** Data visualization

**Problem (evidence):**
Both special briefings published on 2026-06-11 describe distribution tables in their cohort sections (e.g., `exemplars-2026-06-11.json:bodySections[1].html` contains a 7-row per-index count table; the Floor briefing has the same). The data exists in the index JSONs at build time. The `ScoreSparkline` pattern (`site/src/components/updates/briefing/ScoreSparkline.tsx`) shows the established hand-rolled inline SVG approach — no external charting library, `role="img"` accessible, server-component-safe.

The Graphics Backlog rates a band-distribution bar ("all 1,160 entities across 5 bands") at Priority 15, Effort Low. For special reports the immediately useful variant is a **per-index Exemplary/Critical band-density bar** — a horizontal strip of 5 colored band zones with a dot at the entity count for each type.

**Proposed change + approach:**
New server component `BandDistributionBar.tsx` in `site/src/components/updates/briefing/`. Accepts `counts: { band: BandLevel; count: number; total: number }[]`. Renders a 300×28px SVG: five contiguous zone rectangles (color from the existing CSS band palette in globals.css — Critical #f87171, Developing #fb923c, etc.) with count labels. Use `site/src/data/indexes/*.json` at build time in the special-briefing page to derive per-index band counts and pass as props. The component renders as a `<figure>` with `<figcaption>` for accessibility.

Place it in the cohort section, directly above the prose table. Collapsible via `<details>` if density is a concern.

**Benefit:** Turns the abstract distribution numbers already in the text into an instant visual. Directly supports the "State of the Field" framing that makes special reports more shareable and citable. Reuses the SVG primitive pattern, adding zero new npm deps.

**Independence check:** Derived from canonical score data at build time. Same provenance as the rankings. Fully traceable. Strengthens independence (visual is own-generated, CC-BY).

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 5 | 3 | 4 | 2 | 1 | **13** |

---

### SR-5 — Cross-links: Report to Related Daily Briefings and Entity Pages

**Page:** `/updates/special/[slug]`
**Type:** Navigation / Engagement

**Problem (evidence):**
The footer nav in `site/src/app/updates/special/[slug]/page.tsx:254–302` offers only "All special briefings" and "Latest daily briefing" — generic links. The two published briefings contain dense entity references (Hungary recovery arc, Norway Exemplary exit, Microsoft compelled-remedy ruling, Open Bionics, Switzerland) that map directly to entity pages at `/entities/[slug]`. The `bodySections[].html` has no links to those entity pages; entity slugs appear only in prose text.

Similarly, both briefings reference the source daily briefing dates (e.g., "2026-06-01" Hungary upgrade, "2026-04-26" Norway exit) — these are linkable archive URLs at `/updates/[date]` but are not surfaced.

**Proposed change + approach:**
Two parts:

1. **Add `relatedEntities` and `sourceDates` fields to `SpecialBriefing` type** (`site/src/data/special-briefings/types.ts`) and to the build script front-matter parser (`site/scripts/build-special-briefings.mjs` `parseFrontMatter`). Author provides a YAML-like list in the markdown preamble. Build script passes through to JSON.

2. **Render a "Referenced entities" chip list** in the special-briefing page, below the footer nav. Use the existing `TrackedEntityLink` (`site/src/components/updates/TrackedEntityLink.tsx`) pattern plus `entityHref` to resolve slugs to correct routes. A "Source daily briefings" section links to `/updates/[date]` with the formatted date label using the existing `formatDate` utility already in the page.

This is a small schema addition (1 field each in types.ts, the MD front matter, and the page renderer). The visual treatment can reuse the Band/Pill/Eyebrow primitives from `components/ui/`.

**Benefit:** Readers following the Norway exit or Hungary arc can click through to the entity's history page directly. Source citation discipline is visible. Improves dwell time and internal link graph.

**Independence check:** Navigation only. No score changes. Links to canonical entity records.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 3 | 4 | 2 | 4 | 2 | 1 | **10** |

---

### SR-6 — Newsletter CTA on Special Reports

**Page:** `/updates/special/[slug]`
**Type:** Conversion / Engagement

**Problem (evidence):**
`site/src/app/updates/special/[slug]/page.tsx` has no email capture anywhere. The daily briefing has a `CompletionBlock` (`site/src/components/updates/briefing/CompletionBlock.tsx`) with a `NewsletterSignup` embedded at the end. Special reports are the highest-depth, most analytical content on the site — a reader who finishes a 5,000-word briefing on exemplar institutions is precisely the target for the weekly digest. The footer nav at lines 254–302 closes the page with only two generic links.

**Proposed change + approach:**
Insert a `NewsletterSignup variant="card"` block between the body sections and the footer nav — the same position as the daily briefing's `CompletionBlock`. The component already exists (`site/src/components/ui/NewsletterSignup.tsx`) and accepts a `source` prop for tracking. Source value: `special-briefing-[slug]`. Add a brief `preamble` explaining context: "Special Briefings publish monthly. The weekly digest arrives every Friday with the week's top score movements."

This is a 10-line addition to the special-briefing page. No new component needed.

**Benefit:** Converts the highest-intent reader cohort at the natural exit point. Every special report currently leaks all reader attention with no capture mechanism.

**Independence check:** Signup form is editorial/subscription — entirely separate from scores and rankings. No conflict.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 4 | 4 | 1 | 5 | 1 | 1 | **12** |

---

### DB-1 — Wave G1 Charts on Daily Briefings (band-position strip + dimension profile bar)

**Page:** `/updates` and `/updates/[date]`
**Type:** Data visualization

**Problem (evidence):**
`site/src/components/updates/DailyBriefing.tsx:49` imports `ScoreSparkline` and uses it for score trajectories (Wave C). The Graphics Backlog (`docs/GRAPHICS_BACKLOG_2026-06-11.md`) designates Wave G1 items #1 (band-position strip) and #2 (8-dimension profile bar) as Priority 16/15, Effort Low — the highest-priority and cheapest items in the entire graphics plan. Neither has been implemented. Score cards (`ScoreMovementCard.tsx`, `LeadSignalCard.tsx`) display numeric composites (e.g., "18.4") without any visual band-position context.

**Proposed change + approach:**
Following the SVG pattern of `ScoreSparkline.tsx`:

- **BandPositionStrip** — 200×16px SVG. Five contiguous colored zones (Critical/Developing/Functional/Established/Exemplary). A triangle marker at `(score/100) × width`. Renders inline next to the composite number. Server component. Props: `score: number`. Zero deps.

- **DimensionProfileBar** — 8 horizontal bars (one per dimension), colored by band zone, labeled AWR…INT. Props: `dimensions: Record<string, number>`, `previousDimensions?: Record<string, number>`. Rendered inside a `<details>` (closed by default per Wave E1 density discipline) below the section body in `ScoreMovementCard` and `LeadSignalCard`.

Both components derive all data from what is already present in the briefing JSON (`scoreChanges[n].dimensions`). No new data pipeline work. The GRAPHICS_BACKLOG specifies `headingOffset=1` rendering — the existing `mdToHtml` pattern shows how the codebase handles this.

**Benefit:** Turns "18.4" into "this entity is at the bottom of the Critical band" instantly. The dimension profile exposes *why* a score moved, which is the briefing's core editorial value. Directly addresses the reader comprehension problem identified across all five lens documents.

**Independence check:** Own-data SVG. Fully traceable. Strengthens independence per policy.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 5 | 5 | 4 | 5 | 2 | 1 | **16** |

---

### DB-2 — Delete `DailyBriefing.legacy.tsx`

**Page:** n/a (dead code)
**Type:** Tech debt / cleanup

**Problem (evidence):**
`site/src/components/updates/DailyBriefing.legacy.tsx` exists (confirmed by Glob). Grep across all `.tsx`/`.ts` source files finds zero imports of this file — it is not imported anywhere in the current source tree. The active component is `DailyBriefing.tsx` (Wave B, documented in its header). The legacy file is 500+ lines of old layout code that TypeScript still compiles, ESLint still checks, and new engineers must read to understand what is current.

**Proposed change + approach:**
Delete `site/src/components/updates/DailyBriefing.legacy.tsx`. Confirm no import by searching `DailyBriefing.legacy` across the codebase before deletion. Run `npm run build` to verify the build is clean. No other changes needed.

**Benefit:** Reduces codebase surface area by ~500 lines. Eliminates the "which DailyBriefing is current?" confusion for any future contributor. Removes dead TypeScript compilation overhead.

**Independence check:** No user-visible change. Pure cleanup.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | Priority |
|--------|---------------------|----------------|------------|--------|------|----------|
| 2 | 2 | 1 | 5 | 1 | 1 | **8** |

---

## Priority ranked order

| Rank | ID | Title | Priority |
|------|----|-------|----------|
| 1 | DB-1 | Wave G1 charts — band-position strip + dimension profile bar | 16 |
| 2 | SR-2 | Pagefind inclusion for special reports | 13 |
| 3 | SR-4 | Band-distribution bar chart in special reports | 13 |
| 4 | SR-1 | Section TOC / BriefingJumpNav for special reports | 12 |
| 5 | SR-6 | Newsletter CTA on special reports | 12 |
| 6 | SR-3 | OG image gap (Phase A: static fallback) | 11 |
| 7 | SR-5 | Cross-links: report to entity pages + source dates | 10 |
| 8 | DB-2 | Delete DailyBriefing.legacy.tsx | 8 |

---

## Sequencing recommendation

**Immediate (cheap, high-payoff):** SR-2, SR-6, DB-2 — these are each 10–15 lines and unblock real gaps (search invisibility, conversion leak, dead code) with near-zero risk.

**Near-term (core product quality):** SR-1 (BriefingJumpNav port, ~30 min), SR-3 Phase A (static OG image, ~1 hour).

**Medium-term (data-visual layer):** DB-1 (Wave G1 SVG charts, the backlog's top-priority item), SR-4 (band-distribution bar as its natural extension into special reports).

**Longer-term:** SR-3 Phase B (Satori OG cards, medium effort), SR-5 (schema extension for cross-links — requires co-authoring the MD front-matter convention with the researcher workflow).
