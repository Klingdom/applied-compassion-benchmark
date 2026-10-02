# SEO/AEO narrative review: `reports/pilot-2026-10-01.md`

2026-10-01, seo-aeo-architect. Binding: template §D, §G. Figures checked against `waves/pilot-2026-10-01.json`.

## 1. Title, dek, first two sentences

- **H1:** fine. No model, number or superlative.
- **`<title>`, meta, abstract:** missing. Front matter has no `seo_title`, `meta_description` or `abstract`, and no route consumes them. An engine will fall back to the H1 and lose the status. Add (tokens, if front matter resolves them):
  - `seo_title: "Unofficial Pilot: {{derived.subject_count|n0}} Claude Models on the AI Model Compassion Benchmark (Oct 2026)"`
  - `meta_description: "Unofficial pilot, 2026-10-01: Claude models judged by Claude models. The test told one model from three others and could not tell the three apart. Not a score."`
  - `abstract`: sentences S2 and S6 below (no composite).
- **Dek:** safe. It names no winner. It does drop the institution and date when lifted, so prepend them: "Compassion Benchmark's unofficial pilot of four Claude models (2026-10-01) separated one model from the other three, a gap tangled up with reply length, and could not tell the three apart. Every model tested and every judge was a Claude model. None of this is a score."
- **First two sentences:** "This is an unofficial pilot. It is not a Compassion Benchmark score…" The status is right, but the subject isn't self-contained. Replace with: "On 2026-10-01 Compassion Benchmark ran an unofficial pilot (`pilot-2026-10-01`) on {{derived.subject_count|n0}} Claude models. It is not a Compassion Benchmark score, and no AI model has an official score." `derived.subject_count` is in `STATUS_NUMERIC_ALLOW`.

## 2. Citable sentence per section

**Already qualify:** May say, line 25 (non-separation) and line 28 (status); Cite, line 202. **Exempt:** Duty of care (§B3 forbids nearby figures), Next wave (date banned by `R-next-wave-date`).

**Missing. Add each as the section's closing sentence:**

- **S1 Status:** the replacement in §1 above.
- **S2 Why:** "Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`) tested the instrument, not the models, and is not a score."
- **S3 Design:** "On 2026-10-01, Compassion Benchmark's unofficial pilot (`pilot-2026-10-01`; not a score) had {{derived.subject_count|n0}} Claude models answer {{design.items_served|n0}} public test items {{design.trials_per_subject|n0}} times each. That produced {{derived.responses_total|n0}} replies and {{derived.ratings_total|n0}} ratings from Claude judges that never rated their own model."
- **S4 Separation:** "On 2026-10-01, Compassion Benchmark's unofficial pilot (`pilot-2026-10-01`; not a score) could not tell claude-fable, claude-opus and claude-sonnet apart (alphabetical order; agent tier, snapshot unverified). For each pair the range of the difference includes zero, which is not the same as equal." This sentence deliberately has no figure.
- **S5 Separated model:** "In Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`; not a score), claude-haiku (agent tier, snapshot unverified) was separated from the other three models, with a pilot range of {{subjects.claude-haiku.pilot_composite_interval95|range}}. The direction held for every judge. Its median reply was {{subjects.claude-haiku.median_reply_words|n0}} words, against {{derived.median_words_group_range.0|n0}} to {{derived.median_words_group_range.1|n0}} for the others, and the cause is unresolved: reply length is a confound."
- **S6 Dimensions:** "In Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`; not a score), {{derived.dimension_bonferroni_separated_among_group|n0}} of {{derived.dimension_comparisons_among_group|n0}} corrected dimension comparisons among claude-fable, claude-opus and claude-sonnet (alphabetical order) showed a difference."
- **S7 Instrument health:** "In Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`), neither contamination probe flagged any of the {{derived.subject_count|n0}} models. That result covers only {{subjects.claude-fable.contamination.recall_items_probed|n0}} recall items and {{subjects.claude-fable.contamination.identification_asked|n0}} identification questions per model, not the public bank."
- **S8 Deviations:** "In Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`), claude-haiku was removed as a judge but kept as a subject. This was a post-hoc change triggered by a pre-existing quote check: {{quote_grounding.judges.claude-haiku.not_found|n0}} of its {{quote_grounding.judges.claude-haiku.ratings|n0}} evidence quotes were not found in the reply, and {{quote_grounding.judges.claude-haiku.normalisation_only|n0}} more matched only after normalisation." This matches the §D citable set: 73 plus 29 of 498.
- **S9 Not scores:** "Compassion Benchmark's unofficial pilot of 2026-10-01 (`pilot-2026-10-01`) is not a score and cannot be compared with the AI Labs Index or any other wave. Every subject and judge was a Claude model, no human rated any reply, and {{bank.items_validated|n0}} of {{bank.items_total|n0}} items have passed human review."
- **S10 Bar:** line 171 contains `{{MISSING:…}}`, which blocks the build. Until founder decision K2, replace it with: "As of 2026-10-01, Compassion Benchmark has not set the publication bar for an official AI model score, and the unofficial pilot (`pilot-2026-10-01`) meets none of the requirements listed below."

## 3. Sentences that are risky to quote alone

| Line | Risk | Safer rewrite |
|---|---|---|
| 86–88, point column | Points read 69.5, 68.5, 67.3. Alphabetical order is also descending order, so a scraped table becomes a ranking. | Show "not shown" in the point column for the Not-separated rows, as the pairwise table already does. Keep the point for claude-haiku only. |
| 123 | "Empathy had the lowest mean … for every model" gets lifted as "Claude worst at empathy". | "Empathy had the lowest mean of the eight dimensions for every model, which we read first as a finding about the test: a review found that several empathy items could not set up the situation they test." |
| 107 | "Its figure would then rise to {{…}}" can be lifted as claude-haiku's result. | "Only under the extreme assumption that every difference between models is length would claude-haiku's figure be {{length.composite_if_pooled_slope_removed.claude-haiku\|n1}}, a limit and not an estimate of its result." |
| 140 | "rated each other's replies above the item mean" reads as collusion. | Merge it with the artefact caveat into one sentence: "…above the item mean, a comparison that claude-haiku's lower ratings pull down, so positive values are partly artefact." |
| 142 | "Neither probe flagged any of the four models" reads as "clean". | Use S7. |
| 103 | "longer replies were rated higher" can be lifted as a judge-bias finding. | Prefix "In this pilot, on the same item, …" |

## 4. Headings

The fixed H2s and the bold run-ins imply no result order. "Not separated" is listed before "Separated" in both tables, which is correct. Nothing to change.

## 5. My /ai-models FAQ against the draft and §F9/§G

- **Q1 "Which AI model is the most compassionate?":** still true, with one fix. Change "claude-haiku scored lower" to "claude-haiku was rated lower by the judges, with reply length an unresolved confound". Replace "95% interval that included zero" with "the range of the difference includes zero; that is not the same as equal".
- **Q2 "What did the pilot find?":** partly false or non-compliant. Drop 83 and 996, because §F9 says words only. "Separated a small model from larger ones" asserts size, which the draft disclaims; use "separated claude-haiku from the other three". "Empathy lowest, partly because of the instrument" asserts a cause; use "which the report reads first as a finding about the test". Contamination needs "on the sampled items".
- **Q3 "Smaller models less compassionate?":** no longer compliant. It cites the composite (40.2, 36.6–44.2), the word counts and the bound (57.5), which §G conflicts and §D ("bound not citable") forbid. Replace with: "No. In Compassion Benchmark's unofficial pilot of 2026-10-01, the judges rated claude-haiku lower, but its replies were much shorter, and the pilot cannot separate the model from the length of its replies. It also gives no basis for any claim about model size."
- **Items amendment:** drop "83". Link the report instead.
- **Report route:** the draft has no visible Q&A, so emit no FAQPage there (§C, §G).
- **Unchanged:** `page.tsx:49` still says "No model has been scored"; the rule in §F2 still applies.
