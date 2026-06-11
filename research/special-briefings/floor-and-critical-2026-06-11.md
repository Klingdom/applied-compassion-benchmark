# Special Briefing — The Floor and the Critical Band

**How the Benchmark Judges the Worst, Across Entity Types**

- **Edition:** Foundational (one-off; thereafter quarterly)
- **Date:** 2026-06-11
- **Author:** Special-Briefing agent (interpretive synthesis over the canonical record; read-only of index JSONs and the ruling corpus)
- **Scope:** All 7 indexes, 1,156 entities. The 23 entities at the 0.0 floor and the 176 entities in the Critical band (composite ≤ 20).
- **Method note:** This is a structural + longitudinal + cross-type-comparability analysis of the *existing* record. It interprets published scores; it does not re-score. Where it surfaces a scoring gap, that gap is filed as a methodology question for human review, not applied.

---

## publicSummary

> **Title:** The Floor and the Critical Band — How the Benchmark Judges the Worst
>
> **Dek:** A single 0–100 scale ranks states, corporations, AI and robotics labs, and cities together. At the bottom, that shared scale meets four entity types that fail in structurally different ways — and reach the bottom by different mechanics. This briefing examines the 176 entities in the Critical band and the 23 at the absolute floor, and asks what the record actually shows about how the worst are judged.
>
> **The cohort:**
> - 1,156 entities assessed across 7 indexes.
> - **176 are Critical** (composite ≤ 20) — 15.2% of the field.
> - **23 are at the 0.0 floor** — every one carrying an identical profile: all eight dimensions at the minimum anchor.
> - Per type (Critical / floor): countries 45 / 12 · global-cities 68 / 7 · Fortune-500 52 / **0** · ai-labs 5 / 3 · robotics-labs 2 / 1 · us-states 4 / 0 · us-cities 0 / 0.
>
> **Key findings (observer voice):**
> 1. **The floor is not a low score — it is a discrete state.** All 23 floor entities share the exact same profile: every dimension collapsed to the minimum anchor simultaneously. The benchmark reserves 0.0 for conduct that leaves no remediation surface to credit — active in-territory perpetration, conflict-driven famine, formally recognized structural atrocity, and products whose core function is the harm itself.
> 2. **The four entity types reach the bottom by different mechanics.** States fall to the floor through attested perpetration; corporations cluster *above* a floor they almost never touch; AI and robotics labs reach the floor only when the product itself is the harm. The same word — "Critical" — rests on three different evidentiary bars.
> 3. **No corporation is at the floor, and 52 are Critical.** The largest single index has the *shallowest* Critical band and zero floor entities. The lowest-scored corporation, GEO Group (private prisons), sits at 6.6 — far above 0.0 — even as it operates a documented harm. Whether that exemption is a deliberate judgment or a side effect of the scoring mechanics is the sharpest open question this record raises.
> 4. **A 10.2 and a 10.3 can mean entirely different things.** UnitedHealth (10.2) and Turkey (10.3) sit within a tenth of a point of each other, but their failures are not comparable in kind: Turkey's collapse is in political boundaries and accountability across a whole state apparatus; UnitedHealth's is in accountability and equity within a bounded commercial relationship. The number is shared; the meaning is not.
> 5. **The fastest route into the Critical band right now is democratic backsliding.** Turkey (10.3), India (15.6), the United States (17.5), and China (19.5) entered or deepened in the Critical band on governance grounds — courts, opposition, franchise — not conflict or famine. This is the live, accelerating entry pattern of the 2026 cycles.
> 6. **The capital cities of failed states inherit the floor — but the rule is informal.** Seven global cities sit at 0.0; five are capitals of floor states. Two — Bangui and Port-au-Prince — are at the floor while their parent countries are not, an asymmetry that currently rests on case-by-case judgment rather than a stated rule.
> 7. **Severity is calibrated within a type, not across types.** Ranking the worst within countries, or within corporations, is defensible. Reading the bottom band as a single cross-type league table is not something the methodology can support — and this briefing recommends the benchmark say so explicitly.

---

## 1. Frame

The Compassion Benchmark applies one 0–100 scale to every entity it assesses: a sovereign state, a Fortune 500 corporation, an AI lab, a robotics lab, a city. At the top of the scale this is unremarkable — "more compassionate institutional conduct" reads coherently across types. At the **bottom** it becomes a genuine tension. A state fails its population through the apparatus of governance; a corporation fails stakeholders within a commercial boundary; a lab fails through a product or a contract. These are not the same kind of failure, yet they are scored on the same axis and sorted into the same two bottom categories: the **Critical band** (composite ≤ 20) and, beneath it, the **0.0 floor**.

This briefing takes the bottom of the scale as its subject. It asks three questions of the existing record:

1. **What is the floor, mechanically and substantively** — and is it coherent across the types that reach it?
2. **Why does the largest index (Fortune 500) have 52 Critical entities but zero at the floor** — is that a judgment or an artifact?
3. **Can a number near the bottom be read across types** — is UnitedHealth at 10.2 "as bad as" Turkey at 10.3?

The central thesis: **the floor is a defensible, principled state — but the single 0–100 scale invites a cross-type severity read at the bottom that the methodology cannot actually support, and one entire entity class (corporations) is exempted from the floor by a mechanic rather than by a stated rule.** Both are interpretive features worth making explicit; neither is a reason to re-score anything.

---

## 2. The cohort

Recomputed directly from `rankings[]` in each index (Critical = composite ≤ 20; floor = composite ≤ 0.05). The pre-supplied snapshot is **confirmed exactly — no drift.**

| Index | Total | Critical | Floor | Critical % | Avg composite of Critical band |
|-------|------:|---------:|------:|-----------:|-------------------------------:|
| countries | 193 | 45 | 12 | 23.3% | ~7.9 |
| fortune-500 | 448 | 52 | **0** | 11.6% | **~14.5 (shallowest)** |
| global-cities | 250 | 68 | 7 | 27.2% | ~12.6 |
| ai-labs | 50 | 5 | 3 | 10.0% | ~5.9 (near-floor) |
| robotics-labs | 50 | 2 | 1 | 4.0% | ~4.7 (deepest) |
| us-states | 21 | 4 | 0 | 19.0% | ~12.9 |
| us-cities | 144 | 0 | 0 | 0.0% | — |
| **Total** | **1,156** | **176** | **23** | **15.2%** | — |

**The single most important structural fact:** every one of the 23 floor entities carries an identical dimension vector — all eight dimensions at the minimum anchor (`[1/1/1/1/1/1/1/1]`). The floor is not "a very low score." It is the simultaneous collapse of the entire profile to the anchor floor, which the canonical composite formula renders as exactly 0.0 (see §4). The floor is therefore a **discrete state**, not a point on a continuum — and it is reserved, by ruling, for a specific class of conduct.

### The 23 at the floor

**Countries (12):** Afghanistan, Belarus, Eritrea, Israel, Myanmar, North Korea, Russia, South Sudan, Sudan, Syria, Turkmenistan, Yemen.

**Global cities (7):** Pyongyang, Naypyidaw, Kabul, Asmara, Ashgabat (capitals of floor states) · Bangui, Port-au-Prince (parent countries *not* at floor — see §6).

**AI labs (3):** xAI/Grok, Character AI, Palantir AI.

**Robotics labs (1):** Ghost Robotics.

These cluster into four defensible families, each defined by the same underlying test — **no remediation surface to credit**:

| Family | Entities | The floor test it satisfies |
|--------|----------|------------------------------|
| (a) Active in-territory state perpetration | Russia, Myanmar, North Korea, Eritrea, Turkmenistan, Belarus, Syria | Attested lethal/coercive conduct by the state against its own or occupied population; no accountability surface |
| (b) Conflict-driven famine | Sudan, South Sudan, Yemen | IPC-scale famine where the state obstructs (not merely lacks capacity for) response |
| (c) Formally recognized structural atrocity | Afghanistan (gender apartheid), Israel (authorized-resumption-with-systematic-denial) | A documented, adjudicated or formally recognized structural-harm regime |
| (d) Product-is-the-harm (non-state) | xAI/Grok, Character AI, Palantir AI, Ghost Robotics | The entity's core product *is* the unremediable harm; no remediation pathway exists |

The principle is consistent across all four: **the floor marks conduct for which there is no remediation surface to credit — not merely "very bad outcomes."** A bad outcome with a contested remediation channel (litigation, regulatory oversight, reversible policy) is scored *above* the floor by design.

---

## 3. Three failure modes — the same word, three evidentiary bars

The Critical band looks different in each index because the three dominant entity types *fail differently* and are *judged on different evidence*:

- **States fail by active perpetration or codified impunity.** They are scored on attested conduct — lethal force, signed impunity laws, judicial findings — and can reach an absolute 0.0 floor. The scoring question is **floor entry vs. priced continuation** (does new evidence cross the threshold, or merely re-confirm what is already priced?).
- **Corporations fail by accumulated, unadjudicated enforcement.** They are explicitly held **not** scorable until a merits adjudication or settlement (the FILED-BUT-UNADJUDICATED rulings). The scoring question is **enforcement density vs. adjudication.** This produces the persistent corporate cluster jammed *just above* the 20.0 Critical line (Oracle 20.6, Cigna/3M 20.3) and the absence of any corporate floor.
- **AI / robotics labs fail by governance posture and contracting.** They are scored net-neutral on announcements, pending regulatory enactment or court rulings — *except* where the product itself is the harm, which is the only route by which a lab reaches the floor. The scoring question is **posture vs. operative conduct.**

The per-type Critical profile signatures bear this out:

| Type (n Critical) | Avg composite | Weakest dimensions | Profile signature |
|-------------------|--------------:|--------------------|-------------------|
| robotics-labs (2) | ~4.7 | EQU, INT | Weaponization / integrity collapse |
| ai-labs (5) | ~5.9 | BND, EQU, ACC | Near-floor; product-harm + boundary failure |
| countries (45) | ~7.9 | EQU, ACC, INT | Repression: no equity, no accountability, low integrity |
| global-cities (68) | ~12.6 | BND, ACC, INT | Failed-state-capital inheritance + service collapse |
| us-states (4) | ~12.9 | EQU, ACC, INT | Country shape, shallower (carceral/equity) |
| fortune-500 (52) | **~14.5** | AWR, EQU, ACC | **Shallowest Critical band; no dimension below ~1.5** |

The countries Critical band is **conduct-clustered** (repression, conflict). The Fortune-500 Critical band is **sector-clustered** — fossil fuel and coal (Exxon, Chevron, Halliburton, Marathon, ~25 names), weapons/defense (Sturm Ruger, Vista Outdoor, TransDigm, Boeing), private prisons (GEO Group, CoreCivic), platform harm (Meta), and healthcare-denial (UnitedHealth). The same band, in two indexes, is organized by two entirely different logics.

---

## 4. The corporate-no-floor gap — judgment or artifact?

The Fortune 500 is the largest index (448 entities) and has the most Critical entities in absolute terms (52), yet **zero** at the floor. Three converging reasons, two structural and one substantive.

**(a) The all-anchor-collapse threshold is almost never reachable by a corporation.** The floor requires *every* dimension at the minimum anchor simultaneously. The lowest-scored corporation in the entire index — GEO Group (private prisons) at **6.6**, with a uniform `[1.5 × 8]` profile — still retains some detectable structure on every dimension. A going concern still detects customers (AWR), still has bounded scope (BND), still runs a governance system (SYS). It does not collapse all eight at once.

**(b) The composite formula structurally penalizes *total* collapse, not partial.** The canonical composite is `baseComposite + integrationPremium`, where `baseComposite = ((mean_anchor − 1) / 4) × 100` and the integration premium drops to 0 the instant any single dimension hits the absolute minimum. A uniform all-anchor-1 profile maps to baseComposite `((1−1)/4)×100 = 0.0` — the floor. A uniform all-1.5 profile maps to `((1.5−1)/4)×100 = 12.5`. This is exactly why the Fortune-500 Critical band piles up at the **quantized values 12.5, 14.1, 15.6, 18.8** — uniform or near-uniform low-anchor profiles. Verified histogram of the 52 F500 Critical composites:

| Composite | Count | Implied profile |
|----------:|------:|-----------------|
| 6.6 | 1 | GEO Group (`1.5×8`) |
| 7.0 | 1 | CoreCivic |
| 7.8 | 1 | Meta Platforms |
| 10.2 | 1 | UnitedHealth (mixed, ACC 1.125) |
| **12.5** | **16** | uniform ~`1.5` |
| 12.8 | 1 | — |
| **14.1** | **12** | uniform ~`1.65` |
| 15.6 | 4 | uniform ~`1.75` |
| 17.2 | 2 | — |
| **18.8** | **13** | uniform ~`1.95` |

The effective mathematical floor for a corporation that has *not* been ruled an active perpetrator is roughly 6–12, not 0. Critically, this is a **side effect of the formula**, not a deliberate judgment. UnitedHealth at 10.2 demonstrates corporations *can* drive single dimensions toward the floor (its ACC is 1.125, *below* GEO Group's uniform 1.5) — they simply never collapse all eight at once.

**(c) Substantively, the floor rulings are conduct categories corporations rarely fit.** The four floor families are in-territory perpetration, conflict famine, recognized structural atrocity, and weaponized/harmful product. Of the four product-floor entities, three are AI labs and one is a robotics lab — entities *defined by* an unremediable-harm product. A diversified corporation almost never matches: even GEO Group's harm has a (contested) remediation surface — contract terms, litigation, regulatory oversight — that the rulings credit above the floor.

**Is the exemption defensible?** The substantive reason (c) is: corporations are judged on a remediation-surface logic, and most genuinely have one. The structural reason (a/b) is the weak point — an entire entity class is held off the floor by a *formula mechanic* rather than by an explicit "corporations are judged differently, and here is why" ruling. The benchmark should make that distinction a stated judgment rather than let the math do it silently. **This is the most defensible criticism an external party could level, and it is filed as a methodology question (§7, Q1).**

Note the corporate Critical cluster is not only deep but also *tight against the line from above*: Oracle (20.6), Cigna and 3M (20.3) sit fractions of a point above the boundary under multiplying-but-unadjudicated sovereign actions, held out of Critical only by the FILED-BUT-UNADJUDICATED discipline. The corporate bottom is a pressure zone defined by adjudication timing, not by a floor.

---

## 5. Cross-type comparability — is UnitedHealth (10.2) "as bad as" Turkey (10.3)?

The two entities sit within a tenth of a point. Their dimension profiles (verified from the index JSONs) show why that proximity is an artifact of a shared scale, not a shared meaning:

| Entity | Comp | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|--------|-----:|----:|----:|----:|----:|----:|----:|----:|----:|
| Turkey (country) | 10.3 | 1.6 | 1.6 | 1.6 | 1.4 | **1.2** | **1.15** | 1.6 | **1.15** |
| UnitedHealth (F500) | 10.2 | 1.75 | 1.25 | 1.5 | 1.25 | 1.5 | **1.125** | 1.5 | 1.375 |

- **Turkey's** failure concentrates in **BND (1.2), ACC (1.15), INT (1.15)** — collapse of *political boundaries, accountability, and integrity* (opposition party leadership judicially removed, party HQ physically seized). This is **governance failure**, distributed across the apparatus of a state serving ~85 million people.
- **UnitedHealth's** failure concentrates in **ACC (1.125), EMP (1.25), EQU (1.25)** — collapse of *accountability, empathy, and equity in claims handling* (algorithmic claim-denial, DOJ probe). This is **stakeholder-harm failure**, bounded within a commercial relationship with members and patients.

The number is comparable; the *kind of suffering is not.* The benchmark's own design encodes this incommensurability — BND (Boundaries) means something structurally different for a sovereign than for a firm, and the integration-premium term behaves differently across the two. **Severity is calibrated within-type, not across-type.** Within countries, Turkey at 10.3 sits clearly above Russia at 0.0 and below the developing band — coherent. Within corporations, UnitedHealth at 10.2 sits below GEO Group at 6.6 and above the rest of the Critical cluster — coherent. The cross-type read ("a health insurer is as bad as an authoritarian state") is the one the methodology *cannot* support.

**Recommendation:** publish Critical-band placement with an explicit per-type interpretive frame, and avoid cross-type "league table" framing for the bottom band specifically. Filed as a methodology question (§7, Q2).

---

## 6. The democratic-backsliding entrants, and the outliers

**The live entry pattern.** The fastest-moving route *into* the Critical band in the 2026 cycles is not conflict or famine — it is documented, structural democratic backsliding among formerly-Developing democracies, scored on governance evidence (courts, opposition, press, franchise):

| Entity | Composite | Entry/deepening | Governing ruling family |
|--------|----------:|-----------------|-------------------------|
| Turkey | 10.3 | May 29 | JUDICIAL-REMOVAL-OF-OPPOSITION-PARTY-LEADERSHIP; PHYSICAL-SEIZURE-OF-OPPOSITION-PARTY-HEADQUARTERS |
| India | 15.6 | Jun 4 | ACTIVE-STATE-PERPETRATION-REWEIGHT; maritime-deportation-without-due-process |
| United States | 17.5 | Jun 9 | ADJUDICATED-UNLAWFUL-CONDUCT-IS-SCORABLE |
| China | 19.5 | May 18 | STATE-REPRESSION-IN-FLUX |
| Bolivia | 18.4 | Jun 9 | CODIFIED-IMPUNITY-ESCALATION |

The countries Critical count rose from roughly 39 to 45 across the window. The "Dismantler" cohort (Croatia, Slovakia, Bulgaria, Italy) hovers just above the line within Developing. The conspicuous *counter-trend* is Hungary — a sustained multi-cycle upgrade (37.5 → 50.2) — the natural control case for "what reversal looks like." This pattern is distinct from the floor families: these entities are *Critical, not floored*, because functioning courts still reverse some of the conduct, giving a remediation surface the rulings credit above 0.0 (India at 15.6, not 0.0, is the clearest illustration).

**Outliers worth naming:**

- **The city-inheritance asymmetry.** Five floor cities are capitals of floor states (coherent inheritance). But **Bangui** (parent Central African Republic, 4.7) and **Port-au-Prince** (parent Haiti, 4.7) are at the 0.0 floor while their parent countries are *not*. The placement is defensible on the facts (non-state-actor collapse concentrated in the capital), but it rests on case-by-case judgment, not a stated rule. Filed as a methodology question (§7, Q3).
- **us-cities has zero Critical** even though the United States itself is now Critical (17.5). US cities are scored on a domestic-service basis insulated from the federal-conduct downgrade — a within-system inconsistency worth flagging, though not necessarily an error.
- **The cap/floor boundary is thin.** The UAE is held at 18.4 (capped, Critical-but-not-floored) for external sponsorship of a documented atrocity, explicitly *because* it is an external sponsor (not in-territory perpetrator) and the ICJ case is unadjudicated. Russia and Israel, as in-territory perpetrators, are at 0.0. The distinction — in-territory vs. external, adjudicated vs. filed — is load-bearing and the UAE sits just on the safe side of it. The adjudication trigger that would move it toward the floor should be pre-registered.
- **The quantization clustering** (§4: 16 entities at 12.5, 12 at 14.1, 13 at 18.8) likely reflects placeholder first-baseline profiles rather than measured ones — a candidate for first-baseline re-assessment, not an interpretive finding about conduct.

---

## 7. Methodology flags (for human review — NOT auto-applied)

These are the unresolved questions the bottom-of-scale analysis exposes. They are appended to `research/PENDING_CHANGES.md` under "## Special-Briefing Methodology Questions" and flagged for human decision. None is applied here.

- **Q1 — Should there be a corporate floor?** Corporations are currently exempted from 0.0 by the all-anchor-collapse *mechanic*, not by an explicit judgment. Under the same "no remediation surface" logic that floors Ghost Robotics (weaponized product) and Palantir AI (military-contract product), are private-prison operators (GEO Group 6.6, CoreCivic 7.0) or a weaponized-product corporation floor-*eligible*? The corporate ruling sub-taxonomy has no active-perpetration analog. Either introduce a CORPORATE-ACTIVE-PERPETRATION-FLOOR ruling with an explicit remediation-surface test, or state explicitly why corporations are judged on a different bottom-of-scale logic — but do not leave the formula to make the call silently.
- **Q2 — Is one 0–100 scale right for cross-type bottom-band comparison?** Severity is within-type defensible but cross-type unsupported (UnitedHealth 10.2 vs Turkey 10.3 are the same number, different kinds of failure). Recommendation: add a per-type interpretive frame to Critical-band publication and suppress cross-type "league table" framing for the bottom band specifically. Decision needed on whether to publish a single global bottom ranking at all.
- **Q3 — Formalize the city→country floor-inheritance rule.** Bangui and Port-au-Prince are at the floor while their parent countries (both 4.7) are not. Adopt an explicit ATTRIBUTION-NON-STATE-ACTOR-AT-FLOOR-for-cities rule so the asymmetry is rule-bound rather than case-by-case.
- **Q4 — Pre-register the cap→floor adjudication trigger.** The complicity-by-proxy cap (UAE 18.4) implies a path to the floor if the relevant ICJ case is adjudicated. Pre-register that trigger so the boundary is demonstrably rule-bound, not ad hoc.
- **Q5 — Flag F500 quantization clusters for first-baseline re-assessment.** The 41 F500 Critical entities sitting at exactly 12.5 / 14.1 / 18.8 carry uniform-anchor profiles consistent with placeholder baselines rather than measured assessment. Flag for re-baselining; this is a data-quality question, not an interpretive one.

---

## 8. Forward view — what to watch

- **The corporate boundary cluster.** Oracle (20.6), Cigna (20.3), 3M (20.3) sit fractions above the Critical line under unadjudicated enforcement. A single merits adjudication (e.g., the multi-state AG health-insurer suit) could reprice several Fortune 500 entities into Critical at once — and would directly test Q1 (does a corporation that crosses into Critical ever face a floor question?).
- **The democratic-backsliding arc.** The Dismantler cohort (Croatia, Slovakia, Bulgaria, Italy) is the next-likely set of Critical entrants on governance grounds. Hungary's upgrade arc is the control case to watch for what reversal looks like.
- **The cap/floor line.** An ICJ ruling on the RSF/Sudan case is the single highest-value forward trigger; it tests whether the complicity-by-proxy cap holds or converts toward the floor (Q4).
- **Floor exits.** No floor entity has exited in this cycle. The record is explicit that floors exit only through *verified perpetration cessation*, never through evidence accumulation or the passage of time. A documented cessation signal at any of the 23 would be the most significant possible movement at the bottom of the scale.

---

## Sources

- **Canonical scores (ground truth):** `site/src/data/indexes/{countries,fortune-500,global-cities,ai-labs,robotics-labs,us-states,us-cities}.json` — all cohort counts, the 23-entity floor roster, the UnitedHealth/Turkey dimension vectors, and the F500 quantization histogram were recomputed directly from `rankings[]` and reconcile exactly with the pre-supplied snapshot (no drift).
- **Primary analysis sources:** `docs/PATTERN_ANALYSIS_FLOOR_CRITICAL_2026-06-11.md` (floor roster, per-type Critical characterization, ruling taxonomy, cross-type comparability); `docs/PATTERN_ANALYSIS_THEMES_2026-06-11.md` (three failure modes, democratic recession, cross-index meta-patterns).
- **Ruling corpus / provenance:** `research/APPLIED_CHANGES.md`, `research/PENDING_CHANGES.md` (rulings, boundary watch, the Oracle/UAE/US/Bolivia entries), `research/change-proposals/*2026-0[56]-*.json`.
- **Formula / methodology:** `.claude/agents/benchmark-research.md`, `.claude/agents/overnight-assessor.md` (floor-formula logic), `site/src/data/dimensions.ts` (8 dimensions), canonical composite `baseComposite + integrationPremium`.
- **Fresh web evidence:** none required for this edition. This is a structural/longitudinal analysis of the existing record; the marquee entity statuses (Turkey, UnitedHealth, UAE, Oracle, US, Bolivia) are grounded in the in-window ruling corpus and reconcile with canonical scores. Web-search budget (≤10) was not drawn down.
