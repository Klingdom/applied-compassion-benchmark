# S1.4 — Remove Internal/Monetization Copy From Public Pages

**Wave:** Simplify-and-Sharpen S1, item S1.4 (Priority 14)
**Source:** `docs/SITE_REVIEW_MASTER_2026-06-12.md` (S1.4), UX review #9/#11 + Finding 5, Knowledge review #4/#9 (`#6`/`#8`)
**Owner of this spec:** Conversion Strategist. **Implemented by:** frontend-engineer ([FE]) + [CONTENT].
**Scope:** Copy/CTA removal and replacement only. No information-architecture restructuring (knowledge-architect owns) and no new visual layout (UX owns). All targeted blocks are existing JSX in three page files.

**Governing judgment:** This is a *conversion + independence* call, not a blanket delete. The flagged blocks are internal product-ops scaffolding (who-buys-what, revenue mapping, recommended-CTA checklists, assessor document control) that leaked onto public surfaces. Cutting them removes a storefront-y "we are here to extract revenue from you" read that actively *undermines* the independence brand — while the genuine reader-facing conversion paths (free index pages, the live Countries report, data licensing, newsletter, methodology) are already present elsewhere on each page and are PRESERVED. Net effect: less sales scaffolding, same real conversion surface, stronger trust.

---

## 1. `/indexes` — `site/src/app/indexes/page.tsx`

### CUT

**1A. "Index buyer paths" section — REMOVE ENTIRELY.**
File: `site/src/app/indexes/page.tsx`, lines **237–273** (the whole `{/* Index buyer paths */}` `<section>`).

Current copy being removed (evidence): SectionHead titled **"Index buyer paths"** with description *"Different visitors arrive at the indexes for different reasons. This page should make those paths legible."* + a 4-column `<Panel>` table with headers **Visitor type / Likely need / Best next step / Revenue path** and rows mapping personas to a **"Revenue path"** column ("Direct report purchase", "Briefing or memo", "Data licensing", "Assessment / advisory", "Enterprise agreement").

Why: This is internal funnel-design documentation. The phrase *"This page should make those paths legible"* is a note-to-self, not reader copy. A literal **"Revenue path"** column on a public page that scores entities-for-free is the single most independence-damaging element on the site — it tells the reader the page exists to route them to money. UX #9 and Knowledge #4 both flag this. No replacement needed: the personas it describes are already served by the "Go deeper with benchmark products" grid (lines 209–235) directly above it.

**1B. "Recommended calls to action from index pages" panel — REMOVE.**
File: same, lines **278–287** (the first `<Panel>` inside the `{/* CTAs + Ecosystem */}` section).

Current copy being removed (evidence): `<h3>` **"Recommended calls to action from index pages"** + bulleted list ("Buy this report as a PDF", "License the benchmark dataset", "Book an interpretive briefing", "Request a certified assessment", "Discuss enterprise access").

Why: A *list of recommended CTAs* is a planning artifact (it describes what CTAs should exist, instead of being a CTA). It duplicates the actual, clickable service cards in the "Go deeper" grid (lines 217–223), so removing it loses zero real conversion affordance — those exact destinations remain one click away as real cards.

### KEEP (do not touch — these are the genuine conversion surface)

- Hero CTAs (lines 32–36): **"View Countries Index" / "Buy First Published Report" / "Data Licensing"** — real, ranked, message-matched.
- "How to use the indexes" hero panel (lines 45–72) — reader-facing need→path table, ends with the independence sentence. Keep.
- Featured launch card — 2026 Countries Index, $195, Gumroad (lines 88–131). Primary monetization, message-matched, keep.
- "Public benchmark first" Callout (133–143).
- `PickEntityCallout` + EntitySearch + "Current indexes" grid (77–180) — core free product. Keep.
- "Monetization + Independence" two-panel row (182–207): the **"Monetization model for the indexes"** panel borders on internal language but it is paired side-by-side with the **Independence policy** panel and functions as honest disclosure of *how the institution funds itself without selling scores*. **KEEP, with a copy edit** (see below) — do not delete, because deleting it would remove the independence panel that earns trust.
- "Go deeper with benchmark products" grid (209–235) — the real, clickable service CTAs. Keep; this is what 1A/1B were poorly duplicating.

### REPLACE / EDIT

**1C. Repurpose the now-orphaned `{/* CTAs + Ecosystem */}` section into a single clean closing affordance.**
After cutting 1B, that section (lines 275–302) still contains the **"Index ecosystem pages"** link panel (lines 288–300). Rather than leave a lone half-width panel in a 2-column grid, replace the whole section with one full-width, honest closing block:

- Drop the `grid-cols-2` wrapper; make it a single `<Callout>` or full-width `<Panel>`.
- Lead line (new copy): **"Every index page is free to read. When you need more, go deeper."**
- Keep the ecosystem links (Methodology, Research, Purchase Research, Data Licenses, Advisory, Certified Assessments, Enterprise, Contact Sales) as a compact horizontal link row — these are useful navigation, not sales scaffolding.
- Add one trust line beneath: **"Inclusion and scores are never for sale. Paid products cover access, interpretation, and licensing only."**

Net for `/indexes`: two internal blocks removed, one panel reframed as navigation + trust. Zero loss of clickable conversion destinations.

**1D. Copy edit on the retained "Monetization model" panel (line 186).**
Change the heading **"Monetization model for the indexes"** → **"How the benchmark stays free and funded"**. Same bullets, reader-facing framing. This converts an internal-ops label into a trust statement while keeping the side-by-side independence pairing intact.

---

## 2. `/methodology` — `site/src/app/methodology/page.tsx`

### CUT FROM HERO

**2A. Demote the assessor document-control table out of the hero panel.**
File: `site/src/app/methodology/page.tsx`, hero right `<Panel>`, lines **46–74**.

Specifically REMOVE from the hero the document-control rows in the table (lines 53–66):
- **"Document ID — ACB-HAB-001"**
- **"Companions — ACB-PAB-001 and ACB-STD-001"**
- **"Sensitivity — Restricted assessor-use instrument"**

The **"Sensitivity: Restricted assessor-use instrument"** row is the most important cut: on a page whose entire job is to prove the methodology is *public, contestable, reproducible*, a "Restricted" label in the first visible panel implies the opposite (UX #11 calls this out explicitly). "ACB-HAB-001" and the companion doc IDs are internal credentialing trivia that gate comprehension for the researcher/journalist/executive reader.

### REPLACE THE HERO PANEL WITH

**2B. New hero panel: "What the methodology guarantees you."**
Replace the current panel heading **"Human Assessment Battery"** and its document-control table with a reader-benefit panel. The hero should LEAD with what a reader of the public scores can rely on — factual, independence-first, no marketing inflation:

Heading: **"What every published score guarantees"**

Bulleted guarantees (each a concrete, defensible promise the methodology already backs):
- **Evidence-grounded** — every score traces to documented public evidence across a 5-tier hierarchy, not opinion or self-report.
- **Adversarially tested** — performance only counts when it held up under cost or pressure (the pressure-test principle).
- **Reproducible** — the same 8 dimensions and 40 subdimensions are applied to every entity, so scores are comparable across sectors.
- **Independent** — no entity pays to be included, scored higher, or have findings withheld.
- **Contestable** — methodology version, evidence tiers, and scoring are published so any score can be checked and challenged.

Keep the four method-pills (Interviews, Observation, Document Review, Community Testimony, lines 68–73) — those are reader-meaningful and stay.

Keep the hero left column unchanged (the 8/40/7/5/0–100/v1.1 stat strip and intro paragraph, lines 28–44) — that already teaches the framework shape.

### WHERE THE CUT DOC-CONTROL CONTENT GOES

**2C. Move document control to a secondary "Document control" footnote block lower on the page.**
The ACB-HAB-001 / ACB-PAB-001 / ACB-STD-001 / version / administered-by / duration / sensitivity rows are legitimate content for assessors and institutional clients — they should not be *deleted*, only *demoted*. frontend-engineer: add a new, visually subordinate section near the end of the methodology page (after the existing framework/principle sections), e.g. a `<details>`-collapsed or small-type `<Panel>` titled **"Assessment instrument — document control"** with a one-line lead: *"For assessors and institutional clients. The public scoring methodology above is fully open; these references identify the controlled field instruments used in certified assessments."*

That lead line is the key independence move: it explicitly separates the OPEN public methodology from the controlled *administration instrument*, so "Restricted" reads as "we control who administers the paid assessment," not "the methodology is secret." Reuse the existing table rows (54–59) verbatim plus the "Human-administered field guide…" sentence (lines 48–49).

Net for `/methodology`: hero now answers "why should I trust these scores" instead of "here is our internal doc ID"; the assessor metadata survives, correctly framed and correctly subordinated.

---

## 3. Home page — `site/src/app/page.tsx`

UX Finding 5 flags duplicate "what this is" explanations and twice-listed services. The home page legitimately needs its primary CTAs; cut only the redundant *explanation* and the redundant *link list*, never the real CTAs.

### CUT

**3A. Remove the standalone "Benchmark institution, not a campaign site" Callout.**
File: `site/src/app/page.tsx`, lines **205–222** (`{/* Benchmark institution callout */}`).

Why: This is the second "what this is" statement. The hero (lines 53–60) already says the platform publishes comparative benchmark research designed to be "legible, comparable, and difficult to fake," and the "Who the benchmark is for" section (401–438) already enumerates the same audiences (executives, researchers, boards, journalists, policy teams). This Callout restates both with no new information. Removing it tightens the top of the page without losing a single CTA (it has none).

**3B. Remove the "Best starting paths" panel (the duplicate link list).**
File: same, lines **460–486** (the second `<Panel>` in the `{/* Independence + Starting paths */}` section).

Current copy being removed (evidence): `<h3>` **"Best starting paths"** + bulleted links to Indexes / Methodology / Research / Services / Contact Sales.

Why: Every one of those links is already a real CTA elsewhere on the page — Indexes/Methodology/Purchase-Research as hero buttons (61–67), the full Services grid (341–399), and the Indexes + Contact Sales buttons in the Final CTA (503–508). "Best starting paths" is the home-page twin of the `/indexes` "Recommended CTAs" planning list: it *describes* paths instead of being a meaningfully different action. After removal, promote the surviving **Independence policy** panel (443–459) to full width — that is the trust content worth keeping prominent.

### KEEP (the real CTA spine — do not touch)

- Hero buttons: **Explore Indexes / Read Methodology / Purchase Research** (61–67). Primary action ranking is correct.
- "Today's research" live-wire + **View full briefing** (122–196). Credibility + a real next step.
- **NewsletterSignup** (199–203) — the stay-connected funnel stage. Keep.
- Published indexes grid (224–294) — core free product.
- Services grid (341–399) — the canonical, single listing of service lines. This is the ONE place services should be enumerated; cutting 3A/3B removes the competing partial restatements, leaving this as the single source.
- Independence policy panel (443–459) — keep, widen.
- Final CTA Callout (490–511) — **Explore Indexes / Contact Sales**. The single clear closing action UX asked for. Keep.

### Note (no action this item)
UX Finding 5 also suggests folding the institution-callout sentiment into the hero. The hero already covers it, so 3A is a clean delete — no merge needed. Do not expand the hero copy (keep it scannable).

---

## 4. Independence & dark-pattern check

| Removal | Independence effect | Dark-pattern check |
|---|---|---|
| `/indexes` "Index buyer paths" + "Revenue path" column (1A) | **STRENGTHENS.** Deletes the most explicit "this page routes you to revenue" artifact from a page that scores entities for free. | None introduced. Removing a sales-funnel map cannot create urgency/scarcity. |
| `/indexes` "Recommended CTAs" list (1B) | **NEUTRAL-to-STRENGTHENS.** Removes storefront scaffolding; real service cards remain. | None. |
| `/indexes` closing block reframe + "never for sale" line (1C) + heading edit (1D) | **STRENGTHENS.** Replaces ops label with an explicit no-pay-for-inclusion statement. | None. Honest, benefit-led copy; no false urgency. |
| `/methodology` doc-ID/Sensitivity out of hero (2A→2B) | **STRENGTHENS.** Hero now leads with independence + contestability guarantees; the "Restricted" label no longer implies a hidden methodology. The 2C lead line explicitly separates the OPEN methodology from the controlled administration instrument. | None. Guarantees are factual and already backed by the methodology; nothing over-promised. |
| `/methodology` doc control demoted, not deleted (2C) | **NEUTRAL.** Assessor content preserved for institutional clients, correctly framed. | None. |
| Home "institution callout" cut (3A) + "Best starting paths" cut (3B) | **NEUTRAL.** Independence policy panel retained and widened; no CTA lost. | None. Reduces repetition; does not manufacture pressure. |

**Verdict: PASS on all.** Every change either strengthens or is neutral to the no-pay-for-inclusion posture. No alarmist hooks, fake urgency, scarcity, or manipulative copy is introduced. All retained CTAs lead with reader benefit and remain message-matched to their page.

---

## 5. Implementation summary (cut / keep / replace)

| File | Lines | Action | What |
|---|---|---|---|
| `site/src/app/indexes/page.tsx` | 237–273 | **CUT** | "Index buyer paths" section incl. "Revenue path" table |
| `site/src/app/indexes/page.tsx` | 278–287 | **CUT** | "Recommended calls to action from index pages" panel |
| `site/src/app/indexes/page.tsx` | 275–302 | **REPLACE** | Reframe `{/* CTAs + Ecosystem */}` into one full-width closing block: lead line + ecosystem nav links + "never for sale" trust line (1C) |
| `site/src/app/indexes/page.tsx` | 186 | **EDIT** | Heading "Monetization model for the indexes" → "How the benchmark stays free and funded" (1D) |
| `site/src/app/methodology/page.tsx` | 53–66 | **CUT (from hero)** | Document ID / Companions / Sensitivity rows |
| `site/src/app/methodology/page.tsx` | 46–67 | **REPLACE** | Hero panel → "What every published score guarantees" (2B); keep method pills 68–73 |
| `site/src/app/methodology/page.tsx` | new section near end | **ADD** | "Assessment instrument — document control" subordinate block (2C) reusing rows 54–59 + intro 48–49, prefaced by open-vs-controlled lead line |
| `site/src/app/page.tsx` | 205–222 | **CUT** | "Benchmark institution, not a campaign site" Callout (duplicate "what this is") |
| `site/src/app/page.tsx` | 460–486 | **CUT** | "Best starting paths" panel (duplicate link list); widen retained Independence policy panel to full width |

**Single highest-leverage change in this item:** delete the `/indexes` "Index buyer paths" table with its **"Revenue path"** column (1A). It is the most overtly storefront, most independence-corrosive block on any public page — a literal revenue-routing map on the page that gives away rigorous research for free. Removing it costs zero real conversion (the destinations remain as real, clickable service cards directly above) and directly buys back the credibility that is this institution's actual conversion asset.
