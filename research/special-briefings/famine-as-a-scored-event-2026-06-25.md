# Special Briefing — Famine as a Scored Event

**The Same Famine Evidence, Three Different Benchmark Outcomes — Because We Score the Institution, Not the Tonnage**

- **Edition:** Thematic (event-triggered)
- **Date:** 2026-06-25
- **Author:** Special-Briefing agent (interpretive synthesis over the canonical record; read-only of index JSONs and public evidence)
- **Scope:** The countries index (193 scored entities; catalog 1,160+ across 8 indexes). The famine cohort — states where formal IPC Phase 5 famine was declared, projected, or reached in the June 2026 window: **Sudan (0.0)**, **Nigeria (18.0)**, **Somalia (4.7)**, with the Sahel cluster (**Mali 12.5**, **Burkina Faso 6.3**) as context.
- **Method note:** This briefing INTERPRETS the existing record. Every composite was recomputed directly from `site/src/data/indexes/countries.json` and reconciled against the canonical formula (`site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`, v1.2). Sudan 0.0, Nigeria 18.0, Somalia 4.7 all reconstruct to 0.0pt drift. It does NOT re-score any entity. One methodology question it surfaces is filed for human review in `research/PENDING_CHANGES.md`, not applied.
- **Differentiation:** This is NOT the *Aid Obstruction* briefing (2026-06-19), which covered the MECHANISM of blocking relief and silencing monitors. It is NOT the *Floor & Critical* briefing (2026-06-11), which defined the band. This briefing is about the **famine declaration itself as a scored event** — what an IPC Phase 5 finding triggers, who it is scored against, and why the same evidence produces three different outcomes.

---

## publicSummary

> **Title:** Famine as a Scored Event — One Hunger Evidence, Three Different Scores
>
> **Dek:** In June 2026, formal famine hit three countries at once. The Compassion Benchmark scored each one differently — because it grades the institution that caused the harm, not the size of the disaster.
>
> **The cohort (all scores recomputed from the published index, June 25, 2026):**
> - Sudan — 0.0 of 100 (Critical, lowest possible score). Famine confirmed in El Fasher and Kadugli.
> - Nigeria — 18.0 of 100 (Critical). Famine-level hunger for about 15,000 people in Borno State.
> - Somalia — 4.7 of 100 (Critical, near the bottom). Famine projected in Buur Hakaba district.
> - Sahel context: Mali 12.5 and Burkina Faso 6.3, both with conflict-driven hunger.
>
> **Key findings (observer voice):**
> 1. **Famine in 2026 is mostly a governance event, not a weather event.** In Sudan and Nigeria, the United Nations and aid agencies name conflict and blocked access — not drought — as the cause. The World Food Programme said of Sudan in November 2025: "conflict still decides who eats and who does not."
> 2. **The benchmark scores who CAUSED the famine, not where it landed.** In Sudan, the famine in El Fasher and Kadugli follows a siege by the Rapid Support Forces (RSF), a paramilitary group. The harm is scored as the conduct of the besieging party, not as a neutral disaster that happened to a territory.
> 3. **The same famine evidence moved Nigeria's score but not Sudan's — and that is by design.** Nigeria fell from 21.9 to 18.0 of 100 on June 19, 2026, crossing into the Critical band, when famine-level hunger was confirmed in Borno. Sudan was already at 0.0, the lowest score, so its new famine evidence reinforces that floor but cannot lower the number.
> 4. **A formal famine declaration clears the benchmark's evidence bar; an accusation does not.** An IPC Phase 5 finding is a structured, threshold-based ruling by United Nations food-security experts. The benchmark treats it like a court verdict — strong enough to move a score. An allegation or a forecast alone does not.
> 5. **Somalia is the closest country to a famine-triggered score change in the whole portfolio.** A formal famine in Buur Hakaba district was projected by about June 30, 2026, with aid reaching only 1 in 10 people in need. The benchmark watches that future event; it does not score it until it is confirmed.
> 6. **Nigeria's drop did not punish it as the cause of the famine — it marked a failure to prevent.** Boko Haram and ISWAP, not the Nigerian state, are the armed drivers. The benchmark scores Nigeria for failing to protect and prioritize the most vulnerable, which is why its drop was measured (3.9 points), not severe.
> 7. **Famine maps to specific care failures, not a generic "emergency" label.** Across the cohort, the weakest areas are Action (slow or blocked response), Equity (the most vulnerable left last), and Systemic Thinking (decade-long root causes unaddressed).

---

## 1. Frame

The Compassion Benchmark measures how institutions recognize, respond to, and reduce suffering. Almost every other famine ranking measures the disaster: how many people are hungry, how many tonnes of food are needed, how large the funding gap is. This briefing isolates a different question — the only one the benchmark is built to answer: **when famine is formally declared, what does the benchmark do, and which institution does it hold responsible?**

The thesis: **famine in 2026 is a governance event, not a weather event.** In Sudan and Nigeria, the documented driver is conflict, siege, and blocked humanitarian access — not crop failure. And because the benchmark scores institutional conduct rather than humanitarian tonnage, the *same* category of evidence (an IPC Phase 5 finding) produces three different outcomes across the cohort, depending entirely on how the responsible institution behaved. Sudan's famine reinforces a floor that cannot fall further. Nigeria's famine already moved a score and crossing a band. Somalia's projected famine is a future trigger the benchmark watches but has not yet scored. The contrast is the teaching content.

IPC — the Integrated Food Security Phase Classification — is the United Nations–backed system that rates hunger on a five-phase scale. Phase 5 is the worst: "Catastrophe" at the household level, and "Famine" when it reaches an area-wide threshold of starvation, acute malnutrition, and death. A formal Phase 5 / famine declaration is a structured, evidence-reviewed institutional finding — which is precisely why the benchmark treats it as adjudicated-equivalent evidence (see §4).

---

## 2. The cohort

Composites and dimension vectors recomputed directly from `rankings[]` in `site/src/data/indexes/countries.json` and reconciled with the canonical formula (v1.2). All three primary entities reconstruct to 0.0pt drift.

| Entity | Composite | Band | Profile (AWR·EMP·ACT·EQU·BND·ACC·SYS·INT) | Famine status (June 2026) | Scoring logic |
|--------|----------:|------|-------------------------------------------|---------------------------|---------------|
| **Sudan** | **0.0** | Critical (floor) | 1·1·1·1·1·1·1·1 | IPC Phase 5 famine **confirmed** in El Fasher (North Darfur) and Kadugli (South Kordofan); 20 more areas at risk | **Perpetrator-state / near-floor limitation.** Famine is downstream of RSF siege + atrocity. Score is at the absolute floor and holds; new famine evidence is evidence-tier reinforcement, not a composite move. |
| **Nigeria** | **18.0** | Critical | 1.75·1.75·1.75·1.5·2·1.75·1.5·1.75 | ~15,000 in Borno (Dikwa, Kaga, Kalabalge) at IPC Phase 5 Catastrophe; ~34.8M at Phase 3+ | **Prevention-failure state.** Famine evidence DID move the score: 21.9 → 18.0 (−3.9), Developing → Critical band crossing, applied 2026-06-19. Same evidence on later cycles correctly screened as double-count. |
| **Somalia** | **4.7** | Critical (near-floor) | 1.5·1.5·1.5·1·1·1·1·1 | Famine **projected** for Buur Hakaba district by ~June 30, 2026 (first famine-risk analysis since 2022); WFP reaching ~1-in-10 in need | **Pending-trigger.** Closest near-term score-change trigger in the portfolio. A future event is **watched, not yet scored** (forward-trigger rule). |
| Mali | 12.5 | Critical (near-floor) | (uniform-seed-adjacent) | Conflict + hunger; state + Russian Africa Corps documented killing 3–4x more civilians than jihadists | Context. Open Sahel calibration question (separate briefing). |
| Burkina Faso | 6.3 | Critical (near-floor) | (near-floor) | Lean-season peak; gov/allied forces killed ~2x more civilians than militants | Context. ACTIVE-STATE-PERPETRATION reweight applied 2026-06-01. |

**The structural fact:** three states, three identical-category triggers (IPC Phase 5 declared/projected), three different benchmark outcomes. The differences are not about the famine's size — Somalia's projected famine threatens 6 million in crisis, larger than Nigeria's confirmed Phase 5 caseload — but about institutional conduct and where each entity already sits on the scale. The cohort is the cleanest available demonstration that the benchmark scores the institution, not the tonnage.

---

## 3. The longitudinal record — what the history files show

Per-entity history from `site/public/data/history/<slug>.json` (generated 2026-06-24).

### Nigeria — the one case where famine evidence MOVED a score

Nigeria's trajectory is the teaching exemplar. The history shows the famine signal building for weeks, held below the scoring bar, then crossing it on a single decisive ruling:

- **2026-06-01 → 06-16:** Repeated boundary-watch and "documented" entries at composite **21.9** (Developing). The lean-season escalation — "52.8M food insecure; Borno 15,000 at Catastrophe level for first time in a decade" (2026-06-01) — was classified as a **seasonal shock with no documented state perpetration**, and a January 2026 WFP source was repeatedly excluded under the **freshness ruling** (outside the 14-day window). The boundary-watch text names the exact conversion trigger: *"IPC Phase 5 famine-area confirmation converts the … boundary watch."*
- **2026-06-19:** The FAO-WFP Hunger Hotspots report (Jun 17) supplies a fresh, in-window, threshold-based confirmation: ~15,000 in Borno at Phase 5 Catastrophe, 34.8M at Phase 3+. Tier-A scored event, delta **−3.9**, status **band-crossing-proposed**. Nigeria crosses Developing → Critical to **18.0**.
- **2026-06-20 → 06-24:** Five consecutive **floor-confirmed / hold** entries at 18.0. Each cycle the *same* Borno Phase 5 evidence re-surfaces; each cycle it is correctly screened as a **double-count** (§3e-bis(4)). The 2026-06-25 assessment makes the double-count screen decisive and explicit.

The teaching point: the benchmark waited. It did not move on the weather-framed seasonal shock, the out-of-window data, or the regional appeal. It moved on the **specific, fresh, threshold-based IPC finding** — and then it refused to move again on the same fact.

### Sudan — famine deepens the floor record without moving the number

Sudan's record is the inverse. The 2026-06-25 assessment confirms 0.0 and logs the new severity as **floor reinforcement**: "IPC Phase 5 famine declared in El-Fasher and Kadugli; 20 additional areas at risk," alongside the RSF drone campaign on El Obeid (day 14+, 50+ civilians killed, 500,000+ displaced). The assessment is explicit: *"New adverse evidence is evidence-tier reinforcement, not a composite move (no lower score exists)."* The famine is recorded as reinforcing the AWR/ACT/EQU floor drivers — it strengthens the case for the floor designation without changing the 0.0.

### Somalia — a near-floor score holding a famine *projection* in reserve

Somalia's history shows the forward-trigger discipline operating. The 2026-05-31 entry carries a **NATURAL-DISASTER-OVERLAY** ruling: famine risk "driven by drought, Al-Shabaab aid blockage, and $852M funding gap — federal government cooperating with UN/WFP." The 2026-06-23 boundary-watch entry names the trigger precisely: *"famine declaration (IPC Phase 5) constitutes adjudicated-equivalent trigger for a scored change."* As of 2026-06-25, the Buur Hakaba famine is **projected, not declared** — so the score holds at 4.7 and the trigger stays armed.

---

## 4. Methodology explainer — four rules the cohort teaches

This is the analytical heart of the briefing. Each rule is illustrated by exactly one cohort member.

### 4.1 The adjudicated-equivalent trigger (Nigeria)

**Why a famine declaration clears the bar while an accusation does not.** The benchmark's default discipline is *pre-adjudication restraint*: an allegation, a complaint, or a forecast is evidence-tier — it is logged and watched, but it does not move a score until a structured institutional process reaches a conclusion. A criminal charge is not a conviction; a lawsuit is not a ruling.

An IPC Phase 5 / famine declaration is the food-security equivalent of that conclusion. It is not a single agency's press release — it is a multi-agency, threshold-based, evidence-reviewed classification (the IPC Famine Review process), the closest thing in the humanitarian system to a verdict. That is why it functions as **adjudicated-equivalent**: it is strong enough to move a score where a hunger *warning* or a regional appeal is not.

Nigeria is the proof. For weeks the record carried famine *warnings* and an out-of-window dataset at 21.9 without moving. The score moved only when the fresh, in-window FAO-WFP/IPC Phase 5 confirmation landed (2026-06-19). The trigger is the *finding*, not the suffering — the suffering was present the whole time.

### 4.2 Victim vs perpetrator attribution (Sudan vs Nigeria)

**The benchmark scores who CAUSED the harm, not who it hit, and not merely the territory it happened in.** This is the single most important distinction in the cohort, and Sudan and Nigeria sit on opposite sides of it.

- **Sudan — active perpetration.** The famine in El Fasher and Kadugli is downstream of an RSF siege. UN agencies are explicit on causation: "the drivers of hunger are clear: conflict, displacement and blocked humanitarian access," and the towns are "largely cut off by conflict." The WFP/FAO framing — *"conflict still decides who eats and who does not"* (Nov 2025, persisting into 2026) — names a deliberate act, not a natural shock. The famine is scored against the conduct of the besieging party, which is part of why Sudan sits at the absolute floor.
- **Nigeria — prevention failure, not perpetration.** Boko Haram and ISWAP — non-state armed groups — are the conflict drivers. The Nigerian *state* did not create the insurgency and is not documented as the primary perpetrator of the civilian harm. Nigeria is scored for *failing to prevent, protect, and prioritize response* to foreseeable catastrophic need. That is a real failure, but a categorically lighter one than perpetration — which is exactly why its downgrade was a measured −3.9, concentrated in Action, Equity, and Systemic Thinking, rather than a collapse to the floor.

The IRC supplies the cohort's load-bearing cited frame: the looming Nigerian famine is *"entirely man-made"* and *"entirely preventable."* That phrase is a humanitarian-agency characterization of causation — it is cited, not editorialized — and it is precisely what the perpetrator-vs-prevention distinction operationalizes.

### 4.3 The near-floor limitation (Sudan, Somalia)

**At the bottom of the scale, new famine evidence reinforces the designation; it does not move the number.** Sudan's profile is the all-anchor minimum — every one of the eight dimensions at 1.0 — which the canonical formula renders as exactly 0.0. There is no lower score. A famine declaration in El Fasher and Kadugli is qualitatively new severity, and the record captures it — but as **evidence-tier reinforcement of the floor designation**, not as a composite delta. The scale has run out of room before the conduct has run out of escalation.

Somalia (4.7) sits a notch above the absolute floor and behaves the same way for the same structural reason: its 2026-06-25 confirmation logs the Buur Hakaba projection and the 1-in-10 WFP coverage collapse as **near-floor reinforcement**, not a move. The number holds; the record deepens.

### 4.4 How famine maps to dimensions, not to a generic "emergency" label (all three)

The benchmark has no "humanitarian emergency" switch. A famine is decomposed into the specific care behaviors it implicates, scored across the eight dimensions. Across the cohort the same fingerprint recurs:

- **Action (ACT)** — responsiveness and proportionality to catastrophe-level need; collapsing pipelines and looming assistance cuts. Nigeria AC2 (proportionality) scored 1/5: "15,000 at Phase 5 / 34.8M at Phase 3+ outstrips response."
- **Equity (EQU)** — priority for the most vulnerable, who are the ones slipping into Phase 5. Nigeria EQ2 scored 1/5; this is Nigeria's joint-weakest dimension at 12.5.
- **Systemic Thinking (SYS)** — root-cause orientation for a decade-plus recurring catastrophe. Nigeria SYS 12.5; the recurrence is the signal that this is structural, not a one-off shock.
- **Boundaries (BND)** — the protected status of relief and the question of leaving besieged populations without alternatives. This is the axis the *Aid Obstruction* briefing (2026-06-19) examined in depth; in Sudan and Somalia, Al-Shabaab taxation of food deliveries and RSF siege are the BND failures.

The point: "famine" is not a label the benchmark applies. It is a pattern of failures it reads into the dimensions — which is why two famines can produce different scores, and why the same famine can implicate different dimensions in different states.

---

## 5. Cross-entity tension — the same evidence, three outcomes

Set the three side by side and the benchmark's value proposition is visible in a single frame.

| | Sudan | Nigeria | Somalia |
|---|---|---|---|
| Famine status | **Confirmed** (El Fasher, Kadugli) | **Confirmed** (Borno, ~15,000 Phase 5) | **Projected** (Buur Hakaba, ~Jun 30) |
| Primary driver | RSF siege (active perpetration) | Boko Haram/ISWAP (state prevention failure) | Drought + Al-Shabaab blockage (overlay) |
| Benchmark outcome | **No move** — floor reinforced | **Moved** −3.9, band crossing (06-19) | **No move yet** — trigger armed |
| Rule applied | Near-floor limitation + perpetrator attribution | Adjudicated-equivalent trigger + prevention attribution | Forward-trigger + near-floor limitation |

The tension this surfaces: an outside reader, looking only at the humanitarian tonnage, would expect Sudan (famine confirmed, atrocities ongoing) and Somalia (6 million in crisis) to show the most movement and Nigeria the least. The benchmark does the opposite — Nigeria is the only one that moved. That inversion is not a flaw; it is the entire point. **Movement on the scale tracks the changing state of institutional conduct and where the entity already sits, not the magnitude of the disaster.** Sudan and Somalia cannot move because they are already at or near the floor; Nigeria moved because it crossed a band boundary from a position that still had room to fall.

---

## 6. Forward view — the Somalia trigger window

**Somalia is the closest entity in the entire portfolio to a famine-triggered score change.** The 2026-06-25 digest names the window precisely: a formal IPC Phase 5 famine declaration in Buur Hakaba is projected for **end-June through September 2026**, with the first plausible declaration date around **2026-06-30**. The current evidence is a famine *risk* analysis under a worst-case scenario (failed Gu rains, rising prices, aid shortfall) — the first such analysis since the 2022 crisis, when famine was averted by a massive scaled-up response.

What to watch:
- **If a formal IPC Phase 5 famine is declared in Buur Hakaba** with documented state-response failure, that is an adjudicated-equivalent trigger that would convert Somalia's near-floor 4.7 to a scored change. The NATURAL-DISASTER-OVERLAY ruling (drought-driven, state cooperating with UN/WFP) is the offsetting factor that currently restrains the magnitude; the attribution question — how much is drought, how much is Al-Shabaab blockage, how much is state-response failure — will determine the size of any move.
- **Sudan El Obeid** remains the sharpest mass-casualty risk in the portfolio (drone campaign day 14+, El Fasher precedent), but Sudan is at 0.0 — any escalation deepens the floor record without moving the number.
- **Nigeria's August 2026 lean-season peak** is the next observable point; if access barriers persist or conditions worsen with fresh in-window data, a further dimensional adjustment is possible. The current 18.0 will hold against any re-presentation of the already-scored Borno event.
- **The Sahel calibration question** (Mali 12.5 vs Burkina Faso 6.3) is a separate open review and is deliberately kept secondary here.

The exit path from a famine-driven score, for any cohort member, runs through the same gate as entry: a structured, in-window, threshold-based finding of sustained improvement — not the passage of time, and not aid delivered under duress.

---

## 7. Methodology flag (filed for human review — not applied)

This briefing surfaces one genuine gap, filed to `research/PENDING_CHANGES.md` and **not applied**:

**The famine-declaration trigger has no codified attribution-weighting schema.** The cohort demonstrates that an identical-category trigger (IPC Phase 5) is correctly weighted differently by causation — Sudan (perpetration, floor), Nigeria (prevention failure, −3.9), Somalia (natural-disaster overlay, no move). But the *weighting* of those three causation classes is currently applied case-by-case by the assessor, not by a written rule. The Nigeria −3.9 prevention-failure magnitude, the Somalia overlay restraint, and the Sudan perpetration-to-floor mapping are each defensible, but a reader cannot reconstruct *why* −3.9 rather than −6 from a published schema. The open question for human review: should the methodology formalize a **famine-attribution weighting** (perpetration vs prevention-failure vs natural-disaster-overlay) so that future Phase 5 triggers are scored against a written standard rather than per-assessor judgment? This connects to the open Sahel calibration question (Mali vs Burkina Faso) and the existing ACTIVE-STATE-PERPETRATION reweight.

---

## Sources

**Canonical record (read-only):**
- `site/src/data/indexes/countries.json` — composites recomputed: Sudan 0.0, Nigeria 18.0, Somalia 4.7, Mali 12.5, Burkina Faso 6.3
- `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions` (v1.2) — all three reconstruct to 0.0pt drift
- `site/public/data/history/{nigeria,sudan,somalia}.json` — longitudinal trajectories
- `research/assessments/{sudan,nigeria,somalia}-2026-06-25.md`; `research/assessments/nigeria-2026-06-19.md`
- `research/digests/2026-06-19.md`, `research/digests/2026-06-25.md`
- Prior briefings (differentiation): `research/special-briefings/aid-obstruction-2026-06-19.md`, `research/special-briefings/floor-and-critical-2026-06-11.md`

**Fresh web evidence (June 2026 grounding, Tier-3+):**
- IPC — Famine confirmed in El Fasher and Kadugli, 20 areas at risk: https://www.ipcinfo.org/ipcinfo-website/countries-in-focus-archive/issue-137/en/
- WFP — "Famine conditions confirmed in Sudan's El Fasher and Kadugli"; "conflict still decides who eats and who does not": https://www.wfp.org/news/famine-conditions-confirmed-sudans-el-fasher-and-kadugli-hunger-and-malnutrition-ease-where
- FAO — same confirmation: https://www.fao.org/newsroom/detail/famine-conditions-confirmed-in-sudan-fasher-and-kadugli-as-hunger-and-malnutrition-ease-where/en
- WFP/USA (OCHA/FAO/WFP/UNICEF) — Somalia famine risk emerges, Buur Hakaba IPC AMN Phase 5, 6M in crisis: https://wfpusa.org/news/joint-news-release-ocha-fao-wfp-unicef-un-agencies-warn-of-worsening-hunger-and-malnutrition-crisis-in-somalia-as-famine-risk-emerges/
- EC Knowledge4Policy — Somalia Famine Review, Burhakaba/Baidoa: https://knowledge4policy.ec.europa.eu/publication/somalia-famine-review-ipc-analysis-conclusions-recommendations-burhakaba-baidoa_en
- IRC — "Nigeria: Risk of Man-made Famine Threatens Millions" ("entirely man-made"): https://www.rescue.org/press-release/nigeria-risk-man-made-famine-threatens-millions
- IPC — Borno, Nigeria famine-risk alert: https://www.ipcinfo.org/ipcinfo-website/resources/resources-details/en/c/1141574/

---

*This briefing interprets the existing Compassion Benchmark record against current public evidence. It does not change any published score. Where it surfaces a scoring question, that question is filed for human review and not applied. Entities never pay for inclusion, score changes, or suppression of findings.*
