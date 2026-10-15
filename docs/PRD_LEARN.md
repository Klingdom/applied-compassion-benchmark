# PRD: Learn (children and students section)

| Field | Value |
|---|---|
| Product | Compassion Benchmark (compassionbenchmark.com), section `/learn` |
| Status | Draft for founder review. Nothing here is approved. Build, deploy and publication are founder-gated (`AUTONOMY.md`). |
| Date | 2026-10-14 |
| Author | Product Manager agent, synthesising the 11-specialist panel |
| Inputs | `docs/learn/PANEL_BRIEF.md`; `docs/learn/briefs/01-landscape.md` to `11-qa.md`; `docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md` section 4.2; coordinator-verified facts of 2026-10-14 |
| Companion artefacts | Scope is in section 6, acceptance criteria in section 7 and 8, metrics in section 9. Splitting these into `MVP_SCOPE.md`, `ACCEPTANCE_CRITERIA.md` and `SUCCESS_METRICS.md` is possible on request. They are kept in one file here so the traceability is visible. |

Citation convention: IDs such as `LD-R1`, `UX-R6`, `QA-R2` are recommendation IDs from the briefs (`LANDSCAPE-R`, `LD-R` for brief 02, `UX-R`, `CS-R`, `A11Y-R`, `VIZ-R`, `FE-R`, `PRIV-R`, `EDU-R`, `DISC-R`, `QA-R`). Briefs 09 and 10 are cited by `EDU-` and `DISC-`. Claims about the repo are the briefs' or the coordinator's, and "unverified" is stated where a brief said so.

---

## 1. Problem

**Who has the problem.**
- Teachers, parents and club leaders who want to discuss institutions, fairness and evidence with 8 to 18 year olds. They are the real distribution channel for the youngest bands.
- Students aged about 12 to 18 who meet scores, rankings and "evidence" in the news and in class and are rarely shown how a score is built, how wrong it can be, or how its makers correct it.
- Instructors of statistics, civics, public policy and computing who want a real, open, inspectable composite index to teach with.

**The pain.**
- There is little classroom material about institutional compassion that is honest about uncertainty and ready to run in a lesson (brief 09).
- The benchmark's own method text cannot yet be taught safely. It contains live defects (section 4) and the site's shell collects data and sells services on every page, which is unacceptable for children (brief 08).
- The benchmark measures suffering (war, executions, detention). A naive "kids version" would expose a 12-year-old to graphic specifics (brief 04).

**The job to be done.**
- Educator: "Give me something I can print and run in a lesson, that I can trust is true and safe, without signing students up for anything."
- Student: "Let me play with how a score works, see why it can be wrong, and see how people fix mistakes."

**Why now.**
- Founder directive of 2026-10-14 (`docs/learn/PANEL_BRIEF.md`, verbatim): "The website also needs to place for children and students to understand the methodology, analysis, scoring, insights, and corrective actions. Engage sub agents to develop pages for learning and experiments for kids and students."
- Nonprofit document section 4.2 positions Program 2 (Compassion Education) on "institutional and applied compassion literacy" and lists track E1 ("Course v1 published under an open licence") as a year 1 deliverable. Learn is adjacent to E1, not the same thing (see decision FD-24).
- The benchmark has just published a correction of its own formula (CHANGELOG 2026-09-29). That is a teaching asset, and it also proves that method text drifts, which is why the gates in section 8 come before content.

---

## 2. Product definition and audiences

**Definition.** Learn is a separate, zero-collection, non-commercial section of the benchmark site. It teaches five topics (methodology, analysis, scoring, insights, corrective actions) at three student reading levels, with hands-on experiments that run the real scorer in the browser, plus an educator hub with printable lessons. Every simplified page links to its full version. Nothing a learner does is recorded, sent or stored.

**Education firewall (non-negotiable, nonprofit document section 4.2).** Learning never affects a score. Learning is never presented as a way to raise a score. Participation is never recorded against an entity. No Learn page, activity or file may imply otherwise.

### 2.1 Audiences (bands confirmed with two adjustments)

| Band | Ages (approximate) | How they read | Visual surface | Real entities? |
|---|---|---|---|---|
| **Explorers** | 8 to 11 | With a parent or teacher, read aloud first (A11Y band note). No activity may require reading alone. | Scoped light "paper" | Never. Invented examples only. |
| **Investigators** | 12 to 14 | Independently, in class or at home | Scoped light "paper" | Only hand-picked, non-violent cases from a reviewed set (CS-R1). None is acceptable for launch. |
| **Analysts** | 15 to 18 | Secondary school statistics, civics, computing | Existing dark theme inside Learn chrome; print forced to light | Yes, from the reviewed set, behind content notes and opt-in expansion; no victim names, no method detail (CS-R1). |
| **Educators** | Teachers, parents, club leaders | Adult | Scoped light "paper"; print is a first-class output | Not applicable |

**Adjustment 1: Researchers is folded into Analysts (UX-R2).** Researchers (university and adult learners) already use `/methodology` and `/research`. Learn gets no Researchers hub. The Analysts hub carries a "Go further" block that links to the full methodology, and the Researchers cells of the brief 02 objective matrix are delivered there in Phase 2. The Phase 3 university work (EDU-R5) is an instructor note, not a student band.

**Adjustment 2: Explorers is a supported-reading band (brief 05, brief 02 Q5).** One band, not split at age 10. Every page works read aloud by an adult.

**No age question.** The landing page routes by choice ("I'm learning" or "I'm a teacher or parent", then three band cards labelled by age and reading level, with "Not sure? Start with Explorers"). No birth date, no age gate (UX-R3). The "Grown-ups: main site" interstitial is a speed bump, and says so; the site does not verify age and must not claim to (UX-R15).

### 2.2 Buyer and funder context
Learn is free and sells nothing. The adopters and funders who matter are: (1) the individual educator who chooses to run a lesson, (2) a school's data-protection officer who must be able to say yes in one paragraph, (3) education foundations, who want evidence of reach and learning without child data (EDU-R6), and (4) university instructors (Phase 3). The privacy design (no collection at all) is a selling point for (2) and (3), not a limitation.

### 2.3 Non-goals
- Not a personal-practice or SEL curriculum. Learn teaches how institutions are assessed; it must say plainly that it is about institutions (DISC-R8). Contemplative programs are referred to, not competed with (nonprofit document 4.2).
- Not a way to score a person (see FD-3 and LRN-30).
- Not a funnel for any commercial line, newsletter, Agent Hub or user-generated content.
- Not a certification or credentialing product.

---

## 3. What is taught

### 3.1 The five topics and their slugs
Slugs follow brief 03 and never change once published.

| Directive topic | Slug | One-line outcome (Explorers / Investigators / Analysts) |
|---|---|---|
| Methodology | `how-we-measure` | Judge what a place does, not what it says / compassion is several separate questions / high scores need evidence from under pressure |
| Analysis | `finding-evidence` | Some clues are stronger than others / rank evidence by independence / a scan flags, an assessment scores |
| Scoring | `scores` | Score each question on a ladder, then average / step 0 means harm, not "nothing" / reproduce a composite; the bonus rewards clearing 4.0 everywhere, not sameness |
| Insights | `what-it-shows` | A score describes what a place does, not whether its people are good / neighbouring ranks are often within each other's uncertainty / a seed is a placeholder, a measurement comes later |
| Corrective actions | `fixing-things` | See 3.2 |

The full per-band objective, misconception and example is the brief 02 matrix (LD section "Objective matrix"). It is the content source of truth for authors. The progression order (noticing, evidence, rubric, averaging then weighting, uncertainty, bands as honest coarseness, correction) is fixed: uncertainty comes before bands so bands do not look like grades.

### 3.2 Corrective actions: two meanings, one ladder (LD-R1)
Both meanings are taught, on the same four-step ladder, so the schema is learned once and reused.

- **(a) How institutions correct harm** (the Accountability and Systems dimensions).
- **(b) How the benchmark corrects itself** (dated public corrections in `CHANGELOG.md`).

**The repair ladder:**
1. **Notice and admit** (anchor AB1).
2. **Fix it for the people affected** (AB5).
3. **Fix the system** (AB2 and AB4).
4. **Tell everyone what changed** (AB3).

The ladder is applied first to an institution, then to the benchmark's own CHANGELOG entries, whose shape already matches ("What was wrong / How it was found / What we have done / What it does not change"). Rules:
- It is presented as how science works, never as "so trust us".
- Show honest limits, for example "not faulted is not the same as sound" (CHANGELOG 2026-09-29), and that some corrections fix a description and leave scores alone.
- Explorers meet only invented corrections (an invented referee who miscounts and says so). Real benchmark corrections begin at Investigators (CHANGELOG 2026-09-28, 2026-09-29), drawn from a curated `learn/corrections` data file whose cited headings are verified verbatim against `CHANGELOG.md` (VIZ-R6, QA-R10).
- AB codes are never shown to Explorers; they appear faintly beside names for Investigators and are allowed for Analysts (LD-R6).

### 3.3 Coordinator-verified formula facts (golden table for tests and copy)
Recomputed with `site/scripts/lib/scoring.mjs`. These are the only formula claims Learn may make, and they become fixtures in the experiment-fidelity gate.

| Case | Result |
|---|---|
| `[3 x 8]` | 50.0 |
| `[1,1,1,1,5,5,5,5]` | 51.5, so flat does NOT beat spiky |
| `[4,4,4,4,2,2,2,2]` | 52.0 |
| all dimensions 4.0 | 85.0 |
| all dimensions 3.9 | 72.5 (the 4.0 cliff) |
| one dimension 0.1, rest 5 | 90.7 |
| one dimension 0, rest 5 | 84.4 (the harm flag) |
| Maximum dimension standard deviation across all published rows | 0.768 (Hong Kong), against a consistency trigger of 1.5. The spread step has never fired on real data. |
| Published entities at exactly 60.9 (as of 2026-10-14) | 49. There is no per-entity seed flag, so they must NOT be called seeds. |

Other mechanics the briefs verified and Learn may rely on (re-verified by the gate, not by authors): dimension scores are on a 0 to 5 scale; all dimensions count equally (only the premium is non-linear); the premium rewards clearing 4.0 on every dimension; a dimension at exactly 0 removes the premium (dimension-level harm semantics); the composite is clamped to 0 to 100 and rounded to 0.1.

### 3.4 Teaching accuracy rules (the copy guard)
Derived from LD-R2, LD-R3, LD-R4, LD-R7, VIZ-R7 and QA-R1. These are enforced by LRN-39 below.

1. One dimension scale, 0 to 5. Never "out of 10" below any band (and see M2).
2. Teach the premium as "clear 4.0 on every dimension". Never "evenness is rewarded" and never "evenness does not matter at all". The honest line: shape matters only through the 4.0 threshold and the harm switch, and by small amounts. In invented profiles the spread step can move a score by at most 2.0 points and has never moved a real one.
3. Do not reuse these three existing strings: `INTEGRATION_PREMIUM.short` ("strong, even performance..."), the "Typical" label for the 1.94 spread in `charts/integrationPremiumExamples.ts`, and the CHANGELOG 2026-09-29 line "Evenness does not enter the composite at all". Do not edit the published CHANGELOG entry; file an addendum for the founder (FD-6).
4. Name the two meanings of weighting: evidence is weighted by tier; dimensions are not.
5. Keep anchor-step names apart from band names until Investigators (both scales use "Developing", "Established", "Exemplary"). Explorers see step numbers for anchors and band names only for the overall result.
6. Use words only for evidence tiers, strongest at the top, with no tier numbers (M4).
7. Band ranges come from `getBand` output, never typed or read from `BANDS.min/max` (M1).
8. Do not draw radar charts for any learner band (`charts/DimensionRadar.tsx` stays off Learn). Do not use the auto-scaling `CompositeSparkline`; score histories use a fixed 0 to 100 axis.

---

## 4. Fix before teaching (M1 to M6)

Learn must not inherit these live defects. Each needs an owner and a backlog row before Learn publishes. "Owner" is a role; the coordinator confirms named agents. Only M1 has an existing backlog row; the others need rows filed (IDs assigned on filing, not invented here).

| ID | Defect (coordinator-verified) | Evidence | Blocks | Owner (role) | Backlog row | Done when |
|---|---|---|---|---|---|---|
| **M1** | `getBand(20)` = Critical and `getBand(60)` = Functional (upper-inclusive), while `BANDS` in `dimensions.ts` is described lower-inclusive, and `BAND_RANGES` reads "21-40", leaving 20.1 to 20.9 unlabelled (VIZ-R2). | `site/scripts/lib/scoring.mjs`; `site/src/data/dimensions.ts` (`BANDS`, around lines 596 to 601) | Phase 2 band-sorting exercises and any edge explanation. Not Phase 1, provided the edge-avoidance gate is green. | Founder (decision); engineer (fix); QA (gate) | **B2** exists (`IMPROVEMENT_BACKLOG.md` line 1534: "Resolve band-boundary semantics", priority 10; reclassifies entities sitting exactly on 20/40/60/80, with Nigeria 18 and Humana 40.6 named as live boundary cases) | Founder rule recorded; comment and range strings match `getBand`; public correction logged; or, until then, Learn band exercises avoid values within 0.5 of 20, 40, 60, 80 and call `getBand` only (LD-R3). |
| **M2** | `/methodology` describes dimension scores "out of 10" while the formula averages 0 to 5 dimension means. Internally inconsistent. | `site/src/app/methodology/page.tsx` lines 233, 244, 323, 332 (formula at about line 358) | Launch (Learn links to the full version) | Founder (approve copy); frontend engineer | File new row | One scale used on the page; `test:method-claims` asserts it; LD-R2 satisfied. |
| **M3** | The caption "Lower variance across 8 dimension scores earns a higher premium multiplier" is misleading: the step needs a standard deviation above 1.5, which no real entity reaches (maximum 0.768). | `site/src/app/methodology/page.tsx` line 272; `INTEGRATION_PREMIUM.detail` (`dimensions.ts` about line 635) | Launch; Learn must not reuse `ConsistencyStepChart` below Analysts (LD-R4) | Founder; frontend engineer; QA | File new row | Caption states the 4.0 rule and that the spread step is dormant on real data; method-claims gate covers the string. |
| **M4** | Evidence tiers run under at least four schemes: `EvidencePyramid` (tier 1 strongest), briefing `TIER_LABELS` (tier 5 strongest), `EntityDetail` (A to D), glossary (3 tiers). `change-proposals/lisbon-2026-10-14.json` also tags one URL `sourceTier: 2` and `tier: 5`. | VIZ-R4 | Phase 2 spot-the-rung and any numbered ladder. Not Phase 1 (words-only ladder). | Founder (canonical choice); engineer | File new row | One canonical scheme chosen and recorded; Learn ladder may then show numbers. |
| **M5** | `site/scripts/test-scoring.mjs` re-implements `calcScores` with subdimension-level harm semantics. The real `src/lib/scoring.ts` and `scoring.mjs` use dimension-level semantics, which match the published methodology ("any single dimension at exactly 0", `page.tsx` lines 364 and 942). The test therefore guards nothing about shipped code. | FE-R6; brief 07 finding 2 (its harm case passes against the copy but not against the real code) | **Any Learn page that displays a computed score (experiments).** Must land before the experiment slice. | Frontend engineer; QA | File new row | Test imports the real module through `scripts/lib/ts-alias-loader.mjs` (`importSiteModule("src/lib/scoring.ts")`, already used by `test-model-wave-isolation.mjs`); the in-file copy and its false header claim are removed; a golden grid compares `scoring.ts` to `scoring.mjs`; the section 3.3 table is pinned. |
| **M6** | `site/public/llms.txt` line 6 hard-codes the entity and index counts and is not generated. | Brief 10 | The Learn section of `llms.txt` and the `test:no-stale-counts` guarantee | Backend/build engineer; SEO | File new row | `llms.txt` generated at prebuild from `entityCount.ts` and `indexRegistry.ts`; `test:no-stale-counts` covers it (whether that test scans `public/` today is unverified). |

Resolution note on M5 (harm-flag semantics): brief 07 asked the founder whether a subdimension zero or only a dimension zero removes the premium. The coordinator verified that shipped code and published methodology agree (dimension-level), so the default is to fix the test, not the formula (FD-8).

---

## 5. Conflicts resolved

### 5.1 The seven requested conflicts

| # | Conflict | Recommended resolution | Founder? |
|---|---|---|---|
| 1 | **Umami.** Briefs 07, 08, 03 (and 09, A11Y-R18 for E/I): off on all of `/learn`. Briefs 01, 04, 06, 10: off for Explorers and Investigators, page views for Analysts. Brief 11: page views only, no events. | **Off for all of `/learn` in v1.** One rule ("No tracking on Learn") is simplest to explain to a school's data-protection officer, has one gate, and nothing a child does is measured. Mechanism: a route-aware loader that skips `/learn` (FE-R2), because a nested layout cannot remove the root-layout script (`layout.tsx` lines 116 to 121). Adoption is measured from aggregate server counts on kit files only (section 9). | **Yes** (FD-1). Blocks Phase 1 code. |
| 2 | **Theme.** Scoped light "paper" for Explorers, Investigators and Educators (briefs 03, 05) deviates from CLAUDE.md "dark theme only". | **Yes, scoped.** A `.learn-paper` block following the `.pilot-*` precedent in `globals.css`; no change to `@theme`; the rest of the site stays dark-only. Analysts keep the dark theme inside Learn chrome, with print forced to light. Requires an amendment of the CLAUDE.md convention for `/learn` only. | **Yes** (FD-2). Blocks Phase 1 code. |
| 3 | **URL shape.** Brief 03: `/learn/{band}/{topic}`. Brief 10: flat `/learn/<slug>`, band in metadata. | **Band-first for student pages and experiments** (`/learn/{band}/{topic}`, `/learn/{band}/experiments/{slug}`); **flat for educator plans** (`/learn/educators/plans/{slug}`). Justification below. | No (record in `DECISIONS.md`). |
| 4 | **Indexing of Explorer pages.** | `noindex, follow` via `generateMetadata`, absent from `sitemap.ts`, absent from Pagefind, absent from `llms.txt`. Do NOT `Disallow` in `robots.ts`, because a blocked crawler never sees the `noindex` (DISC-R9). Investigators, Analysts and educator pages are indexable. | No |
| 5 | **Real entities for Investigators.** Brief 04: hand-picked, non-violent cases from a reviewed set. Brief 01: real entities with duty-of-care copy. | **Brief 04.** Enforced in data: Learn imports only the reviewed `learn/cases` set, never `updates/daily` (CS-R1). The 2026-10-14 briefing contains real graphic content (executions, an air strike, detention), and a 12-year-old reading alone is the failure case. Phase 1 may launch with zero real entities. | Default is mine; reviewer identity is the founder's (FD-9, FD-10). |
| 6 | **Licence.** CC BY 4.0 with a "no rating of people" condition (CS-R6). | **CC BY 4.0 for content and worksheets; MIT stays for code. Do not make "no rating of people" a licence condition.** CC BY 4.0 does not allow additional terms that legally restrict what the licence permits (to be confirmed by counsel; this is my reading, not legal advice). Carry the protection as a separate, plainly worded, non-binding "use guidance" statement in every lesson footer and on the safety page: "This method measures institutions. Please do not use it to score, rank or grade a child, a teacher or a family." Also say it to children directly: "Nobody should give you a compassion score." The trademark reservation in `NOTICE.md` (extended to Learn) covers implied endorsement. A binding restriction would require a custom non-CC licence, which loses OER-repository eligibility and is not recommended. Flag for counsel. | **Yes** (FD-3) plus counsel. Blocks launch, not code. |
| 7 | **Reading-level thresholds.** Brief 05: FK grade 4.5 / 7.5 / 10.5. Brief 11: 5 / 8 / 12 as a ratchet. Brief 02: design targets about grade 3 / 6 to 7 / 9 to 10. | **Use brief 05's ceilings as the gate**: FK grade at most 4.5 (Explorers), 7.5 (Investigators), 10.5 (Analysts); mean/max sentence length 10/18, 14/25, 18/32; at most 120 words per section for Explorers; Researchers-style content warn-only. Add brief 11's per-page **ratchet** (a committed baseline; a page may not get harder than its recorded grade) and brief 05's recorded human read-through. Brief 02's levels remain design targets, not gates. Rationale: 05's ceilings are stricter, so passing them passes 11; the ratchet stops drift; FK is only a floor and the human review is the real check. Recalibrate after the first pages are tried with real teachers. | No |

**URL shape justification.**
- **Link-allowlist gate (UX-R14, QA-R9).** The rule "Explorers and Investigators may not link to X" is cleanest when keyed on a path prefix that a build test can read from the built HTML path itself. With a flat shape the gate has to trust a metadata field; a mislabelled page would silently get the wrong allowlist. The same holds for the Explorer `noindex`, sitemap exclusion, Pagefind exclusion and review-log checks.
- **Citation permanence (DISC-R6, DISC-R7).** Brief 10's concern is a lesson moving between bands. In this design the pages for different bands are separately written pages, not one page that moves, so there is nothing to move. Permanence is protected by rules instead: band ids and topic slugs are immutable (a band's display label may change, its id may not); any unavoidable change needs an nginx 301 in `nginx-ssl.conf` and `nginx.conf` (Next cannot redirect under static export), guarded by `test:nginx-redirect-parity`; and the pages teachers and students actually cite, the lesson plans, are flat and band-independent.

### 5.2 Further conflicts found while synthesising

| # | Conflict | Resolution | Founder? |
|---|---|---|---|
| 8 | **Persisted reading settings.** A11Y-R3, R5, R17 want theme and reading settings in `localStorage`. PRIV-R8, UX-R12 and QA-R4 ban all storage on Learn, because shared school devices would leak one child's choices to the next. | **No storage of any kind in v1.** Settings (if any) live in memory and reset on reload; the OS-level `prefers-color-scheme`, `prefers-contrast` and `prefers-reduced-motion` are honoured. A persisted "Reading settings" panel, Projector mode and dyslexia options are Phase 2 candidates and need a separate decision with a visible reset control. | Yes (FD-20), non-blocking |
| 9 | **Child helpline link vs "no outbound links for Explorers."** CS-R3 wants a helpline directory link on every page; PRIV-R7 allows no outbound links from Explorers and routes others through `/learn/leaving/<slug>`. | A child in distress should not meet a speed bump. Allow **one named exception**: the checked helpline directory link, direct, `rel="noopener noreferrer"`, `referrerpolicy="no-referrer"`, held in a single constant that the link gate allowlists by name. The care text also stands alone without the link ("talk to an adult you trust"). | Yes (FD-11), with the safeguarding reviewer |
| 10 | **"Full version" link directness.** UX-R14 lets Explorers link directly to `/methodology`; UX-R15 and PRIV-R2 say adults reach the full site only through the interstitial; the main site has the newsletter, Umami and commercial nav. | Explorers and Investigators link only to `/learn/grown-ups`, a static interstitial with a per-topic anchor that names the full-version target. The honesty gate asserts both that the interstitial anchor exists and that its target exists. Analysts and educators may link directly to `/methodology`, `/dimensions/<slug>` and `/glossary`. | No |
| 11 | **Server logs vs measuring downloads.** PRIV-R3 wants `access_log off` for `/learn/`; EDU-R7 measures reach from logs. | `access_log off` for all of `/learn/` except one location for kit files, which uses a `log_format` that keeps date, path, status and referrer host and drops IP and user agent. The upstream openresty proxy's log retention is outside the repo and unknown; the founder checks it before the privacy page may claim anything about retention (FD-13). | Yes (FD-13) |
| 12 | **Real seed example.** Brief 06 and brief 04 use Lisbon and Porto (seed 60.9 against a pending measured value). Brief 02 says teach it with an invented example until the RC-2 study exists. QA-R10 and DC-03 forbid narrating an unapplied proposal as a movement. | **Invented "Seedville" for every band in Phase 1.** Swap in Lisbon and Porto in Phase 2 only after the RC-2 study document exists, the values are applied or clearly labelled "proposed, not applied, low confidence", and the founder agrees. Never call the 49 entities at 60.9 "seeds". | Yes (FD-16) |
| 13 | **Who signs off pages.** Brief 04: named educator plus safeguarding-trained reviewer. Brief 11: the founder. Brief 05: two educators and one disabled learner or advocate for reading and screen-reader review. | One committed record, `docs/learn/review-log.json`, with a content hash per page. Required entries: a named educator (reading level and age fit) for every Explorer and Investigator page; a safeguarding-trained reviewer for any page with real entities or content-note blocks; the founder approves publication. A page whose hash changed since sign-off fails the gate. Brief 05's separate `reviewedWith` metadata is merged into this one log. | Yes (FD-10) |
| 14 | **"Assess your school".** Brief 07: client-side checklist with state. Brief 11: must not output a band or composite. Brief 04: systems questions only, groups only. Brief 09: nothing leaves the browser. | **A printable only, no interactive state, no total, no band.** Systems-only process questions (A1, A3, A4, EQ4, B4, AB2, S1; I3, B1, E1 dropped below Analysts), phrased "write about how things work, never about a named person", with the disclosure guidance. Phase 2. | No |
| 15 | **Type sizing.** Explorers line height 1.6 and 60 characters (brief 03) against 1.7 and 50 (brief 05). | Use brief 05's table (the accessibility owner's, and stricter): Explorers 20px / 1.7 / 50ch; Investigators 18px / 1.65 / 60ch; Analysts 17px / 1.6 / 68ch. Left-aligned, never justified. | No |
| 16 | **Topic slugs.** Brief 03 (`how-we-measure`...) against brief 07 (`method`, `analysis`...). | Brief 03's plain slugs (section 3.1). | No |
| 17 | **Which lesson first.** Brief 09: Explorers first. Brief 10: highest-demand query classes are data literacy and uncertainty (hypotheses, unmeasured). | The single Phase 1 lesson is the Investigators "coin, dice, range" uncertainty lesson: it is indexable, maps to the strongest standards (statistics, TOK), and avoids dependence on a noindex page for the only educator asset. Explorers and Analysts kits follow in Phase 2. | Yes, minor (FD-18) |
| 18 | **Standards tags.** Brief 09 wants tags on every kit (Phase 1); brief 10 forbids `educationalAlignment` until an educator verifies. Coordinator places sign-off in Phase 3. | Phase 1 lessons state the skills practised in plain words, with no framework codes and no schema alignment. Tags, the standards map and `educationalAlignment` arrive in Phase 3, from a reviewed `alignments.ts`. Risk: weaker discoverability in the interim. | No |
| 19 | **Analysts and `/updates`.** Brief 04 refuses the live feed for anyone under 15 and allows Analysts real harms behind notes. Brief 10 forbids Explorer/Investigator links to it. | In v1 no Learn page links to `/updates` or embeds the feed. Analysts see real harms only through the reviewed set. Revisit in Phase 2. | No |
| 20 | **Dev-time vs release-time browser checks.** Brief 05 and 11 want axe, PDF render, request interception; brief 11 advises against adding Chromium to the pre-push chain. | Blocking gates are dependency-free Node scans of source and built HTML. Browser checks (axe-core advisory, PDF render, runtime request interception, contrast in a real browser, screen-reader checklist) form a founder-run release checklist. `axe-core`, if added, is dev-only (FD-19). | Yes (FD-19) |

---

## 6. Phased scope

### 6.1 Phase 1: smallest valuable launch

**Goal.** An educator can land on Learn, choose a band, read a complete five-topic path, run three experiments that use the real scorer, and print one lesson, with nothing collected, nothing sold and nothing graphic.

**Must have:**
1. **Learn shell.** Own chrome under `/learn/**` (extend the `ChromeGate` pattern); no Umami; no newsletter; no search; no Contact Sales or any commercial nav; LearnBar not sticky.
2. **Landing page** `/learn` routing by choice, never by age question; band hubs for Explorers, Investigators, Analysts; `/learn/grown-ups` interstitial.
3. **One complete path per band for the five topics:** 3 bands x 5 topics, each with the page template (outcome, short chunks, "Try it" link where relevant, words to know, "Check your understanding", "If you remember one thing", step indicator as text, full-version link).
4. **Three experiments**, each with a band variant (section 7, LRN-25 to LRN-27):
   - **Build-a-score** on the real scorer (`@/lib/scoring`).
   - **Seed vs measurement** on invented "Seedville".
   - **Coin, dice, range** (Explorers: two judges and a coin; Investigators: dice bootstrap; Analysts: bootstrap on invented data plus the honesty card that published entity composites carry no interval yet).
5. **Educator hub** `/learn/educators` with **one printable lesson** (Investigators uncertainty), teacher copy and student sheet, plus `/learn/educators/safety`.
6. **Child-readable privacy page** `/learn/privacy` (with the adult/educator version beneath it).
7. **Child duty-of-care component** on every Learn page, and the "people are not the score" line before any real place.
8. **The fix-before-teaching items** M2, M3, M5, M6 closed; M1 and M4 either closed or covered by their mitigation gate (section 4).
9. **All gates** in section 8, with planted probes, plus registration of the Learn surface in `docs/DEFECT_CLASS_REGISTRY.md` before the first page ships (QA-R11).
10. **Server hardening** for `/learn/` (log policy, repeated security headers, `Referrer-Policy: no-referrer`, CSP with `form-action 'none'`), applied identically to `nginx.conf` and `nginx-ssl.conf` (LRN-12).
11. **Discovery basics:** `noindex` for Explorers, sitemap entries for indexable pages only, `LearningResource` JSON-LD for indexable pages, cite block with version, Learn section in `llms.txt` (generated).
12. **Pre-promotion pilot:** the lesson tested with five teachers from personal networks, no payment, no student data (EDU-R1, brief 09 Q5).

**Should (Phase 1 if time allows, else Phase 2):**
- Path-scoped nginx block for `/u/` returning 204/403 when the referrer contains `/learn/` (PRIV-R5, defence in depth only).
- Two build-time static PDFs for the lesson kit (teacher copy and student sheet), generated from the same lesson data, to give a countable "download". Fallback if PDFs are deferred: the print-ready HTML page is the kit and the metric is page requests to the kit location (weaker; see section 9).

**Should wait (Phase 2 or later):** everything in 6.2 and 6.3.

**Explicitly excluded from Phase 1:**
- Band-sorting with exact edges (M1), numbered tier ladders and spot-the-rung (M4), design-a-corrective-action interactive, "reproduce a published composite" from real index rows, real Lisbon/Porto, pilot-model figures, "assess your school", Researchers hub, persisted settings, PDF dependencies beyond the build-time render, standards alignment, OER listings.

### 6.2 Phase 2: depth and breadth
- **Full objective matrix** (brief 02): every cell of the 4 x 5 matrix, with the Researchers cells delivered as the Analysts "Go further" block and second-level pages for the progression rungs.
- **More experiments:** band sorting (after B2), spot-the-evidence-rung (after M4), design a corrective action, reproduce a published composite (3 curated real entities, within 0.1 of the published value, VIZ-R1 Analysts mode), uncertainty with the AI-pilot range figure reused intact with its in-SVG "UNOFFICIAL PILOT, not a ranking" footer (D-29/D-29a), real Lisbon/Porto seed vs measurement (FD-16).
- **Systems-only "assess your school" printable** (conflict 14).
- Educator kits for the other two student bands (three kits in total).
- Persisted reading settings and Projector mode if approved (FD-20); `Quiz` flashcard markup on stable vocabulary for Investigators upward (DISC-R5); "Explained for students" links from `/methodology` and `/dimensions/<slug>` back to Learn (DISC-R13); Pagefind band filters.

### 6.3 Phase 3: adoption
- **Standards alignment sign-off** by a named educator; `alignments.ts` populated; standards map page; `educationalAlignment` emitted only for signed-off entries.
- **OER distribution:** OER Commons and similar after the pilot and a terms check; one free listing each on TES and Teachers Pay Teachers only if terms allow no commercial CTA; contributor posts in teacher communities (EDU-R4, EDU-R9).
- **University adoption:** instructor notes for statistics, public policy and computing; personal outreach to about 20 instructors; auditable syllabus links (EDU-R5). A Researchers instructor note is the fourth kit.
- Funder evidence document "what we collect and do not collect" (EDU-R6); an optional pre-registered teacher pilot with IRB review if published (nonprofit document 4.3).

### 6.4 Excluded in every phase (the refusal list, deduplicated)
Accounts, class codes, rosters, saved progress, certificates, badges, streaks, leaderboards, points, timers; quizzes that produce a "score"; any free-text input from a child; age gates and birth-date questions; any analytics on Learn; newsletter or email capture on or reachable from Learn; commercial CTAs, pricing, Gumroad, Score Watch; links to the Agent Hub or user-generated content; third-party embeds, remote fonts, CDNs, text-to-speech services and accessibility overlays; a second or "simplified" copy of the scoring maths; a compassion score for a child, class, teacher or family, including "how compassionate are you?" quizzes; "grade your country or a real company" and "find your country" for the young bands; "what would X need to rank higher?" on real entities; real "worst performers" for any band below Analysts; radar charts; ranked or band-coloured AI-model figures or bare model scores; fake confidence bands on entity scores; a "60.9 club"; worksheets built on a named victim; an automated kid-safe classifier as a release gate; `Course`, FAQ, practice-problem or learning-video markup; keyword-variant doorway pages; unverified standards alignments; an educator email list at launch.

---

## 7. Requirements

Each requirement has a phase (P1, P2, P3), a source, and acceptance criteria (AC) written as observable behaviour. "Gate" names the section 8 check that enforces it. Priorities: P1 requirements are Must unless marked Should.

### 7.1 Fix-before-teaching

**LRN-01 (P1, M1).** Band-edge handling until B2 is resolved. Source: LD-R3, VIZ-R2.
- AC: no Learn exercise, fixture or copy uses a value within 0.5 of 20, 40, 60 or 80; all band labels come from `getBand`; no Learn file reads `BANDS.min` or `BANDS.max`.
- AC: when B2 is resolved, a follow-up requirement removes the exclusion and pins the exact-edge fixtures (20.0/20.1, 40.0/40.1, 60.0/60.1, 80.0/80.1) in the fidelity gate.

**LRN-02 (P1, M2).** `/methodology` uses one dimension scale. Source: LD-R2.
- AC: the text at the four cited locations no longer says "out of 10" for a 0 to 5 dimension mean; `test:method-claims` asserts it; Learn never shows "/10" below the Analysts "Go further" block.

**LRN-03 (P1, M3).** The spread-step caption is truthful. Source: LD-R4, VIZ-R7.
- AC: the caption and `INTEGRATION_PREMIUM.detail` state that the premium rewards clearing 4.0 on every dimension and that the spread step is dormant on real data; the three strings in section 3.4 rule 3 are denied in `src/app/learn/**` and `src/data/learn/**`.

**LRN-04 (P1, M4).** Tier numbering is not taught. Source: VIZ-R4.
- AC: every Learn ladder uses words only, strongest at the top, with no numbers or letters; a gate fails any Learn tier ladder that shows a tier number until FD-7 is decided.

**LRN-05 (P1, M5).** The scoring test guards shipped code. Source: FE-R6, QA-R2.
- AC: `test-scoring.mjs` loads the real `scoring.ts` through the ts alias loader and compares it to `scoring.mjs` on a golden grid (for example all 8-dimension combinations over {0, 1, 2.5, 4, 5}, sampled, plus edge cases) and on the section 3.3 table; the in-file `calcScores` is gone; the header no longer claims coverage it lacks; a planted mutation (harm flag at subdimension level) fails the test.
- AC: no Learn page displays a computed score before this is merged.

**LRN-06 (P1, M6).** `llms.txt` counts are generated. Source: DISC-R11.
- AC: `llms.txt` is produced at prebuild from `entityCount.ts` and `indexRegistry.ts`; `test:no-stale-counts` fails on a hand-typed count in it (scope of the existing test over `public/` is to be verified and extended if needed).

### 7.2 Shell, privacy and separation

**LRN-07 (P1).** Learn has its own chrome. Source: UX-R5, UX-R6, PRIV-R2, FE-R3.
- AC: on every `/learn/**` page the global Navbar and Footer do not render; a LearnBar (logo, Learn home, Educators, "Grown-ups: main site") and a LearnFooter (licence, safety, privacy) render instead; LearnBar is not sticky; there is no search, newsletter, Services column, Self-Assessment link or Contact Sales.
- AC: Learn is reached from the main site by one entry only: "Learn (students and teachers)" in the Tools dropdown and the footer Research column (`footerLinks.tools` in `nav.ts`); not added to `mainNav`.
- AC: no Learn module imports `SelfAssessment`, `NewsletterSignup`, `@/lib/analytics`, `@/components/purchase/*`, `@/data/gumroad`, `@/components/agent*` or `@/components/model-benchmark/*`.

**LRN-08 (P1).** No analytics on Learn. Source: FE-R2, PRIV-R1, UX-R16, A11Y-R18, EDU-R7.
- AC: built HTML under `out/learn/**` contains no Umami script element, no `data-website-id` and no analytics loader code; the mechanism is the architect's choice (route-aware loader that renders nothing on `/learn`), and the PRD prefers one that leaves no loader code in Learn HTML. If the chosen mechanism leaves loader text in shared markup, the gate checks elements and the architect records why.
- AC: no Learn source imports `trackEvent` or calls `umami.track`; no request to `/u/` occurs when a Learn page is exercised (release checklist).
- AC: all non-Learn pages behave as today.

**LRN-09 (P1).** Zero collection and zero storage. Source: PRIV-R8, PRIV-R9, UX-R12, A11Y-R17.
- AC: Learn source and built HTML contain no `<form`, `action=`, `<textarea`, `contenteditable`, text/email/search/password/file inputs, `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `<iframe`, `<embed>`, `<object>`; only range, radio and checkbox inputs and buttons are allowed.
- AC: experiment state lives in memory; reload resets; no URL-encoded state; no `window.confirm` (reset is free).
- AC: each page says, in plain words, "Nothing you do here is saved or sent anywhere."

**LRN-10 (P1).** No commercial content, Agent Hub or user-generated content. Source: PRIV-R6, UX-R14, EDU-R10, QA-R6.
- AC: no Learn page or kit file contains a Gumroad URL from `gumroad.ts`, `formspree`, `listmonk`, or links to pricing, purchase, contact-sales, self-assessment, services, community routes, the Agent Hub or comments; no Learn page implies that learning raises a score (phrase list in the gate).
- AC: every licence footer carries the firewall line "Use of these materials is never recorded against an entity and never affects a score."

**LRN-11 (P1).** Link allowlist and interstitials. Source: UX-R14, UX-R15, PRIV-R7, QA-R9.
- AC: Explorers and Investigators may link to `/learn/**` only, plus the single named helpline exception (conflict 9). They may not link to `/methodology`, `/updates`, `/indexes`, entity pages, `/ai-models`, `/contact*`, `/services`, the Agent Hub or any outbound host. Their "full version" links go to `/learn/grown-ups`.
- AC: `/learn/grown-ups` states plainly that the main site covers hard topics such as war and detention and is written for adults, offers "Continue to the main site", and states it is not an age gate.
- AC: Analysts and educators may link to `/methodology`, `/dimensions/<slug>`, `/glossary`, `/cite`. Any other external host must go through `/learn/leaving/<slug>` with a fixed build-time slug table (no `?to=` parameter), the plain-words text "You are going to another website. We don't control it. Ask a grown-up if you're not sure.", and "Stay here" and "Go". All outbound anchors carry `rel="noopener noreferrer nofollow"` and `referrerpolicy="no-referrer"`.
- AC: the allowlist is derived from the registry; a missing or extra link fails the gate.

**LRN-12 (P1).** Server policy for `/learn/`. Source: PRIV-R3, PRIV-R4, PRIV-R5, FE-R5.
- AC: a `location ^~ /learn/` block (the `^~` prevents the regex asset locations taking precedence) sets `access_log off` (kit files use the anonymised format of conflict 11), repeats every server-level security header (an `add_header` inside a location drops the inherited ones), sets `Referrer-Policy: no-referrer`, and sets a CSP with `form-action 'none'`, `frame-src 'none'`, `base-uri 'none'`, `object-src 'none'` and `connect-src 'self'`. `'unsafe-inline'` for scripts and styles is accepted in v1 with a follow-up to hash inline scripts (FD-15).
- AC: both `nginx.conf` and `nginx-ssl.conf` change identically; `test:nginx-redirect-parity` stays green; a config test asserts the log directive and the full header set.
- AC: applied only after a staging check; deploy is founder-gated.

**LRN-13 (P1).** Child-readable privacy page. Source: PRIV-R10.
- AC: `/learn/privacy`, linked from every Learn footer, at about US grade 4, states only claims the gates prove (no cookies, no accounts, no email, nothing typed leaves the browser, no analytics), and states log handling exactly as the founder confirms it (FD-13); an adult/educator version below it covers logs, the upstream proxy, the absence of analytics, the legal posture (without claiming "COPPA compliant"; that needs counsel) and a contact address.
- AC: the page does not link to a main-site privacy page that does not exist; it is self-contained (the site has no privacy page today; a backlog row is filed, FD-14).
- AC: the notice cannot say "no cookies" unless the storage/cookie check is green (a claim-to-gate map in the gate).

**LRN-14 (P1).** Child duty-of-care component. Source: CS-R3, CS-R2, brief 04.
- AC: a new component, separate from `DUTY_OF_CARE` (which is about AI systems and is not child-readable), appears on every Learn page: "If something here, or in your life, is upsetting you, stop and talk to an adult you trust. You can also contact a helpline for young people where you live." It links to the checked helpline directory chosen in FD-11 (the single allowlisted exception).
- AC: any block that shows a real entity opens with the care component, a content note, a "Choose a gentler example" link, and click-to-reveal body (not auto-shown), preceded by: "This score is about how a government or organization behaves. It is not about the people who live there. Often the people are the ones the score is about protecting."
- AC: the educator safety page carries the teacher note: never have pupils look up their own home countries and never single out where a pupil comes from; and the disclosure guidance: follow the school's safeguarding procedure and do not keep the sheet.
- AC: the text is reviewed by the safeguarding reviewer and re-reviewed quarterly (FD-11).

### 7.3 Content

**LRN-15 (P1).** Landing and routing. Source: UX-R1, UX-R3, UX-R4.
- AC: routes `/learn`, `/learn/{explorers|investigators|analysts}`, `/learn/{band}/{topic}`, `/learn/{band}/experiments/{slug}`, `/learn/experiments`, `/learn/educators`, `/learn/educators/plans/{slug}` and `/student`, `/learn/educators/safety`, `/learn/privacy`, `/learn/grown-ups` are generated from one typed registry (`src/data/learn/registry.ts`) via `generateStaticParams`; no route count is typed anywhere.
- AC: the landing offers exactly two choices, then three band cards labelled by age and reading level, with "Not sure? Start with Explorers. You can switch any time." Every band page has an "Other levels" row. No age or birth-date input.
- AC: every page is static; none uses `headers()`, `cookies()` or route handlers.

**LRN-16 (P1).** Topic page template and a complete path per band. Source: UX-R9, LD-R5, LD-R6, LD-R8, LD-R9.
- AC: for each of Explorers, Investigators and Analysts, all five topics exist and are reachable from the band hub in order ("Step N of 5" as static text, no progress tracking).
- AC: each page has one H1, "You will learn" outcomes, chunks of at most 120 words under headings that state the idea, a worked example before abstraction (numbers, then a faded example, then the formula; Explorers never see a formula), a "Words we used" list, a "Check your understanding" block, an "If you remember one thing" line, a spaced-retrieval recall question from the previous page, a "What we left out" line and a full-version link (LRN-11).
- AC: Explorers use the invented Bramblewick setting (library, bakery, school) on all five pages; its scenarios mirror real subdimensions (refusal, access, apology).

**LRN-17 (P1).** Teaching accuracy rules apply. Source: section 3.4, LD-R2/R3/R4/R7, VIZ-R7.
- AC: all eight rules in 3.4 hold; the copy guard and facts gate (LRN-39) enforce rules 1 to 3 and 6 to 7 mechanically.

**LRN-18 (P1).** Corrective actions and the repair ladder. Source: LD-R1, CS-R8, VIZ-R6.
- AC: the `fixing-things` page for each band teaches both meanings on the four-step ladder (3.2); Explorers use only the invented referee; Investigators and Analysts show real benchmark corrections from `learn/corrections` as a four-stop timeline ("We said", "We checked", "We corrected publicly", "What changed") with a "No score changed" badge only when true; each stop cites one CHANGELOG heading verified verbatim.
- AC: the lesson states honest limits (not faulted is not sound; a correction can fix a description and leave scores alone).
- AC: seed entries MS-5 (CHANGELOG 2026-09-14 and 2026-09-29) and EV-1 (2026-09-21) are checked for accuracy against the changelog before use.

**LRN-19 (P1).** Invented examples are labelled and reused. Source: LD-R9, DISC-R9, QA-R5.
- AC: every invented figure carries a visible "Invented example: not a real score" label inside the same element as the number; invented town and library names pass the entity-name scan (allowlist of fictional names maintained explicitly).
- AC: invented examples are never given in `LearningResource` text that could be quoted as real, and never appear in `llms.txt`.

**LRN-20 (P1 plumbing, content optional).** Real examples come only from a reviewed set. Source: CS-R1, FE-R10, brief 04.
- AC: a typed `LearnPage` registry has `band` and `realEntities: boolean`; a test fails if an Explorer or Investigator page has `realEntities: true` outside the reviewed `learn/cases` set, or imports any `src/data/indexes/*.json` entity file; Learn imports nothing from `updates/daily`.
- AC: Investigator cases contain no death, violence, sexual harm or detention. Candidate cases named by the briefs: Lisbon's annual homeless count, benchmark corrections. No country or conflict-affected entity appears below Analysts. Real scores are never shown in lowest-first order and the tokens "worst", "bottom", "lowest-ranked", "this country is", "evil", "failing nation" are denied.
- AC: any real score on a page is adjacent to a seed/uncertainty caveat and an as-of date, sourced from a data file, and is an applied change (never an unapplied proposal; DC-03).
- AC: Phase 1 may publish with zero real entities.

**LRN-21 (P1).** "Check your understanding" collects nothing. Source: LD-R8, CS-R4, A11Y-R13.
- AC: only tap-to-sort, "which clue is stronger?", predict-then-reveal and spot-the-error formats, plus a printable "explain it to someone" prompt; React state only; feedback says why; no points, streaks, badges, timers or red X marks; error copy never says "wrong".
- AC: every slider activity asks "what evidence would justify this?" and closes with "Who could still be suffering even if the score were high?"; the premium is taught as "what does inconsistency hide?" (CS-R4).

**LRN-22 (P1).** Inline glossary replaces hover tooltips. Source: A11Y-R14, UX-R9.
- AC: first use of a term on a page is a `<button aria-expanded aria-controls>` toggling a visible note; a "Words we used" `<dl>` is always visible and printable; the glossary has a `plain` field per band, one band below the page's reading ceiling; every term used is defined; the Radix hover `DefinedTerm` is not used.

**LRN-23 (P1).** Reading level and typography per band. Source: conflict 7 and 15, A11Y-R4, A11Y-R6, A11Y-R7, QA-R7, LD-R6.
- AC: ceilings and ratchet as in conflict 7; each page declares `data-band` (missing fails); Explorer sections at most 120 words; no jargon list terms (sigma, standard deviation, bootstrap, composite) on Explorers or Investigators unless defined on the same page; Explorers never show AB or dimension codes; the FK exemption list for proper nouns and glossary terms is capped at 5% of words; every page has a recorded human read-through in `review-log.json` newer than its content hash.
- AC: the FK grade is never shown to children.

### 7.4 Experiments

**LRN-24 (P1).** Shared experiment rules. Source: UX-R12, UX-R13, A11Y-R8 to R12, FE-R4, VIZ-R7.
- AC: each experiment is a client component using local state only; it calls `computeCompositeFromDimensions` from `@/lib/scoring` and contains no second implementation of the arithmetic (no `/ 4) * 100`, `0.75` or `weaknessFactor` outside `scoring.*`).
- AC: instructions and the printable worksheet are in the HTML before hydration; with JavaScript off a `<noscript>` note points to the worksheet; every experiment has a "Start over" that is free and returns focus to the first control.
- AC: native `<input type="range">` with visible label, `min`, `max`, `step`, and `aria-valuetext` in words ("3 of 5, Developing"); a paired numeric input; plus and minus buttons of at least 44px; drag is never required; no `role="slider"` div.
- AC: sorting is tap-item-then-tap-bin plus keyboard and a "Move to" select; no HTML5 drag-and-drop; wrong items get a neutral "try again" and a hint; after two tries "Show me why".
- AC: one polite live region (`role="status"`, `aria-atomic="true"`), results debounced about 600 ms after the last input, announcement text equal to the visible text; announce band changes, not every tick.
- AC: motion only on user action; `prefers-reduced-motion` respected; dice and bootstrap step by buttons, never autoplay.
- AC: every figure has `role="img"`, a title, an `aria-label` with the numbers, a visible data table in `<details>` and a shape or text alongside colour; a black-and-white print variant.
- AC: an "Explain my result" panel built from the scorer's own output; Explorers get one sentence and a picture, Investigators a step list, Analysts the full arithmetic and a source link.
- AC: results never sit beside a real entity's score as if comparable; no "reach Exemplary" goal; sliders start at an unmarked neutral and the result is hidden until first interaction.

**LRN-25 (P1).** Experiment 1: build-a-score. Source: VIZ-R1, CS-R4, FE-R6, LD-R4.
- AC (all bands): uses the real scorer; presets load the golden cases (flat does not beat spiky; the 4.0 cliff; the zero switch) each with a one-line takeaway; a fixed note on the dormant spread step: "never happened in real data (largest spread 0.768)", the 0.768 read from the facts module, not typed; a version stamp from `METHODOLOGY_VERSION`.
- AC (Explorers): eight jars of counters for an invented library with no formula and the line "Bonus points when every jar reaches 4. Each jar under 4 takes some bonus away. An empty jar takes it all."
- AC (Investigators): sliders, the stacked base/premium bar, the weak-dimension dots labelled by code, and the step-list explanation.
- AC (Analysts): the full premium meter, spread needle and harm switch, full arithmetic, and the methodology worked example as a preset (the Abridge example pinned by `test:method-claims`).
- AC: "What we left out" states the simplification and links to the full version.

**LRN-26 (P1).** Experiment 2: seed vs measurement. Source: VIZ-R5, RC-2, conflict 12.
- AC: an invented "Seedville" in every band; a hollow dashed dot (starting value, "a placeholder, not a finding") against a solid dot (measured), with a sensitivity bracket, and the near-flat seed profile beside the varied measured profile as the visual tell; a second invented town showing "two places, same number, because neither had been measured".
- AC: copy never says that the entities at 60.9 are seeds; no Lisbon/Porto in Phase 1.
- AC: Explorers get a "Seedville library" with no numbers beyond a simple line.

**LRN-27 (P1).** Experiment 3: coin, dice, range. Source: VIZ-R3, QA-R2.
- AC: Explorers: two judges score the same invented poster 3 and 4; a coin picks whom to listen to; "the answer depended on the judge." Investigators: ten invented question scores; "Redraw" rolls dice to pick ten with replacement; buttons run x1, x20 and x1000; the middle 95% is shaded; a seeded generator whose seed is shown so a class sees identical results. Analysts: overlap is labelled "Not separated" using the report vocabulary; the honesty card says published entity composites carry no interval yet and are drawn as "range not yet measured", never with an invented band.
- AC: copy never says "proves" or "exact"; the client resample loop calls the real scorer and has a parity test against `bootstrapCompositeUncertainty` on a fixed seed (that function lives in Node-only `scripts/lib/evaluation-statistics.mjs` and is not imported); across 1,000 seeded runs the displayed interval contains the true mean at the stated coverage within a stated tolerance.
- AC: no pilot-model figure in Phase 1.

**LRN-28 (P1).** Golden experiment fixtures. Source: QA-R2, FE-R6.
- AC: `src/data/learn/golden.ts` stores each worked example (inputs, band, composite); the section 3.3 table is included; the fidelity gate (LRN-40) asserts them against the real scorer so lesson copy cannot drift from the formula.

### 7.5 Educators

**LRN-29 (P1).** Educator hub and one printable lesson. Source: EDU-R1, UX-R11, FE-R7, LD-R12.
- AC: `/learn/educators` is the canonical home with direct links, no signup, no email wall; one lesson (Investigators uncertainty) has a teacher copy and a student sheet as separate routes; the teacher copy has band, duration, prep time, materials, three learning goals, timed steps (about a 5/15/20/5 structure), discussion questions, a duty-of-care note with skip options, an answer key after a page break, the misconception it targets, a 10-minute offline version of the experiment (paper, pens, dice), a "what this does not claim" box, a licence and source line, and the version and date.
- AC: print: light background, black text, no `@page` size (Letter and A4 both work), external hrefs printed, `break-inside: avoid` on steps, 14pt or larger for sheets, no colour dependency; the student sheet is its own route so nothing is hidden by CSS; a counts-bearing handout carries "as of <date>" from the build manifest (QA-R3).
- AC: the safety page `/learn/educators/safety` covers duty of care, disclosure, the "people are not the score" teacher note, the use-guidance statement, privacy and licence.
- AC: ink-light black-and-white worksheet, and the lesson works with one device per pair or with no device.

**LRN-30 (P1).** Licence and use guidance. Source: EDU-R3, CS-R6, DISC-R3, conflict 6.
- AC: content and worksheets carry a visible CC BY 4.0 line; code stays MIT; `NOTICE.md` and a `DECISIONS.md` entry record it once approved (FD-3); the JSON-LD `license` field is omitted until the founder confirms; the non-binding use guidance appears in every lesson footer and on the safety page; counsel has reviewed the wording before public announcement.

**LRN-31 (P1).** Educator feedback by plain mailto. Source: EDU-R8, PRIV-R6.
- AC: each kit carries "Taught this? Tell us what worked, from an adult email address" as a plain `mailto:` link with no prefilled body, never on a child-facing page; asks only band, time taken, one confusion, would use again; never asks for names, school names, counts by name or student work; replies within 5 working days by the founder or a delegate; any factual error reported is corrected and logged in `CHANGELOG.md`.

### 7.6 Discovery

**LRN-32 (P1).** Indexing. Source: DISC-R9, FE-R8, conflict 4.
- AC: Explorer pages emit `robots: { index: false, follow: true }`; `sitemap.ts` gets a `learnPages` array generated from the registry and excludes Explorer pages; Pagefind excludes Explorer pages and print sheets; `robots.ts` has no Learn `Disallow`; a parity test asserts every indexable `out/learn/**/index.html` is in the sitemap and every noindex page is not; every page has a self-referential canonical.
- AC: the Learn chrome omits global search.

**LRN-33 (P1).** Structured data. Source: DISC-R1, DISC-R4, DISC-R5, DISC-R10.
- AC: indexable lesson and activity pages emit `LearningResource` (name, description, absolute url, learningResourceType, educationalUse, educationalLevel, typicalAgeRange, audience role, `teaches` as references to existing glossary/dimension terms, timeRequired, isAccessibleForFree, version, dates, publisher and author as `{"@id": ".../#organization"}`, `isBasedOn` `/methodology`); no named human author unless a real, credited person wrote and reviewed it; no `Course`, FAQ, practice-problem or learning-video markup; no `educationalAlignment` until Phase 3; `license` omitted until FD-3.
- AC: all Learn SEO strings, titles, OG images and structured data pass the AI-model lexicon check (`assertLexicon`, never a weaker copy; D-29/D-29a): no model ranks, bands, colours, sorting or bare scores; Explorer and Investigator pages mention no AI model.

**LRN-34 (P1).** Cite block and versions. Source: DISC-R7.
- AC: each lesson shows "Version X.Y, last reviewed <date>, teaches methodology <version>" and an append-only changelog at its foot; a cite block (APA, MLA, plain) reuses `CopyCiteButton` (client-side only); a lesson that teaches a superseded `METHODOLOGY_VERSION` is flagged by the build.

**LRN-35 (P1).** `llms.txt` Learn section. Source: DISC-R11.
- AC: a generated `## Learn` section lists the educator hub, Learn home and the cite anchor; states that "invented" examples are fictional and are not benchmark data; omits Explorer URLs.

### 7.7 Phase 2 and 3 requirements

**LRN-36 (P2).** Full objective matrix including Researchers cells as the Analysts "Go further" block; second-level pages for the progression rungs. AC: every cell in the brief 02 matrix has a published page or block; reading ceilings apply; Researchers content is warn-only.
**LRN-37 (P2).** Additional experiments: band sorting (after M1 closed, with exact-edge fixtures), spot-the-rung (after M4 closed), design-a-corrective-action, reproduce-a-published-composite (3 curated entities each reproduce within 0.1 of the published composite; a failure is reported as a data defect, never loosened), pilot-range uncertainty with the intact in-SVG "UNOFFICIAL PILOT, not a ranking" footer (D-29a).
**LRN-38 (P2).** Systems-only "assess your school" printable (conflict 14). AC: printable only; no state, total or band; systems questions only; groups only; the instruction "Write about how things work, never about a named person"; disclosure guidance for educators.
**LRN-46 (P2).** Kits for the remaining student bands; persisted reading settings and Projector mode if FD-20 approves; flashcard `Quiz` markup (Investigators upward, vocabulary only, no entity scores, no AI models); "Explained for students" links from `/methodology` and `/dimensions/<slug>`.
**LRN-47 (P3).** Standards alignment: reviewed `alignments.ts` signed off by a named educator; standards map page labelled "suggested alignment, teacher to verify" (never "certified"); `educationalAlignment` only for signed entries.
**LRN-48 (P3).** OER and community distribution (EDU-R4, EDU-R9); university instructor notes and outreach (EDU-R5); funder evidence document (EDU-R6).

(LRN-39 to LRN-45 and LRN-49 to LRN-51 are the gates in section 8.)

---

## 8. Gate list mapped to requirements

All gates follow the repo's house pattern (`site/scripts/lib/html-gate-harness.mjs`, as used by `test-model-html-leak.mjs`): planted probes must fail first, then the real built tree in `site/out` must pass, with a `--require-out` flag, and each gate fails if it scanned zero Explorer, Investigator, Analyst or Educator files (a green run over an empty glob is a false pass). All join the `npm test` chain and the pre-push slices, with a `test:learn` umbrella so they can run in a slice, and are listed in `test:script-syntax`. The Learn surface is registered in `docs/DEFECT_CLASS_REGISTRY.md` (DC-02 and DC-03 sites, with a negative-control note) before the first page ships (QA-R11).

| Req | Gate (script) | Enforces | Source IDs | Planted probes that must fail | Real fixture that must pass |
|---|---|---|---|---|---|
| **LRN-49** (gate infrastructure) | Defect registry entry + `test:learn` umbrella + fail-on-zero | All below | QA-R11 | An empty Learn glob | A Learn tree with one page per band |
| **LRN-39** | **Method-claim parity** (`test:method-claims`, extended). Method facts live in `src/data/learn/methodFacts.ts`; prose renders from it; the test recomputes against `scoring.mjs`; a lint rejects numeric method sentences ("sigma", "premium", "band", "out of 100", "weighted") not sourced from the facts module; deny strings across `src/app/learn/**`: "base /80", "balanced beats spiky", the three strings of 3.4 rule 3, "/10". | LRN-02, 03, 04, 17, 25 | QA-R1, LD-R2/R3/R4, VIZ-R7 | `premium: 0.5`; a step marked reachable that is not; copy "a balanced profile always beats a spiky one"; "out of 10" | The reachable premium set and maximum standard deviation 2.5; `[3 x 8]` 50.0 vs `[1,1,1,1,5,5,5,5]` 51.5 |
| **LRN-40** | **Experiment fidelity** (`test:learn-experiments`). The component's pure compute function and `scoring.mjs` agree on a fixture table on both `{composite, band, premium}`; `scoring.ts` and `scoring.mjs` agree; no second implementation. Table includes all 0s, all 1s, all 5s, one dimension 0 with seven 5s, 4.0 x 8 vs 3.9 x 8, spread exactly at the trigger and just above, a base of 95 plus premium clamped to 100, rounding-then-band order (20.04 vs 20.05), and the exact-edge grid once M1 closes. Plus dice/bootstrap coverage over 1,000 seeded runs and "proves/exact" copy ban. | LRN-05, 24, 25, 27, 28 | QA-R2, FE-R6 | Band before rounding; `<` instead of `<=`; a missing slider defaulting to 0; forgetting the zero-dimension rule | Section 3.3 table; the Abridge worked example; (Phase 2) three real entities reproduce within 0.1 |
| **LRN-41** | **Counts** (`test:no-stale-counts`, extended). Scan roots add `src/data/learn/**`, educator markdown and `public/llms.txt`; structural nouns ("40 subdimensions", "eight dimensions", "five bands", "forty") only from `dimensions.ts` or scoring exports; built `out/learn/**` numbers equal to a current catalogue count must be template-derived; handouts carry "as of <manifest date>" and a stale check. Counts are read in server components and passed as props (client bundles must not import `entityCount.ts`). | LRN-06, 15, 29 | QA-R3, FE-R9 | `<p>We score 1,156 institutions</p>`; `"seven indexes"` in a Learn data file; a printable with the count typed | A page rendering `SCORED_ENTITY_COUNT_FORMATTED` |
| **LRN-42** | **Reading level** (`test:learn-reading-level`, dependency-free, about 60 lines, with a committed ratchet baseline). | LRN-16, 23, 22 | A11Y-R6/R7, QA-R7, LD-R6 | A paragraph of 30-word sentences with "standard deviation" on an Explorer page; a page with no `data-band` | The first Explorer page after writing, grade recorded in the baseline |
| **LRN-43** | **Accessibility** (`test:learn-a11y`, an in-repo static lint over built HTML, blocking; plus `test:learn-contrast`, `test:learn-motion`, `test:learn-targets`, `test:learn-copy`). Checks: one H1, no skipped heading levels, `lang`, `main`, skip link, `alt` on images, `role="img"` plus title on meaningful SVG, labelled range inputs with `aria-valuetext`, real buttons not clickable `div`s, no positive `tabindex`, no "click here", targets at least 44px (24px floor), no autoplay, animation inside a reduced-motion guard, exactly one live region with equal visible and announced text, band name as text beside every colour swatch, contrast pairs from one `learnTokens` file (4.5:1 text, 3:1 large text and UI; forbidden `muted-subtle` for body text), banned idioms and pressure words (hurry, countdown, streak). | LRN-09, 21, 22, 24 | A11Y-R1 to R17, QA-R8 | `<img>` without `alt`; an unlabelled range input; an SVG without a title; a `div onClick`; a colour-only band; an `h2` to `h4` skip | The build-a-score page with labelled sliders and a live region |
| **LRN-44** | **Link allowlist and links resolve** (`test:learn-links`). Crawls `out/learn/**`; resolves every internal link and `#fragment`; applies the per-band allowlist (LRN-11); every simplified page has a full-version link and the target exists; external hosts only from the fixed table; printable pages have `@media print`, light background and a worksheet table. | LRN-10, 11, 15, 29 | UX-R14, QA-R9, PRIV-R7 | A link to `/learn/nonexistent`; `#missing-anchor`; an Explorer link to `/methodology`; a printable without print CSS | Every current Learn link |
| **LRN-45** | **Crisis vocabulary and entity scan** (`test:learn-duty-of-care`). (1) Entity-name scan: every name and slug from `src/data/indexes/*.json` (reusing the `test:entity-href` loader and `test:encoded-names` variants), word-bounded, case-insensitive, over text and attributes (`alt`, SVG `<title>`) on Explorer pages; hit fails except an explicit fictional-collision allowlist. (2) Vocabulary scan from `src/data/learn/duty-of-care-vocab.ts` (seeded from `dutyOfCare.ts`; war, genocide, execution, torture, massacre, rape, abuse, suicide, self-harm, killed, death toll, detention, famine, starvation, trafficking, bomb, shooting, with stems): Explorers strict; Investigators allow listed terms only inside `data-care-framed` blocks that carry a content note and support line. (3) The `review-log.json` content-hash check (human sign-off cannot be mechanised, only required). Honest limit: this catches vocabulary, not tone. | LRN-14, 19, 20 | QA-R5, CS-R1 | "the town was hit by a war"; "Norway" on an Explorer page; "Sudan" in an SVG title; an Investigators "Lowest-ranked: ..." | A fictional-town Explorer page; an Investigators page with a framed entity block |
| **LRN-50** | **Privacy** (`test:learn-privacy`, three layers per FE-R5). Source layer: forbidden constructs and imports (LRN-07, 09). Output layer: scans `out/learn/**/*.html` for any `<form`, banned inputs, `action=`, Umami element or `data-website-id`, Gumroad URLs, `formspree`, `listmonk`, external hosts in `src`, `href`, `srcset`, CSS `url(` outside the table, `mailto:` with a prefilled body. Static config test for LRN-12. Release-checklist runtime test: every Learn page loaded with request interception shows zero requests beyond same-origin static assets and none to `/u/`, `document.cookie === ''` and empty storage after interaction. ESLint `no-restricted-imports` / `no-restricted-syntax` overrides for early feedback (the node test is the enforcement). Honest limit: a lint, not a sandbox. | LRN-07, 08, 09, 10, 12, 13 | FE-R5, PRIV-R4/R9/R12, QA-R4 | One probe per banned construct, including an `onClick` calling `track(...)` | A built Learn page with only same-origin assets and range inputs |
| **LRN-51** | **Separation, independence and currency** (`test:learn-separation`, extending `test:product-separation` and its waiver mechanism). No Agent Hub or user-generated-content links on Explorer or Investigator pages; no "raise your score", "boost your rating", "get a better score by"; AI-model token rules reused from `test:model-html-leak`; real-example currency: any quoted score or movement comes from a data file, carries an as-of date and is an applied change (extend `unapplied-score-movement` in `site/scripts/lib/lint-rules.mjs`); correction quotes exist verbatim in `CHANGELOG.md` (`test:claim-to-source` pattern). | LRN-10, 18, 20, 33 | QA-R6, QA-R10, DISC-R10 | An Explorer linking `/agent-hub`; "learn this trick to raise your institution's score"; "Model X scores 63"; "Taipei's score fell 8 points"; a changelog quote that does not appear | A Researchers-style page linking `/methodology` and a pilot report (permitted only from Analysts upward) |

Numbering note: LRN-39 to LRN-45 and LRN-49 to LRN-51 are the gate requirements. LRN-36 to LRN-38, LRN-46 to LRN-48 are Phase 2 and 3 scope (section 7.7). Phase 1 gate acceptance is the "must fail / must pass" columns above.

Gates that cannot be mechanical, so they are recorded human sign-offs: Explorer and Investigator tone, reading comprehension, screen-reader behaviour (NVDA with Firefox, VoiceOver on iOS, ChromeVox on a 1366x768 Chromebook with touch and trackpad), counsel review, helpline directory check. These are checklist items in `docs/learn/A11Y_CHECKLIST.md` and `docs/learn/review-log.json`, signed per release.

---

## 9. Success metrics

No metric below tracks a child. Every Learn metric is derived from build output, aggregate server counts on kit files, adult-only feedback, Search Console on indexable pages, or auditable external facts. If a metric needs per-child data it is out of scope.

**Baseline (2026-10-14):** 0 Learn pages; 0 educator downloads; 0 Learn gates; 0 of the 6 fix-before-teaching items closed (M1 exists as backlog B2 but is unresolved); Umami loads on every page; the Footer newsletter form renders on every page; there is no privacy page.

### 9.1 Launch metrics (at Phase 1 release; BEFORE to AFTER)

| # | Metric | BEFORE | AFTER (target) | Source / method |
|---|---|---|---|---|
| L1 | Published Learn pages | 0 | Every route in the Phase 1 registry (count derived from the registry, not typed); 3 bands x 5 topics + 3 experiments (each with band variants) + educator hub + 1 lesson (teacher and student) + safety + privacy + grown-ups | Build output vs registry |
| L2 | Educator lessons with teacher copy and student sheet | 0 | 1 | Registry |
| L3 | Fix-before-teaching items resolved | 0 of 6 | M2, M3, M5, M6 closed; M1 and M4 closed or their mitigation gates green and acknowledged by the founder | Backlog rows, gate status |
| L4 | Gates implemented with passing probes and a clean real tree | 0 | All gates in section 8 | `npm test` / `test:learn` |
| L5 | Learn requests to analytics, third parties, or storage writes | Umami present on every page today | 0 Umami element or loader in Learn HTML; 0 external requests; 0 cookie or storage writes; 0 forms | Privacy gate + release-checklist interception |
| L6 | Pages with a human review record newer than the content hash | 0% | 100% of Explorer and Investigator pages; 100% of pages with real entities; 100% of pages have a reading read-through | `review-log.json` gate |
| L7 | Pages inside reading ceilings | not measured | 100% | Reading-level gate |
| L8 | Accessibility lint violations on Learn | not measured | 0; release checklist signed on 3 assistive-technology stacks | A11y lint + `A11Y_CHECKLIST.md` |
| L9 | Pilot teacher test (5 teachers, moderated, no student data) | none | Median time from landing to a printed lesson under 3 minutes (EDU-R1); at least 3 of 5 would use it again | Moderated session notes |
| L10 | Statement parity with `/methodology` | known contradictions (M1 to M3) | 0 Learn statements contradicting the method pages, proven by the facts gate | Gates |

### 9.2 Post-launch metrics (day 90 unless stated)

Targets marked "provisional" have no baseline and no market sizing in the briefs. They are placeholders for the founder to confirm and are to be re-set after the first 30-day reading.

| # | Metric | Baseline | Target | Source / method |
|---|---|---|---|---|
| P1 | Educator kit downloads (teacher copy and student sheet) | 0 | Provisional: 50 in 90 days | Aggregate server counts on the kit location only, IP and user agent not logged, aggregated daily |
| P2 | Share of kit downloads whose referrer is outside our own site | n/a | Provisional: at least 20% | Referrer host from the same log |
| P3 | Educator feedback emails per download | n/a | Record only; brief 09 expects low single-digit percent | Plain `mailto:` inbox |
| P4 | Reported factual errors in Learn left uncorrected after 5 working days | n/a | 0 | Inbox plus `CHANGELOG.md` entries |
| P5 | Indexed coverage of indexable Learn URLs; structured-data errors | 0 | At least 95% coverage and 0 errors (DISC-R12) | Search Console with a `/learn/` property filter |
| P6 | Answer-engine sample: 10 teacher queries per month across ChatGPT, Perplexity, Gemini, Google AI Overviews or AI Mode; times an invented example is quoted as real | n/a | 0. Any hit is a kill-switch signal (unpublish or amend the page) | Manual monthly sample, recorded |
| P7 | Post-publication defects in the DC-02 / DC-03 classes on Learn | n/a | 0 | `DEFECT_CLASS_REGISTRY.md` |
| P8 | OER repository listings; teacher-community posts per kit | 0 | 2 listings and 1 post per kit by day 90 after the pilot ends (Phase 3) | Public listings |
| P9 | University course adoptions (instructor-confirmed syllabus link or written note) | 0 | 3 in the first academic term, 10 in year 1 (Phase 3, EDU-R5) | Public syllabus link or written note, auditable |
| P10 | Funder evidence document exists | none | Published before the first grant application citing Learn (EDU-R6) | Document |

Leading indicators: pilot teacher time-to-print, count of fixes shipped from feedback each logged in `CHANGELOG.md`, gate pass rate on first CI run.

Incomplete by design: there is no measure of student learning in Phase 1. Educator-reported outcomes (EDU-R6 a) and an optional pre-registered teacher pilot (b) are the honest options. Until one exists, any claim of "learning impact" is unsupported and must not appear in funder materials.

---

## 10. Founder decision packet

Deduplicated across briefs. "Blocks" says what cannot proceed without the answer. Where the default is accepted the work proceeds on it. Items marked **BLOCKS PHASE 1 CODE** stop a build slice until answered or the default is explicitly accepted.

| ID | Decision | Default (recommended) | Blocks | Raised in |
|---|---|---|---|---|
| **FD-1** | Analytics on Learn | **Off for all of `/learn`**; reach measured from aggregate server counts on kit files only | **BLOCKS PHASE 1 CODE** (shell slice) | 01, 03, 04, 05, 06, 07, 08, 09, 10, 11 |
| **FD-2** | Scoped light "paper" theme for Explorers, Investigators, Educators; amend CLAUDE.md "dark theme only" for `/learn` | **Yes, scoped** (`.learn-paper`, no `@theme` change); Analysts stay dark with print light | **BLOCKS PHASE 1 CODE** (CSS and components) | 03, 05, 07 |
| **FD-23** | Navigation entry | Tools dropdown plus footer Research column; revisit `mainNav` after one term | **BLOCKS PHASE 1 CODE** only for the `nav.ts` edit; low risk | 03 |
| **FD-8** | Harm-flag semantics (M5): confirm dimension-level is correct | **Yes**; shipped code and published methodology (`page.tsx` lines 364 and 942) agree; fix the test, not the formula | Blocks M5 only if the founder disagrees | 07 |
| **FD-3** | Content licence | CC BY 4.0 for prose and worksheets; MIT for code; a `NOTICE.md` amendment and `DECISIONS.md` entry; non-binding use guidance in place of a licence restriction; counsel review of the wording | Blocks launch and the JSON-LD `license` field; not code | 01, 03, 04, 07, 09, 10 |
| **FD-5** | Remove "out of 10" from `/methodology` (M2) | Yes; one 0 to 5 scale sitewide | Blocks launch | 02 |
| **FD-6** | Fix the spread-step caption (M3) and handle the CHANGELOG line | Fix caption and `INTEGRATION_PREMIUM.detail`; do not edit the published entry; file an addendum sharpening "evenness does not enter the composite at all"; Learn says "never mattered on real data; in invented profiles at most 2 points" | Blocks launch | 02, 06 |
| **FD-4** | Band-edge rule (M1, B2) | `getBand` (upper edge inclusive) is canonical; correct the `BANDS` comment and `BAND_RANGES`; log a public correction; check that entities at the edges are reclassified knowingly | Blocks Phase 2 band-sorting and edge teaching; not Phase 1 | 02, 06, 11 |
| **FD-7** | Canonical evidence-tier scheme (M4) | Words only in Learn; strongest at the top | Blocks Phase 2 spot-the-rung | 06 |
| **FD-9** | Real entities for Investigators | Only hand-picked, non-violent cases from a reviewed set; Phase 1 may ship with none; no country or conflict-affected entity below Analysts | Blocks real-case content only | 01, 04, 11 |
| **FD-10** | Who reviews and signs off pages | A named educator for every Explorer and Investigator page; a safeguarding-trained reviewer for any real-entity or content-note page; the founder approves publication; recorded with content hashes in `docs/learn/review-log.json`; two educators and one disabled learner or advocate for reading and screen-reader review | Blocks launch | 04, 05, 11 |
| **FD-11** | Child helpline route and its direct-link exception | One checked international child-helpline directory plus the trusted-adult line; reviewed quarterly; a single allowlisted direct outbound link | Blocks launch (content), not code | 04 |
| **FD-12** | Children's-privacy counsel review (COPPA, UK Children's Code, the licence wording) | Yes, a one-hour review of the privacy page and this PRD before any public announcement; no "COPPA compliant" claim without it | Blocks announcement | 01, 08 |
| **FD-13** | Log retention: upstream openresty proxy, and `/learn/` log policy | Assume unknown; `access_log off` for `/learn/` in the repo; state "short-term server logs" only after the founder checks the proxy and sets retention at under 7 days or IP dropping for `/learn` if possible | Blocks the privacy page's truth, so launch | 08 |
| **FD-14** | Main-site privacy page | File a backlog row; Learn's page is self-contained and does not depend on it | Not blocking | 08 |
| **FD-15** | CSP with `'unsafe-inline'` for v1; path-scoped nginx block in both configs; staging first | Yes, with a follow-up to hash inline scripts | Blocks the server-policy slice | 07, 08 |
| **FD-16** | Real seed examples (Lisbon, Porto; RC-2) | Invented Seedville until the RC-2 study document exists and values are applied or clearly labelled | Blocks Phase 2 real example | 02, 06 |
| **FD-17** | Educator channel | No email list at launch; no marketplace listings until the pilot ends; five pilot teachers from personal networks with no payment and no student data; feedback by `mailto:`; founder replies within 5 working days | Blocks nothing; Phase 3 | 09 |
| **FD-18** | First lesson band | Investigators uncertainty lesson (deviates from brief 09's Explorers-first) | Not blocking | 09, 10 |
| **FD-19** | Browser checks and dependencies | Founder-run release checklist for axe-core (advisory), PDF render, request interception, screen readers; `axe-core` dev-only if added; no Chromium in `npm test` | Not blocking | 05, 11 |
| **FD-20** | Persisted reading settings, Projector mode, dyslexia options | Not in v1; no storage of any kind | Phase 2 | 05, 08 |
| **FD-21** | Translations | Not in v1; keep `lang` handling; FK does not transfer to other languages | Not blocking | 05 |
| **FD-22** | Researchers hub | No; fold into Analysts "Go further" | Not blocking | 03 |
| **FD-24** | Is Learn part of track E1 (nonprofit document 4.2)? | Treat Learn as a separate youth-facing product until the founder decides; make no E1 claim in funder materials | Not blocking | Nonprofit doc |
| **FD-25** | UK and EU school targets | US first; PSHE and TOK mappings secondary | Phase 3 | 01 |
| **FD-26** | Subdomain for Learn | No; `/learn` with the shell and gates; revisit if nginx header repetition proves fragile | Not blocking | 08 |

---

## 11. Build order

Slices are ordered so that nothing computed or taught precedes the thing that makes it true. Effort numbers exist only where brief 07 gave them; brief 07's slices differ from these, so the architect should re-estimate. Copy authoring is a separate workstream and each page needs an author, a reviewer and a review-log entry.

| Slice | Contents | Files (paths relative to `site/` unless stated) | Depends on |
|---|---|---|---|
| **S0.1: Scorer parity (M5)** | Rewrite the drift gate to import the real `scoring.ts`; golden grid; pin the section 3.3 table; remove the in-file `calcScores`; (about 1 day, brief 07 S0) | `scripts/test-scoring.mjs`; `scripts/lib/ts-alias-loader.mjs` (existing); possibly `scripts/lib/scoring.mjs` only if a real discrepancy is found (flag to the founder, do not change the formula); IMPROVEMENT_BACKLOG.md row | FD-8 |
| **S0.2: Method text and facts (M2, M3, M1 record, M4 record, M6)** | Fix "/10" and the spread-step caption; record B2 and tier decisions; create `methodFacts.ts` and extend `test:method-claims`; generate `llms.txt` and extend `test:no-stale-counts`; file backlog rows; public CHANGELOG entries after founder approval | `src/app/methodology/page.tsx`; `src/data/dimensions.ts`; `src/data/learn/methodFacts.ts`; `scripts/test-method-claims.mjs`; `scripts/test-no-stale-counts.mjs`; `public/llms.txt` and its generator under `scripts/`; `IMPROVEMENT_BACKLOG.md`; `CHANGELOG.md`; `DECISIONS.md` | FD-5, FD-6, FD-4 (record), FD-7 (record) |
| **S0.3: Gate scaffolds and the shell** | Register Learn in the defect registry; create the gate scripts with probes (fail-on-zero); add the Learn shell: route-aware analytics loader, `ChromeGate` extension, `app/learn/layout.tsx`, LearnBar, LearnFooter, `.learn-paper`, registry, landing page placeholder, grown-ups interstitial, privacy page; ESLint overrides | `docs/DEFECT_CLASS_REGISTRY.md`; `src/app/layout.tsx`; `src/components/layout/ChromeGate.tsx`; `src/app/learn/layout.tsx`, `page.tsx`, `grown-ups/page.tsx`, `privacy/page.tsx`; `src/components/learn/LearnNav.tsx` (LearnBar and LearnFooter); `src/data/learn/registry.ts`; `src/app/globals.css`; `src/data/nav.ts`; `scripts/test-learn-privacy.mjs`; `scripts/test-learn-links.mjs`; `scripts/lib/html-gate-harness.mjs` (reuse); `package.json` (`test:learn`) | FD-1, FD-2, FD-23 |
| **S1: Care, tokens and templates** | Child duty-of-care component; `learnTokens`; paper primitives (`LearnButton`, `LearnPanel`, `LearnCallout`, `LearnBandChip`); glossary `plain` field and inline definitions; topic page template; step indicator; check-your-understanding formats | `src/components/learn/*`; `src/data/learn/learnTokens.ts`; `src/data/glossary.ts`; `src/data/learn/duty-of-care-vocab.ts`; `scripts/test-learn-a11y.mjs`, `test-learn-contrast.mjs`, `test-learn-copy.mjs`, `test-learn-duty-of-care.mjs` | S0.3, FD-11 for the helpline constant |
| **S2: Experiment kit and three experiments** | Slider, BandStrip (display only), Dice with seedable generator, Reveal, Reset, PrintSheet; build-a-score, seed vs measurement, coin-dice-range, each with band variants; `golden.ts`; fidelity gate | `src/components/learn/*`; `src/app/learn/{band}/experiments/*`; `src/data/learn/golden.ts`; `scripts/test-learn-experiments.mjs` | S0.1, S0.2 (M5 and facts must be merged first) |
| **S3: Band paths** | Explorers, Investigators, Analysts: five topics each; `learn/corrections` data with verified headings; reviewed `learn/cases` set (may be empty); reading-level gate and baseline; review log | `src/app/learn/{explorers,investigators,analysts}/*`; `src/data/learn/{corrections,cases,examples}.ts`; `scripts/test-learn-reading-level.mjs`; `docs/learn/review-log.json` | S1, S2, FD-9, FD-10 |
| **S4: Educators and print** | Hub, one lesson (teacher and student routes), safety page, licence footer, print CSS, optional build-time PDFs, mailto | `src/app/learn/educators/*`; `src/app/globals.css` (print block); licence constants; `NOTICE.md`; `DECISIONS.md` | S1, FD-3 |
| **S5: Discovery** | `learnPages` in sitemap with Explorer exclusion; Pagefind exclusion; `LearningResource` JSON-LD component; cite block with version; `llms.txt` Learn section; `/cite` "How to cite in class" | `src/app/sitemap.ts`; `scripts/build-search-index.mjs`; `src/components/seo/LearningResourceJsonLd.tsx`; `src/app/cite/page.tsx`; `public/llms.txt` generator | S3, S4, S0.2 |
| **S6: Server policy** | `/learn/` nginx block in both configs, kit-file log format, optional `/u/` referrer block, parity and config tests | `nginx.conf`; `nginx-ssl.conf`; a config test script; `DEPLOYMENT.md` | FD-13, FD-15; deployment founder-gated |
| **S7: Release checklist and pilot** | Founder-run checks (axe advisory, PDF render, request interception, screen readers, counsel, helpline check, five-teacher pilot); `docs/learn/A11Y_CHECKLIST.md`; launch decision | `docs/learn/A11Y_CHECKLIST.md`; `docs/learn/review-log.json` | All; FD-12 |
| **Phase 2 / 3** | See 6.2 and 6.3 | | |

**First three slices:** S0.1 (scorer parity, M5), S0.2 (method text and facts, M2/M3/M6 plus decisions recorded), S0.3 (gate scaffolds and shell).

---

## 12. Assumptions, risks and unverified items

**Flagged assumptions (stated, not hidden).**
- Owners in section 4 are roles; named agents are for the coordinator.
- Provisional success targets (P1, P2) have no baseline and no demand data. Query-volume hypotheses in DISC-R8 are unmeasured.
- Standards mappings (brief 01) are the author's judgement and the standards texts were not fetched; nothing is published as aligned until Phase 3.
- Legal statements (COPPA dates and scope, UK Children's Code, GDPR Art. 8 ages) were not confirmed at primary sources (brief 01 marks several unverified). CC BY 4.0 additional-terms behaviour is my reading and needs counsel.
- Google structured-data statuses are from brief 10 (checked 2026-10-14); `LearningResource` has no confirmed Google feature and is used as vocabulary only.
- Whether `test:no-stale-counts` scans `public/` is unverified (brief 10); LRN-06 and LRN-41 assume it must be extended.
- Whether the Hostinger nginx path-scoped CSP works as intended is untested; staging first. The upstream openresty log retention is unknown.
- Existing charts reused by Learn have not been audited for title/description conventions (brief 11 Q7); audit before reuse.
- No test with real children or teachers has occurred. Every safety finding in brief 04 is a design risk, not observed harm.

**Risks.**
1. DC-02 (method-claim drift) has recurred four times; Learn is a new surface. Mitigation: facts module and gates before copy.
2. DC-03 (narrating an unapplied proposal) applies to any Learn page that quotes a score change. Mitigation: LRN-20 and the currency gate; invented examples in Phase 1.
3. An invented figure quoted by an answer engine as real is the worst failure for an institution like this. Mitigation: visible labels, Explorer `noindex`, omission from `llms.txt`, monthly sampling with a kill switch (P6). Investigators pages are indexable and also carry invented figures; if P6 finds a hit, move Investigators to `noindex` as well.
4. A child meeting distressing content through a path nobody tested. Mitigation: data-level case set, no feed links, care component everywhere, vocabulary and entity scans, and human review that a lint cannot replace.
5. Scope creep from many good ideas (flashcards, markets, settings). Mitigation: section 6.4 and the phase boundaries.
6. Lint limits: FK and vocabulary scans are floors, not proof of safety or comprehension; human sign-off (FD-10) is the real check and is only mechanically required, not mechanically performed.

**Hand-off summary.**
- **system-architect:** sections 5, 7.2, 8, 11. Decide the analytics-loader mechanism (LRN-08), registry types, nginx block, and where facts and golden data live.
- **ux-designer:** sections 2, 5.1 (theme), 7.3, 7.4, 7.5; templates are in UX-R9 to R11.
- **frontend-engineer / backend-engineer:** sections 4, 7.1, 7.2, 7.4, 11.
- **QA:** section 8 is the test plan; QA-R1 to R11 give probes and fixtures.
- **analytics:** section 9 only; no Learn instrumentation exists by design.
- **growth:** sections 6.3, 9.2, EDU-R4 to R10.
