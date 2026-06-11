# Graphics Review — Competitive Dataviz + Evidence-Image Norms (2026-06-11)

> Authored by competitive-researcher. Persisted by coordinator (returned inline). Two classes: (A) data-derived charts from own data; (B) evidence images from sources (copyright/provenance-heavy).

## Comparators → visual mechanic / image-rights practice
| Org | Visual mechanic | Image-rights practice |
|---|---|---|
| Our World in Data | Embeddable line/bar/choropleth; archived-snapshot embeds; source on every chart | All charts CC-BY; third-party data per original license |
| Freedom House | Band choropleth (Free/Partly/Not Free); 0–100 bars; map packs | Institutional ©; data for research w/ attribution |
| Transparency Intl CPI | 10-band choropleth; regional callouts; downloadable map PDF | Map © TI; data CC-BY-SA |
| V-Dem | Variety radar; 68% CI uncertainty bands | CC-BY, fully open |
| EIU Democracy Index | Tri-mode (map/table/line); regime bands; multi-yr sparklines | © EIU; data via subscription/OWID |
| World Benchmarking Alliance | Hierarchical scorecard; Data Explorer; CSV | Open per benchmark; methodology CC-BY |
| MSCI ESG | AAA–CCC grade; E/S/G pillar bars; severity scorecards | Proprietary/subscription |
| FT Visual Vocabulary / Burn-Murdoch | 9-category chart grammar; small multiples; annotated narrative titles | FT proprietary; Visual Vocabulary MIT on GitHub |
| Reuters / Flourish | Distribution histograms; scrollytelling; static PNG/SVG export | Editorial-use-only; Flourish credit on free tier |
| Bellingcat | Per-incident evidence cards w/ geolocation + metadata scheme; Datawrapper | Mnemonic archive: download→SHA-256→vault; Hunchly chain-of-custody |
| Amnesty Evidence Lab | Before/after satellite pairs; annotated overlays; corroboration matrix | Satellite **licensed** (Maxar/Planet) + attributed; not embedded |
| Forensic Architecture | 3D reconstructions; geolocation overlays; court-admissible provenance | Open methodologies; acquisition dates logged |

## Adaptable mechanics (Class A unless noted)
1. **Distribution strip / percentile bar** — where an entity sits in the field, band regions colored (FT/V-Dem). Answers "28.4 — is that bad?" Pure SVG. → **16**
2. **Dimension bar breakdown** (8 bars, band-colored) — composite → visible methodology (WBA/MSCI). Tailwind/SVG. → **14**
3. **Build-time OG social card** (Satori + resvg in a prebuild script; per briefing/entity PNG; `og:image` is currently empty). → **13**
4. **Evidence provenance block** (source · type · date · archived URL · license note — Bellingcat scheme; text+links only). → **13**
5. **Dimension radar** (entity pages; ≤8 axes; document the area-misleads caveat). → **10**
6. **Annotated event sparkline** (methodology-event labels on the trajectory; Burn-Murdoch: annotation > complexity). → **12**
7. **Chart-of-the-Day distribution pull-out** (one standalone narrative chart/day; OWID/Graphic Detail). → **13**
8. **OSM choropleth** (own band colors on CC-BY-SA OSM tiles; attribution required). → **9**

## Evidence-image licensing/provenance NORMS (the crucial output)
- **Class A (own charts/maps):** your IP — publish **CC-BY** "Compassion Benchmark / compassionbenchmark.com". No constraint. (OWID model.)
- **Class B (third-party photos/satellite/wire):** AP/Reuters/Getty = editorial-license-only, **do NOT host/embed even with attribution**; satellite (Maxar/Planet) = commercial license; gov/UN often public-domain/CC but check per image. **Link to originals; do not republish.**
- **Class C (screenshots/doc excerpts):** fair-use-for-commentary reasoning is strongest here — attribute, minimal excerpt, link, archive.
- **Defensible practice:** never host third-party licensed images → link via the existing `SourceChip`; for every cited source store a **Wayback/archive.ph snapshot** ("Archived: [date]"); render a structured **evidence provenance block**; for maps use **OSM tiles (CC-BY-SA)** to own the production chain; tag own charts CC-BY. (Forward-looking: C2PA content-credentials manifest on generated charts.)
- **Prohibited:** AI-generated imagery, stock-as-documentary, untraceable screenshots, any image without a verifiable CC0/CC-BY license or own-generation provenance.

## Top 3 adaptable + recommendation
1. **Distribution strip** (16) — highest-impact, lowest-effort, zero-risk; answers the universal "compared to what?" gap.
2. **Dimension bar breakdown** (14) — composite → visible, multi-dimensional methodology.
3. **Build-time OG social card** (13) — closes the empty-`og:image` shareability gap.
**Evidence-image norm:** produce only Class A visuals; **link-only** to third-party images via SourceChip + archived snapshot; verbatim pull-quote (already shipped F2) is the human anchor a photo would serve, with zero copyright exposure.

Sources: ourworldindata.org/how-to-embed · freedomhouse.org (FIW methodology) · transparency.org/cpi · v-dem.net (methodology) · worldbenchmarkingalliance.org · msci.com (ESG methodology) · github.com/Financial-Times/chart-doctor · datawrapper.de/blog/colors-for-data-vis-style-guides · help.flourish.studio · reutersinstitute.politics.ox.ac.uk (Bellingcat) · gijn.org (Amnesty satellite tips; Burn-Murdoch) · c2pa.wiki · creativecommons.org · gettyimages.com/company/editorial-policy · hrw.org/permissions · vercel.com (Satori/OG) · github.com/vercel/satori.
