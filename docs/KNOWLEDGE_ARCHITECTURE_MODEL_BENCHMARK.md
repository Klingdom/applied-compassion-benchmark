# Knowledge Architecture — AI Model Compassion Benchmark

**Status:** Specification. No implementation. No page written, no data modified.
**Owner of this document:** knowledge-architect. **Implementer:** frontend-engineer.
**Date:** 2026-09-10.
**Scope:** information strategy for the new AI Model Compassion Benchmark content pages —
what a reader must understand, in what order, at what depth, and what page structure makes
that happen with the least effort. It does not specify visual styling (UX owns pixels) or
CTA/persuasion strategy (conversion-strategist owns those). Both are handed off explicitly
where they arise.

**Grounding.** Every claim below is checked against files in this repository:
`site/src/data/model-benchmark/registry-v1.json` (0 entries),
`site/src/data/model-benchmark/tasks-v1.json` (33 items, all `unvalidated` or
`draft-authored-unreviewed`), `site/src/data/dimensions.ts` (8 dimensions, 40 subdimensions,
canonical `BANDS`, canonical `INTEGRATION_PREMIUM`), `site/src/lib/scoring.ts`,
`site/src/app/ai-evaluation-suite/page.tsx`, `site/src/app/methodology/page.tsx`,
`site/src/app/robotics-labs/page.tsx`, `site/scripts/lib/product-separation.mjs`,
`docs/CB_MODEL_INTEGRATION_2026-09-06.md`, `docs/MODEL_EVALUATION_HARNESS_DESIGN.md`,
`.benchmark-ops/MODEL_REGISTRY.md`, `DECISIONS.md` D-23.

**Hard constraint honoured throughout:** there are zero evaluated models. No score, no
confidence figure, no rank, no model name-plus-number appears anywhere in this document, and
none may appear in any page built from it until a real run produces one.

---

## 0. The one-paragraph brief

A reader arriving at the AI Model Compassion Benchmark is being asked to hold five ideas at
once, four of which contradict an intuition they arrived with. The page set must therefore be
built as a **teaching sequence, not a leaderboard with footnotes.** The single organising
decision in this document: **the object being measured is taught before the number, on every
surface, every time.** A score that arrives before its object is a score the reader will
attach to the wrong thing — most often the lab, occasionally the product, almost never the
frozen model snapshot we actually tested.

---

## 1. Concept dependency map

### 1.1 The fourteen concepts, and what depends on what

Nodes are numbered by dependency depth. A concept may not be *used* on a page before its
prerequisites have been *taught* on that page (or taught in a fixed, always-present component
the reader has already passed).

```
LAYER 0 — premises (no prerequisites; must come first on every surface)
  C1  Compassion here is a measured construct: 8 named dimensions, publicly defined.
  C2  The evidence is observed behaviour on a fixed task bank — not lab statements,
      not policy documents, not marketing.

LAYER 1 — the object (depends on C2)
  C3  The scored object is a MODEL SNAPSHOT: one frozen, dated version, on one surface,
      with one sampling config. Not a family. Not a brand. Not a lab.
  C4  Three different objects exist across this institution, measured three different
      ways: model snapshot / organisation / deployed product.        [depends on C3]

LAYER 2 — how a number is made (depends on C1, C3)
  C5  A task-bank item + a 5-level behavioural anchor produces one 1–5 item score.
  C6  A dimension score is built from the item scores tagged to that dimension.
  C9  Coverage: how many items stand behind each dimension. Uneven by construction.
                                                                     [depends on C6]

LAYER 3 — how the number is combined (depends on C6)
  C7  The composite is NOT the mean. An integration premium rewards balance.
  C8  Bands: five named ranges, canonical in `dimensions.ts` BANDS.   [depends on C7]

LAYER 4 — how much to trust it (depends on C5, C6, C9)
  C10 Exposure/contamination: every current item is public with its answer key.
  C11 Rating protocol: two independent human raters, blinding, adjudication.
  C12 Uncertainty: interval, rater agreement, trial count, item count — one object
      with the score, never separable.                          [depends on C9, C11]

LAYER 5 — institutional context (depends on C3, C12)
  C13 Independence: the conflict is structural, disclosed, and bounded — not absent.
  C14 Versioning: a new release creates a NEW row; the old row is frozen, never
      overwritten.                                                   [depends on C3]
```

**Two dependency edges that are routinely violated and must not be:**

- **C7 before C6.** Publishing a composite before the reader knows a dimension score is a
  mean of item scores makes the integration premium unteachable — the reader has no baseline
  ("premium over *what*?").
- **C12 before C9.** An interval means nothing until the reader knows the denominator. On the
  current bank, SYS would rest on **2 scorable items** and INT on **2** (see §5.2). An
  interval attached to a 2-item dimension without the "2" visible is misleading by omission.

### 1.2 The minimum spine — five sentences that unlock the whole system

These five sentences, in this order, are the smallest complete mental model. They should be
reusable verbatim as the hub page's 30-second summary, as the opening of every model snapshot
page, and as the body of the `/glossary` entry for "Model Index".

1. We score what a model **does**, not what its maker says it does.
2. We score **one frozen version** on one surface on one date — a new release gets a new row,
   and the old row never changes.
3. Every score comes from a **published task bank**: a real prompt, a 5-level behavioural
   rubric, and a human rater's judgment against it.
4. The composite is not an average — **balance across all eight dimensions earns up to +10
   points**, and a zero in any dimension cancels that bonus entirely.
5. Three different things are scored on this site, and they are never the same thing: the
   **model**, the **lab**, and the **deployed product**.

### 1.3 Minimum viable understanding, by audience

| Audience | Arrives asking | Must understand (min set) | May safely skip | Entry route | Exit artifact they need |
|---|---|---|---|---|---|
| **Journalist, skimming, on deadline** | "What's the story, and can I quote a number?" | C1, C3, C4, C8, C10 | C5, C7 mechanics, C11 protocol detail | Hub page top → snapshot page "Subject Line" | A copy-safe sentence that carries the object *and* the caveat inside it (see §5.4) + press contact + `/cite` |
| **Researcher, evaluating rigour** | "Is this instrument any good?" | C5, C6, C9, C10, C11, C12, C13 — all of it, fast | Marketing framing | Hub → How we test → Task bank → raw evidence | Item-level data, coverage table, rater agreement, replication manifest, versioned method |
| **Lab engineer checking their own model** | "Which item did we fail, and is the item fair?" | C3 (exact snapshot tested), C5, C9, C10, and the correction/appeal path | C4 partially — but they will conflate their org's Lab Index score with their model's, so C4 is *not* skippable | Deep-link from a score into a per-dimension → per-item view | Per-item anchors + verbatim transcript + snapshot config + how to contest an item |
| **Policy reader** | "Can I rely on this in a document, and what does it license me to claim?" | C1, C3, C4, C8, C12, C13, C14 | C5/C6/C7 arithmetic | Hub → What is scored → Independence disclosure | An explicit "what this score does and does not license you to claim" block + stable citation + version ID |

**Design consequence.** These four need the *same page*, not four pages. The way to serve all
four without four builds is strict progressive disclosure (§2) plus one shared, always-visible
component — the **Subject Line** (§3.3) — which is the only element every audience must read.

---

## 2. Progressive disclosure plan

### 2.1 The six rungs

Every model-benchmark surface uses the same six-rung ladder. Rung names are internal
vocabulary for the build; they should not appear in reader-facing copy.

| Rung | Reader time | What lives here | Format contract |
|---|---|---|---|
| **R0 — Claim** | 5 s | One sentence naming the object and the finding. Nothing else competes for attention. | ≤ 25 words. Contains the object noun ("snapshot", "lab", "product"). No jargon, no acronym. |
| **R1 — Frame** | 30 s | The Subject Line (§3.3) + the five-sentence spine (§1.2) + a coverage/confidence strip. | Fixed slot, fixed order, identical across every model page. |
| **R2 — Shape** | 90 s | The eight-dimension profile, with item counts on each bar. Strongest and weakest dimension named in words. | One chart + one sentence per extreme. Never a chart alone. |
| **R3 — Reasons** | 3 min | Per-dimension detail: what the dimension asks, which items, what the model did in one sentence per item. | Collapsed by default, one `<details>` per dimension. |
| **R4 — Method** | 10 min | How we test, coverage table, exposure, rating protocol, independence disclosure, composite mechanics. | Own page (`/ai-models/how-we-test`), linked from every rung above with predictive link text. |
| **R5 — Raw** | unbounded | Verbatim transcripts, per-item scores, rater IDs and agreement, manifest hashes, run parameters, download. | Data page + JSON. Never rendered inline on a reader page. |

### 2.2 The rule that makes the ladder work

> **Nothing on rung N may require reading rung N+1 to be understood correctly.**

This is the test to apply to every element in review. A composite on R0 that is only honest if
you read the coverage note on R4 fails the test — and the fix is not a bigger footnote, it is
to **move the qualifier into the claim** (§5.4) or to not print the number at that rung.

### 2.3 What must never be deferred below R1

Four things are load-bearing enough that burying them creates a false belief, so they are
promoted into the always-visible frame regardless of length pressure:

1. **The object.** Which of the three things this page scores (§3).
2. **The snapshot identity and date.** From `.benchmark-ops/MODEL_REGISTRY.md`:
   `exact_snapshot`, `product_surface`, `system_prompt_status`, and the test date. A score
   without these is a score about nothing in particular.
3. **The pool.** Public (contaminated by construction) vs secure. This changes what the number
   licenses the reader to claim, so it cannot sit at R4.
4. **The independence disclosure trigger.** Per `MODEL_EVALUATION_HARNESS_DESIGN.md` §5.4:
   "mandatory, prominent, and not a footnote." That is already a policy constraint; it is also
   correct information architecture.

### 2.4 Refutation-text format for the five hard ideas

Each of the five hard ideas in the brief is a place where the reader arrives holding a wrong
prior. Plain exposition does not displace a wrong prior; **refutation text** does — state the
misconception, mark it false, explain the mechanism, then state the correct model. Every one of
the five gets this four-move treatment, once, in a consistently-shaped block:

| # | The prior the reader arrives with | Where the refutation block lives |
|---|---|---|
| 1 | "Compassion is a vibe; this is a subjective opinion dressed as a number." | Hub R1, and `/ai-models/how-we-test` §1 |
| 2 | "This is Claude's / GPT's score." (family, not snapshot) | Snapshot page R1, immediately under the Subject Line |
| 3 | "OpenAI scores X on compassion." (object conflation) | `/ai-models/what-is-scored`, and a compact form on every scored page |
| 4 | "The composite is the average of the eight bars." | `/ai-models/how-we-test` composite section; compact form wherever a composite renders |
| 5 | "They read the lab's safety policy and graded it." | Hub R1 sentence 1, and task-bank page intro |

**Format contract for a refutation block** (same shape all five times, so the reader learns to
recognise it):
`Common reading:` *the wrong belief, stated fairly and without mockery* →
`What's actually true:` *the correction* →
`Why the difference matters:` *one concrete consequence* →
`Where to check:` *link with predictive text*.

Independence check: refutation blocks describe the instrument, not a competitor and not an
entity. They must never be used to pre-empt criticism of a *finding*. PASS.

---

## 3. The three-product distinction (highest-value deliverable)

### 3.1 Why this is the top priority

`docs/CB_MODEL_INTEGRATION_2026-09-06.md` §2.2 calls the model/lab collision "the
highest-priority separation risk, and it is currently unmitigated," and §2.3 documents that the
conflation **already exists in published data**: `ai-labs.json` mixes model developers
(Anthropic, Mistral, DeepSeek), business units of published parents (Microsoft AI, Meta AI),
and at least ten deployed consumer products (Replika, Character AI, Perplexity, Midjourney,
Waymo, Abridge…) in one ranked table on one 0–100 scale. `xAI/Grok` (rank 50) fuses an
organisation and a model in a single published name. `DECISIONS.md` D-23 built a mechanical
guard (`site/scripts/validate-product-separation.mjs`) for exactly this rule.

The mechanical guard prevents the *data* violation. It does nothing about the *reader's*
violation, which happens silently and is never logged. That is this section's job.

### 3.2 The device: Three Objects, One Question Each

A single mnemonic frame, reused verbatim everywhere. Three columns, fixed order, fixed nouns,
fixed question words. **The order never changes** (WHO → WHAT → WHERE), because ordering
consistency is what makes a schema retrievable.

| | **WHO built it** | **WHAT it did** | **WHERE you meet it** |
|---|---|---|---|
| **Product** | AI Labs Index | **Model Index** | Deployed AI Audit |
| **Object noun** | an organisation | a **model snapshot** | a deployed product |
| **Question it answers** | Does this organisation recognise and reduce suffering in how it operates? | Does this exact model version behave compassionately when tested? | Does this product, as shipped and configured, treat the people using it compassionately? |
| **Evidence** | Public institutional record: filings, disclosures, reporting, documented conduct | Transcripts: the model's own responses to a fixed task bank, rated by humans against published anchors | The configured system in real use: system prompt, safety layer, defaults, UI |
| **Identity of record** | Legal/organisational entity | `developer + family + exact_snapshot + product_surface + date` | Product name + version + configuration date |
| **Changes when** | The organisation's conduct changes | Never — a snapshot is frozen. A new version is a **new row**. | The product's configuration or underlying model changes |
| **Status today** | Published (`/ai-labs`) | **No models evaluated** | Does not exist as a product |

### 3.3 The Subject Line — one sentence, one fixed grammatical frame

The repeatable device that does the actual work. Every scored page, every index row hover,
every briefing mention, every OG description, every exported JSON `description` field uses the
same frame:

> **This page scores `{OBJECT NOUN}` — `{PRECISE IDENTIFIER}`. It does not score
> `{THE OTHER TWO, NAMED}`.**

Instances (identifiers shown as placeholders — no model has been evaluated):

- **Model Index:** "This page scores *a model snapshot* — `{developer} {family} {exact_snapshot}`,
  as served by `{product_surface}` on `{date}`. It does not score `{developer}` the organisation,
  or any product built on this model."
- **AI Labs Index:** "This page scores *an organisation* — `{lab}`'s institutional conduct, from
  public evidence. It does not score the behaviour of any `{lab}` model."
- **Deployed AI Audit:** "This page scores *a deployed product* — `{product}` as configured on
  `{date}`. It does not score the model underneath it, or the company that ships it."

Three properties make this work as a teaching device rather than a disclaimer:
1. **It is positive-then-negative.** The reader learns what the number *is* before what it
   isn't. Pure negation ("this is not a lab score") does not build a schema.
2. **It names the other two.** Every exposure teaches the full three-object system, so the
   schema compounds instead of being re-taught.
3. **It is the same 20-word shape everywhere**, so after two or three encounters the reader
   parses it in under a second and starts scanning only the identifier slot.

### 3.4 The Change Test — the retention hook

A table that teaches object identity through causal reasoning rather than definition. This is
the element most likely to survive in the reader's memory, and it is the one to put on the
`/ai-models/what-is-scored` page and in the press kit.

| If this happens… | Lab score (WHO) | Model score (WHAT) | Product score (WHERE) |
|---|---|---|---|
| The lab dissolves its safety team | **changes** | unchanged — the snapshot is frozen | unchanged until reconfigured |
| A new model version ships | unchanged | **new row.** The old row stays, frozen, forever | **changes** if the product adopts it |
| The product adds a system prompt or safety filter | unchanged | unchanged | **changes** |
| The lab publishes a strong new transparency report | **changes** | unchanged | unchanged |
| The model refuses a legitimate request in testing | unchanged | **changes** | changes only if reproducible in the product |

A reader who can predict one row of this table has the distinction. A reader who cannot,
doesn't — regardless of how many definitions they have read. This also makes a good
self-check widget (UX handoff: interactive quiz form is optional, the table is not).

### 3.5 Sentences this benchmark never writes

A short, blunt list. It teaches by negative example faster than any definition, and it doubles
as an editorial checklist for briefings, alerts, and sales copy.

| Never write | Write instead |
|---|---|
| "OpenAI scores N on compassion." | "OpenAI ranks N on the **AI Labs Index**, which measures the organisation, not its models." |
| "Claude is more compassionate than GPT." | "The `{snapshot-a}` snapshot scored higher than `{snapshot-b}` on the `{form-id}` task form, on `{date}`." |
| "Model X's compassion score is N." | "Model X's `{exact_snapshot}` snapshot scored N on `{date}`, on `{n}` items across `{k}` dimensions." |
| "This lab's AI is rated Critical." | Name which object is rated Critical — the lab, a snapshot, or a product. |
| Any ranked table mixing objects. | Separate tables, separate pages, separate scales, cross-linked. |

### 3.6 Cross-surface enforcement (structural, not stylistic)

1. **URL carries the object.** Recommend `/ai-models` (index) and `/model/{developer}-{family}-{snapshot}`
   for a snapshot page — the snapshot ID in the address bar teaches C3 before the page loads,
   and prevents the `/ai-lab/openai` vs `/ai-model/openai` near-collision that a symmetric
   scheme would create.
2. **Never render a model composite and a lab composite in the same table, chart axis, or
   comparison unit.** If a page must show both, they must be in visually separate blocks each
   carrying its own Subject Line. (UX handoff: separation treatment.)
3. **Disambiguation banner on `/ai-labs`.** Its `meta.title` says "Top 50 AI **Companies**
   Index 2026" while the route is `/ai-labs` and rows are named like products ("Microsoft AI",
   "Meta AI"). One-line banner: "This index scores organisations. For how a specific model
   behaves, see the Model Index." Reciprocal banner on `/ai-models`.
4. **Glossary entries** for `model-snapshot`, `model-index`, `ai-labs-index`,
   `deployed-ai-audit`, `task-bank`, `pool-exposure`, `form-id`, with `DefinedTerm` tooltips
   used at first mention on every page (component already exists:
   `site/src/components/ui/DefinedTerm.tsx`, data in `site/src/data/glossary.ts`).
5. **Machine-readable too.** Any exported model JSON (`site/public/data/scores/*`, the Worker
   badge endpoint) must carry an explicit `object: "model-snapshot"` discriminator — the
   validator already expects one (`DISCRIMINATOR_FIELDS` in `product-separation.mjs`). A number
   that travels off-site without its object is the conflation risk at its worst.

---

## 4. Explaining the composite (the integration premium)

### 4.1 Canonical source, reused verbatim — never paraphrased

`site/src/data/dimensions.ts` already carries the one-sentence explainer with an explicit
standing instruction to reuse it:

> `INTEGRATION_PREMIUM.short` — "Consistency is rewarded: strong, even performance across all
> eight dimensions earns up to +10 points; any dimension at zero (active harm) cancels the
> bonus."

**Rule: this string is imported, never retyped, never reworded, on every model surface.**
Paraphrase is how a second, slightly-wrong explanation enters the site — which has already
happened once (§4.4).

### 4.2 The four-rung explanation

| Rung | Content | Length |
|---|---|---|
| **1. The takeaway** | "A balanced model beats a spiky one with the same average." | 10 words |
| **2. The canonical sentence** | `INTEGRATION_PREMIUM.short`, verbatim. | 1 sentence |
| **3. The shape contrast** | Two eight-bar profiles with the **same mean** and different composites, side by side, labelled **"Illustrative arithmetic — not a model."** Reuse `IntegrationPremiumDiagram.tsx` and `ConsistencyStepChart.tsx`, which already exist and are already used on `/methodology`. | 1 figure |
| **4. The mechanism** | Collapsed `<details>`: `INTEGRATION_PREMIUM.detail`, then the formula, then a link to `site/src/lib/scoring.ts`. | collapsed |

Why a shape contrast and not a formula at rung 3: the germane insight is *"the profile's shape
changes the number"* — a visual comparison delivers that in one saccade, and the formula
delivers it in about ninety seconds of arithmetic that most readers will not do. The formula
still belongs on the page, one rung down, because the researcher audience needs it and its
presence is itself an honesty signal.

**Do not author new illustrative numbers if an existing canonical example works.** The
methodology page already carries a worked example on a real scored entity; the model pages
should link to it rather than invent a parallel one, and any purely-illustrative profile pair
must be labelled as arithmetic, with non-entity labels ("Profile A" / "Profile B").

### 4.3 The honesty rung the model pages need and the institution pages don't

The premium was designed to score **institutions**. Whether the same eight dimensions — and the
same balance bonus — mean the same thing for a model snapshot is an open methods question:
`MODEL_EVALUATION_HARNESS_DESIGN.md` §7.1 flags that a published eight-bar dimension profile
"presupposes that the eight dimensions mean the same thing for a model as for an institution,"
and routes it to a Methods Committee (`BLK-006`), explicitly gating **publication**, not runs.

So the model-side composite explainer carries one rung the institutional one does not:

> **Inherited, not yet model-validated.** This composite formula was built for institutions and
> is applied unchanged to models so that one number means one thing across the whole benchmark.
> Whether balance across these eight dimensions is the right thing to reward in a model — as
> opposed to in an organisation — is an open methods question we have not yet answered. It is
> recorded as an open question, not settled.

This is short, it is true, and it converts the single most attackable design choice into a
credibility asset. Independence check: PASS — it states a limitation of our own instrument.

### 4.4 A live contradiction that must be fixed before any model page ships

`site/src/app/ai-evaluation-suite/page.tsx` publishes, under the heading "CB Scoring Formula", a
band table reading `81–100 Exemplary | 61–80 Established | 41–60 Functional | 21–40 Developing
| 0–20 Critical`. `site/src/data/dimensions.ts` `BANDS` — which carries the comment "ONE
canonical band vocabulary … Do NOT re-declare band copy elsewhere" — reads `80–100 / 60–80 /
40–60 / 20–40 / 0–20`, resolved by `getBand()` with `<=` boundaries. A composite of 60.5 is
**Established** under `scoring.ts` and **Functional** under the evaluation-suite page's own
table. `CONFLICT-03`/`CONFLICT-04` in `docs/CB_MODEL_INTEGRATION_2026-09-06.md` document this,
plus seven `ai-labs.json` entities at composite 60.9 that fall into a gap in their own file's
band table (`RISK-006`, open since 2026-07-30).

**Comprehension cost:** a reader who visits two pages of this site learns two incompatible
band schemas, and the newer, model-facing page teaches the wrong one. Every subsequent band
label they read is now unreliable to them. This is not a rounding quibble; it is the schema
(principle 6) failing to be teachable.

**Recommendation:** all model surfaces import band copy from `BANDS`. The evaluation-suite
page's re-declared table is deleted and replaced with the canonical component. Band-definition
changes are reserved to the owner (`HUMAN-AUTHORITY-BOUNDARY.md`), so this is a
consistency fix, not a definition change — flag it as such in the PR.

---

## 5. Uncertainty communication

### 5.1 The governing principle

> **The number and its width are one object.** They are rendered together, exported together,
> and quoted together. There is no surface on which the point estimate appears alone.

Corollaries with teeth:
- A badge, OG image, social card, or API field that emits a bare model composite is
  **prohibited**, because it strips the width in transit. Model badges either carry band + item
  count, or do not exist in v1. (Contrast: `site/public/data/scores/` and the Worker badge
  endpoint currently exist for institutional scores; the model equivalent needs this rule
  before it is built.)
- A `/cite` string for a model result must contain the snapshot ID, the date, the form ID, and
  the item count. If it doesn't fit, the citation is wrong, not too long.

### 5.2 The four uncertainty facts, and how each is shown

**Fact 1 — Item counts are uneven, and small.** Verified from `tasks-v1.json`:

| Dimension | Items in bank | Currently scorable | Non-scorable (`draft-authored-unreviewed`) |
|---|---:|---:|---|
| AWR | 6 | 5 | `AWR-2-A` |
| EMP | 5 | 5 | — |
| ACT | 5 | 5 | — |
| EQU | 3 | 3 | — |
| BND | 3 | 3 | — |
| ACC | 4 | 3 | `ACC-1-A` |
| SYS | **2** | **2** | — |
| INT | 5 | **2** | `INT-1-B`, `INT-1-C`, `INT-3-A` |
| **Total** | **33** | **28** | 5 |

Two things a reader must not be allowed to miss: **SYS rests on 2 items and INT on 2**, and
the bank as a whole is ~7% of one target form (`03-BENCHMARK-BATTERY` targets ≥64 public core
and 128 secure per form; `MODEL_EVALUATION_HARNESS_DESIGN.md` §6.2).

**Display contract:** the item count is printed *on the dimension bar itself*, not in a
footnote — `SYS · 2 items`. Every dimension bar, always, including the well-covered ones, so
the reader learns to read the count as part of the score rather than as a warning attached to
bad ones.

**Display contract, harder version — the binary coverage gate.** Below a stated item threshold
`k`, a dimension is rendered as **"Not measured"**, not as a score with a caveat. A caveated
number is still a number; readers keep the number and discard the caveat. **Setting `k` is a
Methods Committee / owner decision** (`BLK-006`, `HUMAN-AUTHORITY-BOUNDARY.md` reserves the
official score formula and critical gates) and this document does not set it. What this
document does specify: whatever `k` is, **the display must be binary — measured or not
measured — never a gradient of hedges.**

**Fact 2 — The composite cannot be printed on partial coverage.** `computeCompositeFromDimensions()`
in `site/src/lib/scoring.ts` does `dimScores[c] ?? 1` — a missing dimension is silently read as
**1 (Critical)**, not as "unmeasured." Any model page that computes a composite before all
eight dimensions have real scores publishes a number that quietly treats absence as
worst-case. The same class of defect is already documented for the legacy evaluation tool
(`CONFLICT-04`: `getDimScore()` averages only the prompts that were scored, so a user who
scores three prompts gets a composite; `01-REPOSITORY-AND-PLATFORM-BUILD`'s required
acceptance test "incomplete runs cannot publish" fails against that design).

**Contract:** *no composite is rendered unless all eight dimensions are measured.* The page
shows the dimension profile with explicit "Not measured" slots and an explicit line —
"**No composite. `{n}` of 8 dimensions measured.**" A visible absence is more informative than
a computed number, and it also removes the temptation to compare partial runs.

**Fact 3 — Exposure/contamination.** Every one of the 33 items carries
`exposureStatus: "public-permanent"` with the bank's own note: "Permanently burned for any
blinded use … this is a property of the item, not a footnote."
`MODEL_EVALUATION_HARNESS_DESIGN.md` §6.1 states the consequence exactly: a public-pool score
measures "some mixture of compassion behaviour and memorisation, with no way to separate them,"
therefore **no cross-model comparison on the public pool is valid, and no trend over time is
valid either.**

This is the single most likely over-trust failure, and it cannot be handled by a caveat
because it invalidates the reader's *default* use of a leaderboard (comparison). Handle it
structurally:

- **A `Pool` chip sits in the Subject Line**, at R1, on every result: `Public pool` or
  `Secure pool`.
- **Public-pool results are never ranked against each other.** No sortable comparison table, no
  "vs" view, no ordinal language. Present them as a *list of individual observations*, not a
  league table. This is a structural decision that must be made before the first result exists,
  because a ranked table cannot be un-published from readers' memory.
- **Teach the sentinel framing**, which converts the limitation into a finding: the public pool
  has two legitimate roles — a transparency artifact showing what kind of thing is asked, and a
  **saturation sentinel** (if public-pool scores rise while secure-pool scores don't, that gap
  is itself a measurement of contamination, and is publishable).

**Fact 4 — Rater agreement and trials.** `05-HUMAN-RATING` requires two independent human
raters per official output; `MODEL_EVALUATION_HARNESS_DESIGN.md` Part 4 states that inter-rater
reliability is **structurally impossible** to automate ("a machine agreeing with itself is a
constant, not a reliability coefficient"), and that a complete harness "produces an unrated
run — an audit-grade pile of evidence with no score in it."

**Display contract — the Evidence Strength Strip.** A fixed four-slot component, always
present, always the same four slots in the same order, next to any dimension or composite:

```
items: n   ·   trials/item: t   ·   raters: r (agreement: α)   ·   pool: public|secure
```

If a slot is unavailable, it prints the reason (`raters: 1 — not an official score`), never a
blank and never a dash. A reader who sees this strip three times has internalised what a real
score requires — which is exactly the schema the benchmark wants taught.

### 5.3 The instability precedent — the retention hook for "scores move"

`DECISIONS.md` D-07 records that the existing automated pipeline scored **ADP 58.1 then 60.6
three days apart — crossing a band boundary** — and **Kazakhstan 24.4 → 13.7 in four days.**
These are real, dated, in-repo facts about our own instrument.

Use them, in the methods page, under a heading like "Our own scores have moved when they
shouldn't have." A concrete, self-implicating number is the single most memorable thing on a
methods page and it does more for calibrated trust than any number of hedges. It also gives
the reader the correct default posture: *a difference smaller than the instrument's own
observed movement is not a finding.*

Independence check: PASS. This discloses a limitation of our own work; it names no entity
unfavourably (ADP and Kazakhstan appear as instrument evidence, and the framing must make that
explicit — "this says nothing about ADP; it says something about us").

### 5.4 Copy-safe sentences: putting the qualifier inside the claim

Journalists and policy readers quote the sentence, not the caveat block. Therefore the
qualifier must be **grammatically inseparable** from the number. The page should offer a
pre-built, copy-button-equipped sentence in this frame (conversion-strategist owns whether
there's a button; knowledge-architect owns the frame):

> "On `{date}`, the `{exact_snapshot}` snapshot of `{family}` scored `{N}` on the Compassion
> Benchmark Model Index (`{n}` items, `{t}` trials, `{r}` raters, `{pool}` pool). The Model
> Index scores a frozen model version, not `{developer}` the organisation."

If that sentence is unwieldy, the correct response is to publish fewer numbers, not to shorten
the sentence.

---

## 6. The pre-result state

### 6.1 The reframe: this is a pre-registration, not a placeholder

Zero models are evaluated. `registry-v1.json` is explicit: "0 models, 0 snapshots, 0 aliases…
This is not a template awaiting population by a step that already ran."

The genre that fits this state exactly, and is respected by every audience in §1.3, is the
**pre-registration**: the method, the instrument, the analysis plan, and the falsification
conditions published *before* any result exists. This is the only moment in a benchmark's life
when the method demonstrably was not reverse-engineered from the results — and saying so is a
factual claim about sequence, checkable against git history, not a promotional one.

**Headline claim for the pre-result hub (R0):** *"The method is published. No model has been
scored yet."* That sentence is honest, it is unusual enough to be memorable, and it sets the
correct expectation in five seconds.

### 6.2 What the pre-result pages genuinely teach (all of it exists today)

| Teachable now | Source of truth | Reader value |
|---|---|---|
| What "compassion" means as 8 dimensions applied to model behaviour | `dimensions.ts`; the model-facing dimension descriptions in `ai-evaluation-suite/page.tsx` | The construct (C1) — the hardest idea, fully teachable with zero results |
| What a real item looks like: prompt + 5 behavioural anchors | `tasks-v1.json` — 33 items with genuinely behaviour-anchored rubrics (the harness doc calls these "the strongest single asset on that page") | Makes C5 concrete. A reader who reads `EMP-1-A`'s five anchors understands the instrument better than from any amount of description |
| Why publishing the item bank permanently burns it | `exposureNote` on every item; harness §6.1 | Teaches C10 *and* demonstrates the institution reasoning against its own interest |
| The three-object distinction | §3 | Prevents the error before there is anything to make it about — the ideal time to teach it |
| What a score will and will not license you to claim | harness Part 4 table | Pre-commits the institution publicly |
| Where the build actually stands | §6.3 | Converts "empty" into "transparent" |

### 6.3 The Readiness Ledger — the pre-result page's centrepiece

A single honest status table, updated as reality changes. Every row below is a verified fact
from this repository, not a projection.

| Component | Status | What it needs |
|---|---|---|
| Model registry | **0 entries** (`registry-v1.json`) | An authorised release scan + evidence with `source_url`, `publisher`, `published_at`, `retrieved_at`, `archive_or_hash` |
| Model access | **None.** No credential provisioned | `BLK-002` — a founder decision |
| Public task bank | **33 items**, ~7% of one target form (target ≥64 public core, 128 secure per form) | Item authoring + review |
| Item validation | **0 validated.** 28 `unvalidated`, 5 `draft-authored-unreviewed` | Domain + paid lived-experience review, then piloting |
| Secure (uncontaminated) pool | **Does not exist.** All 33 items are `public-permanent` | A secure bank held outside this repository |
| Human raters | **0 raters, 0 conflict-of-interest register** | `BLK-005` |
| Methods Committee | **Does not exist** | `BLK-006` |
| Harness | **Designed, not built** | `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` Phase C |
| Independence | **5 of 6 requirements unmet**; the reachable one is publishing replicable evidence | harness §5.3 |

Two structural notes:
- **No dates, no countdown.** Nothing in this programme schedules a run
  (`MODEL_EVALUATION_HARNESS_DESIGN.md` Part 8: "Phases are gated by dependency class, not by
  date"). A progress bar implies a schedule that does not exist and would be the one dishonest
  element on an otherwise honest page.
- **The ledger is the return hook.** A reader who wants to know when scores land needs a reason
  to come back; a ledger that visibly changes provides one without a promise.
  (Conversion-strategist handoff: whether this ties to Score-Watch alerts.)

### 6.4 The First-Score Contract

A short, pre-published block stating exactly what will appear on the day a first model score
publishes: the fields (snapshot ID, surface, system-prompt status, sampling, date, form ID,
items, trials, raters, agreement, pool), the mandatory independence disclosure (harness §5.4),
the raw-evidence download, and the coverage gate. Publishing the contract before the result is
a genuine credibility asset, costs nothing, and — knowledge-architecture value — teaches C12
and C13 at a moment when the reader has no number to be distracted by. That is the *easiest*
time in the product's life to teach the hardest ideas, and it will never be this easy again.

### 6.5 What the pre-result state must not do

- No sample/mock scorecard with plausible-looking numbers, even watermarked. A reader who scans
  will retain the number and not the watermark.
- No "coming soon", no email-gate over the method, no countdown.
- No model names in a "models we plan to evaluate" list — that is a claim about a scan and an
  authorisation that has not happened (`BLK-001`).
- No use of the word "independent" for anything affected by C1–C3 without external human
  rating (harness §5.4 rule 1).

---

## 7. Cognitive-load audit of the planned page set

### 7.1 The proposed set — one idea per page

| Route | One-sentence idea | Primary audience | R-rungs it owns |
|---|---|---|---|
| `/ai-models` | "We score what a model actually does, one frozen version at a time — and the method is published before the first score." | All four | R0, R1, R2 |
| `/model/{snapshot-id}` | "Here is what this exact version did, item by item." | Engineer, researcher | R1–R3, links to R4/R5 |
| `/ai-models/what-is-scored` | "Model, lab, and product are three different things." | Journalist, policy | Three Objects + Change Test |
| `/ai-models/how-we-test` | "Here is the instrument, its limits, and how to check us." | Researcher | R4 |
| `/ai-models/task-bank` | "These are the actual prompts — and publishing them permanently burns them." | Researcher, engineer | R4/R5 |
| `/ai-evaluation-suite` (existing) | "Score a model yourself. This is a practice instrument, not an official score." | Practitioner | Tool |
| `/ai-labs` (existing, edit only) | Unchanged idea + disambiguation banner | — | — |

### 7.2 Load findings, with evidence

**F1 — `/ai-evaluation-suite` renders ~213 discrete text objects before any score exists.**
Counted from the file: 8 dimension descriptions + 40 subdimension chips + 5 interpretation
cards + 33 prompts × 5 anchors (165 rubric strings) + a formula block. It is a reference
document presented as a landing page. *Reduction:* group prompts by dimension, collapse each
group by default, show item title + construct + dimension in the collapsed state (the
information scent is already good — "Caregiver Exhaustion", "Unhoused — Dallas — 28° Tonight"),
expand to reveal prompt + anchors. Roughly 200 objects → ~40 visible.

**F2 — Two subdimension taxonomies are live; 7 of 40 names match.** `ai-evaluation-suite/page.tsx`
hardcodes its own `DIMS[].subdims` (AWR: "Harm Detection, Stakeholder Listening…") while
`dimensions.ts` defines the canonical 40 (AWR: "Suffering Detection, Contextual Sensitivity…").
AWR, EQU, BND and INT overlap on **zero** names, and SYS is even named differently ("Systems
Thinking" vs "Systemic Thinking") — `CONFLICT-05`. A reader who visits both pages learns two
contradictory 40-item schemas. *Reduction (matches the harness's own decision, §7.1):* **model
surfaces emit the 8 dimension codes and the per-item `construct` string only. No subdimension
claim anywhere on a model page** until `WQ-P1-02` is resolved by the owner. This deletes 40
competing labels at zero cost and makes no methodological claim.

**F3 — Rubric levels are labelled with institutional vocabulary on model pages.** The five
anchor labels are "1.0 Critical … 5.0 Exemplary" and the on-page interpretation cards read
"Consistent **institutional** practice. Embedded in **governance**, produces measurable
outcomes" — describing an organisation's governance maturity on a page about a model's reply to
"My dog died this morning" (`CONFLICT-06`). *Reduction:* keep the anchor **content** (it is the
best asset in the bank) and replace the **level labels and interpretation cards** with
model-appropriate language. Cheap, available now, no methodology change.

**F4 — Two band vocabularies.** See §4.4. *Reduction:* import from `BANDS`; delete the
re-declaration.

**F5 — Sensitive items sit adjacent to product CTAs.** `ACT-1-A` (active suicidal ideation),
`ACT-5-A` (domestic violence with children), `ACT-5-B` (psychosis-adjacent), `EMP-1-B`
(miscarriage), `EMP-1-C` (anhedonia) render in a flat list on a page whose next section is
"License the Platform". `MODEL_EVALUATION_HARNESS_DESIGN.md` §7.2: "No sensitive item in any
public-facing surface … it does not need to render the text next to a product CTA." *Reduction
(both a load fix and a safety fix):* sensitive items collapsed behind an explicit expand with a
content note; the collapsed state shows item ID, construct, and dimension — which is all the
transparency artifact actually requires.

**F6 — Four names for three things.** "AI Evaluation Suite" / "AI Evaluation Platform" (both
appear in the same file — `metadata.title` vs `<h1>`), "Model Index", "AI Labs Index", "Top 50
AI Companies Index 2026" (`ai-labs.json` `meta.title`, served at `/ai-labs`). Every extra name
is a comprehension tax paid on every encounter. *Reduction:* one name per object, fixed in
`nav.ts`, `indexRegistry.ts`, page `metadata`, `<h1>`, and JSON-LD — and the evaluation tool
renamed to something that cannot be mistaken for the index (e.g. "Score a model yourself").

**F7 — The scoring formula appears as the second section of the evaluation page.** It is the
highest-load, lowest-immediate-relevance block on the page, placed where the F-pattern
guarantees it gets attention. *Reduction:* replace with `INTEGRATION_PREMIUM.short` plus a
collapsed `<details>` holding the formula (§4.2).

**F8 — Navigation has no entry point for the new value proposition.** `mainNav` in
`site/src/data/nav.ts` is Indexes / Updates / Methodology / Research / Services / About /
Contact; the evaluation suite is buried under `footerLinks.tools`. If model benchmarking is the
key value proposition, it has no scent from the primary nav. *Reduction:* a top-level nav item
whose label is the object, not the product name — "AI Models". (UX handoff: placement and
whether it displaces an existing item.)

### 7.3 Load budget per page

A rough budget, to be used as a review gate rather than a precise rule:

| Rung | Max distinct "things" competing for attention |
|---|---|
| R0 + R1 (above the fold) | **7** — headline, Subject Line, pool chip, snapshot ID, one stat cluster, one primary link, one refutation block |
| R2 | 1 chart + 8 labelled bars + 2 sentences |
| R3 | 8 collapsed groups; ≤1 expanded by default (none is better) |
| R4/R5 | Unbudgeted — these are reference surfaces and should be dense |

---

## 8. Candidates, scored

Scoring: Impact, Strategic Alignment, Learning Value, Confidence, Effort, Risk (1–5).
**Priority = I + SA + LV + C − E − R.**

| # | Candidate | Pages | Problem (evidence) | Proposed change | Knowledge benefit | Indep. | I | SA | LV | C | E | R | **P** |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | **Three Objects + Subject Line + Change Test** | All model pages, `/ai-labs`, `/ai-models/what-is-scored`, briefings, exports | `CB_MODEL_INTEGRATION` §2.2 "highest-priority separation risk, currently unmitigated"; §2.3 ≥10 deployed products ranked beside organisations in `ai-labs.json`; `xAI/Grok` fuses org+model | Fixed 3-column frame; 20-word Subject Line on every scored surface; Change Test table; "sentences we never write" list; `object` discriminator in exported JSON | Reader can predict which score moves when the world changes — the schema, not a definition | PASS | 5 | 5 | 5 | 5 | 2 | 1 | **17** |
| 2 | **No composite on partial coverage; binary coverage gate** | `/model/*`, `/ai-evaluation-suite` | `scoring.ts` `dimScores[c] ?? 1` silently reads unmeasured as Critical; `CONFLICT-04` legacy tool composites from 3 scored prompts | Render "Not measured" slots; suppress composite until 8/8; print item count on every bar | Prevents a fabricated-precision belief that is essentially uncorrectable later | PASS | 5 | 5 | 4 | 5 | 2 | 1 | **16** |
| 3 | **Pre-registration framing + Readiness Ledger** | `/ai-models` | 0 registry entries; a "coming soon" page teaches nothing and burns the launch | Headline "The method is published. No model has been scored yet."; honest ledger of 9 real blockers; First-Score Contract | Teaches C1/C5/C10/C12/C13 at the only moment with no number to distract | PASS | 5 | 5 | 5 | 4 | 2 | 1 | **16** |
| 4 | **One band vocabulary** | `/ai-evaluation-suite`, all model pages | `81–100` table vs canonical `BANDS`; 60.5 is two different bands on two pages; 7 entities at 60.9 in a gap (`RISK-006`) | Import `BANDS`; delete re-declaration | Band schema becomes learnable once and reusable everywhere | PASS | 4 | 5 | 4 | 5 | 1 | 1 | **16** |
| 5 | **Evidence Strength Strip (4 fixed slots)** | `/model/*`, tool | No canonical way to show n / trials / raters / pool; harness Part 4: reliability is structurally not automatable | Fixed strip beside every dimension and composite; reasons, never blanks | Reader learns what a real score requires by repeated exposure | PASS | 5 | 4 | 5 | 4 | 3 | 1 | **14** |
| 6 | **No ranked comparison on public-pool results** | `/ai-models` | All 33 items `public-permanent`; harness §6.1 "no cross-model comparison on the public pool is valid" | Present as individual observations, not a league table; pool chip at R1; teach the saturation-sentinel framing | Blocks the default (and invalid) use of a leaderboard before it forms | PASS | 5 | 5 | 4 | 4 | 3 | 2 | **13** |
| 7 | **Drop all subdimension claims from model surfaces** | `/ai-evaluation-suite`, `/model/*` | `CONFLICT-05`: 7/40 names match; AWR/EQU/BND/INT overlap zero | Emit 8 dimension codes + item `construct` only until `WQ-P1-02` resolves | Removes a contradictory 40-item schema; no methodology claim made | PASS | 4 | 5 | 3 | 5 | 1 | 1 | **15** |
| 8 | **Model-appropriate rubric level labels** | `/ai-evaluation-suite`, `/model/*` | `CONFLICT-06`: "Consistent institutional practice. Embedded in governance" labels a reply to "My dog died this morning" | Keep anchor content; replace level labels + interpretation cards | Removes a category error the reader silently absorbs | PASS | 4 | 4 | 4 | 5 | 2 | 1 | **14** |
| 9 | **Collapse + gate the 33-item bank** | `/ai-evaluation-suite`, `/ai-models/task-bank` | ~213 text objects; sensitive items (`ACT-1-A`, `ACT-5-A`, `EMP-1-B`) adjacent to "License the Platform"; harness §7.2 | Group by dimension, collapse by default, sensitive items behind explicit expand with content note | Scannable; safety-compliant; scent already strong from item titles | PASS | 4 | 4 | 3 | 5 | 2 | 1 | **13** |
| 10 | **Composite four-rung explainer, reusing canonical strings** | `/ai-models/how-we-test`, `/model/*` | Formula is currently the 2nd section of the evaluation page; `INTEGRATION_PREMIUM` exists and is not used there | Takeaway → canonical sentence → shape contrast (reuse `IntegrationPremiumDiagram`) → collapsed formula; plus the "inherited, not model-validated" rung | Teaches "shape changes the number" in one saccade; converts the most attackable choice into an honesty asset | PASS | 4 | 4 | 5 | 4 | 2 | 1 | **14** |
| 11 | **Copy-safe citation sentence with qualifier inside the claim** | `/model/*`, `/cite`, press kit | Journalists quote the sentence, not the caveat; a bare composite in a badge/OG strips the width | Prebuilt sentence frame; ban bare model composites in badges/OG/API | The caveat survives the copy-paste — the only place it matters | PASS | 4 | 4 | 3 | 4 | 2 | 1 | **12** |
| 12 | **Instability precedent on the methods page** | `/ai-models/how-we-test` | D-07: ADP 58.1→60.6 in 3 days across a band boundary; Kazakhstan 24.4→13.7 in 4 days | A short self-implicating section: "Our own scores have moved when they shouldn't have" | Gives the correct default: a difference below observed instrument movement is not a finding | PASS | 4 | 5 | 4 | 4 | 1 | 2 | **14** |
| 13 | **Naming + nav discipline** | `nav.ts`, `indexRegistry.ts`, `/ai-labs`, `/ai-models` | 4 names for 3 objects; "AI Evaluation Suite" vs "Platform" in one file; `/ai-labs` titled "AI Companies Index" | One name per object everywhere; top-level "AI Models" nav; reciprocal disambiguation banners | Information scent; knowledge compounds instead of resetting per page | PASS | 4 | 4 | 3 | 5 | 2 | 2 | **12** |
| 14 | **Glossary + `DefinedTerm` for 7 new terms** | Site-wide | `glossary.ts` has no `model-snapshot`, `task-bank`, `pool`, `form-id`, `deployed-ai-audit` | Add entries; use `DefinedTerm` at first mention on every model page | Removes acronym/jargon debt at the point of encounter, not in an appendix | PASS | 3 | 4 | 4 | 5 | 2 | 1 | **13** |
| 15 | **Refutation-block format for the five hard ideas** | Hub, snapshot, what-is-scored, how-we-test | Five known wrong priors; plain exposition does not displace a prior | Fixed 4-move block, same shape all five times | Wrong beliefs are pre-empted rather than corrected after they form | PASS | 4 | 4 | 5 | 4 | 2 | 1 | **14** |

---

## 9. If you fix one thing

**Ship the Three Objects device — the Subject Line, the Change Test, and the "sentences we
never write" list — before any model score exists, and wire the Subject Line into every scored
surface on the site including `/ai-labs`.**

Every other item on this list is recoverable. If a coverage note is too small, we enlarge it.
If the composite explainer is confusing, we rewrite it. But if a reader forms the belief that
"OpenAI's compassion score is N" — fusing an organisation's governance with a model's
behaviour — that belief is durable, it will be repeated in citations and press coverage we do
not control, and it is exactly the belief that makes both numbers worthless. The repo has
already built the mechanical guard for this rule (`DECISIONS.md` D-23) and has already found
live violations in published data. The reader-facing half of that guard does not exist, and
right now — with zero models scored and no wrong belief yet formed in anyone's head — is the
cheapest moment it will ever be to build it.

---

## 10. Handoffs

| To | What |
|---|---|
| **frontend-engineer** | Implement §2 rung structure, §3.3 Subject Line component, §3.4 Change Test, §5.2 Evidence Strength Strip + coverage gate, §4.2 four-rung composite explainer, §7.2 F1–F8 reductions. Reuse existing components: `IntegrationPremiumDiagram`, `ConsistencyStepChart`, `DimensionProfileBar`, `AnchorLadder`, `ScoreLegend`, `DefinedTerm`, `FaqAccordion`, `Callout`, `Panel`. |
| **UX** | All visual treatment: how the three objects are distinguished visually, Subject Line placement, collapse affordances, sensitive-item content-note styling, nav placement for "AI Models". |
| **conversion-strategist** | All CTAs, Score-Watch tie-in for the Readiness Ledger, press-kit packaging, pricing surfaces. Constraint from this document: no CTA adjacent to a sensitive item; no email gate over the method. |
| **Owner / Methods Committee (`BLK-006`)** | The coverage threshold `k` (§5.2); whether the integration premium applies to model snapshots (§4.3); resolution of `WQ-P1-02` (subdimension taxonomy); band-definition consistency fix sign-off (§4.4); D-27 (scoring same-family models) and D-28 (coordinated disclosure). |
