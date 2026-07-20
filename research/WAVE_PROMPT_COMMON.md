## STEP 0 — PROBE FIRST (mandatory, your first action)
Run ONE cheap WebSearch. If it errors or is refused, STOP IMMEDIATELY, write NOTHING to disk, and report "ABORTED: no search budget". Do not attempt WebFetch as a substitute.

## CALIBRATION WARNING — verbatim
"Do NOT calibrate to the published rank order; it is corrupt. DO calibrate to the methodology and to published composite values."

## PEER ANCHORS — 17 states assessed at full depth under this methodology
Georgia 26.9 · Iowa 30.6 · Arizona 36.2 · Ohio 38.1 · North Carolina 45.0 · Alaska 47.5 · Oregon 50.6 · Colorado 52.5 · Wisconsin 53.1 · Michigan 53.8 · Delaware 53.8 · Pennsylvania 54.4 · Virginia 55.6 · Maryland 55.6 · New York 56.9 · Illinois 60.0 · New Jersey 60.6

Michigan is 53.8, not 51.9 — 51.9 was a degraded run, superseded. Do not cite it.

IMPORTANT ON RANGE: the observed range so far is 26.9–60.6. This is NOT a cap. If evidence supports a score above 60.6 or below 26.9, score it there and say so. Do not compress toward the observed middle. Equally, do not treat a high published placeholder as a reason to score high.

## SCOPE
All 8 dimensions, all 40 subdimensions. Five-year trajectory 2021–2026, past twelve months weighted most heavily and assessed most granularly.

## CONSTRAINTS
- Do NOT modify site/src/data/indexes/us-states.json. Proposals only.
- Every score backed by dated, cited, verifiable public evidence. No inferred data.
- Verify publication dates against primary sources. Use the publisher's own URL path as date authority, never an aggregator. A known trap: a 2014 article can rank top for a 2026 legal question. Check the year on every citation.
- Where evidence is thin, mark confidence low rather than inventing a number.
- Score the state's OWN conduct, not federal policy imposed on it; note federal interaction where the state exercised discretion.
- Verify the composite by running computeCompositeFromDimensions in site/scripts/lib/scoring.mjs. Never compute by hand. This applies to EVERY figure including sensitivity cases. Put the function output in calibration_note.
- If the composite lands within 1.0 of a band boundary (40/60/80), run sensitivity cases and flag the band as unstable.

## OUTPUTS — exactly three files, all mandatory
1. research/assessments/<SLUG>-2026-07-19.md
2. research/assessments/<SLUG>-2026-07-19.subdims.json — 40 entries, each with code, dimension, name, score, confidence, assessed_date, and evidence[] of {tier, url, date, quote}. ZERO empty evidence arrays. Read and match research/assessments/delaware-2026-07-19.subdims.json exactly.
3. research/change-proposals/<SLUG>-2026-07-19.json — read and match research/change-proposals/north-carolina-2026-07-19.json (a verified wave-3 output). Build PROGRAMMATICALLY from the sidecar, never retyped.

Proposal invariants: index "us-states" · rank null at BOTH top level and inside proposed_scores · rank_note explaining the corrupt 21-of-51 index · status "pending" (NOT "proposed" — prepare-updates.mjs silently skips "proposed") · reviewed_by/reviewed_date/decision all null · proposed_subdimensions all 40 INLINE and byte-identical to the sidecar.

## BEFORE YOU REPORT
Verify on disk: all three files exist, sidecar has 40 entries with zero empty evidence[], subdims roll up to reported dimensions, and `git status --short site/src/data/indexes/us-states.json` is empty. Do not report success on a file you have not confirmed. A previous agent reported a proposal that did not exist.

---

## ADOPTED CROSS-STATE RULE — AB3 Transparency (v3, consolidated 2026-07-19)

Seven independent tests. Three agents proposed refinements; all three are now folded in.

### The rule

**Trigger — BOTH limbs must be met:**

**(a) Structural transparency failure.** Either:
  - a branch of government exempts ITSELF from the public-records law (governor's office, legislature or judiciary claiming blanket or near-blanket exemption), OR
  - the state has curtailed the oversight body itself — narrowing its remit, removing its independence protections, or defunding it. *(Indiana refinement: the original wording covered exemptions carved AROUND a body but not attacks ON the body. HEA 1338, March 2024, narrowed the Public Access Counselor's remit and removed term protection.)*

**(b) Surviving output.** An independently funded oversight body is still publishing damaging, uncompelled findings.

**If both met: cap AB3 at 3** rather than flooring at 2.

### Scope limits

**Not triggered by enumerated exemptions alone** *(Idaho refinement)*. A long list of subject-matter carve-outs — Idaho has 92 — is structurally different from a branch exempting itself. Do not apply the cap merely because a records law has many carve-outs. Ask: has a branch escaped scrutiny, or has the watchdog been attacked?

**Not triggered by procedural weakness alone** *(North Dakota refinement)*. No statutory production deadline, or a discretionary privacy exemption, is a procedural failure. Score it on the merits; do not collapse procedural and structural failures into one cap.

**This is a CAP for the compromised case, not a CEILING for everyone** *(Connecticut refinement)*. Where a state has a genuinely strong records regime, AB3 should score 4 or 5 on the merits. Connecticut — 1975 FOI Act, independent enforcement commission, legislature defeated SB 1226 in 2025 which would have hidden university research records — scored 4. Do not read a conditional cap as a universal ceiling.

**Output contingency** *(Massachusetts rider)*. The cap of 3 holds only while the oversight body is still producing findings. If obstruction, defunding or vacancy has reduced its output to nothing, the floor of 2 returns. A body that exists on paper but publishes nothing does not earn the cap.

### Dispositions so far
- **Applied (cap at 3):** Virginia, Massachusetts, Washington, Missouri, Indiana
- **Declined — precondition not met:** Idaho, North Dakota
- **Declined — counter-case, scored above the cap:** Connecticut (AB3 = 4)

Record your disposition in `cross_state_consistency_flag` with a `scoring_effect` stating the composite both ways.

---

## EVIDENCE DATE PRECISION — MANDATORY

An audit of the first 25 assessments found **20.4% of evidence items dated `YYYY-01-01`** — year-anchored approximations presented with false day-precision. This is a credibility defect in a benchmark whose entire value is verifiability. Do not repeat it.

For every evidence item:
- If you have confirmed the exact publication date from the publisher's own URL path or page, use it.
- If you have NOT confirmed an exact date, do NOT invent one and do NOT default to `-01-01`. Instead set `date` to the most precise value you actually verified (`YYYY-MM` or `YYYY`) and add `"date_precision": "month"` or `"date_precision": "year"` to that evidence item.
- Items with a confirmed exact date need no `date_precision` field (day precision is the default).

A less precise but honest date is worth more than a precise-looking invented one.
