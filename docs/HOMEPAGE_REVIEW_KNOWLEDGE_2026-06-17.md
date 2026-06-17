# Home Page — Knowledge-Acquisition Review (2026-06-17)

**Reviewer lens:** Knowledge Architect — what a first-time visitor *learns and retains*.
**Surface:** `site/src/app/page.tsx` and the components it renders.
**Three goals scored:** (G1) knowledge acquisition · (G2) understanding the methodology · (G3) discovering/viewing the daily briefing.
**Scope:** review only. No code modified.

---

## TL;DR — the single highest-leverage move

**The home teaches *what* is measured (8 dimensions, by name) but never teaches *what the words mean* or *how to read a score/band* — and the one place the schema is explained best (`ScoreLegend`, "How to read the scores") is not on the home page at all.** A first-timer who scans the hero, sees a stacked "Critical / Developing / Functional / Established / Exemplary" bar, and reads "67.7% cluster in the middle bands" has no way, without leaving the page, to learn what "Critical" means, what 0–100 maps to, or what "institutional compassion" even is beyond the abstract verb string "recognize, respond to, and reduce suffering." **Drop the existing `ScoreLegend` component (it already exists, is server-rendered, crawlable, and canonical) immediately under the master BandDistributionBar.** This is the lowest-effort, highest-learning change on the page: it converts the most-looked-at chart on the home from a pretty graphic into a teaching moment, and it does so by *reusing* a primitive that is already the single source of truth for bands and dimensions.

---

## The comprehension ladder — how the current home performs

**5 seconds (the scan).** A scanner gets: a clear H1 ("Benchmarking how institutions recognize, respond to, and reduce suffering"), four big stats (1,155 / 7 / 8 / 40), and a publication table. *Verdict: the WHAT-is-this is reasonably unmissable.* What is NOT unmissable: that this is *living, daily* research (the briefing sits ~5 sections down) and what a "score" actually is.

**30 seconds (the skim).** The reader hits the flagship-report callout ("modal result is mediocrity — 67.7% cluster in the middle bands, 90.5% equity gap") and the master band bar. These are strong retention hooks (concrete numbers, a memorable claim). But the band names are introduced *as data labels before they are defined as concepts* — the reader meets "Critical" as a colored segment, not as a meaning. Jargon debt starts accruing here.

**3 minutes (the read).** "How the benchmark works" (line 360) finally names the 8 dimensions in bold and states "0–100 scale" + the integration-premium sentence. This is the page's real teaching block — but it is **buried at position ~9 of 12 sections**, below services-adjacent content, and it lists dimension *names* with zero gloss. A reader who wants to know what "Boundaries" or "Systems Thinking" means as a compassion dimension must go to `/methodology`.

**Deep (the click-through).** The methodology on-ramp exists (hero button line 68, panel button line 379) but there is **no teaser of the framework's logic on the home** — no anchor definitions, no example of how an entity scores, no "what makes this hard to fake." The promise in the hero ("difficult to fake") is never substantiated on-page.

**Net:** The ladder has rungs, but two are in the wrong order (data before definitions) and the richest teaching rung (`ScoreLegend`) is missing entirely.

---

## What a newcomer does NOT learn without leaving the page

1. **What "institutional compassion" means** beyond a three-verb slogan. There is no one-sentence definition of the *construct* anywhere on the home. (G1)
2. **How to read a score.** "0–100 scale" appears once (line 376); the 5 bands appear as chart labels but their *meanings* (`BANDS[].desc` in `dimensions.ts`) never appear on the home. (G1, G2)
3. **What the 8 dimensions mean.** Named in bold (lines 366–373) but unglossed. The `DIMENSION_MEANINGS` 6-word glosses already exist in `DimensionLegend.tsx` and are not used here. (G1, G2)
4. **Why it's "difficult to fake."** The hero claims it (line 62); nothing on the page shows the anchor-based 1–5 scoring or the integration premium's anti-gaming logic in a way a newcomer grasps. (G2)
5. **That the research is alive and daily.** The "Today's research" section exists but is positioned late, and on a zero-change day (like today's `latest.json`) it collapses to a single highlight with no score-change cards — see Finding 4. (G3)

---

## Jargon / acronym debt inventory (grounded in current copy)

| Term on home | Where | Defined on home? | Cost |
|---|---|---|---|
| "institutional compassion framework" | hero, line 59 | No | Core construct undefined |
| Critical / Developing / Functional / Established / Exemplary | band bars (BandDistributionBar legend) | Range only ("0–20") via SVG legend; **no meaning** | Reader sees colors, not concepts |
| 8 dimension names (Awareness…Integrity) | line 366 | Names only, no gloss | Each is a mini-construct |
| "integration premium" (INTEGRATION_PREMIUM.short) | line 377 | Sentence present but dense | Good content, hidden in section 9 |
| "90.5% equity gap" | flagship callout, line 138 | No | Striking but unexplained stat |
| "modal result is mediocrity" | line 137 | No | "modal" is statistics jargon |
| "score change" / "X assessed" / "entities scanned" | live-research header, line 215 | No | Pipeline vocabulary unexplained |

---

## Findings & ranked improvements

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk. All 1–5.

---

### 1. Drop `ScoreLegend` directly under the master band bar
**Goals:** G1, G2
**Page/line:** `page.tsx` S3.1 master-bar section (lines 154–166), immediately after `<BandDistributionBar index="all" />`.
**Problem:** The most-viewed graphic on the home labels five bands the reader has never been taught. `ScoreLegend` (`components/charts/ScoreLegend.tsx`) already renders the canonical `BANDS[].desc` ("Critical — foundational compassion practices are absent or documented active harm is present") AND the 8-dimension glossary from `dimensions.ts`, closed-by-default, server-rendered, crawlable. It is *built for exactly this* and is not on the home. Comprehension cost: the reader cannot decode the chart they are looking at without leaving the page.
**Proposed change:** Render `<ScoreLegend />` (collapsed `<details>`, "How to read the scores") immediately below the master `BandDistributionBar`. Optionally open-by-default on the home given it's a first-time audience.
**Knowledge benefit:** Reader learns the band schema and dimension meanings *at the exact moment the chart prompts the question*, co-located, zero navigation. Teaches the schema once where it pays off everywhere.
**Independence check:** PASS (definitions are evidence-first; `ScoreLegend` already carries the "never pay" line).
**Impact 5 · Strategic 5 · Learning 5 · Confidence 5 · Effort 1 · Risk 1 → Priority = 18**

---

### 2. Add a one-sentence definition of "institutional compassion" in/under the hero
**Goals:** G1, G2
**Page/line:** Hero subhead, `page.tsx` lines 56–63.
**Problem:** The construct the entire site measures is never defined — only gestured at via "recognize, respond to, and reduce suffering." A first-timer cannot explain to someone else *what is being scored*. The 8 dimensions in `dimensions.ts` collectively answer this, but the home offers no synthesis sentence.
**Proposed change:** Add a single definitional line, e.g.: *"Institutional compassion = whether an organization detects suffering, responds effectively, distributes care fairly, and owns its failures — measured on public evidence, not press releases."* Keep it to one sentence under the existing subhead.
**Knowledge benefit:** Gives the reader a portable, repeatable definition (the "explain it to someone else" test). Anchors every band/dimension that follows.
**Independence check:** PASS (evidence-first framing; "not press releases" reinforces independence).
**Impact 5 · Strategic 4 · Learning 5 · Confidence 4 · Effort 1 · Risk 1 → Priority = 16**

---

### 3. Gloss the 8 dimensions where they are named (reuse `DimensionLegend` / `DIMENSION_MEANINGS`)
**Goals:** G1, G2
**Page/line:** "How the benchmark works" panel, `page.tsx` lines 364–374.
**Problem:** Dimensions are listed as bold names with no meaning. The 6-word glosses already exist (`DimensionLegend.tsx` → `DIMENSION_MEANINGS`: "AWR — Detects suffering before it's named," etc.) and are used above ranking tables but not here. A name like "Boundaries" or "Integrity" carries no information to a newcomer without its gloss.
**Proposed change:** Replace the bold name string with the `DimensionLegend` strip (color-coded `<abbr>` codes + names + hover tooltips), or render the 8 as a compact name + 6-word-gloss list. Reuse, don't re-author.
**Knowledge benefit:** Each dimension becomes a graspable idea, not a label. Consistent color coding compounds recognition across the master bar, small-multiples, and methodology page.
**Independence check:** PASS.
**Impact 4 · Strategic 4 · Learning 5 · Confidence 5 · Effort 2 · Risk 1 → Priority = 15**

---

### 4. Make "Today's research" survive a zero-change day (it currently nearly disappears)
**Goals:** G3
**Page/line:** Live-research section, `page.tsx` lines 202–276; data `updates/latest.json`.
**Problem:** The section is gated on `scoreChangesArr.length > 0 || highlightsArr.length > 0`. Today's `latest.json` has **no `scoreChanges` array** (`pipeline.scoreChanges: 0`) and the schema moved to `topSignals`/`recentAssessments`. Result: the two score-change cards (lines 226–263) render nothing; the section collapses to a single derived highlight + the header stat line ("1,160 scanned · 19 assessed · 0 changes"). On a "quiet, high-severity confirmation cycle" the living-research story — Meta jury verdict, Iran executions, DRC Ebola, the adjudication-vs-allegation teaching moment — is *invisible on the home*, which is precisely when the briefing is most interesting. This is the single biggest gap for G3.
**Proposed change:** When `scoreChangesArr` is empty, fall back to rendering 2–3 `recentAssessments` or `topSignals` as "confirmed at" cards (showing entity, index, band, and `whyHeadline`), and surface the `methodologyNotes`/`dailyOpeningQuestion` as the teaching hook. Reframe the header from "score changes" to "entities assessed today" so a zero-change day still reads as substantive work, not a dead feed.
**Knowledge benefit:** Reader learns the benchmark is *alive and rigorous every day* — including the high-value lesson that "verdict ≠ allegation, neither always moves a score." Turns the home's weakest G3 moment into its strongest.
**Independence check:** PASS (confirmations and "no change" outcomes are the most independence-credible thing the feed can show).
**Impact 5 · Strategic 4 · Learning 4 · Confidence 3 · Effort 3 · Risk 2 → Priority = 11**

---

### 5. Promote the daily briefing higher and label it "daily"
**Goals:** G3
**Page/line:** Live-research section starts at line 202 — after hero, flagship callout, master bar, AND the 7 small-multiples. The newsletter (line 279) promises "scored every day" but the *daily briefing artifact* sits below all the static charts.
**Problem:** A first-timer must scroll past ~4 sections before discovering the research is daily and ongoing. The "living wire" is buried beneath the "state of the field" snapshot. Order communicates priority; right now the page reads as a static report with a news feed bolted on.
**Proposed change:** Either (a) move the "Today's research" section directly under the flagship callout / above or beside the master bar, or (b) add a thin "Updated daily — latest briefing {date} →" ribbon in/under the hero linking to `/updates`. Add the word "daily" to the section eyebrow ("Latest evidence · {date}" → "Daily briefing · {date}").
**Knowledge benefit:** Reader retains "this is updated every day" — the core differentiator from a one-off report. Improves the briefing-discovery goal directly.
**Independence check:** PASS.
**Impact 4 · Strategic 4 · Learning 3 · Confidence 4 · Effort 2 · Risk 2 → Priority = 11**

---

### 6. Explain the flagship callout's stats so they teach, not just impress
**Goals:** G1
**Page/line:** Flagship callout, `page.tsx` lines 136–140.
**Problem:** "modal result is mediocrity — 67.7% cluster in the middle bands, 90.5% equity gap" is a great retention hook but uses jargon ("modal") and an undefined metric ("equity gap"). The reader feels the weight without understanding it. The very next section (master bar) visually *shows* the clustering — but the callout doesn't connect the two.
**Proposed change:** Lightly de-jargon: "most institutions score in the middle — 67.7% land in the Functional or Developing bands" and add a 4–6 word gloss for the equity-gap figure ("the gap between top and bottom performers"). Optionally cross-link the callout stat to the master bar anchor (`#state-of-field`) so the claim and its evidence are one click apart.
**Knowledge benefit:** Converts a slogan into an understood finding the reader can repeat accurately. Reinforces band vocabulary in plain language.
**Independence check:** PASS (more precise, less rhetorical — strengthens evidence-first tone).
**Impact 3 · Strategic 3 · Learning 4 · Confidence 4 · Effort 1 · Risk 1 → Priority = 12**

---

### 7. Add a "how an entity is scored" micro-teaser as the methodology on-ramp
**Goals:** G2
**Page/line:** "How the benchmark works" panel, lines 360–382 — currently states the scale and links out, but shows nothing of the *mechanism*.
**Problem:** The hero promises "difficult to fake" (line 62); the home never demonstrates the anchor-based logic that earns that claim. The richest teaching content (5-point anchors per subdimension in `dimensions.ts`; the integration-premium anti-gaming rule) exists but is invisible. The methodology link is a leap of faith, not a primed click.
**Proposed change:** Add a compact 3-step visual or one concrete anchor example to the "How it works" panel — e.g. show one subdimension's 1→5 anchor ladder (A1 Suffering Detection: "discovered only through crises" → "disaggregated data, independently audited"), then the integration-premium line. Keep `INTEGRATION_PREMIUM.short` but pair it with `.detail` behind a `<details>`.
**Knowledge benefit:** Reader *sees* why the benchmark resists gaming (concrete-before-abstract), making the "difficult to fake" claim credible and the methodology click a confirmation rather than a gamble.
**Independence check:** PASS (showing the scoring rubric is maximally transparent).
**Impact 4 · Strategic 4 · Learning 4 · Confidence 3 · Effort 3 · Risk 1 → Priority = 11**

---

### 8. Resolve the entity-count inconsistency (1,155 vs 1,156 vs 1,160)
**Goals:** G1
**Page/line:** Hero stat "1,155" (line 72); master-bar dek "1,155" (line 160); flagship callout "1,156 institutions" (line 137); newsletter inline "~1,160" (NewsletterSignup line 242); `latest.json` `entitiesScanned: 1160`; CLAUDE.md says "1,160 entities."
**Problem:** Four different totals on one page. A precise-number benchmark that can't state its own N consistently undercuts the credibility it sells. Comprehension cost is low per instance but the *trust* cost compounds across a single scroll.
**Proposed change:** Pick one canonical total (likely 1,160 per `latest.json`/CLAUDE.md), source it from one constant, and use it everywhere. Where "447 published Fortune 500" vs "500" differs, state the published count consistently.
**Knowledge benefit:** Reinforces the benchmark's core value prop — rigor. A reader who notices the inconsistency discounts every other number on the page.
**Independence check:** PASS.
**Impact 3 · Strategic 4 · Learning 2 · Confidence 5 · Effort 2 · Risk 1 → Priority = 11**

---

### 9. Give the 7 small-multiples a one-line "how to read" and a takeaway-per-strip
**Goals:** G1
**Page/line:** "Seven indexes at a glance," lines 169–199.
**Problem:** The section description explains the *sort logic* ("sorted by share in the top two bands") but the strips themselves repeat the band legend 7 times (every `BandDistributionBar` renders its own legend) — high redundant ink, and no single nameable takeaway per index. The reader sees seven bars but isn't told what to conclude ("Robotics leads; U.S. States lag"). One idea per unit is violated: each card carries data but no point.
**Proposed change:** Suppress the per-strip legend (rely on the master bar's legend / `ScoreLegend` above), and add a 4–6 word verdict per card ("Strongest field" / "In crisis") or a single leading sentence above the grid naming the winner and the laggard. This depends on Finding 1 supplying the shared legend.
**Knowledge benefit:** Reader leaves with a retainable ranking of domains, not just seven graphics. Cuts extraneous load (repeated legends) and adds germane load (the comparative point).
**Independence check:** PASS (comparative facts, neutrally framed).
**Impact 3 · Strategic 3 · Learning 3 · Confidence 4 · Effort 2 · Risk 1 → Priority = 10**

---

### 10. Define the pipeline vocabulary in the live-research header
**Goals:** G3
**Page/line:** Stat line "1,160 entities scanned · 19 assessed · 0 score changes," line 215.
**Problem:** "scanned vs assessed vs changes" is internal pipeline vocabulary. A newcomer cannot tell whether "0 score changes" means "nothing happened" (boring) or "we rigorously confirmed 19 entities held their scores" (rigorous). Today's briefing is explicitly the latter — but the home stat reads as the former.
**Proposed change:** Add a 4–8 word inline gloss or tooltip: "assessed = deeply reviewed today; 0 changes = scores held after review." Or relabel to "19 entities reviewed today · scores confirmed."
**Knowledge benefit:** Reader interprets a quiet day correctly — as evidence of discipline, not inactivity. Supports the same teaching as Finding 4.
**Independence check:** PASS.
**Impact 3 · Strategic 3 · Learning 3 · Confidence 4 · Effort 1 · Risk 1 → Priority = 11**

---

## Priority-ordered summary

| # | Move | Goals | Priority |
|---|---|---|---|
| 1 | Drop `ScoreLegend` under the master band bar | G1, G2 | **18** |
| 2 | One-sentence "institutional compassion" definition in hero | G1, G2 | 16 |
| 3 | Gloss the 8 dimensions (reuse `DimensionLegend`) | G1, G2 | 15 |
| 6 | De-jargon + connect the flagship callout stats | G1 | 12 |
| 4 | Make "Today's research" survive a zero-change day | G3 | 11 |
| 5 | Promote + label the briefing as "daily" | G3 | 11 |
| 7 | "How an entity is scored" methodology micro-teaser | G2 | 11 |
| 8 | Fix the 1,155/1,156/1,160 entity-count inconsistency | G1 | 11 |
| 10 | Define pipeline vocabulary (scanned/assessed/changes) | G3 | 11 |
| 9 | One-line "how to read" + takeaway per small-multiple | G1 | 10 |

---

## If you fix one thing

**Finding 1 — render the existing `ScoreLegend` directly beneath the master `BandDistributionBar`.** It is a one-component insert of an already-canonical, already-server-rendered teaching primitive, placed at the exact moment the page makes the reader wonder "what does Critical/Developing mean?" It single-handedly closes the largest comprehension gap (you can't read the chart you're shown), teaches both the band schema and the 8 dimensions, and does so with near-zero effort and risk. Pair it with Finding 2 (the one-sentence definition) and the home goes from "shows institutional compassion" to "teaches institutional compassion."

---

## Relevant files

- `C:\Users\philk\applied-compassion-benchmark\site\src\app\page.tsx` — the home page under review
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\ScoreLegend.tsx` — the unused teaching primitive (Finding 1)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\index\DimensionLegend.tsx` — `DIMENSION_MEANINGS` glosses to reuse (Finding 3)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\BandDistributionBar.tsx` — master + small-multiple bars (Findings 1, 9)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\ChartFrame.tsx` — the chart wrapper used by S3.1
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\dimensions.ts` — canonical `BANDS`, `DIMENSIONS`, `INTEGRATION_PREMIUM` (Findings 1, 2, 3, 7)
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\updates\latest.json` — current briefing; no `scoreChanges` array (Findings 4, 10)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\ui\NewsletterSignup.tsx` — briefing/newsletter on-ramp copy (Findings 5, 8)
