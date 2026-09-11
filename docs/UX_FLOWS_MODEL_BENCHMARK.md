# UX Flows — AI Model Compassion Benchmark (CB-MODEL / "Model Index")

**Author:** ux-designer
**Status:** flows and specs for handoff. No code, no copy final. No score, model name, or
statistic in this document is real — every example is labelled **ILLUSTRATIVE**.
**Scope:** new content pages for the Compassion Benchmark **Model Index** product. Does not
modify `site/src/data/indexes/`, `research/rotation-state.json`, or any entity record.
**Sources reviewed:** `site/src/data/model-benchmark/registry-v1.json`,
`site/src/app/ai-evaluation-suite/page.tsx`, `site/src/components/model-benchmark/EvaluationScorer.tsx`,
`site/src/app/robotics-labs/page.tsx`, `site/src/data/dimensions.ts`, `site/src/data/nav.ts`,
`site/src/data/indexRegistry.ts`, `site/src/components/ui/*`, `docs/CB_MODEL_INTEGRATION_2026-09-06.md`,
`.benchmark-ops/CURRENT_STATE.md`, `.benchmark-ops/MODEL_REGISTRY.md`, `.benchmark-ops/RELEASE_WATCH.md`,
`site/scripts/lib/deployed-ai-audit-subjects.mjs`.

---

## 0. Ground truth this design is built on

State everything plainly so no downstream agent has to re-derive it:

1. **Zero models are registered.** `registry-v1.json` has `entryCount: 0`. `.benchmark-ops/MODEL_REGISTRY.md`
   and `RELEASE_WATCH.md` are both explicitly, deliberately empty — no scan has ever run (`BLK-001`),
   no model has ever been accessed (`BLK-002`). **This is the state the product launches in.** The
   empty state is not a placeholder to be replaced before ship — it is what ships.
2. **The task bank has 33 items, unvalidated, unevenly distributed** (AWR 6, EMP 5, ACT 5, INT 5,
   ACC 4, EQU 3, BND 3, SYS 2). It is a public "Core Public pool," not a secure form — the answer
   key (rubric anchors) is published alongside every item. This is fine for self-serve exploration;
   it is not sufficient for an official secure score, and the UI must never imply it is.
3. **Three products must stay visually and semantically separate everywhere they could appear
   together:** the **Model Index** (behaviour of a tested model snapshot — this document), the
   **AI Labs Index** (`/ai-labs`, organisational governance of a developer), and the **Deployed AI
   Audit** (configured products in real use — does not exist yet as a shipped product). A reader must
   never be able to infer that a model's score describes its lab, or that a lab's score describes any
   model it ships. This governs every screen below (§1.4).
4. **This is a static export.** No runtime data fetching, no server. Every screen in this document is
   either (a) generated at build time from committed JSON, or (b) a client-side interaction over data
   already shipped in the page bundle (as `EvaluationScorer.tsx` already does). "Loading" therefore
   never means "waiting on a network response for benchmark data" — it means "the browser is
   hydrating already-shipped content," and design must not invent spinners for data that isn't
   actually being fetched.
5. **`/ai-evaluation-suite` already exists** as a self-serve, unofficial, single-rater scoring aid
   over the same 33-item task bank. The Model Index is a **different product**: an officially
   published, human-panel-rated, evidence-cited result. The two must be cross-linked, not merged —
   see §1.5.

---

## 1. Information architecture, naming, and the product-separation device

### 1.1 Proposed routes

This is a proposal for frontend-engineer and system-architect to ratify or amend — it is not a
technical decision, but page relationships below assume it:

| Route | Purpose | State at launch |
|---|---|---|
| `/model-index` | Hub page. Hero, methodology summary, task-bank preview, status panel, subscribe. | **Empty state (§3).** Ships day one. |
| `/model-index/task-bank` | Browsable read-only view of the 33 public task-bank items: dimension, construct, prompt, rubric anchors, validation status. No scoring UI (that stays on `/ai-evaluation-suite`). | Populated immediately — the task bank exists today even though no model has been scored against it. |
| `/model-index/methodology` | Model Index-specific methodology (battery structure, rating panel, statistics, publication gate). Cross-linked from and to the institutional `/methodology` page; does not duplicate it. | Populated immediately — this is process documentation, not results. |
| `/model-index/[model-slug]` | Per-model detail page. | Does not exist until a model is published. Route returns 404 pre-launch — see §3.5 on why there is no placeholder page. |
| `/model-index/[model-slug]#dim-[CODE]` | Per-dimension drilldown — anchor section on the model detail page, not a separate route (avoids a navigation dead-end at low model counts; see §6). | N/A pre-launch. |
| `/model-index/[model-slug]/[item-id]` | Per-item evidence page (prompt, response excerpt, rater scores, agreement, citations). | N/A pre-launch. |

**Why a hub distinct from `/ai-labs`:** the AI Labs Index already uses `/ai-labs` for organisational
governance data (`ai-lab` EntityKind, `indexRegistry.ts`). Model Index rows are not `Entity` records —
they are model **snapshots** with a different identity shape (`registry_id`, `exact_snapshot`,
`product_surface`). Giving them their own top-level route prevents a frontend engineer from being
tempted to bolt model rows onto `ai-labs.json`, which is the exact defect already logged as
`RISK-013`/`RISK-014` in `.benchmark-ops/CURRENT_STATE.md`. Do not add a `model-index` `EntityKind` to
`indexRegistry.ts` — that registry is for the 8 existing institutional indexes and asserts an
invariant (`INDEX_REGISTRY.length !== ALL_ENTITY_KINDS.length` throws) that model rows should not be
forced through.

### 1.2 Nav placement

- Add **"Model Index"** as its own entry in `mainNav` (`site/src/data/nav.ts`), positioned directly
  after "Indexes" — not nested inside the Indexes dropdown/list. Rationale: the founder's brief makes
  this the site's key value proposition; burying it inside the institutional-index list undersells it
  and, more importantly, visually implies it's an institutional index like the other eight, which
  §1.4 forbids.
- Footer `tools` list already contains `/ai-evaluation-suite`. Add `/model-index` to a **new** footer
  group (not `tools`, not `indexes`) — e.g. a "Model Index" group with `/model-index`,
  `/model-index/task-bank`, `/model-index/methodology`. Do not add it to `footerLinks.indexes`, which
  is generated from `INDEX_REGISTRY` and asserts its own count invariant (§1.1).
- Breadcrumbs on every Model Index page read **Home → Model Index → [page]**, never **Home → Indexes
  → …**. This is a cheap, high-leverage signal that this is a sibling product, not an institutional
  index.

### 1.3 What NOT to reuse

`RankingTable` (used by `robotics-labs/page.tsx` and the other 7 indexes) assumes an `Entity`-shaped
row with `rank`, stable `slug`, and dimension scores that never change identity. Model rows can have
multiple snapshots of the "same" model, a `product_surface` axis institutional rows don't have, and a
rating-confidence dimension institutional rows don't have. **Recommend a new `ModelComparisonTable`
component**, visually consistent with `RankingTable` (same borders, same typography, same `Pill`/`Band`
use) but with its own column set and its own empty/N=1/N=3 states (§6). This is a frontend-engineer
build decision; flagging here because reusing `RankingTable` unmodified would either break on the
identity model or silently misrepresent it.

`CrawlableRankingTable` (the SEO/screen-reader fallback table rendered alongside `RankingTable`) *is*
directly reusable in shape — see §8.

### 1.4 The product-separation device (appears on every Model Index page)

A single, small, reused component — call it `ProductScopeBanner` — sits directly under the page hero
on every `/model-index/**` page:

> **You are viewing the Model Index.** This page scores a specific AI **model snapshot's behaviour**
> on standardized tasks — not the company that built it. See the [AI Labs Index](/ai-labs) for how we
> score developer organisations' governance, or read [how these differ](/model-index/methodology#separation).

Behavioural requirements:
- Renders identically (same component, same copy pattern) on the hub, task bank, methodology, and
  every model/dimension/item page — never hand-written per page.
- On a model detail page, the model's **developer name is never the primary heading**. The primary
  heading is the model identity string (`developer` + `family` + `exact_snapshot` label, e.g.
  "**Example Lab · Example Model 3 · 2026-09 snapshot**" — ILLUSTRATIVE). The developer name is a
  secondary line with its own link to the AI Labs Index row *if one exists*, labelled explicitly
  "**[Developer]'s governance score →**" so the click target's destination is unambiguous before the
  reader lands on it.
- If a developer has no AI Labs Index row (not all model developers are indexed there), the banner
  states that plainly rather than omitting the link silently: "Example Lab does not currently have a
  separate AI Labs Index governance score."
- No two composites — a model composite and a lab composite — may ever render inside the same table
  row, the same chart series, or the same sortable column. If a future feature wants to let a reader
  see both, they must be two visually distinct cards, never merged into one number or one row. This
  is the UX-level enforcement of the mechanical rule already built in
  `site/scripts/lib/product-separation.mjs`.

### 1.5 Relationship to `/ai-evaluation-suite`

Not this task's page to rebuild, but the two products must point at each other correctly:

- On `/model-index` (hub): a small card, "Want to score a model yourself right now?" →
  `/ai-evaluation-suite`, labelled "**Self-serve, unofficial, single-rater**" so a visitor doesn't
  mistake the hands-on tool for the published index.
- On `/ai-evaluation-suite`: recommend (to whoever next touches that page) a reciprocal card, "Looking
  for the official, panel-rated Model Index?" → `/model-index`. Not building this here; flagged as a
  handoff note in §11.

---

## 2. Core journeys by audience

Each journey: entry point → key action → completion state → failure state. All journeys below are
written against the **launch-day empty state** first, then noted for the **populated state** where
the flow changes materially.

### 2.1 Journalist — needs a citable headline finding fast, on deadline

**Entry:** referral link from `/updates`, a search engine query ("compassion benchmark AI model"), or
a direct link shared on social media.

| Step | Empty state (launch day) | Populated state (≥1 model) |
|---|---|---|
| Lands on `/model-index` | Sees the hero stating what this is and that zero models are scored yet, with a plain-language "why" (§3). | Sees the hero with the current headline finding already written in the answer-first strip (same AEO pattern as `robotics-labs/page.tsx`'s top banner): "As of [date], [Model] is the highest-scoring model on the Compassion Benchmark Model Index ([score]/100, [Band])." |
| Looks for something to cite | Finds nothing to cite about model scores — and the page tells them so directly, plus offers the one thing that *is* citable today: the existence and structure of the methodology and task bank ("33-item public task bank, 8 dimensions, first result pending"). | Clicks into the model detail page; the top of that page has an explicit "For citation" block: one sentence, the composite, the band, the evidence count, and a copy-to-clipboard citation string with a permalink and retrieval date. |
| Completion | Journalist either (a) writes a "benchmark launches, no results yet" story using the honestly-stated status, or (b) subscribes to be notified the moment the first result publishes (§3.4), or (c) leaves — all three are legitimate outcomes and none is a failure of the page. | Journalist has a citable sentence, a permalink, and a retrieval date within under 30 seconds of landing, without needing to read methodology first. |
| Failure state to avoid | A vague "coming soon" with no structure behind it reads as vapourware and journalists will not cite or return. **Design must give them something concrete to cite even at zero models**: dimension definitions, task-bank size, methodology rigor, and a real date-stamped "why nothing is published yet" (§3). | A page that requires methodology-reading before the citable fact appears above the fold. |

### 2.2 Safety researcher — needs to interrogate methodology and reproduce a result

**Entry:** direct navigation to `/model-index/methodology`, often after reading `/methodology` first.

| Step | Empty state | Populated state |
|---|---|---|
| Reads methodology | Full methodology is available even though no result exists yet — battery structure, item lifecycle, rating-panel design, statistics planned (bootstrap CIs, kappa/alpha, tie groups), publication gate. Every claim is written in future/process tense ("will require," "the panel design specifies") never past tense about a run that hasn't happened. | Same page, plus a worked, real example linked from the top: "See this methodology applied → [Model]'s full evaluation record." |
| Inspects the task bank | `/model-index/task-bank`: all 33 items, filterable by dimension, each showing construct, prompt text, and the 5-point rubric anchors. Validation status shown per item (all "unvalidated" today) with a plain explanation of what that means and what promotes an item out of that state. | Same page, plus (if the item has been used in a published run) a link from the item to every model's score on that specific item — the per-item evidence view (§4.4). |
| Tries to reproduce | Nothing to reproduce yet — but the researcher can verify the rubric, formula (`compositeCore`), and band definitions are internally consistent and can check them against the composite math shown worked-out on the methodology page. | Full reproduction path: exact snapshot identity (endpoint, sampling params, system-prompt status, tool config), trial count, rater count, inter-rater agreement statistic, and links to every raw item-level score with anchor justification. |
| Completion | Researcher can confirm the methodology is real, specific, and falsifiable even before a result exists — and can find the dimension-coverage imbalance (SYS 2 items) **disclosed by the product itself**, not discovered as a gotcha. | Researcher can independently recompute the composite from the published per-item scores and get the same number. |
| Failure state to avoid | Methodology page reads as marketing copy rather than a specification; imbalanced task-bank coverage is hidden or minimized rather than disclosed with its consequence stated plainly ("a Systems Thinking estimate currently rests on 2 items against 5 subdimensions — treat SYS scores as lower-confidence than other dimensions until this is corrected"). | Composite shown without the inputs needed to recompute it; missing snapshot identity so the score can't be tied to a specific, non-ambiguous model version. |

### 2.3 Lab engineer — wants to see how their own model scored and why, item by item

**Entry:** direct link (often internal, shared by a colleague or found via search for their own
model's name), or from the comparison table.

| Step | Empty state | Populated state |
|---|---|---|
| Searches for their model | Site search (existing `EntitySearch`/`NavbarSearch` pattern) returns **no result**, and the no-results state explicitly distinguishes "not evaluated yet" from "doesn't exist" — see §3.5 empty-search handling. A "notify me when this model is evaluated" affordance is not offered per-model at zero models (no registry entry to attach a watch to) — instead points at the general subscribe (§3.4). | Search resolves directly to `/model-index/[model-slug]`. |
| Reviews the score | N/A | Sees composite, band, dimension breakdown (8 bars matching `EvaluationScorer`'s existing dimension-bar visual language), and — critically — the **coverage/confidence indicator per dimension** (scored-item-count out of scorable-item-count in that dimension), since dimension coverage is uneven by design (§0.2). |
| Drills into a specific dimension where they scored poorly | N/A | Clicks the dimension bar → anchor-scrolls to that dimension's item list on the same page (§1.1 rationale for keeping this an anchor, not a route). Sees every item scored in that dimension, the anchor level selected, and the observable behaviour that justified it. |
| Drills into a specific item | N/A | `/model-index/[model-slug]/[item-id]`: the exact prompt run, a response excerpt (only what's needed to justify the score — not necessarily the full transcript, per evidence-store conventions), the anchor description matched, rater notes, and (if ≥2 raters) the agreement/adjudication outcome. |
| Disputes a finding | Always available: a "Report a concern about this evaluation" link → `/contact` (or a dedicated correction-request form) that pre-fills the model slug and item ID. This is the accountability-dimension analogue of the site's existing correction/dispute conventions — engineers must have a legible path to flag an error without that path being a backchannel for score negotiation (independence policy, `CLAUDE.md`). | Same, always present regardless of state. |
| Completion | Engineer understands the product exists, understands why their model isn't in it yet, and has a low-friction way to be notified. | Engineer can see exactly which behaviours drove which sub-score, with evidence, and has a legitimate dispute channel. |
| Failure state to avoid | Search returns a generic empty result with no explanation, reading as a bug rather than an honest "not yet." | Score shown with no drill path to evidence — this is the single most damaging failure mode for this audience, since it reads as an unaccountable black-box number applied to their product. |

### 2.4 Policy / procurement reader — needs a defensible comparison across models

**Entry:** `/model-index` directly, or a search for "AI model comparison compassion" / "AI safety
benchmark compare."

| Step | Empty state | Populated state (see §6 for count-specific behaviour) |
|---|---|---|
| Looks for a comparison | No comparison exists; page explains why (no models scored) rather than presenting an empty/broken-looking table. Offers the task-bank and methodology as the "what a comparison will consist of" preview. | At N=1: explicit spotlight card, no table, no "#1 of 1" framing (§6.2). At N≥3: a real comparison table becomes meaningful and appears. |
| Filters/sorts | N/A | Sorts by composite, by dimension, filters by developer, by product surface (`consumer`/`api_default`/etc. — critical for procurement, since the same model family can have a materially different score at different access tiers), filters by band. |
| Exports for a procurement memo | N/A | "Export comparison" → CSV/JSON, mirroring the disclosure discipline already established in `EvaluationScorer`'s export (explicit `official: true`/status, methodology version, retrieval date, confidence indicators — never a bare number). |
| Completion | Reader understands the product is credible and pre-registers to be notified. | Reader has a defensible, citable, exportable comparison with visible confidence/coverage caveats they can carry into a procurement decision without over-claiming precision the data doesn't support. |
| Failure state to avoid | An empty or stub comparison table (headers with no rows, or "TBD" cells) — reads as broken, not as "not yet." | A comparison table that presents N=2 or N=3 models with full sort/filter chrome identical to a mature 50-row index, implying a maturity of comparison the sample size doesn't support (§6). |

### 2.5 Founder / operator — runs and publishes a wave on release day

Full flow in §5. Entry points are internal (not public pages): the `.benchmark-ops/RELEASE_WATCH.md`
pipeline and the publication-ledger gate. This journey's *public-facing surface* is what changes on
the site the moment a wave publishes — that surface is specified in §5 and must be buildable without
the founder hand-editing HTML.

---

## 3. The empty / pre-result state — the launch-day experience (centerpiece)

This is the primary design problem per the brief. Treated as a first-class screen, not a fallback
branch of the populated screen.

### 3.1 What a visitor sees, top to bottom on `/model-index`

1. **`ProductScopeBanner`** (§1.4) — establishes this is the Model Index, distinct from AI Labs.
2. **Hero** (reuse `Eyebrow` + `h1` + lead paragraph pattern from `robotics-labs`/`ai-evaluation-suite`):
   - Eyebrow: `"Compassion Benchmark Model Index · 8 dimensions · 33-item public task bank · 0 models published"`
     — the zero is stated in the eyebrow itself, not hidden. Precedent: the site already states real
     counts in eyebrows (`"33 prompts"` on `/ai-evaluation-suite`); stating `0` the same way is
     consistent, not embarrassing.
   - H1: **"The Compassion Benchmark Model Index"**
   - Lead paragraph, plain language, present tense, no invented urgency: *"We evaluate AI model
     behaviour — not companies — against 8 dimensions of compassionate conduct, using standardized
     tasks, blinded human raters, and published evidence. No model has been evaluated yet. Here is
     what that process looks like, and how to know the moment it changes."*
3. **Status panel** (new component, `EvaluationStatusPanel` — visually a `Panel`/`Callout` in the
   existing style, not a warning box): a small, honest, dated status readout:

   ```
   PROGRAMME STATUS — as of [date]

   ● Task bank published        33 items, 8 dimensions           → Browse
   ● Methodology published      Battery, rating panel, statistics → Read
   ○ Release monitoring          Not yet active
   ○ First model evaluation      Not yet started
   ○ First published result      Not yet available
   ```

   Rules for this panel:
   - Every row is a real, checkable fact tied to a file this session verified exists (`task-bank-v1.json`
     item count, `MODEL_REGISTRY.md` row count, `RELEASE_WATCH.md` scan count). **Nothing in this panel
     may be aspirational text with no backing data field** — that is exactly the `WQ-P0-01` failure
     mode already logged against `/ai-evaluation-suite` (advertising capability that doesn't exist).
     Content owner (founder/backend) updates the underlying status fields; the component only ever
     renders what's true.
   - No countdown timer, no "coming Q4," no estimated date of any kind unless a real, founder-approved
     date exists. If no date exists, the row says "Not yet active" / "Not yet started" and nothing
     more. Fabricated urgency is explicitly against this brief and against the repo's own evidence
     discipline (`00-MASTER-CONDUCTOR`: "Never invent... a test result").
   - Uses simple filled/hollow dot or check/dash iconography *plus* text label — never colour alone
     (§7 accessibility).
4. **"What will appear here" preview** — three or four cards (`Card` component, same visual language
   as the dimension cards on `/ai-evaluation-suite`) showing, with clearly fake/greyed sample content
   labelled **"ILLUSTRATIVE — not a real score"** in a persistent corner tag, what a model card, a
   comparison row, and a dimension chart will look like once populated. This is the single highest-
   leverage element for making the empty state feel like a real, imminent product rather than
   vapourware — it shows the reader the shape of the thing without asserting any fact about it.
   - Every illustrative element uses a placeholder name pattern that cannot be mistaken for a real
     model or lab (e.g. "Example Model A," never a real provider name), a composite rendered with a
     dashed/hatched fill instead of a solid colour fill, and the corner tag repeated on every card
     (not just the section header) so a card can never be screenshotted or shared out of context
     without the label attached.
5. **Task-bank summary** — real data: 33 items, dimension coverage bar chart (8 bars, real counts:
   AWR 6, EMP 5, ACT 5, EQU 3, BND 3, ACC 4, SYS 2, INT 5), with the SYS imbalance called out in one
   plain sentence, not buried: *"Systems Thinking currently has the fewest items (2) of any dimension.
   We're disclosing this rather than smoothing it out of the chart."* → CTA to `/model-index/task-bank`.
6. **Methodology summary** — three or four plain-language bullets on how a model gets evaluated
   (release detection → task battery → blinded panel → statistical analysis → publication gate), each
   linking to the relevant section of `/model-index/methodology`.
7. **Subscribe** — `NewsletterSignup` `card` variant, re-copy for this context (see §10), `source="model-index-empty"`.
8. **Cross-links** — to `/ai-evaluation-suite` (§1.5) and `/ai-labs` (§1.4) so a visitor who wants
   *something* to do today with an AI model isn't stuck.
9. **FAQ** (`FaqAccordion` + `FaqJsonLd`, same pattern as `robotics-labs`): answers written for the
   zero-model state specifically —
   - "Why hasn't any model been scored yet?" — honest answer, references the real dependency chain
     (release monitoring, evaluation panel) without exposing internal ledger file names.
   - "How is this different from the AI Labs Index?"
   - "How is this different from the self-serve AI Evaluation Suite?"
   - "How do I get notified when the first result publishes?"
   - "Can a model's developer pay to be scored, skipped, or to influence the result?" → reuses the
     site's existing independence-policy answer pattern verbatim (`CLAUDE.md` "Independence policy").

### 3.2 What they understand

By the time a visitor scrolls past the fold, they should be able to answer, unprompted: *what this
measures, that it measures models not companies, that nothing is scored yet, roughly why, what the
process will look like when something is, and how to find out when it changes.* That is the test QA
should run this page against — not a pixel spec.

### 3.3 What they can do

Every action on this page must be real and functional at zero models: browse the task bank, read
methodology, subscribe, navigate to AI Labs Index, navigate to the self-serve tool, file a concern/
contact. **No action on the empty-state page may be a dead button.** This is the same defect already
logged against `/ai-evaluation-suite` (`WQ-P0-03`) and must not be repeated here.

### 3.4 Conversion into a returner

Two mechanisms, both must exist, neither should be the only one:

1. **Email subscribe** (`NewsletterSignup`, card variant). Distinguish the list/segment from the
   general site newsletter if the backend supports source-tagged segments (`source="model-index"`),
   so a subscriber here can later be sent "first Model Index result is live" specifically rather than
   the general weekly digest. If segment-tagging isn't available at build time, fall back to the
   general list with the subscribe copy honestly saying so ("You'll get this in the general weekly
   digest") rather than promising a dedicated alert that doesn't exist.
2. **RSS/JSON feed** — the site already has `/updates/feed.xml` and `/updates/feed.json`. The first
   Model Index publication should post to `/updates` like any other finding (existing pipeline), so a
   reader who already follows updates via feed gets it automatically with zero new infrastructure.
   State this explicitly on the empty-state page: "First results will also appear in Daily Updates and
   the RSS/JSON feed" with links.

Do **not** build a bespoke "Model Index score-watch" subscription mechanism that duplicates
`/score-watch`'s per-entity watch model at launch — there are no entities to watch yet. Revisit once
≥1 model exists (a per-model watch becomes meaningful at that point, following the same UX pattern as
`/score-watch`).

### 3.5 Explicit non-goals — things this empty state must never do

- **No stub `/model-index/[model-slug]` pages for hypothetical or announced-but-unevaluated models.**
  A route only exists once a real, evidence-backed registry entry is published. Searching for a real
  model name that hasn't been evaluated must return a clean "not evaluated yet" search result, not a
  404 with no explanation and not a fabricated placeholder page.
- **No progress bar or percentage toward "first result."** There is no meaningful way to quantify
  "38% of the way to a first model evaluation," and inventing one would be exactly the fabricated-
  precision failure this brief warns against.
- **No countdown clock.**
- **No fake "trending models" or "recently viewed" rail** — there is no data to back either.
- **No score, band, or composite number anywhere on this page**, illustrative or otherwise, that
  could be mistaken for real at a glance (hence the mandatory corner tag in §3.1.4, not just a caption
  above the section).

---

## 4. The populated state

Applies once ≥1 model exists. Count-specific variations are in §6; this section specifies the full,
mature screens.

### 4.1 Comparison screen (`/model-index`, populated)

Structure mirrors `robotics-labs/page.tsx`'s proven pattern, adapted for model identity:

1. `ProductScopeBanner`.
2. Answer-first AEO strip (top/bottom model + composite + band + count), same pattern as
   `robotics-labs`'s top banner — but the sentence must additionally name the **snapshot**, not just
   the model family, since identity is snapshot-level: *"As of [date], **Example Model 3 (2026-09
   snapshot)** is the highest-scoring model on the Compassion Benchmark Model Index ([XX.X]/100,
   [Band])."* (ILLUSTRATIVE.)
3. Hero/stats row (`IndexHero`-equivalent or a new `ModelIndexHero`): model count, mean/median
   composite, dimension count, task-bank size, **and** a coverage stat not present on institutional
   indexes — "models with full battery coverage" vs "models with rapid-check only" (see §5 on
   rapid-check vs full-run).
4. `ModelComparisonTable` (§1.3) — columns: rank (only shown at N≥3, §6), model identity (family +
   snapshot, stacked two lines), developer (linked to AI Labs row if one exists), product surface
   (badge/`Pill`), 8 dimension columns, composite, band, **coverage indicator** (e.g. "8/8 dims full"
   vs "5/8 dims, rapid-check"). Filters: developer, product surface, band. Sort: any numeric column.
   Search: model name.
5. `CrawlableRankingTable`-equivalent fallback table for SEO/screen readers (§8).
6. FAQ, subscribe, cross-links — same as empty state but with populated-state answers.

### 4.2 Per-model detail screen (`/model-index/[model-slug]`)

Top to bottom:

1. `ProductScopeBanner`, with the "developer governance score" cross-link (§1.4) filled in.
2. **Identity block** — not optional, not collapsed: developer, family, exact snapshot, product
   surface, access tier, region, system-prompt status, moderation-layer status, tools enabled,
   sampling parameters, first-seen date, test dates, predecessor link (lineage) if any. This is the
   registry schema (`.benchmark-ops/MODEL_REGISTRY.md`) made reader-facing. Rationale: for a safety
   researcher or procurement reader, an unlabelled "GPT-Next scored 61" is close to useless — *which*
   configuration of the model, under *which* system prompt, with *which* tools, is the actual claim.
3. **"For citation" block** (§2.1) — one-sentence summary, composite, band, permalink, retrieval
   date, copy-to-clipboard citation string.
4. **Composite + status** — large composite number and band (`Band` component), plus a status tag:
   `RAPID-CHECK` vs `FULL RUN` vs `FULL RUN — PARTIAL` (see §5, §7). A partial/rapid-check result is
   never rendered identically to a full result — different tag colour, different microcopy directly
   under the number explaining the difference in one sentence, and a link to what completing the full
   run will add.
5. **Dimension breakdown** — 8 horizontal bars (visual language already established in
   `EvaluationScorer`'s live composite view — reuse, don't reinvent), each bar clickable, scrolling to
   that dimension's section further down the page (§1.1). Each bar shows both the score and the
   coverage fraction (scored/scorable items in that dimension) so uneven task-bank coverage (§0.2) is
   never hidden behind a smoothed-looking bar.
6. **Per-dimension sections** (§4.3), one per dimension, each listing its scored items with links to
   §4.4.
7. **Statistics** — confidence interval on the composite (once the statistical layer exists per
   `CB_MODEL_INTEGRATION` P0.5), inter-rater agreement, trial count. If not yet computed for this
   result, say so explicitly rather than omitting the section silently ("Confidence interval: not yet
   available for this result — see methodology for when this is added").
8. **Evidence & sources** — every citation with `source_url`, publisher, `published_at`, `retrieved_at`.
9. **Compare this model** — CTA back to the comparison table, pre-filtered to include this model plus
   others from the same developer or same band.
10. **Dispute/correction path** (§2.3).

### 4.3 Per-dimension drilldown

An anchored section within the model detail page (§1.1 rationale), not a separate route:

- Dimension name, code, canonical description (from `dimensions.ts` — reuse the canonical text
  verbatim; do not let the Model Index re-describe dimensions differently, which is exactly
  `CONFLICT-05` already logged against `/ai-evaluation-suite`'s divergent subdimension taxonomy).
- List of every task-bank item scored in this dimension for this model: item ID, construct/type,
  score (1–5), one-line justification excerpt, link to full evidence (§4.4).
- If the dimension has low item coverage (e.g. SYS at 2 items), a visible inline note: "This
  dimension estimate rests on 2 of 33 task-bank items. Treat it as lower-confidence than dimensions
  with more items until the battery is expanded." This is a direct, un-hidden application of the
  disclosure already required in §2.2/§0.2.

### 4.4 Per-item evidence screen (`/model-index/[model-slug]/[item-id]`)

- Item metadata: dimension, construct, validation status, exposure class (public/secure).
- The exact prompt run (verbatim, matching the `prompt`-field-only discipline already established in
  `page.tsx`'s comment on `sourceOnlyFields` separation — never render evaluator-only scaffolding as
  if it were sent to the model).
- Response evidence: an excerpt sufficient to justify the score, not necessarily a full transcript
  (data-minimisation choice, flagged as an assumption in §11 — final call belongs to whoever owns the
  evidence-store policy).
- Anchor matched (which of the 5 rubric levels, and its text) with rater notes.
- If ≥2 raters: both scores, agreement/disagreement, adjudication outcome if any.
- Citation block identical in shape to the model-level one (§4.2.3), scoped to this item.
- Breadcrumb back to dimension section and model page.

---

## 5. The release-day flow

What changes on the site when a new model ships or an existing model's snapshot is updated, and how a
returning visitor perceives that freshness.

### 5.1 Two-stage publication, both visible states, never silently merged

Per `.benchmark-ops` schema (`RELEASE_WATCH.md` ticket fields, unverified SLA numbers not committed to
— see §11), a release plausibly produces a **rapid-check** result before a **full run** completes.
The UX must represent both stages honestly rather than waiting to publish anything until the full run
finishes (which would undercut the "citable fast" journalist need, §2.1) or silently upgrading a
rapid-check into a full-run-looking result (which would overstate confidence).

- **Rapid-check published:** model appears in the comparison table and gets a detail page immediately,
  tagged `RAPID-CHECK` (§4.2.4) — reduced item set, fewer dimensions covered, explicitly and visually
  incomplete (e.g. dimension bars for uncovered dimensions render as empty/hatched with "not yet
  evaluated" rather than a zero, since zero already has a harm-flag meaning in `compositeCore` and
  must never be conflated with "not measured").
- **Full run published:** same URL (`/model-index/[model-slug]`) upgrades in place — same permalink,
  content changes, tag changes to `FULL RUN`. A visible "last updated" line with prior status shown
  ("Previously published as a rapid-check result on [date]; full run completed [date]") so a reader
  who cited the rapid-check number isn't misled about what changed.
- **Never** two separate pages/permalinks for the "same" model's rapid vs full result — that creates
  exactly the duplicate-identity defect already logged for institutional entities (`DECISIONS.md` D-13).

### 5.2 Site-wide freshness signals on release day

- The Model Index hub's answer-first strip and stats update (build-time regeneration — static export,
  §0.4).
- A same-day entry in `/updates` (existing daily-briefing pipeline), so the release surfaces through
  the channel readers already follow, with a link into the new/updated model page.
- The `EvaluationStatusPanel` (§3.1.3) status rows change from hollow to filled as each stage
  completes, and the panel itself is retired/replaced by the populated comparison view once ≥1 model
  is fully published (see §6.1 — it doesn't coexist with a populated table forever).
- Every page carries a visible, real "data as of [date]" line — not a vague "last updated recently."
  Given the static-export constraint, this date is the last successful build/deploy that included this
  content, and should be sourced from the same build-time mechanism the rest of the site uses for
  dated content (existing convention — confirm exact source with frontend-engineer, flagged §11).

### 5.3 Returning-visitor perception of "what's new"

- Comparison table: newly added/updated models get a small `NEW` or `UPDATED` badge (`Pill`) for a
  bounded window (e.g. until the next release cycle publishes, not a hardcoded "7 days" unless product
  decides a real window) — avoid inventing a specific duration without a product decision; flagged
  §11.
- If the visitor previously subscribed (§3.4), the email itself is the primary "what's new" signal —
  the on-site badge is a secondary reinforcement, not the sole mechanism, since a static-export site
  has no reliable way to know what a given anonymous visitor already saw.

---

## 6. Progressive states — 0, 1, 3, 12+ models

Each state must feel like an intentional design decision for that count, not a generic table that
happens to be sparse. This section is the direct answer to the brief's explicit warning: *"A
comparison UI that is meaningless at N=1 must not ship in a form that implies otherwise."*

### 6.1 N = 0 — fully specified in §3.

### 6.2 N = 1 — spotlight, not a table

- **No `ModelComparisonTable` renders.** A table with one row is not a comparison; rendering one
  invites a false "#1 of 1" read.
- Instead: a large single **spotlight card** — the model's identity, composite, band, and dimension
  bars, essentially the top portion of the detail page (§4.2) surfaced directly on `/model-index`,
  with a "Full evaluation record →" link to the detail page.
- Explicit microcopy directly under the spotlight: *"This is the first model published on the Model
  Index. Comparison across models becomes available once more are evaluated."* — states the N=1
  condition rather than hiding it.
- The `EvaluationStatusPanel` (§3.1.3) is not fully retired yet at N=1 — its remaining hollow rows
  ("release monitoring," coverage-expansion items) still render below the spotlight, since the
  programme is still visibly ramping.

### 6.3 N = 2–3 — comparison appears, but caveated

- `ModelComparisonTable` now renders, but:
  - **No `rank` column below N=3.** At N=2, showing "Rank 1 / Rank 2" is a coin flip dressed as a
    ranking; use the table for side-by-side inspection (sortable, filterable) without a rank number.
    At exactly N=3, rank may appear but the section header carries a visible caveat: *"Comparing 3
    models. Rankings will stabilize as more models are added — treat relative position as provisional
    at this sample size."*
  - Sort/filter controls are present (they're genuinely useful even at N=2–3) but the "filter by
    product surface" / "filter by developer" controls that only make sense at higher N (e.g. filtering
    to a developer who has only one model) may render but should not be the default-open state — keep
    the default view unfiltered so the small population isn't further fragmented by an empty filtered
    view.
- No bar charts/scatter plots that imply distribution (e.g. no histogram of composite scores) below
  N≈8 — a distribution shape is not meaningful with 2–3 points. (`IndexPageCharts`, used on
  `robotics-labs`, should not be reused unmodified for the Model Index at low N; gate its distribution
  visuals behind a minimum count, flagged as a build requirement in §11.)

### 6.4 N ≈ 4–11 — comparison matures, caveat softens

- Rank column active without a caveat banner, but the "provisional at this sample size" language
  moves from a banner into the methodology page's standard disclosure (still discoverable, no longer
  interruptive).
- Filters become genuinely useful (multiple developers, multiple product surfaces) and can default to
  visible/open.
- Still hold off on statistical distribution visuals (histograms, box plots) until a product/stats
  decision on the minimum N for those to be non-misleading — not an arbitrary UX call; flagged §11.

### 6.5 N = 12+ — full index behaviour

- Full `ModelComparisonTable` chrome: rank, sort, filter, search, pagination if needed, distribution
  visuals (mean/median stats row, matching `IndexHero`'s stat pattern used on institutional indexes).
- At this point the Model Index visually and functionally resembles the mature institutional indexes
  (`robotics-labs`, `ai-labs`) it was deliberately *not* allowed to resemble at N=0–3 — that
  convergence is intentional and is the payoff of not rushing the earlier states.

---

## 7. Loading, empty, partial, error, and stale states — per surface

| Surface | Loading | Empty | Partial | Error | Stale |
|---|---|---|---|---|---|
| `/model-index` hub | N/A — static export, content is in the initial HTML (§0.4). Client-side hydration of any interactive filter/search shows a brief skeleton only for the *interactive* control, never for the page content itself. | §3 (zero models) — fully specified screen, not a spinner-then-nothing. | N/A (hub is either the empty-state layout or the populated layout — there is no "half populated" hub; §6 handles low-N as its own intentional design, not a partial/broken state). | Build-time only (malformed registry JSON fails the build via the existing validator, `validate-model-registry.mjs` — never reaches a live "error" page). Client-side: if a filter/search interaction throws, fail closed to the unfiltered full list with a small inline notice, never a blank table. | Every page carries a real "data as of [date]" line (§5.2). No separate "stale" banner is needed if this date is always accurate and visible — inventing a staleness threshold/banner is out of scope without a product decision (§11). |
| `/model-index/task-bank` | Same as hub — static content. | Cannot be empty post-launch (33 items ship with the page); if a future edit reduced it to 0 items, the page must show the same honest empty-state discipline as §3.5, not a blank table. | Items with `validationStatus` other than fully validated are shown, not hidden, with a visible status tag per item (mirrors `EvaluationScorer`'s existing draft/unreviewed treatment — reuse that pattern, don't invent a new one). | Same build-time-only discipline as above. | Task-bank version number and "last revised" date shown in the page header, sourced from `tasks-v1.json` `meta`. |
| Comparison table | Static; only the interactive sort/filter has a transient state (instant, client-side, no network — should never take long enough to need a spinner; if a future dynamic-load variant is built, use a skeleton row count matching current row count, not a generic spinner). | §3.1/§6.1 (0 models) and §6.2 (1 model, no table). | §6.3/§6.4 count-based caveats; also: a model row with incomplete dimension coverage shows visible "—" / "not yet evaluated" cells for missing dimensions, never a 0 or a blank that could read as a zero score. | Malformed row fails build-time validation (extend the existing product-separation-guard pattern, §1.4, to catch this class of defect) rather than rendering broken at runtime. | Table header states "as of [date]"; a `NEW`/`UPDATED` badge per §5.3 on rows changed since the prior publish. |
| Model detail page | Static. | Route doesn't exist pre-publication (§3.5) — not an empty state, a 404, with the site's standard 404 handling plus a specific suggestion to search the Model Index or subscribe. | `RAPID-CHECK` / `FULL RUN — PARTIAL` tags (§4.2.4, §5.1) are the partial state, always visibly tagged, never presented identically to a complete result. Missing statistics section states its own absence explicitly (§4.2.7) rather than omitting the heading. | Build-time validation only. | "Last updated [date]" plus prior-status history line when a rapid-check was upgraded to full (§5.1). |
| Per-item evidence page | Static. | Cannot exist without an item + a model both existing — no empty variant needed; 404 if navigated to directly with a bad slug. | An item scored by only 1 rater (no adjudication yet) states that plainly rather than presenting a false consensus. | Build-time validation only. | Inherits the parent model page's "as of" date. |
| Subscribe form (`NewsletterSignup`) | Existing `"submitting"` state, unchanged component. | N/A. | N/A. | Existing `"error"` state with retry + direct-email fallback, unchanged component (§0 — reuse, don't rebuild). | N/A. |
| Site search / no-results | Existing search UI. | §2.3's specific "not evaluated yet" distinction for a real model name with no registry entry, vs. a generic "no results" for a nonsense query — these must be copy-distinct, not the same empty-result template, because they mean different things to the searcher. | N/A. | N/A (client-side search over a static index; a broken search index is a build-time failure). | N/A. |

---

## 8. Accessibility

- **Score tables** (`ModelComparisonTable` and its `CrawlableRankingTable`-equivalent fallback):
  every data table has a `<caption>` stating what it is and its "as of" date; column headers use
  `scope="col"`, the model-identity column uses `scope="row"`; sortable column headers are real
  `<button>` elements (not `<div onClick>`) with `aria-sort` reflecting current state, operable via
  keyboard (`Enter`/`Space`), and announce the new sort order to screen readers via an `aria-live="polite"`
  region ("Sorted by Awareness, descending") — mirror whatever pattern `RankingTable` already uses for
  this if one exists; if it doesn't yet, this is a gap to close for both the existing indexes and this
  new one, flagged §11.
- **Dimension bars/charts:** every bar chart (composite dimension breakdown, coverage bars) ships with
  a text-equivalent — either an adjacent real `<table>` (the `CrawlableRankingTable` pattern already
  used for SEO doubles as the accessibility fallback here) or a visually-hidden but DOM-present list
  of "Dimension: score (coverage)" pairs. No chart may be the *only* representation of its data.
- **Colour:** band colours (`Band` component's existing red/orange/yellow/green/cyan palette) are
  never the sole signal — every band render pairs colour with the text label ("Critical," "Developing"
  etc., which `Band` already does) and, for the new `RAPID-CHECK`/`FULL RUN` status tags, pairs colour
  with a text label and (recommended) a distinct icon shape, not just a different hue, so a colour-
  blind reader can distinguish "rapid-check" from "full run" without relying on hue alone.
- **Illustrative-content tag (§3.1.4):** the "ILLUSTRATIVE — not a real score" corner tag must be
  real, programmatically-associated text (not a background image or CSS-only watermark), so it reaches
  screen-reader users and text-only browsers exactly as reliably as sighted users — this is a
  correctness requirement, not just a visual one, since the whole point of the tag is to prevent a
  fabricated-looking claim from reaching any reader.
- **Keyboard:** every interactive element (filter chips, sort headers, dimension-bar-to-anchor links,
  copy-citation buttons, subscribe form) reachable and operable via keyboard alone, visible focus ring
  consistent with the rest of the site's existing focus styles (see `EvaluationScorer`'s
  `focus:outline-none focus:border-[...]` pattern — note this pattern removes the default outline and
  substitutes a border colour change; confirm with frontend-engineer that this still meets contrast/
  visibility requirements for focus indication, since outline removal is a common a11y regression
  point — flagged §11 as a check, not a re-litigation of existing site patterns).
- **Copy-to-clipboard citation button** (§4.2.3): announces success/failure via `aria-live`, matching
  the existing "Copied ✓" pattern already implemented in `EvaluationScorer`'s variant-copy affordance
  — reuse that interaction pattern exactly.
- **Status panel (§3.1.3):** dot/check iconography paired with text status, `aria-label`ed per row
  ("Task bank: published"), not conveyed by icon shape or colour alone.

---

## 9. Mobile behaviour

Dense score tables are the primary mobile risk on this product (8 dimension columns + identity +
composite + band + coverage — wider than any existing institutional index table, which tops out at 8
dimension columns plus 4 identity columns and already requires horizontal scroll on mobile per the
existing `RankingTable` pattern).

- **Below `sm` breakpoint, `ModelComparisonTable` switches to a stacked card layout, not a horizontally
  scrolling table.** Each model becomes one card: identity (2-line), composite + band prominent,
  coverage tag, and a compact 8-segment dimension strip (single-row colour/height-coded strip rather
  than 8 separate labelled bars) with a "View full breakdown" tap-through to the detail page. This
  differs from the existing institutional `RankingTable` mobile behaviour (which the codebase should
  be checked against — if it already does horizontal-scroll-with-sticky-first-column on mobile, that
  is an acceptable *alternative* to the card pattern for consistency's sake, but the sticky-column
  approach becomes materially harder to use at 8+ dimension columns than at institutional indexes'
  equivalent width, so card-stacking is the recommendation specifically for this table). Final choice
  is frontend-engineer's given actual `RankingTable` mobile implementation — flagged §11.
- **Sort/filter on mobile** collapses into a single "Sort & Filter" sheet/drawer (bottom sheet pattern)
  rather than a row of chips competing for horizontal space, consistent with how the existing site
  likely already solves this for institutional index tables — confirm and reuse that exact pattern
  rather than inventing a second one (§11).
- **Model detail page on mobile:** the identity block (§4.2.2) — 12+ fields — collapses to the 4–5
  most decision-relevant fields open by default (developer, family, snapshot, product surface, access
  tier) with a "Show full configuration" disclosure for the rest, rather than forcing a long scroll
  through low-priority fields before reaching the composite.
- **Dimension bars on mobile** stack full-width, one per row (already how `EvaluationScorer`'s
  dimension bars render — that pattern is mobile-safe as-is and should be reused unchanged).
- **Citation/copy button and export controls** remain full-width, thumb-reachable tap targets
  (min 44×44px per standard mobile touch-target guidance) — this applies to every button in §4.2.3,
  §4.4's citation block, and the export controls pattern already established in `EvaluationScorer`.
- **The empty-state page (§3)** is mobile-first by nature (mostly prose, cards, one table-free status
  panel) and needs no table-specific mobile treatment — its main mobile risk is the illustrative-card
  grid (§3.1.4), which should collapse from the desktop's multi-column card grid to single-column
  stacked cards, keeping the corner tag legible at mobile card width (not shrunk below readable size).

---

## 10. Content and copy guidance (short)

- **Tone for the empty state:** confident about the process, humble about the results. Never
  apologize for having zero models ("we're sorry nothing is available yet"); never oversell readiness
  ("launching very soon"). State facts and let the specificity of the methodology carry the
  credibility.
- **Never say "coming soon."** Say what is true today (task bank published, methodology published) and
  what genuinely has no timeline yet (first evaluation), without conflating the two.
- **Every mention of a composite number in prose must carry its band and its "as of" date** the first
  time it appears on a page, per the site's existing AEO answer-first convention (`robotics-labs`'s
  top strip) — reuse that exact sentence pattern for models, substituting model identity for entity
  name.
- **Never write "Model X scores worse/better than Company Y."** A model's composite and a lab's
  composite are never comparable in prose, even informally — this is the plain-language enforcement of
  §1.4.
- **Illustrative-content label, exact recommended string:** `"ILLUSTRATIVE — not a real score"` used
  consistently everywhere fabricated-looking example content appears, so it's recognizable as a fixed
  system label rather than ad hoc caption text.
- **Independence disclosure**, reused verbatim from `CLAUDE.md`'s policy, adapted minimally for models:
  *"Model developers never pay for inclusion, evaluation timing, score changes, or suppression of
  findings on the Model Index."*

---

## 11. Assumptions and open questions for frontend-engineer, PM, and QA

Flagged throughout; consolidated here so nothing is silently assumed:

1. **Route naming** (`/model-index`, `/model-index/task-bank`, `/model-index/methodology`,
   `/model-index/[model-slug]`, `/model-index/[model-slug]/[item-id]`) is a UX proposal, not a ratified
   IA decision — needs system-architect/frontend-engineer sign-off, particularly whether
   `[model-slug]` should encode `registry_id` directly or a human-readable slug with `registry_id` as a
   hidden identity field (the registry's own invariant that `registry_id` is immutable while
   `exact_snapshot` can proliferate needs a slugging scheme that survives multiple snapshots of the
   same family — e.g. slug per snapshot, not per family).
2. **`ModelComparisonTable`** is proposed as a new component distinct from `RankingTable` (§1.3) —
   needs frontend-engineer confirmation this is the right level of reuse vs. divergence.
3. **Statistical-visual minimum-N gating** (§6.3, §6.4) — the exact N thresholds for enabling rank,
   distribution charts, etc. are UX judgment calls in this document; if product/founder wants different
   thresholds, that's a product-manager call, not something QA should treat as a hard spec without
   confirmation.
4. **"As of [date]" data source** (§5.2, §7) — needs a confirmed build-time mechanism (likely whatever
   already stamps dates on the institutional index pages) rather than a new one invented for this
   product.
5. **`NEW`/`UPDATED` badge window** (§5.3) — no specific duration is specified here deliberately;
   needs a product decision.
6. **Data-minimisation call on response excerpts vs. full transcripts** (§4.4) — flagged as an
   evidence-store policy decision, not a UX decision; this document assumes excerpts but the actual
   policy owner should confirm.
7. **Existing `RankingTable` mobile behaviour** should be inspected directly before finalizing §9's
   card-vs-scroll recommendation — this document reasons from the desktop implementation only.
8. **`/ai-evaluation-suite` cross-link** (§1.5) is a recommendation for whoever next edits that page;
   not built or specified as code here, and not this task's scope to modify given that page has its
   own open defects (`WQ-P0-01`, `WQ-P0-03`) being tracked separately.
9. **Table sort/keyboard-interaction pattern** for `RankingTable` — this document assumes best
   practice (§8) but did not verify the existing component's current implementation in detail; QA
   should verify against the actual shipped `RankingTable` behaviour, not just this spec, and file a
   gap if the existing pattern falls short (applies to institutional indexes too, not just this one).

---

## 12. Handoff summary

**To frontend-engineer:** §1 (IA/routing/component reuse decisions needing sign-off), §4 (screen
specs), §6 (progressive-state gating logic), §7 (state matrix — build this as literal acceptance
criteria), §9 (mobile component behaviour), §11 (open technical questions this document could not
resolve alone).

**To QA engineer:** §2 (per-audience journey acceptance walkthroughs), §3.5 (explicit non-goals — test
that these are *absent*, not just that the intended content is present), §6 (test each of the four
named model counts as distinct scenarios, not a single "populated" test case), §7 (state matrix as a
literal test grid), §8 (accessibility acceptance criteria).

**To product-manager:** §5.1's rapid-check/full-run two-stage model (confirm this matches actual
evaluation-pipeline design before it's built as a UI assumption), §6.3/§6.4's N-thresholds (confirm or
adjust), §11 items 3, 5, 6 (product decisions this document flagged rather than made unilaterally).

Primary files referenced (read, not modified): `C:\Users\philk\applied-compassion-benchmark\site\src\data\model-benchmark\registry-v1.json`,
`C:\Users\philk\applied-compassion-benchmark\site\src\app\ai-evaluation-suite\page.tsx`,
`C:\Users\philk\applied-compassion-benchmark\site\src\components\model-benchmark\EvaluationScorer.tsx`,
`C:\Users\philk\applied-compassion-benchmark\site\src\app\robotics-labs\page.tsx`,
`C:\Users\philk\applied-compassion-benchmark\site\src\data\dimensions.ts`,
`C:\Users\philk\applied-compassion-benchmark\site\src\data\nav.ts`,
`C:\Users\philk\applied-compassion-benchmark\site\src\data\indexRegistry.ts`,
`C:\Users\philk\applied-compassion-benchmark\docs\CB_MODEL_INTEGRATION_2026-09-06.md`,
`C:\Users\philk\applied-compassion-benchmark\.benchmark-ops\CURRENT_STATE.md`,
`C:\Users\philk\applied-compassion-benchmark\.benchmark-ops\MODEL_REGISTRY.md`,
`C:\Users\philk\applied-compassion-benchmark\.benchmark-ops\RELEASE_WATCH.md`,
`C:\Users\philk\applied-compassion-benchmark\site\scripts\lib\deployed-ai-audit-subjects.mjs`.
