/**
 * Compassion Benchmark — Cloudflare Worker
 *
 * Routes:
 *   POST /gumroad/webhook                — Gumroad purchase/refund/cancel handler
 *   GET  /unsubscribe?email=&entity=&token= — HMAC-verified per-entity unsubscribe
 *   GET  /badge/<slug>.svg[?style=compact|detailed] — SVG badge for entity score
 *   GET  /api/v1/subscribers?entity=<slug>&token=<INTERNAL_TOKEN> — internal alert pipeline use only
 *   GET  /admin/status?token=<ADMIN_TOKEN> — token-gated health summary
 *
 * Independence safeguard:
 *   This Worker has NO GitHub token and NO write path to the VPS filesystem.
 *   It cannot modify scores, assessments, or change proposals.
 *   It is purely commercial-plane infrastructure.
 */

// @ts-ignore — types provided by @cloudflare/workers-types devDep
import { renderBadge, type BadgeStyle } from "./badge";

// ─── Environment interface ───────────────────────────────────────────────────

export interface Env {
  /** KV namespace for subscriber state, reverse indexes, and idempotency keys */
  SCORE_WATCH: KVNamespace;

  // Gumroad validation
  GUMROAD_SELLER_ID: string;
  GUMROAD_PRODUCT_ID_SCORE_WATCH: string;

  // Listmonk
  LISTMONK_API_URL: string;         // e.g. https://lists.compassionbenchmark.com
  LISTMONK_API_USER: string;
  LISTMONK_API_TOKEN: string;
  LISTMONK_SCORE_WATCH_LIST_UUID: string;
  LISTMONK_WELCOME_TEMPLATE_ID: string; // numeric string, e.g. "3"

  // Security
  UNSUBSCRIBE_HMAC_SECRET: string;  // secret for per-entity unsubscribe token generation
  INTERNAL_API_TOKEN: string;       // token for send-alerts.mjs → Worker queries
  ADMIN_API_TOKEN: string;          // token for /admin/status

  // Notifications
  ADMIN_NOTIFY_EMAIL: string;       // phil@mediafier.ai
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const ONE_YEAR_MS = ONE_YEAR_SECONDS * 1000;
const WEBHOOK_DEDUP_TTL = 60 * 60 * 24 * 30; // 30 days

// ─── Watch record shape ──────────────────────────────────────────────────────

interface WatchRecord {
  email: string;
  entity_slug: string;
  index_slug: string;
  entity_name: string;
  started_at: string;
  expires_at: string;
  gumroad_sale_id: string;
  gumroad_subscription_id: string;
  status: "active" | "cancelled" | "refunded" | "expired";
  last_alert_sent_at: string | null;
}

// ─── Main fetch handler ──────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      if (req.method === "POST" && path === "/gumroad/webhook") {
        return await handleGumroadWebhook(req, env, ctx);
      }

      if (req.method === "GET" && path === "/unsubscribe") {
        return await handleUnsubscribe(url, env);
      }

      if (req.method === "GET" && path.startsWith("/badge/") && path.endsWith(".svg")) {
        return await handleBadgeSvg(url, env);
      }

      if (req.method === "GET" && path === "/api/v1/subscribers") {
        return await handleSubscribersQuery(url, env);
      }

      if (req.method === "GET" && path === "/admin/status") {
        return await handleAdminStatus(url, env);
      }

      return new Response("not found", { status: 404 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.waitUntil(
        notifyAdmin(env, `Unhandled Worker error on ${req.method} ${path}: ${message}`)
      );
      return new Response("internal error", { status: 500 });
    }
  },
};

// ─── POST /gumroad/webhook ───────────────────────────────────────────────────

async function handleGumroadWebhook(
  req: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // 1. Validate Content-Type
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/x-www-form-urlencoded")) {
    return new Response("bad content-type", { status: 400 });
  }

  // 2. Parse form body
  const form = await req.formData();

  const sellerId = str(form.get("seller_id"));
  const productId = str(form.get("product_id"));
  const saleId = str(form.get("sale_id"));
  const email = str(form.get("email")).toLowerCase().trim();
  const subscriptionId = str(form.get("subscription_id"));
  const buyerName = str(form.get("full_name")) || str(form.get("name")) || "";
  const refunded = form.get("refunded") === "true";
  const cancelled = form.get("cancelled") === "true";

  // Gumroad passes URL params via url_params[key] field names
  const entitySlug = (
    str(form.get("url_params[entity]")) ||
    str(form.get("entity"))
  ).toLowerCase().replace(/[^a-z0-9-]/g, "");

  const indexSlug = (
    str(form.get("url_params[index]")) ||
    str(form.get("index"))
  ).toLowerCase().replace(/[^a-z0-9-]/g, "");

  const entityName = decodeURIComponent(
    str(form.get("url_params[name]")) || str(form.get("name")) || entitySlug
  );

  // 3. Validate seller — reject if wrong seller
  if (sellerId !== env.GUMROAD_SELLER_ID) {
    return new Response("forbidden", { status: 403 });
  }

  // 4. If product_id doesn't match Score-Watch, accept and ignore
  //    (Gumroad can send webhooks for all products to the same URL)
  if (productId !== env.GUMROAD_PRODUCT_ID_SCORE_WATCH) {
    return new Response("ok (not score-watch)", { status: 200 });
  }

  // 5. Validate required fields
  if (!saleId || !email) {
    return new Response("missing sale_id or email", { status: 400 });
  }

  // 6. Idempotency — deduplicate replays from Gumroad
  const dedupeKey = `webhook:${saleId}`;
  const existing = await env.SCORE_WATCH.get(dedupeKey);
  if (existing) {
    return new Response("ok (replay)", { status: 200 });
  }

  const now = new Date();

  // 7. Route by event type
  if (refunded) {
    await markWatchStatus(env, email, saleId, "refunded");
    await env.SCORE_WATCH.put(
      dedupeKey,
      JSON.stringify({ processed_at: now.toISOString(), type: "refund" }),
      { expirationTtl: WEBHOOK_DEDUP_TTL },
    );
    // Also update Listmonk subscriber attribs
    ctx.waitUntil(
      updateListmonkWatchStatus(env, email, saleId, "refunded").catch((err) =>
        notifyAdmin(env, `Listmonk refund sync failed: ${err.message} sale=${saleId}`)
      )
    );
    return new Response("ok", { status: 200 });
  }

  if (cancelled) {
    await markWatchStatus(env, email, saleId, "cancelled");
    await env.SCORE_WATCH.put(
      dedupeKey,
      JSON.stringify({ processed_at: now.toISOString(), type: "cancel" }),
      { expirationTtl: WEBHOOK_DEDUP_TTL },
    );
    ctx.waitUntil(
      updateListmonkWatchStatus(env, email, saleId, "cancelled").catch((err) =>
        notifyAdmin(env, `Listmonk cancel sync failed: ${err.message} sale=${saleId}`)
      )
    );
    return new Response("ok", { status: 200 });
  }

  // 8. New purchase: validate entity context
  if (!entitySlug || !indexSlug) {
    // Purchase confirmed but entity context missing — notify admin, do not fail
    ctx.waitUntil(
      notifyAdmin(
        env,
        `Score-Watch purchase missing entity context: sale_id=${saleId} email=${redactEmail(email)}. ` +
        `Check Gumroad checkout URL has ?entity=<slug>&index=<index> params.`,
      )
    );
    await env.SCORE_WATCH.put(
      dedupeKey,
      JSON.stringify({ processed_at: now.toISOString(), error: "missing_entity", type: "purchase" }),
      { expirationTtl: WEBHOOK_DEDUP_TTL },
    );
    return new Response("ok", { status: 200 });
  }

  // 9. Write watch state to KV
  const watch: WatchRecord = {
    email,
    entity_slug: entitySlug,
    index_slug: indexSlug,
    entity_name: entityName,
    started_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ONE_YEAR_MS).toISOString(),
    gumroad_sale_id: saleId,
    gumroad_subscription_id: subscriptionId,
    status: "active",
    last_alert_sent_at: null,
  };

  const watchKey = `watch:${email}:${entitySlug}`;
  await env.SCORE_WATCH.put(watchKey, JSON.stringify(watch));

  // 10. Update reverse index (entity → [emails])
  await appendReverseIndex(env, entitySlug, email);

  // 11. Sync to Listmonk (best-effort; do not fail webhook if Listmonk is down)
  ctx.waitUntil(
    syncListmonk(env, watch, buyerName).catch((err) =>
      notifyAdmin(
        env,
        `Listmonk sync failed for sale=${saleId}: ${err.message}. ` +
        `Watch state is saved in KV. Manual Listmonk sync required.`,
      )
    )
  );

  // 12. Record webhook log
  await env.SCORE_WATCH.put(
    dedupeKey,
    JSON.stringify({ processed_at: now.toISOString(), type: "purchase", entity_slug: entitySlug }),
    { expirationTtl: WEBHOOK_DEDUP_TTL },
  );

  return new Response("ok", { status: 200 });
}

// ─── GET /unsubscribe ────────────────────────────────────────────────────────

async function handleUnsubscribe(url: URL, env: Env): Promise<Response> {
  const email = (url.searchParams.get("email") ?? "").toLowerCase().trim();
  const entity = (url.searchParams.get("entity") ?? "").toLowerCase().trim();
  const token = url.searchParams.get("token") ?? "";

  if (!email || !entity || !token) {
    return new Response("missing required parameters: email, entity, token", { status: 400 });
  }

  // Verify HMAC-SHA256 token = HMAC(email + ":" + entity, UNSUBSCRIBE_HMAC_SECRET)
  const valid = await verifyHmac(email + ":" + entity, token, env.UNSUBSCRIBE_HMAC_SECRET);
  if (!valid) {
    return new Response("invalid or expired unsubscribe token", { status: 403 });
  }

  const watchKey = `watch:${email}:${entity}`;
  const raw = await env.SCORE_WATCH.get(watchKey, "json") as WatchRecord | null;

  if (!raw) {
    // Already gone — idempotent success
    return htmlResponse(
      "Unsubscribed",
      `<p>You have been unsubscribed from <strong>${entity}</strong> Score-Watch alerts.</p>` +
      `<p>No further alerts will be sent.</p>`,
    );
  }

  // Mark cancelled in KV
  const updated: WatchRecord = { ...raw, status: "cancelled" };
  await env.SCORE_WATCH.put(watchKey, JSON.stringify(updated));

  // Also remove from reverse index
  await removeFromReverseIndex(env, entity, email);

  // Best-effort Listmonk sync
  await updateListmonkWatchStatus(env, email, raw.gumroad_sale_id, "cancelled").catch(() => {});

  return htmlResponse(
    "Unsubscribed from Score-Watch",
    `<p>You have been unsubscribed from <strong>${raw.entity_name || entity}</strong> Score-Watch alerts.</p>` +
    `<p>Your subscription period ends on ${raw.expires_at.slice(0, 10)} but no further alert emails will be sent.</p>` +
    `<p>To manage your billing, visit your Gumroad account.</p>`,
  );
}

// ─── GET /badge/<slug>.svg ───────────────────────────────────────────────────

async function handleBadgeSvg(url: URL, env: Env): Promise<Response> {
  // Extract slug from path: /badge/<slug>.svg
  const slug = url.pathname.slice("/badge/".length).replace(/\.svg$/, "");
  if (!slug || slug.includes("/")) {
    return new Response("invalid slug", { status: 400 });
  }

  const style = (url.searchParams.get("style") ?? "compact") as BadgeStyle;
  if (style !== "compact" && style !== "detailed") {
    return new Response("invalid style — use compact or detailed", { status: 400 });
  }

  // Fetch the public score JSON generated by export-public-data.mjs
  const scoreUrl = `https://compassionbenchmark.com/data/scores/${slug}.json`;
  const r = await fetch(scoreUrl, { cf: { cacheTtl: 3600 } });

  if (!r.ok) {
    // Return a placeholder badge rather than a raw 404
    const svg = renderBadge(slug, 0, "Unknown", style);
    return new Response(svg, {
      status: 404,
      headers: { "content-type": "image/svg+xml" },
    });
  }

  const { composite, band } = await r.json() as { composite: number; band: string };
  const svg = renderBadge(slug, composite, band, style);

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600, s-maxage=3600",
      "x-content-type-options": "nosniff",
    },
  });
}

// ─── GET /api/v1/subscribers ─────────────────────────────────────────────────

/**
 * Internal endpoint used by research/scripts/send-alerts.mjs to query active
 * subscribers for a given entity slug.
 *
 * Returns only the data the alert pipeline needs: email, expires_at, status.
 * Does NOT return the full watch record to minimize PII exposure in logs.
 *
 * Token-gated with INTERNAL_API_TOKEN (Bearer header or query param).
 */
async function handleSubscribersQuery(url: URL, env: Env): Promise<Response> {
  // Validate internal token
  const tokenHeader = (url.searchParams.get("token") ?? "");
  const authHeader = "";  // not used in query-param mode
  if (tokenHeader !== env.INTERNAL_API_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }

  const entitySlug = url.searchParams.get("entity") ?? "";
  if (!entitySlug) {
    return new Response("entity param required", { status: 400 });
  }

  // Look up the reverse index
  const indexKey = `index:entity:${entitySlug}`;
  const emails = (await env.SCORE_WATCH.get(indexKey, "json") as string[] | null) ?? [];

  if (emails.length === 0) {
    return Response.json({ entity: entitySlug, subscribers: [] });
  }

  // Fetch each watch record and return the minimal fields needed
  const subscribers: Array<{
    email: string;
    expires_at: string;
    started_at: string;
    status: string;
    gumroad_sale_id: string;
  }> = [];

  for (const email of emails) {
    const w = await env.SCORE_WATCH.get(`watch:${email}:${entitySlug}`, "json") as WatchRecord | null;
    if (!w) continue;
    subscribers.push({
      email: w.email,
      expires_at: w.expires_at,
      started_at: w.started_at,
      status: w.status,
      gumroad_sale_id: w.gumroad_sale_id,
    });
  }

  return Response.json({ entity: entitySlug, subscribers });
}

// ─── GET /admin/status ───────────────────────────────────────────────────────

/**
 * Token-gated health summary for Phil's spot-checks.
 * Returns subscriber count, recent webhook events, and KV key counts.
 */
async function handleAdminStatus(url: URL, env: Env): Promise<Response> {
  const token = url.searchParams.get("token") ?? "";
  if (token !== env.ADMIN_API_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }

  // Count watch:* keys (active subscribers)
  const watchList = await env.SCORE_WATCH.list({ prefix: "watch:" });
  const totalWatches = watchList.keys.length;

  // Count index:entity:* keys (watched entities)
  const indexList = await env.SCORE_WATCH.list({ prefix: "index:entity:" });
  const watchedEntities = indexList.keys.length;

  // Fetch recent webhook events (last ~20 from today's date prefix)
  const today = new Date().toISOString().slice(0, 10);
  const recentWebhooks = await env.SCORE_WATCH.list({ prefix: "webhook:", limit: 20 });

  const summary = {
    generated_at: new Date().toISOString(),
    total_watches: totalWatches,
    watched_entities: watchedEntities,
    recent_webhook_keys: recentWebhooks.keys.map((k) => k.name),
    note: "KV list() is eventually consistent. Counts may be slightly stale.",
  };

  return Response.json(summary);
}

// ─── Helpers: KV operations ──────────────────────────────────────────────────

/**
 * Append an email to the per-entity reverse index.
 *
 * Read-modify-write with Set deduplication. KV is eventually consistent;
 * concurrent writes may transiently lose entries — this is acceptable per
 * ARCHITECTURE §9.3. The next webhook for the same sale will reconcile.
 */
async function appendReverseIndex(env: Env, entitySlug: string, email: string): Promise<void> {
  const key = `index:entity:${entitySlug}`;
  const existing = (await env.SCORE_WATCH.get(key, "json") as string[] | null) ?? [];
  const updated = [...new Set([...existing, email])];
  await env.SCORE_WATCH.put(key, JSON.stringify(updated));
}

/**
 * Remove an email from the per-entity reverse index (used on unsubscribe).
 */
async function removeFromReverseIndex(env: Env, entitySlug: string, email: string): Promise<void> {
  const key = `index:entity:${entitySlug}`;
  const existing = (await env.SCORE_WATCH.get(key, "json") as string[] | null) ?? [];
  const updated = existing.filter((e) => e !== email);
  await env.SCORE_WATCH.put(key, JSON.stringify(updated));
}

/**
 * Find all watch:email:entity KV keys for this email + sale_id and update status.
 * Used for refund / cancel events where we know the sale_id but not the entity slug.
 */
async function markWatchStatus(
  env: Env,
  email: string,
  saleId: string,
  status: WatchRecord["status"],
): Promise<void> {
  const list = await env.SCORE_WATCH.list({ prefix: `watch:${email}:` });
  for (const key of list.keys) {
    const w = await env.SCORE_WATCH.get(key.name, "json") as WatchRecord | null;
    if (w?.gumroad_sale_id === saleId) {
      w.status = status;
      await env.SCORE_WATCH.put(key.name, JSON.stringify(w));

      // On refund: remove from reverse index so alert pipeline skips immediately
      if (status === "refunded") {
        await removeFromReverseIndex(env, w.entity_slug, email);
      }
    }
  }
}

// ─── Helpers: Listmonk integration ──────────────────────────────────────────

function listmonkAuth(env: Env): string {
  return "Basic " + btoa(`${env.LISTMONK_API_USER}:${env.LISTMONK_API_TOKEN}`);
}

/**
 * Upsert a subscriber into Listmonk and send the welcome transactional email.
 *
 * On 409 (existing subscriber), patch the `watched[]` attribute by merging the
 * new watch entry, deduplicating by entity_slug. This is the critical path
 * for multi-entity subscribers who buy again from a different entity page.
 */
async function syncListmonk(env: Env, watch: WatchRecord, buyerName: string): Promise<void> {
  const auth = listmonkAuth(env);

  const watchAttrib = {
    entity_slug: watch.entity_slug,
    index_slug: watch.index_slug,
    entity_name: watch.entity_name,
    started_at: watch.started_at,
    expires_at: watch.expires_at,
    gumroad_sale_id: watch.gumroad_sale_id,
    status: watch.status,
  };

  // 1. Attempt subscriber creation
  const createRes = await fetch(`${env.LISTMONK_API_URL}/api/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      email: watch.email,
      name: buyerName || watch.email.split("@")[0],
      status: "enabled",
      lists: [env.LISTMONK_SCORE_WATCH_LIST_UUID],
      attribs: {
        watched: [watchAttrib],
        first_watched_at: watch.started_at,
        lifetime_purchases: 1,
      },
      preconfirm_subscriptions: true,
    }),
  });

  if (createRes.status === 409) {
    // Subscriber already exists — merge watched[] array
    await mergeListmonkWatched(env, auth, watch.email, watchAttrib);
  } else if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Listmonk subscriber create failed ${createRes.status}: ${body}`);
  }

  // 2. Send welcome transactional email (best-effort within syncListmonk).
  //    The unsubscribe URL is pre-signed here in the Worker (where we have the
  //    HMAC secret) so the email contains a ready-to-click URL. Listmonk never
  //    sees the secret. Token is the SHA-256 HMAC of `email:entity_slug`.
  const unsubscribeUrl = await buildUnsubscribeUrl(
    watch.email,
    watch.entity_slug,
    env.UNSUBSCRIBE_HMAC_SECRET,
  );
  const gumroadManageUrl = "https://app.gumroad.com/library";

  const txRes = await fetch(`${env.LISTMONK_API_URL}/api/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      subscriber_email: watch.email,
      template_id: Number(env.LISTMONK_WELCOME_TEMPLATE_ID),
      data: {
        entity_name: watch.entity_name,
        entity_slug: watch.entity_slug,
        index_slug: watch.index_slug,
        started_at: watch.started_at.slice(0, 10),
        expires_at: watch.expires_at.slice(0, 10),
        gumroad_sale_id: watch.gumroad_sale_id,
        gumroad_manage_url: gumroadManageUrl,
        unsubscribe_url: unsubscribeUrl,
      },
    }),
  });

  if (!txRes.ok) {
    const body = await txRes.text();
    // Log but do not rethrow — welcome email is best-effort
    console.error(`Welcome email failed for ${redactEmail(watch.email)}: ${txRes.status} ${body}`);
  }
}

/**
 * Merge a new watch entry into an existing Listmonk subscriber's watched[] array.
 * Deduplicates by entity_slug (later purchase overwrites earlier for same entity).
 */
async function mergeListmonkWatched(
  env: Env,
  auth: string,
  email: string,
  newWatch: Record<string, string>,
): Promise<void> {
  // Look up existing subscriber
  const lookupRes = await fetch(
    `${env.LISTMONK_API_URL}/api/subscribers?query=subscribers.email='${encodeURIComponent(email)}'&page=1&per_page=1`,
    { headers: { Authorization: auth } },
  );

  if (!lookupRes.ok) {
    throw new Error(`Listmonk subscriber lookup failed ${lookupRes.status}`);
  }

  const data = await lookupRes.json() as {
    data: { results: Array<{ id: number; attribs: Record<string, unknown>; lists: unknown[] }> };
  };
  const sub = data?.data?.results?.[0];
  if (!sub) throw new Error("Listmonk subscriber not found after 409");

  const existingWatched = (sub.attribs?.watched ?? []) as Array<Record<string, string>>;
  const merged = [
    ...existingWatched.filter((w) => w.entity_slug !== newWatch.entity_slug),
    newWatch,
  ];

  const lifetimePurchases = ((sub.attribs?.lifetime_purchases as number) ?? 0) + 1;

  const putRes = await fetch(`${env.LISTMONK_API_URL}/api/subscribers/${sub.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      email,
      name: (sub as unknown as { name?: string }).name ?? email.split("@")[0],
      status: "enabled",
      lists: [env.LISTMONK_SCORE_WATCH_LIST_UUID],
      attribs: {
        ...sub.attribs,
        watched: merged,
        lifetime_purchases: lifetimePurchases,
      },
      preconfirm_subscriptions: true,
    }),
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`Listmonk subscriber patch failed ${putRes.status}: ${body}`);
  }
}

/**
 * Update the status of a specific watch entry in Listmonk subscriber attribs.
 * Used for refund / cancel events.
 */
async function updateListmonkWatchStatus(
  env: Env,
  email: string,
  saleId: string,
  newStatus: WatchRecord["status"],
): Promise<void> {
  const auth = listmonkAuth(env);

  const lookupRes = await fetch(
    `${env.LISTMONK_API_URL}/api/subscribers?query=subscribers.email='${encodeURIComponent(email)}'&page=1&per_page=1`,
    { headers: { Authorization: auth } },
  );

  if (!lookupRes.ok) return; // subscriber not found — silently skip

  const data = await lookupRes.json() as {
    data: { results: Array<{ id: number; name?: string; attribs: Record<string, unknown>; lists: unknown[] }> };
  };
  const sub = data?.data?.results?.[0];
  if (!sub) return;

  const existingWatched = (sub.attribs?.watched ?? []) as Array<Record<string, string>>;
  const updated = existingWatched.map((w) =>
    w.gumroad_sale_id === saleId ? { ...w, status: newStatus } : w
  );

  await fetch(`${env.LISTMONK_API_URL}/api/subscribers/${sub.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      email,
      name: sub.name ?? email.split("@")[0],
      status: "enabled",
      lists: [env.LISTMONK_SCORE_WATCH_LIST_UUID],
      attribs: { ...sub.attribs, watched: updated },
      preconfirm_subscriptions: true,
    }),
  });
}

// ─── Helpers: Admin notification ─────────────────────────────────────────────

/**
 * Send an admin notification via Listmonk transactional API.
 * Best-effort: errors are swallowed to avoid masking the original error.
 *
 * PRIVACY NOTE: do not include subscriber email addresses in the message string.
 */
async function notifyAdmin(env: Env, message: string): Promise<void> {
  const auth = listmonkAuth(env);
  await fetch(`${env.LISTMONK_API_URL}/api/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      subscriber_email: env.ADMIN_NOTIFY_EMAIL,
      // Use a pre-created raw admin-alert template in Listmonk
      // Template body should just render {{ .Data.message }}
      template_id: 1, // Update this to the actual admin alert template ID in Listmonk
      data: { message },
    }),
  }).catch(() => {
    // Swallow — admin notify is always best-effort
  });
}

// ─── Helpers: HMAC ───────────────────────────────────────────────────────────

/**
 * Generate an HMAC-SHA256 token for the given message using the Web Crypto API.
 * Used to create and verify per-entity unsubscribe links.
 */
export async function generateHmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify an HMAC-SHA256 token using constant-time comparison.
 * Returns true only if the token matches the expected HMAC.
 */
async function verifyHmac(message: string, token: string, secret: string): Promise<boolean> {
  const expected = await generateHmac(message, secret);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Build a signed, ready-to-click unsubscribe URL for the given email + entity.
 *
 * The token is the HMAC-SHA256 of `email:entity_slug` using
 * UNSUBSCRIBE_HMAC_SECRET. The token is valid indefinitely (no expiry) — the
 * Worker validates the HMAC and then checks the KV watch record. The URL is
 * pre-signed here so the email body contains a working link; Listmonk never
 * needs to see the HMAC secret.
 *
 * This MUST stay in lockstep with `signUnsubscribeToken` in
 * `research/scripts/send-alerts.mjs` so welcome-email and alert-email tokens
 * are interchangeable.
 */
async function buildUnsubscribeUrl(
  email: string,
  entitySlug: string,
  secret: string,
): Promise<string> {
  const token = await generateHmac(`${email}:${entitySlug}`, secret);
  const params = new URLSearchParams({ email, entity: entitySlug, token });
  return `https://api.compassionbenchmark.com/unsubscribe?${params.toString()}`;
}

// ─── Helpers: UI responses ───────────────────────────────────────────────────

function htmlResponse(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title} — Compassion Benchmark</title>` +
    `<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#e2e8f0;background:#0b1220}` +
    `a{color:#7dd3fc}</style></head><body><h1>${title}</h1>${body}` +
    `<hr style="border-color:#1e293b;margin-top:40px"><p style="color:#64748b;font-size:0.85em">` +
    `<a href="https://compassionbenchmark.com">compassionbenchmark.com</a></p></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

// ─── Helpers: misc ───────────────────────────────────────────────────────────

function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v);
}

/**
 * Redact email for logging — only log the domain, never the local part.
 * PRIVACY: never log full email addresses to Cloudflare Logpush.
 */
function redactEmail(email: string): string {
  const at = email.indexOf("@");
  return at >= 0 ? `***@${email.slice(at + 1)}` : "***";
}
