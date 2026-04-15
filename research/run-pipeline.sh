#!/bin/bash
# ==============================================================
# Compassion Benchmark — Overnight Research Pipeline
# ==============================================================
# Runs the full three-stage pipeline: scanner → assessor → digest
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
echo "==> Stage 1/3: Running overnight scanner..."
echo "    Scanning 1,155 entities for recent evidence..."
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
echo "==> Stage 2/3: Running overnight assessor..."
echo "    Assessing top $ENTITY_COUNT entities from scan results..."
echo ""
claude --agent overnight-assessor --print "Run nightly assessments for $DATE. Assess the top $ENTITY_COUNT entities from research/scans/$DATE.json. Write assessment reports and change proposals."

echo ""
echo "==> Assessor complete."

# Stage 3: Digest
echo "==> Stage 3/3: Running overnight digest..."
echo "    Generating daily summary and updating review queue..."
echo ""
claude --agent overnight-digest --print "Generate digest for $DATE. Read assessments and change proposals from today, generate research/digests/$DATE.md, and update research/PENDING_CHANGES.md"

echo ""
echo "==> Digest complete."

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
echo ""
echo "  To approve a proposal:"
echo "    1. Edit research/change-proposals/{slug}.json"
echo "    2. Set \"status\": \"approved\""
echo "    3. Run: claude --agent score-updater \"Apply approved changes\""
echo "============================================================"
