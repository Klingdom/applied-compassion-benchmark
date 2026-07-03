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
