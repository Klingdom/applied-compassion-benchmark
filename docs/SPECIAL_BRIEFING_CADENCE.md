# Special Briefing & Flagship Report Cadence (G3.2)

The editorial calendar for the institution's thematic publishing — the "launch moments" that earn citations, traffic, and authority (CPI / Freedom House / V-Dem / OWID model). All produced via the `special-briefing` agent → `research/special-briefings/*.md` → `build-special-briefings.mjs` → `/updates/special`. Interpret-only (no re-scoring); methodology flags → PENDING_CHANGES (SBQ).

## 1. The annual flagship — "The State of Institutional Compassion <YEAR>"
- **Cadence:** once per year (the signature press moment). Inaugural: `state-of-institutional-compassion-2026` (2026-06-16).
- **What it is:** the comprehensive whole-field synthesis across all 7 indexes — the band distribution, the cross-cutting equity finding, the year's deep-dives + applied movement, cross-type comparability, methodology, forward view.
- **Surfacing:** home flagship callout, `/media` press centerpiece, footer "Report" link, print-ready, OG card, cite affordance. *(Founder/ops: a memorable short URL via Nginx redirect; the 72-hr journalist embargo + outreach list.)*
- **Methodology note:** publish with a clear "inaugural baseline / mid-year snapshot" framing until ≥2 years of data support trend claims (SBQ-26).

## 2. Monthly Special Briefings — a standing rotation
- **Cadence:** ~one per month, on a predictable schedule, so the series becomes returnable reading + a citable named finding each month.
- **Standing theme rotation (evidence-driven; pick the month's strongest pattern):**
  - Democratic backsliding / state-of-exception (countries) — track the V-Dem/Freedom House citation windows.
  - AI & robotics governance (labs) — the unique-asset lane; tie to enforcement/regulatory moments.
  - Corporate conduct (Fortune 500) — layoffs, coercive practices, enforcement density.
  - The framework lenses (equity, the middle of the scale, allegation-vs-ruling) — evergreen "how to read the benchmark" reads.
  - Humanitarian / aid-obstruction (cross-index floor) — when the daily cycles cluster.
- **Selection:** the coordinator picks each month's theme from the recurring patterns in the daily briefings + PENDING_CHANGES (the `meta-coordinator`/research-topic scan, e.g. `docs/SPECIAL_BRIEFING_CANDIDATES_*`). Always confirm the topic is distinct from the already-published set.

## 3. Published to date (10)
floor-and-critical · exemplars · ai-governance · layoffs-despite-profits · equity-tax · middle-of-the-scale · what-the-product-is-for · state-of-exception · allegation-indictment-ruling · **state-of-institutional-compassion-2026 (flagship)**

## 4. Runners-up queued for the monthly slot
Aid Obstruction · The Agentic Gap · The Extractive Discount · The Recovery Arc · The Wellbeing Gap (Integrity Delta) — see `docs/SPECIAL_BRIEFING_CANDIDATES_MASTER_2026-06-16.md`.

## Integrity
Every briefing/report interprets the canonical record only; real evidence + verbatim quotes + URLs; no fabrication; independence-first (no entity advantaged). Methodology questions go to the SBQ review queue, never auto-applied.
