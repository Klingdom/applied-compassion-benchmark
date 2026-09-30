#!/bin/bash
set -e

# ============================================================
# Compassion Benchmark — Hostinger VPS Deployment Script
# ============================================================
# Run this on your Hostinger VPS after cloning the repo.
#
# Prerequisites:
#   - Docker and Docker Compose installed on VPS
#   - DNS A records for compassionbenchmark.com and
#     www.compassionbenchmark.com pointing to VPS IP
#   - Ports 80 and 443 open in firewall
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================================

DOMAIN="compassionbenchmark.com"
EMAIL="info@compassionbenchmark.com"

echo "==> Step 1: Building Next.js site and starting with HTTP-only config..."

# Pull latest code from GitHub, then rebuild the Docker image
git pull origin main

# Inject commit identity for scripts/build-manifest.mjs (BM-1). The Docker
# build context never contains .git, so this is the only reliable way for
# the deployed /build-manifest.json to know its own commit.
export GIT_SHA="$(git rev-parse --short HEAD)"
export GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "==> git status --porcelain (names any file GIT_DIRTY below is reacting to):"
git status --porcelain
if [ -z "$(git status --porcelain)" ]; then GIT_DIRTY=false; else GIT_DIRTY=true; fi
export GIT_DIRTY
echo "==> GIT_DIRTY=$GIT_DIRTY"

docker compose build --no-cache web
docker compose up -d web

echo "==> Step 2: Obtaining SSL certificate from Let's Encrypt..."

docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo "==> Step 3: Switching to SSL nginx config..."

# Replace nginx config with SSL version inside the running container
docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf
docker compose exec web nginx -s reload

echo "==> Step 4: Starting certbot auto-renewal..."

docker compose up -d certbot

# ============================================================
# POST-DEPLOY FRESHNESS CHECK (D1-1)
# ============================================================
# Until 2026-09-30 this script ended by printing "should now be live" and
# exiting 0. It verified nothing. The CI workflow has a full freshness,
# publication-drift and redirect sweep -- but the deploy job only runs on
# workflow_dispatch, so the MANUAL path, which is the one actually used,
# had no verification at all.
#
# That gap is not hypothetical. On 2026-09-30 the briefing for 2026-09-24
# had been invisible to readers for seven days: committed at
# 2026-09-24T19:47Z, absent from a build made at 2026-09-25T03:01Z seven
# hours later, and serving a 301 to /404 the whole time. Every HTTP check
# a human would think to run returned 200, because the site is a static
# export baked into the image -- a cached Docker layer restarts happily
# and serves last week's content.
#
# Deliberately pure shell: the prerequisites above are Docker and Docker
# Compose only, so this must not introduce a Node dependency on the VPS.
#
# It distinguishes THREE outcomes, not two. A fetch that fails is
# INDETERMINATE, not "fresh" and not "stale" -- a network error is not
# evidence about what is published.
# ============================================================

echo ""
echo "==> Post-deploy freshness check"

MANIFEST="site/src/data/updates/manifest.json"
if [ ! -f "$MANIFEST" ]; then
  echo "    INDETERMINATE: $MANIFEST not found; cannot say what this commit expects to publish."
else
  expected=$(sed -n 's/.*"latest"[[:space:]]*:[[:space:]]*"\([0-9-]\{10\}\)".*/\1/p' "$MANIFEST" | head -1)

  # Positive control before believing any comparison: the extraction must
  # have produced a date. An empty `expected` would otherwise match an
  # empty `live` and report success having compared nothing.
  if [ -z "$expected" ]; then
    echo "    INDETERMINATE: could not read .latest from $MANIFEST — the file format may have changed."
  else
    live=$(curl -fsS --max-time 30 "https://$DOMAIN/updates/feed.json" 2>/dev/null \
             | grep -o '"date_published"[[:space:]]*:[[:space:]]*"[0-9-]\{10\}' \
             | head -1 \
             | sed 's/.*"\([0-9-]\{10\}\)/\1/')

    if [ -z "$live" ]; then
      echo "    INDETERMINATE: could not read the newest briefing date from the live feed."
      echo "    This is NOT a pass. The site may be fine and the feed unreachable, or the"
      echo "    deploy may have failed. Check https://$DOMAIN/updates/feed.json by hand."
    else
      echo "    this commit publishes: $expected"
      echo "    the live site serves:  $live"
      if [ "$expected" = "$live" ]; then
        echo "    FRESH — the live site matches this commit."
      else
        echo ""
        echo "    STALE DEPLOY. The container is serving '$live' but this commit publishes '$expected'."
        echo "    Every ordinary HTTP check will still return 200: the site is a static export"
        echo "    baked into the image, so a cached Docker layer restarts happily with old content."
        echo "    Remedy:  docker compose build --no-cache web && docker compose up -d web"
        echo ""
        exit 1
      fi
    fi
  fi
fi

echo ""
echo "==> Deployment complete!"
echo "    https://$DOMAIN should now be live."
echo ""
echo "    SSL auto-renewal is handled by the certbot container."
echo "    To redeploy after code changes:"
echo "      git pull origin \$(git rev-parse --abbrev-ref HEAD)   # NOT always 'main' — see below"
echo ""
echo "    NOTE (2026-09-30): the hint above said 'git pull origin main' until today."
echo "    As of now 'main' is ~150 commits behind the working branch, which carries"
echo "    14 of 15 known fixes. Pulling main would deploy a site without them."
echo "    Confirm the ref before building:  git rev-parse --abbrev-ref HEAD"
echo "      export GIT_SHA=\$(git rev-parse --short HEAD) GIT_BRANCH=\$(git rev-parse --abbrev-ref HEAD) GIT_DIRTY=false"
echo "      docker compose build --no-cache web && docker compose up -d web"
echo "      docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf"
echo "      docker compose exec web nginx -s reload"
