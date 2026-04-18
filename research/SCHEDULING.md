# Overnight Research Pipeline — Scheduling Reference

## Recommended: VPS cron (autonomous, runs when computer is off)

See **[docs/VPS_SCHEDULING.md](../docs/VPS_SCHEDULING.md)** for full setup.

One-time: `ssh root@VPS_IP && cd applied-compassion-benchmark && ./scripts/vps-bootstrap.sh`

Then the pipeline runs Mon-Sat at 02:00 VPS time, commits results to `main`,
and redeploys the site — no machine dependency.

## Nightly Schedule (Mon-Sat)

| Time (local) | Agent | Model | Duration | Purpose |
|-------------|-------|-------|----------|---------|
| 2:03 AM | overnight-scanner | Sonnet | ~30 min | Scan 1,155 entities for news |
| 2:47 AM | overnight-assessor | Opus | ~2 hrs | Full assessment of top 15-20 entities |
| 5:03 AM | overnight-digest | Sonnet | ~5 min | Daily summary + update review queue |

Sunday: no runs (cost control).

## Manual Execution

### Full pipeline (one command)
```bash
./research/run-pipeline.sh                    # Today's date, 15 entities
./research/run-pipeline.sh 2026-04-16         # Specific date
./research/run-pipeline.sh 2026-04-16 5       # Specific date, 5 entities only
```

### Individual stages
```bash
# Stage 1: Scanner
claude --agent overnight-scanner "Run nightly scan for 2026-04-16"

# Stage 2: Assessor
claude --agent overnight-assessor "Run nightly assessments for 2026-04-16. Assess top 15 entities."

# Stage 3: Digest
claude --agent overnight-digest "Generate digest for 2026-04-16"
```

### Score updates (after human review)
```bash
# 1. Review research/PENDING_CHANGES.md
# 2. Edit change-proposals/{slug}.json — set "status": "approved"
# 3. Apply:
claude --agent score-updater "Apply approved changes"
# 4. Rebuild and deploy:
cd site && npm run build
```

## Persistent Scheduling Options

### Option A: Claude Code scheduled triggers
```bash
claude /schedule create "overnight-scanner" --cron "3 2 * * 1-6" \
  --prompt "Run nightly scan for $(date +%Y-%m-%d)"

claude /schedule create "overnight-assessor" --cron "47 2 * * 1-6" \
  --prompt "Run nightly assessments for $(date +%Y-%m-%d). Assess top 15 entities."

claude /schedule create "overnight-digest" --cron "3 5 * * 1-6" \
  --prompt "Generate digest for $(date +%Y-%m-%d)"
```

### Option B: System cron (on VPS or local machine)
```cron
# Edit with: crontab -e
3  2 * * 1-6  cd /path/to/applied-compassion-benchmark && claude --agent overnight-scanner --print "Run nightly scan for $(date +\%Y-\%m-\%d)" >> research/logs/scanner.log 2>&1
47 2 * * 1-6  cd /path/to/applied-compassion-benchmark && claude --agent overnight-assessor --print "Run nightly assessments for $(date +\%Y-\%m-\%d). Assess top 15." >> research/logs/assessor.log 2>&1
3  5 * * 1-6  cd /path/to/applied-compassion-benchmark && claude --agent overnight-digest --print "Generate digest for $(date +\%Y-\%m-\%d)" >> research/logs/digest.log 2>&1
```

## Cost Estimates

| Entities/night | Monthly cost (est.) | Full rotation |
|---------------|--------------------|--------------| 
| 10 | ~$700 | ~4 months |
| 15 | ~$1,100 | ~2.5 months |
| 20 | ~$1,400 | ~2 months |

## Morning Review Checklist

1. Open `research/PENDING_CHANGES.md`
2. For high-priority items (band changes, delta >15), read the full assessment
3. Approve or reject each proposal
4. Run score-updater if any approved
5. Skim daily digest for trends and insights
