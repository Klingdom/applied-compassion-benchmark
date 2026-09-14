# Score Updates Log

---

## 2026-05-01 — Applied 2026-05-01 batch (Batch 17 — 1 entity)

**Applied by:** Score-updater agent (founder-approved 2026-05-01, reviewer: phil@mediafier.ai)

**Type:** Band-boundary exception — composite crosses 60-point Established/Functional threshold at sub-5-point delta.

### ai-labs index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Anthropic | 61.6 | 59.7 | -1.9 | established | functional | 5 | 13 | [anthropic-2026-05-01.json](change-proposals/anthropic-2026-05-01.json) |

### Dimension scores (0-100 scale)

**ai-labs:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Anthropic (new) | 65.0 | 60.0 | 65.0 | 52.5 | 60.0 | 57.5 | 70.0 | 47.5 |

### Re-rank impact

- **ai-labs:** Anthropic dropped from rank 5 (Established, 61.6) to rank 13 (Functional, 59.7) — band crossing. The eight entities tied at 60.9 (Abridge, AI21 Labs, Cerebras Systems, Cohere, Isomorphic Labs, Recursion Pharma, Sakana AI, Tempus AI) each moved up one rank (6–13 → 5–12). DeepMind/Google holds rank 14. All other ranks unchanged.

### Band count changes

- Established: 9 → 8 (16%)
- Functional: 15 → 16 (32%)

### Negative signals driving downgrade

1. Apr 30 2026: White House blocked Anthropic's plan to expand Mythos access to ~70 companies and organizations, citing security risks and inadequate compute capacity (Bloomberg/WSJ). BND -0.2 (3.6 → 3.4).
2. Apr 7-21 2026: Mythos breach via third-party vendor. As of Apr 30, comprehensive structural remediation disclosure not issued 24 days post-incident. ACC -0.3 (3.6 → 3.3), INT -0.1 (3.0 → 2.9).

### Mitigating signal

Anthropic continues to bear material Pentagon-contract cost by maintaining autonomous-weapons refusal stance (DC Circuit hearing pending May 2026). I1 anchor 3 sustained.

### Math verification

((3.6 + 3.4 + 3.6 + 3.1 + 3.4 + 3.3 + 3.8 + 2.9) / 8 − 1) / 4 × 100 = (3.3875 − 1) / 4 × 100 = 59.6875 → 59.7

---

## 2026-04-30 — Applied 2026-04-30 batch (Batch 16 — 4 entities)

**Applied by:** apply-2026-04-30-batch.mjs (founder-approved 2026-04-30)

**Type:** Standard nightly research run + first-baseline registrations + formal floor designation.

### ai-labs index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| DeepMind/Google | 65.0 | 58.4 | -6.6 | established | functional | 6 | 14 | [deepmind-google-2026-04-30.json](change-proposals/deepmind-google-2026-04-30.json) |

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Turkey | 32.8 | 22.5 | -10.3 | developing | developing | 117 | 138 | [turkey-2026-04-30.json](change-proposals/turkey-2026-04-30.json) |
| Myanmar | 0 | 0 | 0 | critical | critical | 184 | 186 | [myanmar-2026-04-30.json](change-proposals/myanmar-2026-04-30.json) — formal floor designation, all dims → 1.0, floorDesignation payload attached |

### fortune-500 index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Oracle | (not in index) | 28.4 | first baseline | (none) | developing | (none) | 316 | [oracle-2026-04-30.json](change-proposals/oracle-2026-04-30.json) — INDEX REGISTRATION (closes published-index gap), f500Rank 80, sector Technology |

### Dimension scores (0-100 scale)

**ai-labs:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| DeepMind/Google (new) | 65.0 | 55.0 | 60.0 | 55.0 | 55.0 | 50.0 | 65.0 | 50.0 |

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Turkey (new) | 30.0 | 25.0 | 30.0 | 20.0 | 25.0 | 15.0 | 25.0 | 10.0 |
| Myanmar (floor) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**fortune-500:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Oracle (baseline) | 30.0 | 20.0 | 30.0 | 25.0 | 20.0 | 30.0 | 35.0 | 35.0 |

### Re-rank impact

- **ai-labs:** DeepMind/Google moved from rank 6 (Established) to rank 14 (Functional) — band crossing.
- **countries:** Turkey -10.3 (largest single-entity delta in run); Myanmar joins floor cluster as 12th country at composite 0 (formal designation extends prior "already at 0" status with structured rationale and evidence). Total 12 zero-composite countries.
- **fortune-500:** Oracle registered at rank 316; entityCount 447 → 448. First scored entity captured outside the original ingestion window.

### Methodology notes

- **First-baseline handling:** Oracle (`publishedScore: null`, `delta: null`). DailyBriefing and EntityDetail render a "First baseline" chip in place of the trend arrow and delta.
- **Formal floor designation (Myanmar):** Composite resolves at 0 with `floorDesignation` payload citing the April 10, 2026 Min Aung Hlaing inauguration, April 26, 2026 60-township martial-law expansion, 9,400+ cumulative airstrikes, 4 million IDPs, 1.5 million refugees. primaryDrivers: AWR, EMP, EQU, BND, ACC, INT.
- **Turkey:** First public baseline — drops into mid-Developing band with full 8-dim score set.
- **DeepMind/Google:** Band crossing established → functional driven by integration-premium degradation across the 14-day window.

**Public surfaces:** all 4 proposals visible at `/updates/2026-04-30` (4 score changes panel + Myanmar in floor designations panel + Oracle "First baseline" chip).

**Build verification:** 1,203 pages prerendered (was 1,201; +1 Oracle entity page, +1 daily briefing page).

---

## 2026-04-30 — Applied floor-designation cluster (Batch 15 — 5 entities)

**Applied by:** apply-floor-designation.mjs (founder-approved 2026-04-30)

**Type:** Methodology resolution — formal floor designation. Resolves 8-night-overdue floor-limitation methodology gap.

### ai-labs index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Notes |
|---|---|---|---|---|---|---|---|---|
| xAI/Grok | 2.2 | 0 | -2.2 | critical | critical | 50 | 50 | Floor-designated. All 8 dims dropped to 1.0. floorDesignation payload attached. |
| Palantir AI | 6.6 | 0 | -6.6 | critical | critical | 49 | 49 | Floor-designated. All 8 dims dropped to 1.0. floorDesignation payload attached. |

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Notes |
|---|---|---|---|---|---|---|---|---|
| Israel | 8.8 | 0 | -8.8 | critical | critical | 173 | 185 | Floor-designated. All 8 dims dropped to 1.0. floorDesignation payload attached. |
| Sudan | 0 | 0 | 0 | critical | critical | 190 | 190 | Already at 0. floorDesignation payload attached for public &ldquo;call out why&rdquo; disclosure. |
| South Sudan | 0 | 0 | 0 | critical | critical | 189 | 189 | Already at 0. floorDesignation payload attached for public &ldquo;call out why&rdquo; disclosure. |

**Re-rank impact (countries):** 12 countries now at composite 0 (was 11). Ranks 173&ndash;184 shift up by 1; Israel slots into rank 185 alphabetically (between Eritrea and Myanmar).

**Schema added:** `floorDesignation: { designated, designatedDate, evidenceWindow, rationale, primaryDrivers[], evidenceSummary[], methodologyVersion }`. Each entity carries an entity-specific rationale and evidence summary.

**Public surfaces:** entity-page disclosure banner (`EntityDetail.tsx`), daily briefing &ldquo;Floor designations&rdquo; panel (`DailyBriefing.tsx`), methodology page section (`/methodology#floor-designation`).

**Build verification:** 1,201 pages prerendered; all 5 entity pages and the briefing panel render the disclosure.

---

## 2026-04-27 — Applied 2026-04-27 batch (4 entities)

**Applied by:** Score-updater agent (founder-approved 2026-04-27)

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Netherlands | 74.4 | 65.6 | -8.8 | established | established | 17 | 19 | [netherlands-2026-04-27.json](change-proposals/netherlands-2026-04-27.json) |

### us-states index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Texas | 20.3 | 14.1 | -6.2 | developing | critical | 18 | 18 | [texas-2026-04-27.json](change-proposals/texas-2026-04-27.json) |

### us-cities index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Houston | 43.8 | 35.2 | -8.6 | functional | developing | 42 | 104 | [houston-2026-04-27.json](change-proposals/houston-2026-04-27.json) |

### ai-labs index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Palantir AI | 10.3 | 6.6 | -3.7 | critical | critical | 49 | 49 | [palantir-ai-2026-04-27.json](change-proposals/palantir-ai-2026-04-27.json) |

### Dimension scores (0-100 scale)

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Netherlands (new) | 75.0 | 75.0 | 75.0 | 50.0 | 62.5 | 62.5 | 68.8 | 56.3 |

**us-states:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Texas (new) | 18.8 | 18.8 | 18.8 | 6.3 | 18.8 | 6.3 | 18.8 | 6.3 |

**us-cities:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Houston (new) | 43.8 | 43.8 | 43.8 | 31.3 | 31.3 | 18.8 | 43.8 | 25.0 |

**ai-labs:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Palantir AI (new) | 7.5 | 5.0 | 7.5 | 5.0 | 5.0 | 5.0 | 12.5 | 5.0 |

---

## 2026-04-27 — Applied 2026-04-26 batch (5 entities)

**Applied by:** Score-updater agent (founder-approved 2026-04-27)

### fortune-500 index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| American Express | 81.4 | 55.5 | -25.9 | exemplary | functional | 9 | 77 | [american-express-2026-04-26.json](change-proposals/american-express-2026-04-26.json) |
| Cummins | 81.4 | 53.1 | -28.3 | exemplary | functional | 10 | 81 | [cummins-2026-04-26.json](change-proposals/cummins-2026-04-26.json) |
| U.S. Bancorp | 81.4 | 54.7 | -26.7 | exemplary | functional | 11 | 78 | [u-s-bancorp-2026-04-26.json](change-proposals/u-s-bancorp-2026-04-26.json) |

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Norway | 84.7 | 78.1 | -6.6 | exemplary | established | 3 | 15 | [norway-2026-04-26.json](change-proposals/norway-2026-04-26.json) |
| New Zealand | 78.4 | 70.3 | -8.1 | established | established | 16 | 19 | [new-zealand-2026-04-26.json](change-proposals/new-zealand-2026-04-26.json) |

### Dimension scores (0-100 scale)

**fortune-500:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| American Express (new) | 56.3 | 62.5 | 62.5 | 56.3 | 50.0 | 43.8 | 62.5 | 50.0 |
| Cummins (new) | 56.3 | 56.3 | 62.5 | 50.0 | 37.5 | 50.0 | 62.5 | 31.3 |
| U.S. Bancorp (new) | 56.3 | 56.3 | 62.5 | 56.3 | 50.0 | 43.8 | 62.5 | 43.8 |

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Norway (new) | 81.3 | 81.3 | 81.3 | 68.8 | 75.0 | 81.3 | 81.3 | 75.0 |
| New Zealand (new) | 75.0 | 75.0 | 75.0 | 56.3 | 75.0 | 68.8 | 75.0 | 62.5 |

---

## 2026-04-27 — Applied 2026-04-25 batch (7 entities)

**Applied by:** Score-updater agent (founder-approved 2026-04-27)

### fortune-500 index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Booz Allen Hamilton | 48.4 | 36.7 | -11.7 | functional | developing | 104 | 191 | [booz-allen-hamilton-2026-04-25.json](change-proposals/booz-allen-hamilton-2026-04-25.json) |
| Danaher | 81.4 | 54.7 | -26.7 | exemplary | functional | 11 | 80 | [danaher-2026-04-25.json](change-proposals/danaher-2026-04-25.json) |
| Eli Lilly | 81.4 | 56.3 | -25.1 | exemplary | functional | 12 | 78 | [eli-lilly-2026-04-25.json](change-proposals/eli-lilly-2026-04-25.json) |
| General Mills | 81.4 | 53.1 | -28.3 | exemplary | functional | 13 | 82 | [general-mills-2026-04-25.json](change-proposals/general-mills-2026-04-25.json) |

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Denmark | 100.0 | 81.3 | -18.7 | exemplary | exemplary | 1 | 13 | [denmark-2026-04-25.json](change-proposals/denmark-2026-04-25.json) |
| Finland | 100.0 | 84.4 | -15.6 | exemplary | exemplary | 2 | 6 | [finland-2026-04-25.json](change-proposals/finland-2026-04-25.json) |
| Sweden | 97.2 | 81.3 | -15.9 | exemplary | exemplary | 5 | 14 | [sweden-2026-04-25.json](change-proposals/sweden-2026-04-25.json) |

### Dimension scores (0-100 scale)

**fortune-500:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Booz Allen Hamilton (new) | 43.8 | 50.0 | 43.8 | 37.5 | 37.5 | 25.0 | 43.8 | 12.5 |
| Danaher (new) | 56.3 | 62.5 | 62.5 | 56.3 | 56.3 | 43.8 | 62.5 | 37.5 |
| Eli Lilly (new) | 62.5 | 62.5 | 68.8 | 50.0 | 56.3 | 37.5 | 68.8 | 43.8 |
| General Mills (new) | 56.3 | 50.0 | 56.3 | 43.8 | 56.3 | 50.0 | 62.5 | 50.0 |

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Denmark (new) | 87.5 | 87.5 | 75.0 | 68.8 | 87.5 | 87.5 | 87.5 | 75.0 |
| Finland (new) | 87.5 | 87.5 | 81.3 | 75.0 | 87.5 | 87.5 | 87.5 | 81.3 |
| Sweden (new) | 81.3 | 87.5 | 75.0 | 68.8 | 87.5 | 81.3 | 87.5 | 81.3 |

---

## 2026-05-26 — Applied 2026-05-26 back-fill + 2026-05-27 normal cycle (5 entities, 2 annotations)

**Applied by:** Score-updater agent (founder-approved 2026-05-26)

**Type:** 2 first-baseline anchors (Bolivia, Elevance Health) + 1 forward-trigger upgrade (Hungary) + 2 formal applies downward (United States, Meta Platforms) + 2 scale-floor evidence annotations (Russia, Iran — no composite change) + 13 documented holds/confirms.

### countries index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Bolivia | 35.9 | 30.9 | -5.0 | developing | developing | 79 | 119 | [bolivia-2026-05-26.json](change-proposals/bolivia-2026-05-26.json) |
| Hungary | 47.7 | 50.0 | +2.3 | functional | functional | 62 | 53 | [hungary-2026-05-27.json](change-proposals/hungary-2026-05-27.json) |
| United States | 25.0 | 23.4 | -1.6 | developing | developing | 126 | 126 | [united-states-2026-05-27.json](change-proposals/united-states-2026-05-27.json) |
| Russia | 0.0 | 0.0 | 0.0 | critical | critical | 188 | 188 | [russia-2026-05-26.json](change-proposals/russia-2026-05-26.json) — scale-floor annotation only |
| Iran | 2.5 | 2.5 | 0.0 | critical | critical | 180 | 180 | [iran-2026-05-26.json](change-proposals/iran-2026-05-26.json) — scale-floor annotation only |

### fortune-500 index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Elevance Health | 37.5 | 30.0 | -7.5 | developing | developing | 188 | 311 | [elevance-health-2026-05-26.json](change-proposals/elevance-health-2026-05-26.json) |
| Meta Platforms | 9.4 | 7.8 | -1.6 | critical | critical | 446 | 446 | [meta-platforms-2026-05-27.json](change-proposals/meta-platforms-2026-05-27.json) |

### Dimension scores (0-100 scale)

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Bolivia (new) | 37.5 | 37.5 | 25.0 | 25.0 | 37.5 | 25.0 | 37.5 | 25.0 |
| Hungary (new) | 50.0 | 47.5 | 50.0 | 42.5 | 52.5 | 52.5 | 52.5 | 52.5 |
| United States (new) | 22.5 | 22.5 | 22.5 | 17.5 | 32.5 | 22.5 | 25.0 | 22.5 |

**fortune-500:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Elevance Health (new) | 37.5 | 25.0 | 37.5 | 25.0 | 37.5 | 25.0 | 25.0 | 25.0 |
| Meta Platforms (new) | 7.5 | 2.5 | 7.5 | 5.0 | 12.5 | 0.0 | 15.0 | 12.5 |

### Re-rank impact

- **countries:** Bolivia -40 (79 → 119); Hungary +9 (62 → 53); United States unchanged (126). Russia/Iran ranks unchanged.
- **fortune-500:** Elevance Health -123 (188 → 311); Meta Platforms unchanged (446, second-lowest F500 after Core Civic 447 and GEO Group 448).

### Methodology notes

- **Bolivia first-baseline (HUMANITARIAN-BLOCKADE-FIRST-BASELINE-PROTOCOL):** Provisional per 14-day blockade crisis; reassess within 30 days of resolution. ACT/ACC/INT/EQU → 25.0 (developing floor); AWR/EMP/BND/SYS held 37.5. Composite 30.9.
- **Elevance Health first-baseline:** Two concurrent active DOJ FCA actions. EMP/EQU/ACC/SYS/INT → 25.0; AWR/ACT/BND held at 37.5 per first-baseline discipline. Composite 30.0.
- **Hungary (FORWARD-TRIGGER-FIRED):** Magyar-von der Leyen EU funds political accord signed Brussels May 28. +2.3 pre-committed trigger. Sulyok constitutional confrontation (May 31 deadline) held as boundary-watch.
- **United States:** EQU enters dimension-Critical at 17.5 (first such entry for US). ICE detainee suicides 22-year high (AP May 27). Composite 3.4pt above Critical boundary (20.0).
- **Meta Platforms (PLATFORM-SAFETY-TEAM-LAYOFF-AS-DUAL-DIMENSION-EVENT):** Novel methodology flag — first application. 8,000 layoffs including integrity team; single compound event apportioned across AWR/ACT/BND/SYS/INT. EMP/ACC floor-locked, direction documented. Founder review recommended on convention.
- **Russia/Iran scale-floor annotations:** Evidence annotated for founder floor-methodology ruling (no composite movement). Russia: Civic Death Law (Duma first review May 26); Iran: Amnesty 2025 report (2,159 executions, 44-year global high).
- **Band counts unchanged:** countries — exemplary 14, established 26, functional 29, developing 83, critical 41. fortune-500 — exemplary 8, established 54, functional 118, developing 216, critical 52.
- **Mean/median post-recalc:** countries 36.7 / 35.9 (unchanged); fortune-500 39.4 / 35.9 (unchanged).


---

## 2026-06-18 — Applied 2026-06-18 batch (1 entity)

**Applied by:** Score-updater agent (founder-approved 2026-06-18, reviewer: phil@mediafier.ai)

**Type:** Within-band downgrade (Functional lower boundary; no band crossing).

### Score Changes Applied

| Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|
| Humana | fortune-500 | 51.6 | 40.6 | -11.0 | functional | functional | 83 | 180 | [humana-2026-06-18](change-proposals/humana-2026-06-18.json) |

### Dimension scores (0-100 scale)

**fortune-500:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Humana (new) | 50.0 | 37.5 | 37.5 | 25.0 | 50.0 | 37.5 | 50.0 | 37.5 |

### Re-rank impact

- **fortune-500:** Humana -97 (83 → 180). 96 entities with composites between 40.6 and 51.6 exclusive each shift up one rank.

### Methodology notes

- **Humana (TIER-5-FEDERAL-WATCHDOG-FINDING):** HHS OIG report (surfaced Jun 12-15 2026) documented 72% LTCH denial rate and 54% IRF denial rate under Medicare Advantage — significantly above ~42% peer average. ~95% of appealed skilled-nursing denials overturned on appeal. TIER-5-FEDERAL-WATCHDOG-FINDING methodology applied (first healthcare-insurer MA application). Partial mitigant: 2026 PA-reduction public commitment (unproven). Composite 40.6 is at the exact Functional lower boundary (>40.0 = functional; ≤40.0 = developing). Boundary watch active.
- **Band counts unchanged (no crossing):** exemplary 7, established 55, functional 118, developing 215, critical 53. Total 448 entities.
- **Mean/median post-recalc:** fortune-500 39.4 / 35.9 (both unchanged; -11.0 over 448 entities rounds to same 1-decimal).


---

## 2026-06-19 — Applied 2026-06-19 batch (2 entities)

**Applied by:** Score-updater agent (founder-approved 2026-06-19, reviewer: phil@mediafier.ai)

**Type:** 2 scored applies (1 band crossing: Nigeria Developing → Critical; 1 within-band downgrade: Figure AI). 0 holds. 0 drift warnings.

### Score Changes Applied

| Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|
| Figure AI | ai-labs | 37.5 | 31.3 | -6.2 | developing | developing | 29 | 41 | [figure-ai-2026-06-19](change-proposals/figure-ai-2026-06-19.json) |
| Nigeria | countries | 21.9 | 18.0 | -3.9 | developing | critical | 133 | 150 | [nigeria-2026-06-19](change-proposals/nigeria-2026-06-19.json) |

### Dimension scores (0-100 scale)

**ai-labs:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Figure AI (old) | 37.5 | 37.5 | 37.5 | 37.5 | 37.5 | 37.5 | 37.5 | 37.5 |
| Figure AI (new) | 25.0 | 37.5 | 37.5 | 37.5 | 25.0 | 25.0 | 37.5 | 25.0 |

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Nigeria (old) | 25.0 | 18.75 | 25.0 | 12.5 | 25.0 | 25.0 | 18.75 | 25.0 |
| Nigeria (new) | 18.75 | 18.75 | 18.75 | 12.5 | 25.0 | 18.75 | 12.5 | 18.75 |

### Re-rank impact

- **ai-labs:** Figure AI -12 (29 → 41). Cognition AI/Lightmatter/Poolside absorb the vacated 37.5-cluster position (ranks 28-30); Figure AI drops into Anduril/C3.ai tie cluster at 31.3 (alphabetical: Anduril 39, C3.ai 40, Figure AI 41). OpenAI shifts 42 → 42 (unchanged). Meta AI shifts 43 → 43, and so on through the index.
- **countries:** Nigeria -17 (133 → 150). Entities ranked 134-149 each shift up one rank (133-148). Nigeria enters Critical band between UAE (18.4, rank 149) and Venezuela (18.0, rank 151; alphabetical tiebreak: Nigeria before Venezuela).

### Drift guard (Step 2b.5)

- Figure AI: proposal baseline 37.5, index actual 37.5, drift 0.0pt — ACCEPT
- Nigeria: proposal baseline 21.9, index actual 21.9, drift 0.0pt — ACCEPT

### Composite formula verification (v1.2)

- Figure AI: mean((2.0-1)/4, (2.5-1)/4, (2.5-1)/4, (2.5-1)/4, (2.0-1)/4, (2.0-1)/4, (2.5-1)/4, (2.0-1)/4) × 100 = 31.25 → 31.3 (within tolerance, matches proposal)
- Nigeria: mean((1.75-1)/4, (1.75-1)/4, (1.75-1)/4, (1.5-1)/4, (2.0-1)/4, (1.75-1)/4, (1.5-1)/4, (1.75-1)/4) × 100 = 18.0 exactly (matches proposal)

### Methodology notes

- **Figure AI (WHISTLEBLOWER-SAFETY-GOVERNANCE-FAILURE):** Federal whistleblower suit (Gruendel v. Figure AI, N.D. Cal.) pre-adjudication. AWR, BND, ACC, INT each reduced 0.5 raw (→ 2.0). EMP/ACT/EQU/SYS unchanged at 2.5. Developing band sustained (31.3 is 11.3pt above Critical floor). Rank shift -12 (notable). Boundary watch: adjudicated outcome of whistleblower suit is next scoring trigger.
- **Nigeria (HUMANITARIAN-CATASTROPHE-BAND-CROSSING):** BAND CROSSING Developing → Critical. FAO-WFP Phase 5 (Catastrophe) designation for Borno State (June-August lean season). IRC "entirely man-made" characterization confirms accountability failure, not natural-only causation. Decade-plus structural northeast crisis prevents this being scored as one-off shock. AWR/ACT/ACC/INT reduced 0.25 raw; SYS reduced 0.25 raw (1.75→1.5). EMP/EQU/BND unchanged. Conservative: Nigeria is at 18.0 (18.0pt above absolute Critical floor); floor designation not triggered (multi-sided response capacity and INGO access exist). Rank shift -17 (notable).
- **Band count delta (ai-labs):** Developing 18, Critical 5 — unchanged (Figure AI stays Developing).
- **Band count delta (countries):** Developing 79 → 78 (−1), Critical 45 → 46 (+1). Exemplary 14, established 26, functional 29 — unchanged. Total 193 entities.
- **Mean/median post-recalc:** countries 36.5 / 35.9 (unchanged; −3.9 over 193 rounds to same 1-decimal). ai-labs mean 43.4 / median 46.1 (mean rounds down from 43.6 by −6.2 over 50 entities).

## 2026-07-14 — Applied 2026-07-14 batch (1 entity)

**Applied by:** Score-updater agent (founder-approved 2026-07-14, reviewer: phil@mediafier.ai)

**Type:** First-assessment baseline correction; within-band downgrade (no band crossing).

### Score Changes Applied

| Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|
| Tunisia | countries | 34.4 | 23.8 | -10.6 | developing | developing | 109 | 124 | [tunisia](change-proposals/tunisia.json) |

### Dimension scores (0-100 scale)

**countries:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Tunisia (old) | 37.5 | 37.5 | 37.5 | 25.0 | 37.5 | 37.5 | 37.5 | 25.0 |
| Tunisia (new) | 30.0 | 20.0 | 30.0 | 15.0 | 30.0 | 15.0 | 30.0 | 20.0 |

### Re-rank impact

- **countries:** Tunisia -15 (109 -> 124). 15 entities with composites between 23.8 and 34.4 exclusive (Vatican City through Paraguay) each shift up one rank (110-124 -> 109-123).

### Drift guard (Step 2b.5)

- Tunisia: proposal baseline 34.4, index actual 34.4, drift 0.0pt -- ACCEPT

### Composite formula verification (v1.2)

- Tunisia: derived composite from proposed dimensions (AWR 2.2, EMP 1.8, ACT 2.2, EQU 1.6, BND 2.2, ACC 1.6, SYS 2.2, INT 1.8) = 23.8 exactly (matches proposal; G3 diff 0.0000).

### Methodology notes

- **Tunisia (FIRST-ASSESSMENT-BASELINE-CORRECTION):** Published 34.4 was an un-assessed bulk-import placeholder (last_assessed: null) prior to this cycle. Evidence basis: July 8, 2026 mass sentencing wave -- Sihem Bensedrine (ex-president of the Truth and Dignity Commission) sentenced to 25 years plus a heavy fine, the state criminalizing its own transitional-justice legacy (ACC/EQU collapse); 21 opposition figures sentenced to 12-35yr terms with Ghannouchi raised to 20 years; asylum suspended and 12,000+ sub-Saharan migrants collectively expelled (Jan-Apr 2025) with documented torture and dehumanizing sexual violence; independent information-access authority shut down. Proposal reaffirmed 5 consecutive daily cycles (2026-07-10 through 2026-07-14) with no material change before founder approval. 40 proposed subdimensions assessed; entity record written: site/src/data/entity-records/tunisia.json. G1/G2/G3 invariance all PASS. Validate-indexes: 0 errors.
- **Band counts unchanged (no crossing):** exemplary 14, established 26, functional 29, developing 77, critical 47. Total 193 entities.
- **Mean/median post-recalc:** countries 36.4 / 35.9 (mean unchanged at 1-decimal; raw mean 36.44 -> 36.38 over 193 entities; median unchanged).
- 15 adjacent entity records updated for rank shift (Vatican City through Paraguay, ranks 110-124 each shifted up by 1).


---

## 2026-09-14 — Applied Hong Kong (global-cities), 1 entity

**Applied by:** Score-updater agent (founder-approved 2026-09-14 in live session, recorded per AUTONOMY.md §5 R5: status approved, reviewed_by founder, reviewed_date 2026-09-14, decision approved)

**Scope:** Single-file apply of research/change-proposals/hong-kong-2026-09-14.json. All other approved-but-held proposals (37 self-veto holds from 2026-08-20/2026-09-10, plus separately-tracked entity-record holds) left untouched — not re-evaluated, not re-logged.

### global-cities index

| Entity | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|
| Hong Kong | 32.8 | 26.9 | -5.9 | developing | developing | 105 | 141 | [hong-kong-2026-09-14.json](change-proposals/hong-kong-2026-09-14.json) |

### Dimension scores (0-100 scale)

**global-cities:**
| Entity | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT |
|---|---|---|---|---|---|---|---|---|
| Hong Kong (new) | 30 | 30 | 60 | 35 | 5 | 5 | 45 | 5 |

### Drift guard (Step 2b.5)

- Hong Kong: proposal baseline (published_scores.composite) 32.8, index actual 32.8, drift 0.0pt — ACCEPT. No direction inversion.

### Composite formula verification (v1.2)

- Hong Kong: computeCompositeFromDimensions({AWR:2.2, EMP:2.2, ACT:3.4, EQU:2.4, BND:1.2, ACC:1.2, SYS:2.8, INT:1.2}) = 26.9, Developing (matches proposal exactly; G3 diff 0.0000).

### Self-veto scan

No self-veto phrasing found in notes/rationale/recommendation ('DO NOT APPLY', 'without review', 'referred for calibration', 'left at the PUBLISHED values' all absent). Recommendation is a plain 'downgrade'.

### Re-rank impact

- Hong Kong dropped from rank 105 (32.8) to rank 141 (26.9) — no band crossing (developing to developing, both within 21-40). 36 entities previously ranked 106-141 (Istanbul through Ulaanbaatar) each moved up exactly one rank (106-141 -> 105-140) — pure rank drift, zero composite/band change confirmed for all 36 via diff against the pre-apply index. Global-cities Phoenix (rank 114 -> 113) has no dedicated entity-record file (the only 'phoenix.json' record belongs to us-cities' Phoenix, AZ; left untouched after an initial cascade mis-write was caught and reverted). Two records use non-obvious slugs distinct from a naive ASCII-fold guess: São Paulo -> s-o-paulo.json, Belém -> bel-m.json, Goiânia -> goi-nia.json; all three located and cascaded correctly (validator caught the first miss on bel-m/goi-nia and both were fixed before this log entry was written).

### Band counts unchanged (no crossing)

- global-cities: exemplary 15 (6%), established 26 (10%), functional 35 (14%), developing 105 (42%), critical 69 (28%). Total 250 entities. Mean 35.1, median 31.3 (both unchanged at 1-decimal; raw mean moved 35.120 -> 35.096 over 250 entities).

### Entity record and validation

- Entity record written via apply-entity-record.mjs --from-proposal: site/src/data/entity-records/hong-kong.json. G1/G2/G3 invariance all PASS (composite/band/rank match index verbatim; subdim means match dimension scores; derived composite 26.9 matches published 26.9, diff 0.0000).
- 35 adjacent entity records + rotation-state entries updated for rank-only drift (Istanbul, Jakarta, Johannesburg, Kumasi, Mumbai, Naples, Palmas, Panama City, Recife, Rosario, s-o-paulo, Surabaya, Tbilisi, Ankara, Bandung, Cali, Casablanca, Chennai, bel-m, Hyderabad, Kolkata, Lima, Nairobi, Pune, Quito, Santo Domingo, Chengdu, Ho Chi Minh City, Shanghai, Surat, Jaipur, Kuwait City, Shenzhen, Ulaanbaatar, goi-nia) plus Hong Kong itself.
- rotation-state.json: hong-kong composite/band/rank set to 26.9/developing/141; last_change_proposal set to null; last_assessed left untouched at 2026-09-14 (already set by the assessor stage, not modified here per D-10/§3h).
- validate-indexes.mjs: 0 errors, 65 warnings (matches pre-apply baseline; warnings are pre-existing and unrelated to this apply).

### Out of scope, untouched per instruction

countries.json and any cabo-verde/cape-verde record (structural merge runs separately); special-briefings; worker/; .github/; site/src/data/updates/daily; site/public/**. No npm run build run. No git commit made.

## 2026-09-14 — Founder-directed STRUCTURAL operation on countries.json (2 duplicate merges + 1 name correction, NO SCORE CHANGE)

**Applied by:** Score-updater agent, founder-directed structural operation (live session, 2026-09-14) per AUTONOMY.md §3 step 3 (disposition decided by founder: merge for both duplicates per D-08, rename-with-pinned-slug for DRC per precedent `42ee4e43`). This is NOT a change-proposal apply cycle — no composite, band, dimension or subdimension value changed for any entity.

**Scope:** Three explicit founder instructions in one session: "fix the cabo verde duplicate", "also fix the sao tome duplicate", "also fix the democratic republic of congo truncated name". Nothing else in `countries.json` touched. `global-cities.json` (Hong Kong, applied minutes earlier by a prior run) not touched.

### Verification before acting

- Cabo Verde (rank 25) vs Cape Verde (rank 26): field-by-field diff excluding `name`/`rank` -> byte-identical (composite 62.5, band established, region Africa, AWR 3.5 EMP 3.5 ACT 3.5 EQU 3 BND 4 ACC 3.5 SYS 3.5 INT 3.5). Confirmed before removing either row.
- Sao Tome and Principe (rank 59) vs the accented duplicate (rank 60): field-by-field diff excluding `name`/`rank` -> byte-identical (composite 48.4, band functional, region Africa, AWR 3 EMP 3 ACT 3 EQU 2.5 BND 3 ACC 3 SYS 3 INT 3). Both slugify to `sao-tome-and-principe`; confirmed only one canonical record/score/rotation-state footprint existed under that slug before acting.
- Democratic Republic of C (rank 181, composite 2.3, critical): confirmed truncated at 24 characters; confirmed `validate-indexes.mjs` accepts an explicit row-level `slug` field on a countries row (no new error/warning) before adding one.

### countries.json changes

| Row | Old Rank | Composite | Band | Disposition | New Rank |
|---|---|---|---|---|---|
| Cape Verde | 26 | 62.5 | established | REMOVED (duplicate merge, survivor = Cabo Verde) | n/a |
| Sao Tome e Principe (accented duplicate) | 60 | 48.4 | functional | REMOVED (duplicate merge, survivor = Sao Tome and Principe) | n/a |
| Cabo Verde | 25 | 62.5 | established | unchanged, survivor | 25 |
| Sao Tome and Principe | 59 | 48.4 | functional | unchanged, survivor | 58 |
| Democratic Republic of C | 181 | 2.3 | critical | RENAMED -> "Democratic Republic of the Congo"; slug pinned `democratic-republic-of-c` | 179 |

`entityCount` 193 -> 191. meanScore 36.0 -> 35.8. medianScore 35.9 -> 35.9 (unchanged). Band counts: established 26->25 (-1), functional 29->28 (-1), exemplary/developing/critical counts unchanged (percentages shifted only on the smaller 191-entity denominator). Both `meta.bands` and the top-level `bands` array recomputed and kept in sync.

### Drift guard (Step 2b.5)

Not applicable — this is a structural merge/rename operation, not a proposal apply. No published composite, band or dimension value was read as a "baseline" to drift-check against; D-08 requires the surviving row's published composite be kept verbatim, which was done for both Cabo Verde (62.5) and Sao Tome and Principe (48.4).

### Self-veto scan

Not applicable — no change-proposal file was involved in this operation.

### Re-rank impact

`countries.json`'s rankings array was already strictly ordered by composite descending with sequential ranks 1-193 before this edit (verified programmatically) — removing the two duplicate rows and re-deriving sequential ranks from the existing order is mathematically equivalent to a full re-sort, and was cross-checked as such. Cabo Verde: no rank change (25 -> 25). Sao Tome and Principe: -1 (59 -> 58). Democratic Republic of the Congo: -2 (181 -> 179, both removed rows sit above it in the ranking).

### Rank-cascade remediation

165 entity-records and 170 rotation-state entries (all `index: "countries"`) had `rank` mechanically resynced to the corrected index position; every one verified to have matching composite and band before its rank was touched (0 mismatches in either cascade). The 5-entry gap between the two counts is pre-existing rank drift in rotation-state that predates this operation (23 pre-existing `validate-rotation-state.mjs` failures at session start), corrected as a side effect of resyncing every countries entity to its live index rank. Singapore has no dedicated countries entity-record (a pre-existing, unrelated condition already flagged as a warning) — left untouched.

### Orphan-file discovery (beyond the base instruction)

A collision-suffixed, diacritic-stripped orphan slug for the accented Sao Tome duplicate was found live on disk in `site/src/data/entity-records/`, `site/public/data/scores/`, `site/public/data/history/`, and as a key in `research/rotation-state.json` (rank 60, composite 48.4 — the exact footprint of the removed duplicate row). It was invisible to a name-substring search and was only surfaced by `test-entity-records.mjs` failing on an unresolvable slug lookup. All four were removed in this same operation.

### Entity record, identifiers and validation

- Entity records touched: 165 rank resyncs (countries only, verified by `index_slug`) + `democratic-republic-of-c.json` name update + deletion of `cape-verde.json` and the orphan diacritic-stripped record.
- `site/src/data/entity-identifiers.json`: removed `cape-verde` (identical Wikidata/Wikipedia data already present under `cabo-verde` — nothing lost) and an orphan rank-suffixed duplicate of `sao-tome-and-principe`'s identifiers. 191 country keys remain, matching the new index size.
- `research/rotation-state.json`: `entity_count` 1331 -> 1329 (cape-verde + orphan removed). `cabo-verde`/`sao-tome-and-principe`/`democratic-republic-of-c` composite and band left unchanged; only rank (and, for DRC, name) updated. `last_assessed` NOT written for any of the three (D-10, assessor-owned field) — Cabo Verde keeps its genuine 2026-09-14 assessment date; Cape Verde's unbacked 2026-05-03 claim is gone with the row, not inherited by the survivor.
- `node site/scripts/validate-indexes.mjs`: 0 errors, 65 warnings (matches pre-operation baseline).
- `node research/scripts/validate-rotation-state.mjs`: 22 failures (down from 23 — cape-verde's unbacked-date failure removed with the row).
- `node site/scripts/validate-product-separation.mjs`: PASS (6 waived, 10 warnings, unchanged).
- `node site/scripts/test-entity-records.mjs`: 19,672 passed, 0 failed (after the orphan-slug cleanup above; an intermediate run had 1 failure on that orphan before it was found and removed).

### Out of scope, untouched per instruction

`global-cities.json` and all other indexes, `RISKS.md`, `DECISIONS.md`, `INCIDENTS.md`, `site/src/app/**`, `nginx*`, `site/src/data/updates/**`, special-briefings, `worker/`, `.github/`, `research/assessments/**` and `research/change-proposals/**`. No `npm run build` run. No git commit made.

## 2026-09-14 — Founder-directed STRUCTURAL operation: Phoenix cross-index slug collision (NO SCORE CHANGE)

**Applied by:** Score-updater agent, founder-directed structural operation (live session, 2026-09-14: "also fix the phoenix slug collision"). Not a change-proposal apply cycle — no composite, band, dimension or subdimension value changed for any entity.

**Scope:** Phoenix ONLY. 15 other global-cities/us-cities collisions (Boston, Portland, Seattle, Minneapolis, New York City, San Jose, Washington DC, San Francisco, Houston, Philadelphia, Atlanta, Detroit, Chicago, Los Angeles), plus Singapore (countries vs global-cities) and 1X Technologies/Figure AI (ai-labs vs robotics-labs, D-13) explicitly out of scope, untouched.

### Problem verified before acting

`global-cities.json` "Phoenix" (rank 113, composite 32.8, developing) and `us-cities.json` "Phoenix" (rank 119, composite 32.8, developing) both slugify to `phoenix`. Page routes are namespaced and both resolve correctly, but the flat stores (`site/src/data/entity-records/phoenix.json`, `site/public/data/scores/phoenix.json`) both belonged to the US-cities Phoenix; the global-cities Phoenix had no record and no score file (badge would resolve to the wrong entity).

### Fix

Added `"slug": "phoenix-global-cities"` to the `global-cities.json` Phoenix row only (composite/band/rank/dimensions unchanged), per precedent `70f81dc2` and the `us-states.json` "Georgia" -> `georgia-us-states` convention. Wrote `site/src/data/entity-records/phoenix-global-cities.json` via `node site/scripts/build-entity-records.mjs --apply --only phoenix-global-cities --index global-cities` — scoped to this one entity, verified via `git status` that no other entity record was touched. Record reproduces the index row verbatim (composite 32.8, Developing, rank 113; G1/G2/G3 pass, fully reconstructed subdims, `composite_override: null`).

### Drift guard / self-veto scan

Not applicable — structural slug-pin operation, not a proposal apply; no composite/band/dimension value was changed for any entity.

### Identifiers, rotation-state, history

- `site/src/data/entity-identifiers.json`: no `city`/`us-city` bucket exists at all; no `phoenix` key of any kind found. Nothing to move.
- `research/rotation-state.json`: `phoenix-global-cities` key already existed with a stale `rank: 115` against the index's actual 113 — corrected to 113. `last_assessed` (null) untouched per D-10. `phoenix` (US-cities) key confirmed untouched.
- `site/public/data/history/phoenix.json` does not currently exist on disk (gitignored/generated). Not rewritten; reported that the next prebuild's `build-entity-history.mjs` run will correctly key `phoenix-global-cities` separately once `export-public-data.mjs` regenerates `public/data/index.json` honouring the new `slug` field.

### Validation

- `node site/scripts/validate-indexes.mjs`: 0 errors, 64 warnings (down from 65 — the Phoenix cross-index collision warning is gone).
- `node site/scripts/test-entity-records.mjs`: 19,687 passed, 0 failed (up from 19,672 by 15 — exactly the new record's full check set).
- `node research/scripts/validate-rotation-state.mjs`: 22 failures, unchanged.
- `node site/scripts/validate-product-separation.mjs`: PASS (6 waived, 10 warnings), unchanged.

### Out of scope, untouched per instruction

`nginx*`, `site/src/app/**`, `countries.json`, all other index rows, the 15 other collisions, Singapore, 1X Technologies/Figure AI, special-briefings, `worker/`, `.github/`. No `npm run build` or `export-public-data.mjs` run. No git commit made.
