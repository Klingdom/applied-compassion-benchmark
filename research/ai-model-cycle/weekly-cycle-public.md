# How we analyse AI models every week

Page copy for the frontend engineer. Route: `/ai-models/cycle` (C-FD-3 approved by the founder's 2026-10-21 instruction to publish the plan; C-FD-1, C-FD-2 and C-FD-4 remain open).
Values in double braces are data tokens. Derive them at build time and never type them. The token table at the end is not page copy.
Remove this note and the token table before publishing.

---

## Summary box

If you need support now, contact your local emergency number or a crisis line. This page does not advise which AI to talk to.

We run a weekly routine for AI models. Part of it runs today: a sourced weekly list of what providers released and disclosed. Part of it is planned: a weekly test run of open-weight models (models whose files anyone can download). None of this produces a ranking.

**No official model ranking, band or score is published.** Where this page says "score", it means one thing: a reply rated from 1 to 5 against a rubric written for one test item, in an unofficial pilot run. Pilot results are shown as ranges, in alphabetical order, and are labelled "comparability: none": they test our instrument and are not a basis for choosing between models. Where a pilot's statistical test could tell one model's results apart from the others, the report says so and shows a point estimate inside that model's range. That is a finding about one unofficial test run, not a ranking and not an official score.

---

## What we do every week

**Running today: AI Model Watch.** We aim to publish one edition every seven days. We do not promise the timing. Each edition:

1. Scans provider release pages, model cards and system cards, and records what was released in the period.
2. Cites at least one source we opened for every entry. A release needs a primary source (the provider's own page). An item with only secondary sources is held out of the log.
3. Is checked by a second, independent AI agent before publication. The checker reviews every release and a sample of at least 20 catalog rows, including every new or changed row.
4. Goes live only when the founder approves the publication.
5. States what was not scanned. A scan that did not run is never reported as "nothing found".

Model Watch summarises. It does not assess, rate, rank or score any model. Where a provider has published a safety or welfare disclosure, we quote the provider's own words and link the source.

The first edition covered {{FIRST_EDITION_WINDOW_DAYS}} days and logged {{FIRST_EDITION_RELEASE_COUNT}} releases, deprecations and policy notices, {{FIRST_EDITION_DISCLOSURE_COUNT}} of which include a published safety or welfare disclosure.

**Planned, conditional: a weekly test run.** We intend to run a small batch of open-weight models through our task bank each week, under a written protocol that stays fixed from week to week. This has not started.

- No weekly run has taken place yet.
- The weekly protocol is proposed. It is not ratified.
- {{QUEUED_BUILD_COUNT}} open-weight builds are downloaded and waiting in a queue. {{MEASURED_BUILD_COUNT}} others were measured in the early-October pilots. None of the queued builds has been tested.
- The first run starts only after the founder ratifies the protocol and approves the plan.

**What a weekly run would involve (planned):**

1. **Plan before data.** The plan is committed to our version history before any reply is collected. The history shows the order.
2. **Collect.** Each model is asked each of the task items several times, in a fixed way. The queue picks which model is next by a written rule. No provider can pay to be tested, tested sooner, or tested in a particular way.
3. **Judge.** Each reply is rated by two judges against the item's rubric. Today every judge is an AI model from one family (Anthropic's Claude). Claude models were also among the models tested in the first pilot, so this is a known risk of bias until judges from other families take part. A panel of judges from three families is planned.
4. **Check the instrument.** One reference model is re-run every week. A sample of stored replies from an earlier pilot is re-rated each week. If the re-ratings drift beyond a set limit, that week is marked "not comparable".
5. **Audit.** Every number in the write-up is re-derived from the raw records before anything is published.
6. **Approve.** The founder approves each publication. Nothing goes live without it.

---

## How each week makes the next one better

Each week's outputs feed the next week's inputs. The loop has seven links. Some run today and some are planned.

| Link | This week's output | Next week's input | Status |
|---|---|---|---|
| Releases to test queue | New open-weight models found by Model Watch | They can join the test queue if they fit our hardware. They do not move up the queue. The order follows a written rule | Done by hand today. Automation planned |
| Tests to the tracker | A published pilot report | The "tested by us" label on the tracker changes. It says pilot, queued or not yet. It never shows a figure | Running today |
| Results to the test items | Test items whose rubric cannot be applied, or prompts that cause confusion | A list of fixes. Fixes are grouped and released as a new, versioned item bank. The bank is never changed in the middle of a run | Planned |
| Judge disagreement to the judge panel and human review | Items where judges disagree most, and judges that fail our checks | Changes to the judge panel, and a short list of items for the first human reviewers | Planned. Human reviewers do not exist yet |
| Corrections to dated corrections | An error report from a reader or a provider | A new dated correction. The original stays visible | Running today |
| Weekly measures to the to-do list | A short list of weekly measures, such as days since the last measurement | Anything past its limit becomes a work item | Done by hand today. Automation planned |
| Instrument checks to the protocol | The reference model's series and the drift readings | Evidence for adjusting the limits, which can only change in a new protocol version approved by the founder | Planned |

The corrections channel is open to everyone, including providers. Corrections are published as new dated records and the original stays visible. No provider pays for a result.

---

## What we publish, and what we do not

**We publish**

- A weekly edition of AI Model Watch: dated, sourced, with its coverage stated. [AI Model Watch](/ai-models/watch).
- A model tracker: a sourced catalog of {{CATALOG_MODEL_COUNT}} models, listed alphabetically by provider, with a "tested by us" label of pilot, queued or not yet. "Pilot" means a model was in an unofficial test. It does not mean it passed. [Tracker](/ai-models/tracker). A listing is not an evaluation.
- Unofficial pilot reports: ranges per model (plus a point estimate inside the range for a model the test could tell apart from the others), model names in alphabetical order, models that cannot be told apart grouped together first, and every figure labelled "unofficial pilot" with the run, the date and the access method. Three exist, dated 2026-10-01, 2026-10-02 and 2026-10-03.
- Corrections as new dated records. Originals stay visible.
- The AI Labs Index, which scores {{AI_LAB_COUNT}} organisations on their public governance record. It describes how an organisation governs itself. It does not describe how any model behaves. [AI Labs](/ai-labs).

**We do not publish**

- A model ranking, rank or band, or an official model score. No model has an official score. {{EVALUATED_MODEL_COUNT}} models have been officially evaluated.
- A single number for a model in any headline, title or summary.
- Official comparisons between models. A pilot report may say its test could tell one model's results apart from the others, but every pilot is labelled "comparability: none" and none is a ranking.
- Advice on which AI to use, in a crisis or otherwise. Crisis-adjacent test items exist to locate failures, not to certify safety. Five sensitive items are not given to the models in the pilots.
- Our own assessment of a provider's safety or welfare disclosure in Model Watch. We quote and link it.
- Anything paid for by a provider. No provider pays for inclusion, coverage, testing order, status, wording or scores. Our commercial services support access and interpretation only, never findings.

---

## How scoring works today, and what would change it

**Today.**

- The task bank has {{ITEM_COUNT}} items across {{DIMENSION_COUNT}} dimensions. In the most recent pilot, {{PILOT3_ITEMS_SERVED}} items were given to the models. {{PILOT3_ITEMS_NOT_SERVED}} were not, including the five sensitive ones.
- A model's reply to an item is rated from 1 to 5 against five written anchors for that item.
- Each reply is rated by two judges. All judges so far are AI models from one family. That is a stated limit of all three pilots.
- No item has yet been reviewed by two independent humans: {{ITEMS_VALIDATED}} of {{ITEM_COUNT}}. The whole bank is public, so a model could have seen it. Because of that, comparison between models on this bank is not valid.
- Because of these limits, pilot results are ranges, not official scores. A point estimate appears only for a model the test could tell apart from the others, inside its range. All of it is labelled unofficial, and no comparability claim is made.

**What would have to change.** We have listed {{CONDITIONS_TOTAL}} conditions. All must be met, and the founder must then decide. {{CONDITIONS_MET}} are met today. They are:

- the weekly testing protocol is ratified;
- the model dashboard decision is ratified;
- a judge panel of {{JUDGE_FAMILIES_REQUIRED}} model families is operating;
- a blinded or secure item pool exists;
- items are human-validated, with at least {{MIN_VALIDATED_ITEMS_PER_DIMENSION}} rated items in every dimension;
- a human rating panel exists;
- variance checks and judge-agreement floors are met;
- {{CONSECUTIVE_WAVES_REQUIRED}} consecutive weekly runs are published under per-run approval with no open defects;
- no check of our published claims is still open (open claim audits: {{OPEN_CLAIM_AUDITS_ALLOWED}});
- results from a model run on our own computers and on the provider's service are never compared unless we say so;
- legal and duty-of-care review is complete.

The live status of each condition, with its source, is at [Compassion leaderboards: what exists and what does not](/ai-models/leaderboards#conditions).

Even if every condition is met, the first form would be groups with ranges, not an ordered list. Whether to publish one is the founder's decision. It is not decided.

**Planned, conditional steps toward those conditions** (none has a date):

1. Run weekly local test runs under a ratified protocol.
2. Add a hosted-access tier for larger models, and a judge panel from several families. This needs an approved budget and an access key.
3. Publish a dashboard and complete two clean runs under per-run approval.
4. Build a secure item pool and recruit a human rating panel, with protections for raters before they see sensitive material. This needs funding.

---

## How to follow along

- [AI Model Watch](/ai-models/watch): the weekly edition.
- [Model tracker](/ai-models/tracker): the sourced catalog.
- [Compassion leaderboards](/ai-models/leaderboards): what exists, what does not, and the conditions.
- [Method](/ai-models/methodology): the task bank, the rubric and what would show the method is wrong.
- [AI Labs Index](/ai-labs): the organisational compassion leaderboard.
- [Insights](/insights): articles, including why we do not rank AI models yet.

**Independence.** Compassion Benchmark is independent. No provider pays for inclusion, coverage, testing order, status, wording or scores. Commercial services support access and interpretation only, never findings.

**See an error?** Send a correction to info@compassionbenchmark.com. Corrections are published as new dated records and the original stays visible.

---

## Token table (not page copy)

| Token | Current value | Derive from |
|---|---|---|
| FIRST_EDITION_WINDOW_DAYS | 46 | `site/src/data/model-watch/editions-manifest.json` (lead tokens `{{WINDOW_DAYS}}`) |
| FIRST_EDITION_RELEASE_COUNT | 21 | same |
| FIRST_EDITION_DISCLOSURE_COUNT | 10 | same |
| QUEUED_BUILD_COUNT | 9 | `research/model-runs/weekly/QUEUE.json`, entries with status `queued` |
| MEASURED_BUILD_COUNT | 4 | same, status `measured` |
| CATALOG_MODEL_COUNT | `catalogModelCount` in `site/src/lib/model-watch-facts.ts` (62 at import) | same module |
| AI_LAB_COUNT | `getIndexEntityCount("ai-labs")` | `site/src/data/entityCount.ts` |
| EVALUATED_MODEL_COUNT | 0 | `MODEL_INDEX_FACTS.evaluatedModelCount` |
| ITEM_COUNT | 93 | `MODEL_INDEX_FACTS.itemCount` |
| DIMENSION_COUNT | 8 | `MODEL_INDEX_FACTS.dimensionCount` |
| PILOT3_ITEMS_SERVED | 83 | latest pilot wave file `bank.items_served` |
| PILOT3_ITEMS_NOT_SERVED | 10 | same, `bank.items_not_served` |
| ITEMS_VALIDATED | 0 | `MODEL_INDEX_FACTS.itemsWithTwoReviews` |
| CONDITIONS_TOTAL / CONDITIONS_MET | 11 / 0 | `site/src/data/model-ranking-conditions.ts` |
| JUDGE_FAMILIES_REQUIRED | 3 | same |
| MIN_VALIDATED_ITEMS_PER_DIMENSION | 3 | same |
| CONSECUTIVE_WAVES_REQUIRED | 2 | same |
| OPEN_CLAIM_AUDITS_ALLOWED | 0 | same |

Build checks the frontend engineer should add: the page must not name any model next to a ranking word (the `/ai-models/**` 60-character gate); no `Dataset`, `ItemList`, `Rating` or `Review` JSON-LD; "pilot", "planned" and "conditional" labels must survive in the rendered text; the stage table must keep its Status column.
