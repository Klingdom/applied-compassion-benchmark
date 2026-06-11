# Pattern Analysis — The Critical Band and the 0.0 Floor

**Date:** 2026-06-11
**Author:** Benchmark research analysis (read-only mining of index JSONs + ruling corpus)
**Scope:** All 7 indexes (1,156 entities); the CRITICAL band (composite ≤ 20) and the 0.0 absolute floor; the emerged methodology-ruling taxonomy.
**Sources:** `site/src/data/indexes/*.json`, `research/APPLIED_CHANGES.md`, `research/PENDING_CHANGES.md`, `research/change-proposals/*2026-0[56]-*.json`, `.claude/agents/benchmark-research.md` + `overnight-assessor.md`, `site/src/data/dimensions.ts`.

---

## 0. Verified snapshot

Recomputed directly from `rankings[]` in each index (composite ≤ 20 = Critical; composite ≤ 0.05 = floor):

| Index | Total | Critical | Floor | Crit % |
|-------|------:|---------:|------:|-------:|
| countries | 193 | 45 | 12 | 23.3% |
| fortune-500 | 448 | 52 | **0** | 11.6% |
| global-cities | 250 | 68 | 7 | 27.2% |
| ai-labs | 50 | 5 | 3 | 10.0% |
| robotics-labs | 50 | 2 | 1 | 4.0% |
| us-states | 21 | 4 | 0 | 19.0% |
| us-cities | 144 | 0 | 0 | 0.0% |
| **Total** | **1,156** | **176** | **23** | 15.2% |

The pre-supplied snapshot (176 Critical / 23 floor; per-type breakdown) is **confirmed exactly**. No drift.

**The single most important structural fact:** every one of the 23 floor entities carries an identical dimension vector — `[1/1/1/1/1/1/1/1]` (all eight dimensions at the minimum anchor of 1). The floor is not a low score; it is the *collapse of the entire profile to the anchor floor simultaneously*. This is what the canonical composite formula renders as 0.0 (see §4), and it is reserved by ruling for a specific class of conduct.

---

## 1. The floor roster — who is at 0.0, and the driving ruling

All 23 entities have raw dimensions `[1/1/1/1/1/1/1/1]` → composite 0.0. They are grouped below by the methodology ruling that placed/holds them there (rulings sourced from APPLIED_CHANGES floor-confirmation log and the change-proposals).

### Countries (12)

| Entity | Governing floor ruling | Documented basis (in-window) |
|--------|------------------------|------------------------------|
| Israel | AUTHORIZED-RESUMPTION-WITH-SYSTEMATIC-DENIAL (sub-category of in-territory perpetration) | 59% aid-movement denial through Israel-authorized corridor; 72,744 cumulative deaths cited; post-ceasefire civilian-targeting |
| Russia | ACTIVE-PERPETRATION-FLOOR + CIVIC-DEATH-LAW-FOR-DIASPORA | Largest post-ceasefire strike packages; Duma civic-death law for emigrated nationals (May 26) |
| Myanmar | ACTIVE-STATE-PERPETRATION (airstrike regime) | 982 civilian airstrike deaths 2025 (+53% YoY, 287 children); 3.6M displaced |
| Sudan | CONFLICT-DRIVEN-FAMINE-AT-FLOOR | IPC Phase 5 famine (El Fasher, Kadugli); 33.7M needing aid (globally largest) |
| South Sudan | CONFLICT-DRIVEN-FAMINE-AT-FLOOR | IRC Watchlist #3; 73,000 facing starvation; aid routes cut |
| Afghanistan | GENDER-APARTHEID-FORMAL-RECOGNITION (Tier-1 floor) | Decree No. 18; People's Tribunal genocide finding |
| North Korea | ACTIVE-PERPETRATION-FLOOR (chronic total-control) | Baseline floor; no accountability surface |
| Eritrea | ACTIVE-PERPETRATION-FLOOR (chronic) | Indefinite conscription; closed-state repression |
| Turkmenistan | ACTIVE-PERPETRATION-FLOOR (chronic) | Total information control; see Ashgabat below |
| Belarus | ACTIVE-PERPETRATION-FLOOR (chronic post-2020 repression) | Political-prisoner regime |
| Syria | CONFLICT/PERPETRATION-FLOOR | Sustained conflict + displacement |
| Yemen | CONFLICT-DRIVEN-FAMINE-AT-FLOOR | Famine conditions + multi-party conflict |

### Global cities (7) — all are capitals of floor countries

| City | Parent country | Inherits |
|------|----------------|----------|
| Pyongyang | North Korea | perpetration floor |
| Naypyidaw | Myanmar | airstrike-regime floor |
| Kabul | Afghanistan | gender-apartheid floor |
| Asmara | Eritrea | chronic-perpetration floor |
| Ashgabat | Turkmenistan | chronic-perpetration floor |
| Bangui | Central African Republic (country itself at 4.7, **not** floor) | **inconsistency — see §6** |
| Port-au-Prince | Haiti (country at 4.7, **not** floor) | ATTRIBUTION-NON-STATE-ACTOR (gang collapse) — **inconsistency — see §6** |

### AI labs (3)

| Entity | Governing ruling | Basis |
|--------|------------------|-------|
| xAI/Grok | Three distinct governance-failure categories (incl. prompt-manipulation, NUCLEAR-THREAT-RHETORIC-AS-SCORED-GOVERNANCE-SIGNAL, Pentagon perverse-procurement) | repeated, uncorrected |
| Character AI | Product-as-active-harm | PA AG suit: chatbot impersonated licensed psychiatrist to a depressed user; child-safety harm pattern |
| Palantir AI | MILITARY-AI-BY-CONTRACT-GOVERNANCE at floor | surveillance/targeting infrastructure, no remediation surface |

### Robotics labs (1)

| Entity | Governing ruling | Basis |
|--------|------------------|-------|
| Ghost Robotics | Weaponization-without-restriction | Explicit policy of not restricting military payload use ("we don't know what they do with them") |

**Is the floor coherent?** Mostly yes. The floor clusters into four defensible families: (a) **active in-territory state perpetration** (Russia, Myanmar, NK, Eritrea, Turkmenistan, Belarus, Syria); (b) **conflict-driven famine** (Sudan, South Sudan, Yemen); (c) **formally-recognized structural atrocity** (Afghanistan gender apartheid, Israel authorized-denial); (d) **non-state / product floor** (xAI, Character AI, Palantir, Ghost Robotics — entities whose *core product* is the harm, with no remediation pathway). The principle is consistent: **the floor marks conduct for which there is no remediation surface to credit** — not merely "very bad outcomes."

---

## 2. The Critical band, characterized by entity type

Per-type dimension averages for the Critical band (raw 1–5 anchor means; lower = worse):

| Type (n crit) | Avg composite | Weakest dims | Strongest dims | Profile signature |
|---------------|--------------:|--------------|----------------|-------------------|
| ai-labs (5) | 5.9 | BND, EQU, ACC | AWR, EMP | Near-floor; product-harm + boundary failures |
| robotics-labs (2) | 4.7 | EQU, INT | AWR, EMP | Weaponization / integrity collapse |
| countries (45) | 7.9 | EQU, ACC, INT | BND, AWR | Repression: no equity, no accountability, low integrity; some capacity (BND) |
| us-states (4) | 12.9 | EQU, ACC, INT | BND, AWR | Same shape as countries, shallower (carceral/equity) |
| global-cities (68) | 12.6 | BND, ACC, INT | ACT, AWR | Capital-of-failed-state inheritance + megacity service collapse |
| fortune-500 (52) | **14.5** | AWR, EQU, ACC | BND, EMP | **Shallowest Critical band; no dimension below 1.5** |

### Why Fortune 500 has 52 Critical but ZERO floor

Three converging reasons, two structural and one substantive:

**(a) The all-1-collapse threshold is almost never reachable by a corporation.** The floor requires *every* dimension at anchor 1 simultaneously. A Fortune-500 firm — even GEO Group (private prisons, the lowest at 6.6, dims `[1.5×8]`) or Meta Platforms (7.8) — retains some capacity/boundary structure (BND, SYS). UnitedHealth at 10.2 has individual dimensions dipping to 1.125 (ACC) and 1.25 (EMP/EQU) — *below* the uniform 1.5 of GEO Group — proving corporations **can** drive single dimensions toward the floor. But they do not collapse all eight at once, because a going concern still detects customers (AWR), still has bounded scope (BND), still has a governance system (SYS).

**(b) The composite formula structurally penalizes total collapse, not partial.** `composite = baseComposite + integrationPremium`, and **integrationPremium = 0 the moment any single dimension equals 0**. The floor entities are stored as all-1 (the lowest *anchor*), which maps to baseComposite `((1−1)/4)×100 = 0`. A corporation sitting at all-1.5 gets baseComposite `((1.5−1)/4)×100 = 12.5` — which is exactly why the F500 Critical band piles up at the quantized values **12.5, 14.1, 15.6, 18.8** (uniform or near-uniform low-anchor profiles). The math floor for a corporation that hasn't been ruled an active perpetrator is effectively ~6–12, not 0.

**(c) Substantively, the floor rulings are *conduct categories that corporations rarely fit*.** The floor families are in-territory perpetration, conflict famine, gender apartheid, and weaponized-product. Of the four product-floor entities, three are AI labs and one is a robotics lab — i.e., entities *defined by* an unremediable-harm product. A diversified corporation almost never matches: even GEO Group's harm has a (contested) remediation surface — contract terms, litigation, regulatory oversight — that the rulings credit above the floor.

**Is that defensible?** Partly. The structural reason (a/b) is a *side effect of the formula*, not a deliberate judgment — and that is the weak point. The substantive reason (c) is defensible: corporations are judged on a remediation-surface logic, and most have one. But the benchmark should make the distinction explicit rather than let the formula silently exempt an entire entity class. See §3 (corporate sub-taxonomy) and §6 (gaps).

**Dominant F500 Critical sectors** (from the roster): fossil fuel / coal / oil & gas (Exxon, Chevron, Halliburton, Marathon, Arch Resources, CONSOL, Warrior Met Coal, ~25 names), weapons/defense (Sturm Ruger, American Outdoor, Vista Outdoor, TransDigm, Boeing), private prisons (GEO Group, CoreCivic), platform/AI-harm (Meta), and healthcare-denial (UnitedHealth, and Elevance just above the line). The band is **sector-clustered**, whereas the countries Critical band is **conduct-clustered** (repression/conflict).

---

## 3. The ruling taxonomy (~40 emerged rulings)

Mined from APPLIED_CHANGES + PENDING_CHANGES + proposals. Grouped by function:

### A. Floor-qualifying / floor-holding (conduct with no remediation surface)
| Ruling | Applies to | Effect |
|--------|-----------|--------|
| ACTIVE-PERPETRATION-FLOOR (+ -REINFORCEMENT) | states | holds all-1 floor |
| ACTIVE-STATE-PERPETRATION-REWEIGHT (13×) | states | drives toward but not always to floor (Burkina Faso → 6.3, India → 15.6) |
| CONFLICT-DRIVEN-FAMINE-AT-FLOOR | states | floor |
| GENDER-APARTHEID-FORMAL-RECOGNITION | states (Afghanistan) | Tier-1 floor |
| AUTHORIZED-RESUMPTION-WITH-SYSTEMATIC-DENIAL | states (Israel) | floor-hold sub-category |
| CIVIC-DEATH-LAW-FOR-DIASPORA | states (Russia) | floor-category promotion |
| ATTRIBUTION-NON-STATE-ACTOR-AT-FLOOR | states/cities (Haiti/Port-au-Prince) | floor via non-state collapse |

### B. Reweight / downgrade (Critical-adjacent, not floor)
STATE-REPRESSION-IN-FLUX (10×), CODIFIED-IMPUNITY-ESCALATION (Bolivia), JUDICIAL-REMOVAL-OF-OPPOSITION-PARTY-LEADERSHIP (Turkey), PHYSICAL-SEIZURE-OF-OPPOSITION-PARTY-HEADQUARTERS (Turkey), CONSTITUTIONAL-AMENDMENT-AS-EXECUTIVE-REMOVAL, RETURN-HUBS-AND-NON-REFOULEMENT, ADJUDICATED-UNLAWFUL-CONDUCT-IS-SCORABLE (US), PRICED-CHRONIC-REPRESSION.

### C. Cap / hold (magnitude-limiting — keeps an entity *out* of floor)
ACTIVE-COMPLICITY-IN-MASS-ATROCITY-BY-PROXY (UAE → 18.4, **explicitly capped above floor** because external sponsor not in-territory perpetrator; ICJ case unadjudicated), FILED-BUT-UNADJUDICATED-LITIGATION, COORDINATED-INVESTIGATION-STILL-PRE-ADJUDICATION, WARN-HELD-POST-DEADLINE-BUT-STILL-PRE-ADJUDICATION, OCCUPATION-ATTRIBUTION-NON-DOUBLE-COUNT, NATURAL-DISASTER / EXOGENOUS-OVERLAY-NON-DOUBLE-COUNT.

### D. Corporate / litigation
COMPELLED-REMEDY-NOT-SELF-CORRECTION (8×; credit only for court-forced, not voluntary, remedy), SETTLEMENT-WITHOUT-ADMISSION (J&J), ADJUDICATED-PRIOR-REPARATION, ALGORITHM-BASED-WORKER-CLASSIFICATION(-TO-AVOID-LABOR-PROTECTIONS), CLASSIFICATION-MANIPULATION, IPO-CORPORATE-STRUCTURE-NET-NEUTRAL, CORPORATE-GOVERNANCE-POSTURE-NET-NEUTRAL, PLATFORM-SAFETY-TEAM-LAYOFF-AS-DUAL-DIMENSION-EVENT.

### E. AI / robotics governance
MILITARY-AI-BY-CONTRACT-GOVERNANCE (6×), NUCLEAR-THREAT-RHETORIC-AS-SCORED-GOVERNANCE-SIGNAL (8×), STRATEGIC-FORMAT-EXPLOITATION / BAD-FAITH-FORMAT, DIMENSIONAL-CREDIT-UNDER-SUB-THRESHOLD-COMPOSITE.

### F. Positive / remedy / mechanics
FORWARD-TRIGGER-RESOLUTION-CONFIRMED-FIRED (8×, upgrades), POSITIVE-DEMOCRATIC-CHECK-AGAINST-ASSESSED-DISMANTLER (5×, partial offset), EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM, HUMANITARIAN-BLOCKADE-FIRST-BASELINE-PROTOCOL, ANNOUNCED-NOT-VERIFIED-IMPROVEMENT (denies premature credit), SAME-REGIME-CONTINUATION.

**Overlaps / gaps:** ACTIVE-STATE-PERPETRATION-REWEIGHT (group B by effect) overlaps the floor family (A) but deliberately stops short of floor when *courts still reverse some acts* (India 15.6, Burkina Faso 6.3) — a clean, defensible boundary. The genuine **gaps**: (1) no symmetric *corporate* floor ruling — D has no "active-perpetration" analog; (2) the cities-inheritance rule is informal (Bangui/Port-au-Prince at floor while their countries are not); (3) ACTIVE-COMPLICITY-BY-PROXY (cap) vs ACTIVE-PERPETRATION (floor) is the load-bearing distinction but rests on "in-territory vs external" + "adjudicated vs filed" — a thin line UAE sits just on the safe side of.

---

## 4. Cross-type comparability — is UnitedHealth (10.2) "as bad as" Turkey (10.3)?

| Entity | Comp | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|--------|-----:|----:|----:|----:|----:|----:|----:|----:|----:|
| Turkey (country) | 10.3 | 1.6 | 1.6 | 1.6 | 1.4 | 1.2 | 1.15 | 1.6 | 1.15 |
| UnitedHealth (F500) | 10.2 | 1.75 | 1.25 | 1.5 | 1.25 | 1.5 | 1.125 | 1.5 | 1.375 |

The composites are within 0.1 point — **but the benchmark does not claim they are "equally bad," and the dimension shapes show why the equivalence is an artifact of a shared scale, not a shared meaning:**

- **Turkey's** failure is concentrated in **BND (1.2), ACC (1.15), INT (1.15)** — collapse of *political boundaries, accountability, and integrity* (opposition party dissolved, HQ seized). This is **governance** failure.
- **UnitedHealth's** failure is concentrated in **ACC (1.125), EMP (1.25), EQU (1.25)** — collapse of *accountability, empathy, and equity in claims handling* (AI claim-denial, DOJ criminal probe). This is **stakeholder-harm** failure.

The number is comparable; the *kind of suffering* is not. A country at 10.3 is failing ~85M citizens across the whole apparatus of state; a corporation at 10.2 is failing its members/patients within a bounded commercial relationship. **The benchmark's own design encodes this incommensurability** — BND (Boundaries) means something structurally different for a sovereign vs a firm, and the integration-premium term behaves differently across the two. This is the central methodological tension: **a single 0–100 scale invites a cross-type read ("UnitedHealth is as bad as Turkey") that the methodology cannot actually support.** Severity calibration is *within-type* defensible (UnitedHealth 10.2 < GEO Group 6.6; Turkey 10.3 < Russia 0.0) but *cross-type* comparisons should be presented as "Critical in its domain," not as a global severity equivalence.

**Recommendation:** Publish Critical-band placement with an explicit per-type interpretive frame, and avoid cross-type "league table" framing for the bottom band specifically.

---

## 5. Gaps and inconsistencies (consolidated)

1. **No corporate floor exists, and it's a formula artifact, not a ruling.** Corporations are exempted from 0.0 by the all-1-collapse mechanic, not by an explicit "corporations cannot perpetrate" judgment. GEO Group / CoreCivic (private prisons) and a weaponized-product corporation are arguably floor-eligible under the same logic applied to Ghost Robotics — but the corporate sub-taxonomy (group D) has no floor-qualifying ruling. **This is the most defensible criticism an external party could level.**
2. **City→country floor inheritance is informal.** Capitals of floor states are placed at floor (correct), but Bangui (CAR 4.7) and Port-au-Prince (Haiti 4.7) are at floor while their parent countries are not — an asymmetry that needs an explicit ATTRIBUTION-NON-STATE-ACTOR-AT-FLOOR-for-cities rule.
3. **Quantization clustering in F500.** 25+ F500 Critical entities sit at exactly 12.5/14.1/15.6/18.8 — uniform-anchor placeholders that may reflect *under-assessment* (placeholder baselines) rather than measured profiles. These should be flagged for first-baseline re-assessment.
4. **The cap/floor boundary (UAE) is thin.** ACTIVE-COMPLICITY-BY-PROXY held UAE at 18.4 explicitly because the ICJ case is unadjudicated and it is an external sponsor. If that case is adjudicated, the ruling implies UAE drops toward the floor — the trigger should be pre-registered.
5. **us-cities has zero Critical** despite the US itself now being Critical (17.5) — a within-system inconsistency (US cities are scored on a domestic-service basis insulated from the federal-conduct downgrade that pushed the country into Critical).

---

## 6. Special-Briefing candidates (4–6 thematic deep-dives)

Each: theme · entity scope · research-criteria modification implied · why it matters.

**SB-1 — "The Floor: Who and Why."**
*Scope:* all 23 floor entities + the four floor families.
*Criteria change:* formalize the floor as an explicit **named ruling set** in `benchmark-research.md` (currently only emergent in proposals), with the "no remediation surface" principle stated as the floor test.
*Why:* the floor is the benchmark's strongest, most citable claim; it is currently undocumented in the methodology file and exists only in change-proposal lore. Codifying it converts lore into defensible methodology.

**SB-2 — "Corporate Accountability Has No Floor — Should It?"**
*Scope:* F500 Critical band (52), anchored on GEO Group, CoreCivic, Meta, UnitedHealth; contrast with floor-eligible AI/robotics products.
*Criteria change:* introduce a **CORPORATE-ACTIVE-PERPETRATION-FLOOR** ruling symmetric to the state one, with a remediation-surface test; decide explicitly whether private-prison operators and weaponized-product firms qualify.
*Why:* directly answers the most likely external critique and the §2(c)/§5(1) gap. High editorial value, high risk if left unaddressed.

**SB-3 — "Democratic Backsliding into Critical."**
*Scope:* Turkey (10.3, judicial+physical opposition seizure), India (15.6, refoulement), United States (17.5, adjudicated-unlawful conduct), China (19.5), + the Dismantler cohort (Slovakia, Croatia, Italy, Bulgaria) hovering above the line.
*Criteria change:* consolidate JUDICIAL-REMOVAL / PHYSICAL-SEIZURE / CONSTITUTIONAL-AMENDMENT-AS-EXECUTIVE-REMOVAL / ADJUDICATED-UNLAWFUL-CONDUCT into a single **DEMOCRATIC-BACKSLIDING** rubric with staged triggers.
*Why:* this is the live, fastest-moving Critical-entry pattern of the 2026 cycles (multiple band crossings in May–June) and the most newsworthy.

**SB-4 — "The Cross-Type Comparability Problem."**
*Scope:* the 10.2/10.3 UnitedHealth–Turkey pair + the whole Critical band across types.
*Criteria change:* add a per-type interpretive frame to Critical-band publication; suppress cross-type bottom-band league-table framing.
*Why:* protects institutional credibility against the "you're saying a health insurer equals an authoritarian state" attack; turns a vulnerability into a methodological feature.

**SB-5 — "Cap, Don't Floor: The Complicity Boundary."**
*Scope:* UAE (proxy complicity, 18.4) vs Russia/Israel (in-territory, 0.0); the adjudicated-vs-filed and in-territory-vs-external distinctions.
*Criteria change:* pre-register the **adjudication trigger** that would move a capped-complicity entity toward the floor (e.g., ICJ ruling on the RSF case).
*Why:* the cap/floor line is the benchmark's most contestable single judgment; pre-registering the trigger demonstrates the scoring is rule-bound, not ad hoc.

**SB-6 — "Weaponized Products and the Robotics/AI Floor."**
*Scope:* Ghost Robotics (0.0), Palantir AI, xAI/Grok, Character AI; MILITARY-AI-BY-CONTRACT-GOVERNANCE + NUCLEAR-THREAT-RHETORIC rulings.
*Criteria change:* formalize a **PRODUCT-IS-THE-HARM** floor test for labs (core product is unremediable harm) distinct from the corporate remediation-surface test.
*Why:* explains why three of five Critical AI labs are at the floor while no corporation is, and pre-empts the "why is a chatbot company scored like North Korea's capital" question.

---

## Appendix — method notes
- Floor = composite ≤ 0.05; all 23 confirmed at raw dims `[1/1/1/1/1/1/1/1]`.
- Composite formula (canonical): `baseComposite + integrationPremium`; `integrationPremium = 0` if any dimension = 0; uniform all-1 profile → 0.0. This is the mechanical reason the floor is a discrete state, not a continuum.
- F500 Critical clustering at 12.5/14.1/15.6/18.8 corresponds to uniform low-anchor profiles (1.5/1.65/1.75/1.95 means) — placeholder/first-baseline signature.
- Ruling counts are occurrence counts across APPLIED+PENDING+proposals, not distinct-entity counts.
