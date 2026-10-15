# QA validation: AI Model Compassion Dashboard (built 2026-10-14, validated 2026-10-15)

Validator: QA Engineer agent (independent of the build session). Host: Windows, Node 24.20.0. Nothing committed, staged, built or deployed. No product file edited. `git diff` on files not part of this change is unchanged by this validation (probes ran from a scratch directory against a read-only copy of `site/out/`).

## Verdict: FAIL for release as the default build; PASS WITH FINDINGS for the code quality

The code is well built and every test passes. But the premise that the default build excludes the dashboard is false. The dashboard is gated only on D-29a (pilot waves with `decision_status: "active"`). All three committed waves are active, so the default build emits the dashboard pages and its sitemap entries. D-29b, which the PRD says must be ratified first, does not exist in `DECISIONS.md`. The first commit that carries these files would put an unratified page on the site. One more defect: the test chain breaks (`test:health-freshness`, 8 of 12 fail) because the change adds a 73rd chain step while `SYSTEM_HEALTH.md` says 72.

## 1. Test runs (all from `C:\Users\philk\applied-compassion-benchmark\site`)

| Command | Result |
|---|---|
| `node --no-warnings scripts/test-model-dashboard.mjs` | 217 passed, 0 failed |
| `node scripts/test-model-html-leak.mjs` | 568 passed, 0 failed (294 pages/payloads) |
| `node scripts/test-model-machine-leak.mjs` | 354 passed, 0 failed |
| `node --no-warnings scripts/test-model-pilot-figures.mjs` | 109 passed, 0 failed |
| `node --no-warnings scripts/test-model-benchmark-public.mjs` | 77 passed, 0 failed |
| `node scripts/test-script-syntax.mjs` | PASS, 301 of 301 scripts |
| `node scripts/test-health-freshness.mjs` | does not exist at that path (MODULE_NOT_FOUND). The package.json script is `node ../research/scripts/test-health-freshness.mjs`: **4 passed, 8 failed** (finding H1) |
| `npx tsc --noEmit` | clean, no output |
| `node --no-warnings scripts/smoke-model-dashboard.mjs` (Chromium against existing `out/`, no build) | 28 passed, 0 failed |
| extra: `test-no-stale-counts`, `test-product-separation`, `test-nginx-redirect-parity`, `test-model-report-seo`, `test-model-report-html`, `research/scripts/test-no-control-bytes`, `test-iteration-log-coverage` | pass (ok, 16, 7, 113, 90, PASS, PASS) |

Caveat: `site/out/` is a leftover build from 2026-10-14 19:11, so the tree tests and the smoke test validate that build, not a fresh one. The other agent's build may replace it. The component-render tests (217) render the current source, so source and `out/` agree where they overlap.

## 2. Gating (without `next build`)

Mechanism, from reading the code:
- `site/next.config.ts` adds `"pilot.tsx"` to `pageExtensions` when `renderableEntries(manifest).length > 0` (`scripts/lib/pilot-render-gate.mjs`). `page.pilot.tsx` and `[runId]/page.pilot.tsx` are pages only then. The sitemap block (`site/src/app/sitemap.ts` lines 117-137) is guarded by `waveLinks().length > 0`, which uses the same `renderableEntries()` plus `isDashboardWave`.
- `renderMode`: a wave renders if `status === "pilot"` and `decision_status === "active"`, or `"proposed"` with `CB_PREVIEW_PILOT_REPORTS=1`; it also needs `reports/<run_id>.md`.

Evaluated with the real gate functions and the real manifest (`node -e`, read-only):

| Scenario | Dashboard-eligible waves |
|---|---|
| Current committed manifest, default env | **3** (all `decision_status: "active"`, `official: false`) |
| All entries forced to `proposed`, default env | 0 |
| All entries forced to `proposed`, `CB_PREVIEW_PILOT_REPORTS=1` | 3 |
| Entries `official: true` | 0 |

Corroboration: `site/out/sitemap.xml` has 3 `ai-models/dashboard` entries, and `out/ai-models/dashboard.html` plus per-wave pages exist. So the default build emits the dashboard and sitemap entries today. The sitemap cannot leak a route that is not built; it is consistent with the route gate. The leak is the gate's own condition (C1), not the sitemap code.

## 3. Negative controls for each gate in `model-dashboard-html-gates.mjs`

The test file plants probes for: DASH-anchor, chart-table, default-view, download, duty, figure-label, panel-label, not-measured, order (2), sort-control (2), weight-control, status, two-waves (3), a11y (2), G20 title/links/jsonld/near-model/sitemap, TREE-leak (6) and TREE-missing, plus G19 L1 to L6b and H-paid-link.

No planted probe exists in the test file for: `DASH-controls`, `DASH-figure-footer`, `DASH-figure-table`, `DASH-noscript`, `DASH-table`, `DASH-table-label`, `DASH-third-party`, `DASH-wave`, `G20-canonical`, `G20-meta`, `G20-og`, `G20-robots`, `G20-structure`, `G20-lexicon`, `DASH-lexicon` (as named rule ids). I planted one for each in a scratch script (`C:\Users\philk\AppData\Local\Temp\claude\C--Users-philk-applied-compassion-benchmark\65564a78-d2e4-4f91-8239-694caf33ef48\scratchpad\probe.mjs`) against a copy of `out/ai-models/dashboard.html`. The clean page produced 0 problems from structure, SEO and lexicon gates. Result: **15 of 15 trip** the intended rule. (My first G20-robots probe missed because the page already has `<meta name="robots" content="index, follow"/>` and the gate reads only the first robots meta; rewriting that tag trips it. See L3.)

## 4. Content audit (PRD, D-29a)

- Grep of `model-dashboard-copy.ts` and `components/model-benchmark/dashboard/*.tsx` for rank, ranking, leaderboard, best, worst, top, band, grade, rating, sort, official score: every hit is a negation ("Not a ranking", "Sorting and custom weighting are not offered"), a code comment, an alphabetical `.sort()`, or the instrument's rating scale. None is a claim.
- Rendered `out/ai-models/dashboard.html` text: 0 occurrences of best, worst, leaderboard, rank(s/ed), top, winner. `DASH-status` gate confirms the opening line "No model has an official score."
- Duty-of-care section: no model name, no digit, no link or button, crisis-line sentence present (gate-checked and read). The FAQ says "It does not recommend a model, least of all for crisis support", no model names. Both pass.
- Figures: the copy module has no digits (tested). Components do carry a few fixed instrument constants, not data tokens (finding L1).

## Findings

### Critical

**C1. The dashboard ships in the default build without D-29b.**
- Evidence: Section 2 table; `site/next.config.ts:22-31` (extension gate has no D-29b condition); `site/src/lib/model-dashboard-facts.ts` (`dashboardEntries()` filters only `renderableEntries()` and `isDashboardWave`); `site/src/app/sitemap.ts:117-137`; `site/src/components/model-benchmark/pilot/PilotSummaryCard.tsx` (link added unconditionally); `DECISIONS.md` has D-29a and no D-29b (`grep D-29b DECISIONS.md` finds nothing).
- Artifacts conflict with the build: PRD header line 4 ("The page cannot ship until Proposed D-29b is ratified"), IR-01 ("Route allowed only after D-29b"), and D-29a item 1 (page list: `/ai-models`, `/ai-models/methodology`, reports; "no per-model routes or anchors"). `AUTONOMY.md` §0: a skeptical reader must be able to trace a public change to an artifact that says it was ready to publish. None exists.
- Impact: any commit that contains these files, followed by the founder's normal deploy, publishes a new public surface (dashboard pages, 2 downloads per wave, 3 sitemap entries, a link on `/ai-models`) with no ratified decision.
- Recommended fix (owner: frontend-engineer, then founder decision): add a second condition to the gate, for example a `dashboard` flag read from a committed file that the founder flips when D-29b is ratified (or the env `CB_PREVIEW_DASHBOARD=1` for local preview), applied in `next.config.ts` (own extension such as `pilotdash.tsx`), `dashboardEntries()`, the sitemap, the `PilotSummaryCard` link, and `build-model-dashboard-data.mjs`; extend the TREE gate and tests so default env with active waves and no D-29b yields zero dashboard output. Until then do not commit the dashboard files together with a deploy.

### High

**H1. The `npm test` chain is broken by this change (`test:health-freshness`).**
- `node ../research/scripts/test-health-freshness.mjs`: 4 passed, 8 failed. Cause: the chain gains `test:model-dashboard` and is now 73 steps (HEAD: 72); `SYSTEM_HEALTH.md:64` says "72 steps". The other 7 failures are probes that "do not pass on the clean file", a knock-on of the same mismatch.
- `site/package.json:31` (test) and `SYSTEM_HEALTH.md:4,64`. Fix: update SYSTEM_HEALTH.md to 73 steps in the same change (coordinator/documentation owner; the file has other uncommitted edits from another session, so do it deliberately).

**H2. The work is unlogged and unratified.** No entry in `ITERATION_LOG.md` or `CHANGELOG.md` for the dashboard; nothing in `RISKS.md`. Required by repo process before commit.

### Medium

**M1. The tree test proves only consistency, not policy.** `dashboardTreeProblems` (`scripts/lib/model-dashboard-html-gates.mjs`, tree section) compares `out/` against the manifest and env, so it passes on the current build that emits the dashboard (C1). It cannot detect "dashboard present without D-29b". Add the D-29b condition to the expected-rendering computation once C1 is fixed.

**M2. `next.config.ts` and the dashboard gate disagree on eligibility.** `next.config.ts` uses `renderableEntries(manifest)` (no `isDashboardWave`). A manifest entry with `status: "pilot"`, `official: true` and `decision_status: "active"` turns the `pilot.tsx` extension on (3 renderable) while the dashboard has 0 eligible waves. Then `[runId]/page.pilot.tsx` returns an empty `generateStaticParams()`, which `output: "export"` rejects, and `page.pilot.tsx` calls `notFound()`. This fails safe (build error, no leak) but would break the whole build. Use one shared predicate.

**M3. `ownerWaveOf` for `ai-models/dashboard.html`** (`scripts/lib/model-machine-leak.mjs`, new block) picks "newest wave with a report narrative", not "newest dashboard-eligible wave". If a newer wave has a report but is `proposed` (not rendering), the leak gate would hold the entry page to the wrong wave. Low probability today, real under the weekly program.

### Low

**L1. Hard-coded instrument constants in components, outside the copy-module "no digit" test:** `panels.tsx:97,105,121,221,223,585,685` ("0 to 100", "1 to 5", `step={20}`), `DashboardPage.tsx:225` ("CC BY 4.0"), `panels.tsx:395`. They are scale facts, not data, but the PRD says every figure is a build-time token. Either accept explicitly or export the scale from one constant.

**L2. `LEADERBOARD_TERMS` window check exempts negated phrasing** (`not|no|never|cannot` within 40 characters before rank/leaderboard) in `dashboardSeoProblems` near-model gate; a planted "X is no worse than the leader" style phrase is not covered. Low risk given the lexicon gate also runs.

**L3. `G20-robots` reads only the first robots meta tag** (`metaContent` returns the first match). A second, noindex tag would be missed. Low.

**L4. One weak probe:** `test-model-dashboard.mjs` "the length-removed bound without its label" expects the bare prefix `"G19-"` on both branches of a ternary, so it would pass for any G19 problem. It does still fail the clean page, so the control is real but loosely matched.

**L5. `test-model-dashboard.mjs` is called with `--tree-only --require-out` in the `build` script** after `next build`. That is correct, but `npm run test:model-dashboard` without `out/` runs the non-tree part and SKIPs the static-download comparison silently unless the prebuild ran (`SKIP` log line). Informational.

## 5. `site/package.json` chain

Diff reviewed. `prebuild` adds `scripts/build-model-dashboard-data.mjs` (exists); `build` adds `scripts/test-model-dashboard.mjs --tree-only --require-out` after the machine-leak step (exists); `test` adds `test:model-dashboard` before `test:mcp-pages`; the script `test:model-dashboard` is defined and points at an existing file. Every script reference in the three chains resolves to an existing file (verified by `test-script-syntax`, 301 of 301, and the dashboard test's own package.json assertions). Note the `test` chain count change (H1).

## Other diffs reviewed (no defect)

`model-report-html-gates.mjs` (new `makeRangeMasker`, `kind: "dashboard"`, L6b, exported `LEADERBOARD_TERMS`; `allowPercent` changed from `kind !== "report"` to `kind === "index"`, which is stricter for the dashboard and unchanged for the report and index), `model-machine-leak.mjs`, `test-model-html-leak.mjs` (dashboard pages of the same wave held to report rules, other waves' dashboard pages held to the strict index rule), `figure-kit.tsx` (shapes moved to new `glyph.tsx`; `test-model-pilot-figures` 109 pass confirms no regression), `PilotSummaryCard.tsx`, `globals.css` (additive, scoped to `.dashboard` / `.dash-*`; print block untouched).

## Files that belong to the dashboard change (git pathspec)

Use these exact paths; they are the whole change. The 2026-10-14 `updates/`, `evidence-reviews/`, `special-briefings/`, `DailyBriefing`/`briefing/*`, `test-scoring.mjs`, `test-briefing-move-claims.mjs`, `og/updates-2026-10-14.png` and the `docs/AGENT_*`, `docs/nonprofit-*`, `docs/learn/` changes in the working tree belong to other work and must not be included.

```
site/package.json
site/src/app/globals.css
site/src/app/sitemap.ts
site/src/app/ai-models/dashboard
site/src/components/model-benchmark/dashboard
site/src/components/model-benchmark/pilot/PilotSummaryCard.tsx
site/src/components/model-benchmark/pilot/figure-kit.tsx
site/src/components/model-benchmark/pilot/glyph.tsx
site/src/lib/model-dashboard-copy.ts
site/src/lib/model-dashboard-facts.ts
site/scripts/build-model-dashboard-data.mjs
site/scripts/smoke-model-dashboard.mjs
site/scripts/test-model-dashboard.mjs
site/scripts/lib/model-dashboard-core.mjs
site/scripts/lib/model-dashboard-html-gates.mjs
site/scripts/lib/model-machine-leak.mjs
site/scripts/lib/model-report-html-gates.mjs
site/scripts/test-model-html-leak.mjs
docs/ai-dashboard
```

Single-line form: `git add -- site/package.json site/src/app/globals.css site/src/app/sitemap.ts site/src/app/ai-models/dashboard site/src/components/model-benchmark/dashboard site/src/components/model-benchmark/pilot/PilotSummaryCard.tsx site/src/components/model-benchmark/pilot/figure-kit.tsx site/src/components/model-benchmark/pilot/glyph.tsx site/src/lib/model-dashboard-copy.ts site/src/lib/model-dashboard-facts.ts site/scripts/build-model-dashboard-data.mjs site/scripts/smoke-model-dashboard.mjs site/scripts/test-model-dashboard.mjs site/scripts/lib/model-dashboard-core.mjs site/scripts/lib/model-dashboard-html-gates.mjs site/scripts/lib/model-machine-leak.mjs site/scripts/lib/model-report-html-gates.mjs site/scripts/test-model-html-leak.mjs docs/ai-dashboard` (shown for pathspec use only; QA did not run it).

## Recommended next action

1. Do not commit and deploy the dashboard as is. Founder: ratify D-29b or hold the route.
2. frontend-engineer: add the D-29b gate (C1), unify the eligibility predicate (M2), fix the owner-wave rule (M3), and extend the tree test (M1). Re-run this suite.
3. Coordinator: update `SYSTEM_HEALTH.md` to 73 steps and log the iteration (H1, H2).
4. QA re-validation after a fresh `next build` by the build owner: default env must emit 0 dashboard pages, 0 downloads, 0 sitemap entries, no link on `/ai-models`; `CB_PREVIEW_*` must emit them.
