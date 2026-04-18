#!/usr/bin/env bash
# =============================================================================
# Compassion Benchmark — Nightly Autonomous Pipeline
# =============================================================================
# End-to-end nightly orchestrator, designed for unattended execution via cron
# on the Hostinger VPS.
#
# Pipeline stages:
#   1. git pull (sync latest main)
#   2. Scanner  (Sonnet, ~30 min)
#   3. Assessor (Opus,  ~2 hrs)
#   4. Digest   (Sonnet, ~5 min)
#   5. prepare-updates.mjs (generate Updates page feed)
#   6. git commit research artifacts + site updates feed
#   7. git push to origin/main
#   8. Docker rebuild (static site picks up new data feed)
#
# NOTE: This pipeline does NOT apply score changes to published indexes.
# Change proposals are emitted with status="pending" and require human review
# via research/PENDING_CHANGES.md. The score-updater agent is invoked manually
# after the human reviews and approves proposals.
#
# Usage:
#   ./scripts/nightly-pipeline.sh                 # today (UTC date on VPS)
#   ./scripts/nightly-pipeline.sh 2026-04-19      # explicit date
#   ./scripts/nightly-pipeline.sh 2026-04-19 10   # explicit date, 10 entities
#
# Environment variables (optional):
#   ANTHROPIC_API_KEY   — required for Claude CLI (set in crontab or ~/.bashrc)
#   NIGHTLY_WEBHOOK_URL — if set, POST status on completion (Slack/Discord)
#   SKIP_DOCKER_REBUILD — if "1", skip stage 8 (useful for local testing)
#   SKIP_GIT_PUSH       — if "1", skip stages 6-7 (local dry run)
# =============================================================================

set -o pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DATE="${1:-$(date -u +%Y-%m-%d)}"
ENTITY_COUNT="${2:-15}"

LOG_DIR="$REPO_ROOT/research/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/nightly-${DATE}.log"
STATUS_FILE="$LOG_DIR/last-run-status.txt"

START_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STAGE="init"

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
log() {
  echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG_FILE"
}

fail() {
  local msg="$1"
  local stage="$STAGE"
  log "ERROR in stage '$stage': $msg"
  cat > "$STATUS_FILE" <<EOF
status=FAILED
date=$DATE
stage=$stage
message=$msg
start=$START_TS
end=$(date -u +%Y-%m-%dT%H:%M:%SZ)
log=$LOG_FILE
EOF
  notify "FAILED — $DATE — stage '$stage' — $msg"
  exit 1
}

notify() {
  local msg="$1"
  if [ -n "${NIGHTLY_WEBHOOK_URL:-}" ]; then
    # Works for Slack and Discord incoming webhooks
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"content\":\"[compassionbenchmark] $msg\",\"text\":\"[compassionbenchmark] $msg\"}" \
      "$NIGHTLY_WEBHOOK_URL" > /dev/null || true
  fi
}

require() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is not installed or not in PATH"
}

# -----------------------------------------------------------------------------
# Preflight
# -----------------------------------------------------------------------------
STAGE="preflight"
log "============================================================"
log "Compassion Benchmark — Nightly Pipeline"
log "Date: $DATE | Entities: $ENTITY_COUNT | Repo: $REPO_ROOT"
log "Start: $START_TS"
log "============================================================"

require claude
require node
require git
[ "${SKIP_DOCKER_REBUILD:-0}" = "1" ] || require docker

if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  log "WARN: ANTHROPIC_API_KEY not in environment — Claude CLI may prompt interactively"
fi

# -----------------------------------------------------------------------------
# Stage 1 — git pull
# -----------------------------------------------------------------------------
STAGE="git-pull"
log ""
log "==> Stage 1/8: git pull"
git pull --ff-only origin main >> "$LOG_FILE" 2>&1 \
  || fail "git pull failed — resolve conflicts manually before next run"

# -----------------------------------------------------------------------------
# Stage 2 — Scanner
# -----------------------------------------------------------------------------
STAGE="scanner"
log ""
log "==> Stage 2/8: overnight-scanner (Sonnet, ~30 min)"

claude --agent overnight-scanner --print \
  "Run nightly scan for $DATE. Scan all 1,155 entities. Write research/scans/$DATE.json with top 20-30 priority targets." \
  >> "$LOG_FILE" 2>&1 \
  || fail "scanner agent exited non-zero"

[ -f "research/scans/$DATE.json" ] || fail "scanner did not produce research/scans/$DATE.json"

# -----------------------------------------------------------------------------
# Stage 3 — Assessor
# -----------------------------------------------------------------------------
STAGE="assessor"
log ""
log "==> Stage 3/8: overnight-assessor (Opus, ~2 hrs)"

claude --agent overnight-assessor --print \
  "Run nightly assessments for $DATE. Assess the top $ENTITY_COUNT entities from research/scans/$DATE.json. Write research/assessments/{slug}.md and research/change-proposals/{slug}.json with status=pending. Write research/scans/$DATE-assessor-summary.json." \
  >> "$LOG_FILE" 2>&1 \
  || fail "assessor agent exited non-zero"

[ -f "research/scans/$DATE-assessor-summary.json" ] || fail "assessor did not produce summary file"

# -----------------------------------------------------------------------------
# Stage 4 — Digest
# -----------------------------------------------------------------------------
STAGE="digest"
log ""
log "==> Stage 4/8: overnight-digest (Sonnet, ~5 min)"

claude --agent overnight-digest --print \
  "Generate digest for $DATE. Read research/scans/$DATE.json, research/scans/$DATE-assessor-summary.json, today's assessments and change proposals. Write research/digests/$DATE.md and update research/PENDING_CHANGES.md." \
  >> "$LOG_FILE" 2>&1 \
  || fail "digest agent exited non-zero"

[ -f "research/digests/$DATE.md" ] || fail "digest did not produce digest file"

# -----------------------------------------------------------------------------
# Stage 5 — prepare-updates (Updates page feed)
# -----------------------------------------------------------------------------
STAGE="prepare-updates"
log ""
log "==> Stage 5/8: prepare-updates.mjs"

node site/scripts/prepare-updates.mjs "$DATE" >> "$LOG_FILE" 2>&1 \
  || fail "prepare-updates.mjs exited non-zero"

[ -f "site/src/data/updates/daily/$DATE.json" ] \
  || fail "prepare-updates did not produce daily/$DATE.json"

# -----------------------------------------------------------------------------
# Stage 6 — git commit
# -----------------------------------------------------------------------------
STAGE="git-commit"
log ""
log "==> Stage 6/8: git commit"

if [ "${SKIP_GIT_PUSH:-0}" = "1" ]; then
  log "SKIP_GIT_PUSH=1 — skipping commit + push"
else
  git add research/ site/src/data/updates/ >> "$LOG_FILE" 2>&1

  if git diff --cached --quiet; then
    log "No changes to commit (scanner/assessor produced no new artifacts?)"
  else
    git commit -m "Nightly pipeline run — $DATE

Automated nightly research pipeline results.
Change proposals emitted with status=pending for human review via
research/PENDING_CHANGES.md.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>" \
      >> "$LOG_FILE" 2>&1 \
      || fail "git commit failed"

    # -------------------------------------------------------------------------
    # Stage 7 — git push
    # -------------------------------------------------------------------------
    STAGE="git-push"
    log ""
    log "==> Stage 7/8: git push origin main"

    git push origin main >> "$LOG_FILE" 2>&1 \
      || fail "git push failed — check SSH key and remote access"
  fi
fi

# -----------------------------------------------------------------------------
# Stage 8 — Docker rebuild (on VPS only)
# -----------------------------------------------------------------------------
STAGE="docker-rebuild"
log ""
log "==> Stage 8/8: docker compose rebuild"

if [ "${SKIP_DOCKER_REBUILD:-0}" = "1" ]; then
  log "SKIP_DOCKER_REBUILD=1 — skipping rebuild"
else
  docker compose build --no-cache web >> "$LOG_FILE" 2>&1 \
    || fail "docker build failed"
  docker compose up -d web >> "$LOG_FILE" 2>&1 \
    || fail "docker up failed"
  # Re-apply SSL nginx config (rebuild reverts to HTTP-only default)
  if [ -f nginx-ssl.conf ]; then
    docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf >> "$LOG_FILE" 2>&1 || true
    docker compose exec -T web nginx -s reload >> "$LOG_FILE" 2>&1 || true
  fi
fi

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
STAGE="done"
END_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

log ""
log "============================================================"
log "Pipeline complete for $DATE"
log "Start: $START_TS"
log "End:   $END_TS"
log "Log:   $LOG_FILE"
log "============================================================"
log ""
log "Morning review checklist:"
log "  1. Open research/PENDING_CHANGES.md"
log "  2. For each proposal, set status=approved in research/change-proposals/{slug}.json"
log "  3. Run: claude --agent score-updater \"Apply approved changes\""
log "  4. Run: ./scripts/nightly-pipeline.sh $DATE  (or just the tail: prepare-updates + commit + push + rebuild)"

cat > "$STATUS_FILE" <<EOF
status=OK
date=$DATE
stage=done
message=Pipeline completed successfully
start=$START_TS
end=$END_TS
log=$LOG_FILE
EOF

notify "OK — $DATE — pipeline completed ($LOG_FILE)"
exit 0
