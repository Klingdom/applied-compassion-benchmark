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

echo ""
echo "==> Deployment complete!"
echo "    https://$DOMAIN should now be live."
echo ""
echo "    SSL auto-renewal is handled by the certbot container."
echo "    To redeploy after code changes:"
echo "      git pull origin main && docker compose build --no-cache web && docker compose up -d web"
echo "      docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf"
echo "      docker compose exec web nginx -s reload"
