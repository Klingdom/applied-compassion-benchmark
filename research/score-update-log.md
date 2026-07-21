# Score Update Log

Records every applied score change in chronological order.

---

## 2026-07-21 — Founder-approved override batch (approved 2026-07-21, applied 2026-07-21)

Approval authority: Phil Kling (founder). 8 proposals applied, all dated 2026-07-20. 6 of 8 were filed by the assessor as flag-for-review (calibration), not recommended score changes; founder explicitly reviewed and overrode the routing for all 6, including 2 (Egypt, Freeport-McMoRan) additionally flagged as screening-rule-3 false-positive candidates. Full detail and evidence basis: research/APPLIED_CHANGES.md #2026-07-21.

| # | Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Egypt | countries | 14.1 | 21.9 | +7.8 | critical | developing | 156 | 133 | [egypt-2026-07-20](change-proposals/egypt-2026-07-20.json) |
| 2 | Fidelity Investments | fortune-500 | 62.5 | 51.2 | -11.3 | established | functional | 31 | 79 | [fidelity-investments-2026-07-20](change-proposals/fidelity-investments-2026-07-20.json) |
| 3 | Freeport-McMoRan | fortune-500 | 18.8 | 32.5 | +13.7 | critical | developing | 400 | 305 | [freeport-mcmoran-2026-07-20](change-proposals/freeport-mcmoran-2026-07-20.json) |
| 4 | HCA Healthcare | fortune-500 | 37.5 | 25.0 | -12.5 | developing | developing | 187 | 321 | [hca-healthcare-2026-07-20](change-proposals/hca-healthcare-2026-07-20.json) |
| 5 | Kimberly-Clark | fortune-500 | 60.9 | 50.0 | -10.9 | established | functional | 46 | 80 | [kimberly-clark-2026-07-20](change-proposals/kimberly-clark-2026-07-20.json) |
| 6 | State Farm | fortune-500 | 60.9 | 13.8 | -47.1 | established | critical | 57 | 427 | [state-farm-2026-07-20](change-proposals/state-farm-2026-07-20.json) |
| 7 | State Street | fortune-500 | 60.2 | 47.5 | -12.7 | functional | functional | 63 | 171 | [state-street-2026-07-20](change-proposals/state-street-2026-07-20.json) |
| 8 | Thermo Fisher Scientific | fortune-500 | 60.9 | 48.8 | -12.1 | established | functional | 59 | 86 | [thermo-fisher-scientif-2026-07-20](change-proposals/thermo-fisher-scientif-2026-07-20.json) |

**Notes:**
- Egypt / Freeport-McMoRan: both upgrades surfaced on negative within-window evidence (refugee deportations; a mine-worker fatality respectively) and were routed by the assessor as screening-rule-3 false-positive flags, not upgrade recommendations. Applied over that flag by explicit founder decision.
- Fidelity Investments, Kimberly-Clark, State Street, Thermo Fisher Scientific: downgrades the assessor attributed to documented scrutiny bias / measurement-gap artifacts rather than real conduct decline, routed as flag-for-review. Applied over that routing by explicit founder decision.
- HCA Healthcare: assessor recommended a straightforward downgrade (no override of routing needed); approved and applied as recommended.
- State Farm: assessor recommended a downgrade but suggested a softer Developing landing zone given peer-calibration concerns; founder chose to apply the raw computed figure (two-band drop to Critical).
- Stale-baseline guard: all 8 proposal baselines matched the live index composites exactly (drift = 0.0pt). No holds.
- All 8 entity records written and validated (G1/G2/G3 PASS); 335 unrelated fortune-500/countries entity records required a rank-only resync as a mechanical consequence of the reordering (no composite/band changes). validate-indexes.mjs: 0 errors post-resync.

---

## 2026-04-24 — Batch 9 (founder-approved 2026-04-24, applied 2026-04-24)

Approval authority: Phil Kling (founder). All 6 proposals approved in batch. DRC archived as reaffirmation (no score change).

| # | Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Becton Dickinson | fortune-500 | 81.4 | 54.1 | -27.3 | exemplary | functional | 10 | 82 | [becton-dickinson-2026-04-24](change-proposals/history/becton-dickinson-2026-04-24.json) |
| 2 | Luxembourg | countries | 95.9 | 81.3 | -14.6 | exemplary | exemplary | 6 | 15 | [luxembourg-2026-04-24](change-proposals/history/luxembourg-2026-04-24.json) |
| 3 | Iceland | countries | 100.0 | 87.5 | -12.5 | exemplary | exemplary | 3 | 5 | [iceland-2026-04-24](change-proposals/history/iceland-2026-04-24.json) |
| 4 | Minnesota | us-states | 95.9 | 84.4 | -11.5 | exemplary | exemplary | 3 | 7 | [minnesota-2026-04-24](change-proposals/history/minnesota-2026-04-24.json) |
| 5 | Vermont | us-states | 97.5 | 87.5 | -10.0 | exemplary | exemplary | 1 | 6 | [vermont-2026-04-24](change-proposals/history/vermont-2026-04-24.json) |
| 6 | Hugging Face | ai-labs | 95.9 | 88.1 | -7.8 | exemplary | exemplary | 1 | 1 | [hugging-face-2026-04-24](change-proposals/history/hugging-face-2026-04-24.json) |

**Notes:**
- Becton Dickinson: Third Gen-2 forensic anchor. $20M cancer verdict (Gary Walker non-Hodgkin lymphoma) + 402 pending ethylene oxide exposure cases in Georgia. Published 81.4 is the F500 Gen-2 4x7+3.5x1 cluster artifact at ranks 10-17. Band change Exemplary to Functional. Rank 10 -> 82.
- Luxembourg: Countries ceiling Night 4. Published 95.9 is a uniform-profile artifact. LuxLeaks INT gap + EU FRA Roma/migrant gaps + GRETA labor-trafficking flags. Exemplary maintained. Rank 6 -> 15.
- Iceland: Countries ceiling Night 4. Published 100 is the 4.5x6+5x2=100 uniform artifact shared with 4 other Nordic entities (all corrected). Substantively Exemplary. Rank 3 -> 5.
- Minnesota: US-States ceiling first surface Night 1. Published 95.9 is the 4.5x7+4x1 uniform artifact. DOJ Minneapolis consent decree is the in-window governance anchor. Exemplary maintained. Rank 3 -> 7.
- Vermont: US-States ceiling first surface Night 1. Published 97.5 is the 4.5x7+5x1 uniform artifact. Rural broadband and housing affordability gaps prevent ceiling placement. Exemplary maintained. Rank 1 -> 6.
- Hugging Face: Rotation audit within Exemplary band. BND drops (80.0 -> 75.0) on content-moderation tensions; INT rises (90.0 -> 95.0) on honest governance disclosure. No band change. Rank 1 -> 1 (held #1 in ai-labs).
- DRC: Archived as reaffirmation — proposal was generated from stale 10.9 baseline; proposed 4.4 matched live score exactly. No score change applied. Proposal archived to history.

---

## 2026-04-23 — Batch 8 (founder-approved 2026-04-23, applied 2026-04-23)

Approval authority: Phil Kling (founder). All 9 proposals approved in batch.

| # | Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | TIAA | fortune-500 | 97.5 | 58.6 | -38.9 | exemplary | functional | 1 | 77 | [tiaa-2026-04-23](change-proposals/history/tiaa-2026-04-23.json) |
| 2 | Masimo Corporation | fortune-500 | 81.4 | 48.4 | -33.0 | exemplary | functional | 16 | 91 | [masimo-corporation-2026-04-23](change-proposals/history/masimo-corporation-2026-04-23.json) |
| 3 | Fannie Mae | fortune-500 | 62.5 | 31.6 | -30.9 | established | developing | 40 | 309 | [fannie-mae-2026-04-23](change-proposals/history/fannie-mae-2026-04-23.json) |
| 4 | Germany | countries | 95.9 | 72.8 | -23.1 | exemplary | established | 6 | 19 | [germany-2026-04-23](change-proposals/history/germany-2026-04-23.json) |
| 5 | Netherlands | countries | 95.9 | 74.4 | -21.5 | exemplary | established | 8 | 18 | [netherlands-2026-04-23](change-proposals/history/netherlands-2026-04-23.json) |
| 6 | DeepMind/Google | ai-labs | 81.4 | 65.0 | -16.4 | exemplary | established | 3 | 5 | [deepmind-google-2026-04-23](change-proposals/history/deepmind-google-2026-04-23.json) |
| 7 | Singapore | countries | 74.3 | 62.2 | -12.1 | established | established | 20 | 37 | [singapore-2026-04-23](change-proposals/history/singapore-2026-04-23.json) |
| 8 | Palantir AI | ai-labs | 12.8 | 10.3 | -2.5 | critical | critical | 48 | 49 | [palantir-ai-2026-04-23](change-proposals/history/palantir-ai-2026-04-23.json) |
| 9 | OpenAI | ai-labs | 31.3 | 27.5 | -3.8 | developing | developing | 42 | 43 | [openai-2026-04-23](change-proposals/history/openai-2026-04-23.json) |

**Notes:**
- TIAA: Stored composite 97.5 matched proposal publishedScore. Rank 1 -> 77. SEC 2021 enforcement + AARP-backed ERISA class action. Gen-2 4.5x8 uniform artifact confirmed. Largest delta in F500 pipeline history.
- Masimo Corporation: Stored composite 81.4 matched proposal publishedScore. Rank 16 -> 91. DOJ/SEC subpoenas + CEO stock-pledge non-disclosure.
- Fannie Mae: Stored composite 62.5 matched proposal publishedScore. Rank 40 -> 309. Active April 2026 national-origin discrimination lawsuit with congressional inquiry.
- Germany: Stored composite 95.9 matched proposal publishedScore. Rank 6 -> 19. Countries ceiling artifact + genuine policy regression.
- Netherlands: Stored composite 95.9 matched proposal publishedScore. Rank 8 -> 18. Same ceiling artifact; genuine asylum regression partially offset by Senate check.
- DeepMind/Google: Stored composite 81.4 matched proposal publishedScore. Entity name in JSON is "DeepMind/Google" (proposal slug deepmind-google). Rank 3 -> 5. Cross-index Gen-2 artifact confirmed.
- Singapore: Stored composite 74.3 matched proposal publishedScore. Rank 20 -> 37. Band remains established. 8 executions in 4 months + UN moratorium call.
- Palantir AI: Anomaly — proposal publishedScore stated 19.9 but stored composite was 12.8 (prior batch already applied). Approval table correctly cited 12.8 as old score. Applied 10.3 verbatim. Rank 48 -> 49.
- OpenAI: Stored composite 31.3 matched proposal publishedScore. Approval table cited 28.8 as old score (that was the 2026-04-22 assessed value, not yet a proposal). Applied 27.5 verbatim per instructions. Rank 42 -> 43.

---

## 2026-04-21 — Applied by score-updater agent

| Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|
| Applied via prior session — see archived proposals in history/ | | | | | | | | | |

---

## 2026-04-21 — Batch applied (founder-approved 2026-04-21)

See `research/change-proposals/history/` for individual proposal files from prior sessions.

---

## 2026-04-22 — Batch 7 (founder-approved 2026-04-22, applied 2026-04-21)

Approval authority: Phil Kling (founder). All 10 proposals approved in batch.

| # | Entity | Index | Old Composite | New Composite | Delta | Old Band | New Band | Old Rank | New Rank | Proposal |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Anthropic | ai-labs | 62.2 | 61.6 | -0.6 | established | established | 6 | 6 | [anthropic-2026-04-22](change-proposals/history/anthropic-2026-04-22.json) |
| 2 | Palantir AI | ai-labs | 21.9 | 12.8 | -9.1 | developing | critical | 46 | 48 | [palantir-ai-2026-04-22](change-proposals/history/palantir-ai-2026-04-22.json) |
| 3 | IBM | fortune-500 | 62.5 | 51.3 | -11.2 | established | functional | 44 | 87 | [ibm-2026-04-22](change-proposals/history/ibm-2026-04-22.json) |
| 4 | Amazon | fortune-500 | 17.8 | 17.8 | 0.0 | critical | critical | 409 | 409 | [amazon-2026-04-22](change-proposals/history/amazon-2026-04-22.json) |
| 5 | Deere &amp; Company | fortune-500 | 56.2 | 48.1 | -8.1 | functional | functional | 85 | 175 | [deere-amp-company-2026-04-22](change-proposals/history/deere-amp-company-2026-04-22.json) |
| 6 | Macy&#x27;s | fortune-500 | 50.0 | 41.3 | -8.7 | functional | functional | 94 | 181 | [macy-x27-s-2026-04-22](change-proposals/history/macy-x27-s-2026-04-22.json) |
| 7 | Interpublic Group | fortune-500 | 50.0 | 40.0 | -10.0 | functional | developing | 91 | 184 | [interpublic-group-2026-04-22](change-proposals/history/interpublic-group-2026-04-22.json) |
| 8 | Norway | countries | 100.0 | 84.7 | -15.3 | exemplary | exemplary | 4 | 9 | [norway-2026-04-22](change-proposals/history/norway-2026-04-22.json) |
| 9 | New Zealand | countries | 97.5 | 78.4 | -19.1 | exemplary | established | 6 | 18 | [new-zealand-2026-04-22](change-proposals/history/new-zealand-2026-04-22.json) |
| 10 | Democratic Republic of C | countries | 10.9 | 4.4 | -6.5 | critical | critical | 166 | 181 | [democratic-republic-of-c-2026-04-22](change-proposals/history/democratic-republic-of-c-2026-04-22.json) |

**Notes:**
- Anthropic: proposal stated old composite 90.9 but JSON already reflected a prior correction to 62.2. Applied proposed composite 61.6 verbatim per approval.
- Amazon: proposal stated old composite 21.6 / developing, but JSON already reflected a prior correction to 17.8 / critical. Proposed composite 17.8 already matched; dimension scores updated to reflect evidence-based values.
- Interpublic Group: proposal stated old composite 53.0 but JSON showed 50.0 (Gen-2 uniform artifact). Applied 40.0 verbatim. Entity preserved pending separate entity-existence review (Omnicom acquisition).
- Macy's: proposal stated old composite 53.0 but JSON showed 50.0 (Gen-2 uniform artifact). Applied 41.3 verbatim.
- Palantir AI: proposal stated old composite 19.9 / critical, JSON showed 21.9 / developing. Applied 12.8 / critical verbatim.
- New Zealand: proposal stated old composite 92.5, JSON showed 97.5. Applied 78.4 verbatim.
- DRC: JSON name is "Democratic Republic of C" (truncated from source extraction). Entity confirmed at rank 166 / 10.9.
