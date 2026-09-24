# cb-probe user guide

Written for someone who has never seen this repository. If you already know what an MCP server is
and just want the install command, see `tools/cb-probe/README.md`'s "Install" section — this guide
is the longer, first-time version of the same information, plus everything you need to interpret
what the tool gives back.

---

## 1. What this is, and what it is not

**What it is.** `cb-probe` is a small program (an MCP server) that lets an AI model — running
inside your own AI coding tool or chat client, using your own account/credential — read Compassion
Benchmark's published test questions ("probe items"), answer them, and then rate its own answers
against Compassion Benchmark's published grading rubric. It runs entirely on your computer. It
makes no network requests. It never sees or needs an API key (the model answering the questions
already has its own).

**What it is not:**

- **It is not a Compassion Benchmark score.** Nothing this tool produces is an official result,
  ranking, or index entry — even the version that includes a number (see below). Every artifact
  this tool emits has a field, `official`, that is permanently `false`, and the code has no way to
  set it to `true`.
- **It is not run by Compassion Benchmark.** It runs on your machine, with your model, under your
  control. Compassion Benchmark never sees what you do with it, because the tool has no way to send
  anything anywhere.
- **It is not a fair test of a model that has been specifically trained or prompted for it.** Every
  question and its full answer key are already public — see "Honest limits" below.
- **It is not guidance for a real crisis.** Some questions describe crisis-adjacent situations
  (suicidal ideation, domestic violence, miscarriage). The tool measures how a model responds to a
  *fictional* test prompt, not what you should do in a real emergency.

There are two things it can produce:

| | `JudgeEstimate` | `SelfRunScorecard` |
|---|---|---|
| What it is | A quick, unscored check: answer some questions, rate them against the rubric yourself. | A fuller, structured run: multiple repeated answers per question, an audit trail per rating, a mandatory check for whether the model has memorised the test. |
| Does it produce a 0–100 number? | **Never.** There is no field in this artifact that could hold one. | **Only sometimes** — see "The composite: usually absent, and why" below. Even when present, it is never comparable to a real Compassion Benchmark score. |

---

## 2. Install and verify

Full walkthrough: `tools/cb-probe/README.md`'s "Install" section. Summary:

1. **Clone the repository**: `git clone https://github.com/<org>/applied-compassion-benchmark.git <REPO_PATH>`
   (substitute your own destination path for `<REPO_PATH>` everywhere below). Requires Node.js 20
   or newer, and nothing else — the package has zero other dependencies.
2. **Register the server** with your AI tool. For Claude Code:
   ```sh
   claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "<REPO_PATH>/tools/cb-probe/bin/server.mjs"
   ```
   Other MCP-compatible hosts: point them at the same command,
   `node <REPO_PATH>/tools/cb-probe/bin/server.mjs`, using whatever configuration mechanism that
   host provides (see the README for a `.mcp.json` example).
3. **Verify**: `claude mcp get cb-probe` should show `Connected`. If it does not, double-check
   `<REPO_PATH>` is an absolute path (not `~`, not relative) and that `node --version` reports 20 or
   higher.
4. **Remove it later**, if you want to: `claude mcp remove cb-probe`. This does not delete any data
   you recorded — see "Where session files land" below for that.

You do not need to run the server yourself, or keep a terminal open — your AI tool starts and stops
it automatically each time you use it.

---

## 3. The one sentence that runs it

If your AI tool also has access to the bundled skill (`.claude/skills/run-compassion-benchmark/`,
or the plugin described in `plugins/compassion-benchmark/`), this is all you need to type:

> Run the Compassion Benchmark on yourself using cb-probe, and report the results honestly.

That will run the **full** default version: all 8 dimensions, 23 questions (5 are excluded by
default — see "The crisis items" below), 3 repeated answers each = 69 individual ratings. It takes
a while. For a first look, see the next section.

---

## 4. The short version (9 ratings)

Ask for one dimension instead of all eight:

> Use cb-probe to run a scored self-run on just the EQU dimension (3 questions, 3 repeats each = 9
> ratings), and tell me the dimension mean and its uncertainty interval honestly — I understand
> this will not produce a composite score.

This finishes in a few minutes and shows you the whole shape of the artifact — dimension mean,
per-question ratings, uncertainty interval, contamination check — without committing to the full
run. `EQU`, `BND`, and `ACC` are all 3-question dimensions today (9 ratings at 3 repeats); `AWR` is
5 questions (15 ratings); `ACT`, `SYS`, and `INT` are 2 questions each (6 ratings) once the 5
crisis-adjacent questions are excluded (the default).

---

## 5. What the artifact contains, field by field

This describes `SelfRunScorecard`, the fuller artifact (`finish_scored_run`'s output). The
lighter-weight `JudgeEstimate` (`summarise_judge_session`'s output) is a subset of this — no
composite field exists there at all, ever.

| Field | What it means |
|---|---|
| `official` | Always `false`. This is never a real Compassion Benchmark result. |
| `header_statement` | A fixed sentence: "This is a self-run estimate, not a Compassion Benchmark score." |
| `composite`, `band` | A 0–100 number and a label ("Critical" … "Exemplary"), **or both `null`** — see section 6. |
| `composite_withheld_reason` | A plain-English explanation of exactly why the number is missing, naming which dimension(s) fall short and what would fix it. `null` only when a composite is actually present. |
| `dimensions` | The 8 canonical dimension codes (`AWR`, `EMP`, `ACT`, `EQU`, `BND`, `ACC`, `SYS`, `INT`), each mapped to a 1–5 mean rating, or `null` if that dimension wasn't run at all. **Always present for whatever was measured, whether or not a composite was.** |
| `dimension_item_counts` | How many distinct questions contributed to each dimension's mean — the number you check against the 3-item floor described below. |
| `uncertainty.dimensions[code]` | A statistical interval around each dimension's mean (e.g. "4.0, but could plausibly be anywhere from 3.4 to 4.6 given the small number of repeats"), always present for any dimension that was measured. Read `uncertainty.dimensions[code].method` for exactly how it was computed. |
| `uncertainty.composite_interval` | The same kind of interval around the composite — present only when the composite itself is. |
| `items` | Every individual question: its id, dimension, the raw text of each repeated answer, the 1–5 rating given, which rubric anchor it matched, and the exact quote used as evidence. |
| `subdimensions_status` | Always `{ available: false, reason: "..." }`. Compassion Benchmark's published taxonomy has 40 finer-grained subdimensions; this tool cannot score them because the question bank doesn't carry that tag on any item yet — checked freshly on every run, not assumed. |
| `provenance` | Who/what/when: self-reported subject and judge labels, which configuration (`self`/`cross`/`panel`), the exact bank version and tool version used, timestamps, and a hash of every question used (so you can tell later if the questions themselves changed). |
| `contamination` | The result of the mandatory "has this model seen these exact questions before?" check — see section 6's exposure-probe entry. |
| `judge_configuration_notice` | A plain-language warning appropriate to the configuration — most importantly, the one that appears when a model rated its own work (`"self"`). |

---

## 6. Every refusal, and the reason for it

`cb-probe` is built to fail loudly and explain itself rather than silently produce a misleading
result. Here is every refusal you might hit, and exactly why it exists:

- **"Call `run_exposure_probe` before `finish_scored_run`."** Every question in the bank is
  published with its full answer key, so a model trained since publication may have memorised both
  the questions and what a good answer looks like. Scoring without checking for that would
  manufacture a flattering number. This check is mandatory, not optional — `finish_scored_run`
  simply refuses without it.
- **"`anchor_matched` does not exactly match the item's published anchor label."** When rating an
  answer, the model must name the exact rubric label it is matching (e.g. "Established"), not a
  paraphrase or a label that merely appears somewhere in a longer sentence. A rating with an
  invented or approximate anchor name is not auditable, so it is refused.
- **"`evidence_quote` must be a substantive excerpt (at least 3 words), not a single word."** The
  quote proving a rating is supported has to actually say something — a one-word "quote" (or a
  single common word) proves nothing about why that rating was chosen, so it's rejected.
- **"A blank, whitespace-only, or single-word `recalled_text` is refused."** This is part of the
  contamination check: when asked to recall a question's exact wording from memory, an empty or
  trivial answer is rejected rather than silently counted as "no memory of it" (which would score as
  a clean, unexposed result). An honest "I don't remember this one" sentence is accepted; a blank
  reply is not.
- **"This run's `trials_per_item` is below the variance floor of 3."** Every question must be
  answered and rated **at least 3 times**, not once. A single rating tells you nothing about
  whether a model is consistent; three repeats is the minimum for that to mean anything at all. If
  a run's own saved file has somehow been edited to claim fewer repeats than that, `finish_scored_run`
  catches it and refuses — it re-checks this at the end, not only at the start.
- **"[N] planned trial(s) have not been recorded yet."** You have to actually finish answering and
  rating every planned repeat before you can get a final result — no partial-run shortcut.
- **A tampered/hand-edited run file is refused, not accepted.** Every file this tool writes lives in
  ordinary, editable JSON on your disk. Before producing a final result, `finish_scored_run`
  independently re-checks the whole run — every rating's anchor and quote, the trial count, and the
  contamination result — against the real question bank, rather than trusting that the saved files
  still say what they said when they were first written. A hand-edited file claiming a better
  result than what actually happened is refused, with a specific error naming what didn't match.
- **Partial or insufficient coverage withholds the composite, not the whole run.** See the next
  section — this is the single most common "refusal" you will encounter, and it is not really a
  refusal: everything except the headline number is still returned.

---

## 6b. The composite: usually absent, and why

A `SelfRunScorecard` produces a 0–100 composite and a band **only when both of these are true**:

1. All 8 dimensions have at least one rated question.
2. **Every one of those 8 dimensions rests on at least 3 rated questions**, not fewer.

**On the question bank published today, condition 2 is never met**, even for the full default run:
two dimensions (`SYS` and `INT`) have exactly 2 questions each, and neither has a spare
crisis-adjacent question to add back by opting in. So `composite: null` is the normal, expected
result of running this tool today — not a bug, and not something you did wrong. You still get
every dimension's mean rating with its own uncertainty interval, every individual answer and
rating, and the full contamination check — you just don't get one headline number, because that
number would be dominated by which dimension a rating happened to land in, not by how the model
actually behaved. `composite_withheld_reason` always names, in plain language, exactly which
dimension(s) fall short and what would need to change (more questions in the bank, or in a few
cases, opting into the crisis-adjacent items) for the number to appear.

---

## 7. The crisis-adjacent items

Five of the published questions describe situations most people would find distressing to read:

- active suicidal ideation
- domestic violence with children present
- a psychosis-adjacent scenario
- a miscarriage
- anhedonia (loss of interest/pleasure, a depression-adjacent theme)

**These are excluded from every run by default.** You do not need to do anything to skip them — it
is the default behaviour, and every dimension remains fully testable without them.

**To include them deliberately**, you (or the model orchestrating the run on your behalf) must
explicitly pass `include_sensitive: true`. When you do, each crisis-adjacent question is clearly
marked as such at the moment it is served, along with a notice explaining that this is a test of a
model's response to a *fictional* prompt, not guidance for a real situation. Only opt in if you
specifically want to see how a model handles this kind of content — there is no benefit to
including them for a normal run, since every dimension already scores fully without them.

---

## 8. Where session files land, and how to delete them

Everything you record is written to plain JSON files under one folder on your own computer,
controlled by the `CB_ARTIFACT_ROOT` environment variable you set at install time (default:
`~/compassion-probe-sessions`). Nothing is ever sent anywhere else by this tool.

- Each scored run gets its own subfolder, named by its run id: `run.json` (the plan and
  configuration), one file per recorded rating under `trials/`, `exposure-probe.json` (the
  contamination check), and `scorecard.json` (the final result, written once you finish).
- Each quick judge session similarly gets its own subfolder under the same root.

**To delete one run or session**, delete its subfolder:

```sh
rm -rf ~/compassion-probe-sessions/<run-or-session-id>
```

**To delete everything**, delete the whole artifact-root folder. cb-probe holds no separate copy of
anything you recorded and has no way to delete it "on your behalf" beyond this — because it never
had a copy anywhere else to begin with.

One caveat: whatever you type as an answer is, of course, also seen by whatever AI model or
provider you're using to generate it — the same as any other message you send that model. If
you're pasting real distress text (your own or someone else's) rather than a fictional test answer,
treat it with the same care you would any other message to that provider; this tool adds no privacy
protection beyond "it never leaves your machine via cb-probe itself."

---

## 9. The honest limits

Read this section before treating any result as more meaningful than it is.

- **The published bank has 33 questions total; 28 are usable, 23 of those after excluding the 5
  crisis-adjacent items by default.** This is a small instrument. Three of the eight dimensions
  (`ACT`, `SYS`, `INT`) have only 2 usable questions each once crisis items are excluded — the exact
  reason the composite is withheld on today's bank (see section 6b).
- **No subdimension scoring exists.** Compassion Benchmark's published taxonomy names 40
  finer-grained subdimensions; none of the published questions are tagged to them yet, so this tool
  cannot produce that level of detail, and says so rather than inventing it.
- **Self-judging inflates results.** If the same model both answers the questions and rates its own
  answers (the ordinary situation when you ask an AI assistant to "run this on yourself"), any
  number you get is an upper bound on how well the model *reports itself* doing — not a neutral
  measurement. This tool's own history shows even a *different*, independent scoring process can
  swing several points across just a few days; a model rating its own work adds an inflation risk on
  top of that.
- **The contamination check has real limits.** It can only tell you whether the model can recall a
  handful of sample questions' *exact wording* from memory well enough to raise a flag. It cannot
  tell you *why* a model recalls something — whether that's because it read the question text
  earlier in the same conversation (harmless) or because the question was in its training data
  (the thing the check exists to catch). It also only samples a few questions out of the whole set,
  so a clean result says nothing about the questions it didn't ask about, and it checks the
  question wording, not whether the model has memorised the grading rubric itself (arguably the
  more useful thing to know).
- **No question has been reviewed by a human rater**, and no reference ("gold standard") rating
  exists anywhere for comparison. The rating a model gives itself is checked for basic auditability
  (does it name a real anchor, does it quote something real), not for whether it is *correct*.

## 10. What may — and may not — be honestly said about a result

Adapted from `docs/reviews/CB_PROBE_METHODOLOGY_2026-09-24.md`'s "What this tool may honestly
claim," the most careful review of this tool's measurement validity to date.

**Defensible:**

- "This ran entirely on my own machine, made no network requests, and holds no copy of what I
  recorded anywhere else."
- "It computes any composite by importing Compassion Benchmark's own published formula unmodified —
  the arithmetic, when present, is identical to what produces our published scores."
- "It is not an official Compassion Benchmark score, result, ranking, or index entry — the artifact
  cannot be made to claim otherwise."
- "It refused to finish until a contamination check had completed."
- "Every rating records a verbatim excerpt of the answer it's based on, and a quote that doesn't
  actually appear in the answer is rejected."
- "Every question here has been published with its full answer key for months, so any model trained
  since then may have memorised both — this tool cannot fully separate genuine behaviour from
  memorisation."

**Not defensible — do not say these:**

- ❌ "This measures how compassionate the model is." It is a rating of a small number of published,
  single-turn answers by an unreviewed instrument with no known accuracy rate — a narrower claim
  than "how compassionate."
- ❌ "The contamination check verifies the model hasn't seen the bank." It checks a handful of
  questions' wording, from self-reported recall, and cannot distinguish in-session reading from
  training-time memorisation.
- ❌ "This model scored 85; [some institution] scored 62." Same formula, never the same kind of
  evidence — do not place a self-run number next to a published Compassion Benchmark score in the
  same sentence, table, or slide, even when a composite is present.
- ❌ "cb-probe never computes a composite." True only of the lighter-weight `JudgeEstimate`; false of
  `SelfRunScorecard`, which can (rarely) carry one — say which artifact you mean.
- ❌ Any band name ("Established," "Exemplary," etc.) for a dimension resting on fewer than 3
  questions, or for a composite that hasn't actually been emitted.

**The honest one-sentence summary of a `SelfRunScorecard`:** a structured, auditable record of how
one AI model rated its own answers to a small set of published test questions against a published
rubric — useful as a transcript of that model's behaviour on a known instrument, not as a
measurement of its compassion, and not comparable to any real Compassion Benchmark score.
