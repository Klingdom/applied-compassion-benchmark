# Homepage Review — SEO/AEO (Entry + Answer Surface)

Date: 2026-06-17
Owner: seo-aeo-architect
Scope: `site/src/app/page.tsx` (home) + `site/src/app/layout.tsx` (root JSON-LD) ONLY.
Lens: how well the home serves (1) knowledge acquisition, (2) methodology understanding,
(3) path to the daily briefing — for first-time humans AND answer engines (the home is
what gets cited/summarized for "What is the Compassion Benchmark?").
Mode: review only, no code modified. White-hat only.

---

## Verdict

The home is a strong *marketing/index hub* but a weak *answer surface*. It does not open
with a self-contained, extractable definition of the institution, and it withholds the two
machine-legibility primitives that most directly win AI Overviews + Google sitelinks for a
branded/definitional query: a `WebSite` node with `SearchAction`, and a home `FAQPage`
answering "What is the Compassion Benchmark?" / "What is institutional compassion?". The
underlying facts (1,160 entities, 8 dimensions, 7 indexes, independence, daily cadence) are
all present in prose and `Stat` tiles but are not packaged as a liftable answer block, and
the home never links to `/about` or to the *dated* latest briefing.

Good news: the fix is low-risk and mostly additive. A reusable `FaqJsonLd` component
already exists (`site/src/components/seo/FaqJsonLd.tsx`) and is unused on the home.

---

## What the home does well (keep)

- Title + meta are clean and definitional (`page.tsx:38-41`): "Compassion Benchmark | Global
  Benchmarking for Institutional Compassion" + a scope-accurate description.
- The scope facts exist on-page: `Stat` tiles (`page.tsx:71-76`) and the publication-set
  table (`page.tsx:83-114`) make coverage human-readable.
- Independence is stated explicitly and crawlably (`page.tsx:500-521`) — a genuine E-E-A-T
  signal answer engines reward.
- A live "Today's research" wire links to `/updates` with a freshness date (`page.tsx:208`,
  `217-222`) — the spoke into the news layer exists.
- `ResearchOrganization` JSON-LD is present and honest (`layout.tsx:56-80`): no fabricated
  `sameAs`, no fake logo. Correct discipline.

---

## Gaps (grounded), by the 3 goals

### Goal 1 — Knowledge acquisition (what is this / what is institutional compassion)

- **No extractable definition sentence.** The H1 is a gerund phrase — "Benchmarking how
  institutions recognize, respond to, and reduce suffering" (`page.tsx:52-55`). It is not a
  copy-pasteable "X is Y" sentence. The lead paragraph (`page.tsx:56-63`) opens "Compassion
  Benchmark publishes comparative benchmark research across..." — descriptive of *activity*,
  not a self-contained definition of *what the institution is* with its scale numbers inline.
  Answer engines lift the first clean factual "[Entity] is [definition]" sentence; we don't
  give them one. (Impact: AEO — this is the sentence that gets quoted for the branded query.)
- **"Institutional compassion" is never defined on the home.** The term is used as a label
  (`page.tsx:59`, `461-467`) but the home never says what it *means*. This is a high-intent
  definitional query ("what is institutional compassion") with no on-home answer block.
- **Numbers drift across the page.** Home asserts "1,155 entities" (`page.tsx:72`, `160`),
  the flagship callout says "1,156 institutions" (`page.tsx:137`), the latest briefing JSON
  says `entitiesScanned: 1160` (`latest.json:8`), and the agent brief uses 1,160. Conflicting
  counts on the single most-cited page undermine the citable-atomic-fact discipline — an
  engine may quote any of them. Pick one canonical figure and make the home defer to it.

### Goal 2 — Methodology understanding

- **Methodology is reachable but shallow from the home.** Two CTAs link to `/methodology`
  (`page.tsx:68`, `379-381`) and the 8 dimensions are listed (`page.tsx:365-373`) — good.
  But the 8 dimensions and 5 bands are not exposed as machine-legible vocabulary
  (`DefinedTermSet`), and the 0–100 → band mapping is mentioned ("normalized to a 0–100
  scale", `page.tsx:376`) without the band names on-home. Engines can't learn our framing to
  reuse it. (Impact: AEO — teaching the vocabulary makes engines describe entities in *our*
  terms.)

### Goal 3 — Path to the daily briefing

- **No link to the *dated* latest briefing, and no link to `/about`.** The home links to the
  `/updates` index (`page.tsx:217`, `272`) but not to `/updates/[date]` for today's briefing,
  and never to `/about` (which exists: `site/src/app/about/page.tsx`). For both a human and a
  crawler, the home is the hub; omitting `/about` and the canonical dated briefing weakens the
  internal-link graph that distributes authority to the freshness layer and the identity page.
- **The "Today's research" section is conditionally rendered** (`page.tsx:203`) — if a cycle
  has zero score changes AND no highlights, the entire freshness block (and its `/updates`
  links) disappears from the home. The 2026-06-17 briefing is a `zero-proposal` cycle
  (`latest.json:14`); `highlights` is derived from `topSignals` so it currently survives, but
  the freshness signal on the home is fragile by construction. (Impact: SEO/AEO freshness.)

### Cross-cutting — machine legibility (layout)

- **No `WebSite` JSON-LD and no `SearchAction`.** Only `ResearchOrganization` is emitted
  (`layout.tsx:56-80`, single node, not a `@graph`). Pagefind site search exists, so a
  `WebSite` + `potentialAction: SearchAction` is *honest* and is the canonical signal Google
  uses to grant a sitelinks search box. Missing today. (Impact: SEO sitelinks + entity ID.)
- **`Organization.sameAs` is empty** (`layout.tsx:66`). Correct not to fabricate — but until
  at least one real verified profile (Wikidata/LinkedIn/X) is seeded, the knowledge graph has
  nothing to bind citations to. Flag for the founder to supply real URLs, then populate.
- **No home `FAQPage`.** `FaqJsonLd.tsx` exists and is unused on the home. A 3–4 question FAQ
  built from facts already on the page ("What is the Compassion Benchmark?", "What is
  institutional compassion?", "How is the score calculated?", "Is it independent?") would be
  the single highest-leverage AEO add — all answers already exist verbatim on-page, so it is
  zero-fabrication. Must render a visible accordion alongside the JSON-LD (Google requirement;
  the component header already states this contract).

---

## Ranked improvements

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.
Each tagged with goal(s). Lead item first.

### 1. Add an answer-first "What is the Compassion Benchmark?" block + home FAQPage  [Goals 1,2]
The highest-leverage entry/answer move. Add one liftable definition sentence at the top of
the content flow, then a short visible FAQ accordion + `FaqJsonLd`.
- Definition sentence (draft, all facts grounded on-page): *"The Compassion Benchmark is an
  independent research institution that scores how 1,160 institutions — governments,
  corporations, AI labs, and humanoid robotics labs — recognize, respond to, and reduce
  suffering, rating each from 0 to 100 across eight dimensions in seven public indexes."*
- FAQ Qs (answers already exist on-page, no fabrication): what it is; what institutional
  compassion means; how the score is calculated (8 dimensions, 0–100); is it independent.
- Reuse `FaqJsonLd.tsx`; render the same Q&A as a visible block (hand to frontend for an
  accordion or simple `<dl>`).
- Impact: high (this is the quoted/summarized text for the branded query + AI Overviews).
  Effort: low. Risk: low (additive, white-hat, zero fabrication). **Priority: highest.**

### 2. Add `WebSite` + `SearchAction` JSON-LD (and move to a `@graph`)  [Goals 1,3]
In `layout.tsx`, emit a `WebSite` node (name, url, publisher → the Organization) with a
`potentialAction` `SearchAction` pointing at the Pagefind/search route. Combine with the
existing `ResearchOrganization` in a single `@graph` so engines see one connected entity.
- Impact: high (sitelinks search box eligibility + stronger entity identity → citation
  attribution by name). Effort: low. Risk: low (search genuinely exists). **Priority: high.**

### 3. Reconcile the entity count to one canonical figure  [Goal 1]
Pick the canonical number (recommend 1,160, matching `latest.json` pipeline scan) and make
the home read it from a single source rather than three hardcoded variants (`page.tsx:72`,
`137`, `160`). Conflicting numbers on the most-cited page is a citable-fact integrity risk.
- Impact: medium (citation accuracy / trust). Effort: low. Risk: low. Hand the canonical
  source-of-truth decision to backend/pipeline owner. **Priority: high.**

### 4. Add home links to `/about` and to the dated latest briefing  [Goals 1,3]
Add `/about` to the hero or "How it works" area, and make "Today's research" link to
`/updates/${updates.date}` (the canonical dated briefing) in addition to `/updates`. Tightens
the hub-and-spoke graph crawlers/agents follow to the identity + freshness layers.
- Impact: medium. Effort: low. Risk: low. **Priority: medium-high.**

### 5. Guarantee a freshness block always renders  [Goal 3]
Make the "Today's research" section unconditional — when a cycle has zero proposals, fall back
to "All N entities assessed on {date} confirmed at their published scores" with a date and a
`/updates` link, instead of hiding the block (`page.tsx:203`). Keeps a dated freshness signal
+ briefing link on the home every cycle. Hand to frontend.
- Impact: medium (freshness signal reliability). Effort: low. Risk: low. **Priority: medium.**

### 6. Expose the 8 dimensions + 5 bands as `DefinedTermSet`  [Goal 2]
Add `DefinedTermSet`/`DefinedTerm` JSON-LD for the 8 dimensions and 5 bands (names already in
`dimensions.ts`). Teaches engines our vocabulary so they describe entities in our framing.
- Impact: medium (AEO framing reuse). Effort: low-medium. Risk: low. **Priority: medium.**

### 7. Seed real `Organization.sameAs` profiles  [Goal 1]
Founder action, not code: supply verified Wikidata/LinkedIn/X URLs; then populate
`layout.tsx:66`. Do NOT fabricate. **Priority: medium (blocked on real assets).**

---

## What to measure (baseline → expected → how we'll know)

- **Branded-query answer capture:** does an AI engine, asked "What is the Compassion
  Benchmark?", return our definition sentence and cite the URL? Baseline now (likely no/none)
  → after #1+#2, sampled monthly via WebFetch/WebSearch on ChatGPT/Perplexity/AI Overviews.
- **Sitelinks search box:** appears in Google for the brand query after `WebSite`+`SearchAction`
  indexes. Check Search Console / live SERP.
- **Structured-data validity:** 0 errors for the home in Rich Results Test after FAQ + WebSite
  + Organization land in a `@graph`.
- **Internal-link coverage:** `/about` and `/updates/[date]` reachable from home (crawl check).
- **Definitional impressions:** "compassion benchmark", "institutional compassion" impressions
  in Search Console trend up post-#1.

---

## Top 3 next moves

1. Ship the answer-first definition sentence + home `FaqJsonLd` (reuse existing component) —
   the single highest-leverage entry/answer move. (#1)
2. Add `WebSite` + `SearchAction` and merge with Organization into a `@graph` in `layout.tsx`. (#2)
3. Reconcile the entity count to one canonical figure across the home. (#3)

## Handoffs

- **frontend-engineer:** render the visible "What is" answer block + FAQ accordion (#1); add
  `/about` + dated-briefing links and unconditional freshness fallback (#4, #5).
- **backend-engineer / pipeline owner:** canonical entity-count source of truth (#3).
- **knowledge-architect:** wording of the "institutional compassion" definition (comprehension);
  I own that it is present + extractable, they own that it teaches correctly.
- **founder (Phil):** supply real `sameAs` profile URLs (#7).

## Files referenced
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\page.tsx`
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\layout.tsx`
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\seo\FaqJsonLd.tsx`
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\updates\latest.json`
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\about\page.tsx`
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\methodology\page.tsx`
