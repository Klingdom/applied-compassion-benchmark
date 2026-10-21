# Data Model: AI Model Watch (catalog, release log, editions, Insights)

**Owner:** System Architect agent. **Date:** 2026-10-16. **Status:** For build. **Companion:** `docs/ARCHITECTURE_AI_MODEL_WATCH.md`. The PRD is `docs/PRD_AI_MODEL_WATCH.md`.

Global rules:
- JSON is written with 2-space indent and a trailing newline. Keys follow schema order and rows use a stable sort. No wall-clock timestamps, so generated files change only when their inputs change (DC-08).
- Dates are `YYYY-MM-DD`. No file carries a score, band, rank, composite or third-party benchmark result.
- `slugify` is imported from `scripts/lib/model-registry-validator.mjs` and never reimplemented.

---

## 1. File inventory

| Path | Written by | Read by | Committed |
|---|---|---|---|
| `research/ai-model-tracker/catalog-<d>.json`, `releases-<d>.json` | research agent | `import-model-watch.mjs` | yes |
| `site/src/data/model-watch/catalog-v1.json` | `model-watch:import` | facts, validator | yes |
| `site/src/data/model-watch/release-log-v1.json` | `model-watch:import` | facts, validator, edition compiler | yes |
| `site/src/data/model-watch/queue-snapshot.json` | prebuild `build-model-watch-data.mjs` (skips if `research/` is absent) | tested derivation | yes |
| `research/model-watch/editions/<d>.json` | edition author | `model-watch:edition` | yes |
| `site/src/data/model-watch/editions/<d>.json` | `model-watch:edition` (once) | pages, validator | yes |
| `site/src/data/model-watch/editions-manifest.json` | prebuild `build-model-watch-data.mjs` | pages, sitemap, llms, OG | yes |
| `research/insights/<slug>.md`, `research/insights/lint-allow.json` | writers | `build-insights.mjs` | yes |
| `site/src/data/insights/<slug>.json`, `manifest.json` | prebuild `build-insights.mjs` (skips if `research/` is absent) | pages, sitemap, llms, OG, lint | yes |
| `registry-v1.json`, `releases-v1.json`, `release-sources-v1.json` | **unchanged** | | |

## 2. Catalog: `catalog-v1.json`

```jsonc
{ "meta": { "schemaVersion": "1.0", "asOf": "2026-10-16", "rowCount": 0,
    "sourceFiles": [{ "path": "research/ai-model-tracker/catalog-2026-10-16.json", "sha256": "<hex>" }],
    "meaning": "Models listed from cited public sources. A listing is not an evaluation; no row carries a score.",
    "validator": "site/scripts/lib/model-watch-validator.mjs" },
  "rows": [ {
    "id": "string",                 // from research; ^[a-z0-9]+(?:[.-][a-z0-9]+)*$; unique; FROZEN once published
    "name": "string", "provider": "string", "providerSlug": "kebab",
    "family": "string|null",
    "releaseDate": "YYYY-MM-DD|null",
    "status": "current|preview|deprecated|retired",   // lifecycle fact, not quality
    "access": ["open-weights"|"api"|"consumer-app"|"restricted"],   // non-empty; string input normalised to [string]
    "licence": "string",            // as published, e.g. "Apache-2.0", "proprietary"; non-empty
    "modalities": ["text"|"image"|"audio"|"video"|"code"],
    "contextWindowTokens": "integer|null",
    "parameterCount": "string|null",   // disclosed text, e.g. "8B", "undisclosed"; numbers coerced to string
    "notes": "string",              // factual; lint MW-L*
    "sources": [ Source ],          // >= 1
    "benchmarkLocalTag": "string|null",   // join key only, NEVER rendered
    "firstListedOn": "YYYY-MM-DD",  // set on first import, never changed
    "lastVerifiedOn": "YYYY-MM-DD"  // = asOf of the latest import that contained the row
  } ] }
```

`Source = { "url": "https://…", "title": "string", "sourceType": SourceType, "accessed": "YYYY-MM-DD" }`. `SourceType` is one of `provider-announcement | model-card | system-card | documentation | technical-report | licence | news | other`. The first five are **primary**.

Rows are sorted by `provider`, then `name`, with `localeCompare("en", {sensitivity:"base"})` and `id` as the tiebreak. The page never re-sorts, and there is no sort-by-result anywhere.

## 3. Release log: `release-log-v1.json`

```jsonc
{ "meta": { "schemaVersion": "1.0", "asOf": "2026-10-16", "rowCount": 0, "sourceFiles": [ … ],
    "meaning": "Cited desk-research log of announcements. Not the release-watch store (releases-v1.json); counts are never combined." },
  "rows": [ {
    "id": "<date>--<slugify(providerSlug)>--<slugify(modelName)>--<kind>",   // derived, never authored
    "date": "YYYY-MM-DD", "provider": "string", "providerSlug": "kebab", "modelName": "string",
    "catalogId": "string|null",      // FK -> catalog rows[].id
    "kind": "new-model|new-version|update|open-weights-release|api-availability|deprecation|safety-documentation",
    "summary": "string",
    "safetyOrWelfareRelevant": true,
    "safetyNote": "string|null",     // required non-empty iff safetyOrWelfareRelevant
    "sources": [ Source ],           // >= 1, and >= 1 primary
    "loggedOn": "YYYY-MM-DD",        // import asOf when the row first appeared; FROZEN
    "releaseWatchId": "string|null", // optional later FK -> releases-v1.json release_id
    "corrections": [ { "date": "YYYY-MM-DD", "text": "string" } ]   // append-only
  } ] }
```

Rows are sorted by `date` descending, then `id`. **Frozen fields:** `id, date, provider, providerSlug, modelName, kind, loggedOn`. `sources` may only grow. `summary` and `safetyNote` change only together with a new `corrections[]` entry.

## 4. Import (`import-model-watch.mjs`)

Usage: `--catalog <path> --releases <path> --as-of <date> [--check] [--dry-run]`.

1. **Parse and normalise.** Trim strings. Lowercase enum values. Coerce `access` from a string to an array. Map known synonyms through a table in the script (for example `"open weights"` to `open-weights`). **Any other unknown enum value fails the import.** It is never guessed.
2. **Validate** the normalised research rows with `validateCatalog` and `validateReleaseLog` (section 6). Report every failure, then exit 1.
3. **Merge the catalog by `id`.**
   - New row: set `firstListedOn = lastVerifiedOn = asOf`.
   - Existing row: keep `firstListedOn`, replace the mutable fields, and set `lastVerifiedOn = asOf`.
   - Row missing from the input: keep it unchanged and WARN "not re-verified". Rows are never deleted.
4. **Merge the log by derived `id`.**
   - New row: set `loggedOn = asOf` and `corrections: []`.
   - Existing row: frozen fields must be equal (otherwise exit 1). Union `sources` by URL.
5. Sort, set `meta` (`rowCount`, `asOf`, `sourceFiles` sha256), and serialise.
6. `--check` writes nothing and exits 1 if the output would differ. Acceptance: importing the same inputs twice gives byte-identical files.

## 5. Weekly editions

**Authored source** (`research/model-watch/editions/<date>.json`):

```jsonc
{ "date": "2026-10-16",
  "window": { "from": "2026-09-01", "to": "2026-10-16" },
  "lead": "string, <= 90 words; digits only via {{RELEASE_COUNT}} {{DISCLOSURE_COUNT}} {{WINDOW_DAYS}} or window dates",
  "coverage": { "scanned": ["string"], "notScanned": ["string"] },   // both required; [] must be explicit
  "measuredNote": "string|null",
  "corrections": [] }
```

**Compiled edition** (`site/src/data/model-watch/editions/<date>.json`), produced once by `model-watch:edition -- --date <d>`. The compiler refuses to overwrite an existing file. The only exception is `--append-correction "<text>"`, which appends `{date: today, text}` and changes nothing else.

| Part | Field | Derivation (frozen at compile) |
|---|---|---|
| 1 Window and coverage | `window`, `asOf` (= `date`), `coverage`, `coverageStatement` | From the source. If `scanned` is empty, the statement reads "No scan ran for this window", never "nothing found". |
| 2 New releases | `releases[]` = copies of log rows where `window.from <= date <= window.to` **and** `loggedOn <= asOf` | Deterministic. A row added later never enters an old edition. |
| 3 Safety and welfare disclosures | `disclosures[]` = `{releaseId, provider, modelName, safetyNote, sources, label: "Provider's own disclosure, restated"}` for part-2 rows with `safetyOrWelfareRelevant` | No authored text. |
| 4 What we measured | `measured = {reports: [{runId, reportDate, href}], note}` from waves where `renderableEntries()` mode is `active` and `report_date` is in the window | Label and link only, never a figure. The empty case reads "Nothing published in this window." |
| 5 Queue status | `queue = {asOf: snapshot.updated_at, queued: n, measured: n, skipped: n, queuedDevelopers: [string]}` | Counts are computed. No timelines. |
| 6 Corrections and sources | `corrections[]`, `sources[]` (union of every cited source, deduplicated by URL, numbered), `independence: "fixed string"` | |
| meta | `title` (`AI Model Watch — <date>`), `lead` (tokens resolved), `contentHash` (sha256 of canonical JSON excluding `corrections`) | |

An edition cites only `releaseId`s and the sources attached to them. The authored `lead` may name only models that appear in its own `releases[]` (MW-E4).

**Manifest** (`editions-manifest.json`): `{ "editions": [{date, title, lead, windowFrom, windowTo, releaseCount, disclosureCount}] }`, newest first.

## 6. Validator rules (`model-watch-validator.mjs`)

Each rule is a pure function with no I/O, in the same style as `model-releases-validator.mjs`. Failures block the build; warnings do not.

| ID | Rule |
|---|---|
| MW-S1 | Required fields, types and enums (sections 2 and 3). `meta.rowCount === rows.length`. |
| MW-S2 | `sources.length >= 1`. Every `url` matches `^https://` and parses with `new URL`. `accessed` is ISO and not in the future. Log rows also need at least one primary source. Catalog rows without a primary source get a WARN. |
| MW-S3 | Catalog `id` unique and well-formed. Log `id` equals its derivation and is unique. |
| MW-S4 | Dates are ISO and not in the future. `loggedOn >= date` is not required, because the log can be backfilled. |
| MW-K1 | No key anywhere matches `FORBIDDEN_KEY_RE` (imported from `model-wave.mjs`) or `/composite\|percent\|elo\|mmlu\|arena\|accuracy/i`. |
| MW-L1 | `notes`, `summary`, `safetyNote` and edition `lead` contain no `BANNED` word (negatable rule honoured) and no `BAND_NAMES` match (case-sensitive), both imported from `model-report-template.mjs`. They also contain no `ENDORSE_RE` match. |
| MW-L2 | The same fields contain no benchmark-result claim: `/\d+(\.\d+)?\s?%\|\b(MMLU\|GPQA\|SWE-bench\|HumanEval\|Arena\|Elo)\b/i`. |
| MW-T1 | No text field contains a pilot-withheld token: `withheldValues(wave)` composites, interval ends and bounds for every wave, matched with `hasToken`. This is a G19 pre-check at data time. |
| MW-F1 | `catalogId` resolves to a catalog row. `benchmarkLocalTag` is null, or appears in `queue-snapshot.entries[].tag` or in some wave's `design.subject_builds[*].tag`. |
| MW-F2 | Log frozen fields equal their committed values (git HEAD when available, otherwise SKIPPED with a named warning). `sources` and `corrections` only grow. Catalog `id`s never disappear. |
| MW-X1 | Log rows carry no release-watch key (`release_id, registry_id, lifecycle, evidence, detected_in_scan, evaluation_disposition`). |
| MW-X2 | A non-null `releaseWatchId` exists in `releases-v1.json`. |
| MW-X3 | `registry-v1.json` and `releases-v1.json` are byte-unchanged by an import. The import script asserts this before and after writing. |
| MW-E1 | Each compiled edition has all six parts. `contentHash` recomputes. Edition date equals the filename. |
| MW-E2 | `releases[]` equals the part-2 derivation against the log restricted to `loggedOn <= asOf`, so a hand-edited release list fails. |
| MW-E3 | `lead` has no digit except resolved tokens and dates inside the window. Corrections are append-only, with ISO dates in ascending order. |
| MW-E4 | Model names in `lead` (matched by catalog naming) are a subset of the edition's `releases[].modelName`. |
| MW-E5 | The manifest lists exactly the compiled files. The first edition, `2026-10-16`, has window `2026-09-01..2026-10-16`. |
| MW-W1 | WARN when more than 10 days separate the build date from max(`catalog.meta.asOf`, newest edition date). |

## 7. Derived facts and "tested by us"

`scripts/lib/model-watch-tested.mjs` (pure) exports `testedStatus(row, {queue, renderable, waves})`:

1. If `row.benchmarkLocalTag` is null, the result is `not-yet`.
2. Collect the active entries from `renderableEntries(manifest, env)` with `mode === "active"` whose wave's `design.subject_builds` contains the tag. If any exist, return `{status: "pilot", runId: <newest>, href: "/ai-models/reports/<runId>"}`. A `preview` or `proposed` wave never yields `pilot`.
3. Else, if the queue snapshot has the tag with status `queued`, return `queued`.
4. Otherwise return `not-yet`. This includes the case "measured but no active report".

**Queue snapshot:** `{ "updated_at": "<QUEUE.updated_at>", "sourceSha256": "<hex>", "entries": [{ "tag", "developer", "status" }] }`, sorted by `tag`.

`src/lib/model-watch-facts.ts` exports `MODEL_WATCH_FACTS = { catalogModelCount, catalogAsOf, releaseLogCount, editionCount, latestEdition|null, rows (with testedStatus), filterValues (distinct provider, access, licence and status values, derived) }`. `catalogModelCount` is never added to `evaluatedModelCount` or to `RELEASE_WATCH_FACTS.confirmedReleaseCount`.

## 8. Insights

**Source format (fixed; writers may start now):** `research/insights/<slug>.md`. The slug matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`.

```
---
title: ...
dek: ...
date: 2026-10-16
audience: ai-labs | agent-builders | both
tags: [a, b]
readingMinutes: N
---
<markdown body with citation markers like [1]>

## Sources
1. Title — Publisher, YYYY-MM-DD. URL

## Corrections            (optional; append-only)
- YYYY-MM-DD: text
```

- Frontmatter must be exactly these six keys in this order, one line each. `audience` takes a single value. `tags` are kebab-case.
- Supported body markup is what `markdown-lite` renders: `##`/`###` headings, paragraphs, bold and italic, lists, pipe tables, blockquotes and `[text](url)`. Fenced code is dropped.
- Repo-derived numbers use tokens instead of digits: `{{SCORED_ENTITY_COUNT}}`, `{{INDEX_COUNT}}`, `{{DIMENSION_COUNT}}`, `{{SUBDIMENSION_COUNT}}`, `{{AI_LABS_COUNT}}`, `{{CATALOG_MODEL_COUNT}}`, `{{TASK_ITEM_COUNT}}`. The page substitutes them from `entityCount.ts`, `indexRegistry.ts`, `dimensions.ts`, `ai-labs.json`, `MODEL_WATCH_FACTS` and `MODEL_INDEX_FACTS`.

**Compiled post** (`site/src/data/insights/<slug>.json`):

```jsonc
{ "slug", "title", "dek", "date", "audience", "tags": [], "readingMinutes",
  "bodyMarkdown": "string",   // body before "## Sources", kept so lint can run in Docker
  "html": "string",           // markdown-lite; [n] -> <sup><a href="#src-n">[n]</a></sup>; tokens left as {{X}}
  "sources": [{ "n", "title", "publisher", "date", "url" }],
  "claimLedger": [{ "sentence", "citations": [n], "tokens": ["X"] }],   // every digit- or token-bearing sentence
  "corrections": [{ "date", "text" }],
  "generatedAt": "git commit date of the source | <date>T00:00:00.000Z" }
```

**Manifest:** `{ "posts": [{slug, title, dek, date, audience, tags, readingMinutes, lastCorrected|null}] }`, newest first.

**Sources line regex:** `^(\d+)\. (.+) — (.+), (\d{4}-\d{2}-\d{2})\. (https://\S+)$`. The title must not contain " — ".

**Lint rules (`insights-lint.mjs`, run by `build-insights` fail-closed and by `lint-insights.mjs` over the committed JSON):**

| ID | Rule |
|---|---|
| IL-1 | Frontmatter: exact keys and order. Date is ISO and not in the future. `audience` is in the enum. `abs(readingMinutes − ceil(words/230)) <= 1`. |
| IL-2 | Every `[n]` resolves to Sources entry `n`. Sources are numbered `1..N` contiguously. Every source is cited at least once. No duplicate URLs. |
| IL-3 | Every Sources line matches the regex. URLs are https. Dates are ISO. |
| IL-4 | Every sentence containing a digit has a `[n]` marker or a `{{TOKEN}}`. Stripped before the check: citation markers, tokens, ISO dates, decision ids (`D-\d+`) and list ordinals. Exemptions come only from `lint-allow.json` entries `{slug, sentencePrefix, reason}`. |
| IL-5 | No `LEADERBOARD_TERMS` match within 60 characters of a model mention (catalog `name`/`family` plus every wave's `makeNaming` forms), unless negated (G20 regex). Also no `BAND_NAMES` match and no `ENDORSE_RE` match in a sentence that names a model. |
| IL-6 | A sentence matching `/\b(revenue\|retention\|churn\|ROI\|conversion\|proven\|reduces? (?:harm\|risk))\b/i` needs a citation. |
| IL-7 | Links are only `https://` or root-relative. There are no `gumroad.com` or `/score-watch` links. Tokens never appear in `title` or `dek`, and `dek` passes IL-4. |
| IL-8 | Unknown `{{TOKEN}}` fails. Compiled `html` equals a re-render of `bodyMarkdown` (drift check). |
