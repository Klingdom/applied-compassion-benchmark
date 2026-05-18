#!/usr/bin/env node
/**
 * integrity-check.mjs — Independence Safeguard Audit
 *
 * Implements ARCHITECTURE_MONETIZATION.md §8.3 auditable invariants.
 * Run WEEKLY (not nightly) to verify the structural separation between the
 * assessment plane and the commercial plane.
 *
 * Usage:
 *   node integrity-check.mjs [--date YYYY-MM-DD]
 *
 * Writes a Markdown report to:
 *   research/integrity-reports/<date>.md
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more violations detected (report contains details)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

// CLI
const args = process.argv.slice(2);
const rawDate = args.find((_, i) => args[i - 1] === "--date");
const TARGET_DATE = rawDate ?? new Date().toISOString().slice(0, 10);

const REPORTS_DIR = join(REPO_ROOT, "research", "integrity-reports");
const REPORT_PATH = join(REPORTS_DIR, `${TARGET_DATE}.md`);

// ─── Check runners ────────────────────────────────────────────────────────────

/**
 * Run a shell command and return stdout. Returns empty string on non-zero exit.
 * We never throw — violations are recorded in the report.
 */
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      ...opts,
    }).trim();
  } catch (err) {
    // If command exits non-zero (e.g. grep found nothing), return empty or stderr
    return (err.stdout ?? "").trim();
  }
}

// ─── Individual checks ────────────────────────────────────────────────────────

/**
 * Check 1: No commercial-plane process has ever committed to site/src/data/indexes/
 *
 * git log --all -- site/src/data/indexes/ lists all commits touching the indexes
 * directory. We filter out allowed committers (assessment pipeline actors).
 * Any remaining commit is a violation.
 *
 * Allowed commit message patterns (from the automated assessment pipeline):
 *   scanner, assessor, digest, founder, score-updater
 *
 * Note: This check reads git history — it will flag any commit to indexes/ whose
 * message or author does not match the allowed pattern. If you have manual commits
 * for methodology changes, those must be authored as "founder" or similar.
 */
function checkIndexCommitAuthors() {
  const label = "Check 1: Index files modified only by assessment pipeline";
  console.log(`[integrity] Running: ${label}`);

  // Get all commit hashes and messages touching indexes directory
  const logOutput = run(
    `git log --all --oneline -- site/src/data/indexes/`
  );

  if (!logOutput) {
    return { label, status: "PASS", detail: "No commits found touching indexes (empty history or clean)." };
  }

  const lines = logOutput.split("\n").filter(Boolean);

  // Filter out commits by allowed actors
  const allowedPattern = /scanner|assessor|digest|founder|score-updater/i;
  const violations = lines.filter((line) => !allowedPattern.test(line));

  if (violations.length === 0) {
    return {
      label,
      status: "PASS",
      detail: `${lines.length} commits to indexes/ — all from allowed pipeline actors.`,
    };
  }

  return {
    label,
    status: "FAIL",
    detail: `${violations.length} commit(s) touching site/src/data/indexes/ from non-pipeline actors:\n\n` +
      violations.map((v) => `  ${v}`).join("\n") +
      `\n\nExpected: all commits should mention scanner, assessor, digest, founder, or score-updater`,
    violations,
  };
}

/**
 * Check 2: Commercial keywords only appear in allowed scripts
 *
 * Scans research/scripts/ for keywords indicating commercial integration:
 *   watch:, listmonk, gumroad
 *
 * These should ONLY appear in send-alerts.mjs and integrity-check.mjs (this file).
 * Finding them in scanner/assessor/digest would indicate the assessment pipeline
 * has been contaminated with commercial awareness.
 */
function checkScriptContamination() {
  const label = "Check 2: Commercial keywords confined to send-alerts.mjs";
  console.log(`[integrity] Running: ${label}`);

  const scriptsDir = join(REPO_ROOT, "research", "scripts");

  // Use grep to find matches, then filter out allowed files
  let grepOutput = "";
  try {
    grepOutput = run(
      `grep -r -l "watch:|listmonk|gumroad" "${scriptsDir}"`
    );
  } catch {
    grepOutput = "";
  }

  if (!grepOutput) {
    return {
      label,
      status: "PASS",
      detail: "No commercial keywords found in research/scripts/ (or no scripts directory).",
    };
  }

  const matchedFiles = grepOutput.split("\n").filter(Boolean);
  const allowedFiles = ["send-alerts.mjs", "integrity-check.mjs"];
  const violations = matchedFiles.filter(
    (f) => !allowedFiles.some((allowed) => f.endsWith(allowed))
  );

  if (violations.length === 0) {
    return {
      label,
      status: "PASS",
      detail: `Commercial keywords found only in allowed files: ${matchedFiles.map((f) => f.split("/").pop()).join(", ")}`,
    };
  }

  return {
    label,
    status: "FAIL",
    detail: `Commercial keywords (watch:|listmonk|gumroad) found in unexpected scripts:\n\n` +
      violations.map((v) => `  ${v}`).join("\n") +
      `\n\nOnly send-alerts.mjs and integrity-check.mjs should contain these patterns.`,
    violations,
  };
}

/**
 * Check 3: send-alerts.mjs does not import or read indexes/* or change-proposals/*
 *
 * The alert pipeline must read ONLY from:
 *   site/src/data/updates/daily/<date>.json  (briefing — OK)
 *   research/alert-deliveries/<date>.json    (its own output — OK)
 *
 * It must NOT read from:
 *   site/src/data/indexes/*     (score files)
 *   research/change-proposals/* (proposals)
 *   research/assessments/*      (assessments)
 */
function checkSendAlertsReadScope() {
  const label = "Check 3: send-alerts.mjs does not read indexes or change-proposals";
  console.log(`[integrity] Running: ${label}`);

  const sendAlertsPath = join(REPO_ROOT, "research", "scripts", "send-alerts.mjs");
  if (!existsSync(sendAlertsPath)) {
    return { label, status: "SKIP", detail: "send-alerts.mjs not found — check not applicable." };
  }

  const source = readFileSync(sendAlertsPath, "utf-8");

  const forbiddenPatterns = [
    { pattern: /indexes\//,         description: "references site/src/data/indexes/" },
    { pattern: /change-proposals\//,description: "references research/change-proposals/" },
    { pattern: /assessments\//,     description: "references research/assessments/" },
  ];

  const violations = forbiddenPatterns.filter(({ pattern }) => pattern.test(source));

  if (violations.length === 0) {
    return {
      label,
      status: "PASS",
      detail: "send-alerts.mjs contains no references to index files, change-proposals, or assessments.",
    };
  }

  return {
    label,
    status: "FAIL",
    detail: "send-alerts.mjs contains references to protected assessment files:\n\n" +
      violations.map((v) => `  - ${v.description}`).join("\n") +
      "\n\nThe alert pipeline must read only from daily briefing JSON.",
    violations: violations.map((v) => v.description),
  };
}

/**
 * Check 4: Worker source has no GitHub token reference
 *
 * The Cloudflare Worker must not contain any GITHUB_TOKEN reference.
 * With no GitHub token, the Worker cannot push to the repo and cannot
 * modify scores, indexes, or proposals — even if an attacker compromised it.
 */
function checkWorkerNoGitHubToken() {
  const label = "Check 4: Worker source contains no GITHUB_TOKEN reference";
  console.log(`[integrity] Running: ${label}`);

  const workerSrcDir = join(REPO_ROOT, "worker", "src");
  if (!existsSync(workerSrcDir)) {
    return { label, status: "SKIP", detail: "worker/src/ not found — check not applicable." };
  }

  let grepOutput = "";
  try {
    grepOutput = run(`grep -r -l "GITHUB_TOKEN\\|github_token\\|GH_TOKEN" "${workerSrcDir}"`);
  } catch {
    grepOutput = "";
  }

  if (!grepOutput) {
    return {
      label,
      status: "PASS",
      detail: "Worker source contains no GitHub token references. Worker cannot modify the repository.",
    };
  }

  const matchedFiles = grepOutput.split("\n").filter(Boolean);
  return {
    label,
    status: "FAIL",
    detail: "Worker source contains a GitHub token reference — CRITICAL violation:\n\n" +
      matchedFiles.map((f) => `  ${f}`).join("\n") +
      "\n\nThe Worker must never have write access to the repository. Remove the token reference immediately.",
    violations: matchedFiles,
  };
}

/**
 * Check 5: Worker KV env interface does not include any score-writing capability
 *
 * The Worker's Env interface should contain SCORE_WATCH KV namespace (subscriber
 * state) but must NOT contain any binding that would allow it to write to the
 * VPS filesystem or the git repository.
 *
 * This is a soft check — it looks for suspicious binding names in wrangler.toml.
 */
function checkWorkerEnvBindings() {
  const label = "Check 5: Worker has no VPS filesystem or git write bindings";
  console.log(`[integrity] Running: ${label}`);

  const wranglerPath = join(REPO_ROOT, "worker", "wrangler.toml");
  if (!existsSync(wranglerPath)) {
    return { label, status: "SKIP", detail: "worker/wrangler.toml not found — check not applicable." };
  }

  const toml = readFileSync(wranglerPath, "utf-8");
  const suspiciousPatterns = [
    /GITHUB_TOKEN/i,
    /GH_TOKEN/i,
    /SSH_KEY/i,
    /VPS_/i,
    /DATABASE_URL.*postgres/i,
  ];

  const violations = suspiciousPatterns.filter((p) => p.test(toml));
  if (violations.length === 0) {
    return {
      label,
      status: "PASS",
      detail: "wrangler.toml contains no suspicious write-capable bindings.",
    };
  }

  return {
    label,
    status: "FAIL",
    detail: "wrangler.toml contains potentially dangerous bindings:\n\n" +
      violations.map((v) => `  - Pattern: ${v}`).join("\n"),
    violations: violations.map((v) => String(v)),
  };
}

// ─── Report writer ────────────────────────────────────────────────────────────

function writeReport(results) {
  mkdirSync(REPORTS_DIR, { recursive: true });

  const violations = results.filter((r) => r.status === "FAIL");
  const passes = results.filter((r) => r.status === "PASS");
  const skips = results.filter((r) => r.status === "SKIP");

  const overallStatus = violations.length === 0 ? "PASS" : "FAIL";

  const lines = [
    `# Compassion Benchmark — Independence Integrity Check`,
    ``,
    `**Date:** ${TARGET_DATE}  `,
    `**Run at:** ${new Date().toISOString()}  `,
    `**Overall status:** ${overallStatus === "PASS" ? "PASS — all checks passed" : `FAIL — ${violations.length} violation(s) detected`}`,
    ``,
    `---`,
    ``,
    `## Summary`,
    ``,
    `| Check | Status |`,
    `|---|---|`,
    ...results.map((r) => `| ${r.label} | **${r.status}** |`),
    ``,
    `---`,
    ``,
    `## Check Details`,
    ``,
  ];

  for (const result of results) {
    lines.push(`### ${result.label}`);
    lines.push(``);
    lines.push(`**Status:** ${result.status}`);
    lines.push(``);
    lines.push(result.detail);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  if (violations.length > 0) {
    lines.push(`## Action Required`);
    lines.push(``);
    lines.push(
      `**${violations.length} violation(s) detected.** ` +
      `Review each FAIL above and remediate immediately. ` +
      `The independence guarantee exists to protect Compassion Benchmark's credibility. ` +
      `Any contamination of the assessment plane by commercial data is a critical incident.`
    );
    lines.push(``);
  } else {
    lines.push(`## Independence Guarantee`);
    lines.push(``);
    lines.push(
      `All checks passed. The structural separation between the assessment plane ` +
      `(scores, proposals, assessments) and the commercial plane (subscribers, payments) ` +
      `is intact as of ${TARGET_DATE}.`
    );
    lines.push(``);
  }

  writeFileSync(REPORT_PATH, lines.join("\n"));
  console.log(`[integrity] Report written: ${REPORT_PATH}`);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`[integrity] Running independence integrity check for ${TARGET_DATE}`);

  const results = [
    checkIndexCommitAuthors(),
    checkScriptContamination(),
    checkSendAlertsReadScope(),
    checkWorkerNoGitHubToken(),
    checkWorkerEnvBindings(),
  ];

  for (const r of results) {
    const icon = r.status === "PASS" ? "OK" : r.status === "SKIP" ? "--" : "!!";
    console.log(`[integrity] [${icon}] ${r.label}`);
    if (r.status === "FAIL") {
      console.error(`[integrity]     VIOLATION: ${r.detail.split("\n")[0]}`);
    }
  }

  writeReport(results);

  const violations = results.filter((r) => r.status === "FAIL");
  if (violations.length > 0) {
    console.error(`\n[integrity] FAILED: ${violations.length} integrity violation(s). See ${REPORT_PATH}`);
    process.exit(1);
  }

  console.log(`\n[integrity] PASSED: All independence checks clean. See ${REPORT_PATH}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[integrity] FATAL: ${err.message}`);
  process.exit(1);
});
