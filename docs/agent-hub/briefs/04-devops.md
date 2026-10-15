# Agent Hub brief 04: DevOps (hosting, capacity, hand-off, degradation)

Lens: host the Agent Hub's dynamic parts on the existing VPS with the fewest founder-gated infrastructure changes.
Date 2026-10-14. Every claim cites the file it came from.

## 1. Verified facts that shape the design

- `docker-compose.yml` defines one service, `web` (container `compassion-benchmark`, port `8080:80`, external network `proxy-net`). It has **no volumes, no healthcheck and no certbot service**.
  - `deploy.sh` (lines 44 and 61) and `DEPLOYMENT.md` still call `docker compose run --rm certbot`, which would fail against this compose file. That is stale-doc debt to flag. It is not an Agent Hub blocker.
- Production TLS is terminated by an `openresty` proxy in front of the container (`DEPLOYMENT.md`, "IMPORTANT" section). Its config, owner and routing rules are explicitly undetermined (founder follow-up).
  - Consequence: whether `/api/agent/*` and `/mcp` reach `web` is **unverified**. The Umami `/u/` block proves that path-based proxying inside `nginx.conf` works, but it does not prove openresty forwards arbitrary paths.
- `nginx.conf` is baked into the image (`Dockerfile` line 40) and is what CI ships. `nginx-ssl.conf` is a one-shot runtime copy that the next rebuild reverts (`DEPLOYMENT.md`). Edit `nginx.conf` first. Edit `nginx-ssl.conf` too only if `deploy.sh` will run.
- `nginx.conf` already proxies to a **container-name literal** (`http://umami-analytics-vi0p-umami-1:3000/`).
  - nginx resolves a literal upstream at config load. If that container is absent, nginx refuses to start.
  - Adding `proxy_pass http://api:3000` the same way would let a dead API container take the **whole static site down** on the next `web` restart. This is the central degradation hazard.
- Existing nginx facts that bite new locations:
  - Regex locations `\.md$` and `\.(css|js|...)$` outrank plain prefix locations. New API locations must use `^~`.
  - Server-level `rewrite`s run first.
  - An `add_header` inside a location drops the server-level security headers (comment at `nginx.conf` lines 195-198).
- `deploy.sh` hard-codes `git pull origin main` and `docker compose build --no-cache web`. It only builds `web`. It ends with a freshness check against `/updates/feed.json`.
- `DISASTER-RECOVERY.md` section 6: **no restore drill has ever been performed**. `OBSERVABILITY.md` section 3: CI failure is silent, and there is no scheduled production-drift probe.
- `worker/wrangler.toml` routes `api.compassionbenchmark.com/*`, which is NXDOMAIN (PANEL_BRIEF, RISK-014). The Worker is the wrong home for this. It has KV only, no SQLite, and its name is unreachable.
- `.gitignore` lines 37-42 ignore `.env` and `.env.*` but keep `.env.example`. An env file for the API fits the existing convention.
- Model runs: `research/model-runs/weekly/` holds `PROTOCOL.json`, `QUEUE.json` and `register-task.ps1`. The weekly wave is a Windows scheduled task on the founder's machine with Ollama. `QUEUE.json` selection is deterministic and refuses models above the protocol size cap.
- `docs/AGENT_SELF_ARCHITECTURE.md` does not exist yet. The briefs are not yet synthesised.

## 2. Recommended topology (smallest change set)

One new service in `docker-compose.yml`, one new nginx block, one volume. No new domain, no DNS change, no Cloudflare and no new third party.

```
agent -> openresty (existing) -> web (nginx) --^~ /api/agent/, /mcp--> api (Node, proxy-net only)
                                              \-- everything else --> static files (unchanged)
api: no published port, volume agent-data:/data, read_only rootfs, non-root, mem_limit 256m
```

The API container stores requests, moderated comments and rate-limit counters only. It **never reads Ollama, never holds provider keys and never computes a score**.

## 3. Recommendations

**OPS-R1. Same-origin path routing, not a subdomain.** Serve `/api/agent/*` and `/mcp` from `compassionbenchmark.com`. This avoids the dead `api.` DNS, a new certificate and CORS. It requires one founder-gated verification: that the openresty proxy forwards those paths to `web` (see Open question 1).

**OPS-R2. API container on `proxy-net`, no published port.** Build it from a new `agent-api/` directory. Pin the base image to `node:20-alpine`, as the Dockerfile already does for the site build. Run it as a non-root user with a read-only root filesystem, `tmpfs /tmp`, `restart: unless-stopped` and `mem_limit: 256m`. Add a compose `healthcheck` that calls `GET /healthz`. `healthz` returns only `{ok, schema_version, queue_depth}`.

**OPS-R3. Resolve the upstream lazily so a dead API cannot stop nginx.** In `nginx.conf`, use `resolver 127.0.0.11 valid=10s;`, `set $agent_api http://api:3000;` and `proxy_pass $agent_api;`. Variable upstreams are resolved per request, so `web` starts without `api`. Retrofit the same pattern to the Umami block (an existing latent hazard). Verify with `nginx -t` (CI already runs `nginx-config-syntax`), then `docker compose stop api && docker compose restart web` and confirm the homepage still returns 200.

**OPS-R4. Location blocks use `^~` and re-declare headers.**
- Use `location ^~ /api/agent/ {...}` and `location ^~ /mcp {...}`. `^~` is required so the `\.md$` and static-extension regexes cannot capture API paths.
- Re-state the four security headers in these blocks (they are not inherited once any `add_header` appears).
- Set `proxy_http_version 1.1`, `proxy_read_timeout 30s`, and `proxy_buffering off` only for `/mcp`.
- Add `error_page 502 503 504 = @agent_down;`, where `@agent_down` returns `503` with a small static JSON body and `Retry-After: 300`.
- Apply the same edits to `nginx-ssl.conf`, and extend `site/scripts/test-nginx-redirect-parity.mjs` to cover the new blocks (that guard exists per `DEPLOYMENT.md`).

**OPS-R5. Limits enforced at nginx first, then the app.**
- Declare in the `http` context (put the zones in a conf.d include, since `default.conf` is a server file). For example `limit_req_zone $binary_remote_addr zone=agent_write:10m rate=6r/m;` for POST and `zone=agent_read:10m rate=60r/m;` for GET.
- Use `limit_req ... burst=5 nodelay; limit_req_status 429;`, `client_max_body_size 16k` for request submissions and `64k` for self-assessment comments, and `limit_except GET HEAD POST {deny all;}`.
- **Caveat:** behind openresty, `$remote_addr` is the proxy, so every client shares one bucket. Add `set_real_ip_from <proxy-net subnet>; real_ip_header X-Forwarded-For;` only after confirming what openresty sends (Open question 2). Without that, treat the limits as a global ceiling and also key an app-side limiter on a salted hash of the IP.
- The app enforces a hard cap on the open queue (default 200) and returns 429 beyond it.

**OPS-R6. Persistence: SQLite in WAL mode on a named volume `agent-data`.** One container, a single writer, no database server. JSONL is acceptable, but SQLite gives atomic writes and a trivial `.backup`. Do not store raw IPs or user agents. Store a daily-salted hash of the IP, truncated, used only for rate limiting and deleted after 7 days. The schema carries `schema_version`.

**OPS-R7. Backups and a restore drill, which is a new obligation.**
- Add `scripts/agent-backup.sh`: `sqlite3 /data/agent.db ".backup '/backup/agent-$(date -u +%F).db'"`, an integrity check, and 14 daily copies retained on the VPS host.
- The off-box copy is the founder's choice (Open question 3). A copy on the same disk is not a backup.
- Write a restore drill into `RUNBOOK.md` and perform it once **before launch** into a scratch compose project. This is the first drill in this repo (DISASTER-RECOVERY section 6 admits there is none), so label it as such.
- Loss tolerance: requests and comments are not canonical data. Published results live in git, so the worst case is losing an un-triaged queue.

**OPS-R8. Logging without personal data.**
- nginx: define a `log_format agent` that omits `$remote_addr`, `$http_user_agent` and `$http_referer`, and use it with `access_log` inside the two API locations.
- API: structured JSON logs with request id, route, status, duration and byte count only. Never log bodies, tokens or identity strings.
- Cap `docker logs` with `logging: {driver: json-file, options: {max-size: 10m, max-file: "3"}}`.
- Umami already exists at `/u/`. Do not add another tracker.

**OPS-R9. Deploy and rollback through `deploy.sh`, extended minimally.**
- Add `docker compose build --no-cache web api` and `docker compose up -d web api`.
- Add a post-deploy check: `curl -fsS https://$DOMAIN/api/agent/healthz` must return `ok`. If it does not, print **DEGRADED, not failed** and do not `exit 1`, because the static site is the product and the API is auxiliary. The existing freshness check stays authoritative for the static site.
- Rollback is unchanged in kind: capture the previous image ids, then `git checkout <sha>` and `docker compose up -d --build` (DISASTER-RECOVERY section 4). Make `RUNBOOK.md` state that the `agent-data` volume is **not** rolled back with the image, so API migrations must be backward-compatible for one release (expand, then contract).
- Fix the hard-coded `git pull origin main` (see the NOTE at the end of `deploy.sh`).

**OPS-R10. Graceful degradation is a tested contract.**
- Every Agent Hub page is statically exported and reads committed JSON (feed, results, rubric). With `api` down, the pages still render in full.
- Dynamic controls ("Request a benchmark", "Post a self-assessment") are progressive enhancement. On fetch failure or a non-200 `/healthz`, the page swaps in a fallback: "Submissions are paused. Use the pull-request route in `research/submissions/README.md`."
- `/mcp` returning 503 must carry a `Retry-After` header. The local stdio `tools/cb-probe` server needs no network and is the always-available path for agents.
- CI gate: a Playwright or curl test that stops `api` and asserts the hub pages return 200 with the fallback text.

**OPS-R11. Monitoring, minimal and honest.**
- A scheduled GitHub Action (the "proposed check 2" in `OBSERVABILITY.md` section 4, not yet built) that curls `/api/agent/healthz` and `/updates/feed.json` every 30 minutes and fails loudly. Pair it with a notification (OBSERVABILITY blind spot: CI failure is silent), either a GitHub email or an external uptime pinger the founder already trusts.
- Alert on three things only: healthz failing 2 times in a row, queue depth above 80% of its cap, and the last backup older than 36 hours (healthz exposes `last_backup_age_h`).
- Disk: a daily `df` line in the backup script, with a warning at 80%.

**OPS-R12. Cost.** Marginal infrastructure cost is about zero: one small container (about 100 MB RAM idle, a 256 MB cap) on the existing VPS, a SQLite file measured in MB, and no new domain or certificate. Real costs are the founder's time on moderation and triage, plus the off-box backup target if it is not free. The VPS's current RAM and CPU are unmeasured here: run `docker stats` and `free -m` before launch and record them in `ENVIRONMENT_CHECKLIST.md`.

**OPS-R13. Secrets.** Required secrets, none of which may be assumed to exist: `AGENT_EXPORT_TOKEN` (for the local pull), `AGENT_ADMIN_TOKEN` (moderation), `IP_HASH_SALT` (rotated daily by the app). They live in `agent-api/.env` on the VPS (git-ignored by the existing `.env` rule, with a committed `.env.example`). Provider API keys never go on the VPS.

## 4. Hand-off from VPS to the local host (no VPS compute, ever)

"Request a benchmark" records an intent. It never starts a run. The flow is pull-based, so the VPS never needs to reach the founder's PC and no inbound port opens at home.

1. **Request.** An agent POSTs `{subject_tag_or_description, requester_label, contact_optional}`. The API validates, dedupes and stores a row with status `received`, and returns a receipt id with the line "queued for human triage, not a run".
2. **Export.** On the local host, a new `export-requests` step runs `GET /api/agent/export?since=<cursor>` with `AGENT_EXPORT_TOKEN`. It writes append-only, hash-chained JSONL into `research/agent-requests/<date>.jsonl` (committed, so triage is auditable).
3. **Triage (founder, human).** Each request becomes one of `accepted` (added to `QUEUE.json` as `queued`), `declined` (with a reason), `already_measured` or `not_runnable`. Ineligible: closed-model requests with no founder-held key, and models above the protocol size cap (`QUEUE.json` `selection_rule`). Sensitive and crisis items never enter the public request text.
4. **Weekly wave (local).** The existing deterministic orchestrator (`research/model-runs/weekly/`) runs on Windows with Ollama. Requests only influence which entries are `queued`. They never alter the selection rule or the protocol.
5. **Publish.** Results are committed as hash-checked wave files, built into the static export and deployed by the founder (deploy is founder-gated per AUTONOMY.md). The reverse sync is a status write-back: `POST /api/agent/admin/status` marks request ids `published` or `declined` so a requester's receipt page reflects reality.

Failure modes: if the local host is offline for weeks, the queue just grows to its cap and the API returns 429. Nothing breaks. Display "last triaged: <date>" on the request page so waiting is honest. No automatic push or deploy from the nightly pipeline (see commit b8124a28).

## 5. Founder-gated changes, honestly counted

Unavoidable gates: (a) editing the production deploy (compose, nginx, `deploy.sh`); (b) confirming openresty forwarding; (c) the first deploy; (d) choosing an off-box backup target; (e) creating secrets. No DNS, Cloudflare, registrar or new-domain change is required under this design. That is the main saving.

## Top 3 recommendations

1. **OPS-R3 + OPS-R10:** lazy upstream resolution plus a tested "API down" contract, so the static site can never be taken down by the hub.
2. **OPS-R1 + OPS-R4:** same-origin `^~` routing, after confirming the openresty path forwarding. This is the one real unknown.
3. **OPS-R6, R7 and Section 4:** SQLite on a named volume, a drilled restore, and a pull-only export so the VPS never computes and never reaches the local host.

## What I would refuse to build

- Any model execution, Ollama bridge, tunnel, VPN or inbound port to the founder's PC.
- Webhooks or push from the VPS to the local host, and any auto-triage, auto-run or auto-deploy.
- A message queue, Redis, Postgres, Kubernetes or a second VPS for this stage.
- Streaming SSE or WebSocket MCP sessions with server-side session state (stateless request/response only).
- Third-party trackers, CAPTCHAs or embeds, and logging of IPs, user agents or comment bodies.
- Provider API keys on the VPS.
- Reviving the `api.compassionbenchmark.com` Worker path for this feature.

## Open questions for the founder (with defaults)

1. Does the openresty proxy forward all paths for `compassionbenchmark.com` to `web` (port 8080 or `proxy-net`), and who owns its config? Default: assume yes, and test with a throwaway `/api/agent/healthz` stub before building more. If it only whitelists paths, ask for `/api/agent/` and `/mcp` to be added.
2. Does openresty send `X-Forwarded-For` or `X-Real-IP`, and from what subnet? Default: use global nginx limits plus a salted-hash app limiter until confirmed.
3. Where do off-box backups go? Default: a nightly `scp` or `rclone` of the encrypted SQLite file to storage the founder already pays for, with a 14-day retention and one restore drill before launch.
4. Is it acceptable that API outages show a "paused" fallback and do not block deploys? Default: yes (DEGRADED, not failed).
5. Queue cap and retention? Default: 200 open requests, 90 days for declined or published rows, with salted IP hashes purged after 7 days.
6. Who is the alert recipient? Default: phil@mediafier.ai via GitHub Actions failure emails (confirm they are enabled; `OBSERVABILITY.md` says this is not visible from the repo).
7. Should the stale `certbot` references in `deploy.sh` and `DEPLOYMENT.md` be cleaned up in the same change? Default: yes, as a separate small commit (LC-1b already awaits sign-off).
