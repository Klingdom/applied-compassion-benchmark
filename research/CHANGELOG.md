# Compassion Benchmark Change Log

Canonical record of all published score changes by date applied.

---

## 2026-05-19 (Site change — no score changes applied)

**Change:** /updates page redesign — best-in-class daily briefing layout.

**Why:** Founder directive to reorder sections (Opening Question + Today's Analysis near top; Score Change Detail after Signal Stack; Evidence Ledger / Sector Findings / Risk Signals toward bottom), replace closing diagnostic question with an evidence-grounded daily opening question, and enrich Score Movement cards so they carry useful per-entity context.

**Impact:**
- Reader scan-path now leads with the day's framing question and synthesis, then drills through signals → detail → evidence → forward-looking risk
- Score Movement cards gain 5 optional enrichment fields (whyHeadline, dominantDimension, primaryEvidenceUrl, distanceToBoundary, nextForwardSignal) — all backward-compatible
- overnight-digest agent definition updated to populate the new fields starting with the May 19 cycle
- Older briefings (April 2026, early May) continue to render unchanged

**Status:** Implementation complete, build clean, QA verdict PASS. No published score changes this entry — site change only.

See `research/ITERATION_LOG.md → Loop 2026-05-19` for the full record.

---

## 2026-05-18

Cycle type: Priority + Rotation — Band Crossing (Human Review Required)
Proposals from: 2026-05-18 (11 proposals: 1 apply=true pending human review, 1 sub-threshold documented, 9 confirmations)
Score-updater note: No changes committed to index files this cycle. China apply=true is held pending founder review of band-crossing decision.

### Score Changes — Pending Human Review (NOT YET APPLIED)

| Entity | Index | Old Score | New Score | Delta | Old Band | New Band | Confidence | Proposal File |
|--------|-------|-----------|-----------|-------|----------|----------|------------|---------------|
| **China** | countries | 20.3 | **19.5** | **-0.8** | developing | **critical** | Medium | china-2026-05-18.json |

**HUMAN REVIEW REQUIRED before applying China.** The band crossing from Developing → Critical rests on a single BND quarter-step dock (2.0 → 1.75) for `state-facilitation-of-allied-war-crimes-via-dual-use-supply` — a methodology category not yet formalized in v1.2. Apply=true was set by the band-crossing protocol (any band crossing triggers apply regardless of delta size). Delta of -0.8 is sub-threshold on its own; the band crossing is the override mechanism.

**Evidence base:** EU 20th sanctions package (April 23, 2026) — first-ever EU sanctions designating 16 Chinese entities for providing dual-use goods to Russia's military-industrial complex. Xi publicly reassured Putin of continued Chinese support on the eve of the May 19-20 Beijing summit. China supplies approximately 90% of Russia's dual-use drone technology. KSL Deyang (Chinese-owned, Chinese crew, Marshall Islands flag) struck by Russian drone in the Black Sea 24-48 hours before Putin's arrival in Beijing.

**Option A (Approve):** Apply 19.5 (Critical) to countries.json; formally accept `state-facilitation-of-allied-war-crimes-via-dual-use-supply` as new Tier-3 BND sub-anchor; sets precedent for EU sanctions designations scoring at country level via BND dimension.

**Option B (Reject):** Confirm at 20.3 (Developing); escalate boundary watch to CRITICAL; reassess within 48 hours after Xi-Putin joint statement published (May 19-20).

### Sub-Threshold Documented (Not Applied)

| Entity | Index | Published | Assessed | Delta | Category | Notes |
|--------|-------|-----------|----------|-------|----------|-------|
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | hold-lifted-sub-threshold | Musk v. Altman verdict (statute of limitations, under 2 hours). ACC -0.1 offset INT +0.1. Net 0. Hold lifted. |

### Hold Lifted This Cycle

- **OpenAI** — Musk v. Altman jury returned unanimous verdict May 18 in under 2 hours. Statute-of-limitations grounds. PBC conversion permanent. Altman and Brockman remain. Microsoft 27% stake and $38B revenue-share cap confirmed. Azure exclusivity dropped. IPO at ~$1T cleared. Hold expiry advanced from May 21 to May 18 (verdict arrived 3 days early). Assessment completed May 18; score unchanged at 27.5.

### Floor Confirmations Logged (No Score Change)

| Entity | Index | Composite | New Conduct Documentation | Proposal File |
|--------|-------|-----------|--------------------------|---------------|
| Russia | countries | 0.0 | Day 5 of post-ceasefire policy-arc; 524-drone single-night package (LARGEST of May arc); NEW: `third-country-vessel-strike-during-declared-targeting` (KSL Deyang, Chinese-owned, Marshall Islands flag, Black Sea) | russia-2026-05-18.json |
| Israel | countries | 0.0 | Pattern-continuation; cumulative 75,811+ confirmed deaths; aid at 50% offload rate; Amnesty high-rise war-crimes investigation published May 2026 | israel-2026-05-18.json |

### Rotation Confirmations Logged (No Score Change)

| Entity | Index | Composite | Type | Proposal File |
|--------|-------|-----------|------|---------------|
| Ukraine | countries | 50.0 | Carry-forward confirmed; day 5 asymmetric-conduct arc; largest-ever Ukraine long-range drone strike (oil refinery near Moscow); NEW: `asymmetric-conduct-energy-infrastructure-targeting-sub-anchor` | ukraine-2026-05-18.json |
| Hungary | countries | 41.4 | Carry-forward confirmed; BOUNDARY CASE (0.4pt above 40/41); EPPO accession committed; end-of-May reform deadline; math-hygiene drift 1.57pt flagged | hungary-2026-05-18.json |
| Oracle | fortune-500 | 20.6 | Rotation confirmed; BOUNDARY CASE (0.6pt above 20/21); WARN Act class action ongoing | oracle-2026-05-18.json |
| Vanuatu | countries | 35.9 | Rotation confirmed; baseline corrected (scanner labeled null; verified 35.9); pre-UNGA vote window | vanuatu-2026-05-18.json |
| Marshall Islands | countries | 39.1 | Rotation confirmed; BOUNDARY CASE (1.9pt below 40/41); UNGA co-sponsor; KSL Deyang flag-state | marshall-islands-2026-05-18.json |
| Microsoft | fortune-500 | 65.3 | Rotation confirmed; Musk v. Altman verdict cleared as named defendant; 27% OpenAI stake secure | microsoft-2026-05-18.json |
| Ethiopia | countries | 4.7 | Rotation confirmed; South Sudan Akobo spillover: 100,000 displaced into Ethiopia | ethiopia-2026-05-18.json |

### New Methodology Category Candidates (v1.3)

| Category | Entity | Dimension | Tier | Status |
|----------|--------|-----------|------|--------|
| `state-facilitation-of-allied-war-crimes-via-dual-use-supply` | China | BND | Tier-3 | REVIEW REQUIRED — sole basis for China band crossing |
| `third-country-vessel-strike-during-declared-targeting` | Russia | BND | Tier-4 | Candidate |
| `for-profit-IPO-path-cleared-post-litigation-procedural-verdict` | OpenAI | ACC | Tier-3 | Candidate |
| `asymmetric-conduct-energy-infrastructure-targeting-sub-anchor` | Ukraine | ACT | Tier-3 | Candidate |

### Baseline Corrections Applied by Assessor

| Entity | Scanner Value | Verified Value | Source |
|--------|--------------|----------------|--------|
| OpenAI | 38.8 (stale April 18) | 27.5 | ai-labs.json line 805 |
| Vanuatu | null / never-assessed | 35.9 | countries.json line 1878 |

### Math-Hygiene Flags Raised

| Entity | Drift | Detail |
|--------|-------|--------|
| Hungary | +1.57pt (derived > stored) | Dimensional-derived 42.97 vs stored 41.4. Reconciliation candidate if upgrade approved. |
| Open Bionics | -10.0pt | Formula audit CRITICAL BLOCKING — now 15 cycles open. No changes applied. |

### Skipped (Not Assessed)

| Entity | Index | Reason |
|--------|-------|--------|
| Open Bionics | robotics-labs | Formula audit CRITICAL BLOCKING — 15 cycles open (incremented from 14) |
| Tesla | fortune-500 | Not in fortune-500.json — index-presence issue; evidence package accumulated |
| Meta-AI | ai-labs | Carry-forward from May 15 (26.3); no materially new May 18 event |



## 2026-05-14

Applied by: score-updater agent (manual trigger by founder)
Proposals from: 2026-05-12, 2026-05-13, 2026-05-14

### Score Changes

| Entity | Index | Old Score | New Score | Delta | Old Rank | New Rank | Old Band | New Band | Proposal File |
|--------|-------|-----------|-----------|-------|----------|----------|----------|----------|---------------|
| Pakistan | countries | 20.3 | 17.2 | -3.1 | 150 | 156 | developing | critical | pakistan-2026-05-12.json |
| Hungary | countries | 37.5 | 41.4 | +3.9 | 76 | 66 | developing | functional | hungary-2026-05-13.json |
| India | countries | 34.4 | 30.5 | -3.9 | 111 | 121 | developing | developing | india-2026-05-14.json |
| Senegal | countries | 37.5 | 33.6 | -3.9 | 71 | 115 | developing | developing | senegal-2026-05-14.json |
| Democratic Republic of C | countries | 4.4 | 2.3 | -2.1 | 180 | 181 | critical | critical | democratic-republic-of-congo-2026-05-14.json |
| Nigeria | countries | 23.4 | 21.9 | -1.5 | 135 | 138 | developing | developing | nigeria-2026-05-14.json |
| CVS Health | fortune-500 | 31.9 | 25.6 | -6.3 | 308 | 322 | developing | developing | cvs-health-2026-05-12.json |
| UnitedHealth Group | fortune-500 | 10.9 | 11.4 | +0.5 | 446 | 445 | critical | critical | unitedhealth-group-2026-05-14.json |

### Dimension Changes Applied

**Pakistan** (countries, May 12 proposal, conservative math applied):
- AWR: 2.0 → 1.875 | EMP: 2.0 → 1.875 | ACT: 2.0 → 1.875 | EQU: 1.5 → 1.375
- BND: 2.0 → 1.875 | ACC: 1.5 → 1.375 | SYS: 2.0 → 1.875 | INT: 1.5 → 1.375
- Evidence: HRCP 2025 annual report (273+ enforced disappearances); 531,700 Afghans expelled; Ahmadi religious-minority killings; GBV scale 145/148 gender gap; Genocide Watch active

**Hungary** (countries, May 13 proposal, boundary case 0.4 above Functional floor):
- AWR: 2.5 unchanged | EMP: 2.5 unchanged | ACT: 2.5 → 3.0 | EQU: 2.0 unchanged
- BND: 3.0 unchanged | ACC: 2.5 → 3.0 | SYS: 3.0 → 3.25 | INT: 2.0 → 2.5
- Evidence: 16-minister cabinet sworn May 12; first cabinet meeting May 13; audit of ministries ordered; payment/commitment suspension ordered; drought emergency response enacted; ICC arrest-warrant enforcement reversal sustained

**India** (countries, May 14 proposal):
- EQU: 2.0 → 1.5 | ACC: 2.5 → 2.0 | SYS: 2.5 → 2.25 | all others unchanged
- Evidence: Transgender Amendment Bill signed March 2026 (removes 2014 NALSA right); HRW online censorship expansion April 17; May 9 Nagpur speech arrest; Fortify Rights: 36 Rohingya survivors of May 2025 Navy forced-into-sea deportation with no accountability

**Senegal** (countries, May 14 proposal, second consecutive downgrade):
- EMP: 2.5 → 2.0 | ACT: 3.0 → 2.5 | EQU: 1.5 → 1.25 | ACC: 2.0 → 1.75 | all others unchanged
- Evidence: 25.6% HIV treatment attendance drop in one month; 70+ arrested under Article 319; 24 charged with 'voluntary HIV transmission' including people with undetectable viral loads; first 6-year conviction April 10 2026; UNAIDS condemnation

**Democratic Republic of Congo** (countries, May 14 proposal):
- EMP: 1.125 → 1.0 | ACT: 1.25 → 1.1 | BND: 1.25 → 1.1 | ACC: 1.125 → 1.1 | SYS: 1.25 → 1.1 | INT: 1.25 → 1.2
- Evidence: Amnesty International May 5 '71 interviews' primary source (ADF war crimes: civilian massacres, abductions, forced labor, child recruitment, sexual violence); 26.5M food insecure; 9M expected displaced by end-2026

**Nigeria** (countries, May 14 proposal, BOUNDARY CASE, user explicitly approved):
- EMP: 2.0 → 1.75 | SYS: 2.0 → 1.75 | all others unchanged
- Composite 21.9 sits 0.9pts above critical-developing threshold (21.0). Boundary watch active through June 2026.
- Evidence: Nigeria has world's highest projected number of acutely food-insecure people (35M); 26% YoY lean-season worsening; The New Humanitarian 'state dysfunction' analysis

**CVS Health** (fortune-500, May 12 proposal, precise math applied):
- AWR: 2.3 → 2.1 | EMP: 2.3 → 2.1 | ACT: 2.5 → 2.25 | EQU: 2.0 → 1.75
- BND: 2.3 → 2.0 | ACC: 2.0 → 1.75 | SYS: 2.5 → 2.25 | INT: 2.3 → 2.0
- Note: Proposal reported -4.4 conservative; precise math yields -6.3 (25.6 composite). Precise math applied per proposal's materiality_decision field.
- Evidence: House Judiciary Committee antitrust finding; $615M federal overbilling (2018-2021); HIPAA probe (patient data for lobbying); $1.3M anti-reform TV ads

**UnitedHealth Group** (fortune-500, May 14 proposal applied as most recent):
- INT: 1.5 → 1.625 | all others unchanged
- May 12 proposal (10.9 → 7.5) superseded by May 14 (most-recent-proposal rule). Net result: 11.4 critical.
- Evidence: Optum Rx transparent fee-based pricing model (May 13) — first proactive transparency reform; DOJ probe extended to Optum Rx and physician reimbursement; court-ordered AI denial-algorithm disclosure

### Boundary Cases Applied (explicit user approval)

- Hungary 41.4: 0.4 above Functional floor (41.0). Band crossing to functional applied per user approval. Conservative scoring; full math reconstruction gives 43.0 — pinned at 41.4 for analytical conservatism.
- Nigeria 21.9: 0.9 above Critical threshold (21.0). Boundary case applied per explicit user approval. Developing band sustained. Lean-season watch active May-October.

### Floor Confirmations Logged (no score change)

| Entity | Index | Composite | New Conduct Category | Proposal File |
|--------|-------|-----------|---------------------|---------------|
| xAI | ai-labs | 0.0 | compound-governance-failure-cluster-with-partial-external-accountability-reversal | xai-2026-05-14.json |
| Russia | countries | 0.0 | bad-faith-ceasefire-format-compound-with-large-scale-escalation (5-phase; May 14 = largest single-day strike package) | russia-2026-05-14.json |
| Myanmar | countries | 0.0 | floor-conduct-with-bad-faith-peace-plan-rhetoric | myanmar-2026-05-14.json |
| Sudan | countries | 0.0 | floor-conduct-with-survival-infrastructure-targeting-and-geographic-spread | sudan-2026-05-14.json |
| South Sudan | countries | 0.0 | floor-conduct-with-famine-trajectory-and-aid-withdrawal-amplification | south-sudan-2026-05-14.json |
| Israel | countries | 0.0 | floor-conduct-with-coercive-diplomacy-ceasefire-fraying | israel-2026-05-14.json |

### Rotation Confirmations Logged (no score change)

| Entity | Index | Composite | Type | Proposal File |
|--------|-------|-----------|------|---------------|
| Andorra | countries | 62.5 | First baseline confirmed | andorra-2026-05-12.json |
| Botswana | countries | 67.5 | First baseline confirmed | botswana-2026-05-12.json |
| General Motors | fortune-500 | 40.6 | Confirmed; boundary watch active 0.6 above Functional floor | general-motors-2026-05-12.json |
| Johnson & Johnson | fortune-500 | 27.5 | Confirmed; 67,623 active talc suits | johnson-amp-johnson-2026-05-12.json |
| Walmart | fortune-500 | 28.9 | Confirmed | walmart-2026-05-12.json |
| Cambodia | countries | 12.5 | First baseline confirmed | cambodia-2026-05-13.json |
| Agility Robotics | robotics-labs | 60.9 | Confirmed; Toyota Canada deployment active | agility-robotics-2026-05-13.json |

### Notable Rank Shifts (>5 positions)

| Entity | Old Rank | New Rank | Shift | Direction | Note |
|--------|----------|----------|-------|-----------|------|
| Senegal | 71 | 115 | 44 | Down | MAJOR — reflects May 9 band-crossing setting 37.5 baseline, now second downgrade to 33.6 |
| Hungary | 76 | 66 | 10 | Up | Band crossing to Functional |
| India | 111 | 121 | 10 | Down | EQU + ACC + SYS regression |
| CVS Health | 308 | 322 | 14 | Down | Multi-vector regulatory compound |
| Pakistan | 150 | 156 | 6 | Down | Band crossing to Critical |

### Not Applied

- **Open Bionics** (robotics-labs): Math-hygiene audit pending, 12 cycles unresolved. No changes applied per Math-Hygiene Hold instruction.
- **UnitedHealth Group May 12 proposal**: Superseded by May 14 proposal per most-recent-proposal rule. May 12 proposed 7.5; May 14 proposed 11.4; net result 11.4 applied.
- **Pakistan May 14 monsoon-watch proposal**: Auto-confirm at 20.3; superseded by May 12 band-crossing application. Pakistan now at 17.2 critical.

### Index Meta Updates

**countries.json:**
- Mean score: 36.9 → 36.8
- Median score: 35.9 (unchanged)
- Functional band: 25 → 26 (+1, Hungary)
- Developing band: 90 → 88 (-2, Pakistan + Hungary leaving)
- Critical band: 38 → 39 (+1, Pakistan)

**fortune-500.json:**
- Mean score: 39.5 (unchanged)
- Median score: 35.9 (unchanged)
- Band distribution unchanged (CVS remains developing; UnitedHealth remains critical)

---

## 2026-05-15

Applied by: score-updater agent (manual trigger by founder)
Proposals from: 2026-05-15 (17 proposals: 5 score changes, 12 confirmations/floor-docs)

### Score Changes

| Entity | Index | Old Score | New Score | Delta | Old Rank | New Rank | Old Band | New Band | Proposal File |
|--------|-------|-----------|-----------|-------|----------|----------|----------|----------|---------------|
| Anthropic | ai-labs | 60.0 | 58.1 | -1.9 | 13 | 14 | functional | functional | anthropic-2026-05-15.json |
| Microsoft | fortune-500 | 66.4 | 65.3 | -1.1 | 24 | 26 | established | established | microsoft-2026-05-15.json |
| Alphabet/Google | fortune-500 | 40.6 | 40.0 | -0.6 | 180 | 181 | developing | developing | alphabet-google-2026-05-15.json |
| India | countries | 30.5 | 28.1 | -2.4 | 121 | 121 | developing | developing | india-2026-05-15.json |
| Meta AI | ai-labs | 29.4 | 26.3 | -3.1 | 42 | 43 | developing | developing | meta-2026-05-15.json |

### Dimension Changes Applied

**Anthropic** (ai-labs, BOUNDARY CASE — published 60.0 was at Functional/Established pivot; new 58.1 within Functional band):
- AWR: 3.6 unchanged | EMP: 3.4 unchanged | ACT: 3.6 → 3.5 | EQU: 3.1 unchanged
- BND: 3.4 unchanged | ACC: 3.3 → 3.5 | SYS: 3.9 → 3.1 | INT: 2.9 → 3.0
- SYS -0.8: RSP v3 (Feb 26) dropped pre-deployment safety guarantee pledge under Pentagon contracting pressure — first canonical 'safety-pledge-reversal-under-government-pressure' event
- ACC +0.2: Judge Lin injunction (March 26) restoring federal Claude access; 'Orwellian' Pentagon-blacklist characterization — first full external-accountability-reversal in ai-labs cluster
- ACT -0.1: Mythos Preview proportionality drift (dual-use deployment without disclosed safety evaluation methodology)
- INT +0.1: Maintained hard red lines on autonomous weapons/mass domestic surveillance with documented Pentagon exclusion commercial cost

**Microsoft** (fortune-500, not a boundary case; Musk v. Altman verdict pending pre-staged):
- AWR: 4.0 unchanged | EMP: 3.5 → 3.2 | ACT: 4.0 → 3.9 | EQU: 3.3 → 3.2
- BND: 3.8 unchanged | ACC: 3.8 unchanged | SYS: 4.0 unchanged | INT: 3.0 unchanged
- EMP -0.3: 8,750 US buyouts (Rule of 70 — first in 51-year history); LinkedIn 1,000 cuts; Suleyman AI-displacement framing
- EQU -0.1: Rule of 70 age-cohort differential (age + years of service ≥ 70 targets older workers)
- ACT -0.1: Proportionality drift — $100B+ AI investment vs workforce-impact mitigation scale

**Alphabet/Google** (fortune-500, BOUNDARY CASE — composite 40.0 at exact Developing/Functional pivot 40/41):
- AWR: 2.8 unchanged | EMP: 2.5 unchanged | ACT: 2.8 → 2.6 | EQU: 2.5 → 2.4
- BND: 2.8 unchanged | ACC: 2.5 → 2.6 | SYS: 2.9 → 3.0 | INT: 2.4 → 2.1
- INT -0.3: DOJ Chrome divestiture cross-appeal (credibility deficit) + employee 'ethical lapses' internal-source disclosure
- ACT -0.2: AI investment/governance-capacity proportionality drift
- EQU -0.1: Monopoly conduct as market-power-inequity signal
- ACC +0.1: Court-ordered data-sharing enforcement active (stay denied May 8)
- SYS +0.1: 2026 AI Responsibility Report + AGI Futures Council governance infrastructure

**India** (countries, cumulative -6.3 from published 34.4; working baseline 30.5 applied May 14):
- AWR: 2.5 unchanged | EMP: 2.5 → 2.25 | ACT: 2.5 unchanged | EQU: 1.5 unchanged
- BND: 2.5 → 2.25 | ACC: 2.0 → 1.75 | SYS: 2.25 unchanged | INT: 2.0 unchanged
- EMP -0.25: Indian Navy forced 38-40 UNHCR-registered Rohingya refugees (minors 15-16, elderly up to 66, terminally ill) into Andaman Sea May 8; vulnerable-population disregard
- BND -0.25: Non-refoulement violation under customary international law; naval-vessel-as-deportation-instrument
- ACC -0.25: Zero government statement — second consecutive non-accountability for naval-deportation event (May 2025 + May 2026)
- NEW CONDUCT CATEGORY: 'maritime-deportation-without-due-process'

**Meta AI** (ai-labs, rank 42 → 43):
- AWR: 2.0 unchanged | EMP: 2.2 → 2.1 | ACT: 2.4 unchanged | EQU: 2.0 unchanged
- BND: 2.4 → 2.2 | ACC: 1.8 → 1.5 | SYS: 2.6 → 2.4 | INT: 2.0 → 1.8
- BND -0.2: EU DSA preliminary breach finding — failure to prevent under-13 access to Instagram/Facebook
- ACC -0.3: EU DSA preliminary finding + Senate bill + Hawley investigation + trial proceedings — four concurrent accountability mechanisms
- SYS -0.2: Systems-level child-safety failure pattern (multi-event, multi-jurisdiction)
- INT -0.2: Leaked internal AI chatbot training rules (Fox News) — gap between internal documentation and external commitments
- EMP -0.1: Hawley investigation: training chatbots to target children with sensual conversation

### Boundary Cases Confirmed by Founder

- Anthropic 58.1 (APPROVED): SYS -0.8 flagged-commitment-reversal weight defensible; ACC +0.2 court-precedent adequate; composite 58.1 fairly represents governance profile
- Alphabet/Google 40.0 (APPROVED): INT -0.3 defensible given dual external-credibility-deficit + internal-source structure; confirmed at exact boundary 40.0 with boundary-case flag

### Math-Hygiene Holds (Not Applied per Founder Instructions)

- Open Bionics (robotics-labs): Formula audit pending (13 cycles). Hold continues.
- Google rotation-state mismatch: index 40.6 (now 40.0) vs rotation-state 51.6. Index canonical; rotation-state NOT modified.
- Cambodia rotation-state mismatch: index 12.5 vs rotation-state 7.5. Index canonical; rotation-state NOT modified.
- Senegal 0.8pt drift: flagged for future audit cycle.
- Tesla: Not present in fortune-500.json. Skipped.

### Confirmations (No Score Change)

- ukraine (countries) 50.0 confirmed — asymmetric-conduct documentation strengthened
- senegal (countries) 33.6 confirmed — 0.8pt math drift flagged for audit
- agility-robotics (robotics-labs) 60.9 confirmed — BOUNDARY CASE 0.1pt below 60/61 pivot
- apptronik (robotics-labs) 81.4 confirmed — BOUNDARY CASE 0.4pt above 80/81 pivot; math-hygiene +8.0 cluster cycle 13
- cambodia (countries) 12.5 confirmed — rotation-state 7.5 mismatch flagged
- unitedhealth-group (fortune-500) 11.4 confirmed — DOJ probe ongoing

### Floor Confirmations (No Score Change)

- xai/grok (ai-labs) 0.0 — Pentagon perverse-procurement-incentive sector signal
- russia (countries) 0.0 — 24 civilians killed May 14-15; Macron 'hypocrisy' characterization
- myanmar (countries) 0.0 — Bilin Township child killed; Mindat detainee killings; Iran jet-fuel supply chain
- sudan (countries) 0.0 — UN OHCHR 'high alert'; 880 drone deaths; 34M requiring assistance
- south-sudan (countries) 0.0 — IRC rank 3 globally; Akobo crisis; river aid routes cut
- israel (countries) 0.0 — 72,744 cumulative deaths; Hungary ICC enforcement pledge as accountability-environment shift

---

## 2026-05-17

Applied by: score-updater agent (manual trigger by founder)
Proposals from: 2026-05-16 (2 score changes applied)
Note: May 17 proposals all sub-threshold; documented in proposals but NOT applied per founder instruction.

### Score Changes

| Entity | Index | Old Score | New Score | Delta | Old Rank | New Rank | Old Band | New Band | Proposal File |
|--------|-------|-----------|-----------|-------|----------|----------|----------|----------|---------------|
| Oracle | fortune-500 | 28.4 | 20.6 | -7.8 | 315 | 394 | developing | developing | oracle-2026-05-16.json |
| Meta Platforms | fortune-500 | 10.9 | 9.4 | -1.5 | 446 | 446 | critical | critical | meta-platforms-2026-05-16.json |

### Dimension Changes Applied

**Oracle** (fortune-500, FIRST BASELINE REASSESSMENT, BOUNDARY CASE — 20.6 sits 0.6pt above Critical floor 20.0):
- AWR: 2.2 unchanged | EMP: 1.8 → 1.2 | ACT: 2.2 → 1.8 | EQU: 2.0 → 1.6
- BND: 1.8 → 1.6 | ACC: 2.2 → 1.8 | SYS: 2.4 unchanged | INT: 2.4 → 2.0
- EMP -0.6: 6 a.m. email termination of up to 30,000 workers; no advance notice; no HR/manager contact; 34-year-tenured employees terminated; algorithmic targeting of stock-option holders alleged (Moneywise)
- ACT -0.4: Severance below sector median (4 wks + 1 wk/year capped 26 wks vs Meta 16 wks base); liability waiver required for severance (economic duress)
- EQU -0.4: Algorithmic targeting allegation — stock-option holders disproportionately affected; systematic bias by design
- BND -0.2: Liability waiver as severance condition = structurally coerced consent (B5)
- ACC -0.4: No acknowledgment of notification-method harm; no internal review disclosed; WARN Act controversy unresolved; anti-reparative severance structure
- INT -0.4: $26M CFO stock award concurrent with 30,000 eliminations; 95% net income growth same quarter = canonical internal-consistency failure
- Math note: 0.3pt dimensional drift (derived 28.1 vs published 28.4) per assessor's conservative-rounding policy. Proposed 20.6 applied directly.
- NEW CONDUCT CATEGORIES: algorithmic-targeting-of-stock-option-holders (EQU); concurrent-executive-compensation-with-mass-elimination (INT); liability-waiver-as-severance-condition (BND/B5)
- Rank shift: 315 → 394 (down 79 positions — largest Fortune 500 rank shift this cycle)

**Meta Platforms** (fortune-500, third 2026 layoff wave, no band crossing):
- AWR: 1.4 unchanged | EMP: 1.2 → 1.1 | ACT: 1.4 unchanged | EQU: 1.2 unchanged
- BND: 1.6 unchanged | ACC: 1.0 unchanged | SYS: 1.8 → 1.7 | INT: 1.6 unchanged
- EMP -0.1: Third 2026 layoff wave (January ~1,000-1,500; March 700; May 8,000 + 6,000 cancelled = 14,000 effective); systemic displacement-as-strategy pattern; partially mitigated by sector-leading severance (16 wks + 2 wks/year + 18 months health)
- SYS -0.1: Multi-entity AI-pivot-displacement-wave systems pattern (Meta + Oracle + Microsoft = 46,750+ in 50 days)
- Math note: 0.9pt drift (dimensional-derived 10.0 vs published 10.9 before application). Proposed 9.4 applied directly per conservative-rounding policy.
- Note on published vs proposed dimensions: index dimensions reflect prior applied changes; proposal dimensions derived from assessor baseline. Composite 9.4 applied directly per founder instruction.
- Rank shift: 446 → 446 (no change — remains second-to-last)
- NEW CONDUCT CATEGORY: parent-vs-product-entity-scoping (formalized rule: workforce events → Fortune 500; AI-product safety events → AI Labs)

### Boundary Cases Applied

- Oracle 20.6: BOUNDARY CASE. 0.6pt above Critical/Developing floor (20.0). Developing band sustained. Founder explicitly approved. WARN Act + algorithmic-targeting legal confirmation are active watches.

### Math-Hygiene Notes

- Oracle 0.3pt drift (derived 28.1 vs published 28.4): Conservative-rounding policy applied; 20.6 is the assessed composite independent of drift.
- Meta Platforms 0.9pt drift (dimensional-derived 10.0 vs published 10.9): Composite 9.4 applied directly.

### Index Meta Updates

**fortune-500.json:**
- Mean score: 39.5 → 39.4 (Oracle -7.8 composite has notable pull-down effect)
- Median score: 35.9 (unchanged)
- Band distribution unchanged: Oracle sustained Developing (20.6 > 20.0); Meta Platforms sustained Critical
  - Exemplary: 8 (1.8%) | Established: 54 (12.1%) | Functional: 118 (26.3%) | Developing: 216 (48.2%) | Critical: 52 (11.6%)
  - Band sum: 8+54+118+216+52 = 448 (VALIDATED)

### Not Applied (May 16 + May 17 cycle)

- **Open Bionics** (robotics-labs): Formula audit pending (14 cycles, CRITICAL BLOCKING). No changes applied.
- **Tesla** (fortune-500): Not present in fortune-500.json. Index-presence issue persists. Skipped.
- **OpenAI** (ai-labs): Hold through 2026-05-21. No changes applied.
- **India** May 17 (-1.5): Sub-threshold per founder instruction. Documented in proposal only.
- **Pakistan** May 17 (+0.4): Sub-threshold per founder instruction. Documented in proposal only.

### Confirmations Logged (No Score Change) — May 16 + May 17

- russia (countries) 0.0 — floor confirmed; IHL-compliant-gesture-concurrent-with-IHL-violating-conduct (294 drones + 528 body-returns same calendar day)
- israel (countries) 0.0 — floor confirmed; targeted-killing-of-designated-militant-with-confirmed-civilian-collateral; territorial-control-admission-against-ceasefire-boundary
- myanmar (countries) 0.0 — floor confirmed; interconnected-floor-conduct (India deportation to Myanmar conflict-zone second-order)
- sudan (countries) 0.0 — floor confirmed; WFP/FAO/UNICEF joint famine confirmation May 15-16; 19.5M acute food insecurity
- south-sudan (countries) 0.0 — floor confirmed; IRC Watchlist rank 3 global; Akobo crisis
- xai (ai-labs) 0.0 — floor confirmed; Grok CSAM governance failure international amplification (8+ countries, multi-AG)
- ukraine (countries) 50.0 — carry-forward confirmed; asymmetric-conduct + 4-day arc reinforcement
- palestine (countries) — rotation confirmation
- ethiopia (countries) — rotation confirmation
- china (countries) — rotation confirmation
- united-states (countries) — rotation confirmation
- agility-robotics (robotics-labs) 60.9 — boundary case confirmed (0.1pt below Functional/Established pivot)
- apptronik (robotics-labs) 81.4 — boundary case confirmed (0.4pt above Established/Exemplary pivot); math-hygiene cycle 14
- cambodia (countries) 12.5 — carry-forward confirmed
- nigeria (countries) 21.9 — boundary case confirmed (1.9pt above Critical threshold)
- senegal (countries) 33.6 — monitor-only confirmed
