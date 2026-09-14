# PR/FAQ Review — Knowledge Architect (Reader Comprehension)

**Date:** 2026-09-14
**Lens:** Can a journalist, policymaker, or researcher correctly understand what a score, a withheld finding, a floor score, a pre-registration, or a BYO score means — and can they tell institution scores apart from model evaluation?
**Method:** Read-only review of page code, shared components, glossary, canonical data modules, and two daily briefing JSON files. No builds, no git, no web. Every claim below cites a file and line.

---

## 1. Scope reviewed

| Surface | Files read |
|---|---|
| Model Index (pre-registration) | `site/src/app/ai-models/page.tsx` (full), `site/src/app/ai-models/methodology/page.tsx` (full), `site/src/components/model-benchmark/SubjectLine.tsx`, `site/src/lib/model-index-facts.ts` |
| Self-serve / BYO scoring | `site/src/app/ai-evaluation-suite/page.tsx` (full), `site/src/components/model-benchmark/EvaluationScorer.tsx` (L1–120 via grep, L733–877 read), `site/src/lib/evaluation-scorer.ts` (grep), `site/src/data/model-benchmark/tasks-v1.json` (status fields) |
| Institution methodology | `site/src/app/methodology/page.tsx` (full, 1,420 lines), `site/src/components/charts/EvidencePyramid.tsx` |
| Canonical scoring / bands | `site/src/data/dimensions.ts` (`BANDS`, `INTEGRATION_PREMIUM`, subdimension names), `site/src/lib/scoring.ts` (`getBand`) |
| Glossary | `site/src/data/glossary.ts` L50–230 |
| Entity pages | `site/src/components/entity/EntityDetail.tsx` L560–760 + greps; index JSON greps for shared 62.5 composites |
| Updates rendering | `site/src/app/updates/[date]/page.tsx`, `site/src/components/updates/DailyBriefing.tsx` L255–305, `briefing/ScoreMovementDashboard.tsx`, `briefing/ScoreMovementCard.tsx`, `briefing/BoundaryWatch.tsx`, `briefing/LeadSignalCard.tsx` L185–230, `briefing/evidence/index.tsx` L1–70 |
| Briefing data | `site/src/data/updates/daily/2026-09-14.json` (full), `site/src/data/updates/daily/2026-09-01.json` (full) |
| Governance context | `.benchmark-ops/CURRENT_STATE.md`, `RISKS.md`, `DECISIONS.md` (grep), root `DECISIONS.md` (D-06, D-12, D-29, D-30), `docs/KNOWLEDGE_ARCHITECTURE_MODEL_BENCHMARK.md` §3.5–4.4 |

**Current state of the flagged conflicts (checked in code today):**
- **CONFLICT-04 (two formulas): fixed in the page text.** `/ai-evaluation-suite` now shows the continuous `10 × consistency × weakness` premium and names `computeCompositeFromDimensions` as its source (`ai-evaluation-suite/page.tsx:145-155`).
- **CONFLICT-03 (two band tables): fixed on that page.** The band line is built from `BANDS` (`page.tsx:156`).
- **"Advertises capabilities it lacks": partly out of date.** A working scorer with inputs and JSON/CSV/text export now exists (`EvaluationScorer.tsx:745-761, 686-706`). But the "compare models" and "track progress over time" claims still have no feature behind them (`page.tsx:101, 256`); a grep of `EvaluationScorer.tsx` finds no compare or history function.
- **Still live:** the second 40-subdimension taxonomy (CONFLICT-05, `page.tsx:18-27` vs `dimensions.ts`), and a new boundary conflict *inside* the canonical pair (`BANDS` vs `getBand()` at exactly 60.0 — Finding F-06).

---

## 2. What communicates well (keep, and reuse as the house pattern)

1. **Answer-first honesty on the Model Index.** The first thing on the page is "The method is published. No model has been scored yet." (`ai-models/page.tsx:86-92`). The FAQ answers the most-searched question directly: "No model has been scored… Any ranking… attributed to Compassion Benchmark today would be fabricated" (`:33-37`). This is the best 5-second test result on the site.
2. **The Three Objects device plus the change test.** Scored rows ("which score moves?") teach the lab / model / deployed-product split through prediction, not definition (`ai-models/page.tsx:135-196`). `SubjectLine.tsx:15-30` repeats the frame on both model pages.
3. **Counts come from data, and zeros are shown.** "These four numbers are read directly from the published data files at build time. Two of them are zero." (`ai-models/page.tsx:120-128`). `model-index-facts.ts:5-16` explains why nothing is hand-typed.
4. **"What not to infer" for release watch.** Tracked is explicitly not evaluated, and "there is no denominator here" (`ai-models/page.tsx:304-318`). This is a model refutation-text pattern.
5. **Falsification conditions stated before results** (`ai-models/methodology/page.tsx:193-221`).
6. **Unofficial labelling travels with the output.** Every export carries `official: false`, the AI-judge composite is withheld with a stated reason, and filenames are prefixed `cb-eval-unofficial-` (`EvaluationScorer.tsx:236, 268, 290-309, 686, 706`).
7. **Institution methodology teaching devices.** A 3-minute summary (`methodology/page.tsx:152-193`); a real worked example (Abridge, `:299-396`); the band-vs-anchor name-collision disambiguator (`:429-433`); "Two kinds of composite 0.0" (`:905-922`); the victim/perpetrator attribution rule with the Harvard dual-role case (`:577-652`); the 14-day window as scan cadence rather than evidence lifespan (`:511-520`); and an "If you remember one thing" closer (`:1364-1371`).
8. **Briefings explain exclusions in concrete terms.** McKesson's 284M figure was "a raw count… of data records, or lines, rather than a count of unique individuals" (`2026-09-01.json:200`). The Peru retraction resurfaced through wire pickups (`:236`). France's protest evidence dated 2025 and was excluded (`2026-09-14.json:80`). These are the "concrete before abstract" retention hooks readers remember.

---

## 3. Findings — misreadings a real reader could make

Severity: **Critical** = a reasonable reader will publish a wrong fact. **High** = a wrong inference is likely. **Medium** = confusion or lost trust. **Low** = friction.

### A. Status vocabulary: "falls", "confirmed", "filed", "withheld", "applied" (institution product)

| ID | Severity | Misreading a reader will make | Evidence (file:line) | System |
|---|---|---|---|---|
| F-01 | **Critical** | **"Hong Kong's score fell 5.9 points on 14 September."** No published score changed that day. | Headline "Hong Kong falls 5.9 points…" (`2026-09-14.json:5`); summary "Hong Kong's score falls 5.9 points, from 32.8 to 26.9" (`:6`); but `scoreChangesApplied: 0`, `changeProposalsCount: 1` (`:14-15`). The headline is the bold lead of "Today in 30 seconds" (`DailyBriefing.tsx:294-296`) and the OG/Twitter title shared off-site (`updates/[date]/page.tsx:32-36`). The same pattern appears in 09-01: "Kenya falls 5.9 points", "Regions Financial falls 38.4 points", while "None of the four findings were applied" (`2026-09-01.json:6`). | Briefing data + renderer |
| F-02 | **Critical** | **"19 institutions' scores moved today."** The dashboard counts every gap between measured and published as a score change. | `changedRows = sorted.filter(a => Math.abs(a.delta) > 0)` (`ScoreMovementDashboard.tsx:86`), rendered as "Changes — N scores moved" (`:115-118`) under "Entities with score changes this cycle" (`:101`). All 19 `recentAssessments` on 09-14 have a non-zero delta (`2026-09-14.json:290-534`), so all 19 show as moved and zero as confirmed, with 0 applied. Cards show `published ▼ assessed −delta` with no "published" or "measured" label (`ScoreMovementCard.tsx:182-209`). `/methodology` sends readers there with "See every approved score change" (`methodology/page.tsx:1300`). | Renderer |
| F-03 | **Critical** | **"Confirmed" read as "the measurement agreed."** In briefings it means "the published number was kept", even when the measurement is 35 points away. | Nationwide `published 60.9, assessed 25, delta -35.9`, described as "confirmed unchanged" (`2026-09-01.json:478-486, 599`). Principal Financial "still confirmed unchanged" at −34 (`:508`). Boeing "confirmed at 14.1" (`2026-09-14.json:228`) with assessed 12.5 (`:405`), and the same signal says the delay "is what moved the score slightly" (`:227`). `/methodology` uses "confirmed" for the opposite: "Every **confirmed score change** is published to /updates" (`methodology/page.tsx:1216`). | Briefing data + methodology |
| F-04 | **High** | **"A proposed band crossing" read as a band crossing when none exists; "Band crossing" read as happened when it was withheld.** | Hong Kong 32.8 → 26.9 is Developing → Developing ("remaining in the Developing band", `2026-09-14.json:36`) but `actionType`/`status` is `band-crossing-proposed` (`:41, :299`). France and Slovenia are withheld yet `band-crossing-finding` (`:85, :255, :269`). `LeadSignalCard.tsx:204-207` renders a "Band crossing" pill for `band-crossing-finding`. `BoundaryWatch.tsx:114-116` styles anything matching `/crossing\|proposed/` in red and prints the raw slug (`:238`). | Data schema + renderer |
| F-05 | **High** | **One state, five words.** A reader cannot tell whether "not filed", "withheld", "not confirmed", "logged" and "documented" are different outcomes. | 09-14 France/Slovenia: "neither finding was confirmed" (`:6`), "was not filed" (`:80`), "was withheld as well" (`:80`), `entitiesWithheld: 2` and `bandCrossingsMeasuredNotFiled: 2` (`:13, :18`). 09-01 Chile: "logged, not confirmed" (`2026-09-01.json:6`), "filed as unproven rather than confirmed" (`:36`), counted in `bandCrossingsFiled: 2` (`:17`). No glossary entry exists for filed, applied, withheld, or proposal (`glossary.ts` grep). The 30-second pipeline line reads `pipeline.reviewed/assessed/scoreChanges` (`DailyBriefing.tsx:273-278`), but the data fields are `entitiesAssessed`/`scoreChangesApplied`, so the one structured "0 applied" signal never renders (and a `> 0` guard would hide it anyway). | Data + glossary + renderer |
| F-06 | **High** | **"The benchmark requires a court/UN/IO source before filing a band crossing."** True on 09-14, not applied on 09-01, and the reader sees both. | 09-14 rule: "requires at least one source at the strength of a court, a UN body, or an international organization before a crossing between bands is filed" (`2026-09-14.json:601`). France/Slovenia were withheld under it. 09-01 Chile lacked that source ("none was found once the 2023 material was removed") and was still counted in `bandCrossingsFiled: 2` (`2026-09-01.json:17, :36`). A researcher comparing briefings reads the rule as applied inconsistently, or does not know which is current. | Briefing data (editorial consistency) |
| F-07 | **High** | **"The benchmark only logs a change of 5 points or more."** Stated as the rule, but outcomes contradict it. | `2026-09-01.json:6, :615`. D-06: "Band-crossing filing clause — file at any delta" (root `DECISIONS.md:45`). On 09-14 Spain (−8.8) and France (−10) were not filed; Nepal (−4.6) was "not enough on its own" (`2026-09-14.json:124`). Ethiopia's decline is "a real one the benchmark cannot record" (`2026-09-01.json:6`), yet the same file records it at `:369-380`. "Record", "log" and "file" are used interchangeably. | Briefing data |

### B. Evidence tiers — three incompatible numbering schemes

| ID | Severity | Misreading | Evidence | System |
|---|---|---|---|---|
| F-08 | **Critical** | **"EDRi is a Tier 1 source (government/court strength)" and "the UN Human Rights Office is Tier 4 journalism."** The tier badge on each quote says the opposite of what the data means. | Renderer labels: `1: "Tier 1 · Gov/Court"`, `2: "UN/IO"`, `3: "NGO"`, `4: "Journalism"`, `5: "Trade/Advocacy"` (`briefing/evidence/index.tsx:34-40`); short labels `1: "Primary source"` (`:42-48`). Briefing data uses roughly the reverse scale: OHCHR `sourceTier: 4` (`2026-09-14.json:49`), HKSAR government statement `5` (`:57`), Reuters/HKFP/Al Jazeera `2` (`:65, :93, :109`), HRW `3` (`:73`), EDRi `1` (`:117`); CFPB and SEC `5`, Labor Notes `1` (`2026-09-01.json:121, :229, :193`). Prose follows the data scale ("a tier-4-or-above source… would strengthen", `2026-09-14.json:395, :651`) but also says "a tier-1 digital-rights organization's update" (`:80`), which reads as top-tier. | Data + renderer |
| F-09 | **High** | **The methodology's hierarchy does not match either scheme.** A reader who learned the pyramid is misled by every briefing. | Pyramid: Tier 1 = independent external audit (highest), Tier 5 = entity self-report (lowest) (`EvidencePyramid.tsx:16-51`). Floor criteria: "at least two T1 (Tier 1/Tier 2) sources — treaty bodies, courts…" (`methodology/page.tsx:499, :967`). The glossary has a three-tier scheme where Tier 1 includes "official statements" (`glossary.ts:226`). Entity pages show tiers A–D (`EntityDetail.tsx:686-706`) and a `T1\|T2\|T3` type (`:43`). Under the pyramid, a government's self-serving denial (HKSAR, tier 5 in the data) is lowest weight; under the renderer it is "Trade/Advocacy"; under the data it is the highest number used. | Methodology + glossary + entity + data |
| F-10 | **Medium** | **"Tier" also means "band."** | Glossary defines a band as "One of five performance tiers" (`glossary.ts:58`) and a band change as "A shift between two performance tiers" (`:196`). Five-level evidence tiers and five bands share the word in the same briefing sentence. | Glossary |

### C. Bands, boundaries, floor

| ID | Severity | Misreading | Evidence | System |
|---|---|---|---|---|
| F-11 | **High** | **"Spain at 60.0 is Established"** (or Functional — the site's two canonical sources disagree). | `BANDS` declares lower-inclusive bounds, with Established `min: 60` (`dimensions.ts:596-600, :615`). `getBand()` returns Functional for `score <= 60` (`scoring.ts:282-288`), mirrored in `EntityDetail.tsx:187` and `PeerChipLink.tsx:17`. The briefing then says Spain "sits exactly on the line" and a pending −9.4 finding "would move the score further into the Functional band rather than change which side of that line Spain sits on" (`2026-09-14.json:200`). That is true only under `getBand()`. Under `BANDS` it is a band crossing, and D-06 (file at any delta) would apply. | Scoring code |
| F-12 | **Medium** | **Hand-typed distances contradict each other.** | Chile 62.5 is "1.5 points above the Established/Functional boundary", `distance: 1.5` (`2026-09-01.json:273, :276`). France and Slovenia at the same 62.5 show `distance: 2.5` (`2026-09-14.json:256, :270`). Slovenia at 58.7 "sits 1.3 points below the **Functional** boundary" (`:670`); it is 1.3 below the *Established* boundary, inside Functional (correct at `:340`). | Briefing data |
| F-13 | **High** | **"Mozambique is 1.3 points above the floor."** "Floor" is used for the Critical band's upper edge (20) as well as for composite 0.0. | "1.3 points above the Critical floor" (`2026-09-14.json:287, :566, :584`). The methodology reserves "floor" for composite 0.0 and floor designation (`methodology/page.tsx:889-1033`). 09-01 adds "near-floor", "filing floor", "sub-floor severity marker" (`2026-09-01.json:4, :615`). | Briefing data |
| F-14 | **High** | **"Floor designation is a score reduction/penalty."** | Glossary: "A score reduction triggered when an entity meets specific evidentiary criteria…" (`glossary.ts:184-189`). The methodology says it is an editorial disclosure placing all dimensions at the floor anchor, with trigger criteria across ≥3 cycles (`methodology/page.tsx:897-918, :961-978`). D-12 frames floor entities as "a scale-expressiveness problem, not a scoring problem" (root `DECISIONS.md:470-474`). The tooltip version is the one most readers see. | Glossary |
| F-15 | **Medium** | **"Syria's conditions worsened, so its score went up?"** | "A real, evidenced decline… has no further room to move a score that is already at zero" alongside `assessed: 0.6, delta: +0.6` (`2026-09-14.json:172, :375-377`), while the summary says it "holds at zero" (`:6`). Nothing tells the reader that sub-anchor variance (explained at `methodology/page.tsx:901`) produces small positive measured values at the floor. | Briefing data |
| F-16 | **Medium** | **"Scores of 0 were removed in v1.1."** | Changelog v1.1: "Entities previously displayed at composite 0.0… now show their formula-computed composites — typically 4 to 7 points" (`methodology/page.tsx:1283`). Israel, Sudan and Syria are published at 0.0 (`:934-939`; `2026-09-14.json:375`). The later floor-designation mechanism that reintroduced 0.0 is not cross-referenced from the changelog. | Methodology |

### D. Placeholder (seed) baselines presented as assessments

| ID | Severity | Misreading | Evidence | System |
|---|---|---|---|---|
| F-17 | **Critical** | **"France fell 10 points because of what France did in September 2026."** About 1 point is in-window conduct; about 9 points come from the first individual look at an unreviewed starting value. | "That finding moves France's score by about one point on its own. Measured against all located evidence, most of it predating this review window… 52.5" (`2026-09-14.json:80`). The signal title and emerging risk frame the crossing as tonight's evidence: "France and Slovenia would both cross into the Functional band on tonight's evidence" (`:78-79, :545`). This is the causal inversion the coordinator flagged; it survives in `:545` and in the whyItMatters "Both countries show real conduct that would cross a scoring boundary" (`:79`). | Briefing data |
| F-18 | **High** | **"62.5 is France's assessed score."** The value is shared, unreviewed, and not labelled. | Exact-match grep of `"composite": 62.5`: 13 in `countries.json`, 8 in `fortune-500.json`, 4 in `robotics-labs.json`, 2 in `global-cities.json`, 1 in `universities.json`. (Coordinator cites 14 countries; the difference may be formatting I did not match.) On 09-14, France, Slovenia, Cabo Verde and South Korea all show `published: 62.5` (`2026-09-14.json:319, :335, :452, :507`); on 09-01 Chile does too (`2026-09-01.json:300`). The only entity-page signal is "Not yet reassessed since publication — interpret with caution" (`EntityDetail.tsx:630-635`). A grep of `components/entity` for placeholder/seed/never-individually found nothing. Meanwhile `/methodology` guarantees "every score traces to documented public evidence" (`:123`), shows "7 Human assessment sessions" (`:112`), and has Interviews/Observation/Community Testimony pills (`:141-144`). | Entity page + methodology |
| F-19 | **Critical** | **"Regions Financial was hit with a $191M federal order this month."** The order is dated 28 September 2022. | Summary: "Regions Financial falls 38.4 points after a $191 million federal order for overdraft fees" (`2026-09-01.json:6`). The signal body never states the year of the order (`:108`); only the evidence `publishedDate: "2022-09-28"` (`:120`) and "seven years earlier" relative to 2015 reveal it. The same briefing withholds 3M's pre-window *improvement* because it "finished at the end of 2025, entirely outside the window" (`:246, :627`). The asymmetry (pre-window adverse evidence used, pre-window positive evidence withheld) is not explained anywhere a reader would see it. | Briefing data |
| F-20 | **Medium** | **Wording that still implies a published error for Jamaica.** | "The earlier reported figure was in the wrong currency, overstating the scale by a factor of about 150" (`2026-09-14.json:151`). The methodology note says the figure only "could be read as US dollars" and was verified "before it was used" (`:612-614`; also `:582`). "Earlier reported" has no named reporter, so a reader assumes Compassion Benchmark reported it. | Briefing data |
| F-21 | **Medium** | **Boeing: "Boeing concealed the fine."** | "The benchmark scores the disclosure timing as its own fact… A company that discloses slowly is scored differently" (`2026-09-14.json:607`). The evidence is that "The Federal Aviation Administration confirmed to Reuters" (`:228`), with no finding that Boeing had a disclosure obligation. The summary also says "paid back in January" (`:6`), which implies a refund, while the body says "paid a $3.1 million fine in January" (`:228`). | Briefing data |
| F-22 | **Medium** | **"Every entity is scanned every night."** | "Every night… across all … entities… No entity is skipped" and "The scanner touches every one… daily" (`methodology/page.tsx:792, :819`). 09-14: "A twelve-day gap, from 2 through 13 September, had no completed research" (`2026-09-14.json:29`). 09-01 covers six uncovered days (`2026-09-01.json:29`). The glossary defines in-window as "typically the prior 24–72 hours" (`glossary.ts:219`); the methodology says 14 days (`:514`). | Methodology + glossary |

### E. Model evaluation vs institution scores (CB-MODEL)

| ID | Severity | Misreading | Evidence | System |
|---|---|---|---|---|
| F-23 | **Critical** | **"Compassion Benchmark offers a platform that scores and compares AI models on its official 0–100 scale."** | `/ai-evaluation-suite` hero: "Score any AI model or chatbot… Track progress, compare models, and export structured results" (`page.tsx:101`). Stat: "0–100 composite — Canonical CB scoring formula" (`:114`). "License the Platform" CTAs (`:106, :259`). Closing: "score any AI model… compare models, and track progress over time" (`:256`). This contradicts `/ai-models`: "no valid cross-model comparison can be drawn from it" (`ai-models/page.tsx:60-62, :231-232`). The page never links to `/ai-models` and does not use `SubjectLine`. Its "Read Methodology" buttons go to the *institution* `/methodology` (`:107, :260`), not `/ai-models/methodology`. The "unofficial" disclaimer is small print in a side panel (`:129-133`); the prominent unofficial callout comes later, inside the scorer (`EvaluationScorer.tsx:736-741`). | Eval suite page |
| F-24 | **High** | **"A model scoring 70 is as compassionate as a country scoring 70."** | `/ai-models/methodology`: "The same framework used to score governments… which is what lets a model be compared against an institution on one scale" (`:137`) and "so a model score means the same thing a country score means" (`:177`). This contradicts the `/ai-models` FAQ ("separate measurements of separate objects", `:42-45`) and KA doc §3.6(2) ("Never render a model composite and a lab composite in the same… comparison unit"). The "Inherited, not yet model-validated" rung recommended in KA doc §4.3 is absent from the page (read in full). | Model methodology page |
| F-25 | **High** | **"BYO scoring never produces a composite."** True only for AI-judge mode; human self-serve mode computes and displays a banded 0–100 composite. | D-30 title: "BYO scoring is clipboard round-trip and emits no composite" (root `DECISIONS.md:26`). Code: human-mode "Live composite" shows the number and band (`EvaluationScorer.tsx:839-877`); only AI-judge runs are withheld (`:849-855`, `:293` constant). The suite hero mixes the two: "still no 0–100 composite" in the AI-judge sentence (`page.tsx:131-132`) sits beside a "0–100 composite" stat (`:114`). **PR/FAQ authors are the first readers at risk here.** | Eval suite + decision record |
| F-26 | **High** | **Two different item scales and two meanings for the same labels.** | The suite scores items "1.0–5.0" and names the levels "5.0 Exemplary / 4.0 Established / 3.0 Functional / 2.0 Developing / 1.0 Critical" — band names — using institutional prose ("Embedded in governance", "not fully institutionalised") for a chatbot reply (`page.tsx:201-209`). `/methodology` anchors run 0–5 as Active Harm / Absent / Minimal / Developing / Established / Exemplary (`:447-453`), and its disambiguator says band names are not anchor names (`:431`). A "3" is "Functional" on one page and "Developing" on the other. The harm-flag clause "integrationPremium = 0 if any dim = 0" (`page.tsx:154`) cannot trigger on a 1–5 item scale, and no page says so. | Eval suite |
| F-27 | **Medium** | **Two 40-subdimension taxonomies (CONFLICT-05 still live).** | Suite AWR subdims: "Harm Detection, Stakeholder Listening, Predictive Risk, Impact Transparency, Cultural Awareness" (`page.tsx:19`). Canonical AWR: "Suffering Detection, Contextual Sensitivity, Blind Spot Mitigation, Signal Amplification, Anticipatory Awareness" (`dimensions.ts:30-78`). Both claim "40 indicators" (`page.tsx:16, :225`). Resolution is reserved to the owner (`BLK-006`). | Eval suite |
| F-28 | **Medium** | **Brand soup: five names for the model product.** | "AI Model Compassion Benchmark" / "Model Index" (`ai-models/page.tsx:21, :96`); "CB AI Evaluation Platform" / "AI evaluation platform · v1.0" (`ai-evaluation-suite/page.tsx:16, :96`); "AI Prompt Battery" and "Applied Compassion Benchmark (ACB)" (`methodology/page.tsx:1176`, unlinked); "ACB-PAB-001" (`:1346`); "CB-MODEL" internally. A journalist cannot tell whether the "Platform" and the "Model Index" are the same thing. | Cross-site |
| F-29 | **Medium** | **"The public pool is burned" / "saturation sentinel" / "scorable but not validated."** | Jargon at `ai-models/page.tsx:62, :228`. "0 human-validated" beside "N scorable" (`:122, :211-213`) needs the definition that exists only in a code comment (`model-index-facts.ts:57-61`: "an item can be scorable without being validated"). | Model Index |
| F-30 | **Low** | **Static prose that will go wrong when data changes.** | "Two of them are zero" (`ai-models/page.tsx:126`) and the heading "No item has been validated" (`:209`) are hardcoded, while the numbers beside them are derived. The suite eyebrow hardcodes "v1.0 · 33 prompts" (`page.tsx:96, :111`). This is the defect `model-index-facts.ts:5-10` was written to prevent. | Model Index + suite |
| F-31 | **Low** | **Methodology page self-contradictions a careful reader will catch.** | The pressure-test cap says "capped at Developing" (`:204`), next to "Hugging Face maintains an Exemplary designation across 7 of 8 dimensions" (`:213`), which reads as dimension-level Exemplary despite the cap. Abridge: "the sub-4.0 average on Equity (EQU 3.0) signals a dimension requiring further improvement" (`:385`), although all eight dimensions are below 4.0 (`:369`). The consistency factor is computed "across the 8 subdimension averages" (`:366`) where the formula says dimension scores. "Stage 4 — Founder approval" (`:806`) vs "Human approval gate" (`:830`). The model-method FAQ lists 4 falsification conditions (`ai-models/methodology/page.tsx:45-49`), the list shows 5 (`:200-219`). | Methodology pages |

---

## 4. Top 5 recommended improvements

Priority Score = Impact + Strategic alignment + Learning value + Confidence − Effort − Risk.

### 1. One status ladder: separate "measured" from "published" everywhere
- **Type:** Information architecture + renderer change + editorial lint rule
- **Problem:** Readers cannot tell a measurement from a published change (F-01, F-02, F-03, F-04, F-05, F-07). Headlines say "falls" when nothing was applied. The dashboard counts measured deltas as "scores moved". "Confirmed" means the opposite on `/methodology`. Five synonyms cover the not-filed state.
- **Proposed change:**
  1. Define one ladder, once, in `glossary.ts`, with a `DefinedTerm` at first use in every briefing: **Measured** (an assessor's number) → **Filed** (a proposal awaiting human approval) → **Applied** (the published score changed) | **Held** (published score kept; measurement recorded) | **Withheld** (would cross a band; evidence bar not met) | **Corroborates** (matches an already-filed proposal). Retire "confirmed" for held positions.
  2. Split the dashboard into "Published changes (N applied)" and "Measured this cycle, published unchanged". Label every card `Published 32.8 · Measured 26.9 · Filed, awaiting approval`.
  3. Fix the pipeline-line field names (`DailyBriefing.tsx:273-278`) and always show "0 applied" when it is zero.
  4. Add a validator rule: headline or title verbs "falls/rises/drops" are allowed only when `scoreChangesApplied > 0` for that slug; otherwise use "measured N below published".
  5. Rename `actionType` values so "band-crossing" appears only when `fromBand ≠ toBand`.
- **Expected benefit:** A journalist can repeat the headline without publishing a false fact. The 5-second read of any briefing becomes "what changed in the public record, and what was only measured."
- **Evidence:** `2026-09-14.json:5-6, :14-18, :41, :228, :405`; `2026-09-01.json:6, :486, :599`; `ScoreMovementDashboard.tsx:86, :101, :115-118`; `ScoreMovementCard.tsx:182-209`; `LeadSignalCard.tsx:204-207`; `DailyBriefing.tsx:273-278`; `methodology/page.tsx:1216, :1300`.
- **Independence check:** PASS. It makes the output less dramatic, not more.
- Impact **5** · Strategic alignment **5** · Learning value **5** · Confidence **5** · Effort **3** · Risk **2** → **Priority 15**

### 2. Make the model product unmistakable on `/ai-evaluation-suite` and `/ai-models/methodology`
- **Type:** Content correction + structure (no formula or taxonomy change needed for most of it)
- **Problem:** The suite advertises comparing and tracking models on the "canonical" 0–100 scale (F-23). The model methodology invites direct model-vs-country comparison (F-24). "No composite" is true only for AI-judge mode (F-25). Item levels reuse band names with institutional prose (F-26). Methodology links point to the wrong product (F-23, F-28).
- **Proposed change:**
  1. Put `SubjectLine` and an answer-first line at the top of the suite: "Unofficial self-scoring worksheet. Compassion Benchmark has scored 0 models — see the Model Index."
  2. Delete "compare models" and "track progress over time" (`page.tsx:101, :256`).
  3. Rename the headline stat to "Unofficial 0–100 composite (human mode only)".
  4. Point "Read Methodology" to `/ai-models/methodology`.
  5. Replace `:137` and `:177` with the KA doc §4.3 "Inherited, not yet model-validated" rung.
  6. Rewrite the 1–5 interpretation reference in model-behaviour terms, and stop using band names as item-level labels.
  7. Pick one product name for public copy.
  8. Route the subdimension taxonomy (F-27) to `BLK-006`, explicitly flagged as owner-reserved.
- **Expected benefit:** A lay reader correctly states "they have published a method and a do-it-yourself worksheet; they have not rated any AI model." That protects the D-29 pre-registration claim, which is the program's main credibility asset.
- **Evidence:** `ai-evaluation-suite/page.tsx:16, :96, :101, :106-107, :114, :129-133, :154, :201-209, :256-260`; `ai-models/methodology/page.tsx:137, :177`; `ai-models/page.tsx:42-45, :60-62`; `EvaluationScorer.tsx:839-877`; root `DECISIONS.md:26`.
- **Independence check:** PASS. It removes capability claims and adds a limitation.
- Impact **5** · Strategic alignment **5** · Learning value **4** · Confidence **5** · Effort **2** · Risk **2** → **Priority 15**

### 3. Disclose unreviewed baselines, and split every measured delta into "first review" vs "in-window conduct"
- **Type:** Data field + entity-page disclosure + briefing template
- **Problem:** Placeholder values (62.5, 60.9) are published with no label (F-18). Briefings then attribute the large correction to current events (F-17, F-19). The methodology guarantees evidence-traced, interview-based scores that seeds do not have (F-18). Pre-window adverse vs positive evidence handling is unexplained (F-19).
- **Proposed change:**
  1. Add a `baselineStatus: "unreviewed-seed" | "individually-assessed"` field. When it is a seed, render on the entity page: "Starting value, not an individual assessment. N entities share this value."
  2. In briefings, require two numbers whenever a delta involves a first review: "first-review correction: −9.0; in-window conduct: −1.0".
  3. Require the event date in the same sentence as any enforcement action ("a 2022 CFPB order").
  4. Add a one-paragraph "Evidence dated before the window" rule on `/methodology` covering both directions, so the 3M/Regions contrast is explained, not inferred.
  5. Qualify the "7 sessions / interviews" hero stats as the certified-assessment protocol, not the basis of every published score.
- **Expected benefit:** Readers stop reporting old or placeholder effects as news. Researchers can filter seeds out of analysis. The site's largest single credibility gap becomes a visible, honest disclosure.
- **Evidence:** index JSON grep counts (13/8/4/2/1); `EntityDetail.tsx:630-635`; `methodology/page.tsx:112, :123, :141-144`; `2026-09-14.json:78-80, :545`; `2026-09-01.json:6, :108, :120, :246, :627`.
- **Independence check:** PASS. It discloses a weakness in our own data.
- Impact **5** · Strategic alignment **5** · Learning value **5** · Confidence **4** · Effort **3** · Risk **2** → **Priority 14**

### 4. Compute band facts from code; reserve "floor" for 0.0
- **Type:** Data generation + glossary correction (the boundary decision itself is owner-reserved)
- **Problem:** At 60.0 the two canonical sources disagree (F-11). Distances and boundary names are hand-typed and wrong (F-12). "Floor" means band edge, filing threshold and composite zero (F-13). The glossary calls floor designation a "score reduction" (F-14). A positive measured delta at the floor is unexplained (F-15).
- **Proposed change:**
  1. Raise the `BANDS`-vs-`getBand()` inclusivity question to `BLK-006` as a consistency fix and state the resolved rule on `/methodology`.
  2. Generate `distance`, `fromBand`/`toBand` and boundary names in the digest from `getBand`, never in prose.
  3. Add a lint rule: "floor" only with composite 0.0 or floor designation; use "Critical band boundary (20)" and "5-point filing threshold" otherwise.
  4. Replace the glossary `floor` definition with the methodology's.
  5. Add a one-line note for floor entities: "Small positive measured values at the floor reflect sub-anchor variance, not improvement."
- **Expected benefit:** Band labels become trustworthy again (schema teachability), and "floor" becomes a precise, memorable concept tied to D-12.
- **Evidence:** `dimensions.ts:596-615`; `scoring.ts:282-288`; `EntityDetail.tsx:187`; `2026-09-14.json:172, :200, :256, :287, :375-377, :566, :584, :670`; `2026-09-01.json:273, :276`; `glossary.ts:184-189`; `methodology/page.tsx:897-918`.
- **Independence check:** PASS.
- Impact **4** · Strategic alignment **4** · Learning value **4** · Confidence **5** · Effort **2** · Risk **2** → **Priority 13**

### 5. One evidence-tier scale, defined once, imported everywhere
- **Type:** Schema unification + data re-map + copy rule
- **Problem:** The renderer, briefing data, methodology pyramid, glossary and entity pages use at least four incompatible tier schemes, two of them numbered in opposite directions. As a result the UN Human Rights Office is badged "Tier 4 · Journalism" and EDRi "Tier 1 · Gov/Court" (F-08, F-09, F-10). This undermines every sourcing-bar explanation, including the band-crossing rule the 09-14 briefing leads with.
- **Proposed change:**
  1. The owner picks one scale and one direction (this touches evidence-hierarchy definitions, so it goes through `BLK-006`).
  2. Export it from a single module consumed by `evidence/index.tsx`, `EvidencePyramid.tsx`, `glossary.ts` and `EntityDetail.tsx`.
  3. Add a validator that rejects `sourceTier` values inconsistent with source type.
  4. In briefing prose, cite the tier *label* ("a UN body"), never a bare tier number.
  5. Re-map historical briefings with an audit note rather than silently rewriting them.
  6. Stop calling bands "tiers" in the glossary.
- **Expected benefit:** "Why wasn't this filed?" becomes answerable at a glance, and the evidence-first framing the independence policy depends on becomes legible.
- **Evidence:** `briefing/evidence/index.tsx:34-48`; `EvidencePyramid.tsx:16-51`; `glossary.ts:58, :196, :226`; `EntityDetail.tsx:43, :686-706`; `methodology/page.tsx:499, :967`; `2026-09-14.json:49, :57, :73, :80, :117, :395`; `2026-09-01.json:121, :193, :229`.
- **Independence check:** PASS.
- Impact **5** · Strategic alignment **5** · Learning value **4** · Confidence **5** · Effort **4** · Risk **3** → **Priority 12**

**If you fix one thing:** #1, the status ladder. Every other concept (withheld findings, floor, seeds, BYO) is explained *through* briefing sentences and dashboard cards. As long as "falls" and "moved" can mean "measured but not published", no downstream definition survives contact with a headline, and the site's highest-traffic surface keeps producing quotable false facts. It is also mostly renderer and lint work, with no owner-reserved methodology decision.

---

## 5. PR/FAQ inputs

### 5.1 Plain-language definitions the PR/FAQ must include (in this wording or tighter)

1. **Composite score (0–100).** One number summarising eight dimensions of how an institution recognises, responds to, and reduces suffering. It is not a simple average: an even profile across all eight dimensions can earn up to 10 extra points (the *integration premium*); any dimension at zero cancels that bonus. (Reuse `INTEGRATION_PREMIUM.short` verbatim, per `dimensions.ts:629-632`.)
2. **Band.** A five-level label for a composite range: Critical 0–20, Developing 20–40, Functional 40–60, Established 60–80, Exemplary 80–100. *Caveat before publication:* the treatment of scores exactly on a boundary (e.g. 60.0) is currently inconsistent in code and must be resolved first (F-11).
3. **Published score vs measured score.** The *published* score is what appears on the entity page. A *measured* score is what an assessor computed during a review. The two often differ; a difference is not a change.
4. **Filed / applied / held / withheld.** *Filed*: a proposed change is waiting for human approval. *Applied*: a human approved it and the published score changed. *Held*: the published score was kept, with the measurement recorded. *Withheld*: the measurement would cross a band, but the evidence did not meet the bar required to file it. (The PR/FAQ should use these words only; see F-05.)
5. **Floor (0.0) and floor designation.** Zero is the bottom of the scale. A score already at zero cannot show further decline, even when conditions worsen (D-12). *Floor designation* is a documented editorial decision, made under stated criteria across several review cycles, to place every dimension at the lowest anchor and publish the reasons. It is not a penalty added on top of a score.
6. **Near-floor.** Scores so close to zero that a real decline is smaller than the change the benchmark normally records (for example Ethiopia at 4.7 on 09-01).
7. **Unreviewed baseline (seed).** Some published scores are starting values that have not been individually assessed. Several entities share the same value (for example 62.5). A large change on first review mostly corrects the starting value; it is not evidence of new conduct.
8. **Evidence window and catch-up cycle.** Reviews look for material new evidence from the most recent 14 days. When research does not run for some days, a *catch-up cycle* covers the missed days in one pass. The 09-14 cycle covered 12 days.
9. **Evidence tier.** *Do not define in the PR/FAQ until F-08/F-09 are resolved.* Any tier number published today can be read in opposite directions.
10. **Model Index (CB-MODEL).** A separate product that will score what a specific, frozen AI model version does on a published set of test tasks. **As of 2026-09-14 no model has been scored.** It is not the AI Labs Index, which scores organisations on their public record, and not a Deployed AI Audit (a shipped product configuration, not yet published).
11. **Pre-registration.** The method, test items and the conditions under which the method should be judged a failure were published *before* any result, so readers can check the order of events in public history.
12. **Public pool / contamination.** Every current test item and its scoring guide is public. A model trained after publication may have learned them, so scores on these items cannot validly compare models. Comparative scoring needs a separate, unpublished item set.
13. **Self-scoring worksheet (BYO).** An unofficial tool: you run the prompts in any AI system and rate the replies. *Human mode* computes an unofficial 0–100 composite in your browser. *AI-judge mode* (one AI rating another) never produces a composite. No output is a Compassion Benchmark score, and every export says so.
14. **Release watch.** A log of AI model releases Compassion Benchmark has noticed. Being tracked does not mean being tested, and there is no promised date for evaluation.

### 5.2 Hard FAQ questions with honest answers

**Q1. Your 14 September briefing said Hong Kong's score fell 5.9 points. Did Hong Kong's published score change?**
No. No published score changed that day (`scoreChangesApplied: 0`). An assessor measured Hong Kong at 26.9 against a published 32.8 and filed a proposed change, which is waiting for human approval. Hong Kong stays in the Developing band either way. The headline wording implied an applied change. We are changing briefing and dashboard language so "falls" is used only when a published score actually changes.

**Q2. Which AI model is the most compassionate? Your site offers a "platform" to score and compare models on a 0–100 scale.**
We have not scored any AI model. The Model Index registry is empty, and none of the published test items has completed human validation yet. The self-scoring worksheet is unofficial and single-rater. Because every test item is public, its results cannot validly compare models. Where that page's copy says "compare models" and "track progress", it overstates what exists, and we are correcting it. Any ranking of AI models attributed to Compassion Benchmark today would be fabricated.

**Q3. France was measured ten points lower on 14 September. What did France do?**
About one point of that gap comes from evidence inside the review window: a diplomatic retraction reported by a single news source. Most of the rest comes from reviewing France individually for the first time. Its published 62.5 was a starting value shared with other countries, not an individual assessment. Evidence we initially found, a large protest, turned out to be from 2025 and was excluded. Nothing was filed, and France's published score is unchanged. We also publish other unreviewed starting values, and entity pages do not yet say so clearly. That disclosure is being added.

**Q4. When a briefing says a source is "Tier 1", how strong is it?**
Today you should not rely on the tier number. Our evidence hierarchy, our briefing labels and the tier values in our briefing data use different numbering schemes, and in places they run in opposite directions. Rely on the named source (a court, a UN body, a news outlet) until we publish one unified tier scale. The rule that matters for band changes is stated in words: at least one court, UN body or international-organisation source is required before a crossing is filed. We also acknowledge that this rule was not applied consistently between the 1 September briefing (Chile) and the 14 September briefing (France, Slovenia).

**Q5. Syria is at 0.0. If conditions get worse, will your score show it?**
No. Zero is the bottom of the scale, so the composite cannot fall further. Scores close to zero, such as Ethiopia at 4.7, can also fail to register a real decline smaller than the change threshold. A separate severity marker has been proposed so the record can show a floor entity is still deteriorating, but it has not been adopted. Until then, the briefing text and the entity page's floor disclosure are where continued deterioration is recorded, not the number.
