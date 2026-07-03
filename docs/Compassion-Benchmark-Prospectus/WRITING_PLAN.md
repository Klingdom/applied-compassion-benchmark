# WRITING_PLAN.md
# Master Writing Plan — Compassion Benchmark Funder Prospectus

**Status:** Authoritative integration of four specialist plans.
**Working folder (canonical):** `docs/Compassion-Benchmark-Prospectus/`
**Manuscript target:** 25,000–35,000 words (~33,830 budgeted); 30 chapters + 6 front-matter items + 6 appendices.
**Specialist plans integrated:** `plan/01-production-plan.md`, `plan/02-narrative-strategy.md`, `plan/03-comprehension-plan.md`, `plan/04-graphics-layout-plan.md`.

---

## EXECUTIVE SUMMARY

**Throughline sentence.** Compassion at institutional scale is not sentiment: it is a pattern of decisions, and those decisions are observable, scorable, and subject to public accountability — the question this prospectus answers is whether care survives process, pressure, scale, incentives, automation, and time, and whether public measurement of that survival changes the institutional calculus.

**Production model.** Spine-first, then batched-parallel. A single senior writing agent locks the five structural anchors (Founder Letter, Executive Summary draft, Ch 1, Ch 22, Ch 30) before any other work begins. All other batches run in dependency order; Batches 5a (Applications) and 5b (Public Benefit) run in parallel. Each batch passes through a four-stage editorial sequence (developmental rewrite, human voice, funder readiness, evidence and claims) before any chapter enters assembly. Batch 0, run before all prose, locks the three load-bearing appendices and produces the style-lock reference every subsequent agent reads before writing.

**Comprehension discipline.** One worked example per mechanism. Twelve scoring and methodology concepts are introduced in strict progressive-disclosure sequence across Parts I–III; each is taught with exactly one device (pyramid, two-lane diagram, worked table, vignette, color wheel, etc.). Two running illustrative institutions thread through the explanation chapters: a composite fictional AI lab for mechanism examples, and the documented UHG 10.2 Critical score for the real worked case. No invented number may appear without an explicit "illustrative" flag; every fact traces to `source_notes.md`.

**Visual system in one line.** Dark-navy cover with brand arc + 5-band hairline; eight-dimension icon system (2px line marks in `dimensions.ts` colors); seven hero graphics (H1–H7) as hand-rolled SVGs; forensic-gravity design language — no photography, no decorative color, no chartjunk; MD→HTML→PDF for internal review, designer-set Affinity Publisher for the flagship final.

**Headline execution order.** Batch 0 (reference lock) → Batch 1 (spine, single author) → Batch 2 (FM + Part I) → Batch 3 (Part II, depends on Batch 0) → Batch 4 (Part III) → Batches 5a and 5b in parallel (Applications + Public Benefit) → Batch 6 (Part VI) → Batch 7 (remaining appendices) → Layout pass → Assembly + FM-5 revision → QC (quality gates) → Funder summary. Estimated 16–21 agent sessions total.

---

## SECTION 1 — PRODUCTION AND SEQUENCING

**Primary reference:** `plan/01-production-plan.md`

### 1.1 Batch Overview

| Batch | Content | Word budget | Agent type | Can start when |
|---|---|---|---|---|
| 0 | App A (8 dims/40 subdims), App B (evidence hierarchy), App C (assessment lifecycle), `style-lock.md`, `chapter-index.md` upgrade (see §4.2) | ~2,100 + index upgrade | Research/data agent | Immediately |
| 1 | FM-4 Founder Letter, FM-5 Exec Summary (first draft), Ch 1, Ch 22, Ch 30 | ~4,350 | Senior writing agent | After Batch 0 (`style-lock.md` must exist first) |
| 2 | FM-1 through FM-3, FM-6, Ch 2, 3, 4 | ~3,430 | Writing agent | After Batch 1 |
| 3 | Ch 5–9 (Part II: The Standard) | ~4,700 | Writing agent + close read of Batch 0 output | After Batch 1 AND Batch 0 locked |
| 4 | Ch 10–13 (Part III: Research Foundation) | ~3,450 | Writing agent | After Batch 3 |
| 5a | Ch 14–18 (Part IV: Applications) | ~4,100 | Writing agent | After Batch 4 |
| 5b | Ch 19, 20, 21, 23 (Part V: Public Benefit; Ch 22 already done) | ~3,250 | Writing agent | After Batch 4 (parallel with 5a) |
| 6 | Ch 24–29 (Part VI: Building the Institution; Ch 30 already done) | ~6,250 | Writing agent + close read of source_notes §5, §7–10 | After Batches 5a and 5b |
| 7 | App D, E, F; minor revisions to App A, B, C | ~2,200 | Writing agent / research agent | After Batch 6 enters editorial passes |
| Layout | Layout notes and graphics plan for all chapters | — | Layout agent | After all batches in editorial passes |
| Assembly | Full manuscript; FM-5 revised | — | Coordinator | After layout pass |
| QC | Quality gates; claims resolution | — | QA agent | After assembly |
| Funder summary | `funder-summary.md` (3–5 pages) | ~1,500 | Coordinator / writing agent | After QC passes |

### 1.2 Dependency Graph

```
Batch 0: App A + App B + App C + style-lock.md + chapter-index upgrade
    |
Batch 1: Spine (FM-4, FM-5 draft, Ch 1, Ch 22, Ch 30) [CRITICAL PATH]
    |
    +--- Batch 2: FM remainder + Part I (Ch 2–4)
    |
    +--- Batch 3: Part II (Ch 5–9) [requires Batch 0]
              |
              Batch 4: Part III (Ch 10–13)
                   |
                   +--- Batch 5a: Part IV (Ch 14–18) ----+
                   |                                      |
                   +--- Batch 5b: Part V (Ch 19,20,21,23)|
                                                          |
                             Batch 6: Part VI (Ch 24–29) -+
                                  |
                             Batch 7: App D, E, F
                                  |
                          Layout → Assembly → QC → Funder Summary
```

**Absolute critical-path constraints:**
1. Batch 0 must be complete before Batch 3 begins. Chapters 5–9 cite dimension codes, evidence tiers, and assessment lifecycle steps that are locked in App A–C; cascade corrections after drafting multiply.
2. Batch 1 (spine) must be complete before any prose batch begins. All subsequent authors read FM-5 as their north star and derive voice from `style-lock.md`.
3. FM-5 is revised last, after assembly, to reflect the actual manuscript rather than the first-draft argument sketch.
4. The claims pass (Stage 5) is always a separate focused session, never collapsed into the editorial pass. Legal accuracy and tense discipline cannot share context with prose revision.

### 1.3 Editorial Pass Sequence Per Batch

Each batch passes through the following stages before its chapters enter assembly:

| Stage | What it does | Agent | Collapsible |
|---|---|---|---|
| 1. Draft | Produces chapter files in `manuscript/` | Writing agent | No |
| 2. Developmental rewrite | Structural issues; cuts; does the chapter need to exist? | Developmental editor agent | Stages 2–4 can collapse into one session per batch if token budget allows |
| 3. Human voice pass | Removes AI cadence; varies rhythm; eliminates banned patterns | Voice agent | See above |
| 4. Funder readiness pass | Funder questions embedded in argument; no grant language bolted on | Funder agent | See above |
| 5. Evidence and claims pass | Appends to `claims-to-verify.md`; flags unsupported claims, [PLANNED] stated as current | Claims agent | Always separate |
| 6. Layout pass | Appends to `layout-notes.md` and `graphics-plan.md`; confirms one visual per chapter | Layout agent | Runs as a batch after all chapter drafts are in |
| 7. Assembly | Produces `compassion-benchmark-funder-prospectus.md`; revises FM-5 | Coordinator | Once, after all layout passes |
| 8. QC | Quality gates pass/fail report; revisions or PASS certification | QA agent | Once, after assembly |
| 9. Funder summary | `funder-summary.md` | Coordinator | After QC |

### 1.4 Output File Map

All files live under `docs/Compassion-Benchmark-Prospectus/` (canonical working folder — see §4.3 for stale-copy declaration).

| File | Path | Status |
|---|---|---|
| `source_notes.md` | root | Exists |
| `chapter-index.md` | root | Exists but requires column upgrade (Batch 0 prerequisite) |
| `style-lock.md` | root | Produce in Batch 0 |
| `claims-to-verify.md` | root | Produce during Stage 5 passes |
| `graphics-plan.md` | root | Produce during Stage 6 passes |
| `layout-notes.md` | root | Produce during Stage 6 passes |
| `compassion-benchmark-funder-prospectus.md` | root | Produce in Assembly |
| `funder-summary.md` | root | Produce post-QC |
| Draft chapter files | `manuscript/front-matter/fm-01.md` – `fm-06.md` | Batches 1–2 |
| Draft chapter files | `manuscript/part-1/ch-01.md` – `ch-04.md` | Batches 1–2 |
| Draft chapter files | `manuscript/part-2/` – `manuscript/part-6/` | Batches 3–6 |
| Draft appendix files | `manuscript/appendices/app-a.md` – `app-f.md` | Batches 0 and 7 |

---

## SECTION 2 — NARRATIVE AND VOICE

**Primary reference:** `plan/02-narrative-strategy.md`

### 2.1 The Throughline Across Six Parts

The manuscript is structured as a chain of questions. Each Part inherits a question from the previous one and answers it, passing the reader to the next.

| Part | The question it answers | Throughline beat |
|---|---|---|
| I (Ch 1–4) | Is this a real gap? | The measurement vacuum is structural, not rhetorical. Every domain of institutional performance now has external accountability infrastructure except this one. |
| II (Ch 5–9) | Can it be measured? | Compassion is measurable because it is observable. The eight dimensions are not abstract virtues — they are the behavioral residue of institutional decisions. |
| III (Ch 10–13) | Is the measurement credible? | By the end of Part III the reader must understand exactly why a score of 3 is different from a score of 4 and what evidence distinguishes them. The credibility turn: from "interesting idea" to "defensible." |
| IV (Ch 14–18) | Does it find anything meaningful? | Not "healthcare" but UHG at 10.2; not "AI" but 50 labs with scores and bands. Specificity makes the gap visible sector by sector. |
| V (Ch 19–23) | Does it change anything? | Public measurement changes behavior not by shaming institutions but by creating a shared reference point — a Lingua Franca for journalists, investors, policymakers, communities. |
| VI (Ch 24–30) | Can this institution actually do it? | What has been built, how independence is engineered into the architecture, what philanthropic capital unlocks. Funding is the logical conclusion because credibility has been established on its own terms. |

### 2.2 Voice Playbook

Three approved opening moves for chapters — use deliberately, not by default:

**Scene at a specific decision.** Drop the reader into a documented institutional moment without explaining it. The scene earns its resolution; the reader discovers the argument.

**Anomaly.** Open with a contradiction the reader has not framed as one before: that we have rigorous public standards for financial integrity, food safety, AI benchmark performance, and none for whether the institution on the other side of those systems recognizes that you are in distress.

**Concrete number or verdict without context.** "UnitedHealth Group scores 10.2 out of 100." One sentence of silence before explaining what 10.2 means. Specificity creates curiosity faster than setup.

**Sentence rhythm rule.** Vary pressure. Some paragraphs develop one idea across five or six sentences toward a conclusion that could not be stated at the start. Others move in three. The rhythm tells the reader when to hold an idea and when to let it land.

**Specificity rule.** One precise example beats three generic ones. Name scores, name institutions, name the subdimension. Then stop. Do not explain what the reader can already infer.

**Transition rule.** End a section on a question the next section answers, or on a fact that only makes sense once the reader understands what follows. Empty transitions ("this brings us to") are banned.

**Tells to delete (full list in `plan/02-narrative-strategy.md` §2, `02-editorial-style-guide.md`, and `prompts/eliminate-ai-slop.md`):**
- Any sentence ending with a slogan
- "Not X, but Y" used more than once per chapter
- Three consecutive paragraphs of equal length
- "This highlights" / "this underscores" / "taken together" / "ultimately"
- Generic praise framing
- False profundity after a data point
- Any paragraph that could appear in a different institution's report unchanged

### 2.3 Funder Persuasion Arc

The document must answer six funder questions without turning chapters into grant pitches.

| Funder question | Where it lands | How it arrives |
|---|---|---|
| Why this? | Part I (Ch 1–4) + Part III (Ch 10–13) | Through the measurement vacuum and intellectual grounding, not a stated need |
| Why now? | Part IV Ch 14 (AI/robotics) | The highest-stakes application is the case for timing; let the sector speak |
| Why us? | Part VI Ch 24–26 | Evidence of what exists, not self-assessment of capability |
| Why philanthropy? | Part VI Ch 28 | Structural argument: early infrastructure, independence at risk if earned revenue dominates too early, open methodology as public good |
| What changes if funded? | Part V Ch 22 + Part VI Ch 30 | Causal chain, stated assumptions, honest forward-looking framing |
| How is independence protected? | Part II Ch 7–8 + Part VI Ch 26 | Architecture first, governance second — engineering before policy |

### 2.4 Engagement Points by Part

One well-chosen device per chapter. Full detail in `plan/02-narrative-strategy.md` §4.

- **Part I:** Comparison table (Ch 4) showing existing indices vs. Compassion Benchmark on independence, breadth, openness. Ch 1 opens with a scenario, not a stat.
- **Part II:** The annotated anchor example (Ch 8) — one subdimension at all five levels with real evidence types — is the single most important device in the document.
- **Part III:** "Before and after pressure test" case in Ch 13: an institution that would have scored Established under favorable evidence and scored Developing once a costly case was applied.
- **Part IV:** Named entity cards with actual scores — UHG 10.2 Critical and one AI lab card — used explicitly, not as sidebars.
- **Part V:** "What changes if this succeeds" paragraph closes each chapter. Not aspirational; causal. Short and specific.
- **Part VI:** The "built vs planned" status board (Ch 24) is a credibility device, not a progress report. Overstating this is the single most damaging move the document can make with a sophisticated funder.

### 2.5 Founder Letter Requirements

The letter requires founder input before any draft is written. It has four movements: (1) a specific moment that made the problem concrete, (2) the decision to build rather than write, (3) honest acknowledgment of what the work cannot yet claim, (4) the ask, simply stated. 500–600 words. At least one concrete score number. First person throughout.

**Phil must supply** (see §6 Decisions Needed): the origin moment, the hardest design decision and why, the honest ten-year-success statement, one or two moments of doubt, and a sentence about what the work cannot yet prove. Do not draft the founder letter from generic material.

### 2.6 Pull-Quote Bank

Twelve candidate lines in house voice; no em dashes. Full list in `plan/02-narrative-strategy.md` §6. Six designated for Part divider pages (from `plan/04-graphics-layout-plan.md` §4):

| Part divider | Pull quote |
|---|---|
| I | "Mission statements are not evidence." |
| II | "At institutional scale, compassion is not a feeling. It is a pattern of decisions." |
| III | "High performance when it is easy is not evidence of institutional character." |
| IV | "The question is whether care survives process, pressure, scale, incentives, and time." |
| V | "A score only matters if it becomes a shared language." |
| VI | "Independence locked, not promised." |

---

## SECTION 3 — COMPREHENSION AND TEACHING

**Primary reference:** `plan/03-comprehension-plan.md`

### 3.1 Progressive Disclosure Sequence

Twelve concepts are introduced in strict order across Parts I–III. The cognitive-load rule: never introduce two new machinery concepts in the same chapter.

| Rung | Concept | Foreshadowed | Taught in full | Reference home |
|---|---|---|---|---|
| 0 | Compassion = observable behavior, not sentiment | Ch 1–2 | Ch 5 | — |
| 1 | Recognize → respond → reduce spine | Ch 3 | Ch 5 | — |
| 2 | 8 dimensions | Exec Summary (at-a-glance) | Ch 6 | Appendix A |
| 3 | 40 subdimensions (zoom level under a dimension) | — | Ch 6 (sampled), Ch 11 (one anchored in full) | Appendix A (all 40) |
| 4 | Evidence hierarchy (5 tiers) + "evidence beats aspiration" | Ch 2 | Ch 7 | Appendix B |
| 5 | 0–5 behavioral anchors | — | Ch 8 (intro), Ch 11 (worked anchor) | Appendix B |
| 6 | 0–100 composite (base formula, v1.2) | Exec Summary band-colored score | Ch 8 | Appendix C |
| 7 | Integration premium (+10) | — | Ch 8 | Appendix C |
| 8 | Five bands (Critical→Exemplary) | Exec Summary leaderboard color | Ch 8 | Appendix A/B |
| 9 | Score → improvement / reversibility | — | Ch 9 | — |
| 10 | Pressure test + maturity gate (cap at Developing) | Ch 4 hints "capturable indices" | Ch 13 | Appendix C |
| 11 | Automated pipeline vs certified Human Battery | — | Ch 8 (named), Ch 25 (full) | Appendix C |
| 12 | Attribution/subject rule, floor designation, near-floor | — | Ch 13 (lightly), Ch 15 (UHG example) | methodology appendix |

**Main text vs appendix rule:** main text teaches one worked instance of each mechanism and the reader-takeaway. The exhaustive lists (all 40 subdimensions, all 5 tiers with sources, the full lifecycle swimlane, premium multipliers) live in Appendices A–C. If a paragraph begins enumerating more than three list items, it belongs in an appendix with a pointer.

### 3.2 Teaching Device Per Concept

One device per concept. The chapter must land the takeaway sentence verbatim or in spirit.

| Concept | Device | Reader takeaway |
|---|---|---|
| 8 dimensions | Labeled color wheel walked as eight questions any outsider can ask about any institution | "Compassion at scale is eight separate, observable capacities — not one vague virtue." |
| 40 subdimensions | One dimension opened up (e.g., Action → 5 subdimensions) as the "zoom level" beneath a dimension; rest pointed to Appendix A | "Each dimension is made of five concrete behaviors you could go look for." |
| 0–100 v1.2 scoring | Small worked table for one entity: 8 dimension means → arithmetic of `((mean − 1)/4)×100` → base → band | "A score is reconstructed from eight behavior ratings by one published formula — anyone can redo the math." |
| Integration premium | Two contrasting profiles, side by side: balanced 70/70 out-earning spiky 90/40; one small table, two rows | "The standard rewards even, sustained care over one brilliant spike and seven gaps." |
| Evidence hierarchy | 5-tier pyramid with one real source type per tier (audit at top, mission statement at bottom) | "Strong scores require stronger evidence; a press release is the weakest input we have." |
| Maturity gates | Cost-test gate graphic: no documented costly case → subdimension capped at Developing | "Looking good when it is easy is not evidence of character, so it cannot earn a top score." |
| Pressure tests | Short adversarial vignette on the running example: a moment where care was costly | "Every dimension is tested under pressure, not under favorable conditions." |
| Automated vs certified | Two-lane diagram: nightly pipeline lane (1,256 public scores) beside Human Battery lane (future certified product) | "Public scores come from an automated, human-gated pipeline; the deep human battery is a separate, future certified product." |

### 3.3 Core Reader Takeaways — Parts II and III

This table supplies the two columns the current `chapter-index.md` lacks (see §4.2). Upgrade `chapter-index.md` from this table in Batch 0.

| Ch | Title | Core takeaway (one sentence the reader keeps) | Likely evidence needs |
|---|---|---|---|
| 5 | What Compassion Benchmark Measures | Compassion is a pattern of institutional decisions you can recognize, respond to, and reduce-suffering against. | source_notes §2 definitions; recognize→respond→reduce loop |
| 6 | The Eight Dimensions | Institutional compassion decomposes into eight nameable capacities, each detectable in conduct. | dimensions.ts one-liners + colors; Appendix A grid |
| 7 | Evidence Before Assertion | What an institution says is the weakest evidence; verified outcomes and community testimony outrank it. | 5-tier hierarchy; "evidence beats aspiration" rule |
| 8 | How Assessment Works | A 0–100 score is built bottom-up from 0–5 behavior anchors via one published formula, then human-gated. | v1.2 formula; 0–5 anchors; +10 premium; pipeline gate |
| 9 | From Score to Improvement | A score names specific improvable behaviors and is reversible, not a verdict. | Floor designation + exit protocol; before/after radar |
| 10 | Compassion as Observable Behavior | Sentiment is not scored; only decisions, policies, and verified outcomes are. | Behavioral-anchor logic; attribution rule |
| 11 | The Science Behind the Framework | The 8/40 structure and anchors borrow capture-resistant measurement methods (V-Dem, FMTI). | One fully-anchored subdimension (all 5 levels); STRUCTURE §1.5 |
| 12 | Why Systems Matter More Than Intentions | Outcomes follow incentives and structure, so root cause and consistency are scored, not motives. | SYS + INT subdimensions; root-cause vs symptom diagram |
| 13 | Pressure Tests, Maturity Gates, Character Over Time | The top bands are gated behind costly, repeated, time-tested evidence of care. | Pressure-test cap; review flags; I1/I5; ≥3-cycle floor criteria |

### 3.4 Worked-Example Strategy

Two running illustrative institutions thread through the explanation chapters.

**Primary (composite AI lab — illustrative, not a named live score).** A fictional but realistic frontier AI lab used to demonstrate the dimension wheel, the 0–100 math, the integration premium (give it a spiky 90/40 profile), and the pressure test. Framing must be explicit: "an illustrative profile, not a published score." Protects independence; avoids stating a number not in `source_notes`.

**Secondary (UnitedHealth Group — real, sourced, documented).** Composite 10.2, Critical. In `source_notes §4/§8`. Use once, in Ch 13 and Ch 15, to make near-floor limitation and attribution concrete (DOJ-probe expansion logged as evidence-tier upgrade, no composite change). Cite as a real published score.

**Rule:** every number presented as a fact must trace to `source_notes`. Every invented number must be visibly flagged "illustrative." Never blur the two. Reuse the same two entities across chapters so the reader's mental model compounds instead of resetting.

Other sourced numbers usable as facts: Harvard 52.3 (highest in university set); university mean 46.2; zero Exemplary universities; USC 36.7; NYU 39.1; Columbia 44.5. All from `source_notes §6`.

### 3.5 Accuracy Guardrails

Authors of all parts check every draft against this list before submission. These are the must-not-get-wrong items.

1. **Entity count is 1,256, never 1,155.** See §4.4 for full propagation note.
2. **Scoring is v1.2.** Base = `((mean of 8 dims − 1)/4)×100`; integration premium caps at +10, not +20. Bands: 0–20 / 20–40 / 40–60 / 60–80 / 80–100 (no 21/41/61/81 boundaries).
3. **Keep automated and certified assessment distinct.** The 1,256 public scores come from the automated nightly pipeline (BUILT), human-gated at the score-updater. The 7-session Human Assessment Battery is ASPIRATIONAL and underpins a future paid certification. Do not imply humans hand-assess 1,256 entities.
4. **Do not overclaim the integrity audit or Score Watch as fully operational.** The weekly integrity-check is spec/stub; describe as designed/in-rollout. Score-Watch alert delivery is partial. No "weekly automated audits already run" language.
5. **Public methodology transparency is the lead selling point.** Published rubric, weights, sources, and reproducibility test are the differentiator vs. capturable/paywalled indices.
6. **Impact is forward-looking.** Baseline external citations are 0; KPIs are targets. Never present projected revenue or citation counts as achieved.
7. **A score is reconstructable.** Every published composite must be shown as derivable from its 8 dimension scores — say so wherever the formula appears.

---

## SECTION 4 — GRAPHICS AND LAYOUT

**Primary reference:** `plan/04-graphics-layout-plan.md`

### 4.1 Visual System Summary

**Design north star:** forensic gravity — a precise instrument applied to a human subject. Serious, calm, credible, human. Not charity, not ESG-SaaS, not academic wall-of-text.

**Cover:** The brand's Calibrated Arc mark on a dark navy field (`#0b1220`→`#1a2a46` ramp). The five-band sequence appears once as a thin graduated hairline (the 0–100 scale stated before a word is read). Title in DM Sans 700. No photography (brand rule). The "human" is carried by the pivot dot and the subtitle line.

**Section dividers:** Six full-bleed dark pages. Each carries the Part number, title, one dimension-colored motif rotating across Parts (I→AWR cyan, II→full 8-color ring, III→SYS green, IV→ACT green, V→EQU gold, VI→INT violet), and one pull-quote (§2.6).

**Eight-dimension icon system:** Simple 2px line marks, one per dimension in its `dimensions.ts` color, on a shared 24×24 grid. Built once; reused approximately 30 times across dividers, wheel, and sidebars. Full icon briefs in `plan/04-graphics-layout-plan.md` §1.

**Color and typography:** Adopt brand tokens verbatim. Blue `#3b82f6` / tint `#93c5fd` is the brand/link/accent color (see §4.5 conflict reconciliation on brand-color fork). Cyan `#7dd3fc` is reserved exclusively for the Exemplary band. Band ramp: Critical `#f87171` → Developing `#fb923c` → Functional `#fcd34d` → Established `#86efac` → Exemplary `#7dd3fc`. For print/PDF use the light-surface band ramp (Critical `#dc2626` → Exemplary `#0284c7`) on warm off-white pages. DM Sans 700 for headings; tabular numerals in all tables and charts.

**Colorblind redundancy (non-negotiable):** every band carries its label + left→right position, monotonic luminance, and a hatch pattern on Critical in dense charts.

**Page rhythm:** 4px spacing base. Full-page chapter openers → two-column narrative → full-page hero graphic roughly every 6–8 pages → callout/reflection page → dense methodology/table page → back to air. Never two dense pages adjacent.

### 4.2 Seven Hero Graphics (H1–H7)

All must be hand-rolled inline SVGs; exported as standalone `.svg` files for designer placement.

| # | Graphic | Primary chapter | Why it matters |
|---|---|---|---|
| H1 | "We measure everything except this" — horizontal matrix of finance/safety/cyber/environment standards vs. missing compassion standard | Ch 3, reused Ch 4 | The single most persuasive page for a funder; makes the vacuum structural and visual |
| H2 | Evidence hierarchy pyramid — T1 (independent audit) → T5 (self-report); width = trust; example sources per tier | Ch 7, Appendix B | "Mission statements are not evidence" in one glance; credibility anchor for the whole prospectus |
| H3 | Theory of change / logic model — 5-stage flow with stated assumptions as a footed band | Ch 22, funder-summary | A fundable causal chain, honestly hedged |
| H4 | Platform / nightly pipeline workflow — swimlane with automated plane + human-gate lane + cost annotation (~$27–62/night; ~1,256 entities) | Ch 25, Appendix C | Near-zero marginal cost per entity = the leverage story funders reward |
| H5 | Five-year roadmap timeline — maturity gates, fiscal sponsor → Form 1023 → determination; Schmidt Aug 8 2026 and Fast Forward deadline marked as fixed pins | Ch 27 | Concrete dated milestones — momentum, not vapor |
| H6 | Funding-package menu — three tier cards: $150k Seed / $300k Core / $500k+ Multi-year, each with deliverables + KPIs | Ch 29, Appendix E | Clear, sized ask with deliverables; removes friction from the decision |
| H7 | Impact framework / KPI dashboard — output→outcome→impact ladder + KPI panel with Year-1 vs Year-2 targets, baseline "0 reported" where true | Ch 23 | Measurable self-accountability; we hold ourselves to a standard |

Supporting graphics from `chapter-index.md` (not Hero graphics but required per chapter): eight-dimension wheel (Ch 6, App A); two-plane independence diagram (Ch 26); recognize→respond→reduce loop (Ch 5); revenue-mix donut + cost-base bar (Ch 28); existing-frameworks comparison table (Ch 4); "built vs planned" status board (Ch 24); AI/robotics and university and F500 data-viz (Ch 14–17). Full graphic-to-chapter map in `plan/04-graphics-layout-plan.md` §4.

### 4.3 Data-Viz Principles

Buildable now from index JSONs; static-export-safe SVG; no implied precision.

- Band distribution across 1,256 entities (stacked/segmented bar) — Executive Summary + Part IV asset.
- Sector comparison strip — ranked dot/strip per index on one 0–100 axis with band zones shaded.
- Universities worked example — mean 46.2, zero Exemplary, prestige–compassion gap. Real, citable, striking.
- F500 composite histogram across 5 bands (Ch 17).
- Country ranked-bar excerpt (Ch 16) and AI/robotics leaderboard excerpt (Ch 14).

**Do not over-encode:** No trend lines or sparklines (scores are too young; a trajectory line implies longitudinal precision we do not have). Floor scores (0.0) are floor designations, not fine-grained measurements — annotate as such. Do not render the integration-premium math as a curve; show it as the conceptual "balanced 70/70 out-earns spiky 90/40" callout only. Radar charts carry the area-misleads caveat; prefer dimension-profile bar where possible.

Chart style rule: honest, restrained, own-data, zero-baseline, band-colored with label+position redundancy, tabular numerals, no chartjunk, no 3D, no pie except the single revenue-mix donut. Every chart gets a plain-language takeaway title (Burn-Murdoch rule) and an aria/alt-equivalent caption.

### 4.4 PDF Production Pipeline

**Two-track approach:**

**Internal review track (continuous proof):** Markdown → styled HTML → headless Edge print-to-PDF. Regenerates on every edit; validates word count, hierarchy, inline SVG. Sufficient for early grant attachments and `funder-summary.md`.

**Flagship final:** Affinity Publisher or InDesign (not Canva). Required for full-bleed dividers, true two-column flow with baseline grid, kerned DM Sans display, and press-quality control.

**What the MD→PDF track owns:** all front/back-matter, funder-summary, every data table, all SVG graphics rendered to final vector (hand-rolled inline SVG; no chart libraries; export each as a standalone `.svg`).

**What the designer receives:** (1) clean final Markdown manuscript; (2) named, final-vector `.svg` files (one per H1–H7 + each data-viz) with takeaway title baked in; (3) `layout-notes.md`; (4) brand tokens (light-surface band ramp for print, DM Sans, navy + off-white); (5) eight-dimension icon set as a single SVG sprite.

**Technical constraints:** static-export SVG philosophy (no rasterized charts); bleed/safe margins for full-page dividers; CMYK-safe check on band ramp before any physical print run; embed/outline fonts; accessible tagged PDF (alt text from captions, reading order, real text not outlines in body); keep under email-attachable file size.

---

## SECTION 5 — QUALITY GATES AND CLAIMS DISCIPLINE

**Primary reference:** `07-quality-gates.md`

### 5.1 The Ten Quality Gates

All gates must pass before the manuscript is marked complete. Unresolved items must be explicitly documented.

| Gate | Test | Pass condition |
|---|---|---|
| 1 | Strategic coherence | Manuscript moves problem → gap → standard → public benefit → institutional readiness → funding opportunity. Funding does not appear before need is established. |
| 2 | Human voice | No chapter passes with uniform paragraph length, stacked aphorisms, AI cadence, or language that sounds like any other nonprofit report. |
| 3 | Specificity | Each chapter contains at least one insight specific to Compassion Benchmark that survives a name-replacement test. |
| 4 | Reader momentum | A busy, skeptical program officer would continue past each chapter opening voluntarily. |
| 5 | Funder readiness | Manuscript answers why this matters, why now, why this organization, why philanthropy, what changes if funded, how independence is protected, how impact is measured, how the work sustains — embedded in argument, not appended. |
| 6 | Evidence discipline | No unsupported market size, legal, tax, impact, or uniqueness claims in final text; all flagged items resolved or soft-worded with [NEEDS VERIFICATION] annotation. |
| 7 | Brand discipline | Global search confirms zero instances of "ACB" (narrative), "Applied Compassion Benchmark" (narrative), em dashes, or 1,155 / 1,156 as entity count. |
| 8 | Structural completeness | All 30 chapters, 6 front-matter items, 6 appendices, and all 7 required output files present. |
| 9 | Layout readiness | Every chapter has a confirmed visual, pull-quote candidate, and layout note. |
| 10 | Final acceptance | A professional editor believes it was written by one experienced author; a program officer continues beyond the Executive Summary; a journalist could quote individual passages unedited; every chapter contains at least one memorable insight specific to Compassion Benchmark. |

### 5.2 Claims-to-Verify Maintenance

One file, maintained incrementally. The claims agent appends entries after each batch. Do not allow unresolved items to remain in the manuscript without soft wording or explicit [NEEDS VERIFICATION] annotation.

**Entry format:**
`claim text | manuscript location | why verification is needed | suggested source type | recommended interim wording`

**Categories that always require a flag:** market size claims; legal conclusions; nonprofit/tax treatment; impact already achieved; funder interest; adoption likelihood; uniqueness assertions; platform readiness; regulatory relevance; any [PLANNED] or [ASPIRATIONAL] item stated in present tense.

**Batch-specific high-risk chapters:** Ch 6 and Ch 8 (highest density of quantitative specificity — dimension codes, formula, premium, band boundaries); Ch 11 (science base — may require soft-wording); Ch 15 (UHG — flag for defamation review); Ch 23 (forward-looking KPI claims); Ch 25 (pipeline — do not inflate [PLANNED] into present tense); Ch 26 (governance — must match ORGANIZATION_PLAN §6 exactly).

### 5.3 Style-Lock Reference (produce in Batch 0)

`style-lock.md` is a single-page reference delivered to every subsequent agent before drafting.

**Canonical terminology table:**

| Use | Never use |
|---|---|
| Compassion Benchmark | ACB / Applied Compassion Benchmark (in narrative) |
| 1,256 scored entities | 1,155 / 1,156 / 1,260 / "over a thousand" |
| v1.2 scoring / scoring model v1.2 | "the methodology" alone without version |
| 8 dimensions, 40 subdimensions | "aspects," "criteria," "pillars" |
| 5 evidence tiers / five-tier hierarchy | "evidence levels," "evidence categories" |
| nightly pipeline (automated) | "AI-generated scores" or "real-time scoring" |
| 7-session Human Assessment Battery | "manual assessment" |
| recognize, respond to, and reduce suffering | variations of this triad |
| Critical / Developing / Functional / Established / Exemplary | any other band names |

**Brand rules:** No em dashes. No public-facing "ACB." No "Applied Compassion Benchmark" in narrative. Periods after version numbers (v1.2, not V1.2).

**Recurring motifs (at most one per chapter):**
- The measurement gap: we measure almost everything except whether institutions reduce suffering.
- Evidence beats aspiration.
- Compassion at institutional scale is a pattern of decisions, not a sentiment.
- Independence locked, not promised.
- Good people can work inside systems that still produce harm.
- The pressure test as character test.
- The Freedom House / TI CPI analogy for shared comparative measurement.
- The pipeline is already running.

---

## SECTION 6 — RECONCILED CONFLICTS AND OPEN DECISIONS

### 6.1 Brand-Color Fork

**The conflict.** The graphics plan (`plan/04-graphics-layout-plan.md` §1) flags a "critical fix": the brand/link/accent color is blue `#3b82f6` / tint `#93c5fd`, never cyan — because cyan `#7dd3fc` exclusively denotes the Exemplary band in the five-band sequence. Any use of cyan as a general brand/accent color would create a semantic collision where non-Exemplary content implies top-band status.

**Recommendation.** Adopt the graphics plan's distinction without modification: blue `#3b82f6` for all brand/link/accent/button uses; cyan `#7dd3fc` only for the Exemplary band and the AWR Awareness dimension icon. This is already the correct interpretation of `BRAND_VISUAL_IDENTITY.md` and `dimensions.ts`. The conflict is not an open question — it is a misapplication that the graphics plan has already corrected.

**Who decides.** Phil must confirm this is aligned with any external brand decisions (print vendor, designer brief) before the designer begins work. This is the one typography/color decision Phil should clear before handing to the designer, because changing it after final SVGs are built is expensive.

**Propagation.** The `style-lock.md` produced in Batch 0 must include the color distinction explicitly. Every agent producing SVG or layout-note references must be briefed on the cyan/blue distinction before work begins.

### 6.2 Chapter-Index Upgrade (Prerequisite Task)

**The gap.** The current `chapter-index.md` contains columns for: chapter number, title, one-line purpose, target word count, key source material, and recommended visual. The `06-output-specification.md` requires additional columns: core takeaway, engagement point, and claims-to-verify. The comprehension plan (`plan/03-comprehension-plan.md` §3) supplies the core takeaway and likely evidence needs for Parts II and III. The narrative plan (`plan/02-narrative-strategy.md` §4) supplies the engagement points by Part. Neither has been propagated into `chapter-index.md`.

**Recommendation.** Treat `chapter-index.md` upgrade as a Batch 0 prerequisite task, run before any prose is written. The research/data agent in Batch 0 should add the following columns to every chapter row:
- `Core takeaway` — one sentence the reader keeps (from §3.3 of this plan for Parts II–III; from `plan/02-narrative-strategy.md` throughline for Parts I and IV–VI)
- `Engagement point` — the one device for this chapter (from §2.4 of this plan)
- `Claims to verify` — anticipated verification needs (from §5.2 of this plan)
- `Likely evidence needs` — source_notes sections (from §3.3 of this plan)

**Critical path impact.** This is a prerequisite for Batch 1. The spine author and all subsequent writing agents must have a complete chapter-index before drafting begins. Do not start Batch 1 until the upgrade is complete.

### 6.3 Working-Folder Reconciliation

**The conflict.** Foundation files (`source_notes.md` and `chapter-index.md`) currently exist in two locations:
- `docs/Compassion-Benchmark-Prospectus/source_notes.md` (current, canonical)
- `docs/Compassion-Benchmark-Prospectus/chapter-index.md` (current, canonical)
- `docs/nonprofit/prospectus/source_notes.md` (stale copy)
- `docs/nonprofit/prospectus/chapter-index.md` (stale copy)

**Recommendation.** `docs/Compassion-Benchmark-Prospectus/` is the canonical working folder. The files in `docs/nonprofit/prospectus/` are stale copies. No agent should read from or write to `docs/nonprofit/prospectus/`. The stale copies do not need to be deleted immediately, but they must not be referenced in any agent instructions, file paths, or cross-references. Every agent briefing document must specify the canonical path.

### 6.4 Accuracy Corrections — Propagate Before Drafting

These corrections must be embedded in `style-lock.md` and `chapter-index.md` before any prose is drafted. They represent facts where source documents disagree and the canonical value is known.

| Claim | Wrong (stale) value | Correct (canonical) value | Source of truth |
|---|---|---|---|
| Total scored entities | 1,155 (ORGANIZATION_PLAN, GRANT_MODEL, most nonprofit docs) | **1,256** | `site/src/data/entityCount.ts`; all 8 index JSONs |
| Fortune 500 count | 447 (CLAUDE.md) | **448** | `fortune-500.json` meta.entityCount |
| Scoring model | "base out of 80 + up to 20 additional" (legacy methodology.html) | **v1.2: `((mean − 1)/4) × 100`; integration premium cap +10** | `scoring.ts`, `methodology-v1.2-additions.md` |
| Integration premium cap | +20 (legacy methodology.html) | **+10** | `dimensions.ts INTEGRATION_PREMIUM` |
| Band boundaries | 0–20 / 21–40 / 41–60 / 61–80 / 81–100 (legacy) | **0–20 / 20–40 / 40–60 / 60–80 / 80–100** | `dimensions.ts BANDS` |
| Automated assessment | "Human Assessment Battery produces public scores" (if implied) | **Nightly automated pipeline produces the 1,256 public scores; the 7-session HAB is aspirational/future certified product** | `source_notes §4/§5` |
| Integrity audit status | "Weekly automated integrity audits already running" (nonprofit docs) | **Spec/stub; describe as designed/in-rollout** | `research/scripts/integrity-check.mjs`; source_notes §5 |
| Score Watch delivery | Sold and fully automated | **Sold; automated delivery is partial/in-progress** | `source_notes §5`; SCORE_WATCH_LAUNCH.md |
| Impact/citations | Achieved | **Forward-looking; baseline external citations = 0** | `source_notes §12` |

**Author instruction:** any draft chapter that contradicts the "correct" column in this table is returned for correction before it advances to the developmental rewrite stage.

---

## SECTION 7 — CONSOLIDATED EXECUTION ORDER

The following is the single authoritative run sequence. Batch numbers correspond to sections 1.1 and 1.2 above.

| Step | Batch | Action | Agent type | Editorial passes | Est. sessions | Critical path? |
|---|---|---|---|---|---|---|
| 1 | 0 | Lock App A, B, C; upgrade `chapter-index.md` with missing columns; produce `style-lock.md` | Research/data agent | None (reference work, not prose) | 1 | YES — must complete before Steps 2 and 3 |
| 2 | 1 | Write spine: FM-4, FM-5 first draft, Ch 1, Ch 22, Ch 30; apply passes 2–4 immediately | Senior writing agent | Dev rewrite + human voice + funder readiness | 2 | YES — all other batches depend on this |
| 3 | 2 | Write FM remainder (FM-1, 2, 3, 6) + Part I (Ch 2, 3, 4); apply passes 2–4 | Writing agent | Dev rewrite + human voice + funder readiness | 1–2 | No |
| 4 | 3 | Write Part II (Ch 5–9); apply passes 2–5 — evidence pass critical here | Writing agent (Batch 0 output in context) | Dev rewrite + human voice + funder readiness + claims | 2 | YES — must complete before Step 5 |
| 5 | 4 | Write Part III (Ch 10–13); apply passes 2–5 | Writing agent | Dev rewrite + human voice + funder readiness + claims | 1–2 | YES — must complete before Steps 6 and 7 |
| 6 | 5a | Write Part IV (Ch 14–18); apply passes 2–5 | Writing agent | Dev rewrite + human voice + funder readiness + claims | 1–2 | No (parallel with Step 7) |
| 7 | 5b | Write Part V (Ch 19, 20, 21, 23); apply passes 2–5 | Writing agent | Dev rewrite + human voice + funder readiness + claims | 1–2 | No (parallel with Step 6) |
| 8 | 6 | Write Part VI (Ch 24–29); apply passes 2–5; read source_notes §5, §7–10 | Writing agent | Dev rewrite + human voice + funder readiness + claims | 2 | YES — must complete before Step 9 |
| 9 | 7 | Write App D, E, F; finalize App A, B, C; apply passes 2–5 | Writing/research agent | Dev rewrite + claims | 1 | No |
| 10 | Layout | Layout pass across all chapters; complete `graphics-plan.md` and `layout-notes.md`; confirm one visual per chapter | Layout agent | Layout pass only | 1 | YES — must complete before Step 11 |
| 11 | Assembly | Assemble full manuscript; revise FM-5 to match actual content | Coordinator agent | Consistency sweep | 1 | YES |
| 12 | QC | Run all 10 quality gates; revise until all pass or unresolved items documented; resolve `claims-to-verify.md` | QA agent | Gate pass/fail report; revisions | 1–2 | YES |
| 13 | Summary | Produce `funder-summary.md` (3–5 pages; standalone) | Coordinator / writing agent | Light editorial | 1 | No |

**Total estimated agent sessions: 16–21.**

Recommended collapse strategy: passes 2–4 (developmental rewrite, human voice, funder readiness) collapse into one editorial session per batch. Pass 5 (claims) and pass 6 (layout) always run as separate focused sessions. The FM-5 revision in Step 11 is the last writing act before assembly acceptance — it must reflect the actual manuscript, not the first-draft argument outline.

---

## SECTION 8 — DECISIONS NEEDED FROM PHIL BEFORE FULL DRAFTING BEGINS

The following items block drafting or must be confirmed before the manuscript can be finalized. Batch 0 (reference lock and index upgrade) can proceed without them. Batch 1 (spine, including the founder letter) cannot proceed until items 1 and 2 are resolved.

| # | Decision | Needed by | What happens if unresolved |
|---|---|---|---|
| 1 | **Founder letter input.** The five inputs described in §2.5: origin moment; hardest design decision and why; honest ten-year-success statement; one or two moments of doubt; what the work cannot yet prove. | Before Batch 1 begins | The founder letter (FM-4) cannot be drafted; Batch 1 stalls on its most important piece |
| 2 | **Brand color confirmation.** Confirm blue `#3b82f6` as brand/accent color and cyan `#7dd3fc` as Exemplary-band-only, as described in §6.1. Confirm whether any external vendor, designer, or print brief has already specified different values. | Before Batch 0 (`style-lock.md` is written) | The color distinction cannot be locked in `style-lock.md`; every SVG and layout pass must be redone if the brand-color decision changes after production starts |
| 3 | **Scope confirmation: any chapters to cut, merge, or reorder?** The 30-chapter / 6-front-matter / 6-appendix structure is inherited from `chapter-index.md`. If Phil wants to eliminate or consolidate any Part IV applications chapters (e.g., Ch 18 Nonprofits is the thinnest), confirm before Batch 3. | Before Batch 3 | Minor; word budget redistributes, but not a blocker |
| 4 | **Fast Forward deadline go/no-go.** The Fast Forward accelerator window is Jul 30–Sep 8, 2026. If this is a hard target for an early funder-summary version, it sets the production timeline for `funder-summary.md` (Step 13 compresses). | Immediately | If unconfirmed, the funder-summary may arrive too late for the Jul 30 open date |
| 5 | **Schmidt Multi-Agent Safety deadline.** Full proposal due Aug 8, 2026. The prospectus or funder-summary may be an attachment. Confirm whether a Tier-1 version is needed before full manuscript completion. | Immediately | Same compression risk as Fast Forward |

---

## DEFINITION OF DONE

The manuscript is complete when all of the following are true.

**Structural completeness (Gate 8).**
All 30 chapters, 6 front-matter items, and 6 appendices exist as files in `manuscript/`. All 7 required output files (`compassion-benchmark-funder-prospectus.md`, `source_notes.md`, `chapter-index.md`, `graphics-plan.md`, `layout-notes.md`, `funder-summary.md`, `claims-to-verify.md`) are present in `docs/Compassion-Benchmark-Prospectus/`.

**Voice and coherence (Gates 1–4, 10).**
A professional editor reading the assembled manuscript believes it was written by one experienced author. A foundation program officer continues beyond the Executive Summary without feeling they are reading a grant proposal. A journalist could quote individual passages without rewriting them.

**Funder readiness (Gate 5).**
All six funder questions (why this, why now, why us, why philanthropy, what changes, how independence is protected) are answered in the body of the argument — not in a FAQ appendix.

**Claims discipline (Gate 6).**
`claims-to-verify.md` contains no unresolved entry that is also present verbatim in the manuscript without either a supporting source or a [NEEDS VERIFICATION] annotation and soft wording. The seven accuracy corrections in §6.4 are verified to be applied throughout.

**Brand discipline (Gate 7).**
Global search of the assembled manuscript returns zero instances of: "ACB" (narrative), "Applied Compassion Benchmark" (narrative), em dashes, entity count 1,155 or 1,156, "base out of 80," "+20 premium."

**Layout readiness (Gate 9).**
`graphics-plan.md` and `layout-notes.md` are populated for every chapter. Every chapter has a confirmed visual, a pull-quote candidate, and a layout note. H1–H7 hero graphics are produced as standalone `.svg` files and are ready to hand to a designer.

**Independence of source.**
The manuscript is traceable: every quantitative claim either traces to `source_notes.md` and the canonical source files, or is explicitly flagged as illustrative.
