# Top 10 Moves to Become THE Cited Authority on Institutional Compassion

**Date:** 2026-06-11
**Author:** seo-aeo-architect
**Companion to:** `docs/SEO_AEO_AUDIT_2026-06-11.md` (the 20-item on-site technical backlog — read first; this strategy blends its 3-4 highest-leverage items with the off-site authority moves the audit did NOT cover)
**Scope:** Strategy artifact only. No site code, schema, or pipeline modified this pass.
**Canonical host:** `https://compassionbenchmark.com` · static export (Next.js 16) · Nginx + Cloudflare Worker for dynamic concerns.

---

## 1. The thesis

An institution becomes THE go-to authority — for humans and for answer engines alike — when it owns a **named entity in the knowledge graph** (so citations attribute to it by name), publishes **the dataset everyone else reuses** (so every republish is a backlink and every answer engine reaches for it), and produces **a recurring "launch moment" people return to** (so it is the primary reference, not a fallback). That is exactly how Transparency International's CPI, Freedom House, V-Dem, and Our World in Data earned their authority: a transparent dated composite methodology, an annual headline artifact journalists build stories on, and — for OWID — an embed-everywhere data product where every iframe backlinks home ([OWID embed model](https://ourworldindata.org/how-to-embed), [how CPI is cited](https://www.britannica.com/topic/corruption-perceptions-index)).

**Where Compassion Benchmark stands today:** the on-site foundation is unusually strong (Dataset/Organization/Rating/Article JSON-LD already ship; sitemap, feeds, OG images, Pagefind, CrawlableRankingTable all present) and we already rank **#1 for the brand term** — `us-states` is the top result for "Compassion Benchmark institutional compassion." The gap is **non-branded + citation authority**: answer engines fall back to unrelated "most empathetic countries" studies instead of our flagship countries index, no entity (institution or framework) exists in Wikidata/Wikipedia/Knowledge Panel, and there is no embeddable data product, no public dataset download, and no recurring signature artifact pulling people back. We have built the source of record; we have not yet made the world cite it by name.

---

## 2. The Top 10 moves (ranked)

> **Priority model** (repo standard): Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.
> **Owner key:** `[SEO]` seo-aeo-architect surgical · `[FE]` frontend-engineer · `[BE]` backend-engineer · `[PIPE]` pipeline-agent · `[GROWTH]` conversion/growth · `[FOUNDER]` only Phil can do.
> Effort: **S** ≤1 day · **M** ≤1 week · **L** multi-week / ongoing.

---

### #1 — Become a named entity in the knowledge graph (Wikidata → Knowledge Panel → `sameAs` anchor)

**The move.** Establish two real entities — the **institution** ("Compassion Benchmark") and the **framework** ("institutional compassion" / the 8-dimension benchmark) — in Wikidata, then earn a Wikipedia article and a Google Knowledge Panel as authority accrues. Wire our root `Organization.sameAs` and per-entity `sameAs` (audit items 3.1, 3.6) to point at the resulting Wikidata Q-IDs so engines bind every citation to *us by name*.

**Why it builds authority / makes us cited.** Answer engines and AI Overviews attribute citations to *recognized entities*. Without a knowledge-graph node, "Compassion Benchmark says…" has nothing to resolve to; with one, every mention compounds onto a single identity. This is the off-site half of the audit's #1 on-site finding (the empty `sameAs`) — the schema is useless until the node it points to exists.

**Honest path (researched).** [Wikidata's notability bar](https://www.wikidata.org/wiki/Wikidata:Notability) is *lower* than Wikipedia's: an item is acceptable if it is a "clearly identifiable conceptual or material entity" that "refers to an external structural source" (a database, authority record, or registry) — **our published, dated, structured dataset and methodology can qualify a Wikidata item now**, even before a Wikipedia article. [Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)) is harder: it needs "significant coverage in multiple reliable secondary sources independent of the subject" — i.e., it must be *earned* by moves #2/#7/#10 first (press, journalist/academic citations). Be honest: Wikidata is do-now; Wikipedia + Knowledge Panel are *outcomes* of authority, not shortcuts to it. No paid placement, no self-sourced Wikipedia article (that gets deleted and burns trust).

**×Leverage.** Sitewide identity × every future citation × unlocks the `sameAs` value across all **1,160 entities + 7 indexes**.
**Effort:** M (Wikidata now; Wikipedia/Panel are ongoing outcomes). **Risk:** Low-Med — reputational if done as spam; must be neutral, sourced, founder-led.
**Independence check:** Pass. Every statement on the Wikidata item traces to real published methodology/data; no fabricated `sameAs`, no paid editing.
**Metric:** Wikidata item live (baseline: none → target: 2 items in 30 days, verified by Q-ID) → Wikipedia article + Knowledge Panel (baseline: none → target: panel appears within 6-9 mo as citations accrue; tracked in the AEO citation log).
**Owner:** `[FOUNDER]` creates/seeds Wikidata + drives notability; `[SEO]` wires the Q-IDs into `layout.tsx` + entity `sameAs` once live.

---

### #2 — Data-as-product: CC-BY downloads + the OWID embed-and-backlink engine

**The move.** Ship the OWID playbook on our 1,160-entity moat: (a) **downloadable datasets** (CSV + JSON, CC-BY-4.0) per index — `export-public-data.mjs` already emits per-entity score JSON and `/public/data/index.json`; extend to per-index aggregates + CSV; (b) **embeddable, attributed charts** — an `<iframe>` of our own-data SVG rankings/sparklines that carries a permanent "via Compassion Benchmark →" backlink to the source page in *every* embed; (c) a **"Cite this page"** widget on every entity/index page generating a dated, formatted citation. Wire the real download URLs into the Dataset `distribution[]` (audit item 3.2).

**Why it builds authority / makes us cited.** This is the single most replicable authority mechanic OWID has: [every embed is an iframe pointing back to their server](https://ourworldindata.org/how-to-embed), so each republication is a backlink + referral-traffic + an AEO citation surface — and CC-BY makes us the *reusable* source journalists and researchers default to. A "cite this" widget turns academic/journalist use into structured inbound links (.edu/.org). Schema-marked, downloadable, licensed datasets are exactly what [Google's AI Overviews cite 2.3× more often](https://www.digitalapplied.com/blog/we-analyzed-1000-ai-overviews-citation-pattern-study), and the Dataset-citation lane is **uncontested** — Transparency International's CPI ships no Dataset markup at all (verified in the audit).

**×Leverage.** ×every embed (each is a backlink), ×7 index datasets, ×1,160 cite-widgets. Compounds without us lifting a finger after build.
**Effort:** M (CSV/JSON export S; embed iframe + cite widget M). **Risk:** Low technically; **Med on the independence/business boundary** — see check.
**Independence check:** Pass *with a founder license decision (#F2)*: CC-BY applies to the **rankings data** (free to cite/reuse with attribution), NOT the paid PDF research reports — keep that boundary explicit so "free dataset" never implies "pay for inclusion." All embeds restate real data; no fabrication.
**Metric:** Referring domains from embeds/citations (baseline ~0 → target: 25 referring domains in 90 days, GSC Links report); dataset downloads (new event in Umami); all 7 indexes discoverable in Google Dataset Search (baseline: absent → target: all 7 in 30 days).
**Owner:** `[BE]` CSV/JSON per-index export + cite-string generator; `[FE]` embeddable iframe component + "Cite this" widget + chart-with-backlink; `[SEO]` Dataset `distribution[]` wiring; `[FOUNDER]` CC-BY decision (#F2).

---

### #3 — Win the Dataset-citation lane: complete, typed, licensed structured data (the audit's top on-site pack)

**The move.** Ship audit Wave-1 items 3.1 + 3.2: **typed per-entity JSON-LD** (`Country`/`AdministrativeArea`/`City`/`Organization` instead of bare `Organization`, with `sameAs` from #1 and `dateModified`) and **complete Dataset schema** (add `license` CC-BY, `identifier`, ISO `temporalCoverage`, real `DataDownload` from #2). Add `BreadcrumbList` + `DefinedTermSet` (the 8 dimensions + 5 bands) so engines reuse *our* vocabulary.

**Why it builds authority / makes us cited.** This is the SEO↔AEO bridge and the highest-leverage *on-site* lever: [schema-marked pages are cited 2.3× more in AI Overviews](https://www.digitalapplied.com/blog/we-analyzed-1000-ai-overviews-citation-pattern-study). Typed `sameAs` directly fixes the live countries-attribution gap (engines can finally bind "our Iran score" to the real Iran). `DefinedTermSet` makes "Awareness / Suffering Detection" *our citable vocabulary* rather than something engines paraphrase away.

**×Leverage.** ×1,160 entities + ×7 indexes — one template/schema change multiplies across the whole moat.
**Effort:** S-M (mostly surgical metadata/JSON-LD edits SEO can own; entity `sameAs` depends on #1). **Risk:** Low.
**Independence check:** Pass. Every field traces to real data; `sameAs` populated only where a verified identifier exists, omitted otherwise — never guessed.
**Metric:** Structured-data validity (baseline: valid-but-incomplete → target: 0 errors/warnings on all 8 templates, Rich Results Test); Dataset Search presence (→ all 7); entity-attribution probe (baseline: countries not surfaced by name → target: ≥3 engines name our countries index on the superlative prompt).
**Owner:** `[SEO]` surgical schema edits (3.2, breadcrumbs, DefinedTermSet); `[BE]` entity `identifiers` field + population; depends on #1 for `sameAs` values.

---

### #4 — The signature artifact: an annual "State of Institutional Compassion" report (the launch moment)

**The move.** Create one recurring flagship artifact — **"The State of Institutional Compassion 202X"** — a dated, methodology-forward annual (or semi-annual) report with the headline rankings, the biggest movers, and a narrative "what changed and why." Give it a press-ready landing page, a downloadable PDF, an embeddable summary chart (#2), and a fixed URL that updates each edition. This is the artifact journalists, academics, and answer engines cite as *the* reference point.

**Why it builds authority / makes us cited.** This is precisely how CPI/Freedom House/V-Dem earned authority — not page-by-page SEO, but an **annual launch moment** that "quickly make[s] headlines" and becomes "a primary reference point" for journalists and researchers ([CPI citation pattern](https://www.britannica.com/topic/corruption-perceptions-index)). A benchmark's authority concentrates around its signature release. We have the daily pipeline (freshness) but no *crowning evergreen artifact* to anchor citations and outreach (#7).

**×Leverage.** One artifact → the anchor for all PR, every "cite us," and the Wikipedia-notability case (#1). Compounds yearly.
**Effort:** L (editorial + design + a real launch). **Risk:** Low-Med — must be genuinely substantive, not a thin SEO page.
**Independence check:** Pass. It is our real rankings + real methodology, dated and transparent. No entity pays for placement or framing.
**Metric:** Press mentions / external citations of the report (baseline 0 → target: 5 named media/.edu/.org citations within 90 days of launch); branded+report query impressions (GSC).
**Owner:** `[FOUNDER]` owns the launch + outreach + timing; `[PIPE]`/editorial assembles from existing data; `[FE]` report landing page + PDF; `[SEO]` `Report`/`Dataset` schema + canonical + OG.

---

### #5 — Answer-first everywhere + superlative answer blocks (audit items 4.2, 2.3, 3.5)

**The move.** Lead every entity page body with one self-contained, dated, extractable sentence ("As of <date>, <Full Entity Name> scores <n>/100 (<Band>) on the Compassion Benchmark, ranking #<r> of <total>…") and every index page with a superlative answer block ("the most compassionate <noun> is X (<score>); the least is Z"). Add `FAQPage` from *real* Q&A. Retitle indexes for the superlative query ("Most & Least Compassionate Countries 2026").

**Why it builds authority / makes us cited.** LLMs lift the first clean factual sentence; AI Overviews love "most/least X" lists. Our indexes natively answer the highest-intent superlative queries but don't *say so* in one liftable line — this is the non-branded traffic gap made fixable. Pure restatement of our own data = maximally extractable, fully white-hat.

**×Leverage.** ×1,160 entity leads + ×7 superlative hubs (the highest-intent pages).
**Effort:** M (template work). **Risk:** Low.
**Independence check:** Pass. Plain restatements of on-page data, identical for humans and machines; FAQ answers derive only from real data — never fabricated.
**Metric:** Superlative impressions (baseline ~0 → target: first page for ≥5 "most/least compassionate <category> 2026" queries); AEO probe shows engines lifting the lead sentence within 60 days.
**Owner:** `[FE]` answer-first blocks + superlative titles + FAQPage render; `[SEO]` FAQ/superlative schema spec.

---

### #6 — The editorial "good read" engine: annotated narrative briefings that pull people back

**The move.** Evolve the daily/special briefings from data dumps into genuinely *returnable reading* on the Burn-Murdoch / Graphic Detail model: a **strong narrative title + annotated charts that carry the story** ("so what?" answered in the chart itself), a **signature recurring format** (e.g., a weekly "Biggest Movers" column with a consistent visual identity), and a habit-loop **newsletter** as the spine. Bake the SEO/AEO fields into the pipeline at the source (audit item 5.1: `seoTitle`, `metaDescription`, `answerFirst`, `faq[]`, `linkedEntities[]`).

**Why it builds authority / makes us a good read.** Authority isn't only citations — it's *people who come back*. [Burn-Murdoch's lesson](https://gijn.org/stories/data-visualization-storytelling-tips-john-burn-murdoch/): "the key to a good data story is the story itself… all worthless if the reader is left thinking 'so what?'" — strong narrative titles + multiple annotations beat clever math, and a recognizable signature format (his salmon-pink FT charts; a weekly column) builds a *habit*. A returning audience is the demand signal that makes us the reference, and the internal-link/freshness engine that feeds #3 and #5.

**×Leverage.** ×every future briefing (compounds daily), ×every newsletter send (habit loop), ×internal-link graph.
**Effort:** M-L (pipeline schema + editorial format + chart-annotation component). **Risk:** Low.
**Independence check:** Pass. Narrative restates real evidence (the F2 pull-quotes are a native asset); no spin, no fabricated FAQ — answers must derive from cited evidence.
**Metric:** Newsletter returning-open rate + entity-page sessions from briefings (Umami); briefing→entity internal links per briefing (baseline: heuristic/ad-hoc → target: ≥3 required `linkedEntities[]` each).
**Owner:** `[PIPE]` schema + `overnight-digest`/`special-briefing` prompt edits; `[FE]` annotated-chart + signature-format components; `[GROWTH]` newsletter habit loop; `[SEO]` the SEO/AEO field spec + validator rules.

---

### #7 — Earn links the white-hat way: E-E-A-T, named authorship, methodology-transparency outreach

**The move.** Convert our transparency into earned links: (a) **named expert authorship + methodology page** front-and-center (who built the framework, dated, credentialed) — answer engines and editors reward visible E-E-A-T; (b) a **press/journalist resource** (the report #4 + embeddable charts #2 + a "for media" page with the cite string); (c) **proactive outreach** to researchers, NGOs, and journalists covering governance/AI-ethics/corporate-responsibility, offering the dataset and embeds — the way CPI/V-Dem seeded academic and media use.

**Why it builds authority / makes us cited.** [CPI, Freedom House, and V-Dem became authoritative references](https://www.britannica.com/topic/corruption-perceptions-index) through transparent composite methodology + becoming the source journalists/academics *reach for*. Inbound .edu/.gov/.org links and journalist citations are the strongest authority signal and the **only** legitimate way to clear Wikipedia notability (#1). This is the link-earning the audit (on-site only) did not cover.

**×Leverage.** Each earned citation compounds onto the #1 entity identity and feeds Wikipedia notability. Non-linear.
**Effort:** L (relationship + outreach work). **Risk:** Med — must be strictly white-hat (no link schemes, no paid placement, no PBNs).
**Independence check:** Pass and *critical*: outreach offers free data/attribution only — never inclusion, ranking, or framing in exchange for a link. Independence is the *pitch*, not a thing we trade.
**Metric:** Referring root domains, esp. .edu/.gov/.org (baseline → target: 10 quality referring domains in 90 days, GSC); named citations in the AEO log.
**Owner:** `[FOUNDER]` outreach + relationships + authorship identity; `[GROWTH]` media/press page; `[FE]` "for media" + authorship UI; `[SEO]` `author`/`Person` schema + the cite string.

---

### #8 — Public read API / data endpoint (scales the moat into developer + AI citations)

**The move.** Expose a simple **public read data endpoint** (the per-entity/per-index JSON already generated by `export-public-data.mjs`, served statically or via the existing Cloudflare Worker that already runs the badge endpoint) and document it. The "Pro API Access" tier is already stubbed in `gumroad.ts` — ship a *free read tier* (with attribution) under it. Document it in the methodology + a `/data` page.

**Why it builds authority / makes us cited.** A documented data endpoint makes us the *programmatic* source — researchers, app builders, and AI agents pull from it and cite it. Notably, [llms.txt's real adoption is among IDE/coding agents](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026) (Cursor, Claude Code, Copilot fetch it routinely) even though answer engines largely ignore it — a documented API + llms.txt pointing at it captures the B2A/agent-developer lane, which compounds into product integrations and embeds.

**×Leverage.** ×every developer/agent integration, ×every app that surfaces our scores.
**Effort:** M (mostly documentation + static endpoints; Worker already exists). **Risk:** Low.
**Independence check:** Pass. Read-only public data under CC-BY with attribution; no inclusion-for-pay.
**Metric:** API/endpoint requests (Worker/Umami logs, baseline ~0 → target: measurable external pulls in 90 days); integrations citing us.
**Owner:** `[BE]` endpoint + docs (reuse `export-public-data.mjs` + Worker); `[FOUNDER]` free-vs-Pro tier boundary; `[SEO]` `/data` page schema + link from llms.txt.

---

### #9 — `llms.txt` + deliberate AI-crawler policy (audit items 4.1, 1.1) — right-sized, not over-sold

**The move.** Ship `site/public/llms.txt` mapping our authoritative resources (indexes, methodology, datasets #2, API #8, latest briefings, feeds) and an **explicit, reasoned ALLOW** AI-crawler policy in `robots.ts` (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, CCBot, etc.).

**Why it builds authority / makes us cited — honestly.** Be candid (researched): as of 2026, [llms.txt does **not** measurably improve answer-engine citation — Google explicitly says you don't need it for AI Overviews/AI Mode and won't support it](https://www.aeo.press/ai/the-state-of-llms-txt-in-2026), and crawler interest from answer bots is negligible. Its *real* value is the **B2A/IDE-agent lane** (#8) and as a cheap, static, zero-risk signal-of-intent. The **AI-crawler ALLOW policy is the higher-value half**: for a benchmark whose growth *is* being cited, visibility > hoarding, and right now that's an un-made decision (a bare `allow: /`). Ranked here (not #1) precisely because the schema/Dataset/entity work (#1-#3) is what actually drives citations — llms.txt is hygiene, not a growth lever.

**×Leverage.** Sitewide, two static files. Cheap insurance + agent-lane upside.
**Effort:** S. **Risk:** None.
**Independence check:** Pass. Public, honest resource map; explicit allow is the opposite of cloaking.
**Metric:** `/llms.txt` + named agents in `/robots.txt` served (200); agent-crawler hits (Worker logs). Don't over-claim citation lift — measure via the AEO log, not assumed.
**Owner:** `[SEO]` both files (surgical, build-time).

---

### #10 — Distribution flywheel: newsletter + RSS/syndication + social compounding

**The move.** Tie the channels into one compounding loop: the **newsletter** as the habit spine (#6), **RSS/JSON feeds** (already shipped via `build-feeds.mjs`) submitted to aggregators + offered for syndication, and **social** leveraging the just-shipped OG cards — every briefing/report auto-produces a shareable, attributed card. Each "biggest mover" or report becomes a social moment that drives the next cohort to subscribe.

**Why it builds authority / makes us a good read.** Distribution is what turns good content into *authority*: syndication and social multiply reach, the newsletter converts reach into returning audience, and returning audience is the demand signal + link source that feeds every other move. The OG cards (Wave H2) are the social substrate; they're built but not yet part of a deliberate distribution loop.

**×Leverage.** ×every channel × every piece — the connective tissue that makes #4/#6/#7 compound instead of firing once.
**Effort:** M (ongoing). **Risk:** Low.
**Independence check:** Pass. Sharing our own dated findings; no engagement-bait, no fabricated claims.
**Metric:** Newsletter subscribers (baseline → target growth), feed subscribers/syndication pickups, social referral sessions (Umami).
**Owner:** `[GROWTH]` newsletter + social cadence + syndication outreach; `[FE]` share affordances; `[FOUNDER]` syndication partnerships.

---

## 3. The flywheel

The ten moves are a single compounding loop, not ten line items. **Transparent methodology + a returnable editorial engine (#6) and a signature annual artifact (#4) produce genuinely good content → which earns journalist/academic/.edu citations and embeds (#2, #7) → those citations build a knowledge-graph entity (#1) and inbound authority → which, combined with complete typed/licensed structured data and answer-first formatting (#3, #5), makes answer engines cite us *by name* → citations + authority lift rankings and non-branded impressions → traffic flows to entity/index/report pages → the distribution loop (#10) and the data product/API (#2, #8) convert that traffic into subscribers, embeds, and developer integrations → each embed and integration is a fresh backlink + a returning audience → which funds and feeds the next cycle of content.** The 1,160-entity moat is the multiplier: every move that improves one page or one schema improves all of them at once.

```
        ┌──────────────────────────────────────────────────────────┐
        │                                                          │
        ▼                                                          │
  GOOD CONTENT (#4 report, #6 editorial)                          │
        │                                                          │
        ▼                                                          │
  CITATIONS + EMBEDS (#2 data product, #7 link-earning)           │
        │                                                          │
        ▼                                                          │
  ENTITY AUTHORITY (#1 knowledge graph, #3 typed schema)          │
        │                                                          │
        ▼                                                          │
  ANSWER-ENGINE + SEARCH RANKING (#3, #5, #9)                     │
        │                                                          │
        ▼                                                          │
  TRAFFIC → SUBSCRIBERS + EMBEDS + API USE (#2, #8, #10)          │
        │                                                          │
        └──────────────► more content, more reach ────────────────┘
```

---

## 4. 90-day sequencing

**Do first (weeks 0-4) — highest leverage, lowest risk, static-export-safe, mostly SEO-ownable:**
1. **#3 — the structured-data pack** (typed entity JSON-LD scaffolding, complete Dataset schema with `license`/`identifier`/ISO `temporalCoverage`, breadcrumbs, DefinedTermSet) + **#9** (llms.txt + AI-crawler ALLOW). All surgical, build-time, zero-risk, and the proven AEO lever (schema → 2.3× citations).
2. **#1 (Wikidata half) — founder seeds the two Wikidata items now** (do-now bar), so #3's `sameAs` has real targets to point at. The Wikipedia/Knowledge-Panel half is a downstream outcome, not a week-4 task.
3. **#2 (data-download half) — CSV/JSON per-index exports** under CC-BY (pending the #F2 license decision), wired into Dataset `distribution[]`. Unlocks Dataset Search + the embed/cite work that follows.

**Then (weeks 4-8):** **#5** (answer-first + superlative blocks + FAQPage — the non-branded traffic fix) and the **#2 embed + cite-this widgets** (the backlink engine). **#8** read-API documentation rides along on the #2 exports.

**Then (weeks 8-12+, ongoing):** **#4** (the annual report launch moment), **#6** (the editorial/pipeline good-read engine + newsletter habit), **#7** (outreach + earned links), **#10** (distribution loop). These are the L-effort, relationship- and editorial-heavy moves that build the durable authority the first wave makes *visible*.

---

## 5. Independence guardrail

All ten moves are white-hat and authority is **earned through real methodology and evidence transparency** — never manufactured:

- **No fabricated schema/links/FAQ.** Every `sameAs`, Dataset field, FAQ answer, rating, and cite-string traces to real benchmark data or a verified external link; where an identifier doesn't exist, the field is **omitted, never guessed** (#1, #3, #5).
- **No link schemes / PBNs / paid placement.** #7 outreach and #2 embeds offer *free data + attribution only* — never inclusion, ranking, or framing in exchange for a link. The independence policy is the *pitch*, not a tradeable asset.
- **No doorway/thin pages.** New pages (the report #4, the `/data` and per-dimension explainers) are backed by real, substantial data; superlative framing (#5) restates existing rankings and adds no new claim.
- **No self-sourced Wikipedia article** (#1) — that violates Wikipedia policy, gets deleted, and burns trust. Wikipedia is *earned* via #7's independent secondary citations; we only seed the neutral, sourced Wikidata item.
- **No over-claiming.** #9 is ranked and described honestly: llms.txt does not currently move answer-engine citation (Google ignores it) — we ship it for the agent lane + hygiene, not as a growth lever.
- **CC-BY boundary is explicit** (#2, #F2): the free license covers the *rankings data*, never the paid research reports — so "free dataset" can never be misread as "pay for inclusion."

E-E-A-T here is transparency made machine-readable and citation-ready. No move fabricates authority; every one *surfaces* real methodology and evidence.

---

## 6. Founder actions (only Phil can do)

- **#F1 — Knowledge-graph identity (#1).** Create + neutrally source the two **Wikidata** items (institution + framework) now; drive **Wikipedia** notability later via earned secondary coverage (#7). Do **not** self-author the Wikipedia article. This is the single highest-leverage founder action — nothing downstream can attribute citations to us by name until the node exists.
- **#F2 — CC-BY license decision (#2, #3, #8).** Confirm **CC-BY-4.0 on the rankings data** (free to cite/reuse with attribution) while keeping the paid PDF research reports separate. This one decision unblocks the Dataset `license` field, the downloads, the embed engine, the cite widget, and the public API — and it must be made before #3 asserts `license` in schema. The only independence-sensitive call.
- **#F3 — Search Console + Bing verification.** Verify GSC + Bing Webmaster (DNS TXT or `/public` token on the static host). Without it, indexation %, impressions, and the whole scorecard are unmeasurable — this gates proving any move worked.
- **#F4 — The launch moment + outreach (#4, #7, #10).** Own the annual "State of Institutional Compassion" report timing/launch, the journalist/academic/NGO outreach relationships, and any syndication partnerships. Authority is seeded by a person; these can't be delegated to a template.

---

## 7. Handoff summary

- **`[SEO]` (self, surgical):** #3 schema pack, #9 llms.txt + robots policy, schema specs for #2/#4/#5/#7/#8, wiring #1's Q-IDs once live.
- **`[BE]`:** entity `identifiers` field (#3), per-index CSV/JSON export + cite-string + read endpoint (#2, #8).
- **`[FE]`:** embed iframe + cite widget + chart-backlink (#2), answer-first/superlative/FAQ render (#5), annotated-chart + signature format (#6), report + media + `/data` pages (#4, #7, #8).
- **`[PIPE]`:** briefing-schema SEO/AEO fields + prompt edits + validator (#6).
- **`[GROWTH]`:** newsletter habit loop, media/press page, social + syndication distribution (#6, #7, #10).
- **`[FOUNDER]`:** #F1-#F4 above.

**Artifact:** `docs/SEO_AEO_TOP10_STRATEGY_2026-06-11.md` (this file).
