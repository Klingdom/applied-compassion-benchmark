#!/usr/bin/env node
/**
 * crawler-log-scan.mjs — AI Answer-Engine Crawler Visibility Scan
 *
 * Reads the persisted Nginx access log (see docker-compose.yml volume mount:
 * `./logs/nginx:/var/log/nginx`) and reports which AI answer-engine crawlers
 * are fetching the site, and which pages they're reading. This is a passive,
 * read-only observability script — it never writes to Nginx, Docker, or any
 * assessment/commercial data path.
 *
 * Nginx here runs its DEFAULT `combined` log format (no custom log_format
 * directive in nginx.conf / nginx-ssl.conf), which already includes
 * $http_user_agent and $http_referer. No Nginx config change was needed to
 * enable this scan — see research/audit-2026-04-24/devops.md.
 *
 * Tracked bots (mirrors the exact allow-list in site/src/app/robots.ts, plus
 * two classic-search crawlers tracked as a comparison baseline):
 *   GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai,
 *   PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot,
 *   Googlebot, Bingbot (baseline)
 *
 * Secondary signal — answer-engine REFERRALS (a human clicked through from an
 * AI engine's answer UI, as opposed to the engine's own crawler fetching us
 * directly): chat.openai.com, chatgpt.com, perplexity.ai, gemini.google.com,
 * claude.ai
 *
 * Privacy: raw client IPs are read but NEVER stored or printed. Only
 * IP-agnostic fields (timestamp, path, status, user-agent, referer) are
 * extracted and tallied. The raw log itself is gitignored (see .gitignore);
 * only this script's derived JSON summary is committed.
 *
 * Usage:
 *   node crawler-log-scan.mjs [options]
 *
 * Options:
 *   --date YYYY-MM-DD   Date to label the output artifact (default: today UTC).
 *                        Does NOT filter which log lines are read — the log
 *                        file may span multiple days since the last rotation;
 *                        this scan reports hits-per-bot-per-day across the
 *                        whole file, and the artifact is simply named/dated
 *                        for the night the scan ran (matching the convention
 *                        of research/alert-deliveries/ and
 *                        research/integrity-reports/).
 *   --log-path <path>   Path to the Nginx access log (default:
 *                        logs/nginx/access.log, relative to repo root).
 *                        Overridable via the CRAWLER_LOG_PATH env var too.
 *
 * Environment variables:
 *   CRAWLER_LOG_PATH    Alternative way to set the log path (same default).
 *
 * Exit codes:
 *   0 — scan completed (including the case where the log file is absent —
 *       this is expected right after a fresh deploy or a rotation gap, and
 *       is NOT treated as a pipeline failure).
 *   1 — an unexpected error occurred while reading/parsing an existing log
 *       file (I/O error other than "not found", or a fatal bug).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join, isAbsolute } from "node:path";
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

// Resolve target date (default: today UTC) — used only to label the output file.
const rawDate = getArg("--date");
const TARGET_DATE = rawDate ?? new Date().toISOString().slice(0, 10);

if (!/^\d{4}-\d{2}-\d{2}$/.test(TARGET_DATE)) {
  console.error(`[crawler-log-scan] ERROR: --date must be YYYY-MM-DD, got: ${TARGET_DATE}`);
  process.exit(1);
}

// Resolve log path: --log-path > CRAWLER_LOG_PATH env > default
const rawLogPath = getArg("--log-path") ?? process.env.CRAWLER_LOG_PATH ?? "logs/nginx/access.log";
const LOG_PATH = isAbsolute(rawLogPath) ? rawLogPath : join(REPO_ROOT, rawLogPath);

// ─── Output paths ────────────────────────────────────────────────────────────

const OUTPUT_DIR = join(REPO_ROOT, "research", "aeo-crawler-logs");
const OUTPUT_PATH = join(OUTPUT_DIR, `${TARGET_DATE}.json`);

// ─── Bot / referral definitions ──────────────────────────────────────────────

/**
 * Exact allow-list from site/src/app/robots.ts, plus Googlebot and Bingbot
 * tracked as a classic-search baseline for comparison. Matching is a
 * case-insensitive substring test against the User-Agent string, which is
 * how these crawlers self-identify (e.g. "Mozilla/5.0 AppleWebKit
 * (compatible; GPTBot/1.0; +https://openai.com/gptbot)").
 */
const TRACKED_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Googlebot", // classic-search baseline
  "Bingbot",   // classic-search baseline
];

/**
 * Answer-engine domains checked against the Referer header — a secondary
 * signal for human click-throughs from an AI engine's answer UI (distinct
 * from the crawler hits above, which are the engines fetching us directly).
 */
const ANSWER_ENGINE_REFERRAL_DOMAINS = [
  "chat.openai.com",
  "chatgpt.com",
  "perplexity.ai",
  "gemini.google.com",
  "claude.ai",
];

const TOP_PATHS_LIMIT = 15;

// ─── Nginx `combined` log format parsing ─────────────────────────────────────
//
// $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent
// "$http_referer" "$http_user_agent"
//
// Example:
//   203.0.113.5 - - [22/Jul/2026:02:15:33 +0000] "GET /company/acme-corp HTTP/1.1"
//   200 4821 "-" "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)"
//
// The leading $remote_addr is captured only so the regex aligns with the
// format; it is discarded immediately and never stored in any parsed record
// or written to output.

const COMBINED_LOG_RE =
  /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([A-Z]+) (\S+) ([^"]*)" (\d{3}) (\S+) "([^"]*)" "([^"]*)"/;

const MONTHS = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** Convert Nginx's $time_local (e.g. "22/Jul/2026:02:15:33 +0000") to YYYY-MM-DD, or null if unparseable. */
function nginxTimeToDate(timeLocal) {
  const m = timeLocal.match(/^(\d{2})\/(\w{3})\/(\d{4}):/);
  if (!m) return null;
  const [, day, monStr, year] = m;
  const mon = MONTHS[monStr];
  if (!mon) return null;
  return `${year}-${mon}-${day}`;
}

/**
 * Parse one Nginx `combined` log line into an IP-agnostic record.
 * Returns null for lines that don't match (blank lines, truncated lines from
 * an in-progress write, or a future custom-format line) — these are skipped,
 * never thrown.
 */
function parseLine(line) {
  const m = COMBINED_LOG_RE.exec(line);
  if (!m) return null;

  const [, , , , timeLocal, , path, , status, , referer, userAgent] = m;
  const date = nginxTimeToDate(timeLocal);
  if (!date) return null;

  return {
    date,
    path: path.split("?")[0] || path, // strip query string for path grouping
    status: Number(status),
    referer: referer === "-" ? null : referer,
    userAgent: userAgent === "-" ? "" : userAgent,
  };
}

/** Return the first tracked bot name whose token appears (case-insensitively) in the user-agent string, or null. */
function matchBot(userAgent) {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  for (const bot of TRACKED_BOTS) {
    if (ua.includes(bot.toLowerCase())) return bot;
  }
  return null;
}

/** Return the first answer-engine referral domain found in the referer string, or null. */
function matchReferralDomain(referer) {
  if (!referer) return null;
  const ref = referer.toLowerCase();
  for (const domain of ANSWER_ENGINE_REFERRAL_DOMAINS) {
    if (ref.includes(domain)) return domain;
  }
  return null;
}

// ─── Tally helpers ────────────────────────────────────────────────────────────

function makeEmptyTally() {
  return {
    totalHits: 0,
    hitsByDay: {},
    pathCounts: new Map(), // path -> count (converted to sorted top-N array at write time)
  };
}

function recordHit(tally, date, path) {
  tally.totalHits += 1;
  tally.hitsByDay[date] = (tally.hitsByDay[date] ?? 0) + 1;
  tally.pathCounts.set(path, (tally.pathCounts.get(path) ?? 0) + 1);
}

function topPaths(tally, limit) {
  return [...tally.pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, hits]) => ({ path, hits }));
}

// ─── Core algorithm ──────────────────────────────────────────────────────────

function main() {
  console.log(`[crawler-log-scan] Starting — date=${TARGET_DATE} logPath=${LOG_PATH}`);

  // Rotation-aware, graceful handling: a missing log file is an expected
  // state (fresh deploy, log rotated away, volume not yet mounted on this
  // host) and must NOT fail the nightly pipeline.
  if (!existsSync(LOG_PATH)) {
    console.log(
      `[crawler-log-scan] No access log found at ${LOG_PATH} — nothing to scan tonight. ` +
      `This is expected if the site was just deployed, the log volume isn't mounted yet ` +
      `(see docker-compose.yml), or the log rotated since the last run. Exiting cleanly.`
    );
    process.exit(0);
  }

  let raw;
  try {
    raw = readFileSync(LOG_PATH, "utf-8");
  } catch (err) {
    console.error(`[crawler-log-scan] ERROR reading ${LOG_PATH}: ${err.message}`);
    process.exit(1);
    return;
  }

  const lines = raw.split("\n").filter((l) => l.trim().length > 0);

  const botTallies = new Map(TRACKED_BOTS.map((bot) => [bot, makeEmptyTally()]));
  const referralTallies = new Map(
    ANSWER_ENGINE_REFERRAL_DOMAINS.map((domain) => [domain, makeEmptyTally()])
  );

  let parsedCount = 0;
  let skippedCount = 0;
  let earliestDate = null;
  let latestDate = null;

  for (const line of lines) {
    const rec = parseLine(line);
    if (!rec) {
      skippedCount += 1;
      continue;
    }
    parsedCount += 1;

    if (!earliestDate || rec.date < earliestDate) earliestDate = rec.date;
    if (!latestDate || rec.date > latestDate) latestDate = rec.date;

    const bot = matchBot(rec.userAgent);
    if (bot) {
      recordHit(botTallies.get(bot), rec.date, rec.path);
    }

    const referralDomain = matchReferralDomain(rec.referer);
    if (referralDomain) {
      recordHit(referralTallies.get(referralDomain), rec.date, rec.path);
    }
  }

  console.log(
    `[crawler-log-scan] Parsed ${parsedCount} line(s), skipped ${skippedCount} unparseable line(s). ` +
    `Date range covered: ${earliestDate ?? "n/a"} to ${latestDate ?? "n/a"}`
  );

  // ── Build output ──────────────────────────────────────────────────────────

  const bots = {};
  let totalBotHits = 0;
  for (const [bot, tally] of botTallies) {
    bots[bot] = {
      totalHits: tally.totalHits,
      hitsByDay: tally.hitsByDay,
      topPaths: topPaths(tally, TOP_PATHS_LIMIT),
    };
    totalBotHits += tally.totalHits;
  }

  const answerEngineReferrals = {};
  let totalReferralHits = 0;
  for (const [domain, tally] of referralTallies) {
    answerEngineReferrals[domain] = {
      totalHits: tally.totalHits,
      hitsByDay: tally.hitsByDay,
      topPaths: topPaths(tally, TOP_PATHS_LIMIT),
    };
    totalReferralHits += tally.totalHits;
  }

  const summary = {
    logPath: rawLogPath, // relative form recorded for portability; never the raw log contents
    linesParsed: parsedCount,
    linesSkipped: skippedCount,
    dateRangeCovered: { earliest: earliestDate, latest: latestDate },
    totalBotHits,
    totalAnswerEngineReferralHits: totalReferralHits,
    hitsPerBot: Object.fromEntries(
      Object.entries(bots).map(([bot, data]) => [bot, data.totalHits])
    ),
  };

  const output = {
    date: TARGET_DATE,
    generatedAt: new Date().toISOString(),
    summary,
    bots,
    answerEngineReferrals,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[crawler-log-scan] Summary written: ${OUTPUT_PATH}`);
  console.log(
    `[crawler-log-scan] Done — total bot hits=${totalBotHits}, ` +
    `answer-engine referral hits=${totalReferralHits}`
  );

  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(`[crawler-log-scan] FATAL: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}
