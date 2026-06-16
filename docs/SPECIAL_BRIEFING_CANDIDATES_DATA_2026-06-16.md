# Special Briefing Candidates — Data-Mined Shortlist (2026-06-16)

**Author:** Research/data-mining pass over the canonical record (read-only).
**Inputs:** the 7 index JSONs (`site/src/data/indexes/*.json`, 1,156 scored entities), daily briefings 2026-06-10 → 2026-06-15, `research/PENDING_CHANGES.md` (Boundary Watch cluster + SBQ-1..19), assessor summaries 2026-06-12 → 2026-06-15, and `site/src/data/dimensions.ts`.
**Status:** Research output — candidate *topics*, not briefings. No data or code modified. All entity names + numbers below are pulled directly from the JSONs / record.

**Already published (avoid duplicating):** floor-and-critical, exemplars ("What Good Looks Like"), AI Governance Under Pressure, Layoffs Despite Profits.
**Fair to refine (proposed-but-unbuilt):** State-of-Exception / democratic backsliding, Aid Obstruction, Boundary Watch.

---

## Ranked shortlist (strongest first)

| # | Working title | One-line thesis | Scope size |
|---|---------------|-----------------|------------|
| 1 | **The Equity Floor** | One dimension — Equity — is the single weakest score in 90% of all 1,156 entities and the only thing keeping most "exemplars" off the top of the scale. | 1,046 of 1,156 entities (EQU at/tied weakest); 61 of 63 exemplars |
| 2 | **What the Product Is For** | In both AI and robotics, the *purpose of the core product* — not conduct — predicts the score: defense/surveillance/weapons cluster at the floor, healthcare/accessibility at the ceiling. | 8 defense/surveillance entities (0–48.4) vs 13+ healthcare-accessibility exemplars |
| 3 | **State of Exception** | A live cohort of governments is converting emergency/security law into codified impunity in real time — Bolivia's 3-cycle collapse is the template; the record can now show the mechanism, not just the floor. | ~12–15 countries (Bolivia 6.3, US 17.5, UAE 18.4, + the ACC/INT=1.0 floor states) |
| 4 | **The Extractive Discount** | Fortune 500 compassion tracks the business model: fossil-fuel and extraction sectors occupy the bottom as a bloc, insurance/finance the top — a structural pattern, not a few bad actors. | Coal (13.3), Energy (21.2), Mining (24.1), Energy Services (25.6) — ~70 firms |
| 5 | **The 35.9 Problem** | Hundreds of entities share identical composites (219 at exactly 35.9, 127 at 48.4), a quantization signature of placeholder first-baselines rather than measured assessment — a transparency question about the record itself. | 219 + 127 + 70 + 62 entities at four exact values |
| 6 | **Aid Obstruction** | Across the floor cohort, the scorable harm is increasingly *blocking help* (aid denial, monitoring suppression, criminalizing relief) rather than direct violence — a distinct harm class the framework treats specially. | Israel, Sudan, DRC, Russia, US, Bolivia — 6+ entities |
| 7 | **When the Capital Falls First** | Seven capital cities sit at the absolute 0.0 floor; two (Bangui, Port-au-Prince) are below their own parent country — surfacing the unresolved city→country attribution rule. | 7 floor capitals; 2 below-parent outliers |
| 8 | **The Compelled-Conduct Doctrine** | The record is quietly building a symmetric rule: scores move on *self-initiated* conduct, never on what an entity was forced to do — at both ends of the scale. | Anthropic 59.1, Microsoft 65.3, Hungary 50.2, OpenAI 27.5 |

---

## Candidate 1 — The Equity Floor

**Pattern / thesis.** Across every index and entity type, Equity (EQU) is the systematically lowest of the eight dimensions. It is the single weakest score for 1,046 of 1,156 scored entities (90%), and the mean gap between an entity's other-seven-dimension average and its EQU score is 0.38 points on the 1–5 scale — a structural deficit that holds for Switzerland and Sudan alike. At the top of the scale this is decisive: EQU is at the minimum for 61 of the 63 exemplars (composite ≥ 80), is below 4.0 in 38 of them, and is the *only* sub-band dimension for 43 of them. The "Exemplary" band is, in practice, an "everything-high-except-fairness" band.

**Entity scope (quantified).** Universe = all 1,156 entities. Per-index EQU means are the lowest dimension everywhere: countries 2.09, US cities 2.12, global cities 2.16, Fortune 500 2.21, US states 2.34, EQU vs ~2.6–3.0 for every other dimension; AI labs 2.45, robotics 2.77. Exemplar illustration: 63 entities ≥ 80, of which 61 have EQU as their floor — e.g. Switzerland (97.5, EQU 4.0 vs 4.5s elsewhere), Target (92.8, EQU 4.0), Hawaii (95.9, EQU 4.0).

**Evidence anchors in the record.** The exemplars briefing already surfaced this as SBQ-8 ("the band is in practice an 'everything-high-except-equity' band; a single sub-4.0 equity score is the entire distance between the band leaders at 97.5 and its floor at ~81"). The integration premium's `weaknessFactor` (`dimensions.ts`, `INTEGRATION_PREMIUM`) is the mechanism: one weak EQU cancels the consistency bonus.

**Methodology tension it surfaces.** SBQ-8 directly — should reaching Exemplary require a minimum EQU floor (e.g. EQU ≥ 4.0), making the implicit pattern an explicit rule? And the deeper question: if every institution type underperforms on the *same* dimension, is that a real finding about the world, or an artifact of how EQU's anchors (disaggregated outcome data, independent audit, co-design) set a bar almost no institution meets?

**Why timely.** It is the one finding that unifies all seven indexes and both already-published top/bottom briefings; it is the cleanest "here is what the whole benchmark is really measuring" story, and SBQ-8 is open for human review now.

---

## Candidate 2 — What the Product Is For

**Pattern / thesis.** In the two technology indexes, the *function of the core product* predicts the compassion score more than any conduct signal. Sort AI labs by sector and robotics labs by category and the same gradient appears in both: defense / surveillance / security products occupy the floor, healthcare / accessibility / education products occupy the ceiling. The benchmark is, in these indexes, partly scoring the teleology of the technology — which is defensible (a weapon has no remediation surface) but also explains the anomalous 26% Exemplary rate in robotics (SBQ-7).

**Entity scope (quantified).** Defense/surveillance/weapons cohort (8 entities, all Developing or Critical): Ghost Robotics 0.0, Paladin AI (Shield AI) 9.4, Clearview AI 10.9 (surveillance), Boston Dynamics SPOT-demo 20.3, Anduril 31.3, Kawasaki Heavy (Industrial/Defense) 35.9, Sarcos 35.9, Moog 48.4. Top cohort: robotics Healthcare/Accessibility mean 92.1 (Open Bionics 97.5, Ottobock, etc.), Education 85.0, Healthcare 83.0; AI Safety/Research 70.3, AI/Open Source 69.0, AI/Healthcare and AI/Drug-Discovery 60.9. The AI/Government and AI/Surveillance sectors mean 0 and 10.9; AI/Defense 31.3.

**Evidence anchors in the record.** SBQ-7 (robotics is 26% Exemplary "because a single intrinsically pro-social product satisfies the band on a narrow surface"). SBQ-1 floors Ghost Robotics and Palantir AI under "no remediation surface" for weaponized/military product. The floor-and-critical briefing already established the "product as floor mechanic" for individual entities — this candidate generalizes it into a cross-index gradient.

**Methodology tension it surfaces.** SBQ-1 + SBQ-7 together: if the product floors you at the bottom (no remediation surface) and lifts you at the top (narrow pro-social mandate), is the benchmark measuring *compassion conduct* or *product category*? Should there be a breadth-of-mandate qualifier symmetric to the floor mechanic?

**Why timely.** Distinct from the published AI Governance briefing (which was about *external pressure*, not product purpose) and from the exemplars briefing (which was cross-type). It is the most visually clean chart in the dataset and directly motivates two open SBQs.

---

## Candidate 3 — State of Exception

**Pattern / thesis.** A live cohort of governments is converting emergency, security, and "anti-terror" law into codified, durable impunity — and the record has, in the last two weeks, captured the *mechanism* in real time rather than just the endpoint. Bolivia is the template: a three-cycle, five-assessment descent (28.4 → 18.4 → 12.8 → 6.3) driven by the June 9 Law Regulating States of Exception (military deployment against protesters, the 60-day emergency cap eliminated, deployment restrictions repealed, 8-hour detentions), ending with ACC and INT both driven to the 1.0 floor on an "evidence-free narco-terrorism" justification. The same ACC=INT=BND=1.0 governance-collapse signature recurs across the floor states.

**Entity scope (quantified).** Core: Bolivia (6.3), and the 12 countries at exactly 0.0 sharing the ACC=INT=BND=1.0 signature (Afghanistan, Belarus, Eritrea, Israel, Myanmar, North Korea, Russia, South Sudan, Sudan, Syria, Turkmenistan, Yemen). Adjacent live cases: US (17.5; ICE death-reporting eliminated, 287(g) all 67 FL counties), UAE (18.4, complicity-by-proxy cap), plus Saudi Arabia/Turkey/China where ACC and INT both sit at 1.0–1.15. This is the one of the three unbuilt themes the data *most* supports now — Bolivia is the only entity in the record with a "predicted-trigger-realized" sequence.

**Evidence anchors in the record.** The new methodology rulings PREDICTED-TRIGGER-REALIZED and ACC-FLOOR-DESIGNATION: MILITARY-DEPLOYMENT-WITH-REPEALED-SAFEGUARDS (both Bolivia, 2026-06-14, v1.3 candidates). The June 13 → June 14 digest sequence where the state-of-exception law was *named in advance* as the crossing trigger and then confirmed. PRICED-CONTINUATION ruling (US/Turkey/India "same-regime continuation").

**Methodology tension it surfaces.** How does the benchmark distinguish a genuine emergency response from codified impunity? The PREDICTED-TRIGGER-REALIZED ruling is brand-new and unpublished; this briefing would be its public debut. Also surfaces the conduct-vs-coercion line: when is a security law itself the harm vs. its execution (cf. Bolivia "authorized on paper, not yet executed," June 15).

**Why timely.** Bolivia is the single fastest-moving entity in the 30-day window and the only predicted-then-realized crossing on record; the law was signed June 9. Refines the unbuilt "democratic backsliding" theme with a concrete 2026 spine.

---

## Candidate 4 — The Extractive Discount

**Pattern / thesis.** Within the Fortune 500, the compassion score tracks the *business model* as a structural bloc, not a scatter of individual bad actors. Sorted by sector mean composite, the bottom is a clean extractive-industries cluster and the top is finance/insurance/hospitality — a gradient that holds across ~70 firms and is invisible at the single-entity level the site currently presents.

**Entity scope (quantified).** Bottom sectors (mean composite, n): Coal 13.3 (8), Energy 21.2 (39), Mining 24.1 (5), Energy Services 25.6 (18), Telecom 32.0 (8), Real Estate 32.2 (5), Chemical 32.9 (13). Top sectors: Insurance 63.1 (12), Hospitality 57.6 (8), Finance/Financials ~51 (34), Fintech 48.4. The extractive bloc (Coal+Energy+Mining+Energy Services) = 70 firms, mean ~21, versus the F500 mean of 39.4.

**Evidence anchors in the record.** The Fortune 500 band table (53 Critical, 215 Developing). GEO Group at 6.6 (lowest F500, private prisons) cited in SBQ-1. Note the data caveat: this sector pattern co-exists with the quantization issue in Candidate 5 (many of these sit at 12.5/14.1/18.8), so the briefing should foreground sector *medians and named leaders/laggards*, not lean on the cluster values.

**Methodology tension it surfaces.** Is a low score a finding about the *firm's conduct* or about its *industry's intrinsic suffering footprint*? Extends SBQ-1's corporate-floor question: should there be a `CORPORATE-ACTIVE-PERPETRATION-FLOOR` for extractive/weaponized business models analogous to the product-floor used for labs?

**Why timely.** The published Layoffs-Despite-Profits briefing covered F500 *Boundaries* conduct; this is the orthogonal *sector-structure* cut and reuses none of its entities except as contrast. Energy is also the largest single F500 sector (39 firms) so it is high-coverage.

---

## Candidate 5 — The 35.9 Problem (Data Integrity / Transparency)

**Pattern / thesis.** Hundreds of entities share pixel-identical composites: 219 entities sit at exactly 35.9, 127 at exactly 48.4, 70 at 23.4, 62 at 60.9, 44 at 18.8. These are not coincidences — they are uniform-anchor "placeholder first-baseline" profiles (every subdimension set to the same integer/half-integer), which the methodology already flags as distinct from independently measured assessment. A briefing that *names this in the institution's own voice* — "here is where our record is thin, and how we mark it" — would be a distinctive transparency move that no competitor benchmark makes.

**Entity scope (quantified).** Cross-index exact-composite clusters: 35.9 (219), 48.4 (127), 23.4 (70), 60.9 (62), 18.8 (44), 25.0 (43), 32.8 (42), 20.3 (33), 12.5/31.3/0.0 (23 each). In the F500 Critical band specifically, SBQ-5 already isolates 41 of 52 at exactly 12.5/14.1/18.8. At the top, SBQ-9 isolates 6 robotics labs at exactly 83.0 and 4 entities at 81.4.

**Evidence anchors in the record.** SBQ-5 and SBQ-9 (both "flagged for first-baseline re-assessment; data-quality question, not interpretive"). The recurring assessor "rotation entity confirm at uniform 25.0 baseline" notes (e.g. five F500 rotation entities June 13).

**Methodology tension it surfaces.** The core independence/credibility question: how much of the published record is *measured* vs *seeded*, and how is that distinction marked to readers? Directly operationalizes SBQ-5 + SBQ-9.

**Why timely.** Founder has flagged provenance/freshness concerns this fortnight (SBQ-11, the P&G 2025-vs-2026 source date). This is the meta-version of that worry and turns a vulnerability into a published-methodology strength. Caveat: this is a *transparency* briefing, not a "findings" briefing — frame accordingly.

---

## Candidate 6 — Aid Obstruction

**Pattern / thesis.** Among the floor cohort, the dominant *scorable* harm has shifted from direct violence toward the obstruction of relief — blocking aid entry, suppressing monitoring/death-reporting, and criminalizing the people who provide help. The framework treats this as a distinct harm class (it implicates AWR signal-amplification, ACC transparency, and BND refusal-ethics simultaneously), and the last two weeks are dense with it.

**Entity scope (quantified).** Israel (0.0; OCHA 936 killed since ceasefire, 36% aid entry, meal provision −55%), Sudan (0.0; appeal 16% funded, 30M+ in need, GBV need 12.7M), DRC (2.3; Ebola response with state-obstruction-as-conversion-trigger), Russia (0.0; OVD-Info designated "extremist," criminalizing legal aid), United States (17.5; ICE ended detainee-death reporting June 4, Medicaid narrowing), Bolivia (6.3; six deaths from *blocked medical access*). 6 anchor entities, all in the floor/near-floor/Critical cohort.

**Evidence anchors in the record.** Recurring forward-trigger language "documented state obstruction of WHO/MSF access = conversion trigger" (DRC, every cycle June 10–15). ATTRIBUTION-VICTIM-ENTITY-SCORING ruling (Palestine harm attributed to Israel conduct). "Monitoring Suppression Pattern Continues" sector alert (June 15). The ICE death-reporting elimination repeated across four digests.

**Methodology tension it surfaces.** Is suppressing the *measurement* of harm (ending death-reporting, designating monitors "extremist") itself a scorable harm distinct from the underlying harm? This is an AWR/ACC question with no named ruling yet — the briefing could propose one. Also the natural-disaster-overlay non-double-count rule (DRC) intersects here.

**Why timely.** It is one of the three explicitly-fair-game unbuilt themes; the obstruction evidence recurs in *every* daily briefing of the window and DRC's July 31 structural-review deadline gives it a forward hook.

---

## Candidate 7 — When the Capital Falls First

**Pattern / thesis.** Seven capital cities sit at the absolute 0.0 floor, and two of them score *below their own parent country* — surfacing an unresolved attribution rule about how a benchmark composes city-level and country-level judgments when state authority has collapsed unevenly.

**Entity scope (quantified).** Floor capitals (global-cities, 0.0): Ashgabat (Turkmenistan 0.0), Asmara (Eritrea 0.0), Kabul (Afghanistan 0.0), Naypyidaw (Myanmar 0.0), Pyongyang (North Korea 0.0) — coherent with floored parents. Outliers: Bangui (parent CAR 4.7, but CAR not in city index lookup) and Port-au-Prince (0.0, parent Haiti 4.7) — capital scores *below* the country. 7 floor capitals, 2 below-parent anomalies.

**Evidence anchors in the record.** SBQ-3 verbatim ("Bangui (parent CAR 4.7) and Port-au-Prince (parent Haiti 4.7) are at the 0.0 floor while their parent countries are not... rests on case-by-case judgment. Decision needed: adopt an explicit ATTRIBUTION-NON-STATE-ACTOR-AT-FLOOR-for-cities rule").

**Methodology tension it surfaces.** SBQ-3 directly — when does a city inherit its country's floor, and when can it fall below it (non-state-actor collapse concentrated in the capital)? The city→country floor-inheritance rule is unformalized.

**Why timely.** Smallest scope of the set and overlaps the published floor briefing's territory, hence ranked lower — but it is a tight, self-contained "how the benchmark reasons about nested entities" piece that closes an open SBQ. Best as a shorter companion piece, not a flagship.

---

## Candidate 8 — The Compelled-Conduct Doctrine

**Pattern / thesis.** The record is quietly assembling a symmetric, cross-index rule that compassion scores move on *self-initiated* conduct and never on what an entity was forced to do — neither rewarded for compelled remedies nor punished for compelled restrictions. It is one of the most intellectually distinctive things the benchmark does, but it is currently scattered across case-by-case narrative rather than stated as doctrine.

**Entity scope (quantified).** Anthropic (59.1 → 58.8): government-mandated Fable 5/Mythos 5 shutdown scored on transparent-compliance *conduct*, net-neutral (GOVERNMENT-MANDATED-AI-SHUTDOWN-CONDUCT-SCORING). Microsoft (65.3): compelled human-rights remedy held sub-threshold under COMPELLED-REMEDY-NOT-SELF-CORRECTION. Hungary (50.2): six-cycle recovery 28.1 → 50.2 reaches only Functional because trajectory ≠ conferred band. OpenAI (27.5): 42-state AG subpoena held sub-threshold under ALLEGATION-NOT-ADJUDICATED (−1.6). 4 anchor entities across countries + AI labs.

**Evidence anchors in the record.** SBQ-16 (publish COMPELLED-RESTRICTION-SCORED-ON-CONDUCT, symmetric to COMPELLED-REMEDY-NOT-SELF-CORRECTION), SBQ-10 (Exemplary conferred only on sustained self-initiated conduct, never trajectory or compelled remedy), SBQ-17 (subpoena→enforcement conversion trigger). The Anthropic and Microsoft rulings already exist as applied case law.

**Methodology tension it surfaces.** The exact symmetry question across SBQ-10/16/17: is "compelled" rule-bound at both the positive (forced remedy doesn't lift you) and negative (forced shutdown doesn't sink you) ends? This briefing would consolidate the doctrine and force the unpublished rules into the open.

**Why timely.** All four anchor events are inside the two-week window and three SBQs (10, 16, 17) were raised June 15. Note: it overlaps the published AI Governance briefing on the Anthropic/OpenAI facts, so it must reframe around the *cross-index doctrine* (adding Microsoft + Hungary) rather than re-narrate the AI events — hence ranked last despite strong methodological interest.

---

## Notes on ranking logic

- **#1–2** are the strongest: each is a clean, quantified cross-index structural pattern (90% EQU-weakest; product-purpose gradient), each maps to an open SBQ, and neither is covered by a published briefing.
- **#3–4** are strong single-index/cohort patterns with live 2026 spines (Bolivia's law; the energy bloc) and fresh rulings to debut.
- **#5–6** are distinctive and timely but carry framing constraints (#5 is meta/transparency not findings; #6 overlaps the floor briefing's cohort and must lead with the *obstruction-as-harm-class* angle).
- **#7–8** close open SBQs cleanly but overlap published territory (floor briefing; AI Governance briefing) and have smaller or more reframing-dependent scope — best as companion pieces.

**Cross-cutting caveat for any of these:** the quantization issue (Candidate 5) contaminates cluster-mean arguments. Briefings #4 especially should rely on named leaders/laggards and medians rather than treating identical composites as independent measurements.
