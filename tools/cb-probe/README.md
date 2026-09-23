# cb-probe

A local, stdio-only MCP server that lets an AI model — running inside your own MCP host, using
your own credential — read Compassion Benchmark's published probe items, answer them, and either
(a) rate its own (or another pasted model's) answers with no score attached (`JudgeEstimate`), or
(b) run a full **scored run** that ends in a composite and a band (`SelfRunScorecard`).

**Neither artifact is a Compassion Benchmark score.** See [What this is not](#what-this-is-not)
below — that stays true even for the scored run, which is why it looks the way it does.

## Two artifacts, two guarantees

| | `JudgeEstimate` | `SelfRunScorecard` |
|---|---|---|
| Tools | `open_judge_session` / `record_item_estimate` / `summarise_judge_session` | `start_scored_run` / `next_item` / `record_item_rating` / `run_exposure_probe` / `finish_scored_run` |
| Composite / band | **Never** — no field exists to hold one | **Yes, but only when the run covers all 8 dimensions** — computed by Compassion Benchmark's own canonical formula (`site/scripts/lib/scoring.mjs`, imported, never reimplemented). A run over fewer than 8 withholds both (`composite: null`, `band: null`) and explains why in `composite_withheld_reason` — see "Composite coverage" below. |
| `official` | `false`, structurally | `false`, structurally |
| Contamination check | Not required | **Mandatory** — `finish_scored_run` refuses without a completed `run_exposure_probe` |
| Subdimensions (40 codes) | N/A | Explicitly absent, with a live-checked reason (see below) |

Both schemas share one two-way vocabulary ban (`lib/validate-estimate.mjs`, `lib/validate-scorecard.mjs`):
official-sounding keys (`score`, `rank`, `benchmark`, `run_id`, `cohort`, …) are banned anywhere in
the tree, and only a declared key set is accepted at each level. `SelfRunScorecard` **extends** that
ban rather than relaxing it wholesale: `composite` and `band` are permitted there, and *only* there
— a `JudgeEstimate` carrying either key still fails validation (tested).

## What it does

- Serves the public probe item bank (`site/src/data/model-benchmark/tasks-v1.json`), projected
  through a field-separation whitelist so only `id`, `dimension`, `construct`, and `prompt` ever
  reach a model — never the evaluator-only fields (answer keys, review notes, source-only fields).
- **`JudgeEstimate` flow:** open a session, record a 1–5 rating with a rationale against each
  item's published rubric anchors, get back a summary with per-item estimates and per-dimension
  *counts* — no composite, no band, ever.
- **`SelfRunScorecard` flow (scored run):** start a run (>= 3 trials per item, the variance floor),
  answer each item via `next_item`, record an auditable rating (anchor + verbatim evidence quote)
  via `record_item_rating`, run the mandatory offline contamination check via
  `run_exposure_probe`, then call `finish_scored_run` to get a composite, a band, per-dimension
  means, per-item trial variance, full provenance, and the embedded contamination result.
- Writes session/run data only under a local artifact root you control (`CB_ARTIFACT_ROOT`), never
  inside this repository, never anywhere under `site/` or `research/`.

## What it does NOT do

- **No network I/O of any kind.** No `fetch`, no HTTP client, no provider SDK. Proven by an
  automated source scan in `npm test`. The exposure probe's "contamination check" is entirely
  offline: it compares a recollection you paste against the bank file already on disk.
- **No API key.** The host model already holds whatever credential it needs — cb-probe never
  sees, stores, or requests one.
- **No rank, no leaderboard, no comparison between subjects, ever, in either artifact.**
  `SelfRunScorecard.comparability` is structurally `"none"` even though it carries a composite —
  the number is comparable in *method* to a published score (same formula), never in *standing*.
- **No official score, in either artifact.** `official` is `false` in both schemas, structurally —
  no code path in either builder accepts it as an input parameter, so there is nothing for a
  caller to set. This is asserted by both validators and tested directly.

## Install

### Option A — Claude Code CLI (recommended)

```sh
claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "C:/Users/philk/applied-compassion-benchmark/tools/cb-probe/bin/server.mjs"
```

Use `-s user` instead of the default `-s local` if you want cb-probe available in every project,
not just this one. Run `claude mcp list` to confirm it registered, and `claude mcp remove cb-probe`
to remove it.

### Option B — project-scoped `.mcp.json`

Create (or add to) a `.mcp.json` at your project root:

```json
{
  "mcpServers": {
    "cb-probe": {
      "command": "node",
      "args": ["C:/Users/philk/applied-compassion-benchmark/tools/cb-probe/bin/server.mjs"],
      "env": {
        "CB_ARTIFACT_ROOT": "~/compassion-probe-sessions"
      }
    }
  }
}
```

Both options use an **absolute path** to `bin/server.mjs` and require Node 20+. Adjust the path
if your checkout lives somewhere other than `C:/Users/philk/applied-compassion-benchmark`.

### Any other MCP host

Point it at the same stdio command: `node <absolute-path-to>/tools/cb-probe/bin/server.mjs`, with
`CB_ARTIFACT_ROOT` set in its environment if you want a non-default artifact location. The server
speaks plain JSON-RPC 2.0, newline-delimited, over stdin/stdout — no host-specific glue required.

## First prompt to try

**Unscored (`JudgeEstimate`, no number at all):**

> Use `cb-probe` to see how you handle Compassion Benchmark's published probe items. Call
> `explain_what_this_is_not` first and summarise it for me. Then call `list_probe_items` for
> the `AWR` dimension, answer each item's prompt yourself, open a judge session, record a
> 1–5 rating with a rationale for each one against `get_anchors`, and summarise the session.

**Scored (`SelfRunScorecard`, ends in a composite and a band):**

> Use `cb-probe` to run me through a scored self-run. Call `start_scored_run` with
> `subject_label`, `judge_label`, and `dimensions: ["AWR"]` to try just one dimension, or omit
> `dimensions` for all 8 — note that only the all-8 run gets a composite/band; a partial run like
> `["AWR"]` reports dimension means only (see "Composite coverage" below).
> Then call `run_exposure_probe` with just the `run_id` to get the contamination challenge,
> recall each listed item's wording from memory as honestly as you can (say so if you don't
> remember it), and call `run_exposure_probe` again with your `recall_attempts`. Then loop
> `next_item` and `record_item_rating` — for every rating, name the published anchor you matched
> (`anchor_matched`) and quote the exact part of your own response that supports it
> (`evidence_quote`) — until `next_item` reports `status: "complete"`. Finally call
> `finish_scored_run` and show me the composite and band if they're present (they won't be for a
> partial run like this one — show me `composite_withheld_reason` instead), and the contamination
> result either way.

Sensitive items (active suicidal ideation, domestic violence, miscarriage) are **excluded by
default**. Only ask for them with `include_sensitive: true` if you specifically want to see how
a model handles crisis-adjacent content — the tool description says so, and so does this file.

## What this is not

- Not an official Compassion Benchmark score, result, ranking, or index entry — in *either*
  artifact. `official` is `false`, structurally, in both `JudgeEstimate` and `SelfRunScorecard`.
- Not run by Compassion Benchmark, on Compassion Benchmark infrastructure, with Compassion
  Benchmark's credentials. It runs entirely on your machine.
- Not blinded, not (for `self`/`cross` configurations) adjudicated by a second party, not drawn
  from an unpublished item pool. Every item here is published with its full rubric and has been
  on the open web for months — see the contamination section below for how a scored run measures,
  rather than ignores, that risk.
- Not guidance about which AI system to use in a real crisis. Several items describe
  crisis-adjacent situations; the ratings describe how a model responded to a *fictional* test
  prompt.
- **`JudgeEstimate` emits no score at all.** No composite, no band, no rank, structurally —
  there is no field in its schema where one could be stored.
- **`SelfRunScorecard` emits a composite and a band only when all 8 dimensions were run, computed
  by Compassion Benchmark's own canonical formula — but never a rank, a leaderboard entry, or a
  comparison against a published entity or another subject.** `comparability` is fixed to
  `"none"`. Same maths as our published scores (so the number means the same thing
  methodologically); never the same status. A run over fewer than 8 dimensions gets `composite:
  null` and `band: null` instead — see "Composite coverage" above for why.
- **Subdimension scoring (the 40 codes in `site/src/data/dimensions.ts`) is not available, in
  either artifact.** `SelfRunScorecard.subdimensions_status.available` is fixed to `false`, with a
  reason computed live against the actual task bank on every run (today: 0 of the bank's 33 items
  carry a subdimension field). This is not a policy choice — the item bank simply isn't wired to
  the subdimension taxonomy yet, and this tool will not fabricate a number that doesn't exist.
- Call `explain_what_this_is_not` at any time to retrieve the full separation statement, including
  what an actual official Compassion Benchmark score requires that this tool does not provide.

## Contamination: `run_exposure_probe`

Every item in this bank is published with its full five-anchor rubric and has been on the open
web for months. Any model trained since publication may have memorised both the items and the
answer key — scoring without checking for that manufactures flattering numbers. So
`run_exposure_probe` is a **mandatory precondition** of `finish_scored_run`, implemented entirely
offline in two calls:

1. Call with just `run_id` — you get back a handful of item ids (never their text).
2. Recall each item's exact prompt wording **from memory**, then call again with
   `recall_attempts: [{ item_id, recalled_text }, ...]`. The tool compares your recollection to
   the bank's real text using **normalised token overlap** (lowercase, strip punctuation, split
   into a token set, Jaccard similarity = `|intersection| / |union|`), entirely on your machine.

This is a screening signal, not proof: it cannot distinguish real memorisation from coincidental
word overlap, and a model that recalls an item's *gist* without its exact wording will score
artificially low despite genuine exposure. The result — method, limitations, and all — is embedded
verbatim in `SelfRunScorecard.contamination`, at the same visual weight as the composite.

## Composite coverage: all 8 dimensions, or no headline number

A scored run must cover **all 8 canonical dimensions** (`AWR`, `EMP`, `ACT`, `EQU`, `BND`, `ACC`,
`SYS`, `INT`) to produce a `composite` and a `band`. If you start a run with `dimensions` naming
fewer than 8 (or omit an item entirely), `finish_scored_run` returns `composite: null` and
`band: null`, plus a required `composite_withheld_reason` string naming exactly which dimensions
are missing.

**Why:** `computeCompositeFromDimensions`, the canonical formula this tool imports unmodified,
documents `?? 1` for any dimension with no score — an absent dimension is silently treated as a
Critical (1/5) result when the composite is computed. Left unguarded, that means a single-dimension
run scoring a strong `AWR: 4` can produce a composite as low as `9.4` ("Critical") purely from the
other seven dimensions defaulting to 1 — a number that is arithmetically correct and substantively
false. Rather than let that number travel with a footnote nobody reads, this tool withholds it
entirely for partial-coverage runs. The per-dimension means that *were* measured, the per-item
ratings, the per-item trial variance, and the contamination result are all still reported in full —
a partial run stays useful, it just doesn't get a headline number. `coverage_note` explains the
same thing in the context of what was measured; `composite_withheld_reason` is the field to check
programmatically for whether a composite exists at all.

## Tools

| Tool | Returns |
|---|---|
| `list_probe_items({ dimension?, include_sensitive? })` | Item id, dimension, construct, and the prompt only — projected through a whitelist derived from the bank's own `meta.fieldSeparationPolicy`. `include_sensitive` defaults to `false`. |
| `get_anchors({ item_id })` | The five 1–5 rubric anchors for one item. |
| `open_judge_session({ subject_label, judge_model_label })` | A `session_id`. Both labels are self-reported and stored as such — never verified. |
| `record_item_estimate({ session_id, item_id, response_text, rating_1_5, rationale })` | Records one item's estimate. Rejects `rating_1_5` outside the integer range 1–5. |
| `summarise_judge_session({ session_id })` | The `JudgeEstimate` artifact: per-item estimates and per-dimension counts. No composite, no band. |
| `start_scored_run({ subject_label, judge_label, judgeConfiguration?, dimensions?, trials?, seed?, temperature? })` | A `run_id`. Refuses `trials < 3`. `judgeConfiguration` defaults to `"cross"` (the documented default); `"self"` and `"panel"` are also allowed. |
| `next_item({ run_id })` | The next pending trial's prompt only (never the rubric anchors). `{ status: "complete" }` once every planned trial is recorded. |
| `record_item_rating({ run_id, item_id, response_text, rating_1_5, anchor_matched, evidence_quote, judge_label? })` | Records one trial. Rejects a rating with no `anchor_matched` or no `evidence_quote`, and rejects an `evidence_quote` that isn't actually an excerpt of `response_text`. |
| `run_exposure_probe({ run_id, recall_attempts? })` | The contamination challenge (call 1) or result (call 2). Mandatory before `finish_scored_run`. |
| `finish_scored_run({ run_id })` | The `SelfRunScorecard`: composite and band **only if all 8 dimensions were covered** (otherwise both are `null` and `composite_withheld_reason` explains why), per-dimension means, per-item trial variance, provenance, and the embedded contamination result. Refuses until the probe has completed and every planned trial is recorded. |
| `explain_what_this_is_not()` | The full separation statement, as a tool, so a host model can retrieve and cite it. |

## Where session/run data lands, and how to delete it

Every judge session writes to `<CB_ARTIFACT_ROOT>/<session_id>/`:

- `session.json` — the session's labels and metadata
- `estimates/<item_id>.json` — one file per recorded item estimate
- `judge-estimate.json` — written once you call `summarise_judge_session`

Every scored run writes to `<CB_ARTIFACT_ROOT>/<run_id>/`:

- `run.json` — the run's labels, configuration, and trial plan
- `trials/<item_id>__t<trial_index>.json` — one file per recorded rating
- `exposure-probe.json` — the contamination challenge, then its scored result
- `scorecard.json` — written once you call `finish_scored_run`

`CB_ARTIFACT_ROOT` defaults to `~/compassion-probe-sessions` and can be set to anywhere you like,
**except** inside this repository or inside any other git working tree — the server refuses to
start (or write) if it resolves there. cb-probe holds no copy of anything you record and cannot
delete it on your behalf, because it never had it. To delete a session, delete its directory:

```sh
rm -rf ~/compassion-probe-sessions/<session_id>
```

To delete everything, delete the whole artifact root.

## Data handling

`response_text` — whatever you paste as the model output being judged — is stored verbatim to
your local disk and never interpreted, parsed for commands, or sent anywhere by cb-probe. It will,
of course, also be seen by whatever model provider you're using, the same as any other message you
send it. If you're pasting real distress text (yours or someone else's) rather than a fictional
test response, treat it accordingly — this tool adds no privacy protection beyond "it never leaves
your machine via cb-probe itself."

## Development

```sh
npm test          # node --test, 78 tests, zero dependencies
```

No build step. No runtime dependencies — MCP over stdio is implemented directly as plain
JSON-RPC 2.0 (`initialize`, `notifications/initialized`, `tools/list`, `tools/call`), one JSON
message per line on stdin and stdout. Replies go to stdout only; all logging goes to stderr, so
stdout stays a clean protocol stream for the MCP host.

The only two files outside `tools/cb-probe/` that this package reads are imports, not copies:
`site/scripts/lib/scoring.mjs` (`computeCompositeFromDimensions`, `getBand` — the canonical
composite arithmetic, never reimplemented) and `site/scripts/lib/evaluation-statistics.mjs`
(`computeItemTrialVariance`, `mean`, `THRESHOLDS.MIN_TRIALS_PER_ITEM_FOR_VARIANCE` — the trial
floor and variance statistics). Both are pure, dependency-free Node modules, so importing them
does not add a runtime dependency.

## Design provenance

This package implements the tool surface specified in `docs/MCP_SERVER_PLAN_2026-09-20.md` §2 and
`docs/ARCHITECTURE_RELEASE_WATCH_AND_BYO.md` §4.4 (both already ratified), plus the scored run
described in `docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md`. That document records AMB-B (whether a
self-run tool may ever emit a composite/band) as open pending a founder decision; the founder
asked for a scored run directly, twice, which this build treats as resolving AMB-B in the
document's own recommended direction — "emit it, make it impossible to mistake for ours" — with
the mandatory contamination check and structural `official: false` that direction requires.
`judgeConfiguration: "self"`'s prominent warning is grounded in `DECISIONS.md` D-07: the same
automated Compassion Benchmark pipeline scored the same entity (ADP) 58.1 and 60.6 three days
apart, crossing a band boundary — evidence that even neutral, non-self automated scoring carries
real variance, before self-judgement's inflation risk is added on top.
