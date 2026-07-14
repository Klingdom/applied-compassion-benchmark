# Organic Growth via Content Formats & Information Design — Ranking + Citability Plan

**Date:** 2026-07-14
**Author:** Knowledge Architect (content-format / information-design lens)
**Goal:** Content formats that both (a) rank and win organic informational search and (b) get *quoted and cited* by AI answer engines (AEO/GEO) and press — driving traffic back to compassionbenchmark.com.
**Builds on:** `docs/SEO_AEO_TOP10_STRATEGY_2026-06-11.md` (moves #3 DefinedTermSet, #5 answer-first, #6 editorial), `docs/SITE_REVIEW_KNOWLEDGE_2026-06-12.md` (jargon debt, "how to read a score" primer gap), `docs/PATTERN_ANALYSIS_THEMES_2026-06-11.md` (Special-Briefing concepts SB-1…SB-7).
**Scope:** Recommendations only. No site code, schema, or data modified this pass.

---

## 1. The core finding: we authored the vocabulary but never gave it a citable home

The single largest untapped organic + AEO asset on the site is **already written and structured but has no standalone page**:

- `site/src/data/dimensions.ts` holds **8 dimensions + 40 subdimensions**, each with a plain-language `desc` (a one-sentence definition) and a 5-rung anchor ladder — plus a canonical `BANDS` array (5 bands with ranges + one-line descs) and the canonical `INTEGRATION_PREMIUM` sentence.
- `site/src/data/glossary.ts` already merges **~60 defined terms** (8 dimensions, 40 subdimensions keyed by code *and* name, 5 bands, plus composite / floor / integration-premium / evidence-tier / band-change / near-floor meta-terms), each with a plain-English definition and an intended `href`.

Today that vocabulary is only consumed as **inline hover tooltips** (`DefinedTerm.tsx`) and as **`DefinedTermSetJsonLd` on `/methodology` only**. Two concrete consequences:

1. **There is no `/glossary` page and no `/dimensions` route.** `glossary.ts` links its 8 dimension entries and several meta-terms to `/dimensions` (e.g. lines 99, 106, 148, 273) — **a route that does not exist** (confirmed: no `site/src/app/dimensions/` directory). The definitions that answer engines most want to lift ("What is institutional *Awareness*?") are trapped in tooltips and JSON-LD, with the human-readable destination 404ing.
2. **The `/methodology` page is a 1,420-line reference document, not an answer surface.** It is superb for depth and E-E-A-T but structurally *cannot* win a definitional snippet: the answer to "what is a compassion score?" is buried mid-document behind instrument metadata. AEO rewards a page whose *first* on-topic sentence is the answer.

The highest-leverage organic move is therefore **not writing new content** — it is **promoting the vocabulary we already own into standalone, answer-first, schema-marked pages** that engines can cite by name and humans can land on directly. This is SEO/AEO strategy move #3 (DefinedTermSet) and #5 (answer-first) made into *pages* instead of *fields*.

---

## 2. Prioritized recommendations

**Priority = Impact + Confidence − Effort** (each 1–5, per brief). All formats restate real published data → independence policy **PASS** unless noted.

| ID | Content format / page | Query / answer it wins | Citation / AEO value | Comprehension value | Impact | Effort | Conf | **Priority** |
|----|----------------------|------------------------|----------------------|---------------------|:-----:|:-----:|:----:|:-----:|
| **C1** | **`/glossary` index page** — render all ~60 terms from `glossary.ts` as visible `DefinedTerm` blocks + sitewide `DefinedTermSet` JSON-LD | "compassion benchmark glossary", "what is [any term]", long-tail definitional | **Very high** — one canonical, schema-marked vocabulary surface engines cite verbatim; uncontested lane (CPI/Freedom House ship none) | Single place to learn every term; fixes cross-page vocab reset (Site Review #5/#7) | 5 | 2 | 5 | **8** |
| **C2** | **`/dimensions` hub + 8 dimension pages** (`/dimensions/[code]`) — "What is the [Awareness] score?" answer-first, each with its 5 subdimensions + anchor ladder | "what is institutional awareness/empathy/…", "how is the [X] dimension scored" | **Very high** — 8 evergreen entity-defining pages; **also fixes the broken `/dimensions` links** in `glossary.ts` | Teaches the schema newcomers currently only meet as bare acronyms (Site Review #1) | 5 | 3 | 5 | **7** |
| **C3** | **"What is institutional compassion?" pillar page** — the framework's canonical definition, answer-first, links to all 8 dimensions + methodology | "what is institutional compassion", "compassion benchmark definition" — the entity/head term | **Very high** — the page a Knowledge-Graph/Wikidata entity (strategy #1) and press anchor to; owns the framework definition | Names the whole mental model in one screen before any depth | 5 | 2 | 4 | **7** |
| **C4** | **"How to read a compassion score" evergreen explainer** — 0–5 anchors, 5 bands w/ ranges, composite formula, one-line integration premium | "how is compassion scored", "what does a compassion score of X mean", "compassion benchmark bands explained" | **High** — liftable definitional answer; the primer `/methodology` can't be | Fixes the missing site-wide "how to read a score" on-ramp (Site Review #5) | 4 | 2 | 5 | **7** |
| **C5** | **Per-dimension + concept FAQ blocks** (`FaqAccordion`+`FaqJsonLd`) on C2/C4 pages — "How is Accountability scored?", "What's the difference between a band and an anchor level?" | "how is [X] scored", "band vs anchor", "does a 0 mean…" question-shaped queries | **High** — FAQPage is a top AEO citation surface; pattern already proven on index pages | Answers the exact confusions Site Review flagged (#4, band/anchor collision) | 4 | 2 | 4 | **6** |
| **C6** | **Quotable "key stat" one-sentence blocks** — one dated, self-contained superlative sentence per index + per Special Briefing (data-to-text) | superlative + "as of 2026" stat queries; the sentence AI lifts wholesale | **High** — LLMs lift the first clean dated factual sentence; makes the number quotable | Inverted-pyramid lead; reader gets the point in 5s | 4 | 2 | 4 | **6** |
| **C7** | **Inline `DefinedTerm` → glossary-anchor linking** across methodology/briefings/entity pages (point tooltips' `href` at `/glossary#term` once C1 exists) | internal navigation by scent; strengthens C1/C2 authority via internal links | **Medium-High** — internal-link graph concentrates crawl equity on the definition hub | Every jargon term becomes one click from its definition (Site Review #7) | 3 | 1 | 4 | **6** |
| **C8** | **Per-dimension superlative indexes** — "Most/Least Accountable Countries 2026", derived from existing `scores.[DIM]` columns | "most accountable countries", "least transparent companies 2026" — 8× the superlative surface | **High** — multiplies the proven index answer-first pattern across 8 dimensions × 7 indexes | Teaches that dimensions are independently comparable | 4 | 3 | 4 | **5** |
| **C9** | **"Floor vs Critical: what a 0.0 means" explainer** — one-line definition-first, then the 4 trigger criteria + exit conditions | "what does a compassion score of 0 mean", "compassion benchmark floor" | **Medium-High** — a distinctive, quotable, press-bait concept unique to us | Definition-before-gravity ordering (Site Review #10); defuses alarmism | 3 | 2 | 4 | **5** |
| **C10** | **Special-Briefing narrative format** (SB-1 Democratic Recession flagship, SB-5 "What Good Looks Like") — headline number + linkable finding anchors + answer-first dek | thematic queries + press pickup ("democracies sliding into Critical") | **Very high (press + AI)** — the launch-moment artifact journalists cite; strategy #4/#6 | Turns 21-section data dumps into a returnable "so what" read (Site Review #2) | 5 | 4 | 3 | **4** |
| **C11** | **Per-index "How is a [country/company/AI lab] scored?" explainers** — index-specific evidence model + served-population, answer-first | "how are countries scored for compassion", "how is a company's compassion score calculated" | **Medium-High** — captures per-sector "how" intent methodology page buries | Shows the schema is one framework, many evidence models | 3 | 2 | 4 | **5** |
| **C12** | **Entity-page answer-first + "Is [entity] compassionate?" FAQ** — extend existing entity AEO sentence with a 2–3 item FAQ per entity | "is [entity] compassionate", "[entity] compassion score" — 1,160× long-tail | **High volume** — templatable across the whole entity moat; each is a citable micro-answer | One unmissable takeaway per entity (Site Review #3) | 4 | 3 | 4 | **5** |
| **C13** | **Comparison explainers** — "Compassion Benchmark vs ESG / vs Freedom House / vs CPI: what's different" | "compassion benchmark vs ESG", "is compassion benchmark like CPI" | **Medium** — comparison pages are heavily cited by AI for "how does X differ from Y" | Positions the framework by contrast; teaches what it is *not* | 3 | 3 | 3 | **3** |

---

## 3. The glossary / definition-page plan

### 3.1 How many pages, from what we already have

The vocabulary is already authored in `dimensions.ts` + `glossary.ts`. The plan converts it into **~13–18 new evergreen URLs covering ~60 defined terms** — *without* creating 40 thin subdimension pages (which would be doorway/thin-content risk). Subdimensions live as anchored, individually-linkable **sections inside their parent dimension page** (5 per page), so each of the 40 is a citable `#anchor` with its own `DefinedTerm` + anchor ladder, but the *page* always carries a full dimension's worth of substance.

| Surface | New URLs | Terms covered | Source of truth | Notes |
|--------|:-------:|:-------------:|-----------------|-------|
| `/glossary` index (C1) | 1 | all ~60 | `glossary.ts` | Visible `DefinedTerm` list + sitewide `DefinedTermSet` JSON-LD; each row deep-links to its home page |
| `/dimensions` hub (C2) | 1 | 8 dimensions overview | `DIMENSIONS` | Answer-first "The 8 dimensions of institutional compassion" |
| `/dimensions/[code]` (C2) | 8 | 8 dims + 40 subdims (5 anchored sections each) | `DIMENSIONS` | Each page: definition, why it's scored, 5 subdimension sections, anchor ladder, FAQ (C5) |
| `/what-is-institutional-compassion` pillar (C3) | 1 | the framework concept | methodology + dimensions | Head-term definition + links down to the 8 |
| `/how-to-read-a-compassion-score` (C4) | 1 | composite, 0–5 anchors, 5 bands, integration premium, floor | `BANDS`, `INTEGRATION_PREMIUM` | The 60-second primer `/methodology` isn't |
| Key-term explainers (C9 + siblings) | ~5–7 | floor designation, integration premium, pressure-test, evidence hierarchy, near-floor, band change, composite | `glossary.ts` meta-terms | Each ≥1 quotable sentence + a worked example link; can also be deep sections of C4 if standalone volume is thin |
| **Total** | **~17** | **~60** | | Zero new *definitions* authored — all promoted from existing data |

**Anti-fabrication contract:** every definition, anchor, band range, and stat renders verbatim from `dimensions.ts` / `glossary.ts` / index JSON — no hand-typed copy that could drift. This is the same discipline `DefinedTermSetJsonLd` and the index FAQ blocks already follow.

### 3.2 The answer-first definition template (reusable for C1–C4, C9, C11)

Every definition/explainer page follows one structure so the format is templatable and engines learn where the answer always sits:

```
H1:            What is [Term]?                          ← exact-match the query
Answer block:  [Term] is [1–2 sentence definition,      ← the liftable snippet;
               self-contained, no undefined jargon,       first on-topic sentence
               dated where a number is involved].          = the answer engines quote
Why it matters / how it's scored:                        ← 2–4 sentences, concrete
               [one behavioral anchor example or a
               real scored entity, named].
Progressive disclosure:                                  ← <details> for depth
               • the deeper rung (anchor ladder / formula / trigger criteria)
               • "See it applied →" link to a real entity page
FAQ block:     2–4 real question-shaped Q&A               ← FaqAccordion + FaqJsonLd
               ("How is [X] scored?", "What's the
               difference between [X] and [Y]?")
Schema:        DefinedTerm (+ isPartOf DefinedTermSet),  ← the citable machine layer
               FAQPage, BreadcrumbList
Cross-links:   ↑ to the pillar (C3), ↔ sibling terms,    ← information scent + crawl equity
               ↓ to methodology depth
```

Rules that make it *citable*: (1) the definition is one self-contained sentence with **no undefined term inside it**; (2) any claim with a number is **dated** ("As of 2026…"); (3) the visible answer and the JSON-LD say the **same words**; (4) one **"if you remember one thing"** anchor per page (retention hook); (5) headings are the literal queries, not clever labels (information scent).

---

## 4. Shortlist — the 3–5 highest-yield formats

1. **C1 — `/glossary` page + sitewide DefinedTermSet (Priority 8).** Do-now, near-zero authoring: ~60 definitions already exist in `glossary.ts`. Creates the one canonical, schema-marked vocabulary surface answer engines cite verbatim — a lane CPI/Freedom House leave completely empty. Single highest ratio of citation value to effort.
2. **C2 — `/dimensions` hub + 8 dimension explainer pages (Priority 7).** Owns eight evergreen "what is the [X] score?" queries, teaches the schema newcomers currently meet only as bare acronym columns, **and repairs the broken `/dimensions` links already shipped in `glossary.ts`**. Eight citable pages from data we already hold.
3. **C3 — "What is institutional compassion?" pillar (Priority 7).** The head-term, entity-defining page — the anchor a Wikidata node (strategy #1) and press attach to. Without it, "Compassion Benchmark says…" has no canonical definition to resolve against.
4. **C4 — "How to read a compassion score" evergreen (Priority 7).** The 60-second primer the 1,420-line `/methodology` cannot be; wins "how is compassion scored / what does a score of X mean" and fixes the site-wide comprehension on-ramp gap.
5. **C10 — Special-Briefing narrative format (Priority 4, highest strategic ceiling).** Lower do-now priority but the biggest press-and-AI citation upside: the SB-1 "Democratic Recession" flagship turns the strongest finding in `PATTERN_ANALYSIS` into a dated, quotable, linkable launch moment — the artifact journalists build stories on.

**C1–C4 are one coherent build** (the definition/explainer layer) sharing the §3.2 template and the same `dimensions.ts`/`glossary.ts` sources — shippable as a single evergreen content wave before the heavier editorial C10.

---

## 5. If you build one thing

**Ship `/glossary` + the 8 `/dimensions` pages as one wave (C1 + C2).** The definitions, anchors, band ranges, and DefinedTerm schema are *already authored and structured* in `dimensions.ts` and `glossary.ts`; the work is promoting them into answer-first pages, not writing them. It simultaneously (a) opens the uncontested DefinedTerm citation lane across ~48 core terms, (b) fixes the broken `/dimensions` links currently 404ing from the glossary, and (c) resolves the site's #1 comprehension tax — readers meeting `AWR EMP ACT EQU BND ACC SYS INT` with nowhere to learn what they mean. It is the cheapest move that most directly makes the benchmark the *cited* authority on the vocabulary of institutional compassion.

---

## 6. Independence check (all recommendations)

Every format above restates real published data (definitions from `dimensions.ts`/`glossary.ts`, scores from index JSON, findings from published assessments). No entity influences inclusion, ordering, or framing; superlative and comparison pages add no new claim beyond existing rankings; FAQ answers derive only from rendered page data (the anti-fabrication contract already enforced by `FaqJsonLd` and `DefinedTermSetJsonLd`). **All PASS.**

## 7. Handoffs

- **SEO/AEO architect:** `DefinedTermSet`/`FAQPage`/`BreadcrumbList` schema on the new pages; canonical + OG; sitemap entries; wiring C3 as the `sameAs`/Wikidata anchor (strategy #1).
- **UX (pixels):** visual treatment of the `/glossary` index and dimension-page answer blocks; `<details>` disclosure styling.
- **Conversion:** placement of any commercial CTA on evergreen definition pages (keep the definition answer-first and above the sell).
- **Pipeline/editorial:** the C10 Special-Briefing narrative format + the C6 quotable-stat field in the briefing schema (strategy #6, field `answerFirst`).
```

