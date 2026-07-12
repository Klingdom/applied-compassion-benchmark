# Nonprofit Transition — UX Simplification Proposal
**Date:** 2026-07-12
**Author:** UX Designer agent
**Scope:** Navigation, route inventory, and primary user journeys ahead of the commercial → nonprofit transition
**Method:** Static review of `nav.ts`, `Navbar.tsx`, `Footer.tsx`, all `site/src/app/*/page.tsx` routes, `ResearchConfigurator.tsx`, `SelfAssessment` route, `gumroad.ts`, and prior UX docs (`SITE_REVIEW_UX_2026-06-12.md`, `UX_AUDIT_2026-04-20.md`, `HOMEPAGE_REVIEW_UX_2026-06-17.md`, `INDEXES_REVIEW_UX_2026-06-17.md`). No code changed — proposal only.

This document builds on, and does not repeat, the prior UX reviews' entity-page and homepage findings. Those findings (redundant callouts, scroll-wall sections, section reordering) remain valid and are orthogonal to the nonprofit transition. This document is scoped to **which routes and nav items should exist at all** under a nonprofit model, not to in-page layout.

---

## 1. What the current site actually is, structurally

Enumerating `site/src/app/`, the site has **~30 top-level routes** plus 8 entity-detail templates (with `/history` variants). Of the top-level routes, the following are pure commercial infrastructure with no nonprofit-mission content of their own:

`/pricing`, `/services`, `/purchase-research`, `/data-licenses`, `/advisory`, `/enterprise`, `/certified-assessments`, `/contact-sales`, `/assess-your-organization`, `/prompting-suite-for-humans` (licensed product), plus the `ResearchConfigurator` component and the `SCORE_WATCH` paid-per-entity product in `gumroad.ts`.

That is **10 routes** (plus one component and one product config) whose entire purpose is routing a visitor toward a sale. Several of them route to each other in circles: `/contact` recommends `/contact-sales`; `/contact-sales` and `/services` and `/assess-your-organization` all recommend each other; `/pricing`, `/services`, and `/assess-your-organization` all contain a near-identical "visitor type → best path → revenue model" table. This is a self-reinforcing sales cluster, not a set of independent user journeys.

A nonprofit visitor has five real jobs on this site: **understand a score, explore rankings, read the daily research, verify the methodology/independence, and support the mission financially.** None of those five jobs requires more than 6 primary nav destinations. The current site requires 7 in the primary nav plus 8 more in the footer "Services" group alone.

---

## 2. Proposed simplified navigation

### Primary nav (was 7 items + a "Contact Sales" button; becomes 5 items + a "Support" button)

| Position | Label | Destination | Change from current |
|---|---|---|---|
| 1 | Indexes (dropdown) | `/indexes` + 8 index pages | Unchanged — keep as-is |
| 2 | Daily Briefing | `/updates` | Renamed from "Updates" for the reason already flagged in `SITE_REVIEW_UX_2026-06-12.md` (nav says "Updates," page says "Daily Briefing," archive says "Briefings" — pick one). Keep the red live-dot. |
| 3 | Methodology | `/methodology` | Unchanged |
| 4 | About | `/about` | Unchanged, but content trimmed of commercial-service self-description (see Table row 4) |
| 5 | Contact | `/contact` | Unchanged destination, but content simplified (Table row 2) |
| — | **Support** (primary button, right-aligned) | `/supporters` | **Replaces "Contact Sales."** This is the single highest-signal nav change: a nonprofit's top-right button should invite giving, not route to a sales team. |

Removed from primary nav entirely: **Services**, **Research** (folded into About/Methodology — see Table row 5).

### Footer — from 5 link groups to 3

Current groups: Indexes, Research, Services, Tools, Community (5 groups, 32 links total, several duplicated across groups — e.g. Methodology and Contact each appear twice).

Proposed:

| Group | Contents |
|---|---|
| **Indexes** | Unchanged — all 8 index links |
| **Research & Data** | Methodology · Daily Briefing · Browse archive · Special Reports · Forward Watch · Free Data (`/data`) · For Press & Researchers (`/media`) · RSS/JSON feeds |
| **Support & Tools** | Become a Supporter (`/supporters`) · Self-Assessment (free) · API Access (free tier) · About · Contact |

This removes the entire "Services" footer group (Pricing, Score-Watch Alerts as a paid SKU, Purchase Research, Data Licenses, Advisory, Certified Assessments, Enterprise, Contact Sales — 8 links) and de-duplicates Methodology/About/Contact, which currently appear in more than one footer column.

---

## 3. Primary journey map (nonprofit)

**(a) Understand a score**
Home or Indexes search → entity detail page → (optional) Methodology link for context → (optional) free Score-Watch subscribe.
*No change to this journey's shape — the entity page IS the destination. The simplification is removing the paid-tier decision that currently sits behind Score-Watch (see Table row 3).*

**(b) Explore rankings**
Home → Indexes hub → pick an index → ranking table → entity page.
*Unchanged. This journey is already reasonably short (flagged for in-page density issues in `INDEXES_REVIEW_UX_2026-06-17.md`, not nav structure).*

**(c) Read the daily research / verify methodology**
Nav "Daily Briefing" → `/updates`. Nav "Methodology" → `/methodology`.
*Unchanged destinations; terminology now consistent (Table row 8).*

**(d) Support the mission**
Nav "Support" button → `/supporters` → choose a monthly tier → Gumroad checkout.
*This replaces the entire current "Contact Sales → pick a commercial product → sales conversation" journey with a single-click, self-serve donation path. This is the central nonprofit-alignment move in this proposal.*

**(e) Press / researcher verification (secondary but important for credibility)**
`/media` → citation format + methodology link + data endpoints + RSS/JSON feeds → `/contact` if a human is needed.
*Unchanged — this journey is already correctly free and self-serve and should be a model for the rest of the site.*

**(f) Self-assess your own organization**
Nav → Tools/footer → `/self-assessment` (free, 40-question tool).
*Currently this journey is duplicated by `/assess-your-organization`, a five-section sales funnel that routes to Advisory/Certified Assessments/Enterprise/Contact Sales. Recommend retiring that duplicate page (Table row 6) and keeping only the free tool.*

---

## 4. Prioritized simplification proposals

| # | Title | Change | Rationale | Evidence | Impact | Effort | Risk |
|---|---|---|---|---|---|---|---|
| 1 | **Retire the commercial-services cluster** | Remove `/services`, `/pricing`, `/advisory`, `/enterprise`, `/certified-assessments`, `/data-licenses`, `/purchase-research` (and `ResearchConfigurator`) as standalone routes. Redirect each to the nearest mission page (`/indexes`, `/data`, or `/about`). | These 7 routes exist only to route visitors toward a sale and mostly reference each other in a closed loop ("visitor type → best path → revenue model" tables appear near-verbatim on `/pricing`, `/services`, and `/assess-your-organization`). `/certified-assessments` in particular is the highest independence-brand risk on the site: a paid "assessor-led formal review" of a named entity is the closest thing on the site to pay-for-influence optics, even though its own copy explicitly disclaims score changes. A nonprofit institution should not carry a page whose premise requires that disclaimer at all. | `site/src/app/services/page.tsx` (full file, esp. "Monetization paths" table lines 119–155); `site/src/app/pricing/page.tsx` (5-tier ladder); `site/src/app/certified-assessments/page.tsx`; `site/src/app/advisory/page.tsx`; `site/src/app/enterprise/page.tsx`; `site/src/app/data-licenses/page.tsx`; `site/src/app/purchase-research/page.tsx`; `site/src/components/purchase/ResearchConfigurator.tsx` | 5 | 4 | 3 |
| 2 | **Merge `/contact-sales` into `/contact`; drop "Sales" framing** | One contact page with a plain topic selector (General / Press / Data question / Partnership / Support). Remove the navbar's "Contact Sales" primary button. | `/contact`'s own copy currently tells the visitor to go to `/contact-sales` for anything substantive ("the fastest path is usually the dedicated sales route"), and `/contact-sales` in turn is described as routing "research purchases, data licensing, advisory support, assessments, or enterprise agreements." A nonprofit has no reason to maintain a "sales" contact surface distinct from its general contact surface. | `site/src/app/contact/page.tsx` lines 30–55 (routes to `/contact-sales` and `/services`); `site/src/app/contact-sales/page.tsx` metadata (line 12); `site/src/components/layout/Navbar.tsx` lines 122–127 | 5 | 2 | 1 |
| 3 | **Make Score-Watch a free, donation-supported alert instead of a $79/entity SKU** | Convert the live Gumroad-checkout Score-Watch product into a free subscribe (email + entity slug), funded by general donations rather than per-entity purchase. | The current pricing model is already internally inconsistent: `/pricing`'s own "Free" tier claims to include "score-band alert emails for any watched entity," while the same page's Score-Watch tier charges $79/year for what sounds like the identical feature. A nonprofit alert product should not require a credit card. This also removes the only remaining paid SKU tightly wired into the Cloudflare Worker (entity-scoped Gumroad webhook parsing). | `site/src/data/gumroad.ts` `SCORE_WATCH` config (`useGumroad: true`, `$79/yr`, `buildScoreWatchUrl`); `site/src/app/pricing/page.tsx` lines 42–66 (Free tier copy vs. Score-Watch tier copy); `site/src/app/score-watch/page.tsx` | 4 | 3 | 3 |
| 4 | **Remove "Services" from primary nav and footer; trim `/about`'s commercial self-description** | Drop the "Services" nav item and footer group. Edit `/about`'s "What the organization does" and "How the organization is structured" sections to remove references to Advisory/Certified Assessments/Enterprise as core structural pillars. | `/about` currently describes itself in parallel with a commercial consultancy ("Supports institutions... through reports, data access, advisory support, certified assessments, and enterprise agreements" is listed as one of 4 core things the org "does," on equal footing with "Publishes indexes" and "Maintains methodology"). Under a nonprofit model this should read as: publishes indexes, maintains methodology, produces research, welcomes support. | `site/src/data/nav.ts` lines 1–9, 35–44; `site/src/app/about/page.tsx` lines 76–89, 194–239 (service cards, "Purchase Research / Advisory / Certified Assessments" related-links section) | 4 | 1 | 1 |
| 5 | **Fold `/research` into `/about` (or delete)** | `/research` largely restates stats and index descriptions already present on `/indexes` and `/about`. Merge its unique content (if any) into `/about`'s "What the organization does" section and drop it as a standalone nav destination. | Three pages (`/about`, `/research`, `/indexes`) each open with a near-identical "N entities, 7/8 index families, 8 dimensions, 40 subdimensions" stat block and a list of the same 5 index families. This is the same redundancy pattern already flagged for the home page in `SITE_REVIEW_UX_2026-06-12.md` Finding 5, just spread across three separate routes instead of sections of one page. | `site/src/app/research/page.tsx` lines 27–33 (stat block), 51–60 (report cards); `site/src/app/about/page.tsx` lines 35–40, 76–89; `site/src/app/indexes/page.tsx` hero stats — cross-reference confirms near-duplicate content | 3 | 2 | 2 |
| 6 | **Retire `/assess-your-organization`; keep only `/self-assessment`** | Delete the 7-section sales-funnel hub page (Step 1/2/3 pathway cards, "Typical entry points" table, "Includes / does not include" panel). Keep the actual free 40-question self-assessment tool at `/self-assessment` as the only "assess yourself" destination. | This is the single most sales-funnel-shaped page on the site: it exists purely to route a visitor toward Advisory → Certified Assessments → Enterprise → Contact Sales, with a table literally titled "Best entry path" and "Potential next step" mapping situations to paid products. Nothing on this page is itself informative — it is pure routing logic exposed as a public page. Its "Assessment tools" section (three cards) already links out to `/self-assessment`, `/prompting-suite-for-humans`, and `/ai-evaluation-suite`, which is the only content worth preserving, and those tools are already reachable from the Tools nav dropdown. | `site/src/app/assess-your-organization/page.tsx` (entire file — see "Available pathways" Step 1/2/3 cards lines 86–117, "Typical entry points" table lines 177–204) | 5 | 1 | 2 |
| 7 | **Consolidate `/data-licenses` and the report-purchase configurator into the existing free `/data` page** | Instead of a licensing-tier configurator (area × format × license × year → price), offer direct free CSV/JSON downloads from `/data` with a citation requirement, and an optional "support this research" link to `/supporters`. | `/data` already describes itself as "free to access, please cite with attribution" — this is the correct nonprofit posture. `ResearchConfigurator` and `/data-licenses` describe the identical underlying dataset behind a 4-variable pricing matrix (Individual/Team/Enterprise/Academic license × PDF/Appendix/Deck/Institutional format × single/multi-year). Maintaining two access models for the same data (one free, one licensed) is confusing and doubles the maintenance surface for no nonprofit benefit. | `site/src/app/data/page.tsx` lines 11–14 ("free to access, please cite with attribution"); `site/src/app/data-licenses/page.tsx`; `site/src/components/purchase/ResearchConfigurator.tsx` lines 1–80 (area/format/license/year matrix) | 4 | 3 | 2 |
| 8 | **Commit to one term for the daily publication: "Daily Briefing"** | Use "Daily Briefing" consistently in the nav label, page `<h1>`/title, and archive heading. Currently the nav says "Updates," the page title says "Compassion Benchmark Daily Briefing," and the archive says "Daily Research Archive." | Already flagged as a cross-cutting issue in `SITE_REVIEW_UX_2026-06-12.md` ("Terminology inconsistency" section) but not yet resolved. Worth resurfacing now because a nonprofit's daily research output is one of its strongest, most frequently-linked credibility assets — it deserves one stable name for citation and word-of-mouth. | `site/src/data/nav.ts` line 3 ("Updates"); `site/src/app/updates/page.tsx` line 35 ("Compassion Benchmark Daily Briefing"); `site/src/app/updates/archive/page.tsx` line 13 ("Daily Research Archive") | 2 | 1 | 1 |
| 9 | **Reframe or retire `/prompting-suite-for-humans` as a licensed product** | Either make the 40-question human-assessment suite a free download (consistent with `/self-assessment` and `/ai-evaluation-suite`), or remove it. Its current CTA is "License the Suite" routing to `/contact-sales`. | This is the last remaining "License [product] →" consulting-shaped CTA on the site once row 1 is done, and it is inconsistent with the two sibling tools (`/self-assessment`, `/ai-evaluation-suite`) which read as free public tools. Keeping one paid license product standing alone, with no pricing page to route from (once `/pricing` and `/contact-sales` are gone), leaves it a dead-end sales page with nowhere for its "License the Suite" button to go. | `site/src/app/prompting-suite-for-humans/page.tsx` lines 22–33 ("License the standard question libraries..." / CTA "License the Suite" → `/contact-sales`) | 3 | 2 | 2 |

---

## 5. KEEP list — credibility and independence UX that must not be touched

These elements are the trust infrastructure of the site and should be preserved (and in some cases elevated, not simplified away) through the transition:

- **The independence policy statement itself** ("entities never pay for inclusion, score changes, or suppression of findings"). Currently this sentence lives on `/about`, `/methodology`, `/services`, and `/pricing`. When rows 1 and 4 remove `/services` and `/pricing`, **this statement must be relocated, not deleted** — it belongs on `/about` and `/methodology` at minimum, and ideally restated on `/supporters` (see below).
- **`/supporters`'s "two independent technical planes" statement** — "The assessment pipeline... has no access to supporter records, payment data, or any commercial system." This is the strongest, most specific independence assurance anywhere on the site (it names the actual technical separation, not just a policy promise). This should become the model sentence reused wherever a donation or payment CTA appears after the transition.
- **Methodology page's evidence hierarchy, 8-dimension/40-subdimension structure, and version log.**
- **Entity page evidence-freshness stamp and tier-provenance chips** (Tier A/B/C evidence signals) — already flagged for visual consolidation, not removal, in `SITE_REVIEW_UX_2026-06-12.md`.
- **`/media` (For Press & Researchers)** — citation formats, RSS/JSON feeds, data endpoints. This is already correctly free and self-serve and is a template for how the rest of the site should behave post-transition.
- **`/data`'s free, CORS-open, cite-with-attribution posture.**
- **Navbar "Daily Briefing" live-wire red dot** — signals active, non-static research.
- **Entity search** (`NavbarSearch`, `EntitySearch`) — core free discovery tool, unrelated to the commercial cluster.
- **Score bands and dimension definitions on `/methodology`.**

---

## 6. Open questions for the founder

1. **Live customers.** Are there currently any paying Advisory, Certified Assessment, Enterprise, or Data License customers? If so, rows 1 and 7 need a sunset/transition plan (existing agreements honored, page kept live but de-linked from nav) rather than a hard delete.
2. **Supporters checkout is not actually live yet.** `gumroad.ts` shows `SUPPORTER.useGumroad: false` and `GUMROAD.supporterMonthly` is still a `TODO` placeholder — the `/supporters` page's donate button currently falls back to `/contact-sales?product=supporter`. If "Support" becomes the primary nav CTA (row 2 / journey (d)), **the Gumroad supporter product needs to go live before or simultaneously with removing the sales cluster**, or the nonprofit's single most important CTA will silently route to a page you're also deleting.
3. **Score-Watch revenue.** Is the $79/entity Score-Watch product a meaningful revenue line today? Converting it to free (row 3) is the most technically expensive item in this table (Worker webhook currently keys watches off the Gumroad purchase event) and should only proceed if the founder is comfortable losing that revenue line in exchange for full nonprofit-model consistency.
4. **Prompting Suite for Humans and AI Evaluation Suite.** Do either of these currently generate revenue, or are they effectively unused/undiscovered pages? This determines whether row 9 is "make free" or "delete."
5. **501(c)(3) / fiscal sponsorship status.** Not a UX question per se, but `/supporters` will need donation-receipt and tax-deductibility language (or an explicit "this is not a tax-deductible donation" disclosure) once it becomes the primary CTA — please confirm the legal/nonprofit status so copy can be written accurately. Flagging here so it isn't missed downstream.
6. **`/research` as a funder-facing page.** Nonprofits sometimes want to keep a distinct "Research Program" page for grant applications and funder due diligence, separate from the visitor-facing `/about`. If that's a future need, recommend keeping `/research` as a route (not deleted) but still removing it from the primary nav (row 5's "fold or delete" — lean toward "keep the route, drop the nav item" if this is a real future need).
7. **Existing Score-Watch subscribers.** If row 3 proceeds, do current $79/yr subscribers get grandfathered, refunded, or converted to the free tier automatically? This affects both UX copy and the QA test plan for the transition.

---

## Handoff notes

**For frontend-engineer:** Rows 1, 2, 4, 6, 7 require route removal/redirects (`next.config.ts` is a static export — confirm the redirect mechanism is handled in `nginx.conf`/`nginx-ssl.conf` per `DEPLOYMENT.md`, not a Next.js redirect, since this is `output: 'export'`). `nav.ts` and `Footer.tsx`/`Navbar.tsx` changes are small and low-risk (row 4, row 8) and can ship independently of the larger route removals.

**For product-manager:** Rows 1, 3, 6, 7, and 9 remove revenue-generating surfaces. Recommend sequencing: ship rows 2, 4, 5, 8 (nav/copy only, no revenue impact) first as a quick win, then resolve the open questions above before rows 1, 3, 6, 7, 9 (route/product removal).

**For qa-engineer:** Once routes are removed, verify no internal link anywhere on the site (nav, footer, in-page cross-links, entity pages, updates archive) still points at a deleted route. The current cross-linking between `/services`, `/pricing`, `/assess-your-organization`, `/contact-sales`, and `/advisory`/`/enterprise`/`/certified-assessments`/`/data-licenses` is dense — a link audit after removal is essential, not optional.
