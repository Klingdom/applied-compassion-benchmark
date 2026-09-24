# cb-probe code review -- 2026-09-24

Scope: bin/server.mjs, every lib/*.mjs, package.json, cross-checked against the test suite and
README.md where those bear on the same claims. No code changed. npm test run once, read-only:
81 pass, 0 fail (confirmed the "11 tools, 81 passing tests" premise; tools/list in
tests/e2e-jsonrpc.test.mjs independently confirms 11 tool names). Zero runtime dependencies
confirmed (package.json dependencies: {}, enforced by tests/no-network-scan.test.mjs). A
companion QA review of test quality (docs/reviews/CB_PROBE_QA_2026-09-24.md) already exists from
today; this review is about the implementation, not the tests, and only overlaps it once (item 7
below), noted explicitly.

Every "no X found" claim below is backed by a grep run during this review, not asserted from
memory -- see the search shown in each finding.

## Findings, ordered by "could this produce a wrong number or a wrong refusal"

| # | File:line | Issue | Severity | Minimal fix |
|---|---|---|---|---|
| 1 | bin/server.mjs:61-67, 88 | process.stdout.write(...) is called with no process.stdout.on("error", ...) listener and no process.on("uncaughtException", ...) anywhere in the process (confirmed: grep for EPIPE, uncaughtException, process.stdout.on, and process.on( across bin/ and lib/ returns zero matches). If the MCP host closes its end of the pipe (client crash, host restart, timeout) while cb-probe is mid-write of a tools/call response -- including a just-computed SelfRunScorecard with a real composite -- Node emits EPIPE on the stream and, with no handler attached, this becomes an uncaught exception that kills the whole process. The scored run result (already fully computed and already validated by that point) is lost with no trace beyond whatever the OS shows on the closed pipe; nothing is written to stderr because the crash happens in Node own error path, not in the logStderr catch at line 74 (that catch only wraps handleMessage, not the stdout.write after it). | HIGH -- correctness/robustness | Wrap both process.stdout.write call sites in try/catch, and add a process.stdout.on("error", handler) so a closed pipe degrades to a clean stderr-logged exit instead of a crash mid-response. |
| 2 | lib/rpc-handler.mjs:78-80 | tools/call does "if (notification) return null;" before calling def.handler(toolArgs, ctx) -- a notification-shaped tools/call (a request with no id key) never executes the tool at all. Per JSON-RPC 2.0, a notification only suppresses the reply; the method is still supposed to run. Every other case in the switch (initialize, tools/list) is pure and side-effect-free, so skipping them for notifications is harmless -- but tools/call is the one case with real side effects (record_item_rating writes a trial file, finish_scored_run writes scorecard.json). A client that omits id on a tools/call (bug, or a host that fires a final call as a notification to avoid waiting for a reply) causes the rating or run-finish to silently never happen, with nothing in stderr and nothing in the JSON-RPC stream to say so. | MEDIUM -- correctness | Execute def.handler unconditionally; only gate the reply on notification. If dropping notification-shaped tool calls is actually intentional, at minimum log to stderr when it happens so it is not silent. |
| 3 | lib/tools.mjs:82-88 (getAnchors) | Returns "anchors: item.anchors" -- a direct reference into the single cachedBank object held for the life of the process by lib/bank.mjs module-level cachedBank variable, not a copy. This is the one place in the codebase where item.anchors leaves the module as a live reference rather than a value built field-by-field (contrast lib/projection.mjs, which builds a new object per field, and lib/scored-run.mjs matchesPublishedAnchor, which only reads item.anchors). Today this is inert because lib/rpc-handler.mjs:89 immediately does JSON.stringify(result, ...) and nothing else retains the object -- but matchesPublishedAnchor (lib/scored-run.mjs:60-80) reads that exact same in-memory item.anchors array for every subsequent record_item_rating call, for every session, for the life of the process. Any future code path that holds the raw tool-call result before serializing it (an in-process embedding, a test harness that inspects the return value directly, a future non-stdio transport) and mutates .anchors[i].label would silently corrupt the rubric used to accept or reject every later rating in every open run until restart. | MEDIUM -- data handling / robustness | Return "anchors: structuredClone(item.anchors)" (Node 20 has structuredClone globally; confirmed via grep -- it is not currently used anywhere in lib/, so this would be a new, deliberate use) or a shallow item.anchors.map(a => ({...a})). |
| 4 | lib/session-store.mjs:45-48 (isInside) | isInside compares paths with path.relative, which on win32 is case-sensitive even though NTFS path lookups are not. Verified directly: comparing the real-case repo path against an otherwise-identical path with different letter casing produced a relative path starting with two dots (an escape-looking result) instead of recognising containment, so isInside(...) returns false for a path that is, on disk, inside the repo. This weakens the repo-specific message in assertSafeWriteRoot (lib/session-store.mjs:57-78, the J3 promotion-proof guarantee the header comment of this file names). In this specific repo it is not currently exploitable end-to-end: assertSafeWriteRoot second check, findGitAncestor (lib/session-store.mjs:34-43), walks ancestors with existsSync, which is case-insensitive on Windows (verified directly: existsSync found the git directory under both the real-case and an all-uppercase form of the same path) -- so a case-mismatched write root inside this repo is still refused today, just via the generic "inside a git working tree" message rather than the specific "inside the Compassion Benchmark repo" one. The same isInside is reused by sessionDir (lib/session-store.mjs:87-99) for path-traversal defense-in-depth on session_id, but that path is separately protected by SESSION_ID_RE, so no case-driven traversal exists there either. The risk is latent, not live: the two containment checks currently overlap by accident (different implementations, same conclusion), which is fragile if either is ever refactored independently. | MEDIUM -- robustness (Windows-specific, latent) | Fold case on win32 before comparing, or resolve both sides with fs.realpathSync.native when they exist on disk. |
| 5 | lib/bank.mjs:26-38 | readFileSync(TASK_BANK_PATH, "utf8") is passed straight into JSON.parse with no leading-BOM strip. Verified: the current site/src/data/model-benchmark/tasks-v1.json has no BOM (first three bytes are an open brace, a newline, and a space), and JSON.parse on a BOM-prefixed string throws a SyntaxError -- which bank.mjs own catch turns into a readable "task bank ... is not valid JSON" FATAL message rather than a silent misread. So this is a graceful-failure gap, not a correctness bug today -- but it is a real Windows footgun (several common Windows write paths, e.g. PowerShell default redirection, add a UTF-8 BOM by default) that would take the whole server down at startup with a message that does not name the actual cause unless someone reads the error text closely. | LOW -- robustness (Node/Windows specifics) | Strip a leading BOM before JSON.parse. |
| 6 | README.md:247 | The line documenting npm test states 78 tests. Running npm test today reports tests 81, pass 81, fail 0. Not a lib/ file, but it is a comment that no longer matches the code, which the review brief asks for explicitly. | LOW -- clarity | Update to 81. |
| 7 | lib/self-run-scorecard.mjs:9-11 | Header comment claims that if the canonical-formula import is ever broken, a file named tests/scored-run-canonical-agreement.test.mjs fails by name. No such file exists in tests/ (confirmed both by this review own file listing of tests/ at the start, and independently by today companion QA review, which grepped for the name and found zero matches -- the check apparently now lives inside tests/scored-run.test.mjs). Flagged here only because item 6 of the brief asks for exactly this class of drift; not double-counted as a separate finding beyond noting it. | LOW -- clarity (already flagged elsewhere) | Point the comment at the actual test name, or drop the specific filename. |
| 8 | lib/session-store.mjs (writeSessionFile, appendSessionEstimate) and lib/scored-run-store.mjs (appendRunTrial) | All three write with plain writeFileSync using utf8 encoding -- no fsync, no write-to-temp-then-rename. Each artifact is its own append-only file (one file per estimate or trial, never a read-modify-write of one big file), so the blast radius of a crash-during-write is at most the single most recent write, not the whole session or run -- but a crash or sudden power loss between writeFileSync returning and the OS actually flushing the page cache to disk on Windows could still lose the very last recorded trial or the final scorecard.json silently (no error surfaced, because writeFileSync had already returned successfully). | LOW -- robustness | Not necessarily worth the complexity for a local single-user tool, but if distributed as the audit trail for a scored run, consider an explicit fsync after the final finish_scored_run write specifically (the one artifact whose loss matters most), rather than on every trial. |
| 9 | lib/rpc-handler.mjs (whole handleMessage) | No JSON-RPC 2.0 batch (array-of-requests) support: a line containing a JSON array of requests parses fine as JSON (bin/server.mjs:59) but then fails handleMessage guard (message.jsonrpc not equal to "2.0", undefined on an array) and, having no id own key, is silently dropped -- no response, no error, nothing in stderr. Verified by reading the guard at lib/rpc-handler.mjs:37-43 against array semantics; confirmed via grep that there is no batch-handling code anywhere in lib/rpc-handler.mjs. MCP hosts do not currently send batched requests, so real-world risk is low, but the header comment of this module (implements exactly the four methods this server needs) does not mention batch is unsupported-by-silent-drop rather than explicitly rejected. | LOW -- clarity/robustness | Either reject a top-level array with a -32600 Invalid Request (spec-compliant minimum), or add a one-line comment stating batch is deliberately unsupported and silently ignored. |
| 10 | bin/server.mjs:61-67, 88 | Return value of process.stdout.write(...) is never checked, so backpressure (the write buffer filling because the host is reading slowly) is invisible -- Node still queues and eventually flushes every write in order, so this is not a correctness bug, but a host that reads slowly while cb-probe emits many or large SelfRunScorecards (each embedding every trial full response_text verbatim) could accumulate unbounded internal buffer memory with no backpressure signal ever observed by this code. | LOW -- robustness | Track the drain event if this ever becomes a real host integration concern; not urgent for a local single-client stdio tool. |

## What is genuinely well done

- lib/session-store.mjs -- the write-root guard (assertSafeWriteRoot) is layered correctly in
  intent (repo-specific check, then generic git-ancestor walk), tilde expansion is handled
  explicitly rather than left to the shell, and sessionDir SESSION_ID_RE is tight enough to
  reject both directory-traversal session ids and a literal "__proto__" as a session id (the
  regex disallows underscores), which is a nice accidental second layer of defense. All of it is
  exercised by tests/write-root-guard.test.mjs, and this review independently re-derived the
  repo-boundary behavior rather than trusting the tests own assertions.
- lib/validate-estimate.mjs and lib/validate-scorecard.mjs -- the two-way vocabulary ban (exact-key
  deny-list anywhere in the tree, plus an allow-list at each level) is a genuinely well-thought-out
  mechanism for a real product risk (a JudgeEstimate or SelfRunScorecard being mistaken for an
  official score), and it is shared and extended rather than duplicated between the two schemas
  (SCORECARD_BANNED_KEYS is BANNED_KEYS minus an explicit two-key exemption set, not a hand-retyped
  list).
- lib/self-run-scorecard.mjs -- refusing to emit a composite for partial-dimension-coverage runs,
  with buildCompositeWithheldReason spelling out in plain language exactly why (defaulting an
  unmeasured dimension to 1 would manufacture a false Critical result), is precisely the kind of
  guard this review was watching for, and it is backed by validateSelfRunScorecard re-checking the
  builder own output before returning it (self-run-scorecard.mjs:306-312, failing loudly rather
  than writing a non-compliant artifact).
- lib/exposure-probe.mjs -- the contamination-check heuristic is honest about what it cannot do
  (EXPOSURE_LIMITATIONS names five distinct failure modes, including that paraphrase scores low
  despite real exposure, the dangerous direction), item selection is deterministic (pickProbeItemIds
  sorts rather than randomizes, for run reproducibility), and the whole thing is provably offline,
  enforced mechanically by tests/no-network-scan.test.mjs rather than just asserted in a comment.
- Zero async anywhere. Confirmed by a grep for async, await, .then(, and Promise across every
  lib/*.mjs file: zero matches. Combined with readline synchronous, one-line-at-a-time dispatch
  (bin/server.mjs:53) and every fs call being the Sync variant, this genuinely eliminates the "two
  tool calls racing on the same run" class of bug the review brief asked about -- not because of any
  locking, but because there is no await point anywhere between reading a run current trial count
  and writing the next trial file, so two logically-concurrent tool calls can never interleave
  inside one process. This is a real, load-bearing design property, not an assumption taken on
  faith.
- lib/rpc-handler.mjs -- notification detection uses the "id" in message check, not truthiness, so
  id: 0 and id: null are both handled correctly (a request with id: 0 is not mistaken for a
  notification). This is a specific, easy-to-get-wrong JSON-RPC 2.0 subtlety, and it is right here.
- lib/bank.mjs -- the EXCLUDED_VALIDATION_STATUS and isScorableItem comment cites a dated, specific
  count (28 of 33 items scorable, verified 2026-09-23) that this review independently reproduced
  against the live task bank (33 items, 5 draft-authored-unreviewed, 28 scorable, spanning all 8
  dimensions with at least 2 scorable items per dimension) -- an absence or count claim that was
  actually checked rather than asserted from memory, matching the discipline computeSubdimensionsStatus
  also follows (it recomputes "0 of N items carry a subdimension field" live on every run rather
  than hardcoding it).
- lib/projection.mjs -- the model-facing field whitelist is derived mechanically from
  bank.meta.fieldSeparationPolicy.modelFacingFields rather than hand-maintained, so a policy change
  in the data file changes behavior with no code edit required, and the output is built field-by-field
  onto a fresh object rather than copying the item and deleting a blocklist -- structurally closed
  against a new sensitive field being added to the bank and accidentally leaking.

## Three fixes required before third-party distribution

1. Handle a closed stdout gracefully (bin/server.mjs) -- add an error handler on process.stdout
   (and/or wrap the two write call sites) so an EPIPE from a host that has gone away degrades to a
   stderr-logged clean exit instead of an uncaught-exception crash. This is the one failure mode
   that can silently destroy an already-computed SelfRunScorecard with no trace.
2. Make tools/call run the handler even when framed as a notification (lib/rpc-handler.mjs:78-80),
   or at minimum log to stderr when a tool invocation is dropped for lacking an id. As written, a
   malformed or notification-shaped record_item_rating or finish_scored_run call is a silent no-op
   with zero diagnostic trace, which is the wrong failure mode for a tool whose entire purpose is an
   auditable record.
3. Stop returning a live reference into the cached task bank (lib/tools.mjs:82-88, getAnchors) --
   clone item.anchors before returning it. Today single-process, immediate-JSON.stringify pipeline
   makes this inert, but it is the one place a future caller (a different transport, an in-process
   embedding, a test harness) could mutate shared bank state and silently change what every
   subsequent rating in every open run is validated against, for the rest of the process life.
