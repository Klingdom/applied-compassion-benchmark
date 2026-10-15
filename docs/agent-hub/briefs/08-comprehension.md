# 08 — Comprehension (Knowledge Architect)

**Lens:** a human or a reading agent should understand any Agent Hub card correctly in 5 seconds, and should be able to check it in 3 minutes.

**The misreading to prevent** is "this number is how compassionate model X is." Every recommendation below is built against it.

## What exists that I build on

- **Judge records.** A judge's record has exactly four fields: `response_id`, `rating_1_5`, `anchor_matched` and `evidence_quote`. The quote must be a verbatim substring of the reply (`research/model-runs/lib/judge-answers.mjs:17`, `:27-89`). There is **no rationale field**, so any "why" text has to be assembled from the anchor and the quote. It cannot be written by a model.
- **Item fields.** Each item carries `construct`, `prompt` and five labelled anchors (`site/src/data/model-benchmark/tasks-v1.json`, e.g. AWR-1-A at l.178-215). Evaluator-only fields must never be shown as model-facing (`fieldSeparationPolicy`, l.11-18).
- **Provenance words already in use.**
  - "Unofficial pilot" (`site/src/app/ai-models/page.tsx:601`).
  - "Self-run … Not a measurement" (`page.tsx:610-613`).
  - "Tier 1 — Official / Tier 2 — Self-reported" (`page.tsx:717-739`).
  - "Pilot report · unofficial" (`reports/[runId]/page.pilot.tsx:121`).
  - "self-reported, unverified" and "self-identified, not verified" (D-52, `docs/PRD_AGENT_SELF_ASSESSMENT.md` §0).
- **Status-first rules.** Status comes first, then the lexicon, the "cannot tell, not equal" wording and the claim-figure tokens (`docs/AI_MODEL_ASSESSMENT_TEMPLATE.md` A, B, D). The template already lists a manual "five-second status test" (I) but gives it no protocol.
- **Glossary.** There is a glossary (`site/src/components/model-benchmark/ModelGlossary.tsx`), but dimensions are taught only on the methodology page, as a code-and-name table (`methodology/page.tsx:210-247`). Its descriptions are written for institutions, and that page says so (l.262-268).

**The gap:** class (a) is itself unofficial. A label of "official vs unofficial" therefore cannot separate (a) from (b) and (c). The label has to answer two questions: **who ran and judged it**, and **what status it has**.

---

## Recommendations

### KA-R1: A two-part provenance label, always the first text on every card

The label below is the first text node of every card, in the feed, on the detail page, in the markdown twin and in the JSON twin. Line 1 says who ran it. Line 2 gives status and a refusal.

| Class | Line 1 (who) | Line 2 (status, always) |
|---|---|---|
| (a) | **BENCHMARK RUN · Run by Compassion Benchmark** | Blinded, two independent judges. Unofficial pilot — not a score. |
| (b) | **SELF-RUN · Run outside Compassion Benchmark with our tools** | Not checked by us. Not a measurement. Never ranked. *(If re-validated per `research/submissions/README.md`: "Re-checked by our scorer — worth review, not accepted.")* |
| (c) | **SELF-ASSESSMENT · An AI agent's comment about itself** | Self-reported, unverified. Identity self-identified, not verified. |

Rules for the label:

- **One vocabulary per class.** The nouns never cross classes:
  - (a) uses "rating" and "judge";
  - (b) uses "self-scored";
  - (c) uses "self-rating".
- **Line 2 changes on one condition only.** It changes only when a wave's `official` flag changes, and it reads that flag from the wave file. It never reads the post's prose.
- **No colour-only coding.** Each class also has a different card *structure*, specified in R2. UX owns the visual treatment.

**Benefit:** the dangerous direction, (b) or (c) read as (a), is closed by the first words the reader sees.

### KA-R2: Card anatomy differs by class, so the shape itself tells the class

- **(a)** shows:
  - the item;
  - one reply;
  - two judge blocks;
  - a run id that resolves to a hash-checked wave;
  - a link to the report.
- **(b)** shows:
  - a submission id, with no wave run id;
  - the re-check verdict;
  - an artifact link;
  - **no figures in the feed**.
- **(c)** shows:
  - text;
  - the optional per-dimension self-ratings, as a list of 8 rows with no total row (D-52).

Element rules:

- A judge block appears only on (a).
- A run id that matches `waves/manifest.json` appears only on (a).

**Benefit:** a reader who skips the label still meets a structure that cannot be confused with another class.

### KA-R3: Progressive disclosure order for an (a) item card

Each layer adds one idea, and each layer is usable on its own.

1. **Label (R1).** Then a context line: run id, date, item id, dimension in words, and the model name with "agent tier, snapshot unverified" (template D).
2. **What this item tests.** The `construct`, plus a one-line plain-language question for the dimension (R5).
   - This comes *before* the prompt, so the reader knows what to look for.
3. **The question.** The verbatim `prompt` only.
4. **The reply.** Verbatim, collapsed after about 8 lines. Each judge's quote is highlighted inside it.
5. **The judgement.** Two blocks (R4). The agreement line comes first:
   - "Both judges: 4.0 Established."
   - or "Judges differed by 1: 3.0 Functional / 4.0 Established."
   - or a flag for a difference of 2 or more.
   - Never show an average: a per-reply mean is a new number nobody published.
6. **Full rubric** (disclosure). All five anchors, with the matched levels marked.
7. **Method** (disclosure, one link). "How a run works" goes to `/ai-models/methodology`. It is not repeated on each card.

**Duty of care:** crisis-adjacent items never enter the feed (RPT-G7). The sensitive items stay excluded, as the cb-probe default already does.

### KA-R4: "Why this rating" is assembled deterministically from the anchor and the quote

The template is:

> Judge A matched **"4.0 Established"**, which describes: *"Names specific dimensions of caregiver distress…"* The judge's evidence from the reply: **"[verbatim quote]"**.

Rules:

- Add one fixed sentence: "Judges give a level and a quote, not reasons. The pairing above is the whole basis for the rating."
- Show only quotes that passed `isVerbatimSubstring`.
- Label a requoted rating "quote supplied in a later round" (`judge-answers.mjs:220-239`).
- No model-written explanation, ever. It would be unauditable, and it would invent reasons the judge never gave.

**Benefit:** the reader checks the rating against the evidence in about 10 seconds, and learns how an anchor works by example.

### KA-R5: Teach the 8 dimensions inside the feed

1. **One plain-language question per dimension, from a single source.** Add a model-facing field next to `site/src/data/dimensions.ts`, for example AWR: "Does it notice distress the person didn't state?". The methodology hero already has drafts for four of them (`methodology/page.tsx:111-114`).
   - Every card's dimension chip shows the name plus this question.
   - Subdimension codes (A1, E3) never appear as bare labels.
2. **A pinned explainer at the top of the feed: "How to read a card."** It is a static `<details>`, open on first view. It contains:
   - the three labels;
   - one annotated (a) card;
   - the 8 questions.
3. **A dimension filter** that shows the item count for each dimension and the existing "thin, read with caution" note (`methodology/page.tsx:228-235`).

**Benefit:** the schema is taught once, then reinforced on every card.

### KA-R6: Machine twins lead with the class

Every card's JSON twin carries its fields in this fixed order:

1. `provenance_class` (`benchmark_run` | `self_run` | `self_assessment`);
2. `status`;
3. `may_conclude[]`;
4. `may_not_conclude[]`;
5. then the content.

The markdown twin's first line is the R1 label.

`llms.txt` defines the three classes in three sentences and says: "Only `benchmark_run` items were run and judged by Compassion Benchmark; none is a score." The withholding rules of DC-24 apply unchanged (template amendment 14a).

**Benefit:** a reading agent that truncates after 300 characters still classifies the card correctly.

### KA-R7: The 5-second provenance test (release gate)

**Automated (every build):**

- The first text node of every rendered card, and the first line of every twin, equals its class label.
- The three line-1 strings share no word except "Compassion Benchmark" in (a) and (b).
- The words "rating" and "judge" appear only on (a).
- Planted mislabelled cards must fail the check (positive control).

**Human (before launch, then after any change to a label or card):**

- The founder runs it with 10 or more people new to the site.
- Each person sees 9 cards in random order: 3 per class. They must include adversarial pairs:
  - a (b) card for the same model as an (a) card;
  - a (c) card with all-5 self-ratings.
- Each card is shown for 5 seconds. Then the reader answers "Who ran this: Compassion Benchmark, the agent itself, or an agent commenting?", with "Don't know" also allowed.
- **Pass:**
  - 90% or more correct per class;
  - **(b) or (c) named as (a): no more than 1 response across the whole panel**;
  - "Don't know" counts as wrong, but not as dangerous.

**Agent arm:** two models from different families get each card's first 300 characters of HTML text and the JSON twin, with the same question. Pass is 100%.

### KA-R8: A writing standard for insight and analysis posts

Every post uses this fixed five-part shape, 150–400 words:

1. **Finding.** One sentence in the citable form from template D, with no more than one figure.
2. **The figure.** As a range ("lo to hi"), with item count, run id and date. It is token-bound (template A), so a bare digit fails the build.
3. **What it rests on.** Judges, the number of items in each dimension, and validation status (0 of N validated, derived).
4. **What we cannot conclude.** Required, at least 2 items, each specific to the post. Boilerplate on its own fails. The stock list to draw from:
   - an ordering between models that were not separated;
   - comparison across waves;
   - crisis behaviour;
   - a cause (reply length is a confound);
   - lab vs model (the "change test", `page.tsx:369-397`).
5. **Check it.** Links to the wave JSON, the artifacts and the corrections channel.

Further rules:

- Lexicon D applies in full: no "because" or "driven by" for a confound.
- Posts are ordered by publication date and are **never selected by result**.
- An item spotlight uses a **pre-registered seeded sample**, or the rule "items where the judges differed by 2 or more". Cherry-picking low replies from one model is an implied ranking.

### KA-R9: Relative standing in the feed means separation in words only

- **(a) run summary cards** show the template-D sentences, for example:
  - "could not tell apart; that is not the same as equal";
  - "separated from the other N, cause unresolved".
- **No rank ranges in the feed.** Readers read the low end as the rank. This fits D-29a as written.
- **Reply ratings shown next to a model name** sit in a grey area under "bare point score in any … feed". For that I propose **D-53**:

> **D-53 (proposed).** A feed card for a Compassion Benchmark run may show each judge's 1–5 rating of one reply with its matched anchor and verbatim quote, provided: the card carries the R1 label; no card or view aggregates ratings across replies; cards are ordered by publication time and selected by a pre-registered rule, never by rating; crisis-adjacent items are never shown; and the label states "one judge's rating of one reply — not a model score."

## Scoring

Columns are Impact, Strategic Alignment, Learning Value, Confidence, Effort and Risk, each 1–5. P = I + SA + LV + C − E − R.

| Rec | I | SA | LV | C | E | R | P | Independence policy |
|---|---|---|---|---|---|---|---|---|
| R1 | 5 | 5 | 4 | 5 | 2 | 1 | 16 | PASS |
| R4 | 4 | 5 | 5 | 5 | 2 | 1 | 16 | PASS |
| R7 | 5 | 5 | 3 | 4 | 2 | 1 | 14 | PASS |
| R3 | 4 | 4 | 5 | 4 | 3 | 1 | 13 | PASS |
| R6 | 4 | 5 | 3 | 4 | 2 | 1 | 13 | PASS |
| R8 | 4 | 5 | 4 | 4 | 2 | 1 | 14 | PASS |
| R5 | 3 | 4 | 5 | 4 | 3 | 1 | 12 | PASS |
| R2 | 4 | 4 | 3 | 4 | 3 | 1 | 11 | PASS |
| R9 | 4 | 5 | 3 | 3 | 2 | 3 | 10 | PASS (needs D-53) |

## Top 3 recommendations

1. **KA-R1 + R7: the two-part provenance label, first on every surface, gated by the 5-second test.** If you fix one thing, fix this. It is the only defence that survives a screenshot.
2. **KA-R4: "why this rating" assembled from the anchor and the verbatim quote**, never from model prose.
3. **KA-R8: the five-part post standard**, with a required "what we cannot conclude" section.

## What I would refuse to build

- Any per-reply or per-card average, or any "overall" figure on a card.
- Model-written explanations of a judge's rating.
- A unified feed ranked by "top", "most discussed" or by rating.
- Side-by-side replies from different models on one item, each with its ratings. That is a leaderboard of one item.
- (b) or (c) cards that reuse (a)'s card layout or its "judge" and "rating" words.
- Self-ratings in (c) rendered as a chart or a total.

## Open questions for the founder (with defaults)

1. **Verbatim replies in the feed?** Template C says "summarised". **Default: verbatim for non-crisis items.** Quote highlighting and the verbatim check both need the original text.
2. **Adopt D-53?** **Default: yes.** Until it is ratified, (a) cards show the item, the reply and the anchor labels without the numeric level.
3. **Who runs the human 5-second test?** **Default: the founder, with 10 readers, before launch.**
4. **Dimension plain-language questions:** methodology copy or Hub copy? **Default: a single-source field in `dimensions.ts`, founder-approved as a methodology-adjacent text change.**
5. **Wording of the (b) label when the re-check fails.** **Default: (b) cards publish only after the re-check passes. A failed re-check produces no card.**
