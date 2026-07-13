# Nonprofit Alternate Site — Build Brief

**Date:** 2026-07-12 · **Owner:** Coordinator · **Status:** Active build brief for subagents.
**Goal:** Create a complete set of **alternate**, nonprofit-model pages WITHOUT changing any current
page. Build them in an isolated `/nonprofit-alt/` route namespace for founder review. Remove all
sales/purchase/commercial surface; replace with donation/support/mission copy. Preserve and strengthen the
independence brand. Draws on `docs/NONPROFIT_SIMPLIFY_MASTER_2026-07-12.md` and the four lens reviews.

---

## Hard constraints (ZERO-TOUCH)

- **Do NOT modify** any existing route under `site/src/app/*` (except adding the new `nonprofit-alt/` folder),
  `site/src/data/nav.ts`, `site/src/data/gumroad.ts`, `site/src/components/layout/*`, or any published data
  (`site/src/data/indexes/*.json`, `research/*`, `site/src/data/updates/*`, `evidence-reviews/*`).
- **Read-only** use of existing data (index JSON, `entityCount.ts`, `dimensions.ts`, updates `latest.json`,
  `indexRegistry.ts`) is encouraged — reuse the real numbers so the alt pages are accurate.
- **Reuse** existing UI primitives in `site/src/components/ui/*` and the design tokens in `globals.css`
  (dark theme). Do not restyle the global theme.
- **No commercial links.** Remove/omit every Gumroad URL, `/pricing`, `/services`, `/contact-sales`,
  `/purchase-research`, `/certified-assessments`, `/data-licenses`, `/advisory`, `/enterprise`, `/api-access`,
  "Book a call", "License the Suite", "Buy report" CTA. Replace with donation/support CTAs.
- Static export safe (`output: "export"`) — no server-only APIs; client islands are fine (`"use client"`).

## Route namespace (9 pages, mirrors the originals for easy comparison)

| Alt route | Mirrors | Purpose (nonprofit reframe) |
|-----------|---------|------------------------------|
| `/nonprofit-alt` | `/` (home) | Mission-forward hero, what we do, indexes teaser, latest briefing, independence promise, donate CTA, how we're funded |
| `/nonprofit-alt/indexes` | `/indexes` | The 8 indexes as free & open public-interest data; cite-with-attribution; soft support nudge |
| `/nonprofit-alt/updates` | `/updates` | Daily Briefing as free public-interest research; free email alerts; RSS/JSON; archive |
| `/nonprofit-alt/methodology` | `/methodology` | Credibility layer; 8 dimensions / 40 subdimensions; evidence hierarchy; independence policy front-and-center |
| `/nonprofit-alt/research` | `/research` | The research program; funder/grant-facing rigor + transparency |
| `/nonprofit-alt/support` | `/services` | **Replaces the sales funnel** — donation tiers, grants/foundations, mission partnerships (unpaid), data/volunteer contributions |
| `/nonprofit-alt/about` | `/about` | Who we are; nonprofit mission; independence; governance + funding transparency |
| `/nonprofit-alt/contact` | `/contact` | ONE general contact (press / researchers / partnerships / support) — no "sales" |
| `/nonprofit-alt/tools` | `/tools` | Free self-assessment + free public-interest tools (no licensed-product framing) |

## Shared components (create under `site/src/components/nonprofit/`)

- **`NonprofitNavbar.tsx`** — alt nav: Home · Indexes · Daily Briefing · Methodology · Research · About ·
  Contact + a primary **Support** button → `/nonprofit-alt/support`. (Self-contained; does not alter the
  global Navbar. It is acceptable that the global Navbar/Footer from the root layout still render above/below
  during preview — document this as a known preview limitation; do NOT edit the root layout to hide them.)
- **`NonprofitFooter.tsx`** — 3 groups: Indexes · Research & Data · Support & About. No commercial links.
- **`DonateCTA.tsx`** — reusable support call-to-action with the independence firewall line (below). Uses a
  single placeholder `SUPPORT_URL` constant (e.g. `"/nonprofit-alt/support"` or a `TODO-donate` placeholder) —
  no live Gumroad. Include monthly tiers ($5 / $10 / $25 / custom).
- **`SupportTiers.tsx`** — the donation tier cards (reused on home + support pages).
- Optional `nonprofit-alt/layout.tsx` route-group layout that wraps all alt pages with the Nonprofit
  Navbar/Footer.

## Donation / support model (copy guidance — "research & develop new approaches")

- **Framing:** "Fund independent measurement of institutional compassion." Mission-first, not transactional.
- **Tiers:** Supporter $5/mo · Sustainer $10/mo · Benefactor $25/mo · one-time/custom. Frame by impact
  ("keeps the daily research free and citable"), not by features unlocked.
- **Independence firewall line (REQUIRED wherever a donate CTA appears):** reuse the strongest existing
  assurance — "The assessment pipeline is a separate technical plane with no access to supporter records,
  payment data, or any commercial system. Support is gratitude, not influence — entities never pay for
  inclusion, score changes, or suppression of findings."
- **Transparency block:** a short "How we're funded" section (donations + grants; no entity payments) — this is
  what funders/press look for and replaces the old pricing page's trust role.
- **Grants/foundations:** a path for institutional funders on the support page.
- If 501(c)(3)/tax status is unknown, use neutral "support"/"contribute" language and add a
  `TODO: confirm tax-deductible language` note rather than asserting deductibility.

## Guardrails to PRESERVE / strengthen

- The independence policy statement must appear on home, methodology, about, and every support/donate surface.
- Keep all credibility signals: dimension framework, evidence hierarchy, entity counts (real, from data),
  daily-briefing "live" freshness, free & open data + citation posture.
- Accuracy: pull real counts from `entityCount.ts` / `indexRegistry.ts` / `updates/latest.json`; do not invent
  numbers.

## Validation (each build wave)

- `cd site && npx tsc --noEmit` clean.
- `npm run build` succeeds; new `/nonprofit-alt/*` routes prerender; page count increases by exactly the number
  of new routes; no existing route removed.
- No import of `gumroad.ts` from any `nonprofit-alt` file; `grep -rn "gumroad" site/src/app/nonprofit-alt site/src/components/nonprofit` → 0.

## Sequencing

- **Wave 1 (scaffolding + home):** one frontend-engineer builds the shared components + `layout.tsx` + the
  **home** page, and writes brief "design notes" for reuse.
- **Wave 1b (parallel): growth-strategist** develops the nonprofit positioning + donation messaging/impact copy
  → `docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md` for Wave 2 to use.
- **Wave 2 (parallel):** frontend-engineers build the remaining 8 pages against Wave 1 components + Wave 1b copy.
