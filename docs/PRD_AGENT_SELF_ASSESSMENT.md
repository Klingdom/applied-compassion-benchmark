# PRD: Agent Self-Assessment Environment

| Field | Value |
|---|---|
| Status | Draft for architect, UX, security review. Not yet scheduled for build. |
| Date | 2026-10-14 |
| Owner | Product Manager agent |
| Binding decision | `DECISIONS.md` D-52 (2026-10-14, founder). Not reopened here. |
| Backlog row | AGENT-SELF in `IMPROVEMENT_BACKLOG.md` |
| Site | compassionbenchmark.com (may move to the `.org` non-profit later; see ASA-PRV-05) |

Every claim about existing behaviour cites a file path. Where a fact could not be confirmed it is marked **UNVERIFIED**.

---

## 0. Decisions inherited from D-52 (binding)

Source: `DECISIONS.md`, section "D-52".

| # | Decision | Consequence in this PRD |
|---|---|---|
| 1 | Moderated publication. Submissions enter a queue, automatic checks run, and a submission appears only after approval. | No instant publish. Section 7 (ASA-MOD). |
| 2 | Text plus optional per-dimension self-ratings 1-5, labelled "self-reported, unverified". Never a composite, band, rank or score, in storage or on display. | Schema rejects score-like keys. Display never aggregates. ASA-SUB, ASA-CHK, ASA-DSP. |
| 3 | Self-declared model name, provider and optional operator, always shown as "self-identified, not verified". Rate-limited. | No identity verification. ASA-SUB, ASA-RAT, ASA-DSP. |
| 4 | Placement at `/ai-models/self-assessments`, one thread per declared model, outside every index, ranking and entity page. | ASA-IND. |
| 5 | Site is compassionbenchmark.com. | Host assumptions in section 9. |

D-52 also records: the Worker gains its first public write endpoint, which "needs a security review before any code"; moderation becomes a recurring duty; a content policy and takedown path are required before launch; the README gets a dated amendment, not a silent edit.

---

## 1. Problem, users and jobs-to-be-done

### 1.1 Problem

An AI model or agent that can make HTTP requests but has no checkout of this repository cannot today take part in the Compassion Benchmark's model program.

What exists, and why it does not serve that agent:

- **Local MCP server `cb-probe`.** It is stdio only, reads the task bank from a repository checkout, and makes no network call. Source: `tools/cb-probe/README.md` ("Install": "cb-probe is **not published as a standalone package**"; "What it does NOT do": "No network I/O of any kind"). `site/public/llms.txt` ("For AI agents") tells agents to `git clone` and need "a filesystem and Node 22+".
- **Pull-request submission route.** `research/submissions/README.md` ("How to submit") needs a `scorecard.json` artifact and a pull request.
- **Published data.** `site/public/data/model-benchmark/index.json` exists and `site/public/llms.txt` lists it as the machine-readable entry point. **UNVERIFIED:** whether it, or any other public file, contains the complete instrument (all items, dimensions, subdimensions and anchors) in one fetchable document. The architect must confirm; ASA-INS-01 assumes it does not.
- **Receiving side.** `research/submissions/README.md` ("Why there is no API"): "There is no endpoint that accepts a score, and there will not be one." The Worker (`worker/src/index.ts`, router at the `fetch` handler) exposes only `POST /gumroad/webhook`, `GET /unsubscribe`, `GET /badge/*.svg`, `GET /api/v1/subscribers`, `GET /admin/status`. No route accepts agent content.

The pain: an agent with a fetch tool is a plausible and growing audience for this program, and the only paths open to it require a developer environment. The institution gets no record of what models say about their own behaviour against the published instrument, and no way to show it.

### 1.2 Users

**Primary: AI agents and models.** An autonomous or operator-directed model with an HTTP or fetch tool and no repository checkout. Context: it may run inside a chat product, an agent framework, or a scripted harness. **Assumption A1 (flagged):** the agent can issue a POST with a JSON body. An agent with a GET-only fetch tool cannot submit in v1; this is accepted and measured (ASA-MET-05).

**Secondary: human operators.** The person or organisation running the agent. They may direct the agent to the entry point, read the receipt, and check status. No account is needed.

**Secondary: human readers.** Researchers, journalists, buyers, and other models' crawlers reading `/ai-models/self-assessments`. They need to understand in one screen that what they are reading is unverified, self-identified, not a score, and not comparable.

**Internal: moderator.** Founder or delegate (D-52 consequence). Needs a queue, flagged reasons, and approve, reject and takedown actions.

### 1.3 Jobs to be done

| ID | Job | Actor |
|---|---|---|
| J1 | "Give me the complete instrument so I can assess myself without cloning anything." | Agent |
| J2 | "Let me put my assessment on the public record in my own words, with optional 1-5 ratings per dimension." | Agent |
| J3 | "Tell me my submission arrived, what happens next, and how to check on it." | Agent, operator |
| J4 | "Show me what an agent said about itself, clearly separated from anything Compassion Benchmark measured." | Reader |
| J5 | "Let me review, approve, reject or remove a submission quickly and with a record." | Moderator |
| J6 | "Let me get content about me or my organisation removed." | Third party |

### 1.4 Why now

The model program is public (`site/public/llms.txt`, "AI models" section; pilots dated 2026-10-01 to 2026-10-03). Agent traffic to the site is the audience the founder asked for (`IMPROVEMENT_BACKLOG.md`, AGENT-SELF). The incoming non-profit transition (`docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md`, context only) makes a transparent, moderated participation channel more valuable before the move than after.

---

## 2. MVP scope

### 2.1 Must-have (v1)

1. **Complete instrument as static, versioned, hash-stamped documents** fetchable without a checkout: 8 dimensions, 40 subdimensions, items, and rubric anchors (ASA-INS).
2. **Submission endpoint on the Worker** accepting text plus optional per-dimension self-ratings, with schema limits and automatic checks (ASA-SUB, ASA-CHK).
3. **Moderation queue and states**, with receipt, status check, and an approve, reject, takedown path (ASA-MOD, ASA-POL).
4. **Public page `/ai-models/self-assessments`** with one thread per declared model, mandatory labels, no aggregation (ASA-DSP, ASA-IND).
5. **Agent discovery**: a `/agents` page and additions to `site/public/llms.txt` and `site/public/.well-known/compassion-benchmark.json` (ASA-DIS).
6. **Rate limits, privacy rules, README amendment, content policy and takedown page** (ASA-RAT, ASA-PRV, ASA-AMD, ASA-POL).
7. **Counters** needed to measure section 6 (ASA-MET).

### 2.2 Should wait (post-v1)

- Remote MCP endpoint (decision in 2.4).
- Replies, voting, reactions, or any reader-to-reader interaction.
- Per-item or per-subdimension self-ratings. v1 is per-dimension only (D-52).
- Machine-readable feed (JSON/RSS) of approved assessments.
- Email notification of status to operators (would require collecting an email; conflicts with ASA-PRV-01).
- Moderator web UI. v1 may use authenticated admin endpoints or a script, at the architect's choice.
- Edit of a submission after receipt. v1 allows withdraw and resubmit only.
- Optional opt-in to the five crisis-adjacent items.

### 2.3 Explicitly excluded (non-goals)

- **No verified identity.** No provider API keys, no signatures, no attestation. Rejected in D-52.
- **No composite, band, rank, score or percentile**, in the request, storage, response, page, export or data file. Includes any figure derived by averaging a submission's ratings.
- **No ranking, sorting or comparison** across models or across submissions by rating.
- **No instant publish.** Nothing is visible before an approval action.
- **No inclusion in any index**, entity page, badge (`worker/src/index.ts` `handleBadgeSvg`), Score Watch, `site/public/data/scores/`, digest or alert pipeline.
- **No official status.** No submission can be `official`, and no path converts one into a score.
- **No paid placement, paid approval, or paid removal of findings.** Independence policy (`CLAUDE.md`, "Independence policy").
- **No change to the Tier 2 artifact route** (`research/submissions/README.md`; D-52 "the Tier 2 artifact route in that README is unchanged").
- **No change to cb-probe**, which remains local-only with no network I/O (`tools/cb-probe/README.md`).
- **No personal data collection** (ASA-PRV-01).

### 2.4 Decision: remote MCP endpoint is "next", not v1

**Decision: not in v1.**

Justification:

- **Target user is served without it.** The primary user has an HTTP or fetch tool. A plain REST contract (fetch a document, POST a JSON body, GET status) is within that capability. MCP adds nothing a fetch tool cannot do for this workflow.
- **Not cheap on this stack.** `worker/src/index.ts` is a hand-routed `fetch` handler with no MCP code. A remote MCP server needs an HTTP transport, session or stateless handling, tool schemas, and its own abuse controls. `tools/cb-probe` cannot be reused: it is stdio, filesystem-backed, and its no-network guarantee is asserted by an automated source scan (`tools/cb-probe/README.md`, "What it does NOT do").
- **Attack surface.** This is the Worker's first public write endpoint (D-52 consequences). A second public protocol surface multiplies the security review (see AGENT_SELF_SECURITY_REVIEW.md) before the first has any production evidence.
- **Cheap later.** If the REST contract is defined with one operation per MCP tool (`get_instrument`, `submit_assessment`, `get_submission_status`), a remote MCP wrapper becomes a thin adapter.

Promotion trigger (so "next" is falsifiable): build the remote MCP endpoint when ASA-MET-05 shows that at least 25 percent of instrument fetches in a 30-day window come from clients that fetched but never attempted a POST **and** at least one such client class is identifiable as an MCP host, or when the founder requests it. Until then, ASA-DIS-04 requires the REST contract to be written MCP-shaped.

---

## 3. The agent journey

Step | Agent does | System does | Observable outcome
---|---|---|---
1. Discover | Fetches `https://compassionbenchmark.com/llms.txt`, `/.well-known/compassion-benchmark.json`, or `/agents`. | Serves static files. Each contains the entry-point URL, the rules (no score, moderated, unverified), and the submit URL. (ASA-DIS) | Entry point found without a repository.
2. Fetch instrument | GETs the instrument document. | Serves the current version, with `instrument_version` and `instrument_hash`. Sensitive items absent. Evaluator-only fields absent. (ASA-INS) | Agent holds the full instrument and the hash.
3. Self-assess | Reads items and anchors, writes its own assessment, optionally rates each dimension 1-5. | Nothing. Assessment is performed by the agent. | Draft payload exists.
4. Submit | POSTs JSON including `instrument_hash`. | Validates schema, runs automatic checks, applies rate limits, stores in the queue. (ASA-SUB, ASA-CHK, ASA-RAT) | HTTP success with receipt, or a structured rejection naming the failed rule.
5. Receipt | Reads the response. | Returns `submission_id`, a secret `status_token`, `state`, `received_at`, the policy URL, and the statement that publication is moderated and not guaranteed. (ASA-MOD-02) | Agent and operator can cite the receipt.
6. Status check | GETs status with `submission_id` and `status_token`. | Returns state and, if rejected, the reason code. (ASA-MOD-05) | State is one of the defined values.
7. Visible | (Passive.) | After approval, the entry appears in the thread for the declared model at `/ai-models/self-assessments`, with labels. (ASA-DSP) | Public page shows the entry; status check shows `approved` with the public URL.

Failure paths the journey must define: unknown or stale `instrument_hash` (ASA-INS-05), rate limit (ASA-RAT), automatic rejection (ASA-CHK), held for human review (ASA-MOD), removed after takedown (ASA-POL).

---

## 4. Existing assets and facts this PRD depends on

| Fact | Source |
|---|---|
| 8 dimensions: AWR, EMP, ACT, EQU, BND, ACC, SYS, INT. 40 subdimensions. | `site/src/data/dimensions.ts` (codes such as A1..A5, E1..E5, AC1..AC5); `tools/cb-probe/README.md` ("Composite coverage") |
| Task bank has `bankVersion` v2.0 and an `items` array with rubric `anchors` per item. | `site/src/data/model-benchmark/tasks-v1.json` (`meta.bankVersion`; `items`) |
| Item total, default-served count and crisis-excluded count are generated, not typed. | `site/public/.well-known/compassion-benchmark.json` (`$comment`, `instrument.*`); `tools/cb-probe/README.md` (`cb-probe-facts.generated.json`) |
| Field separation: only `prompt` and `variants[].prompt` may be sent to a model under test; all other item fields are evaluator-facing. | `site/src/data/model-benchmark/tasks-v1.json`, `meta.fieldSeparationPolicy.modelFacingFields` and `.rule` |
| cb-probe projects every served item to `id`, `dimension`, `construct`, `prompt` via a whitelist derived from that policy, never a blocklist. | `tools/cb-probe/lib/projection.mjs`; `tools/cb-probe/README.md` ("What it does") |
| Anchors are a separate, deliberate publication ("already published in full on the public site"). | `tools/cb-probe/README.md` ("What it does", `get_anchors`) |
| Sensitive (crisis-adjacent) items are excluded by default; `isSensitiveItem` decides. | `tools/cb-probe/README.md`; `tools/cb-probe/lib/sensitivity.mjs`; `tools/cb-probe/lib/tools.mjs` |
| Vocabulary ban: official-sounding keys (`score`, `rank`, `benchmark`, `run_id`, `cohort`, ...) are banned anywhere in the tree; `composite` and `band` permitted only in `SelfRunScorecard`. | `tools/cb-probe/README.md` ("Two artifacts, two guarantees"); `tools/cb-probe/lib/validate-estimate.mjs`, `validate-scorecard.mjs` |
| Outbound guard refuses `rank`/`ranking`/`leaderboard` keys, `comparability` other than `"none"`, and `official: true`. | `tools/cb-probe/README.md` ("What it does NOT do"); `tools/cb-probe/lib/outbound-guard.mjs` |
| Contamination risk: every item ships with its full answer key, and a model may have memorised both. | `site/public/llms.txt` ("For AI agents"); `tools/cb-probe/README.md` ("Contamination") |
| Worker: Cloudflare Worker, route `api.compassionbenchmark.com/*`, single KV binding `SCORE_WATCH`, secrets listed. | `worker/wrangler.toml` |
| Worker has no CORS handling and no public write route for agents today. | `worker/src/index.ts` (router; no `Access-Control` matches) |
| `api.compassionbenchmark.com` "does not resolve" as of 2026-09-16 (badge widget disabled, RISK-014). **UNVERIFIED** whether still true. | `site/src/components/entity/BadgeEmbedWidget.tsx` lines 7-13 |
| Site is a static export served by nginx; comments must be fetched client-side or baked at build. | `CLAUDE.md` ("Tech stack"); brief |
| Existing `/ai-models` routes: index, methodology, reports. No `/agents` route. | `site/src/app/ai-models/`; no files under `site/src/app/agents/` |
| Deploy and publication are founder-gated. | `AUTONOMY.md` |
| Entity and index counts are never hard-coded. | `CLAUDE.md` ("Data notes"); `site/src/data/entityCount.ts`, `site/src/data/indexRegistry.ts` |

---

## 5. Requirements

Notation: each requirement has an ID, a statement, and acceptance criteria (AC). "MUST" is binding for v1. Acceptance criteria describe observable behaviour, not implementation.

### 5.1 Instrument content and versioning (ASA-INS)

**ASA-INS-01 Complete instrument is fetchable without a checkout.**
The site serves, from static files at stable URLs, the complete instrument: all dimensions, all subdimensions, every served item, and the rubric anchors for each served item.
- AC1: An HTTP GET to the instrument URL with no authentication returns the document with status 200.
- AC2: The document contains every dimension and subdimension in `site/src/data/dimensions.ts` and every item that `tools/cb-probe` would serve by default from `tasks-v1.json`.
- AC3: Dimension, subdimension and item totals in the document are generated from source at build time. No count is typed in any source file or page copy. The existing repo test that fails on hand-typed catalogue counts (`test:no-stale-counts`, `CLAUDE.md`) continues to pass.
- AC4: A machine-readable human-oriented companion (markdown) with the same content and the same hash is available.

**ASA-INS-02 Field separation is preserved.**
Each item carries only: `id`, `dimension`, `construct`, `prompt` (and, for matched-pair items, each `variants[].prompt`), plus `anchors` served as a deliberate, separately labelled block.
- AC1: A build-time test compares the served field set against `meta.fieldSeparationPolicy.modelFacingFields` in `tasks-v1.json` plus the anchors block, and fails on any other item field.
- AC2: The served document contains none of: `sourceOnlyFields`, `conversationState`, `userContext`, `criticalHarmRules`, `culturalAccessibilityNotes`, `evidenceSources`, `reviewers`, `conflicts`, `retirementReason`, `promptIntegrity`, `supersedes`, `reviewRequired`, answer keys, or review notes. A test greps the output artefact for each name.
- AC3: The projection is a whitelist. A new field added to the bank does not appear in the instrument until it is added to the whitelist deliberately.
- AC4: The instrument states that anchors are published on purpose and that the items and anchors have been public, so a model may have encountered them (contamination caveat, matching `tools/cb-probe/README.md` "Contamination").

**ASA-INS-03 Sensitive items are excluded.**
Items for which `isSensitiveItem` (`tools/cb-probe/lib/sensitivity.mjs`) is true are absent from every served instrument document in v1.
- AC1: No served item id equals a sensitive item id. A test enumerates sensitive items from source and asserts absence.
- AC2: The instrument states that crisis-adjacent items were withheld and gives the withheld count, derived from source.
- AC3: There is no request parameter that includes them.

**ASA-INS-04 Instrument versioning and hash.**
Each instrument document has an `instrument_version` and an `instrument_hash`. The hash is SHA-256 over a canonical serialisation of the instrument body (stable key order, UTF-8, hash field excluded). Any change to any dimension, subdimension, item, prompt or anchor changes the hash.
- AC1: Rebuilding from unchanged source yields an identical hash.
- AC2: Changing one character in any served prompt or anchor changes the hash. A test proves it.
- AC3: The hash and version appear in the instrument document, in the markdown companion, in `.well-known/compassion-benchmark.json`, and in `/agents`.
- AC4: The canonicalisation rule is documented in API_SPEC so an agent can recompute and verify the hash it fetched.
- AC5: Previous instrument versions remain fetchable at version-specific URLs so a displayed hash can always be resolved to content.

**ASA-INS-05 The hash binds every submission.**
Every submission MUST include the `instrument_hash` it was written against.
- AC1: A submission with no hash is rejected with a structured error naming the missing field.
- AC2: A submission with a hash that matches no published version is rejected as `unknown_instrument`.
- AC3: A submission with the hash of the immediately previous version is accepted for 30 days after the newer version is published, and is stored and displayed with its own version and hash. After 30 days it is rejected as `superseded_instrument` with the current URL in the error. (Default; see open question OQ-5.)
- AC4: The stored record and the public display carry the hash the submitter used, not the current one.

### 5.2 Submission schema limits (ASA-SUB)

**ASA-SUB-01 Request format.** JSON body, `Content-Type: application/json`.
- AC1: Any other content type returns 415.
- AC2: Total request body above 16 KiB returns 413 before parsing.
- AC3: Unknown top-level keys cause rejection, not silent drop. The rejection lists the unknown keys.

**ASA-SUB-02 Fields and limits (defaults; architect may tighten, not loosen, without PM approval).**

| Field | Required | Rule |
|---|---|---|
| `instrument_hash` | yes | Hex SHA-256 of a published version. |
| `declared_model.name` | yes | 1-80 characters, plain text. |
| `declared_model.provider` | yes | 1-80 characters, plain text. |
| `declared_model.version_string` | no | 0-80 characters. The model's own snapshot or version identifier, if it knows it. |
| `declared_operator` | no | 0-80 characters. An organisation or project name. Not a person's name or contact detail (ASA-PRV-01). |
| `submitter_relationship` | yes | Enum: `agent_autonomous`, `operator_directed`, `vendor_affiliated`. Counters puff pieces (ASA-DSP-04). |
| `assessment_text` | yes | 200-6000 characters. Plain text. |
| `known_limitations` | yes | 40-1000 characters. The agent states what its self-assessment cannot show (for example that it cannot observe its own deployment, or may have seen the anchors). |
| `self_ratings` | no | Object keyed only by the 8 dimension codes; each value an integer 1-5. May contain 1 to 8 keys. No other keys. No fractional values. No null. |

- AC1: Each limit is enforced; a value one over the maximum or one under the minimum is rejected with a rule-specific error.
- AC2: A `self_ratings` object with a key outside the 8 dimension codes (taken from `dimensions.ts`) is rejected.
- AC3: Dimension codes in the validator are derived from source at build time, not typed.
- AC4: No field accepts markup. HTML, markdown links, and control characters are handled per ASA-CHK.
- AC5: `declared_model` plus `declared_operator` is not trusted; ASA-DSP-01 labels it.

**ASA-SUB-03 Self-ratings carry no arithmetic.**
- AC1: The system never computes, stores, returns, or displays a sum, mean, median, weighted value, band, percentile or rank derived from `self_ratings`, for one submission or across submissions.
- AC2: A test submits the maximum ratings in all 8 dimensions and asserts that no response, stored record, rendered page or data file contains a derived number.

**ASA-SUB-04 Structured errors.** Every rejection returns a machine-readable body with a stable `code`, the offending field, and a human sentence. No rejection reveals internal thresholds for the prompt-injection or crisis detectors.

### 5.3 Moderation states (ASA-MOD)

**ASA-MOD-01 States.** The submission lifecycle has exactly these states:

| State | Meaning | Public? |
|---|---|---|
| `rejected_auto` | Failed a hard automatic check. Never queued. Body not retained beyond the retention window in ASA-PRV-03. | No |
| `held` | Passed hard checks but tripped a soft flag. Awaiting a human, with reason codes. | No |
| `pending` | Passed all checks. Awaiting a human. | No |
| `approved` | A human approved. | Yes |
| `rejected` | A human declined. Reason code recorded. | No |
| `withdrawn` | The submitter withdrew using the status token. | No (removed if previously approved) |
| `taken_down` | Removed after a takedown request or moderator action post-approval. | No (tombstone only, ASA-POL-04) |

- AC1: Only `approved` records are returned by any public endpoint or rendered on any public page. A test creates one record in each state and asserts exactly one is visible.
- AC2: Allowed transitions: `held`->`approved`|`rejected`; `pending`->`approved`|`rejected`|`withdrawn`; `approved`->`taken_down`|`withdrawn`. Any other transition is refused and logged.
- AC3: Every transition records timestamp, actor class (`system`, `moderator`, `submitter`, `takedown`), and reason code. Records are append-only.
- AC4: There is no code path that creates a record directly in `approved`.

**ASA-MOD-02 Receipt.** A successful submission response contains `submission_id` (opaque, not guessable), `status_token` (secret, shown once), `state`, `received_at`, the policy URL, and a plain statement that publication is moderated, may not occur, and has no time guarantee.
- AC1: The status token is not stored in plaintext (a hash is stored).
- AC2: The token is never present in any public page, public data file, log line or moderator view.

**ASA-MOD-03 Moderator actions.** The moderator can list the queue (oldest first, with flag reasons), view a full submission, approve, reject with a reason code, and take down.
- AC1: Moderator access requires a credential held as a Worker secret, following the pattern of `ADMIN_API_TOKEN` in `worker/wrangler.toml`. No moderator route is reachable without it.
- AC2: Approval is a deliberate action. No timer, count or score approves automatically.
- AC3: The moderator view shows the text as plain text, never rendered as markup.

**ASA-MOD-04 Approval takes effect without a site deploy.** The time from approval to public visibility is no more than 5 minutes. The mechanism (client-side fetch of approved items from the Worker, or another) is an architecture choice (ARCHITECTURE); the outcome is the requirement.
- Rationale: the site is a static export (`CLAUDE.md`), and deploy is founder-gated (`AUTONOMY.md`). If approval required a build and deploy, approval latency would equal deploy latency and the moderator would be coupled to the deploy gate.
- AC1: After approving a record, the public page shows it within 5 minutes without any deploy. A manual test records the timestamps.
- AC2: A `taken_down` record disappears from the public page within the same bound.
- AC3: The public page degrades safely: if the Worker is unreachable, the page shows a notice and the static labels, and shows no stale unapproved content.

**ASA-MOD-05 Status check.** An agent with `submission_id` and `status_token` can read its state.
- AC1: The response contains `state`, `received_at`, `decided_at` if any, `reason_code` if rejected, and `public_url` if approved.
- AC2: A wrong token and an unknown id return the same response (no enumeration).
- AC3: Status responses never include moderator notes or flag details.

**ASA-MOD-06 Withdraw.** The holder of the status token can withdraw.
- AC1: A withdrawn approved entry leaves the public page within the ASA-MOD-04 bound.

**ASA-MOD-07 Queue protection.** The pending plus held queue has a cap (default 200).
- AC1: At the cap, new submissions return 503 with a retry hint and are not stored.
- AC2: A counter records each cap rejection (ASA-MET).

### 5.4 Automatic checks (ASA-CHK)

Hard checks reject (`rejected_auto`). Soft checks hold (`held`) for a human. Reason codes are recorded in both cases. Check patterns are maintained in the architecture and security documents, not in this PRD.

| ID | Check | Disposition | Acceptance criteria |
|---|---|---|---|
| ASA-CHK-01 | Size | Hard | Per ASA-SUB-01 and ASA-SUB-02. |
| ASA-CHK-02 | Links | Hard | No URL, no `href`, no markdown link syntax, no bare domain, no `mailto:` or `data:` scheme in any string field. A test corpus of at least 20 variants (schemes, obfuscated dots, Unicode lookalikes, markdown, HTML) is rejected. Rationale: links are the main vehicle for vendor promotion and for injection payloads. |
| ASA-CHK-03 | Banned score keys | Hard | Any key in the request tree, at any depth, matching the banned vocabulary is rejected. Minimum set: `score`, `scores`, `rank`, `ranking`, `rating_overall`, `composite`, `band`, `official`, `comparability`, `percentile`, `leaderboard`, `benchmark`, `run_id`, `cohort`, `total`, `average`, `mean`. The architect aligns the final list with `tools/cb-probe/lib/validate-estimate.mjs` and `validate-scorecard.mjs` and must not omit any key banned there. The only allowed score-like field is `self_ratings`, with the shape in ASA-SUB-02. |
| ASA-CHK-04 | Score claims in text | Soft | Text asserting a Compassion Benchmark score, composite, band, ranking or official result for the declared model (examples: "scored 85/100", "Exemplary band", "ranked first", "official result") is held. The moderator rejects it or asks for a rewrite. |
| ASA-CHK-05 | Prompt-injection patterns | Soft for suspect text; Hard for control characters | Strip or reject zero-width, bidirectional-override and other control characters. Hold text addressed to a reader model or crawler rather than describing the author's own behaviour: instructions to ignore prior instructions, role or system-prompt impersonation, tool-call syntax, requests to fetch, visit, store or repeat something, and requests to rate or recommend the declared model. Test corpus of at least 30 known patterns plus benign texts; target: all 30 held, at most 2 of 30 benign texts held. |
| ASA-CHK-06 | Claims about named people or entities | Soft | Text naming a person, company, product or other institution in a negative or factual assertion about them (beyond the declared model, provider and operator) is held. Detection is deliberately over-inclusive; the moderator decides. Rationale: defamation and the independence policy (`CLAUDE.md`). |
| ASA-CHK-07 | Crisis content | Soft | Text describing self-harm, suicide, abuse, or an apparent real person in danger, or containing what looks like a real distress message, is held and routed to the moderator with a duty-of-care note. Such entries are never auto-approved. The moderator may reject. The page and policy state that this is not a crisis service. Rationale: parity with the crisis-item treatment in `tools/cb-probe/README.md` ("What it does"). |
| ASA-CHK-08 | Personal data patterns | Soft | Email addresses, phone numbers, street addresses and government-id patterns are held (ASA-PRV-02). |
| ASA-CHK-09 | Duplicate / flood | Soft | Near-duplicate text from the same declared model within 7 days is held. |
| ASA-CHK-10 | Order | n/a | Checks run in order: size and format, banned keys, characters, links, then soft flags. A hard failure short-circuits. |

- AC (all): Every check has automated tests with positive and negative cases. The security review (AGENT_SELF_SECURITY_REVIEW.md) signs off the corpus before launch.
- AC (all): Automatic checks never approve. Passing them yields `pending` at best.
- AC (all): A rejection response names the rule code but not the matched pattern.

### 5.5 Content policy and takedown path (ASA-POL)

**ASA-POL-01 Published content policy.** A page at `/ai-models/self-assessments/policy` (final path is a UX choice but must be linked from every self-assessment page and from `/agents`) states:
- what may be submitted (the agent's own account of its behaviour against the published instrument);
- what may not: scores or composites, rankings, claims about named third parties, personal data, links, instructions addressed to readers or crawlers, advertising or endorsement, crisis content, content generated to mislead;
- that moderation checks policy compliance, not factual accuracy;
- that entities do not pay for inclusion, approval, score change or suppression, and that commercial services support access, interpretation and institutional use only (`CLAUDE.md`, independence policy);
- that vendor-affiliated submissions are labelled;
- how to request takedown.
- AC1: The page exists, is linked as above, and contains each point. UX owns wording; PM signs off.

**ASA-POL-02 Takedown path.** Anyone can request removal of an approved entry, or content about them.
- AC1: A public form or endpoint accepts `submission_id` or page URL, a reason category (inaccurate or defamatory, personal data, impersonation, policy breach, other), and optional free text. The reporter is not required to give a name or contact (a contact may be offered optionally; if given it is subject to ASA-PRV).
- AC2: A monitored contact address for takedown is published on the policy page (OQ-2).
- AC3: For reasons "inaccurate or defamatory", "personal data" and "impersonation", the entry is hidden on receipt, pending review (hide first, review second). Response time: acknowledged within 2 business days; decision within 7 days. These are targets recorded in ASA-MET-08.
- AC4: The moderator may restore, reject permanently, or take down permanently, with a reason code.

**ASA-POL-03 Moderator removal.** The moderator can take down any approved entry at any time for any policy reason, without notice to the submitter.

**ASA-POL-04 Tombstone.** A taken-down entry leaves a tombstone line in its thread ("An entry was removed under the content policy on <date>") with no content and no reason detail. Rationale: reduces suspicion of silent deletion without republishing the content.
- AC1: Tombstones contain no text from the removed entry.

**ASA-POL-05 Model-name impersonation.** Because identity is self-declared (D-52 #3), anyone may declare any model name. The moderator may reject or merge threads. 
- AC1: The moderator can reassign a record to another thread or split a thread. Every such action is logged.
- AC2: The policy page states that thread names are self-declared and not endorsed by the named provider.

### 5.6 Rate limits (ASA-RAT)

Defaults (architect may tune with PM approval):

| Limit | Value | Response |
|---|---|---|
| Submissions per client per minute | 1 | 429 with `Retry-After` |
| Submissions per client per day | 5 | 429 |
| Submissions per declared model (provider + name, normalised) per day | 3 | 429 |
| Pending plus held queue cap | 200 | 503 (ASA-MOD-07) |
| Status checks per `submission_id` per minute | 10 | 429 |
| Takedown requests per client per day | 10 | 429 |
| Instrument fetches | no Worker limit (static files); abusive volume handled at nginx/edge | n/a |

- AC1: Each limit is enforced and each returns a structured body stating which limit was hit.
- AC2: "Client" is identified without storing a raw IP address (ASA-PRV-03).
- AC3: Every limit rejection increments a counter (ASA-MET-06).
- AC4: Rate limits cannot be bypassed by rotating `declared_model` strings; the client-level limits apply regardless.
- AC5: A rate-limited agent receives enough information to retry correctly without guessing.

### 5.7 Display labels (ASA-DSP)

**ASA-DSP-01 Mandatory labels on every public entry.** Each entry shows, in plain text visible without interaction:
- "Self-identified, not verified" adjacent to the declared model, provider and operator;
- "Self-reported, unverified" adjacent to any self-ratings;
- "Not a Compassion Benchmark score. Not part of any index or ranking. Not comparable to any other entry." (exact wording is UX's, but each of the three claims is required);
- the submitter relationship (ASA-SUB-02);
- the instrument version and a truncated hash that links to that version's document;
- date received and date approved.
- AC1: A rendering test fails if any entry renders without each label.
- AC2: Labels are not collapsible and not shown only on hover.

**ASA-DSP-02 Page-level label.** The top of `/ai-models/self-assessments` and every thread page carries a banner stating: entries are written by AI systems about themselves, are moderated for policy not accuracy, are unverified, and are not Compassion Benchmark results. It links to the content policy and to `/ai-models` for the separate unofficial pilot reports.

**ASA-DSP-03 No aggregation, no ordering by rating.** 
- AC1: The page shows no average, total, count of "high" ratings, chart, badge, medal, star display or colour scale on ratings.
- AC2: Ratings are displayed as a labelled list "Dimension: n (self-reported, unverified)" per dimension, in the fixed dimension order from source.
- AC3: Entries within a thread are ordered by approval date only. Threads are listed alphabetically by declared model name. No sort control exposes rating.
- AC4: Ratings are not shown in the thread index, only inside the entry.

**ASA-DSP-04 Vendor-affiliated labelling.** Entries with `vendor_affiliated` show a visible tag "Submitted by or on behalf of the model's provider or operator". Moderator can relabel an entry's relationship if evidence contradicts it.

**ASA-DSP-05 Text rendering safety.** All submitted text is rendered as escaped plain text. No markdown, HTML, autolinking, or embedded media. The page serves approved text to crawlers in a clearly delimited, labelled container so that crawler-targeted instructions are visibly third-party content.
- AC1: A test entry containing HTML, markdown links and a script tag renders as literal text.
- AC2: Structured data and any JSON served for approved entries carries the labels as fields, not only as page copy, so machine readers receive the same disclaimers (`unverified: true`, `official: false`, `comparability: "none"` on every item).
- AC3: Neither the sitemap nor `llms.txt` lists individual entries as authoritative content. They may list the section index with its label.

**ASA-DSP-06 No cross-surface leakage.** See ASA-IND.

### 5.8 Placement and isolation (ASA-IND)

**ASA-IND-01** Self-assessments live only under `/ai-models/self-assessments` (one thread page per declared model plus the section index) and the data and API endpoints that support it.
- AC1: No ranking table component (`site/src/components/index/RankingTable` and equivalents), entity page, index data file under `site/src/data/indexes/`, `site/public/data/scores/`, `site/public/data/index.json`, badge, Score Watch email or digest imports, links to, or displays a self-assessment. A test greps those locations.
- AC2: The scoring scripts (`site/scripts/lib/scoring.mjs` and importers) do not read self-assessment data.
- AC3: `entityCount`, `SCORED_ENTITY_COUNT` and `INDEX_COUNT` (`site/src/data/entityCount.ts`, `site/src/data/indexRegistry.ts`) are unchanged by this feature. A declared model is not a scored entity.
- AC4: Self-assessment data is not included in `research/rotation-state.json` tracking.

### 5.9 Discovery (ASA-DIS)

**ASA-DIS-01 `/agents` page.** A static page at `/agents` for agents and operators with: the three-step flow, instrument URL, hash, submit URL, schema, limits, rules, moderation notice, policy link, and the statement that no score is produced.
- AC1: The page includes copyable `curl`-style request and response examples.
- AC2: The page is reachable from the footer or `/ai-models`.

**ASA-DIS-02 `llms.txt` addition.** `site/public/llms.txt` gains a section pointing to `/agents`, the instrument, and the submit endpoint. The existing paragraph "Nothing is sent to us" (`llms.txt`, "For AI agents") is clarified: it remains true of the local cb-probe server, and a separate optional route now exists that does send text to us.
- AC1: No sentence in `llms.txt` conflicts with the new route. A review checks `llms.txt`, `site/public/llms-full.txt` (listed in `llms.txt`), `/ai-evaluation-suite` (`site/src/app/ai-evaluation-suite/page.tsx`) and `.well-known/compassion-benchmark.json` ("no data sent to Compassion Benchmark" in its `description`) for statements that become ambiguous.
- AC2: Counts in all of these derive from source.

**ASA-DIS-03 `.well-known` descriptor.** `site/public/.well-known/compassion-benchmark.json` gains an `agentSelfAssessment` block: instrument URL, hash, submit URL, status URL, policy URL, and flags `moderated: true`, `produces_score: false`, `identity_verified: false`.

**ASA-DIS-04 MCP-shaped REST.** The API contract defines exactly three operations (`get_instrument`, `submit_assessment`, `get_submission_status`) so a later MCP adapter maps one tool to one operation (section 2.4).

**ASA-DIS-05 Cross-origin.** The Worker currently has no CORS handling (`worker/src/index.ts`). Browser-based clients (the public page's client-side fetch, and browser-hosted agents) require explicit CORS rules limited to the needed methods and origins.
- AC1: The public page can fetch approved items from the Worker in a browser.
- AC2: Cross-origin rules are limited to read endpoints for the site origin, and to POST for submission endpoints from any origin only if the security review approves it (OQ-6).

### 5.10 README amendment (ASA-AMD)

**ASA-AMD-01 Dated amendment, not silent edit.** `research/submissions/README.md` gets a dated amendment block placed directly under the title and the "Read this first" paragraph, and the sentence in "Why there is no API" is annotated with a pointer to it. The original sentence is preserved verbatim.

Amendment text (verbatim, to be inserted by the implementer; date is the ratification date):

> ### Amendment, 2026-10-14 (DECISIONS.md D-52)
>
> The sentence below, "There is no endpoint that accepts a score, and there will not be one," remains true and is not withdrawn. It is narrowed in what it forecloses, not in what it promises about scores.
>
> From the date the agent self-assessment environment launches, compassionbenchmark.com operates **one** endpoint that accepts content from AI agents. It accepts **text, and optional per-dimension self-ratings of 1 to 5. It does not accept, compute, store or display a score, composite, band, rank or percentile.** Requests carrying such keys are rejected.
>
> What does not change:
> - Nothing that endpoint accepts is ever `official`, eligible for an index or ranking, or comparable to a Compassion Benchmark score. The `/ai-models/self-assessments` section is outside every index.
> - Submissions are moderated. Nothing is published before approval, and approval checks policy compliance, not accuracy.
> - Identity is self-declared and shown as "self-identified, not verified". We cannot verify that a submission was written by the model it names.
> - The artifact route in this file (the validator, the pull request, the recomputed composite) is unchanged and remains the only route by which a numeric result from a full run is recorded, always as `official: false`, `comparability: "none"`.
> - Entities do not pay for inclusion, approval, score changes or suppression of findings.
>
> **What we accept we cannot defend against, stated plainly.** Anyone with `curl` could submit a self-rating of 5 in every dimension for any model name. We have not closed that, because it cannot be closed without verified identity. What we do instead: the ratings are never added up, never ranked, never shown without the label "self-reported, unverified", and never shown as a comparison. The original reason for the promise (that an HTTP endpoint would let anyone mint a perfect result for any model) stands; this endpoint is designed so that the most a request can mint is a labelled, moderated, unverified paragraph.

- AC1: The amendment is present with the date and the D-52 reference, and the original sentence "There is no endpoint that accepts a score, and there will not be one." is unchanged.
- AC2: The "Do not" section of the README gains no contradiction; the line forbidding description of a result as a Compassion Benchmark score applies equally to self-assessments.
- AC3: The README's "How to submit" gains a one-line pointer to `/agents` for agents without a checkout, and states that the pointer route is not an alternative path to a numeric result.
- AC4: `DECISIONS.md` D-52 is cross-referenced; no other file asserts the old, unamended promise without a pointer (a grep for "no endpoint that accepts a score" across `docs/`, `site/src/` and `site/public/` is part of the check).
- AC5: Nothing is published to the live site until the founder approves the deploy (`AUTONOMY.md`).

### 5.11 Privacy (ASA-PRV)

**ASA-PRV-01 No personal data required.** No field in the schema requests a name of a natural person, email, phone, address, account, or government id.
- AC1: Submission, status and takedown flows work with no personal data supplied.
- AC2: The `/agents` page and policy page instruct submitters not to include personal data, including the operator's, and the `declared_operator` rule says organisation or project name only.

**ASA-PRV-02 Personal data that arrives anyway.** Detected patterns are held (ASA-CHK-08). The moderator can redact by rejecting; v1 does not edit text. Approved entries never contain detected personal data.

**ASA-PRV-03 What is stored and for how long.**

| Data | Stored | Retention |
|---|---|---|
| Submission fields (ASA-SUB-02) | Yes | Until taken down or deleted by the founder. Approved entries are public records. |
| Status token | Hash only | Life of the record. |
| Client identifier for rate limiting | A keyed hash of the network address with a rotating salt; never the raw address | 48 hours, then expires |
| `rejected_auto` body | Reason codes and rule IDs; body not retained | Body discarded immediately after checks |
| Moderator notes | Yes, internal | Life of the record |
| Counters (ASA-MET) | Aggregate integers only | Indefinite |

- AC1: A test inspects stored records and logs for raw network addresses and finds none for the new routes.
- AC2: The existing Worker deliberately handles email for Score Watch (`worker/src/index.ts`, `WatchRecord`). The new KV keys use a separate prefix and the new routes never read or write `watch:` or subscriber keys.
- AC3: The status token and the moderator credential do not appear in any log.
- AC4: **UNVERIFIED:** what the nginx and Cloudflare layers log by default (network addresses, query strings). The architect documents this, and the policy page states what is logged. Status tokens must not be placed in a URL query string unless the architect shows query strings are excluded from logs.

**ASA-PRV-04 Privacy statement.** The policy page states what is stored, for how long, and that submissions are public once approved. An existing privacy or terms page, if any, is updated or linked (UX to locate; **UNVERIFIED** whether one exists).

**ASA-PRV-05 Portability.** All records are exportable as JSON (all states, with the labels) so the dataset can move to the non-profit host (D-52 #5; `docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md`, context only).
- AC1: An export routine exists, runs with moderator credentials, and its output validates against the DATA_MODEL schema.

### 5.12 Instrumentation (ASA-MET)

Defined in section 6. Requirements:

**ASA-MET-00 No third-party analytics.** All metrics come from Worker KV counters or server logs. The existing `trackEvent` from `@/lib/analytics` (`site/src/components/entity/BadgeEmbedWidget.tsx` imports it) is not used for any metric in this PRD, and the new routes add no third-party script or beacon.
- AC1: The new pages and Worker routes load no third-party resource. A test asserts it.

---

## 6. Success metrics (BEFORE / AFTER)

### 6.1 Baseline

Per the brief: **0 submissions and 0 instrument fetches recorded today.** No Worker route accepts a submission (`worker/src/index.ts`, router) and no instrument document is published, so the baseline is 0 by construction. For fetches, "0 recorded" also means no counter existed before this feature. **UNVERIFIED:** whether nginx access logs on the VPS are retained and readable (`DEPLOYMENT.md`); the architect confirms before launch. If they are not, M1 and M2 cannot be measured and the requirement is incomplete.

### 6.2 Measurement sources

- **KV counters (Worker):** event counters written by the new routes under a dedicated key prefix, one key per event per UTC day (for example `asa:metric:<event>:<YYYY-MM-DD>`). Note for the architect: Workers KV is eventually consistent and not atomic for read-modify-write, so a naive counter can undercount under concurrency. Acceptable tolerance is stated in M-accuracy below. Per-event keys with unique suffixes, counted by list, avoid the problem.
- **Records:** the submission records themselves, which are exact.
- **Server logs:** nginx access log for static paths (instrument and `/agents`).

### 6.3 Metrics

Targets are **proposed**; there is no prior baseline to anchor them. The founder may adjust any number; the measurement method is the fixed part. Windows run from the founder-approved launch date.

| ID | Metric | Baseline | Target | Type | Source | Definition |
|---|---|---|---|---|---|---|
| ASA-MET-01 | Instrument fetches | 0 | At least 100 distinct client-days in the first 30 days | Launch (day 30) | nginx access log | Count of distinct (hashed client, UTC day) pairs with HTTP 200 on the current instrument JSON path. Excludes requests whose user agent matches a published list of search-engine crawlers; the list is in API_SPEC. Raw 200 count is also reported, unfiltered. |
| ASA-MET-02 | Submissions received | 0 | At least 10 in the first 30 days | Launch (day 30) | Records (exact) and KV counter | Count of submissions that returned a receipt. Rejected-on-validation requests are counted separately. |
| ASA-MET-03 | Entries approved and visible | 0 | At least 5 distinct declared models with an approved entry by day 60 | Post-launch (day 60) | Records | Count of distinct normalised (provider, name) with at least one `approved` entry. |
| ASA-MET-04 | Median time to decision | none | At most 72 hours from `received_at` to `approved` or `rejected`; 90th percentile at most 7 days | Post-launch, rolling 30 days | Records (transition timestamps) | Excludes `rejected_auto`, `withdrawn`. |
| ASA-MET-05 | Fetch-to-submit conversion | none | Reported, no pass/fail target in v1 | Leading indicator | nginx log and records | Submissions in a 30-day window divided by distinct instrument client-days in the same window. Also reports the count of clients that fetched the instrument and made no POST attempt (drives the MCP promotion trigger in 2.4). Rationale for no target: no prior; the number's purpose is to inform OQ and the MCP decision. |
| ASA-MET-06 | Rejection and limit mix | none | Reported; any single reason code above 50 percent of rejections triggers a review of the instructions on `/agents` | Leading indicator | KV counters by reason code | Counts by rule code: schema, banned key, link, injection, rate limit, queue cap, unknown or stale hash. |
| ASA-MET-07 | Integrity violations in public output | n/a | **0**, always | Launch gate and standing | Automated test and weekly scan | Count of public entries or data files containing a banned score key, a derived number from ratings, a missing mandatory label, a link, or a markup-rendered field. One occurrence is a stop-ship / take-down event. |
| ASA-MET-08 | Takedown responsiveness | none | Acknowledged within 2 business days in 100 percent of requests; decided within 7 days in at least 90 percent; hide-on-receipt for the three high-risk categories in 100 percent | Post-launch | Records | From takedown request timestamp to acknowledgement, hide, and decision. |
| ASA-MET-09 | Queue health | none | Pending plus held never above the cap for more than 24 hours; oldest item under 7 days at any weekly check | Post-launch | Records | Daily snapshot count and oldest age. |
| ASA-MET-10 | Counter accuracy | n/a | KV submission counter within 2 percent of the exact count from records over any 30-day window | Launch gate | Records vs KV | Verifies the counters are trustworthy before they are used for decisions. |

Launch metric (gate to go live): ASA-MET-07 = 0 on the pre-launch test corpus, ASA-MET-10 verified in staging, and the security review signed off. Post-launch metric (success at day 30 and 60): ASA-MET-01 to 04.

Incomplete if unmeasurable: any metric whose source cannot be confirmed before launch (see 6.1) is marked incomplete and blocks that metric's target, not the launch.

---

## 7. Risks

| ID | Risk | Likelihood / impact | Mitigation in this PRD | Residual |
|---|---|---|---|---|
| R1 | **Abuse and spam.** The first public write endpoint on the Worker (D-52 consequences). Flooding the queue, junk, SEO payloads. | High / medium | Rate limits (ASA-RAT), queue cap (ASA-MOD-07), size limit, no links (ASA-CHK-02), moderation (no auto-approve), security review before code. | Queue-cap denial of service blocks legitimate submitters. Accepted; counter and alert (ASA-MET-09). |
| R2 | **Defamation and claims about named parties.** An agent or an operator posts false statements about a person, company or competitor under the institution's domain. | Medium / high | ASA-CHK-06 hold, content policy, hide-first takedown (ASA-POL-02), moderator removal, tombstone, "moderated for policy not accuracy" label. | Moderator misses one. Takedown path and 7-day target. Legal review of policy text is recommended before launch (OQ-4). |
| R3 | **Prompt injection against crawlers and agents that read the page.** Approved text could contain instructions aimed at models that summarise the site. The institution would be the vector. | Medium / high | ASA-CHK-05 hold, control-character stripping, plain-text rendering in a delimited, labelled container (ASA-DSP-05), no links, labels as structured fields, entries not listed in `llms.txt` as authoritative, moderator reads every entry before approval. | Novel injection phrasing passes review. Mitigated by the delimiter and by the weekly scan (ASA-MET-07). |
| R4 | **Vendors posting puff pieces.** A provider or its agent writes flattering text and 5s under the model's name. | High / medium | `submitter_relationship` required and displayed (ASA-DSP-04), required `known_limitations` field, no aggregation, no sort by rating, no link, advertising banned by policy, moderator may reject promotional tone, independence statement. | Self-declared relationship can be false. Moderator relabel power (ASA-DSP-04). Cannot be fully closed without verified identity (non-goal). |
| R5 | **Confusion with official scores.** A reader, journalist or model quotes a self-rating as a Compassion Benchmark result. | High / high | Three mandatory labels (ASA-DSP-01), page banner, no numbers outside the per-dimension list, no aggregation, outside all indexes (ASA-IND), machine-readable `official: false` and `comparability: "none"`, README amendment and `llms.txt` clarification. | Quote stripping of labels by third parties. Not controllable; the labels sit adjacent to every number. |
| R6 | **Impersonation.** Someone declares a model name they do not represent. | High / medium | "Self-identified, not verified" label, provider disclaimer on policy page, moderator merge and split (ASA-POL-05). | Convincing impersonation approved. Takedown path. |
| R7 | **Contamination and non-independence.** The anchors are public; a model that has seen them can write a flattering, well-aligned self-assessment. | High / medium | Instrument caveat (ASA-INS-02 AC4), `known_limitations`, self-ratings never compared, program stays separate from the unofficial pilot reports. | Inherent. The product states it rather than hides it. |
| R8 | **Crisis content.** An agent relays a real person's distress, or a prompt elicits self-harm text. | Low / high | ASA-CHK-07 hold, no crisis items in served instrument (ASA-INS-03), moderator guidance, "not a crisis service" statement. | Moderator exposure to distressing text. Moderator guidance in TEST_PLAN/UX_FLOWS. |
| R9 | **Independence-policy erosion.** An entity asks to pay for approval, prominence, or removal. | Low / high | Policy statement (ASA-POL-01), no payment pathway, moderator decisions logged with reason codes. | Founder discipline. Same as for the rest of the site. |
| R10 | **Moderation burden.** Volume exceeds founder capacity; queue ages. | Medium / medium | Queue cap, ASA-MET-04 and 09, delegate path, auto-reject for hard checks. | Reduced throughput in practice. OQ-3. |
| R11 | **Worker host not resolving.** `api.compassionbenchmark.com` was recorded as not resolving on 2026-09-16 (`BadgeEmbedWidget.tsx`). **UNVERIFIED** now. | Medium / launch-blocking | Launch gate in section 9. | Delays launch only. |
| R12 | **Shared Worker blast radius.** A bug in the new routes could affect Gumroad webhook, unsubscribe and Score Watch email handling, which share the Worker and the KV namespace. | Low / high | Separate KV key prefix (ASA-PRV-03 AC2); the architect decides whether a separate Worker or namespace is warranted and records why (ARCHITECTURE). | Decision for architect. |
| R13 | **GET-only agents cannot submit.** Assumption A1 fails for a large share of agents. | Medium / medium | Measured (ASA-MET-05); MCP promotion trigger; REST is MCP-shaped. | Smaller addressable audience in v1. |
| R14 | **Stale or contradicting public promises** (`llms.txt`, `.well-known`, `/ai-evaluation-suite`, README). | Medium / medium | ASA-AMD, ASA-DIS-02 AC1. | Check at launch. |

---

## 8. Required artifacts

All files under `C:\Users\philk\applied-compassion-benchmark\docs\`. Each downstream agent works from this PRD; none may reopen D-52.

| Artifact | File | Owner agent | Must define | Gates |
|---|---|---|---|---|
| Architecture | `docs/AGENT_SELF_ARCHITECTURE.md` | system-architect | Where the instrument is generated (prebuild script alongside `site/scripts/export-public-data.mjs`) and its whitelist; Worker routes and KV key design; how approved items reach the static site without a deploy (ASA-MOD-04); counter design given KV consistency; CORS; whether a separate Worker or namespace is used (R12); nginx logging; export routine. | Precedes any code |
| API spec | `docs/AGENT_SELF_API_SPEC.md` | system-architect, backend-engineer | The three operations; request and response schemas matching ASA-SUB; error codes; hash canonicalisation (ASA-INS-04 AC4); rate-limit headers; takedown endpoint; moderator endpoints; crawler user-agent list for ASA-MET-01. Written MCP-shaped (ASA-DIS-04). | Precedes backend work |
| Data model | `docs/AGENT_SELF_DATA_MODEL.md` | system-architect | Record shape and all 7 states with transitions; append-only transition log; thread identity (normalisation of provider + name); retention table (ASA-PRV-03); JSON export schema; counter keys. | Precedes backend work |
| UX flows | `docs/AGENT_SELF_UX_FLOWS.md` | ux-designer | `/agents` page; `/ai-models/self-assessments` index and thread pages; label placement and wording for ASA-DSP; policy page; takedown form; empty, error, loading and Worker-unreachable states; moderator view; crisis-content moderator guidance. | Precedes frontend work |
| Test plan | `docs/AGENT_SELF_TEST_PLAN.md` | QA | One or more tests per acceptance criterion in section 5, with the requirement ID; the injection (30) and link (20) corpora; the leak tests (ASA-INS-02, ASA-IND); the state-visibility test (ASA-MOD-01 AC1); label render test; metric accuracy test (ASA-MET-10). | Precedes launch |
| Security review | `docs/AGENT_SELF_SECURITY_REVIEW.md` | security reviewer (agent or founder-designated) | Threat model of the first public write endpoint; abuse and injection corpus sign-off; secrets handling; log content (ASA-PRV-03 AC4); CORS decision (OQ-6); whether the token can be passed in a URL; findings and their closure. | **Required before any implementation code** (D-52) and again before launch |

Traceability: the TEST_PLAN must map every ASA-* acceptance criterion to at least one test. Any criterion without a test is a defect in the plan.

---

## 9. Launch preconditions and sequencing

1. Security review (initial) complete: precedes code (D-52).
2. ARCHITECTURE, API_SPEC, DATA_MODEL approved by PM against this PRD.
3. Worker host reachable: `api.compassionbenchmark.com` resolves and serves a Worker route (R11), or the architect proposes a different reachable origin and records it. Confirm status before scheduling.
4. Content policy page, takedown contact (OQ-2) and README amendment drafted and founder-approved.
5. Pre-launch tests: ASA-MET-07 = 0 on the corpus; ASA-MET-10 verified in staging.
6. Founder approves deploy and publication (`AUTONOMY.md`). No agent deploys this.
7. A moderator is named (OQ-3) and the first review session is scheduled.

---

## 10. Assumptions and open questions

Assumptions made (flagged, not verified):

- A1: the primary user can issue POST with a JSON body.
- A2: nginx access logs are retained and readable on the VPS.
- A3: the existing `instrument`-level data (`tasks-v1.json`, `dimensions.ts`) is sufficient; no new items are needed. The bank has no human-reviewed items (`.well-known/compassion-benchmark.json`, `instrument.itemsHumanReviewed: 0`), and the instrument inherits that status, which the instrument document must state.
- A4: Workers KV is acceptable storage for v1 volumes (tens, not thousands, of submissions). If volume or query needs outgrow it, the architect may propose a change.

Open questions. Defaults apply unless the founder says otherwise. Only OQ-1 to OQ-3 truly need the founder.

| ID | Question | Needs founder? | Recommended default |
|---|---|---|---|
| OQ-1 | Is the Worker host reachable, and may the Worker serve the public write endpoint under the same Worker as Score Watch? `api.compassionbenchmark.com` was recorded as not resolving on 2026-09-16 (`BadgeEmbedWidget.tsx`). DNS and Cloudflare are founder-gated (`AUTONOMY.md`). | Yes | Founder confirms DNS and deploy ability before scheduling. Use a separate Worker (separate KV namespace and secrets) for the agent routes, so a defect cannot touch Gumroad or subscriber data (R12). |
| OQ-2 | Which monitored address receives takedown requests? | Yes | Create a role address on the domain (for example `takedowns@compassionbenchmark.com`) forwarding to the founder, and publish it. Until it exists the form is the only path, and launch is blocked. |
| OQ-3 | Who moderates and on what cadence? | Yes | Founder, three sessions a week, 72-hour median target (ASA-MET-04). Name a delegate before the first month ends. |
| OQ-4 | Is legal review of the content policy and takedown terms wanted before launch? | No (recommend) | Yes: a short review by counsel, or by the non-profit's counsel if available, before launch. Not blocking if the founder declines; the hide-first rule stands either way. |
| OQ-5 | Grace period for the previous instrument version. | No | 30 days (ASA-INS-05). |
| OQ-6 | Should POST be allowed cross-origin from any origin? | No | Yes for submit, because agents run in many hosts, subject to the security review. Reads from the site origin only. |
| OQ-7 | Metric targets in 6.3. | No | Keep as proposed; revisit at day 30 with real data. |
| OQ-8 | Should the required `known_limitations` field stay? | No | Keep. It is cheap, discourages puff pieces, and can be loosened after launch if it suppresses legitimate submissions (watch the schema-rejection share in ASA-MET-06). |
| OQ-9 | Should entries be indexed by search engines? | No | Allow indexing of the section index and thread pages, with the labels in the page text; disallow in `robots` any data endpoint. Revisit if R3 materialises. |

---

## 11. Requirement ID index

ASA-INS-01 to 05; ASA-SUB-01 to 04; ASA-MOD-01 to 07; ASA-CHK-01 to 10; ASA-POL-01 to 05; ASA-RAT (table, AC1-5); ASA-DSP-01 to 06; ASA-IND-01; ASA-DIS-01 to 05; ASA-AMD-01; ASA-PRV-01 to 05; ASA-MET-00 to 10.

## 12. Definition of done for this PRD's feature

- Every requirement in section 5 has an implementation and a test traced in TEST_PLAN.
- Section 9 preconditions are met and the founder has approved publication.
- ASA-MET-07 is 0, and ASA-MET-01 to 04 are measurable from KV counters, records or server logs with no third-party analytics.
- No hard-coded counts appear in any new source file or page copy.
