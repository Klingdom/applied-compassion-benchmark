# Improvement Backlog — 2026-04-18

**Trigger:** Founder reports LinkedIn engagement on daily update excerpts. Team convened to generate growth + revenue candidates.

**Specialists engaged (parallel):**
- growth-strategist → `GROWTH_CANDIDATES_2026-04-18.md`
- market-research → `MARKET_CANDIDATES_2026-04-18.md`
- analytics → `ANALYTICS_CANDIDATES_2026-04-18.md`
- ux-designer → `UX_CANDIDATES_2026-04-18.md`

**Scoring formula:** Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5, range −10 to +20)

---

## 🎯 Convergence finding

**Three of four agents independently identified "entity detail pages" as the load-bearing missing piece.** The LinkedIn flywheel breaks at: *post about an entity → visitor lands on → nothing entity-specific → bounces*. Every downstream experiment (attribution, pricing tiers, share affordances, SEO) is more valuable if entity pages exist first.

---

## Tier A — This week. Zero/low effort. Unlocks measurement for everything. ✅ **COMPLETE 2026-04-18**

| # | Candidate | From | Score | Effort | Status |
|---|-----------|------|-------|--------|--------|
| 1 | **LinkedIn UTM convention** (zero code — apply `?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content={entity}` to every post URL) | analytics | 21/30 | 0 | ✅ Documented in `docs/LINKEDIN_UTM.md` |
| 2 | **Gumroad outbound click tracking** (2 hrs — add `trackEvent` prop to `Button.tsx`, wire to 5 Gumroad products) | analytics | 23/30 | 1 | ✅ Auto-tracks `gumroad_click` with product key for every Gumroad URL used in `Button.tsx` |
| 3 | **Newsletter signup Umami event** (2 lines in `NewsletterSignup.tsx`) | analytics | 19/30 | 1 | ✅ Fires `newsletter_subscribed` with `{source, variant}` on success |
| 4 | **Contact-sales form submission tracking** (fire `contact_sales_submitted` with product param) | analytics | 21/30 | 1 | ✅ Fires `contact_sales_submitted` with `{service_interest, has_organization}` on success |

**Implementation summary:**
- New: `site/src/lib/analytics.ts` — `trackEvent()` SSR-safe helper + `gumroadProductFromUrl()` reverse lookup
- Patched: `site/src/components/ui/Button.tsx` — now `"use client"`, auto-tracks Gumroad external clicks, accepts optional `trackAs`/`trackData` props for custom events
- Patched: `site/src/components/ui/NewsletterSignup.tsx` — fires Umami event on success + error
- Patched: `site/src/components/purchase/SalesInquiryForm.tsx` — fires Umami event on submit + error
- New: `docs/LINKEDIN_UTM.md` — stable UTM naming convention for all outbound LinkedIn posts

**Validated:** `npx tsc --noEmit` clean, `npm run build` succeeds, all 34 static pages generated.

**Next LinkedIn post must use the UTM convention.** Every post shared without it is permanent attribution loss. Reference `docs/LINKEDIN_UTM.md`.

**Rationale:** Without these, every other experiment is blind. Every LinkedIn post published without UTMs is permanent attribution loss. Every Gumroad click is invisible. You can ship all four in half a day.

---

## Tier B — The load-bearing structural change ✅ **COMPLETE 2026-04-18**

| # | Candidate | From | Score | Effort | Status |
|---|-----------|------|-------|--------|--------|
| 5 | **Entity detail pages** (`/company/{slug}`, `/country/{slug}`, `/city/{slug}`, `/ai-lab/{slug}`) — shareable URL for every assessed entity, entity-scoped Gumroad CTA, "notify me when this score changes" signup | growth (primary), UX (implicit), market (prerequisite) | **14** | 2 | ✅ 1,155 new pages across 7 routes — `/company`, `/country`, `/us-state`, `/ai-lab`, `/robotics-lab`, `/city`, `/us-city` |

**Implementation summary:**
- New: `site/src/lib/slugify.ts` — dependency-free shared slugger matching overnight-pipeline convention
- New: `site/src/data/entities.ts` — unified entity registry with collision-safe slug generation, kind config (route, index slug, Gumroad mapping, metadata fields), build-time lookup API
- New: `site/src/data/updates/entityChanges.ts` — build-time index mapping `(indexSlug, entitySlug) → latest score change` across all daily briefings
- New: `site/src/components/entity/EntityDetail.tsx` — shared UI: hero with rank/band/composite, latest research update callout, 8 dimension bars, entity-scoped Gumroad CTA with `trackData.entity_slug`, entity-scoped NewsletterSignup with `source="entity-{slug}"`, breadcrumb nav
- New: `site/src/components/entity/renderEntityPage.tsx` — shared `generateStaticParams`, `generateMetadata`, default page factory. Emits `Rating` JSON-LD schema per entity
- New routes: `app/company/[slug]`, `app/country/[slug]`, `app/us-state/[slug]`, `app/ai-lab/[slug]`, `app/robotics-lab/[slug]`, `app/city/[slug]`, `app/us-city/[slug]`
- Patched: `RankingTable` accepts `entityKind` prop — entity names in the table now link to detail pages
- Patched: all 7 index pages pass `entityKind` to RankingTable
- Patched: `sitemap.ts` includes 1,155 entity URLs

**Routes shipped (entity counts):**
- `/company/[slug]` → 447 Fortune 500 pages
- `/country/[slug]` → 193 country pages
- `/us-state/[slug]` → 21 state pages
- `/ai-lab/[slug]` → 50 AI lab pages
- `/robotics-lab/[slug]` → 50 robotics lab pages
- `/city/[slug]` → 250 global city pages
- `/us-city/[slug]` → 144 U.S. city pages
- **Total new pages: 1,155**
- **Total site pages: 1,189** (up from 34)

**Slugs align with overnight pipeline output:** `/ai-lab/openai`, `/company/target`, `/company/meta-platforms`, `/company/ford-motor`, `/country/iran`, `/us-city/new-york-city` all resolve correctly.

**Validated:**
- `npx tsc --noEmit` clean
- `npm run build` succeeds, 1,189 pages generated
- Spot-check: `/ai-lab/openai` shows composite 38.8, band Developing, latest research callout pointing to 2026-04-18
- Spot-check: `/company/target` renders Fortune 500 context, `entity-target` newsletter source
- Sitemap includes 1,180 URLs (all entity pages + static pages)

**LinkedIn flywheel now closed:**
Post about OpenAI downgrade → `compassionbenchmark.com/ai-lab/openai?utm_content=openai` → entity page with score, latest change, per-entity newsletter + Gumroad CTA → Umami funnel captures every step.

**Why this unlocks everything:**
- **LinkedIn posts** get a tight destination: "OpenAI downgraded → compassionbenchmark.com/ai-lab/openai" instead of a ranking table
- **SEO:** "Target compassion score" is a zero-competition query that ranks in days for entity navigational searches
- **Conversion:** CTA scoped to the entity's index (`$195 AI Labs Index` for an OpenAI visitor, not a generic "buy research")
- **Newsletter:** "Get notified when OpenAI's score changes" is a concrete offer, not a generic signup
- **Downstream product sales** (Score-Watch Alerts, sector briefs) all depend on entity pages existing

Data already exists in the daily JSON — no new research needed. Static page template applied to the assessed-entities set.

---

## Tier C — Monetization expansion (after A + B)

| # | Candidate | From | Pricing | Effort |
|---|-----------|------|---------|--------|
| 6 | **Score-Watch Alert subscription** — $79/yr per entity, email on score change | market | $79/yr | 2 |
| 7 | **DEI Rollback Brief (Fortune 500)** — one-off report capitalizing on Target signal | market | $495 | 2 |
| 8 | **AI Governance Subscription** — Illinois SB-3444 + EU AI Act tracking for enterprise T&S teams | market | $2,400/yr | 3 |
| 9 | **Healthcare Accountability Report** — UHG + CVS + J&J + Cigna cluster (launch before Apr 21 UHG earnings) | market | $750 | 2 |

**Pricing headroom found:** Sustainalytics/RepRisk institutional data floor is $15K–$30K/year. Current catalog tops at $5K. 3–6× headroom exists if ICP is institutional. Stratechery / Politico Pro validate $79–$299/year for individual alerts.

---

## Tier D — Strategic, slower burn

| # | Candidate | From | Score | Effort |
|---|-----------|------|-------|--------|
| 10 | **Institutional evidence review service** — entity pays for review-cycle access, not score outcomes. Publish as service, add quiet "submit evidence" link on entity pages, let 90 days of inbound validate demand | growth | 8 | 2 |
| 11 | **Annual Institutional Subscription** — $12K–$25K/yr, Q3 2026 target after pipeline has 90+ day track record | market | (deferred) | 4 |

**Independence policy guard:** Candidate 10 is the hardest to get right. The line is: entities pay for the *process* (structured evidence submission, scheduled re-assessment), never for the outcome. If messaging slips even slightly, it compromises the Independence policy that is the entire product moat. Draft language must go through product-manager review.

---

## Tier E — UX improvements that compound with Tier B

| # | Candidate | From | Score | Effort |
|---|-----------|------|-------|--------|
| 12 | Newsletter CTA in hero section of /updates (above score cards) | UX | 15 | 1 |
| 13 | Score change cards link to ranking pages via `?search={slug}` | UX | 15 | 2 |
| 14 | Entity-scoped Gumroad CTA inside each score card on /updates | UX | 14 | 2 |
| 15 | LinkedIn share + copy-link button per entity card | UX | 12 | 3 |
| 16 | Report content preview on purchase page (ToC / sample) | UX | 12 | 3 |

**After Tier B ships, candidates 13–15 become cleaner** — score cards link to `/company/{slug}` instead of a filtered ranking page.

---

## Tier F — Measurement deepening (after A is live)

| # | Candidate | From | Score | Effort |
|---|-----------|------|-------|--------|
| 17 | Updates page section depth tracking via IntersectionObserver | analytics | 16/30 | 2 |
| 18 | LinkedIn "Most Surprising Finding" weekly format test (4 weeks, A/B against daily excerpts) | growth | 12 | 1 |

---

## Tier G — SEO scale-up

| # | Candidate | From | Score | Effort |
|---|-----------|------|-------|--------|
| 19 | SEO stub pages for unassessed Fortune 500 (top 100 by rank) | growth | 10 | 3 |
| 20 | Score alert signup block embedded in every index table page | growth | 12 | 2 |

---

## Recommended sequence

**Week 1 (this week):**
Tier A (4 items, ~4 hours total) → establishes attribution before any further investment.

**Week 2–3:**
Tier B (entity detail pages) — the single highest-leverage structural change in the backlog.

**Week 4:**
Tier C candidate 6 or 7 (Score-Watch Alerts or DEI Rollback Brief) — first new revenue product, validated by entity-page traffic data.

**Ongoing:**
Tier E candidates 12, 13, 14 as incremental UX improvements — all become easier after Tier B.

**Month 2+:**
Tier D (institutional evidence service with policy review) and Tier G (SEO scale).

---

## Open questions before selection

1. **Is there a Gumroad product mix constraint?** If launching a new subscription product (Candidate 6 or 8) requires Gumroad plan upgrade or new integration, Tier C is slower than it looks.
2. **LinkedIn audience composition?** The engagement is real but the ICP is inferred. One way to resolve: survey link in the next 3–5 LinkedIn posts asking "What's your role?" — 30-second form.
3. **Independence policy framing for Candidate 10.** Needs explicit product-manager + user review before publication.
