---
entity: "Democratic Republic of the Congo"
type: "Country"
sector: "Government (national)"
date: "2026-09-24"
assessment_type: "screening-note"
composite_score: null
band: null
published_index: "countries"
published_rank: 179
published_composite: 2.3
published_band: "critical"
assessed_composite: null
score_delta: null
band_change: false
filing_trigger_met: false
outcome: "corroborates-existing"
recommendation: "confirm"
change_proposal: false
subdim_sidecar: false
last_assessed_stamped: false
double_count_risk: "Same crackdown already assessed 2026-09-17 (measured 3.1, confirmed, floor-limited)"
misdated_claim_found: true
ledger_additions_recommended:
  - id: "drc-ffm-war-crimes-report"
    true_date: "2025-09-16"
  - id: "drc-81000-rapes-jan-sep"
    true_date: "2025-10"
watch_flag: true
source: "priority"
scan_file: "research/scans/2026-09-24.json"
math_hygiene_reconstruction_diff: 0
---

# Screening Note: Democratic Republic of the Congo

**Assessment date:** 2026-09-24
**Outcome:** corroborates existing score. No proposal. **One misdated claim identified.**
**Published:** 2.3/100, Critical, rank #179 of 191 countries. Canonical reconstruction returns 2.3 exactly — no math-hygiene issue.

## Why this row was re-screened seven days after its last assessment

The coordinator flagged that the DR Congo entry carried something the 2026-09-17 assessment did not cover: a **UN Fact-Finding Mission war-crimes report**, described in the scan as tier 4 and as presented "in September." The instruction was to distinguish the new evidence from the already-scored event.

**The distinction turns out to be that there is no new evidence. The UN Fact-Finding Mission item is a year-stale claim.**

## Finding 1: the UN Fact-Finding Mission report is from September 2025, not September 2026

The claim as the scan states it is that the UN human rights chief presented, in September, the final Fact-Finding Mission report finding grave violations by all parties that may constitute war crimes and crimes against humanity.

Verification:

- The OHCHR press release announcing that finding — "DRC: UN report raises spectre of war crimes and crimes against humanity in North and South Kivu" — carries a **2025/09** path component: `https://www.ohchr.org/en/press-releases/2025/09/...`
- JURIST reported the same finding under a **2025/09** path: `https://www.jurist.org/news/2025/09/un-report-finds-war-crimes-and-crimes-against-humanity-in-eastern-drc-conflict/`
- The report is the OHCHR Fact-Finding Mission report on North and South Kivu, submitted to the Human Rights Council in **September 2025** (document A/HRC/60/80, advance unedited version).
- The Commission of Inquiry that continued the Fact-Finding Mission's work is mandated to deliver its comprehensive report to the Human Rights Council's **sixty-fourth session (February–April 2027)**. At HRC63 in September 2026 the Commission gave an **oral update** in an enhanced interactive dialogue — not a final report, and not a new war-crimes finding.

**True date: 2025-09-16 (report presentation). Recommend ledger addition `drc-ffm-war-crimes-report`.**

## Finding 2: the 81,000-rapes figure is also a 2025 figure, and its comparison year confirms it

The scan states "81,000+ rapes documented January-September (a 31.5% year-on-year increase)." The figure traces to UN reporting that more than 81,000 rapes occurred in eastern DRC between January and September, **an increase of 31.5% compared with the same period in 2024** (UN News, `https://news.un.org/en/story/2025/10/1166150`, October 2025 path).

A figure whose comparison baseline is 2024 is a 2025 figure. It cannot be a January-to-September 2026 count.

**True date: October 2025 (publication), covering January–September 2025. Recommend ledger addition `drc-81000-rapes-jan-sep`.**

This is the same failure mode the scan's own sector alert describes: a genuine, severe, well-sourced atrocity finding resurfacing one year later with the year silently advanced. The severity of the underlying facts is not in question. Their date is.

## Finding 3: the only in-window DRC evidence is the crackdown, and it is already scored

The two source URLs the scan actually attaches to this entity are both about the 15 September 2026 protest crackdown — the same Al Jazeera and EWN items assessed on 2026-09-17. Neither mentions the Fact-Finding Mission. **No source URL supporting the Fact-Finding Mission claim was provided by the scan, and none dated inside the window was located.**

The 2026-09-17 assessment measured DR Congo at 3.1, confirmed the published 2.3, and recorded the floor limitation: Empathy, Action, Equity and Boundaries are at raw 1.0, the crackdown attaches to subdimensions already at 1, and a -5 magnitude trigger is unreachable from 2.3.

## Disposition

**Corroborates existing. No proposal, and no re-score.** Running a second assessment of the same crackdown seven days later would produce a second record of one event. The published 2.3 stands.

If the September 2025 Fact-Finding Mission finding is not already reflected in the DR Congo profile, that is a question for a scheduled reassessment using correctly dated evidence — not for this cycle, and not on a claim whose date the scan got wrong by a year.

`last_assessed` is **not** stamped: the 2026-09-17 date remains correct, and stamping 2026-09-24 would falsely suggest a scored assessment ran on evidence that does not exist.

## Sources

- OHCHR, war crimes and crimes against humanity in North and South Kivu — **2025-09** — tier 4 — https://www.ohchr.org/en/press-releases/2025/09/drc-un-report-raises-spectre-war-crimes-and-crimes-against-humanity-north
- JURIST — **2025-09** — tier 2 — https://www.jurist.org/news/2025/09/un-report-finds-war-crimes-and-crimes-against-humanity-in-eastern-drc-conflict/
- OHCHR Fact-Finding Mission report (advance unedited version, A/HRC/60/80) — tier 4 — https://www.ohchr.org/en/documents/country-reports/report-ohchr-fact-finding-mission-situation-north-and-south-kivu
- OHCHR Commission of Inquiry on North and South Kivu (mandate and reporting schedule) — tier 4 — https://www.ohchr.org/en/hr-bodies/hrc/coi-drc/index
- UN News, 81,000 rapes figure — **2025-10** — tier 4 — https://news.un.org/en/story/2025/10/1166150
- In-window crackdown (already scored): https://www.aljazeera.com/news/2026/9/15/police-crack-down-on-protests-against-constitutional-change-in-dr-congo
- Prior assessment: `research/assessments/democratic-republic-of-c-2026-09-17.md`

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
