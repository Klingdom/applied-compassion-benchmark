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
