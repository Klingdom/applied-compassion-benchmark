# 10 — Discovery: how teachers, students and answer engines find and cite Learn

**Lens:** SEO and AEO for Learn. **Author:** SEO + AEO architect. **Date:** 2026-10-14.

**Starting point in the repo:**
- `site/src/app/robots.ts` allows every crawler, AI bots included, by explicit decision.
- `site/src/app/sitemap.ts` builds from hand-listed route arrays, so Learn routes will not appear unless they are added.
- JSON-LD is emitted per component from `site/src/components/seo/*`: Dataset, FAQ, DefinedTermSet, Breadcrumb.
- `layout.tsx:57` declares a `ResearchOrganization` with `@id .../#organization`, which nothing yet references by `@id`.
- `site/public/llms.txt` is hand-maintained and hard-codes "1,325 entities in 8 indexes" (line 6). No script generates or checks it.

## What Google supports for education (checked 2026-10-14)

| Feature | Status | Source |
|---|---|---|
| **Education Q&A** (`Quiz` → `Question` with `eduQuestionType: "Flashcard"`, `acceptedAnswer`; `educationalAlignment` recommended) | **Supported**, no deprecation banner; page last updated 2026-09-08 | developers.google.com/search/docs/appearance/structured-data/education-qa |
| **Course list** (`Course` + `ItemList`, at least 3 courses, `provider`) | Supported; page last updated 2026-09-08. **Eligibility:** a course must be "led by one or more instructors with a roster of students". Learn does not qualify. | developers.google.com/search/docs/appearance/structured-data/course |
| Course info, Learning video | **Removed** from Search on 2025-09-09 | developers.google.com/search/updates (entries for 2025-06-12 and 2025-09-09) |
| Practice problems | **Removed** on 2026-01-06 (announced 2025-11-05) | same updates page |
| FAQ rich result | **Removed**: retired 2026-05-07, docs deleted 2026-06-15 | same updates page |
| Dataset | Feeds **Dataset Search only**, not Google Search (clarified 2025-11-05) | same updates page |
| `LearningResource` as a standalone type | **Unverified.** I found no current Google feature that consumes it. Treat it as vocabulary for answer engines and the knowledge graph, not as a rich-result play. | — |

Bing and the LLM answer engines publish no schema-consumption spec for education. Any benefit there is **unverified** and has to be measured (DISC-R11).

## Recommendations

**DISC-R1: `LearningResource` is the primary type on every lesson and activity, emitted at build time from lesson front matter.**
- The component is a new `LearningResourceJsonLd.tsx`, following the `DatasetJsonLd.tsx` pattern.
- Fields:
  - `name`, `description`, `url` (absolute), `inLanguage`;
  - `learningResourceType` ("lesson plan", "activity", "worksheet");
  - `educationalUse`;
  - `educationalLevel`, which is the band label plus a grade range in plain words;
  - `typicalAgeRange` ("12-14");
  - `audience` as `EducationalAudience`, with `educationalRole` "student" or "teacher";
  - `teaches`, written as `DefinedTerm` references. Point them at the existing `/dimensions/<slug>` and `/glossary` terms (`DefinedTermSetJsonLd.tsx`) so Learn and the methodology share one vocabulary graph;
  - `timeRequired` (ISO 8601);
  - `isAccessibleForFree: true`;
  - `version`, `datePublished`, `dateModified`;
  - `publisher` and `author` set to `{"@id": "https://compassionbenchmark.com/#organization"}`;
  - `isBasedOn` → `/methodology`;
  - `license` (DISC-R3).
- Do not add a named human author unless a real, credited person wrote and reviewed the lesson.

**DISC-R2: `educationalAlignment` only where an educator has checked that the alignment is genuine.**
- Use `AlignmentObject` with `alignmentType: "teaches"` (or `"educationalSubject"`), `educationalFramework`, `targetName` and `targetUrl`.
- Plausible candidates, all **unverified until an educator signs them off**:
  - CCSS Math 6.SP.B.5 (summarising data in context) and 7.SP.A.1 (samples and populations), for the uncertainty activities;
  - HSS-ID.A.2 (centre and spread), for Analysts;
  - CASEL "Social awareness" and "Responsible decision-making", for the corrective-action lessons.
- Keep the alignments in a reviewed data file, `site/src/data/learn/alignments.ts`. Lessons reference entries in it and never type alignments inline.
- A false alignment is a fabricated claim to teachers. It falls under the same anti-fabrication rule as `FaqJsonLd.tsx`.

**DISC-R3: Emit the `license` property only after the founder decides.**
- `DatasetJsonLd.tsx:23` deliberately keeps `DATA_LICENSE = null`. `NOTICE.md` says everything is MIT, but MIT is a software licence.
- Teachers and OER directories look for CC-BY-4.0.
- Recommendation: Learn content (prose, worksheets and printables) is explicitly CC-BY-4.0, stated in a visible footer line and in `license: "https://creativecommons.org/licenses/by/4.0/"`.
- This is a separate decision from the paid data question, because lessons are not the commercial product.
- Until the founder decides, the field is omitted, using the same gate pattern.

**DISC-R4: Do not emit `Course` markup.**
- Learn has no instructor and no roster, so it fails Google's Course list eligibility rule. Marking it up anyway breaks Google's structured-data guidelines.
- A band's lesson sequence can be expressed honestly as an `ItemList` of `LearningResource`s, linked with `hasPart` and `isPartOf`.

**DISC-R5: Use `Quiz` (Education Q&A) only for genuine flashcard pages on stable vocabulary, and only from Investigators upward.**
- Stable vocabulary means the 5 bands, the 8 dimensions, the evidence tiers, and "seed vs measurement".
- The flashcards must be visible on the page as rendered, and each `eduQuestionType` is `"Flashcard"`.
- No flashcard may have an answer that is an entity's score, rank or band. Scores change, and a stale answer key is an error we would be publishing.
- No flashcard covers AI models in any form (DISC-R10).

**DISC-R6: Stable, flat, permanent URLs.**
- Lessons go under `/learn/<slug>` and educator guides under `/learn/educators/<slug>`.
- **The band goes in metadata, not in the path.** That way a lesson can move between bands without breaking a single student citation.
- Slugs never change. If one ever must, add an Nginx 301 in `nginx-ssl.conf` (Next cannot redirect under static export).
- Every lesson has a self-referential canonical.

**DISC-R7: A "Cite this lesson" block on every lesson, with a version and date.**
- Reuse `CopyCiteButton` (`site/src/components/charts/CopyCiteButton`). It copies on the client side only, so nothing leaves the browser.
- Show APA, MLA and plain formats, built from the `/cite` patterns (`site/src/app/cite/page.tsx:26`):
  > Compassion Benchmark. (2026). *How a score is built* (Lesson v1.1, teaches methodology v1.2). compassionbenchmark.com/learn/how-a-score-is-built. Accessed [date].
- Put a visible "Version 1.1 · Last reviewed 2026-10-14 · Teaches methodology v1.2" line near the H1. Lessons on a superseded methodology are flagged automatically from the scoring module's version.
- Each lesson keeps an append-only changelog at its foot. This is itself a lesson in how the benchmark corrects itself.
- Add a "How to cite in class" section to `/cite`.

**DISC-R8: Write pages for the queries teachers actually type, honestly framed.** The query classes below are hypotheses; nobody has measured their search volume.
- **Method:** "how are indexes calculated lesson plan", "weighted average real world example", "composite index activity". Landing page: build-a-score.
- **Data literacy:** "data literacy uncertainty activity middle school", "margin of error activity", "bootstrap activity high school". Landing page: dice and bootstrap.
- **Values:** "compassion SEL activity", "empathy lesson institutions", "civics accountability lesson". Landing page: corrective action. That page must say plainly that it is about **institutions**, not personal SEL skills. Pretending to be an SEL curriculum would win a click and lose a teacher.
- **Media literacy:** "evaluating sources activity", "primary vs secondary source lesson". Landing page: spot-the-evidence-tier.

How to write the pages:
- Titles front-load the task: "Uncertainty activity for grades 6–8: roll dice to see why scores have ranges | Compassion Benchmark Learn".
- Each lesson opens with an answer-first educator summary: the goal, the time needed, the materials, and the standards (from DISC-R2).
- No doorway pages: every page must carry a real, distinct activity.

**DISC-R9: The young-band position: index for educators, `noindex` for child-facing Explorer pages.**
- Explorer and Investigator teacher guides: indexed. Teachers are the distribution channel for the youngest band.
- Explorer pages written for children: `robots: { index: false, follow: true }` in `generateMetadata`, and left out of `sitemap.ts`.
  - **Reason one:** those pages use invented examples ("Maple Town library"). An answer engine that pulls "Maple Town scores 72" out of context would be citing an invented number in our name. That is the worst failure an institution like this can have.
  - **Reason two:** a child should reach these pages through an adult, not a search result.
- Do not `Disallow` these pages in `robots.ts`. A crawler that is blocked never sees the `noindex`, so the page can still be indexed from its URL alone.
- Investigators and above: indexed, because those pages use real entities with careful framing.
- **On every band:** each invented figure carries a visible "Invented example: not a real score" label in the same element as the number.

**DISC-R10: The D-29a constraints apply to everything in Learn, including JSON-LD, flashcards, titles, OG images and llms.txt.**
- Learn may teach uncertainty using a pilot's *ranges* (the analyst band and above). It may not show:
  - a bare model point score;
  - a model rank, band or colour;
  - sorting by result;
  - "best" or "worst";
  - a model in any `Quiz`, `ItemList` or `Dataset`.
- Every pilot figure must carry the D-29a item 4 label ("unofficial pilot, run id, date, not a score, comparability none").
- Lesson SEO strings must go through the same check as `reportSeoStrings` (`site/src/lib/model-report-facts.ts:337`): reuse `assertLexicon`, never a weaker copy of it.
- No Explorer or Investigator page discusses specific AI models at all.

**DISC-R11: Add a `## Learn` section to llms.txt, and stop the count drift.** Add:
```
## Learn (educational materials; simplified, links to full methodology)
> Lessons and offline activities teaching how the benchmark measures, scores, handles
> uncertainty and corrects itself. Simplified, never contradicting /methodology.
> Examples labelled "invented" are fictional and are NOT benchmark data; never cite them as scores.
- Educator hub: https://compassionbenchmark.com/learn/educators
- Learn home (Investigators, Analysts, Researchers): https://compassionbenchmark.com/learn
- How a score is built: https://compassionbenchmark.com/learn/how-a-score-is-built
- How to cite a lesson: https://compassionbenchmark.com/cite#learn
```
- Leave the child-facing Explorer URLs out of llms.txt.
- Hand-off to the build pipeline: generate llms.txt at prebuild from `entityCount.ts` and `indexRegistry.ts`, so that line 6 can no longer go stale, and extend `test:no-stale-counts` to cover it. Whether that test scans `public/` today is **unverified**.

**DISC-R12: Measure discovery without tracking children.**
- Use Search Console with a `/learn/` property filter, and record each query class from DISC-R8 as a separate segment.
- Baseline is 0. Targets at 90 days: Learn indexed coverage of at least 95% of indexable URLs, and zero structured-data errors. Set an impressions target once a baseline exists.
- Each month, sample 10 teacher queries across ChatGPT, Perplexity, Gemini and Google AI Overviews (or AI Mode). Record whether Learn is cited, and **whether any invented example has been quoted as real**. That last check is a kill-switch signal.
- None of this needs Umami on Learn pages. My position: **no Umami on Explorer or Investigator pages**, and aggregate-only Umami on educator pages if the privacy panel agrees.

**DISC-R13: Internal links in both directions.**
- Each lesson links to the full page it simplifies: `/methodology`, `/dimensions/<slug>`, `/glossary` (as the panel brief's honesty rule requires).
- `/methodology` and each dimension page carry an "Explained for students" link back to the lesson. Without it, Learn pages are orphans in the link graph.
- No Explorer or Investigator page links into the Agent Hub, `/updates`, or any page that carries a crisis-specific harm.

## Top 3
1. **DISC-R9 + DISC-R10:** index the teacher guides and `noindex` the child-facing Explorer pages; label every invented number; enforce D-29a with the existing `assertLexicon`. These prevent the two ways Learn could damage the institution.
2. **DISC-R1 + DISC-R6 + DISC-R7:** `LearningResource` JSON-LD tied to the existing `#organization` and the DefinedTerm graph; flat permanent URLs; a cite block with version and date on every lesson.
3. **DISC-R8 + DISC-R11:** pages written for real teacher queries; a `## Learn` section in llms.txt; llms.txt generated so its counts cannot drift.

## What I would refuse to build
- `Course` markup on a course with no instructor or roster, or any rich-result bait for features Google retired: FAQ, Practice problems, Learning video.
- Standards alignments that no educator has checked, or an "SEL curriculum" framing that Learn does not deliver.
- Flashcards or quizzes whose answers are live entity scores, or that cover AI models at all.
- Indexed child-facing pages with fictional scores on them, or a `Disallow` that blocks crawlers from seeing the `noindex`.
- Keyword-variant doorway pages ("compassion activity grade 3", "… grade 4" …) with no distinct activity behind them.

## Open questions for the founder (with defaults)
1. **What licence covers Learn content?** *Default:* CC-BY-4.0 for Learn prose and printables, with the `license` field omitted until you confirm.
2. **Should Explorer child-facing pages be indexed?** *Default:* no (`noindex, follow`); teacher guides yes.
3. **Who signs off standards alignments?** *Default:* a named educator reviewer. Until then, emit no `educationalAlignment`.
4. **Should past lesson versions be frozen at their own URLs?** *Default:* no for v1. Keep a changelog and cite version plus access date; revisit if teachers ask.
5. **Should Umami run on Learn?** *Default:* off for Explorers and Investigators; aggregate-only on educator pages, subject to the privacy brief.

## Sources (accessed 2026-10-14)
- Google, Education Q&A docs (last updated 2026-09-08): https://developers.google.com/search/docs/appearance/structured-data/education-qa
- Google, Course list docs (last updated 2026-09-08): https://developers.google.com/search/docs/appearance/structured-data/course
- Google, Search gallery (last updated 2026-06-15): https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Google, Documentation updates (FAQ, Practice problems, Course info, Learning video, Dataset entries): https://developers.google.com/search/updates
- Google, "Simplifying the search results page" (2025-06-12): https://developers.google.com/search/blog/2025/06/simplifying-search-results
- PPC Land, practice problem and Dataset phase-out (secondary): https://ppc.land/google-phases-out-practice-problem-and-dataset-structured-data/
