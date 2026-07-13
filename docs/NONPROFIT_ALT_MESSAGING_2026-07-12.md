# Nonprofit Positioning & Support Messaging

**Date:** 2026-07-12 · **Owner:** Growth Strategist · **Status:** Copy-ready input for Wave 2 frontend engineers.
**Companion to:** `docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md` (build brief this aligns to), `docs/NONPROFIT_SIMPLIFY_MASTER_2026-07-12.md` (simplification thesis), `docs/NONPROFIT_SIMPLIFY_PM_2026-07-12.md` (MVP surface), `CLAUDE.md` (independence policy), `site/src/app/supporters/page.tsx` and `site/src/app/about/page.tsx` (tone + firewall language reused verbatim below).

**How to use this doc:** every heading, bolded phrase, and quoted block is meant to be lifted directly into JSX. Where a real number is needed (entity counts, index counts), pull from `entityCount.ts` / `indexRegistry.ts` at build time rather than hardcoding — do not copy any specific count out of this document as a literal.

---

## 1. Positioning statement

**One sentence:**

> Compassion Benchmark is the independent, donor-funded institution that measures whether the institutions shaping our lives — governments, corporations, AI labs, robotics labs — actually recognize and reduce the suffering they cause or could prevent.

**Short paragraph (for hero subheads, about page, funder one-pagers):**

> Compassion Benchmark publishes comparative rankings of institutional compassion across governments, corporations, AI labs, and robotics labs, built on a public methodology and updated by a daily research pipeline. It is funded entirely by individual supporters and grants — never by the entities it scores. That separation is not a policy statement bolted on after the fact; it is the reason the benchmark can be trusted at all.

**Why this framing, not others:** the PM review (`NONPROFIT_SIMPLIFY_PM_2026-07-12.md` §1) is explicit that the nonprofit's product is "trust in a number, not a sales funnel." Positioning has to sell the *number's credibility*, not the org's mission in the abstract. Every version below leads with independence + evidence, not with values-signaling ("we care about compassion") — the about page already explicitly rejects "campaign, branding exercise, or values-signaling site" and that instinct should carry into the nonprofit reframe too.

---

## 2. Homepage hero options (2-3 variants)

Pick one as primary; the other two are useful as A/B test alternates or for the `/nonprofit-alt/about` page opener.

**Option A — Mission-first, direct (recommended primary):**
- Headline: **"Institutional compassion, measured — not asserted."**
- Subhead: "Compassion Benchmark independently scores how governments, companies, AI labs, and robotics labs recognize suffering and reduce harm. Funded by supporters and grants. Never by the entities we score."
- Primary CTA: **Support the research** → `/nonprofit-alt/support`
- Secondary CTA: **Explore the indexes** → `/nonprofit-alt/indexes`

**Option B — Evidence-forward:**
- Headline: **"Every score has a paper trail."**
- Subhead: "A daily research pipeline, an 8-dimension methodology, and a public evidence trail behind every institution we rank — free to read, free to cite, funded by people who want it to stay that way."
- Primary CTA: **Read today's briefing** → `/nonprofit-alt/updates`
- Secondary CTA: **Support independent research** → `/nonprofit-alt/support`

**Option C — Reader/citation-forward (best for press/academic-heavy traffic):**
- Headline: **"The watchdog that can't be paid off."**
- Subhead: "Compassion Benchmark ranks how institutions treat the people and systems in their power. No entity has ever paid for a score, a rank, or silence. That's structural, not a promise — see how."
- Primary CTA: **See the independence policy** → `/nonprofit-alt/methodology#independence`
- Secondary CTA: **Become a supporter** → `/nonprofit-alt/support`

**Recommendation:** lead with Option A on `/nonprofit-alt` (mission + funding model in one breath, matches the build brief's "mission-forward hero, independence promise, donate CTA, how we're funded" spec). Reserve Option C's sharper "can't be paid off" line as a pull-quote elsewhere (methodology or about) — it's the strongest trust line on the whole site and shouldn't be spent only once.

---

## 3. Donation / support strategy

### Tier structure

Use impact framing, not feature-unlock framing — a donor doesn't get anything they didn't already have for free; they fund the fact that it stays free for everyone.

| Tier | Amount | What it funds (copy-ready) |
|------|--------|------------------------------|
| **Supporter** | $5 / month | "Keeps one night of the research pipeline running — scanning, evidence review, and score verification for the entities updated that day." |
| **Sustainer** | $10 / month | "Sustains a week of daily briefings — the free, citable research output that press and researchers rely on every morning." |
| **Benefactor** | $25 / month | "Sustains an entire index — the ongoing scanning, scoring, and public access for a full sector (a country, a Fortune 500 cohort, an AI lab class) for a month." |
| **One-time / custom** | Any amount, one-time | "A single contribution toward keeping the benchmark free, independent, and citable. No tier, no minimum — every amount counts the same." |

Notes:
- Keep the exact framing "keeps the daily research free and citable" as the umbrella line above the tier grid — it is the single sentence the build brief calls out and it should appear as intro copy before the three cards, not only inside them.
- Do NOT frame tiers as "unlocks" (no "Sustainer members get X"). The existing `/supporters` page already gets this right ("Supporter contributions are a vote for independent research, not a purchase of access or influence") — carry that sentence forward unchanged.
- Keep "Cancel anytime" and "Optional name listing (opt-in, names only, no logos)" from the existing page — both are low-cost trust signals worth reusing.
- One-time/custom: needed because grants and individual major gifts don't fit a subscription model. Present it as an equal, not a downgrade, option next to the monthly tiers.

### Recommended "How we're funded" transparency block

Place this on `/nonprofit-alt/support` (primary) and echo a shorter version on `/nonprofit-alt/home` and `/nonprofit-alt/about`.

> **How we're funded**
> Compassion Benchmark is funded by individual supporters and grants from foundations that value independent institutional research. We do not accept payment from any entity we score, in any form, for any reason. There is no sponsored ranking, no pay-to-improve, and no removal-for-a-fee. If that ever changes for any single entity, the independence claim on this entire site becomes worthless — so it doesn't change.
>
> [TODO: confirm tax-deductible / 501(c)(3) language before publishing — see Open Questions §8]

This block does the job the old `/pricing` page's "independence disclosure" did for investors (per `REVENUE_MODEL.md` §6: "the independence line ... is a selling point, displayed prominently") — but redirected at donors and funders instead of buyers.

---

## 4. The independence-through-transparency narrative

This is the single strongest asset the site has, and the transition to nonprofit makes it *more* central, not less — donors and grantors ask "how do I know this isn't biased" with the same skepticism investors did.

**Core narrative arc (use across home / methodology / about / support):**

1. **The claim:** Compassion Benchmark says institutions can be scored on how much they recognize and reduce suffering.
2. **The obvious objection:** "But you're rating the same companies/governments/labs that could pay you to look the other way."
3. **The structural answer (not a promise, an architecture):** the scoring pipeline and the support/payment systems are built as two separate technical planes with no connection between them.
4. **The proof point:** entities never pay for inclusion, score changes, or suppression of findings — this is enforced by the fact that the systems literally cannot talk to each other, not by a policy PDF.

**Required firewall line — reuse verbatim wherever a donate/support CTA appears** (from `site/src/app/supporters/page.tsx`, already the strongest independence assurance on the site):

> "Compassion Benchmark operates two independent technical planes. The assessment pipeline — which produces all scores — has no access to supporter records, payment data, or any commercial system. Supporting the benchmark contributes to its operational continuity; it cannot affect how any entity is scored, included, or ranked."

**Shorter variant for tight spaces (DonateCTA component, footer, inline callouts):**

> "The assessment pipeline is a separate technical plane with no access to supporter records, payment data, or any commercial system. Support is gratitude, not influence — entities never pay for inclusion, score changes, or suppression of findings."

**Press/funder-facing variant (research, about, grants context):**

> "Independence here is not a policy — it's an architecture. The pipeline that produces every score cannot read a supporter list, a payment record, or a grant agreement. Nothing an entity or a funder does can move a number."

Use this narrative to reframe "independence" from a defensive disclaimer into the institution's primary credibility asset — the thing press cites when explaining *why* the benchmark is trustworthy, not just a footnote answering "are you biased."

---

## 5. Per-page messaging angle

| Page | Nonprofit framing (1-3 sentences) | Primary CTA |
|------|-------------------------------------|-------------|
| **Home** (`/nonprofit-alt`) | Mission-forward hero (§2) + a "what we do" strip (indexes, methodology, daily briefing) + the independence promise + a "how we're funded" teaser. This page's job is to make a first-time visitor understand *what* is measured, *why* it can be trusted, and *how* it stays alive — in that order. | **Support the research** (donate), secondary: **Explore the indexes** |
| **Indexes** (`/nonprofit-alt/indexes`) | "Eight public indexes. Free to read, free to cite, updated daily." Frame the indexes as public-interest data, not a product catalog — remove any purchase/report framing; add a one-line citation instruction ("Cite this data — see /methodology for attribution guidance") and a soft, secondary support nudge, not a hard paywall or upsell. | **Cite** / explore an index (primary action is reading); soft **Support this research** nudge, secondary |
| **Updates / Daily Briefing** (`/nonprofit-alt/updates`) | "The daily record of what changed and why — free, and built for citation." This is the institution's most-cited, most-alive asset; frame it as journalism/research output, not a lead magnet. Offer free email/RSS subscription with zero paywall framing. | **Subscribe free** (email/RSS); secondary: **Support the daily pipeline** |
| **Methodology** (`/nonprofit-alt/methodology`) | "How we score, and why you can check our work." Lead with the 8-dimension / 40-subdimension framework and evidence hierarchy as the credibility layer; put the independence policy statement front-and-center on this page, not buried — this is the page skeptics land on. | **Read the independence policy** (in-page anchor); secondary: **Support this work** |
| **Research** (`/nonprofit-alt/research`) | "The research program behind the rankings — built for grant-funded, peer-reviewable rigor." Speak to funders/academics: methodology depth, evidence trail, reproducibility, citation-readiness. This is the page that carries the grants/foundations value prop (§7). | **Explore the research program**; secondary: **Talk to us about funding this work** (grants contact) |
| **Support** (`/nonprofit-alt/support`) | The donation home. Tier cards (§3), the "how we're funded" transparency block, the independence firewall line (§4), and a grants/foundations path. This page fully replaces the sales funnel — there is no pricing grid, no "book a call," no tiered institutional ladder. | **Become a supporter** (tiers); secondary: **One-time gift**; tertiary: **Foundations & grants** (contact) |
| **About** (`/nonprofit-alt/about`) | "Who we are, what we believe, how we're funded, and why it can't be bought." Keep the existing mission language (institutions/suffering/evidence trails) largely as-is; replace every "institutional services / advisory / certified assessments" reference with the funding-transparency story and governance framing. | **Read the methodology**; secondary: **Support the benchmark** |
| **Contact** (`/nonprofit-alt/contact`) | One general-purpose contact for press, researchers, partnerships, and support questions — no "sales" framing, no routing by deal size. "Reach out — press inquiry, research question, funding partnership, or a question about supporting the work." | **Send a message** (single form); no tiered routing |
| **Tools** (`/nonprofit-alt/tools`) | "Free tools for self-assessment and public-interest use — no licensed product, no enterprise tier." Frame the self-assessment tool as a genuine public utility (no entity-payment risk), and point its post-assessment CTA at methodology/support rather than any paid assessment product. | **Take the free self-assessment**; secondary: **Support the benchmark** |

---

## 6. Words to use / words to purge

### Use (nonprofit lexicon)
- support, supporter, sustainer, benefactor
- contribute, contribution, gift
- fund, funded by, funding
- independent, independence
- transparent, transparency
- public-interest, public benefit
- cite, citable, citation
- grant, foundation, funder
- free and open, free to read
- gratitude, not influence
- evidence trail, evidence-backed
- mission, institution (referring to Compassion Benchmark itself, not sales-target "institutional buyers")

### Purge (sales/commercial lexicon)
- buy, purchase, order
- pricing, price, tier pricing (fine only for donation "tiers," never "pricing")
- license, licensing, licensed product
- book a call, book a 20-minute walkthrough, Calendly
- enterprise, enterprise agreement, enterprise tier
- upsell, upgrade path, funnel
- contact sales, sales inquiry
- retainer, advisory retainer
- certified assessment (as a paid product — the term itself is fine only in a free self-assessment context)
- ROI, ACV, MRR, deal, close, lead (internal sales-model vocabulary that must never leak into visitor-facing copy)
- "customer," "client," "buyer" (replace with "reader," "researcher," "supporter," "donor," "funder" depending on context)

**One nuance:** "tiers" survives for donation levels ($5/$10/$25) because that framing is familiar and non-transactional in a donor context (it mirrors public radio/NPR-style membership tiers) — the line to hold is that a tier describes *impact funded*, never *access unlocked*.

---

## 7. Grants / foundations angle

Short institutional-funder value prop for `/nonprofit-alt/support` and `/nonprofit-alt/research`:

> **For foundations and institutional funders**
> Compassion Benchmark produces a daily, evidence-backed, publicly citable research record of how governments, corporations, AI labs, and robotics labs treat the people and systems in their power. For funders working on AI accountability, corporate governance, human rights, or public-interest technology, this is infrastructure: a standing, methodologically transparent measurement layer that press, researchers, and advocates already use and cite — funded independently of the entities it evaluates. Grant support sustains the daily research pipeline, expands index coverage, and keeps the entire public record free.
>
> If your foundation is exploring support for independent institutional accountability research, [contact us] — we can walk through the methodology, the evidence pipeline, and reporting options grant terms typically require.

Placement: a distinct card/section on `/support` (separate from the individual $5/$10/$25 tiers — foundations should not be funneled into a monthly-subscription widget), and a shorter pointer on `/research` linking to it (the research page's job is to demonstrate rigor; the support page's job is to close the funding ask).

---

## 8. Open questions for the founder

1. **Tax status / deductibility language.** Is 501(c)(3) or fiscal-sponsor status filed or granted? Until confirmed, every donation surface must use neutral "support/contribute" language and carry a `TODO: confirm tax-deductible language` note (per the build brief) rather than asserting deductibility — this affects the wording in §3's transparency block and every tier card's fine print.
2. **Does any earned-income line survive?** `NONPROFIT_SIMPLIFY_PM_2026-07-12.md` (open question #3) floats a reduced, firewalled "institutional data request" contact path for researchers/newsrooms as a possible earned-income line short of a sales funnel. If yes, the `/research` or `/contact` page needs one plain paragraph for it ("Need the full dataset for a research project? Contact us.") — copy-ready language for that is not included here pending the founder's answer, to avoid re-introducing sales lexicon prematurely.
3. **Score-Watch disposition.** If Score-Watch becomes a free, donation-supported alert (per Phase 2/S10 of the simplification backlog), `/updates` and `/tools` copy should say so explicitly ("free alerts, sustained by supporters") — confirm before Wave 2 writes that copy.
4. **Existing Gumroad supporters (if any).** If the current `/supporters` Gumroad subscription has any live subscribers, confirm whether the alt-page "how we're funded" copy needs to acknowledge an existing supporter base or should read as a fresh launch.
5. **Naming: "Donate" vs. "Support."** This doc uses "Support" throughout (matches the build brief's nav label and avoids asserting tax-deductible status prematurely). Confirm this is the founder's preferred verb before any final nav/CTA copy locks — "Donate" reads as a stronger, more specific ask once tax status is confirmed.
6. **Grants contact routing.** Should the foundations/grants CTA in §7 route to the same single contact form as press/research (`/contact`), or does it need its own address/intake path? Affects whether `/support`'s "Foundations & grants" CTA links to `/contact` or a distinct email.

---

*Prepared 2026-07-12 by Growth Strategist agent for Wave 2 frontend engineers building `/nonprofit-alt/*`. All copy above is intended to be lifted directly into JSX; adjust only for real data values (entity/index counts) pulled from `entityCount.ts` / `indexRegistry.ts` at build time.*
