# Organic Growth — Persona Landing Pages & Acquisition Loops (Nonprofit Model)

**Date:** 2026-07-14 · **Author:** Growth Strategist agent
**Scope:** Persona-driven landing pages, process/use-case pages, and compounding acquisition loops to grow **organic, non-branded traffic** for compassionbenchmark.com under the nonprofit model.
**Success metric for this doc (per founder direction):** organic visitors who **cite** the work, **subscribe** to the free Daily Briefing, and/or **donate**. Explicitly NOT sales, tiers, or lead-gen.
**Builds on (do not repeat):**
- `docs/GROWTH_MASTER_2026-06-15.md` — the plumbing/entity-hub/annual-report backlog (Waves G0–G3)
- `docs/GROWTH_AUDIENCE_2026-06-15.md` — the 7 audience segments, channel fit, and message hierarchy (source of the persona list used below)
- `docs/GROWTH_ACQUISITION_2026-06-15.md` — channel ranking, activation path, lifecycle/habit-loop design
- `docs/GROWTH_SEO_2026-06-15.md` — the technical SEO/AEO backlog (`sameAs`, FAQPage, superlative titles, dimension explainers, peer-link clusters)
- `docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md` — positioning, tier copy, lexicon (use/purge lists), per-page nonprofit framing
- `docs/NONPROFIT_SIMPLIFY_PM_2026-07-12.md` — the retained nonprofit MVP surface (rankings, methodology, daily pipeline, single donate ask, about)

This doc does not re-litigate the technical SEO backlog (sameAs, FAQPage, titles) or the plumbing fixes (RSS, completion-block capture) — those are prerequisites, assumed in progress. This doc's job is **which persona-facing pages and loops to build next, and in what order**, given a tiny nonprofit team and a citation/subscribe/donate success metric instead of a sales funnel.

Current site state checked before writing this: `/media` already serves a merged journalist+researcher "For Press & Researchers" page (cite strings, data endpoints, feeds, methodology, single contact). `/research` and `/nonprofit-alt/research` already carry a funder/foundations section. `/self-assessment` exists as a free tool. No dedicated persona hub yet exists for AI-governance researchers, educators, NGOs/advocacy, or concerned citizens, and there is no standalone `/cite` page, "Cited By" showcase, or compare/VS page. Those are the real gaps this doc targets.

---

## 0. Why persona pages, not just SEO fixes

The SEO backlog (`GROWTH_SEO_2026-06-15.md`) wins the **query-to-page** match. It does not, by itself, tell a first-time visitor *why this page is for them* or *what to do next* in nonprofit terms. A journalist landing on an entity page via search and a policy researcher landing on the same page via search need different framing and a different next action — one wants a cite string and a forward-watch date, the other wants a CC-BY download and a citation format for a working paper. Persona pages are the **framing + CTA layer** on top of the technical SEO/entity-hub work already planned. They are cheap relative to the technical backlog (mostly copy + information architecture, not new data pipelines) and they are what actually converts a correctly-ranking page into a citation, a subscriber, or a donor.

---

## 1. Prioritized recommendations

**Priority = Reach/Impact + Confidence − Effort** (each 1–5; higher Priority = do sooner). Scored for a solo-founder-scale nonprofit team, static-export site, no ad budget.

| ID | Persona / use-case page | Search intent captured | Primary CTA | Impact | Effort | Confidence | Priority |
|----|--------------------------|------------------------|--------------|:---:|:---:|:---:|:---:|
| P1 | **`/cite`** — standalone "How to cite the Compassion Benchmark" page (split out of `/media`'s buried cite section) | "how to cite Compassion Benchmark", "how to cite [entity] compassion score", researcher/journalist citation lookup | **Cite** (primary); subscribe-free (secondary) | 3 | 1 | 5 | **7** |
| P2 | **`/for-journalists`** — persona-specific press hub split from `/media` (forward-watch deadlines, embargo/briefing offer, RSS-first framing, cite block) | "[Entity] accountability rating", journalists monitoring feeds for a citable independent source, "who covers AI lab governance independently" | **Subscribe-free** (RSS/newsletter); cite | 5 | 2 | 4 | **7** |
| P3 | **"Measure your organization"** — reposition `/self-assessment` with corporate-sustainability-team SEO framing | "how compassionate is my company", "free organizational ethics self-assessment", "corporate compassion assessment tool" | **Use-data** (take the free assessment) → subscribe-free | 3 | 1 | 4 | **6** |
| P4 | **Policy/NGO persona layer on `/countries`** — a framed "for policy researchers & NGOs" section (citation format, CC-BY note, grant/testimony use case) riding on the already-planned superlative-title fix (SEO G3) | "government accountability score", "humanitarian policy performance by country", "suffering reduction government index" | **Cite**; subscribe-free | 3 | 1 | 4 | **6** |
| P5 | **AI Governance Research Hub** — a dedicated persona page tying together the AI Labs Index, dimension explainers, and forward-watch triggers into one "why no ESG platform covers this" narrative (Segment A) | "AI lab governance comparison", "most responsible AI lab", "Anthropic vs OpenAI governance", "AI lab accountability scores" | Subscribe-free; use-data; cite | 5 | 3 | 4 | **6** |
| P6 | **Concerned-citizen "Find your score" entry + share hub** — a lightweight landing that routes superlative/entity search traffic straight to a shareable result (Segment F) | "[country] compassion score", "most compassionate country 2026", "is [company] ethical" | **Subscribe-free** (soft ask); share | 3 | 1 | 4 | **6** |
| P7 | **`/funders`** — promote the existing `/nonprofit-alt/research` "for foundations" section into its own standalone, SEO-addressable landing | "fund AI accountability research", "grant for independent institutional research", "foundation program officer accountability data infrastructure" | **Donate**/fund conversation (contact) | 3 | 2 | 4 | **5** |
| P8 | **ESG / corporate-sustainability data-gap hub** — targets analysts whose existing ESG platform (MSCI, Sustainalytics, RepRisk) has no AI-lab, robotics-lab, or government coverage | "AI lab ESG rating", "[company] governance score not in my ESG platform", "institutional accountability comparison" | **Use-data**; subscribe-free | 4 | 3 | 3 | **4** |
| P9 | **NGO/Advocacy "cite the benchmark, not your opinion" landing** — a pull-quote / stat-card generator plus cite string, framed for campaign use | "[company] labor rights score", advocacy researchers needing a defensible third-party number | **Cite**; subscribe-free | 3 | 2 | 3 | **4** |
| P10 | **Educator/Student "Teach with the Benchmark" hub** — classroom-ready framing of the methodology + indexes for ethics/policy/business courses | "compassion index for classroom", "institutional accountability teaching resource", "case study data for ethics course" | **Use-data**; subscribe-free | 3 | 2 | 3 | **4** |
| P11 | **Public "Cited By" / "As Seen In" showcase page** — a live, honest list of confirmed press/academic citations and embeds as they accrue (none fabricated; starts empty or founder-seeded, grows over time) | branded trust queries; also a backlink/citation hub other citers link into | **Cite** (reinforces); donate | 3 | 2 | 3 | **4** |
| P12 | **"Compare institutions" pages** — templated VS landing pages for high-interest pairs (e.g., `openai-vs-anthropic`, `usa-vs-china` governance) | "[Entity A] vs [Entity B] governance/compassion score" | Use-data; subscribe-free | 4 | 4 | 3 | **3** |

Notes on specific rows:
- **P4** is a *messaging/IA layer*, not a re-do of the SEO title/FAQ work already scoped in `GROWTH_SEO_2026-06-15.md` (G3, G4). It should ship in the same PR as that fix so the persona framing and the technical answer-block land together.
- **P8** and **P9** target professional/advocacy segments (C, E) whose direct monetization is explicitly out of scope now (nonprofit model) — their value here is **citation and subscribe-free reach**, not the Score-Watch/Observer product path described in the pre-nonprofit `GROWTH_AUDIENCE` doc.
- **P11** must not fabricate citations. If there are currently zero confirmed press/academic citations, ship the page with an honest "citations will be listed here as they're confirmed" state plus the cite-string generator — the page itself is still useful before it has content, because it's the destination a citer can be pointed to ("we'll add your piece here").
- **P12** is the highest-effort item (needs a small comparison-view template, not just copy) — sequence after P1–P7 land, and only for a curated set of high-interest pairs, not a full N×N matrix.

---

## 2. Persona → page → CTA map

| Persona | Primary landing page(s) | Search intent | Primary CTA |
|---|---|---|---|
| **Journalists / media researchers** | `/for-journalists` (new, P2), entity pages, `/updates`, `/updates/feed.xml` | Event-driven entity/company/country accountability queries; feed monitoring | Subscribe-free (RSS/newsletter) → cite |
| **AI-governance & safety researchers** | AI Governance Research Hub (new, P5), `/ai-labs`, dimension explainers (upstream SEO G4), `/updates/forward-watch` | "AI lab governance comparison", "most responsible AI lab" | Subscribe-free; use-data; cite |
| **ESG / corporate-sustainability analysts** | ESG data-gap hub (new, P8), `/fortune-500`, `/ai-labs`, `/data` | "[Company] ESG score", "AI lab ESG rating" | Use-data; subscribe-free |
| **Policy researchers / think tanks / IGOs** | `/countries` (persona layer, P4), `/methodology`, `/data` | "country governance ranking", "humanitarian policy performance" | Cite; use-data |
| **NGO / advocacy staff** | Advocacy "defensible claim" landing (new, P9), entity pages | Issue-specific entity queries; campaign data need | Cite; subscribe-free |
| **Educators / students** | "Teach with the Benchmark" hub (new, P10), `/methodology` | "compassion index classroom", "teaching resource for institutional accountability" | Use-data; subscribe-free |
| **Foundation program officers / funders** | `/funders` (new, P7), `/nonprofit-alt/support` | "fund independent institutional accountability research" | Donate / fund conversation |
| **Corporate sustainability teams (own-org lens)** | "Measure your organization" (`/self-assessment`, repositioned, P3) | "how compassionate is my company", "free organizational assessment" | Use-data → subscribe-free |
| **Concerned citizens / general public** | Concerned-citizen share hub (new, P6), superlative index pages, entity pages | "most compassionate country 2026", "is [company] ethical" | Subscribe-free (soft); share |
| **Existing entities / their own staff** (found via own-name search) | Own entity page + history | "[my company] compassion score" | Subscribe-free (Score-Watch-equivalent free follow, per `NONPROFIT_SIMPLIFY_PM` proposal #4) |

---

## 3. Acquisition loops — what compounds, and what to prioritize for a tiny team

Ranked by leverage-per-hour for a solo/small nonprofit team, consistent with `GROWTH_ACQUISITION_2026-06-15.md`'s channel ranking but reframed for the citation/subscribe/donate metric (no purchase funnel):

1. **The Daily Briefing subscribe-free loop — top priority.** This is the flywheel: free daily/weekly content → subscribe → habitual return → eventual cite or donate. Every persona page's secondary (or primary) CTA should resolve to this single subscribe form. Do not build persona-specific newsletters — one list, source-tagged by entry page (`source=for-journalists`, `source=ai-governance-hub`, etc.) so the same completion-block capture work already scoped upstream (`GROWTH_MASTER` G0.2, `GROWTH_ACQUISITION` Experiment 2) tells you which persona page is actually converting.
2. **Citation/embed flywheel + the "Cited By" page (P11).** Once the cite-string affordance and CC-BY embed exist (already scoped upstream), the compounding mechanic is passive: every citer becomes a permanent backlink, and the "Cited By" page turns each new citation into proof for the next citer and for funders. This is the nonprofit-appropriate analog to a sales funnel — it directly produces the "cite" success metric and needs no ongoing spend.
3. **RSS/newsletter as the syndication layer.** Prerequisite-only at this point (the feed bug fix is already flagged upstream as urgent) — once fixed, it is a zero-maintenance distribution channel for the journalist persona specifically. Don't invest further beyond the fix; it pays for itself.
4. **Share mechanics for the concerned-citizen persona.** Lowest effort, lowest individual yield, but free and compounding at the margin: a "my country/company ranks #X" share card (OG image + one-click copy) on entity and index pages. This is the only loop aimed at Segment F, and it should stay cheap — do not build a dedicated social product around it.

**Sequencing for a tiny team:** fix the plumbing (RSS, completion-block capture — already scoped, assumed in progress) → ship the subscribe-free CTA consistently across all new persona pages (loop 1) → ship the cite-string/embed infrastructure and the "Cited By" page (loop 2) → let RSS (loop 3) ride on the plumbing fix already scheduled → add the share card (loop 4) opportunistically, e.g. bundled with whichever persona page ships last.

**Do not build for a nonprofit team of this size right now:** paid acquisition, a second/segmented newsletter, per-persona CRM sequences, or a sales-style lead-scoring system. All of these assume a purchase funnel that no longer exists.

---

## 4. Conversion framing per persona (consistent with nonprofit lexicon)

Following `NONPROFIT_ALT_MESSAGING_2026-07-12.md`'s use/purge lexicon (support, cite, subscribe-free, funder — never buy, tier-as-unlock, sales, lead):

| Persona | Ask line (copy-ready) |
|---|---|
| Journalists | "Get the next scoop before the news cycle does. Subscribe free — the same feed journalists use to catch a score change first." |
| AI-governance researchers | "No other benchmark scores AI lab governance independently. Cite it, or watch it — free, evidence-linked, updated as the record changes." |
| ESG / sustainability analysts | "Coverage your platform doesn't have — free to read, free to cite." |
| Policy researchers / NGOs | "Free to cite under CC-BY. Built for a footnote, not a paywall." |
| Advocacy staff | "An independent score is a stronger public claim than an opinion. Cite the benchmark, not your own assessment." |
| Educators / students | "Real, evidence-linked institutional data — free for coursework and classroom use." |
| Funders / foundations | "This is public-interest infrastructure. Grant support keeps the daily research free for everyone who cites it." |
| Corporate sustainability teams | "See how your organization would score — free, and it stays private unless you choose to share it." |
| Concerned citizens | "Find out how your country, city, or company compares — free, and worth sharing." |

Every ask line above resolves to one of the three success actions (cite / subscribe-free / donate) — never to a price, a tier-as-unlock, or a sales contact.

---

## 5. Start here — the 3–5 highest-leverage persona pages

In priority order, the shortlist to build first:

1. **`/for-journalists` (P2)** — splits the journalist persona out of the merged `/media` page with sharper, forward-watch-and-embargo framing. Journalists are the amplifier for every other persona; this is the fastest path to the first confirmed citation.
2. **`/cite` (P1)** — a standalone, one-purpose citation page. Trivial effort (mostly a copy split from existing `/media` content), highest confidence, and directly serves the site's #1 success metric.
3. **AI Governance Research Hub (P5)** — the one persona with a genuine 12–18-month structural moat (no ESG incumbent covers AI labs). Highest-impact new page on the list; worth the extra build effort.
4. **"Measure your organization" reposition (P3)** — near-zero build cost (the tool already exists), captures a distinct high-intent query class (corporate self-assessment searches), and funnels straight into subscribe-free.
5. **Concerned-citizen "Find your score" share hub (P6)** — cheapest page on the list and the only one that feeds the share-mechanics acquisition loop (§3, loop 4), which no other persona page addresses.

---

## Handoffs

- **coordinator:** sequencing against the existing SEO/plumbing backlog (`GROWTH_MASTER_2026-06-15.md` Waves G0–G3) — the persona pages in §1 should ship *after* G0 (plumbing) but can run in parallel with G1 (entity hubs).
- **analytics:** instrument `source=` tags per persona page on the shared subscribe form (§3, loop 1) so persona-page performance is measurable; track `cite_this_click` and any future `cited_by_submission` event separately per persona-page referrer.
- **product-manager:** `/for-journalists`, `/cite`, `/funders`, and the AI Governance Research Hub each require an information-architecture decision (new top-level nav entries vs. sub-pages of `/media` and `/research`) — recommend resolving nav placement before build to avoid duplicate persona content drifting out of sync with `/media`/`/research`.

**Artifact path:** `docs/ORGANIC_GROWTH_PERSONAS_2026-07-14.md`
