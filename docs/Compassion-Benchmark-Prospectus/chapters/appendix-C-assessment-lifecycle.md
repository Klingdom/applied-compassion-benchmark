# Appendix C: Assessment Lifecycle

A published score is the end of a defined process, not a judgment call. This appendix sets out that process from start to finish: how evidence becomes a score, how a score becomes public, and where a human decides. It also distinguishes the two pathways that produce scores, works the v1.2 math once on an illustrative entity, and states the gates that hold the top bands shut until the evidence earns them.

Two pathways exist, and they must not be confused.

- **The automated nightly pipeline** produces and maintains the 1,256 public scores at scale. It is built and operating.
- **The 7-session Human Assessment Battery** is the certified, human-administered pathway. It is the aspirational standard that underpins a future paid certification. It is not how the 1,256 public scores are produced day to day.

---

## 1. The automated nightly pipeline (how the public scores are made)

The pipeline runs Monday through Saturday, roughly overnight, in four stages. The same eight-dimension, forty-subdimension framework and the same five-tier evidence hierarchy govern it. The fourth stage is a human gate.

**Stage 1: Scan.** An automated scanner sweeps all of the roughly 1,256 entities for material evidence inside a strict 14-day window, working within a search budget of around 250 queries. It writes a per-entity provenance record for every entity and outputs a prioritized list, approximately the top 15 entities to assess plus around 5 rotation backfill. Runtime is about 30 minutes at roughly two dollars a night.

**Stage 2: Assess.** An assessor runs full benchmark assessments on the 15 to 20 priority entities using the official methodology. It emits an assessment report with evidence across all 40 subdimensions, recorded both as raw 1 to 5 anchors and as scaled 0 to 100 values. It emits a change proposal only when the composite would move by 5 points or more, and only after the proposal passes anti-false-positive screening (baseline-provenance check, directionality match, rationale-versus-history consistency) and math-hygiene validation against the canonical composite formula. Every proposal is recorded with status pending. Nothing is applied automatically. Runtime is about 2.25 hours at roughly twenty-five to sixty dollars a night.

**Stage 3: Digest.** A digest stage synthesizes the night's findings into a public daily-briefing record (top signals, boundary watch, recent assessments, emerging risks, sector alerts, forward triggers) and updates the internal pending-changes log. Runtime is about five minutes at roughly fifty cents a night.

**Stage 4: Human-gated score update.** This stage is triggered by a human and never runs automatically. It is the approval gate. It applies founder-approved proposals to the published index files under a baseline-drift guard: if the baseline has drifted by more than 2.0 the update is refused and placed on a stale-baseline hold, and a direction-inversion check runs before anything is written. It then recalculates rankings and logs the change to the applied-changes record.

Total nightly cost is roughly $27.50 to $62.50, or about $700 to $1,600 a month in research compute. The efficiency case is the cost per entity: continuous monitoring of 1,256 entities on a near-solo budget.

A structural firewall sits underneath all four stages. The assessment plane reads the world and writes scores but has no access to subscriber, payment, or commercial data. The commercial plane reads only published scores and writes nothing back to assessment artifacts. The separation is enforced by missing credentials and file-system permissions, not by policy alone.

---

## 2. The certified Human Assessment Battery (the aspirational pathway)

The Human Assessment Battery is the human-administered field method: structured interviews, document review, observation, and community testimony, conducted by credentialed assessors. It is the formal standard described on the methodology page and underpins paid Certified Assessments. It is not used to maintain the public indexes.

Its structure is a 7-session protocol:

1. Session 1A: leadership interview.
2. Session 1B: HR and ethics interview.
3. Session 2A: frontline staff selected by the entity.
4. Session 2B: frontline staff selected independently.
5. Session 3A: affected community members recruited independently.
6. Session 3B: solo document review.
7. Session 4: lead-assessor synthesis.

[VERIFY] `source_notes.md` describes the battery both as a 7-session protocol and as roughly 4 to 6 hours per entity across 2 to 3 sessions. The session-count and time estimate are not fully reconciled in the source material; confirm against the methodology document before publishing a specific duration.

---

## 3. Maturity gates and review flags

Several gates hold scores honest. They apply in both pathways wherever the evidence supports them.

- **Active harm.** Any subdimension scored 0 requires written documentation and a lead-assessor co-sign.
- **Rater discrepancy.** An inter-rater reliability gap greater than 1.5 on any subdimension triggers review.
- **Unsupported high scores.** A 4 or 5 recorded without pressure-test evidence is flagged provisional.
- **Leadership-community gap.** A significant divergence between the leadership narrative and community testimony must be resolved, with the community account as the primary reference point.
- **Missing documents.** Refusal to provide requested documentation is itself a score-relevant event.
- **Open discussion flags.** Any unresolved discussion note blocks finalization.

---

## 4. The pressure-test principle

Every dimension is assessed under adversarial conditions, not favorable ones. For each subdimension, assessors look for at least one documented case where compassionate behavior was costly, legally risky, or institutionally inconvenient. If no such case exists, the subdimension is capped at the Developing anchor (level 3), even when the entity looks strong under easy conditions. Looking good when it is easy is not evidence of institutional character, so it cannot earn a top score. This is the central maturity gate, and it is the reason a high composite means something.

---

## 5. The v1.2 scoring math, worked once

All numbers in this worked example are illustrative. They describe a fictional frontier AI lab built to demonstrate the arithmetic, not a published score.

**Step 1: Eight dimension scores (0 to 5 each).** Suppose assessment produces these dimension means:

| AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|
| 3.5 | 2.5 | 3.5 | 2.5 | 3.0 | 2.5 | 3.0 | 2.5 |

**Step 2: Base composite.** Take the mean of the eight dimension scores, then rescale from the 1 to 5 range onto 0 to 100.

- Mean = (3.5 + 2.5 + 3.5 + 2.5 + 3.0 + 2.5 + 3.0 + 2.5) / 8 = 23.0 / 8 = 2.875.
- Base = ((2.875 − 1) / 4) × 100 = (1.875 / 4) × 100 = 46.9.

**Step 3: Integration premium (up to +10).** The premium is `10 × consistency factor × balance factor`.

- Consistency factor: the standard deviation across the eight dimension scores is about 0.41. Because it is at or below 1.5, the consistency factor is 1.0.
- Balance factor: subtract 0.2 for every dimension scoring below 4.0, with a floor of 0. Here all eight dimensions are below 4.0, so the factor is max(0, 1 − 8 × 0.2) = max(0, −0.6) = 0.
- Premium = 10 × 1.0 × 0 = 0.

**Step 4: Final composite and band.** Final = 46.9 + 0 = 46.9, which lands in the Functional band (40 to 60).

This entity earns no premium because not one dimension reaches the exemplary threshold of 4.0. That is the common case, and it is the point: the premium rewards even, sustained strength, and it is genuinely hard to earn. Any single dimension at exactly 0 (active harm) sets the premium to 0 regardless of the other seven.

**How the premium is actually earned (illustrative contrast).** Consider two entities with the same eight scores reordered into different shapes:

| Profile | Dimension scores | Base | Premium | Final | Band |
|---|---|---|---|---|---|
| Balanced | all eight at 4.0 | 75.0 | +10.0 | 85.0 | Exemplary |
| Spiky | four at 5.0, four at 2.0 | 62.5 | +2.0 | 64.5 | Established |

The balanced entity, strong and even, out-earns the spiky entity that is brilliant on four dimensions and weak on four, even though the spiky entity has four perfect scores. The standard rewards consistency. Every composite here is reconstructable from its eight dimension scores by one published formula, which is the honesty proof: a successor could redo the math and reach the same number.

---

## 6. Floor designation and reversibility

A composite of 0.0 can arise two ways: as the formula output when all eight dimensions sit at the floor anchor, or as a floor designation, a deliberate decision taken through the human gate to set all dimensions to the floor and attach a public disclosure explaining why.

A floor designation requires all four of the following, documented across at least three independent assessment cycles: multi-source Tier 1 or Tier 2 corroboration; a systemic rather than episodic pattern; harm active within the recency window; and no countervailing recognition or response above the floor anchor at any subdimension. It is reversible through an exit protocol: evidence-of-care behavior at the dimension level, sustained across at least two consecutive cycles, from sources outside the entity's control. Performative statements do not register.

For an entity already at or near the bottom of Critical, new adverse evidence has no scorable room to move the composite. It is logged as an evidence-tier upgrade rather than a score change. The documented case is UnitedHealth Group at 10.2 Critical, where a Department of Justice probe expansion was recorded as a tier upgrade with no composite change.

Source of truth: `source_notes.md` §4 (lifecycle, pressure test, maturity gates, floor designation) and §5 (pipeline stages, costs, two-plane architecture); scoring math verified against `site/src/lib/scoring.ts`.
