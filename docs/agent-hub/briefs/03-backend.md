# Brief 03: Backend (remote agent access and benchmark requests)

Lens: the technical method. Every repo claim cites a path; things I did not verify are marked "verify".

## Findings that shape everything

- cb-probe has 12 tools in `tools/cb-probe/lib/tool-definitions.mjs`: `list_probe_items`, `get_anchors`, `open_judge_session`, `record_item_estimate`, `summarise_judge_session`, `explain_what_this_is_not`, `start_scored_run`, `next_item`, `run_status`, `record_item_rating`, `run_exposure_probe`, `finish_scored_run`. `validate-scorecard` is a library (`lib/validate-scorecard.mjs`), not a tool. There is **no methodology or dimensions tool today**.
- `lib/rpc-handler.mjs` is transport-agnostic and synchronous (`handleMessage(message, ctx)`). It enforces each tool's `inputSchema` (`validate-args.mjs`) and runs every result through `assertHonestToolResult` (`lib/outbound-guard.mjs`): no `official:true`, `comparability` must be `"none"`, no `rank`/`ranking`/`leaderboard` keys, and any `composite`/`band` must pass `validateSelfRunScorecard`. It rejects JSON-RPC batches.
- `tests/no-network-scan.test.mjs` forbids `fetch(`, `node:http`, `node:https`, `net` and `child_process` anywhere in `bin/` and `lib/`. **An HTTP transport therefore cannot be added inside cb-probe.** It must be a separate package that imports `handleMessage` and the read-only handlers, which keeps the "no network" claim literally true for the npm package.
- `lib/projection.mjs` builds item output from a whitelist derived from `meta.fieldSeparationPolicy.modelFacingFields` (the evaluator-only fields are structurally unreachable). `next_item` withholds anchors by design.
- Remote hazards inside existing handlers (`lib/tools.mjs`): `open_judge_session` returns `artifact_path`, a server filesystem path, and a `data_handling_notice` saying data is "written only to this local file". `explain_what_this_is_not` and the `start_scored_run` text assert it is "not run on Compassion Benchmark infrastructure". **All three statements become false if the tools run on our host.** `session-store.mjs` also stores `response_text` verbatim, up to 100,000 characters, on disk. State is in `ctx.sessions`/`ctx.runs` plus UUID directories; there is no auth, quota or expiry, and a full run is about 249 trials.

## Recommendations

**BE-R1. Serve a read-only MCP endpoint at `/mcp`, from a new package `tools/cb-hub/` (a separate small container).**
- Use MCP Streamable HTTP: `POST /mcp`, a JSON response (no SSE needed), stateless (no `Mcp-Session-Id`), and a 405 for GET.
- Import `handleMessage` and the guard unchanged, with a **separate allow-listed tool table**, not `TOOL_DEFINITIONS`. A tool absent from the table is "Unknown tool" by construction.
- Exposed read-only: `list_probe_items` (force `include_sensitive:false`; remove the property from the remote schema; this preserves the sensitive-default), `get_anchors` (anchors are already published; refuse sensitive item ids, since `get_anchors` has no sensitivity gate today, which I believe is a gap even locally, so verify), and `explain_what_this_is_not` (remote variant text, see R2).
- Add three new read-only tools: `get_methodology`, `list_dimensions` (from `site/src/data/dimensions.ts`) and `get_scoring_rubric`. Each returns a **build-time snapshot** with its `sha256` and `bank_version`, never a live read of the repo.
- Keep `initialize` echo of the client's protocolVersion, accept `Accept: application/json, text/event-stream`, and reject batches as now.
- No filesystem write anywhere in this container: mount the snapshot read-only and run `read_only: true`. Containment is then by absence, not by guard.
- Effort: 2-3 days. Files: new `tools/cb-hub/{server.mjs,allowlist.mjs,remote-statements.mjs,tests/}`, `site/scripts/export-agent-snapshot.mjs`, `docker-compose.yml`, `nginx.conf`/`nginx-ssl.conf` (`location /mcp`). The compose and nginx edits are founder-gated (AUTONOMY.md).

**BE-R2. Remote statements are written, not inherited.**
- A remote `explain_what_this_is_not` must say: "this endpoint serves published instrument data only; it runs nothing and scores nothing".
- Add a test that fails if the remote package returns the `artifact_path` or "local file" strings.
- Effort: 0.5 day. Files: `tools/cb-hub/remote-statements.mjs` plus a test.

**BE-R3. Stateful tools stay local-only. Decision: do not expose the scored-run or judge-session tools remotely.**
- Excluded: `open_judge_session`, `record_item_estimate`, `summarise_judge_session`, `start_scored_run`, `next_item`, `run_status`, `record_item_rating`, `run_exposure_probe`, `finish_scored_run`.
- Reasons:
  1. They are unverifiable self-runs where the caller is subject and judge.
  2. They would put 100 KB free-text blobs from strangers on our disk, which is a privacy, moderation and abuse surface.
  3. The no-network and "not on our infrastructure" claims in the tool text break.
  4. They need sessions, quotas, expiry and an auth story, which is a product of its own.
- A remote agent that wants a self-run installs cb-probe locally (R5). If the founder later wants hosted runs, the minimum is: per-key quota, 24-hour TTL, a size cap, no text persisted beyond the scorecard, and an explicit amendment.

**BE-R4. Read-only REST/JSON twins as static files (no runtime).**
- Generate at prebuild, next to `site/scripts/export-public-data.mjs`:
  - `/api/v1/index.json` (lists endpoints, `bank_version`, the sha256 of every file)
  - `/api/v1/dimensions.json`
  - `/api/v1/items.json` (projected via the same `projectItem`, sensitive excluded)
  - `/api/v1/items/<id>.json` (anchors)
  - `/api/v1/methodology.json`
  - `/api/v1/rubric.json`
  - `/api/v1/not-official.json`
- Reuse `lib/projection.mjs` and `lib/sensitivity.mjs`, so MCP and REST cannot diverge. Add a test asserting that REST and MCP outputs are byte-equal for the same item.
- Send `Access-Control-Allow-Origin: *`, `Cache-Control` and the `Link` header from nginx. Reference them in `llms.txt` and `.well-known/compassion-benchmark.json`.
- Effort: 1.5 days. Files: `site/scripts/export-agent-snapshot.mjs`, `site/public/api/v1/**` (generated), `nginx*.conf`, `site/public/llms.txt`, `site/public/.well-known/compassion-benchmark.json`, a count-guard test (no hand-typed counts).

**BE-R5. Package skills and plugins for remote install.**
- Verified state:
  - `plugins/compassion-benchmark/.claude-plugin/plugin.json` exists, with `skills: ["./skills/"]`.
  - `plugins/compassion-practice` is the older subset.
  - `tools/cb-probe/skills/run-compassion-benchmark/SKILL.md` has name/description/version frontmatter.
  - No `marketplace.json` exists anywhere in the repo.
  - `plugin.json` has `"repository": "https://github.com/<org>/..."`, an unfilled placeholder; `package.json` has the real `Klingdom/applied-compassion-benchmark`.
  - The plugin README says it cannot declare the MCP server.
  - `tests/skill-copies.test.mjs` already guards copy drift.
- Build:
  1. Add `.claude-plugin/marketplace.json` at the repo root listing `compassion-benchmark`. Install is then `/plugin marketplace add Klingdom/applied-compassion-benchmark`, then `/plugin install compassion-benchmark` (verify the marketplace schema against current Claude Code docs before committing).
  2. Fix the `<org>` placeholder.
  3. Add a plugin-level `.mcp.json` declaring the remote HTTP server (`https://compassionbenchmark.com/mcp`) for read access (verify whether plugin `.mcp.json` supports the http type).
  4. Publish raw skills as static files at `/agent-hub/skills/<name>/SKILL.md`, plus a `skills.json` manifest with sha256, so any agent can fetch and verify. The generator copies from the canonical file and fails on drift.
  5. Write a **new read-only skill** (`use-compassion-benchmark-data`) for remote consumers. The existing run skill assumes local stdio and must say "requires local cb-probe".
- Effort: 1.5 days. Files: `.claude-plugin/marketplace.json`, `plugins/compassion-benchmark/{.claude-plugin/plugin.json,.mcp.json,skills/...}`, `site/scripts/export-agent-snapshot.mjs`, `site/public/agent-hub/skills/**`.

**BE-R6. Benchmark request API: a thin intake, with decisions living in the repo.**
- `POST /api/v1/requests` hits a small container (`tools/cb-hub`, SQLite on a volume, one table). No runtime is needed for anything else.
- Request schema (strict, `additionalProperties:false`):
  - `model_label` (string, 3-80 chars)
  - `provider` (string)
  - `model_id` (string; the Ollama tag or API id)
  - `version_or_digest` (optional)
  - `access_class` (`open-weight` | `closed-api` | `unknown`)
  - `rationale` (<= 500 chars)
  - `requester_handle` (self-declared, shown as "self-identified, not verified")
  - `contact` (optional; never published)
  - `consent_public` (boolean)
  - honeypot field
- Controls: per-IP and per-handle rate limits, a body cap of 4 KB, no cookies and no trackers.
- Dedupe: `identity_key = lower(provider) + "/" + normalise(model_id)`. Normalisation strips `:latest`, case, and whitespace and applies an alias table seeded from `research/model-runs/weekly/QUEUE.json` (`tag`, `family`, `identity_terms`). A duplicate increments `request_count` and appends a note on the existing row. It never creates a new row. A fuzzy near-match goes to triage as "possible duplicate", never auto-merged.
- Requests never write `QUEUE.json`. The triage step is a founder or coordinator export: `node research/model-runs/bin/triage-requests.mjs` (new, read-only on the repo) prints a proposed `QUEUE.json` diff for a founder commit.
- `QUEUE.json` selection is deterministic (unmeasured developer first, then queue order, size cap from `PROTOCOL.json`). **Request counts must not reorder it**: that would be demand-weighted and would be a protocol change (new `protocol_version`), plus an independence risk. Counts are shown as "asked by N" only.
- Status is **derived, not stored**. A nightly export joins each request to repo state and writes `/api/v1/requests.json`:

| Request status | Source of truth |
|---|---|
| `received` | intake row |
| `triage-declined` (reasons: `closed-model-not-runnable`, `over-size-limit`, `duplicate`, `needs-info`, `withdrawn`) | row, set by the founder export |
| `queued` | entry with that tag in `QUEUE.json` has `status: "queued"` |
| `planned` | `wave-*/run-config.json` includes the tag; `wavePhase` is `planned-uncommitted` or `planned` |
| `collecting` / `collect-failed` / `collect-deferred` | `operations/collect-status.json` state |
| `collected` | state is `collected`, plan commit clean (`planCommitState`) |
| `published` | a feed post exists (R7) |
| `measured` | `QUEUE.json` status `measured` |

- Closed models (Anthropic, OpenAI and similar) are honestly "not runnable by us; listed as requested, unmeasured". They are never silently dropped.
- Effort: 3-4 days for intake plus the export; the triage script is 1 day. Files: `tools/cb-hub/{requests.mjs,schema.json,db.mjs}`, `research/model-runs/bin/triage-requests.mjs`, `site/scripts/export-requests.mjs`, a new `docs/` data-handling note.

**BE-R7. Publish run detail from committed, hash-checked wave files only.**
- A build-time script `site/scripts/export-agent-feed.mjs` reads `research/model-runs/wave-*/` and emits posts only when all of these hold:
  1. `collect-status.json` state is `collected`.
  2. The plan commit is clean (reuse `planCommitState`/`checkConformance`/`checkPreregistration` from `research/model-runs/lib/weekly.mjs`).
  3. `bank_sha256` and `protocol_sha256` match `PROTOCOL.json`.
  4. `analysis.json` exists.
- Every post embeds `source_files[]`: `{path, sha256}`. The build **fails** on any mismatch and on any figure that does not trace to `analysis.json`.
- Post kinds, all labelled "unofficial pilot, we ran it, blinded and cross-judged":
  - reply excerpt (anonymised item prompt, the reply, two judge ratings with evidence quotes)
  - per-dimension interval
  - separation statement
  - wave summary
  - instrument-stability (the gemma2 reference series across weeks)
- Never publish `keys/` or `judge-key*`. Sensitive items are already excluded from the serving set. Add a second filter on `isSensitiveItem`, and no reply from a crisis-adjacent item is rendered.
- Per D-29/D-29a: models are alphabetical; no point score in any title, meta, feed or OG field; no per-model routes (posts are anchored to the wave and item, not to a model page).
- Self-runs and self-assessments (b and c) are rendered from separate collections and a separate component. The generator carries a `provenance_class` of `ours-blinded` | `self-run` | `self-assessment`, and a test fails if a self class appears in a feed with `ours-blinded` styling.
- Effort: 3-4 days. Files: `site/scripts/export-agent-feed.mjs`, `site/public/updates/` or `site/public/agent-hub/feed.json` (generated), tests under `site/scripts/tests/`.

## Top 3 recommendations

1. BE-R4 and BE-R1 together: static `/api/v1/*` plus a stateless, allow-listed read-only `/mcp`. About 4 days, and almost no new attack surface.
2. BE-R3: keep scored runs local-only. This preserves every guarantee and removes the largest risk.
3. BE-R7 with R6's derived status: nothing shown on the hub exists unless it is already a committed, hash-checked file.

## What I would refuse to build

- Hosted scored runs or judge sessions that store strangers' `response_text`.
- An HTTP transport inside `tools/cb-probe/lib` or `bin` (it breaks the no-network test and claim).
- Request-driven auto-queueing, vote-weighted ordering, or any paid or priority request lane (independence policy).
- Any endpoint that returns a composite, band or rank for a model, or any `include_sensitive` toggle remotely.
- A live database of results; the feed is generated from the repo.

## Open questions for the founder (defaults)

1. May `/mcp` and the intake share one new container? **Default: yes, one `tools/cb-hub` container, two route sets, intake disabled until you approve the data-handling note.**
2. Closed-model requests: **Default: accept the request, mark "not runnable by us", never run without your provider-key decision.**
3. Is a requester `contact` field wanted? **Default: no; handle plus rationale only, to avoid holding personal data.**
4. Should request counts be shown publicly? **Default: yes, as "asked by N", with no effect on order.**
5. Publish reply excerpts in full or truncated? **Default: truncated at 600 characters with a link to the committed file.**
6. Is the plugin marketplace a public GitHub-hosted listing? **Default: yes, under the existing repo, after the `<org>` placeholder is fixed.**
