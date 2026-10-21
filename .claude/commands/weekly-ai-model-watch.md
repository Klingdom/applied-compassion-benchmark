# Weekly AI Model Watch edition

Produce one AI Model Watch edition: an updated model catalog, the release log for the week, and a dated edition page.
Spec: `docs/PRD_AI_MODEL_WATCH.md`, `docs/ARCHITECTURE_AI_MODEL_WATCH.md`, `docs/DATA_MODEL_AI_MODEL_WATCH.md`.
The first edition is 2026-10-16. Its research files in `research/ai-model-tracker/` are the template.

## Authority (AUTONOMY §1b)
- Never `git add`, commit, push or deploy on your own authority. The edition ships when the founder approves the commit and deploy.
- Never assess, rate, rank or score a model. This is a factual registry: quote what providers publish, and link it.
- Never add a row from memory. Every row needs a source you opened this session; a release-log row needs at least one primary source.

## Steps
1. **Window.** `from` = the day after the last edition's `window.to` (read `site/src/data/model-watch/editions-manifest.json`); `to` = today.
2. **Research (general-purpose agent with web tools).** Write the following to `research/ai-model-tracker/`:
   - `catalog-<date>.json`: the full current catalog. Start from the last one, then add new models, mark superseded ones and update fields, with sources.
   - `releases-<date>.json`: only items dated inside the window.
   - `RESEARCH_NOTES_<date>.md`.
   - Same fields as the 2026-10-16 files. Unverifiable fields are `null`, never guessed; dates are never more precise than the source.
3. **Independent fact-check (a second agent).** It checks every release and a sample of at least 20 catalog rows, including every new or changed row, and writes `FACT_CHECK_<date>.md` with MUST FIX and SHOULD DROP lists.
4. **Apply corrections through a parser (S8), never by hand-editing JSON.** A row with only secondary sources goes to `heldOut`, not to the log.
5. **Import and validate.** From `site/`:
   - `node scripts/import-model-watch.mjs --catalog ../research/ai-model-tracker/catalog-<date>.json --releases ../research/ai-model-tracker/releases-<date>.json --as-of <date> --dry-run`
   - Then the same command without `--dry-run` (`npm run model-watch:import -- ...`), then again with `--check`, which must exit 0.
   - `npm run validate:model-watch` must report 0 failures.
   - Lexicon findings (MW-L1) are fixed by rewording the data. Never weaken the rule.
6. **Edition source.** Write `research/model-watch/editions/<date>.json`; the format is at the top of `site/scripts/compile-model-watch-edition.mjs`.
   - The lead is 90 words or fewer. Digits only through `{{RELEASE_COUNT}}`, `{{DISCLOSURE_COUNT}}` or `{{WINDOW_DAYS}}`, and name only models that are in the edition's releases.
   - `coverage.notScanned` must state honestly what was not checked.
   - `measuredNote` must match the waves manifest. Pilot runs dated inside the window ARE measurement; say so.
7. **Compile:** `npm run model-watch:edition -- --date <date>`, then `npm run build:model-watch-data`, then `npm run validate:model-watch`.
   - A compiled edition is immutable once published. Before publication, delete the compiled file and recompile.
   - After publication, use only `--append-correction "<text>"`.
8. **Verify:** `npm run build` (the gates include `test-model-watch-html.mjs --tree-only --require-out`), then `npm test`.
9. **Log:** add an ITERATION_LOG entry with an explicit pathspec, request the founder's commit and deploy approval, and stop.

## Pathspec template
`research/ai-model-tracker/*-<date>.* research/model-watch/editions/<date>.json site/src/data/model-watch/ ITERATION_LOG.md`
