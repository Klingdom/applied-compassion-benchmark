# AI model pilot report — information design (knowledge-architect) · 2026-10-01

**Notation.** `{A.x}` = `research/model-runs/pilot-2026-10-01/analysis.json` field `x`; `{pair(a,b)}` = the `pairwise[]`
entry with those `a`/`b` keys (l.172-233); `{F.x}` = `MODEL_INDEX_FACTS.x`. No figure below is typed. Record =
`research/model-assessments/pilot-2026-10-01.md`.

**Blocking before any copy ships**
1. **Record vs data disagree on the judge exclusion.** Record l.65-67: "73 of 498 … (14.7%) … plus 29 near-misses … dropped
   entries from 9 batches". analysis.json l.290-292: `quote_not_verbatim` 100, `of_which_normalisation_only_near_miss`
   34, `dropped` 0. The packet (l.18) repeats 14.7%. The report cites analysis.json only; the record needs a dated
   reconciliation note first.
2. **Fields the narrative needs that do not exist yet** (add to `analyze-pilot.mjs`, never hand-compute):
   oriented gaps (larger model minus Haiku, positive); gap-under-length-bound per pair; judge-leniency-toward-Haiku
   min/max; chance-agreement baseline; per-dimension intervals (only means exist, l.38-47); share of ratings at level 5;
   reason `items_served` (l.14) ≠ `{F.itemCount}`. If a field is absent, its sentence does not render. Packet default #2 ("per-dimension
   intervals only") is unbuildable from today's data.
3. One route requires the D-29 amendment (D-29 l.638-639 caps at two pages; l.657 bans composites "in any form").

---

## 1. Narrative outline (~3,000 words, one route)

Design rule: **caveats sit inside the finding they qualify**, not only in a back-section, so a reader who stops at any
section still has the right size of claim.

| # | Section | Words | The one takeaway |
|---|---|---|---|
| 0 | Status line + answer-first lead | 150 | An unofficial pilot; it told apart one small model from three larger ones, and nothing else. |
| 1 | At a glance + "can / cannot say" box | 300 | Three sentences you may quote; four you may not. |
| 2 | Why run an unofficial pilot | 250 | It tests the instrument, not the models — and that test can fail informatively. |
| 3 | How the test worked | 350 | Models never saw the rubric, never judged themselves, every reply had two judges. |
| 4 | Finding 1: three models could not be told apart | 400 | "Not separated" means "we can't tell", not "equal". |
| 5 | Finding 2: the smallest model scored lower — and wrote much less | 450 | The gap is real in this data; *why* it exists is unresolved. |
| 6 | Finding 3: what the instrument learned about itself | 350 | Empathy is lowest everywhere — possibly a test flaw; no contamination found; one judge removed by a pre-existing check. |
| 7 | Why these are not scores | 350 | Same family wrote, took and marked the test; nothing human-checked. |
| 8 | What the next wave must change | 250 | Outside judges, length-matched replies, validated items. |
| 9 | Duty of care · how to cite · the record | 100 | Not advice on which AI to use in a crisis. |

Section-level rules: §4 precedes §5 because "cannot rank the three" is the claim most at risk of being lost; §5 ends
with "What this does not show"; subjects are listed alphabetically everywhere (fixed order, never by result).

**Numbers policy (pending amendment).** Lead with **pairs, not levels**. The pilot's valid output is *within-run
comparisons* (`separated`, l.181-231); per-subject composites (l.32, 67, 102, 137) invite a league table and violate
`comparability:none`. Recommend: §4-5 show a pairs table (difference + range + "told apart? yes/no"); per-subject
composites appear, if the amendment allows at all, only in an appendix table sorted alphabetically with band omitted.

## 2. Explaining the hard ideas to a lay reader

**"Not separated."** Never paraphrase as "tied", "equal", "neck and neck" or "about the same".
> "For each pair of the three larger models, the difference could plausibly be zero or could favour either one. This
> pilot cannot say which is higher — not that they are the same."

**95% interval (range).** Name the one source of uncertainty it covers, and say the real uncertainty is wider.
> "The range shows how much the result moves when we re-draw which questions were asked
> ({A.method.interval}). It does not account for the judges being from one family or for model versions we could not
> pin, so the true uncertainty is larger than the range shows."
> "When a range for a difference crosses zero, we cannot tell which model is ahead."

Format: always "{lo} to {hi}", never "±" (Fable's range is asymmetric, l.34-37); one decimal max; never show a point
estimate without its range.

**Confound (length).** Concrete before abstract: lead with word counts.
> "Haiku's typical reply was {A.subjects.claude-haiku.median_reply_words} words; the others wrote
> {min…max of the other three median_reply_words}. Across models, longer replies scored higher. Within each
> model, length barely mattered ({A.length.within_subject_slopes}, mixed direction), so judges were not simply
> picking the longer reply. But this design cannot tell 'Haiku's answers are weaker' from 'short answers get marked
> down'. If we assume *all* of the gap is about length — the most generous assumption for Haiku — the gap shrinks
> to {gap-under-bound fields}. That is a limit, not an estimate."

**Same-family judging.**
> "No model marked its own work. But every model tested and every judge came from one developer — like siblings
> marking each other's essays: not self-grading, but likely to share the same taste." Then the evidence:
> "The three larger models rated each other's replies above average ({A.judges.*.by_subject}, non-Haiku entries)."

**Why read an unofficial pilot.**
> "Before a thermometer is used on patients, you check it reads differently in hot and cold water. This pilot is
> that check. It found the instrument can tell a small model from larger ones, cannot yet tell larger ones apart,
> and may have a flaw in how it tests empathy. Those are things we needed to know before scoring anyone."

## 3. Answer-first lead and journalist box

**Status line (first element, full width):** "Unofficial pilot · not a Compassion Benchmark score · not a ranking ·
models with an official score: {F.evaluatedModelCount}."

**Lead (≤ 80 words, ≤ 1 number per sentence):**
> We ran four Claude models through our compassion test, with other Claude models marking the answers. The test
> could not tell the three larger models apart. It did score the smallest, Claude Haiku, clearly lower — but Haiku
> also wrote replies about a third as long, and this design cannot say which explains the gap. Because one developer
> supplied every model and every judge, and no human checked the items, none of this is a score.

("About a third as long" must be a derived ratio field, or replaced by the two medians.)

**What you can and cannot say (box, after the lead):**

| You can say | You cannot say |
|---|---|
| "In an unofficial pilot, Compassion Benchmark's instrument could not distinguish Claude Fable, Opus and Sonnet." | "[Model] is the most compassionate AI" / any order among Fable, Opus, Sonnet |
| "It scored Claude Haiku lower than the other three, a gap the authors say may partly reflect reply length." | "Haiku is less compassionate" (cause unresolved) |
| "All models and judges were from one developer; no human rated any reply." | "[Model] scored [n] on Compassion Benchmark" |
| "Compassion Benchmark has officially scored {F.evaluatedModelCount} models." | Any comparison with AI Labs or other index scores (`comparability: none`) |

Model names always carry the qualifier "run as an agent inside Claude Code; exact version unverifiable"
({A.design.access_tier}).

## 4. Reusable template for every assessment wave

**Fixed sections (must exist; render "none/not measured" rather than omit):**

| # | Section | Required content (all from that wave's analysis.json) |
|---|---|---|
| T1 | Status line | `official`, `comparability`, official-score count; machine-readable |
| T2 | Answer-first lead | The separation verdict in words, the largest unresolved confound, the largest bias |
| T3 | Can / cannot say | Generated from `separated` flags: any non-separated set produces a "cannot order" line |
| T4 | Design card | Subjects + access tier + version-pinned?; judges + family + self-judging; items served / pool / validated; trials; blinding; publication bar met N of M |
| T5 | Separation | Pairs table, alphabetical; "told apart: yes/no". Required even when nothing separates |
| T6 | Confounds checked | Length always, with bound; any new one named |
| T7 | Instrument health | Judge agreement **with chance baseline**; contamination per probe and scope; ceiling share; lowest dimension + whether instrument-attributable |
| T8 | Protocol changes | Every deviation tagged **pre-registered** or **post-hoc**, with trigger (e.g. the Haiku judge exclusion, l.280-283) |
| T9 | Why this is (not) a score | Disclosure stack ordered by how much it could distort results |
| T10 | Next wave must change | Each item tied to a T6/T7/T9 finding |
| T11 | Duty of care · citation · record links · correction policy (append-only) | Fixed text |

**Optional:** per-dimension profiles (intervals only); judge × subject leniency matrix; quoted replies (never from
crisis items without care review); comparison with a previous wave (only if both waves' `comparability` permits);
operations log detail; Q&A.

**Template invariants:** subject order alphabetical; banned verbs — ranks, leads, beats, outperforms, best, wins,
tied; every number a field reference; each section opens with its takeaway sentence; caveat in the same section as
the claim; no band colour or highlight on any subject.

## 5. /ai-models page: reading order now that results exist

Current order (page.tsx l.152-757): banner → hero → key facts → jump list/glossary → three objects → pipeline →
release watch → limits → runs (2026-09-25 self-run, l.520-584) → records → run it yourself → FAQ.

**What moves**
- **Hero lede (l.165-170)** gains one sentence: "An unofficial pilot tested the instrument on four models; it is not
  a score — read the report." Banner (l.152-157) gains Part B's clause (review l.737-738).
- **"Runs so far" moves up to directly after three objects**, as a *verdict-only* card: three bullets (could not
  separate three; separated one, length-confounded; not a score) + link to the report. Visitors now arrive asking
  "what did you find?"; burying it at position 9 forces a full scroll and invites third-party summaries to fill the
  gap. No numbers on the card beyond counts of models/judges.
- **Key facts (l.189-217)** gains one row: "Unofficial pilot runs: {count}. Not scores." Leave "Models with an
  official score" first.
- **Can/cannot say (l.237-249)**: the "Not accurate" clause is gated on `noModelScored`; add the pilot lines from §3
  unconditionally.
- **Jump list (l.119-128)**: relabel "Runs so far" → "Pilot results (unofficial)"; reorder to match.

**What shrinks**
- The four self-run panels (l.527-581) collapse into one run-log row + `<details>` (review B4). With two runs on the
  page, "100 out of 100" (l.532) next to pilot material becomes a false comparison; it belongs behind a disclosure.
- Pipeline, records and release watch stay as-is; they answer questions lower in the reader's order.

**Glossary additions (ModelGlossary):** separated / not separated, range, judge, same-family judging, access tier,
confound. Same words, same definitions, in report and page.

**Cognitive-load rules:** one number per sentence in any lead; no per-subject number on `/ai-models`; subject name
never without access-tier qualifier; full crisis note stays reachable from the first screen (l.250-253 already does).

## If you fix one thing

**Make the pairs table, not a scores table, the unit of the report**, and generate the "you cannot say" lines from
the `separated` flags. That single choice makes the honest finding (the instrument separates small from large, not
large from large) the most quotable artifact, keeps `comparability:none` structurally true, and carries over to
every future wave unchanged.
