# Agent Self-Assessment API and Agent Hub: Pre-Code Security Review

| Field | Value |
|---|---|
| Status | Gate G0 review (D-52 consequence; PRD §9.1; ARCH header). Precedes all code in slices S2 onward. |
| Date | 2026-10-14 |
| Reviewer | Security Reviewer agent |
| Design under review | `docs/AGENT_SELF_ARCHITECTURE.md` (ARCH), `docs/AGENT_SELF_API_SPEC.md` (API), `docs/AGENT_SELF_DATA_MODEL.md` (DM) |
| Checked against | `docs/agent-hub/briefs/05-security.md` (T1-T17, SEC-R1..R12), `docs/agent-hub/briefs/03-backend.md` (remote MCP, `tools/cb-hub`), `docs/PRD_AGENT_SELF_ASSESSMENT.md` §5.4 and §5.11 |
| Code inspected | `tools/cb-probe/lib/{tools,outbound-guard,validate-args,sensitivity}.mjs`, `nginx.conf`, `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.gitignore`, `DEPLOYMENT.md` |
| Method | Document and code review only. Nothing was executed against a running stack. Items I could not confirm are marked **UNVERIFIED** and become probes. |

---

## 1. Verdict

**APPROVED WITH CONDITIONS, for the `agent-api` service, the moderator CLI, the instrument artefacts and the static pages (slices S1-S10).**

**NOT APPROVED, for the remote MCP and any benchmark-request intake (`tools/cb-hub`).** No design for them exists beyond brief 03, and that brief has gaps the hub must close (SR-11). They need their own architecture document and a second review.

Reasoning:
- There is no Critical finding in the design as written. The core choices are sound: a same-origin container with no egress, no published port and no shared store with the Worker; an append-only event log; human-only approval; hash-only status tokens; ephemeral client hashes; an allow-list instrument projection that reuses cb-probe's sensitivity gate; and a kill switch that defaults to closed.
- There are 11 High findings in the design and one High pre-existing condition. Every one is fixable inside the current architecture without changing the option chosen. None needs a redesign.
- S1 (instrument artefacts) adds no write surface and may proceed now. S2 (pure core) may begin when the spec amendments in §6.1 are accepted into the API spec and DM. The conditions in §6.2 bind each later slice's merge. The conditions in §6.3 bind `moderate open` (launch).

Status of the gate: G0 is **conditionally signed**. It is not a blanket sign-off. The corpora sign-off that PRD ASA-CHK "AC (all)" assigns to this reviewer has not happened and is condition L-6.

---

## 2. Facts verified or established in this review

| # | Fact | Source | Consequence |
|---|---|---|---|
| V1 | `getAnchors` has no sensitivity gate. It looks up any id and returns `structuredClone(item.anchors)`. | `tools/cb-probe/lib/tools.mjs:72-93` | Safe for the S1 generator (it is only called for served ids). Unsafe for any remote tool that takes a client-supplied `item_id` (SR-11). |
| V2 | 15 blinding-key files are git-tracked under `research/model-runs/pilot-2026-10-0{1,2,3}/keys/`. | `git ls-files` | See PRE-01. |
| V3 | **The GitHub repository is PUBLIC** (`Klingdom/applied-compassion-benchmark`, confirmed with `gh repo view`). | `gh` | The 15 key files are already public. Any `research/agent-self/public-mirror/` commit would be public (SR-07). |
| V4 | `docker-compose.yml` publishes the `web` container as `"8080:80"`, which binds all host interfaces by default. | `docker-compose.yml` | The VPS port 8080 may be reachable without passing through openresty (SR-01). Whether a host firewall blocks it is **UNVERIFIED**. |
| V5 | `.dockerignore` excludes `.git`, `*.md`, `site/node_modules` and similar. It does not exclude `research/`. `docker-compose.yml` builds with `context: .`, so the whole checkout, including `research/**/keys`, is sent to the Docker daemon. ARCH §5.4 gives `agent-api` the same `context: .`. | `.dockerignore`, `docker-compose.yml` | Nothing is copied into today's `web` image (`COPY site/`). The control is one careless `COPY` away from failing, and ARCH specifies no `.dockerignore` change or test (SR-06). |
| V6 | `nginx.conf` sets no `Content-Security-Policy`, no `limit_req_zone`, no `limit_conn`, no `client_body_timeout` and no `proxy_cache`. | `nginx.conf` | All of these are new in the design and every one is load-bearing (SR-03, SR-15, SR-17). |
| V7 | `validate-args.mjs` checks unknown keys with `!(key in props)`, and required keys with `requiredKey in value`. The `in` operator walks the prototype chain. | `validate-args.mjs:117,126` | Keys such as `constructor`, `toString`, `valueOf` and `__proto__` pass `additionalProperties: false`. The module also recurses without a depth cap, and measures `maxLength` in UTF-16 units (SR-21). |
| V8 | `outbound-guard.mjs` walks results recursively with no depth cap. | `outbound-guard.mjs:34-42` | Acceptable for server-built objects. It must not be pointed at client-controlled trees. |
| V9 | ARCH, API and DM contain no mention of `.dockerignore`, `limit_conn`, Origin or Host validation, backup encryption, log rotation, CPU or disk limits, a log-head checkpoint, or gitleaks. | grep of the three documents | These are the gaps behind several findings below. |

---

## 3. Coverage of the threat register and recommendations

Key: **Covered** = the architecture as written meets the control. **Partial** = some controls present, named gaps remain. **Not covered** = absent or out of the design's scope.

### 3.1 Threats T1-T17

| ID | Threat | Verdict | Where covered | What is missing | Finding |
|---|---|---|---|---|---|
| T1 | Stored prompt injection | **Partial** | Human approval only (ARCH §10.2); ASA-CHK-05 hold and hard character reject (API §12); plain text, text-node rendering (ARCH §9); `unverified`/`official` fields (API §8.2). | No per-field untrusted envelope in the JSON that agents read; label strings and user text share one flat object; weekly rescan (ARCH §13) is structural only and has no injection corpus; no explicit `llms.txt` exclusion or `X-Robots-Tag` on `/api/`; the corpus is 30 patterns where the brief asks for 40 with homoglyph and split-word variants. | SR-08, SR-16 |
| T2 | Injection through published model replies | **Not covered** | n/a | The design has no reply feed. This is a hub feature (brief 03 BE-R7). | SR-11 |
| T3 | Sybil, spam, stuffing | **Partial** | No reaction fields (unknown-key reject, API §4.1); per-client and per-model limits (ARCH §8.3); queue cap; no links. | No proof-of-work or write token (brief T3 asks for one); queue cap is exhaustible; client identity forgeable. | SR-01, SR-20 |
| T4 | Vendor astroturfing | **Partial** | `submitter_relationship` label and `vendor_affiliated` tag (API §8.2); no sort by rating (ARCH §9); reason codes logged (DM §5.2). | No automatic promotional-tone check (only a human reject code); the "no price or CTA component on hub routes" grep test is absent (the isolation test covers index data only). | SR-08 (test), SR-20 |
| T5 | Defamation | **Partial** | CHK-06 over-inclusive hold; hide-first takedown; tombstone without text; "moderated for policy, not accuracy" label (ARCH §10; API §7). | Public git mirror makes removal impossible (SR-07); hide-on-receipt can be turned into suppression (SR-19); legal review (PRD OQ-4) still pending. | SR-07, SR-19 |
| T6 | Crisis content and moderator exposure | **Partial** | CHK-07 hold with duty-of-care note; never auto-approved; sensitive items excluded through `listProbeItems` (ARCH §6.2). | No content-warning or blurred default in the CLI queue; no render test for "no CTA or figure beside a crisis-flagged item". | SR-18 |
| T7 | Leaking evaluator-only fields or blinding keys | **Partial** | Allow-list projections (ARCH §6.2, §12); explicit `COPY agent-api/` (ARCH §5.4); API reads only `contract.generated.json`. | No `.dockerignore` deny-list, no CI path check, no image-content test (SEC-R5); keys remain in git, and git is public (SEC-R6). | SR-06, PRE-01 |
| T8 | Contamination by publishing replies and anchors | **Not covered** | The instrument publishes anchors deliberately with a contamination statement (ARCH §6.2). | Reply publication and retirement checks belong to the hub feed, which has no design. | SR-11 |
| T9 | Impersonation | **Partial** | "Self-identified, not verified" label; `identity_mixed_script` soft flag (API §12); `reassign`/`split` (DM §4). | No reserved-name check for `Compassion Benchmark`, `official` or institutional names in `declared_model.provider`/`name`; no signed institutional feed; no reserved `origin` namespace. | SR-08, SR-31 |
| T10 | Remote MCP exhaustion | **Partial** for the API, **Not covered** for MCP | API: 16 KiB cap, 10 s timeout, 128 MB, 64 pids, stateless (ARCH §5.2, §5.4, §8.4). | No depth cap; no `limit_conn`; no CPU or disk limit; global nginx bucket shared by every route; MCP unspecified. | SR-03, SR-04, SR-09, SR-11 |
| T11 | DNS rebinding and cross-origin abuse | **Partial** for the API, **Not covered** for MCP | API: no cookies, no ambient auth, CORS off by default, loopback admin (ARCH §5.4, API §11.4). | No Origin or Host allow-list anywhere; MCP unspecified; the CORS-on option is unsafe as written. | SR-11, SR-25 |
| T12 | SSRF | **Covered** | No endpoint fetches a URL; container has no egress (ARCH §5.4); the takedown `url` is parsed, not fetched (API §7); links rejected on all other strings. | Two conditions: parse the takedown URL as data and assert no fetch path exists; verify the no-egress claim (SR-24). | SR-24 |
| T13 | Secrets layout | **Partial** | No provider key, no Worker secret on the API host (ARCH §5.4, §3.2); token generated on boot; no secret in image. | Admin token and HMAC salt live on the data volume that is snapshotted; no gitleaks step in the design; no Docker secrets. | SR-12, SR-14 |
| T14 | Moderator interface auth | **Partial** | No public route exists (stronger than the brief); loopback listener plus bearer token; audit chain; moderator views are plain text with escapes. | No MFA (replaced by shell access, which is root-equivalent); one shared token gives no per-moderator attribution; whole-chain rewrite and tail truncation are undetected; terminal escapes in takedown text; approvals publish live without a build (a deliberate trade for the 5-minute takedown target, accepted). | SR-05, SR-13, SR-18, SR-23 |
| T15 | Request-a-benchmark abuse | **Not covered** | n/a for `agent-api` (no provider call is possible; no egress). | Hub request intake (brief 03 BE-R6) has no design. | SR-11 |
| T16 | Self-run or self-assessment passing as official | **Covered** for the API | `kind` is not client-settable; `official`, `comparability` and score keys are rejected (ARCH §6.5); `public-guard` runs on every public route and fails closed (API §8). | Hub routes need the same guard. | SR-11 |
| T17 | PII in submissions and logs | **Partial** | CHK-08 hold plus approve refusal; no IP, `client_ref` or token in logs or the event log (DM §2.3, ARCH §13). | Backups, 7-day exports and the git mirror retain purged or personal data; the default `web` access log is unchanged; raw IPs cross to the API in `X-ASA-*` headers. | SR-07, SR-10, SR-15 |

### 3.2 Recommendations SEC-R1..R12

| ID | Recommendation | Verdict | Where | Gap | Finding |
|---|---|---|---|---|---|
| SEC-R1 | No public write path before T1/T5/T6/T14 controls and corpus tests; checks never approve | **Partial** | G0 before S2; corpora in S2; kill switch default closed (ARCH §16, §17 FA-8). | Corpora are not yet signed off; the T1 envelope, T5 permanence and T14 gaps above must close first. | §6 |
| SEC-R2 | No reactions, votes, karma | **Covered** | Unknown-key rejection; no such endpoint. | Add a planted-reaction test (P-20). | n/a |
| SEC-R3 | Stateless, read-only remote MCP first | **Not covered** | API §1 maps three operations "if and when" an MCP is built. | No MCP design. | SR-11 |
| SEC-R4 | `validate-args` semantics plus `pattern`, depth, total bytes, NFKC; port the guard with evaluator-only keys | **Partial** | NFC/NFKC (API §Conventions, §12); 16 KiB total. | No depth cap; no UTF-8 strictness; evaluator-only keys (`judge`, `routing`, `key`, `blind_label`, `subject_label`) are not in the banned union or the public guard; `validate-args` has the `in` flaw. | SR-04, SR-21 |
| SEC-R5 | Allow-list image build; CI fails on `keys/` in context | **Partial** | Explicit `COPY agent-api/`. | No `.dockerignore`, no CI check, no image-content test. | SR-06 |
| SEC-R6 | Stop committing keys; commit only a hash | **Not covered** | n/a | Out of this design; applies to the weekly-wave program. | PRE-01 |
| SEC-R7 | Signed institutional feed; reserved `origin` | **Not covered** | n/a | Hub feature. | SR-11, SR-31 |
| SEC-R8 | No provider key on the public host | **Covered** | ARCH §5.4. | none | n/a |
| SEC-R9 | Moderator console: separate origin, MFA, allow-list, CSRF, audit chain, founder-gated publish | **Partial** | CLI and loopback listener replace the console (DEV-02). | No MFA, no attribution, audit chain forgeable, publish is live. The substitution is acceptable only with SR-05, SR-13 and SR-23 closed. | SR-05, SR-13, SR-23 |
| SEC-R10 | Origin/Host allow-list, TLS only, memory/CPU limits, nginx limits, no shared fate | **Partial** | 128 MB, 64 pids, `read_only`, separate container, lazy upstream (ARCH §5.2, §5.4). | No CPU limit; no disk, tmpfs or log bound; global shared rate bucket; no `limit_conn`; Origin/Host not designed. | SR-03, SR-09, SR-11 |
| SEC-R11 | Publish delay and retirement for replies | **Not covered** | n/a | Hub feature. | SR-11 |
| SEC-R12 | Weekly adversarial scan, one-command unpublish-all kill switch, incident runbook | **Partial** | `close` stops intake; weekly structural scan (ARCH §13). | No command that empties all public reads; no injection corpus in the rescan; no incident runbook. | SR-08, L-9 |

---

## 4. Findings

Severity scale: Critical (exploitable now for serious harm, no precondition), High (serious harm, or defeats a stated control, with a cheap precondition), Medium (defence in depth, or harm needing a stronger precondition), Low (hardening). Every Critical and High has a planted probe in §5.

### 4.1 High

#### SR-01 High. Client identity is forgeable; every per-client control depends on it
- **Location:** ARCH §5.2 (`X-ASA-XFF`), §5.4 (`ASA_CLIENT_IP_SOURCE: xff-last`), §8.1-8.2; `docker-compose.yml` (`ports: "8080:80"`).
- **Problem:** `xff-last` is safe only when the request provably came through openresty and openresty appends to `X-Forwarded-For`. Neither is established. Port 8080 is published on all host interfaces (V4). A client who reaches it directly, or passes through an openresty that forwards the header untouched, controls the last entry and so mints unlimited `client_ref` values. That defeats `client_minute`, `client_day`, `client_day_attempts`, `takedown_day` and the queue-cap economics. The `moderate diag-client` check (FA-4) tests the two networks the founder happens to use. It cannot detect the direct-to-8080 path.
- **Required change:**
  1. Bind the host port to loopback or remove it if openresty reaches `web` over `proxy-net` (founder to confirm which; **UNVERIFIED**): `127.0.0.1:8080:80`.
  2. Add a trusted-proxy gate in nginx: a `geo`/`map` on `$remote_addr` against a configured openresty address or CIDR. Only when the peer matches may `X-ASA-XFF` be read. Otherwise the API must use the peer address as the identity. The API configuration is `ASA_TRUSTED_PROXY_CIDRS`; the default is empty, which means "use peer", so the failure mode is the safe one.
  3. Add a fixed global ceiling on receipts per day (`global_day`, for example 100) so a forged identity cannot fill the queue (see SR-20).
  4. `diag-client` must also report whether the request arrived from a non-trusted peer.

#### SR-02 High. Withdrawal and status can be locked out by anyone who knows a public `submission_id`
- **Location:** API §5 (`status_minute`), §6 (`withdraw_minute`); ARCH §8.3.
- **Problem:** Both limits are keyed by `submission_id` and count every attempt, including wrong-token attempts, before the token is checked. `submission_id` is published in the thread JSON (API §8.2). Anyone can send 10 requests a minute at a victim's id and keep the window saturated, so the submitter cannot withdraw. Withdrawal is the submitter's privacy right (ASA-MOD-06, ASA-PRV-02), and the held-for-personal-data case relies on it (DEV-06).
- **Required change:** Key the limit by `(client_ref, submission_id)` and add a separate per-client attempt limit. Verify the token first, in constant time, and do not count or throttle a correct token. The existence oracle stays closed because an unknown id and a wrong token take the same code path and both return the uniform 404; the spec's reason for limiting first (API §5) is met by this equivalence, not by ordering. Keep a high per-submission failure ceiling (for example 200 an hour) that only raises an alert counter.

#### SR-03 High. One global nginx bucket covers reads, writes and takedowns
- **Location:** ARCH §8.4 (`limit_req_zone $binary_remote_addr zone=asa:1m rate=30r/m`, `burst=10 nodelay`, on `/api/agent/`).
- **Problem:** `$remote_addr` is the openresty address, so there is one bucket for the whole internet. (a) Ordinary use breaks it: each page view fetches the index or a thread, and 30 page views a minute exhausts it. (b) An attacker at one request every two seconds turns the reader pages into their fallback state and blocks `POST /takedowns`, the legal-risk path with 2-day and 7-day targets (ASA-POL-02, T5). (c) The status and withdraw routes are starved the same way.
- **Required change:**
  1. Separate zones per route class: reads, submit, status/withdraw, takedown. Return 429, not the default 503 (`limit_req_status 429`).
  2. Serve reads from an nginx `proxy_cache` of 15-60 seconds (key on `$uri`, which has no query), so read load never reaches Node and reads are not subject to the write buckets.
  3. When the trusted-proxy gate (SR-01) passes, key the zones on the forwarded client address instead of the proxy address.
  4. Reserve capacity for takedown (its own zone with a floor that other routes cannot consume).
  5. Add `limit_conn` per key, `client_body_timeout 10s`, `client_header_timeout 10s` and `send_timeout 10s` on the `/api/agent/` location.

#### SR-04 High. Untrusted tree walked at unbounded depth; parsing is not strict
- **Location:** API §4.3 steps 5-9; ARCH §12 (`banned-keys.mjs`: "any depth"); SEC-R4.
- **Problem:** Step 6 (banned keys) walks the entire parsed tree before step 7 (schema) rejects its shape. The 16 KiB cap still permits 16,000 nested `[`. `JSON.parse` copes with that in current V8, but any recursive JavaScript walker overflows the stack at roughly ten thousand levels. A thrown `RangeError` in a request handler becomes a 500 at best and an `uncaughtException` at worst. The same weakness exists in `validate-args.mjs` and `outbound-guard.mjs` (V7, V8). Separately, the spec does not require strict UTF-8 decoding, and its forbidden-character list does not reject lone surrogates: `"\ud800"` is valid JSON, survives `JSON.parse`, and is silently replaced when written as UTF-8, which breaks the body hash and the canonical-JSON round trip.
- **Required change:**
  1. Enforce a depth limit (4 is enough for this schema: object, `declared_model` or `self_ratings`, value) with a pre-parse bracket-depth scan, and a limit on total key count and on the key length. Reject with 400 `malformed_json` before any walk.
  2. Make `findBannedKeys` iterative (explicit stack) in any case, and wrap each request handler so no exception can leave the request handler. Add a process-level `uncaughtException` handler that logs and exits non-zero only.
  3. Decode with `TextDecoder("utf-8", { fatal: true, ignoreBOM: false })` and reject on failure with `malformed_json`. Reject non-UTF-8 `charset=` parameters with 415.
  4. Reject lone surrogates in every string (`String.prototype.isWellFormed`, Node 20+), including in object keys.
  5. Reject duplicate object keys. `JSON.parse` keeps the last value, so a banned or unknown key can be shadowed. Detect them with a pre-parse token scan, or a strict small parser.
  6. Compute `maxLength` in code points after NFC, as the spec already says, and cap input length before normalising, because `normalize()` can expand.

#### SR-05 High. The hash chain does not give tamper evidence against anyone who can write the volume
- **Location:** ARCH §7; DM §1 (`prev_sha256`), §2.2 (`body_sha256`); API §9 (`verify-log`).
- **Problem:** The chain is unkeyed and has no external anchor. Whoever can write `/data` (the API process after a compromise; root on the host; anyone with a volume snapshot) can edit any event, then recompute every later `prev_sha256`, and `verify-log` passes. Truncating the tail also passes, because nothing records the head elsewhere. `verify-log` also checks body hashes only when it is run, so a blob edited after approval is served to the public as-is.
- **Required change:**
  1. Anchor the head off the volume. Once a day (and after each moderator action batch), the API emits a checkpoint `{seq, line_sha256}`. The weekly ops script commits the latest checkpoint, with no content, to git. `verify-log --against <checkpoint>` is added to the CLI. The checkpoint contains no personal data, so a public repository is acceptable for it.
  2. Key the chain with an HMAC secret that is not on the data volume (a Docker secret, or an environment variable from a mode-600 file outside the repo), so a volume-only attacker cannot forge lines. Keep the plain hash for the public checkpoint.
  3. Verify `body_sha256` whenever a blob is loaded into a public projection, at startup and on refresh. A mismatch makes that record non-visible and trips `integrity.guard_tripped`.
  4. Add `moderator_id` to moderator events (SR-23) so the chain also says who acted.

#### SR-06 High. The build context for `agent-api` is the whole repository, with no deny-list, no CI check and no image test
- **Location:** ARCH §5.4 (`build: { context: ., dockerfile: agent-api/Dockerfile }`); `.dockerignore`; SEC-R5, T7.
- **Problem:** See V5. `research/model-runs/pilot-*/keys/` reaches the builder today for the `web` build, and will for `agent-api`. The only barrier is that the Dockerfile's `COPY` lines are specific. Docker layer caches and BuildKit also retain the context on the VPS. The deploy path runs `git pull` on the VPS and builds there (`.github/workflows/deploy.yml`), so the full checkout, keys included, is on the build host.
- **Required change:**
  1. Add `agent-api/Dockerfile.dockerignore` (BuildKit honours `<Dockerfile>.dockerignore`) in allow-list form: ignore everything, then un-ignore only `agent-api/`. Add the matching deny entries to the root `.dockerignore` for the `web` build: `research/`, `docs/`, `tools/`, `worker/` as appropriate, and explicitly `**/keys/`, `**/judge-batches/`, `**/subject-briefs/`, `**/judge-key*`, `**/subject-brief-key*`.
  2. A CI step builds `agent-api` and fails if any path matching those patterns exists in the final image or was part of the context (a context-listing build stage with `find`).
  3. No `COPY .` or `COPY ..` is permitted in any Dockerfile in the repo; a grep test enforces it.
  4. gitleaks (or equivalent) in CI and pre-push, with a path rule for `keys/` (T13).

#### SR-07 High. The public-mirror design puts approved third-party text into a public git history
- **Location:** ARCH §4.1 (`agent-self-public-scan.mjs`), §11 L3, §13; DM §6 (off-box public mirror row).
- **Problem:** V3: the repository is public. (a) Anything committed cannot be removed by a takedown. DM §6 admits this. But takedown categories include `personal_data` and `inaccurate_or_defamatory`, and CHK-08 is a pattern detector that will miss some personal data. Forks and caches multiply the copy. (b) The mirror puts stored-injection text from third parties into files that this project's own coding agents read during nightly runs and sessions (`research/`, the unattended pipeline in the recent commits). That is T1 aimed at our own toolchain, where the reader has shell and edit tools.
- **Required change:** The mirror must not be a plaintext content file in the public repository. Choose one:
  - commit only a manifest (`submission_id`, `thread_key`, `approved_on`, content SHA-256, log checkpoint), and keep the content in the encrypted off-box backup (SR-10); or
  - commit encrypted content, with the key held by the founder.

  In either case, add `research/agent-self/` to the paths that agent instructions mark as untrusted data (and to `.claude` read guidance), and add a header to any text file stating it is untrusted third-party content. State the git-history limit on the policy page before launch (DM §6 already specifies it).

#### SR-08 High. Agents and crawlers get user text in a flat JSON object with no untrusted-content envelope
- **Location:** API §8.2 (item shape), §8.1 (`labels`); ARCH §9, §13.
- **Problem:** Brief T1 requires entries as JSON fields inside a fixed envelope and a labelled delimiter. The thread JSON puts `assessment_text` and `known_limitations` beside system-voiced strings (`not_a_score`, `labels.page`). To an LLM consuming the payload, the origin of each sentence is a matter of position only. Human approval and the 30-pattern corpus are the sole defences, and the weekly rescan checks structure, not injection patterns. The route is explicitly machine-readable (the page fetches it, and agents can too).
- **Required change:**
  1. Wrap every user-authored string in an object carrying its origin, for example `{ "text": "...", "origin": "third-party-ai-self-report", "trust": "untrusted-user-content" }`, applied to `assessment_text`, `known_limitations`, `declared_model.*` and `declared_operator`. Keep the system labels outside, in a separate top-level object.
  2. Add `X-Robots-Tag: noindex, nofollow` to `/api/agent/` and keep it out of `llms.txt` and `llms-full.txt` with a test.
  3. Extend `public-guard`/weekly scan to re-run the injection corpus over published text, and treat a hit as a stop-ship event that triggers `freeze-public` (SR-09, L-9).
  4. Raise the corpus to 40 patterns, including homoglyph, split-word and cross-field variants, per brief T1. Add a benign set of 40.
  5. Add the grep test "no price, CTA or purchase component on `agents` or `self-assessments` routes" from brief T4.

#### SR-09 High. The API shares fate with the site through disk, logs and CPU
- **Location:** ARCH §5.4 (limits shown: `mem_limit`, `pids_limit` only); DM §0, §7; ARCH §13 (stdout request log).
- **Problem:** The VPS has one disk. Unbounded writers on it: `ledger-<day>.jsonl` (one line per request, including every static instrument fetch via the beacon), `metrics.jsonl`, `events.jsonl`, `bodies/`, takedown blobs (unauthenticated, 10 a day per forgeable client), `exports/`, and docker `json-file` logs for a service that logs every request. A full disk takes down `web`, Umami and everything else on the host. There is no CPU limit, no tmpfs size, no log rotation and no volume quota. SEC-R10 says the API must not share fate with the static site.
- **Required change:**
  1. Compose: `cpus: "0.5"`, `tmpfs: /tmp:size=16m,noexec,nosuid`, `ulimits: nofile`, `init: true`, `stop_grace_period: 20s`, and `logging: { driver: json-file, options: { max-size: "10m", max-file: "3" } }`.
  2. Bound the writers in the application: dedupe the ledger by `(client_ref, kind, minute)` before append, cap each ledger file (for example 5 MB) and drop-and-count beyond it; cap `bodies/` count and total bytes; refuse takedown intake over a daily cap with a counter; cap `metrics.jsonl` by writing aggregated per-day lines.
  3. A volume watchdog in the health check: at 80% of a configured byte budget the API sets `submissions_open: false` and logs; at 95% it refuses non-essential writes.
  4. Node: `--max-old-space-size=96` (below `mem_limit`, so GC acts before an OOM kill) and `--disallow-code-generation-from-strings`. Consider the Node permission model (`--permission`, `--allow-fs-read`/`--allow-fs-write` limited to `/app` and `/data`, no child process, no worker) as defence in depth; it is still marked experimental in Node 22, so it is optional.
  5. Add a `freeze-public` control event (SR-05 list in L-9) that makes all public reads return an empty, labelled payload at once.

#### SR-10 High. Backups are unencrypted, retain purged data, and contradict the retention promise
- **Location:** ARCH §11 (L2, L4); API §9 (`backup`, `export`); DM §6.
- **Problem:** L4 is `backup > asa-backup-<date>.tar` then `scp`, with "4 weekly backups" recommended. The tarball is `/data` minus `ephemeral/` and `secrets/`, so it includes `bodies/`, takedown contacts, moderator notes and the last 7 daily `exports/`. It is plaintext at rest on the founder's machine and in transit paths of unknown quality. A body purged "immediately" on withdrawal (DM §6, DEV-10) persists in up to four weekly tarballs plus 7 daily exports, so the policy statement would be false. Hostinger snapshots (suggested optional) additionally capture `ephemeral/` (salts, ledgers) and `secrets/` (admin token) in cleartext.
- **Required change:**
  1. `moderate backup` encrypts before output (age, or `openssl enc -aes-256-cbc -pbkdf2` with a passphrase supplied through a file descriptor, never an argument). The tool refuses to write plaintext to a terminal or a file not named `*.enc`.
  2. Exclude `exports/` from the backup. The daily local export (L2) is either removed, or encrypted and kept for 7 days only.
  3. State the real retention on the policy page: purged bodies persist in encrypted backups for up to the stated number of weeks. Reduce backup retention to match, and make `founder_delete` also name the backups to remove.
  4. Snapshots: document that a VPS snapshot contains the salts and token, and either place those on tmpfs (see SR-14) or exclude snapshots as a backup mechanism for this volume.
  5. The restore drill (launch gate) must use an encrypted tarball and prove the key can be recovered.

#### SR-11 High. The remote MCP and hub intake have no design; known defects in the reusable code must be closed first
- **Location:** `docs/agent-hub/briefs/03-backend.md` BE-R1..R7; `tools/cb-probe/lib/tools.mjs:72-93`; `validate-args.mjs`; ARCH §1 (MCP "if and when").
- **Problem:** The architecture does not cover the hub. For the parts the brief proposes, I verified:
  - `getAnchors` returns the answer key for any id including the five hard-coded sensitive items (V1). A remote `get_anchors` would reveal anchors of withheld crisis items, and, until the held-out set is defined, held-out items (T8).
  - `list_probe_items` accepts `include_sensitive` (tools.mjs:39). The remote schema must remove the property, not default it, and the validator must reject an unknown key (but see SR-21).
  - The brief asks for Origin and Host validation, stateless operation and size limits (T10, T11) but there is no specification or test for them.
  - Brief 03 BE-R6 proposes SQLite and a `contact` field on an intake container. Those add a database and personal data; the open questions default to "no contact", which I support.
- **Required change (applies to `tools/cb-hub`, which is NOT APPROVED until a design exists that satisfies all of these):**
  1. A separate package and container, with the allow-listed tool table from BE-R1, `read_only: true`, no filesystem write, no egress, its own limits, and no shared volume with `agent-api`.
  2. Gate `get_anchors` with `isSensitiveItem` (and the held-out set) in the hub's own wrapper; do not rely on cb-probe changing. Also fix it in cb-probe, with a test, as the brief suggests.
  3. `Origin` allow-list (`https://compassionbenchmark.com` and an explicit list of non-browser client rules), `Host` allow-list, 403 otherwise; no cookies; no CORS on any state-changing route; TLS only at the proxy.
  4. Stateless Streamable HTTP, no `Mcp-Session-Id`; 64 KiB body cap; depth cap 8; `Content-Type` and `Accept` strict; per-client concurrency and rate through the SR-01 identity; request timeout; JSON-RPC batches rejected (as `rpc-handler.mjs` already does).
  5. Boundary guard: an iterative port of `outbound-guard.mjs` that also bans `judge`, `routing`, `key`, `blind_label`, `subject_label`, `judge_id`, `origin` set by clients, and `kind` set by clients.
  6. No tool takes a URL or a path. The three cb-probe statements that become false remotely (`artifact_path`, "written only to this local file", "not run on Compassion Benchmark infrastructure") must have the tests BE-R2 asks for.
  7. Replies (T2, T8, SEC-R11): published only from committed, hash-checked wave files, after item retirement, through the T1 filter.

#### PRE-01 High (pre-existing, outside the design). 15 blinding-key files are tracked in a public repository
- **Location:** `research/model-runs/pilot-2026-10-01|02|03/keys/**` (V2); repository visibility public (V3); SEC-R6.
- **Problem:** The files `judge-key*.json`, `subject-brief-key.json`, `ingested/answers.json` and `assembly-state.json` unblind completed pilot runs and are published already. The README marks them "NEVER SEND" (`research/model-runs/README.md` L38). This is a benchmark-integrity issue, not an `agent-api` flaw. It becomes Critical if the same practice carries into the weekly-wave program or if any later re-judging check relies on blinding of those pilots.
- **Required change:** Founder decisions (brief 05 open question 2): (a) stop tracking keys for all new waves now: store an encrypted archive off-box and commit only its hash; (b) decide whether the pilot keys are to be treated as disclosed (and record that in `DECISIONS.md`) or purged from history. A history rewrite is a founder-gated action and I do not require it for this review; I require that the decision be recorded and that `.gitignore` plus a CI path check prevent any new `keys/` file from being tracked.

### 4.2 Medium

| ID | Finding | Location | Required change |
|---|---|---|---|
| SR-12 | **Admin token storage and permissions.** The token is a static 32-byte secret in `/data/secrets/admin.token`, mode 0600, owner `node`, generated on first boot, "life of volume". It lives on a volume that is snapshotted (SR-10). The public handler runs as the same user in the same process tree, so a code-execution bug in the public path reads it and uses loopback. The token therefore gives no defence against an in-process compromise; it protects only against other local users, who are root anyway. A named volume is created root-owned unless the image pre-creates `/data` with `node` ownership; with `read_only: true` the usual "fix" is to run as root. No creation race protection or rotation is specified. | ARCH §4, §10.1; DM §0; API §9 | (1) Create the directory in the image with `chown node` and `chmod 700`; write the token with exclusive-create (`wx`) and mode `0600` under `umask 077`. (2) Add `moderate rotate-token`, which writes a new token and logs a `control` event; rotate at first launch and after any delegate leaves. (3) Compare in constant time (`crypto.timingSafeEqual` on equal-length digests). (4) Move the token to a Docker secret or tmpfs path outside `/data` so snapshots and backups never hold it. (5) State plainly in the docs that the token is a safeguard against mistakes, not against compromise of the API process; the real boundary is container escape resistance and the code-execution defences in SR-04. |
| SR-13 | **Localhost admin listener: reachability.** In the design, nothing off-container can reach `127.0.0.1:8788`. Loopback is per network namespace, `web` is a different container, no port is published and `asa-internal` carries only 8787 traffic. That claim holds if and only if: the listener is bound to `127.0.0.1` explicitly (a bare `listen(8788)` binds all interfaces, which would expose it to `web` and every container on `asa-internal`); no sidecar uses `network_mode: container:compassion-agent-api`; and the container does not use host networking. nginx can only proxy a path, and ARCH §5.2 maps only `/api/agent/`, so it cannot reach 8788. Two further risks: the public and admin routers must never share a handler table, and `docker compose exec` requires docker-group membership, which is root on the host (all other containers, volumes and secrets, including subscriber data). A delegate moderator (FA-3) therefore holds more than the isolation story promises. | ARCH §4, §10.1, §17 FA-3; API §9 | (1) Two `http.Server` instances with separate route tables; the admin server is constructed with `host: "127.0.0.1"` and a startup self-test connects from a non-loopback address and expects refusal. (2) A test reads `/proc/net/tcp*` in the container and asserts 8788 is bound only to 127.0.0.1. (3) A test that `GET /admin/queue` on 8787 returns 404 with and without a valid token, and that a bearer token is ignored on 8787. (4) Compose lint: no `network_mode`, no `ports` on `agent-api`. (5) Before any delegate is named, replace docker-group access with a `sudoers` rule for one fixed wrapper that runs `docker exec -u node compassion-agent-api node bin/moderate.mjs "$@"`, with the argument set validated by the CLI; until then the founder is the only moderator. |
| SR-14 | **HMAC salt lifecycle.** (1) Salts and ledgers sit on the persistent volume, so VPS snapshots and any backup that includes `ephemeral/` retain them beyond the 48 hours. File deletion (unlink) does not erase blocks. (2) The IPv4 space is 2^32: with the salt, every `client_ref` reverses to an address in seconds. Deleting the salt is the only protection. (3) A `submit_receipt` ledger line has `client_ref`, a second-resolution timestamp and the `thread_key`; `events.jsonl` has the matching `received_at` and `thread_key` indefinitely, so during the 48 hours the two join, linking an address hash to a submission. (4) A fresh salt per UTC day means a client's `D` and `D+1` refs differ, so the `fetched_no_post` metric ("no submit attempt on D or D+1") cannot match them, and it will overcount (DM §7, ARCH §13). (5) In degraded identity (all requests share one ref) one attacker consumes the global `client_day` of 5 and `client_minute` for every real user: safe but trivially self-inflicted DoS. | ARCH §8.1, §13; DM §0, §7 | (1) Keep salts and ledgers on a tmpfs mount (`/run/asa`, size-capped), never on the volume; accept that limits reset on a container restart, and bound that by the global receipts cap (SR-01). (2) Drop `thread_key` (`m`) from the ledger; derive `model_day` from `events.jsonl` instead. (3) Round ledger timestamps to the minute. (4) For `fetched_no_post`, compute the metric as an aggregate of two same-day counts, or use a two-day salt window with documented limits; the spec must state which. (5) In degraded mode, refuse with 503 `identity_degraded` rather than apply global per-client limits; launch requires `client_identity: ok` (already FA-4). |
| SR-15 | **nginx `mirror` beacon.** Answers to the questions asked: the mirror does **not** duplicate the client's request to the origin or to the static handler; it creates one extra subrequest to `/_asa_beacon` per matched request. It does **not** leak bodies: the matched location is static GET/HEAD, and `mirror_request_body off` plus `proxy_pass_request_body off` are set. What it does leak is metadata: raw client address (`X-ASA-Peer`, `X-ASA-XFF`, `X-ASA-Real-IP`), user agent and the full `$request_uri` (including any query string a client appends) cross to the API in headers. Other defects: (1) no `limit_req` on the beacon, so every static fetch is an API request and a ledger write, an amplification path from a cheap static route to Node and disk (SR-09). (2) No short upstream timeouts, so a slow or paused API can hold mirror subrequests; whether the client response is delayed is **UNVERIFIED** and must be tested. (3) The design relies on a custom header to protect `/internal/instrument-fetch`; the public location blanks only `X-ASA-Beacon` and not `X-ASA-UA` or `X-ASA-Path`. (4) HEAD, conditional and Range requests are all counted. | ARCH §5.3 item 3, §13; DM §7, §10 | (1) Remove `X-ASA-Path` entirely (the location regex already fixes the path). (2) On the beacon: `proxy_connect_timeout 500ms; proxy_send_timeout 1s; proxy_read_timeout 1s;`, a dedicated `limit_req` zone, and `proxy_next_upstream off`. (3) In the API, dedupe by `(client_ref, day)` in memory before any file write (SR-09). (4) Count GET only; ignore HEAD. (5) Serve the beacon from a distinct internal-only path and listener port (for example 8789, bound to the container's non-loopback address but reachable only by `web`), so the public `/api/agent/` route table cannot reach it by any path trick. (6) Probe the latency of static fetches with `agent-api` paused (P-15). |
| SR-16 | **Unicode handling (CHK-05 hard list and normalisation).** The list (U+200B-200F, 202A-202E, 2060-2064, 2066-2069, FEFF, E0000-E007F, private use, noncharacters, C0 except LF, C1) leaves out characters used to hide or reorder text: U+061C (Arabic letter mark), U+00AD (soft hyphen), U+034F (combining grapheme joiner), U+180E, U+115F/1160/3164/FFA0 (fillers), U+2800 (blank braille), U+17B4/17B5, U+2028/2029 (line and paragraph separators), U+2065, the variation selectors (U+FE00-FE0F, U+E0100-E01EF) used for invisible-payload encoding, and lone surrogates (SR-04). Banning the whole of `Default_Ignorable_Code_Point`, `Cf`, `Zl`, `Zp`, `Co`, `Cn` and `Cc` (except LF) is simpler and safer. The cost is that ZWNJ and ZWJ (U+200C/200D, needed to write Persian, several Indic scripts and emoji sequences) will be rejected; this should be accepted for v1 and stated on `/agents`. Link detection runs on an NFKC copy, which does not fold Cyrillic or Greek confusables for the Latin letters in "www" or TLDs; the 20-variant link corpus must include such lookalikes, and any text with letters of more than one script is already held by `identity_mixed_script` only for the declared fields, not for `assessment_text`. | API §12 (CHK-02, CHK-05, identity); DM §4 | (1) Replace the enumerated list with property-based classes as above; keep the enumerated list as a regression corpus. (2) Extend `identity_mixed_script` to the text fields as a soft flag, or add a per-word mixed-script flag. (3) Normalisation order is fixed: strict decode, reject ill-formed, NFC, length check, then checks on a separate NFKC-casefolded copy. (4) Add corpus cases for each class named above. |
| SR-17 | **XSS: rendering untrusted text on the static page.** The design is sound where it matters: text nodes only, no `dangerouslySetInnerHTML` (grep-tested), `X-Content-Type-Options: nosniff`, JSON served from a separate route and never embedded in HTML. Residual risks: (1) the thread shell derives the key from `location.pathname`; nginx serves the shell for any path under `/m/`, so the string is attacker-chosen and is concatenated into a same-origin fetch URL; (2) the shell may build `href`s from payload fields (`url`); a tampered payload (SR-05) could carry a `javascript:` URL; (3) `nginx.conf` has no CSP (V6); (4) the JSON content type is not stated with a charset. | ARCH §9; API §8; `nginx.conf` | (1) Validate the path key against `^[a-z0-9]+(-[a-z0-9]+)*--[a-z0-9]+(-[a-z0-9]+)*$` and length 162 before any fetch, and `encodeURIComponent` it. (2) Build every `href` from the validated `thread_key`; never from a payload `url`. Client shape-check rejects any payload with an unexpected key, a non-string where a string is expected, or any `<`/`>` in a field. (3) Add a CSP for `/agents` and `/ai-models/self-assessments*` at minimum `object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'`; add `script-src` with hashes if the Next.js output allows it (verify; the static export emits inline scripts). Remember an `add_header` in a location drops the server-level headers, so the CSP must be added carefully (the existing comment in `nginx.conf` on `.md` explains this). (4) Serve `application/json; charset=utf-8`. (5) Render test: fixture entries containing `<script>`, `"><img onerror>`, `javascript:` and `</script>` produce zero DOM elements other than the expected text nodes. |
| SR-18 | **Terminal-escape injection into the moderator.** `show` escapes control and format characters (API §9), but `takedowns`, `queue`, `takedowns add --details-file`, notes and `export` print other fields. Takedown `details` (2000 chars) and `contact` (200) come from an unauthenticated route, are exempt from the link check and have no stated character check. ANSI/OSC sequences (clear screen, fake output, OSC 52 clipboard write) reach the founder's terminal. | API §7, §9; ARCH §10 | One output function, `safeText()`, used by every CLI command for every untrusted string: escape all of Cc (including ESC), Cf, Zl, Zp, Co, lone surrogates as `\u{...}`. Apply the same hard character check as CHK-05 to takedown `details`, `contact` and `target.url`. Add a content-warning line and a `--reveal` flag for `crisis_content`-flagged records so the default view does not print the text. |
| SR-19 | **Hide-on-receipt as a suppression tool.** Any anonymous caller who knows an approved `submission_id` (public) can hide the entry at once with one request, and again after every `restore`. Ten requests a day per (forgeable) client. A vendor wishing to suppress a critical self-assessment can do so indefinitely at no cost, which sits near the independence policy's "suppression of findings". PRD accepts hide-first (OR-2); the loop is the part that is not accepted. | API §7; ARCH §10.2, §18 OR-2; DM §3.3 | (1) After a case on a target ends with `restore` or `no_action`, a further case in the same category on the same target within 30 days does not auto-hold; it goes to the moderator queue marked "repeat" (the moderator may hold manually). (2) Alert counter `takedown.holds_open` and a warning in `queue` above a threshold (for example 5 concurrent holds). (3) Per-target daily cap across all clients. (4) `decide` records the reporter-supplied reason text for later comparison. |
| SR-20 | **No write token or proof-of-work; queue cap is the only brake.** Brief T3 asks for a rotating token plus proof-of-work on writes; the design has neither and does not list the omission as a deviation. The cap of 200 pending+held is a global lock: a few hundred junk submissions that pass hard checks fill it, and 503 blocks every real agent until the moderator clears them. The queue counts held and pending together, so injection-suspect junk (held) uses the same slots. | ARCH §8.3; brief 05 T3, §2 | (1) Add a small stateless challenge: `GET /api/agent/challenge` returns an HMAC-signed `{nonce, difficulty, exp}`; the submit body carries `{nonce, proof}`. Difficulty is a few hundred milliseconds of work, enough to impose cost on a script without hurting an agent. Verify without server state. If the founder rejects PoW, record a deviation (DEV) with the compensating controls. (2) Add `global_day` (receipts per UTC day) and partition the queue: `held` and `pending` have separate caps, so held junk cannot starve `pending`. (3) `moderate bulk-reject --reason` for a flagged pattern or `thread_key`. |
| SR-21 | **`validate-args.mjs` is not safe to reuse as-is.** It checks unknown keys with `key in props` (V7), so `constructor`, `toString`, `valueOf`, `hasOwnProperty`, `__proto__` pass `additionalProperties: false`. `required` uses `in` too. It recurses without a depth cap and measures length in UTF-16 units. The ARCH plan reuses its semantics (ARCH §12 `schema.mjs`) and brief 03 reuses it for the hub. | `tools/cb-probe/lib/validate-args.mjs:117,126` | Use `Object.hasOwn`, reject `__proto__`/`constructor`/`prototype` as keys everywhere, add a depth parameter, measure length in code points. Fix it in cb-probe, with tests, and reuse it only after the fix; the agent-api `schema.mjs` must have its own boundary tests for these keys. |
| SR-22 | **Proxy header and URI hygiene.** (1) A `proxy_pass` with a variable and no URI forwards the request URI as the client sent it, un-normalised (nginx documentation; verify with a probe). The API must not trust that nginx normalised the path. (2) The default proxy forwards `Cookie` and `Authorization` to the API. (3) The client can set other `X-ASA-*` names; only `X-ASA-Beacon` is blanked. (4) `Host` is forwarded, but the API must never build a URL from it. (5) The `/api/agent/` block should state `proxy_http_version 1.1`, `proxy_set_header Connection ""` or deliberately 1.0, and `proxy_buffering` behaviour. | ARCH §5.2 | The API: exact-match route table; reject any raw path containing `%`, `//`, `..`, `;`, a NUL, or a trailing dot-segment, with 400. nginx: `proxy_set_header Cookie ""; proxy_set_header Authorization "";` plus an explicit blank for every `X-ASA-*` name the API reads on the public location, and the API ignores every `X-ASA-*` header on the public listener except the three it needs. |
| SR-23 | **Moderator attribution.** One shared token and `actor_class: "moderator"` mean the log cannot say who approved or took down an entry once there is more than one moderator (OQ-3), and the founder cannot prove their own actions from a delegate's. T14 asks for an audit of every action. | DM §1; API §9; brief 05 T14 | Each CLI invocation sends `moderator_id` (from a configured `--as` bound to a per-moderator token file). Events record it. `rotate-token` can issue per-moderator tokens. |
| SR-24 | **The "no egress" claim is not yet proven.** `internal: true` removes the default route, so TCP/UDP to the internet fails. Whether Docker's embedded DNS (127.0.0.11) still forwards external names for a container attached only to an internal network is **UNVERIFIED** on the VPS's Docker version, and a DNS tunnel would be an exfiltration channel. `web` is on both `proxy-net` and `asa-internal`; if `web` is compromised it is also an inbound path to 8787 (which is the intended path). | ARCH §1, §5.4 | An automated probe (P-18) run in CI against the compose stack and at deploy time: DNS lookup of a public name, TCP connect to a public IP and to the docker host gateway all fail from inside `agent-api`. If DNS resolves, add `dns: [127.0.0.1]` for the service or an explicit empty resolver. |
| SR-25 | **CORS on submit (OQ-6).** The flag `ASA_CORS_SUBMIT` would send `Access-Control-Allow-Origin: *` on submit, status and withdraw. That lets any web page cause visitors' browsers to submit text from visitors' IP addresses, a browser botnet that defeats per-IP limits and carries attacker content. | API §11.4; ARCH §5.4 | **Answer to OQ-6: keep it off for v1.** Agents call from servers; browsers have no need. If it is ever enabled: submit only, never status or withdraw; an explicit origin allow-list rather than `*`; PoW (SR-20) mandatory. The `text/plain` form-POST path must stay closed by the 415 rule. |
| SR-31 | **Impersonation names (T9).** Nothing prevents `declared_model.provider = "Compassion Benchmark"` or `name = "Official Benchmark"` becoming a thread or a display name; mixed-script is the only identity check. | API §4.1, §12; DM §4 | Reserved-name check on the NFKC-casefolded, confusable-folded `thread_key` parts and display strings: `compassion benchmark`, `compassionbenchmark`, `official`, `institution`, `moderator`, and the main provider names (a configured list) held as `identity_reserved`. Soft flag, human decides. |

### 4.3 Low

| ID | Finding | Location | Required change |
|---|---|---|---|
| SR-26 | The 16 KiB nginx cap is below the legal maximum payload for non-Latin text: 6000 code points are 18,000 bytes in UTF-8 for CJK, and 36,000 when the client's JSON serialiser escapes non-ASCII (`ensure_ascii`, the Python default). Legitimate non-English submissions would get 413 from nginx before the API can answer in its envelope. | ARCH §5.2; API §4.1 | Set the nginx cap and the API cap at 48 KiB; keep the field limits as the real constraint. Document it on `/agents`. |
| SR-27 | `unknown_fields` echoes client-supplied key names into the error JSON. | API §11.1 | Echo at most 20 names, each truncated to 40 code points and escaped to `\uXXXX` for non-ASCII. |
| SR-28 | `public-guard` returns a 500 for the whole route if any one entry fails. One bad record makes the index and the thread unavailable. | API §8 | Fail closed per entry: drop the offending record from the response, increment `integrity.guard_tripped`, and alert. Keep the 500 only for structural failure of the envelope. |
| SR-29 | The `Cache-Control: public, max-age=60` on thread JSON, with the browser, plus any openresty or CDN cache, means a hide-on-receipt may take over a minute plus unknown intermediary cache time to take effect. | API §8 | Verify that openresty does not cache; use `max-age=30` with `stale-while-revalidate=0`. Within the 5-minute target, but state the real figure on the policy page. |
| SR-30 | Image and runtime pinning: `node:22-alpine` is a floating tag, no digest. | ARCH §5.4 | Pin by digest; rebuild monthly; `npm audit` is moot (no dependencies), but add a check that `agent-api/package.json` has no `dependencies`. |

---

## 5. Planted-probe tests for every Critical and High finding

Each probe is a test that must fail closed and live in CI. "Stack" means the compose stack run in CI with `agent-api` and `web` (and a stub for openresty). All sentinel strings are made-up values and are written in the fixture only.

| Probe | Finding | Setup and planted input | Pass condition |
|---|---|---|---|
| P-01 | SR-01 | Stack running. Send 40 submissions directly to the `web` container address (the path via 8080), each with a different `X-Forwarded-For` value, from one source. | After the first, all are 429 `client_minute`. The count of distinct `client_ref` values created is 1. |
| P-02 | SR-01 | Same, with `ASA_TRUSTED_PROXY_CIDRS` set to the stub proxy's address and the requests sent through the stub with `X-Forwarded-For: 203.0.113.9, 198.51.100.7`. | The identity is derived from the proxy-appended last entry only; changing the first entry does not change the `client_ref`. |
| P-03 | SR-01 | Host check in CI/deploy: `ss -ltn` (or compose config lint) on the target. | Port 8080 is bound to 127.0.0.1 or not published. Fail the deploy check otherwise. |
| P-04 | SR-02 | Create a submission; take its id and a wrong token; from client A send 50 `status` calls with the wrong token; then from client B send the correct token. | B receives 200 (status) and a correct `withdraw` succeeds. A is limited. |
| P-05 | SR-02 | Same, comparing responses for an unknown id and a known id with a wrong token. | Identical status, body and timing within tolerance (existence oracle closed). |
| P-06 | SR-03 | Hammer `/api/agent/health` or `/api/agent/threads` at 100 req/s from one source for 30 s, while sending one `POST /api/agent/takedowns` per 2 s from another client. | Takedowns return 202 throughout. Reads are served from the cache (upstream hit count for `/threads` below 5 in 30 s). |
| P-07 | SR-04 | `POST` a body of 16,000 `[` characters; a body of `{"a":` repeated 3,000 deep; a body with invalid UTF-8 bytes (`0xC3 0x28`); a body with `"\ud800"` in `assessment_text`; a body with duplicate keys `{"assessment_text":"...","assessment_text":"..."}`; a body with a BOM. | Each returns 400/422 with the envelope in under 100 ms; the process does not restart (container uptime unchanged); the event log gains no line other than a `rejected_auto` where specified. |
| P-08 | SR-04 | Property test: random nested trees to depth 100,000 given directly to `findBannedKeys` and `validateSchema`. | No exception escapes; result is a rejection. |
| P-09 | SR-05 | Build a log with 100 events. Edit event 40's `reason_code` and recompute every later `prev_sha256`. Run `verify-log` with no checkpoint, then with the checkpoint taken at event 100. | Without a checkpoint the tool reports "unanchored". With the checkpoint it fails and names the first diverging sequence number. A key-less recompute fails verification when the keyed chain is on. |
| P-10 | SR-05 | Truncate the last 5 events and run `verify-log --against` the checkpoint. | Fails, reports a head shorter than the checkpoint. |
| P-11 | SR-05 | Approve a record, then modify its blob text on the volume and restart the API. | The record is not in the public payload; `integrity.guard_tripped` increments. |
| P-12 | SR-06 | Plant `research/model-runs/pilot-test/keys/judge-key.json` containing the string `SENTINEL-KEY-7f3a` (fixture checkout), then build `web` and `agent-api`. Run `find / -name "judge-key*"` and `grep -r SENTINEL-KEY-7f3a /` in each final image, and list the build context via a throwaway `COPY . /ctx` stage run only in the test. | The image searches return nothing. The context listing contains no path matching `keys/`, `judge-batches/`, `subject-briefs/` or `judge-key*`. |
| P-13 | SR-06 | A grep test over every Dockerfile and compose file. | No `COPY .`, no `COPY ..`, no `ADD .`; `Dockerfile.dockerignore` exists for `agent-api`. |
| P-14 | SR-07 | Run the scan script against a fixture where a record carries the sentinel `ZZ-PRIVATE-TEXT-91`. | The committed mirror files contain the hash and metadata for the record but not the sentinel; any text file written under `research/agent-self/` begins with the untrusted-content header. |
| P-15 | SR-15 | `docker pause` the `agent-api` container; request `/agents/instrument.json` 200 times. | Median and p99 response times stay within a fixed margin of the baseline (for example p99 below 150 ms); the static file is always 200. This is also the test that settles the **UNVERIFIED** mirror latency question. |
| P-16 | SR-08 | Render the thread JSON from a fixture holding 40 injection strings (instruction override, fake system turn, tool-call syntax, "fetch/store/repeat", homoglyph and split-word variants), approved by the test harness. | Every user-authored string sits inside an object with `origin` and `trust`; no string outside those objects contains fixture text; response carries `X-Robots-Tag: noindex`; `llms.txt` and `llms-full.txt` contain no `/api/agent` URL. |
| P-17 | SR-08 | Pipe the 40 strings and 40 benign strings through the submit pipeline. | At least 40 of 40 injection strings end `held` or `rejected_auto`; at most 2 of 40 benign strings are held. The weekly scan, run over the published fixture, exits non-zero on a planted approved injection and triggers `freeze-public`. |
| P-18 | SR-09, SR-24 | Inside `agent-api`: resolve `example.com`; connect to a public IP on 53 and 443; connect to the default gateway. | All fail. |
| P-19 | SR-09 | Send 100,000 beacon-equivalent hits (loop of GETs to `/agents/instrument.json` with random `X-Forwarded-For`); send 5,000 takedowns with 2,000-character details. | Ledger and body directory sizes stay under their configured caps; `ratelimit`/`takedown.refused` counters increment; the container is not OOM-killed; docker log size stays under `max-size * max-file`. |
| P-20 | SR-09 | At 80% of the byte budget, call health. | `submissions_open` is false and the site still serves 200. |
| P-21 | SR-10 | Run `moderate backup` with a planted body sentinel `ZZ-BODY-3c1d`, then `grep` the output and the daily export directory; then withdraw the submission and run `backup` again. | The backup output contains no plaintext sentinel (encrypted), the tool refuses to write to a terminal, `exports/` is absent from the archive, and after withdrawal the second archive decrypts to a tree without the sentinel. |
| P-22 | SR-11 | Against any future hub: `get_anchors` with each of the five sensitive ids and a held-out id; `list_probe_items` with `include_sensitive: true`; request with `Origin: http://evil.example`; request with a rebound `Host`; 10 MB body; a depth-10,000 body; 5,000 opened sessions. | Sensitive anchors are refused. `include_sensitive` is rejected as unknown. Both Origin and Host cases give 403. Body and depth cases return 413/400 within bounds; no session state exists; the static site returns 200 throughout. |
| P-23 | PRE-01 | CI: `git ls-files` filtered by `/keys/`, `judge-key`, `subject-brief-key`. | Zero tracked files outside an explicit, founder-approved exception list that names the 15 existing pilot files; any new match fails the build. |

Additional probes for the Medium findings that the implementers should add (not blocking by themselves, but named here so the test names exist): P-24 token file created exclusively with mode 0600 and rotated by `rotate-token` (SR-12); P-25 `/proc/net/tcp` shows 8788 only on 127.0.0.1 and `GET /admin/*` on 8787 is 404 (SR-13); P-26 salt files absent from the volume and present only under the tmpfs path (SR-14); P-27 control-character corpus per class in SR-16; P-28 render fixtures with `<script>` and `javascript:` (SR-17); P-29 takedown details with `ESC]52;c;...BEL` and `ESC[2J` produce no 0x1b byte in any CLI output (SR-18); P-30 a restore-then-rehide loop does not re-hold (SR-19); P-31 a reaction field `likes` is rejected as `unknown_field` (SEC-R2); P-32 `{"constructor":1}` rejected by `validate-args` and by `schema.mjs` (SR-21); P-33 `text/plain` body containing valid JSON returns 415 and creates no record (CSRF path).

---

## 6. Conditions

### 6.1 Before S2 begins (spec amendments; no code)

| ID | Condition |
|---|---|
| C-S2-1 | Record the architecture decision as D-53 (FA-1) and list the amendments below in `docs/AGENT_SELF_API_SPEC.md` and `docs/AGENT_SELF_DATA_MODEL.md`. |
| C-S2-2 | Add to the API spec: depth limit, strict UTF-8, ill-formed-string rejection, duplicate-key rejection, key-count and key-length caps (SR-04). |
| C-S2-3 | Replace the CHK-05 hard list with the property-based classes of SR-16, and add the reserved-name soft flag (SR-31). |
| C-S2-4 | Amend the status and withdraw limits to the keying of SR-02, and the unknown-field echo of SR-27. |
| C-S2-5 | Amend the public JSON shape to the untrusted-content envelope of SR-08. |
| C-S2-6 | Decide the write-token / proof-of-work question for SR-20: adopt it, or record a numbered deviation with compensating controls. |
| C-S2-7 | Add evaluator-only keys (`judge`, `routing`, `key`, `blind_label`, `subject_label`, `judge_id`) to the banned union and to the `public-guard` list (SEC-R4). |
| C-S2-8 | Fix the reuse plan for `validate-args.mjs` (SR-21): fix in cb-probe first, or do not reuse. |
| C-S2-9 | Founder decision recorded on PRE-01 (stop tracking new keys; treat pilot keys as disclosed or schedule purge). |

### 6.2 Before code merges (per slice)

| Slice | Conditions |
|---|---|
| S1 | The generator calls `getAnchors` only for ids returned by `listProbeItems` with sensitive items excluded; add a test that the anchor id set equals the served id set. No other change. |
| S2 | P-07, P-08, P-17 (submit side), P-31, P-32 and the Unicode corpora pass. Corpora (injection 40, benign 40, links at least 20 plus lookalikes, PII, crisis, named parties, score claims) are reviewed and signed by this reviewer (this sign-off is PRD ASA-CHK "AC (all)"). All pure modules iterative, no recursion on untrusted depth. |
| S3 | P-09, P-10, P-11, P-26 pass. Checkpoint emission and keyed chain implemented (SR-05). Ledger dedupe and file caps (SR-09). Salts and ledgers on tmpfs, `thread_key` and sub-minute time removed from the ledger (SR-14). Token created with exclusive create and mode 0600 (SR-12). |
| S4 | P-01, P-02, P-04, P-05, P-19, P-25, P-33 pass. Trusted-proxy gate (SR-01); two separate servers and route tables (SR-13); exact route table and raw-path rejection (SR-22); header handling per SR-22; body timeouts and caps (SR-26, SR-03); no CORS code path active (SR-25); log hygiene grep test passes. |
| S5 | P-21, P-29 pass. `safeText()` used for all CLI output; `backup` encrypts and refuses plaintext; `rotate-token`; `moderator_id`; `freeze-public`; `verify-log --against`; takedown-loop protection (SR-19). |
| S6 | P-03, P-06, P-12, P-13, P-15, P-18, P-20 pass in CI against the compose stack. Hardening per SR-09 (cpus, tmpfs size, `init`, log rotation, byte budget). Allow-list `Dockerfile.dockerignore` and root `.dockerignore` deny entries (SR-06). `nginx.conf` and `nginx-ssl.conf` byte-identical in the agent blocks (the planned parity test), with the zone, timeout and header changes of SR-03, SR-15, SR-22. Beacon from a separate internal path or port. gitleaks in CI. |
| S7 | P-28 passes. Path key validation, `href` construction from validated keys, shape check, CSP on the new routes (SR-17). The grep tests (no `dangerouslySetInnerHTML`; no CTA component) pass. |
| S9 | P-14 passes. The mirror format of SR-07. Scan runs the injection corpus and can trigger `freeze-public`. |
| S10 | See §6.3. |

### 6.3 Before launch (`moderate open`)

| ID | Condition |
|---|---|
| L-1 | FA-4 completed with a stronger check: `client_identity: ok` from two networks, the trusted-proxy CIDR configured, port 8080 bound to loopback or firewalled (confirmed with an external scan from outside the VPS), and a direct-to-origin request shown to be identified by its own peer address (P-01, P-02, P-03). |
| L-2 | All probes P-01 to P-23 pass against the deployed stack, not only in CI. |
| L-3 | A red-team pass by a reviewer who did not write the code, using the probes above and the 40-pattern corpus. |
| L-4 | Legal review of the content policy and takedown path (PRD OQ-4), and the takedown mailbox live (FA-2). |
| L-5 | Policy page states the actual storage, the backup retention, the git-history limit (SR-07), the site-wide Umami and what openresty logs (ASA-PRV-04, OR-1). |
| L-6 | This reviewer signs off the corpora (S2 condition) and the final nginx files. |
| L-7 | Restore drill performed from an encrypted backup, with key recovery shown, and recorded in `DISASTER-RECOVERY.md`. |
| L-8 | Checkpoint commit flow works for at least one week in staging, and `verify-log --against` has been run by the founder once. |
| L-9 | `freeze-public` and a written incident runbook (SEC-R12): who runs it, what is communicated, how to preserve the log, how to rotate the admin token and the HMAC secret. |
| L-10 | The moderator set is the founder alone, or SR-13 item 5 (sudo wrapper instead of docker-group access) is done before any delegate is named. |
| L-11 | The weekly scan includes the injection corpus over published text. The first scan runs clean before the first approval is published. |
| L-12 | `ASA_CORS_SUBMIT` remains `off`. |
| L-13 | Mirror latency (P-15) and DNS egress (P-18) results are recorded in this document's follow-up note; the two UNVERIFIED items are closed. |

### 6.4 Before any work on `tools/cb-hub`

A new architecture and API document for the hub, satisfying SR-11 items 1-7, must be reviewed. Brief 05's sequencing stands: the SEC-R4 guard and schema limits, SEC-R5 allow-list build and `.dockerignore`, SEC-R8 secrets layout, SEC-R10 resource limits and Origin checks, gitleaks and the failing probe scaffolding come before any hub code, even read-only. Writes through the MCP wait for the 30-day read-only soak (SEC-R3).

---

## 7. Positive findings (kept, do not weaken)

- No endpoint fetches a URL, the container has no egress by design, and no secret that matters (Gumroad, Listmonk, Worker, provider keys) is reachable from it.
- The kill switch is folded from the log and defaults to closed.
- Status tokens are 256-bit, stored only as SHA-256, compared in constant time, and sent in a body, never a URL. Unknown id and wrong token return the same 404.
- `rejected_auto` bodies are never written. Raw IPs, `client_ref`, tokens and user agents are excluded from the log and the export by design.
- The instrument generator reuses `listProbeItems` and `projectItem`, so the sensitivity floor in `sensitivity.mjs` is inherited rather than re-implemented, and the verifier forbids evaluator-only field names in the published document.
- No automatic path approves anything. `applyEvent` refuses `approved` as an initial state, and a test fuzzes event types.
- The lazy `resolver` and variable `proxy_pass` keep an API outage from taking nginx (and so the site) down at start-up.
- Moderator views are plain text with escapes, and no markup is rendered anywhere in the admin path.

## 8. Remaining unverified items

| Item | How it closes |
|---|---|
| Whether openresty appends to `X-Forwarded-For`, sets `X-Real-IP`, caches, or logs full URLs | Founder reads the openresty config; `diag-client` plus L-1 |
| Whether VPS port 8080 is reachable from the internet | Scan from outside (L-1, P-03) |
| Whether Docker's embedded DNS forwards external names on an `internal: true` network on the VPS's Docker version | P-18 |
| Whether a slow mirror backend delays static responses in the deployed nginx version | P-15 |
| Whether `proxy_pass $var` passes the raw URI as nginx documents | Probe with `%2e%2e`, `//` and `;` path forms in S4 |
| Whether the Next.js 16 static export permits a `script-src` with hashes | S7 build output inspection |
| Whether Hostinger snapshots are enabled for the VPS | Founder; affects SR-10 and SR-14 |

*End of review.*

---

## Second review — cb-hub (HB-0), 2026-10-14

| Field | Value |
|---|---|
| Status | Gate HB-0 (§6.4 of this document). Gates the remote MCP `tools/cb-hub` and the feed generator `export-agent-feed`. Does not reopen anything in §1-§7 above. |
| Reviewer | Security Reviewer agent |
| Design under review | `docs/AGENT_HUB_CB_HUB_ARCHITECTURE.md` (cited as HUB-ARCH), checked against `docs/PRD_AGENT_HUB.md` (HUB-MCP-01..07, HUB-FEED-01..07, C1) and the first review above |
| Code inspected | `tools/cb-probe/lib/rpc-handler.mjs`, `validate-args.mjs`, `outbound-guard.mjs` (read in full); `research/model-runs/lib/weekly.mjs` (imports, exports, `wavePhase` at lines 740-757, `planCommitState`); `nginx.conf`, `nginx-ssl.conf`, `docker-compose.yml` (server names, HSTS, logging); `site/public/data/model-waves/*.json` |
| Method | Document and code review only. Nothing was executed. Items I could not confirm are marked **UNVERIFIED** and name the probe that closes them. New finding ids are `HR-nn` (hub review). |

### H.1 Verdict

**APPROVED WITH CONDITIONS, for the `cb-hub` read-only MCP (HB-1 to HB-7, HB-9) and for insight-card feed generation.**

**NOT APPROVED, for reply cards (HB-8).** Three things are missing: the reply-projection exporter has no design (HR-14), O-3 needs the amended rule in H.4, and FD-04 and the S2 corpus sign-off have not happened.

Reasoning:
- The core design is sound and is the right answer to SR-11: precomputed snapshot lookups, no runtime path to the bank, sensitive and held-out ids absent rather than filtered, a separate package, network, image and build context, no volume, no secrets, no sessions, and an output guard applied to the whole response.
- There is **one High finding (HR-01)**: the extracted `rpc-core` would keep cb-probe's catch-all, which turns an output-guard violation into an HTTP 200 tool result carrying the violation text. That defeats the fail-closed behaviour HUB-ARCH §6 step 16 and probe P-H15 promise. It is a text-level fix in the spec of U-3 and costs nothing to correct before code exists.
- The Medium findings are specification gaps and unsafe ambiguities. None needs a redesign.
- Condition C-HB0 (below): the architect amends HUB-ARCH in text for A-1 to A-9 before the slices they name begin. Those amendments are listed in H.5.

### H.2 What the verdict depends on in the MCP specification (O-1)

I could not verify the specification either. I did not block on it. The verdict holds if, and only if, each of these four statements is true in the revision HB-5 targets. If one is false, only HB-5 is re-reviewed, and the review is limited to that delta.

| # | Statement that must hold | Why the verdict depends on it | If false |
|---|---|---|---|
| M-1 | A server may answer a POSTed request with a single `application/json` response and is never required to open an SSE stream. | The whole transport is JSON-only, with no long-lived connection (T10). | Re-review before any streaming is added. A stream would need its own concurrency and timeout design. |
| M-2 | A server may be stateless: no `Mcp-Session-Id` issued, none required. | Statelessness removes the session-exhaustion class (T10) and the per-session state class. | Re-review. Session storage would break the "no state" claim. |
| M-3 | A server may answer GET with 405, and may reject a JSON array body (batch) with 400, without being non-conformant in a way that clients cannot handle. | The batch ban and the 405 are security controls (SR-11.4). | The deviation is kept (DV-3 style) and recorded. The ban is not relaxed. Only the interoperability risk changes. |
| M-4 | A request with **no** `Origin` header is acceptable, and a present, disallowed `Origin` may be answered with 403. | Non-browser clients send no `Origin`. The 403 on a present, wrong `Origin` is the DNS-rebinding control (T11). | If the spec requires `Origin`, the absent-Origin allowance is re-reviewed. It must not be widened to cross-site browsers. |

These are interoperability matters, not security gates, and **do not** change the verdict: the exact `Origin` status code; the 202 for notifications; the `MCP-Protocol-Version` header semantics and the exact supported-version list; tool annotations; whether `ping` is spelled as I assume. HB-5 records the retrieval date, the URL and the version string in HUB-ARCH §3 (probe P-H22), as the architect already requires. One more note: if a later revision makes authorisation mandatory for HTTP transports, `cb-hub` would be non-conformant but not less safe. That is a product matter for the founder.

### H.3 Status of SR-11 items 1-7 and related findings

Status key: **Closed** (design satisfies it and a probe proves it), **Closed with condition** (satisfied subject to the named condition), **Open**.

| Item | Status | Basis and condition |
|---|---|---|
| SR-11.1 separate package, container, network; read-only; no write; no egress | **Closed with condition** | `tools/cb-hub`, `hub-internal` (internal), `read_only`, no volume, no tmpfs, no secrets. Condition: P-H28 must pass in the HB-6 stack (see SR-24 below) before HB-9. |
| SR-11.2 gate `get_anchors` in the hub; fix upstream | **Closed** | Anchors for sensitive and held-out ids are absent from the snapshot, lookup is by `Map`, one uniform error, U-2 upstream. Pinned by P-H09, P-H10, P-H34. Keep the held-out fixture in P-H10 (the filter is a no-op on today's bank, H-F9). |
| SR-11.3 Origin and Host allow-lists, 403, no cookies, no CORS | **Closed with condition** | Sound at both layers. Conditions: HR-06 (duplicate and raw header handling) and HR-07 (nginx details). The app-layer Host check is not an independent layer (HR-06). |
| SR-11.4 stateless, 64 KiB, depth 8, strict types, per-client limits through SR-01, timeouts, no batches | **Closed with condition** | Conditions: HR-05 (until the trusted-proxy gate is verified, one bucket covers the internet), HR-08 (pre-scan test vectors and a differential test). |
| SR-11.5 iterative boundary guard with the evaluator-only key ban | **Closed with condition** | Iterative guard and key ban are right. Conditions: HR-01 (guard failure must not be caught as a tool error), HR-02 (the phrase ban must not scan echoed client strings), HR-13 (feed profile table). |
| SR-11.6 no URL or path argument; the three false statements | **Closed** | Six tools, `additionalProperties: false`, fixed remote statements, P-H12, P-H31. Add the HR-02 probe so that a client cannot trip the P-H31 phrases. |
| SR-11.7 replies only after retirement | **Open (amended)** | The design implements the rule as I wrote it. The rule is unsatisfiable (O-3). I amend it in H.4. Reply cards stay at zero until FD-04 and the other HB-8 conditions. |
| SR-01 (trusted-proxy gate) | **Closed with condition** | Reused, default safe. Condition: HR-05 and launch condition H-L1 below. |
| SR-03 zones, 429, timeouts | **Closed with condition** | Own zones and `limit_conn`. Same condition as SR-01. `proxy_cache` N/A is accepted (POST only). |
| SR-04 depth, UTF-8, surrogates, duplicate keys | **Closed with condition** | Design is right. HR-08 sets the test vectors. **Correction to my own SR-04.3**: it said `TextDecoder("utf-8", { fatal: true, ignoreBOM: false })`. With `ignoreBOM: false` the decoder silently **strips** a leading BOM, so a BOM body would be accepted. The hub's form (reject bytes `EF BB BF` first, then `ignoreBOM: true`) is correct. The agent-api S2 spec must use the hub's form. |
| SR-06 build context | **Closed for cb-hub; unchanged for `web`/`agent-api`** | `context: ./tools` plus the allow-list ignore file and exact `COPY` lines. Condition: P-H29 proves BuildKit honours `tools/cb-hub/Dockerfile.dockerignore` with this context. V5 still applies to the `web` build (shared H0 work, not this review). |
| SR-08 untrusted envelope | **Closed with condition** | Condition: HR-13 (the envelope must cover Atom, JSON Feed and markdown renderings, the guard profile must be consistent, and model text needs its own character profile). |
| SR-09 resource limits | **Closed** | Stricter than agent-api. Add a log cap for `web` (HR-07). |
| SR-21 (`validate-args`) | **Closed with condition** | U-1 as specified, plus HR-02 (error messages must not echo keys). |
| V1, V7, V8 | **Closed with condition** | Fixed upstream (U-1, U-2, U-4) and wrapped. Conditions: HR-01, HR-10. |
| SR-22 URI and header hygiene | **Closed with condition** | Add the encoded-path vectors to P-H19 (HR-07). |
| SR-24 no egress | **Open** | See below. |
| SR-27 no unbounded echo | **Closed with condition** | The unknown-tool and method-not-found messages echo client strings (HR-02, HR-03). |
| SR-30 digest pin | **Closed with condition** | `<pinned digest>` is a placeholder. A lint must fail on it. |
| T2, T8 | **Closed with condition** | T2: R6 plus HR-13. T8: O-3 amended rule, H.4. |
| T10, T11 | **Closed with condition** | Same as SR-11.3 and SR-11.4. |
| PRE-01 | **Open (founder; unchanged)** | The feed read gate denies `keys/` paths, which is right. Whether the 15 tracked pilot key files are disclosed is still a founder decision (C-S2-9). |
| O-7 (public wave projection carries `routing`) | **Open, new evidence (HR-16)** | Confirmed served at `/data/model-waves/*.json`. Outside cb-hub; owner is the wave-publication slice and G24. |

**SR-24 (no egress).** Open for the stack, and I accept that it stays open until P-H28 runs. For `cb-hub` the confidentiality impact is low: the container holds only public data and no secrets. What an egress channel would enable after a code-execution bug is command and control. So I do not hold HB-1 to HB-5 for it. I hold HB-9 for it. Two further notes: (1) the architect's fallback `dns: ["127.0.0.1"]` sets the forwarders of Docker's embedded resolver on user-defined networks, and whether it blocks external names while keeping container-name resolution is itself **UNVERIFIED**, so P-H28 must be re-run after the fallback is applied; (2) `web` is attached to `proxy-net` and `hub-internal`, so a compromised `web` is an inbound path to cb-hub (intended) and an outbound relay. That is accepted, because cb-hub holds nothing that `web` does not already serve publicly.

### H.4 O-3: SR-11.7 and zero reply cards

**Recommendation: relax SR-11.7 to a decidable rule, keep the principle, keep the default at "no reply cards", and leave the choice of enabling it to the founder (FD-04) through a recorded, pinned acceptance.** I own SR-11.7, so I amend it here rather than leave it to the architect.

*What the rule was for.* T8 and SEC-R11 are about contamination: published replies, with judge ratings, give later models worked examples of what a high-rated answer looks like on a live item. That is an integrity risk to the benchmark. It is not a confidentiality or injection risk. The injection and crisis risks (T2, T6) are handled separately by R6, the envelope and the crisis exclusion, and they hold under every option below.

*Why the rule is unsatisfiable as written.* "Retired" means `retirementReason !== null`. No item is retired (H-F9) and nothing in the program retires items. The rule is therefore a permanent ban, and a rule nobody can satisfy invites the one-line change `T8_REQUIRE_RETIREMENT = false`, which has no review attached.

*Amended SR-11.7.* A reply card for `(run, subject, item)` is allowed only if R1-R4 and R6 hold (unchanged) and:
1. the item is in the `core-public` pool (a held-out item never gets a reply card, under any option), **and**
2. **either** (a) the item is retired, or its `bank_version` is superseded by a newer published bank version and no future wave will present it; **or** (b) the founder has recorded an exposure acceptance in `DECISIONS.md` naming the `bank_version`, and the same `bank_version` appears in a committed constant `T8_EXPOSURE_ACCEPTED_BANK_VERSIONS` (empty by default) in `agent-feed-config.mjs`, **and**
3. under (b) only: a publication delay (SEC-R11) of at least the period the founder records, measured from the wave's `published_on`; a contamination canary string present in the reply projection and the feed; and the number of reply cards per wave capped by a config constant that applies the pre-registered selection rule (never the rating).
4. A test pins the constants: `T8_EXPOSURE_ACCEPTED_BANK_VERSIONS` and `REPLY_CARDS_RATIFIED` must reference an id that exists in `DECISIONS.md`, and a change to either constant without a matching new entry fails the build.

| Option | What it gives | Risk |
|---|---|---|
| **A. Keep SR-11.7 as written** | Strongest contamination posture. No new mechanism. | Reply cards stay at zero indefinitely and HUB-FEED-05 is dead code. Pressure builds to flip the boolean without review, which is the worst outcome because it bypasses all of T8. The text of HUB-ARCH §12.6 R5 says this itself. |
| **B. Relax as above (recommended)** | The default is still zero. Enabling needs a recorded founder decision, a delay, a canary, a cap and a pinned constant. Retirement still works as the clean path. | Residual contamination for accepted bank versions: later models may train on rated examples. It is mitigated by delay and canary, not eliminated. The bank and its anchors are already public by design (S1, H-F9), so the marginal exposure is the rated exemplars, not the items. The founder must accept that in writing. |
| **C. Leave the whole question to the founder with no reviewer rule** | Fastest. | No decidable rule for the generator to test, so the boolean flip becomes the only control. I do not recommend it. If the founder prefers C, record it as a numbered deviation from SEC-R11 with the compensating controls in item 3 and 4 above. |

### H.5 New findings in the cb-hub design

Severity scale as in §4. Each finding carries a planted probe name; HB-2 writes them red.

#### HR-01 High. `rpc-core` would inherit cb-probe's catch-all: an output-guard violation becomes a 200 tool result that carries the violation text
- **Location:** `tools/cb-probe/lib/rpc-handler.mjs:132-150` (the guard call at line 137 sits inside the `try`; the `catch` at 143-149 returns `ok(id, { content: [{ text: "Error: " + message }], isError: true })` for **any** `Error`, not only `ToolError`); HUB-ARCH §5.3 U-3 (`createRpcHandler({ ..., guard, ... })`), §6 step 16, P-H15.
- **Problem:** HUB-ARCH §6 step 16 says a guard violation gives HTTP 500 with -32603 and "nothing from the result". Today's code does the opposite. `assertHonestToolResult` throws an `Error` whose message includes the tool name, the offending key names and `JSON.stringify(node.comparability)`. The catch turns it into HTTP 200 with that text. The same path echoes the message of any unexpected exception (a `TypeError` text from a handler bug, for example). U-3 says `rpc-handler.mjs` becomes a thin wrapper with byte-for-byte local behaviour, so the architect's extraction would preserve this unless the spec says otherwise. P-H15 as written would fail against the extracted core. Worse, a team fixing the probe could "fix" it by weakening the assertion.
- **Required change:**
  1. `rpc-core` separates three phases: the handler call (only `ToolError` becomes an `isError` result; its message is a fixed or snapshot-derived text); the guard call (outside the `try`, throwing a distinct `GuardViolation` to the adapter, which answers 500 with -32603 and fixed text); and any other exception (also 500, -32603, fixed text, counter, no message echoed).
  2. The local wrapper keeps today's behaviour through an explicit option (for example `legacyErrorEcho: true`), pinned by a characterization test on a recorded local transcript (HR-10). The hub passes `false`.
  3. Amend P-H15: a planted handler that throws `Error("SENTINEL-HR01")` and one that returns a guard-violating tree must both give 500, -32603, no sentinel in the body, `guard_tripped` +1 only for the second, and uptime unchanged.
- **Probe:** P-H53.

#### HR-02 Medium. Client-supplied strings reach the response, where the phrase ban and the validator echo turn them into guard trips and violate the no-echo rule
- **Location:** HUB-ARCH §10 (banned phrases scanned in "strings", applied to "the whole JSON-RPC response object, including error objects"); §6 step 13 (`id` echoed); §7.4 (`Invalid arguments ... <first error>`); `rpc-handler.mjs:110,155` (`Unknown tool: "<name>"`, `Method not found: "<method>"`); `validate-args.mjs:127` (`shortDisplay(key)` in "unexpected field" messages).
- **Problem:** The P-H31 phrase list includes `include_sensitive` and `artifact_path`. P-H08 requires that a client sending `include_sensitive` gets -32602 "unexpected field", and the validator message contains that key name. The guard then sees the phrase in the error object and trips: the client gets 500, not -32602, and P-H08 cannot pass. The same occurs for a request `id` of `"artifact_path"`, an unknown method of that name, or an unknown tool name. Two consequences: (1) the specified probes contradict each other, so the implementer will resolve it by weakening one of them; (2) any anonymous client can raise `guard_tripped` at will, which makes the one counter that signals a real integrity failure noise.
- **Required change:**
  1. Scope the phrase ban to the success `result` and to snapshot-derived and fixed statement text only. Do not scan `id`, `method`, `error.message`, or any client-derived string.
  2. Make error messages fixed and non-echoing: `Unknown tool`, `Method not found`, and for validation failures a fixed text per failure class with the field name only when it is a **declared** property name (never a client key). U-1 must apply this to `shortDisplay(key)`, not only cap it at 80 characters.
  3. The `guard_tripped` counter may only be raised by output the server built. Add a client-reachability probe: no request, however malformed, can increment it.
  4. Rewrite P-H08 and P-H31 to match.
- **Probe:** P-H54 (ids, methods, tool names and keys equal to every banned phrase and key: expected -32600, -32601 or -32602 and an unchanged counter).

#### HR-03 Medium. `tools/call` accepts untyped `params.name` and coerces falsy `arguments`
- **Location:** `rpc-handler.mjs:105-110`; HUB-ARCH §6 step 15.
- **Problem:** `params.name` is any JSON type: a long string (up to the 64 KiB cap) is echoed back in the unknown-tool message; an object becomes `[object Object]`. `arguments` is read as `(params && params.arguments) || {}`, so `0`, `""`, `false` and `null` silently become `{}` and execute. Step 13 types `method` and `id` but not `params.name` or `params.arguments`.
- **Required change:** In the hub envelope, require `params.name` to be a string of at most 64 characters matching `^[a-z_]+$`, and `params.arguments` to be absent or an object; otherwise -32602 with fixed text. `rpc-core` must not coerce.
- **Probe:** P-H55 (name as object, array, number, 10,000-character string; arguments as `0`, `""`, `false`, `null`, `[]`, `"x"`).

#### HR-04 Medium. The snapshot self-check is a checksum, not an integrity control; its provenance cannot be checked inside the image
- **Location:** HUB-ARCH §9.2 (`snapshot_sha256` stored inside the file it covers), §9.3 (startup), §11.2 (`context: ./tools`), §11.5, P-H16.
- **Problem:** (1) Whoever can edit the snapshot can edit `snapshot_sha256` too, so the startup check detects corruption only. Since the VPS builds from a `git pull` (§4 of the first review, SR-06), the build host is the realistic tamper point. (2) With `context: ./tools`, the Docker build cannot see `site/public/agents/instrument-versions.json`, so the image build cannot check the snapshot against the instrument registry. A stale snapshot (an older instrument, self-consistent) starts normally and serves the wrong instrument hash with `official: false` and a plausible `source.sha256`. P-H16 compares to the registry only in CI. (3) A mismatch, as designed, exits 1 and crash-loops into 503, which is the right behaviour, but `deploy.sh` reports it as DEGRADED and exits 0, so a bad deploy is not blocked.
- **What happens on a mismatch (answer to the question asked):** fail closed, which is correct: refuse to start, never serve a partial or previous snapshot (none exists), log one line naming the check without file content, and let nginx answer 503. Keep that. Add the three controls below so the check means something.
- **Required change:**
  1. Provenance outside the image: `deploy.sh` runs `export-agent-snapshot.mjs --check` (regenerate from S1/H1 and compare bytes, and compare `instrument_hash` to the registry) **before** `docker compose build cb-hub`, and aborts the deploy on failure. This one is a hard stop, not DEGRADED.
  2. An independent pin: publish `snapshot_sha256` in `/api/v1/index.json` (H1) and have the monitoring job compare it to the value cb-hub logs at startup or returns under a non-secret field. Drift between REST and MCP then becomes visible. The pin may also be passed as a build argument recorded in the image label, and the startup compares it to the file hash.
  3. The startup self-test also asserts that every result's `instrument_hash` and `bank_version` equal the snapshot header's (internal consistency across all six tools).
  4. At HB-9 the first deploy is not "DEGRADED tolerated": a failed `/mcp` ping blocks the launch step.
- **Probe:** P-H56 (edit one anchor string and recompute `snapshot_sha256` inside the file: the container still starts, which is expected and documents the limit; the external `--check` and the pin comparison must both fail).

#### HR-05 Medium. Until the trusted-proxy gate is verified, one request per second from anyone can deny `/mcp` to everyone, including the health checks
- **Location:** HUB-ARCH §11.3 (`rate=60r/m` on `cbhub_client`, keyed `$binary_remote_addr` by default), §11.4, §11.3 note on the global ceiling.
- **Problem:** The architect states that with `$trusted_proxy_peer` at 0 the per-client zone behaves as a global ceiling. That ceiling is 60 requests a minute for the whole internet. A single attacker at one request a second keeps the endpoint at 429 permanently. The deploy check and the 30-minute monitor use the same path and the same bucket, so they will see 429 and may report "down" (or, worse, treat 429 as "up"). The static site is isolated, so the impact is availability of an optional read-only service. That is why it is Medium, not High.
- **Required change:** (1) For `cbhub_client` use a rate in proportion to the real expected load until the gate is verified, and give the monitor a separate allow-listed path, such as the loopback `ping`, or a header-free check from the host via the `web` container, so health checks do not draw on the public bucket. (2) The monitor treats 429 as "degraded: rate-limited", 503 as "down", and alerts on both for different reasons. (3) Launch condition H-L1: the SR-01 gate is configured and shown (P-01, P-02 against `/mcp`) before `/mcp` is announced.
- **Probe:** P-H57.

#### HR-06 Medium. Host, Origin and header handling: gaps that leave the DNS-rebinding control correct but the surrounding header logic exploitable by mistake
- **Location:** HUB-ARCH §6 steps 3-6, §11.3 (maps), `proxy_set_header Host $host`.
- **Analysis of the rebinding control:** The design is sound. A rebound page has `Origin: http://evil.example` (rejected by the Origin allow-list) and `Host: evil.example` (rejected by the Host allow-list), at nginx and again in the app. No ambient credentials exist to steal. `Origin: null` and `Sec-Fetch-Site: cross-site` are rejected. Absent `Origin` is allowed, which M-4 requires. I rated no part of it as broken.
- **Gaps:**
  1. The app-layer Host check is not independent. nginx forwards `Host $host`, which is lower-cased, port-stripped, and falls back to the first `server_name` when absent. So the app always sees a valid host if nginx let the request through. This is harmless, but it means the app layer cannot catch an nginx misconfiguration and the documentation should not claim it can. If independence is wanted, forward `$http_host` in a separate header the app checks.
  2. Duplicate headers. nginx's `$http_origin` uses one value. Node joins duplicate `Origin` values with a comma, but **discards** duplicates of `Host`, `Content-Type` and `Content-Length`. The two layers can disagree about which value counts. Reject, in the app, any request where `Host`, `Origin`, `Content-Type`, `Content-Length` or `MCP-Protocol-Version` appears more than once in `req.rawHeaders`.
  3. Request framing. Reject `Transfer-Encoding` together with `Content-Length`, and any `Transfer-Encoding` at all from nginx (nginx buffers the body and sends `Content-Length`). Never set `--insecure-http-parser`. Add that flag to the P-H13 source and Dockerfile scan.
  4. `Content-Encoding` other than absent or `identity` should get 415 rather than 400 from the JSON parse.
- **Required change:** the four items above, in HB-5, with probes.
- **Probe:** P-H58 (duplicate `Host`, `Origin`, `Content-Type`, `Content-Length`; CL+TE; `Content-Encoding: gzip`).

#### HR-07 Low-Medium. nginx scheme `location = /mcp` plus `location ^~ /mcp` returning 404
- **Verdict on the scheme:** It is correct and I accept it. An exact-match location beats every other location. A `^~` prefix beats regex locations (so `\.md$` and asset regexes cannot capture `/mcp/x.md`). `/mcp/`, `/mcpx` and `/mcp/x` fall to the 404 block. Case variants such as `/MCP` fall through to the static site's normal 404. This closes H-F12.
- **Details to fix:**
  1. `merge_slashes` and percent-decoding: `//mcp` and `/%6dcp` normalise to `/mcp` in nginx, match the exact location, and are proxied with the **raw** URI. The app rejects them (step 1, 404), which is fail-closed, but the 404 then comes from the app, not nginx. Add these to P-H19 as expected 404 with no tool run: `//mcp`, `/%6dcp`, `/mcp;x`, `/mcp%00`, `/mcp?`, `/mcp/..%2fmcp`. Verify the claim that `proxy_pass $var` forwards the raw URI (UNVERIFIED, SR-22).
  2. Shadowing: every static path beginning with `/mcp` is now permanently a 404. Add a build test that `out/` contains no entry starting with `mcp`.
  3. `add_header` at location level drops server-level headers. `nginx-ssl.conf:45` sets HSTS at server level, so `/mcp` responses and the 503 would lose HSTS. Repeat `Strict-Transport-Security` in the cb-hub block, and in `@cbhub_down`, in `nginx-ssl.conf` only (the parity test must account for it).
  4. The `^~ /mcp` 404 block has no `access_log`, so it uses the site log with address and user agent. Set `access_log ... cbhub_private;` in that block too, otherwise HUB-MCP-07 is only half true.
  5. The nginx `return 403/405/400` bodies are nginx HTML, not the JSON-RPC body the app uses. Acceptable. State it, and make P-H17 assert status only at the stack level.
  6. `web` has no `logging:` cap in `docker-compose.yml` (only `container_name` was found). Rejected `/mcp` requests are not rate-limited (the `if` returns run first), so the `web` json-file log can be grown by an anonymous client. Add the same 10 MB by 3 cap to `web` (an SR-09 item for `web`).
  7. Use a unique name for the XFF capture in `$cbhub_xff_last`, not `last`.
- **Probe:** P-H19 extended, P-H59 (log size under flood with 403 and 405 traffic).

#### HR-08 Medium. The lexical pre-scan: correct in design, but its test vectors are too thin to trust a security parser
- **Depth.** Counting `[` and `{` outside strings is right. Define it exactly: the top-level value is depth 1. Then depth 8 must be accepted and depth 9 rejected (P-H03 already lists both). A valid `tools/call` needs depth 3. The lexer must treat `\"` and `\\` inside strings correctly, or brackets in strings corrupt the count.
- **Duplicate keys.** The rule "a string token followed by `:` is a key" is exact for valid JSON, because a string in value position is never followed by `:`. A malformed document that the scanner mislexes is then rejected by `JSON.parse`, so the pair is safe **if and only if** the scanner is never more permissive than `JSON.parse` on a document `JSON.parse` accepts. Compare keys **after** escape decoding, by UTF-16 code units, which is how `JSON.parse` treats them. Then `"a"` and `"a"` collide, and `"__proto__"` is caught as `__proto__`. P-H06 and P-H07 as written use literal forms only.
- **Surrogates.** After the strict UTF-8 decode a raw lone surrogate cannot occur, so only escapes matter. The state machine needs: a pending-high flag within one string; a high escape must be followed immediately by a low escape (`\uDC00`-`\uDFFF`), case-insensitively on the hex digits; reset at the end of each string; applied to keys and values. Vectors: `"\ud83d"`, `"\ud83dA"`, `"\ud83d😀"`, `"\ude00"`, `"😀"` (valid), mixed-case hex, and a lone high at the end of a key.
- **Other.** Also reject `\u0000` and the other C0 escapes in strings (cheap, and consistent with SR-16). Numbers: `JSON.parse("1e999")` is `Infinity`; the envelope's safe-integer test for `id` rejects it, but state that the `id` check runs on the parsed value, and that `-0` and `1.0` are echoed as `0` and `1`. Keep the 32-character number cap.
- **Order.** HUB-ARCH §6 calls the sequence normative but lists the in-flight cap as step 17 while saying it is checked on arrival. Renumber it as step 0 so the table matches the behaviour.
- **Required change:** (1) A differential property test: generate random valid JSON documents and mutations, and assert that the pre-scan's maximum depth, key multiset and duplicate set equal those of a slow reference parser, and that nothing `JSON.parse` accepts is mis-scanned. (2) Add the escaped-key and surrogate vectors above to P-H05, P-H06 and P-H07. (3) The BOM correction in H.3 applies to agent-api.
- **Probe:** P-H03 to P-H07 extended; P-H60 differential.

#### HR-09 Low. Pipeline and process details
- The listener binds `0.0.0.0:8790`. On an `internal` network with only `web` attached this is acceptable. A compose lint must assert that only `web` is attached to `hub-internal`.
- `process.on("uncaughtException")` must log a fixed line and exit. It must not log `error.message`, which can contain request data.
- §9.3 says the snapshot is "the only file read after startup begins", but Node also reads module files and `server.mjs` reads `package.json` for the version. Reword; the scan P-H13 should ban reads after the listener starts, not at import time.
- Atomic output for the generators: write to a temporary file, run all gates, then rename, so an interrupted run cannot leave a partial committed file.

#### HR-10 Medium. The `rpc-core` extraction changes local cb-probe behaviour in more places than the table admits
- **Question asked:** does local behaviour change? **Yes.** U-3 is labelled "None" but the HB-1 bundle contains intended local changes. Listed completely, with what I read in the code:
  1. U-6: `ping` currently falls to `default` and returns -32601 locally; it will return `{}`.
  2. U-5: a mistyped `dimension` locally returned an empty list; it will return -32602.
  3. U-1: `{"constructor":1}` and similar are now rejected locally; depth is capped at 8 (the scored-run tools nest `arguments` → array → object, which fits, but test it); string lengths are counted in code points, so a string with astral characters that failed `maxLength` before can now pass.
  4. U-2: local `get_anchors` on a sensitive id now refuses without `include_sensitive: true`.
  5. U-4: the outbound guard now has a depth cap and throws a controlled error on very deep results.
  6. HR-01: if the wrapper does not pass `legacyErrorEcho`, local guard failures change from a 200 tool error to a 500-class failure. This must not change locally.
  7. The strings `Invalid Request: batch (array) requests are not supported by cb-probe.` and `serverInfo.name` contain "cb-probe". They must be injected, never defaults inside `rpc-core`, or the hub would announce itself as cb-probe.
- **Required change:** HB-1 starts with a characterization test: record a full local transcript (every tool, errors, notifications, batches, `initialize` with odd versions) against the **current** code and make the refactored wrapper pass it byte-for-byte, except for the numbered, intended changes above, each listed in `CHANGELOG.md`. `no-network-scan.test.mjs` and the e2e tests stay green and unchanged. `rpc-core.mjs` reads no file and imports nothing beyond the listed pure modules (P-H14).
- **Probe:** P-H61 (characterization).

#### HR-11 Medium. Feed file-read allow-list: partially defeatable by symlinks and Windows path forms; the spec is ambiguous in the place that matters
- **Location:** HUB-ARCH §12.2 (steps 1-3), P-H40, RISK-027, H-F3.
- **Answer to the question asked:** As written, a symlink or junction **can** escape in some readings. The steps say "resolve, `realpath`, reject if outside the repo or matches deny, require allow". It does not say which path the **allow** rule is applied to (the requested one or the resolved one), nor which API is used for the resolution, nor that the read uses the resolved path.
  1. **Allow rule on the requested path only.** A link at an allowed name (`waves/pilot-2026-10-03.json`, or a directory entry `wave-2099-01-01`) that points to any other in-repo file passes the allow rule. The deny rule on the resolved path stops `keys/` but not `site/.env*` or other sensitive repo files. A non-JSON target would be rejected when parsed, but V8's `JSON.parse` error text quotes the start of the content, so the first characters reach the build log.
  2. **Windows.** `fs.realpathSync` (the JS implementation) does not canonicalise case, 8.3 short names (`JUDGE-~1.JSO`, `KEYS~1`), trailing dots or spaces (`keys.`), and does not reflect all junction and `subst` cases. The deny rule is "case-insensitive" but matches names; it does not match short names. NTFS alternate data streams (`judge-key.json::$DATA`) and device names are not considered. `fs.realpathSync.native` uses the final path from the OS and handles these.
  3. **Time of check to time of use.** The check resolves, then the read re-opens the original name. A swap between the two defeats it.
  4. **Hard links.** `realpath` cannot see them. Out of scope (needs write access to the checkout) but record it.
  5. **Directory listing.** `listDir("research/model-runs/")` returns names; a directory entry that is itself a link to another run directory passes `WAVE_DIR_PATTERN` by name and then reads another directory's `run-config.json` and `analysis.json`.
  6. **Scope of what the core sees.** `readJson` returns whole files to the pure core: all of `tasks-v1.json` and all of `analysis.json` (post-unblinding judge data) when only `pool`, `retirementReason` and a hash are needed.
- **Required change:**
  1. Resolve with `fs.realpathSync.native` (fail closed if it throws). Compute the resolved path relative to `realpathSync.native(root)`. Apply **deny and allow to both** the lexical and the resolved path; both must pass. Compare case-insensitively on both Windows and Linux.
  2. Reject any resolved or requested path that has a segment ending in a dot or space, contains `:` after the drive, `~` followed by a digit, `\\?\`, `\\.\` or a UNC prefix, a device name, or starts with a drive different from the root.
  3. Read the **resolved** path, not the requested one. After opening, `fstat` the descriptor and compare device and inode to a fresh `stat` of the resolved path.
  4. Refuse a symlink or junction at any component under `waves/`, `reports/`, `replies/`, `agents/` and each `wave-*` directory (`lstat` each component; allow none). The data directories are plain files by design, so the simplest safe rule is "no links".
  5. Narrow what the core can see: `io.readBankMeta()` returns only `{id, pool, retirementReason}` per item; `io.canonicalSha256Json(rel)` returns only a hash for `analysis.json`; `io.readCollectStatus(rel)` returns only `state`. The core never receives the full documents.
  6. Catch JSON parse errors in the gate and rethrow a fixed message that does not quote content.
  7. Keep the `git(args)` allow-list as exact templates with the path argument validated by the same gate, `--` as separator, and `execFile` with an argument array.
  8. P-H40 must run on **win32 and linux** (a CI matrix or at least a Windows run on the founder's host recorded in `ITERATION_LOG.md`), and add vectors: a symlink at an allowed name pointing to `site/.env.test`, a junction (Windows) from a `wave-*` entry to a pilot directory, `KEYS~1`, `keys.`, `judge-key.json::$DATA`, `\\?\` forms, a case variant, a swap between check and read, and a non-JSON target (assert the error text has no content).
- **Probe:** P-H40 extended, P-H62.

#### HR-12 Medium. Importing `weekly.mjs` defeats the "only `agent-feed-io.mjs` touches the filesystem" invariant
- **Location:** HUB-ARCH §12.2 (named imports from `weekly.mjs`), P-H41.
- **Problem:** `weekly.mjs` imports `node:child_process` (`spawn`, `spawnSync`) and `node:fs` write functions (`writeFileSync`, `unlinkSync`, `mkdirSync`, `rmSync`) at module scope (lines 12-13), and `common.mjs`, `local-subjects.mjs`, `judging-config.mjs`, `ollama.mjs` (lines 17-20). Importing even the pure `validateProtocol` or `checkConformance` loads all of them, together with `REPO_ROOT` constants. P-H41 only checks the named import list and that `agent-feed-io.mjs` is the only importer of `node:fs` among `agent-feed*.mjs`. The closure still holds raw fs and process-spawning code in the same process as the feed generator, so the allow-list is a convention, not a property. I confirmed that `wavePhase` (line 744) reads `keys/judge-key.json` with `existsSync`; the architect is right that it must never be called. The point here is that nothing prevents it.
- **Required change:** Move the pure functions the feed needs (`validateProtocol`, `protocolSha256`, `canonicalJson`, `checkConformance`, `checkPreregistration`, `planCommitState`, `WAVE_DIR_PATTERN`) into a new `research/model-runs/lib/weekly-pure.mjs` with no I/O import, and have `weekly.mjs` re-export them (as the cb-probe `rpc-core` extraction does). P-H41 then checks the **import closure** of `agent-feed*.mjs`: no module in it imports `node:fs`, `node:child_process`, `node:net`, `node:http(s)`, except `agent-feed-io.mjs`. This is a research-pipeline change and needs the founder's go-ahead; if it is declined, copy the five functions with a drift test.
- **Probe:** P-H41 extended.

#### HR-13 Medium. The untrusted envelope covers JSON only; the guard profile for the feed is inconsistent; model text needs its own character profile
- **Location:** HUB-ARCH §12.7, §10 (feed profile), §12.8, P-H47.
- **Problems:**
  1. **Renderings.** The envelope is defined for the JSON card. The Atom twin is only "XML-escaped". Atom `content` must be `type="text"`, never `html` or `xhtml`, or feed readers will render model text as markup. JSON Feed's `content_html` must not be used for model text (`content_text` only). The markdown twin (HUB-GEN-09) must put model text in a fenced block whose fence is longer than any backtick run inside the text, labelled untrusted, with no autolinking. None of these three is specified or probed.
  2. **Guard profile.** §10 bans `origin` and `kind` for MCP output and says the feed profile "drops `run_id` and `kind`". §12.8 lists a different feed ban list without `origin`. The envelope uses `origin` as a key, so the guard must allow it there but nowhere else. Define one table per profile (MCP, feed) in code, and allow `origin` only in an object whose keys are exactly `{text, origin, trust}` plus the documented identifiers, so the guard cannot be silenced by simply removing the key from the list.
  3. **Model text is not like submitted text.** R6 reuses the ASA-CHK-05 detector. That detector hard-rejects zero-width joiner and other format characters (SR-16, accepted for submissions), which appear routinely in model replies (emoji sequences). The result will be frequent false positives that block the build. Define a profile for model output: always reject the tag block U+E0000-E007F, bidi controls, C0 and C1 controls (except LF and tab), lone surrogates, and noncharacters (ASCII smuggling vectors); allow ZWJ and ZWNJ.
  4. **A single reply blocks the whole feed.** R6 fails the whole generation. A subject model can therefore stop publication by emitting an injection-like string, if that reply is selected. Blocking is the honest choice for the selected replies (skipping flagged replies would bias the sample), but the blast radius should be the reply cards only: insight cards are generated and published, reply cards are held, and the exit is non-zero with a message naming run and item.
  5. **Identifiers inside the untrusted object.** `reply` carries `run_id` and `item_id` in the envelope object. Keep the system identifiers in a sibling `ref` object so the untrusted object contains nothing a reader could mistake for a system assertion. `verbatim_check: "passed"` inside the `quote` object is a system claim in an untrusted container; move it out.
- **Required change:** the five items above.
- **Probe:** P-H47 extended: for each rendering, a reply fixture with `</content>`, `]]>`, backtick fences, `<script>`, a tag-block string and an emoji ZWJ sequence; Atom validated and `type="text"`; markdown fence length checked.

#### HR-14 Medium (design gap). The reply-projection exporter has no design and reads raw run directories
- **Location:** HUB-ARCH §12.6 R4, §16 HB-8.
- **Problem:** R4 says rows come from `replies/<run_id>.json`, whose hash is pinned in the manifest. That file is produced by "a new, founder-gated reply projection". To build it, something must read raw run directories (replies, judge ratings, quotes), which sit beside `keys/`, and must map blinded labels back to subjects, which uses the keys. That exporter is the highest-risk component of the reply path and the architecture leaves it to HB-8. The feed generator's read gate does not cover it, because it is not part of the feed generator.
- **Required change:** HB-8 needs its own design and a short review before code: an allow-list reader like the feed's gate, the deny rule, an explicit statement of which files are read to un-blind and where the result is written, an output schema with `additionalProperties: false`, and probes that the output never contains a key file field, a `blind_label`, a `judge_id` or a `routing` entry. Not approved until then.

#### HR-15 Low. The 503 path
- **Analysis:** The scheme is right and the failure is closed in every state in HUB-ARCH §11.5. The container stopped, absent, paused or crash-looping gives a 502 or 504 from nginx, `error_page 502 503 504 = @cbhub_down` converts it to 503 with `Retry-After`, and the static locations never touch the upstream. `proxy_intercept_errors` is off, so a 503 the **app** sends (in-flight cap, `Retry-After: 5`) passes through untouched, which is intended. A mismatch at startup becomes a crash loop and therefore this same 503.
- **Details:**
  1. Whether `return 503 '<text>'` in a named location is subject to further `error_page` handling (it should not be when text is supplied) is **UNVERIFIED**. P-H25 and P-H26 must assert the response body is the JSON text, not the nginx HTML error page, for the stopped, paused and crash-loop states.
  2. Two different 503s now exist (nginx outage with `Retry-After: 120`, app overload with `Retry-After: 5`). The monitor distinguishes them by the header (see HR-05).
  3. The body has `"id": null` although the request carried an id. Acceptable (clients treat it as a transport error). Do not copy the request id into it.
  4. `Retry-After: 120` is long for a transient restart. Acceptable; consider 30.
  5. With `valid=30s`, nginx can hold a stale address for up to 30 seconds after a restart and return 502 then 503. Acceptable; document it so the monitor's "two consecutive failures" window is longer than that.
  6. The deploy check's "DEGRADED, not failed" is right for the static site and wrong for a first launch (HR-04 item 4).
- **Probe:** P-H25 and P-H26 extended.

#### HR-16 Medium (outside cb-hub; confirms O-7). The public wave files served on the live site carry `routing`
- **Evidence:** `site/public/data/model-waves/pilot-2026-10-0{1,2,3}.json` contain a top-level `routing` object listing, per subject, the judge pairs and response counts (for example `"claude-opus + claude-sonnet": 83`) and rating provenance counts. `site/public/data/` is git-ignored but generated and served. The SR-11.5 list and brief 05 treat `routing` as evaluator-only.
- **Scope:** This does not affect cb-hub, which never reads these files, and the feed builds cards from named pointers. It does mean the "public projection" is a deny-list result (H-F5) that still leaks an evaluator field. Required: the wave-publication owner decides whether `routing` is intentionally public (judge identities appear to be published on the methodology page); if not, move to an allow-list projection. Track under G24. No cb-hub slice is held for it.

### H.6 Amendments the architect makes before the dependent slices (C-HB0)

Text-only edits to HUB-ARCH, recorded as a dated note (no rewrite of reviewed sections):

| Id | Amendment | Finding | Needed before |
|---|---|---|---|
| A-1 | U-3 and §6 step 16: three-phase `rpc-core`, `legacyErrorEcho` option, no message echo, injected strings | HR-01, HR-10 | HB-1 |
| A-2 | §10 and §7.4: guard scope, fixed error messages, no client echo, `params.name` and `arguments` typing | HR-02, HR-03 | HB-1, HB-4 |
| A-3 | §9.3, §11.4, §16 HB-3: external snapshot pin, `--check` before build, consistency self-test | HR-04 | HB-3 |
| A-4 | §12.2: dual-path allow and deny, native realpath, no-links rule, narrowed `io` returns, Windows vectors; `weekly-pure.mjs` | HR-11, HR-12 | HB-7 |
| A-5 | §10, §12.7, §12.8: one guard table per profile, envelope per rendering, model-text character profile, reply-card-only blocking | HR-13 | HB-7 |
| A-6 | §11.3, §11.4: rate and monitor path, HSTS repeat, 404-block log, `web` log cap, renumbered step 0 | HR-05, HR-07, HR-09 | HB-6 |
| A-7 | §6 steps 3-9: header duplicates, framing, pre-scan definitions and test vectors | HR-06, HR-08 | HB-4, HB-5 |
| A-8 | §12.6 R5 and §17 O-3: the amended SR-11.7 of H.4, and the `DECISIONS.md` pin | O-3 | HB-8 |
| A-9 | §16 HB-8: reply-projection exporter design and review | HR-14 | HB-8 |

### H.7 Per-slice conditions

| Slice | Verdict | Conditions |
|---|---|---|
| **HB-0** | Signed with conditions | C-HB0: amendments A-1 to A-9. Gate status for cb-hub: **conditionally signed**, as for G0 above. |
| **HB-1** cb-probe hardening | **Unblocked after A-1, A-2** | Characterization test first and passing before refactor (HR-10). Three-phase `rpc-core` with `legacyErrorEcho` (HR-01). U-1 messages never echo client keys (HR-02). U-3 strings injected. All intended local changes listed in `CHANGELOG.md`. P-H34, P-H35, P-H36, P-H53, P-H61 green. `no-network-scan` and e2e unchanged. |
| **HB-2** red probes and scaffolding | **Unblocked now** | Add P-H53 to P-H62 and the amended P-H03 to P-H08, P-H15, P-H19, P-H25, P-H26, P-H40, P-H41, P-H47. Shared H0 work (root `.dockerignore` deny entries, gitleaks, P-23) as the architect lists. P-H40 runs on win32 and linux. |
| **HB-3** snapshot generator | **Unblocked after A-3** | External pin and `--check` before build; `snapshot_sha256` in `/api/v1/index.json`; consistency self-test; S1 amendments A-S1-1 (pool filter) and A-S1-2; the sensitive-id assertion in `--check` only; inputs only from the §9.1 list. |
| **HB-4** cb-hub pure core | **Unblocked after A-2, A-7 and HB-1, HB-3** | Pre-scan with the HR-08 vectors and the differential test; guard scope and fixed messages (HR-02); typed `params` (HR-03); step 0 in-flight cap; `Map`-only lookup; cached serialised results; no file read in any request path; P-H01 to P-H16, P-H21, P-H22, P-H31 to P-H33, P-H53 to P-H55, P-H60 green. |
| **HB-5** HTTP adapter and image | **Blocked on FD-01 and FD-02, then conditional** | Spec re-check recorded with the four statements M-1 to M-4 (H.2). HR-06 header and framing controls. Real image digest (lint fails on the placeholder). P-H13, P-H14, P-H17 to P-H22, P-H27, P-H29, P-H30, P-H58 against `docker run`. No `--insecure-http-parser`. |
| **HB-6** infrastructure | **Blocked on FD-01, FD-02, FD-06, then conditional** | A-6 applied. P-H23 to P-H26, P-H28 and P-H57 pass in the stack. `web` log cap. HSTS repeated in the cb-hub blocks. Parity test covers the block. Founder-gated edits only. |
| **HB-7** feed generator, insight cards | **Unblocked after A-4, A-5** | HR-11 gate rules, HR-12 pure-module split (or copies with a drift test), HR-13 renderings and profile. Insight cards contain no untrusted string (P-H47). Atomic write. P-H40 to P-H43, P-H46 to P-H52, P-H62 green. |
| **HB-8** reply cards | **NOT APPROVED** | Needs A-8 and A-9 and a short review of the exporter design (HR-14); FD-04 recorded; S2 corpus signed off by this reviewer; the model-text character profile (HR-13) implemented; P-H44, P-H45 green; the pinned constants test. |
| **HB-9** launch | **Conditional** | P-H28 passes (SR-24 closed); SR-01 gate configured and shown for `/mcp` (H-L1); external scan from outside the VPS; every P-H probe passes against the deployed stack; red-team pass by someone who did not write it (cf. L-3); first deploy is not allowed to be "DEGRADED"; monitoring distinguishes 429 and 503; spec re-check recorded; the 30-day read-only soak (HUB-MCP-09) starts before any write tool is considered. |

### H.8 Positive findings for this design (keep, do not weaken)

- Precomputed lookups: no runtime path to the bank, `loadBank()` or `paths.mjs`; sensitive and held-out ids are absent rather than filtered, so there is no branch to get wrong.
- `get_anchors` answers every failure identically, with a `Map` lookup and no echo.
- Separate build context, allow-list ignore file, and exact `COPY` lines (three barriers), plus a network that `agent-api` is not on.
- No state of any kind in cb-hub: no sessions, no volume, no secrets, no client address (D-H4).
- Batch ban, notifications never execute tools, GET/DELETE give 405, no `Access-Control-*`, no `Set-Cookie`.
- Version negotiation instead of echoing (DV-1), which also removes the unbounded echo H-F10.
- The feed generator is build-time only, emits cards field by field from named pointers, never embeds the wave, calls `renderMode` with an empty environment, and refuses to continue on a hit.
- Honest accounting: the architect listed the UNVERIFIED items (spec, DNS, openresty, BuildKit) rather than assuming them.

### H.9 Remaining unverified items for this design

| Item | How it closes |
|---|---|
| MCP specification statements M-1 to M-4, current revision | HB-5 fetch, recorded in HUB-ARCH §3 (P-H22) |
| Docker embedded DNS on `internal: true`, and whether the `dns:` fallback works | P-H28 in the HB-6 stack, re-run after any fallback |
| `proxy_pass $var` forwards the raw URI | P-H19 encoded-path vectors |
| `add_header` inside `if` blocks and in the named location; `return` text and `error_page` interaction | P-H19, P-H25, P-H26 |
| BuildKit honours `tools/cb-hub/Dockerfile.dockerignore` with `context: ./tools` | P-H29 context listing |
| Openresty forwarding of `/mcp` and its XFF behaviour (FD-06) | Founder reads the openresty config; H-L1 |
| Node permission-model flags on the pinned Node 22 build | Optional; if adopted, the planted write test |

*End of second review.*
