# Brief 11 - Analytics: BEFORE/AFTER measurement plan for the Agent Hub

Lens: evidence that the Hub works, is not mostly spam, and is worth keeping. No third-party analytics, no personal data. Prefix: AN-R.

## 1. Verified starting facts

- **Tier 2 submissions today: 0.** `research/submissions/` holds only `README.md` (Glob). This is an exact baseline, not an estimate.
- **Access logs exist but are not a retained dataset.** `nginx.conf` and `nginx-ssl.conf` contain no `access_log`, `error_log` or `log_format` directive, so nginx uses its defaults, and `docker-compose.yml` has no `logging` block (`research/audit-2026-04-24/devops.md` lines 99-108). Logs are reachable only by `docker logs compassion-benchmark` over SSH, use Docker's json-file driver with no rotation or size cap, and vanish when the container is recreated (every deploy, per the "build-and-recreate" pattern in `OBSERVABILITY.md` section 2). **UNVERIFIED on the live VPS:** how many days actually survive. The ASA PRD flags the same gap (`docs/PRD_AGENT_SELF_ASSESSMENT.md` 6.1). Treat the llms.txt and `/data/model-benchmark` fetch baseline as **not yet measurable** until the founder runs the one-time check in AN-R1.
- **A self-hosted Umami already exists.** `nginx.conf` line 38 and `nginx-ssl.conf` line 58 proxy `/u/` to `umami-analytics-vi0p-umami-1:3000`. It counts page views from browsers running JavaScript; agents that fetch `llms.txt` or JSON never run its script. It is therefore blind to the exact traffic the Hub cares about. `ASA-MET-00` already bars `trackEvent` from these metrics.
- **No server runtime for counters yet.** The Worker's `api.compassionbenchmark.com` is NXDOMAIN (RISK-014), so KV counters (`ASA-MET` section 6.2) are not available until the same-origin API container is decided. Logs and committed records are therefore the only sources at launch.

## 2. Metric hierarchy

- **Launch success metric:** distinct agent clients that fetch the instrument AND complete one thing (a Tier 2 submission, a self-assessment, or a Hub request), per 30 days. Not page views.
- **Activation:** a client class that fetched the instrument and then made a valid write within 7 days (extends `ASA-MET-05`).
- **Integrity (gating, outranks the above):** section 5.
- **Operational (separate dashboard, never mixed into product KPIs):** moderation queue age, takedown latency, counter accuracy (`ASA-MET-04/08/09/10`).

## 3. Baselines and how to take them (BEFORE)

| Baseline | Method | Cost |
|---|---|---|
| `llms.txt`, `llms-full.txt`, `.well-known/*`, `/data/model-benchmark/*` fetches | One-time `docker logs --since` plus `awk`/`grep` on the existing container, run on a stated date and saved as a committed CSV of daily counts by path and client class (no IPs). Then start retention (AN-R1). | 15 minutes, founder-gated (SSH) |
| Client class mix | Classify the User-Agent string at report time (rules in AN-R3) | script |
| Tier 2 submissions | `ls research/submissions` minus README: 0 | trivial |
| Unofficial model pilots published | `research/model-runs/` run count (do not hard-code in copy) | trivial |
| Browser human visits | Existing Umami, kept as a labelled "browser-only, JS-only" figure | none |

State the baseline as "measured on date X over N days of retained log", never as an annual figure. If retained log depth is under 7 days, the baseline is reported as "insufficient", not zero.

## 4. Event and counter design

Principles: counters, not event streams; aggregated by UTC day; no IP, no raw User-Agent, no session id, no free text stored in a metric. A "client" is a salted-hash bucket (see AN-R4) used only inside a day's aggregation and discarded.

Static (nginx) path, available at launch, derived from logs by a daily script:

| Metric | Trigger | Dimensions |
|---|---|---|
| `fetch.instrument` | HTTP 200 on instrument, anchors, rubric, `llms*.txt`, `.well-known/*`, `/data/model-benchmark/*` | path group, client class, status |
| `fetch.conditional` | 304 vs 200 | path group (separates polling from new reads) |

Client class (closed set): `mcp` (self-identifying MCP client or the remote MCP route), `agent_ua` (declared AI/agent/crawler strings, from a committed list), `browser`, `other`. Declared only, and reported as "declared, spoofable".

API/MCP path, counters written by the future same-origin service:

| Metric | Trigger | Dimensions |
|---|---|---|
| `req.submitted` | request receives a receipt | provenance class a/b/c, client class |
| `req.triage` | transition to a final state | outcome (`approved`, `rejected`, `rejected_auto`, `withdrawn`, `held`), provenance class |
| `req.time_to_decision` | at `approved`/`rejected` | histogram buckets: 1h, 6h, 24h, 72h, 7d, more (matches `ASA-MET-04`) |
| `mod.reject_reason` | each rejection | closed reason code list (schema, banned_key, link, injection, rate_limit, queue_cap, stale_hash, promotional, impersonation, defamation, crisis_hold, duplicate) |
| `post.published` | approved item becomes visible | provenance class (a official-pilot / b self-run / c self-assessment) |
| `mcp.session` | remote MCP initialise | none beyond day |
| `mcp.tool_call` | each call | tool name, result ok/error |
| `correction.issued` | any published item amended, hidden or retracted | cause (moderator error, takedown, source error, method change) |

Edge cases: dedupe retries by request idempotency key; exclude moderator and test traffic by a fixed internal flag; `rejected_auto` counted in volume but excluded from time-to-decision; provenance class is a required field, so an unclassified post cannot exist.

## 5. Integrity metrics (read these first)

| ID | Metric | Definition | Why |
|---|---|---|---|
| INT-1 | Distinct-source share | distinct daily source buckets / total accepted requests, per provenance class | A hub of 200 posts from 3 sources is not an ecosystem |
| INT-2 | Duplicate rate | near-identical text (normalised hash, plus first-200-char hash) / submitted | Cheap spam signature |
| INT-3 | Sybil indicator | share of approved items from the top 3 buckets; and buckets sharing identical declared model/provider strings with conflicting claims | Impersonation (R6) and flooding |
| INT-4 | Injection-block rate | holds and rejects by injection rule / submitted; plus the post-approval weekly scan hit count (`ASA-MET-07`, must be 0) | Rising rate means targeted attack; non-zero scan hit is a take-down |
| INT-5 | Correction rate | `correction.issued` / `post.published`, split by cause | Shows moderation quality; a rate near 0 is as suspicious as a high one |
| INT-6 | Label integrity | public items missing a mandatory label, or showing a rank/composite for class b/c | Hard zero |
| INT-7 | Provenance bleed | any class b/c item rendered with class a styling or in a class a list | Hard zero |

Ratios only appear with their denominators, and any ratio on fewer than 30 events is shown as a count with "too few to read".

## 6. Targets (proposed, founder-adjustable; methods fixed)

| | 30 days | 90 days |
|---|---|---|
| Distinct instrument client-days | >= 100 (`ASA-MET-01`) | >= 400, with >= 15% declared `mcp` or `agent_ua` |
| Valid writes (all classes) | >= 10 | >= 40 |
| Distinct declared models with an approved item | >= 3 | >= 8 (`ASA-MET-03` sets 5 by day 60) |
| Median time to decision | <= 72h | <= 48h; p90 <= 7d |
| Distinct-source share (INT-1) | >= 0.5 | >= 0.6 |
| Duplicate rate (INT-2) | <= 20% | <= 10% |
| Top-3 source share (INT-3) | <= 50% | <= 35% |
| INT-6, INT-7, ASA-MET-07 | 0 | 0 |
| Correction rate (INT-5) | reported | 1-8%, reported with causes |

Misses are findings, not failures, except the hard zeros.

## 7. Kill criterion for social features

"Social features" means anything beyond the static instrument and Tier 2 route: public feed, comments, reactions, threads. Evaluate at day 30 and day 90, and stop (hide the feed, keep read-only archive, keep the instrument) if either holds:

1. Of all submissions over a trailing 30 days (minimum 40 events, else extend the window), **more than 60%** are `rejected`/`rejected_auto` for spam, duplicate, link, injection or promotional reasons; OR
2. **Moderation cost:** median time to decision exceeds 7 days for two consecutive weeks, or the queue cap is hit on more than 7 days in a month, with approved items fewer than 10.

Any single INT-6/INT-7 event or an ASA-MET-07 hit suspends the feed immediately pending review, independent of the above. Decision belongs to the founder; Analytics supplies the numbers and a written verdict.

## 8. Recommendations

- **AN-R1 Fix log retention before launch (founder-gated infra).** Add an explicit nginx `access_log` and a Docker `logging` block with `max-size`/`max-file` (or a host-side daily export), retaining 90 days of aggregated daily counts committed outside the container. First, take the baseline snapshot in section 3 now so BEFORE exists. Without this, ASA-MET-01 is incomplete.
- **AN-R2 Count from aggregates, publish aggregates.** A daily script reduces logs to a CSV of (date, path group, client class, status, count) and discards raw lines older than the retention window. Raw IPs never leave the log.
- **AN-R3 Closed client-class list with a committed UA matcher**, versioned in the repo, reported as "declared, spoofable". Unknown strings go to `other`.
- **AN-R4 Distinct sources without personal data.** Derive a bucket from a salted hash of IP and UA where the salt rotates daily and is never stored, so the same source is countable within a day and unlinkable across days. Report "distinct source-days", never "users". Also log that this is what is measured on the policy page (`ASA-PRV-04`).
- **AN-R5 Counters in the record store, not KV, where exactness matters.** Triage outcomes, time-to-decision and reasons are computed from the append-only transition log (`ASA-MET-04`), which is exact. Use counters only for pre-record events (fetches, rate-limited, rejected-on-validation), and verify within 2% (`ASA-MET-10`).
- **AN-R6 Provenance class is a mandatory dimension on every metric** (a official pilot, b self-run, c self-assessment). No metric may add across classes into a single "results" figure.
- **AN-R7 No metric may display a model score.** The Hub dashboard shows only counts, rates and durations. Respects D-29a and D-52; no ranks, no per-model performance numbers appear in analytics outputs either.
- **AN-R8 Separate dashboards.** `DASHBOARD_SPEC`: (1) Integrity (INT-1..7, always first), (2) Funnel (fetch, act, valid write, approved), (3) Moderation operations. Internal, a committed weekly markdown report generated by script, no hosted tool.
- **AN-R9 Weekly integrity scan joins the existing integrity audit** pattern (`research/scripts/integrity-check.mjs`, reports in `research/integrity-reports/`) and applies the OBSERVABILITY lesson: check currency, not liveness (counter freshness assertion: yesterday's row exists).
- **AN-R10 Pre-register the kill criterion** (section 7) in `DECISIONS.md` before launch, so thresholds cannot move after the data arrives.
- **AN-R11 Experiment hygiene.** Any change to instructions on `/agents` is made one at a time with a dated changelog line, since there is no randomisation on a static site; compare 14-day before/after windows and call results "associated", not "caused".
- **AN-R12 Crisis handling in analytics.** Crisis-held items are counted by category only; their text is never copied into reports or metric dimensions.

## Top 3 recommendations

1. **AN-R1:** snapshot the baseline now and fix log retention; otherwise the BEFORE/AFTER comparison does not exist.
2. **AN-R4 plus section 5:** measure integrity (distinct sources, duplicates, injection, corrections) before volume, using daily-rotating salted buckets.
3. **AN-R10 and section 7:** pre-register the kill criterion so the social layer is judged on spam share and moderation cost.

## What I would refuse to build

- Any third-party analytics, pixel, fingerprinting, or cross-day visitor identity.
- A "most active agent" leaderboard or any engagement ranking of agents or models.
- Reaction or like counts used as quality signals.
- Metrics that combine provenance classes into one headline number.
- Per-agent profiles tracking behaviour over time.
- A real-time dashboard; a daily script is enough for these volumes.
- Storing raw IP or raw User-Agent beyond the log retention window.

## Open questions for the founder (with defaults)

1. Run the one-time `docker logs` snapshot over SSH now? **Default: yes, this week.**
2. Log retention length for raw lines? **Default: 14 days raw, 90+ days aggregated CSV.**
3. Is hashing IP+UA with a daily-rotating, unstored salt acceptable under the privacy statement? **Default: yes, disclosed on the policy page.**
4. Should Umami be extended to the Hub pages? **Default: no; Hub metrics come from logs and records only (consistent with ASA-MET-00).**
5. Kill-criterion thresholds (60% spam, 7-day median)? **Default: as written, committed before launch.**
6. Who reads the weekly integrity report? **Default: founder, with the report committed to `research/integrity-reports/`.**
