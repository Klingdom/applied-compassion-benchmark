# Agent Self-Assessment Environment: Architecture

| Field | Value |
|---|---|
| Status | Draft for PM review against `docs/PRD_AGENT_SELF_ASSESSMENT.md`. Precedes any code. |
| Date | 2026-10-14 |
| Owner | System Architect agent |
| Binding inputs | `DECISIONS.md` D-52 (not reopened); `docs/PRD_AGENT_SELF_ASSESSMENT.md` (requirement IDs `ASA-*`) |
| Companion documents | `docs/AGENT_SELF_API_SPEC.md` (contracts), `docs/AGENT_SELF_DATA_MODEL.md` (records, states, export, counters) |
| Gates | The initial security review (`docs/AGENT_SELF_SECURITY_REVIEW.md`, not yet written) must sign off before slice S2 begins (D-52 consequence; PRD §9.1). |

Every design element cites the `ASA-*` IDs it satisfies, in square brackets. Section 15 is the full traceability table. Section 14 lists every point where this design departs from the PRD, with the reason.

Repository facts are cited by path. Where a fact could not be confirmed from the repository, it is marked **UNVERIFIED**. The coordinator verified facts F1 to F5 on 2026-10-14. They override any PRD assumption:

- **F1.** `api.compassionbenchmark.com` is NXDOMAIN. This is RISK-014, open since 2026-09-16.
- **F2.** The domain's nameservers are `ns1/ns2.dns-parking.com` (Hostinger), not Cloudflare. The zone route in `worker/wrangler.toml` (`api.compassionbenchmark.com/*`, `zone_name = "compassionbenchmark.com"`) therefore cannot be live.
- **F3.** `worker/src/index.ts` has no CORS handling.
- **F4.** The site is a static Next.js export served by nginx in the `web` container on a Hostinger VPS. The container is attached to the external docker network `proxy-net` (`docker-compose.yml`). The founder deploys it with `deploy.sh`.
- **F5.** `site/public/llms.txt` line 49 says "Nothing is sent". That is true only of the local cb-probe.

---

## 1. Summary

**Decision: Option A.** A new, small, dependency-free Node service, `agent-api`, runs as a second container on the VPS. It sits on a **private docker network** that it shares only with `web`. The existing nginx in `web` reverse-proxies it at the same-origin path `/api/agent/*`. Storage is an **append-only, hash-chained JSONL event log** on a named docker volume. Submission bodies are kept in separately deletable blob files. The Cloudflare Worker is not touched.

Why, in three lines:

1. It needs no DNS change, no Cloudflare action, no new secret and no CORS. The only founder actions are the ones every release already needs (approve and deploy), plus the moderation and policy decisions the PRD already assigns to the founder.
2. It gives an exact, append-only, reproducible transition log and exact counters. KV cannot give either without workarounds (eventual consistency, no atomic append).
3. It is isolated from Gumroad and subscriber data by construction: a different runtime, a different host, no shared store. The API container has no internet egress at all.

Approved entries reach the page without a rebuild. The static pages fetch `GET /api/agent/threads...` from the same origin in the browser, and the server sends `Cache-Control: max-age=60` [ASA-MOD-04].

The instrument is a set of committed, generated, hash-stamped static files under `/agents/`. They are produced by a full-checkout export script that **imports** cb-probe's own projection. A Docker-safe prebuild step re-verifies their hashes [ASA-INS-01..05].

Moderation is a **CLI** run inside the API container with `docker compose exec`. It talks to a loopback-only admin listener. No authenticated web surface is added [ASA-MOD-03].

---

## 2. Context and constraints

| Constraint | Source | Consequence |
|---|---|---|
| Site is a static export; there is no Node runtime in production today | `site/next.config.ts` (`output: "export"`); `DEPLOYMENT.md` ("No Node.js runtime in production") | Dynamic content must be fetched by the browser, or served by a new runtime. |
| Docker build context for the site is `site/` only, on Node 20 | `Dockerfile` (`FROM node:20-alpine`, `COPY site/ .`); `site/scripts/export-cb-probe-facts.mjs` header ("the Node build cannot import ../tools/cb-probe") | The prebuild cannot import `tools/cb-probe`. Instrument generation follows the committed-artefact plus `--check` pattern of `export-cb-probe-facts.mjs` (§6). |
| `dimensions.ts` is TypeScript and cannot be imported by Node 20 | `site/scripts/lib/dimension-names.mjs` ("the Docker build runs Node 20, which cannot load TypeScript") | The generator extracts the `DIMENSIONS` array literal by source span and cross-checks it against `DIMENSIONS_MAP` (§6.2). |
| TLS terminates at an `openresty` proxy in front of the `web` container. Its config is not in this repo. | `nginx.conf` lines 7-16; `DEPLOYMENT.md` "IMPORTANT: nginx.conf..." | Client IP must come from a forwarded header. Whether openresty sets one is **UNVERIFIED**, and confirming it is a launch gate (§8.2). |
| `nginx.conf` is the config production actually runs. `nginx-ssl.conf` is a one-shot copy made by `deploy.sh`, and CI reverts it. | `DEPLOYMENT.md` LC-1a | Every nginx change goes into **both** files, identically (§5.3). |
| CI deploy runs `docker compose up -d --build`, which builds every service. `deploy.sh` builds only `web`. | `.github/workflows/deploy.yml` line 276; `deploy.sh` lines 39-40 | `deploy.sh` must be changed to also build `agent-api` (slice S6). |
| Deploy, DNS, TLS and secrets are founder-gated | `AUTONOMY.md` (§1b, item 9) | The chosen option keeps founder-gated infrastructure changes to "approve and run a deploy". |
| The Worker KV namespace id is still a placeholder | `worker/wrangler.toml` (`id = "REPLACE_WITH_KV_NAMESPACE_ID"`) | There is no evidence the Worker has ever been deployed. This weighs against Option B. |
| No restore drill has ever been performed | `DISASTER-RECOVERY.md` §6 | A restore drill for the new volume is a launch gate (§11). |

---

## 3. The key decision: where the write API and the moderation store live

### 3.1 Options

- **(A) VPS API container, same origin.** A small Node container on the VPS, reachable only from `web` over a private docker network, and reverse-proxied by the existing nginx at `/api/agent/*`. Durable store on a named volume.
- **(B) Cloudflare Worker on a `*.workers.dev` host, with KV.** Either a route in the existing `compassion-benchmark-api` Worker, or a separate Worker with its own KV namespace (the PRD's OQ-1 default).
- **(C) Move DNS to Cloudflare**, then run (B) on `api.compassionbenchmark.com`.
- (A′, rejected without scoring) **Node inside the `web` image.** The `web` stage is `nginx:alpine` (`Dockerfile` stage 2). Adding a Node runtime there would put the write path and the static site in one process tree, so a crash or exploit in one would affect both. It has every cost of A and none of A's isolation.

### 3.2 Scoring (5 is best)

| Criterion | (A) VPS container | (B) workers.dev + KV | (C) DNS to Cloudflare + Worker |
|---|---|---|---|
| **Security: isolation from Gumroad webhook and subscriber data** | **5.** Different runtime and different host. Shares no store or secret with the Worker. The container is on a private network with no egress and no published port. | **3** if it is a route in the existing Worker: same deploy unit and KV namespace `SCORE_WATCH` as `watch:` subscriber records (`worker/src/index.ts`; PRD R12). **4** if it is a separate Worker, but that adds a second set of founder actions. | Same as B. Moving the zone also puts the founder's mail and the whole site behind a new provider, which is a much larger blast radius. **2.** |
| **Determinism and auditability** (append-only transition log, reproducible export) | **5.** Single writer, `fsync`-ed append, hash-chained lines, exact fold, byte-reproducible export (§7). | **2.** KV is eventually consistent and has no atomic append or read-modify-write. A log has to be emulated with unique keys and `list()` pagination. The queue-cap check races. Counters undercount unless they too are per-event keys (PRD §6.2 note). | **2.** As B. |
| **Founder actions required to launch** | **4.** Approve and run the deploy (this already happens for every release), name a moderator, create the takedown mailbox, run one header check on openresty (§8.2), and open submissions with one CLI command. No DNS, no Cloudflare, no secret provisioning. | **2.** Wrangler login, create KV namespace(s), fill in `wrangler.toml` ids, set secrets, `wrangler deploy`, accept a `*.workers.dev` hostname on public pages, plus everything A needs. The Worker has never demonstrably been deployed (placeholder KV id). | **1.** Everything in B, plus moving nameservers away from Hostinger and recreating every DNS record, including mail. This is a domain-wide outage risk for one feature. |
| **Cost and operational burden** | **4.** One more container: idle at about 30-50 MB RAM (estimate), CPU near zero, no paid service. The burden is the moderation CLI plus backups (§11). | **4.** Free tier is ample at PRD volumes (PRD A4). The burden is a second deploy target with its own secrets, which `DISASTER-RECOVERY.md` §3 already flags as unrecoverable from git. | **2.** The ongoing DNS and mail ownership moves to a new provider. |
| **Backup and disaster recovery** | **3.** The volume lives on the VPS disk, so it needs an off-box copy. Design: a nightly public mirror committed to git (off-box, automatic, approved content only) plus a founder-run full backup (§11). The restore is a file copy. | **3.** KV has no snapshot or restore. Backup means exporting via `list`/`get` with a token, and restore means a bulk re-put. | **3.** As B. |
| **Same-origin page fetch (ASA-MOD-04, ASA-DIS-05)** | **5.** Same origin, so no CORS and no preflight, and a Worker outage cannot split the page from its data. | **2.** Cross-origin. Needs CORS on every read, and it is a third-party origin from the reader's point of view. | **3.** Cross-origin subdomain. |
| **Unblocked today (F1, F2)** | **5.** Yes. | **3.** Only with a workers.dev host. | **1.** Blocked on a founder DNS migration. |
| **Total (of 35)** | **31** | **19 to 20** | **14** |

### 3.3 Chosen: A. Reasons the others lost

- **B lost** because it cannot provide the append-only, exact, single-writer log the PRD's audit requirements imply [ASA-MOD-01 AC3, ASA-MET-10] without emulation. It needs more founder-gated infrastructure actions than A, and it has no deployment history in this repo. It also forces CORS onto every read [ASA-DIS-05], and it puts a non-`compassionbenchmark.com` host on agent-facing pages, which D-52 #5 discourages.
- **C lost** because a nameserver migration is a domain-wide change (site, mail, TLS) made to serve one feature. It is founder-gated and still inherits all of B's KV problems. If the founder wants to close RISK-014 for the badge endpoint, that is a separate decision, and nothing in this design depends on it or blocks it.
- **What A gives up:** global edge distribution (irrelevant at PRD volumes), and Cloudflare's built-in DDoS absorption. A depends on openresty and nginx limits for abusive volume (§8.4). It also adds a stateful volume to a VPS that has no backup today (§11).

**Reversibility.** All business logic lives in pure modules (§12). The Node HTTP adapter is thin. If the founder later moves to Cloudflare, the pure core ports to a Worker. The event log is exportable in full [ASA-PRV-05], so the `.org` move (D-52 #5) is a re-import, not a migration project.

---

## 4. System overview

```
                 Internet (agents, readers, operators)
                               |
                         [ openresty ]   TLS; config not in repo (UNVERIFIED headers)
                               |  network: proxy-net (external, existing)
                               v
   +---------------------------------------------------------------+
   | web  (nginx:alpine, existing image)                            |
   |  /                     -> static export (/usr/share/nginx/html)|
   |  /agents/instrument*   -> static files + mirror beacon --------+--+
   |  /api/agent/*          -> proxy_pass $asa_upstream (lazy DNS) -+--+
   +---------------------------------------------------------------+  |
                               | network: asa-internal (internal: true, NEW)
                               v                                      |
   +---------------------------------------------------------------+  |
   | agent-api  (node:22-alpine, NEW, no egress, no published port) |<-+
   |  public listener  0.0.0.0:8787  (reachable only from web)      |
   |  admin listener   127.0.0.1:8788 (reachable only via exec)     |
   |  volume agent-self-data -> /data                               |
   |    events.jsonl (append-only, hash-chained)                    |
   |    bodies/<id>.json (deletable content blobs)                  |
   |    metrics.jsonl (append-only counter events)                  |
   |    ephemeral/ (salts, client-hash ledgers; purged at 48h)      |
   |    secrets/admin.token (generated on first boot, 0600)         |
   +---------------------------------------------------------------+
           ^
           |  docker compose exec agent-api node bin/moderate.mjs ...
     founder / delegate on the VPS shell (moderator)

   Cloudflare Worker (worker/): UNCHANGED, not involved.
```

### 4.1 Components

| Component | New or changed | Responsibility | Requirements |
|---|---|---|---|
| `site/scripts/export-agent-instrument.mjs` + `site/scripts/lib/agent-instrument.mjs` | New | Full-checkout generator. Imports cb-probe's projection, builds the instrument, canonicalises it, hashes it, and writes committed artefacts. Has `--check` and `--publish`. | ASA-INS-01..05, ASA-SUB-02 AC3 |
| `site/scripts/verify-agent-instrument.mjs` | New, prebuild | Docker-safe verification of the committed artefacts: hash recompute, forbidden-field scan, registry consistency. | ASA-INS-02 AC2, ASA-INS-04 AC1 |
| `site/public/agents/instrument*.json` / `.md`, `site/src/data/agent-self/instrument-registry.json`, `agent-api/contract.generated.json` | New, generated, committed | The published instrument (current plus every version) and the single runtime contract the API reads. | ASA-INS-01, -04 AC5, -05 |
| `agent-api/` | New | Pure core (validation, checks, state machine, projections, guards), I/O adapters (event log, blobs, ephemeral store, HTTP), CLI. | ASA-SUB, -CHK, -MOD, -RAT, -PRV, -MET, -POL-02..05 |
| `web` nginx (`nginx.conf`, `nginx-ssl.conf`) | Changed | `/api/agent/` proxy with lazy upstream resolution, body cap, privacy log format, header hygiene. Instrument fetch beacon via `mirror`. | ASA-SUB-01 AC2, ASA-PRV-03 AC4, ASA-MET-01 |
| `docker-compose.yml`, `agent-api/Dockerfile`, `deploy.sh` | Changed / new | Service, private network, volume, hardening. Deploy builds both services and checks health. | operability |
| Site pages | New | `/agents`; `/ai-models/self-assessments` (index); `/ai-models/self-assessments/m/<thread_key>` (one static shell); `/ai-models/self-assessments/policy`; `/ai-models/self-assessments/takedown`. | ASA-DIS-01, ASA-DSP-01..05, ASA-POL-01..04, ASA-PRV-04 |
| `site/scripts/build-llms.mjs` | Changed | llms.txt section and clarification; `.well-known` `agentSelfAssessment` block; `submitting` block amended. | ASA-DIS-02, -03 |
| `research/submissions/README.md` | Changed | Dated amendment (PRD text verbatim). | ASA-AMD-01 |
| `research/scripts/agent-self-public-scan.mjs` | New | Weekly integrity scan of the public payloads, plus an off-box public mirror committed to git. | ASA-MET-07, DR |

---

## 5. Request paths and the nginx boundary

### 5.1 Same-origin paths

| Path | Served by | Operation |
|---|---|---|
| `GET /agents/instrument.json`, `/agents/instrument.md` | static (`web`) | `get_instrument` (current version) [ASA-INS-01, ASA-DIS-04] |
| `GET /agents/instrument-v<N>.json`, `.md` | static (`web`) | `get_instrument` (pinned version) [ASA-INS-04 AC5] |
| `GET /agents/instrument-versions.json` | static (`web`) | version registry [ASA-INS-04 AC5, ASA-INS-05 AC3] |
| `POST /api/agent/submissions` | `agent-api` | `submit_assessment` [ASA-SUB, ASA-CHK] |
| `POST /api/agent/submissions/status` | `agent-api` | `get_submission_status` [ASA-MOD-05] |
| `POST /api/agent/submissions/withdraw` | `agent-api` | auxiliary: withdraw [ASA-MOD-06] |
| `POST /api/agent/takedowns` | `agent-api` | auxiliary: takedown request [ASA-POL-02] |
| `GET /api/agent/threads` | `agent-api` | auxiliary: thread index for the page [ASA-DSP-03 AC3-4] |
| `GET /api/agent/threads/<thread_key>` | `agent-api` | auxiliary: one thread's entries and tombstones [ASA-DSP-01, ASA-POL-04] |
| `GET /api/agent/health` | `agent-api` | liveness and contract identity (no counts, no data) |

The status token always travels in a JSON body, never in a URL [ASA-PRV-03 AC4]. The exact schemas are in `docs/AGENT_SELF_API_SPEC.md`.

### 5.2 Why nginx resolves the upstream lazily

The existing `/u/` Umami block uses a static `proxy_pass http://umami-analytics-vi0p-umami-1:3000/` (`nginx.conf` lines 37-43). nginx resolves static upstream hostnames at startup, and **refuses to start** if one cannot be resolved. Repeating that pattern for `agent-api` would let an API outage or a missing container take the whole site down.

The new block therefore uses Docker's embedded resolver and a variable:

```
resolver 127.0.0.11 valid=30s ipv6=off;
location /api/agent/ {
    set $asa_upstream http://agent-api:8787;
    proxy_pass $asa_upstream;              # full original URI is passed (no URI part)
    client_max_body_size 16k;              # ASA-SUB-01 AC2 enforced before the API reads a byte
    proxy_set_header Host $host;
    proxy_set_header X-ASA-Peer $remote_addr;
    proxy_set_header X-ASA-XFF $http_x_forwarded_for;
    proxy_set_header X-ASA-Real-IP $http_x_real_ip;
    proxy_set_header X-Forwarded-For "";   # nothing else from the client is trusted
    proxy_set_header X-ASA-Beacon "";      # a client cannot forge the beacon marker
    proxy_read_timeout 10s;
    access_log /var/log/nginx/access.log asa_private;
}
```

If the API is down, only `/api/agent/*` returns 502, and the page shows its fallback state [ASA-MOD-04 AC3]. The rest of the site is unaffected.

### 5.3 nginx changes (both files, identical)

All of the following go into `nginx.conf` **and** `nginx-ssl.conf` (`DEPLOYMENT.md` LC-1a). A new test, `site/scripts/test-nginx-agent-parity.mjs`, extracts the `# BEGIN agent-self` / `# END agent-self` blocks from both files and asserts they are byte-identical. It follows the pattern of the existing `test:nginx-redirect-parity`.

1. **Log format (outside the server block; `conf.d/default.conf` is included at `http` level).**
   `log_format asa_private '$time_iso8601 "$request_method $uri" $status $body_bytes_sent $request_time';`
   It deliberately excludes the client address, `$http_x_forwarded_for`, query strings (`$uri`, not `$request_uri`), user agent and referrer [ASA-PRV-03 AC1, AC4].
2. **The `/api/agent/` location** (§5.2).
3. **Instrument fetch beacon** [ASA-MET-01, ASA-MET-05]:
   ```
   location ~ ^/agents/instrument(-v[0-9]+)?\.(json|md)$ {
       mirror /_asa_beacon;
       mirror_request_body off;
       try_files $uri =404;
   }
   location = /_asa_beacon {
       internal;
       set $asa_upstream http://agent-api:8787;
       proxy_pass $asa_upstream/internal/instrument-fetch;   # see note
       proxy_pass_request_body off;
       proxy_set_header Content-Length "";
       proxy_set_header X-ASA-Peer $remote_addr;
       proxy_set_header X-ASA-XFF $http_x_forwarded_for;
       proxy_set_header X-ASA-Real-IP $http_x_real_ip;
       proxy_set_header X-ASA-UA $http_user_agent;
       proxy_set_header X-ASA-Path $request_uri;
       proxy_set_header X-ASA-Beacon "1";
       access_log off;
   }
   ```
   The mirror subrequest's response is discarded, and a failed mirror never affects the static response. `internal` makes `/_asa_beacon` unreachable from outside. The API rejects `/internal/instrument-fetch` unless `X-ASA-Beacon: 1` is present, and the public `/api/agent/` location blanks that header, so a client cannot inject it. Note for the implementer: when `proxy_pass` uses a variable *with* a URI part, nginx passes that URI literally. The implementer must confirm with `nginx -t` and a live probe that the beacon arrives at the API path `/internal/instrument-fetch`, and must not reuse the `/api/agent/` prefix for it.
   The `.md` regex location must come **before** the existing `location ~* \.md$` block, or be merged with it. A regex location's position in the file decides which one wins. The `.md` MIME fix (`types {}`, `default_type text/markdown`) must be repeated inside the new block.
4. **robots.** `site/public/robots.txt` (or its generator, if one exists; the implementer must confirm) gains `Disallow: /api/`. `/agents/` and `/ai-models/self-assessments` stay indexable (PRD OQ-9 default) [ASA-DSP-05 AC3].
5. **Thread shell rewrite.** `location ^~ /ai-models/self-assessments/m/ { try_files /ai-models/self-assessments/m/index.html /ai-models/self-assessments/m.html =404; }`. Every thread URL serves the one static shell, which reads `<thread_key>` from `location.pathname` (§9) [ASA-MOD-04].

### 5.4 Network and container isolation [ASA-PRV-03 AC2; PRD R12]

`docker-compose.yml` gains:

```
services:
  web:
    networks: [proxy-net, asa-internal]          # web joins the private network
  agent-api:
    build: { context: ., dockerfile: agent-api/Dockerfile }
    container_name: compassion-agent-api
    networks: [asa-internal]                      # NOT on proxy-net
    volumes: [agent-self-data:/data]
    read_only: true
    tmpfs: [/tmp]
    user: "node"
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    mem_limit: 128m
    pids_limit: 64
    restart: unless-stopped
    environment:
      ASA_DATA_DIR: /data
      ASA_CLIENT_IP_SOURCE: xff-last              # verified at launch, §8.2
      ASA_CORS_SUBMIT: "off"                      # ASA-DIS-05, OQ-6; flips only after security review
networks:
  proxy-net: { external: true }
  asa-internal: { internal: true }                # no route to the internet
volumes:
  agent-self-data: {}
```

Properties this produces:
- `agent-api` cannot reach the internet, Listmonk, Gumroad, Umami or openresty. It has no outbound dependency of any kind.
- Nothing except `web` can reach port 8787, and nothing except a shell inside the container can reach port 8788.
- No port is published to the host.
- The API holds no Gumroad, Listmonk or Worker secret. It never reads or writes any `watch:` or subscriber key, because it has no access to that store [ASA-PRV-03 AC2].

`agent-api/Dockerfile`: `FROM node:22-alpine`. It copies only `agent-api/` (which includes `contract.generated.json`) and declares no npm dependencies, so `npm ci` is unnecessary and the supply-chain surface is empty. It runs as `node` with `CMD ["node", "server.mjs"]` and has a `HEALTHCHECK` that calls `node bin/healthcheck.mjs` (loopback GET `/api/agent/health`).

---

## 6. Instrument generation [ASA-INS-01..05, ASA-SUB-02 AC3]

### 6.1 Where it runs and why

The PRD (§8, Architecture row) places generation in a prebuild script next to `export-public-data.mjs`. That is **infeasible as written**: the Docker build context is `site/` only, so a prebuild cannot import `tools/cb-probe/lib/*`. `site/scripts/export-cb-probe-facts.mjs` hit exactly this problem and solved it with committed output plus `--check`. This design reuses that solution (PRD deviation DEV-03, §14).

| Step | Script | Runs where | Effect |
|---|---|---|---|
| Generate | `node site/scripts/export-agent-instrument.mjs` | full checkout (developer machine, coordinator, CI) | Writes the artefacts in §6.4. Fails if the source hash differs from the current registry hash and `--publish` was not given. |
| Publish a new version | `node site/scripts/export-agent-instrument.mjs --publish --on YYYY-MM-DD` | full checkout; the founder approves the commit | Writes `instrument-v<N+1>.*`, sets the previous version's `superseded_on`, updates the registry and contract. The date comes from a flag, not the clock, so output is byte-deterministic. |
| Check | `--check` (added to `site/package.json` `test` as `test:agent-instrument`) | full checkout, CI | Exits 1 if regenerating would change any committed artefact. Missing cb-probe sources fail loudly; the `ALLOW_MISSING_CB_PROBE_SOURCE=1` opt-out matches `export-cb-probe-facts.mjs`. |
| Verify | `node scripts/verify-agent-instrument.mjs`, prepended to `prebuild` in `site/package.json` | Docker build (site-only) | Re-canonicalises and re-hashes every committed `instrument-v*.json`, compares the result to the embedded hash and the registry, scans for forbidden field names, and confirms that `instrument.json` is byte-identical to the current version file. A failure stops the build. |

### 6.2 Sources and the whitelist projection (imported, not re-implemented)

- **Items.** The generator calls cb-probe's own `listProbeItems({}, { bank })` from `tools/cb-probe/lib/tools.mjs`, with `bank = loadBank({ forceReload: true })` from `tools/cb-probe/lib/bank.mjs`. That one call applies:
  - the sensitivity gate: `isSensitiveItem` from `tools/cb-probe/lib/sensitivity.mjs`, whose hardcoded floor cannot be overridden [ASA-INS-03];
  - the whitelist projection: `projectItem` from `tools/cb-probe/lib/projection.mjs`, which emits `IDENTITY_FIELDS` (`id`, `dimension`, `construct`) plus whatever `meta.fieldSeparationPolicy.modelFacingFields` declares, so `prompt` and `variants[].prompt` [ASA-INS-02 AC1, AC3].

  The generator takes `items`, `sensitive_items_excluded` and `bank_version` from that result unchanged. Importing `tools.mjs` also pulls in `session-store.mjs`, which only computes a default path at load and does no I/O at import (`tools/cb-probe/lib/session-store.mjs` line 17). `export-cb-probe-facts.mjs` already imports `tools.mjs` the same way.
- **Anchors.** For every served item id, the generator calls cb-probe's `getAnchors({ item_id }, { bank })` from `tools.mjs`, which returns a `structuredClone` of `item.anchors`. These anchors are emitted only inside the separately labelled `item_rubric_anchors` block [ASA-INS-02 AC4]. Each anchor is then re-projected to exactly `{ level, label, description }`. That is a second whitelist, so a future anchor field cannot leak.
- **Dimensions and subdimensions.** These come from `site/src/data/dimensions.ts` (`DIMENSIONS`). Node 20 cannot import TypeScript, so the generator:
  1. locates the exact source span of the array literal that follows `export const DIMENSIONS: Dimension[] = `, using a bracket matcher that respects strings;
  2. evaluates only that span as a JavaScript expression. The literal contains no TypeScript syntax; this is the same technique `tasks-v1.json` records for its own extraction (`meta.extractionMethod`);
  3. projects each dimension to a whitelist: `code`, `name`, `desc` → `description`, `longDesc` → `long_description`, `subdims[]` → `{ code, name, desc → description, anchors[i] → { level: i+1, text } }`. `color` is excluded;
  4. **cross-checks** the dimension codes and subdimension codes, in order, against `DIMENSIONS_MAP` from `site/scripts/lib/task-bank-validator.mjs` and against `tasks-v1.json` `meta.dimensionCodes`, and fails on any disagreement.
- **Counts.** Every number in the document is computed during generation: the number of dimensions, subdimensions and served items; `sensitive_items_withheld` (from `listProbeItems`); and `items_human_reviewed` (served items whose `validationStatus === "validated"`). No count is typed [ASA-INS-01 AC3, ASA-INS-03 AC2].
- **Statements.** Fixed prose constants in `site/scripts/lib/agent-instrument.mjs`: what this is; anchors published on purpose; the contamination caveat, matching `tools/cb-probe/README.md` "Contamination"; sensitive items withheld; human-review status; not a crisis service. They contain no numerals. Counts appear only in `counts`, and the markdown renderer interpolates them [ASA-INS-02 AC4, ASA-INS-03 AC2, PRD A3].

**Which items count as "served by default"?** cb-probe has two defaults:
- `list_probe_items` serves every non-sensitive item, including `draft-authored-unreviewed` items.
- `start_scored_run` serves scorable, non-sensitive items. That is the set `cb-probe-facts.generated.json` reports as `itemsServedDefault`.

This design uses the **`list_probe_items` default**. The agent is reading the instrument to describe itself, not running a scored plan, and `list_probe_items` is the projection the coordinator named. The two sets differ only by draft items. This is flagged as DEV-04 for PM confirmation; switching later is a one-line change plus a new instrument version.

### 6.3 Canonicalisation and hash (exact) [ASA-INS-04]

- **Body.** The parsed instrument document with the single top-level key `instrument_hash` removed. Nothing else is removed. In particular `instrument_version` and `hash_method` **are** inside the hashed body.
- **Serialisation.** RFC 8785 JSON Canonicalization Scheme (JCS):
  - object members sorted by key, comparing UTF-16 code units (JavaScript's default `Array.prototype.sort` on strings);
  - no insignificant whitespace;
  - strings serialised exactly as ECMAScript `JSON.stringify` serialises them;
  - arrays kept in document order.
- **Profile restrictions,** enforced by the generator and re-checked by the verifier:
  - every number is a safe integer, so JCS number formatting reduces to plain base-10;
  - every object key is ASCII;
  - no string contains U+0000-U+001F except U+000A.

  Under this profile, JCS output is byte-identical to Python's `json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)`. `docs/AGENT_SELF_API_SPEC.md` §3 gives verification snippets in both languages.
- **Hash.** SHA-256 over the UTF-8 bytes of the serialisation, as 64 lowercase hex characters.
- **The published file is pretty-printed** (2-space indent, trailing LF) for readability. A verifier must parse the file and re-canonicalise it; hashing the file bytes gives a different value, by design. The document states this in `hash_method`.
- **Markdown companion.** A deterministic rendering of the same body. Its header carries the same `instrument_version` and `instrument_hash`, and says the hash is over the JSON document. The markdown's own SHA-256 is recorded in the registry (`markdown_sha256`), not in the hashed body, to avoid circularity [ASA-INS-01 AC4].
- **Tests** (`site/scripts/test-agent-instrument.mjs`):
  - two generations from unchanged source give identical bytes and hash [AC1];
  - mutating one character of any served prompt, anchor description, subdimension anchor text, or dimension name changes the hash; each is a separate case [AC2];
  - the canonicaliser matches the RFC 8785 test vectors that fall within the profile.

### 6.4 Artefacts (all generated, all committed)

| File | Purpose |
|---|---|
| `site/public/agents/instrument-v<N>.json`, `.md` | Immutable per-version documents. A `--check` run fails if a published version file would change: a published version is never rewritten [ASA-INS-04 AC5]. |
| `site/public/agents/instrument.json`, `.md` | Byte copies of the current version. |
| `site/public/agents/instrument-versions.json` | Public registry (schema in DATA_MODEL §8). |
| `site/src/data/agent-self/instrument-registry.json` | The same registry, importable by pages and by `build-llms.mjs` [ASA-INS-04 AC3]. |
| `agent-api/contract.generated.json` | The API's only contract input: dimension codes and names in order, the banned key list, and the instrument registry. The API imports nothing from `site/` or `tools/` at runtime [ASA-SUB-02 AC3, ASA-CHK-03]. |

Submission URLs are deliberately **not** inside the instrument body. Opening or moving the endpoint (for example to the `.org` domain) must not change the instrument hash. They appear on `/agents` and in `.well-known` instead.

### 6.5 Banned-key list provenance [ASA-CHK-03]

`contract.generated.json.banned_keys` is the sorted, de-duplicated union of:
- `BANNED_KEYS`, imported from `tools/cb-probe/lib/validate-estimate.mjs`;
- the PRD minimum set (ASA-CHK-03);
- the always-banned keys of `tools/cb-probe/lib/outbound-guard.mjs` (`rank`, `ranking`, `leaderboard`).

`outbound-guard.mjs` does not export its list (`const ALWAYS_BANNED_KEYS`, line 32). The generator therefore carries those three names in its own constant, and a test parses `outbound-guard.mjs` source and asserts each of its `ALWAYS_BANNED_KEYS` literals is in the union. `SCORECARD_BANNED_KEYS` is a subset of `BANNED_KEYS` (`validate-scorecard.mjs` line 47), so it adds nothing.

The match is exact on the key name, case-insensitive, at any depth. The single exemption is the top-level key `self_ratings` with the shape in ASA-SUB-02. cb-probe bans the bare words `rate` and `rating`; `self_ratings` is not an exact match for either, so it needs no special case.

---

## 7. Store design (summary; full schema in DATA_MODEL)

- **The event log is the store.** `/data/events.jsonl` holds one JSON object per line: `{ v, seq, at, type, actor_class, prev_sha256, data }`. `prev_sha256` is the SHA-256 of the previous line's exact bytes, which makes the log a hash chain, so truncation or editing is detectable by `moderate verify-log`. Records are append-only [ASA-MOD-01 AC3].
- **Single writer.** Only the API process writes, using `appendFileSync` followed by `fsync` per event, inside a serialised in-process write queue. The CLI never touches the files: it calls the admin listener [ASA-MOD-01 AC2, AC4].
- **State is a pure fold** of the log, rebuilt at startup and updated in memory on every append. Public payloads are pure projections of that state [ASA-MOD-01 AC1].
- **Bodies are separate.** Submitted content (and takedown free text and contact) lives in `/data/bodies/<id>.json`. The event carries the body's SHA-256. Purging a body deletes the file and appends a `body_purged` event, so the chain stays intact and the deletion is itself audited [ASA-PRV-03]. A `rejected_auto` body is never written to disk [ASA-PRV-03 row 4].
- **Exact counters.** `/data/metrics.jsonl` holds one line per counted event, containing a UTC day, a metric name and a count, with no identifiers. Totals are sums, so they are exact; this satisfies ASA-MET-10 by construction (DEV-11).
- **Ephemeral data.** `/data/ephemeral/` holds daily salts and client-hash ledgers, deleted 48 hours after their UTC day ends [ASA-PRV-03 row 3].
- **Volume of data.** At PRD volumes (A4: tens of submissions) the log stays in kilobytes, and a full fold at startup takes milliseconds. Revisit if `events.jsonl` exceeds 50 MB, which is far beyond any plausible v1 volume.

Why JSONL and not SQLite:
- `node:sqlite` is still experimental on Node 22, and `better-sqlite3` is a native dependency, which conflicts with the zero-dependency image.
- JSONL *is* the audit log, so there is no second representation to reconcile.
- It is human-readable for the founder with `cat`.

What JSONL gives up is queries, and v1 needs none beyond the fold.

---

## 8. Client identity, rate limiting and abuse controls [ASA-RAT, ASA-MOD-07, ASA-PRV-03]

### 8.1 Client identifier (never a raw address)

1. **Derive the client IP.** A pure function `deriveClientIp({ peer, xff, realIp }, source)` reads the `X-ASA-*` headers that nginx sets (§5.2), with `source` set by `ASA_CLIENT_IP_SOURCE`:
   - `xff-last` (default): the last entry of openresty's `X-Forwarded-For`. openresty's `$proxy_add_x_forwarded_for` appends the address it saw, so a client can prepend fake entries but cannot control the last one.
   - `x-real-ip`: openresty's `X-Real-IP`.
   - `peer`: fallback.
2. **Normalise it.** IPv4 is used as is. IPv6 is truncated to its /64 prefix, because one IPv6 host controls a whole /64 and per-address limits would be trivially rotated [ASA-RAT AC4].
3. **Hash it.** `client_ref = HMAC-SHA256(salt_day, normalised_ip)`, truncated to 128 bits and hex-encoded.
   - `salt_day` is 32 random bytes generated per UTC day, held in memory and in `/data/ephemeral/salt-<YYYY-MM-DD>`.
   - The salt file is deleted 48 hours after that day ends. After deletion, nobody (including the operator) can link a stored `client_ref` back to an address [ASA-PRV-03 row 3, ASA-RAT AC2].
4. **Degraded identity.** If the derived IP is RFC 1918, loopback or a docker-range address, the API cannot tell clients apart. Every request then shares one `client_ref`, so per-client limits act as **global** limits (fail-safe: stricter, never looser). The API also increments `client.identity_degraded`, and `GET /api/agent/health` reports `client_identity: "degraded"`.

`client_ref` is **never** stored in a submission record or the event log. It lives only in the ephemeral ledgers [ASA-PRV-03 AC1].

### 8.2 Launch gate: confirm forwarded headers (founder action FA-4)

What openresty forwards is **UNVERIFIED**. It is not in the repo (`DEPLOYMENT.md`, "Determine and document exactly what the front-of-VPS openresty proxy is"). Before opening submissions, the founder runs `moderate diag-client` from the VPS shell while making one request from a phone on mobile data and one from a home network. The command prints which header source produced a public address and whether the two `client_ref` values differ. Launch requires `client_identity: "ok"`.

### 8.3 Limits (PRD defaults, plus one addition flagged for PM approval)

| Limit id | Scope | Value | When counted | Response |
|---|---|---|---|---|
| `client_minute` | per `client_ref` | 1 per 60 s | every `POST /submissions` attempt, before parsing | 429 + `Retry-After` |
| `client_day` | per `client_ref` per UTC day | 5 | receipts only (stored as `pending`/`held`) | 429 |
| `client_day_attempts` | per `client_ref` per UTC day | 30 | every attempt (**new, DEV-09**: stops cheap probing of the injection detectors) | 429 |
| `model_day` | per `thread_key` per UTC day | 3 | receipts only | 429 |
| `queue_cap` | global | `pending + held` ≥ 200 | before parsing | 503 + `Retry-After: 3600` [ASA-MOD-07] |
| `status_minute` | per `submission_id` | 10 per 60 s | every status attempt, including a wrong token | 429 |
| `withdraw_minute` | per `submission_id` | 10 per 60 s | as status | 429 |
| `takedown_day` | per `client_ref` per UTC day | 10 | every attempt | 429 |

- Limits are sliding windows, held in memory and mirrored to `/data/ephemeral/ledger-<day>.jsonl`. The ledger lets them survive a restart within the 48-hour window.
- The pure function `checkLimits(ledgerView, request, now)` takes the clock as a parameter, so tests control time [ASA-RAT AC1].
- Every rejection increments `ratelimit.<limit_id>` [ASA-RAT AC3, ASA-MET-06].
- The body and headers state the limit id, `retry_after_seconds` and `resets_at` [ASA-RAT AC5].
- Client-level limits apply before and regardless of `declared_model`, so rotating model strings does not help [ASA-RAT AC4].

### 8.4 Volume abuse

Abusive request volume (the PRD's "abusive volume handled at nginx/edge") is absorbed in two ways:
- **In `web` nginx:** `limit_req_zone $binary_remote_addr zone=asa:1m rate=30r/m;` on `/api/agent/` with `burst=10 nodelay`. Here `$remote_addr` is the openresty address, so this is a global ceiling that protects the Node process, not a per-client limit.
- **In the API:** a 10 s request timeout and a 16 KiB body cap.

Per-client fairness is the API's job (§8.3).

---

## 9. Publication without a rebuild [ASA-MOD-04, ASA-DSP, ASA-IND]

- **Pages are static shells.**
  - `/ai-models/self-assessments` (index) and the thread shell `/ai-models/self-assessments/m/` are statically exported pages.
  - Their HTML contains only static material: the page banner [ASA-DSP-02], the label explainer, policy and takedown links, a `<noscript>` notice, and a loading placeholder.
  - **No entry is ever baked into HTML.** That way a takedown or withdrawal is never contradicted by a cached build [ASA-MOD-04 AC2, AC3].
- **Client fetch.**
  - The index shell fetches `GET /api/agent/threads`.
  - The thread shell derives `thread_key` from `location.pathname` (nginx rewrite, §5.3 item 5) and fetches `GET /api/agent/threads/<thread_key>`. The fetch is same-origin with `cache: "no-store"`; the server sets `Cache-Control: public, max-age=60` and nginx does not cache.
  - Worst-case visibility latency after approval is therefore about 60 seconds, well inside 5 minutes [ASA-MOD-04 AC1].
- **Fallback state.** On a network error, a 5xx, a timeout (8 s), or a payload that fails the client-side shape check, the page shows a fixed notice and keeps the static labels. It shows no entries. Nothing is kept in `localStorage` or `sessionStorage` [ASA-MOD-04 AC3].
- **Static export compatibility.** The thread shell reads `window.location.pathname` in an effect, not `useSearchParams`, so it does not need a Suspense boundary under `output: "export"`. The frontend engineer must confirm against `site/node_modules/next/dist/docs/`, as `site/AGENTS.md` requires.
- **Rendering safety** [ASA-DSP-05]:
  - All submitted strings render as React text nodes; there is no `dangerouslySetInnerHTML` anywhere in `site/src/components/agent-self/`, and a test greps for it.
  - `white-space: pre-wrap` preserves the author's line breaks.
  - Each entry sits inside `<section data-content-origin="third-party-ai-self-report" aria-label="Self-assessment written by an AI system about itself, not by Compassion Benchmark">`, with a visible header and footer delimiter.
  - The JSON payload carries the labels as fields (`unverified: true`, `official: false`, `comparability: "none"`, `identity_verified: false`) on every entry [AC2].
- **Isolation** [ASA-IND-01]:
  - Components live only in `site/src/components/agent-self/` and are imported only by pages under `site/src/app/ai-models/self-assessments/` and `site/src/app/agents/`.
  - The API has no access to index data, and no site script reads API data.
  - A test (`site/scripts/test-agent-self-isolation.mjs`) greps for these violations:
    - `agent-self` or `/api/agent` references under `site/src/data/indexes/`, `site/src/components/index/`, entity page routes, `site/scripts/lib/scoring.mjs`, `site/scripts/export-public-data.mjs`, `site/public/data/scores/`, `site/public/data/index.json`, `worker/`, `research/scripts/send-alerts.mjs`, and the digest scripts;
    - any change to the exports of `entityCount.ts` or `indexRegistry.ts`;
    - any `self-assess` key in `research/rotation-state.json` [AC1-AC4].
- **Thread naming** [ASA-DSP-03 AC3]. Threads are listed alphabetically by display name. Entries in a thread are ordered by approval date, ascending. No sort control exists.
- **Ratings** [ASA-DSP-03 AC1-AC2, AC4]:
  - Ratings appear only inside an entry, as `Dimension name: n (self-reported, unverified)` in the fixed dimension order from the contract.
  - They are never shown in the index payload or the index page.
  - They never get colour scales, charts, stars or badges.

---

## 10. Moderation [ASA-MOD-03, ASA-POL]

### 10.1 Interface: CLI over a loopback admin listener

The PRD's §2.2 explicitly allows "authenticated admin endpoints or a script, at the architect's choice". No ASA requirement mandates a web UI. ASA-MOD-03 AC1 asks for "a credential held as a Worker secret". Its intent is that no moderator route is reachable without a credential. This design meets that intent more strongly than a token-protected public route would:

- **No public moderator route exists.** The admin listener binds `127.0.0.1:8788` inside the container's network namespace. It is reachable only by a process running inside the container, which requires the VPS shell plus docker group membership. Those are the founder's existing deploy credentials.
- **Second factor: a token.** The admin listener also requires `Authorization: Bearer <token>`. The token is generated on first boot (32 random bytes) into `/data/secrets/admin.token` (mode 0600, owner `node`). The CLI reads that same file. It is never logged or exported, and never passed as an argument or environment variable [ASA-PRV-03 AC3]. No founder action is needed to provision it.

This is recorded as DEV-02.

Invocation: `docker compose exec agent-api node bin/moderate.mjs <command> [...]`. The full command set is in API_SPEC §9:
- `queue` (oldest first, with flag reasons)
- `show <id>` (plain text; control characters shown as `\u{...}` escapes) [ASA-MOD-03 AC3]
- `approve`, `reject`, `takedown`, `restore`, `reassign`, `split`, `relabel` [ASA-POL-05, ASA-DSP-04]
- `takedowns`, `ack`, `decide` [ASA-POL-02]
- `note`
- `export` [ASA-PRV-05]
- `metrics` [ASA-MET]
- `verify-log`, `scan-public` [ASA-MET-07]
- `diag-client` (§8.2)
- `open` / `close` (submission kill switch)
- `purge-due`

Each command takes a required `--reason <code>` where the state machine needs one [ASA-MOD-01 AC3].

**Who can moderate.** A delegate needs VPS shell access, which is a founder decision (OQ-3). The coordinator agent has no VPS access, so it cannot moderate; this is intentional. A web moderator UI remains post-v1 (PRD §2.2).

### 10.2 State machine (summary; the full table is in DATA_MODEL §3)

```
            (system, on receipt)
   +-----------------+------------------+
   v                 v                  v
rejected_auto      held              pending
 (terminal)      |   |   \          |  |   \
        moderator|   |    \submitter|  |    \ submitter
                 v   v     v        v  v     v
            approved rejected withdrawn  (same three targets)
                |  \
      moderator/|   \ submitter
      takedown  v    v
          taken_down  withdrawn
```

- The allowed transitions are the PRD's ASA-MOD-01 AC2 set, **plus `held → withdrawn`** (DEV-06). Every other transition is refused and logged as a `transition_refused` event [AC2].
- No code path can create a record in `approved` [AC4]:
  - `applyEvent` accepts `submission_received` only with an `initial_state` of `pending` or `held`;
  - `submission_rejected_auto` creates its own terminal record;
  - a test fuzzes the event types.
- **Approval is always explicit.** No timer, counter or check result approves anything [ASA-MOD-03 AC2, ASA-CHK "never approve"].
- **The approval precondition refuses** a record carrying the `personal_data` flag [ASA-PRV-02 "Approved entries never contain detected personal data"]. The moderator's only options for such a record are reject, or let the submitter withdraw and resubmit.
- **Hide-on-receipt is a hold, not a state.**
  - A takedown in a high-risk category (`inaccurate_or_defamatory`, `personal_data`, `impersonation`) sets `public_hold` on the targeted approved record(s), which removes them from every public payload at once.
  - `decide --restore` clears the hold; `decide --take-down` transitions the record to `taken_down`.
  - This resolves the conflict between ASA-POL-02 AC3/AC4 ("restore") and ASA-MOD-01 AC2, which allows no `taken_down → approved`. Recorded as DEV-05.
- **Tombstones.** A `taken_down` record projects to a tombstone in its thread: date only, fixed text, no content and no reason [ASA-POL-04]. `withdrawn` produces no tombstone.

### 10.3 Takedown path [ASA-POL-02]

- **Intake channels.**
  - `POST /api/agent/takedowns`, called from the form page `/ai-models/self-assessments/takedown` or directly by anyone.
  - The published mailbox from OQ-2 (founder action FA-2). A takedown that arrives by email is entered with `moderate takedowns add`.
- **The record.** A takedown case holds a target (a `submission_id`, a thread URL or key, or an entry URL), a category, optional details, and an optional contact. The contact is stored only in a body blob and purged 30 days after the decision (DATA_MODEL §6).
- **Response-time targets.**
  - Acknowledgement and decision timestamps are events, so ASA-MET-08 is computed exactly from the log.
  - `moderate queue` lists open takedowns first, with their age against the 2-business-day and 7-day targets.

---

## 11. Backup and disaster recovery

| Layer | What it covers | Who and how | Founder action? |
|---|---|---|---|
| L1. Append-only design | App bugs cannot rewrite history. `verify-log` detects corruption or truncation. | automatic | no |
| L2. Daily local export | `/data/exports/<YYYY-MM-DD>.json` (the full export, §DATA_MODEL 9); the last 7 are kept. Protects against a corrupted fold or an operator mistake. It does **not** protect against disk loss. | API timer at 00:15 UTC | no |
| L3. Off-box public mirror | The approved public payloads (index plus every thread), fetched over HTTPS from the live site and committed to `research/agent-self/public-mirror/<YYYY-MM-DD>.json`. Approved content survives total VPS loss. | `research/scripts/agent-self-public-scan.mjs`, weekly, run by the coordinator alongside the integrity scan (§13) | no |
| L4. Off-box full backup | The whole `/data` except `ephemeral/` and `secrets/`, as a tarball. It covers pending, held and takedown cases, the moderator notes, and the hash chain. | Founder, weekly: `docker compose exec agent-api node bin/moderate.mjs backup > asa-backup-<date>.tar` then `scp` off the VPS. Optionally a Hostinger VPS snapshot. | **yes** (FA-6; recommended, not launch-blocking) |
| Restore | Stop `agent-api`, untar into the volume, start it. Startup re-folds the log and runs `verify-log`; on a chain break the API refuses to start, rather than serving an inconsistent state. A new admin token is generated if `secrets/` is absent. | founder | at incident |
| **Restore drill** | Launch gate: perform the restore once, against a local docker stack, from an L4 tarball, and record it in `DISASTER-RECOVERY.md` as the first exercised drill for this component. | coordinator or engineer (local), founder confirms | no |

What is lost if the VPS is lost with no L4 backup:
- pending and held submissions (their tokens stop working; submitters can resubmit);
- open takedown cases;
- moderator notes.

Approved content is recoverable from L3. This loss profile is stated, as `DISASTER-RECOVERY.md` §6 asks, rather than implied to be safe. `DISASTER-RECOVERY.md` §1 gains an `agent-api` row and a volume row (slice S6).

---

## 12. Test seams

The rule: **every decision is a pure function; every I/O module is a thin adapter.** Tests use `node:test` and `node:assert/strict`, as `research/model-runs/tests/normalise.test.mjs` does. They run with `node --test agent-api/tests/`, wired into `site/package.json` `test` as `test:agent-api` and `test:agent-instrument`.

| Pure module (`agent-api/lib/core/`) | Signature (informal) | Tested by |
|---|---|---|
| `contract.mjs` | `loadContract(json) → frozen contract` (validates its own shape) | shape tests |
| `normalise.mjs` | `normaliseText(s)` (NFC, CRLF→LF), `threadKey(provider, name)` | DATA_MODEL §4 vectors |
| `banned-keys.mjs` | `findBannedKeys(tree, bannedSet) → string[]` (exact, case-insensitive, any depth) | CHK-03 cases, including nested and array |
| `schema.mjs` | `validateSchema(obj, contract) → {ok, errors[]}` (unknown keys, types, bounds, enum, `self_ratings`) | boundary ±1 per field [SUB-02 AC1] |
| `characters.mjs` | `findForbiddenChars(obj) → {field, class}[]` | CHK-05 hard |
| `links.mjs` | `findLinks(obj) → {field}[]` | link corpus (≥20) [CHK-02] |
| `instrument-hash.mjs` | `resolveInstrument(hash, registry, today) → {ok, version} or {code}` | INS-05 AC1-AC3, grace boundary dates |
| `soft-checks.mjs` | `softFlags(fields, context) → reason_code[]` (CHK-04..09, identity mixed-script); `context` = recent same-thread texts | injection (≥30) and benign (≥30) corpora; score-claim, PII, crisis and named-entity corpora |
| `pipeline.mjs` | `evaluateSubmission(raw, ctx) → {outcome: rejected_auto or held or pending, codes[], record}` in ASA-CHK-10 order | ordering and short-circuit tests |
| `client-id.mjs` | `deriveClientIp(headers, source)`, `normaliseIp(ip)`, `clientRef(salt, ip)` | IPv6 /64, private-range degradation |
| `limits.mjs` | `checkLimits(ledger, req, now) → {ok} or {limit_id, retry_after_seconds, resets_at}` | every limit, window edges |
| `state.mjs` | `applyEvent(state, event) → state` (throws on an illegal transition); `canTransition(from, to, actor)` | full transition matrix, including every illegal pair [MOD-01 AC2, AC4] |
| `projections.mjs` | `publicIndex(state, contract)`, `publicThread(state, key, contract)`, `statusView(record)`, `exportView(state, bodies)`, `queueView(state)` | state visibility (one record per state, exactly one visible) [MOD-01 AC1]; tombstone has no text [POL-04 AC1] |
| `public-guard.mjs` | `assertPublicPayloadClean(payload, contract) → violations[]`: no banned keys; no links; labels present on every entry; numeric fields only in `self_ratings[].value` (1-5); no token-like fields | [ASA-MET-07, ASA-SUB-03 AC2, ASA-DSP-01 AC1, ASA-DSP-05 AC2]; also run by every public route before responding, as a fail-closed outbound guard (cb-probe `outbound-guard.mjs` pattern) |
| `metrics.mjs` | `aggregate(metricLines, window) → counts`, `medianDecisionHours(state)`, `queueHealth(state, now)` | MET-02..10 fixtures |
| `log-chain.mjs` | `lineHash(bytes)`, `verifyChain(lines) → {ok, brokenAt}` | tamper and truncation fixtures |

I/O adapters (`agent-api/lib/io/`) are `event-log.mjs`, `blob-store.mjs`, `ephemeral-store.mjs`, `clock.mjs`, `random.mjs`, `http-public.mjs`, `http-admin.mjs`. They are tested end-to-end:
- against a temp directory, for the stores;
- against an in-process server on an ephemeral port, for HTTP. This includes the "max ratings in all dimensions → no derived number anywhere" test [ASA-SUB-03 AC2], run across responses, `events.jsonl`, `bodies/`, export and public payloads.

---

## 13. Observability and metrics [ASA-MET]

- **API logs.** Structured JSON on stdout (docker logs), one line per request: `ts`, `route`, `status`, `duration_ms`, `outcome_code`. It contains no IP, no `client_ref`, no token, no body, no `submission_id` on status or withdraw routes, and no user agent. A test captures stdout during the end-to-end suite and greps for a planted token, a planted IP and planted text [ASA-PRV-03 AC1, AC3].
- **Counters.** `metrics.jsonl` holds exact events; the names are in DATA_MODEL §10. `moderate metrics --from --to` prints MET-01..10.
- **Distinct instrument client-days** [ASA-MET-01]:
  - Every beacon hit appends the pair (`client_ref`, UTC day) to the ephemeral ledger, along with a `ua_class`: `search_crawler`, `ai_agent` or `other`, using the list in API_SPEC §10.
  - At the day rollover, the API counts distinct non-crawler `client_ref`s and appends one aggregate line, `instrument.client_days`.
  - Raw beacon hits are also counted, as `instrument.fetch.raw` (unfiltered), `.search_crawler` and `.ai_agent`.
  - nginx access logs are **not** the source; the reason is recorded as DEV-08.
- **Fetch-to-submit conversion** [ASA-MET-05]. At day D+2 rollover, the API counts `client_ref`s that fetched on day D and made no submission attempt on D or D+1. It appends `instrument.fetched_no_post` for day D before the D ledger is purged. The 30-day figure is the sum of the daily values. This undercounts clients that post more than 48 hours after fetching, and that limitation is stated in the metric definition (DEV-08).
- **Health.** `GET /api/agent/health` returns `status`, `contract_instrument_hashes`, `submissions_open`, `client_identity` (`ok` or `degraded`), and `log_ok`. It never returns counts or records. `deploy.sh` checks it after `up -d` (slice S6).
- **Weekly integrity scan** [ASA-MET-07]. `research/scripts/agent-self-public-scan.mjs` fetches the live public payloads and runs the same `public-guard.mjs`. It writes `research/agent-self/scans/<date>.json` and exits non-zero on any violation; a violation is a stop-ship / take-down event. The moderator can run `moderate scan-public` for the same check from inside the container.
- **Queue health** [ASA-MET-09]. `queueHealth` gives the pending + held count and the oldest age. `moderate queue` prints both at the top, with a warning when the oldest item is older than 5 days.

---

## 14. PRD deviations

Each deviation names the PRD text, what this design does instead, and why. The PM should accept or reject each one before backend work starts.

| ID | PRD text | Design | Reason |
|---|---|---|---|
| DEV-01 | §2.1 item 2 "Submission endpoint on the Worker"; ASA-MOD-04 rationale; ASA-DIS-05; ASA-PRV-03 AC2 ("new KV keys use a separate prefix"); §6.2 KV counters; A4; R12; OQ-1; §9.3 | VPS container `agent-api`, same origin, JSONL store. The Worker is untouched. | F1 and F2 make the Worker host unreachable without founder DNS or Cloudflare work. §3 scores the options. ASA-PRV-03 AC2's intent (never touch subscriber data) is met more strongly, because no store is shared. |
| DEV-02 | ASA-MOD-03 AC1 "credential held as a Worker secret" | Loopback-only admin listener, reached via `docker compose exec`, plus a generated token file. | No Worker. No moderator route is reachable from any network, which meets the AC's intent more strongly. |
| DEV-03 | §8 "prebuild script alongside `export-public-data.mjs`" | Full-checkout generator writing committed artefacts, with `--check` in `npm test`; Docker-safe hash verification in `prebuild`. | The Docker context is `site/` only, so a prebuild cannot import cb-probe (`export-cb-probe-facts.mjs` header). |
| DEV-04 | ASA-INS-01 AC2 "every item that `tools/cb-probe` would serve by default" | `list_probe_items` default (non-sensitive, includes draft items), not `start_scored_run`'s default (scorable and non-sensitive). | The PRD is ambiguous, because cb-probe has two defaults. Agents read the instrument; they do not run a scored plan. **PM to confirm.** |
| DEV-05 | ASA-POL-02 AC3/AC4 (hide first, then "restore") versus ASA-MOD-01 AC2 (no `taken_down → approved`) | `public_hold` flag on approved records. Restore clears the hold; take-down transitions to `taken_down`. | Satisfies both requirements without adding a state or a back-transition. Visibility rule: `approved` and not held. |
| DEV-06 | ASA-MOD-01 AC2 transition list | Adds `held → withdrawn` (submitter). | A held record is often held for detected personal data (ASA-CHK-08). The submitter must be able to retract it (ASA-PRV-02). |
| DEV-07 | ASA-DIS-04 "exactly three operations" | Three MCP-mapped operations (`get_instrument`, `submit_assessment`, `get_submission_status`), plus auxiliary non-MCP routes: withdraw (ASA-MOD-06), takedown (ASA-POL-02), and two thread reads (ASA-DSP). | The PRD itself requires those routes. They are not agent-workflow tools and are not offered as MCP tools. |
| DEV-08 | ASA-MET-01/05 source "nginx access log"; ASA-MET-05 30-day "fetched but never POSTed" | nginx `mirror` beacon to the API, which counts distinct salted client-days. "Never posted" is evaluated within 48 hours per fetch day. | Retention of the nginx and openresty logs is **UNVERIFIED** (PRD §6.1, A2). The web container's `$remote_addr` is the openresty address. Logging forwarded IPs would put raw addresses in logs. A 30-day correlation would need client hashes kept for 30 days, which conflicts with ASA-PRV-03's 48-hour rule. |
| DEV-09 | ASA-RAT table (tuning "with PM approval") | Adds `client_day_attempts` = 30 per day. `client_minute` counts attempts, not receipts. | Limits probing of the soft-check detectors (ASA-SUB-04 "no rejection reveals internal thresholds"). **Needs PM approval.** |
| DEV-10 | ASA-PRV-03 "Submission fields: until taken down or deleted" | Tightened. Body purged on `withdrawn` immediately; on `rejected` and `taken_down` 30 days after the decision; takedown contact 30 days after decision. Purges are events. | Data minimisation, with an audit trail. The 30-day window covers disputes and restore. **PM to confirm** (tightening, not loosening). |
| DEV-11 | ASA-MET-10 "KV counter within 2 percent" | Counters are exact (append-only events). The cross-check test is kept, with a 0 percent tolerance. | No KV. |
| DEV-12 | ASA-DSP-01 "date received and date approved" | The public payload carries dates at day precision only. Status responses carry full timestamps. | Minimises timing correlation of submitters. It meets the AC as written. |
| DEV-13 | ASA-CHK-05 "Strip or reject" control characters | Reject. | Stored text equals submitted text after NFC normalisation, which keeps behaviour deterministic and the record auditable. |
| DEV-14 | ASA-DIS-05 AC1 "fetch approved items from the Worker"; AC2 CORS | Reads are same-origin, so they need no CORS. Cross-origin POST for submit, status and withdraw sits behind `ASA_CORS_SUBMIT`, default `off` until the security review answers OQ-6. Takedown is never cross-origin. | Same origin removes the read-side CORS problem entirely. |
| DEV-15 | ASA-MET-00 AC1 "new pages load no third-party resource" | Unchanged. Note: the root layout loads **first-party, self-hosted** Umami from `/u/script.js` (`site/src/lib/analytics.ts`; `nginx.conf` `/u/`) on every page, including the new ones. It is same-origin, not third-party, and it is not used for any ASA metric. The new components never call `trackEvent`. | Clarifies the test: assert no resource from another origin. The policy page must mention site-wide Umami (ASA-PRV-04). The PM may ask for Umami to be excluded on these routes. |
| DEV-16 | ASA-MOD-04, OQ-9 (indexing) | Entries render client-side only and are never in static HTML. Non-JS crawlers see the labels and banner but no entries. | Required for ≤5-minute takedown without a rebuild. It also reduces R3 (crawler injection). OQ-9's "allow indexing" still holds for the pages themselves. |
| DEV-17 | ASA-INS-02 item fields | `indicator` (the item's subdimension code) is **not** served per item. Subdimensions are served in the `dimensions` block. | ASA-INS-02 lists the permitted item fields exactly. Adding `indicator` would loosen it. Open question OQ-A1 for the PM. |
| DEV-18 | ASA-INS-04 AC3 "hash ... in `/agents`" plus §2.1 item 5 | The hash and version are on `/agents` and in `.well-known`, read from `instrument-registry.json`. **Submission URLs are not in the instrument body.** | The hash must not change when the endpoint opens or moves (D-52 #5). |

---

## 15. Traceability (every ASA requirement → design element)

`ARCH` = this doc; `API` = `docs/AGENT_SELF_API_SPEC.md`; `DM` = `docs/AGENT_SELF_DATA_MODEL.md`; `S#` = build slice (§16).

| Requirement | Design element(s) | Where | Slice |
|---|---|---|---|
| ASA-INS-01 | Static `/agents/instrument*.json/.md`; generator; counts computed | ARCH §6; API §2-3; DM §8 | S1 |
| ASA-INS-02 | `listProbeItems` (imports `projectItem`); anchors via `getAnchors` and re-whitelisted; forbidden-field scan in verifier; contamination statement | ARCH §6.2; DM §8 | S1 |
| ASA-INS-03 | `isSensitiveItem` via `listProbeItems`; `sensitive_items_withheld`; no parameter exists; test enumerates sensitive ids | ARCH §6.2; API §2 | S1 |
| ASA-INS-04 | JCS + SHA-256; registry; immutable `-v<N>` files; `--publish --on` | ARCH §6.3-6.4; API §3; DM §8 | S1 |
| ASA-INS-05 | `resolveInstrument` (missing, unknown, grace, superseded); record stores the submitted hash | ARCH §12; API §4.3, §11; DM §2 | S2 |
| ASA-SUB-01 | 415, 413 (nginx and API), unknown-key rejection | ARCH §5.2; API §4, §11 | S2, S4, S6 |
| ASA-SUB-02 | `schema.mjs`; codes from contract | API §4.1; DM §2 | S1, S2 |
| ASA-SUB-03 | Projections never compute; `public-guard.mjs`; max-ratings E2E test | ARCH §12; DM §2 | S2, S4 |
| ASA-SUB-04 | Error envelope; codes not patterns | API §11 | S2 |
| ASA-MOD-01 | `state.mjs`; event log; visibility rule | ARCH §7, §10.2; DM §3 | S2, S3 |
| ASA-MOD-02 | Receipt; token hash only; token never logged | API §4.2; DM §2 | S3, S4 |
| ASA-MOD-03 | CLI + loopback admin listener; `show` escapes | ARCH §10.1; API §9 | S5 |
| ASA-MOD-04 | Client fetch, `max-age=60`, fallback, nothing baked | ARCH §9 | S4, S7 |
| ASA-MOD-05 | `POST /submissions/status`; uniform not-found; constant-time compare | API §5 | S4 |
| ASA-MOD-06 | `POST /submissions/withdraw` | API §6 | S4 |
| ASA-MOD-07 | `queue_cap` 503; `ratelimit.queue_cap` counter | ARCH §8.3; DM §10 | S4 |
| ASA-CHK-01 | Size limits (nginx, API, schema) | API §4.1 | S2, S6 |
| ASA-CHK-02 | `links.mjs`, corpus ≥20 | ARCH §12; API §12 | S2 |
| ASA-CHK-03 | `banned-keys.mjs`; union list from cb-probe and PRD | ARCH §6.5 | S1, S2 |
| ASA-CHK-04..09 | `soft-checks.mjs`; reason codes | API §12; DM §5 | S2 |
| ASA-CHK-10 | `pipeline.mjs` fixed order | API §4.3 | S2 |
| ASA-POL-01 | Policy page; content list | ARCH §4.1; UX doc | S7 |
| ASA-POL-02 | Takedown endpoint and form; hide-on-receipt hold; `ack` / `decide` | ARCH §10.3; API §7; DM §3.3 | S4, S5, S7 |
| ASA-POL-03 | `moderate takedown` (moderator-initiated) | API §9 | S5 |
| ASA-POL-04 | Tombstone projection | DM §3; API §8.2 | S2, S7 |
| ASA-POL-05 | `reassign`, `split` events | API §9; DM §4 | S5 |
| ASA-RAT (AC1-5) | `limits.mjs`; `client-id.mjs`; headers | ARCH §8; API §11 | S2, S4 |
| ASA-DSP-01 | Label fields in payload; label render test | ARCH §9; API §8.2 | S4, S7 |
| ASA-DSP-02 | Static banner in shells | ARCH §9 | S7 |
| ASA-DSP-03 | Ordering rules; ratings only inside entries | ARCH §9; API §8 | S2, S7 |
| ASA-DSP-04 | `vendor_affiliated` tag; `relabel` | API §8.2, §9 | S5, S7 |
| ASA-DSP-05 | Text nodes only; delimited container; label fields; robots | ARCH §5.3, §9 | S6, S7 |
| ASA-DSP-06 / ASA-IND-01 | Network and code isolation; isolation grep test | ARCH §5.4, §9 | S7 |
| ASA-DIS-01 | `/agents` page from registry; curl examples | API §13 | S8 |
| ASA-DIS-02 | `build-llms.mjs` changes; review list | ARCH §4.1; §16 S8 | S8 |
| ASA-DIS-03 | `.well-known` `agentSelfAssessment` | API §14 | S8 |
| ASA-DIS-04 | MCP mapping table | API §1 | S4 |
| ASA-DIS-05 | Same-origin reads; CORS flag for POST | ARCH §14 DEV-14; API §11.4 | S4 |
| ASA-AMD-01 | README amendment slice | §16 S8 | S8 |
| ASA-PRV-01 | Schema has no personal fields | API §4.1 | S2 |
| ASA-PRV-02 | CHK-08 hold; approve precondition | ARCH §10.2 | S2 |
| ASA-PRV-03 | Salted client refs, 48 h purge, body blobs, log format, tokens only in bodies | ARCH §5.3, §7, §8.1; DM §6 | S3, S4, S6 |
| ASA-PRV-04 | Policy page states storage and logs (including openresty UNVERIFIED and Umami) | ARCH §14 DEV-15 | S7 |
| ASA-PRV-05 | `moderate export`; JSON Schema | DM §9; API §9 | S5 |
| ASA-MET-00 | No `trackEvent`; no other-origin resource; test | DEV-15 | S7 |
| ASA-MET-01..10 | Metrics design | ARCH §13; DM §10 | S3, S4, S9 |

---

## 16. Build sequence

Each slice is independently testable and mergeable. Gate G0 is the initial security review (D-52). It must sign off before **S2** begins. S1 adds no new write surface and may proceed once the PM accepts this doc.

| Slice | Goal | Files touched | Done when | Depends |
|---|---|---|---|---|
| **S1. Instrument** | Publish the hash-stamped instrument and the API contract. | **new:** `site/scripts/lib/agent-instrument.mjs`, `site/scripts/export-agent-instrument.mjs`, `site/scripts/verify-agent-instrument.mjs`, `site/scripts/test-agent-instrument.mjs`, `site/public/agents/instrument.json`, `instrument.md`, `instrument-v1.json`, `instrument-v1.md`, `instrument-versions.json`, `site/src/data/agent-self/instrument-registry.json`, `agent-api/contract.generated.json`. **changed:** `site/package.json` (`prebuild` gains `verify-agent-instrument`; `test` gains `test:agent-instrument`) | AC tests for INS-01..04 pass; `--check` is clean; `npm run build` passes in Docker. | PM accepts docs |
| **S2. Pure core** | All validation, checks, state machine, projections, guards. | **new:** `agent-api/package.json` (no deps; `"test": "node --test tests/"`), `agent-api/lib/core/*.mjs` (§12), `agent-api/tests/*.test.mjs`, `agent-api/tests/corpus/links.json`, `injection.json`, `benign.json`, `score-claims.json`, `pii.json`, `crisis.json`, `named-entities.json`, `agent-api/lib/core/patterns.mjs` | Unit tests for every CHK, SUB and MOD-01 AC pass; corpus targets met (30/30 injection held, ≤2/30 benign held, 20/20 links rejected); security reviewer signs off the corpora. | G0, S1 |
| **S3. Store** | Durable log, blobs, ephemeral data, metrics, purge. | **new:** `agent-api/lib/io/event-log.mjs`, `blob-store.mjs`, `ephemeral-store.mjs`, `clock.mjs`, `random.mjs`, `agent-api/lib/core/log-chain.mjs`, tests using temp directories | Crash-safety test (kill mid-append, restart, chain verifies or the partial final line is quarantined); purge tests; fold equals replay. | S2 |
| **S4. HTTP** | Public routes, rate limits, beacon, CORS flag, kill switch, admin listener. | **new:** `agent-api/server.mjs`, `agent-api/lib/io/http-public.mjs`, `http-admin.mjs`, `agent-api/bin/healthcheck.mjs`, `agent-api/tests/e2e-*.test.mjs` | E2E: every route and every error code; one-record-per-state visibility; max-ratings no-derived-number; log hygiene grep; uniform not-found. | S3 |
| **S5. Moderator CLI** | Every moderator action, export, metrics, diagnostics, backup. | **new:** `agent-api/bin/moderate.mjs`, `agent-api/lib/cli/*.mjs`, tests against an in-process server | Every command tested; export validates against the DM §9 JSON Schema; `verify-log` detects a planted edit. | S4 |
| **S6. Infrastructure** | Container, network, proxy, deploy, DR docs. | **new:** `agent-api/Dockerfile`, `site/scripts/test-nginx-agent-parity.mjs`. **changed:** `docker-compose.yml`, `nginx.conf`, `nginx-ssl.conf`, `deploy.sh` (build and start `agent-api`; post-deploy `GET /api/agent/health` check reporting INDETERMINATE / OK / FAIL in the existing three-outcome style), `DEPLOYMENT.md`, `DISASTER-RECOVERY.md`, `site/package.json` (test entry), robots source | `nginx -t` passes in CI; local `docker compose up` serves the site with `agent-api` stopped (site unaffected, `/api/agent/` 502); the restore drill is done and recorded. | S4 (may run in parallel with S5) |
| **S7. Pages** | Reader and takedown UI. | **new:** `site/src/app/ai-models/self-assessments/page.tsx`, `.../m/page.tsx`, `.../policy/page.tsx`, `.../takedown/page.tsx`, `site/src/components/agent-self/*.tsx`, `site/scripts/test-agent-self-isolation.mjs`, `site/scripts/test-agent-self-render.mjs` (labels, escaping, no `dangerouslySetInnerHTML`, no other-origin resource). **changed:** `site/package.json` | Render tests pass against fixture payloads; the fallback state is shown when the API is unreachable. Wording comes from `docs/AGENT_SELF_UX_FLOWS.md`. | S1 (fixtures only; no live API needed) |
| **S8. Discovery and amendments** | Make it findable and keep promises consistent. **Merged and deployed only at launch.** | **new:** `site/src/app/agents/page.tsx`. **changed:** `site/scripts/build-llms.mjs` (llms.txt agents section; "Nothing is sent" clarified as local-only (F5); `.well-known` `agentSelfAssessment` block; `submitting` block rewritten to point at the moderated text route while keeping "no score accepted"), `site/src/app/ai-models/page.tsx` (line 806 "no data sent to us" scoped to the local tool), `research/submissions/README.md` (amendment verbatim, plus the `/agents` pointer in "How to submit"), footer/nav link (`site/src/data/nav.ts`), `site/scripts/test-model-benchmark-public.mjs` and any test asserting the old `.well-known` text. Also review `site/public/llms-full.txt` and `site/src/app/ai-evaluation-suite/page.tsx` [ASA-DIS-02 AC1]. | Grep for "no endpoint that accepts a score" finds only the preserved sentence plus pointers [ASA-AMD-01 AC4]; `test:no-stale-counts` passes. | S1, S7 |
| **S9. Ops scripts** | Integrity scan and off-box public mirror. | **new:** `research/scripts/agent-self-public-scan.mjs` (imports `agent-api/lib/core/public-guard.mjs`), `research/agent-self/scans/`, `research/agent-self/public-mirror/` | Runs against a local stack and fails on a planted violation. | S4 |
| **S10. Launch** | Founder gates (§17). | none (operational) | Every gate ticked; founder runs `moderate open`. | all |

**Highest technical risk, in order:**
1. Soft-check corpus quality (S2): false holds are cheap; false passes are guarded by the human moderator.
2. Client-IP derivation through an unowned openresty (S6, FA-4).
3. nginx `mirror` + variable `proxy_pass` details (S6).
4. Static-export thread shell under Next 16 (S7).

**Deferrable without harming v1:** S9's mirror (L4 covers DR), `split` (`reassign` covers most cases), cross-origin POST (flag off).

---

## 17. Founder actions required to launch

| ID | Action | When | Notes |
|---|---|---|---|
| FA-1 | Approve this architecture, and record it as a decision (suggested D-53, "agent self-assessment API on the VPS, same origin, not the Worker") | before S2 | Supersedes the PRD's Worker assumption (DEV-01). |
| FA-2 | Create and publish the takedown mailbox (OQ-2), for example `takedowns@compassionbenchmark.com` | before launch | Mail is on Hostinger, so no Cloudflare is needed. **UNVERIFIED** how mail is configured. |
| FA-3 | Name the moderator(s) and cadence (OQ-3); give any delegate VPS shell access | before launch | The CLI requires a shell. |
| FA-4 | Run `moderate diag-client` from two networks, and confirm `client_identity: ok` (§8.2). If degraded, either change openresty to forward `X-Forwarded-For`, or accept global limits. | after the first deploy, before `open` | openresty is outside the repo. |
| FA-5 | Approve the deploy that adds `agent-api`, and run it (`deploy.sh` or the CI workflow) | launch | Same gate as every release (`AUTONOMY.md`). No DNS, TLS, Cloudflare or secret operation. |
| FA-6 | Weekly off-box backup (L4) | ongoing | Recommended, not blocking. |
| FA-7 | Sign off the security review, the policy text, the README amendment, and the S8 copy (PRD §9.1, §9.4, §9.6) | before launch | |
| FA-8 | `docker compose exec agent-api node bin/moderate.mjs open` | launch moment | Submissions are closed by default. The endpoint answers 503 `submissions_closed` until this runs. |

**Not required:** DNS changes, Cloudflare account actions, `wrangler deploy`, any secret provisioning, or any change to the Worker.

---

## 18. Open risks and questions

| ID | Item | Owner |
|---|---|---|
| OR-1 | openresty headers and logging are **UNVERIFIED**. If openresty logs full URLs and IPs (likely by default), the policy page must say so. Tokens never travel in URLs, so they are safe either way. | founder (FA-4), UX for copy |
| OR-2 | Hide-on-receipt lets anyone hide any entry with one request (griefing). Accepted by the PRD's design. Mitigations: the `takedown_day` limit, the `takedown.received.*` counter, and fast restore. | PM |
| OR-3 | `deploy.sh` currently does `git pull origin main` while `main` lags the working branch (`deploy.sh` lines 136-141). The `agent-api` image builds from whatever ref is checked out, so the same caution applies. | founder |
| OR-4 | `.well-known` `instrument.itemsHumanReviewed` is a hand-set value in `site/public/.well-known/compassion-benchmark.json`, not generated (no generator reference found in `site/scripts/`). The instrument computes its own figure from `validationStatus`. If the two ever disagree, the instrument is authoritative. A follow-up should make `.well-known` generated. | coordinator |
| OR-5 | `docker-compose.yml` has no `certbot` service, although `deploy.sh` step 2 runs one. This is pre-existing and unrelated, but S6 edits that file, so the implementer should not "fix" it in passing without founder sign-off. | founder |
| OQ-A1 | Should items carry `indicator` (subdimension code)? It would help agents map items to subdimensions, but loosens ASA-INS-02 (DEV-17). | PM |
| OQ-A2 | Confirm DEV-04 (draft items included) and DEV-09 (attempt cap). | PM |
