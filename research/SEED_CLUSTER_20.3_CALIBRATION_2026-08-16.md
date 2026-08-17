---
study: "20.3 seed-cluster de-seeding study"
date: "2026-08-16"
index: "countries"
entities: ["Algeria","Cameroon","Djibouti","Gabon","Guinea","Honduras","Kazakhstan","Mauritania","Papua New Guinea","Republic of Congo","Uzbekistan","Zimbabwe"]
calibration_anchors: ["Uganda (2026-08-01, composite 11.9) — fixed, not re-scored", "Guinea-Bissau (2026-07-23, composite 13.1) — fixed, not re-scored"]
methodology_template: "research/SAHEL_BAND_CALIBRATION_2026-08-13.md"
assessments_written: 12
sidecars_written: 12
proposals_filed: 8
band_crossings: 7
sub_threshold_band_crossings: 2
hypothesis: "the 20.3 value is uninformative"
hypothesis_result: "CONFIRMED — and the 2-for-2 Critical pattern BROKE"
---

# The 20.3 Seed Cluster: De-Seeding Study

**Date:** 2026-08-16
**Index:** countries
**Entities assessed:** 12, each with a full 40-subdimension assessment
**Anchors:** Uganda (11.9) and Guinea-Bissau (13.1). Fixed. Not re-scored.
**Method template:** `research/SAHEL_BAND_CALIBRATION_2026-08-13.md`

---

## 1. What was wrong

Twelve countries sat at ranks 134 to 145 of the countries index on a single composite value, 20.3, and a single dimension vector:

```
AWR 2 · EMP 2 · ACT 2 · EQU 1.5 · BND 2 · ACC 1.5 · SYS 2 · INT 1.5
```

That vector is byte-identical across all twelve. It is a never-assessed uniform seed, not a measurement. The published ranks 134 through 145 were an artefact of alphabetical ordering inside the tie: Algeria, Cameroon, Djibouti, Gabon, Guinea, Honduras, Kazakhstan, Mauritania, Papua New Guinea, Republic of Congo, Uzbekistan, Zimbabwe.

The number matters because of where it sits. **The Critical band ends at 20.0 and Developing begins at 20.1. The seed is 20.3 — three tenths of a point above the line.** All twelve countries were publicly labelled "Developing" because a placeholder happened to land just above a boundary. The band label is the most visible claim the benchmark makes about any entity.

The arithmetic was never the problem. Canonical reconstruction of the seed vector returns exactly 20.3. **The defect was that the input was never measured.**

---

## 2. Before and after

Uganda and Guinea-Bissau are shown as fixed anchors. Both were de-seeded from the same 20.3 in earlier cycles and both are already applied to the index. Neither was re-scored here.

| Country | Stage | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT | Composite | Band |
|---|---|---|---|---|---|---|---|---|---|---|---|
| *All twelve* | **Before (seed)** | 2.0 | 2.0 | 2.0 | 1.5 | 2.0 | 1.5 | 2.0 | 1.5 | **20.3** | Developing |
| **Uganda** | Anchor (fixed) | 1.4 | 1.4 | 2.0 | 1.6 | 1.6 | **1.0** | 1.8 | **1.0** | **11.9** | Critical |
| **Guinea-Bissau** | Anchor (fixed) | 1.6 | 2.0 | 2.0 | **1.0** | 1.6 | **1.0** | 2.0 | **1.0** | **13.1** | Critical |
| Zimbabwe | After (assessed) | 1.4 | 1.2 | 1.6 | 1.6 | 1.2 | 1.2 | 1.8 | 1.2 | **10.0** | Critical |
| Republic of Congo | After (assessed) | 1.4 | 1.2 | 1.8 | 1.6 | 1.6 | **1.0** | 1.6 | 1.2 | **10.6** | Critical |
| Algeria | After (assessed) | 1.4 | 1.4 | 2.0 | 1.6 | 1.4 | **1.0** | 1.6 | 1.2 | **11.2** | Critical |
| Cameroon | After (assessed) | 1.4 | 1.4 | 1.8 | 1.4 | 1.4 | 1.4 | 1.8 | **1.0** | **11.3** | Critical |
| Guinea | After (assessed) | 1.4 | 1.2 | 2.0 | 1.4 | 1.2 | 1.4 | 2.6 | 1.4 | **14.4** | Critical |
| Djibouti | After (assessed) | 1.6 | 1.6 | 2.0 | 1.8 | 2.0 | **1.0** | 2.0 | 1.6 | **17.5** | Critical |
| Mauritania | After (assessed) | 2.0 | 1.2 | 2.2 | 2.0 | 1.6 | 1.2 | 1.8 | 1.6 | **17.5** | Critical |
| Kazakhstan | After (assessed) | 1.8 | 1.6 | 2.4 | 2.2 | 2.0 | 1.6 | 2.2 | 2.0 | **24.4** | Developing |
| Gabon | After (assessed) | 2.0 | 1.6 | 2.2 | 2.2 | 1.8 | 2.0 | 2.4 | 1.8 | **25.0** | Developing |
| Honduras | After (assessed) | 2.2 | 1.6 | 2.2 | 2.0 | 1.8 | 2.2 | 2.2 | 2.4 | **26.9** | Developing |
| Uzbekistan | After (assessed) | 2.0 | 1.4 | 2.6 | 2.2 | 1.6 | 2.0 | 2.8 | 2.2 | **27.5** | Developing |
| Papua New Guinea | After (assessed) | 2.6 | 2.2 | 2.2 | 2.4 | 2.0 | 2.4 | 2.6 | 2.2 | **33.1** | Developing |

Bold values sit at raw 1.0, the absolute floor of the 1-5 anchor scale.

### Composite movement

| Country | Published | Assessed | Delta | Band change | Proposal filed |
|---|---|---|---|---|---|
| Zimbabwe | 20.3 | **10.0** | **-10.3** | Developing → Critical | Yes |
| Republic of Congo | 20.3 | **10.6** | **-9.7** | Developing → Critical | Yes |
| Algeria | 20.3 | **11.2** | **-9.1** | Developing → Critical | Yes |
| Cameroon | 20.3 | **11.3** | **-9.0** | Developing → Critical | Yes |
| Guinea | 20.3 | **14.4** | **-5.9** | Developing → Critical | Yes |
| Djibouti | 20.3 | **17.5** | -2.8 | Developing → Critical | **No — below threshold** |
| Mauritania | 20.3 | **17.5** | -2.8 | Developing → Critical | **No — below threshold** |
| Kazakhstan | 20.3 | **24.4** | +4.1 | none | No — below threshold |
| Gabon | 20.3 | **25.0** | +4.7 | none | No — below threshold |
| Honduras | 20.3 | **26.9** | **+6.6** | none | Yes |
| Uzbekistan | 20.3 | **27.5** | **+7.2** | none | Yes |
| Papua New Guinea | 20.3 | **33.1** | **+12.8** | none | Yes |

All composites were produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and every one reproduces. For all twelve the integration premium is 0: every dimension sits below 4.0, so the weakness factor reduces to 0 and the composite equals the base composite. No harm flags were applied. All subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and is reachable by the methodology.

---

## 3. The band distribution after de-seeding

| Band | Before (seed) | After (assessed) |
|---|---|---|
| Critical (0-20) | 0 | **7** |
| Developing (21-40) | **12** | **5** |
| Functional and above | 0 | 0 |

**The 2-for-2 Critical pattern BROKE. It did not hold, and it did not partially hold in the direction the prior runs suggested.**

Seven of the twelve fell into Critical. Five did not. Three of those five moved far enough upward to clear the proposal threshold in the opposite direction: Honduras at +6.6, Uzbekistan at +7.2 and Papua New Guinea at +12.8. Papua New Guinea's +12.8 is the largest single movement in the study, larger in magnitude than any of the downward moves.

### The statistical shape of the seed

| Statistic | Value |
|---|---|
| Mean signed delta | **-1.18 points** |
| Mean absolute delta | **7.08 points** |
| Standard deviation of deltas | 7.61 points |
| Range | -10.3 to +12.8, a spread of **23.1 points** |

This is the core result, and it is cleaner than the Sahel study's. **The seed was not systematically too generous. It was uninformative.** Average signed movement is -1.2 points, which is close to nothing. Average absolute movement is 7.1 points, which is close to half the width of a band. A placeholder that is right on average and wrong by seven points for the typical entity is the worst possible kind of wrong: it looks defensible in aggregate and misleads on every individual record.

The hypothesis under test was "the 20.3 value is uninformative." **Confirmed.** The competing hypothesis suggested by the two prior de-seedings, that these countries belong in Critical, is **rejected** for five of the twelve.

### Why the upward movers moved up

The three upward proposals are not soft scoring. Each rests on documented institutional machinery that a seed cannot see:

- **Papua New Guinea (+12.8).** A published National Strategy to Prevent and Respond to Gender-Based Violence 2026-2035, national clinical guidelines for family support centres launched by the health department, a parliamentary Committee on Gender that reports publicly, and the Bougainville peace process. Outcomes remain terrible: 64 per cent of women report experiencing gender-based violence and there is about one police officer per 1,845 people. The benchmark measures compassion infrastructure and behaviour, and Papua New Guinea has considerably more of it than a junta does.
- **Uzbekistan (+7.2).** A Single Registry administering social protection end to end, built with the World Bank and UNICEF; roughly 2.3 million families reached by 2023, a four-fold rise since 2017; the state's own dismantling of state-imposed forced labour in the cotton harvest; and a Tashkent court sentencing a police officer to 10 years for torture in May 2025.
- **Honduras (+6.6).** A national human rights commissioner that publishes over 800 complaints against its own security forces; homicides down from 26.07 to an estimated 15.30 per 100,000 in a year; femicide down from 7.73 to 4.75; upheld convictions of eight people for the murder of Berta Cáceres; and a completed transfer of power to an opposing party on 27 January 2026.

The task brief predicted that Gabon, Kazakhstan, Honduras, Zimbabwe and Uzbekistan were the likely upward candidates. Four of those five did move up. **Zimbabwe did not** — it produced the single largest downward move, at -10.3, on a constitutional amendment gazetted 16 February 2026 that postpones the 2028 elections to 2030, student protesters abducted and allegedly tortured, and a law allowing the state to dissolve charities and seize their assets.

---

## 4. New rank ordering

The alphabetical-tie artefact is gone. The twelve now span 51 rank positions instead of 12 consecutive ones.

| Country | Seed rank | New rank | Composite | Band |
|---|---|---|---|---|
| Papua New Guinea | 142 | **111** | 33.1 | Developing |
| Uzbekistan | 144 | **119** | 27.5 | Developing |
| Honduras | 139 | **121** | 26.9 | Developing |
| Gabon | 137 | **123** | 25.0 | Developing |
| Kazakhstan | 140 | **128** | 24.4 | Developing |
| Djibouti | 136 | **143** | 17.5 | Critical |
| Mauritania | 141 | **144** | 17.5 | Critical |
| Guinea | 138 | **150** | 14.4 | Critical |
| *Guinea-Bissau (anchor)* | — | *152* | *13.1* | *Critical* |
| *Uganda (anchor)* | — | *155* | *11.9* | *Critical* |
| Cameroon | 135 | **156** | 11.3 | Critical |
| Algeria | 134 | **157** | 11.2 | Critical |
| Republic of Congo | 143 | **160** | 10.6 | Critical |
| Zimbabwe | 145 | **162** | 10.0 | Critical |

Ranks are computed against the current published table with only these twelve values replaced.

**Confirmation that the alphabetical artefact is removed:** under the seed, Algeria ranked 134 and Zimbabwe 145 purely because A precedes Z. On evidence Algeria ranks 157 and Zimbabwe 162 — Zimbabwe is now worse than Algeria, the reverse of the alphabetical implication for a pair whose seed ranks were 11 apart in the other direction.

One residual tie remains: **Djibouti and Mauritania both land on 17.5.** This is not a seed. Their dimension vectors differ materially — Djibouti runs 1.6 / 1.6 / 2.0 / 1.8 / 2.0 / 1.0 / 2.0 / 1.6 and Mauritania runs 2.0 / 1.2 / 2.2 / 2.0 / 1.6 / 1.2 / 1.8 / 1.6. Two genuinely different profiles happened to average to the same composite. That is a legitimate coincidence, and it is exactly the case the seed detector recommended below must not flag.

---

## 5. The threshold defect, reproduced and worsened

The Sahel study found that a seed set too high is self-protecting, because every honest correction can be individually too small to file. **This study reproduces that defect in its most damaging form.**

**Djibouti and Mauritania both cross a band boundary and neither can be filed.** Both assess at 17.5, which is inside Critical. Both are 2.8 points from the published 20.3, which is below the 5.0-point proposal threshold. So both remain publicly labelled "Developing" when the evidence puts them in "Critical", and the pipeline has no route to correct it.

This is worse than the Chad and Niger cases in the Sahel study, because there the band label was unaffected. Here the label itself is wrong and unfileable.

The composite-only threshold also continues to hide vector movement. Kazakhstan moves +4.1 and files nothing, but its Accountability rises from 1.5 to 1.6 while its Empathy falls from 2.0 to 1.6 and its Action rises from 2.0 to 2.4 — three material, opposite movements that a composite test cannot see.

### Recommended pipeline fixes

These extend, and do not replace, the four recommended by the Sahel study.

1. **A band crossing must be filable regardless of composite delta.** Any completed 40-subdimension assessment that changes an entity's band should be filable. The band is the most visible claim the benchmark makes; a 2.8-point gap that flips "Developing" to "Critical" is more consequential than a 6-point gap that changes nothing.
2. **Exempt flat-seed entities from the 5.0-point threshold entirely.** Already recommended by the Sahel study; this study is the second consecutive demonstration that it is needed.
3. **Add a seed detector to index validation** that flags any composite value shared by three or more entities to one decimal place *together with* a byte-identical dimension vector. The vector test is what distinguishes the 20.3 seed from the genuine Djibouti-Mauritania tie at 17.5.
4. **Prioritise seed clusters by distance to a band boundary, not by cluster size.** This study establishes the empirical basis for that rule, in section 7.

---

## 6. Countries where the evidence was too thin to score confidently

Named plainly, three of the twelve carry materially weaker evidence than the rest, and their scores should be treated as provisional.

- **Republic of Congo.** The Amnesty International country page returned HTTP 521 and could not be read directly; its findings were taken from a search-retrieved summary and need re-verification against the primary document. The Telema social programme, which carries several Equity and Boundaries scores, rests on a single tier-3 source. Republic of Congo has the thinnest evidence base of any country in the study and its -9.7 delta is the least secure of the five downward proposals.
- **Gabon.** Two of the strongest positive findings — the "Fund 4" health insurance extension and the July 2026 restructuring Task-Force — rest on tier-2 regional outlets. These drive Accountability and Action. Gabon's +4.7 falls just below the filing threshold anyway, so nothing is proposed, but a tier-4 confirmation would be worth obtaining before any future cycle relies on it.
- **Algeria.** The evidence base is heavily skewed toward rights reporting. Algeria runs a large social state — free health care, free education, universal subsidies — and no primary current source for its coverage or outcomes could be obtained. Action, Equity and Boundaries are therefore scored on the lower anchor by the conservative-default rule. Algeria's true score is more likely to be understated than overstated.

Two further limitations affect the whole study. The Human Rights Watch World Report 2026 chapter for Cameroon returned HTTP 404 and the Amnesty country pages for Djibouti and Gabon returned HTTP 504. And this is a desk-based assessment throughout: no country here has community testimony or independent audit evidence of a working compassion practice, which is why nothing in the study scores above 3 on any subdimension.

### False positives caught and excluded

All three traps flagged in the brief were checked and none entered the scoring.

- **Kazakhstan.** The reported Almaty conviction of five activists dated 26 August 2026 was excluded: it matches the confirmed World Report stale-year pattern and post-dates the scan. The Toregozhina fine is used only as standing context at its true 2025 event date.
- **Guinea.** The reported suspension of three opposition parties on 23 August was excluded on the same stale-year pattern. What *is* scored is the dissolution of 40 political parties on 7 March 2026, independently reported by France 24 and Africanews with a verified 2026 date.
- **Zimbabwe.** Human Rights Watch's 3 August 2026 piece on the 2018 abuses is renewed advocacy about an eight-year-old event, not a new incident. It is scored only as evidence that accountability remains absent today, which lowers Accountability, and not as a fresh harm.

Two additional stale-year traps were caught during the work and are recorded here for the pattern library:

- **Cameroon.** A search result describing the pardon of 333 Anglophone detainees on 3 October and the release of Maurice Kamto on 5 October carried no year. It was traced to the 2019 National Dialogue and excluded as stale.
- **Guinea.** The 2009 stadium massacre verdict is dated 31 July 2024 and the pardon of Moussa Dadis Camara 28 March 2025. Both were verified against FIDH and Amnesty before being scored, because both sit at the edge of the usable evidence window.

---

## 7. Should the remaining seed clusters get the same treatment?

**Yes — and this study changes the priority order.**

A full scan of all seven indexes turns up these clusters of eight or more entities sharing one composite and one vector:

| Index | Composite | Entities | Vector | Distance to nearest band edge | Published band |
|---|---|---|---|---|---|
| robotics-labs | 60.9 | 10 | 3.5/3.5/3.5/3/3.5/3.5/3.5/3.5 | **0.9** | Established |
| global-cities | 18.8 | 29 | 2/2/2/1.5/1.5/1.5/2/1.5 | **1.2** | Critical |
| countries | 62.5 | 14 | 3.5/3.5/3.5/3/4/3.5/3.5/3.5 | **2.5** | Established |
| fortune-500 | 23.4 | 38 | 2/2/2/1.5/2/2/2/2 | 3.4 | Developing |
| countries | 35.9 | 28 | 2.5/2.5/2.5/2/2.5/2.5/2.5/2.5 | 4.1 | Developing |
| fortune-500 | 35.9 | **115** | same | 4.1 | Developing |
| us-cities | 35.9 | 55 | same | 4.1 | Developing |
| fortune-500 | 25.0 | 29 | flat 2.0 | 5.0 | Developing |
| us-cities | 45.3 | 12 | 3/3/3/2.5/2.5/3/3/2.5 | 5.3 | Functional |
| global-cities | 32.8 | 19 | 2.5/2.5/2.5/2/2/2/3/2 | 7.2 | Developing |
| us-cities | 32.8 | 15 | 2.5/2.5/2.5/2/2/2.5/2.5/2 | 7.2 | Developing |
| fortune-500 | 48.4 | 83 | 3/3/3/2.5/3/3/3/3 | 8.4 | Functional |
| us-cities | 48.4 | 12 | same | 8.4 | Functional |
| ai-labs | 48.4 | 8 | same | 8.4 | Functional |
| global-cities | 7.8 | 21 | 1.5/1.5/1.5/1.5/1/1/1.5/1 | 12.2 | Critical |
| countries | 0.0 | 12 | flat 1.0 | 20.0 | Critical |

**The prioritisation rule this study establishes:** rank clusters by distance to the nearest band boundary, then by entity count. De-seeding moved the typical entity **7.1 points**, with a standard deviation of 7.6 and a range of 23.1. **Any cluster sitting within roughly 7 points of a band edge should be presumed to have a wrong band label for a substantial fraction of its members.** Cluster size determines how much work it is, not how urgent it is.

### Recommended order

1. **robotics-labs at 60.9, 10 entities.** Highest priority. It sits 0.9 points above the Functional/Established boundary — the tightest margin anywhere in the index family, tighter than the 20.3 case that prompted this study. Ten entities are publicly labelled "Established" on a placeholder. It is also the smallest cluster in the table, so it is the cheapest to clear. Do this first.
2. **global-cities at 18.8, 29 entities.** Sits 1.2 points below the Critical/Developing boundary. Twenty-nine cities are labelled "Critical" on a seed, and Critical is the most damaging label the benchmark issues. Same shape as the 20.3 case, opposite direction.
3. **countries at 62.5, 14 entities.** 2.5 points above the Functional/Established boundary. Fourteen countries labelled "Established" on a placeholder is the highest-value claim in the table and the most exposed to challenge.
4. **fortune-500 at 23.4, 38 entities.** 3.4 points above the Critical/Developing line.
5. **The 35.9 cluster, 198 entities across three indexes** (115 Fortune 500, 55 US cities, 28 countries). Same seed replicated three times, 4.1 points below the Developing/Functional boundary. This is the largest body of work in the table and should be run as one cross-index study so that a single calibration standard applies to all 198. Fortune 500 first, since 115 of the 198 are there.
6. **The 48.4 cluster, 103 entities across three indexes** (83 Fortune 500, 12 US cities, 8 AI labs). Lowest priority of the large clusters: 8.4 points from any boundary is just outside one standard deviation of observed movement, so most members will keep their band label even after de-seeding.

### Two clusters that need a different treatment

- **countries at 0.0, 12 entities on a flat 1.0 vector.** A composite of exactly 0 triggers the harm-flag override in the scoring formula. Twelve entities on an identical all-ones vector is either twelve deliberate harm flags or one seed applied twelve times, and the index cannot currently tell you which. This should be resolved by inspection of the provenance records before any assessment work, not by re-scoring. The band label is safe at 20 points from the boundary, so it is not urgent, but an unlabelled harm flag is a governance problem rather than a measurement one.
- **global-cities at 7.8, 21 entities.** Far from any boundary, so the label is safe. Worth folding into whichever global-cities study runs, but not worth its own.

---

## 8. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-16.md` | Full 40-subdimension assessment, 12 files |
| `research/assessments/{slug}-2026-08-16.subdims.json` | 40-subdimension sidecar, integer anchors, tier/url/date/quote per item, 12 files |
| `research/change-proposals/algeria.json` | Delta -9.1, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/cameroon.json` | Delta -9.0, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/guinea.json` | Delta -5.9, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/honduras.json` | Delta +6.6, no band change, `flag-for-review`, `pending` |
| `research/change-proposals/papua-new-guinea.json` | Delta +12.8, no band change, `flag-for-review`, `pending` |
| `research/change-proposals/republic-of-congo.json` | Delta -9.7, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/uzbekistan.json` | Delta +7.2, no band change, `flag-for-review`, `pending` |
| `research/change-proposals/zimbabwe.json` | Delta -10.3, band crossing, `flag-for-review`, `pending` |
| `research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md` | This synthesis |

All five band-crossing proposals pass the band-crossing evidence test: at least two independent sources with at least one at evidence tier 4 or above. The test result is recorded in each proposal under `band_change_evidence_test`.

No proposal was filed for Djibouti (-2.8), Mauritania (-2.8), Kazakhstan (+4.1) or Gabon (+4.7). Djibouti and Mauritania nonetheless change band, which is the threshold defect recorded in section 5.

### Reconciliation with pre-existing assessments

Eight of the twelve already carried assessment files from July 2026, all of which returned "confirm" because their deltas fell below the filing threshold. Those runs were not duplicated; they were reconciled against the Uganda and Guinea-Bissau calibration standard and superseded. The most significant reconciliation is **Mauritania**, which a 2026-07-28 run placed at 20.6 by crediting the Tekavoul safety net without weighing the Human Rights Watch migration-abuse report of 27 August 2025 or the state's denial of slavery to UN bodies. Both are scored here, and Mauritania lands at 17.5. Three other July runs — Gabon at 20.0, Papua New Guinea at 20.0 and Zimbabwe at 20.0 — each crossed the band boundary with a delta of only -0.3 and were recorded as confirmations, which is the same threshold defect appearing a month earlier.

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `site/src/data/updates/**` and all daily briefings. Nothing was committed. Uganda and Guinea-Bissau were not re-scored.

---

## 9. Attribution discipline applied

Every country was scored on its own state's conduct. Harm by non-state armed groups, by foreign states and by natural disaster was excluded from the state score, and where such harm occurred what was measured was the state's response.

The rulings that mattered:

- **Papua New Guinea.** The 80-plus inter-ethnic killings in Enga province and the Enga landslide are not scored as state conduct. What is scored is the government's response, including the National Strategy to Prevent and Respond to Gender-Based Violence 2026-2035 and the national clinical guidelines.
- **Cameroon.** Boko Haram violence and separatist armed-group conduct are not scored against Cameroon. The post-election lethal force, mass arrests and torture documented by Human Rights Watch are. Hosting 460,000 refugees from the Central African Republic and Nigeria is scored as a positive.
- **Mauritania and Algeria.** Both expel migrants under European Union externalisation pressure. The pressure is context, not exculpation: the torture, rape, racist treatment and collective expulsions are carried out by these states' own security forces and are scored as their conduct.
- **Djibouti.** The hunger emergency affecting 25 per cent of the population is driven by drought and regional displacement, not by state action. What is scored is the state's response: an open-door refugee policy and inclusion of refugees in national systems, which UNHCR documents and which raises several Djiboutian scores.
- **Honduras.** The Honduras Próspera investor claim is a foreign corporate action. What is scored is Honduras' decision to maintain the special economic zones repeal while bearing a claim worth roughly 60 per cent of its annual budget.

---

## 10. Primary sources

Full source lists with evidence tiers appear in each of the twelve assessment files. The principal sources are:

**Human Rights Watch World Report 2026 country chapters** — Algeria, Honduras, Kazakhstan, Uzbekistan, Zimbabwe.
**Human Rights Watch news reporting** — Cameroon post-election killings (12 November 2025), Guinea activist disappearances (9 July 2025), Mauritania migration control abuses (27 August 2025), Uzbekistan cotton and wheat farmers (16 February 2026) and domestic violence reforms (4 March 2026), Zimbabwe term extension (10 March 2026), student protesters (24 April 2026) and constitutional amendment (8 July 2026).
**Amnesty International** — Algeria detained journalists (May 2026), Guinea FNDC impunity (July 2026), Papua New Guinea and Republic of Congo country reports.
**United Nations** — OHCHR Mauritania and the Special Rapporteur on contemporary forms of slavery, UN News Djibouti hunger alert (17 July 2026), UNHCR Djibouti, UNICEF Uzbekistan Single Registry, UNFPA Papua New Guinea.
**Freedom House** — Freedom in the World 2026, Djibouti.
**Bertelsmann Transformation Index 2026** — Gabon, Mauritania, Republic of Congo, Zimbabwe.
**World Bank** — Uzbekistan social and economic transformation, Republic of Congo poverty, Mauritania and Gabon social protection.
**African Commission on Human and Peoples' Rights** — Cameroon (31 October 2025).
**FIDH** — Guinea, pardon of Moussa Dadis Camara (28 March 2025).
**News agencies** — France 24, Africanews, Al Jazeera, PBS, Xinhua, US News.

**Anchors (not re-scored)**
- `research/assessments/uganda-2026-08-01.md` and `research/change-proposals/uganda-2026-08-01.json`
- `research/assessments/guinea-bissau-2026-07-23.md` and `research/change-proposals/guinea-bissau-2026-07-23.json`

**Method template**
- `research/SAHEL_BAND_CALIBRATION_2026-08-13.md`

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
