# Traffic & Engagement — Consolidated Growth Plan (2026-06-15)

Consolidated from six lenses: acquisition (`GROWTH_ACQUISITION_*`), engagement (`GROWTH_ENGAGEMENT_*`), measurement (`GROWTH_MEASUREMENT_*`), competitive (`GROWTH_COMPETITIVE_*`), organic/AEO (`GROWTH_SEO_*`), audience (`GROWTH_AUDIENCE_*`).

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**. Independence-first throughout (no pay-for-inclusion, no dark patterns; authority is earned).

---

## The convergent diagnosis
The institution has **world-class supply** (1,160 entity pages, daily + special briefings, 7 indexes, CC-BY charts, feeds, OG cards, a strong schema base) but **leaks the demand it already earns**:
- **The plumbing that connects supply to audience is broken or unplaced** — the RSS feed emits "0 score changes" in every item; the newsletter ask fires before the reader has read anything; the entity pages (the largest organic landing surface) are **dead-ends** that discard their own computed peer data; and analytics/GSC may be silently un-wired (all baselines = 0 for the wrong reason).
- **The organic long-tail is half-activated** — `sameAs` seeded for 193 countries but **0 of the other 967 entities**; index titles don't match the superlative head terms; no FAQ/explainer supply for informational queries.
- **No amplifier moment** — daily cadence is high-frequency/low-amplitude; there's no signature annual report, no "For Media"/cite path, no embed flywheel.

Every comparator that broke out (OWID, Pew, CPI, Freedom House, V-Dem) runs the **same five-mechanic system**: a predictable launch moment + embeddable data + a newsletter habit loop + entity pages that own the long-tail + Wikipedia/citation presence. We have the raw material for all five.

**Priority audiences:** (1) **AI-governance researchers** — no ESG comparator covers AI labs at any price; this is a unique, defensible moat with a 12–18-mo window. (2) **Journalists** — the amplifier for everyone else. (3) ESG/corporate-accountability analysts — the revenue segment, sequenced after authority is built.

---

## Wave G0 — Unblock the plumbing (do FIRST; hours, near-zero risk, unblocks measurement + journalists + subscribers)
*Nothing downstream is measurable or compounding until these ship.*

| # | Move | Lens(es) | Effort | Priority |
|---|------|----------|--------|----------|
| G0.1 | **Fix the RSS/JSON feed serialization bug** — every item reads "0 formal score changes across 0 entities" (`pipeline.entitiesScanned`=0 in the XML) though the briefing JSON has the content; kills the journalist/syndication channel | acquisition, audience | S (~45 min) | **16** |
| G0.2 | **Move newsletter capture to the briefing CompletionBlock** (`source=updates-completion`) — ask at peak demonstrated interest, not before the read | acquisition, measurement | S | **16** |
| G0.3 | **Confirm analytics is actually live** — verify `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is in the Docker build (else every event is a silent no-op) + drop **GSC + Bing verification** tokens in `site/public/` | measurement | S | **15** |
| G0.4 | **Instrument the missing events** — wire `briefing_read_depth` (ReadingProgress), `citation_copied`, `section_nav`, `newsletter_subscribed.source`, `score_watch_click`, define `embed_cited` (constants already exist) | measurement | S–M | **14** |
| G0.5 | **Fix newsletter cadence/copy mismatch** — CTA says "Friday briefing" but it's daily; entity capture uses generic copy on the highest-intent surface → entity-matched line (`source=entity-<slug>` already wired) | engagement, audience | S | **13** |

## Wave G1 — Entity pages → hubs + organic capture (the compounding core)
| # | Move | Lens(es) | Effort | Priority |
|---|------|----------|--------|----------|
| G1.1 | **"Compare across the field" hub block on entity pages** — turn the already-computed cohort/peer data (currently a dead, un-clickable SVG) into linked closest-peers + nearest-rank neighbours + index top/floor chips. The 1,160 dead-ends become hubs (pages/session ↑, long-tail discovery ↑) | engagement #1, competitive #1, SEO G5 | M | **16** |
| G1.2 | **Seed `sameAs` for the 967 non-country entities** (companies + AI/robotics labs first — 547) — the pipeline already ships (`entity-identifiers.json` sidecar + verified-or-omit protocol); only countries done. The #1 AEO leak, now ×967 | SEO G1, competitive #5 | M (verification) | **15** |
| G1.3 | **Superlative index titles + answer block ×7** — `<title>` still "World Countries Index 2026"; change to "Most & Least Compassionate Countries 2026 …" + replicate the answer-first block to all 7 | SEO G3, audience | S | **14** |
| G1.4 | **`FAQPage` on entity + index pages** (real Q&A only) — wins AI Overviews / Perplexity / ChatGPT citations + the click-through | SEO G2, competitive #5 | M | **14** |
| G1.5 | **Per-dimension explainer pages** (`/methodology/dimensions/<code>`) — real `dimensions.ts` substance; owns the informational query class | SEO G4 | M | **11** |

## Wave G2 — Distribution & authority (the amplifiers)
| # | Move | Lens(es) | Effort | Priority |
|---|------|----------|--------|----------|
| G2.1 | **"For Media" / cite page + cite-string on every briefing & chart** — journalists need a formatted citation, an embed, a methodology one-pager, a contact path; none exist as a resource | acquisition #5, audience #2 | M | **14** |
| G2.2 | **Score-Watch retention hook** — unblock the killer return loop (currently a `TODO` Gumroad URL routed to manual contact-sales) **+ a free "Follow this entity" rung** | engagement #2 | M (+ founder/ops) | **13** |
| G2.3 | **Weekly "Compassion Score Watch" newsletter digest** + a finite "7-day" email course (Pew's 60%-open model) — converts one-time visitors to weekly returners (OWID: 4× visit frequency) | acquisition, competitive #4 | M | **13** |
| G2.4 | **CC-BY embed + "Cite this chart" flywheel** — every embed = a "via Compassion Benchmark →" backlink (OWID/Statista engine). *Needs the CC-BY-on-data founder decision.* | acquisition #6, competitive #2 | M–L | **12** |
| G2.5 | **`/data` download page + dataset CSV + citation instructions** — researcher magnet (the `public/data/` endpoints exist; need docs + a landing) | competitive #6 | S–M | **11** |
| G2.6 | **Systematized social cadence** — weekly "Score Movers" visual on LinkedIn/X using the shipped OG cards; tag sector journalists; tie to forward-watch deadlines | acquisition #7/#8, competitive #7 | M | **11** |

## Wave G3 — The signature moment (highest amplitude, longer lead)
| # | Move | Lens(es) | Effort | Priority |
|---|------|----------|--------|----------|
| G3.1 | **Annual "State of Institutional Compassion" report + media-embargo cycle** — a dated, methodology-forward report with a press landing page, PDF, embeddable summary chart, 72-hr embargo to 20–30 journalists. The CPI/Freedom House/V-Dem mechanism that concentrates citations + earns Wikipedia notability nothing on-site can manufacture alone | acquisition #3, competitive #3 | L | **14** |
| G3.2 | **Monthly Special Briefing on a standing signature theme** (e.g. the synchronized democratic-recession band-crossings) — predictable returnable reading + a citable named finding | acquisition #4 | M | **13** |

---

## Measurement (so all of this is provable)
- **North-star:** non-branded organic sessions landing on entity/index pages (28-day trailing).
- **Weekly five:** deep-read rate (`read_depth ≥75%`), newsletter subscribe rate + **source mix** (target ≥30% from `updates-completion`), GSC non-branded impressions trend, newsletter open rate (≥45%), return-visitor rate.
- **Monthly:** AEO citation probe (10 prompts × 5 engines → `research/aeo-citation-log/`).
- **Precondition 0:** Umami confirmed live + GSC/Bing verified (G0.3) — otherwise every baseline is a false zero.

## Independence filter (all moves PASS)
Earned authority only — CC-BY embeds *reinforce* "independent"; the newsletter/digest is editorial; the launch embargo is editorial practice; Score-Watch + band-crossing prompts stay factual/neutral (never alarmist bait, never repurpose the forward-trigger countdown as a sales timer). No pay-for-inclusion, no dark patterns.

## Already shipped (don't redo) / partials
- ✅ OG social cards, RSS/JSON feeds (the **content** exists — G0.1 is the serialization bug), Dataset JSON-LD, llms.txt, crawler allow, breadcrumbs, answer-first sentences (entity is `sr-only` post-S1 but still extractable), home master bar, the 193 country `sameAs`.
- The cite/embed *affordance* shell exists (`ChartFrame`, Wave S3) — G2.4 makes it a real embed.

## The single highest-leverage sequence
**Ship Wave G0 this week** (the plumbing — a few hours total), then **G1.1 + G1.2** (entity-pages-as-hubs + seed the 967 `sameAs`). That converts the existing 1,160-page supply from a leaking dead-end into a compounding, discoverable, returnable engine — at low effort and zero independence risk — and makes everything afterward measurable.

## Handoffs
- **[FE]:** G0.1, G0.2, G0.4, G0.5, G1.1, G1.3, G1.4, G1.5, G2.1, G2.6.
- **[BE]/research:** G1.2 (verified identifier seeding — companies+labs first), G2.5 (dataset CSV), G0.1 (feed script).
- **[FOUNDER]:** G0.3 (Umami/GSC/Bing), the **CC-BY-on-data decision** (gates G2.4), G2.2 Score-Watch fulfillment, G3.1 press relationships.
- **[PIPE]:** G3.2 monthly special briefing cadence; briefing-schema SEO fields (feeds G1.3/G1.4).
- **[analytics]:** owns the metric tree + the weekly review.
