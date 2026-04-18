#!/usr/bin/env bash
# =============================================================================
# Compassion Benchmark — VPS Bootstrap (one-time setup)
# =============================================================================
# Run this ONCE on the Hostinger VPS to install Node.js, Claude CLI, configure
# git, and install the nightly crontab.
#
# Prerequisites:
#   - SSH access to VPS as root (or sudo user)
#   - Repo already cloned at /root/applied-compassion-benchmark
#     (adjust REPO_PATH below if different)
#   - ANTHROPIC_API_KEY available to paste when prompted
#   - Deploy SSH key already added to repo's Deploy Keys with write access
#     (GitHub → Settings → Deploy keys → Add deploy key with "Allow write access")
#
# Usage:
#   ssh root@VPS_IP
#   cd /root/applied-compassion-benchmark
#   ./scripts/vps-bootstrap.sh
# =============================================================================

set -e

REPO_PATH="${REPO_PATH:-/root/applied-compassion-benchmark}"
PIPELINE_SCRIPT="$REPO_PATH/scripts/nightly-pipeline.sh"
CRON_TAG="# compassionbenchmark-nightly"

echo "==> Compassion Benchmark VPS Bootstrap"
echo "    Repo path: $REPO_PATH"
echo ""

# -----------------------------------------------------------------------------
# 1. Node.js (if not installed)
# -----------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "==> Node.js already installed: $(node --version)"
fi

# -----------------------------------------------------------------------------
# 2. Claude Code CLI
# -----------------------------------------------------------------------------
if ! command -v claude >/dev/null 2>&1; then
  echo "==> Installing Claude Code CLI..."
  npm install -g @anthropic-ai/claude-code
else
  echo "==> Claude CLI already installed: $(claude --version 2>/dev/null || echo unknown)"
fi

# -----------------------------------------------------------------------------
# 3. ANTHROPIC_API_KEY in environment
# -----------------------------------------------------------------------------
if ! grep -q "ANTHROPIC_API_KEY" /root/.bashrc 2>/dev/null; then
  echo ""
  echo "==> ANTHROPIC_API_KEY not found in /root/.bashrc"
  read -rsp "    Paste your Anthropic API key (hidden): " API_KEY
  echo ""
  if [ -z "$API_KEY" ]; then
    echo "    Skipped — you can add it later: echo 'export ANTHROPIC_API_KEY=sk-...' >> /root/.bashrc"
  else
    echo "export ANTHROPIC_API_KEY=$API_KEY" >> /root/.bashrc
    echo "    Added to /root/.bashrc"
    export ANTHROPIC_API_KEY="$API_KEY"
  fi
else
  echo "==> ANTHROPIC_API_KEY already in /root/.bashrc"
fi

# -----------------------------------------------------------------------------
# 4. Git SSH key for pushing to origin (if not set up)
# -----------------------------------------------------------------------------
if [ ! -f /root/.ssh/id_ed25519 ] && [ ! -f /root/.ssh/id_rsa ]; then
  echo ""
  echo "==> Generating SSH key for git push..."
  ssh-keygen -t ed25519 -C "vps@compassionbenchmark" -f /root/.ssh/id_ed25519 -N ""
  echo ""
  echo "    ┌─────────────────────────────────────────────────────────────┐"
  echo "    │ ACTION REQUIRED: add this public key as a GitHub Deploy Key │"
  echo "    │ Repo Settings → Deploy keys → Add deploy key                │"
  echo "    │ Title: vps-nightly                                          │"
  echo "    │ ☑ Allow write access                                        │"
  echo "    └─────────────────────────────────────────────────────────────┘"
  echo ""
  cat /root/.ssh/id_ed25519.pub
  echo ""
  read -rp "    Press ENTER after you've added the key to GitHub..."
else
  echo "==> SSH key already exists at /root/.ssh/"
fi

# -----------------------------------------------------------------------------
# 5. Ensure git remote uses SSH (not HTTPS)
# -----------------------------------------------------------------------------
cd "$REPO_PATH"
CURRENT_REMOTE=$(git remote get-url origin)
case "$CURRENT_REMOTE" in
  https://github.com/*)
    REPO_SLUG=$(echo "$CURRENT_REMOTE" | sed 's|https://github.com/||' | sed 's|\.git$||')
    NEW_REMOTE="git@github.com:${REPO_SLUG}.git"
    echo "==> Switching git remote from HTTPS to SSH: $NEW_REMOTE"
    git remote set-url origin "$NEW_REMOTE"
    ;;
  git@github.com:*)
    echo "==> Git remote already uses SSH"
    ;;
esac

# Accept GitHub host key non-interactively
ssh-keyscan -H github.com >> /root/.ssh/known_hosts 2>/dev/null || true

# -----------------------------------------------------------------------------
# 6. Git identity (required for commits)
# -----------------------------------------------------------------------------
if [ -z "$(git config --global user.email)" ]; then
  git config --global user.email "vps@compassionbenchmark.com"
  git config --global user.name "Compassion Benchmark VPS"
  echo "==> Set git global identity"
fi

# -----------------------------------------------------------------------------
# 7. Test the pipeline in dry-run mode
# -----------------------------------------------------------------------------
echo ""
echo "==> Verifying pipeline script permissions..."
chmod +x "$PIPELINE_SCRIPT"
chmod +x "$REPO_PATH/research/run-pipeline.sh" 2>/dev/null || true

echo ""
echo "==> Test auth: claude --print 'say ready'"
claude --print "say ready in one word" || echo "    WARN: Claude CLI auth check failed — review ANTHROPIC_API_KEY"

# -----------------------------------------------------------------------------
# 8. Install crontab entry
# -----------------------------------------------------------------------------
echo ""
echo "==> Installing crontab entry..."

# Scheduling strategy:
#   2:00 AM VPS time, Monday–Saturday (no Sundays — cost control)
#   The script itself handles the full 3-hour pipeline sequentially
#
# VPS timezone: whatever Hostinger has by default (usually UTC)
# To change: timedatectl set-timezone America/Los_Angeles

CRON_LINE="0 2 * * 1-6 cd $REPO_PATH && /bin/bash $PIPELINE_SCRIPT >> $REPO_PATH/research/logs/cron.log 2>&1 $CRON_TAG"

# Remove any existing compassion-benchmark entry, then add the new one
(crontab -l 2>/dev/null | grep -v "$CRON_TAG"; echo "$CRON_LINE") | crontab -

echo ""
echo "    Installed:"
echo "    $CRON_LINE"
echo ""
echo "    Current crontab:"
crontab -l

# -----------------------------------------------------------------------------
# 9. Done
# -----------------------------------------------------------------------------
echo ""
echo "============================================================"
echo "  VPS Bootstrap complete"
echo "============================================================"
echo ""
echo "  Pipeline will run Mon–Sat at 02:00 VPS time."
echo "  Logs:   $REPO_PATH/research/logs/nightly-YYYY-MM-DD.log"
echo "  Status: $REPO_PATH/research/logs/last-run-status.txt"
echo ""
echo "  To test a manual run now:"
echo "    source /root/.bashrc && $PIPELINE_SCRIPT"
echo ""
echo "  To add a Slack/Discord webhook for status notifications:"
echo "    echo 'export NIGHTLY_WEBHOOK_URL=https://hooks.slack.com/...' >> /root/.bashrc"
echo ""
echo "  To change the schedule:"
echo "    crontab -e"
echo "============================================================"
