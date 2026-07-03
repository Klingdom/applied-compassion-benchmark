# Claims to Verify

Consolidated register of claims in the funder prospectus that require citation, legal/tax review, methodology validation, or softer wording before external release. Organized by Part. Each entry: claim, location, why verification is needed, suggested fix.


## partI

# Claims to Verify — Front Matter Remainder and Part I

Flagged claims from fm-01, fm-02, fm-03, fm-06, ch-02, ch-03, ch-04. Each lists the claim, where it appears, why it needs checking, and a suggested fix or fallback wording.

---

## High priority

**1. Independence statement wording.**
- Claim: The independence pledge quoted in fm-02 ("Entities never pay for inclusion, score changes, or suppression of findings. Commercial services support access, interpretation, and institutional use only. This separation must be preserved in all content and code.").
- Where: fm-02-inside-cover.md (block quote).
- Why: The chapter-index specifies this should be quoted verbatim from GRANT_MODEL §4 Section 5. The wording used here is the verbatim core product rule from CLAUDE.md / source_notes §7. If GRANT_MODEL §4 Sec.5 phrases it differently, the inside-cover quote and any other verbatim use must be reconciled to a single canonical wording.
- Suggested fix: Confirm GRANT_MODEL §4 Sec.5 against CLAUDE.md and lock one verbatim form across the manuscript. Both sources are internal, so this is a consistency check, not an external-source check.

**2. ESG-rater conflict-of-interest characterization.**
- Claim (ch-04): that in parts of the ESG-ratings industry the rated entity supplies data, reviews drafts, and in some arrangements pays for the assessment or for consulting that improves it; and that major raters frequently disagree about the same company.
- Where: ch-04-why-existing-frameworks-fall-short.md, "capturability" paragraph.
- Why: This is a defamation-sensitive characterization of a named industry (and implicitly of named firms). It is broadly supported in the academic and trade literature (ESG-rating divergence is well documented), but the prospectus states it as fact without citation. Source_notes supports pricing tiers but not the issuer-pays / draft-review specifics.
- Suggested source type: peer-reviewed work on ESG-rating divergence (e.g., aggregate-confusion studies) and reporting on issuer-pays vs investor-pays ESG models.
- Recommended wording if unverified: soften to "In some commercial ESG arrangements, the rated entity participates in the rating by supplying data and reviewing drafts, and independent studies have documented that major raters often disagree about the same company." Attribute the divergence claim to the literature rather than asserting it flatly.

**3. Epoch AI / undisclosed-lab-funding cautionary case.**
- Claim (ch-04): "an AI-research organization recently drew a credibility crisis when undisclosed funding from a lab it benchmarked, paired with privileged access, came to light."
- Where: ch-04, capturability paragraph (unnamed but clearly the Epoch AI case from source_notes §9).
- Why: Even unnamed, this is a specific, reputationally damaging assertion about an identifiable organization. Source_notes records it as a "cautionary tale (undisclosed OpenAI funding + privileged benchmark access caused a credibility crisis)" but cites internal strategy docs, not primary reporting.
- Suggested source type: primary reporting on the Epoch AI / FrontierMath / OpenAI disclosure episode.
- Recommended wording if unverified: keep it unnamed and hedged ("came to public attention"), or cut to the general principle ("benchmarks that take undisclosed money from the entities they assess lose their credibility when it surfaces") to avoid resting the point on one contestable case.

**4. ESG monitoring price range.**
- Claim (ch-04): enterprise ESG monitoring runs from "several thousand dollars a year at the low end to well over twenty thousand at the high end."
- Where: ch-04, access paragraph.
- Why: Stated as fact about third-party pricing. Source_notes §8 (PRICING_LANDSCAPE) supports specific anchors (MSCI $25k+, Sustainalytics $10k+, RepRisk $15k+, EcoVadis $5k+), so the range is sourced internally but the underlying figures are from a dated internal landscape doc (2026-04) and vendor pricing is opaque.
- Suggested fix: Confirm against current vendor pricing where possible, or attribute to the internal PRICING_LANDSCAPE snapshot and date it. The rounded range as written is defensible against the source_notes anchors.

---

## Medium / low priority

**5. "We measure everything except this" uniqueness claim.**
- Claim (ch-03): "there is no independent, standardized, comparable, public benchmark of how institutions across sectors recognize, respond to, and reduce suffering."
- Where: ch-03-we-measure-almost-everything-except-this.md, "precise about the claim" paragraph.
- Why: A negative existence claim ("no such thing exists") is inherently hard to prove and a sophisticated reader will test it. The chapter already soft-words it and narrows it to the cross-sector + standardized + public + behavior-scored conjunction, which is the defensible form.
- Suggested fix: Keep the narrowed framing as written; ensure no other chapter restates the unqualified "the only one" version. No change needed unless a counterexample surfaces.

**6. AI/robotics "almost no standardized external measurement" claim.**
- Claim (ch-03): AI and robotics labs face "almost no standardized external measurement" on whether they recognize and respond to the suffering their products cause.
- Where: ch-03, AI/robotics paragraph.
- Why: Forward-looking landscape claim; the field moves fast and new AI-accountability indices appear regularly. Traces to source_notes §1 (safety framing) and FUNDER_LANDSCAPE.
- Recommended wording: "almost no" is appropriately hedged; retain. Re-check at production time in case a credible cross-lab welfare/safety-conduct benchmark has launched.

**7. AI safety-benchmark framing.**
- Claim (ch-03): that AI now has "more public benchmarks for what a model can do, and increasingly for how safely it behaves, than exist for how the company building it treats the people its systems reach."
- Where: ch-03, sectors paragraph.
- Why: Comparative count stated rhetorically, not literally measured. Defensible as a qualitative observation but not a counted fact.
- Recommended wording: leave as qualitative; do not convert to a numeric claim.

**8. "Optimize for what is measured" lesson.**
- Claim (ch-03): the general principle that institutions optimize for what is measured and neglect what is not.
- Where: ch-03 opening; echoed in ch-02.
- Why: Stated as established wisdom. It is a widely accepted management axiom (Goodhart-adjacent) but is asserted, not cited.
- Recommended fix: acceptable as framing; no citation required for a stated principle, but avoid attributing it to a specific named law.

---

## Notes for the claims pass

- No invented entity scores appear in Part I. The only quantitative external claim is the ESG price range (item 4), traced to source_notes §8.
- The pressure-test mechanism referenced in ch-02 (subdimension capped at Developing absent a documented costly case) is stated per source_notes §4 / methodology-v1.2 and is consistent with style-lock §7; verify exact band-cap wording against Appendix C when locked.
- All forward-looking limits (no external citations, no documented behavior change) are stated honestly in fm-02 and are consistent with source_notes §12.


## partII

# Claims to Verify: Part II, The Standard (Chapters 5–9)

Flagged claims from the Part II drafts, for the claims/fact-check pass. Each row gives the claim, where it appears, why it is flagged, and a suggested fix or disposition. Numbers presented as fact are traced to `source_notes.md`; numbers built to teach the mechanism are flagged illustrative in-text. Locked references mirrored: Appendix A (dimensions), Appendix B (evidence hierarchy), Appendix C (lifecycle + worked math).

---

## A. Numbers presented as fact (must trace to source_notes)

| # | Claim | Where | Why flagged | Suggested fix / disposition |
|---|---|---|---|---|
| 1 | UnitedHealth Group is scored 10.2, Critical band; a DOJ probe expansion was logged as an evidence-tier upgrade with no composite change. | Ch9 (floor/reversibility section) | Real published score and a defamation-sensitive claim about a named company and an active legal matter. | Confirm 10.2 / Critical and the DOJ-probe-as-tier-upgrade framing against `source_notes.md` §4/§8 and methodology-v1.2 §3. Keep wording as "logged as a tier upgrade with no composite change"; do not characterize the DOJ matter beyond "probe expansion." Verified against source as written. |
| 2 | "46.9 ... the third of five bands ... Functional" and the supporting eight dimension scores (AWR 3.5, EMP 2.5, ACT 3.5, EQU 2.5, BND 3.0, ACC 2.5, SYS 3.0, INT 2.5). | Ch6 (introduced), Ch8 (full math), Ch9 (decomposed) | Invented numbers for the illustrative AI lab. Risk is a reader mistaking them for a published lab score. | Each appearance is explicitly flagged "illustrative, built to demonstrate the mechanism, not a published score." Mirrors Appendix C §5 exactly. Confirm the math one more time: mean 2.875, base 46.9, premium 0. No change needed if the illustrative flag survives editing. |
| 3 | Integration-premium contrast table: Balanced (all 4.0 → base 75.0, +10, 85.0 Exemplary) vs Spiky (four 5.0 / four 2.0 → base 62.5, +2.0, 64.5 Established). | Ch8 (premium section) | Invented teaching numbers; the +2.0 spiky premium in particular must reconcile with the v1.2 multipliers. | Mirrors Appendix C §5 table verbatim. Re-verify the spiky +2.0 against the consistency/balance factors in `scoring.ts` (std-dev band → consistency mult; −0.2 per sub-4.0 dimension). Numbers locked to Appendix C; flag only if Appendix C itself is revised. |
| 4 | Universities index publishes a per-entity High/Medium/Low confidence flag; a Low flag is published with an explicit caveat. | Ch7 (confidence section) | Appendix B carries a [VERIFY] on whether the confidence flag is applied uniformly across all eight indexes or only where implemented. | Keep the example scoped to the universities index (where it is sourced). Do not generalize "confidence is published" to all 1,256 entities. As written, scoped correctly; hold the Appendix B [VERIFY] open. |

## B. Mechanism / methodology claims

| # | Claim | Where | Why flagged | Suggested fix / disposition |
|---|---|---|---|---|
| 5 | The 1,256 public scores come from an automated nightly pipeline with a human approving any change; "not a room of analysts hand-assessing twelve hundred institutions." The 7-session Human Assessment Battery is aspirational and underpins a future paid certification. | Ch8 (closing), Ch9 (opening reference) | The automated-vs-certified split is the highest-risk accuracy line in Part II per the comprehension plan guardrails. | Verified against source_notes §4 and Appendix C. Keep "human-gated"/"a human approving any change"; never imply humans hand-assess 1,256 entities. Keep the Battery labeled aspirational. As written, compliant. |
| 6 | Base composite = `((mean − 1) / 4) × 100`; integration premium caps at +10; bands 0–20 / 20–40 / 40–60 / 60–80 / 80–100. | Ch8 (math), Ch5/Ch6 (foreshadowed) | v1.2 must not regress to the legacy "/80 + up to 20" or 21/41/61/81 boundaries. | Matches `dimensions.ts` / scoring v1.2 and Appendix C. Confirm no legacy figures crept in. As written, compliant. |
| 7 | Premium override: any single dimension at exactly 0 (active documented harm) cancels the premium entirely. | Ch8 (premium section) | Precise rule; easy to misstate as "lowers" rather than "cancels to 0." | Confirm against `INTEGRATION_PREMIUM` harm-flag in `dimensions.ts` / source_notes §3. Stated as "canceled entirely" / "sets the premium to 0," which matches source. |
| 8 | Floor-designation exit protocol: recovery requires evidence-of-care behavior at the dimension level, sustained across at least two consecutive cycles, from sources outside the entity's control; performative statements do not register. | Ch9 (reversibility section) | Specific multi-cycle criteria; must not be softened into "improve and it goes up" (overclaim of easy improvement) or hardened beyond source. | Matches methodology-v1.2 §3–4 / Appendix C §6. Keep "at least two consecutive cycles" and "outside the entity's control." Do not imply guaranteed or easy improvement. As written, compliant. |
| 9 | Evidence tiers 1–5 as ranked hierarchy (independent audit → self-report); "strong scores require stronger evidence"; no numeric per-tier weights asserted. | Ch7 (whole chapter) | Appendix B [VERIFY]: no explicit per-tier numeric weight exists in source; chapter-index mentions tier "weights." | Chapter describes a ranked hierarchy only and asserts no numeric weight or multiplier per tier. Compliant; keep it that way through edits. |
| 10 | Community testimony (Tier 3) outranks leadership narrative; the community account is the primary reference point where they conflict. | Ch7 (Tier 3) | Correct per source but a strong claim; confirm direction is not inverted. | Matches source_notes §3 and Appendix B. Compliant. |

## C. Framing / characterization claims (lower risk, still check)

| # | Claim | Where | Why flagged | Suggested fix / disposition |
|---|---|---|---|---|
| 11 | "A mission statement is not evidence of compassion." | Ch7 (Tier 5) | Rhetorical sharpening of the Tier 5 rule; verify it reads as evaluation of disclosed-evidence weight, not a blanket factual assertion about any institution. | Anchored to the evidence-hierarchy rule (self-report requires corroboration). Opinion-on-disclosed-method framing is fine. No change. |
| 12 | The illustrative AI lab is described as "well-funded, technically excellent" releasing systems "millions of people now use." | Ch6 (opening) | Generic composite, but ensure no reader maps it onto a specific real lab (independence + defamation hygiene). | Explicitly fictional and flagged illustrative. Keep it unnamed and generic; do not add identifying detail (location, founder, product name) in later edits. |
| 13 | Eight dimensions, forty subdimensions, names/codes/colors, and the AC1–AC5 Action subdimensions as listed. | Ch6 (wheel + Action open-up) | High-density reference content; codes/names/colors must match Appendix A and `dimensions.ts` exactly. | Cross-checked against Appendix A: AC1 Responsiveness, AC2 Proportionality, AC3 Efficacy, AC4 Resource Mobilization, AC5 Follow-Through; cyan reserved for AWR. Compliant. |
| 14 | Cost/operational details of the pipeline are not asserted in Part II. | Ch8 (split) | Deliberate omission; per-night cost and runtime belong to Ch25/Appendix C, not the teaching chapters. | Confirm Part II does not state pipeline cost/runtime figures. None present; correct scope. |

---

### Top 3 to prioritize in the claims pass

1. **Claim 1 (UnitedHealth Group 10.2 / DOJ tier-upgrade).** The only real, named-entity, defamation-sensitive number in Part II. Verify the score, band, and the no-composite-move framing against source before this leaves the building.
2. **Claim 5 (automated vs certified, 1,256 human-gated not hand-assessed).** The guardrail the comprehension plan flags as most damaging to get wrong. Any drift toward implying humans hand-assess 1,256 entities must be caught here.
3. **Claims 2 + 3 (illustrative AI lab numbers and the premium contrast table).** Invented numbers that teach the mechanism; the single failure mode is an edit that strips the "illustrative" flag and lets a reader read 46.9 or 85.0 as a published lab score. Verify the flag survives on every appearance.


## partIII

# Claims to Verify: Part III Research Foundation (Ch 10-13)

Flagged claims from the four Part III chapters, for the editorial claims pass. Each row gives the claim, where it appears, why it is flagged, and a suggested fix. The most urgent are the places that assert empirical predictive power the framework has not yet demonstrated, and the three places that need an external academic citation rather than a bare assertion. Numbers presented as fact trace to `source_notes.md`; numbers marked illustrative are visibly flagged in the prose.

Status key: **VALIDATION** = needs empirical study before it can be stated without caveat. **CITE** = needs an external source. **SOURCE-CHECK** = should match an internal source-of-truth file; verify wording/figure. **OK-FLAGGED** = handled honestly in-text, listed for completeness.

---

## Highest priority: needs external validation or citation

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 1 | The framework is principled and operationalized but **not yet externally validated**: no independent factor analysis of the 8 dimensions, no published inter-rater reliability study of the anchors, no test of convergence with independent outcome measures. | Ch11, §"Here is where intellectual honesty…" | This is the central honesty claim of Part III and the funding case rests on it. It must be accurate that none of these studies exists. Confirms against GAP note in `source_notes.md` §12 (no external validation/citations yet). | **VALIDATION.** Keep as written; it is honest and load-bearing. Before publication, confirm with founder that no inter-rater, factor-structure, or convergent-validity study has in fact been run. If any partial work exists, name it; if not, the "planned work" framing stands. |
| 2 | Observable conduct predicts how an institution treats people **better than its stated sentiment** does. (The premise the whole framework rests on.) | Ch10, opening + closing caveat | An empirical prediction, not yet tested against independent outcome data. Already caveated in-text as "reasonable and defensible premise … not yet put through formal external validation." | **VALIDATION.** Retain the in-text caveat verbatim. Do not strengthen the verb ("predicts" → never "proves"). The convergence study in claim 1 is what would discharge this. |
| 3 | Structure is more observable than motive and more stable than mood, and **locating compassion in structure is the reason the measurement has predictive value at all**. | Ch12, final two paragraphs | A predictive-validity claim. Plausible and well-argued from design, but unproven; same evidentiary status as claim 2. | **VALIDATION.** Soft-word the predictive-value sentence or tie it explicitly to the planned validation work. Acceptable as a design rationale; not yet assertable as a demonstrated result. |
| 4 | The construct-and-indicator measurement principle (a latent construct estimated through observable indicators aggregated under a stated rule). | Ch11, §2 ("In measurement work generally…") | Stated as established methodology with no source. In-text `[VERIFY: cite …]` already placed. | **CITE.** Add a standard reference on latent constructs / observable indicators (measurement theory text). Do not fabricate; the bracketed note marks the spot. |
| 5 | Standard psychometric validity criteria are named (construct, convergent, discriminant validity; inter-rater reliability) as the bar the framework has not yet cleared. | Ch11, validation paragraph | Technical terms used as if from a shared standard; needs an anchor so a reviewer can check the bar is described correctly. In-text `[VERIFY: cite …]` placed. | **CITE.** Anchor to a standard psychometrics/validity reference. Confirm the four terms are used correctly. |
| 6 | Outcomes in large institutions are set by incentives, defaults, staffing levels, and structure **far more than** by individual goodwill. | Ch12, §2 ("Good people work inside systems…") | A claim from organizational behavior / systems theory, asserted without support. The chapter's argument leans on it. | **CITE.** Add `[VERIFY: cite organizational-behavior / systems literature]` and a source on how structure and incentives drive institutional outcomes. Currently unsupported. |

---

## Source-check: verify wording or figure against the internal source of truth

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 7 | V-Dem produces measures from "thousands of specific indicators coded by a large, deliberately distributed body of coders." | Ch11, §3 | `source_notes.md` §9 cites ~3,500 anonymous **coders**, not a count of indicators. The "thousands of specific indicators" phrasing may misattribute the figure. | **SOURCE-CHECK.** Reword to match source: distributed coding by ~3,500 coders is the documented fact; do not assert a specific indicator count for V-Dem unless confirmed. |
| 8 | Stanford FMTI scores developers against "roughly one hundred discrete indicators" with an external advisory structure. | Ch11, §3 | Traces to `source_notes.md` §9 ("100-indicator rubric + external advisory board"). Verify "roughly one hundred" and the advisory characterization. | **SOURCE-CHECK.** Confirm the indicator count and that "external advisory board" is the correct description. Low risk; matches source. |
| 9 | Harvard's composite held at **52.3** through the June 2026 DOJ action (not scored) and its own layoffs (scored). | Ch10, attribution section | Traces to `source_notes.md` §4 (attribution worked example) and §6 (Harvard 52.3, highest in university set). Real, sourced number. | **SOURCE-CHECK.** Confirm the 52.3 figure and the DOJ-action date/framing match source. Handle Harvard reference with the same defamation care as other named entities. |
| 10 | Universities index: **mean 46.2**, Harvard highest at **52.3**, **zero** of 100 reached Exemplary. | Ch13, final paragraph | Traces to `source_notes.md` §6. Real, sourced. | **SOURCE-CHECK.** Confirm figures; already canonical. |
| 11 | Attribution subjects by index (countries→people under state control; companies→workers/customers/communities; AI & robotics labs→users and broader society; universities→students, faculty/staff, communities). | Ch10, attribution section | Traces to `source_notes.md` §4. Verify the list is reproduced exactly. | **SOURCE-CHECK.** Cross-check each subject definition against §4 wording. |
| 12 | Pressure-test cap lands at the **Developing** anchor (level 3); floor designation requires four conditions across **≥3** independent cycles; exit protocol requires sustained care across **≥2** consecutive cycles. | Ch13, §§ on the gate and the floor | Traces to `source_notes.md` §4 and Appendix C. Cap is at Developing (3), not at Minimal (2) or Functional. | **SOURCE-CHECK.** Confirm the cap is at level 3 and the cycle counts (3 / 2) are exact. |
| 13 | Review flags: 0 active harm needs written documentation + lead-assessor co-sign; inter-rater gap >1.5 triggers review; leadership-community divergence resolved with community as reference; refusal to provide documents is score-relevant. | Ch13, maturity-gate paragraph | Traces to Appendix C / `source_notes.md` §4. | **SOURCE-CHECK.** Confirm the 1.5 threshold and each flag matches Appendix C. |
| 14 | SYS subdimensions (S1 Root Cause Orientation, S2 Long-Term Impact, S3 Interconnection Awareness, S4 Structural Critique, S5 Coalitional Compassion) and INT subdimensions (I1 Consistency Under Pressure, I2 Non-Performance, I3 Internal Consistency, I4 Values Alignment, I5 Resilience of Care). | Ch12 (both lists); Ch13 (I1, I5) | Subdimension names must match Appendix A / `dimensions.ts` exactly. | **SOURCE-CHECK.** Verified against Appendix A at drafting; re-check names and codes are letter-perfect. |

---

## Illustrative material: confirm it is unmistakably flagged, never read as fact

| # | Item | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 15 | The fully-anchored **AC1 Responsiveness** scale (0–5 behavioral anchors). | Ch11, anchored-scale table | The per-level anchor text is authored to show the shape of an anchored scale; it is **not** the verbatim live rubric for AC1. In-text caption says "illustrative." | **OK-FLAGGED.** Keep the "illustrative … not reproduced verbatim from the live rubric" caption. If the live AC1 anchors are available, consider swapping in the real text and removing the caveat. |
| 16 | Illustrative frontier AI lab: Action dimension 4.0 → 3.2 after the pressure-test cap; the five-row AC subdimension before/after table. | Ch13, before/after case | Invented numbers built to demonstrate the gate. In-text says "illustrative … not a published entity." | **OK-FLAGGED.** Confirm the caption stays attached and that no figure here is ever lifted into a context that reads as a real score. |
| 17 | The **behavioral-evidence ladder** (sentiment → policy → conduct → verified outcome) as a four-rung device. | Ch10, ladder section | A presentational device the author derived from the canonical 5-tier evidence hierarchy (Appendix B); it is not a separate named artifact in the source material. | **OK-FLAGGED.** Ensure prose does not imply the four-rung "ladder" is a distinct published instrument; it is a teaching frame consistent with, and subordinate to, the 5-tier hierarchy. |

---

## Cross-cutting checks (apply to all four chapters)

- **Entity count 1,256**, never 1,155. (Ch13 references the universities index and the 1,256 total via Appendix C context.)
- **Scoring v1.2 only**: base = ((mean − 1)/4)×100, integration premium cap +10, bands 0–20/20–40/40–60/60–80/80–100. (Ch13's worked dimension means and the Appendix C math must agree.)
- **Automated vs certified pathway kept distinct**: no Part III sentence implies humans hand-assess 1,256 entities.
- **No em dashes; "Compassion Benchmark" only.** Confirmed at drafting; re-scan in copyedit.


## partIV

# Claims to Verify : Part IV: Applications (Chapters 14–18)

Flagged claims from the Part IV draft, for the claims-verification pass. Each row: the claim, where it appears, why it needs checking, and a suggested fix. Priority order within each chapter is roughly most-sensitive first. "Sourced" means it traces to `source_notes.md`; "illustrative" means it is framed in-text as a scenario, not asserted as a published fact.

---

## Chapter 14: Artificial Intelligence and Robotics

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 14.1 | **OpenAI scores 26.7, in the Developing band.** | Ch14, "Consider the single most-cited example" paragraph | Sourced to source_notes §8 (sales hooks: "OpenAI 26.7"), but flagged in chapter-index as "verify OpenAI 26.7." The number is presented as a current published composite; confirm it matches the live AI Labs index JSON before print. Defamation-sensitive because it names a real lab with a low score. | Confirm 26.7 against `site/src/data/indexes/ai-labs.json`. If the live score has moved, update or generalize. Keep the "anchored in sourced evidence, reconstructable" framing, which is the defamation protection (opinion on disclosed facts). |
| 14.2 | **OpenAI "is the subject of a multistate attorney-general inquiry."** | Ch14, same paragraph | source_notes §8 says "OpenAI 26.7 under 42-state AG subpoena." Chapter-index explicitly flags "verify ... any AG-subpoena reference." This is a specific, externally checkable, legally sensitive factual claim about a named entity. I deliberately softened "42-state subpoena" to "multistate attorney-general inquiry" to reduce exposure; the underlying fact still must be confirmed. | Verify the existence, scope, and current status of the AG action against primary reporting before publication. If it cannot be cleanly sourced, cut the clause and rest the example on the score alone. Do not restore the specific "42-state subpoena" figure unless independently confirmed. |
| 14.3 | **The robotics index = "multi-agent oversight" (Schmidt framing).** | Ch14, dimensions paragraph | Maps the Robotics Labs index onto the Schmidt Sciences "Scaling AI Safety for a Multi-Agent World" framing (source_notes §10). This is a positioning analogy for funders, not a benchmark finding. | Acceptable as framing; confirm the Schmidt program language still matches before leaning on it in the funder-facing chapters (Ch29/Appendix E carry the hard deadline). |
| 14.4 | **No specific robotics-lab score is named.** | Ch14, robotics/demo paragraph | Intentional. source_notes contains no individual robotics-lab composite, so the robotics discussion is kept qualitative (demo vs pressure-test) with no invented number. | No fix needed; preserve this in edits. Do not let a later pass insert an illustrative robotics number without an explicit "illustrative" flag. |
| 14.5 | Index counts: **50 AI labs, 50 robotics labs**; pipeline maintains the 100 within the 1,256. | Ch14, throughout | Sourced (source_notes §0/§6). Routine count check. | Confirm against entity-count table; no change anticipated. |

---

## Chapter 15: Healthcare and Human Services

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 15.1 | **UnitedHealth Group scores 10.2, Critical band.** | Ch15, opening line and entity card | Sourced (source_notes §4, §8; methodology-v1.2 §3). The canonical real example, but it is a named corporation placed at the floor band, so it carries the highest defamation sensitivity in Part IV. | Confirm 10.2 against the live Fortune 500 index JSON. Keep the explicit "sum of eight dimension scores, anchored in sourced evidence, reconstructable" framing in the same paragraph : this is the legal protection (opinion on disclosed facts; *Bose v. Consumers Union* posture per source_notes §9). Editorial/defamation review required before print. |
| 15.2 | **The expanded federal probe was logged as an evidence-tier upgrade with no composite move (held at 10.2).** | Ch15, near-floor paragraph | Sourced (source_notes §4: "DOJ probe expansion logged as tier upgrade, no composite change"). I wrote "federal probe" rather than naming a specific agency; confirm whether source intends DOJ specifically. Near-floor limitation mechanics must be stated correctly. | Verify the agency/probe characterization against methodology-v1.2 §3. If "DOJ" is correct and printable, name it; otherwise keep the generic "federal probe." Confirm the no-composite-move logic reads accurately. |
| 15.3 | **"the pipeline logged a downgrade for another large managed-care insurer in the same period."** | Ch15, downgrade paragraph | This is the **Humana downgrade** from source_notes §8, which appears only as a bare sales-hook phrase with **no score, no detail, and no date**. Chapter-index flags "verify Humana downgrade." I deliberately did **not** name Humana and did **not** assert a number, to avoid an unsupported defamatory specific. | Before naming Humana or attaching any figure, confirm the downgrade event, its magnitude, and timing from the index change logs (`APPLIED_CHANGES.md`). If it cannot be substantiated, cut the sentence; the chapter does not depend on it. Do not add a Humana score. |
| 15.4 | **"ninety seconds per case" review window.** | Ch15, intentions paragraph | Echoes the illustrative composite scene from Ch1 (explicitly a composite there). Here it reads as a general sector illustration, not a UHG-specific fact. | Ensure edit keeps it generic/illustrative and does not let it attach to UnitedHealth Group as an asserted operational detail. |

---

## Chapter 16: Government and Public Service

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 16.1 | **Israel and Sudan each carry a composite of 0.0 (floor designation).** | Ch16, floor paragraph | Sourced (source_notes §4: "Israel (0.0); Sudan (0.0)"). Among the most geopolitically and legally sensitive claims in the manuscript. Must be verified against the live Countries index and accompanied by the floor-designation disclosure the methodology requires. | Confirm both 0.0 values against `site/src/data/indexes/countries.json`. Confirm each carries a public `FloorDesignation` disclosure and meets all four documented criteria across ≥3 cycles (source_notes §4). Legal/editorial review mandatory. If either has changed band, update. Keep the attribution-rule context that immediately precedes it. |
| 16.2 | **"Missile strikes on Ukraine are attributed to Russia, not counted against the country absorbing them."** | Ch16, attribution paragraph | Sourced as a worked example of the attribution/subject rule (source_notes §4, methodology-v1.2 §2). Politically sensitive but methodologically illustrative. | Confirm the example still matches the methodology doc's wording; keep it tied to the victim/perpetrator rule rather than to any country's composite. |
| 16.3 | **Coverage: 193 of ~207 countries; 21 of 51 US states.** | Ch16, coverage paragraph | Sourced (source_notes §0, §6; "~207" and "21 of 51"). The 207 denominator is approximate. | Keep "roughly 207." Confirm the 21/51 states figure is current; source_notes notes CLAUDE.md counts are stale, so verify against the live US States index JSON. |
| 16.4 | Index counts: **193 countries, 21 US states, 144 US cities, 250 global cities.** | Ch16, second paragraph | Sourced (source_notes §0). Routine. | Confirm against entity-count table. |
| 16.5 | **Floor-designation criteria** (four conditions, ≥3 cycles, reversible exit protocol). | Ch16, floor paragraph | Sourced (source_notes §4). Must be stated accurately because it is the safeguard that makes a 0.0 a measurement rather than an opinion. | Cross-check each of the four criteria and the exit-protocol description against methodology-v1.2 §3–4 verbatim. |

---

## Chapter 17: Corporations and Employers

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 17.1 | **Fortune 500 index = 448 companies.** | Ch17, second paragraph | Sourced (source_notes §0; canonical 448, not CLAUDE.md's 447). Routine but a known stale-count trap. | Confirm 448 against `fortune-500.json` meta. |
| 17.2 | **The histogram "distribution across the five bands"** and the claim that the index "discriminates" / places companies across bands. | Ch17, histogram paragraph and graphic note | No specific band counts are asserted (deliberate : source_notes gives no F500 distribution). The text describes the *shape* argument without numbers, and the graphic is "own data." | Keep numberless unless a verified distribution is pulled from the live index. If the designer renders real counts, those must be generated from `fortune-500.json` and flagged as own-data, zero-baseline. Do not let an edit insert illustrative band counts as fact. |
| 17.3 | **No individual F500 company is scored by name in Ch17.** | Ch17, throughout | Intentional. The only sourced F500-adjacent score (UnitedHealth Group) is used in Ch15; no other named corporate score exists in source_notes. | No fix; preserve. Any named corporate score added later must trace to source_notes or be flagged illustrative. |
| 17.4 | **ESG / disclosure characterization** ("ESG can tell you whether a company filed the right disclosures... was not answering this one"). | Ch17, ESG-contrast paragraph | Framing claim about a category of products. source_notes §8/§9 supports the positioning; chapter-index warns "ESG-buyer framing not overstated." Written as a distinction, not a disparagement. | Confirm it reads as "different question," not "ESG is worthless." Current wording credits ESG's purpose; keep that. |

---

## Chapter 18: Nonprofits, Humanitarian Organizations, and Civil Society

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 18.1 | **"Compassion Benchmark does not yet publish a civil-society index ... nonprofits ... are a planned extension, not a current scoreboard."** | Ch18, second paragraph and throughout | This is the chapter's central guardrail. source_notes confirms there is **no live nonprofits index** (only 8 indexes; nonprofits absent). Chapter-index flags "[VERIFY] whether nonprofits are an existing scored index or a forward application; do not imply current scoring." | Verified correct as forward-only. Ensure no edit introduces a present-tense nonprofit score, count, or named org placement. The whole chapter must stay in the conditional/forward voice. |
| 18.2 | **Per-entity confidence flag** would publish low-confidence civil-society scores with caveat. | Ch18, final-build paragraph | Sourced from the Universities index precedent (source_notes §6: High/Medium/Low confidence flag, "Low" published with explicit caveat). Applied forward to a not-yet-built index. | Keep framed as design intent ("would publish"), not an existing civil-society feature. Confirm the confidence-flag mechanism description matches the Universities index docs. |
| 18.3 | **Sector-agnostic framework claim** (same 8×5 structure; only evidence model and subject change). | Ch18, second paragraph + graphic | Sourced (source_notes §2 cross-sector adaptation; Appendix A closing line, verbatim concept). | Confirm wording matches Appendix A ("what changes by entity type is the evidence model and who counts as the subject of care, not the definition of compassion"). Currently paraphrased closely; fine. |
| 18.4 | **"mission-driven"** usage. | Ch18, title-area concept | style-lock bans "mission-driven" as filler. I avoided the phrase, using "mission-driven institutions/orgs" only where it denotes a real category, not as decoration. | Verify no filler use slipped in; current draft uses "mission-driven" sparingly and substantively. Consider "organizations that claim compassionate purpose" if a reviewer reads any instance as filler. |

---

## Top 3 flagged claims (highest priority for the verification pass)

1. **UnitedHealth Group 10.2, Critical (15.1)** and the **DOJ/federal-probe tier-upgrade-without-composite-move (15.2).** Named real entity at the floor band; the single most defamation-exposed pair in Part IV. Must be confirmed against the live index and cleared by editorial/legal review, with the "reconstructable, evidence-anchored" framing kept adjacent as the opinion-on-disclosed-facts protection.

2. **Israel 0.0 and Sudan 0.0 floor designations (16.1).** Geopolitically and legally sensitive; require confirmation against the live Countries index, proof that each carries the required public floor-designation disclosure and meets all four criteria across ≥3 cycles, and mandatory legal review before print.

3. **OpenAI 26.7 + the attorney-general inquiry (14.1, 14.2).** The score is sourced but chapter-index-flagged; the AG-action clause is an externally checkable, legally sensitive factual assertion that I already softened from the source's "42-state subpoena." Verify both, and cut the AG clause rather than ship it unconfirmed.


## partV

# Claims to Verify : Part V: Public Benefit (Chapters 19, 20, 21, 23)

Flagged claims from the Part V draft (Chapters 19, 20, 21, 23; Chapter 22 Theory of Change carries its own flags). Each row: the claim, where it appears, why it needs checking, and a suggested fix. Priority is roughly most-sensitive first within each chapter. "Sourced" means it traces to `source_notes.md`; "forward-looking" means it is framed in-text as designed/planned/target, not asserted as achieved. The dominant risk in this Part is impact overclaim and operational-status overclaim (Score Watch, badge, API, methodology openness).

---

## Chapter 19: A Shared Language for Institutional Accountability

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 19.1 | **Freedom House and the Corruption Perceptions Index "became the language" journalists/investors/policymakers use.** | Ch19, precedent paragraph | Sourced as analogy (source_notes §9 long-term theory of change; STRUCTURE Part 2). Risk is that the analogy reads as a claim that Compassion Benchmark has *achieved* comparable adoption. Chapter-index: "must not imply achieved adoption; impact forward-looking." | Verified that the chapter keeps the analogy historical (those indices, over decades) and explicitly separates it from the benchmark's present state in the penultimate paragraph ("It would be dishonest to present this as accomplished"). Keep that disclaimer adjacent; do not let an edit drop it. |
| 19.2 | **No journalist has cited the scores, no legislature has quoted one.** | Ch19, "dishonest to present this as accomplished" paragraph | The honesty hedge for the chapter. Must stay consistent with the 0-citation baseline in Ch21/Ch23 and Ch22. | Keep. Confirm it does not contradict any later claim of an existing citation. Single source of truth: baseline external citations = 0 (source_notes §10, §12). |
| 19.3 | **Composite is "reconstructable from its eight dimension scores by a formula anyone can read and rerun."** | Ch19, inspection paragraph | Sourced (source_notes §3; v1.2 `((mean − 1)/4)×100` + ≤+10 premium). Load-bearing honesty claim repeated across the manuscript. | Confirm wording does not imply the *integration premium* is trivially hand-computable; the base is, the premium needs the published multipliers. Current phrasing ("reconstructable from its eight dimension scores") is accurate per source_notes; keep. |
| 19.4 | **Cross-sector comparability: a 0–100 score "means precisely what it means for a robotics lab and a national government."** | Ch19, second paragraph | Sourced (source_notes §2 cross-sector adaptation: same 8/40 structure; evidence model changes, definition does not). | Acceptable. Confirm it is not read as claiming identical *evidence* across sectors; the chapter is about scale comparability, which source_notes supports. |

---

## Chapter 20: Public Indexes and Open Research

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 20.1 | **"Open methodology" scope: rubric, dimensions, 40 subdimensions, anchors, evidence hierarchy, composite formula, and score-change rules are published in full today.** | Ch20, open-methodology paragraph | Chapter-index flags "'open methodology' scope accurate." Some of this lives in `methodology.html` (legacy) + `methodology-v1.2-additions.md`; confirm all listed elements are actually publicly published on the live site, not just in internal docs. | Verify each listed element is on the public methodology page. If the v1.2 formula/premium multipliers are not yet fully public-facing, soften to what is genuinely published and note the rest as forthcoming. Do not claim the per-entity evidence record is fully public unless verified (text says "retained, auditable," matching source_notes §7, not "published"). |
| 20.2 | **Distinction between free and paid: all 1,256 scores, all 8 indexes, bands, daily briefing, and full methodology are free; only derived depth is sold.** | Ch20, "what is sold" paragraph | Chapter-index: "Clarify what is genuinely free versus paid." Sourced (source_notes §8 offer ladder Tier 0 free; Tiers 1–7 paid). Tier 1 self-serve index reports are LIVE for only 5 of 8 indexes. | Verified at the index/score level (all scores free). Keep the chapter at the level of "scores free, derived depth sold"; do not enumerate which index PDFs are purchasable, since 3 of 8 are not yet built (source_notes §8). Current draft avoids that trap. |
| 20.3 | **Badge endpoint is "built" and serves an embeddable, auto-updating score graphic.** | Ch20, machine-readable paragraph | Sourced [BUILT] (source_notes §5 Worker: `/badge/{slug}.svg`, 1-hr edge cache). | Confirm against `worker/src/index.ts` / `badge.ts`. Stated as built; accurate per source_notes. Keep "updates when the underlying score does" consistent with the 1-hour cache (not real-time). |
| 20.4 | **Bulk data feed "exists today as an exportable file" and a programmatic interface is "planned, not yet shipped."** | Ch20, machine-readable paragraph | Sourced (source_notes §8 Tier 5: "CSV now, API later"; "CSV buildable now; API needs work"). Note tension: source says CSV is *buildable now*, which is not identical to *exists today*. | Verify a CSV/data export actually ships today vs. is merely buildable. If it is only buildable, change "exists today as an exportable file" to "is offered as a data export" or "is buildable on request." Do not present the API as available. |
| 20.5 | **Separate human assessment protocol "exists as a specification" and underpins "a future certified product," not the public scores.** | Ch20, open-methodology paragraph | Sourced (source_notes §4: Human Assessment Battery ASPIRATIONAL; automated nightly pipeline produces the 1,256). The critical automated-vs-certified distinction. | Verified correct. Keep "specification / future certified product"; never imply the HAB hand-assesses the 1,256. |
| 20.6 | **Our World in Data (small-donor funded) and ProPublica Data Store analogies.** | Ch20, "what is sold" paragraph | Sourced (source_notes §9 comparables). Light factual claims about third-party orgs' models. | Confirm characterizations (OWID small-donor base; ProPublica Data Store earned revenue) match source_notes §9; both are stated there. No change anticipated. |

---

## Chapter 21: Journalists, Policymakers, Researchers, and Communities

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 21.1 | **Score Watch is "sold today," fires on composite move or band crossing, but "automated delivery ... is still being finished."** | Ch21, connective-tissue paragraph | HIGH. Chapter-index + source_notes §5/§12: Score Watch is sold ($79/entity/yr, LIVE 2026-06-22) but `send-alerts.mjs` delivery is **partial**. This is the single most-flagged operational-status claim in the brief. | Verified honest as written (sold; fulfillment in progress). Do **not** let an edit upgrade this to "automated alerts deliver nightly." Keep the explicit "automated delivery ... still being finished" clause. Confirm the price is intentionally omitted here (it is; full pricing lives in Part VI), or add "$79 per entity per year" only if Part V is meant to carry price. |
| 21.2 | **External citations baseline is zero ("no newsroom has yet cited one in print, no legislature has yet quoted one, no third-party tool beyond the benchmark's own runs on the badge").** | Ch21, honesty-baseline paragraph | HIGH. Sourced (source_notes §10, §12: baseline 0). Must match Ch19.2, Ch22, and Ch23 exactly. | Keep. This is the anchor honesty statement for the Part. Ensure no other chapter implies an existing citation. |
| 21.3 | **Badge endpoint is live; broader data feed is an export today, programmatic interface "planned, not yet shipped."** | Ch21, connective-tissue paragraph | Same as 20.3/20.4. Built badge OK; "export today" needs the same CSV-exists-vs-buildable check. | Reconcile with 20.4 fix. Use identical phrasing across Ch20 and Ch21 once the CSV status is confirmed, to avoid drift. |
| 21.4 | **Community testimony is a "named tier in the evidence hierarchy" that "outranks" an institution's policy documents.** | Ch21, communities paragraph | Sourced (source_notes §3: Tier 3 community testimony ranks above Tier 4 policy/process documents; "evidence beats aspiration"; leadership–community gap resolved in favor of community account). | Accurate. Confirm tier ordering wording matches Appendix B; keep "community testimony outranks the policy document" tied to the Tier 3 > Tier 4 ordering, not overstated as outranking all other evidence. |
| 21.5 | **Newsrooms named by beat ("health care, technology accountability, and public services") rather than by name.** | Ch21, journalist paragraph | Deliberate. source_notes §8 names specific outlets (ProPublica, STAT, The Markup, KFF, Bloomberg) as *target buyers*, not as confirmed citers. Naming them as users would imply a relationship that does not exist. | Keep generic-by-beat. Do not let an edit insert named outlets as actual citers or partners; they are sales targets, not references (baseline citations = 0). |
| 21.6 | **Governments/states/cities are scored "so that public institutions can be held to the same standard as the corporations they regulate."** | Ch21, policymaker paragraph | Sourced (source_notes §6 counts; §2 cross-sector). Framing claim, not a finding. | Acceptable. No named government score appears here (correct; those live in Ch16). Preserve. |

---

## Chapter 23: Measuring Impact

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 23.1 | **All outcome KPI baselines are zero** (external citations 0; third-party badge/API users 0 beyond own; documented entity responses 0). | Ch23, outcome-metrics paragraph and graphic | HIGH. Chapter-index: "All KPIs forward-looking; baseline external citations 0; never present projected ... citations as achieved." Sourced (source_notes §10, §12). | Verified. Keep every outcome metric paired with its "baseline: 0 reported" tag in both prose and the dashboard graphic. This is the chapter's core honesty requirement; do not let an edit drop a baseline. |
| 23.2 | **KPI targets: ~12+ score-change events/yr; 4 quarterly reports/yr; citations 10+ (Yr1) → 25+ (Yr2); badge/API users "a handful" → more; entity responses "a few" → "several times that"; Score Watch subscribers low hundreds → ~500; pipeline uptime 90%+.** | Ch23, output + outcome paragraphs and graphic | Sourced (source_notes §10 headline KPIs). I rendered several as ranges/approximations ("a handful," "a few," "low hundreds") rather than the source's exact figures (5+, 3+→10+, 100+→500+, 15+) to avoid printing precise targets as commitments. | Confirm the soft-worded targets do not understate or overstate the source figures. If the prospectus wants exact numbers for funder accountability, replace approximations with the source_notes §10 figures verbatim (citations 10+/25+; subscribers 100+/500+; badge/API 5+/15+; entity responses 3+/10+; score-change events 12+). Keep all clearly labeled as targets, not actuals. |
| 23.3 | **1,256 entities maintained is a current output/baseline, not a target.** | Ch23, outputs paragraph | Sourced (source_notes §0, §10). The one output metric already achieved; must not be presented as forward-looking. | Confirm 1,256 against the entity-count table (8 indexes). Keep framed as "baseline, not a target." |
| 23.4 | **Nightly pipeline "runs Monday through Saturday," 90%+ uptime target.** | Ch23, outputs paragraph | Sourced (source_notes §5 Mon–Sat ~02:00; §10 uptime 90%+). Uptime is a *target*, not a measured current value. | Keep uptime as a target. Confirm the Mon–Sat cadence wording matches source_notes §5; do not imply a verified historical uptime figure exists yet. |
| 23.5 | **Independence KPIs must read 100% every period (zero pay-for-inclusion; zero material funders tied to scored entities; full disclosure above threshold).** | Ch23, independence-metrics paragraph | Sourced (source_notes §10 non-negotiable independence KPIs; §7 firewall/disclosure). Framed as conditions, not targets. | Accurate and well-framed. Confirm "all funders above the stated threshold" matches the $1,000 public-disclosure threshold (source_notes §7); the chapter keeps it generic, which is fine, but Appendix D/Part VI should carry the exact $1,000 figure. |
| 23.6 | **Impact (behavior change) is "a decade horizon," deliberately not given a Year-1/Year-2 number.** | Ch23, impact paragraph | Sourced (source_notes §9 long-term impact; Ch22 consistency). Guards against the document's biggest overclaim risk. | Keep. Must stay consistent with Ch22's decade-scale framing. No measurable-behavior-change claim anywhere in Part V. |

---

## Top 3 flagged claims (highest priority for the verification pass)

1. **Score Watch operational status (21.1).** Score Watch is sold and live as a product, but automated alert *delivery* is partial (`send-alerts.mjs` incomplete per source_notes §5, §12). The draft states this honestly ("sold today ... automated delivery ... still being finished"); the verification pass must ensure no edit upgrades it to a fully automated, nightly-delivering alert service. This is the operational-status claim the brief singles out.

2. **Zero-baseline impact metrics, stated as zero (21.2 / 23.1).** External citations, third-party badge/API users, and documented entity responses are all zero today; the Year-1/Year-2 figures are targets, not achievements. Every instance across Ch19, Ch21, and Ch23 must keep the explicit zero baseline beside the target, in both prose and the KPI graphic. Dropping a single baseline tag would turn an honest forecast into an overclaim, and this is the Part's highest-sensitivity requirement (chapter-index HIGH; source_notes §10, §12).

3. **"Open methodology" scope and the data-export/API status (20.1 / 20.4 / 21.3).** Verify that every methodology element the draft calls "published in full today" is actually on the public site (v1.2 formula and premium multipliers especially), and resolve the CSV "exists today" vs. source_notes' "buildable now" tension so Ch20 and Ch21 use identical, accurate language. The badge is genuinely built; the programmatic API is planned and must never be presented as available.


## partVI

# Claims to Verify: Part VI Building the Institution (Ch 24-29)

Flagged claims from the six Part VI chapters, for the editorial claims pass. Each row gives the claim, where it appears, why it is flagged, and a suggested fix. Part VI is the operational and funding core, so the highest-risk flags here are **operational-status** claims (is a thing built, in rollout, or aspirational), **legal/financial-certainty** claims (the 501(c)(3), the bylaw, the revenue projections), and **funder-interest** claims (anything that could read as a soft commitment). Chapter 30 is already written and is not re-flagged here.

Status key: **STATUS** = operational-status accuracy (built vs planned vs aspirational); must not overclaim. **LEGAL** = legal/tax claim that is plan or intent, not enacted fact. **FINANCIAL** = projection or model, never booked revenue. **FUNDER** = funder fit/interest; must imply no commitment. **SOURCE-CHECK** = verify a figure/date against the source of truth. **OK-FLAGGED** = handled honestly in-text, listed for completeness.

---

## Highest priority: operational-status, legal, and financial certainty

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 1 | The weekly integrity audit is **designed/partly built but not yet running on its own schedule**; brought to full automation in Months 3–6. | Ch24 (early list), Ch26 (final paragraph), Ch27 (Months 3–6) | This is the single most likely place to overclaim. `source_notes.md` §5 and §12 flag that ORGANIZATION_PLAN §6 wrongly calls it "already operational"; the code is a spec/stub. The prospectus must NOT repeat the source's "already operational" wording. | **STATUS.** Keep the "partial/in-rollout, not yet running" framing exactly as written in all three chapters. Do not import ORGANIZATION_PLAN §6's "already operational" phrasing. Before publication, re-confirm the audit has not since gone live; if it has, update all three spots together. |
| 2 | Score-Watch alert product is **sold but automated delivery is not yet fully built**; reaches reliable automated fulfillment in Months 6–12. | Ch24 (early list), Ch27 (Months 6–12) | `source_notes.md` §5, §12: `send-alerts.mjs` is partial; product is live/sold but fulfillment in progress. Easy to overstate as "operating." | **STATUS.** Retain "sold but automated delivery still being finished." Do not describe alert emails as fully automated today. |
| 3 | The 501(c)(3) is **planned, not yet established**; the supermajority independence bylaw is **drafted intent, not enacted law**; there is no board and no legal entity yet. | Ch26 (legal-layer and board paragraphs), Ch24 (early list), Ch27 (formation path) | The most important legal-certainty flag. `source_notes.md` §9 and chapter-index Ch26 note: 501(c)(3) status is planned. Stating the bylaw as if in force would be a material misrepresentation to funders. | **LEGAL.** Keep the explicit "planned, not yet established" and "drafted intent, not enacted law" statements. The bylaw clause is quoted as intended language; ensure no sentence implies it currently binds anyone. |
| 4 | All revenue figures and prices are a **model and projections, not booked revenue**; no audited financials exist. | Ch28 (caution paragraph + throughout), Ch29 (package sizes) | `source_notes.md` §12: no formal financial statements; all figures recommended prices/projections. Highest financial-certainty risk. | **FINANCIAL.** Keep the standalone caution paragraph in Ch28 and the "projected, not booked" graphic footers in Ch28 and Ch29. Confirm no projected figure is ever stated as achieved or as current revenue. |
| 5 | Annual cost base **~$200k–$330k** (Ch28 headline) vs source ranges of ~$155k–$310k (GRANT_MODEL §7) and ~$115k–$310k / ~$185k–$350k (ORGANIZATION_PLAN §8), reconciled to ~$200k–$330k. | Ch28 (opening line, cost-base section, graphic) | The brief specifies "~$200k–$330k/yr cost base," which matches `source_notes.md` §10 ("research cost base of ~$200k–$330k/yr") but differs from the line-item totals in the two nonprofit docs. | **SOURCE-CHECK / FINANCIAL.** The ~$200k–$330k band is the canonical figure per source_notes §10 and the brief; keep it. Note for the editor: individual line-item ranges in Ch28 are drawn from GRANT_MODEL §7 / ORGANIZATION_PLAN §8 and sum to a slightly wider band; this is acknowledged as a model, not a reconciliation error. |
| 6 | No funder named in Ch29 has committed; packages are **asks mapped to funder fit, not soft commitments**. | Ch29 (Seed/Core/Multi-year packages; "a word on what these numbers are" paragraph) | chapter-index Ch29: "funder interest and adoption likelihood soft-worded; verify ask sizes and deadlines; imply no commitments." Highest funder-certainty risk. | **FUNDER.** Keep the explicit no-commitment paragraph and the graphic footer. Confirm every funder match reads as "stated priorities fit," never as expressed interest. |

---

## Source-check: verify figures, dates, and counts against the source of truth

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 7 | Schmidt Sciences deadline **August 8, 2026**; Fast Forward window **July 30 – September 8, 2026**. | Ch27 (opening + phases), Ch29 (pipeline) | chapter-index Ch27/Ch29 ask to verify these dates. Traces to `source_notes.md` §10 and GRANT_MODEL §2, §6. | **SOURCE-CHECK.** Dates match source. GRANT_MODEL itself flags "verify on each funder's site before committing"; carry that caution. Do not present either as confirmed-open without a pre-publication check. |
| 8 | Nightly cost **~$27.50–$62.50**; per-stage costs/runtimes (scan ~30 min/~$2; assess ~2.25 hr/~$25–60; digest ~5 min/~$0.50); ~$700–$1,600/month. | Ch25 (pipeline stages + graphic), Ch24 ("less than a restaurant dinner") | chapter-index Ch25: "costs and runtimes per source_notes §5." Traces to `source_notes.md` §5 / VPS_SCHEDULING. | **SOURCE-CHECK.** Figures match source. Confirm at copyedit that no stage cost is rounded inconsistently between Ch24, Ch25, and Appendix C. |
| 9 | Change proposal emitted **only when composite would move ≥5 points**; baseline-drift guard refuses at **drift >2.0**. | Ch25 (assessor + score-updater stages) | Traces to `source_notes.md` §5 and Appendix C. Operational thresholds must be exact. | **SOURCE-CHECK.** Confirm the ≥5 proposal threshold and the >2.0 drift guard match Appendix C and the agent specs. |
| 10 | Eight indexes and **1,256 entities** with the per-index breakdown (Countries 193, Fortune 500 448, Global Cities 250, AI Labs 50, Robotics Labs 50, US States 21, US Cities 144, Universities 100). | Ch24 (what exists list) | Must be 1,256, never 1,155; per-index counts must match `source_notes.md` §0. Note: ORGANIZATION_PLAN and GRANT_MODEL still say 1,155 throughout. | **SOURCE-CHECK.** Confirmed against source_notes §0 at drafting. Re-scan that no source-quoted 1,155 leaked into the prose; the prospectus standardizes on 1,256. |
| 11 | Board design: **3–5 independent directors**, majority unrelated, 2-year staggered terms; named seat profiles; separate external methodology advisory board of **3–5**. | Ch26 (board paragraph) | chapter-index Ch26: "Board design and independence bylaw must match ORGANIZATION_PLAN §6 exactly." | **SOURCE-CHECK.** Verified against ORGANIZATION_PLAN §6 at drafting. Re-check the seat profiles and the "founder recuses from independence votes" detail are reproduced faithfully. |
| 12 | Funder firewall rules: no scored entity as material funder; no single funder **>10%**; disclose funders **>$1,000**; reverse due diligence **>$5,000**; core grants unrestricted; "we can criticize our funders." | Ch26 (firewall paragraph), Ch29 (closing paragraph) | Traces to `source_notes.md` §7 and ORGANIZATION_PLAN §6. Thresholds and comparable-source attributions must be exact. | **SOURCE-CHECK.** Confirm each threshold and that the AI Now / TI / Bellingcat / Freedom House attributions are correct (Appendix D carries the full table). |
| 13 | Year-1 grant target **$150k–$300k** from 2–4 funders; SFF $50k–$150k; LTFF $50k–$100k; Schmidt Tier 1 up to $300k + credits. | Ch29 (packages), Ch27 (Months 6–12), Ch28 (grants leg) | chapter-index Ch29: "verify ask sizes." Traces to `source_notes.md` §10 and GRANT_MODEL §3, §7. | **SOURCE-CHECK / FUNDER.** Ask ranges match source. Keep paired with the no-commitment framing (claim 6). |
| 14 | Model C fiscal sponsor as the bridge during the ~3–6 month Form 1023 review; full Form 1023 (not EZ); fiscal-sponsor fee ~5–10%. | Ch27 (Months 0–3), Ch28 (cost base) | Traces to `source_notes.md` §9 and ORGANIZATION_PLAN §5. Verify the Model C characterization and the fee band. | **SOURCE-CHECK.** Confirm Model C re-grant description and the 5–10% fee match ORGANIZATION_PLAN §5 (note: §5 cites 4–10% in one table; Ch28 uses 5–10% per GRANT_MODEL §7). Pick one band consistently at copyedit. |

---

## Two-plane / firewall and pipeline status (built, but precision matters)

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 15 | The two-plane firewall is **built and structural**, enforced by separated credentials and write-protected files, "not policy alone." | Ch25 (architecture paragraph), Ch26 (engineered layer) | `source_notes.md` §5 marks two-plane architecture [BUILT, structural]. This is the strongest "independence is engineered" proof point; it is legitimate to state as current, but the enforcement detail must be accurate. | **OK-FLAGGED / STATUS.** Keep as built. Confirm the enforcement specifics (missing credentials, `chmod a-w`, Worker has no GitHub token) are described accurately and not embellished beyond ARCHITECTURE_MONETIZATION §8. |
| 16 | The nightly pipeline is **built and operating** (scanner → assessor → digest → human-gated score-updater); the fourth stage is human-triggered and never automatic. | Ch24, Ch25 (all four stages), Ch27 | Core credibility claim. `source_notes.md` §5 marks the pipeline [BUILT]. The human gate must always be described as never-automatic. | **OK-FLAGGED / STATUS.** Verified against source_notes §5 and Appendix C. Ensure no sentence implies scores publish without the human gate, and that "automated" never attaches to the score-updater stage. |
| 17 | The certified **Human Assessment Battery is aspirational**, not how the 1,256 public scores are produced. | Ch24 (early list), Ch25 ("still-aspirational pathway"), Ch28 (implicit, earned-revenue certification not claimed live) | style-lock and source_notes §4: automated and certified pathways stay distinct; HAB is aspirational. | **OK-FLAGGED / STATUS.** Confirm no Part VI sentence implies humans hand-assess entities at scale or that certified assessment is an operating service today. |
| 18 | "Less than a restaurant dinner" / "the price of a working dinner a night" as the nightly-cost framing. | Ch24 (opening), Ch25 (opening) | Rhetorical framing of the ~$27.50–$62.50 figure (claim 8); echoes Ch30 ("the cost of a working dinner"). Acceptable, but the literal number must back it. | **OK-FLAGGED.** Keep; it is consistent with Ch30's established phrasing and with the sourced cost. Ensure the literal figure appears nearby so the metaphor is anchored, not floating. |

---

## Forward-looking impact and citations (baseline is zero)

| # | Claim | Where | Why flagged | Suggested fix |
|---|---|---|---|---|
| 19 | Documented outside **citations are zero today**; no institution has visibly changed conduct because of a score; these are the honest baseline, not buried. | Ch24 (what-is-early list), Ch27 (first-citation milestone), Ch29 (Core package targets first citations) | `source_notes.md` §10, §12: baseline external citations 0; KPIs are targets. Must never read as achieved. | **OK-FLAGGED / STATUS.** Keep the explicit "zero to date" baseline in all three places. Confirm every citation/response number is framed as a target, never as a result. |
| 20 | KPI targets (pipeline uptime 90%+, 12+ score-change events/yr, 4 quarterly impact reports, 100+ Score-Watch subscribers, 5+ badge/API integrations, 3+ entity responses). | Ch29 (packages), Ch27 (phases) | Traces to `source_notes.md` §10 / GRANT_MODEL §5. All forward-looking; "list only what the pipeline can track." | **OK-FLAGGED / FINANCIAL.** Keep as Year-1 targets. Confirm none is stated as a current figure and that only pipeline-trackable metrics are committed. |
| 21 | "AI-accountability priority across the field has rarely been higher" as basis for optimism about funder fit. | Ch29 (no-commitment paragraph) | A soft environmental claim used to support funder optimism. Plausible (Current AI, Humanity AI, Schmidt, McGovern 2026 commitments per GRANT_MODEL §4 "Why Now") but not independently cited. | **FUNDER.** Acceptable as soft-worded optimism tied to the no-commitment caveat. If a reviewer wants rigor, anchor to the named 2026 funder commitments in GRANT_MODEL §4 rather than leaving it as a bare assertion. |

---

## Cross-cutting checks (apply to all six chapters)

- **Entity count 1,256**, never 1,155, even when paraphrasing ORGANIZATION_PLAN / GRANT_MODEL (which both still say 1,155).
- **Operational status discipline:** integrity audit = in rollout (not running); Score-Watch delivery = partial; HAB = aspirational; 501(c)(3) + bylaw + board = planned; pipeline + two-plane firewall + indexes + commercial layer = built. Never round any of these up.
- **No booked revenue:** every dollar figure in Ch28 and Ch29 is a model/projection/target, never achieved revenue.
- **No funder commitments implied** anywhere in Ch29 or Ch27.
- **Scoring v1.2 only** where referenced (Ch24 reconstructable-composite claim): base = ((mean − 1)/4)×100, premium cap +10, bands 0–20/.../80–100.
- **No em dashes; "Compassion Benchmark" only.** Confirmed at drafting; re-scan in copyedit.

