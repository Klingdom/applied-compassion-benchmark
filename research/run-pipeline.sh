#!/bin/bash
# ==============================================================
# Compassion Benchmark — Overnight Research Pipeline
# ==============================================================
# Runs the pipeline: scanner → assessor → digest, then a validation gate.
#
# The digest stage AUTHORS the public daily briefing directly in the rich
# schema (site/src/data/updates/daily/<date>.json + latest.json + manifest.json).
# The legacy site/scripts/prepare-updates.mjs is DEPRECATED for the public
# briefing (it emits a flat schema the build rejects) and is NOT run here.
#
# Entity counts:
#   - Scanned nightly: ~1,160 (rotation-state coverage, incl. unpublished)
#   - Scored/published: 1,156 (sum of the 7 index rankings)
#
# Usage:
#   ./research/run-pipeline.sh              # Uses today's date
#   ./research/run-pipeline.sh 2026-04-16   # Uses specified date
#   ./research/run-pipeline.sh 2026-04-16 5 # Assess top 5 entities only
# ==============================================================

set -e

DATE="${1:-$(date +%Y-%m-%d)}"
ENTITY_COUNT="${2:-15}"

echo "============================================================"
echo "  Compassion Benchmark — Overnight Research Pipeline"
echo "  Date: $DATE"
echo "  Assessment target: top $ENTITY_COUNT entities"
echo "============================================================"
echo ""

# Stage 1: Scanner
echo "==> Stage 1/4: Running overnight scanner..."
echo "    Scanning ~1,160 entities for recent (<=14-day) evidence..."
echo ""
claude --agent overnight-scanner --print "Run nightly scan for $DATE. Output to research/scans/$DATE.json"

echo ""
echo "==> Scanner complete. Checking output..."
if [ -f "research/scans/$DATE.json" ]; then
  echo "    ✓ Scan file created: research/scans/$DATE.json"
else
  echo "    ✗ ERROR: Scan file not found. Aborting pipeline."
  exit 1
fi

echo ""

# Stage 2: Assessor
echo "==> Stage 2/4: Running overnight assessor..."
echo "    Assessing top $ENTITY_COUNT entities from scan results..."
echo ""
claude --agent overnight-assessor --print "Run nightly assessments for $DATE. Assess the top $ENTITY_COUNT entities from research/scans/$DATE.json. Write assessment reports and change proposals."

echo ""
echo "==> Assessor complete."

# Stage 3: Digest (also authors the public daily briefing in the rich schema)
echo "==> Stage 3/4: Running overnight digest..."
echo "    Writing markdown digest + rich public briefing + PENDING_CHANGES..."
echo ""
claude --agent overnight-digest --print "Generate digest for $DATE. Read today's assessments and change proposals, write research/digests/$DATE.md, update research/PENDING_CHANGES.md, AND author the public daily briefing in the RICH schema at site/src/data/updates/daily/$DATE.json + update site/src/data/updates/latest.json and manifest.json. Do NOT run prepare-updates.mjs. Self-validate with validate-daily-briefings.mjs and lint-daily-briefings.mjs until both pass."

echo ""
echo "==> Digest complete."

# Stage 4: Validation gate (confirm the public briefing satisfies the build gates)
echo ""
echo "==> Stage 4/4: Validating public briefing (build gates)..."
echo ""
node site/scripts/validate-daily-briefings.mjs
node site/scripts/lint-daily-briefings.mjs
echo "    ✓ Public briefing passes the rich-schema + lint gates."

# Optional: Score-Watch alert PREVIEW (always dry-run here).
# The nightly run happens BEFORE any proposal is applied, so this only previews
# what WOULD send. Live alerts go out post-apply (see runbook below). Skips
# cleanly when the alert pipeline isn't configured.
if [ -n "${SCORE_WATCH_INTERNAL_TOKEN:-}" ]; then
  echo ""
  echo "==> Optional: Score-Watch alert preview (dry run)..."
  node research/scripts/send-alerts.mjs --date "$DATE" --dry-run || true
else
  echo ""
  echo "==> Optional: Score-Watch alerts not configured (SCORE_WATCH_INTERNAL_TOKEN unset) — skipped."
fi

echo ""
echo "============================================================"
echo "  Pipeline complete for $DATE"
echo ""
echo "  Review outputs:"
echo "    Scan results:     research/scans/$DATE.json"
echo "    Daily digest:     research/digests/$DATE.md"
echo "    Pending changes:  research/PENDING_CHANGES.md"
echo "    Assessments:      research/assessments/"
echo "    Change proposals: research/change-proposals/"
echo "    Public briefing:  site/src/data/updates/daily/$DATE.json"
echo ""
echo "  To approve a proposal:"
echo "    1. Edit research/change-proposals/{slug}.json"
echo "    2. Set \"status\": \"approved\""
echo "    3. Run: claude --agent score-updater \"Apply approved changes\""
echo "    4. Refresh the public briefing to the applied state + rebuild:"
echo "       cd site && npm run build"
echo "    5. Send Score-Watch alerts for the applied change(s):"
echo "       node research/scripts/send-alerts.mjs --date $DATE --dry-run   # preview first"
echo "       node research/scripts/send-alerts.mjs --date $DATE             # then send live"
echo "       (env: SCORE_WATCH_INTERNAL_TOKEN, LISTMONK_API_URL/USER/TOKEN,"
echo "        LISTMONK_ALERT_TEMPLATE_ID, UNSUBSCRIBE_HMAC_SECRET, WORKER_BASE_URL)"
echo "============================================================"
