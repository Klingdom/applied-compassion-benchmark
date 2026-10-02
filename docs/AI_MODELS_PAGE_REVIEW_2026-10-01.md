# /ai-models review and improvement spec — 2026-10-01

**Author:** knowledge-architect (read-only review). **Scope:** current source on branch
`improve/2026-09-16-entity-identity`, not the live site. The live page was not fetched (no web tool was available
in this session), so every finding below is grounded in source only.

**Files reviewed:** `site/src/app/ai-models/page.tsx` (638 lines), `site/src/app/ai-models/methodology/page.tsx`
(373 lines), `site/src/components/model-benchmark/{PipelineStages,SubjectLine}.tsx`,
`site/src/lib/model-index-facts.ts`, `site/src/lib/release-watch-facts.ts`, `DECISIONS.md` D-29 (l.636–672),
D-30 (l.586–632) and the D-43 block (l.130–156), `research/model-assessments/claude-opus-5-2026-09-25.md`,
`docs/CB_MODEL_FIRST_ASSESSMENT_FOUNDER_PLAN_2026-09-20.md`, `site/scripts/test-no-stale-counts.mjs`,
`site/src/data/model-benchmark/{registry-v1,item-reviews-v1}.json`.

**How this spec is split:**
- **Part A** can ship now. It changes structure, order, wording and derivation. It does not change what the page
  says about scores.
- **Part B** is a draft section. Nothing in it may ship until the founder amends D-29.

**Notation:** `{F.x}` means `MODEL_INDEX_FACTS.x`, `{R.x}` means `RELEASE_WATCH_FACTS.x`, and `{P.x}` means the
proposed `PILOT_FACTS.x` (Part B only). Every number in the proposed copy is written as one of these placeholders.
None of them is typed.

---

## 1. Top findings (ranked by priority score)

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk. All ten pass the
independence-policy check. F6 carries a D-29 note.

| # | Finding | Imp | Strat | Learn | Conf | Eff | Risk | **Pri** |
|---|---|---|---|---|---|---|---|---|
| F1 | The first screen says "zero" four times, and that phrase recurs about 14 times across the page | 5 | 5 | 5 | 4 | 2 | 1 | **16** |
| F2 | The methodology page contradicts the index page on whether a model can be compared with an institution | 4 | 5 | 4 | 5 | 1 | 1 | **16** |
| F3 | Broken JSX nesting moves "What is wrong with this instrument" to 8th place and narrows four sections on mobile | 4 | 4 | 3 | 5 | 1 | 1 | **14** |
| F4 | The publication bar is described in five different ways, and they disagree | 5 | 5 | 5 | 4 | 3 | 2 | **14** |
| F5 | Item-status vocabulary is inconsistent: reviewed, validated, human-validated, scorable and "two reviews" are used interchangeably | 4 | 4 | 5 | 4 | 2 | 1 | **14** |
| F6 | The self-run's "100 out of 100" is the most quotable thing on the page | 4 | 5 | 3 | 4 | 1 | 2 | **13** |
| F7 | Pipeline Stage 2 says "no model API has ever been called", sitting right next to "First complete run". The pilot will make the wording misleading | 4 | 5 | 3 | 4 | 1 | 1 | **14** |
| F8 | The three-objects device only points one way: `/ai-labs` never mentions the Model Index | 3 | 5 | 4 | 4 | 1 | 1 | **14** |
| F9 | Hard-coded statements of current state get past the facts modules and the stale-count guard | 4 | 5 | 2 | 5 | 2 | 1 | **13** |
| F10 | The page is hard to scan: about 15 blocks, about 33 panels of equal weight, no jump list, three labels for one link, and an off-page answer that says "see above" | 3 | 3 | 3 | 4 | 2 | 1 | **10** |

### F1 — The first screen says "zero" four times, and that phrase recurs about 14 times across the page

**Evidence**
- In the first viewport the reader gets the banner (`page.tsx:116-122`), then the hero paragraph ("We do not know
  yet", `:131-134`), then a stat grid where `Models scored` is the first tile (`:150`), then a footnote saying "Two of
  them are zero" (`:155-158`).
- The zero-models statement then comes back at:
  - `:255` (section description)
  - `:333` and `:338` (Tier 1: "There are none")
  - `:424-426` (score history)
  - `:541` (callout)
  - `PipelineStages.tsx:67` and `:71`
  - `:594` ("Tracked releases evaluated")
  - FAQ `:35` and `:81`
- "0 of N items reviewed" is repeated at `:152`, `:377`, `:457`, `:519`, `PipelineStages.tsx:61` and FAQ `:52`.
- "The public pool is burned" appears three times: `:57-64`, `:474-479`, `:515-521`.

**Comprehension cost**
- The fact that matters most is already understood in the first second. Saying it again after that adds no
  information and takes up the space where a reader should learn why there is no score and what would change that.
- Repetition with no variation trains readers to skip. By `:541` a scanner has stopped reading any panel that
  starts with a zero.
- The first viewport never states the one non-obvious fact: a lab's governance score is not a model's score.

**Fix:** Part A items A2 and A4. **Impact 5, Effort 2.**

### F2 — The methodology page contradicts the index page on whether a model can be compared with an institution

**Evidence**
- `methodology/page.tsx:209` says the shared framework "is what lets a model be compared against an institution on
  one scale".
- `methodology/page.tsx:308` says "a model score means the same thing a country score means".
- `page.tsx:96-100` (FAQ, also emitted as JSON-LD) says the opposite: "never merged into one number, and a strong
  score on one says nothing about the other".
- `page.tsx:500-501` agrees with the FAQ: "the arithmetic is identical even though the subject and the instrument
  are not".

**Comprehension cost**
- A journalist who reads both pages sees "model scored 62, about the same as country X" licensed by the methodology
  page. That is exactly the conflation the three-objects device exists to prevent.
- The contradiction is also served to answer engines through the methodology page's metadata context.

**Fix:** Part A item A5. **Impact 4, Effort 1.**

### F3 — Broken JSX nesting moves "What is wrong with this instrument" to 8th place and narrows four sections on mobile

**Evidence**
- `page.tsx:245-247` opens `<section><Container>` under the comment "Disclosed limits — headline content, not
  footnotes".
- Four complete sections are then rendered inside that container: First complete run `:251-318`, Two tiers
  `:324-363`, Who has checked `:367-410`, and Score history `:414-447`.
- Only after them does the limits section's own heading appear (`:449`). It closes at `:482-483`.

**Effects**
1. The section the code comment calls headline content renders 8th, after the governance-design sections.
2. The four inner sections get a nested `Container` (`Container.tsx:11`, `w-[min(1280px,calc(100%-32px))]`). On a
   390px phone their text column is 32px narrower than the rest of the page, which makes for visibly ragged edges
   while scrolling.
3. Vertical padding doubles (`py-[30px]` inside `py-[30px]`).
4. A `<section>` nested inside a `<section>` with no heading of its own weakens the document outline for assistive
   technology and crawlers.

**Fix:** Part A item A1. **Impact 4, Effort 1.**

### F4 — The publication bar is described in five different ways, and they disagree

**Evidence.** These are the conditions a model result must meet before it publishes:

| Source | Conditions stated |
|---|---|
| `page.tsx:336-338` (Tier 1) | unpublished item pool · **cross-model judging** · human-validated items |
| `page.tsx:539-541` (callout) and `PipelineStages.tsx:70-71` | complete · reproducible from frozen snapshot · traceable to bank version |
| `page.tsx:603-605` (release watch) | frozen snapshot · **two independent human raters** · adjudication |
| `methodology/page.tsx:139, 182` | rated by a **human rater** |
| `DECISIONS.md:149-150` (D-43) | human-validated items · unpublished pool · **cross-model judging** · rubric defects D-43/D-44 resolved |
| Founder plan §2, Track B | two blinded raters + adjudication · bank freeze · rating panel · method authority (F8) |

**Comprehension cost**
- The question readers ask most often is "what has to happen before you score a model?". Nowhere on the page is
  there one answer they could repeat.
- A lab reading `:337` would conclude that machine judging is the bar. A reader of `:604` would conclude human
  raters are. Those are different institutions making different claims.
- This matters now more than before: the pilot will satisfy "cross-model judging" in a weak form (same family), so
  an ambiguous bar invites the claim "the pilot meets Tier 1".

**Fix:** Part A item A3. It needs the method owner to reconcile the list. Do not invent a merged list.
**Impact 5, Effort 3.**

### F5 — Item-status vocabulary is inconsistent

**Evidence**
- The same `F.reviewedItemCount` is labelled three ways: "Items human-validated" (`page.tsx:152`), "completed human
  review" (`:457`), and "reviewed by a human" (`:519`).
- A different measure, `F.itemsWithTwoReviews`, is shown at `:377`, a few sections away.
- The two come from different stores:
  - `reviewedItemCount` reads `validationStatus` in `tasks-v1.json` (`model-index-facts.ts:44-45,80`).
  - `itemsWithTwoReviews` reads the review log (`:130-132`).
  - The review log's own note says status "is DERIVED from its reviews, never stored separately"
    (`item-reviews-v1.json:9`). The two stores can therefore disagree, and the page would print both.
- The facts module contradicts itself:
  - `:40` says an item "counts as SCORABLE only once a human has reviewed it", and the function `isScorable` counts
    *reviewed* items.
  - `scorableItemCount` (`:98`) counts *non-draft* items.
  - So `F.scorableItemCount` is not the count of `isScorable` items.
- Other jargon that is used before it is defined: anchor, pool, burned, snapshot, composite, band, contamination
  probe, forced-choice. At `:279`, "Three judges with no access to the task bank" uses *judge* for what were
  probe-test subjects, which collides with the judge role.

**Comprehension cost**
- Readers cannot form the schema "draft, then scorable, then validated" because the words keep moving.
- An answer engine that pulls "Items human-validated: 0" next to "items with at least one review: N" will report a
  contradiction.

**Fix:** Part A item A8. **Impact 4, Effort 2.**

### F6 — The self-run's "100 out of 100" is the most quotable thing on the page

**Evidence**
- `page.tsx:259-266`: the panel title is "A self-run reached the maximum score", followed by
  `<span className="text-text font-medium">100 out of 100</span>`.
- D-29 (`DECISIONS.md:657`): "No model composite or band, anywhere, in any form."
- The subject can be identified from the description ("the model that had written most of the task bank"), and the
  research artifact is filed as `claude-opus-5-2026-09-25.md`.
- The artifact itself still says "The composite formula rewards flatness twice" (§1 and §7.3). The page now refutes
  that at `:287-302`, and the artifact has no addendum pointing to the correction. Compare the contamination
  addendum it does have (l.195-217).

**Comprehension cost and risk**
- Someone scanning the page takes away "AI model scored 100/100 on compassion benchmark", because the invalidity
  framing comes after the number.
- This is the most screenshot-able line on the page, and it is vendor-favourable. Independence is not breached,
  since the page states the result is invalid, but the order and emphasis work against the policy.

**Fix:** Part A item A7. Whether the number should appear at all under D-29 is a **founder call**. This spec
recommends keeping it but moving it below the invalidity verdict and removing the emphasis. **Impact 4, Effort 1.**

### F7 — Pipeline Stage 2 will become misleading when the pilot runs

**Evidence**
- `PipelineStages.tsx:47-52` gives Evaluate a status of "Blocked" with "no model API has ever been called from this
  programme".
- Two sections later, `page.tsx:253-256` says "the Evaluation Suite ran end to end for the first time".
- Once the pilot runs, Haiku, Sonnet, Opus and Fable will have produced and judged responses as Claude Code
  subagents. The sentence would still be literally true (no provider API was called), but readers would take it to
  mean no model has been run, and that would be false.

**Comprehension cost**
- Today the reader sees "Blocked" and then "ran end to end" and cannot reconcile the two.
- After the pilot, the sentence becomes a technically-true claim that misleads. That is the defect class this
  institution scores others down for.

**Fix:** Part A item A9. **Impact 4, Effort 1.**

### F8 — The three-objects device only points one way

**Evidence**
- A grep of `site/src/app/ai-labs/` for "Model Index", "ai-models" or "frozen model" returns **no matches**.
- On `/ai-models` the device appears twice: `SubjectLine` (`page.tsx:136`) and the full section (`:178-243`).
- The code comment at `:177` calls the full section "the highest-value content on this page", yet it renders 4th,
  below the stat grid and the pipeline.

**Comprehension cost**
- Conflation usually starts on `/ai-labs`: a reader sees a lab's score and assumes it describes the lab's chatbot.
  That reader gets no pointer to the distinction.
- On `/ai-models` the distinction is taught after the reader has already absorbed pipeline mechanics.

**Fix:** Part A items A4 and A12. **Impact 3, Effort 1.**

### F9 — Hard-coded statements of current state get past the facts modules and the guard

**Evidence**
- `page.tsx:293` reads `<span …>1,325</span> scored entities`. This is a live catalogue count typed by hand.
  `test-no-stale-counts.mjs:56` requires the noun to follow the number directly (`1,3xx\s+entities`), and the
  `</span>` plus the word "scored" between them defeats the regex. That is a guard bypass.
- These state claims are true today but are typed rather than derived, so they will go stale silently:
  - `:22` (title "No Model Scored Yet", not conditional, unlike the description at `:26`)
  - `:156` ("Two of them are zero")
  - `:338` ("There are none")
  - `:426` ("so both are zero")
  - `:455` (heading "No item has been validated")
  - `methodology/page.tsx:195` ("no human has reviewed it yet, which is true of all {F.itemCount}")
  - `methodology/page.tsx:285` ("none of them resting on a single item", while `F.singleItemSubdimensions` exists
    and is not used)
- Typed framework counts: FAQ `page.tsx:96` ("the same 8 dimensions", "five-band"), `methodology/page.tsx:56`
  ("all eight"), `:253` ("8 dimensions and their 40 subdimensions") and `:341` ("eight times").
- Dated run facts typed into copy: `:255` (83 prompts, 249 responses), `:271` (0.22 / 0.6), `:276` (p = 0.02%),
  `:280` (4 of 18) and `:299` (4.63). These describe a dated run, like the allowlisted media report, so they are
  acceptable as dated quotations, but they should be marked as such. `:293` is not acceptable.

**Fix:** Part A item A6. **Impact 4, Effort 2.**

### F10 — The page is hard to scan

**Evidence**
- About 15 blocks before the end, including 12 `SectionHead` H2s and about 33 panels of identical visual weight.
- There is no jump list. `SectionHead.tsx` takes no `id`, and only release watch has an anchor (`:560`).
- One destination has three labels: "Read the method" (`:140`), "How scoring works" (`:528`) and "How the scoring
  works" (`:546`).
- "Run it yourself" appears at `:315` and again at `:526`.
- Stage 1 says "see release watch below" (`PipelineStages.tsx:42`), but release watch is eight sections further
  down (`:560`).
- FAQ `:81` says "see the pipeline above", and that answer is emitted as `FaqJsonLd` (`:113`), where "above" means
  nothing to an answer engine.
- The duty-of-care note (`:620-629`) sits at the very bottom, after release watch. A distressed reader who searched
  "which AI is most compassionate" would have to scroll the whole page to reach it.

**Fix:** Part A items A10, A11 and A13. **Impact 3, Effort 2.**

---

## 2. Part A — shippable now (no change to score claims)

Implement in this order. Items A1 to A6 are independent and small. A3 needs one input from the method owner first.
All new copy uses facts fields. Visual styling goes to UX, and CTAs go to conversion-strategist; both are flagged
where relevant.

### Target reading order for `/ai-models`

| # | Block | Reader question it answers | Source today |
|---|---|---|---|
| 0 | Banner (shortened) | "Is there a ranking?" | `:116-122` |
| 1 | Hero: H1, answer lede, SubjectLine, one CTA pair | "What is this page?" | `:124-145` |
| 2 | **Key facts** (citable definition list) + "What you can cite" + one-line crisis note | "What exactly can I say?" | replaces `:147-160` |
| 3 | On-this-page jump list | "Where is the part I need?" | new (anchors only, no route) |
| 4 | Three objects + change test | "Is this the same as the AI Labs score?" | `:178-243` (moved up) |
| 5 | What has to happen before a score: pipeline + **one publication bar** | "Why no score, and what would change that?" | `:167-175` + `:534-552` (callout merged in) |
| 6 | Release watch (Stage 1 in detail) | "Have you even looked at model X?" | `:560-617` (moved up, next to the pipeline) |
| 7 | What is wrong with this instrument today + who has checked it | "Should I trust the instrument?" | `:449-482` + `:367-410` |
| 8 | Runs so far (today: the first complete run; later: Part B) | "Has anything been run?" | `:251-318` |
| 9 | How results will be recorded (two tiers + score history) | "How will scores be kept honest?" | `:324-447` (condensed) |
| 10 | Run it yourself | "Can I try it?" | `:488-532` |
| 11 | Duty of care (full) + FAQ | Long tail | `:620-635` |

### A1 — Fix the section nesting (F3)

**Targets:** `page.tsx:245-251`, `:447-449`, `:482-483`.

1. Delete the orphan opener at `:246-247` (`<section className="py-[30px]"><Container>`).
2. Wrap the block at `:449-481` (SectionHead "What is wrong with this instrument today" and its three panels) in its
   own `<section id="limits" className="py-[30px]"><Container>…</Container></section>`.
3. Move that section to reading-order position 7.

**Acceptance:**
- No `<section>` is a descendant of another `<section>`.
- Every top-level `<section>` has exactly one `Container` child.
- Rendered output is otherwise byte-identical apart from order.

### A2 — Answer-first top: one statement of zero, then the key facts (F1)

**Targets:** `page.tsx:116-122` (banner), `:130-134` (lede), `:147-160` (stat grid and footnote).

**Banner (`:116-122`).** Replace with the line below. Render it only when `F.evaluatedModelCount === 0`. Otherwise
render nothing; the post-amendment wording is decided in Part B.

> **The method is published. No model has been scored yet.** {F.itemCount} test items, published before any result.

**Hero lede (`:130-134`).** Replace with the following, under the same zero condition:

> There is no compassion ranking of AI models from Compassion Benchmark, because no model has been scored. What
> exists is the instrument: {F.itemCount} published test items across {F.dimensionCount} dimensions, a published
> scoring method, and published conditions under which the method should be judged to have failed. This page shows
> what has to happen before a score can publish, and how far each step has got.

**Key facts.** Replace the stat grid and footnote (`:147-160`) with a section `id="key-facts"` containing one
`<dl>`. A definition list is chosen over stat tiles because each row then makes a complete, quotable claim and
carries its own definition. A tile reading "0 / Models scored" makes neither.

| Term (`<dt>`) | Value and definition (`<dd>`) |
|---|---|
| Models with an official score | {F.evaluatedModelCount}. A score here means an official Compassion Benchmark evaluation of a pinned model snapshot. |
| Published test items | {F.itemCount}. Each one is a situation plus a five-level rubric. All are public, so none can be used for blinded scoring. |
| Items with two independent human reviews | {F.itemsWithTwoReviews} of {F.itemCount}. An item needs two before it counts as validated. |
| Dimensions / subdimensions covered | {F.dimensionCount} / {F.subdimensionsCovered} of {F.subdimensionCount}. |
| Release scans completed | {R.completedScanCount}. See *Release watch* (anchor link). |

Conditions on the table:
- Use `{F.itemsWithTwoReviews}`, not `{F.reviewedItemCount}`. See A8.
- If A8's reconciliation keeps `reviewedItemCount`, use exactly one of the two everywhere.

**"What you can cite" block.** Directly under the `<dl>`, a short block for journalists and answer engines:

> **Accurate to say:** "Compassion Benchmark has published a method for scoring AI models for compassion but has
> scored {F.evaluatedModelCount} models." · "Its AI Labs Index scores organisations, not models."
> **Not accurate:** any ranking of AI models attributed to Compassion Benchmark; any model "score" from this site;
> using an AI lab's index score as a score for that lab's models.

**Crisis one-liner.** Add this under the cite block. It is the same message as `:623-626`, which stays in full near
the bottom:

> Not guidance on which AI to talk to in a crisis. If you need support now, contact a local emergency service or
> crisis line.

**Removals:**
- Delete the "Two of them are zero" footnote (`:155-158`); it becomes redundant.
- Delete the callout "What publishes, and when" (`:534-552`); its content moves into A3.

**Net effect:** the first viewport goes from four statements of zero to one, and three non-obvious facts (the
public pool, the review state, the lab-versus-model distinction) move into the first two screens.

### A3 — One publication bar, defined once, referenced everywhere (F4)

**Blocking input:** before this item is built, the method owner (founder, per founder plan F8) must confirm the
canonical condition list. The sources conflict on human raters versus cross-model judging (see the F4 table). Do
not merge the lists by inference.

**Data.** Add `PUBLICATION_BAR` to `site/src/lib/model-index-facts.ts`. It is an ordered array of
`{ id, requirement, met: boolean, evidence: string }`.
- `met` is derived wherever a store exists. Examples:
  - `"items-validated"` → `F.itemsWithTwoReviews === F.itemCount` or the threshold the owner ratifies.
  - `"unpublished-pool"` → `!F.allItemsPublic`.
- Conditions with no store yet (rating panel, method authority) default to `met: false`, with evidence text naming
  the blocker (BLK-005 / BLK-006). Never default them to `true`.
- Also export `PUBLICATION_BAR_MET = PUBLICATION_BAR.filter(c => c.met).length`.

**Render.** Show the bar once, as a two-column table "Requirement | Met today?", inside the pipeline section
(`page.tsx:167-175`) with `id="publication-bar"`. Section description copy:

> A model result publishes only when every requirement below holds. Today {PUBLICATION_BAR_MET} of
> {PUBLICATION_BAR.length} do.

**References.** Replace the other four statements of the bar with a link to `#publication-bar`:
- `page.tsx:336-338` (Tier 1 text becomes "Produced by an authorised evaluation that meets every requirement in the
  publication bar.")
- `page.tsx:603-605`
- `PipelineStages.tsx:70-71`
- `methodology/page.tsx:139` and `:182`, adjusted to match whichever rater model the owner confirms

**Test.** Add assertions to `test-method-claims.mjs` (or a sibling test):
- No file under `src/app/ai-models` contains the words "raters" or "judging" outside the `PUBLICATION_BAR`
  render.
- The rendered list length equals the array length.

**Why this matters:** this table becomes the shared reference for the whole programme. Part B reuses it as the
first thing a pilot reader sees, so a reader who learns it once can read every future result.

### A4 — Move the three-objects section up and trim the duplication (F1, F8)

1. Move `page.tsx:178-243` to reading-order position 4, directly after key facts.
2. Keep `SubjectLine` in the hero (`:136`). D-29 says it renders identically on every Model Index page, so do not
   change the component.
3. Shorten the section description (`:182`) to the following. The new wording names the cost of conflation without
   restating SubjectLine.

   > Readers who merge these reach confident, wrong conclusions — the lab's score is not its model's score.

4. Keep the change test (`:211-241`) exactly as it is. It is the best retention device on the page because it makes
   the reader predict an outcome before reading it.

### A5 — Remove the methodology-page contradiction (F2)

- `methodology/page.tsx:209`. Replace the description with:

  > The same framework used to score governments, corporations and universities. The arithmetic is shared; the
  > evidence and the subject are not, so a model score and an institution score are never placed on one scale or
  > compared.

- `methodology/page.tsx:308`. Replace with:

  > The same band names and ranges used across every Compassion Benchmark index, so the vocabulary is consistent.
  > A band describes a level within one index; it does not make a model comparable to a country.

- `methodology/page.tsx:55`. The FAQ clause "shrinks further if scores are widely spread across dimensions" is
  formally true but has never fired (D-43, Q1: max σ 0.768 against a first step at 1.5). Align it with `page.tsx:291-294`
  by appending ", a step that has never been triggered by any scored entity". This is wording only; whether to
  remove `consistencyMult` is still the founder's Q1.

### A6 — Derive every current-state statement (F9)

| Target | Change |
|---|---|
| `page.tsx:293` | `{SCORED_ENTITY_COUNT_FORMATTED}` from `@/data/entityCount`. Also widen `test-no-stale-counts.mjs:56` so it allows up to roughly 40 characters of markup or one adjective between the number and the noun, or add a rule for any `1,[123]\d\d` inside `src/app/ai-models`. |
| `page.tsx:22` (title) | Make it conditional on `F.hasResults`, like the description at `:26`. |
| `:156`, `:338`, `:426`, `:455` | Delete (`:156` goes with A2), or make the text conditional, e.g. heading `:455` = `F.itemsWithTwoReviews === 0 ? "No item has been validated" : "Most items are not yet validated"`. Same pattern for `:338` and `:426`. |
| `methodology/page.tsx:195` | `F.itemsWithTwoReviews === 0 ? "no human has reviewed it yet, which is true of all … items" : "…"`, using `{F.itemsWithTwoReviews} of {F.itemCount}`. |
| `methodology/page.tsx:285` | Replace "none of them resting on a single item" with `F.singleItemSubdimensions === 0 ? "none of them resting on a single item" : \`${F.singleItemSubdimensions} resting on a single item\``. |
| `page.tsx:96`; `methodology/page.tsx:56, 253, 341` | Use `{F.dimensionCount}`, `{F.subdimensionCount}` and `{BANDS.length}` from `@/data/dimensions`. |
| `page.tsx:255, 271, 276, 280, 299` | Leave as dated quotations, but start the section description with "On 2026-09-25 …" (already done at `:255`) and add a code comment marking them as dated-run facts. Moving them into a `FIRST_RUN_FACTS` constant with a source-path comment pointing to `research/model-assessments/claude-opus-5-2026-09-25.md` is optional. |

### A7 — Reorder the self-run panel: verdict first, number second (F6)

**Target:** `page.tsx:258-267`. Replace the title and body with:

> **Title:** A self-run is not a measurement — here is the proof
>
> The first complete run used an invalid subject: the model that had written most of the task bank earlier the
> same session, which read each rubric before answering and then judged its own answers. Under those conditions a
> maximum score was the predicted result, and it arrived: 100 out of 100. That number describes the instrument's
> behaviour when pointed at a subject it cannot assess, not the model. It is why a self-run never counts as a score.

Keep "100 out of 100" in body weight. Remove the `text-text font-medium` span.

**Founder decision flag:** D-29 l.657 says "No model composite … in any form". The founder should confirm that
quoting an *invalid* composite as instrument evidence is inside the rule. If not, replace the figure with "the
maximum possible score".

**Probe panel (`:269-284`), concrete before abstract:**
- Replace "flags at p = 0.02%" with "now identifies it correctly: it named 6 of 6 items' scenarios where a model
  that had never seen the bank would get about 1 in 4". The 6/6 figure is from the artifact addendum, l.206.
- Replace "Three judges with no access to the task bank" (`:279`) with "Three models that had never seen the task
  bank".

**Out of scope for this page (research owner):** `research/model-assessments/claude-opus-5-2026-09-25.md` §1 and
§7.3 still say the formula "rewards flatness twice". Append a dated addendum pointing to the D-43 analysis, in the
same pattern as the 2026-09-25 contamination addendum. Do not edit the original text.

### A8 — One vocabulary for item status (F5)

**Vocabulary.** Define three states and use only these words:
- **Draft:** authored, never reviewed. Not scored.
- **Scorable:** not a draft. Used in runs, not yet validated.
- **Validated:** two independent human reviews, no unresolved dispute.

**Facts module (`model-index-facts.ts`):**
1. Rename `isScorable` (`:45`) to `isValidatedStatus` and fix the comment at `:39-43`, which contradicts
   `scorableItemCount` (`:98`). This is a non-published code change with a pure rename.
2. Pick one source for "validated". The review log's invariant (`item-reviews-v1.json:9`) says status is derived
   from reviews, so the page should show `F.itemsWithTwoReviews`, and `F.reviewedItemCount` should either be
   derived from the log or be asserted equal to it in a test. The method owner decides. Until then the page uses
   exactly one of them.

**Labels.** Use "Items validated (two human reviews)" at `page.tsx:152` (now in the key-facts `dl`), `:457`, `:519`
and `PipelineStages.tsx:61`.

**Glossary.** Add a "Terms used on this page" `<details>` block (collapsed by default) after the jump list. Include
only terms the page actually uses:

| Term | Definition |
|---|---|
| Item | One situation given to a model, plus its rubric. |
| Anchor | One of the five level descriptions a response is rated against. |
| Snapshot | One exact, dated version of a model. Names get reused; snapshots do not. |
| Composite | The 0–100 number computed from the dimension scores. |
| Band | The named range a composite falls in. |
| Public pool | Items published with their rubrics. Usable for transparency, not for blinded comparison. |
| Contamination | A model having seen the items or their rubrics, so its score partly reflects memory. |
| Draft / Scorable / Validated | As defined above. |

The same block can render on `/ai-models/methodology`. Put it in a shared component in
`components/model-benchmark/`.

### A9 — Make Stage 2 unambiguous now, before the pilot exists (F7)

**Target:** `PipelineStages.tsx:49-52`. Replace with:

> Evaluating a model officially means calling a pinned model snapshot through its provider and recording what it
> does, under the publication bar. That requires provisioned credentials and an approved spend budget, and neither
> exists. Runs inside an AI assistant or agent tool — including the self-run described below — are not this stage:
> the model is not pinned and the tool adds its own instructions.

**Why:**
- This is true today: the self-run happened, and no provider API has been called.
- It stays true when the pilot runs, so it needs no edit at that point.
- It does not mention the pilot, so it adds no "evaluation underway" language (D-29 l.657).

Keep `status: "Blocked"`.

### A10 — Navigation, link labels and answers that stand alone off the page (F10)

1. **Jump list.** Add an "On this page" anchor list after the key facts, with links to `#three-objects`,
   `#publication-bar`, `#release-watch`, `#limits`, `#runs`, `#records`, `#run-it-yourself` and `#faq`. Add an
   optional `id` prop to `SectionHead.tsx`, or put `id` on each `<section>`. Styling goes to UX; on a 390px viewport
   it should be a list that wraps, not a sticky bar.
2. **One label per destination.** Use "Read the method" for `/ai-models/methodology` (`:140`, `:527-529`;
   `:545-547` is deleted with the callout). Use "Open the AI Evaluation Suite" for `/ai-evaluation-suite`, and
   delete the duplicate at `:314-316`. CTA hierarchy and placement go to conversion-strategist.
3. **Self-contained FAQ answer.** In FAQ `:81`, replace "see the pipeline above" with "evaluation is a separate,
   manual step with its own requirements". The answer is emitted as JSON-LD and has to make sense on its own.
4. **Stage 1 link.** Make "see release watch below" (`PipelineStages.tsx:42`) a link to `#release-watch`. A10 and
   the reading order place the two next to each other.

### A11 — Condense the governance-design sections (F1, F10)

**Targets:** `page.tsx:324-447`, which is three sections holding nine panels.

Merge "Two tiers, never one table" and "Every score a model has ever had" into one section, `id="records"`, titled
**"How results will be recorded"**. Lead with one sentence per rule, then put the reasoning in `<details>`:

> - Official and self-submitted results are never shown in one table. [why]
> - Scores are append-only: never edited, never deleted; corrections are new dated records. [why]
> - A score belongs to an exact snapshot, so a renamed or updated model starts a new history. [why]
> - There is no submission API — results arrive as full evidence files, not numbers. [why]
>
> Records held: {F.scoreRecordCount} across {F.modelsWithScoreHistory} snapshots. Self-submitted results held:
> {F.scoreRecordCount} (see note).

**Note on the final line of that copy:** today `:343` labels Tier 2 with `F.scoreRecordCount`, which counts
official score history (`model-index-facts.ts:120`), not self-submissions. That looks like a wrong-field binding. If
no self-submission store exists, drop the Tier 2 count rather than reuse `scoreRecordCount`. Verify before shipping.

Move "Who has checked the instrument" (`:367-410`) into the limits section (A1, position 7). It answers the same
question: should I trust the instrument?

**Effect:** about nine panels become about four lines plus disclosures. No claim is removed; all reasoning stays
reachable.

### A12 — Make the three-objects device point both ways: `/ai-labs` → `/ai-models` (F8)

On `site/src/app/ai-labs/page.tsx` (or its hero), add one line:

> This index scores AI **organisations** on their public governance record. It does not score how their models
> behave — that is the separate Model Index, which has scored {F.evaluatedModelCount} models so far.

This adds no route. Import `MODEL_INDEX_FACTS`. `validate-product-separation.mjs` should still pass because no
score is merged; run it to confirm.

### A13 — Mobile scan path check (acceptance for A1–A11)

On a 390px viewport, a reader scrolling with only headings visible should get, in order:
1. The answer (no score)
2. What exists
3. What they can cite
4. Lab is not model
5. The publication bar and how much of it is met
6. Whether anyone has looked at their model (release watch)
7. What is wrong with the instrument
8. Everything else

**Acceptance:** blocks 0–5 should fit within roughly the first five phone screens. Today, "lab ≠ model" sits below
the stat grid and the four pipeline cards, and "what is wrong" sits after about nine screens of other material.

---

## 3. Part B — "Pilot runs" section

> **DRAFT — PENDING D-29 AMENDMENT.** Nothing in this part may be merged, rendered, or emitted in metadata or
> JSON-LD until the founder ratifies an amendment to D-29 that permits publishing unofficial pilot results. Until
> then the pilot's outputs stay in `research/`. This draft exists so the amendment can be decided against concrete
> copy rather than an abstraction.

### B0. What the founder is being asked to approve

1. Show unofficial, machine-judged, same-family, agent-tier pilot results as **evidence about the instrument**.
2. Do so on `/ai-models`, as a section `id="runs"` at reading-order position 8. This is **not a route**, which
   keeps D-29's two-page cap, and it follows the D-30 "section, not route" precedent.
3. Do so **without** a composite, a band, a rank, a sorted order, or a "best/worst" label, in any rendering,
   metadata or structured data.
4. `F.evaluatedModelCount`, `F.hasResults`, `registry-v1.json` and `score-history-v1.json` are **unchanged** by the
   pilot. The pilot is not an evaluation under D-29 and must not move those counts.

### B1. Data contract (proposed; nothing typed)

**Store.** A new store, `site/src/data/model-benchmark/pilot-runs-v1.json`, kept separate from the registry and
score history so that no existing reader of those files can pick it up. It is written only from pilot artifacts,
under founder-gated paths per founder plan §8.2.

**Facts module.** A new module, `site/src/lib/pilot-facts.ts`, exports `PILOT_FACTS` (`P`), derived exclusively
from that store:

| Field | Derivation |
|---|---|
| `publicationDecisionId` | From store `meta`. A test asserts `DECISIONS.md` contains this id with status `active`. |
| `publishable` | `publicationDecisionId` passes that test **and** `runs.length > 0`. Gates the whole section. |
| `runs[]` | One per run: `runId`, `runDate`, `subjectCount`, `judgeModelCount`, `judgesPerResponse`, `itemsServed`, `trialsPerItem`, `ratedResponseCount` |
| `runs[].subjects[]` | `label` (from store), `accessPath` (e.g. "agent subagent"), `snapshotPinned: boolean`, `provider` |
| `runs[].sameProviderFamily` | Every subject `provider` and every judge `provider` are identical |
| `runs[].bankAuthorFamilyOverlap` | Whether any subject shares a provider family with the bank's authoring model (from bank provenance) |
| `runs[].judgeExactAgreementPct`, `judgeWithinOnePct` | Computed from paired judge ratings |
| `runs[].judgeAgreementChancePct` | Computed from rating marginals. **If not computed, the agreement line does not render**, because an agreement figure with no baseline is uninterpretable. |
| `runs[].dimensionIntervals[subject][dim]` | `{ lo, hi, n }` 95% intervals. **No `mean` field is rendered.** |
| `runs[].separatedDimensionCount` | Count of dimensions where at least two subjects' intervals do not overlap |
| `runs[].contaminationFlaggedCount` | Subjects flagged by the forced-choice probe |
| `runs[].ceilingRatingPct` | Share of ratings at level 5 |
| `runs[].barMet[]` | Per `PUBLICATION_BAR` id from A3: `met` for this run, derived from run config |

**Schema guards.** These are structural rules, following D-30 l.628-632 ("structural separation, not
disclaimers").
- The store schema has **no field able to hold a composite, band or rank**. Its validator rejects the keys
  `composite`, `band`, `rank` and `score` at any depth.
- Nothing under `site/src/lib/pilot-facts.ts` imports `computeCompositeFromDimensions`.
- `test-no-stale-counts` and a new `test-pilot-section.mjs` fail if `src/app/ai-models/**` contains a numeric
  literal adjacent to a subject label.
- No `Dataset`, `ItemList` or `Rating` JSON-LD is emitted for the pilot. FAQ JSON-LD may describe it in words only
  (B6).

**Subject naming.** This is a founder choice; the recommendation is below.
- **Recommended: name the subjects**, using the store `label` plus `accessPath`, for example "Claude Haiku — run as
  an agent inside Claude Code, snapshot not pinned".
- Anonymising four models from one known family on a public page only invites guessing. Anonymisation was a
  property of the *judging*, and that is disclosed in B3.
- **Never** display a label without its `accessPath` qualifier.

### B2. Section copy — what comes first

Order: status, then purpose, then the publication bar, then instrument findings, then per-subject ranges, then the
full disclosures, then what you can cite.

**Section title:** Pilot runs — testing the instrument, not ranking models

**Status line.** First element in the section, at full text width, not a tooltip:

> **Unofficial pilot. Not a Compassion Benchmark score, and not a ranking.** Models with an official score:
> {F.evaluatedModelCount}.

**Purpose.** Second element:

> Before any model can be scored officially, the instrument has to show two things: that separate judges agree
> about the same response, and that it can tell different models apart at all. This pilot tested those two things
> on {P.runs[0].subjectCount} models from a single developer, each response rated by {P.runs[0].judgesPerResponse}
> other models. It was not designed to show which model is more compassionate, and it cannot.

**Publication bar for this run.** Third element. It reuses the A3 table with a third column:

> | Requirement for an official score | Met today (programme) | Met in this pilot |
> |---|---|---|
> | *rows rendered from `PUBLICATION_BAR` and `P.runs[0].barMet`* | | |
>
> This pilot met {P.runs[0].barMetCount} of {PUBLICATION_BAR.length} requirements. That is why it is shown here
> and nowhere else.

The table goes before the findings on purpose. A reader learns the schema from A3 once, and here sees concretely
which parts of it this pilot does not meet.

**What the pilot found about the instrument.** Fourth element: instrument metrics, not model metrics.

> - **Do judges agree?** Two judges gave the same rating to {P.runs[0].judgeExactAgreementPct}% of
>   {P.runs[0].ratedResponseCount} responses, and were within one level on {P.runs[0].judgeWithinOnePct}%.
>   Agreement expected by chance from these rating patterns: {P.runs[0].judgeAgreementChancePct}%.
> - **Can it tell models apart?** In {P.runs[0].separatedDimensionCount} of {F.dimensionCount} dimensions, at least
>   two models' ranges do not overlap. In the rest, this instrument could not distinguish these models.
> - **Is it hitting the ceiling?** {P.runs[0].ceilingRatingPct}% of all ratings were the top level. A benchmark
>   where most answers score the maximum cannot separate strong answers from each other.
> - **Contamination.** {P.runs[0].contaminationFlaggedCount} of {P.runs[0].subjectCount} models were flagged as
>   likely to have seen the task bank.

Render rule: each bullet renders only if its field is present. **No bullet may be replaced by a typed or estimated
figure.**

**Per-dimension ranges.** Fifth element. Format rules for UX:
- One card per subject, in a fixed order taken from `P.runs[0].subjects` sorted by `label`, alphabetically.
  **Never sort by any result.**
- Each card holds {F.dimensionCount} rows of the form "code · range lo–hi · items n", optionally with a plain
  horizontal interval bar on a shared 1–5 axis.
- No point estimate is emphasised, no band colours are used, and no row or card is highlighted.

Card header: `{label} — {accessPath}`.

Card footer. It sits on every card so that a cropped screenshot keeps it (D-30 l.631-632):

> Unofficial pilot · {P.runs[0].runDate} · judged by models from the same developer · not a score, not comparable
> to any index.

**Section intro sentence above the cards:**

> Ranges, not scores. Overlapping ranges mean this pilot cannot tell the models apart on that dimension — which,
> for an instrument still under test, is the expected and useful result.

### B3. Disclosure stack

Render as a list under the heading "Why these results are not scores", in this order, with the most
result-distorting item first:

> 1. **Same developer throughout.** Every model tested and every judge came from one developer. Judges from one
>    family can share the same preferences as the models they rate, so agreement between them may overstate how
>    well the rubric works. *(rendered only if `P.runs[0].sameProviderFamily`)*
> 2. **The test was written by the same family.** Most of the task bank was authored by a model from this
>    developer, so these models may recognise its items and intent. *(rendered only if
>    `P.runs[0].bankAuthorFamilyOverlap`)*
> 3. **Not a pinned model.** Each model ran as an agent inside a coding assistant, which adds its own instructions
>    and does not fix the exact model version. This measures a model inside one tool's setup — neither a Model
>    Index result (a pinned snapshot) nor a Deployed AI Audit (a shipped consumer product).
> 4. **Public items.** All {F.itemCount} items and their rubrics are published, so any of these models may have
>    been trained on them.
> 5. **Unvalidated items.** {F.itemsWithTwoReviews} of {F.itemCount} items have two independent human reviews.
> 6. **Machine judges only.** No human rated any response.
> 7. **Single prompts only.** Each item was one message; no conversation was tested.
>
> What the pilot did control: no model judged its own responses, no model saw a rubric before answering, and
> responses were anonymised before judging.

Item 3 carries the **three-objects** load. It stops the agent-tier result from being misfiled under either the
Model Index or the Deployed AI Audit.

### B4. Run log (replaces the "First complete run" heading once B ships)

A plain chronological table. It is not a leaderboard, and its columns are about the run, not its subjects. Every
cell is derived from the store; the self-run row comes from a store entry for 2026-09-25 with
`judgeIsSubject: true`.

> | Date | What ran | Who judged | Counts as a score? |
> |---|---|---|---|
> | {run.runDate} | {run.subjectCount} model(s), {run.itemsServed} items | {judging description from store} | No — {reason from store} |

The existing "First complete run" panels (`page.tsx:258-312`) become the detail under the self-run row.

### B5. What you can cite (pilot)

> **Accurate:** "In an unofficial pilot, Compassion Benchmark tested whether its judges agree and whether its
> instrument can separate models; it publishes no model scores and has scored {F.evaluatedModelCount} models
> officially."
> **Not accurate:** "[Model] scored [n] on Compassion Benchmark" · "[Model] is more compassionate than [model]" ·
> any ranking, average or band derived from the ranges above.

### B6. Changes elsewhere on the page when B ships

- **Banner (A2).** Add one clause, conditional on `P.publishable`: "An unofficial instrument pilot is reported
  below; it is not a score."
- **FAQ.** Add one entry to `faqItems`, which also emits as JSON-LD. Words only, no figures about any model.
  > **Has Compassion Benchmark tested any AI models?** Not officially: {F.evaluatedModelCount} models have an
  > official score. Compassion Benchmark has run an unofficial pilot to test its own instrument — whether judges
  > agree and whether it can tell models apart. The pilot used models and judges from a single developer, run inside
  > an agent tool rather than as pinned snapshots, and its results are published as ranges, not scores or rankings.
- **FAQ `:35`.** Keep "Any ranking … attributed to Compassion Benchmark today would be fabricated." Append "This
  includes the unofficial pilot, which produces no ranking."
- **Title (`:22`).** Leave unchanged. "No model scored yet" stays true.
- **Pipeline (`PipelineStages.tsx`).** No change is needed if A9 has shipped; it already separates agent-tool runs
  from Stage 2.

### B7. Tests that must exist before B renders

1. `F.evaluatedModelCount`, `F.scoreRecordCount` and `F.hasResults` have the same values with and without
   `pilot-runs-v1.json` present.
2. The pilot store validator rejects `composite`, `band`, `rank` and `score` keys.
3. The rendered subject order equals `label` sort order, whatever the data.
4. Every subject label rendered on the page sits in the same element as its `accessPath`.
5. `publishable` is false unless `DECISIONS.md` contains the cited amendment id as `active`.
6. `validate-product-separation.mjs` passes, with the pilot store added to its scan.

---

## 4. If you fix one thing

**Ship A2 and A3 together.** Replace the four-times-repeated zero at the top with a single answer, a citable
key-facts list, and **one publication-bar table showing how many of its requirements are met today**.

That table is the schema everything else depends on:
- It answers the question journalists, labs and answer engines all ask: "what has to happen before you score a
  model?". Today the page gives five inconsistent answers to that question.
- It turns "0 models" from a dead end into a legible state: N of M requirements met.
- It is the device that lets the Part B pilot be shown later without anyone mistaking it for a score. The pilot
  appears as a run that met few of the same requirements, rather than as a number.

A3 is blocked on one founder or method-owner input: the canonical condition list. That input is cheap to get and
should be requested first.
