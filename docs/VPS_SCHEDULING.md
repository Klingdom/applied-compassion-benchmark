# VPS Nightly Pipeline — Setup Guide

This guide sets up the overnight research pipeline to run autonomously at 2 AM
every Monday–Saturday on the Hostinger VPS, independent of any local machine.

## What this buys you

- Pipeline runs when you're asleep, away, or your laptop is off
- Results are automatically committed and pushed to `main`
- Site is automatically rebuilt so the Updates page reflects the new daily feed
- Change proposals remain **pending** — you still review and approve them manually

## Prerequisites

- SSH access to the Hostinger VPS (same host running the Docker site)
- Your Anthropic API key (https://console.anthropic.com/settings/keys)
- Write access to the `Klingdom/applied-compassion-benchmark` GitHub repo
- ~30 minutes for one-time setup

## One-time setup

### 1. SSH to the VPS

```bash
ssh root@VPS_IP
```

### 2. Confirm the repo is at the expected path

The bootstrap script expects the repo at `/root/applied-compassion-benchmark`.
If it's somewhere else, either clone it there or export `REPO_PATH=/your/path`
before running the bootstrap script.

```bash
ls /root/applied-compassion-benchmark
# or
cd /path/to/applied-compassion-benchmark && pwd
```

### 3. Pull the latest main (includes the new scripts)

```bash
cd /root/applied-compassion-benchmark
git pull origin main
```

### 4. Run the bootstrap script

```bash
chmod +x scripts/vps-bootstrap.sh
./scripts/vps-bootstrap.sh
```

The bootstrap script will:

1. Install Node.js 20 LTS (if missing)
2. Install the Claude Code CLI globally (`@anthropic-ai/claude-code`)
3. Prompt you for your `ANTHROPIC_API_KEY` and persist it to `/root/.bashrc`
4. Generate an SSH key and **pause** so you can add it as a GitHub Deploy Key
   (copy the printed public key into `Repo Settings → Deploy keys → Add deploy
   key`, check **"Allow write access"**, then press ENTER to continue)
5. Switch the git remote from HTTPS to SSH
6. Set git commit identity for unattended commits
7. Run a Claude CLI auth check
8. Install the crontab entry: `0 2 * * 1-6`

### 5. (Optional) Add webhook notifications

If you want Slack or Discord notifications when the pipeline completes or fails:

```bash
echo 'export NIGHTLY_WEBHOOK_URL="https://hooks.slack.com/services/..."' >> /root/.bashrc
```

Works with any webhook that accepts `{"content": "..."}` (Discord) or
`{"text": "..."}` (Slack) JSON bodies.

### 6. (Optional) Change the VPS timezone

By default, Hostinger VPS runs UTC. To run at 2 AM Pacific instead of 2 AM UTC:

```bash
timedatectl set-timezone America/Los_Angeles
```

Verify:

```bash
date
```

## Test the pipeline manually

Before waiting for the first cron run, validate end-to-end:

```bash
source /root/.bashrc   # load ANTHROPIC_API_KEY
cd /root/applied-compassion-benchmark
./scripts/nightly-pipeline.sh
```

Expected duration: ~2.5 hours. The script writes to
`research/logs/nightly-YYYY-MM-DD.log` as it runs.

If you want to skip the Docker rebuild for a test run (doesn't push to prod):

```bash
SKIP_DOCKER_REBUILD=1 ./scripts/nightly-pipeline.sh
```

If you want to skip the git push (no changes will leave the VPS):

```bash
SKIP_GIT_PUSH=1 SKIP_DOCKER_REBUILD=1 ./scripts/nightly-pipeline.sh
```

## What happens each night

```
02:00  git pull origin main
02:01  Scanner  — scan 1,155 entities, emit research/scans/{DATE}.json
02:30  Assessor — 15 full assessments, emit change proposals (status=pending)
04:30  Digest   — research/digests/{DATE}.md + update PENDING_CHANGES.md
04:35  prepare-updates.mjs — Updates page feed for {DATE}
04:36  git commit + push to main
04:38  docker compose build --no-cache web && up -d web
~04:45 Webhook notification (if configured)
```

All timestamps are approximate. The pipeline is fully sequential — the assessor
does not start until the scanner completes.

## Morning review workflow

Every morning:

```bash
# On your local machine
git pull origin main
```

Then:

1. Open `research/PENDING_CHANGES.md` — review each proposal
2. For each approval, edit `research/change-proposals/{slug}.json` →
   `"status": "approved"` (and optionally `"reviewed_by"` / `"reviewed_date"`)
3. Apply: `claude --agent score-updater "Apply approved changes"`
4. Regenerate the daily feed so the Updates page reflects applied-status:
   `node site/scripts/prepare-updates.mjs $(date +%Y-%m-%d)`
5. Commit + push
6. VPS picks up the new commits on its next scheduled run (or you can SSH and
   trigger a rebuild manually)

## Monitoring

### Quick status check

```bash
ssh root@VPS_IP 'cat /root/applied-compassion-benchmark/research/logs/last-run-status.txt'
```

Output is a `key=value` file with `status=OK` or `status=FAILED` plus
timestamps and the failing stage.

### Tail the live log while pipeline is running

```bash
ssh root@VPS_IP 'tail -f /root/applied-compassion-benchmark/research/logs/nightly-*.log | tail -n 1'
```

### Check cron log

```bash
ssh root@VPS_IP 'tail -n 50 /root/applied-compassion-benchmark/research/logs/cron.log'
```

## Troubleshooting

### "claude: command not found" in cron but works interactively

Cron uses a minimal `PATH`. The `nightly-pipeline.sh` script relies on
`ANTHROPIC_API_KEY` being set. The crontab entry sources the script from the
repo root, but it does NOT source `~/.bashrc`. To fix, either:

**Option A — add the env var directly to the crontab:**

```cron
ANTHROPIC_API_KEY=sk-ant-...
0 2 * * 1-6 cd /root/applied-compassion-benchmark && ...
```

**Option B — source `.bashrc` in the crontab line:**

```cron
0 2 * * 1-6 cd /root/applied-compassion-benchmark && bash -lc './scripts/nightly-pipeline.sh' >> research/logs/cron.log 2>&1
```

The `-l` flag makes bash act as a login shell, which reads `/root/.bashrc`.

### git push fails with "permission denied"

The SSH deploy key likely doesn't have write access. Go to the GitHub repo →
Settings → Deploy keys → find the `vps-nightly` key → confirm
**"Allow write access"** is checked. If not, delete and re-add with the box
checked.

### Pipeline fails mid-run

Check `research/logs/last-run-status.txt` for the failing stage. Read the full
log at `research/logs/nightly-{DATE}.log`. Common causes:

- Scanner: rate-limited — re-run with a smaller entity count
- Assessor: API quota exhausted — check your Anthropic console
- git: merge conflict with work pushed from another machine — resolve manually
- docker: disk space — `docker system prune -a` on the VPS

### Re-run a specific date

```bash
./scripts/nightly-pipeline.sh 2026-04-19
```

This re-runs the full pipeline for that date, overwriting prior artifacts for
that date. Only do this if you need to replay — otherwise assessments stack up
and proposals get re-emitted.

## Costs

| Item | Cost |
|------|------|
| Hostinger VPS | Already paid (no change) |
| Claude API — Sonnet scanner ~30 min | ~$2/night |
| Claude API — Opus assessor ~2 hrs, 15 entities | ~$25–60/night |
| Claude API — Sonnet digest ~5 min | ~$0.50/night |
| **Monthly total (26 nights, skips Sundays)** | **~$700–1,600** |

Exactly the same as running the pipeline manually from your laptop. The
automation doesn't add cost — it just ensures it happens.

## Disabling the schedule

```bash
ssh root@VPS_IP
crontab -e
# delete the line containing "# compassionbenchmark-nightly"
```

Or nuke all compassion-benchmark entries:

```bash
crontab -l | grep -v '# compassionbenchmark-nightly' | crontab -
```
