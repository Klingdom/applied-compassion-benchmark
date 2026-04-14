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

echo "==> Step 1: Starting with HTTP-only config for SSL certificate provisioning..."

# Use the HTTP-only nginx config first
cp nginx.conf nginx-active.conf

# Build and start container with HTTP only
docker compose up -d --build web

echo "==> Step 2: Obtaining SSL certificate from Let's Encrypt..."

# Get the initial certificate
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo "==> Step 3: Switching to SSL nginx config..."

# Replace nginx config with SSL version
cp nginx-ssl.conf nginx-active.conf
docker compose down
docker compose up -d --build

echo "==> Deployment complete!"
echo "    https://$DOMAIN should now be live."
echo ""
echo "    SSL auto-renewal is handled by the certbot container."
echo "    To redeploy after changes: docker compose up -d --build"
