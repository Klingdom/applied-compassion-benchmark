---
entity: "Unitree Robotics"
type: "Company"
sector: "Robotics (humanoid and quadruped platforms)"
date: "2026-09-18"
composite_score: null
band: null
published_index: "robotics-labs"
published_rank: 42
published_composite: 35.9
published_band: "developing"
published_dimensions:
  AWR: 2.5
  EMP: 2.5
  ACT: 2.5
  EQU: 2
  BND: 2.5
  ACC: 2.5
  SYS: 2.5
  INT: 2.5
assessed_composite: null
score_delta: null
band_change: false
filing_trigger_met: false
outcome: "screened-not-assessed"
recommendation: "flag-for-review"
change_proposal: false
confidence: null
subdim_sidecar: false
watch_flag: true
calibration_flag: "35.9 seed-cluster placeholder; identical dimension vector to Dayton in us-cities. An APPROVED but UNAPPLIED proposal (35.9 to 24.4) sits on this row — RISK-002 class."
source: "priority"
scan_file: "research/scans/2026-09-18.json"
grid_only_composite: 33.7
math_hygiene_reconstruction_diff: 0
---

# Compassion Benchmark Screening Note: Unitree Robotics

**Entity type:** Company
**Sector/Domain:** Robotics (humanoid and quadruped platforms)
**Screening date:** 2026-09-18
**Outcome:** SCREENING NOTE ONLY. No score assessed, no subdimension sidecar written, no change proposal filed.
**Published score:** 35.9/100 (Developing, rank 42 of 92) — unchanged.

## Why this entity was screened rather than assessed

The scanner flagged Unitree Robotics (priority 40, T2) because a Unitree humanoid robot under test in Shaoxing, Zhejiang province on 7 September 2026 launched two jumping kicks toward its engineer, knocking a remote controller out of his hand. Nobody was hurt. The security-camera clip went viral and reopened debate about humanoid-robot safety standards.

The assessment task noted this is likely not material to the instrument and that a screening note is an acceptable outcome. On examination it is not material, and there is a second, more important reason not to touch this row tonight.

## The material-relevance test

**WHAT ACTUALLY HAPPENED.** Reporting is consistent that the motion was deliberate, not a malfunction of intent: "the move was actually programmed and triggered by the engineer, not a random act of rebellion." Unitree's humanoid platforms are explicitly built to demonstrate combat-capable leg motion as a technical showcase. The engineer stepped clear of a second kick, retrieved the controller and left the area. No injury occurred. Developers attributed the controller strike to a control-loop feedback failure or motion-sensor miscalibration.

**WHY IT DOES NOT REACH THE INSTRUMENT.** There is no suffering to detect, no harmed party, no complaint, no regulator, no claim and no fatality. A hardware test behaved unexpectedly inside a lab, during a test of exactly that motion class, and a controller fell on the floor. Nothing in the 40 subdimensions is about that. Scoring it would require treating a near-miss in a test rig as institutional conduct toward a person in need.

**WHAT WOULD HAVE MADE IT SCORABLE.** An injury; a regulator's finding; a worker complaint; evidence that the test distance breached Unitree's own protocol; or a company statement denying a harm that occurred. None was located. Unitree issued no located safety statement at all, which is itself a small negative signal but not one that can carry a score change on its own.

**THE SECTOR CONTEXT IS NOT ENTITY CONDUCT.** The scan's own sector alert places this in a 2026 pattern of humanoid-robot incidents (a Chengdu spectator collision, a Shenzhen stage fall, a Tesla Fremont workplace-injury lawsuit) alongside a late-July 2026 Federal Communications Commission rule extending restrictions to foreign-made humanoid and quadruped robots, and a continuing absence of binding humanoid-specific safety standards. That is a real industry-wide finding. It belongs in a sector study, not on one company's row, and other companies' incidents are certainly not Unitree's conduct.

## The decisive reason not to touch this row: an approved, unapplied proposal

`research/change-proposals/unitree-robotics.json` carries **`status: "approved"`** with **`recommendation: "flag-for-review"`**, proposing 35.9 down to 24.4. It has been approved and has **not** been applied. This is the RISK-002 class described in `RISKS.md`: approved proposals held rather than applied, several on explicit assessor self-veto language.

Writing a fresh assessment of this row tonight would either duplicate that approved-but-unapplied judgement or, worse, produce a third number for the same row on non-material evidence. Neither is acceptable. The correct action is to leave the approved proposal untouched and flag that it is still unapplied.

**BASELINE PROVENANCE (read first).** Published 35.9 (Developing, rank 42) has never moved. The vector is seven dimensions at exactly 2.5 with Equity at 2.0 — and it is byte-identical to Dayton's vector in the us-cities index, which confirms 35.9 is a seed-cluster placeholder. Three prior Unitree assessments exist (2026-06-08, 2026-07-26, 2026-07-29, 2026-08-17) and the approved proposal derives from that work. The published number is a placeholder that the benchmark's own approved judgement has already superseded internally. No stale-baseline argument is used, because the fix is an apply, not a re-assessment.

**DIRECTIONALITY.** Unitree surfaced on negative evidence that is not material. No move in either direction was made.

## What is not stamped

No report scoring the 40 subdimensions was produced, so `last_assessed` is **not** stamped for Unitree Robotics in `research/rotation-state.json`, and `last_change_proposal` is not touched. This follows the 2026-09-17 handling of Boston Dynamics (SPOT demo).

## Key findings

- Unitree Robotics' published score of 35.9 out of 100 is untouched. No score was measured.
- A Unitree humanoid kicked a controller out of an engineer's hand in a Shaoxing lab on 7 September 2026. Reporting agrees the kick was programmed and triggered by the engineer. No one was hurt.
- There is no harmed person, no complaint and no regulator here. A test rig did something unexpected during a test of that exact motion. The benchmark does not score that.
- The row already carries an approved proposal to cut it from 35.9 to 24.4 that has never been applied. Writing a new number tonight would create a third figure for one company.
- The wider humanoid-safety problem is real — 2026 has seen several incidents and there are still no binding humanoid-specific safety standards. That belongs in a sector study, not on this one row.

## Scanner and source corrections

- The scan says the robot "suddenly launched two jumping kicks at its engineer." Sources state the motion sequence was programmed and triggered by the engineer himself. "Suddenly" overstates the autonomy of the act, and that distinction is the whole reason this is not scorable.
- The scan's sources are chinatechnews.com and gadgetreview.com, both low-tier. No tier 3 or better source on this incident was located.
- The scan's evidence_date of 2026-09-07 is the incident date; the chinatechnews URL date of 2026-09-18 is a publication date. Both are in window.

## Watch flag

Two separate triggers. First, and more important: the approved, unapplied proposal (35.9 to 24.4) needs a founder or coordinator decision to apply or retire — it is not an assessment question. Second: re-flag Unitree on an injury, a regulator finding, or a binding humanoid safety standard it fails to meet.

## Sources

- ChinaTechNews — 2026-09-18 — tier 1 — https://www.chinatechnews.com/2026/09/18/129376-humanoid-robot-kicks-remote-from-engineers-hand-during-china-test
- Gadget Review — 2026-09-15 — tier 1 — https://www.gadgetreview.com/unitree-robot-kicks-remote-from-engineers-hand-in-shaoxing-lab-test
- NewsBytes — 2026-09-15 — tier 1 — https://www.newsbytesapp.com/news/science/shaoxing-robot-kicks-remote-during-test-engineer-programmed-and-triggered/tldr
- OECD AI Incidents Monitor (sector context) — 2026-02-05 — tier 4 — https://oecd.ai/en/incidents/2026-02-05-f85d

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
