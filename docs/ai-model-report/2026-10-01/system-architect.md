# System architect brief: AI model assessment waves and narrative report, 2026-10-01

Sources: `research/model-runs/pilot-2026-10-01/analysis.json` (A), `research/model-runs/bin/analyze-pilot.mjs`, `site/src/lib/model-index-facts.ts`, `score-history-v1.json` meta, `DECISIONS.md` D-29/D-30, `docs/ARCHITECTURE_MODEL_BENCHMARK.md` (§2.1, §7.2), `site/scripts/build-special-briefings.mjs`, product-manager brief (PM).

## Design principle

A wave file never contains a model score, in either status. Pilot waves leave out composite-scale fields. Official waves *reference* records in `score-history-v1.json`, which its own meta says is "the only place model scores live". So the separation is a property of the schema, not a caption.

## 1. Data contract: `site/src/data/model-benchmark/waves/<wave-id>.json`

```jsonc
{
  "schemaVersion": "wave-1.0",
  "wave_id": "pilot-2026-10-01",          // == analysis.run_id; also the route slug
  "status": "pilot",                      // ENUM "pilot" | "official"; the UI must branch on it
  "official": false, "comparability": "none", // must equal status (pilot => false/none)
  "run_date": "2026-10-01",
  "source": { "analysis_path": "research/model-runs/pilot-2026-10-01/analysis.json",
              "analysis_sha256": "<sha of canonical JSON.stringify(parse(file))>", // not raw bytes: CRLF-safe
              "generator": "research/model-runs/bin/analyze-pilot.mjs",
              "exporter": "research/model-runs/bin/export-wave.mjs", "exporter_version": "1" },
  "publication": { "decision_ref": "D-29a", "decision_status": "active" }, // copied from DECISIONS.md at export
  "bank": { "version": "v2.0", "items_total": 93, "items_served": 83,
            "items_validated": 0, "all_items_public": true },   // snapshot at export, asserted vs tasks-v1 bankVersion
  "design": { "access_tier", "trials_per_subject", "responses", "ratings", "judges_per_response",
              "self_judging", "judge_family", "excluded_judges": [], "interval_method", "replicates", "seed" },
  "subjects": [                           // ARRAY, sorted by label; the exporter sorts, a test shuffles
    { "label": "claude-fable", "qualifier": "agent tier, snapshot unverified",
      "median_reply_words": 411, "lowest_dimension": "EMP",
      "contamination": { "indicated", "recall_items_flagged", "recall_items_probed",
                         "identification_correct", "identification_asked",
                         "identification_p_if_unexposed", "identification_flagged" },
      "judge_agreement": { "exact", "mean_absolute_difference", "responses_differing_by_2_or_more" } }
  ],
  "separation": {
    "pairs": [ { "a": "claude-fable", "b": "claude-opus", "separated": false } ],   // booleans only
    "not_separated_groups": [ ["claude-fable", "claude-opus", "claude-sonnet"] ],   // only if the relation is a clique; otherwise the exporter refuses
    "pair_count": 6, "separated_pair_count": 3 },
  "length": { "pooled_within_item_r": 0.598, "within_subject_slopes": { } },
  "judges": [ { "label", "ratings_used", "leniency_vs_item_mean" } ],
  "exclusion": { "judge": "claude-haiku", "role", "disclosure", "post_hoc": true,
                 "quote_not_verbatim_by_judge": { } },
  "derived": { "subject_count": 4, "shared_lowest_dimension": "EMP" },  // null if subjects differ
  "score_history_refs": []                // MUST be [] when pilot; non-empty record_ids when official
}
```

**Pilot projection (an allow-list, not a deny-list).** Copied from A only: the fields above. These are dropped: `composite`, `band`, `subjects.*.interval95`, `pairwise.*.difference` and `pairwise.*.interval95`, `length.composite_if_pooled_slope_removed`, `judges.*.by_subject` (per-subject leniency implies an order), and per-subject `dimensions` means. PM risk 1 says means imply ranking; if the founder approves showing them, add `dimension_means` behind `publication.dimension_means_decision`. A recursive key scan rejects `/composite|band|rank|score|difference/` anywhere in a pilot file.

**Official branch (the contract is defined now; nothing renders it yet).** `status: "official"` requires `official: true`, `comparability ≠ "none"`, and every `score_history_refs[i]` to exist with `artifact_ref === wave_id`. Figures come from score history, never from the wave file.

**TypeScript** (`site/src/lib/model-waves.ts`):

```ts
type PilotWave    = WaveBase & { status: "pilot";    official: false; comparability: "none"; score_history_refs: [] };
type OfficialWave = WaveBase & { status: "official"; official: true;  score_history_refs: [string, ...string[]] };
export type Wave = PilotWave | OfficialWave;
```

Every consumer uses `switch (wave.status)` with an exhaustive `never` check. The `official` case currently throws at build time ("official wave rendering requires the amended publication bar"). It fails closed.

**Manifest:** `waves/manifest.json` = `[{ wave_id, status, run_date, decision_ref }]`, newest first. The exporter writes it.

**Data gaps.** Anything the report needs that A lacks must be added to `analyze-pilot.mjs`, never computed by hand. That covers per-dimension intervals (PM risk 2) and separation after the length bound.

## 2. Export script and where it runs

The Docker build context is `site/` only, so the wave file is a **committed artifact**, not a prebuild output.

| Script | Inputs | Runs | Output |
|---|---|---|---|
| `research/model-runs/bin/export-wave.mjs --run-id <id> --status pilot --decision D-29a` | A, `tasks-v1.json`, `DECISIONS.md` | By hand, by the operator. Publishing is a deliberate act, not a build side effect | `waves/<id>.json`, `waves/manifest.json` (committed) |
| `site/scripts/lib/model-wave.mjs` | — | Imported by both the exporter and the tests | Pure `projectWave(analysis, bank, decision)` + `validateWave(wave, scoreHistory)` |
| `export-wave.mjs --check` | same | `npm run test` | Regenerates in memory and byte-diffs against the committed file; checks the sha |

The exporter refuses when:
- the decision is not active;
- the status is official but no matching score-history records exist;
- the bank versions disagree;
- a non-separation group is not a clique;
- the output exists with different content (unless `--force-new-revision` is passed).

Without `research/` (Docker), `--check` prints `SKIP`. When `CB_REQUIRE_RESEARCH=1` is set (CI and pre-commit), a skip counts as a failure.

**Gate in Docker:** PM #10 reads `DECISIONS.md`, which is outside the Docker context. The site reads the committed `publication.decision_status` instead, and `--check` re-verifies it wherever `DECISIONS.md` is reachable.

## 3. Narrative: figures cannot drift

**Source:** `site/src/data/model-benchmark/reports/<wave-id>.md`, copied from `_TEMPLATE.md`. It lives site-side, so Docker can compile it.

**Compile:** `site/scripts/build-model-reports.mjs` runs in **prebuild**, including in Docker. It writes `reports/<wave-id>.json`, which is gitignored. Committing it would add a third copy that could drift. The script reuses the briefing `mdToHtml` (move it to `scripts/lib/md.mjs`).

**Token grammar:** `{{path|format}}`.
- The path resolves against **the wave file only**, never live facts. A dated report cites its snapshot.
- `subjects.claude-opus.x` selects the array element by `label`.
- Formats: `int`, `fixed1`, `fixed2`, `fixed3`, `pct0`, `pct1`, `words`, `list`, `sep`.

**Compiled output:** `{ html, citations: [{ token, path, format, value, rendered }], word_count }`. Each figure traces to a field path (PM #6).

**Build-failing checks** (in the compile step):
1. A token that does not resolve, or that resolves to a missing field.
2. A **bare digit in prose** outside a token. Allowed patterns: ISO dates, decision and finding ids (`D-29a`, `F4`), item and dimension codes (`EQU-1-B`), and ordered-list markers. Any other literal needs `{{lit "1 in 4" source="..."}}`. Each `lit` needs a `source`, and the report allows at most five.
3. The required H2 sections are present and in template order: status, design, findings, separation, confounds, judges, deviations, publication-bar, may-say, cite.
4. If `not_separated_groups` is non-empty, the separation section must contain `{{separation.not_separated_groups|list}}`. It must also appear before the first `subjects.*` token. This is the mandatory "not separated" path (PM #4).
5. The word count of the resolved text is 2,700 to 3,300.
6. Banned words (`best`, `worst`, `leader`, `top`, `rank`, `weaker`, `worse`) appear only inside an approved qualifier span. There is no "above/below" in the FAQ.
7. Test re-resolution: `test:model-report-figures` re-resolves every `citations[]` entry against the wave file and compares `rendered`. This catches hand-edited compiled output.

## 4. Routes and the D-29 amendment

| Route | Change |
|---|---|
| `/ai-models` | The `#runs` section becomes "Assessment waves". It renders the latest manifest entry: status badge, date, separation statement in words, and a link. It branches on `status`. No subject cards. |
| `/ai-models/methodology` | Links to the wave's template sections. No figures. |
| `/ai-models/waves/[waveId]` | **New.** `generateStaticParams` comes from the manifest, with `dynamicParams = false`. JSON-LD is `Article` only. Added to the sitemap from the same manifest. |
| `/ai-models/waves` (index) | **Deferred** until there are two or more waves. This follows D-30 ("earn the route"). |

I recommend this over PM's `/ai-models/pilot-report`: it can be reused without another amendment. Verify in `node_modules/next/dist/docs` how Next 16 export behaves when `generateStaticParams` returns `[]`.

**What D-29a must say** (on top of PM §5): "Two pages, plus one report page per wave listed in `waves/manifest.json`. No per-model routes. A pilot wave publishes no composite-scale number; the wave schema has no field for one. An official wave publishes only via score-history records."

**Existing conflict:** `/ai-models` `#runs` currently prints "100 out of 100" for the 2026-09-25 self-run. That is a composite in a public surface, which D-29 forbids "in any form". The founder must either confirm it is covered or remove it (PM risk 4).

## 5. Tests and gates

| Gate | Where | Fails when |
|---|---|---|
| `test:model-waves` | `npm test` | Schema or enum is violated; `status`, `official` and `comparability` disagree; a forbidden key appears; subjects are not alphabetical; separation counts disagree with `pairs` |
| `export-wave --check` | `npm test` (`CB_REQUIRE_RESEARCH=1` in CI) | The committed wave differs from regeneration; the sha mismatches; the decision is not active |
| `test:model-wave-isolation` | `npm test` | Any score-history `artifact_ref` equals a pilot wave id; `model-index-facts.ts` imports from `waves/`; `MODEL_INDEX_FACTS` differs with `waves/` hidden (`evaluatedModelCount`, `scoreRecordCount`, `hasResults`, `modelsWithScoreHistory`) |
| `build-model-reports` | prebuild (Docker too) | Checks 1 to 6 in §3 |
| `test:model-report-figures` | `npm test` | Check 7 in §3 |
| `test:model-wave-order` | `npm test` | Shuffled input changes the rendered order |
| `test:no-stale-counts` (extended) | `npm test` | A bare numeral in `src/app/ai-models/**` JSX text. The dated 2026-09-25 quotes (`0.22`, `4 of 18`, `6 of 6`) need allow-list entries with a source, or must move into a dated artifact |
| `validate-product-separation` | build | Its loader must include `model-benchmark/waves/` (S8) |
| `test:model-html-leak` | CI after `next build` | A withheld value from A (composite, interval, difference) appears in `out/ai-models/**`. Hashes are never shipped, because small numbers are brute-forceable |
| Docker smoke | CI | `npm run build` fails with `research/` absent |

## 6. Migration and compatibility with `model-index-facts.ts`

- **`model-index-facts.ts` is unchanged.** `evaluatedModelCount` and `hasResults` still derive from the registry, and `scoreRecordCount` from score history. Pilots touch neither store, so all four stay 0 by construction. The isolation test proves it.
- **New module:** `site/src/lib/model-wave-facts.ts` exports `pilotWaveCount`, `officialWaveCount`, `latestWave`, and `stage`. These come from the manifest, not from hand-written stage strings.
- **Stage mapping:** this realises ARCHITECTURE §7.2. The stage becomes `piloted-unpublished` when pilot waves exist and `officialWaveCount === 0`. The `hasResults` gate (rankings, Dataset/ItemList JSON-LD) is untouched.
- **Doc update:** ARCHITECTURE §2.1 `runs/<run_id>.summary.json` is superseded by `waves/<wave-id>.json`. Record that in the same change.
- **Display rule:** copy must say "N pilot waves" and "0 models evaluated" as separate facts. A pilot count must never be added to an evaluated count.

## Sequence and open risks

**Sequence:**
1. Founder decisions: D-29a, PM (ii) and the route.
2. `model-wave.mjs` and the isolation tests. This is the highest risk, so it comes first.
3. Export and commit the wave file.
4. Template, compiler and lint.
5. Route and section.
6. CI leak scan and Docker smoke test.

**Risks:**
- The publication-bar section depends on FDP #5.
- The exporter must key on `official` and `comparability`, never on A's prose `status` string.
- `lit` is the remaining drift path. It is capped and needs a source, but it is not eliminated.
