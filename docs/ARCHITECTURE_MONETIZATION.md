# Architecture — Monetization & Fulfillment

Owner: Phil Kling (solo)
Status: Recommendation, ready for build
Date: 2026-05-17

This document specifies the end-to-end architecture for Score-Watch Alert and the broader monetization surface of compassionbenchmark.com. It is the source of truth for the receiver, alert pipeline, data model, rollout sequencing, and operational runbook. It also documents the structural separation between the commercial system and the assessment system.

---

## 1. Fulfillment Topology — Score-Watch

### Decision: (a) Cloudflare Worker

A Cloudflare Worker is the single piece of new compute Phil should introduce. Everything else stays as static files served by nginx, with Listmonk for email and the existing local research pipeline writing files to git.

#### Why a Worker, not a sidecar Node service

| Option | Verdict | Reason |
|---|---|---|
| (a) Cloudflare Worker | **Chosen** | Free tier covers expected volume (<100k req/day). Zero VPS surface area added. TLS, DDoS, secrets, KV all built in. Independent failure domain from the marketing site. Deploy is one CLI command, reversible. |
| (b) Node sidecar in docker-compose | Rejected | Adds a long-running process Phil must monitor, restart, patch. Couples webhook availability to VPS uptime and nginx config. Listmonk lives there too — one bad deploy could take down both. No upside over (a) at this volume. |
| (c) Fully manual | Rejected | Score-Watch is the first recurring revenue product. Manual fulfillment caps growth at Phil's inbox latency and creates the worst-possible support story (silent failures, lost subscriptions). Acceptable only as today's bridge while the Worker is being built. |
| (d) Other (Vercel function, Lambda, Pipedream) | Rejected | All add another vendor, another billing relationship, another dashboard. Cloudflare is the smallest possible addition. |

The Worker is single-purpose: receive Gumroad webhooks, write to Listmonk, persist subscriber state in Cloudflare KV, return 200. No business logic beyond that.

#### Score-Watch purchase flow

```
                                                       ┌──────────────────────────┐
User on entity page ──click "Subscribe — $79/yr"──▶  │ Gumroad checkout         │
   /<index>/<slug>?cta=subscribe                       │  ?entity=<slug>          │
                                                       │  &index=<index>          │
                                                       └────────────┬─────────────┘
                                                                    │ purchase_success
                                                                    ▼
                                                    ┌──────────────────────────────┐
                                                    │ Cloudflare Worker            │
                                                    │  POST /gumroad/webhook       │
                                                    │  - verify signature          │
                                                    │  - idempotency check (KV)    │
                                                    │  - parse entity/index from   │
                                                    │    URL params                │
                                                    └──────────────┬───────────────┘
                                                                   │
                       ┌───────────────────────────────────────────┼─────────────────────────────┐
                       ▼                                           ▼                             ▼
       ┌──────────────────────────┐         ┌───────────────────────────────┐   ┌────────────────────────────┐
       │ Listmonk                 │         │ Cloudflare KV                 │   │ Listmonk transactional API │
       │  POST /api/subscribers   │         │  watch:<email>:<entity-slug>  │   │  send welcome email        │
       │   email, list_uuid,      │         │   = { started_at, expires_at, │   │   template: welcome-watch  │
       │   attribs: { watched: [] }│        │       gumroad_sale_id,        │   │                            │
       │   tags: [watch:<slug>]   │         │       status: 'active' }      │   │                            │
       └──────────────────────────┘         └───────────────────────────────┘   └────────────────────────────┘
                       │                                           │
                       ▼                                           ▼
              Return 200 to Gumroad                       Log to KV append index
              (must be < 5s)                              webhook-log:<date>:<sale_id>
```

#### Score-Watch daily alert flow

```
03:00 local        Overnight research pipeline (local Node, existing)
                    scanner → assessor → digest
                         │
                         ▼
                   research/change-proposals/<slug>.json (APPLIED only)
                   site/src/data/updates/daily/<date>.json
                         │
03:45 local        NEW: research/scripts/send-alerts.mjs
                         │
                         ├── 1. Load today's daily briefing JSON
                         │      filter: scoreChanges[] where status == 'applied'
                         │
                         ├── 2. For each changed entity slug:
                         │      GET https://lists.compassionbenchmark.com/api/subscribers
                         │           ?query=subscribers.attribs->'watched' ? '<slug>'
                         │      (or: list-per-entity GET /api/lists/<list_id>/subscribers)
                         │
                         ├── 3. Render alert email (Markdown → HTML)
                         │      template: research/templates/score-watch-alert.md
                         │
                         ├── 4. For each subscriber:
                         │      POST /api/tx (Listmonk transactional)
                         │           subscriber_email, template_id, data: { entity, delta, ... }
                         │
                         ├── 5. Append delivery row:
                         │      research/alert-deliveries/<date>.json
                         │      { sale_id, email, entity_slug, status, listmonk_message_id }
                         │
                         └── 6. git commit the deliveries log
                                (audit trail; not pushed if Phil prefers private)
```

The alert sender is just another script in the same nightly Claude Code trigger that already runs scanner → assessor → digest. It runs **after** digest, never before assessor.

---

## 2. Data Model

### 2.1 Listmonk shape — single global list, attribute-driven (recommended)

| Option | Pros | Cons |
|---|---|---|
| **A. One list per entity** | Easy per-list unsubscribe; trivial query ("get all subscribers of list X"); matches Listmonk's bulk-send mental model | 1,155 entities = 1,155 lists; Listmonk admin UI becomes unusable; rate-limit risk on creation; subscriber appears N times if they buy multiple entities; per-list confirmed-opt-in flows fire repeatedly |
| **B. One global `score-watch` list, watched entities as a subscriber attribute** | One list to manage; one welcome confirmation per email regardless of how many entities; clean `attribs.watched: ["alphabet","openai"]` array; trivial to query "all watchers of slug X" via Listmonk's PostgreSQL attribs filter | Requires Listmonk 3.x query syntax; per-entity unsubscribe must be implemented in app logic, not via Listmonk's native unsubscribe link |

**Recommendation: B.** The unsubscribe-per-entity concern is real but solvable with a Worker route (`/unsubscribe?email=&entity=&token=`) that removes the slug from the `watched` array. Option A's operational cost compounds with every new index entity and would put Listmonk's admin UI into a state Phil cannot reason about.

### 2.2 Subscriber record (Listmonk)

```jsonc
// Listmonk subscriber row
{
  "email": "alice@example.com",
  "name": "alice",                          // optional, harvested from Gumroad if present
  "status": "enabled",
  "lists": ["<score-watch-list-uuid>"],     // single global list
  "attribs": {
    "watched": [                            // canonical watch state lives here
      {
        "entity_slug": "alphabet",
        "index_slug": "fortune-500",
        "started_at": "2026-05-17T14:22:00Z",
        "expires_at": "2027-05-17T14:22:00Z",
        "gumroad_sale_id": "abc123",
        "status": "active"                  // active | cancelled | refunded | expired
      },
      { "entity_slug": "openai", "index_slug": "ai-labs", ... }
    ],
    "first_watched_at": "2026-05-17T14:22:00Z",
    "lifetime_purchases": 2
  }
}
```

### 2.3 Cloudflare KV — operational mirror

KV is the durable record from the Worker's perspective. Listmonk is the email-system record. The two can drift; KV is the source of truth for fulfillment state because it is the only thing the Worker writes to synchronously inside the webhook handler.

```jsonc
// KV namespace: SCORE_WATCH

// Per-watch state, primary key
"watch:<email>:<entity-slug>" = {
  "email": "alice@example.com",
  "entity_slug": "alphabet",
  "index_slug": "fortune-500",
  "started_at": "2026-05-17T14:22:00Z",
  "expires_at": "2027-05-17T14:22:00Z",
  "gumroad_sale_id": "abc123",
  "gumroad_subscription_id": "sub_xyz",
  "status": "active",
  "last_alert_sent_at": null
}
// TTL: none (Worker handles expiry on each write)

// Webhook idempotency
"webhook:<sale_id>" = { "processed_at": "..." }
// TTL: 30 days

// Reverse index for the alert sender (avoid full KV scans)
"index:entity:<entity-slug>" = ["alice@example.com", "bob@example.com"]
// Updated transactionally with watch:* writes

// Refund/cancel log (append-only)
"event:<sale_id>:<timestamp>" = { type: "refund" | "cancel" | "renewal", payload }
```

The reverse index `index:entity:<slug>` matters: without it, the alert sender would have to fetch every Listmonk subscriber, which is slow at scale and rate-limited. The Worker writes both keys atomically (KV supports single-key atomicity; the Worker writes the watch key first, then patches the index — if the second write fails, the next webhook for the same sale finds the watch key and reconciles).

### 2.4 Alert delivery log

```jsonc
// research/alert-deliveries/2026-05-17.json (append-only, committed to git)
{
  "date": "2026-05-17",
  "generated_at": "2026-05-17T03:50:00Z",
  "entities_with_changes": ["alphabet", "openai", "meta-platforms"],
  "deliveries": [
    {
      "email": "alice@example.com",
      "entity_slug": "alphabet",
      "index_slug": "fortune-500",
      "delta": -1.6,
      "band_change": "Functional → Developing",
      "listmonk_message_id": "lm-7f8a...",
      "status": "sent",            // sent | failed | suppressed | skipped-expired
      "sent_at": "2026-05-17T03:51:14Z"
    },
    {
      "email": "bob@example.com",
      "entity_slug": "alphabet",
      "status": "skipped-expired",
      "expires_at": "2026-04-10T00:00:00Z"
    }
  ],
  "summary": { "sent": 23, "failed": 0, "skipped_expired": 1, "suppressed": 0 }
}
```

### 2.5 Refund / cancel state machine

```
            ┌─────────┐
new sale ─▶│ active  │
            └────┬────┘
                 │ gumroad cancellation_event
                 ▼
            ┌─────────┐    expires_at reached     ┌──────────┐
            │cancelled├───────────────────────────▶│ expired  │
            └────┬────┘                             └──────────┘
                 │ refund within 30 days
                 ▼
            ┌─────────┐
            │refunded │
            └─────────┘
```

`active` and `cancelled` both receive alerts until `expires_at`. Cancellation only stops auto-renewal; refund immediately suppresses alerts. The alert sender checks `status != 'refunded' && now < expires_at` before each send.

---

## 3. Webhook Receiver — Concrete Spec

### 3.1 Endpoint

| | |
|---|---|
| URL | `https://api.compassionbenchmark.com/gumroad/webhook` (Cloudflare-managed subdomain, points to Worker via Workers Routes) |
| Method | `POST` |
| Content-Type | `application/x-www-form-urlencoded` (Gumroad's format) |
| Timeout SLA | < 5s (Gumroad requirement) |
| Retry behavior | Gumroad retries 3× on non-2xx with exponential backoff |

### 3.2 Validation

Gumroad does **not** send HMAC signatures by default. It sends a `seller_id` field that the Worker validates against a known value. Additionally:

1. Verify `seller_id` matches `env.GUMROAD_SELLER_ID`
2. Verify `product_id` matches `env.GUMROAD_PRODUCT_ID_SCORE_WATCH`
3. Require `sale_id`, `email`, `url_params.entity`, `url_params.index` — reject 400 if missing
4. Reject if `Content-Type` is wrong

For higher-assurance verification, enable Gumroad's IP allowlist (publish on docs.gumroad.com) at the Worker layer and reject all other source IPs.

### 3.3 Idempotency

```
read KV:webhook:<sale_id>
   ├── exists → return 200 immediately (already processed)
   └── absent → process, then write KV:webhook:<sale_id> with TTL 30 days
```

Gumroad will replay; replays must be cheap no-ops. The webhook-log key is the deduplication guard.

### 3.4 Error handling

| Failure mode | Behavior |
|---|---|
| Listmonk 5xx | Write KV state, queue a Durable Object retry, return 200 to Gumroad (do not let Listmonk outage cascade) |
| Listmonk timeout | Same as 5xx |
| KV write fails | Return 500, let Gumroad retry |
| Malformed payload | 400 + log to Cloudflare Logpush |
| Welcome email send fails | Log to KV `event:` key, alert Phil via Listmonk tx email to `phil@…` — do not retry inline |

### 3.5 Secrets

Stored as Worker secrets via `wrangler secret put`:

- `GUMROAD_SELLER_ID`
- `GUMROAD_PRODUCT_ID_SCORE_WATCH`
- `LISTMONK_API_URL`            (e.g. `https://lists.compassionbenchmark.com`)
- `LISTMONK_API_USER`
- `LISTMONK_API_TOKEN`
- `LISTMONK_SCORE_WATCH_LIST_UUID`
- `LISTMONK_WELCOME_TEMPLATE_ID`
- `ADMIN_NOTIFY_EMAIL`          (phil@…)

### 3.6 Cost & latency

- Cloudflare Workers free tier: 100k requests/day, 10ms CPU/req — Score-Watch will not approach this for years.
- KV: free tier 100k reads/day, 1k writes/day — adequate for ~100 sales/day.
- p50 latency: ~50ms (Listmonk on Hostinger is the long pole; the Worker itself is single-digit ms).

### 3.7 Worker stub

```typescript
// worker.ts — deploy with `wrangler deploy`
// Route: api.compassionbenchmark.com/gumroad/webhook

export interface Env {
  SCORE_WATCH: KVNamespace;
  GUMROAD_SELLER_ID: string;
  GUMROAD_PRODUCT_ID_SCORE_WATCH: string;
  LISTMONK_API_URL: string;
  LISTMONK_API_USER: string;
  LISTMONK_API_TOKEN: string;
  LISTMONK_SCORE_WATCH_LIST_UUID: string;
  LISTMONK_WELCOME_TEMPLATE_ID: string;
  ADMIN_NOTIFY_EMAIL: string;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/gumroad/webhook") {
      return handleGumroadWebhook(req, env, ctx);
    }
    if (req.method === "GET" && url.pathname === "/unsubscribe") {
      return handleUnsubscribe(url, env);
    }
    if (req.method === "GET" && url.pathname.startsWith("/badge/")) {
      return handleBadgeSvg(url, env);
    }
    return new Response("not found", { status: 404 });
  },
};

async function handleGumroadWebhook(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/x-www-form-urlencoded")) {
    return new Response("bad content type", { status: 400 });
  }

  const form = await req.formData();
  const sellerId = String(form.get("seller_id") || "");
  const productId = String(form.get("product_id") || "");
  const saleId = String(form.get("sale_id") || "");
  const email = String(form.get("email") || "").toLowerCase().trim();
  const subscriptionId = String(form.get("subscription_id") || "");
  const refunded = form.get("refunded") === "true";
  const cancelled = form.get("cancelled") === "true";

  // Gumroad passes the entity/index back via url_params[name]
  const entitySlug = String(form.get("url_params[entity]") || form.get("entity") || "").toLowerCase();
  const indexSlug = String(form.get("url_params[index]") || form.get("index") || "").toLowerCase();

  if (sellerId !== env.GUMROAD_SELLER_ID) return new Response("bad seller", { status: 403 });
  if (productId !== env.GUMROAD_PRODUCT_ID_SCORE_WATCH) {
    // Not our product — Gumroad sometimes batches. Accept and ignore.
    return new Response("ok", { status: 200 });
  }
  if (!saleId || !email) return new Response("missing fields", { status: 400 });

  // Idempotency
  const dedupeKey = `webhook:${saleId}`;
  if (await env.SCORE_WATCH.get(dedupeKey)) {
    return new Response("ok (replay)", { status: 200 });
  }

  // Handle refund / cancel paths
  if (refunded) {
    await markRefunded(env, email, saleId);
    await env.SCORE_WATCH.put(dedupeKey, JSON.stringify({ processed_at: new Date().toISOString(), type: "refund" }), { expirationTtl: 60 * 60 * 24 * 30 });
    return new Response("ok", { status: 200 });
  }
  if (cancelled) {
    await markCancelled(env, email, saleId);
    await env.SCORE_WATCH.put(dedupeKey, JSON.stringify({ processed_at: new Date().toISOString(), type: "cancel" }), { expirationTtl: 60 * 60 * 24 * 30 });
    return new Response("ok", { status: 200 });
  }

  if (!entitySlug || !indexSlug) {
    // Purchase succeeded but entity context missing. Notify admin, do not fail.
    ctx.waitUntil(notifyAdmin(env, `Score-Watch purchase missing entity context: sale_id=${saleId} email=${email}`));
    await env.SCORE_WATCH.put(dedupeKey, JSON.stringify({ processed_at: new Date().toISOString(), error: "missing_entity" }), { expirationTtl: 60 * 60 * 24 * 30 });
    return new Response("ok", { status: 200 });
  }

  // Happy path: write watch state + reverse index + Listmonk subscriber
  const now = new Date();
  const watch = {
    email,
    entity_slug: entitySlug,
    index_slug: indexSlug,
    started_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ONE_YEAR_MS).toISOString(),
    gumroad_sale_id: saleId,
    gumroad_subscription_id: subscriptionId,
    status: "active" as const,
    last_alert_sent_at: null as string | null,
  };

  await env.SCORE_WATCH.put(`watch:${email}:${entitySlug}`, JSON.stringify(watch));
  await appendReverseIndex(env, entitySlug, email);

  // Listmonk subscriber + welcome email (best-effort; do not fail webhook on Listmonk down)
  ctx.waitUntil(syncListmonk(env, watch).catch(err => notifyAdmin(env, `Listmonk sync failed: ${err.message} sale=${saleId}`)));

  await env.SCORE_WATCH.put(dedupeKey, JSON.stringify({ processed_at: now.toISOString(), type: "purchase" }), { expirationTtl: 60 * 60 * 24 * 30 });
  return new Response("ok", { status: 200 });
}

async function appendReverseIndex(env: Env, entitySlug: string, email: string): Promise<void> {
  const key = `index:entity:${entitySlug}`;
  const existing = await env.SCORE_WATCH.get(key, "json") as string[] | null;
  const set = new Set(existing || []);
  set.add(email);
  await env.SCORE_WATCH.put(key, JSON.stringify([...set]));
}

async function syncListmonk(env: Env, watch: any): Promise<void> {
  const auth = "Basic " + btoa(`${env.LISTMONK_API_USER}:${env.LISTMONK_API_TOKEN}`);

  // Upsert subscriber, append entity to watched[] attribute
  const subRes = await fetch(`${env.LISTMONK_API_URL}/api/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      email: watch.email,
      name: watch.email.split("@")[0],
      status: "enabled",
      lists: [env.LISTMONK_SCORE_WATCH_LIST_UUID],
      attribs: { watched: [watch] },
      preconfirm_subscriptions: true,
    }),
  });

  // 409 = subscriber exists; patch attribs to append
  if (subRes.status === 409) {
    // Fetch existing, merge watched[], PUT back
    const lookup = await fetch(`${env.LISTMONK_API_URL}/api/subscribers?query=subscribers.email='${encodeURIComponent(watch.email)}'`, { headers: { Authorization: auth } });
    const json = await lookup.json() as any;
    const sub = json?.data?.results?.[0];
    if (sub) {
      const existing = (sub.attribs?.watched || []) as any[];
      const merged = [...existing.filter(w => w.entity_slug !== watch.entity_slug), watch];
      await fetch(`${env.LISTMONK_API_URL}/api/subscribers/${sub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify({ ...sub, attribs: { ...sub.attribs, watched: merged }, lists: [env.LISTMONK_SCORE_WATCH_LIST_UUID] }),
      });
    }
  } else if (!subRes.ok) {
    throw new Error(`listmonk subscriber upsert failed: ${subRes.status}`);
  }

  // Welcome transactional
  await fetch(`${env.LISTMONK_API_URL}/api/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      subscriber_email: watch.email,
      template_id: Number(env.LISTMONK_WELCOME_TEMPLATE_ID),
      data: { entity_slug: watch.entity_slug, index_slug: watch.index_slug, expires_at: watch.expires_at },
    }),
  });
}

async function markRefunded(env: Env, email: string, saleId: string): Promise<void> {
  // Find the watch row(s) matching this sale_id; mark refunded.
  // For MVP simplicity, list all watch keys for this email and patch.
  const list = await env.SCORE_WATCH.list({ prefix: `watch:${email}:` });
  for (const k of list.keys) {
    const w = await env.SCORE_WATCH.get(k.name, "json") as any;
    if (w?.gumroad_sale_id === saleId) {
      w.status = "refunded";
      await env.SCORE_WATCH.put(k.name, JSON.stringify(w));
    }
  }
}

async function markCancelled(env: Env, email: string, saleId: string): Promise<void> {
  const list = await env.SCORE_WATCH.list({ prefix: `watch:${email}:` });
  for (const k of list.keys) {
    const w = await env.SCORE_WATCH.get(k.name, "json") as any;
    if (w?.gumroad_sale_id === saleId) {
      w.status = "cancelled";
      await env.SCORE_WATCH.put(k.name, JSON.stringify(w));
    }
  }
}

async function handleUnsubscribe(url: URL, env: Env): Promise<Response> {
  const email = (url.searchParams.get("email") || "").toLowerCase();
  const entity = (url.searchParams.get("entity") || "").toLowerCase();
  const token = url.searchParams.get("token") || "";
  // Token = HMAC(email + entity, secret) — verify here in real implementation
  if (!email || !entity || !token) return new Response("missing params", { status: 400 });
  const key = `watch:${email}:${entity}`;
  const w = await env.SCORE_WATCH.get(key, "json") as any;
  if (w) {
    w.status = "cancelled";
    await env.SCORE_WATCH.put(key, JSON.stringify(w));
  }
  return new Response(`Unsubscribed ${email} from ${entity}.`, { status: 200, headers: { "content-type": "text/plain" } });
}

async function handleBadgeSvg(url: URL, env: Env): Promise<Response> {
  // /badge/<entity-slug>.svg — see Section 5
  const slug = url.pathname.replace("/badge/", "").replace(".svg", "");
  // Fetch published score from public site JSON
  const r = await fetch(`https://compassionbenchmark.com/data/scores/${slug}.json`);
  if (!r.ok) return new Response("not found", { status: 404 });
  const { composite, band } = await r.json() as any;
  const svg = renderBadge(slug, composite, band);
  return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=3600" } });
}

function renderBadge(slug: string, composite: number, band: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" role="img" aria-label="Compassion Benchmark: ${composite} ${band}">
  <rect width="200" height="40" rx="6" fill="#0b1220"/>
  <text x="12" y="16" font-family="system-ui" font-size="10" fill="#94a3b8">Compassion Benchmark</text>
  <text x="12" y="32" font-family="system-ui" font-size="14" font-weight="700" fill="#e2e8f0">${composite} · ${band}</text>
</svg>`;
}

async function notifyAdmin(env: Env, message: string): Promise<void> {
  const auth = "Basic " + btoa(`${env.LISTMONK_API_USER}:${env.LISTMONK_API_TOKEN}`);
  await fetch(`${env.LISTMONK_API_URL}/api/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      subscriber_email: env.ADMIN_NOTIFY_EMAIL,
      template_id: 0, // raw template id for admin-alert
      data: { message },
    }),
  }).catch(() => { /* swallow; admin notify is best-effort */ });
}
```

---

## 4. Alert Pipeline Integration

### 4.1 File location

```
research/
  scripts/
    send-alerts.mjs         ← NEW. Standalone Node script, no deps beyond node-fetch.
  templates/
    score-watch-alert.md    ← NEW. Mustache-style template (Listmonk renders).
  alert-deliveries/
    2026-05-17.json         ← NEW. Append-only daily log, committed to git.
```

### 4.2 Trigger sequencing

The existing nightly Claude Code trigger runs:

```
scanner  →  assessor  →  digest  →  [NEW] send-alerts
```

`send-alerts` runs **after** digest because:

1. It depends on `site/src/data/updates/daily/<date>.json` which digest writes
2. It must only consider proposals with `status: 'applied'` — digest is where applied-status gets finalized
3. If digest fails, alerts must not fire — assessment integrity outranks subscriber delivery

### 4.3 Algorithm

```
1. date = today (UTC)
2. load site/src/data/updates/daily/<date>.json
3. changes = briefing.scoreChanges.filter(c => c.status === 'applied' && (Math.abs(c.delta) >= 5 || c.band_change))
4. for change in changes:
     emails = fetch(`${WORKER_URL}/internal/subscribers?entity=${change.slug}&token=${INTERNAL_TOKEN}`)
              OR direct KV read via wrangler (preferred for cron-mode)
              OR Listmonk query API: GET /api/subscribers?query=...
     for email in emails:
       watch = fetch watch:${email}:${change.slug}
       if watch.status not in ('active','cancelled'): skip
       if now > watch.expires_at: skip (log status: 'skipped-expired')
       render alert from template
       POST /api/tx to Listmonk with subscriber_email + template data
       record delivery row
5. write research/alert-deliveries/<date>.json
6. git add + commit
```

### 4.4 Independence guarantee — structural

The alert sender:

- Reads **only** from `site/src/data/updates/daily/*.json` and `research/change-proposals/<slug>.json`
- Has **no write access** to `site/src/data/indexes/*.json` (the scores)
- Has **no write access** to `research/change-proposals/*.json` (the proposals)
- Has **no write access** to `research/assessments/*.md`
- Runs **after** the assessment artifacts are finalized and git-committed by the upstream agents

Enforce with file-system permissions in the cron environment (`chmod a-w` on the indexes and change-proposals directories during the send-alerts step) and with a pre-commit hook that blocks `send-alerts.mjs` from staging changes to those paths.

Additionally: the Worker must not expose any endpoint that returns a subscriber-count for an entity. The assessor never queries the subscriber state. This is enforced by network topology — the assessor agent runs on Phil's local machine with no credentials for the Worker or Listmonk admin API. (See Section 8.)

### 4.5 Failure handling

| Scenario | Behavior |
|---|---|
| Listmonk down | Each `POST /api/tx` fails — log status `failed` with error, do **not** retry inline. Write a `research/alert-deliveries/<date>-retry.json` queue. Phil reruns `node send-alerts.mjs --retry <date>` next morning. |
| Worker / KV down | Fall back to Listmonk's `query` API to find watchers tagged with the slug. Slower but functional. |
| Daily briefing JSON missing | Abort with non-zero exit; do not send any alerts. The trigger surfaces the failure to Phil's morning summary. |
| Template render error | Log to `research/alert-deliveries/<date>.json` with `status: 'failed'` and the rendered payload diff; do not send broken emails. |

---

## 5. Other Monetization Architecture

### 5.1 Embed / badge widget

**Surface:** `https://api.compassionbenchmark.com/badge/<entity-slug>.svg`

- Served by the same Worker (see `handleBadgeSvg` in the stub)
- Works without JS — plain `<img>` embed
- 1-hour edge cache; backed by static JSON at `compassionbenchmark.com/data/scores/<slug>.json` (new export step in `npm run build`)
- HTML embed snippet provided on each entity page:
  ```html
  <a href="https://compassionbenchmark.com/<index>/<slug>">
    <img src="https://api.compassionbenchmark.com/badge/<slug>.svg" alt="Compassion Benchmark score" />
  </a>
  ```
- Optional `?style=detailed|compact|dark|light` query params later

**Free** — drives backlinks and brand. Do not gate.

### 5.2 API tier

**Two tiers:**

| Tier | Mechanism | Cost to build |
|---|---|---|
| Public JSON | Static JSON files at `compassionbenchmark.com/data/<index>.json`, regenerated each build, CORS-open, rate-limited only by nginx | Trivial — already mostly there |
| Pro API (key-gated) | Worker route `/api/v1/...` checks `Authorization: Bearer <key>` against a KV namespace `API_KEYS`; serves the same JSON but with richer fields (history, evidence references, change proposals) | 1 day |

API keys are sold via a separate Gumroad product. Same Worker handles the webhook (different `product_id` branch); on purchase it generates a key, stores `apikey:<key> = { email, tier, issued_at, expires_at }`, and emails the key via Listmonk tx.

### 5.3 One-time data-pack downloads

Gumroad's native file-delivery feature — Phil uploads the zip when generating a release, Gumroad serves it post-purchase. **No fulfillment work for Phil.** Already proven by the existing index downloads (`countriesIndex`, `fortune500Index`, etc. in `gumroad.ts`).

### 5.4 Supporter tier

Gumroad subscription product, no fulfillment automation. Optional attribution badge handled by a static page `/supporters` that lists names Phil manually adds. If volume grows past ~20 supporters, the same Worker webhook can append to a `supporters.json` in KV that the site fetches at build time.

---

## 6. Migration & Rollout Sequence

| Week | Ship |
|---|---|
| **Week 1 (Worker + Gumroad)** | (1) Register `api.compassionbenchmark.com` and route to Worker. (2) Deploy Worker with webhook handler + KV namespace. (3) Create Gumroad Score-Watch product. (4) Configure webhook URL in Gumroad. (5) Manual end-to-end test: buy a $1 test product, confirm KV + Listmonk + welcome email. |
| **Week 1 (site)** | (6) Flip `SCORE_WATCH.useGumroad = true` in `gumroad.ts`. (7) Update entity-page Subscribe button to append `?entity=<slug>&index=<index>` to checkout URL. (8) Add unsubscribe-link footer to welcome template. |
| **Week 2 (alerts)** | (9) Write `research/scripts/send-alerts.mjs`. (10) Add to nightly trigger after digest. (11) Add `research/templates/score-watch-alert.md`. (12) Dry-run mode (`--no-send`) for first 3 nights — write the delivery log without calling Listmonk. (13) Enable live sends. |
| **Week 3 (badge + monitoring)** | (14) Ship `/badge/<slug>.svg` endpoint. (15) Add embed-code copy widget to entity pages. (16) Add a `/admin/status` Worker route (token-gated) showing subscriber count, last alert run, recent failures. |
| **Later** | Pro API tier; supporter tier; per-index Score-Watch bundles ("Watch all Fortune 500 tech at a discount"). |

Defer until needed: Stripe direct, custom checkout, mobile app, Slack integration. None unlock revenue that Gumroad+Listmonk+Worker cannot.

---

## 7. Operational Runbook

### Creating a new Gumroad product

1. Gumroad dashboard → Products → New → Subscription
2. Name: `Score-Watch Alert — <Entity>` OR a single `Score-Watch Alert` product reused for all entities (recommended; the entity comes from URL params)
3. Price: $79/year, recurring
4. Custom fields: none (entity arrives via URL params)
5. Webhook: paste `https://api.compassionbenchmark.com/gumroad/webhook` under Settings → Advanced → Ping URL
6. Copy the product URL into `site/src/data/gumroad.ts`
7. Rebuild + redeploy the site

### Verifying a subscriber

```bash
wrangler kv:key get --binding=SCORE_WATCH "watch:alice@example.com:alphabet"
# Returns full watch record
wrangler kv:key list --binding=SCORE_WATCH --prefix="watch:alice@example.com:"
# Returns all watches for that email
```

In Listmonk admin: Subscribers → search by email → inspect `attribs.watched`.

### Handling a refund

Gumroad refund triggers a `refunded=true` webhook automatically; the Worker marks the watch as `refunded` and the next alert run will skip them. **No manual action required for the normal case.**

For manual refund (Phil decides outside Gumroad):

```bash
wrangler kv:key put --binding=SCORE_WATCH "watch:alice@example.com:alphabet" \
  '{"status":"refunded",...rest of the record}'
```

Then process the refund in Gumroad's UI.

### Debugging a missed alert

```bash
# 1. Was the entity in today's briefing as an applied change?
jq '.scoreChanges[] | select(.status=="applied")' site/src/data/updates/daily/2026-05-17.json

# 2. Did send-alerts run?
cat research/alert-deliveries/2026-05-17.json | jq .summary

# 3. Was the subscriber in the reverse index?
wrangler kv:key get --binding=SCORE_WATCH "index:entity:alphabet"

# 4. Did Listmonk record an outbound send?
# Listmonk admin → Campaigns → Transactional → search recipient email

# 5. Replay if needed
node research/scripts/send-alerts.mjs --date 2026-05-17 --entity alphabet --email alice@example.com
```

### Daily / weekly checks

**Daily (60 seconds):**
- Check `research/alert-deliveries/<today>.json` summary; if `failed > 0`, open the file and investigate

**Weekly (10 minutes):**
- Cloudflare Workers dashboard → Errors panel → confirm no recurring exceptions
- Listmonk → bounce rate < 2%
- Gumroad → reconcile sale count vs. KV `watch:*` count (one-line script):
  ```bash
  wrangler kv:key list --binding=SCORE_WATCH --prefix="watch:" | jq length
  ```
- Spot-check one delivered alert: forward to phil@ inbox via test subscription

---

## 8. Independence Safeguards — CRITICAL

The product rule is non-negotiable: **entities never pay for inclusion, score changes, or suppression of findings.** The architecture must make a Score-Watch subscriber list **structurally incapable** of influencing a score. This requires both code-level and topology-level guarantees.

### 8.1 Topology

```
┌────────────────────────────────────────┐         ┌─────────────────────────────────────┐
│  ASSESSMENT PLANE                      │         │  COMMERCIAL PLANE                   │
│  (read-only of the world; writes scores)│         │  (reads scores; writes nothing)     │
│                                        │         │                                     │
│  scanner → assessor → digest           │         │  Cloudflare Worker                  │
│  (Phil's local machine, nightly)       │         │  ↳ Gumroad webhook receiver         │
│                                        │         │  ↳ Badge SVG endpoint               │
│  writes:                               │         │                                     │
│   research/scans/*                     │         │  Cloudflare KV                      │
│   research/assessments/*               │         │   watch:*, index:entity:*           │
│   research/change-proposals/*          │         │                                     │
│   site/src/data/indexes/*              │         │  Listmonk                           │
│   site/src/data/updates/daily/*        │         │   subscribers, attribs.watched      │
│                                        │         │                                     │
│  CANNOT READ:                          │ ─────▶  │  send-alerts.mjs                    │
│   KV, Listmonk admin API, watch state  │         │   reads daily briefing JSON only    │
│   (no credentials, no network access)  │         │   reads watch state                 │
└────────────────────────────────────────┘         │   writes alert-deliveries/*         │
                                                   │   CANNOT WRITE:                     │
                                                   │    indexes, proposals, assessments  │
                                                   │    (chmod a-w in cron env)          │
                                                   └─────────────────────────────────────┘
```

### 8.2 Code-level guarantees

| Rule | Mechanism |
|---|---|
| Assessor cannot read subscriber state | Assessor agents have no Worker URL, no KV binding, no Listmonk credentials in their environment. The credentials physically do not exist on the path the assessor takes. |
| Assessor cannot read entity-revenue data | Gumroad sale records are not synced to the local research repo. The only file referencing revenue (`gumroad.ts`) lists product URLs, not buyers. |
| Send-alerts cannot modify scores | File-system permissions: send-alerts runs under a separate Unix user with read-only access to `site/src/data/indexes/` and `research/change-proposals/`. Pre-commit hook rejects commits to those paths originating from the send-alerts process. |
| Webhook receiver cannot modify scores | Cloudflare Worker has no network path to the VPS filesystem and no GitHub write token. |
| Scores derive only from the daily briefing JSON | The site reads `site/src/data/indexes/*.json`, which is regenerated only by the assessor pipeline. The send-alerts script appears nowhere in the score-derivation path. |

### 8.3 Auditable invariants

Add to `research/scripts/integrity-check.mjs` (run weekly):

```
1. git log --all -- site/src/data/indexes/ | grep -v "scanner\|assessor\|digest\|founder"
   → must return empty (no commercial-plane process has ever touched scores)

2. grep -r "watch:\|listmonk\|gumroad" research/scripts/
   → only allowed in send-alerts.mjs; never in scanner/assessor/digest

3. Worker source review: ensure no fetch() targets compassionbenchmark.com paths
   that could mutate indexes (e.g. a hypothetical GitHub webhook).
   The Worker has no GITHUB_TOKEN; this is enforced by absence.
```

### 8.4 Public disclosure

Add a paragraph to `/about` or `/methodology`:

> Compassion Benchmark operates two independent technical planes. The assessment plane (which produces scores) cannot read commercial data: it has no access to subscriber lists, payment records, or revenue per entity. The commercial plane (which sells Score-Watch and data licenses) reads scores only after they are published. The architectural separation is documented in [link to this file].

This makes the guarantee verifiable, not just asserted.

---

## 9. Open Risks

1. **Gumroad does not sign webhooks.** The `seller_id` check is weak; an attacker who guesses the seller_id and product_id can spoof purchases. Mitigation: enable Cloudflare IP allowlist for Gumroad source IPs at the Worker layer. Residual risk: medium-low.
2. **Listmonk single-instance.** Lives in a single Docker container on a single VPS. If the VPS dies, alerts stall. Mitigation in scope of this doc: send-alerts retries from a queue file the next morning. Out of scope: HA Listmonk.
3. **KV eventual consistency.** Cloudflare KV is eventually consistent across regions (<60s). A user buying two entities in quick succession could see a transient stale reverse-index. Acceptable for this product.
4. **Entity slug drift.** If the assessor renames a slug, existing `watch:*:<old-slug>` records become orphaned. Mitigation: introduce a `slug-aliases.json` consulted by send-alerts before lookup. Defer until first occurrence.
5. **Gumroad URL params can be tampered with by the buyer.** A buyer could edit `?entity=foo` to subscribe to a different entity than the page they came from. Low impact (still paid), but Phil should consider signing the entity context with a short-lived HMAC token that the Worker validates. Defer for v1.
