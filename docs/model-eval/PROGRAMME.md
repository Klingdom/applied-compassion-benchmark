# AI model evaluation programme (D-60): consolidated plan

**Owner:** coordinator · **Started:** 2026-10-22 · **Authority:** D-60, agent-doable work only. No commit or deploy, no
protocol ratification, no key, no ranking, no `site/src/data/**` writes.

## Phase 1: discovery and design (done 2026-10-22)

| Document | Agent | Coordinator verification (V2) |
|---|---|---|
| `ARCHITECTURE_EVAL_V2.md` | system-architect | Absence of `wave-ready.mjs`, `audit-wave.mjs`, `PROTOCOL.v2` and `wave-*` re-checked, with positive controls |
| `TEST_PLAN_EVAL.md` | qa-engineer | FM-6 confirmed: `lib/weekly.mjs:717-729` checks committed and unmodified only, never commit time against the first record. FM-8 confirmed: `done_reason` is stored (`local-subjects.mjs:418`) and checked nowhere |
| `PRD_MODEL_EVALUATION.md` | product-manager | Baselines read from files (the agent had no shell); re-check at Phase 4 |
| `METRICS_EVAL.md` | analytics | Baseline script run by the coordinator; every hand-derived cell matched (note appended) |
| `SECURITY_REVIEW_EVAL.md` | security-reviewer | F2 confirmed: `git ls-files research/model-runs` lists 15 paths under `/keys/` |
| `UX_FLOWS_EVAL.md` | ux-designer | Step counts come from runbook text; no live wave exists |
| `COMPASSION_REVIEW_EVAL.md` | compassion-steward | MF1 confirmed: 93 items, no `sensitivity` key (field union enumerated). MF4 confirmed: `JUDGE_ANSWER_SCHEMA` has no harm field |
| `METHODS_LANDSCAPE.md` | competitive-researcher | Sources not re-opened. README limit 1 (judge ratings treated as independent trials) confirmed at `research/model-runs/README.md:268-275` |

## What the evidence says, in one paragraph

The pipeline is well tested where it has been built: 259 model-runs tests and 308 wave tests pass. It has never run a
weekly wave. **None of the 10 v2 publication gates is automated.** Four integrity checks a wave would rely on are missing
or partial:
- plan-before-data timing;
- truncation;
- judge sanity beyond quote grounding;
- signed drift.

The instrument has three unmeasured weaknesses that the existing pilot data can test without any new model run:
- intervals that treat judge ratings as independent;
- possible length and position effects;
- items at the floor or ceiling.

Two duty-of-care gaps block serving any sensitive item: **no item carries a sensitivity tag**, and **critical harm
has no field**. Fixing either needs a qualified human, or schema changes that must come before `include_sensitive`.

## Phase 2: build (started 2026-10-22, four parallel streams, disjoint files)

| Stream | Work packages | Files (exclusive) | Agent |
|---|---|---|---|
| **A. Protocol** | WP-1: `PROTOCOL.v2.json` as a proposed file, with every open value O1–O15 (and the "v2.0" local fallback for O1). It records the compassion-review schema requirements (MF1, MF4, S1, S5) and the methods additions (weighted agreement, item-clustered intervals, judge test-retest, signed drift) as proposed fields. A validator refuses "ratified" while any value is OPEN | `research/model-runs/weekly/PROTOCOL.v2.json`, `research/model-runs/lib/protocol-v2.mjs`, `research/model-runs/tests/protocol-v2.test.mjs` | backend-engineer |
| **B. Gates** | WP-6, WP-7, WP-8 and WP-12, with QA FM-6, FM-8 and FM-11: `audit-wave.mjs` and `wave-ready.mjs` (gates A1–A21, verdict READY or HOLD). Plan commit time must precede the first record. A `done_reason` truncation check. Signed per-judge drift. Sensitivity coverage reported, holding the run when sensitive items are requested. A key-staging guard | `research/model-runs/bin/audit-wave.mjs`, `bin/wave-ready.mjs`, `lib/wave-gates.mjs`, `tests/wave-gates.test.mjs` | backend-engineer |
| **C. Experiments** | PRD E1–E6 on pilot-3 data. Each is pre-registered: the plan is hashed before any rating is read. Results are internal (FDM-1 default) and contain no ordering of models | `research/model-runs/experiments/2026-10-22/**` | analytics |
| **D. Instructions and review** | WP-9 and WP-11: a v2 operator runbook (doc), a results-review procedure with the review-packet template (UX §3c), and the stale README fixes (procedure lines 207-251, the tests note at line 253) | `docs/model-eval/RUNBOOK_V2.md`, `docs/model-eval/RESULTS_REVIEW_PROCEDURE.md`, `research/model-runs/README.md` | product-manager / doc-updater |

**Deferred, with reasons:**
- **WP-2 (planner):** depends on WP-1.
- **WP-3, WP-4 (call seam, judge routing):** the highest risk, because they touch the evidence path and must reproduce
  pilot outputs byte for byte. That is a separate loop.
- **WP-5 (token cost):** a separate loop.
- **WP-10 (Friday generator):** depends on WP-8.
- **WP-13:** a separate loop.
- **WP-14, WP-15, WP-16:** blocked on a published-page change, the key, and ratification respectively.

## Phase 3: validation (coordinator, after Phase 2)

1. Re-run every agent claim (V2).
2. Plant a probe for every new gate (V3).
3. `npm run test:model-runs` and the full `npm test`.
4. Check the experiment pre-registration hashes predate the results files.
5. Compassion re-check of the review procedure.

## Phase 4: results review

- An experiment report summarising what the instrument findings change in PROTOCOL.v2 defaults. These are proposals, for
  the founder's PROTOCOL-V2-2 step.
- Backlog rows for everything deferred.
- Founder asks added to the Friday packet (at most six; merged, not appended).

## Founder decisions this programme surfaces (beyond the Friday packet)

| ID | Decision | Default |
|---|---|---|
| P-FD-1 | O1 judge panel: wait for a key (3 families), or start with "v2.0" (3 Claude judges, by hand, no key) so local waves can run | v2.0 now, labelled single-family; 3 families once a key exists |
| P-FD-2 | Who tags the 93 items for sensitivity (MF1): a qualified human reviewer, paid | Founder names a reviewer; no sensitive item is served until then |
| P-FD-3 | Untrack the 15 tracked `keys/` files (they hold published-pool pilot keys, so harm is low today) | Keep the history; add an ignore rule and the staging guard for unpublished pools |
| P-FD-4 | Experiment results stay internal (PRD FDM-1) | Yes. A summary of instrument findings may appear later in a methods note |

---

## Phase 2–4 results (2026-10-22, Iteration 115)

| Stream | Delivered | Coordinator verification |
|---|---|---|
| A. Protocol | `research/model-runs/weekly/PROTOCOL.v2.json` (status proposed; open values O1–O15), `lib/protocol-v2.mjs` (`--check`), `tests/protocol-v2.test.mjs` (14 tests) | Test 14/14. Real-file probe: status set to "ratified" gives exit 1; restored gives exit 0. O9's 0.759 equals the minimum per-subject `exact` in `waves/pilot-2026-10-03.json` (range 0.759–0.867, 8 values) |
| B. Gates | `lib/wave-gates.mjs`, `bin/wave-ready.mjs`, `bin/audit-wave.mjs`, `tests/wave-gates.test.mjs` (44 tests) | pilot-3 gives HOLD, holding only on the two not-built gates (claim audit of report text, render leak). **Real-data negative control:** G-plan-time fails pilot-2, whose plan was first committed 2026-10-02T17:11:58-06:00, after the first record. The published pilot-2 report already says "not committed before the data", so the gate agrees with the record. audit-wave finds pilot-3's two host stops D1 and D2 as timeline gaps (12.85 h and 9.3 h) |
| C. Experiments | `research/model-runs/experiments/2026-10-22/` (pre-registration, hash, deviations D1–D6, script, results, REPORT) | Hash matches. The pre-registration predates the script and the results by file time. A re-run is byte-identical. 0 composite keys. Pilot data untouched. "No rating of 5" confirmed independently (1:771, 2:1236, 3:618, 4:100) |
| D. Instructions | `docs/model-eval/RUNBOOK_V2.md`, `docs/model-eval/RESULTS_REVIEW_PROCEDURE.md`, README stale-part fixes (6 lines) | Confirmed: `export-wave.mjs:40` writes into `site/src/data/model-benchmark/waves/` unless `CB_WAVES_DIR` is set, while the current runbook calls the output an "uncommitted draft" |

**Chain:** `npm run test:model-runs` passes 317/317 (259 before the programme). The full `npm test` exits 0.

### What the experiments change (proposals for PROTOCOL-V2-2; nothing is ratified)
1. **O9:** a fixed agreement floor of 0.759 would fire on noise in about 1 wave in 4. Use a floor that depends on n
   (0.747 at n = 83, 0.779 at n = 249), or a pooled-only floor.
2. **The v1 anchor threshold of 0.30 is too tight** for 48 pairs (the pilot-2 upper bound is 0.375). Use a larger
   sample, a threshold scaled to n, or about 0.40.
3. **O11:** keep it report-only. A calibration candidate if a number is wanted: 0.20.
4. **Intervals:** item-clustered for single ranges, item-then-reply for paired differences. Never quote the scorer's
   trial-level intervals; they are about 4 times too narrow.
5. **No length adjustment needed.** Per-judge shuffling stays, with a reported position check.
6. **The instrument is floor-heavy:** no 5 anywhere, 18 of 83 items at the floor, median item mean 1.94. This feeds the
   item-fix register (W-1) and a future bank version.

### Founder asks from this programme (added to the Friday packet as item 7, in one line)
- P-FD-1: the O1 v2.0-local fallback.
- P-FD-2: a sensitivity reviewer.
- P-FD-3: the keys ignore rule.
- P-FD-4: experiments stay internal.
- P-FD-5: whether to add a dated methods note for the one pilot-3 uncorrected separation that does not survive
  item-then-reply resampling. Default: no change now; note it when v2 adopts the method.
