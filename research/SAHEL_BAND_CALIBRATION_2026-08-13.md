---
study: "Sahel-band cross-peer calibration"
date: "2026-08-13"
index: "countries"
entities: ["Mali", "Niger", "Chad"]
calibration_anchor: "Burkina Faso (2026-05-31 reweight, composite 6.3) — fixed, not re-scored"
out_of_scope: ["Mauritania"]
resolves_flag: "mali-burkina-faso-cross-peer (open ~38 days)"
flag_disposition: "RESOLVED AND REFRAMED"
proposals_filed: 2
---

# Sahel-Band Cross-Peer Calibration Study

**Date:** 2026-08-13
**Anchor:** Burkina Faso, 2026-05-31 reweight, composite 6.3 out of 100. Fixed. Not re-scored.
**Entities assessed:** Mali, Niger, Chad — full 40-subdimension assessments each.
**Flag addressed:** `mali-burkina-faso-cross-peer`, open roughly 38 days.

---

## 1. What the flag actually was

For 38 days the Compassion Benchmark carried an open calibration flag reading, in effect, "is Mali's 12.5 too high compared to Burkina Faso's 6.3?" Four consecutive Mali cycles refused to resolve it and were right to refuse.

The gap was never an evidence disagreement. It was a **methodology artifact**. Burkina Faso received a real 40-subdimension assessment in May 2026. Its three Sahel neighbours did not. Their published numbers were **seeds** — placeholder values entered when the index was built, never replaced by research.

A seed is easy to spot. It has the same number in every dimension.

| Country | Published composite | Published dimension vector (AWR/EMP/ACT/EQU/BND/ACC/SYS/INT) | Status |
|---|---|---|---|
| Burkina Faso | 6.3 | 1.4 / 1.2 / 1.4 / 1.1 / 1.4 / 1.1 / 1.3 / 1.1 | Genuinely assessed |
| Mali | 12.5 | 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 | **Flat seed** |
| Niger | 12.5 | 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 / 1.5 | **Flat seed** |
| Chad | 10.9 | 1.5 / 1.5 / 1.5 / 1.0 / 1.5 / 1.5 / 1.5 / 1.5 | **Near-flat seed** |

The fix was to de-seed the peers, not to move Mali by decree.

---

## 2. Before and after

All four countries, with Burkina Faso held fixed as the calibration anchor.

### Dimension vectors

| Country | Stage | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT | Composite | Band |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Burkina Faso** | Anchor (unchanged) | 1.4 | 1.2 | 1.4 | 1.1 | 1.4 | 1.1 | 1.3 | 1.1 | **6.3** | Critical |
| **Mali** | Before (seed) | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 12.5 | Critical |
| **Mali** | **After (assessed)** | 1.2 | 1.2 | 1.2 | **1.0** | **1.0** | **1.0** | 1.4 | **1.0** | **3.1** | Critical |
| **Niger** | Before (seed) | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 1.5 | 12.5 | Critical |
| **Niger** | **After (assessed)** | 1.2 | 1.2 | 1.2 | **1.0** | 1.2 | **1.0** | 1.4 | **1.0** | **3.7** | Critical |
| **Chad** | Before (seed) | 1.5 | 1.5 | 1.5 | 1.0 | 1.5 | 1.5 | 1.5 | 1.5 | 10.9 | Critical |
| **Chad** | **After (assessed)** | 1.4 | 1.4 | 1.8 | 1.4 | 1.4 | **1.0** | 1.8 | 1.2 | **10.6** | Critical |

Bold values are at raw 1.0, the absolute floor of the 1–5 anchor scale.

### Composite movement

| Country | Published | Assessed | Delta | Proposal filed? |
|---|---|---|---|---|
| Burkina Faso | 6.3 | — (anchor, not re-scored) | — | No |
| Mali | 12.5 | **3.1** | **-9.4** | Yes — `research/change-proposals/mali.json` |
| Niger | 12.5 | **3.7** | **-8.8** | Yes — `research/change-proposals/niger.json` |
| Chad | 10.9 | **10.6** | -0.3 | No — below the 5.0-point threshold |

All composites computed by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2. For every entity in this study the integration premium is 0, because all eight dimensions sit below 4.0 and the weakness factor therefore reduces to 0. Composite equals base composite throughout. No harm flags (0.0) were applied.

---

## 3. Are the four internally consistent now?

**Yes, on evidence standard and attribution. One residual inconsistency remains, and it belongs to the anchor.**

### What is now consistent

All four use the same anchor interpretations:

- A subdimension scores **1** where the state actively perpetrates harm, actively suppresses information, or has no process at all.
- A subdimension scores **2** only for a residual functioning structure — usually externally funded, such as UN humanitarian tracking — or for a formal position stated in words but disconnected from action.
- Nothing scored above **2** anywhere in the four countries, because no independent verification or community testimony of a working compassion practice was obtainable for any of them.

All four apply the same attribution line. **Harm by non-state armed groups is not scored as state conduct.** This matters enormously in the Sahel and it was applied identically:

- **Burkina Faso (anchor):** correct. Its 2026-05-31 reweight explicitly cited multi-sided perpetration — "HRW attributes crimes to 'all sides'" — as a reason *not* to drop to the 0.0 floor. JNIM harm was not charged to the Burkinabè state.
- **Mali:** the JNIM fuel blockade of Bamako is not scored against Mali. It affects one subdimension only, B1 Self-Sustainability, which measures whether the state has a stable foundation from which to help. That is a capacity fact, not a blame allocation.
- **Niger:** the Islamic State Sahel mosque massacres — at least 46 killed at Fambita in March, over 70 at Manda in June — are not scored against Niger. Niger is scored for the January 2026 military drone strike that killed at least 17 civilians at a market, for detaining former President Bazoum, and for failing to act on warnings it received.
- **Chad:** Boko Haram displacement and the Sudanese civil war are not scored against Chad.

**Finding: Burkina Faso's reweight did not score non-state harm as state conduct.** The task brief asked whether it did. It did not. Its attribution discipline is sound and is the reason it is a usable anchor.

Two Mali-specific attribution rulings were made and should be carried into methodology:

1. **Africa Corps is state conduct.** It is a Russian government paramilitary operating in Mali under contract with the Malian state. Force employed by a state is that state's conduct. Burkina Faso had no equivalent contracted foreign paramilitary in its evidence base.
2. **Dozo militias are state conduct** where Human Rights Watch places them firing alongside Malian soldiers at the same incident.

### The one residual inconsistency — and it is the anchor's

Burkina Faso's reweight used **half-point subdimension scores** at seven places (EQ5, B3, B5, S1, S2, S4, I2 all at 1.5 out of 5). The methodology's sidecar contract specifies raw 1–5 **integer** anchor values. Mali, Niger and Chad were scored on-grid with integers, as the contract requires.

This has an arithmetic consequence. The mean of five integers on a 1–5 scale must be a multiple of 0.2. **Burkina Faso's published EQU 1.1, ACC 1.1, SYS 1.3 and INT 1.1 are off-grid — they are not reachable by the 40-subdimension methodology at all.**

There is also a plain arithmetic error. Burkina Faso's ACC dimension is published at 1.1, but its own subdimension table lists AB1 through AB5 all at 1 out of 5. Five ones average 1.0, not 1.1. **Correcting that single error alone moves Burkina Faso from 6.3 to 5.9.**

A third issue is anchor application, not arithmetic. Burkina Faso's A5 Anticipatory Awareness scored 2 with the stated reason "drone strikes on markets show 'little or no concern for civilian harm' — anti-anticipatory." That reasoning describes the 1 anchor, not the 2 anchor. Mali and Niger were scored 1 on A5 for materially identical drone-strike evidence.

**Net effect:** a clean, on-grid re-run of Burkina Faso would land somewhere in the 4 to 6 range rather than 6.3. Burkina Faso remains a usable anchor — its evidence standard and attribution are sound and were reproduced faithfully — but it is inflated by roughly half a point of arithmetic and grid non-compliance. **Burkina Faso is not re-scored in this study, as instructed.** An on-grid re-run is recommended as follow-up.

---

## 4. New rank ordering within the Critical band

### Within the four-country Sahel group

| Rank (worst first) | Before de-seeding | After de-seeding |
|---|---|---|
| 1 (worst) | Burkina Faso 6.3 | **Mali 3.1** |
| 2 | Chad 10.9 | **Niger 3.7** |
| 3 | Mali 12.5 | **Burkina Faso 6.3** |
| 4 | Niger 12.5 | **Chad 10.6** |

**The ordering inverts.** The seed made Mali and Niger appear roughly twice as good as Burkina Faso. On evidence they are at least as bad and, on the specific record, worse: Mali has a contracted foreign paramilitary credibly implicated in war crimes, the first confirmed use of Russian-made cluster munitions in the country, and a besieged capital; Niger has detained an elected president for three years and rewrote detention law retroactively to keep an activist in prison.

### Position in the full countries index

Based on the current published table of 193 countries:

- **Mali (3.1)** would move from rank 160 to approximately **rank 180**, sitting between Iran (2.5) and the 4.7 cluster (Central African Republic, Ethiopia, Haiti, Libya, Somalia).
- **Niger (3.7)** would move from rank 161 to approximately **rank 179**, immediately above Mali.
- **Chad (10.6)** would move from rank 163 to approximately **rank 164**, slipping just below Qatar (10.9).
- **Burkina Faso** holds at 6.3, rank 174 — but is now the *third* worst of the four rather than the worst.

All four remain in the Critical band. No band crossings occur.

---

## 5. Is the flag resolved?

### **RESOLVED — AND REFRAMED.**

**Resolved:** the Mali-versus-Burkina-Faso gap is closed. It was a seed artifact, exactly as four Mali cycles suspected but could not fix alone. Mali and Niger now carry evidence-based differentiated vectors and both sit below Burkina Faso. Proposals are filed. The flag can be closed on Mali.

**Reframed, in three ways.**

**First, the defect class is not Sahel-specific. It is index-wide.** Scanning the published countries index turns up seed clusters everywhere:

| Composite | Countries at the identical value | Vector shape |
|---|---|---|
| 20.3 | **14 countries** — Algeria, Cameroon, Djibouti, Gabon, Guinea, Guinea-Bissau, Honduras, Kazakhstan, **Mauritania**, Papua New Guinea, Republic of Congo, Uganda, Uzbekistan, Zimbabwe | 2/2/2/1.5/2/1.5/2/1.5 |
| 12.5 | 4 countries — Cambodia, Iraq, **Mali**, **Niger** | flat 1.5 |
| 9.4 | 5 countries — Azerbaijan, Bahrain, Equatorial Guinea, Eswatini, Saudi Arabia | seed shape |
| 7.8 | 3 countries — Burundi, Nicaragua, Tajikistan | seed shape |
| 4.7 | 5 countries — Central African Republic, Ethiopia, Haiti, Libya, Somalia | seed shape |

Fourteen countries sharing one composite to the decimal is not a research finding. It is one seed applied fourteen times.

**Second, and more urgent: the 20.3 cluster straddles a band boundary.** The Critical band ends at 20.0 and Developing begins at 20.1. Those 14 countries sit at 20.3 — **0.3 points above the boundary, on a seed.** They are published as "Developing" rather than "Critical" because of a placeholder, and Developing is a materially different public claim. Any one of them that assesses even slightly below its seed crosses a band. This is the highest-severity instance of the defect found.

**Third, the true defect is not Burkina Faso's reweight.** The task brief asked directly whether it might be. Answer: **no, but partially.** Burkina Faso's evidence standard and attribution discipline are sound and were the correct basis for calibrating three peers. Its arithmetic is not: a published ACC of 1.1 against a subdimension table averaging 1.0, plus seven off-grid half-point subdimension scores that make four of its eight dimension values unreachable by the methodology. That inflates Burkina Faso by roughly half a point. It is a real defect and it should be fixed, but it explains about 0.4 points of a 6.2-point gap. **The peers' seeds explain the other 5.8.**

---

## 6. Niger assessment-artifact traceability finding

The task brief flagged a suspicion that **no `research/assessments/niger*.md` file exists at all**, which would make Niger's referenced 8.8 a score with no assessment record.

**That suspicion is incorrect. The real defect is different, and worse.**

**Niger has five assessment files on disk:**

| File | Composite returned | Sidecar | Outcome |
|---|---|---|---|
| `research/assessments/niger-2026-06-12.md` | — | No | — |
| `research/assessments/niger-2026-06-13.md` | — | No | — |
| `research/assessments/niger-2026-07-26.md` | 8.8 | **Yes** | Confirmed 12.5 |
| `research/assessments/niger-2026-07-31.md` | 8.8 | **Yes** | Confirmed 12.5 |
| `research/assessments/niger-2026-08-01.md` | 8.8 | **Yes** | Confirmed 12.5 |

The three July and August files each contain a complete, well-sourced, 40-subdimension sidecar built on Human Rights Watch's 23 July 2026 report on three years of military rule. Each returned a composite of 8.8. Each computed a difference of -3.7 against the published 12.5. **Each fell below the 5.0-point threshold required to file a change proposal, so no proposal was filed and the seed survived.**

The 1 August file states the position openly: *"This is the third flag on one report… No third downgrade is applied for the same report."*

**The traceability defect, stated plainly: Niger was correctly assessed three times, and the wrong number stayed published all three times, because every honest correction was individually too small to file.** A seed set too high is self-protecting. It cannot be corrected by routine cycles.

Two secondary findings:

- **Niger is not Nigeria.** The two are separate countries with separate index records. Nigeria has 33 assessment files under slug `nigeria` and 6 change proposals; none were touched by this study. The `nigeria-*.md` file abundance may be what created the impression that Niger's records were missing.
- **Chad reproduces the same defect in a harder-to-detect form.** Chad's de-seeded composite is 10.6 against a published 10.9 — a difference of only 0.3 points, comfortably below threshold, so no proposal is filed. But the dimension vector underneath changed a great deal: Equity rose from 1.0 to 1.4 (Chad hosts over 1.5 million refugees under a 2020 Asylum Law and is Africa's largest refugee host per capita), while Accountability fell from 1.5 to the 1.0 floor (an amnesty law shields the perpetrators of the October 2022 protest killings, in which roughly 200 people died). **Two large, opposite errors cancelled out.** A composite-only threshold test cannot see this.

### Recommended pipeline fixes

1. **Exempt flat-seed entities from the 5.0-point proposal threshold.** Where a published dimension vector has zero or near-zero variance, any completed 40-subdimension assessment should be filable regardless of composite delta.
2. **Add a dimension-vector change test alongside the composite test.** Chad's vector changed materially while its composite moved 0.3 points. The current rule discards that.
3. **Add a seed detector to index validation.** Flag any entity whose eight dimension values have a standard deviation below about 0.1, and any composite value shared by three or more entities to one decimal place.
4. **Enforce integer subdimension anchors.** Reject any dimension value that is not a multiple of 0.2, which would have caught Burkina Faso's off-grid 1.1 and 1.3 at validation time.

---

## 7. Mauritania — same defect, deliberately out of scope

**Mauritania is published at 20.3 out of 100, band Developing, rank 142.** Its vector is 2.0 / 2.0 / 2.0 / 1.5 / 2.0 / 1.5 / 2.0 / 1.5 — the classic seed shape, with one value repeated across five dimensions and a second repeated across three.

Mauritania was **deliberately excluded** from this study. It is a different case class from the four assessed here: it is not a military junta in an active jihadist insurgency, and folding it in would have contaminated the Sahel-band comparison the study was commissioned to make.

It should be assessed next, and with priority, for one reason: **Mauritania sits 0.3 points above the Critical/Developing band boundary on a placeholder.** The benchmark currently tells the public that Mauritania is "Developing" rather than "Critical" on the strength of a seed. And Mauritania is not alone — thirteen other countries share the identical 20.3 seed in the same position.

A single Mauritania assessment file already exists, `research/assessments/mauritania-2026-07-28.md`, with a sidecar. It should be checked against this study's calibration standard before any new work begins, in case it too was blocked by the threshold rule.

**Recommendation:** commission a **20.3-cluster de-seeding study** covering all 14 countries at that value, using the same fixed-anchor method used here. That is the highest-value remaining calibration work in the countries index, because it is the only known seed cluster that changes a published band.

---

## 8. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/mali-2026-08-13.md` | Full 40-subdimension assessment, composite 3.1 |
| `research/assessments/mali-2026-08-13.subdims.json` | 40-subdimension sidecar, integer anchors |
| `research/assessments/niger-2026-08-13.md` | Full 40-subdimension assessment, composite 3.7 |
| `research/assessments/niger-2026-08-13.subdims.json` | 40-subdimension sidecar, integer anchors |
| `research/assessments/chad-2026-08-13.md` | Full 40-subdimension assessment, composite 10.6 |
| `research/assessments/chad-2026-08-13.subdims.json` | 40-subdimension sidecar, integer anchors |
| `research/change-proposals/mali.json` | Proposal, delta -9.4, `flag-for-review`, `pending` |
| `research/change-proposals/niger.json` | Proposal, delta -8.8, `flag-for-review`, `pending` |
| `research/SAHEL_BAND_CALIBRATION_2026-08-13.md` | This synthesis |

No proposal was filed for Chad (delta -0.3, below the 5.0-point threshold).

### Files deliberately not touched

`research/rotation-state.json`, `research/PENDING_CHANGES.md`, `site/src/data/indexes/*.json`, the daily briefing, and all 20 slugs in flight on the 2026-08-11 overnight-assessor cycle. Nothing was committed. Burkina Faso was not re-scored.

---

## 9. Primary sources

**Mali**
- Human Rights Watch, "Mali: Grave Abuses Amid Renewed Fighting," 28 June 2026 — https://www.hrw.org/news/2026/06/28/mali-grave-abuses-amid-renewed-fighting
- Human Rights Watch, World Report 2026: Mali — https://www.hrw.org/world-report/2026/country-chapters/mali
- Human Rights Watch, "Mali: Army, Wagner Group Disappear, Execute Fulani Civilians," 22 July 2025 — https://www.hrw.org/news/2025/07/22/mali-army-wagner-group-disappear-execute-fulani-civilians
- Global Centre for the Responsibility to Protect, Mali — https://www.globalr2p.org/countries/mali/
- UN OCHA, Mali 2026 Humanitarian Needs and Response Plan — https://www.unocha.org/publications/report/mali/mali-2026-humanitarian-needs-and-response-plan-executive-summary

**Niger**
- Human Rights Watch, "Niger: 3 Years of Military Rule Deepens Human Rights Crisis," 23 July 2026 — https://www.hrw.org/news/2026/07/23/niger-3-years-of-military-rule-deepens-human-rights-crisis
- Human Rights Watch, World Report 2026: Niger — https://www.hrw.org/world-report/2026/country-chapters/niger
- Human Rights Watch, "Niger: Islamist Armed Group Massacres Villagers in West," 12 February 2026 — https://www.hrw.org/news/2026/02/12/niger-islamist-armed-group-massacres-villagers-in-west
- Global Centre for the Responsibility to Protect, Niger — https://www.globalr2p.org/countries/niger/

**Chad**
- Human Rights Watch, World Report 2026: Chad — https://www.hrw.org/world-report/2026/country-chapters/chad
- Human Rights Watch, "One Year on Since Arrest of Opposition Leader in Chad," 15 May 2026 — https://www.hrw.org/news/2026/05/15/one-year-on-since-arrest-of-opposition-leader-in-chad
- Human Rights Watch, "Chad: 20-Year Sentence for Opposition Leader," 12 August 2025 — https://www.hrw.org/news/2025/08/12/chad-20-year-sentence-for-opposition-leader
- UN News, "Chad: Africa's refugee haven struggles with its own stark challenges," February 2026 — https://news.un.org/en/story/2026/02/1166904
- ISS Africa, "Crackdown on Chad's opposition threatens a return to one-party rule," 28 May 2026 — https://issafrica.org/iss-today/crackdown-on-chad-s-opposition-threatens-a-return-to-one-party-rule

**Anchor (not re-scored)**
- `research/assessments/burkina-faso-2026-05-31.md` — the reweight
- `research/assessments/burkina-faso-2026-07-12.md` — most recent confirmation, carrying the calibration flag

---
*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
