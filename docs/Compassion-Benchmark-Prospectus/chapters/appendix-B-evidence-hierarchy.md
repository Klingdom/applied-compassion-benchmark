# Appendix B: Evidence Hierarchy

Not all evidence is equal. A regulatory finding and a press release can describe the same institution and point in opposite directions. Compassion Benchmark sorts every input into one of five tiers, strongest to weakest, under one rule above all others: strong scores require stronger evidence.

The five tiers below are canonical. The governing interpretation rule, evidence beats aspiration, sits underneath all of them: where paper claims and lived experience diverge, the assessor scores the world as encountered, not the story as presented.

---

## The five tiers

**Tier 1: Independent external audit (strongest).** Assessment produced by a party with no stake in the result: third-party audits, regulatory findings, and academic studies. This is the only tier that can confirm the top anchors without corroboration from a lower tier.

**Tier 2: Verifiable outcome data.** Measured results that can be checked against a defined population: disaggregated service data, longitudinal surveys, and resolution rates. Outcomes, not intentions.

**Tier 3: Community testimony.** The account of the people the institution is responsible for: testimony from affected populations, independent focus groups, and structured interviews. Where leadership narrative and community testimony conflict, the community account is the primary reference point.

**Tier 4: Policy and process documents.** Evidence that a practice is written down and resourced, though not yet that it works: governing documents, training records, and budget allocations.

**Tier 5: Entity self-report (weakest).** What the institution says about itself: mission statements and annual reports. Self-report requires corroboration from a higher tier before it can move a score upward. Mission statements are not evidence.

---

## How evidence tier affects scoring confidence

- **Strong scores require stronger evidence.** The higher anchors (Established and Exemplary, levels 4 and 5) cannot be reached on self-report alone. A 4 or 5 recorded without pressure-tested evidence is flagged provisional and routed to lead-assessor review (see Appendix C).
- **Community testimony outranks leadership narrative.** A favorable account from leadership that conflicts with Tier 3 community testimony does not stand; the conflict is resolved with the community account as the reference point.
- **Confidence is published, not hidden.** Entities are assigned a confidence flag based on how complete the evidentiary record is. In the universities index this is published per entity as High, Medium, or Low, and a Low-confidence score is published with an explicit caveat. [VERIFY] Whether the High / Medium / Low confidence flag is applied uniformly across all eight indexes, or only where implemented so far, is not fully specified in `source_notes.md`.
- **Adverse evidence can change the evidence tier without changing the score.** For an entity already at or near the floor, new unadjudicated adverse evidence is logged as an evidence-tier upgrade rather than a composite move, because there is no scorable room left to fall. The documented case is UnitedHealth Group at 10.2 Critical, where a Department of Justice probe expansion was logged as a tier upgrade with no change to the composite.
- **Evidence has a lifespan, and the scan window is not it.** The 14-day window is the scan cadence, not the age limit of the evidence base: baseline scores draw on a multi-year record. Adjudicated findings such as court rulings persist until superseded; uncorroborated allegations decay and cannot accumulate into a score change on their own. Because desk research over-reports adverse events, assessors must actively search for structural positive evidence: outcome data acted upon, audits followed by correction, durable equity infrastructure, worker-voice gains, and commitments held at real cost.

---

## Items not fully specified in `source_notes.md` (flagged for verification)

- **[VERIFY] Precise numeric weighting per tier.** `source_notes.md` states the rank order and the rule that stronger scores require stronger evidence, and the chapter-index references tier "weights," but no explicit per-tier numeric weight is given in the source. Describe the tiers as a ranked hierarchy; do not publish a specific weight value per tier until confirmed against the methodology source.
- **[VERIFY] A formal tier-to-confidence mapping.** The relationship between evidence tier and the published confidence flag is described qualitatively (stronger evidence supports higher and more confident scores; thin evidence yields a Low flag). A precise rule mapping a given tier or mix of tiers to a specific confidence level is not specified in `source_notes.md`.
- **[VERIFY] Whether a 0 Active Harm rating has its own evidence-tier requirement.** Appendix C notes that any subdimension scored 0 requires written documentation and a lead-assessor co-sign. The minimum evidence tier required to record active harm is not stated explicitly in `source_notes.md`.

Source of truth: `source_notes.md` §3 (five tiers, evidence-beats-aspiration rule) and §4 (review flags, near-floor limitation, evidence recency and decay). Legacy origin: `legacy-html/methodology.html` evidence hierarchy.
