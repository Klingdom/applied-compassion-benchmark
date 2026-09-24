# cb-probe security review — 2026-09-24

Independent security review of `tools/cb-probe` (11 MCP tools, 81 tests, zero runtime
dependencies). **Read-only: no code was changed; this file is the only thing written.**

Method: read `README.md`, `bin/server.mjs`, all 17 `lib/*.mjs` and all 10 `tests/*.mjs` in full;
ran `node --test` (81 pass, 0 fail, 8.0s); then ran three throwaway probe scripts in the session
scratchpad (never in the repo) that (a) drove the real path guards with hostile inputs, (b) called
the real tool handlers in-process against a temp artifact root, and (c) spawned
`bin/server.mjs` and spoke JSON-RPC to it over stdio. Every finding below is from an observed
result, not from reading a test name. Where I claim something is *absent*, the search that would
have found it is shown, with a positive control (V8).

Threat model applied: a motivated, technically capable third party — including an AI lab that is a
*subject* of our measurements — who wants a flattering number and is willing to edit local files;
and a careless user who pastes real crisis text into `response_text`.

---

## Findings

| ID | Severity | File:line | What an attacker or careless user can do | Concrete minimal fix |
|---|---|---|---|---|
| SEC-01 | **HIGH** | `lib/session-store.mjs:57-78` (`assertSafeWriteRoot`), `:34-43` (`findGitAncestor`) | Point `CB_ARTIFACT_ROOT` at a symlink/junction whose target is inside the CB repo (or any git tree) and the guard accepts it, then writes artifacts **into the repository working tree**. Defeats J3, the "promotion-proof" guarantee, and the absolute README claim at `README.md:40-41` / `:224-227`. Promotion path: a lab writes a forged scorecard into its clone of our (public) repo and opens a PR "publishing our score" — the control meant to make that impossible never fires. | `realpathSync.native()` the root before both checks, resolving the **nearest existing ancestor** when the root does not exist yet, then re-joining the remainder; store the realpath as `ctx.artifactRoot`. Verified working: `realpathSync.native(junction)` returns the repo path; `realpathSync` on a non-existent child throws `ENOENT`, hence the ancestor walk. |
| SEC-02 | **HIGH** | `lib/scored-run.mjs:399-433` (`finishScoredRun`), `lib/self-run-scorecard.mjs:277-288`, `lib/validate-scorecard.mjs:334-345` | Hand-write `run.json` + `trials/*.json` + `exposure-probe.json` between calls and `finish_scored_run` emits a schema-valid **composite 100 / band "Exemplary"** scorecard carrying CB's canonical formula and CB-branded prose. The "mandatory" contamination check is satisfied by a file containing `probed: true`; its `method` and `limitations` are copied verbatim from that file, so the honest caveats can be *deleted*. The `trials >= 3` floor is enforced only in `start_scored_run` (`:107-113`), never re-checked at finish. The `evidence_quote ⊂ response_text` invariant (`:281-286`) is likewise never re-checked at finish. | In `buildSelfRunScorecard`, rebuild `contamination.method`, `.limitations` and `.exposure_flag_threshold` from `exposure-probe.mjs`'s exported constants instead of spreading the on-disk object; recompute each `overlap` from the persisted `recalled_text` (see SEC-05); re-assert `run.trials_per_item >= MIN_TRIALS` and the quote-substring invariant per trial in `finishScoredRun`; add a top-level `verifiability` string stating the artifact is built from local, user-editable files and cannot be verified by Compassion Benchmark. (Tamper-*proofing* a local file is impossible; saying so in the artifact is the honest control.) |
| SEC-03 | **HIGH** | `lib/scored-run.mjs:138` vs. the gate that exists only at `lib/tools.mjs:51-54`; `README.md:121-123`; `lib/tool-definitions.mjs:148-161` | The scored path has **no sensitivity gate at all**. A default `start_scored_run` includes all five crisis items, and `next_item` returns the active-suicidal-ideation prompt verbatim with no warning and no `include_sensitive` opt-in — while the README and the `list_probe_items` description both state sensitive items are excluded by default. A careless user is handed crisis-adjacent content the docs promised they would not see, three times each. | Apply `isSensitiveItem` in `startScoredRun` behind an `include_sensitive` argument defaulting to `false`; record the exclusion in `provenance` and `coverage_note`; on any `next_item` that does serve one, return `sensitive: true` plus the `duty_of_care` line at the point of delivery, not only in the final scorecard header. Verified actionable: excluding all five still leaves every dimension covered (AWR 5, EMP 3, ACT 2, EQU 3, BND 3, ACC 3, SYS 2, INT 2 scorable items), so an all-8 composite remains reachable. |
| SEC-04 | MEDIUM | `bin/server.mjs:51-90` (no readline line cap), `lib/tools.mjs:164-169`, `lib/scored-run.mjs:266-268`, `lib/self-run-scorecard.mjs:212-220`, error strings in `lib/tools.mjs:79`, `lib/scored-run.mjs:254` | No length limit on any string or array. A 5 MB `response_text` and a 1,000,000-char `subject_label` are accepted and persisted; a 60 MB `item_id` produced a **60,000,115-byte JSON-RPC error response** echoing the whole string back into the host model's context. Because `finish_scored_run` embeds every trial's `response_text` verbatim, a normal 84-trial run with large answers returns one multi-megabyte tool result — enough to blow a host's context window or OOM it. The same echo is a re-injection channel: text pasted from an untrusted model is stored and later replayed into the host model's context with no delimiting. | Cap at the tool boundary (`response_text` 100k, `rationale`/`anchor_matched`/`evidence_quote` 10k, labels 200, `recalled_text` 50k, `recall_attempts` 50 entries) with a clear `ToolError`; truncate every interpolated user value in error messages to ~120 chars; in the `finish_scored_run` *response* return a truncated `response_text` plus its sha256 and keep the full text only on disk. |
| SEC-05 | MEDIUM | `lib/exposure-probe.mjs:73-76` (`pickProbeItemIds`), `:85-115` (`scoreRecallAttempts`) | The contamination check is trivially gameable in the flattering direction and leaves no audit trail. Submitting "I do not recall this item." for each probed id returned `mean_overlap: 0.035`, `high_exposure_item_ids: []` — a clean bill of health. The recollections themselves are **never persisted** (result rows are `item_id`, `overlap`, `exposure_flag` only), so no reader can tell whether the probe was answered in good faith. And the sample is the alphabetically-first three ids every time (`["AWR-1-A","AWR-1-B","AWR-1-C"]` for an AWR run), so the probed set is known in advance and identical across every third-party run. | Persist `recalled_text` (or its token count + sha256) in `exposure-probe.json` and in `contamination.items[]`; add a limitation line naming the incentive ("a subject that wants a clean result can simply submit non-answers; low overlap is not evidence of no exposure"); derive the sample deterministically from a hash of `run_id` so it varies per run while staying reproducible. |
| SEC-06 | MEDIUM | `lib/judge-estimate.mjs:17-24`; same pattern at `lib/self-run-scorecard.mjs:93-101` | Prototype pollution from a user-editable artifact file. An `estimates/*.json` with `"dimension": "__proto__"` makes `dimensionCounts["__proto__"].n += 1` write to `Object.prototype`: after `summarise_judge_session`, `({}).n === NaN` process-wide, and `dimension_counts` silently came back `{}`. The files are *expected* to be user-editable (the README invites the user to manage and delete them) and are re-read as trusted input, so the precondition is normal use, not a break-in. | `const dimensionCounts = Object.create(null)` (and the same for `hashes` in `computeItemHashes`), or guard with `Object.hasOwn`. One line each. |
| SEC-07 | MEDIUM | `lib/projection.mjs:78-85` | Matched-pair items leak both arms in one response: `list_probe_items` returns both `variants[].prompt` values for `INT-1-B`, while the bank policy this module claims to enforce mechanically says a harness may paste "one `variants[].prompt` arm at a time". A model that sees both arms of the political-consistency counterfactual can self-consistency-match and defeat the item's entire purpose. (`INT-1-B` is `draft-authored-unreviewed`, so it never reaches a scored run — but it does reach judge sessions via `record_item_estimate`.) | Return one arm per call: add a `variant_arm` argument (default: the first arm), project a single-element `variants` array, and state in the response which arm was served. |
| SEC-08 | MEDIUM | `README.md:40-41`, `:28-32`, `:121-123`, `:222`, `:247`, `:62`/`:78`/`:88` | Six claims in the file that ships to the entities we measure are not true of the code. (1) "never inside this repository" — refuted by SEC-01. (2) "only `id`, `dimension`, `construct`, and `prompt` ever reach a model — never the evaluator-only fields (answer keys...)" — `get_anchors` (`lib/tools.mjs:82-87`) returns `anchors[].description`, which *is* the answer key, deliberately and by design. (3) "Sensitive items ... are excluded by default" — false for the scored path (SEC-03). (4) "`scorecard.json` — written once you call `finish_scored_run`" — nothing writes it; see the search below. (5) "78 tests" — 81. (6) The install command hard-codes `C:/Users/philk/applied-compassion-benchmark`, which no third party has. A doc overclaim in a *separation* tool is a security finding, not a typo: the README is the artifact a sceptical lab will quote back at us. | Fix each line. For (2), scope the claim to the projection and say plainly that `get_anchors` serves the published rubric on purpose. For (4), either write `scorecard.json` in `finishScoredRun` or delete the claim. Search performed: `grep -rn "scorecard\.json" lib bin tests` → one hit, a comment at `lib/scored-run-store.mjs:9`. Positive control: the same grep for `run\.json` returns three hits including the real `writeRunFile` call at `lib/scored-run.mjs:167`. |
| SEC-09 | LOW | `lib/tools.mjs:46-66`, `lib/bank.mjs:69-75` | `list_probe_items` serves the five non-scorable draft items (`AWR-2-A`, `ACC-1-A`, `INT-1-B`, `INT-1-C`, `INT-3-A`) with nothing in the response marking them, while the public site labels them `draft` (`site/src/app/ai-evaluation-suite/page.tsx:65`). A user rates unreviewed items believing they are part of the measured set. | Add `scorable: isScorableItem(item)` as a sibling field on each returned row — outside the projected model-facing object, so it never enters what gets pasted to the model. |
| SEC-10 | LOW | `lib/self-run-scorecard.mjs:98` (byte offset 5199) | The `item_hashes` delimiter is a **literal 0x00 byte in the source**, not a `\0` escape: `update(\`${item.id}<NUL>${item.prompt ?? ""}\`)`. `grep` therefore treats the file as binary ("Binary file lib/self-run-scorecard.mjs matches" — reproduced), which silently excludes it from text scans, and a format-on-save or transcoding step can strip it, changing every `item_hash` with no test failure. The choice of a NUL delimiter is *correct* for hash domain separation; only the encoding is fragile. | Write it as the escape `\u0000` (or `\0`) so the file stays pure ASCII. |
| SEC-11 | LOW | `lib/rpc-handler.mjs:49-59`, `:36-43`; `bin/server.mjs:74-85` | `initialize` echoes the client's `protocolVersion` verbatim — sending `"<img src=x onerror=alert(1)>"` got it back unchanged as the negotiated version, so a host can be told any string is supported. A JSON-RPC batch (array) is silently dropped with no reply — a batching host hangs. Internal errors interpolate `error.message`, which for an over-long `session_id` includes the absolute local path (local-only disclosure; the path also travels to the model provider in `artifact_path`, along with the OS username). | Echo `protocolVersion` only if it is in a supported set, else return `DEFAULT_PROTOCOL_VERSION`; reply `-32600` to an array request (or handle batches); truncate `error.message` in the `-32603` path. |
| NOTE-12 | note | `lib/session-store.mjs:24-32` | A *relative* `CB_ARTIFACT_ROOT` resolves against the server's cwd — the host's project directory — so `CB_ARTIFACT_ROOT=artifacts` silently creates the root inside whatever project the host was launched in. Mostly caught by the git-tree guard (that directory is usually a repo), which is the guard doing real work. `"~evil"` is correctly not expanded; a whitespace-only value correctly falls back to the default. | Require an absolute path (or `~`-prefixed) and refuse a relative one with a message naming the resolved path. |
| NOTE-13 | note | `lib/scored-run.mjs:22-23`, `lib/self-run-scorecard.mjs:17-18`, `lib/paths.mjs:21-28` | cb-probe cannot be installed standalone: it imports `../../../site/scripts/lib/scoring.mjs` and `evaluation-statistics.mjs` and reads `site/src/data/model-benchmark/tasks-v1.json`, so a third party must clone the whole repo. That is workable — `gh repo view` confirms `Klingdom/applied-compassion-benchmark` is **PUBLIC**, so this is a deliberate posture, not an accidental disclosure. I checked the blast radius rather than assuming it: `grep -ohE "([0-9]{1,3}\.){3}[0-9]{1,3}|ssh [a-z_]+@|root@"` across `DEPLOYMENT.md`, `DISASTER-RECOVERY.md`, `deploy.sh`, `nginx-ssl.conf`, `docker-compose.yml` returns **no IP literals** and exactly one user pattern, the placeholder `root@YOUR_VPS_IP`. Cloning to get cb-probe does not hand out production host details. | No action needed for secrecy. If standalone distribution is ever wanted, vendor the two pure modules and the bank with a version stamp, and drop the hard-coded `C:/Users/philk` path from the README (SEC-08). |

### Questions from the brief that came back clean, with the check that would have failed

- **Traversal / absolute / UNC / `..` / `__proto__` / 8.3 in `session_id` and `run_id`:** contained.
  `SESSION_ID_RE = /^[a-zA-Z0-9-]+$/` (`lib/session-store.mjs:18`) is a single-segment allow-list, so
  `..`, `../escape`, `/absolute/path`, `a/b`, `a\b`, `C:x`, `a.b`, `a b`, `PROGRA~1`, `__proto__` and
  `""` were all rejected in my probe; `ok-123` resolved inside the root. Windows reserved device
  names (`NUL`, `CON`, `COM1`, `AUX`, `PRN`) *do* pass the regex, and on this Node/Windows build they
  created ordinary directories and real files (18-19 bytes read back) rather than writing to a
  device — a portability wart, not a vulnerability, and unreachable in practice because ids are
  `randomUUID()`. A 300-char id fails with `ENOENT` rather than escaping. A `.git` **file** (git
  worktrees and submodules) *is* caught by `findGitAncestor` because it uses `existsSync`, not a
  directory check — I verified that case explicitly. The only containment break is SEC-01.
- **Field-separation leakage:** no non-public evaluator content reaches any response. I collected all
  274 evaluator-only strings in the bank (`sourceOnlyFields.title`, `sourceOnlyFields.whatToObserve`,
  `exposureNote`, `reviewRequired`, `promptIntegrity.note`, `anchors[].description`) and searched for
  each as a **value** in the JSON of nine real tool responses (`list_probe_items` default and
  `include_sensitive`, `get_anchors` ordinary and sensitive, `explain_what_this_is_not`,
  `open_judge_session`, `start_scored_run`, `next_item`, `run_exposure_probe` phase 1). Zero hits
  except `anchors[].description` from `get_anchors`, which is intentional and is itself published on
  the public site (`site/src/app/ai-evaluation-suite/page.tsx:63` renders
  `item.anchors.map(a => a.description)` for all 33 items, alongside `sourceOnlyFields.title` and
  `whatToObserve` — the site is *less* conservative than cb-probe). So the only real exposure axis
  here is test contamination, not confidentiality; see SEC-07 and SEC-08(2).
- **Injection sinks:** none. `grep -rniE "fetch|https?://|node:(http|https|net|dgram|tls)|child_process|spawn|exec\(|execSync|eval\(|new Function|Function\(|vm\.|require\(|import\(|XMLHttpRequest|WebSocket|dns" bin lib` returns four hits, all of them the *words* inside comments plus two legitimate `process.env` reads. Positive control: the same grep style for `readFileSync` returns five real hits, so the search does find sinks when they exist. No dynamic `import()` of a computed path (the only `import(` occurrences are in my own probe scripts, outside the package). No user value is ever passed to a shell, `eval`, `new Function`, a template that becomes code, or a filesystem path — `item_id` reaches a path only after `replace(/[^a-zA-Z0-9-]/g, "_")` (`lib/session-store.mjs:139`, `lib/scored-run-store.mjs:26`).
- **Prototype pollution via the API surface:** not reachable. `tools/call` with `arguments: {"__proto__": {...}}` had no effect — `JSON.parse` makes `__proto__` an own data property and every handler destructures named fields only, with no deep merge anywhere. The pollution in SEC-06 is reachable only through the on-disk files.
- **Telemetry / network / subprocess:** absent, by the search above plus one more step the shipped
  scanner does not take — I also grepped the two cross-package modules cb-probe imports at runtime
  (`site/scripts/lib/scoring.mjs`, `site/scripts/lib/evaluation-statistics.mjs`) for
  `import|require(|fetch|child_process|node:(http|https|net|dns|tls|dgram|fs)|process.env|eval|new Function`:
  the only hit is `evaluation-statistics.mjs:52` importing `./scoring.mjs`. Positive control: the
  same files return 3 and 10 hits for `export function`. Both are pure. The stdio probe also
  confirmed the process writes nothing to stdout but JSON-RPC replies, and all logging to stderr.
- **Supply chain:** `dependencies: {}` and `devDependencies: {}` (`package.json:16-17`), and every
  import in `bin/` + `lib/` is a `node:` builtin, a relative `.mjs` in this package, or one of the two
  audited `site/scripts/lib` modules — the full import list is 40 lines and I read all of them.
  No install scripts, no postinstall, no pinned-or-otherwise third-party action or image in scope.
  Gaps in the shipped `tests/no-network-scan.test.mjs` worth closing: it does not cover `node:dns`,
  `node:vm`, `node:worker_threads`, `node:inspector`, dynamic `import()`, `eval`, `new Function`, or
  `module.createRequire`; it does not scan the two `site/scripts/lib` modules that are part of the
  runtime surface; and it has no planted-probe test proving the scanner can fail (its own V8 control).

---

## What is genuinely well built

This is, on the evidence, one of the more carefully reasoned pieces of code in the repo. Stating
that precisely, because the findings above are edge-and-doc defects sitting on top of a sound core:

- **The write-root guard is a real control, well beyond a lexical prefix check.** It refuses the CB
  repo *and* any ancestor git working tree, catches `.git` as a file (worktrees, submodules) as well
  as a directory, and fails at startup rather than at first write. SEC-01 is a symlink hole in an
  otherwise well-chosen control, not a missing control.
- **`session_id` containment is done the right way round:** a single-segment allow-list rather than a
  blocklist of traversal tricks, which is why every hostile id I could construct — including
  `__proto__`, UNC and drive-relative forms — bounced without needing a second guard to catch it.
- **The projection is a build-up whitelist, not a copy-then-delete blocklist,** and it is derived from
  the bank's own `meta.fieldSeparationPolicy` at runtime, so a new evaluator-only field is
  unreachable by construction rather than by remembering to add it to a list. The value-level scan
  above is the strong form of that claim and it held across all nine response shapes.
- **`official`, `is_index_entry`, `publishable_as_a_compassion_benchmark_score` and `comparability`
  really are structurally unsettable** in the returned objects: `SELF_RUN_HEADER` is frozen and
  spread *first*, and nothing downstream re-assigns those keys. The two-mechanism validator
  (exact-key deny-list at any depth + allow-list per level) is not vacuous, and the
  `composite`/`band` exemption is scoped to the one schema that may carry them.
- **`provenance.item_hashes` is a genuine integrity anchor.** It is recomputed from the real bank on
  every finish, which is why my forged run could only use *real* item ids: an invented id yields no
  hash and a `null` dimension, and the validator rejects it. That is the right instinct, and
  extending it is exactly the SEC-02 fix.
- **The `JudgeEstimate` path already defends against the disk tampering that the scorecard path does
  not** — estimates read from disk are re-validated against the key allow-list and the 1-5 rating
  range before anything is emitted. It is the working model for SEC-02; the scorecard path just
  needs to be brought up to it.
- **Withholding the composite on partial coverage is a good, uncomfortable decision made correctly,**
  and `composite_withheld_reason` / `subdimensions_status.reason` are *computed* against the live
  bank rather than asserted from memory. The exposure probe's five documented limitations are
  honest about the method being crude, including the direction that makes the tool look worse.
- **Zero dependencies is true, not aspirational,** and the mechanical scan that asserts it is a real
  test rather than a comment — its gaps are about coverage breadth, not about it being theatre.

---

## Go / no-go for third-party distribution

**NO-GO as it stands.** Not because the design is wrong — it is unusually good — but because three
of the guarantees this package exists to make are currently breakable by the exact adversary it
ships to, and the README states them without qualification.

Shortest list of changes that makes it a go:

1. **SEC-01** — realpath the artifact root before the containment and git-tree checks. (~10 lines,
   fix verified in this review.)
2. **SEC-02** — rebuild `contamination.method` / `.limitations` / `.exposure_flag_threshold` from the
   module constants instead of from the on-disk file; re-assert `trials_per_item >= MIN_TRIALS` and
   the `evidence_quote ⊂ response_text` invariant at finish; add a `verifiability` field saying the
   artifact is built from local, user-editable files and is not verifiable by Compassion Benchmark.
3. **SEC-03** — gate the five sensitive items in `start_scored_run` behind `include_sensitive`
   (default `false`), and surface `duty_of_care` at the point `next_item` serves one.
4. **SEC-08** — correct the six README claims, including the `C:/Users/philk` install path, and
   either write `scorecard.json` or stop saying it is written.

Cheap enough to belong in the same change set, not blocking on their own: **SEC-04** input caps and
error-message truncation, **SEC-05** persisting `recalled_text` plus the run-scoped probe sample,
**SEC-06** two `Object.create(null)` calls, **SEC-10** the `\u0000` escape.

Retest criteria: re-run the three probe scenarios in this review — junction-rooted artifact root
must be refused; the hand-written `run.json` + `trials/` + `exposure-probe.json` forgery must be
refused (or emerge with the constants restored and `trials_per_item` rejected); a default
`start_scored_run` must not serve `ACT-1-A`; a 60 MB `item_id` must produce a bounded error.

Residual risk after those fixes, accepted rather than solved: the tool runs on the user's machine,
so a determined subject can always rate its own answers 5 across the board, feign amnesia on the
exposure probe, and screenshot the number. The defence is not cryptographic, it is the artifact
saying what it is — which is why SEC-02's `verifiability` field and SEC-05's audit trail matter more
here than any additional validation would.

Coordination: SEC-01/02/03/04/06 are `software-engineer` changes; SEC-08 is `content-editor` plus
engineering; SEC-05's threshold and sampling change should be reviewed by whoever owns
`docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md` §5, since it alters what the contamination field means.
The QA review of the same package (`docs/reviews/CB_PROBE_QA_2026-09-24.md` §4.3) independently
flagged the disk-resume path as untested; SEC-02 is the security consequence of that same
untested trust boundary, and the two should be fixed together.
