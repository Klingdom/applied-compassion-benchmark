#!/usr/bin/env node
/**
 * send-alerts.mjs — Score-Watch Alert Pipeline
 *
 * INDEPENDENCE SAFEGUARD (non-negotiable):
 *   This script has READ-ONLY access to assessment data. It MUST NOT and does
 *   NOT write to:
 *     - site/src/data/indexes/          (scores — written only by assessor)
 *     - research/change-proposals/      (proposals — written only by assessor)
 *     - research/assessments/           (assessments — written only by assessor)
 *
 *   The alert pipeline reads from daily briefing JSON (produced by digest) and
 *   the Cloudflare Worker (subscriber state). It writes only to:
 *     - research/alert-deliveries/      (delivery audit log)
 *
 *   This structural separation ensures commercial subscriber state can never
 *   influence scores. See ARCHITECTURE_MONETIZATION.md §8 for the full guarantee.
 *
 * Usage:
 *   node send-alerts.mjs [options]
 *
 * Options:
 *   --date YYYY-MM-DD     Date to process (default: today UTC)
 *   --dry-run             Query subscribers and render alerts, but do NOT send.
 *                         Writes delivery log with status: "dry-run".
 *   --retry               Re-attempt sends from <date>-retry.json (failures from prior run)
 *   --entity <slug>       Process only this entity slug (for debugging / manual replay)
 *   --email <email>       Process only this subscriber email (for debugging / manual replay)
 *   --use-listmonk-fallback  Query subscriber list via Listmonk API instead of Worker
 *                            (fallback when Worker/KV is down)
 *
 * Environment variables required:
 *   SCORE_WATCH_INTERNAL_TOKEN  — matches INTERNAL_API_TOKEN secret in the Worker
 *   LISTMONK_API_URL            — e.g. https://lists.compassionbenchmark.com
 *   LISTMONK_API_USER           — Listmonk admin username
 *   LISTMONK_API_TOKEN          — Listmonk admin API token
 *   LISTMONK_ALERT_TEMPLATE_ID  — numeric ID of score-watch-alert transactional template
 *   WORKER_BASE_URL             — e.g. https://api.compassionbenchmark.com (default)
 *   UNSUBSCRIBE_HMAC_SECRET     — same secret as the Worker, for signing unsubscribe links
 *
 * Exit codes:
 *   0 — all sends succeeded (or dry-run completed)
 *   1 — one or more sends failed (check delivery log for details)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

// ─── Repository root resolution ──────────────────────────────────────────────

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// research/scripts/ → research/ → repo root
const REPO_ROOT = resolve(__dirname, "..", "..");

// ─── CLI argument parsing ────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const DRY_RUN = hasFlag("--dry-run");
const RETRY_MODE = hasFlag("--retry");
const USE_LISTMONK_FALLBACK = hasFlag("--use-listmonk-fallback");
const ENTITY_FILTER = getArg("--entity");
const EMAIL_FILTER = getArg("--email");

// Resolve target date (default: today UTC)
const rawDate = getArg("--date");
const TARGET_DATE = rawDate ?? new Date().toISOString().slice(0, 10);

// Validate date format
if (!/^\d{4}-\d{2}-\d{2}$/.test(TARGET_DATE)) {
  console.error(`[send-alerts] ERROR: --date must be YYYY-MM-DD, got: ${TARGET_DATE}`);
  process.exit(1);
}

// ─── Environment variables ───────────────────────────────────────────────────

const WORKER_BASE_URL = process.env.WORKER_BASE_URL ?? "https://api.compassionbenchmark.com";
const INTERNAL_TOKEN = process.env.SCORE_WATCH_INTERNAL_TOKEN;
const LISTMONK_API_URL = process.env.LISTMONK_API_URL;
const LISTMONK_API_USER = process.env.LISTMONK_API_USER;
const LISTMONK_API_TOKEN = process.env.LISTMONK_API_TOKEN;
const LISTMONK_ALERT_TEMPLATE_ID = Number(process.env.LISTMONK_ALERT_TEMPLATE_ID ?? "0");
const UNSUBSCRIBE_HMAC_SECRET = process.env.UNSUBSCRIBE_HMAC_SECRET;

// Validate required env
const missingEnv = [];
if (!INTERNAL_TOKEN) missingEnv.push("SCORE_WATCH_INTERNAL_TOKEN");
if (!LISTMONK_API_URL) missingEnv.push("LISTMONK_API_URL");
if (!LISTMONK_API_USER) missingEnv.push("LISTMONK_API_USER");
if (!LISTMONK_API_TOKEN) missingEnv.push("LISTMONK_API_TOKEN");
if (!LISTMONK_ALERT_TEMPLATE_ID) missingEnv.push("LISTMONK_ALERT_TEMPLATE_ID");
if (!UNSUBSCRIBE_HMAC_SECRET) missingEnv.push("UNSUBSCRIBE_HMAC_SECRET");

if (missingEnv.length > 0) {
  console.error(`[send-alerts] ERROR: Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// ─── Paths ───────────────────────────────────────────────────────────────────

const BRIEFING_PATH = join(REPO_ROOT, "site", "src", "data", "updates", "daily", `${TARGET_DATE}.json`);
const DELIVERIES_DIR = join(REPO_ROOT, "research", "alert-deliveries");
const DELIVERY_LOG_PATH = join(DELIVERIES_DIR, `${TARGET_DATE}.json`);
const RETRY_LOG_PATH = join(DELIVERIES_DIR, `${TARGET_DATE}-retry.json`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate HMAC-SHA256 unsubscribe token (matches Worker's verifyHmac logic) */
function generateUnsubscribeToken(email, entitySlug) {
  return createHmac("sha256", UNSUBSCRIBE_HMAC_SECRET)
    .update(`${email}:${entitySlug}`)
    .digest("hex");
}

/** Build a signed per-entity unsubscribe URL */
function buildUnsubscribeUrl(email, entitySlug) {
  const token = generateUnsubscribeToken(email, entitySlug);
  const params = new URLSearchParams({ email, entity: entitySlug, token });
  return `${WORKER_BASE_URL}/unsubscribe?${params}`;
}

/** Listmonk Basic Auth header */
function listmonkAuth() {
  return "Basic " + Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64");
}

/** Fetch active subscribers for an entity from the Worker's reverse index */
async function fetchSubscribersFromWorker(entitySlug) {
  const url = `${WORKER_BASE_URL}/api/v1/subscribers?entity=${encodeURIComponent(entitySlug)}&token=${encodeURIComponent(INTERNAL_TOKEN)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Worker subscriber query failed for ${entitySlug}: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.subscribers ?? [];
}

/**
 * Fallback: query Listmonk directly for subscribers watching this entity.
 *
 * Listmonk's PostgreSQL attribs filter queries the JSONB watched[] array.
 * This is slower than the Worker reverse index but functional when KV is down.
 */
async function fetchSubscribersFromListmonk(entitySlug) {
  // Query: subscribers whose attribs->'watched' contains an entry with this entity_slug
  // Listmonk supports JSONB containment queries via ?query= param
  const query = encodeURIComponent(
    `subscribers.attribs @> '{"watched":[{"entity_slug":"${entitySlug}"}]}'`
  );
  const url = `${LISTMONK_API_URL}/api/subscribers?query=${query}&page=1&per_page=1000`;
  const res = await fetch(url, { headers: { Authorization: listmonkAuth() } });

  if (!res.ok) {
    throw new Error(`Listmonk subscriber query failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const results = data?.data?.results ?? [];

  // Extract the specific watch entry for this entity from each subscriber's attribs
  return results.flatMap((sub) => {
    const watched = sub.attribs?.watched ?? [];
    const watch = watched.find((w) => w.entity_slug === entitySlug);
    if (!watch) return [];
    return [{
      email: sub.email,
      expires_at: watch.expires_at,
      started_at: watch.started_at,
      status: watch.status ?? "active",
      gumroad_sale_id: watch.gumroad_sale_id ?? "",
    }];
  });
}

/** Send a transactional alert email via Listmonk */
async function sendAlertEmail(subscriberEmail, templateData) {
  const res = await fetch(`${LISTMONK_API_URL}/api/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: listmonkAuth(),
    },
    body: JSON.stringify({
      subscriber_email: subscriberEmail,
      template_id: LISTMONK_ALERT_TEMPLATE_ID,
      data: templateData,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Listmonk tx failed ${res.status}: ${body}`);
  }

  // Listmonk returns a message UUID on success
  const result = await res.json();
  return result?.data?.id ?? null;
}

/**
 * Render the template data object for an alert email.
 * These fields must match the Listmonk template placeholders in
 * research/templates/score-watch-alert.md.
 */
function buildAlertTemplateData(change, subscriber) {
  const {
    slug,
    name,
    index,
    publishedScore,
    proposedScore,
    delta,
    publishedBand,
    proposedBand,
    bandCrossing,
    keyEvidence,
    evidence,
    rationale,
    conductCategory,
  } = change;

  const entityDetailUrl = `https://compassionbenchmark.com/${indexToRoute(index)}/${slug}`;
  const unsubscribeUrl = buildUnsubscribeUrl(subscriber.email, slug);

  // Compute band change string
  const bandChangeText = bandCrossing
    ? `${publishedBand} → ${proposedBand}`
    : `Band unchanged (${proposedBand})`;

  // Extract up to 3 evidence headline strings
  // Prefer keyEvidence[], fall back to evidence[].summary
  const evidenceItems = (keyEvidence ?? []).slice(0, 3);
  if (evidenceItems.length === 0 && Array.isArray(evidence)) {
    evidence.slice(0, 3).forEach((e) => {
      if (e?.summary) evidenceItems.push(e.summary);
    });
  }
  const evidenceFallback = evidenceItems.length === 0
    ? `Full evidence available at ${entityDetailUrl}`
    : null;

  return {
    entity_name: name,
    entity_slug: slug,
    index_slug: index,
    entity_detail_url: entityDetailUrl,
    change_date: TARGET_DATE,
    old_score: publishedScore,
    new_score: proposedScore,
    delta: Number(delta.toFixed(1)),
    delta_formatted: delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1),
    band_change: bandChangeText,
    band_changed: !!bandCrossing,
    old_band: publishedBand,
    new_band: proposedBand,
    evidence_1: evidenceItems[0] ?? evidenceFallback ?? "",
    evidence_2: evidenceItems[1] ?? "",
    evidence_3: evidenceItems[2] ?? "",
    evidence_count: evidenceItems.length,
    conduct_category: conductCategory ?? "",
    run_date: TARGET_DATE,
    unsubscribe_url: unsubscribeUrl,
    // Gumroad manage link — subscriber can manage in Gumroad account directly
    gumroad_manage_url: "https://app.gumroad.com/library",
  };
}

/** Map index slug to the site route prefix */
function indexToRoute(indexSlug) {
  const routes = {
    "fortune-500": "company",
    "countries": "country",
    "us-states": "us-state",
    "ai-labs": "ai-lab",
    "robotics-labs": "robotics-lab",
    "global-cities": "city",
    "us-cities": "us-city",
  };
  return routes[indexSlug] ?? indexSlug;
}

// ─── Core algorithm ──────────────────────────────────────────────────────────

async function main() {
  const modeDesc = [
    DRY_RUN ? "DRY RUN" : "LIVE",
    RETRY_MODE ? "RETRY" : "",
    ENTITY_FILTER ? `entity=${ENTITY_FILTER}` : "",
    EMAIL_FILTER ? `email=***@${EMAIL_FILTER.split("@")[1] ?? "?"}` : "",
  ].filter(Boolean).join(" | ");

  console.log(`[send-alerts] Starting — date=${TARGET_DATE} mode=${modeDesc}`);

  // ── Step 1: Load source data ─────────────────────────────────────────────

  let changesToProcess;

  if (RETRY_MODE) {
    // Retry mode: re-attempt sends from a prior failure log
    if (!existsSync(RETRY_LOG_PATH)) {
      console.log(`[send-alerts] No retry file found at ${RETRY_LOG_PATH}. Nothing to retry.`);
      process.exit(0);
    }
    const retryLog = JSON.parse(readFileSync(RETRY_LOG_PATH, "utf-8"));
    console.log(`[send-alerts] Retry mode: ${retryLog.deliveries.length} failed deliveries found`);

    // Convert retry log format back to processable format
    changesToProcess = retryLog.deliveries.map((d) => ({
      _retryDelivery: d,
      slug: d.entity_slug,
      name: d.entity_name ?? d.entity_slug,
      index: d.index_slug,
      // Retry uses stored template data if available, otherwise minimal data
      ...(d.template_data ?? {}),
    }));
  } else {
    // Normal mode: load daily briefing JSON
    if (!existsSync(BRIEFING_PATH)) {
      console.error(`[send-alerts] ERROR: Daily briefing not found: ${BRIEFING_PATH}`);
      console.error(`[send-alerts] Aborting — do not send alerts without the briefing (integrity requirement).`);
      process.exit(1);
    }

    const briefing = JSON.parse(readFileSync(BRIEFING_PATH, "utf-8"));
    const allChanges = briefing.scoreChanges ?? [];

    /**
     * Alert threshold filter:
     * - status === 'applied'     — only approved/applied changes, never proposals under review
     * - Math.abs(delta) >= 5     — 5-point threshold for substantive score changes
     * - OR bandCrossing === true — always alert on band transitions regardless of delta size
     *
     * This is the convention from the research pipeline: sub-5pt changes are documented
     * but do not trigger subscriber alerts, because small movements within a band are
     * within measurement uncertainty.
     */
    const filteredChanges = allChanges.filter(
      (c) => c.status === "applied" && (Math.abs(c.delta ?? 0) >= 5 || c.bandCrossing === true)
    );

    console.log(
      `[send-alerts] Briefing loaded: ${allChanges.length} total changes, ` +
      `${filteredChanges.length} meet alert threshold (|delta|>=5 or bandChange)`
    );

    changesToProcess = filteredChanges;

    if (ENTITY_FILTER) {
      changesToProcess = changesToProcess.filter((c) => c.slug === ENTITY_FILTER);
      console.log(`[send-alerts] Entity filter applied: ${changesToProcess.length} changes for ${ENTITY_FILTER}`);
    }
  }

  if (changesToProcess.length === 0) {
    console.log(`[send-alerts] No changes meet alert threshold for ${TARGET_DATE}. Exiting.`);
    // Write an empty delivery log for audit trail
    writeDeliveryLog([], []);
    process.exit(0);
  }

  // ── Step 2: Process each entity change ──────────────────────────────────

  const allDeliveries = [];
  const failedDeliveries = [];
  const entitiesWithChanges = [];
  let anyFailure = false;

  for (const change of changesToProcess) {
    const entitySlug = change.slug;
    if (!entitySlug) continue;

    console.log(`[send-alerts] Processing entity: ${entitySlug}`);
    entitiesWithChanges.push(entitySlug);

    // Fetch subscribers
    let subscribers = [];
    try {
      if (USE_LISTMONK_FALLBACK) {
        console.log(`[send-alerts]   Using Listmonk fallback for subscriber query`);
        subscribers = await fetchSubscribersFromListmonk(entitySlug);
      } else {
        subscribers = await fetchSubscribersFromWorker(entitySlug);
      }
    } catch (err) {
      console.error(`[send-alerts]   ERROR fetching subscribers for ${entitySlug}: ${err.message}`);
      // Try Listmonk fallback if Worker fails
      if (!USE_LISTMONK_FALLBACK) {
        try {
          console.log(`[send-alerts]   Attempting Listmonk fallback...`);
          subscribers = await fetchSubscribersFromListmonk(entitySlug);
        } catch (fallbackErr) {
          console.error(`[send-alerts]   Listmonk fallback also failed: ${fallbackErr.message}`);
          anyFailure = true;
          continue;
        }
      } else {
        anyFailure = true;
        continue;
      }
    }

    console.log(`[send-alerts]   Found ${subscribers.length} subscriber(s)`);

    // Apply email filter if provided
    const toProcess = EMAIL_FILTER
      ? subscribers.filter((s) => s.email === EMAIL_FILTER)
      : subscribers;

    const now = new Date();

    // ── Step 3: Process each subscriber ───────────────────────────────────
    for (const subscriber of toProcess) {
      const deliveryBase = {
        email: subscriber.email,
        entity_slug: entitySlug,
        entity_name: change.name ?? entitySlug,
        index_slug: change.index ?? "",
        delta: change.delta ?? 0,
        band_change: change.bandCrossing
          ? `${change.publishedBand} → ${change.proposedBand}`
          : null,
        started_at: subscriber.started_at,
        expires_at: subscriber.expires_at,
        gumroad_sale_id: subscriber.gumroad_sale_id,
      };

      // Check expiry — subscribers active past expires_at get no alerts
      // (status 'active' and 'cancelled' both receive alerts until expires_at)
      if (subscriber.status === "refunded") {
        console.log(`[send-alerts]   Skip ***@${subscriber.email.split("@")[1]}: refunded`);
        allDeliveries.push({ ...deliveryBase, status: "suppressed-refunded" });
        continue;
      }

      if (subscriber.expires_at && new Date(subscriber.expires_at) <= now) {
        console.log(`[send-alerts]   Skip ***@${subscriber.email.split("@")[1]}: expired ${subscriber.expires_at}`);
        allDeliveries.push({ ...deliveryBase, status: "skipped-expired" });
        continue;
      }

      // Build template data for the alert email
      const templateData = buildAlertTemplateData(change, subscriber);

      if (DRY_RUN) {
        console.log(`[send-alerts]   DRY RUN: would send to ***@${subscriber.email.split("@")[1]}`);
        allDeliveries.push({
          ...deliveryBase,
          status: "dry-run",
          sent_at: now.toISOString(),
          template_data: templateData,
        });
        continue;
      }

      // ── Step 4: Send the alert email ─────────────────────────────────
      try {
        const messageId = await sendAlertEmail(subscriber.email, templateData);
        console.log(`[send-alerts]   Sent to ***@${subscriber.email.split("@")[1]} (msgId: ${messageId})`);
        allDeliveries.push({
          ...deliveryBase,
          status: "sent",
          sent_at: now.toISOString(),
          listmonk_message_id: messageId,
        });
      } catch (err) {
        console.error(`[send-alerts]   FAILED send to ***@${subscriber.email.split("@")[1]}: ${err.message}`);
        anyFailure = true;
        const failedDelivery = {
          ...deliveryBase,
          status: "failed",
          error: err.message,
          attempted_at: now.toISOString(),
          template_data: templateData, // Preserved for retry
        };
        allDeliveries.push(failedDelivery);
        failedDeliveries.push(failedDelivery);
      }
    }
  }

  // ── Step 5: Write delivery log ───────────────────────────────────────────
  writeDeliveryLog(allDeliveries, entitiesWithChanges);

  // Write retry file if there were failures
  if (failedDeliveries.length > 0) {
    writeRetryLog(failedDeliveries, entitiesWithChanges);
    console.log(`[send-alerts] WARN: ${failedDeliveries.length} send failure(s). Retry file: ${RETRY_LOG_PATH}`);
    console.log(`[send-alerts] To retry: node send-alerts.mjs --date ${TARGET_DATE} --retry`);
  }

  // Summary
  const summary = buildSummary(allDeliveries);
  console.log(
    `[send-alerts] Done — sent=${summary.sent} failed=${summary.failed} ` +
    `skipped_expired=${summary.skipped_expired} suppressed=${summary.suppressed} dry_run=${summary.dry_run}`
  );

  process.exit(anyFailure ? 1 : 0);
}

// ─── Delivery log writers ────────────────────────────────────────────────────

function buildSummary(deliveries) {
  return deliveries.reduce((acc, d) => {
    const key = d.status === "sent" ? "sent"
      : d.status === "failed" ? "failed"
      : d.status === "skipped-expired" ? "skipped_expired"
      : d.status === "suppressed-refunded" ? "suppressed"
      : d.status === "dry-run" ? "dry_run"
      : "other";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, { sent: 0, failed: 0, skipped_expired: 0, suppressed: 0, dry_run: 0 });
}

function writeDeliveryLog(deliveries, entitiesWithChanges) {
  mkdirSync(DELIVERIES_DIR, { recursive: true });

  const log = {
    date: TARGET_DATE,
    generated_at: new Date().toISOString(),
    dry_run: DRY_RUN,
    entities_with_changes: entitiesWithChanges,
    deliveries,
    summary: buildSummary(deliveries),
  };

  writeFileSync(DELIVERY_LOG_PATH, JSON.stringify(log, null, 2));
  console.log(`[send-alerts] Delivery log written: ${DELIVERY_LOG_PATH}`);
}

function writeRetryLog(failedDeliveries, entitiesWithChanges) {
  const retryLog = {
    date: TARGET_DATE,
    generated_at: new Date().toISOString(),
    entities_with_changes: entitiesWithChanges,
    deliveries: failedDeliveries,
    summary: buildSummary(failedDeliveries),
  };

  writeFileSync(RETRY_LOG_PATH, JSON.stringify(retryLog, null, 2));
}

// ─── Entry point ─────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`[send-alerts] FATAL: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
