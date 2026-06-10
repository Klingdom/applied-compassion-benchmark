# Content Strategy & Knowledge-Acquisition Review — 2026-06-10

**Agent:** knowledge-architect
**Lens:** how effectively a reader *acquires understanding* per unit of screen space and attention.
**Founder steer (first-class):** space efficiency / information density. Stat-of-the-Day is "way too big and wasting valuable space." "Dramatically improve" = denser, more scannable, more understanding per screen — not more features.

Scope reviewed (all claims grounded in files):
`/updates` — `DailyBriefing.tsx`, `briefing/StatOfTheDay.tsx`, `briefing/TodayInBrief.tsx`, `briefing/DailyBriefingHeader.tsx`, `briefing/ForwardTriggerCountdown.tsx`, `briefing/ScoreSparkline.tsx`, `briefing/ScoreMovementDashboard.tsx`, `briefing/utils.ts`; `app/page.tsx`; `app/fortune-500/page.tsx` + `components/index/IndexHero.tsx` + `components/index/RankingTable.tsx`; `app/indexes/page.tsx`; `components/entity/EntityDetail.tsx`; `app/methodology/page.tsx`; `app/score-watch/page.tsx`; `docs/DAILY_BRIEFING_SCHEMA.md`; `CLAUDE.md`.

Scoring key: each metric 1–5. **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.** (Range −2 to +18.)

---

## Candidate 1 — Collapse Stat-of-the-Day into a dense "Today's number" strip (THE worked example)

**Page(s):** `/updates` — `briefing/StatOfTheDay.tsx`, consumed by `briefing/DailyBriefingHeader.tsx` (lines 136–162).

**Problem (file evidence + cost).** `StatOfTheDay.tsx` renders a full card: an uppercase label (line 50), a `clamp(2rem,5vw,3rem)` hero number (line 56), a label+entity row (lines 63–87), and a "Copy citation" button (lines 90–143) — all inside `p-5 sm:p-6` padding (line 48). In `DailyBriefingHeader.tsx` it occupies **a full half of the above-the-fold 2-up grid** (`grid-cols-1 sm:grid-cols-2`, line 138), and when no stat exists a `min-h-[120px]` placeholder reserves that space anyway (lines 143–148). So roughly a quarter of the hero viewport is spent delivering **one number + one label + one link** — and per `deriveStatOfTheDay` (utils.ts 129–235) that number is, in the common case, simply the largest score delta that *already appears verbatim* as the first bullet of Today-in-Brief and again in the Lead Signal card below. The reader pays a large pixel cost for a fact they will see two more times. This is the lowest value-per-pixel surface on the page.

**Proposed change (specific denser redesign).** Replace the half-grid card with a **single-row "Today's number" strip** spanning the hero's full width, placed directly under the thesis line:

```
TODAY'S NUMBER  −6.2 pts  Turkey · largest score move this cycle   [⧉ cite]   No.142 · 1,160 reviewed
```

Concretely: one flex row, `text-[1.5rem]` figure (not `3rem`), label + linked entity inline at `0.9rem`, the copy-citation control demoted to a 13px icon-only affordance with an `aria-label` (keep the existing `handleCopy`/`trackEvent` logic from lines 33–45 untouched), and **fold the trust line** (`DailyBriefingHeader` 164–174, "1,160 entities reviewed") and **issue number** into the same strip's right edge. This reclaims the entire right half of the hero grid for **Today in Brief**, which can then render its 3 bullets full-width and become the genuine 20-second read. Net: the same five facts in roughly one-third the vertical space, with Today-in-Brief promoted to the dominant above-the-fold element.

**Knowledge-acquisition benefit.** The 5-second scanner still gets the single memorable number (retention hook intact), but the 30-second rung — the 3-bullet synthesis — now owns the prime real estate it deserves. Less repetition, one nameable takeaway per row, more understanding above the fold.

**Independence check:** PASS. Pure format change; the figure remains the evidence-derived delta. No hype added.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 5 | 4 | 5 | 2 | 1 |

**Priority = 5+5+4+5 − 2 − 1 = 16**

---

## Candidate 2 — Teach the band/score schema once, inline, and reuse the same legend everywhere

**Page(s):** cross-page — `components/entity/EntityDetail.tsx` (hero 84–149), `components/index/IndexHero.tsx` (band table 57–97), `components/index/RankingTable.tsx`, `app/fortune-500/page.tsx` (columns 22–37), `briefing/*` (Band pills throughout).

**Problem (file evidence + cost).** The benchmark's core mental model — *composite 0–100 → one of five named bands → eight dimensions* — is **only ever fully defined on `/methodology`** (the band table at `methodology/page.tsx` 456–470 and the dimension list). Everywhere a newcomer actually lands, the schema is shown but never taught:
- Entity hero (`EntityDetail.tsx` 109–146) shows a `<Band>` pill and a `2.6rem` composite "out of 100", but **never states the band's numeric range or one-line meaning**. A first-time visitor to a "Developing" company page cannot tell whether that is good or bad without leaving.
- The Fortune 500 table headers are **eight bare 3-letter codes** — `AWR, EMP, ACT, EQU, BND, ACC, SYS, INT` (`fortune-500/page.tsx` 27–34) — with no legend rendered on the page. The reader must already know the framework to read the table at all.
- `IndexHero` shows a band-distribution table (count/%/range) but not what each band *means* behaviorally.

This is recurring jargon/acronym debt: the same concepts use inconsistent, partially-defined treatments page to page, so knowledge never compounds.

**Proposed change.** Build one shared, compact **"How to read this score" legend primitive** (5 bands as colored chips with `range — 4-word meaning`, plus the 8 dimension codes expanded once) and drop it in three places at low height: (a) a one-line `title`/tooltip + a collapsible `<details>` "What does Developing mean?" beneath the entity composite block; (b) an 8-code dimension legend above/beside the ranking table (a single wrapped row, ~1 line tall); (c) reuse the same chip row in `IndexHero`. Definitions already exist verbatim in `methodology/page.tsx` 457–462 and `DIMENSIONS` data — this is co-location, not new content.

**Knowledge-acquisition benefit.** Teaches the schema at the point of need so a newcomer learns to *read* the benchmark without leaving the page; identical visual treatment everywhere means the model is learned once and reinforced on every surface.

**Independence check:** PASS. Definitional, evidence-first, neutral.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 5 | 5 | 4 | 3 | 1 |

**Priority = 5+5+5+4 − 3 − 1 = 15**

---

## Candidate 3 — Convert the 4-button hero CTA cluster into a 2-rung comprehension ladder

**Page(s):** `/updates` — `briefing/DailyBriefingHeader.tsx` (CTA cluster 126–134); echoes on `app/page.tsx` hero (61–67) and `app/indexes/page.tsx` (32–36).

**Problem (file evidence + cost).** The briefing hero presents **four equal-weight buttons** — "Read today's brief", "Subscribe", "View methodology", "Explore indexes" (lines 128–133). Four co-equal CTAs provide no information scent about *what to do first*; competing emphasis is extraneous cognitive load and pushes the actual content (Stat + Brief) further below the fold. The homepage hero repeats the pattern with three (Explore / Methodology / Purchase), so the wasted-decision tax recurs.

**Proposed change.** Reduce to **one primary action + a thin secondary row**: keep "Read today's brief" as the single primary button; demote Subscribe / Methodology / Indexes to a single inline text-link row (`·`-separated) at `0.82rem`. This both restores the inverted-pyramid scent (read → then go deeper) and reclaims vertical space above the fold, compounding Candidate 1's gain.

**Knowledge-acquisition benefit.** A clear next step ("read the brief") instead of a four-way fork; less decision load, faster path to the content that actually teaches.

**Independence check:** PASS. Navigation only; Subscribe remains present, just de-emphasized (CTA *conversion* tuning is conversion-strategist's call — this is purely scent/hierarchy).

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 3 | 4 | 1 | 2 |

**Priority = 4+4+3+4 − 1 − 2 = 12**

---

## Candidate 4 — De-duplicate the briefing's three overlapping "movement" surfaces

**Page(s):** `/updates` — `briefing/ScoreMovementDashboard.tsx`, the `LegacyScoreChangesSection` in `DailyBriefing.tsx` (524–865), and `LeadSignalCard` / `SignalStack`.

**Problem (file evidence + cost).** A single score change can be rendered **up to four times** on one page: as Stat-of-the-Day (utils 129–201), as a Today-in-Brief bullet (utils 266–313), as a row in `ScoreMovementDashboard` (which merges `recentAssessments` + `appliedChanges` + `pendingReview` + `scoreChanges`, lines 31–70), and again as a full evidence card in `LegacyScoreChangesSection` (533–540 filter, then a 6+-element card each). `DailyBriefing.tsx` even emits both `#score-movements` (line 343) and `#score-changes-detail` (543) sections. The reader scans the same entity/delta repeatedly, inflating page length and burying the *new* information (the evidence) under restated headlines.

**Proposed change.** Make the relationship a **progressive-disclosure hierarchy, not parallel lists**: keep `ScoreMovementDashboard` as the one scannable index of *all* movement (one row per entity, delta + band + why-headline), and convert `LegacyScoreChangesSection`'s full evidence cards into **expand-in-place `<details>` under each dashboard row** (the audit-trail `<details>` pattern already in this file, lines 374–441, is the proven template). One canonical list; depth on demand; no duplicate sections.

**Knowledge-acquisition benefit.** One mental model of "what moved today," with evidence one click beneath each item — the reader self-selects depth instead of re-reading. Substantially shorter page, higher signal density.

**Independence check:** PASS. All evidence remains in the DOM (Pagefind-indexable, accessible), just collapsed — same approach already sanctioned for the audit trail.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 3 | 2 |

**Priority = 4+4+4+4 − 3 − 2 = 11**

---

## Candidate 5 — Add a "What changed since last issue" one-line orientation to the briefing header

**Page(s):** `/updates` — `briefing/DailyBriefingHeader.tsx`; data per `DAILY_BRIEFING_SCHEMA.md` (`pipeline`, `recentAssessments`, `topSignals`).

**Problem (file evidence + cost).** The header gives a date, issue number, a one-sentence thesis (header 32–35), and a static trust line ("1,160 entities reviewed", 164–174). What it never answers in the 5-second window is the returning reader's actual question: *did anything move, and how much, vs. a normal day?* The counts are buried in `ScoreMovementDashboard` ("N assessed", line 100) far below the fold, and the home page exposes a richer "X scanned · Y assessed · Z changes" line (`app/page.tsx` 134–136) that the briefing's own hero lacks.

**Proposed change.** Add a single derived **orientation line** under the thesis: `3 score changes · 1 band crossing · 12 confirmed · 0 new floors — quieter than usual` (the comparative tail computed from issue-over-issue counts; omit the tail if no history). All inputs already exist in `updates.pipeline` / `recentAssessments` / `boundaryWatch`. One line, no new section.

**Knowledge-acquisition benefit.** Front-loads the "is today notable?" answer (inverted pyramid) and gives a cause→effect anchor before the reader commits to scrolling — high germane value at near-zero pixel cost.

**Independence check:** PASS — counts are factual; "quieter than usual" is descriptive, not alarmist. Keep adjectives strictly volume-based, never value-laden.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 2 | 2 |

**Priority = 4+4+4+4 − 2 − 2 = 12**

---

## Candidate 6 — Make the methodology page navigable: sticky TOC + lead summary box

**Page(s):** `app/methodology/page.tsx` (single ~700-line scroll, 17 sections).

**Problem (file evidence + cost).** Methodology is the canonical teaching page for the entire benchmark (it owns the band table 456–470, the 0–5 anchor table 437–453, the integration-premium rules 405–416, the 40-subdimension table 519–567). But it is a **flat, unanchored vertical scroll** with no table of contents and no lead summary. The reader who arrives from an entity page's "Read the methodology" link (e.g. `EntityDetail`/floor disclosure → `/methodology#floor-designation`) lands mid-document with no map of the whole. The single most load-bearing concept set on the site is the hardest to navigate. Most sections lack `id` anchors, so deep links beyond `#floor-designation` aren't even possible.

**Proposed change.** (a) Add a **sticky left/inline TOC** (the briefing's `BriefingJumpNav` is a working precedent) listing the 8–10 major sections; (b) add `id` anchors to each `<SectionHead>`; (c) add a 4-bullet **"The benchmark in 30 seconds"** summary box at the top: *8 dimensions → 40 subdimensions → 0–100 composite → 5 bands → human-approved, evidence-tiered.* Pure structure/anchors over existing copy.

**Knowledge-acquisition benefit.** Builds the clean comprehension ladder (30s summary → section scan → deep table) the page currently lacks, and makes the schema deep-linkable from every other surface so cross-page teaching actually resolves somewhere.

**Independence check:** PASS. Structure only.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 5 | 4 | 3 | 1 |

**Priority = 4+4+5+4 − 3 − 1 = 13**

---

## Candidate 7 — Replace the homepage's prose "8 dimensions" sentence with a scannable dimension grid

**Page(s):** `app/page.tsx` — "How the benchmark works" panel (299–322).

**Problem (file evidence + cost).** The home page introduces the eight dimensions as a **run-on bolded sentence** — "Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systems Thinking, and Integrity" (lines 304–312) — with no one-line definition of any of them. A first-time visitor reads eight nouns and retains roughly none; the actual definitions live only on `/methodology` (99–106). This is the home page's single biggest "teach the model" miss, and it uses *more* characters than a denser treatment would.

**Proposed change.** Convert the sentence into a compact **8-cell grid** (2×4 / 4×2), each cell = dimension name + a ≤6-word gloss pulled verbatim from `methodology/page.tsx` 99–106 (e.g. "Awareness — detects suffering before it's named"). Same footprint, eight nameable takeaways instead of one unscannable list.

**Knowledge-acquisition benefit.** The newcomer leaves the home page actually understanding what the benchmark measures (concrete before abstract, one idea per cell), and arrives at index/entity pages already primed to read the dimension columns.

**Independence check:** PASS. Definitional, neutral.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 3 | 4 | 5 | 2 | 1 |

**Priority = 4+3+4+5 − 2 − 1 = 13**

---

## Candidate 8 — Give Forward-Watch a tighter scent and fix the redundant days/date pairing

**Page(s):** `/updates` — `briefing/ForwardTriggerCountdown.tsx`.

**Problem (file evidence + cost).** Each trigger row shows **both** a days badge ("7 days") and the raw ISO date ("2026-06-17") (lines 170–217), which duplicates the same fact in two formats, and the trigger condition is allowed up to **200 characters** of free prose per row (lines 221–225) — a paragraph masquerading as a list item. With several triggers this becomes a wall of text where the scannable signal (who, when, how soon) is diluted by long conditions.

**Proposed change.** Lead each row with the **proximity badge as the sole time cue** (drop the redundant ISO date, or demote it to a hover `title`), bold the entity + priority, and **truncate the trigger condition to ~90 chars with the full text behind the existing entity link / a `title`**. Keep the proximity color logic (55–60) — it already encodes urgency at a glance.

**Knowledge-acquisition benefit.** Restores list scannability (F-pattern: badge → entity → short condition), so the reader extracts "what's coming and how soon" in one pass instead of reading paragraphs.

**Independence check:** PASS. Format only; observer-voice trigger text preserved (full text still reachable).

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 3 | 3 | 3 | 4 | 2 | 1 |

**Priority = 3+3+3+4 − 2 − 1 = 10**

---

## Summary table (sorted by Priority)

| # | Candidate | Page(s) | Priority |
|---|---|---|---|
| 1 | Collapse Stat-of-the-Day into a dense "Today's number" strip | /updates | **16** |
| 2 | Teach band/score schema once, inline, reuse everywhere | cross-page | **15** |
| 6 | Methodology sticky TOC + 30-second summary | /methodology | 13 |
| 7 | Homepage "8 dimensions" → scannable gloss grid | / | 13 |
| 3 | Hero CTA cluster → 2-rung ladder | /updates (+home/indexes) | 12 |
| 5 | "What changed since last issue" orientation line | /updates | 12 |
| 4 | De-duplicate the three movement surfaces | /updates | 11 |
| 8 | Tighten Forward-Watch scent & dedupe days/date | /updates | 10 |

---

## Fix one thing

**Candidate 1 — collapse Stat-of-the-Day into a single full-width "Today's number" strip and give the reclaimed half of the hero grid to Today-in-Brief.** It is exactly the founder's flagged complaint, it is the lowest value-per-pixel surface on the site (one fact, restated twice more below, occupying ~a quarter of the above-the-fold view), it is low-effort/low-risk (the copy-citation logic and `deriveStatOfTheDay` stay untouched), and it directly converts wasted hero real estate into the 20-second synthesis that actually teaches the day's findings — the single highest-leverage density win available.

---

### StatOfTheDay verdict

**Founder is right — it is the worst value-per-pixel element on the page and should be demoted, not kept as a hero card.** It spends a full half of the above-the-fold grid (`DailyBriefingHeader.tsx` 138–149, with a `min-h-[120px]` placeholder reserving the space even when empty) and a `clamp(2rem,5vw,3rem)` number (`StatOfTheDay.tsx` 56) to deliver **one figure + one label + one link + a copy button** — and in the common path that figure is the same largest-delta value already shown as Today-in-Brief bullet #1 and in the Lead Signal card below it. Recommendation: **keep the number and the (demoted, icon-only) copy-citation affordance, but render them as a single full-width one-line strip** under the thesis, merged with the trust/issue line, freeing the right half of the hero for a full-width Today-in-Brief. Same facts, ~one-third the vertical cost, and the genuinely informative 3-bullet summary becomes the dominant above-the-fold element.
