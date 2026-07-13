# Nonprofit-alt shared components — design notes

Wave 1 scaffolding for `site/src/app/nonprofit-alt/*`. Read
`docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md` before building a Wave 2 page —
this doc only covers how to *reuse* what Wave 1 built, not the page-by-page
content requirements.

## Files in this directory

| File | Purpose |
|---|---|
| `constants.ts` | Single source of truth: `SUPPORT_URL`, `INDEPENDENCE_FIREWALL_LINE`, `TAX_STATUS_NOTE`, `SUPPORT_TIERS`, `FUNDER_CONTACT_NOTE`. Import from here — never re-declare tier pricing or the firewall copy in a page file. |
| `NonprofitNavbar.tsx` | Alt nav, no props. Drop it once per page via the route-group layout (already wired — you don't need to import it in a page). |
| `NonprofitFooter.tsx` | Alt footer, no props. Same — already wired via layout. |
| `DonateCTA.tsx` | The reusable donate block. Props below. |
| `SupportTiers.tsx` | Just the 4 tier cards (`SupportTiers`), used standalone by `DonateCTA` or directly on `/nonprofit-alt/support`. |

## `DonateCTA` props

```tsx
interface DonateCTAProps {
  heading?: string;       // default: "Fund independent measurement of institutional compassion"
  description?: string;   // default: mission-framed one-liner
  showTiers?: boolean;    // default true — renders <SupportTiers /> inline
  className?: string;
}
```

Usage:

```tsx
import DonateCTA from "@/components/nonprofit/DonateCTA";

// Full version (home, support page)
<DonateCTA />

// Compact version (end of a long page — methodology, research, contact)
<DonateCTA
  heading="Help keep this research free"
  description="Every dollar funds evidence review, not a subscription."
  showTiers={false}
/>
```

`DonateCTA` **always** renders `INDEPENDENCE_FIREWALL_LINE` verbatim and the
`TAX_STATUS_NOTE` TODO. Do not strip these out when customizing heading/description —
they are the one hard requirement from the brief that must appear on every
donate surface.

## `SupportTiers` props

```tsx
{ className?: string }
```

Renders a 4-up (`sm:grid-cols-2 lg:grid-cols-4`) grid of `Card`s from
`SUPPORT_TIERS` in `constants.ts` (Supporter $5/mo · Sustainer $10/mo ·
Benefactor $25/mo · one-time/custom). The Sustainer card uses
`Card variant="featured"` for a subtle visual emphasis — this is a design
choice, not a claim about popularity; do not add "most popular" or similar
unverified copy to the tier cards.

To change pricing or impact copy, edit `SUPPORT_TIERS` in `constants.ts`
once — both `SupportTiers` and any page that imports the array directly will
pick it up.

## Section / spacing / heading conventions (match the rest of the site)

These are **not new conventions** — they're the same primitives and spacing
rhythm used across `site/src/app/*` (home, /indexes, /about, etc.), so
nonprofit-alt pages read as the same site, just reframed:

- Wrap every top-level page section in `<section className="py-[30px]">`
  (or `py-[20px]` for a tighter block, `pt-[72px] pb-10` for the hero only).
- Wrap section content in `<Container>` (from `@/components/ui/Container`) —
  never hand-roll the `w-[min(1280px,calc(100%-32px))] mx-auto` width logic.
- Use `<SectionHead title=".." description=".." />` for every section that
  needs a heading + one-line dek. Use a bare `<h1>`/`<h2>` only in the hero
  and inside `<Callout>`/`<Panel>` blocks that have bespoke layouts.
- `<Panel>` = a bordered gradient card for a single block of prose/stats
  (info panels, "how we're funded", independence promise).
- `<Card href=".." >` = a clickable tile in a grid (index teasers, "what we
  do" tiles). Use `variant="featured"` sparingly, for exactly one emphasized
  item per grid.
- `<Callout>` = the large rounded gradient block for a single strong CTA
  (this is what `DonateCTA` renders inside).
- `<Eyebrow>` = the small pill-shaped label above an `<h1>`/section heading.
- `<Stat value=".." label=".." />` = the 4-up stat row under the hero
  subhead. Always use real numbers — `SCORED_ENTITY_COUNT_FORMATTED` from
  `@/data/entityCount` and `INDEX_REGISTRY.length` from `@/data/indexRegistry`,
  never a hand-typed count.
- Heading sizes: hero `h1` = `text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.03]
  tracking-[-0.04em]`; section `h2` (via `SectionHead`) =
  `text-[clamp(1.55rem,3vw,2.15rem)] tracking-tight`; card `h3` =
  `text-[1.05rem]`–`text-[1.12rem] font-bold`.
- Body copy: `text-muted` for secondary text, plain (inherits `text-text`)
  for emphasized/primary text. Never introduce a new gray — the only text
  colors in the system are `text-text`, `text-muted`, `text-muted-subtle`,
  and `text-accent` for links.

## Data — read-only imports, never invented numbers

Every real number on the home page (`site/src/app/nonprofit-alt/page.tsx`)
comes from:

- `SCORED_ENTITY_COUNT_FORMATTED` / `SCORED_ENTITY_COUNT` — `@/data/entityCount`
- `INDEX_REGISTRY` (8 entries, canonical labels/routes/order) — `@/data/indexRegistry`
- Per-index entity counts — `rankings.length` from each `@/data/indexes/*.json`
  file (see the `ENTITY_COUNT_BY_KIND` map at the top of `page.tsx` for the
  pattern to copy)
- The latest Daily Briefing date/headline/summary/pipeline stats —
  `@/data/updates/latest.json`

Follow the same pattern in Wave 2 pages: import the JSON/registry directly,
never hardcode "1,256 entities" or "8 indexes" as a literal string.

## Routing conventions

- Every internal link inside `nonprofit-alt/*` components/pages points to
  `/nonprofit-alt/...`, **except** links to the real published index/data
  pages (`/countries`, `/fortune-500`, `/ai-labs`, `/robotics-labs`,
  `/us-states`, `/us-cities`, `/global-cities`, `/universities`, and `/data`),
  which are the neutral, shared ranking-data surface used by both the
  commercial and nonprofit framings. Those are not being rebuilt under
  `/nonprofit-alt` — only the sales-oriented surrounding pages are replaced.
- Get index routes from `INDEX_REGISTRY[i].indexRoute` / `.navLabel` /
  `.indexLabel` — never hand-type `/countries` etc. as a literal string in a
  loop; hand-typing a single reference (e.g. one featured card) is fine.
- `SUPPORT_URL` (`/nonprofit-alt/support`) is a **placeholder route**, not a
  live payment link. Do not link any CTA directly to Gumroad or any external
  payment processor from anywhere under `nonprofit-alt/`.

## Known preview limitation (do not "fix" by editing the root layout)

`nonprofit-alt/layout.tsx` nests inside the root layout
(`site/src/app/layout.tsx`), so the global `Navbar`/`Footer` still render
above/below the nonprofit-alt chrome:

```
[global Navbar] → [NonprofitNavbar] → page content → [NonprofitFooter] → [global Footer]
```

This is intentional and accepted for founder review of Wave 1/Wave 2 content.
The ZERO-TOUCH rule prohibits editing the root layout in this build. If the
nonprofit-alt site is ever promoted beyond preview, resolving this (e.g. a
conditional in the root layout, or serving nonprofit-alt from a fully
separate root layout) is an explicit follow-up task — not something to patch
ad hoc while adding a Wave 2 page.

## What Wave 2 pages should NOT do

- Import anything from the commercial payment-link data module referenced in
  the root `CLAUDE.md` (file name intentionally not spelled out in this doc,
  so this doc itself never trips the zero-commercial-references grep check)
  — that means no `GUMROAD`, `SCORE_WATCH`, `buildScoreWatchUrl`, etc. — or
  link to `/pricing`, `/services`, `/contact-sales`, `/purchase-research`,
  `/certified-assessments`, `/data-licenses`, `/advisory`, `/enterprise`,
  `/api-access`.
- Invent entity counts, dimension counts, or pricing — always import from the
  canonical sources listed above.
- Edit `site/src/data/nav.ts`, `site/src/components/layout/*`, or any file
  outside `site/src/app/nonprofit-alt/` and `site/src/components/nonprofit/`.
