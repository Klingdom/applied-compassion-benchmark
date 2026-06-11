# Graphics on /updates — Consolidated Plan (2026-06-11)

Goal: add evidence images / graphs / graphics to the daily briefing. Consolidated from five lenses (frontend/UX/PM/knowledge/competitive: `docs/GRAPHICS_REVIEW_*_2026-06-11.md`).

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

---

## Two unanimous conclusions

### 1. The evidence-image POLICY (decided — all five lenses agree)
**Own-generate everything you host; never host third-party images; link to source images instead.** Hosting AP/Reuters/Getty/satellite imagery = copyright/license violation (proxying doesn't change that), and image *selection* would expose the benchmark to bias/fabrication attacks — existential for an independence-first institution. The defensible 4-tier practice:
1. **Own-generated, hosted** — data-derived SVG charts/maps (this is your IP; tag **CC-BY** "Compassion Benchmark").
2. **Verbatim text as the visual anchor** — the F2 pull-quote (already shipped) is the "human anchor" a photo would serve, with zero copyright risk.
3. **Link-only, never hosted** — third-party photos/satellite/screenshots, via the existing `SourceChip` + a **Wayback/archive snapshot** ("Archived: [date]").
4. **Prohibited** — AI-generated imagery, stock-as-documentary, untraceable screenshots, anything without verifiable CC0/CC-BY or own provenance.
**Guard:** add a schema/render gate that blocks inline `<img>` unless an explicit `license` (cc0/cc-by) field is present. This policy is a *positioning strength*, not a concession.

### 2. The opportunity is DATA-DERIVED CHARTS (Class A) — cheap, hand-rolled SVG, no new deps
The briefing is text + one small sparkline. A handful of small SVG charts from the benchmark's **own** scores/dimensions/history turn abstract numbers into instant understanding, are citable/embeddable, and carry zero licensing risk. The `ScoreSparkline` primitive (Wave C) is the proven pattern to extend.

---

## Ranked backlog

### Wave G1 — The comprehension core (cheap own-data SVG; build first)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 1 | **Band-position / distribution strip** — a 0–100 track segmented into the 5 band zones with the entity's marker; answers "is 18.4 bad? compared to what?" and teaches the band model. Doubles as the boundary-proximity gauge. | Knowledge 16 · Competitive 16 · UX 14 | **16** | Low |
| 2 | **8-dimension profile bar** ("the shape of a score") — 8 band-colored bars (AWR…INT), before/after on a delta; shows WHERE an entity failed/held (e.g. UAE: integrity craters, BND holds). In a `<details>` so it costs 0 height closed. | UX 15 · Knowledge 14 · Competitive 14 · Frontend 13 | **15** | Low-Med |
| 3 | **Expanded score-over-time chart** — extend `ScoreSparkline` to a band-zone-shaded timeline + crossing marker + "−5.0 · Developing→Critical" caption; render on lead/boundary signals. | UX 16 · PM 16 · Frontend 14 | **16** | Low |
| 4 | **Sparklines in ScoreMovementDashboard** (3-line reuse of ScoreSparkline for every assessed entity) | Frontend 14 | 14 | Trivial |
| 5 | **Delta bullet** on ScoreMovementCard (published/assessed positions + nearest boundary tick) | Frontend 15 | 15 | Low |

### Wave G2 — The signature visual + shareability
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 6 | **Band-distribution bar** — all 1,160 entities across the 5 bands (the "state of the field"); unique to this institution (no comparator shows govts+corps+labs+cities together); the quiet-day anchor + a "state of the world" social artifact | PM 15 · Knowledge 14 | 15 | Low |
| 7 | **Build-time OG social cards** (Satori + resvg prebuild script → per-briefing/entity PNG: name, score, band, delta, sparkline). `og:image` is currently **empty** — every shared link is blank. Static-export-safe (build script, not edge). | PM 13 · Competitive 13 · Frontend (expensive) | 13 | Med |
| 8 | **"Chart of the Day"** — one standalone narrative chart per briefing with a bold headline ("Bolivia's drop puts it below 93% of countries") + copy-embed/citation (OWID/Graphic-Detail model) | Competitive 13 · PM | 13 | Med |

### Wave G3 — Provenance + maps + reach
| # | Item | Lens(es) | Score |
|---|------|----------|-------|
| 9 | **Evidence provenance block** (source · type · date · **archived URL** · license note) + Wayback/archive snapshotting in the pipeline | Competitive 13 · PM | 13 |
| 10 | **Dimension radar** on entity pages (≤8 axes; document the area-misleads caveat) | Competitive 10 | 10 |
| 11 | **OSM choropleth** per country-index (own band colors on CC-BY-SA tiles, attributed) | Competitive 9 | 9 |
| 12 | **License-gated inline `<img>`** for the rare CC0/own image (the policy guard) | Frontend | — |

## Recommended sequencing
- **Wave G1 first** — the comprehension core, all cheap hand-rolled SVG from own data, extending the existing ScoreSparkline pattern. The two "teach the benchmark" visuals (#1 band-position + #2 dimension profile) + the expanded trajectory (#3) are the heart; #4/#5 are near-free add-ons. Respect Wave E1 density (charts in `<details>` / compact / earn their space) and graceful degradation (entities without history).
- **Wave G2** — the band-distribution signature visual (#6, great on quiet days) + the OG cards (#7, the shareability unforced error).
- **Wave G3** — provenance/archiving (#9), maps (#11), the inline-image license guard (#12).

## Independence / integrity
All Class A items PASS and *strengthen* independence (visual layer fully reproducible from own scored data — no image-selection, copyright, or fabrication exposure). The evidence-image policy (link-only third-party + license-gate) is the safeguard. Charts tagged CC-BY encourage citation while preserving attribution.

## Single highest-leverage move
**Build the band-position strip (#1) + the 8-dimension profile bar (#2) + the expanded trajectory chart (#3)** — three small SVG primitives from own data that turn the briefing's abstract numbers into "where it sits / why it moved / how it got there", at low effort and zero licensing risk. Pair with the **link-only evidence-image policy** so third-party imagery is cited, never hosted.
