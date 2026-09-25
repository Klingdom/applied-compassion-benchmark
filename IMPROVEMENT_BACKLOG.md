# IMPROVEMENT BACKLOG — Compassion Benchmark

Generated: 2026-04-14 | Last updated: **Iteration 10 (2026-09-14)** — RISK-019 false formula claim removed

## Scoring Model

Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## Scoring model v2 — ADOPTED 2026-09-14 as a trial for Iterations 13–15

Source: `docs/META_REVIEW_2026-09-14_ITER10-12.md` §5–§7 (coordinator-verified; one factual correction:
the uncommitted America-at-250 edit dates from **2026-09-03** (source `.md` mtime), not July).
v1 scores are kept for comparability; log **v1 and v2** for the selected item and top two alternatives.

```
Base     = I + S + L + C − E − R          (unchanged)
Adjusted = Base + K + P + Rc + Ag + Dl
K  risk closed (RISKS.md): High/High +3 · one High +2 · Medium/Medium +1; −1 if only reduced; cite RISK ID
P  live exposure: +1 if on production now, confirmed by a recorded BEFORE check;  K + P ≤ 4
Rc recurrence (docs/DEFECT_CLASS_REGISTRY.md): +2 installs a gate for a ≥2-occurrence class; −1 fixes an instance without one
Ag aging: +1 per 14 days eligible and unstarted (Base ≥ 13), cap +3
Dl deadline: ≤30d +3 · ≤90d +2 · ≤180d +1
Tie-break: Dl → K → forward exposure → Rc → lower Effort
Lane (not score): eligible | blocked-on-founder (never selected; appears in the decision packet)
```

**Selection rules:** S1 no double-counting ease (deviations must cite a non-formula reason) · S2 split gated
items into agent-doable X-1 and gated X-2 · S3 mid-session discoveries pre-empt only if logged + scored first,
≥ top eligible (or live score/formula/identity/money error), max 1 per 3 loops · S4 recurring class → gate or
dated waiver · S5 scope expansion accepted only for same class + same verification + no new authority class +
no new hand-written claim + ≤ ~30% files, logged · S6 ≤ 1 validated-uncommitted iteration unless file sets are
disjoint; every log entry names its commit pathspec · S7 RISK-015 T-30 (**2026-11-09**) forces R-1.

**Verification checklist per iteration:** V1 production BEFORE · V2 coordinator re-runs agent claims · V3
negative-control proof for new guards · V4 grep built output · V5 dated-content check (AUTONOMY §1c) · V6
diff scope review · V7 post-deploy AFTER · **V8 (added 2026-09-16, Meta-review 2) positive control before any
absence claim.**

**V8 — no zero without a positive control.** A search that returns nothing proves nothing until the same search has
been shown to find a known-present instance. Any command that can truncate (`head`, `tail`, `-m`, a bounded regex) or
that guesses structure (column indexes, field order) **voids an absence claim** — re-run unbounded, or read the header
and one full record first. Evidence for the rule: four false all-clears in 48 hours across three operators — grepping
`"79 / year"` when the string was `"$79/yr"`; `ls | head -4` truncating before `history.html`; treating freshly
written files as stale without checking mtime; and guessing registry column positions so the "gate" column printed
occurrence counts. Each produced a confident wrong answer that later verification overturned.

**Rules added by Meta-review 2 (2026-09-16), adopted:**
- **S8 — structured records are edited through a parser.** Never hand-insert keys into JSON that may already declare
  them (DC-10: duplicate `reviewed_by`/`decision` keys nulled a founder approval). Parse → mutate → re-serialise, or
  grep the key first. A second occurrence requires a duplicate-key linter over `research/change-proposals/**`.
- **S9 — a rename is not done until every consumer is re-derived.** Renaming an entity means enumerating each store
  keyed by its slug (index rows, entity records, rotation state, score files, history, redirects, briefings) and
  diffing the path set before and after. Evidence: the 20-name migration orphaned entity history, caught only after
  deploy.
- **S10 — an ungated recurring class becomes the forced selection.** Any defect class with ≥ 2 dated occurrences and
  neither a gate nor a dated waiver pre-empts the ranked queue at the next loop. DC-04 has been ungated for two
  cycles; it is therefore Iteration 16, not a candidate.
- **S11 — status figures are generated, not typed.** `SYSTEM_HEALTH.md` contradicted the repo within hours of a full
  rewrite (it claimed a 22-step test chain against an actual 23). Counts in status artifacts must be derived at write
  time from the source of truth, or carry the command that regenerates them.
- **Scoring amendment:** `P` (live exposure) rises to **+2** when the defect is currently serving wrong data or a
  false claim to readers, so live wrong answers can no longer be outranked by gate-building alone; `Rc` is unchanged
  at +2, but a gate that *freezes* live defects (an allowlist, a waiver) must file a backlog row for the remediation
  in the same loop, or the gate does not count as complete.

### Iteration 17 — SELECTED 2026-09-16: CB-MODEL detection stage, level L1 (founder directive)
- **Directive:** "continue expanding and improving the AI model virtuous cycle of assessing new models."
- **Baseline (coordinator-verified 2026-09-16).** The cycle is detect → evaluate → score → publish.
  - **Detect: never run.** 0 scans, 0 releases, and `release-sources-v1.json` — referenced by `releases-v1.json`
    `meta.sourceRegistryRef` — **does not exist on disk**. No scan record root either
    (`research/model-index/release-watch/` absent). No L1 fetcher exists; only validators and the stores.
  - **Score: thin.** Task bank has 33 items, per-dimension scorable counts AWR 5 · EMP 5 · ACT 5 · EQU 3 · BND 3 ·
    ACC 3 · **SYS 2 · INT 2**; validation status is 28 `unvalidated` + 5 `draft-authored-unreviewed`, i.e. **0
    human-reviewed items**. A composite scored today would rest on two unreviewed items for a quarter of its dimensions.
  - **Live models: founder-blocked.** BLK-002 (no credentials, no approved spend) is Critical; `.benchmark-ops/NEXT_ACTIONS.json`
    lists the top three actions as founder-owned and explicitly `agent_executable: false`.
- **Why L1 and not a scanner.** `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §2.7: *"L1 is the architecturally
  important level, and it should be built before any scanner."* L1 = enumerate a declared source registry and fetch each
  URL directly — **0 search calls**, so BLK-001/INC-008 does not block it — and it earns coverage claim
  `declared-sources`, the strongest *honest* claim; L0 open search costs ~270 calls and can still only claim `partial`.
- **What is deliberately NOT done:** no source URLs authored. The spec requires a source be *"added by a human from a
  verified URL, never inferred"* and the store forbids rows from memory, training data or marketing pages. The registry
  ships **empty** with schema + validator + fetcher; populating it is a short founder task. No release row is created:
  promoting a scan observation to a release is human-gated (T1/T3 state machine, §2.5).
- v1: I4 S5 L3 C5 − E2 − R1 = **14** · v2: K+1 (RISK-016 class — a monitoring claim with no monitoring) · P 0 (nothing
  false is published; the store discloses its own emptiness honestly) · Rc 0 → **15**. File set disjoint from Iteration
  16 (claim-to-source gate) except `site/package.json`, which the agent is instructed not to touch.

### Iteration 18 — SELECTED 2026-09-16: DC-08 build determinism (+ BM-1 folded in, same root cause)
- **Why:** ranked next by Meta-review 2 (v2 15) and the direct cause of the one metric that review scored as failing —
  "dirty paths not attributable to a pending iteration". Every build rewrites **19 tracked files** whose only change is
  a wall-clock stamp (16 special-briefing JSONs + their manifest + `updates/manifest.json` + `build-manifest.json`);
  a sampled diff is a single line, `"generatedAt"` old → new. I have hand-excluded these by pathspec ~8 times today,
  which is exactly how a real change gets lost in noise.
- **Verified causes (2026-09-16):** `new Date()` at `build-special-briefings.mjs:474,525`,
  `build-updates-manifest.mjs:56`, `build-manifest.mjs:164-166`. `export-public-data.mjs:160` also stamps but writes to
  gitignored `site/public/data/`, so it does not churn git.
- **BM-1 folded in (same file, same root cause):** `git(args, fallback)` in `build-manifest.mjs:64-70` swallows every
  failure and returns `"unknown"`, which is what production currently serves — a false-looking provenance value is
  worse than an absent one. Fix: capture the commit from the environment (CI knows it) and record an explicit
  unavailable reason when it genuinely cannot be determined.
- **Not in scope:** gitignoring the special-briefing JSONs. They are source-of-truth data carrying a bad field; the fix
  is the field, not the visibility.
- v1: I3 S5 L2 C5 − E2 − R1 = 12 · v2: K+1 · P+2 (BM-1 is live on production now) → **15**.

### New backlog item (2026-09-16, Meta-review 2 finding) — BM-1: production cannot identify its own commit
- Live `https://compassionbenchmark.com/build-manifest.json` reports `git: {"sha":"unknown","branch":"unknown","dirty":false}`
  (coordinator-verified 2026-09-16, after a deploy from a known commit). The deployed site therefore cannot say which
  commit produced it, which defeats the traceability the manifest exists for: a reader, a data consumer or a future
  incident review cannot tie published output back to a revision. Most likely cause — the Docker build stage has no git
  metadata (no `.git`, or `git` absent), so the capture falls back to "unknown" **silently**.
- Work: capture the commit at image-build time (build arg from CI, which knows the sha) rather than shelling out inside
  the container; fail loud or record an explicit `"unavailable"` reason instead of a plausible-looking `"unknown"`, so a
  missing sha is visible rather than mistakable for a real value. Verify on production after deploy, not locally.
  v1: I3 S5 L2 C5 − E2 − R1 = **12** · v2: K+1 (RISK-004 verification gap — deploy verification already can't assert
  what shipped) · P+2 (live: production is serving a false-looking provenance value now) → **15**.

### New backlog item (2026-09-16, Meta-review 2 finding) — A-2: remediate the 16 frozen slug collisions
- Iteration 14's ratchet froze 16 cross-index collisions in `site/scripts/known-collisions.json` and **no backlog row
  was ever created**, so the queue could not select the repair. Verified live 2026-09-16:
  `/data/scores/singapore.json` serves the **global city** (composite 56.2), not the country — a data consumer asking
  for Singapore-the-country gets the wrong entity, and the same holds for 13 US cities that are also global cities,
  plus 1X Technologies and Figure AI across ai-labs/robotics-labs.
- Work: pin index-suffixed slugs (the Phoenix/Georgia precedent), migrate score files, entity records and rotation
  keys, add 301s, and shrink `known-collisions.json` toward zero — the ratchet already fails if an entry becomes stale.
  Founder already approved this class of change on 2026-09-16 (D-35 covers renames/slugs).
  v1: I4 S5 L2 C5 − E3 − R3 = 10 · v2: K+2 (RISK-017 High) · P+2 (live wrong entity served) → **14**.
- **PARTIALLY COMPLETE — Iteration 19 (2026-09-16), 1 of 16.** Singapore pinned (`singapore-global-cities`); bare
  `singapore` now serves the country 62.2. Collisions 16 → 15; warnings 64 → 63; unique slugs 1,309 → 1,310;
  `npm test` exit 0. **Committed `cad71c1a` 2026-09-17 (founder-approved), awaiting manual deployment.** **Split into
  three lanes for the remainder:**
  - **A-2a — the 12 US-city twins** (`boston`, `portland`, `new-york-city`, `seattle`, `minneapolis`, `san-francisco`,
    `philadelphia`, `atlanta`, `detroit`, `chicago`, `los-angeles`, `houston` + `portland`'s global row). Mechanical,
    same recipe, each needs 1 index-row pin + 1 record + 1 rewrite pair. Note 8 of these publish **contradictory
    composites** for the same name (e.g. Houston 43.8 vs 35.2) — a rename makes both publicly addressable, which
    *exposes* the disagreement rather than resolving it. Decide disclosure before shipping. v2 ~12, eligible.
  - **A-2b — `washington-dc`.** Different shape: rotation-state has **no bare key**, both sides already qualified
    (`washington-dc-us-cities`, `washington-dc-global-cities`), so pinning only the global row leaves the us-cities
    side mismatched. Needs a both-sides pin and two rewrite pairs. v2 ~11, eligible.
  - **A-2c — `1x-technologies` and `figure-ai`. BLOCKED, not eligible.** RISK-017 defers both to **D-13**
    (proposed, never ratified), whose hard constraint is that no entity may hold more than one published composite;
    the drafted disposition (`INDEX_EXPANSION_SCOPE_2026-08-20.md:146`) is to **delist the ai-labs rows**. I pinned
    these in Iteration 19 and reverted them — a rename would entrench the duplicate publication and force a second
    rename later. **Lane: blocked-on-founder** (ratify or reject D-13).

### New backlog items (2026-09-16, discovered during Iteration 19)
- ~~**Three components ignore the pinned slug.**~~ **✅ COMPLETE — Iteration 20 (2026-09-17).** It was **four**
  components, not three (`NavbarSearch.tsx:194` was missed by the inventory), and `IndexPageCharts` also carried its
  own naive slugger. Measured live first: 34 wrong links (77 in `IndexPageCharts`). Fixed by exporting one
  `rowSlug()` from `lib/slugify.ts` and importing it in all four; gated by `test:pinned-slugs` (chain 27 → 28),
  proven with a planted probe. `npm test` / `tsc --noEmit` / eslint all exit 0. **Committed `119f1757` (founder-
  approved 2026-09-17), deployed by run 35249684018 (all 4 jobs success), verified live:** all **1,323 of 1,323**
  unique entity hrefs on the 8 ranking pages return 200 with 0 redirects (control: a nonsense slug → `/404`).
  Correction: the live defect was 404 links, not redirect-dependence (see It. 20 correction note).

### New backlog items (2026-09-17, discovered during Iteration 20)
- **`entities.ts` holds a fifth private copy of `rowSlug`** (`src/data/entities.ts:251-254`). It is the canonical
  original and is correct, but it should import the shared `rowSlug` from `@/lib/slugify` so there is exactly one
  implementation. The new guard **cannot see it**: `test-pinned-slugs` scans `src/app` + `src/components` only.
  Deferred from It. 20 deliberately — `entities.ts` is a core registry and the loop had no local build at the time.
  v1: I2 S4 L2 C5 − E1 − R1 = **11**.
- **D-35 contradicts `lib/slugify.ts` on the `&` convention.** D-35 states "`&` becomes `-and-`"; the code maps
  `&`→`and`, so `AT&T` slugs to `atandt` while the published pin is `at-and-t`. Every affected row is pinned, so
  nothing is broken today — but the decision record and the implementation disagree, and the next unpinned `&` name
  will follow the code, not the decision. Work: correct one to match the other and state which is canonical.
  v1: I2 S5 L3 C5 − E1 − R1 = **13**.
- **Search cannot reach intra-index duplicates.** `EntitySearch`/`NavbarSearch` build slugs without the `-{rank}`
  disambiguation that `entities.ts` applies, so the second Portland in us-cities (rank 22, `portland-22`) is
  unreachable — searching "Portland" links to Portland ME for both rows. Same root as the `portland-22`/`springfield-94`
  rank-derived-slug item. v1: I3 S4 L2 C4 − E2 − R2 = **9**.
  **Widened 2026-09-17 (verified live after the It. 20 deploy):** the ranking table has the same gap. `/us-cities`
  links `/us-city/portland` twice and `/us-city/springfield` twice. `/us-city/portland-22` and
  `/us-city/springfield-94` return 200 but aren't linked from the table. This predates It. 20 (`633ed6ff`
  `RankingTable.tsx:156` used `slugify(entry.name)`), so it isn't a regression.

### MCP server, skill and plugin — development track (added 2026-09-20)

Plan: `docs/MCP_SERVER_PLAN_2026-09-20.md` (also on the founder's Desktop). These rows **implement a design already
ratified** in `docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §4 and its Track B items B1–B10 — the IDs below carry the
architecture's own numbering so there is one registry, not two. Two servers: **`cb-probe`** (public, local, the user's
own model judges itself, no key, no network, no composite) and **`cb-ops`** (private, operator-only, triggers real
runs under the founder's own credential). An outside caller triggering an *official* run is **blocked by ratified
design** — harness §7.2 forbids any public code path into a run, and a subject who can re-roll its own evaluation
breaks the independence rule.

**Ordering rule from the architecture, not negotiable:** the separation guarantee (MCP-B2) is built **before** the
tools it guards. Building the tools first and bolting on the guarantee is how a safeguard becomes an apology.

| ID | Item | Owner | Depends on | v1 | Notes |
|---|---|---|---|---|---|
| **MCP-B1** | **Ratify D-31**: local MCP chosen; Worker endpoint, browser extension, in-page BYO and skill-alone rejected with reasons; "no API key exists in this design" recorded as the security property | **founder** | — | — | Gate for everything below. Also answer AMB-B (two composite standards) and the package/registry name |
| **MCP-B2** | `JudgeEstimate` schema + `validate-estimate.mjs` + the **two-way vocabulary ban test** (no `score`/`rate`/`band`/`composite` in either direction) + the no-fetch and no-provider-SDK source scans, all wired into `npm test` | backend | B1 | I5 S5 L3 C5 − E2 − R1 = **15** | Build red first: each test must fail against a deliberately non-compliant fixture before the real code exists |
| **MCP-B3** | Package skeleton (stdio MCP server, no deps beyond the MCP SDK) + `projection.mjs` whitelist **derived from the bank's own `meta.fieldSeparationPolicy`**, never a hand-written field list | backend | B2 | I4 S5 L2 C5 − E2 − R1 = **13** | A hand-written whitelist silently rots when the bank gains a field |
| **MCP-B4** | `list_probe_items`, `get_anchors`, `explain_what_this_is_not` + the write-root guard and the data-handling notice | backend | B3 | I4 S5 L2 C5 − E2 − R1 = **13** | `include_sensitive` defaults **false** — the bank holds suicidal-ideation, domestic-violence and miscarriage prompts |
| **MCP-B5** | `open_judge_session`, `record_item_estimate`, `summarise_judge_session`, artifact writer with the mandatory header | backend | B4 | I4 S5 L3 C5 − E3 − R2 = **12** | Labels are self-reported and stored as `self_reported: true`; we never verify which model is speaking, and the artifact says so |
| **MCP-B6** | `run_exposure_probe` (recall + rubric-leak) | backend | B5 | I5 S5 L4 C4 − E3 − R2 = **13** | **The highest-value tool in the set.** Our items are published with full rubrics, so any model trained since may have memorised them. Measuring that publicly defends the benchmark's credibility better than any score we could publish this year |
| **MCP-B7** | Promotion-proof scan: assert nothing under `site/` or `research/scripts/model-harness/` reads a judge artifact; `.gitignore` the artifact root; data-tree signature scan — into `npm test` | qa | B5 | I5 S5 L3 C5 − E2 − R1 = **15** | This is what stops a self-judged estimate ever becoming an official number |
| **MCP-B8** | Disclosure copy as a **section** on `/ai-models/methodology` (not a new page — D-29 caps the page count) + tool README | frontend | B5 | I4 S5 L2 C5 − E2 − R1 = **13** | Must ship **before** the package is published, not after |
| **MCP-B9** | Claude Skill wrapper (`compassion-probe`) + Claude Code plugin bundling server, skill and config | backend | B5 | I3 S4 L2 C5 − E2 − R1 = **11** | Ergonomics only. Adds **no capability and no trust surface**; if it ever appears to add capability, something is wrong. Note the architecture rejected a *browser extension* (needs the user's key); a Code plugin needs none |
| **MCP-B10** | *(Deferred)* Opt-in exposure-probe submission by GitHub issue/PR template — probe results only, never estimates, never `response_text` | — | B6 | — | Explicitly **not** a Worker endpoint |
| **MCP-O1** | `cb-ops` skeleton + `plan_run` (dry-run: items, trials, token and call estimate) | backend | first-assessment P1 | I3 S4 L2 C5 − E2 − R1 = **11** | Read-only; excludes non-scorable items automatically |
| **MCP-O2** | `start_run` with a **hard ceiling guard** — refuses without a configured ceiling, refuses over it, refuses on an unfrozen bank | backend | O1, live adapter | I4 S5 L3 C4 − E3 − R2 = **11** | Cannot be built before a live adapter exists: `bin/run.mjs` throws on any adapter but `replay` |
| **MCP-O3** | `queue_release` / `list_queue` — release-watch candidates enter a queue; **promotion and spend stay human-gated** | backend | O1, release-watch sources | I3 S5 L2 C5 − E2 − R1 = **12** | An automatic trigger on a detected release is an automatic bill, and a mis-detected release spends real money on a model that may not exist |
| **MCP-O4** | Operator runbook: install, config snippet, ceiling configuration, what the server refuses to do and why | devops | O2 | I3 S4 L2 C5 − E1 − R1 = **12** | `cb-ops` is never published to a registry and never exposed over a network |

**Pointing an AI model at it** (ships as MCP-B8/B9 documentation; recorded here so the instruction is not lost):

```json
{ "mcpServers": { "cb-probe": {
    "command": "npx", "args": ["-y", "@compassionbenchmark/cb-probe"],
    "env": { "CB_ARTIFACT_ROOT": "~/compassion-probe-sessions" } } } }
```

Works in Claude Desktop, Claude Code, or any MCP host via standard tool discovery. **No API key appears anywhere**,
because the host model *is* the judge — the client already holds the credential and already runs the model. Intended
prompt: *"Use cb-probe to see how you handle the Compassion Benchmark's published probe items: list the Awareness
items, answer each, rate yourself against the anchors, then summarise."* The operator server is configured by local
path only:

```json
{ "mcpServers": { "cb-ops": { "command": "node",
    "args": ["C:/Users/philk/applied-compassion-benchmark/tools/cb-ops/bin/server.mjs"] } } }
```

**Critical path:** `MCP-B1 → B2 → B3 → B4 → B5 → {B6, B7, B8, B9}`; `MCP-O1 → O2 → O3 → O4` waits on the live adapter
from the first-assessment plan. B2 and B7 are the two rows that must never be deferred "for now".

**Known risk accepted or declined at B1 (AMB-E):** people will publish "Compassion Benchmark rates X at N" from a
self-judged estimate. Removing the number removes the screenshot, but our name still sits on the artifact. The
mitigations are the mandatory header, `explain_what_this_is_not()` as a retrievable tool, and the disclosure section.
If that trade is unacceptable, decline the public server at B1 and build only `cb-ops`.


#### Scored-run track — "give me a number" (added 2026-09-20)

Design: `docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md` (also on the founder's Desktop). The founder asked for an MCP
server anyone can run that takes a model through **every dimension and subdimension** and returns a **compassion
benchmark score**. Two facts shape this track, both coordinator-verified on 2026-09-20:

1. **Subdimension scoring is impossible today.** `dimensions.ts` defines **40** subdimension codes; the model task
   bank has **0 of 33** items carrying a subdimension field, **0** referencing a code anywhere, and **0** constructs
   matching a subdimension name (control: the name list does contain "Awareness", so the matcher works). The bank was
   never wired to the subdimension layer. Claiming a 40-subdimension score now would mean inventing the mapping at
   runtime.
2. **Emitting a composite contradicts J2** (`ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §5.2) — but `/ai-evaluation-suite`
   **already** publishes a composite and band under `official: false`, which the architecture flags as unresolved
   **AMB-B**. So this is a decision waiting to be made, not a rule being broken.

| ID | Item | Owner | Depends on | v1 | Notes |
|---|---|---|---|---|---|
| **MCP-S1** | **Resolve AMB-B in writing**: may a self-run tool emit a composite + band under `official: false`? Also settle the naming question (branded vs unbranded, AMB-E) | **founder** | — | — | Gate for the whole track. Recommended: yes, one standard applied to both this tool and `/ai-evaluation-suite` |
| **MCP-S2** | `SelfRunScorecard` schema with `official: false` as a **structural field** (not a label), mandatory provenance (subject/judge labels marked self-reported, bank version, item hashes, seed, temperature, judge configuration) and a mandatory contamination block; validator + vocabulary-ban test | backend | S1 | I5 S5 L3 C5 − E2 − R1 = **15** | Build before any tool that emits it |
| **MCP-S3** | Scored-run tools: `start_scored_run`, `next_item`, `record_item_rating`, `finish_scored_run`. Refuses `trials < 3` (the variance threshold in `evaluation-statistics.mjs`); refuses a rating with no anchor matched and no evidence quote | backend | S2 | I5 S5 L3 C4 − E3 − R2 = **12** | Dimension-level only; subdimensions returned **absent with a reason**, never zeros or nulls dressed as scores |
| **MCP-S4** | **Exposure probe as a precondition**: no composite is emitted until `run_exposure_probe` has run, and its result is embedded in the scorecard at equal visual weight | backend | S3, MCP-B6 | I5 S5 L4 C5 − E2 − R1 = **16** | Our bank is published with full rubrics, so any model trained since may have memorised the answer key. Scoring without this manufactures flattering numbers |
| **MCP-S5** | Judge-configuration handling: C1 self-judge (flagged), C2 cross-judge (**documented default**), C3 two-judge panel with disagreement reported | backend | S3 | I4 S5 L3 C4 − E2 − R2 = **12** | Grounded in D-07: the same automated pipeline scored ADP 58.1 and 60.6 three days apart, across a band boundary. A model rating itself is the weakest configuration we could ship |
| **MCP-S6** | **Bank expansion to subdimension coverage — the long pole.** ≥ 80 items (realistically 120) so each of the 40 subdimensions has 2–3, replacing today's 28 scorable items where SYS has 2, INT has 2 and EQU effectively 1 | benchmark-research + **founder** | MB-2 validation protocol, MB-5 EQU repair | I5 S5 L4 C3 − E5 − R3 = **9**, but it is the **only** route to what was actually asked for | Same bank freeze the first official assessment is waiting on — the two tracks fund each other. Rating cost, not token cost, dominates: 80 items × 5 trials × 2 raters is an order of magnitude beyond today's 9–23 rater-hours |

**Sequencing:** `S1 → S2 → S3 → {S4, S5}` ships a dimension-level scored run in days. `S6` is a funded programme, not a
sprint. Ship the tool honest-and-partial rather than complete-and-invented: a scorecard that says *"subdimension
scoring is not available: the item bank does not carry subdimension tags"* is worth more than 40 fabricated numbers.


#### Autonomous operation track (added 2026-09-20)

Design: `docs/CB_MODEL_AUTONOMOUS_OPERATION_2026-09-20.md` (also on the founder's Desktop). A 14-transition state
machine from detection to publication, and an **autonomy ladder L0–L5**. **We are at L0 (manual).** L5 — unattended
publication — is marked *never available*, because the barrier is `AUTONOMY.md` §1b, not engineering.

Three findings verified by the coordinator on 2026-09-20:

1. **The spend ceiling is a field, not a guard.** `ceiling_at_time` is written `null` (`model-harness/bin/run.mjs:350`)
   and compared **zero** times anywhere in `research/scripts` or `site/scripts` — positive control: real threshold
   comparisons (`>= THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE`) do exist in the same tree, so the search works.
   Nothing today would stop a run exceeding a budget.
2. **An unattended script that pushes to main already exists.** `scripts/nightly-pipeline.sh` is "designed for
   unattended execution via cron" and its **stage 7 runs `git push origin main`**. Every commit and push is a founder
   action under `AUTONOMY.md` §1b. If that script were ever scheduled, it would bypass the approval rule nightly.
3. **The authority file has a hole.** `AUTONOMY.md` names `research/scripts` three times but never mentions
   `site/src/data/model-benchmark/**` — so the model stores are not bound by the rule that protects the institution
   indexes. The ladder has nothing to bind to for model data.

| ID | Item | Owner | Depends on | v1 | Notes |
|---|---|---|---|---|---|
| **AUT-1** | **Close the authority hole**: name `site/src/data/model-benchmark/**` and the model-harness run artifacts in `AUTONOMY.md` §1b, and state which ladder level each transition sits at | **founder** | — | — | Everything else in this track binds to this file. Cheap, and it is currently the weakest link |
| **AUT-2** | **Make the ceiling real**: founder-written `.benchmark-ops/spend-ceiling.json` carrying an `authority`; preflight refuses to open a run without headroom; a meter over `usage.jsonl` warns at 80% and at 100% finishes the in-flight trial then aborts with a **distinct reason** (a ceiling stop is our refusal, not a provider quota); never resume into the same `run_id`; two-phase ledger row so partial spend is visible before the invoice | backend + founder | AUT-1, live adapter | I5 S5 L3 C5 − E3 − R2 = **13** | Also needed for **rater-hours** (rating costs ~1,500× the API) and **search budget** (INC-008) |
| **AUT-3** | **Neutralise `scripts/nightly-pipeline.sh` stage 7** — remove the push, or gate it behind an explicit `ALLOW_PUSH` that is off by default and documented as founder-only | devops | — | I4 S5 L2 C5 − E1 − R1 = **14** | A latent rule-bypass sitting in the repo. Do this before anyone schedules anything |
| **AUT-4** | **L1 — scheduled detection only**: run `release-watch-l1 --live` daily; write candidates; notify. No spend, no promotion, no publication | devops | sources ratified (MCP/release), AUT-3 | I4 S5 L3 C5 − E2 − R1 = **14** | The design estimates ~an afternoon. Safe because the zero-sources check fires first and the step cannot spend |
| **AUT-5** | **Mandatory failure channel**: `NIGHTLY_WEBHOOK_URL` is optional today (`if [ -n ... ]`), so an unattended failure is silent. Make a failure notification required for any scheduled stage, and fail loudly when it is unset | devops | AUT-4 | I4 S5 L2 C5 − E1 − R1 = **14** | An autonomous system that can fail quietly is worse than a manual one |
| **AUT-6** | **Scheduler ownership + lock**: exactly one scheduler owner and a lock so two runs cannot overlap (there are no transactions anywhere in this codebase) | devops | AUT-4 | I3 S4 L2 C5 − E2 − R2 = **10** | Credential custody decided explicitly: GitHub Actions secrets were rejected by F-04 as a standing exfiltration surface, and the Worker is the wrong plane. Recommendation: cron for detection; `cb-ops` pull for anything that spends or publishes |
| **AUT-7** | **L4 — automated analysis + gate evaluation**: evaluate G1–G16 and **file a proposal**, never publish — the same "stop at the digest" shape the nightly entity pipeline already uses | backend | AUT-2, first run | I4 S5 L3 C4 − E3 − R2 = **11** | The transition worth automating precisely because it ends at a human gate |

**Never automate** (from the design, each grounded rather than cautious): confirming which model a release *is*
(subject identity, INV-1), publication (§1b, and D-29 would need amending), and **anything touching methodology —
including the item bank**, because bumping `bankVersion` rewrites every `item_hash` and silently voids cross-run
comparability.

**Sequencing:** `AUT-1 → AUT-3 → AUT-4 → AUT-5` gets us to scheduled detection with a loud failure path and no spend.
`AUT-2` gates everything that costs money. `AUT-7` is the last safe automation before the human gates that stay.

### New backlog items (2026-09-25, from the first complete self-run)

- **MS-3 — the exposure probe measures the wrong kind of knowing (found by running it on myself).** The probe
  scores lexical overlap between recalled text and the item prompt, flagging at 0.6. On 2026-09-25 the
  coordinator ran it having **authored 60 of the 93 items earlier the same session**, and could name each probe
  item's scenario, hidden mechanism and answer key — yet scored **0.13 / 0.32 / 0.21, mean 0.22, every one
  flagged clean** (`exposure_flag: false`), because the recall was paraphrased rather than quoted. The probe therefore detects
  **verbatim memorisation of the prompt** and misses **semantic knowledge of the item and its rubric**, which is
  the contamination that actually inflates a score. Work: score recall against the item's *discriminating
  content* (construct, level-5 anchor, the specific mechanism), not its surface tokens — e.g. ask the subject to
  state what separates a 5 from a 2 on this item and check that against the anchor, which a clean model cannot
  do and a contaminated one can. Until then, a low overlap is **not** evidence of a clean subject and the
  artifact should stop implying it is. v1: I5 S5 L5 C5 − E3 − R2 = **15**; v2 adds P +2 (the probe is currently
  telling readers clean when it does not know that) = **17**.

### New backlog items (2026-09-24, from INC-010)

- **GI-2 — ban destructive git verbs in committed scripts, mechanically (DC-14, 2 occurrences).** INC-010:
  my own It. 35 probe harness ran `git checkout --force` and destroyed three uncommitted files, including the
  held America-at-250 rewrite. The prohibition already existed in prose, aimed at subagents; I did not apply it
  to myself. Prose aimed at someone else is not a control. Work: a test that greps committed `.mjs`/`.sh`
  under `research/scripts`, `site/scripts` and `tools/` for `checkout --force`, `reset --hard`,
  `clean -fd`, `stash`, and `restore`, failing on any hit not carrying a dated inline waiver. Seed it with a
  planted probe. **Note the second occurrence means S4 already requires a gate or a dated waiver.**
  v1: I4 S4 L3 C5 − E2 − R1 = **13**; v2 adds Rc +2 (a class with 2 dated registry occurrences) = **15**.

- **GI-1 (restated, still open) — pre-flight snapshot of uncommitted work before any branch operation.** The
  reason INC-010 was survivable is that a *previous* iteration had committed the held rewrite as a patch under
  `research/held-changes/`. That was foresight, not a system. A snapshot to a gitignored path before any
  script touches branches would make recovery independent of anyone having been thoughtful earlier.

### New backlog items (2026-09-24, from Iteration 37 — the AI Evaluation Suite)

- **MCP-S6 — COMPLETED 2026-09-24 (It. 37), founder-directed.** The bank went 33 -> 93 items and
  13 of 40 -> **40 of 40 subdimensions**, with >= 2 non-sensitive scorable items each. A default run serves
  83 items / 249 trials and reaches every subdimension. A composite is now
  reachable from the real bank and arrives labelled `coverage.level` (complete / dimension-only /
  insufficient). Recorded as **D-41**. Its v2 score of 9 was never the real ranking — it was gated, and the
  directive opened the gate.

- **MB-2 — LARGER, NOT SMALLER: 0 of 93 items human-reviewed** (was 0 of 33). This is now the single
  most important open item on the model track. A composite that *can* be produced *will* be quoted, and today
  every number it rests on comes from items authored by AI agents against published rubrics and verified only
  structurally. Work: a written validation protocol, then review. Eight agents wrote 60 items in one day
  against one rubric set, so **correlated blind spots are likely** and should be sampled for deliberately.
  v1: I5 S5 L4 C4 − E4 − R2 = **12**; v2 adds P +1 (a live number now rests on it) = **13**.

- **MB-5 — unchanged and now more visible.** `EQU-1-B` and `EQU-1-C` still carry rubrics demanding a
  comparison arm the items do not present, so two of the original three Identity Equity items cannot be
  applied as written. The 8 new EQU items were explicitly audited against that defect and do not repeat it.
  Repairing a published rubric is a methodology act (§1b) and was deliberately not done in this loop.

- **MS-1 — item-quality review of the 60 new items.** Each authoring agent named its own least-confident item
  and its reasoning; those are in the It. 37 transcript and worth using as the sampling frame rather than
  reviewing at random. Known concerns raised by the authors themselves: cross-dimension bleed (AWR-5-B,
  SYS-4-B), rater-knowledge dependence (ACC-2-A needs UK holiday law; ACT-4-A/B reward jurisdiction-specific
  knowledge, a real DIF risk), and one rubric-fit judgement call (INT-3-C, where the two pre-existing I3 items
  read the subdimension differently than the published text does). v1: I4 S4 L4 C4 − E3 − R2 = **11**.

- **MS-2 — the trial-cache invariant needs a test.** It. 37 fixed an O(n^2) re-parse in `listRunTrials` with a
  path-keyed cache invalidated by mtime+size. The forged-run defence depends on disk staying authoritative;
  that property is currently argued in a comment, not asserted. Work: a test that writes a trial file, reads
  it through `listRunTrials`, rewrites it on disk with different content, and asserts the new content is
  returned. v1: I3 S4 L3 C5 − E1 − R1 = **13**.

### New backlog items (2026-09-24, from Iteration 34)

- **COMPLETED 2026-09-24 — DC-16 gate (`test:iteration-log-coverage`).** Not a pre-existing backlog row: **forced by
  S10** (a class with ≥ 2 dated occurrences and no gate pre-empts the ranked queue), discovered while carrying out the
  founder's "GitHub and Desktop" step. Six iterations (27b, 28–33) had shipped with no `ITERATION_LOG.md` entry while
  two committed cb-probe files cited "Iteration 32" and "Iteration 33". Entries written from committed evidence; gate
  wired into `npm run test` (chain 33 → 34) with four negative controls. v1 for the record: I4 S5 L3 C5 − E2 − R1 =
  **14**; v2 adds Rc +2 (a class with 2 dated registry occurrences gaining a mechanical gate) = **16**.

- **CI-1a — COMPLETED 2026-09-24 (It. 35).** Gate `test:commit-message-tokens` (chain 34 → 35) + rule **R12** in
  `AUTONOMY.md` §1b + **DC-17** registered. Proven with a real planted commit, a neutered matcher and a future
  cutoff. v2 was **17**; the delivered half is the gate and the rule.

- **CI-1b — FOUNDER DECISION: should a push to a working branch run build + test?** `deploy.yml` triggers on
  `push: branches: [main]`, so the current branch has had **no CI since 2026-09-17** and everything pushed on
  2026-09-24 was verified locally only (full chain exit 0, four negative-control suites). Options: (a) add
  `branches: ['**']` to the push trigger — `deploy` and `verify` are already `workflow_dispatch`-gated, so this
  cannot ship anything, it only runs build + test + nginx syntax; (b) leave it, and accept that branch work is
  verified by the coordinator alone; (c) require a PR to `main`, which runs CI on the merge commit.
  **Recommendation: (a)** — it is two lines, cannot deploy, and closes the gap that hid four days of unverified
  pushes. §1b: a CI trigger change is a founder act, so it is not applied here. v1: I4 S4 L2 C5 − E1 − R2 = **12**.

- **CI-1 — RISK-025's second cause, now identified: never write the skip-ci marker literally.** GitHub
  substring-matches the token **anywhere** in the head commit message, including prose quoting it. `9d89d4df` — the
  commit that fixed the habit — contains it three times, the last reading "This commit deliberately carries no
  [skip ci]", so GitHub skipped the very push that was meant to prove the fix. Cross-referencing every `main` commit
  since 2026-09-14 against the 171 distinct run `headSha`s shows **every push tip after `119f1757` carries the
  token**, with no residue left to explain. Work: (a) a practice rule — refer to it as "the skip-ci marker" in prose,
  never the literal string; (b) a founder decision on whether `deploy.yml` should also run build + test on pushes to
  working branches, since `push: branches: [main]` means the current branch has had **no CI since 2026-09-17** and
  everything pushed today was verified locally only; (c) optionally a `commit-msg` check. **§1b:** changing a CI
  trigger is founder-gated, and Step 9 forbids acting in the loop that found this. v1: I5 S4 L4 C5 − E1 − R2 =
  **15**; v2 adds K +2 (closes the open half of a High/High risk) = **17**.

- **GOV-1 — a commit message must not claim a record its own diff does not contain.** DC-16's **first** occurrence was
  exactly that: `9ce57aa3`'s message says "Record Iterations 26-29" while its diff adds 26 and 27. A commit message is
  not a tracked file, so `test:iteration-log-coverage` cannot see it; check B (no holes in the logged sequence) is an
  indirect substitute that would have caught this instance but will not catch the general case. Work, if it recurs: a
  `commit-msg`/`pre-push` hook that extracts `Iteration N` / `D-N` / `RISK-N` claims from the message and requires
  the matching artifact to be in the same commit's file list. Deliberately **not** built now — a hook on the commit
  path is a governance surface (ECC-1 shape), one occurrence does not meet S4, and the practice rule is already
  written into the DC-16 registry row. **Filed so the second occurrence is a forced selection, not a surprise.**
  v1: I3 S4 L3 C4 − E2 − R3 = **9**.

- **GOV-2 — SYSTEM_HEALTH carried four false rows for up to nine days.** Corrected in It. 34 while satisfying the
  Step 8 "correct every row the change makes false" rule: the test chain read **31 steps** against an actual 34; the
  risk register read **"17 entries, all open"** against 20 rows with 8 resolved and a highest id of RISK-025; the
  build-churn row still showed DC-08 as an open ⚠️ nine days after It. 18 closed it with 0 dirty paths; and the
  working-tree row still listed `.bak` churn that It. 30 gitignored. Every figure is now derived at write time with
  the generating command recorded beside it (**S11**). Remaining work: the header still says *Snapshot 2026-09-15*,
  and the whole "Build and gates (measured 2026-09-15)" section is nine days stale — it needs a re-measure, not a
  re-type. v1: I3 S4 L2 C4 − E2 − R1 = **10**.

### New backlog items (2026-09-22)
- **ECC-1 — add the `block-no-verify` guard as a fail-open PreToolUse hook.** ECC ships a hook that denies
  `git commit --no-verify` and `git push --force`; it ships **disabled**. Adopting it would mechanically strengthen
  `AUTONOMY.md` §1b, which is currently prose only. Work: write it to **fail open** on any parse error or unexpected
  input (a deny-hook that misfires can stall an unattended cycle, which is worse than the risk it removes), wire one
  narrow PreToolUse entry, and prove it with a planted probe in both directions — a `--no-verify` commit is blocked,
  and an ordinary commit is untouched. v1: I4 S5 L2 C5 − E2 − R2 = **12**.
- **ECC-2 — run `context-budget` and act on it.** The 2026-09-22 user-scope install added 106 skills, 52 commands and
  53 agents to every session's context. Nothing has measured the cost. Work: run the audit, record the numbers in
  `SYSTEM_HEALTH.md`, and prune or scope what is not earning its tokens. v1: I3 S4 L2 C5 − E1 − R1 = **12**.

### New backlog items (2026-09-21)
- **D1-1c — COMPLETED 2026-09-24 (It. 36).** `research/scripts/check-publication-drift.mjs` asks the routes (not
  two published artifacts against each other) for every briefing committed in the last 21 days, carries its own
  liveness control so an unreachable host exits **2 INDETERMINATE** instead of reporting everything missing, and has
  three callers: the `verify` job with `--fail-on-drift`, a **mandatory** step in the overnight-digest brief (the
  only thing that runs daily, and the only caller that can catch *no deploy at all*), and
  `npm run check:publication-drift`. Six controls, including two that had passed for the wrong reason until the
  probe harness itself was fixed. **Deliberately not in `npm run test`** — it needs the network.

- **D1-1a / D1-1b — BLOCKED on CI-1b.** (a) "confirm a CI run appears whose `headSha` is that commit" is impossible
  while `deploy.yml` triggers on `push: branches: [main]` and the work lives on a branch. (b) amendment D1, "a loop
  is not closed until a CI run exists for its commit", is **not adopted**: a rule that cannot currently be satisfied
  would be decoration. Its second half — the marker never goes on a push tip — is live as **R12** (It. 35).

- **CI-1c — FOUNDER: should a `schedule:` trigger run the drift check daily?** Two lines, read-only, no deploy
  path; it would catch invisible content without waiting for a nightly research cycle or a deploy. Not installed
  unilaterally: a scheduled workflow is a **new autonomous execution surface**, and it overlaps the CI-1b decision.
  v1: I3 S4 L2 C5 − E1 − R2 = **11**.

- **BM-2 (D1-1d) — a build that cannot name its own commit should fail loudly.** Recurred **2026-09-22**: production
  serves `sha: null, source: "unavailable"` because it was rebuilt with a bare `docker compose build` instead of
  Actions or `./deploy.sh`. The drift check now surfaces it on every run, which is detection, not a fix. Work: make
  the build fail when `GIT_SHA` is absent, or record the sha from a file the image can read. v1: I3 S4 L3 C4 − E2 −
  R2 = **10**.

- **D1-1 — repair the deploy channel and prove a loop closed (v2 17, ranked #1 by Meta-review 4).** Partly done in the
  working tree: `deploy` and `verify` are now `workflow_dispatch`-only, so a push always runs build + test + nginx
  syntax. Remaining: (a) commit and push it, then confirm a CI run appears whose `headSha` **is** that commit;
  (b) adopt amendment **D1** — a loop is not closed until a CI run exists for its commit, and `[skip ci]` never goes on
  a push tip; (c) add a **newest-briefing assertion** to the `verify` job, since three committed briefings 404'd for
  days without anything noticing; (d) fold in **BM-2** so a build that cannot name its own commit fails loudly instead
  of emitting `sha: null`. v1: I5 S5 L3 C5 − E2 − R1 = **15** · v2: P +2 (three briefings live-404, publicly invisible)
  → **17**.
- **V9d-1 — give the redirect gate a specification instead of a mirror (DC-15).** `test:nginx-redirect-parity` passes
  when a rewrite is deleted from **both** configs (coordinator-verified 2026-09-21: 4 passed, exit 0). Work: commit an
  explicit list of the 26 legacy URLs and their expected targets, assert `nginx.conf` contains every one, and keep the
  superset check as a secondary assertion. Then re-run the both-sides probe — it must fail. Also fold in my probe as a
  committed negative-control fixture. v1: I4 S5 L3 C5 − E2 − R2 = 13 · v2: Rc +2 (second occurrence of the class, no
  independent gate) → **15**.
- **ID-3 — backlog identifiers must be allocated, not reused.** `MCP-B1` asks the founder to "ratify D-31", copying the
  architecture's own text, but **D-31 is already live** and the register's maximum is D-39. Work: renumber the MCP
  decision to the next free ID, and adopt amendment **R1** (allocate from the register maximum; never redefine an
  existing identifier). Same class as the DC-12 redefinition Meta-review 4 found. v1: I3 S4 L2 C5 − E1 − R1 = **12**.
- **CS-3 — the tier *rule* is ambiguous, so consistency checks pass while the convention drifts.** Verified
  2026-09-21 across cycles: on **09-17** a Euronews article reporting the UN High Commissioner was tiered **4** (by the
  *originating authority*), and I corrected the briefing from 2 to 4 to match its assessment. On **09-21** a
  thenationalnews.com article reporting a UN fact-finding mission was tiered **2**, the assessment stating "tier 2
  reporting of a tier-4 UN mandate finding" (by the *outlet*). Both cycles are internally consistent — the mechanical
  briefing-versus-assessment check reports 0 mismatches for both — yet the two use **opposite rules for the same
  situation**. This is the same ambiguity that produced the split corpus behind EV-1: nothing ever said whether tier
  describes the publisher or the authority being reported. Work: decide the rule (recommendation: tier the **outlet**,
  and carry the authority separately in a `reportsAuthority` field, so "tier 2 reporting a tier-4 finding" becomes
  representable instead of a judgement call), write it into both agent specs, and extend the gate to check it. v1: I4
  S5 L3 C5 − E2 − R2 = **13**.
- **CS-2 addendum (2026-09-21): the gate's matcher must handle three citation shapes, not one.** My checker has now
  silently read **0 URLs twice** — on 09-15/09-20 because assessments cite `[T4, 2026-09-15](url)`, and on 09-21
  because they cite `- <url> (tier 2 reporting of ...)` with the tier **after** the URL. Each time the run reported
  "0 mismatches", which was vacuous rather than clean. With all three shapes supported the real results are
  **09-17 7/0 · 09-18 5/0 · 09-20 11/0 · 09-21 18/0**. The working three-shape matcher is the spec for the gate, and
  the gate **must fail loudly when it extracts zero citations from a date's assessments** — an unparseable citation
  has to be an error, never a pass.
- **ID-2 — an HTML-encoded entity name is baked into a filename on disk (DC-05).**
  `research/assessments/macy-x27-s.md` exists: "Macy's" was encoded to `macy&#x27;s` and then slugified, producing
  `macy-x27-s`. Found on 2026-09-21 when the assessor had to locate Macy's published baseline under that name; the
  same cycle wrote the correct `macys-2026-09-21.md`. Same root cause as RISK-023 (the 20 encoded Fortune 500 names,
  fixed in the published data on 2026-09-16) — but the historical **research artifacts** were never swept, so a
  mangled filename is still the only home of a documented 2026-04-22 assessment. Work: sweep
  `research/assessments/**` for encoded-entity filenames, rename with a recorded mapping (an assessment filename is
  referenced by rotation-state provenance, so a rename is an S9 re-derivation, not a `mv`), and extend
  `test:encoded-names` to cover research artifact paths rather than published names only. v1: I3 S4 L2 C5 − E2 − R2 =
  **10** · v2: Rc +2 (a gate for a class with ≥ 2 dated occurrences) → **12**.
- **RS-5 — the top-level scan stamp drifts from the per-entity stamps.** Verified 2026-09-21: every one of the 1,329
  entities carried `last_scanned: "2026-09-21"` while `meta.last_scan` still read `2026-09-20`, because the scanner
  updated the per-entity fields but not the header on that cycle (it did on 09-20). Coordinator corrected the header
  by parser after confirming the per-entity stamps were uniform. A status figure that disagrees with its own source of
  truth is the S11 class. Work: have `validate-rotation-state.mjs` assert `meta.last_scan` equals the maximum
  per-entity `last_scanned`, so the drift fails loudly instead of being noticed by chance. v1: I3 S5 L2 C5 − E1 − R1 =
  **13**.
- **SC-1d — ledger matchers are tuned for precision, and the recall gap is now measured.** Verified 2026-09-21: the
  `harvard-funding-freeze-ruling` matcher requires the judge's surname, so *"Judge Burroughs ruled the funding freeze
  unlawful"* is caught while *"A federal judge ruled Harvard's funding freeze unlawful"* is **missed**. Every matcher
  makes this trade (an entity token plus a claim-specific token), which is correct for avoiding false positives on
  genuine news but means a reworded recurrence slips through. Work: for each entry, record the phrasings that would
  evade it, and consider a second weaker matcher that *warns* (non-blocking) rather than fails, so a near-miss is
  visible without blocking a scan. v1: I3 S4 L3 C5 − E2 − R2 = **11**.

### New backlog items (2026-09-20)
- **SC-1b — four more year-stale claims have no ledger entry.** Found by the 2026-09-20 scan, each costing full
  verification: **Myanmar** Rakhine school airstrike (true date **2025-09-12**), **El Salvador** "140 defenders fled"
  (2025 events per HRW's 2026 World Report), **Interpublic Group** "800 layoffs in September" (September **2025**, per
  the same SEC filing), and **Figure AI**'s whistleblower claim (September 2025) — **dropped for a third consecutive
  cycle**. Work: append four entries with their true dates and sources, same schema. v1: I3 S4 L2 C5 − E1 − R1 = **12**.
- **SC-1c — the ledger matcher reads narrative prose, not just claims.** On its first live run the gate fired twice on
  the scanner's own explanatory notes *about* the ledger, because they quoted the literal trigger tokens. The scanner
  reworded to get past it; requiring authors to avoid words in order to describe a defect is the wrong remedy. Work:
  restrict matching to claim/evidence fields (or exclude fields marked as disclosure/commentary), and add a test with a
  fixture whose narrative mentions a ledger claim while its candidate does not. Note the failure direction was **safe**
  — the gate over-reached rather than missing. v1: I3 S4 L3 C5 − E1 − R1 = **13**.

### New backlog items (2026-09-18)
- **GI-1 — cycle stores have no pre-flight snapshot, so recovery depends on luck.** INC-009 (2026-09-18): an agent
  ran `git checkout` over the scanner's uncommitted `rotation-state.json` write for all 1,329 entities. It was
  recoverable only because the scanner's write is mechanically re-derivable from the scan file. Had it happened after
  `last_assessed` was written, or before the scan file existed, the cycle (~193 searches) would have been lost.
  Work: copy `research/rotation-state.json` (and the day's scan file, once written) to a gitignored
  `research/.snapshots/<date>-<stage>/` before the scanner and assessor stages, keep the last N days, and document
  the one-command restore. Cheap, mechanical, and it also protects against a half-written parse → mutate →
  re-serialise. v1: I4 S4 L2 C5 − E1 − R1 = 13 · v2: Rc 0 (new class, 1 occurrence — a gate here is prevention, not a
  ratchet) → **13**.
- **SC-1 — the scanner keeps rediscovering claims it has already debunked (recurring, ungated ⇒ S10 candidate).**
  Each cycle re-verifies the same false items from scratch and drops them again, spending verification searches on
  work already done. Dated occurrences: **Meta "8,000 layoffs"** (true date 2026-05-20) dropped on 09-17 **and** 09-18,
  and the 09-18 scanner records it as "recurring misdate, third cycle this has surfaced"; **China "Ethnic Unity Law"**
  (actually passed 2026-03-12) dropped on 09-15 **and** 09-17; plus first-time-but-same-shape misdates on 09-18 —
  PayPal's DEI settlement (May 12), a Qatar strike that was September **2025**, Freeport-McMoRan Grasberg (Sept 2025),
  a Cambridge injunction from March 2025. 8 of the 09-18 cycle's 14 drops were misdated events.
  **Work (cheap, mechanical):** a dated ledger `research/known-misdated-claims.json` — claim text/pattern, the true
  date, the source that established it, and the cycles it surfaced in — plus a check in `validate-scan.mjs` that fails
  (or warns loudly) when a scan's `top_entities` matches a ledger entry, and a line in the scanner's brief telling it to
  consult the ledger before spending a verification search. Entries are append-only; an entry may only be removed with
  a dated reason (a claim can become true later, which the ledger must express as "true date" not "false claim").
  **Prove it with a planted probe:** a scan fixture containing the Meta claim must fail the check.
  v1: I3 S5 L3 C5 − E2 − R1 = 13 · v2: Rc **+2** (installs a gate for a class with ≥ 2 dated occurrences) → **15**.
  Note under S10 this is a forced selection at the next loop unless a dated waiver is recorded instead.

### New backlog items (2026-09-18, from Iteration 24 — the AI model benchmark)
- **MB-5 — two of the three published EQU rubrics cannot be applied (coordinator-verified 2026-09-18).** `EQU-1-C`'s
  level-2 anchor reads "less specific than it would for a non-racialized version of the question" and `EQU-1-A`'s reads
  "lower quality than…", but neither item carries a paired counterfactual arm and neither has any pairing field. A
  single-response scorer has no comparison, so the Identity Equity construct is unmeasurable as published. Verified by
  scanning every anchor in `tasks-v1.json` for comparison language (2 hits, both EQU, both unpaired; regex positive
  control passed). Work: convert both to matched pairs (the shape `EQU-2-A` in the 09-18 proposal uses), or rewrite the
  anchors to be self-contained. Methodology change ⇒ founder-gated. v1: I4 S5 L3 C5 − E2 − R2 = 13 · v2: P +1 (the
  published instrument is wrong, though no score depends on it yet — 0 models scored) → **14**.
- **MB-6 — the task schema cannot express a held-back item.** `validate-task-bank.mjs` §8 hard-codes
  `core-public`/`public-permanent` exposure, so a secure holdout set is structurally impossible today. Every published
  item may be in the training data of any model trained since publication, which the `/ai-models` page already discloses.
  Work: decide whether a holdout is wanted at all (it cannot be independently audited), and if so extend the schema and
  validator first. Founder decision. v1: I3 S5 L3 C4 − E2 − R2 = **11**.
- **MB-1 — the digest is silent about release watch.** Lane 2 of It. 24 specified the line "Release watch: 0 sources
  registered — detection did not run today" but could not implement it (`.claude/agents/overnight-digest.md` was
  outside its file ownership). While the registry is empty, silence in the daily briefing reads as "no releases
  shipped", which is a different and false claim. Work: add the line to the digest spec and the digest JSON schema.
  v1: I3 S5 L2 C5 - E1 - R1 = **13**.
- **MB-2 — task bank depth and human review.** 33 items, **SYS 2** and EQU/BND 3, and **0 of 33** human-reviewed. A
  composite scored today would rest on two unreviewed items for a quarter of one dimension. Work (X-1, agent): draft
  additional items for the thin dimensions, marked `draft-authored-unreviewed`. (X-2, founder): decide who reviews
  items and what "validated" requires — no agent can self-certify this. v1: I4 S5 L3 C4 - E3 - R2 = **11**, but it is
  the binding constraint on ever publishing a model score.
- **MB-3 — Qwen has no parseable first-party release source.** qwen.ai serves an identical 94,358-byte JS shell on
  three paths (verified 2026-09-18), so the source proposal falls back to a third-party model registry for Alibaba.
  Zhipu (404), Moonshot (stub) and Google's Gemini changelog (302 to OAuth) are also unverifiable. Work: disclose the
  gap wherever coverage is claimed, and re-probe periodically. v1: I2 S4 L2 C5 - E1 - R1 = **11**.
- **MB-4 — release-watch fetches are unconditional.** `etag`/`lastModified` exist in the source-state schema but are
  unused, so every daily run re-downloads every source in full. Harmless at 14 sources; wasteful and impolite at scale.
  v1: I2 S3 L2 C5 - E1 - R1 = **10**.

### New backlog items (2026-09-17, from Meta-review 3; coordinator-verified where marked)
- **BM-2 — a bare `docker compose build` on the VPS strips the commit identity from `/build-manifest.json`.**
  Verified 2026-09-18: after the manual 21:40Z deploy, production reports `sha: null, source: "unavailable"`, where the
  earlier CI deploy reported `sha 119f1757, source: "env"`. `GIT_SHA`/`GIT_BRANCH`/`GIT_DIRTY` are exported only by
  `deploy.sh` and the CI SSH script, and the Docker build context has no `.git`. Work: document the supported deploy
  paths in the runbook (partly done by It. 21), and/or make `build-manifest.mjs` fail the build loudly when the args
  are absent rather than emitting `null` — a deployed artifact that cannot name its commit defeats V7 and the CI
  freshness assertion. v1: I3 S5 L2 C5 − E1 − R2 = **12**.
- **EV-1 — the evidence-tier badges on every briefing page are INVERTED (live, reader-facing).** Found 2026-09-18
  while verifying the 09-17 deploy. `site/src/components/updates/briefing/evidence/index.tsx:34-40` maps
  `1: "Tier 1 · Gov/Court" … 4: "Tier 4 · Journalism", 5: "Tier 5 · Trade/Advocacy"`, and `TIER_SHORT_LABELS` calls
  tier 1 "Primary source". The data convention is the **opposite**: `.claude/agents/overnight-assessor.md:206` —
  "5 = government/court/treaty-body; 4 = international org / UN mission; 3 = watchdog NGO; 2 = top-tier journalism;
  1 = trade press/advocacy" — and `overnight-digest.md:452` says "Tier 5 — strongest evidence". **Live proof:** on
  `/updates/2026-09-17` a Boston.com newspaper article renders as "**Tier 2 · UN/IO**", i.e. a local paper is presented
  to readers as a UN/international source, and the strength ordering is reversed on every badge on every briefing page.
  **Ironic context:** the 09-17 correction pass fixed five `sourceTier` *values* against their assessments; the values
  are now right and the *labels* were wrong all along. Neither the claim-to-source gate nor any test reads these labels.
  **SURVEY DONE 2026-09-20 — the caution was right, and the defect is bigger than the labels.** Mechanical survey of
  371 adjudicable sources across 58 briefings (`docs/EVIDENCE_TIER_CONVENTION_2026-09-20.md`): **18 cycles** follow the
  documented convention, **19 cycles** follow the inverted one, and **17 are internally inconsistent inside a single
  briefing**. Government/IO sources are rated 4-5 in 88 cases and 1-2 in 53; journalism is rated 2 in 84 cases and 4 in
  42. NGOs sit at 3 in 86 of 95 cases — the midpoint agrees under both conventions, which is the control proving the
  classifier works and only the ends are in dispute. **So flipping the UI map would fix 18 cycles and break 19.** The
  real defect is that no gate ever enforced the convention. Options are written up for a founder decision; the memo
  recommends suppressing the badge before a cutoff now (no published text rewritten) and a dated, disclosed migration
  later, plus a gate comparing each briefing `sourceTier` against the tier recorded in that date's assessment. **No score depends
  on `sourceTier`** — this is a provenance-display defect, not a scoring one. Work: (1) survey `sourceTier` values
  across all 83 daily briefing JSONs against the outlet type of each URL and report which convention each cycle used;
  (2) correct the labels (and/or a one-off data migration for any cycle authored inverted); (3) a test asserting the UI
  map matches the documented scale, so the two can never drift again. v1: I4 S5 L3 C5 − E2 − R2 = 13 · v2: P **+2**
  (live false claim to readers) · Rc 0 (new class) → **15**. **Correction (Meta-review 4):** this row was *scored* P +1 at
  selection time and should have been P +2 from the start, i.e. **16** — which would have selected it two days earlier.
  A live false claim to readers is the amended P +2 case, and I under-applied my own rule.
- **R-1b — the waiver warning names a remediation file by literal string.** It. 22 prints
  `docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md`; on ratification that draft is likely renamed or superseded, and the
  warning would then point at a stale or absent path while still looking authoritative (the DC-01 pattern). Work:
  derive the path, or assert its existence in `test-separation-waivers.mjs`. v1: I2 S4 L2 C5 − E1 − R1 = **11**.
- **CS-2 — extend the claim-to-source gate to evidence tier and event recency (DC-04, now 3 cycles).** The 2026-09-17
  briefing was the first one live-enforced by the It. 16 gate. It passed with 0 violations while carrying 5 `sourceTier` values
  that contradicted the cited assessments (4 inflated from 2 to 4, 1 deflated from 4 to 2) and a 2025 event framed as
  current. Readers see these as tier badges, so an inflated tier overstates evidence strength in public. Coordinator
  checks prove the mechanical form: matching each briefing `{url, sourceTier}` against the `[T#](url)` / `tier N — url`
  citations in the same-date assessments found 5 mismatches on 09-17 and 0 of 14 on 09-14 (positive control). **Caveat resolved 2026-09-20:** the 09-15 gap was a *matcher* limitation, not missing data — assessments cite in two
  shapes, `[T4](url)` and `[T4, 2026-09-15](url)`, and the original matcher only read the first. With both shapes
  handled, four cycles now verify clean: **09-15 8 matched / 0 mismatch · 09-17 7/0 · 09-18 5/0 · 09-20 11/0**. The
  working checker (two citation shapes, per-date assessment index, reports unmatched URLs separately rather than
  silently passing them) is the spec for this gate — port it into `lint-rules.mjs` rather than writing a new one. Work: a lint rule (tier must equal the assessment's tier for the same URL; an unparseable
  citation fails loudly, not silently) plus a planted-probe test. v1: I4 S5 L3 C5 − E2 − R1 = 14 · v2: K −1 (RISK-020
  reduced) · Rc +2 (a gate for a 3-occurrence class) → **15**.
- **ID-1 — "Jack Henry & Associate" is published with a truncated name (DC-05).** Found during the 2026-09-17
  research cycle and verified live: `fortune-500.json` row `{"name":"Jack Henry & Associate","slug":"jack-henry-and-associate",
  "rank":16}`, rendered on `/fortune-500` as "Jack Henry &amp; Associate". The rotation-state key is truncated the same
  way, as is `democratic-republic-of-c` (DR Congo's published name was fixed on 2026-09-14 `7dfa27a3`, but its research key
  wasn't). The company's legal name ends "Associates"; confirm against a primary source before renaming. Work:
  (X-1, agent) a truncation sweep comparing published names and rotation keys against a reference list, reporting
  suspects only; (X-2, founder-gated) a rename plus 301 plus S9 re-derivation of every slug-keyed store. v1: I3 S5 L2
  C4 − E2 − R2 = 10 · v2: P +2 (live wrong name) · Rc −1 (instance fix without a gate) → **11**; the sweep as a gate
  scores higher.

- **LC-1 — one nginx config plus a post-deploy link check (DC-11).** The `Dockerfile` ships `nginx.conf`; most
  slug-override rewrites and HSTS live only in `nginx-ssl.conf`. **Verified live 2026-09-17:**
  `/company/atandt` and `/robotics-lab/intuitive-surgical-inc` 301 → `http://…/404` (an https→http downgrade
  as well). The component links are fixed by It. 20, but external/legacy inbound links to those old URLs still 404.
  Work: consolidate into `nginx.conf`, stop the `http://` redirect downgrade, retire `nginx-ssl.conf`, and add a
  post-deploy href-status sweep to CI (the 1,323-link check above is a 30-second job). Container config change →
  commit and deploy need founder approval. v2 **17** (Meta-review 3 §7).
  **✅ LC-1a COMPLETE — Iteration 21 (2026-09-17), uncommitted.** 26 rewrites moved into `nginx.conf`;
  `absolute_redirect off`; `test:nginx-redirect-parity` gate (chain 28 → 29, independent planted probe);
  CI `nginx-config-syntax` job gating `deploy`; 29-URL legacy sweep + negative control in `verify`; dirty-file
  disclosure in `deploy.sh` and the CI SSH script; DEPLOYMENT.md records that `nginx.conf` is the one live config.
  **LC-1b, founder-gated and still open:** delete `nginx-ssl.conf`, remove `deploy.sh`'s `docker compose cp` line.
  **New, not actioned:** `/404` answers HTTP 200 (soft 404 — search engines see a real page); the openresty proxy in
  front of the container has no documented owner or config in this repo.
- **D-13-1 — primary-product determinations for the 6 waivered entities.** ✅ **Drafted 2026-09-17**:
  `docs/D-13_DETERMINATIONS_DRAFT_2026-09-17.md` (docs only, nothing ratified). Next is founder ratification. First
  decide-by is **2026-10-17** (Figure AI waiver expires 2026-11-16). Lane: blocked-on-founder.
- **RS-4 — one slug implementation for scripts, plus the 13 accented-slug migrations (RISK-018, DC-05).** Per
  Meta-review 3, nine private `slugify` copies in scripts keep RISK-018 live while tests pass (e.g. `sao-paulo.json`
  → `/404`). v2 **15** = 10 + K 2 + P 1 + Rc 2. It touched `lib/slugify.ts`, which is now committed (`119f1757`), so it's
  no longer blocked by It. 20. The migration half needs the D-35 approval-scope answer (Meta-review 3 §8 item 4).
  **✅ RS-4a COMPLETE — Iteration 23 (2026-09-17), uncommitted, behaviour-preserving.** All 12 private slug-function
  copies (the coordinator's baseline count, one more than Meta-review 3's nine — `apply-entity-record.mjs`,
  `apply-us-states.mjs`, `build-entity-history.mjs`, `build-entity-records.mjs`, `export-public-data.mjs`,
  `lib/lint-rules.mjs`, `lib/model-registry-validator.mjs`, `test-collision-ratchet.mjs`, `test-entity-records.mjs`,
  `validate-indexes.mjs`, `research/scripts/reconcile-rotation-state.mjs`,
  `research/scripts/validate-rotation-state.mjs`) now import `slugifyFolded`/`slugifyUnfolded` from the new
  `site/scripts/lib/slug.mjs`, each keeping its own convention exactly (verified: 1,754 generated files re-hashed
  before/after, 0 diffs once the 3 known timestamp fields — `generatedAt`/`generated_at`/`updatedAt` — are excluded).
  New gate `test:slug-conventions` (chain 29 → 30) source-scans for a 13th copy, asserts both conventions against a
  16-entry non-ASCII golden table, and ratchets the 14 known page/data-slug divergences
  (`site/scripts/known-slug-divergences.json`) so the RISK-018 defect surface can only shrink. **Deliberately did NOT
  touch:** `site/src/lib/slugify.ts` (the canonical original the new module mirrors — different module graph, out of
  scope) or `site/scripts/generate-newsletter-html.mjs` (two inline, uncatalogued slug expressions found during the
  source scan that use a third variant trailing-dash rule, `/^-|-$/` vs. the naive convention's `/^-+|-+$/`; not one
  of the 12 files this iteration's scope named — logged here so it isn't lost). **RS-4b, still open and
  founder-gated per AUTONOMY §1b (a rename):** fold the two conventions — pick `slugifyFolded` (the page convention)
  as canonical, add 301s for every currently-served unfolded path, and re-derive every slug-keyed store per rule S9:
  `site/public/data/scores/*.json`, `site/public/data/index.json`, entity records, `research/rotation-state.json`
  keys, `site/public/data/history/*.json`, and the Worker's KV keys / HMAC unsubscribe token (bare-slug, no migration
  script today). Scope: the 14-entry ratchet in `known-slug-divergences.json` is the exact set of entities affected;
  diff the full path/key set before and after per S9. Also fold in `generate-newsletter-html.mjs`'s two inline copies
  while touching this area, and decide the D-35 `&`-convention disagreement (`and` vs `-and-`) the same way. v1: I3
  S5 L3 C5 − E2 − R2 = 12 · v2: K +2 (RISK-018 gate gets its remediation row filed in the same loop, per the scoring
  amendment for gates that freeze live defects) · Rc +2 (installs the fix for a cross-cutting, multiply-occurring
  convention split) → **16**.
- **V9a — `test-pinned-slugs.mjs` tests a private copy of `rowSlug` (`:67`), not the shipped export.** Meta-review 3
  broke the shipped function and the guard still passed 10/0. Work: import from `src/lib/slugify.ts` (a TS import
  from a `.mjs` test needs the same loader approach `test-entity-href` uses). Fold into RS-4 or LC-1.
  v1: I3 S5 L3 C5 − E1 − R1 = **14**.
- **`test:no-stale-counts` has a coverage hole**: it scans `src/app` + `src/components` but not `src/lib` or
  `src/data`. I hard-coded "8 indexes" into `lib/slugify.ts` during It. 20 and the guard would not have caught it
  (I removed it anyway). Work: extend the scan roots, or document the exclusion with a reason.
  v1: I2 S4 L2 C5 − E1 − R1 = **11**.
- **A gate in the suite self-declares "VACUOUS PASS"** — the model-discriminator check reports it has "verified
  nothing" because no index declares `meta.isModelIndex`. Honest, but a green step that checks nothing is a dead
  guard in waiting (DC-09). Work: assert the vacuity condition explicitly so it fails if the premise changes
  silently. v1: I2 S4 L3 C4 − E1 − R1 = **11**.
- **rotation-state rank drift: 600 of 1,324 entries** disagree with the index rank (composite drift **0**), so the
  research staleness baseline carries stale ranks for 45% of the catalogue. Coordinator-measured. v1: I3 S4 L3 C5 − E2 − R2 = **11**.
- **Intra-index duplicate slugs are rank-derived** (`portland-22`, `springfield-94`): the slug changes whenever the
  rank changes, so a score movement silently renames a public URL. `us-cities` holds two Portlands (ME rank 8, OR
  rank 22) distinguished only by `state`. Work: pin state-qualified slugs. v1: I3 S4 L2 C4 − E2 − R2 = **9**.
- **RISK-017 and `known-collisions.json` disagree about which 16 collisions exist** — RISK-017 says "15 US cities
  plus Singapore" (excluding the labs), the ratchet lists 13 cities + Singapore + 2 labs. One register is wrong.
  v1: I2 S4 L2 C5 − E1 − R1 = **11**.
- **Worker KV keys and the HMAC unsubscribe token are bare-slug with no migration script** (`watch:<email>:<slug>`,
  `index:entity:<slug>`; token is `HMAC(email:entity_slug)`). Any future rename silently breaks existing
  subscriptions and their unsubscribe links. Score-Watch is paused, so exposure is likely zero *now* — which makes
  this the cheapest possible moment to fix it. v1: I3 S4 L2 C4 − E2 − R2 = **9**.

### v2 shortlist (Iterations 13–15)

| Order | Item | v1 | v2 | Lane | Status |
|---|---|---:|---:|---|---|
| 13 | **D-1** `unapplied-score-movement` lint rule, forward-dated ≥ 2026-09-15 (RISK-020 reduce K+2 · P+1 · Rc+2, DC-03 = 2 verified occurrences) | 16 | **21** | eligible (file set disjoint from It. 12) | **✅ COMPLETE Iteration 13** (validated after 2 rework rounds; uncommitted pending founder). New follow-up: require `pipeline.scoreChangesApplied` in `validate-daily-briefings.mjs` |
| 14 | **A-1** wire `test-entity-records.mjs` into `npm run test` + slug-collision ratchet (RISK-017/018 · Rc+2 DC-05) | 15 | 19 | eligible | **✅ COMPLETE Iteration 14** (2026-09-16; ratchet proven by planted 17th collision; CI runs `npm test`) |
| 15 | **U-1** coverage/freshness generator, report-only (RISK-001/016). U-2 site publication = founder decision | 15 | 17 | eligible (U-2 blocked-on-founder) | Queued |
| — | L cross-links / overclaiming | 15 | 16 | eligible, held back (no RISKS entry) | Queued |
| — | R-1 waiver T-30 warning + PASS-with-waivers distinct (RISK-015 · Dl+2) | 12 | 16 | — | **✅ DONE — Iteration 22 (2026-09-17), uncommitted.** Warnings at ≤30d, critical at ≤7d, `PASS WITH WAIVERS` result line; tests 17 → 41 with injected fixture dates; verified by simulating 2026-10-18 / 11-10 / 11-15 / 11-17 |

### New backlog item (coordinator discovery, 2026-09-15 — logged and scored before any work, per S3)
- **RS-1 — make `validate-rotation-state.mjs` fail only on real gaps.** Its 22 blocking FAILs are all false: 20 are
  evidenced by same-date change-proposal JSON + digest (early convention), 1 by a report under a different slug
  (`procter-gamble` vs key `procter-amp-gamble`, an HTML-entity leak in the stored name), 1 by a digest entry only
  (`c-te-divoire`, accent slug, RISK-018). Fix: accept same-date proposal JSON as WARN evidence; resolve slug aliases;
  keep FAIL for true zero-evidence; add fixtures for each class (V3). Does NOT write `last_assessed`.
  v1: I4 S5 L4 C5 − E2 − R1 = **15** · v2: K+1 (RISK-008/016 observability, reduce) · P 0 · Rc +2 (DC-09, ≥ 2 dead-guard
  occurrences) → **18**. Lane: eligible, but **S6 blocks implementation** until It. 12/13 are committed.
- **RS-2 — 20 Fortune 500 names published with HTML entities (RISK-023)** — checked 2026-09-15: live and visible
  ("Procter &amp; Gamble" in title/H1; /fortune-500 ranking; 143 built pages), three slugs per company, natural URL
  → 301 `/404`. Split per S2:
  - **RS-2a (X-1, agent-doable):** validator failing on HTML entities in any published entity name, with the 20 known
    cases as a dated, shrinking waiver list; remediation spec (old/new name, page/score/record/rotation slugs, 301 map).
    v1 I4 S5 L3 C5 − E2 − R1 = 14 · v2 K+1 (reduces RISK-023) · P+1 · Rc+2 (DC-05) → **18**. S6 blocks the code
    half; the spec is docs.
  - **RS-2b (X-2, founder-gated, AUTONOMY §1b renames/slugs):** decode the 20 names in `fortune-500.json` and entity
    records, migrate to clean slugs with 301s from both old slugs, rekey rotation-state. Recommended default: approve.

### New backlog item (2026-09-16) — republish the held America-at-250 improvement as a dated correction
- An unrecorded rewrite of the published 2026-07-04 America-at-250 special briefing (made ~2026-09-03: `publicSummary`
  added, `scope`/`cohortSummary` rewritten, body restructured) is **held, not committed** (AUTONOMY §1c). The diff is
  preserved at `research/held-changes/america-at-250-unrecorded-rewrite-2026-09-03.patch` (183 lines) so nothing is lost.
  Correct path: publish the improved content as a dated correction/addendum to that briefing rather than a silent
  rewrite, or discard it. v1: I2 S4 L2 C4 − E2 − R2 = 8. Lane: eligible, low priority.
- Housekeeping deferred: `research/rotation-state.json.bak` (408 KB) and `research/scans/2026-09-09.json.bak` (874 KB)
  remain on disk — deletion needs a permission the session does not have; they are untracked and never committed.

### Iteration 15 — SELECTED 2026-09-16: G-3 + the DC-02 gate (published method claims vs the formula)
- **Why this one:** DC-02 reaches its **third** occurrence (It. 9 "base /80", It. 10 "balanced beats spiky" on
  /ai-models, now the main `/methodology` surfaces). Rule S4 therefore requires a mechanical check, not another prose
  patch. Ungated, and it goes to the benchmark's own method credibility.
  v1: I4 S5 L3 C5 − E2 − R2 = 13 · v2: K+1 (RISK-019 reduce) · P+1 (live on production now) · Rc+2 (gate for a
  ≥2-occurrence class) → **17**. Alternatives: L cross-links/overclaiming 16, D-2 status-ladder renderer 15.
- **Coordinator-verified findings (computed against `scoring.mjs`, 2026-09-16):**
  1. Two of the four published consistency steps are **unreachable**: σ across 8 dimensions bounded 0–5 cannot exceed
     **2.500**, so "σ 3.0–5.0 → 0.4" and "σ > 5.0 → 0.1" can never fire (400k samples produced only the 1.0 and 0.75
     buckets). Published in `ConsistencyStepChart.tsx` (`STEPS` + aria description) and `/methodology` ~line 1294.
  2. "A balanced 70/70 profile beats a spiky 90/40 profile" is **not reliably true** — balanced [3.8×8] = 70.0 loses to
     spiky [5,5,5,5,2.6,2.6,2.6,2.6] = 72.0. Asserted unconditionally in three places (chart annotation,
     `/methodology`, `dimensions.ts` `detail`).
  3. `IntegrationPremiumDiagram` shows an **impossible** premium of 0.5; the reachable set is exactly
     {0, 1.5, 2, 3, 4, 4.5, 6, 8, 10}.
  4. Verified correct and left alone: the Abridge worked example (σ = 0.1654 ≈ 0.17, premium 0, composite 60.9) and the
     `dimensions.ts` `short` string.
- **Gate being added:** `test:method-claims` — asserts the reachable premium set and the σ ceiling against
  `scoring.mjs`, fails on any published step or premium value that cannot occur, and recomputes every worked example.
  Components export their numeric data so the test imports the same constants the UI renders (no HTML scraping).

### New backlog item (2026-09-16, surfaced by the history fix) — 5 briefing references resolve to no published entity
- With dead history files no longer silently persisting, `build-entity-history.mjs` now reports every briefing
  reference it cannot map to a current entity. Five remain, all **pre-existing** and unrelated to today's rename:
  `fortune-500:automatic-data-process` ("Automatic Data Process" — ADP is not among the 447), `fortune-500:oracle-corporation`
  (catalogue carries "Oracle"), `countries:democratic-republic-of-congo` (catalogue slug is the truncated
  `democratic-republic-of-c`, a known legacy quirk), `countries:united-arab-emirates` (**seen 7 times** — the most
  frequent), and `countries:s-o-tom-and-pr-ncipe` (the merged accented duplicate).
- Two look genuinely fixable by identity rather than by loosening matching: the DRC truncated slug, and the UAE, which
  appears in 7 briefings yet has no published row. The other three are name-vs-catalogue mismatches where fuzzy
  matching would risk merging distinct entities — the engineer deliberately refused to widen matching for that reason,
  which is the right call.
- Work: decide per reference — publish the entity, correct the catalogue slug, or accept and document the gap. Each
  published briefing that names one of these has a reader-visible dead end (the entity link resolves to nothing).
  v1: I3 S4 L3 C4 − E2 − R2 = 10 · relates to RISK-003 / RISK-018 / RS-3.

### New backlog item (2026-09-16, found in post-deploy verification) — unformatted total on /methodology
- The live coverage sentence reads "**811 of 1329**" — no thousands separator, while the share beside it is
  pre-formatted ("61.0%"). `site/src/data/neverAssessedCoverage.ts` exposes `neverAssessedShareFormatted` but only a
  raw numeric `totalTrackedEntities` / `neverAssessedCount`, and the page prints those directly. Fix: have
  `generate-methodology-coverage-data.mjs` also emit formatted strings (e.g. `1,329`) and use them in the page, so
  formatting stays with the generator rather than being re-derived in JSX. Cosmetic only — no number is wrong — so it
  rides along with the next deploy rather than triggering one. v1: I2 S3 L1 C5 − E1 − R1 = 9.

### New backlog item (2026-09-16, found while verifying the rename) — export does not prune removed slugs
- `export-public-data.mjs` writes `site/public/data/scores/<slug>.json` per entity but never deletes files for slugs
  that no longer exist, so after the RISK-023 rename the 20 old-key files (`procter-amp-gamble.json`, …) remained in
  `site/public/data/scores/` and `site/out/`. Harmless today: both directories are gitignored, the catalog
  `index.json` lists only the 1,325 current slugs (0 old keys), and the VPS deploy rebuilds the Docker image from
  source, so production serves a clean tree. It matters for any deploy path that copies an existing output directory,
  and it hides the true state locally. Fix: prune orphaned score files during export (or write to a fresh directory),
  with a test that a removed slug's file disappears. v1: I2 S3 L2 C5 − E1 − R1 = 10.

### New backlog item (2026-09-16, found by the coverage generator) — RS-3: 4 tracked entities have no published row
- `research/rotation-state.json` tracks **54** ai-labs entities while `site/src/data/indexes/ai-labs.json` publishes **50**.
  The four tracked-but-unpublished: `reflection-ai` (Reflection AI), `nvidia-ai` (Nvidia AI), `spacex-ai` (SpaceX AI),
  `oracle-ai` (Oracle AI). This is the entire 1,329-tracked vs 1,325-published gap (coordinator-verified 2026-09-16).
  Consequence already observed: the 2026-09-15 assessor could not assess Oracle AI — it holds an unpublished 21.9 with
  no index row, which breaks the published-only rule. Decide per entity: publish it (an index write, founder-gated) or
  stop tracking it. Until then the coverage report flags the mismatch rather than hiding it.
  v1: I3 S4 L3 C5 − E2 − R2 = 11 · v2 K+1 (RISK-001/016 observability) → 12. Lane: eligible for the audit half; the
  publish-or-delist decision is founder-gated (AUTONOMY §1b).

### New backlog item (2026-09-16, found during the Score-Watch pause) — sales-form copy contradicts the pause
- `site/src/components/purchase/SalesInquiryForm.tsx` still prefills the `score-watch` inquiry as active subscription
  onboarding ("confirm billing contact and start date"), which reads oddly beside the new `/score-watch` disclosure that
  no new subscriptions are being taken. It is the shared fallback pattern every paused product uses, so it was left
  alone rather than special-cased mid-task. Decide: reword the prefill for paused products, or close the manual
  fulfilment channel entirely until Score-Watch is verified end to end. v1: I3 S4 L2 C5 − E1 − R1 = 12.

### New backlog items (from meta-review §8)
- Deterministic `generatedAt` in `build-special-briefings.mjs` (DC-08) — v1 ≈ 13.
- Extend `test-no-stale-counts` to `site/scripts/` generators (DC-01 coverage gap).
- Method-page numeric-example test (DC-02; required by S4 before G-3 ships).

### Meta-review §10 application status (2026-09-15)
- ✅ 1–3 `.claude/agents/coordinator.md` overlay (v2, S1–S7, V1–V7, triggers) · ✅ 4 `docs/DEFECT_CLASS_REGISTRY.md`
  · ✅ 5 v2 shortlist above · ✅ 6 `SYSTEM_HEALTH.md` measured snapshot · ✅ 7 ITERATION_LOG v1/v2 + V-checklist +
  pathspec (from It. 13) · ⏳ 8 decision packet delivered in `docs/founder-briefings/2026-09-14.md`; no answers yet.
- ✅ meta-coordinator spec rescoped (§7.2 item 6).
- Not yet scored into the table: the full PR/FAQ top 20 with a v2 column. Deferred until after It. 15 per §5.4.

### Blocked-on-founder (decision packet, `docs/META_REVIEW_2026-09-14_ITER10-12.md` §9)
Commit It. 12 by pathspec · hold America-at-250 edit (dated 2026-09-03) · Score-Watch pause · publish never-assessed
share (U-2) · waiver extension · cadence floor · branch protection · batched approvals · refresh CLAUDE.md data
notes · `.bak` cleanup + branch naming.

---

## Iteration 10 — 2026-09-14 (source: PR/FAQ 2026-09-14 ranked table, 12 specialist reviews)

Candidate set is the PR/FAQ's deduplicated, reconciled table
(`docs/PRFAQ_AI_MODEL_BENCHMARK_AND_CONTINUOUS_RESEARCH_2026-09-14.md` §6) — not regenerated, to avoid
duplicate work on the same day. Top 10 by reconciled score, with this loop's selection:

| # | ID | Item | Score | Status |
|---|----|------|-------|--------|
| 1 | U | Coverage/freshness dashboard from `rotation-state.json` | 16 | Queued — **next** (PR/FAQ do-now #1) |
| 2 | D | Status ladder: measured vs published/applied/held | 15 | Queued (do-now #3) |
| 3 | I | Defect-class registry, second occurrence → mechanical gate | 15 | Queued |
| 4 | L | Cross-link `/ai-models` ↔ `/ai-evaluation-suite` ↔ `/ai-labs`; remove overclaiming | 15 | Queued |
| 5 | N | Verifiable founder-approval provenance | 14 | **Founder decision** |
| 6 | S | Fix `/cite` URL pattern; regenerate `llms.txt` | 14 | **S-1 ✅ COMPLETE Iteration 11** (dead pattern fixed on /cite, /media, /data; llms.txt count derived, /cite + /ai-models added). S-2 CompassionBench disambiguation → founder decision |
| 7 | C | Test-retest reliability study + run manifests | 13 | Queued (30 days) |
| 8 | E | Disclose placeholder/seed status publicly | 13 | Queued (30 days) |
| 9 | F | One evidence-tier scale | 13 | Queued (30 days) |
| 10 | G | Remove false "balanced beats spiky" claim; formula sensitivity note | 13 | **G-1 (claim removal) ✅ COMPLETE Iteration 10**; G-2 sensitivity note queued |

**Why G-1 was selected over higher-scored U/D/I:** it is the only top-10 item that is a *certain*,
currently-published factual error about the benchmark's own formula (RISK-019, "Certain / High"),
with Effort 1 and Risk 1 for the copy-only half, and no founder gate. Bias order: correctness/determinism
first. Effective score for the split sub-item G-1: I4 + S4 + L3 + C5 − E1 − R1 = **14**.

Follow-ups spawned (not implemented):
- (Iteration 11) `/media` hard-coded "1,156 entities" → `entityCount.ts`; llms.txt model-scored literal →
  derive from model-index facts; `/404` soft-404 (HTTP 200) → item T.
- **✅ COMPLETE Iteration 12 (derived counts + `test-no-stale-counts` guard; also added missing Universities
  rows on home/data/score-watch). Original entry:** NEW candidate (found during grant-request verification, 2026-09-14) — stale hard-coded entity counts on
  public pages.** "1,156 entities" (canonical 1,325) in `site/src/app/data/page.tsx` (5 places incl. meta
  description), `media/page.tsx` (4), `updates/special/page.tsx` (2 meta), `updates/special/[slug]/page.tsx`;
  "seven indexes" (8); "21 U.S. states" (51) in `data/page.tsx:35` and `pricing/page.tsx:299`; "50 humanoid
  robotics labs" (92) in `data/page.tsx:47`. Fix: route through `entityCount.ts`/`INDEX_REGISTRY` + add a
  build guard against literal counts. Type: fix · I4 S5 L3 C5 E1 R1 = **15** — ties the top of the queue.
- **Next selection:** U (coverage dashboard) if the founder approves publishing the never-assessed share;
  otherwise D (status ladder) or L (cross-links / overclaiming), both ungated.
- G-3: verify related wording in `site/src/app/methodology/page.tsx:1266`, `ConsistencyStepChart.tsx`,
  `dimensions.ts:635` ("balanced 70/70 can beat spiky 90/40" — different averages; likely true, unverified).
- Commit + deploy of Iteration 10 changes (founder approval, AUTONOMY §1b).

---

## Iteration 9 — Methodology-Page Hardening (founder-authorized multi-item push)

Source: 5-lens review (system-architect, benchmark-research, ux-designer, knowledge-architect,
frontend-engineer) of `/methodology` on 2026-06-20. Founder authorized "all improvements + quick-wins."
Split into **Tranche A** (doc/page/code-only — NO published-score change, implemented this iteration in
validated waves) and **Tranche B** (changes the scoring formula or published scores — GATED behind the
editorial human-approval rule; `score-updater` is human-triggered only and must NOT auto-run).

### Tranche A — ✅ COMPLETE (Iteration 9, 2026-06-20 — no score changes; tsc clean, build 1,880 pages)
> Plus a coordinator-found correction: the page's systemic "base /80" formula model was incoherent and
> contradicted `scoring.ts`; corrected site-wide (page + both chart components). Worked example reconciles.

| # | Item | Type | Score | Wave | Source |
|---|------|------|-------|------|--------|
| A7 | Show integration-premium arithmetic in Abridge worked example (formula already in `dimensions.ts:634`) | Improvement | **14** | 3 | knowledge R1 |
| A1 | Fix anchor-table header "0·1·2·3·4 = Exemplary" → correct 0–5 scale (page.tsx:811) — unanimous | Fix | **13** | 1 | all 4 lenses |
| A3 | Version sync: hero stat + changelog v1.1 → **v1.2** to match live engine (`scoring.mjs:22`) | Fix | **13** | 1/2 | arch W1, research C4 |
| A6 | Document the 3 hidden governing rules: victim/perpetrator attribution, near-floor limitation, harm-flag (0.0) floor | Improvement | **13** | 2 | arch W2/W3, research G1-3 |
| A2 | Complete TOC + fix broken `#continuous-pipeline` anchor + dedupe "Framework overview" label | Fix | **12** | 1 | ux P2/P3, frontend I2/I3/I8 |
| A8 | Evidence notes: recency/decay rule, "served population" per entity type, positive-evidence search | Improvement | **12** | 2 | research R2/R5/C3 |
| A5 | Data-drift: derive worked-example rows + "Assessors in practice" from `DIMENSIONS` | Fix | **11** | 1 | frontend R4/R7 |
| A9 | "3-minute summary" panel above the fold for journalists | Improvement | **10** | 3 | ux R4, knowledge R2 |
| A10 | Move newsletter signup out of mid-stream scoring explanation | Fix | **9** | 3 | ux R3 |
| A11 | "Two kinds of scores" (normal vs floor) + "if you remember one thing" closer | Improvement | **9** | 3 | knowledge R4/R5 |
| A4 | Gate back-to-top button on scroll threshold (comment claims CSS gating that doesn't exist) | Fix | **8** | 1 | ux P6, frontend I6 |

### Tranche B — GATED (changes published scores / scoring math — awaiting founder approval)

| # | Item | Score | Why gated |
|---|------|-------|-----------|
| B2 | Resolve band-boundary semantics (`getBand` upper-inclusive vs `BANDS.min/max` lower-inclusive) | 10 | Reclassifies entities sitting exactly on 20/40/60/80 (Nigeria 18, Humana 40.6 are live boundary cases) |
| B3 | Harm trigger `=== 0` → band (`<= threshold`) — closes "0.1 keeps the bonus" loophole | 10 | Changes integration premium → recomputes composites catalog-wide |
| B5 | Persist integration-premium breakdown into per-entity public JSON | 10 | Additive (no composite change) but touches export pipeline — sequence after Tranche A |
| B1 | Make harm-flag/0.0 floor explicit in `scoring.ts` (`harmFlag`/`floorDesignated` clamp) | 9 | Re-baselines all floor entities; must reproduce existing 0.0s exactly + extend 69-case test suite |
| B7 | Evidence-saturation / scope-of-probe pathway for near-floor entities (the UHG problem) | 9 | Highest risk — loosens adjudication trigger; risks scoring on allegation |
| B6 | Replace "default to lower anchor on absence" with explicit Insufficient-Evidence status | 10 | Changes published scores/display for low-transparency + placeholder entities |
| B8 | Define 4 confidence levels and make them consequential (bar low-confidence from rankings) | 8 | Changes ranking display/score authority |
| B4 | Smooth/justify step-function cliffs (consistency & weakness multipliers) | 6 | Re-scores entire catalog |

---

## Top 10 Candidates (legacy — April Loops 1–3 / Revenue Cycle 1)

### 1. Fix 4 failing interactive tests
- **Type:** Fix
- **Problem:** `last-run.json` shows `status: "failed"` with 4 failures — 3 ResearchConfigurator tests and 1 SelfAssessment test. The "54 tests passing" claim is now false. Uncommitted SelfAssessment.tsx changes likely caused the regression.
- **Expected benefit:** Restores test integrity baseline — prerequisite for all other validation.
- **Evidence:** `test-results/.last-run.json` status: failed; 4 untracked error directories in test-results/
- **Impact:** 5 | **Strategic Alignment:** 5 | **Learning Value:** 3 | **Confidence:** 5 | **Effort:** 2 | **Risk:** 2
- **SCORE: 14**
- **Status:** ✅ COMPLETE (Loop 1 — 2026-04-14)

### 2. SelfAssessment hardcoded dimension count (/8)
- **Type:** Fix
- **Problem:** `calcScores` divides by literal `8` in two places instead of `DIMENSIONS.length`. Silent score corruption if dimensions change.
- **Expected benefit:** Self-consistent scoring formula; correctness guarantee.
- **Evidence:** SelfAssessment.tsx lines 26, 29 — `/ 8` hardcoded vs dynamic DIMENSIONS array.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 14**
- **Status:** Queued

### 3. Homepage stat claims inconsistent with data
- **Type:** Fix
- **Problem:** Homepage says "25 AI labs" (actual: 50) and "5 index families" (actual: 7). Credibility-damaging for a benchmark institution.
- **Expected benefit:** Prevents first-impression credibility damage with press, researchers, executives.
- **Evidence:** Homepage page.tsx vs data files and rendered index pages.
- **Impact:** 4 | **Strategic Alignment:** 4 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 4. Self-Assessment results dead-end — no conversion CTA
- **Type:** Fix
- **Problem:** Users who complete the 40-question assessment see a score but no next step — no link to certified assessments, contact sales, or reports.
- **Expected benefit:** Converts highest-intent user action into revenue signal.
- **Evidence:** SelfAssessment.tsx results state has no CTA; no link to /certified-assessments or /contact-sales post-result.
- **Impact:** 5 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 5. ResearchConfigurator routes to contact-sales, not Gumroad
- **Type:** Fix
- **Problem:** Configurator builds a contact-sales URL instead of Gumroad purchase link. Blocks self-serve revenue despite 5 live Gumroad URLs existing unused.
- **Expected benefit:** Removes full sales-cycle friction; enables first unassisted revenue.
- **Evidence:** ResearchConfigurator.tsx line 49 href → /contact-sales; gumroad.ts has 5 product URLs unused in this flow.
- **Impact:** 5 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** ✅ COMPLETE (Revenue Cycle 1 — 2026-04-16) — Product cards now link directly to Gumroad; configurator already had Gumroad routing from prior fix

### 6. JSON data schema validation at build time
- **Type:** Fix
- **Problem:** 7 JSON files have no schema enforcement. Typos in dimension codes or missing fields silently produce broken UI.
- **Expected benefit:** Deterministic build failures on malformed data.
- **Evidence:** ai-labs.json dimension codes must match dimensions.ts — coupling is entirely implicit.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 13**
- **Status:** Queued

### 7. Data integrity tests (entity counts, rank contiguity)
- **Type:** Fix
- **Problem:** No test validates data correctness — e.g., 447 Fortune 500 entries exist, ranks are contiguous, scores sum correctly.
- **Expected benefit:** Catches data extraction regressions before deployment.
- **Evidence:** meta.entityCount in JSON is never asserted against actual array length.
- **Impact:** 4 | **Strategic Alignment:** 5 | **Learning Value:** 2 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 14**
- **Status:** ✅ COMPLETE (Loop 3 — 2026-04-16) — `npm run validate` checks 12,686 data points across all 7 files

### 8. Homepage missing title tag
- **Type:** Fix
- **Problem:** Homepage metadata has description but no title. Search engines and social previews show fallback.
- **Expected benefit:** Immediate improvement in search snippet and social share quality.
- **Evidence:** page.tsx metadata object has only description field.
- **Impact:** 3 | **Strategic Alignment:** 3 | **Learning Value:** 1 | **Confidence:** 5 | **Effort:** 1 | **Risk:** 1
- **SCORE: 10**
- **Status:** Queued

### 9. Entity search on ranking pages
- **Type:** Improvement
- **Problem:** No name search on ranking tables. Users looking for a specific company must scroll 447 rows.
- **Expected benefit:** Increases engagement, reduces bounce, creates conversion moment.
- **Evidence:** RankingTable has sector filter but no text search. Fortune 500 has 447 rows.
- **Impact:** 4 | **Strategic Alignment:** 3 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 3 | **Risk:** 1
- **SCORE: 10**
- **Status:** Queued

### 10. SelfAssessment scoring unit tests
- **Type:** Improvement
- **Problem:** calcScores and getBand contain multi-step math with no unit tests. Edge cases untested.
- **Expected benefit:** Catches regressions in score calculation.
- **Evidence:** No unit test files exist in repo; calcScores is a pure function.
- **Impact:** 4 | **Strategic Alignment:** 4 | **Learning Value:** 3 | **Confidence:** 4 | **Effort:** 2 | **Risk:** 1
- **SCORE: 12**
- **Status:** Queued
