# AI model report — discoverability and answer-engine citation (SEO/AEO panel input)

Panel input, 2026-10-01. Sources: `research/model-runs/pilot-2026-10-01/analysis.json` (canonical), `research/model-assessments/pilot-2026-10-01.md`, `site/src/app/ai-models/page.tsx`, `site/src/components/seo/*`, DECISIONS.md D-29.

**Precondition.** D-29 says: "No model composite or band, anywhere, in any form." The pilot write-up also says it is "Not publishable under D-29 as ratified." Everything below assumes a founder amendment to D-29. If no amendment is made, use the composite-free fallback in §4.

## 1. Route, canonical, title and meta

- **Route:** `/ai-models/reports/<run_id>`, so this report lives at `/ai-models/reports/pilot-2026-10-01`. The slug is `analysis.json.run_id` exactly. That makes it deterministic and traceable, and it puts the word *pilot* in the URL. Answer engines often quote a bare URL, so the status travels with it.
- **Future waves:** use the same pattern (`/ai-models/reports/<run_id>`). An official wave's run_id must not contain "pilot". Don't build a `/ai-models/reports` hub until there are two or more reports, because a one-item hub is a thin doorway page. Until then `/ai-models` is the hub.
- **Canonical:** self-referential and absolute (`https://compassionbenchmark.com/ai-models/reports/pilot-2026-10-01`). The report is immutable. Corrections go out as new dated records, never as edits to the URL.
- **Sitemap:** derive the entries from a `model-reports` manifest (same pattern as `specialBriefingsManifest` in `sitemap.ts`). Set `lastModified` to the publish date and `changeFrequency: "never"`. Update the comment on `aiModelPages` in `sitemap.ts:47-50` as part of the D-29 amendment.
- **Title pattern:** `{Status}: {N} {family} models on the AI Model Compassion Benchmark ({Mon YYYY})`
  - Here: **"Unofficial Pilot: Four Claude Models on the AI Model Compassion Benchmark (Oct 2026)"**
  - The status word comes first. The title never contains a model name, a number, or a superlative.
- **Meta description (157 chars):** "Unofficial pilot, 1 Oct 2026: four Claude models, 83 public items, blinded cross-model judging. Three larger models could not be told apart. No official score."
  - This deliberately leaves out Haiku. Any sentence about Haiku needs its length caveat, and a meta description can't carry that caveat safely.
- **OG image:** status text and the design facts only. No bar chart and no per-model numbers. An image of four bars is a leaderboard screenshot whatever the caption says.

## 2. Structured data

**Emit exactly one `Report` node.** `Report` is a schema.org subtype of `Article` and adds `reportNumber`. Proposed shape:

```json
{
  "@context": "https://schema.org",
  "@type": "Report",
  "headline": "<title above>",
  "reportNumber": "pilot-2026-10-01",
  "creativeWorkStatus": "Unofficial pilot — not an official score; comparability: none",
  "abstract": "<citable sentence 1> <citable sentence 2>",
  "datePublished": "<publish date>",
  "dateCreated": "2026-10-01",
  "author":    { "@type": "Organization", "name": "Compassion Benchmark", "url": "https://compassionbenchmark.com" },
  "publisher": { "@type": "Organization", "name": "Compassion Benchmark", "url": "https://compassionbenchmark.com" },
  "isPartOf":  { "@type": "WebPage", "@id": "https://compassionbenchmark.com/ai-models" },
  "isBasedOn": "https://compassionbenchmark.com/data/model-runs/pilot-2026-10-01/analysis.json",
  "citation":  "https://compassionbenchmark.com/ai-models/methodology",
  "isAccessibleForFree": true
}
```

- **`isBasedOn` source file:** copy `analysis.json` into `site/public/data/model-runs/<run_id>/` at prebuild, in the same way `export-public-data.mjs` works. The machine-readable evidence then sits on our own host and anyone can verify it.
- **Author:** use only the Organization. Don't add a named person unless a real human author signs the report.
- **Breadcrumbs:** emit `BreadcrumbList` as Home → AI Models → this report. Leave out a "Reports" crumb because no page exists for it.
- **FAQPage:** add an FAQPage on the report only if the Q&A is rendered visibly. Google restricts FAQ rich results to authoritative government and health sites, so the value here is for answer engines, not for rich results.

**Rejected types:**

| Type | Why not |
|---|---|
| `ScholarlyArticle` | Signals a scholarly, peer-reviewed genre. This report is not peer reviewed. |
| `Dataset` | Not for a pilot. D-29 ties `Dataset` to registry entries (still 0). Google Dataset Search would surface it as "AI model compassion scores". The template can turn it on only when `official === true`. |

**Must never be marked up on any `/ai-models/**` route:**
- `Review`, `Rating`, `AggregateRating`, `ClaimReview`
- `ItemList` / `ListItem` with `position`
- `SoftwareApplication` or `Product` nodes for the models, with or without ratings
- `additionalProperty` holding a composite
- `sameAs` that binds `claude-opus` to a versioned product. The access tier is "snapshot id unverifiable", so a `sameAs` link would invent an identity.
- `speakable` on anything except the status lead.

## 3. FAQ JSON-LD on `/ai-models`: required changes

The current answer to Q1 says "No model has been scored." After this report publishes, that sentence is false. The lead banner, the `metadata` title ("No Model Scored Yet") and the "Not accurate: … any model 'score' from this site" line become false too.

Wording rule: say **"no model has an official score"**, never "no model has been scored". `F.evaluatedModelCount` stays 0 and keeps meaning *official*.

Every figure below comes from a facts module (`model-pilot-facts.ts`) that reads the copied `analysis.json`. None of it is hand-typed, per repo convention.

**Q: Which AI model is the most compassionate?**
A: Compassion Benchmark has not determined which AI model is most compassionate and publishes no ranking of AI models. No model has an official score. Its only model results come from an unofficial pilot dated 1 October 2026, which tested four Claude models under blinded cross-model judging. In that pilot, three of the models (claude-fable, claude-opus and claude-sonnet, in alphabetical order) could not be told apart: every paired difference had a 95% interval that included zero. claude-haiku scored lower, but its replies were much shorter, and the design cannot separate weaker answers from a penalty on brevity. All subjects and judges were Claude models and the test items are public, so the pilot supports no comparison with any other model.

**Q (new): What did the October 2026 pilot find?**
A: Four Claude models each answered 83 public items three times. That produced 996 responses, each rated by two judges that were never the subject's own model. The pilot separated a small model from larger ones but did not separate the larger ones. Empathy was the lowest dimension for all four, partly because of the instrument. Neither contamination probe flagged any model. Every scorecard is marked `official: false` and `comparability: none`.

**Q (new): Does the pilot show that smaller AI models are less compassionate?**
A: No. claude-haiku's composite was 40.2 (95% interval 36.6–44.2), but its median reply was 137 words against 310–411 for the others, and longer replies scored higher across models. Removing that length effect entirely would put it at 57.5. Compassion Benchmark calls that figure an extreme bound, not an estimate. The pilot cannot say how much of the gap is the model and how much is reply length.

**Q (amend): "How many task items…"** Keep it as is, and add that the pilot drew on 83 of them.

**Name order:** fable > opus > sonnet is also alphabetical order. Any list of those three therefore reads as a ranking unless it is labelled "alphabetical order" in the same sentence. This applies to tables too (see §5).

## 4. Citable sentences

Each sentence names the institution, the date and the status, so it can be quoted alone.

1. "On 1 October 2026 Compassion Benchmark ran an unofficial pilot in which four Claude models answered 83 public test items three times each, producing 996 responses and 1,992 ratings from judges that never rated their own model." — `design.items_served`, `design.trials_per_subject`, `design.responses`, `design.ratings`, `design.self_judging`
2. "In Compassion Benchmark's unofficial October 2026 pilot, claude-fable, claude-opus and claude-sonnet (alphabetical order) could not be distinguished: all three paired differences had 95% intervals that included zero." — `pairwise[].separated` (all three are false)
3. "In the same pilot claude-haiku's composite was 40.2 (95% interval 36.6–44.2), but its median reply was 137 words against 310–411 for the other models, and the design cannot separate weaker answers from a penalty on short replies." — `subjects.claude-haiku.composite`, `.interval95`, `.median_reply_words`; `length.pooled_within_item_r`
4. "Removing the pooled length effect would raise claude-haiku's pilot composite to 57.5, a figure Compassion Benchmark describes as an extreme bound, not an estimate." — `length.composite_if_pooled_slope_removed.claude-haiku`, `length.note`
5. "Empathy was the lowest of the eight dimensions for all four models in Compassion Benchmark's October 2026 pilot." — `subjects.*.dimensions.EMP` (lowest in all four rows)
6. "Neither contamination probe in the October 2026 pilot indicated memorisation for any of the four models, a result that clears only the sampled items, not the whole bank." — `subjects.*.contamination.indicated`
7. "claude-haiku was excluded as a judge but kept as a subject after 100 of its 498 evidence quotes failed the harness's verbatim check, a protocol change disclosed as post-hoc." — `exclusion_record.measured_original_answer_stats.claude-haiku.quote_not_verbatim`, `.disclosure`
8. "The pilot is not an official Compassion Benchmark score: every scorecard is marked official: false and comparability: none, and all subjects and judges were Claude-family models." — `status`, `design.judge_family`

**Discrepancy to fix before publishing:** the pilot write-up (§3) says "73 of 498… plus 29 normalisation-only near-misses" (102 in total). `analysis.json` says `quote_not_verbatim: 100`, of which 34 are normalisation-only (66 strict). Use the `analysis.json` figures and correct the write-up.

**Composite-free fallback** (if D-29 is not amended): use sentences 1, 2, 5, 6 and 8, and swap 3 and 4 for "claude-haiku was the only model separated from the others, and the gap is confounded with reply length."

## 5. Anti-patterns: leaderboard snippets to prevent

- **Sorting the results table by composite.** The pilot write-up's §1 table already does this, and for these three models score order is the same as alphabetical order. Instead:
  - put fable, opus and sonnet in **one row-group** under the heading "Not separated", with the shared range 67.3–69.5 and the intervals;
  - put haiku in a separate row with the length column next to it;
  - caption: "Order carries no meaning."
- **Point composites without intervals.** Never give the three composites side by side in prose or `alt` text without their intervals. Prose uses the range.
- **Leaderboard words in ranking-bearing text.** Headings, titles, captions, `alt` text, link anchors, the OG image and JSON-LD must never use "top", "best", "most/least compassionate" (except inside the FAQ question that refuses the ranking), "leads", "beats", "#1", "rank", "winner", "leaderboard" or "scorecard results".
- **Band labels.** "Established" attached to a model gets lifted as an endorsement. Keep bands out of structured data, headings and the citable sentences.
- **Product names.** Never call the models "Claude Opus 4.x" or similar. Always use the served identifiers plus "access tier: agent".
- **Linking the report from the Anthropic entity on the AI Labs Index, or the reverse.** That fuses lab and model scores (D-23).
- **A per-model page or anchor** (for example `#claude-opus`). Each would be a doorway for "claude-opus compassion score".

**Mechanical guard** (route to frontend-engineer): `test:model-report-seo` scans built `out/ai-models/**`. It fails on:
- any of the forbidden schema types listed in §2;
- any leaderboard term (from the list above) within 60 characters of a subject id in `<title>`, `h1`–`h3`, `caption`, `figcaption`, `alt` or JSON-LD;
- any appearance of the three unseparated subject ids in a table body that is not inside a group labelled "Not separated".

## 6. Internal linking

**`/ai-models` → report**, from three places, all using the anchor text "unofficial pilot of four Claude models (1 October 2026)":
- the lead banner;
- a card in `#runs`;
- the FAQ answers.

**Report → other pages:**
- `/ai-models` ("AI Model Compassion Benchmark")
- `/ai-models/methodology` ("how model scoring works")
- `/methodology` ("the eight-dimension framework")
- `/dimensions/empathy` (from the Empathy finding)
- `/ai-evaluation-suite` ("run the same items yourself")
- the 2026-09-25 self-run section (`/ai-models#runs`)
- `/cite` (add a citation format for reports)

**Other surfaces:**
- **Daily briefing:** the briefing for the publish date links to the report once, with the same status-first anchor.
- **`llms.txt`:** rename the heading "AI models (… not yet scored)" to "AI models (no official scores; one unofficial pilot)" and add the report URL.
- **Not linked from:** AI Labs entity pages, the homepage hero, or any "rankings" nav item.

## Top 3 next moves, measurement, handoffs

**Top 3 next moves:**
1. Founder: amend D-29, choosing between the composites version and the fallback.
2. Rewrite the `/ai-models` FAQ, lead, title and "Accurate to say" block (§3), using derived facts.
3. Ship the report route with the `Report` JSON-LD and the guard test.

**What to measure:**
- Structured-data validation passes with zero errors.
- The guard test is green.
- Run a monthly manual check on ChatGPT, Perplexity, Gemini and Google AI Overviews with the queries "most compassionate AI model", "Claude compassion benchmark" and "is Claude Haiku less compassionate". Pass means we are cited and the status is preserved. Fail means any ranking is attributed to us, which would trigger a copy review.

**Handoffs:**
- **frontend-engineer:** route, table grouping, `model-pilot-facts.ts`, guard test.
- **backend-engineer:** prebuild copy of `analysis.json` and the reports manifest.
- **knowledge-architect:** wording of the "Not separated" table.
- **Founder:** D-29 amendment.
