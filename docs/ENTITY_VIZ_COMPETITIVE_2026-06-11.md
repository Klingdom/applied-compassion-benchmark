# Entity Viz Competitive Analysis — 2026-06-11

Research artifact for the Compassion Benchmark entity detail page improvement sprint.
Scope: how leading benchmark/index institutions visualize a single entity's profile.
Constraint: all proposed mechanics must be static-export-safe, own-data SVG, CC-BY licensed, no third-party imagery hosted.
Authored by competitive-researcher (read-only); persisted by coordinator.

---

## Part 1 — Comparator Mechanic Inventory

| Comparator | Mechanic observed | Reader question answered | Notes / independence implication |
|---|---|---|---|
| **Transparency International CPI** | Score number + 90% confidence interval bracket; composite drawn from 3–13 independent sources, each shown as a dot/bar; trend line 1995→present with band shading | "How certain is this score?" / "What drives it?" / "Is this country getting better or worse?" | CPI source bars are their own computed data — own-data SVG safe. Trend line requires multi-year history. |
| **Freedom House FitW** | Two-pillar split (Political Rights 0–40 / Civil Liberties 0–60) as fractional score pairs; 7 sub-category scores (A–G); status badge (Free/Partly Free/Not Free); year-over-year delta | "What exactly pulls the headline score?" / "Did this change year over year?" | Simple numeric layout, no proprietary imagery. All computable from our dimension scores. |
| **Yale EPI** | Per-dimension table: Rank / Score / 10-Year Delta with +/− sign and color; hierarchical drill-down; peer-group comparison | "Where am I weak?" / "Am I improving?" / "How do I compare to similar countries?" | Rank-score-delta triple is the most replicable pattern in the research. Pure own-data. |
| **V-Dem Country Graph / Radar** | Time series with colored uncertainty bands; octagonal spider chart, 2 years overlaid | "How confident over time?" / "What is the profile shape?" / "How did the shape change?" | 8-axis radar maps directly to our 8 dimensions. Uncertainty band needs a stored confidence value. |
| **World Benchmarking Alliance** | Hierarchical scorecard (overall → area → indicator → element); two-axis peer scatterplot | "How do I compare to sector peers?" / "Which area drags my overall?" | Two-axis peer scatter is distinctive. Needs pre-computed sector peer set — we have sector/hq metadata. |
| **MSCI ESG** | AAA–CCC spectrum bar with entity position + peer industry distribution histogram; weighted key-issue bars (width=weight, fill=score); 5 closest peers; rating-history timeline | "Where do I sit vs my industry?" / "Which issues weigh most?" / "Did my rating improve?" | Spectrum bar with peer histogram is high-signal. Weighted issue bars ≈ our dimensions × subdim weights. |
| **Social Progress Index** | 3-dimension, 12-component radar scorecard; economic peer comparison; 14-year series | "What is my shape vs peers at similar GDP?" / "Am I a structural outlier?" | Peer grouping variable (sector/region/band) all computable from existing metadata. |
| **Our World in Data Grapher** | Entity-focus mode; shareable SVG/PNG/CSV export per chart; embed iframe | "What is this entity's trend in global context?" / "Can I cite/embed this?" | Embed/cite is a distribution amplifier. Static SVG export per entity page is buildable. |
| **EIU Democracy Index** | 5-category breakdown (0–10); regime-type badge; five-category spider; YoY delta per category | "What regime type?" / "Which category holds it back?" | Regime badge = our Band. Category delta = dimension delta. Direct analogy. |

---

## Part 2 — Ranked Adaptable Mechanics

Scoring: Priority = (Impact + Strategic Alignment + Learning Value + Confidence) − (Effort + Risk).

1. **Dimension score + inline Δ delta column** (Yale EPI) — signed change since last assessment per dimension. Answers "improving?" instantly. Needs per-dimension delta storage. Effort 2. **Priority 15.**
2. **8-axis radar / profile-shape polygon** (V-Dem, EIU, SPI) — static SVG spider, 8 axes 0–5, entity polygon + faint sector-average overlay. Most information-dense single graphic for 8 dimensions. Effort 3. **Priority 14.**
3. **Score spectrum bar with sector rug** (MSCI ESG) — 0–100 band-divided bar, entity tick, rug of every sector peer. Replaces rank text with distribution context. Effort 2. **Priority 14.**
4. **Score-history sparkline with band-transition markers** (V-Dem, EIU) — inline 180px sparkline in hero; band crossings as circles; `bandChange` already in data. Effort 2. **Priority 13.**
5. **Evidence-source dot plot** (CPI) — dot plot of every past assessed score, published score as a vertical line; spread = confidence. Brand-defining; no other benchmark surfaces this. Effort 4 (data extension). **Priority 12.**
6. **Subdimension anchor expandable panel** (Freedom House, WBA) — `<details>` per dimension showing 5 subdim scores + behavioral anchor text. Makes scores falsifiable. Effort 4 (40 subdim scores/entity). **Priority 11.**

---

## Part 3 — Reviewed but not recommended (now)
- Downloadable PDF scorecard (SPI) — production cost > signal; not a visualization.
- Interactive map / entity highlight (OWID) — needs JS hydration; fights `output: 'export'`.
- Two-axis peer scatter (WBA) — our 8 dimensions are correlated; picking 2 axes is arbitrary today.
- V-Dem uncertainty bands — needs multiple independent scorers per entity; not in our model.
- Two-year radar overlay — needs per-dimension history across years; we have composite history only.

---

## Sources consulted
- Transparency International CPI 2024 — transparency.org/en/cpi/2024 ; how-cpi-scores-are-calculated
- Freedom House FitW 2026 (United States) — freedomhouse.org/country/united-states/freedom-world/2026 ; /country/scores
- V-Dem Country Graph — v-dem.net/data_analysis/CountryGraph/ ; Radar — /RadarGraph/
- Yale EPI 2022 (USA) — epi.yale.edu/epi-results/2022/country/usa ; /about-epi
- Social Progress Index 2026 — socialprogress.org/social-progress-index ; /methodology-2024-index
- MSCI ESG Ratings — msci.com/data-and-analytics/sustainability-solutions/esg-ratings ; nossadata.com/blog/msci-esg-rating-explained
- World Benchmarking Alliance — worldbenchmarkingalliance.org/company-scoreboard ; /documentation/user-guide
- Our World in Data — ourworldindata.org/redesigning-our-interactive-data-visualizations ; /how-to-embed
