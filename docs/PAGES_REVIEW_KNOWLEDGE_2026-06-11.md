# Pages Review — Knowledge Architecture (2026-06-11)

**Reviewer lens:** knowledge acquisition / comprehension — how fast a reader *understands*, not how the page looks.
**Surfaces:** the new **Special Report pages** (`/updates/special/[slug]`, priority) and the `/updates` daily briefing.
**Grounded in:** `floor-and-critical-2026-06-11.json` + `exemplars-2026-06-11.json`; renderer `site/src/app/updates/special/[slug]/page.tsx`; `docs/GRAPHICS_BACKLOG_2026-06-11.md`; `site/src/data/dimensions.ts`; `site/src/components/updates/DailyBriefing.tsx` + `briefing/ScoreSparkline.tsx`.

**Scoring:** Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5).

---

## Context: how the Special Report currently teaches

The renderer (`[slug]/page.tsx`) is a clean comprehension ladder *on paper* — dek (l.175) → scope/cohort one-liners (l.180–191) → numbered Key Findings (l.196–215) → body sections as raw `dangerouslySetInnerHTML` HTML (l.244–247). But three structural facts cap how fast a reader can learn:

1. **No orientation layer.** The floor report has 9 body sections (Frame, cohort, two sub-sections, failure modes, corporate gap, comparability, backsliding, forward view, sources); the exemplar report has 9. There is **no table of contents** and **no "jump to section"** (l.218–252 just maps sections in order). A reader landing mid-scroll, or returning to find "the corporate-no-floor argument," must linearly scan ~3,000 words. The daily briefing *has* a `BriefingJumpNav` (DailyBriefing.tsx l.44, l.263); the long-form report — which needs it far more — does not.
2. **Every quantitative pattern is a dense table, never a picture.** §2 cohort table (7 indexes × 6 cols), §3 profile-signature table, §4 the F500 quantization histogram (10 rows), §5 the Turkey/UnitedHealth 8-dimension vector table, §6 backsliding table. These *are* the findings — "23 at the floor," "64 exemplars across 5 bands," "EQU is the soft spot for 62/64." They are exactly the band-distribution and 8-dimension charts proposed in `GRAPHICS_BACKLOG_2026-06-11.md` (Wave G1 #1/#2, G2 #6), and the backlog itself names these reports the "prime use case." Right now a reader must reconstruct the shape mentally from numerals.
3. **The schema is assumed, not taught.** "Critical band (composite ≤ 20)," "0.0 floor," the eight dimension codes (AWR/EMP/ACT/EQU/BND/ACC/SYS/INT), and the band names (Critical→Exemplary) appear constantly but are **never defined on the page**. `dimensions.ts` has `desc` for all 8 and `BAND_DESCS` for all 5 bands — the definitions exist in the codebase but are not surfaced. A newcomer hits "EQU 1.125, below GEO Group's 1.5" with no idea what EQU measures or what the 1–5 anchor scale is.

The candidates below attack these three in priority order.

---

## Candidate 1 — Section TOC / "In this briefing" jump nav for Special Reports

- **Page(s):** `/updates/special/[slug]` (renderer `[slug]/page.tsx` l.217–252).
- **Problem:** 9 long sections, zero orientation. The renderer already assigns every section a stable `id={`section-${i}-heading`}` (l.230, l.238) — the anchors exist but nothing links to them. A reader cannot see the report's *argument structure* (Frame → cohort → failure modes → the corporate gap → comparability → forward view) before committing to a linear read, and cannot re-find a section. Comprehension cost: no map of a 3,000-word analytic argument; high re-orientation cost. The daily briefing solved exactly this with `BriefingJumpNav` (DailyBriefing.tsx l.199–263) — the long-form report is the *more* acute case and lacks it.
- **Proposed change (structure):** Render an ordered "In this briefing" list between Key Findings and the body, built from `bodySections` where `level <= 2` (skip the h3 sub-sections and the Sources entry), each linking to the existing `#section-i-heading`. Number them to mirror the source headings ("1. Frame", "2. The cohort"…). Pure derive-from-data; no schema change. (Sticky/scroll-spy behavior is a UX concern — hand off; a static anchored list delivers most of the value.)
- **Knowledge benefit:** Gives the reader the *shape of the argument* in 5 seconds (the inverted-pyramid map), enables depth self-selection and re-entry, and turns the report from a scroll into a navigable document. Improves retention by making the section sequence itself legible.
- **Independence check:** PASS — pure navigation over existing content; no framing change.
- Impact **4** · Strategic Alignment **4** · Learning Value **4** · Confidence **5** · Effort **2** · Risk **1** → **Priority = 14**

---

## Candidate 2 — Band-distribution strip: turn the cohort table into a picture

- **Page(s):** both Special Reports (§2 "The cohort"); reusable on `/updates` (backlog Wave G2 #6).
- **Problem:** The single most important framing fact of each report is a *distribution* — "176 Critical / 23 floor out of 1,156" (floor §2 table) and "64 Exemplary, 5.5% of the field" (exemplar §2 table) — currently delivered only as a 7-row numeric table. A reader cannot *see* that the field is bottom-heavy at the floor or that Exemplary is a thin 5.5% sliver; they must compute it from "176," "68," "52." The report even states the comprehension target in prose: "is 18.4 bad? compared to what?" (echoed in backlog #1). Tables are the wrong encoding for "how much of the field sits where."
- **Proposed change (visual + structure):** A horizontal 0–100 track segmented into the 5 band zones (Critical/Developing/Functional/Established/Exemplary), with stacked counts per band sourced from the index JSONs — the band-distribution bar from `GRAPHICS_BACKLOG` Wave G1 #1 / G2 #6. Place it directly above the §2 cohort table (chart for the gestalt, table for the exact numbers — co-located). On the floor report, shade the Critical+floor zone; on the exemplar report, shade the Exemplary zone. Implementation is hand-rolled SVG from own data (the proven `ScoreSparkline` pattern, l.133–206) — zero new deps, zero licensing risk.
- **Knowledge benefit:** Instant "compared to what?" — the reader *sees* 15.2% of the field is Critical and only 5.5% Exemplary, and sees the two reports as mirror images on one scale. This is the report's thesis made visible. Doubles as the "state of the field" social artifact.
- **Independence check:** PASS — fully reproducible from own scored data; the backlog explicitly classes this as *strengthening* independence (no image selection, no copyright surface).
- Impact **5** · Strategic Alignment **5** · Learning Value **5** · Confidence **4** · Effort **3** · Risk **2** → **Priority = 14**

---

## Candidate 3 — 8-dimension profile bar: render the vectors the reports already print as numbers

- **Page(s):** both Special Reports (floor §5 Turkey/UnitedHealth table; exemplar §"leaders and their profiles" table + §3 weakness ladder); reusable on entity pages.
- **Problem:** The intellectual core of *both* reports is a claim about the **shape** of a dimension vector — the floor's "all eight collapsed to the anchor `[1/1/1/1/1/1/1/1]`" (floor §2), Turkey vs. UnitedHealth "the number is shared, the meaning is not" (floor §5, an 8-column numeric row each), and the exemplar's "flat, high profile … smallest spread" with Open Bionics' perfect `4.5×8` (exemplar §"leaders"). These are *profile-shape* arguments delivered as rows of decimals. A reader cannot see that Turkey craters on BND/ACC/INT while UnitedHealth craters on ACC/EMP/EQU — the whole "different kind of failure" point — without manually diffing two number rows. This is precisely backlog Wave G1 #2 ("the shape of a score"), and the reports are its named prime use case.
- **Proposed change (visual):** An 8-bar mini-chart (one bar per dimension, colored from `DIMENSIONS[].color`, 1–5 scale) rendered inline where a vector is discussed: a Turkey/UnitedHealth *paired* profile in §5, the leaders' profiles in the exemplar §"leaders," and ideally the flat `4.5×8` exemplar vs. the collapsed `1×8` floor as a single side-by-side that makes the "same formula run in reverse" thesis visceral. Hand-rolled SVG from own data; sits in a `<details>` if density is a concern (backlog respects Wave E1). Since these vectors currently live *inside* `section.html` strings, the cleanest path is a small typed `profiles?: DimensionProfile[]` field on `BriefingSection` (types.ts) the generator can populate, rendered by the page alongside the HTML — a small, additive schema change.
- **Knowledge benefit:** Converts the reports' hardest-to-grasp claim (two scores, different meanings; flat vs. collapsed) into an at-a-glance picture. Teaches the dimension model by *showing* it. Highest learning-value visual because it carries the analytic thesis, not just the framing.
- **Independence check:** PASS — own data, evidence-first; bars are the literal scored values.
- Impact **5** · Strategic Alignment **4** · Learning Value **5** · Confidence **4** · Effort **3** · Risk **2** → **Priority = 13**

---

## Candidate 4 — "If you remember one thing" anchor per report

- **Page(s):** both Special Reports (header zone, `[slug]/page.tsx` after dek l.177).
- **Problem:** Each report *has* a one-sentence thesis buried in §1 Frame — floor: "the floor is a defensible, principled state — but the single 0–100 scale invites a cross-type severity read at the bottom that the methodology cannot actually support"; exemplar: "Exemplary is an integration achievement … not a peak score." But the reader only reaches it after the dek, scope, cohort line, 7 key findings, and the opening of §1. There is no single, unmissable retention anchor — the principle that the core principles call the "if you remember one thing." The dek (l.175) is descriptive ("This briefing examines…"), not the takeaway.
- **Proposed change (structure/content):** Add an optional `keystone` (or `oneThing`) string to `SpecialBriefing` (types.ts), rendered as a single emphasized callout immediately under the dek — the report's thesis in one sentence, distinct from the descriptive dek. Generator populates it from the §1 thesis sentence the reports already contain (no new analysis). One idea, nameable, front-loaded.
- **Knowledge benefit:** Guarantees the 5-second scanner leaves with *the* point, and gives every reader a single retention hook to repeat to someone else — the explicit north-star test in the role brief.
- **Independence check:** PASS — verbatim/condensed from the report's own thesis; evidence-first, not hype.
- Impact **4** · Strategic Alignment **4** · Learning Value **4** · Confidence **5** · Effort **2** · Risk **2** → **Priority = 13**

---

## Candidate 5 — Inline schema teaching: band scale + dimension legend

- **Page(s):** both Special Reports; reinforces `/updates`.
- **Problem:** The reports use "Critical band (≤ 20)," "0.0 floor," the 8 dimension codes, and the 1–5 anchor scale as if known. A newcomer meets "EQU 1.125, below GEO Group's uniform 1.5" (floor §4) or "INT 4.8, its single highest dimension" (exemplar §6) with **no on-page definition** of EQU, INT, or what 1.125 vs. 5 means. Every undefined code is a comprehension tax paid repeatedly. The definitions already exist (`dimensions.ts` `desc` for all 8; `BAND_DESCS` for all 5 bands) but are never surfaced on these pages.
- **Proposed change (structure):** A compact, collapsible "How to read this briefing" block (after the TOC, `<details>` so it costs ~0 height closed): (a) the 5 bands on a 0–100 strip with their composite ranges, (b) an 8-dimension legend — code, name, and the one-line `desc` from `dimensions.ts` — rendered as a shared component reused by *both* reports and linkable from `/updates`. Pure read from existing `DIMENSIONS` / `BAND_DESCS`.
- **Knowledge benefit:** A newcomer learns to *read* the benchmark without leaving the page; the dimension codes stop being opaque. Teach-once / reinforce-everywhere — and because it is one shared component, the schema is presented identically across reports and the daily briefing (cross-page coherence, so knowledge compounds).
- **Independence check:** PASS — surfaces the published methodology definitions verbatim.
- Impact **4** · Strategic Alignment **4** · Learning Value **4** · Confidence **5** · Effort **2** · Risk **1** → **Priority = 14**

---

## Candidate 6 — Make Key Findings legible as a comprehension rung (sub-deck + skim affordance)

- **Page(s):** both Special Reports (`KeyFinding` sub-component, `[slug]/page.tsx` l.454–483).
- **Problem:** Key Findings is the report's 30-second rung, but each of the 7 findings is a dense 2–4 sentence paragraph (e.g. floor finding #4 on UnitedHealth/Turkey runs ~50 words). The renderer splits only the leading `**bold head**` from the body (l.458–460) and prints the rest as one run-on span (l.475–478). A scanner reading just the 7 bold heads gets fragments ("A 10.2 and a 10.3 can mean entirely different things") without the payload, and reading fully is nearly as long as the body. The rung is there but doesn't function as a clean intermediate altitude.
- **Problem nuance / handoff:** Mostly a *content-shape* issue (findings authored long) plus a small render affordance. Structural fix is bounded.
- **Proposed change (structure):** (a) Have the generator keep each finding's bold head to a true ≤8-word claim and the body to one sentence (authoring rule, enforceable in the generator). (b) In `KeyFinding`, render the bold head as a scannable claim line and the body as a visually subordinate sub-line (already partially done via font weight l.473–477 — formalize the hierarchy so the 7 heads alone read as a coherent executive summary). Hand the exact type treatment to UX.
- **Knowledge benefit:** Restores the 30-second rung: the 7 heads alone become a real summary, with one-sentence support beneath. Sharper inverted pyramid; less re-reading.
- **Independence check:** PASS — compression of own findings, no framing shift.
- Impact **3** · Strategic Alignment **3** · Learning Value **3** · Confidence **4** · Effort **2** · Risk **2** → **Priority = 9**

---

## Candidate 7 — Cross-link the two companion reports (and teach they are a pair)

- **Page(s):** both Special Reports (footer nav l.255–302) + special index (`special/page.tsx`).
- **Problem:** The two reports are explicitly designed as inverse companions — the exemplar dek says so ("the inverse companion to the Floor & Critical briefing"; exemplar §1, §3, §5 repeatedly mirror the floor report). But on the page there is **no link from one to the other**: the footer (l.255–302) links only to "all special briefings" and "latest daily briefing." A reader who grasps "the floor is total collapse" never learns the symmetric "Exemplary is the same formula in reverse" unless they hunt the index. The strongest comprehension move — *seeing the top and bottom as one mechanism* — is left to chance.
- **Proposed change (structure):** A typed `companionSlug?: string` on `SpecialBriefing` (types.ts), rendered as a "Read the companion briefing" card in the footer with a one-line framing ("The mirror analysis: what *good* looks like"). Generator sets it for the pair. On the index page, group/visually pair companion briefings.
- **Knowledge benefit:** Delivers the meta-insight neither report can fully deliver alone — that the benchmark's top and bottom sit on one symmetric mechanic. Turns two artifacts into one mental model; strong retention via the mirror structure.
- **Independence check:** PASS — navigation between published analyses.
- Impact **3** · Strategic Alignment **4** · Learning Value **4** · Confidence **5** · Effort **2** · Risk **1** → **Priority = 13**

---

## Summary ranking

| # | Candidate | Page | Priority |
|---|-----------|------|----------|
| 1 | Section TOC / jump nav | Special Report | **14** |
| 2 | Band-distribution strip (chart) | Special Report (+/updates) | **14** |
| 5 | Inline schema teaching (band + dimension legend) | Special Report (+/updates) | **14** |
| 3 | 8-dimension profile bar (chart) | Special Report (+entity) | 13 |
| 4 | "If you remember one thing" anchor | Special Report | 13 |
| 7 | Companion-report cross-link | Special Report + index | 13 |
| 6 | Key Findings sub-deck/skim affordance | Special Report | 9 |

---

## If you fix one thing

**Build the band-distribution strip (Candidate 2) and place it directly above the §2 cohort table in both reports.** It is the single highest-comprehension-leverage change because it makes each report's *framing thesis* — "176 Critical / 23 at the floor out of 1,156" and "only 64 Exemplary, 5.5% of the field" — visible in one glance instead of reconstructed from a 7-row numeric table, it directly answers the reports' own stated question ("is 18.4 bad? compared to what?"), it reveals the two reports as mirror images on one scale, it reuses the proven hand-rolled-SVG `ScoreSparkline` pattern at zero licensing risk, and it *strengthens* independence because every pixel is reproducible from the benchmark's own scored data. If TOC (C1) and the schema legend (C5) are cheap wins, this is the one that converts the reports' core numbers into instant understanding.
