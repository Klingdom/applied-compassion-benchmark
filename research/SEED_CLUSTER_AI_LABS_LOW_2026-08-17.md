# Seed Cluster De-Seeding — ai-labs 35.9 and 32.8

**Date:** 2026-08-17
**Entities:** 7
**Scoring convention:** absence-of-disclosure = **2** (the majority convention; see §6)

> **Provenance note.** The assessment run that produced these seven reports and sidecars
> terminated on a transient server error (API 529) after all seven assessments, all seven
> sidecars and six of seven proposals were written, but before this synthesis was authored.
> Every assessment, sidecar and proposal below was written by that run and has been
> independently verified afterwards: all seven sidecars carry 40 on-grid integer
> subdimensions, and all seven composites reproduce exactly through
> `computeCompositeFromDimensions`. **No score in this document was re-derived, adjusted or
> invented during synthesis.** The statistics in §2 are computed from those verified values.

---

## 1. Before / after

**Cluster A — published 35.9 "Developing", ranks 31–34**
seed vector `{AWR:2.5, EMP:2.5, ACT:2.5, EQU:2, BND:2.5, ACC:2.5, SYS:2.5, INT:2.5}`

| Lab | Published | Assessed | Delta | Band |
|---|---:|---:|---:|---|
| **Waymo** | 35.9 | **42.5** | **+6.6** | Developing → **Functional** |
| Axon AI | 35.9 | 30.6 | −5.3 | Developing sustained |
| Runway | 35.9 | 27.5 | −8.4 | Developing sustained |
| Scale AI | 35.9 | 26.9 | −9.0 | Developing sustained |

**Cluster B — published 32.8 "Developing", ranks 35–37**
seed vector `{AWR:2.5, EMP:2.5, ACT:2.5, EQU:2, BND:2.5, ACC:2, SYS:2.5, INT:2}`

| Lab | Published | Assessed | Delta | Band |
|---|---:|---:|---:|---|
| **ElevenLabs** | 32.8 | **34.4** | **+1.6** | Developing sustained |
| Stability AI | 32.8 | 26.2 | −6.6 | Developing sustained |
| Pika Labs | 32.8 | 25.0 | −7.8 | Developing sustained |

**Band distribution:** 7 Developing → 1 Functional, 6 Developing. One band crossing (Waymo,
upward). Cluster A mean signed −4.02; Cluster B mean signed −4.27 — effectively identical.

---

## 2. Signed vs absolute — the low seed behaves like the low seed

| Study | Seed | Mean signed | Mean abs | Std dev | Direction |
|---|---|---:|---:|---:|---|
| countries | 20.3 | −1.18 | 7.08 | 7.61 | 7 down, **5 up** |
| **ai-labs (this study)** | **35.9 / 32.8** | **−4.13** | **6.47** | **5.49** | 5 down, **2 up** |
| ai-labs | 60.9 / 48.4 | −22.73 | 22.73 | 3.71 | 15/15 down |
| robotics | 60.9 | −30.04 | 30.04 | 7.56 | 10/10 down |
| robotics | 83.0 / 81.4 | −46.37 | 46.37 | 7.12 | 10/10 down |

**Signed and absolute diverge here (−4.13 vs 6.47), as they did at 20.3 (−1.18 vs 7.08).**
In all three high-seed studies they coincided to two decimals, the signature of a seed that
is not merely unmeasured but *systematically generous*.

This is the second independent confirmation of the emerging rule:

> **Seed error scales with seed height.** A low seed is *uninformative* — roughly right on
> average, wrong by six to seven points for the typical entity, and capable of understating
> as well as overstating. A high seed is *biased* — wrong in one direction for every entity,
> by an amount that grows with the seed value.

The practical consequence for prioritisation: **low-seed clusters are not urgent on
accuracy grounds and should be prioritised only where they sit near a band boundary.**
High-seed clusters misstate the band label for everyone in them.

---

## 3. Waymo — the upward mover

Waymo is the first entity in the AI/robotics de-seeding programme to move **up**, and it
crossed a band doing so (35.9 → 42.5, Developing → Functional). Its band-change evidence
test passed.

It is also the entity in this study with the **fewest** absence-of-disclosure scores (9
mentions, against 36 for Pika Labs). That is the whole explanation. Waymo publishes
peer-reviewed safety-performance research, operates under NHTSA investigation with a public
record, and has published crash and driverless-mile data that a third party can check.

This reproduces, on a fourth dataset, the finding both robotics studies and the ai-labs
high-seed study reached independently:

> **What predicts a higher score is whether an organisation publishes verifiable evidence
> about its own effects — not its sector, its size, or its stated mission.**

---

## 4. Conduct evidence vs absence of disclosure

The seven split cleanly by evidence basis, and the split explains the ordering better than
the cluster assignment does:

| Basis | Entities | Outcome |
|---|---|---|
| Published self-evidence | Waymo (9 absence mentions) | Only upward band crossing |
| Documented conduct, both directions | Axon AI (12), Scale AI (16) | Moderate declines, −5.3 and −9.0 |
| Litigation / restructuring, thin operational disclosure | Stability AI (23), Runway (18) | −6.6, −8.4 |
| Near-total absence | ElevenLabs (14), Pika Labs (36) | ElevenLabs +1.6, Pika −7.8 |

Scale AI's decline rests on documented conduct, not silence — data-labelling labour
conditions across multiple jurisdictions are sourceable in a way most of this cohort's
practices are not. Pika Labs' decline rests almost entirely on absence: 36 subdimension
notes record that nothing is published. **These are different findings and the proposals
describe them differently.** Neither is a claim of misconduct where none was found.

ElevenLabs is the clearest illustration of an uninformative seed: assessed at 34.4 against a
published 32.8, a delta of **+1.6** with no band change. It is the only entity of the seven
with no proposal filed — correctly, since it meets neither the 5.0-point magnitude trigger
nor the band-crossing trigger.

---

## 5. Corporate-status findings

Nine entity-record-currency defects are already open across the programme. This study adds
one confirmed item and no defunct entities:

- **Stability AI — major restructuring, but the company operates.** Founder Emad Mostaque
  departed March 2024; Prem Akkaraju became chief executive June 2024 with an $80m
  recapitalisation, following losses above $30m in a quarter on under $5m of revenue. The
  record is current enough to score; the financial position is recorded in the assessment.

All seven were verified as operating entities under their listed names. No slug mismatches
were found in this cohort.

---

## 6. Scoring convention applied

This study scored **absence of disclosure as 2**, consistent with the robotics 60.9,
robotics Exemplary and ai-labs high-seed studies.

**This conflicts with applied data.** Cerebras Systems — already applied to the published
index at 38.8 — was scored under a more lenient convention that assigned **3** to the same
condition. Two conventions are therefore live in the ai-labs index simultaneously, and
**Cerebras is not a safe peer anchor for any entity in this study or the 15 assessed
alongside it.** Resolving this requires re-assessing Cerebras under the 2-convention, not
adjusting the entities assessed under it.

---

## 7. Out of scope

**Character AI, Palantir AI and xAI/Grok** (all composite 0.0 on a flat 1.0 vector) were
deliberately excluded. A flat all-ones vector is indistinguishable, by cluster detection
alone, from a deliberate floor designation — and these three have documented harm records
consistent with intentional flooring. Re-scoring them as a de-seeding exercise risks
*raising* entities that were floored on purpose. **Resolve by provenance inspection of why
each was set to 0.0, not by re-assessment.** The same question is open for 12 countries at
composite 0.0.

---

## 8. Proposals filed

Six of seven, all `flag-for-review` / `pending`, none applied:

Waymo (+6.6, band crossing, evidence test passed) · Scale AI (−9.0) · Runway (−8.4) ·
Pika Labs (−7.8) · Stability AI (−6.6) · Axon AI (−5.3)

ElevenLabs: no proposal, correctly — below both filing triggers.

---

## 9. Recommended next

1. **Resolve the absence-convention conflict** before further ai-labs work; re-assess
   Cerebras under the 2-convention.
2. **Provenance inspection of the 0.0 entities** — 3 ai-labs and 12 countries — to
   distinguish deliberate floors from seeds.
3. **Deprioritise remaining low-seed clusters on accuracy grounds**, except where they sit
   within roughly seven points of a band boundary. The evidence now shows low seeds are
   uninformative rather than biased, so the expected band-label correction rate is low.
4. **Prioritise remaining high-seed clusters**, where every member's band label is likely
   wrong in the same direction.
