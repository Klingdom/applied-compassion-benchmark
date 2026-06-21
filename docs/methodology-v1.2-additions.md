# Methodology v1.2 — Ready-to-Integrate Additions

**Status:** Content only. Finished reader-facing prose for the frontend-engineer to convert to JSX in a later wave.
**Scope:** Do NOT touch `page.tsx`, `scoring.ts`, `scoring.mjs`, or any scoring/data file when integrating — this file supplies copy, not code.
**Grounding:** Every claim below is checked against `site/src/lib/scoring.ts`, `site/scripts/lib/scoring.mjs` (`METHODOLOGY_VERSION = "v1.2"`), `site/src/data/dimensions.ts`, the existing `site/src/app/methodology/page.tsx` changelog, and the 2026-06-20 research digest + the Harvard and UnitedHealth assessments of the same date.

A note on honesty conventions used throughout:
- "**Formula output**" means the value is produced deterministically by `compositeCore` in `scoring.ts`.
- "**Editorial / data-level decision**" means the value is set by an assessor and recorded in the entity data, then approved through the human gate — it is not a formula output.
- "**Open question**" marks a genuinely unsettled point. Where the research itself raises a question without an answer, it is labeled as such rather than resolved with invented detail.

---

## 1. CHANGELOG v1.2 ENTRY

**Suggested placement:** Inside the existing `#changelog` section in `page.tsx`, as a new entry **above** the current "Version 1.1 — 2026-04-20" block. Match the existing two-column grid format (`grid-cols-[160px_1fr]`, bold version label, `list-disc` bullets).
**Suggested anchor id:** none required (it lives inside the existing `#changelog` section). If a deep link is wanted, add `id="changelog-v1-2"` to the new block's wrapper `div`.

**Real delta from v1.1 → v1.2 (verified against the code):** v1.1's changelog describes capping the integration premium at +10, enforcing composite determinism, and correcting floor-clamping display artifacts. The v1.2 change is the *internal refinement of how that +10 premium is earned*. In the current code, the premium is no longer a flat amount gated only by the harm flag — it is `10 × consistencyMult × weaknessFactor`, with the harm flag (any dimension at exactly 0) still zeroing it out entirely. Both factors are computed deterministically in `compositeCore` and mirrored in `scoring.mjs`.

> **Version 1.2 — 2026-06**
>
> - **Integration premium refined from a flat bonus to a consistency-and-balance product.** The premium (still capped at +10) is now computed as `10 × a consistency factor × a balance factor`. The consistency factor steps down as dimension scores spread apart (standard deviation across the eight dimensions: ≤1.5 → 1.0; ≤3.0 → 0.75; ≤5.0 → 0.4; above → 0.1). The balance factor steps down by 0.2 for each dimension scoring below 4.0 (the exemplary threshold), to a floor of 0. Effect: a balanced 70/70-style profile can now out-earn a spiky 90/40 profile. This rewards even, sustained performance across all eight dimensions rather than a few standout scores.
> - **Harm flag preserved and unchanged.** Any single dimension resolving at exactly 0 sets the integration premium to 0 — active documented harm cancels the consistency reward outright.
> - **One canonical formula, two enforced mirrors.** The composite math now lives in a single shared core (`compositeCore`) consumed by both the site runtime (subdimension entry point) and the pipeline scripts (dimension entry point), with a determinism test suite acting as the drift gate. This makes every published composite reconstructible from its eight dimension scores.

*Frontend note:* the canonical one-line explainers for the premium already exist in `dimensions.ts` as `INTEGRATION_PREMIUM.short` and `INTEGRATION_PREMIUM.detail` — reuse those verbatim rather than re-writing the premium sentence.

---

## 2. ATTRIBUTION & SUBJECT RULE

**Suggested placement:** New subsection. Best home is immediately after `#scoring-model` ("How scores are built") or as its own section directly before `#evidence-hierarchy`. It explains *who* is being scored and *which harms count*, which readers need before the evidence and floor sections.
**Suggested anchor id:** `attribution-rule` (register in the TOC array as `{ id: "attribution-rule", label: "Who is scored & whose harm counts" }`).

A compassion score measures how an entity treats the people it is responsible for. Two questions have to be settled before any harm event can be scored: **who is the subject**, and **whose conduct does a given harm belong to**. The rules below are testable and are applied uniformly across indexes.

### 2a. Who the scored subject is, by index type

The subject is the population the entity is responsible for recognizing, responding to, and not depleting. Scoring asks how the entity treats *that* population.

| Index | Scored subject (the population the entity is responsible for) |
|-------|--------------------------------------------------------------|
| Countries | Residents and people under the state's effective control or authority |
| Cities (US & global) | Residents and people the city serves |
| Companies (Fortune 500) | Workers, customers, and the communities the company operates in |
| AI labs | Users and the broader society affected by the lab's systems |
| Robotics labs | Users and the broader society affected by the lab's systems |
| Universities | Students, workers (faculty and staff), and surrounding communities |

### 2b. The victim / perpetrator test

For any harm event in the evidence window, decide where the harm belongs before scoring it:

1. **Identify the actor who caused the harm.** Ask who *did* the harmful thing, not merely where the harm landed.
2. **If the entity being scored is the actor** — the harm reflects the entity's own conduct toward its subject population — the event is scored against the entity (subject to the evidence and adjudication standards in §3–§4).
3. **If an external actor is the cause and the scored entity is the one harmed (the victim)** — the event is attributed to the perpetrator, not the entity, and is *not* scored as a compassion failure of the entity.
4. **Apply the rule symmetrically.** The reverse also holds: if an entity inflicts the same category of harm on its own people *by its own choice* (rather than having it imposed from outside), that conduct is scored against the entity.

In the 2026-06-20 cycle this rule was applied at index scale: the entire June 2026 federal campaign against US universities (DOJ funding suits, grant freezes, EEOC-administered settlements, admissions compliance reviews) was treated as external action inflicted *on* the universities and attributed to the federal government — so none of it lowered a university's score. The same convention attributes strikes on Ukraine to Russia, leaving Ukraine's own conduct profile unchanged.

### 2c. Worked example — the dual-role case (Harvard)

Harvard in June 2026 was simultaneously a victim of external action and an actor in its own right. The two roles are scored differently:

- **External action — NOT scored against Harvard.** The DOJ lawsuit to recoup grants and bar future federal access, and the funding freeze, are harm *inflicted on* Harvard by the federal government. A federal court had already ruled the funding cut unlawful; Harvard is the contesting/prevailing party, not the wrongdoer. Under the victim/perpetrator test the harm is attributed to the perpetrator (the federal government), so it does not register as a Harvard compassion failure.
- **Harvard's own conduct — scored.** The continued layoffs, salary freeze, hiring moratorium, and Broad Institute staff cuts fall on Harvard's own workers by Harvard's own decisions. These are genuine internal-consistency (I3) and self-sustainability (B1) signals and stay in the assessment. In this case they were consistent with — and did not push below — Harvard's already-conservative published Integrity (2.5) and Accountability (2.75) scores, so the composite held at 52.3. A countervailing positive signal was also noted: bearing significant cost rather than capitulating to a settlement demand is a modest consistency-under-pressure (I1) positive.

The takeaway: the same news cluster splits cleanly into "done to the entity" (not scored) and "done by the entity" (scored).

---

## 3. NEAR-FLOOR LIMITATION

**Suggested placement:** New subsection immediately before `#floor-designation`, since it describes the band of behavior just above the absolute floor and naturally hands off to floor designation.
**Suggested anchor id:** `near-floor-limitation` (TOC: `{ id: "near-floor-limitation", label: "Near-floor limitation" }`).

An entity that is already scored at or very close to the bottom of the Critical band has almost no scorable distance left to fall short of a formal floor designation. When that is the case, additional adverse evidence that has **not yet been adjudicated** (an ongoing probe, an investigatory finding, a single filed charge) is handled as an **evidence-tier upgrade recorded against the relevant dimensions — without moving the composite**.

This is an editorial/data-level practice, not a formula output. The formula does not "know" that an entity is near the floor; assessors recognize the condition and choose to log the strengthened evidence rather than manufacture a composite change there is no scorable room for. The change still passes through the same human-approval gate as any other assessment decision, and the dimensions remain reconstructible to the published composite (diff 0.0).

### Worked example — UnitedHealth Group (10.2, Critical)

On 2026-06-20, UnitedHealth Group's DOJ criminal probe expanded from Medicare Advantage billing to also cover Optum Rx and physician reimbursement, and a separate Senate (Grassley) investigation found the company had "aggressively" gamed Medicare Advantage risk scores. This is substantial, specific, and corroborating evidence. But:

- UHG was already at near-floor Critical (composite 10.2), with Accountability scaled at 3.1 and several dimensions near the dimensional floor — minimal scorable headroom remained.
- The new material was **pre-adjudication**: no charge, no settlement, no court ruling in the window. The probe is ongoing and UHG denies wrongdoing.

Outcome: the evidence **reinforced** the existing Critical score and **upgraded the evidence tier** behind Accountability, Integrity, and Systemic Thinking (toward Tier 4–5, federal/Senate sourcing), but produced **no composite delta and no band change**. The standing re-flag is explicit: revisit toward a stronger designation only on an adjudicated criminal charge, indictment, or settlement admitting misconduct.

### Open methodological question (under review for a future version)

The UHG case surfaces a question the research itself raises and does not answer: **at what point does the sheer density of pre-adjudication evidence — here, three simultaneous probe areas plus a Senate finding — justify a floor-designation move on its own, absent any formal charge?** The current rule is unambiguous: adjudication is the trigger, and pre-adjudication evidence is absorbed as a tier upgrade. Whether "scope of documented probe" should become a distinct pathway to designation is an **open methodological question under review for a future version**. No such pathway exists today, and none should be implied on the page.

---

## 4. HARM-FLAG / 0.0 FLOOR

**Suggested placement:** Inside or directly adjacent to the existing `#floor-designation` section, which already explains the mathematical floor and the exit protocol. This block sharpens the honest distinction between the *formula's* zero and an *editorial* floor designation.
**Suggested anchor id:** reuse `floor-designation`; if a sub-anchor is wanted, `harm-flag-floor`.

There are two distinct ways an entity ends up at composite 0.0, and the methodology should not blur them.

### How the formula reaches 0.0

Two separate mechanisms in `scoring.ts` bear on a zero composite:

1. **The base mathematical minimum.** The base composite is `((average of the eight dimension scores − 1) / 4) × 100`. When every dimension sits at the lowest behavioral anchor (1.0 on the 0–5 scale), the base composite is exactly 0. The final value is also clamped to the 0–100 range, so it cannot go negative.
2. **The harm flag.** Any single dimension resolving at *exactly* 0 sets the integration premium to 0 (`hasHarm` in the code). This does not by itself force the composite to 0 — it removes the up-to-+10 consistency bonus. In practice an entity with a true zero in even one dimension is already scoring at or near the floor across the board, so the combined effect is a composite at or extremely near 0.0.

So: a 0.0 composite is a legitimate **formula output** when the underlying dimension scores are at the floor. The formula does not invent zeros — it reflects the dimension scores it is given.

### When 0.0 is an editorial floor designation

Separately, **floor designation** is an editorial/data-level decision recorded in the entity data, not a number the formula reaches on its own. As the existing floor-designation section explains, residual sub-anchor variance (1.1, 1.2, 1.3) can keep an entity slightly above zero even when documented evidence shows no functional compassion behavior at any dimension. Floor designation resolves this by an assessor setting all dimensions to the floor anchor — making the formula then compute 0.0 — and attaching a public "call out why" disclosure to the entity page. The number that displays is still a formula output; what is editorial is the *decision to place the dimensions at the floor* and to attach the disclosure. This decision goes through the standard human-approval gate and is retained in the audit log.

### Real examples

- **Israel (0.0).** Held at the absolute harm-flag floor on 2026-06-20, with multi-source corroboration of an active, structural harm pattern (IDF operations across the majority of Gaza, UNRWA blocked from direct aid since March 2025, large displaced populations, documented West Bank fatalities). New evidence in the window is absorbed by the floor — there is no composite movement available.
- **Sudan (0.0).** Reinforced at the floor on 2026-06-20 (an RSF drone strike killing 13 civilians in al-Obeid on June 19; a 29-nation UNHRC warning of an imminent assault on roughly 500,000 residents). As the digest puts it, "the floor absorbs" the new evidence: monitoring continues for the humanitarian system and for pattern documentation, but the composite cannot fall further.

### Trigger criteria and reversibility

The trigger criteria for a floor designation are the four already published in the floor-designation section (all four required, documented across at least three independent assessment cycles): multi-source T1/T2 corroboration; a systemic rather than episodic pattern; harm active within the recency window; and no countervailing recognition or response sufficient to register above the floor anchor at any sub-dimension.

Floor designation is **reversible**, by the same exit protocol already documented: evidence-of-care behavior at the dimension level, applied consistently across at least two consecutive assessment cycles, evidenced by sources outside the entity's control (independent investigation with published findings, structural reform paired with accountability action, substantive compliance with treaty-body or court findings, verifiable behavioral change recorded by independent observers). Performative statements and unverifiable commitments do not register.

---

## 5. EVIDENCE NOTES

**Suggested placement:** Three short additions within or just after the `#evidence-hierarchy` section.
**Suggested anchor id:** reuse `evidence-hierarchy`; optionally add `evidence-recency` to the recency sub-block if a deep link is desired.

### 5a. Recency and decay

The **14-day window is the scan cadence**, not the lifespan of the evidence base. Each nightly cycle looks for material new evidence within the most recent 14 days; that window governs what can *trigger* a re-assessment, not what a score *rests on*.

- **Baseline scores draw on a multi-year evidence base.** Assessments routinely cite findings from prior years as the load-bearing evidence for a dimension. For example, Harvard's Empathy and Accountability scores rest on standing findings (an OCR Title VI/IX violation, the Comaroff harassment case) that long predate the current window; the June 2026 news did not change conduct toward students, so those dimensions held.
- **Adjudicated findings persist.** A court ruling, regulatory finding, or settlement remains part of the evidence base until superseded by documented change — it does not expire on a 14-day clock.
- **Uncorroborated allegations decay.** Evidence that is not corroborated and not adjudicated carries less weight over time and is not allowed to accumulate into a score change on its own. This is the same discipline that keeps pre-adjudication probes (e.g., UHG) as evidence-tier upgrades rather than composite movements until something is adjudicated.

### 5b. Served population, in one line per index

The evidence search is scoped to how the entity treats its served population (the same subjects defined in §2a):

- **Countries** → residents / people under the state's effective control.
- **Cities** → residents the city serves.
- **Companies** → workers, customers, and operating communities.
- **AI labs** → users and the broader society affected by their systems.
- **Robotics labs** → users and the broader society affected by their systems.
- **Universities** → students, workers (faculty and staff), and surrounding communities.

### 5c. Positive-evidence search note

Desk-based research has a built-in downward bias: adverse events (lawsuits, probes, strikes, casualties) are reported far more aggressively than the quiet existence of working structures. To counter this, assessors must **actively search for structural positive evidence**, not only adverse news. Positive evidence is structural and verifiable — published outcome data acted upon, independent audits with corrective action, durable access and equity infrastructure, worker-voice gains, and commitments held at real cost — not press releases or mission statements. The 2026-06-20 cycle illustrates the discipline in both directions: university labor wins (graduate-worker contract gains, faculty unionization) were correctly counted as worker-voice positives rather than ignored, and Harvard's choice to bear cost rather than settle was logged as a positive consistency signal alongside the negative staff-cost signal. Without an active positive search, the benchmark would systematically under-score entities that are quietly competent and over-weight whoever happened to be in the news.

---

## INTEGRATION NOTES FOR FRONTEND

Conversion is JSX-only; do not alter scoring or data files. Each block above is reader-facing prose ready to drop into the corresponding section component (`SectionHead` + `Panel`/`Card`/`details`, matching the surrounding pattern).

| Block | Sits near (existing section in `page.tsx`) | New TOC id to register | Notes |
|-------|---------------------------------------------|------------------------|-------|
| 1. Changelog v1.2 | Inside `#changelog`, above the v1.1 entry | none (optional `changelog-v1-2`) | Match the `grid-cols-[160px_1fr]` two-column entry format. Also update the hero `Stat value="v1.1"` (line ~81) to `v1.2` to match `METHODOLOGY_VERSION`. |
| 2. Attribution & subject rule | After `#scoring-model`, before `#evidence-hierarchy` | `attribution-rule` | Tables render cleanly as standard `<table>` or definition lists. |
| 3. Near-floor limitation | Immediately before `#floor-designation` | `near-floor-limitation` | Place the "open question" as a visually distinct callout; do not present it as settled. |
| 4. Harm-flag / 0.0 floor | Inside/adjacent to `#floor-designation` | reuse `floor-designation` (optional `harm-flag-floor`) | Reinforces the existing floor section; keep the formula-vs-editorial distinction intact. |
| 5. Evidence notes | Inside/after `#evidence-hierarchy` | reuse `evidence-hierarchy` (optional `evidence-recency`) | Three short sub-blocks; 5b can reuse the §2a table. |

Additional registration notes:
- The current TOC array (around line 38–50 of `page.tsx`) would gain `attribution-rule` and `near-floor-limitation` if those are added as standalone sections with their own `id` + `scroll-mt-24`.
- The hero `Stat` for "Methodology version" currently reads `v1.1`; the canonical version in code is already `v1.2` (`scoring.mjs` `METHODOLOGY_VERSION`). Updating the Stat is a one-token change and should accompany the changelog entry.
- Reuse `INTEGRATION_PREMIUM.short` / `INTEGRATION_PREMIUM.detail` and the `BANDS` array from `dimensions.ts` rather than restating the premium or band copy, to keep a single source of truth.
