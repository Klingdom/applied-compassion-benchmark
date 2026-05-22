# Deployment Runbook — Compassion Benchmark

## Prerequisites

- Hostinger VPS with Docker and Docker Compose installed
- DNS A records for `compassionbenchmark.com` and `www.compassionbenchmark.com` pointing to VPS IP
- Ports 80 and 443 open in VPS firewall
- SSH access to the VPS

## First Deploy

```bash
# 1. SSH into VPS
ssh root@YOUR_VPS_IP

# 2. Clone the repo
git clone https://github.com/Klingdom/applied-compassion-benchmark.git
cd applied-compassion-benchmark

# 3. Run the deploy script
chmod +x deploy.sh
./deploy.sh
```

The deploy script will:
1. Build the Next.js site inside Docker (multi-stage: Node 20 → Nginx Alpine)
2. Start the Nginx container on port 80
3. Request an SSL certificate from Let's Encrypt
4. Switch to the HTTPS Nginx config
5. Start the Certbot auto-renewal container

## Redeployment After Changes

### Automated (preferred)

Push to `main`. The GitHub Actions workflow `.github/workflows/deploy.yml`
runs tests + build on a runner, then SSHes into the VPS and rebuilds.
See `docs/SETUP_AUTO_DEPLOY.md` for the one-time secrets configuration.

Watch the deploy at:
https://github.com/Klingdom/applied-compassion-benchmark/actions

### Manual (fallback if auto-deploy is disabled or failing)

```bash
ssh root@YOUR_VPS_IP
cd applied-compassion-benchmark
git pull origin main
docker compose up -d --build
```

This rebuilds the Docker image with the latest code and restarts the container. Zero-downtime is not guaranteed — there will be a brief interruption during the rebuild (~30-60 seconds).

## Manual SSL Certificate Renewal

Certbot auto-renews via the certbot container (checks every 12 hours). To force a renewal:

```bash
docker compose run --rm certbot renew --force-renewal
docker compose exec web nginx -s reload
```

## Verify Deployment

After deploying, check:

```bash
# Container is running
docker compose ps

# Nginx is serving
curl -I http://compassionbenchmark.com
curl -I https://compassionbenchmark.com

# Check a few routes
curl -s https://compassionbenchmark.com/ | head -5
curl -s https://compassionbenchmark.com/fortune-500 | head -5
curl -s -o /dev/null -w "%{http_code}" https://compassionbenchmark.com/nonexistent
# Should return 404
```

## Verify Legacy Redirects

```bash
# Old .html URLs should 301 to new paths
curl -sI https://compassionbenchmark.com/home.html | grep Location
# → https://compassionbenchmark.com/

curl -sI https://compassionbenchmark.com/us-states-index.html | grep Location
# → https://compassionbenchmark.com/us-states

curl -sI https://compassionbenchmark.com/fortune-500.html | grep Location
# → https://compassionbenchmark.com/fortune-500
```

## Troubleshooting

### Container won't start
```bash
docker compose logs web
```

### SSL certificate issues
```bash
docker compose logs certbot
# Check cert files exist
docker compose exec web ls /etc/letsencrypt/live/compassionbenchmark.com/
```

### Nginx config syntax error
```bash
docker compose exec web nginx -t
```

### Build fails
```bash
# Test locally first
cd site && npm run build
# Check the output
ls -la out/
```

### DNS not resolving
```bash
dig compassionbenchmark.com
dig www.compassionbenchmark.com
# Both should return your VPS IP
```

## Rollback

If a deploy breaks the site:

```bash
# Find the last working commit
git log --oneline -5

# Revert to it
git checkout <COMMIT_HASH>
docker compose up -d --build

# After fixing the issue on main, return to main
git checkout main
```

## Architecture

```
Internet → Nginx (port 80/443) → static HTML/CSS/JS files
                                   (built by Next.js static export)

Docker containers:
  web      → nginx:alpine serving /usr/share/nginx/html
  certbot  → certbot/certbot for SSL auto-renewal
```

No Node.js runtime in production. The site is fully static.

---

## Score-Watch Fulfillment Deployment

Score-Watch uses a Cloudflare Worker at `api.compassionbenchmark.com`. This is
**separate from the VPS** — the Worker deploys to Cloudflare's global network,
not Docker. See `worker/README.md` for the full deployment runbook.

### Prerequisites

- Cloudflare account with `compassionbenchmark.com` zone
- Wrangler CLI (`cd worker && npm install`)
- KV namespace created (see worker/README.md Step 2)
- `api.compassionbenchmark.com` subdomain added to Cloudflare

### Required secrets (set via `wrangler secret put`)

| Secret | Description |
|---|---|
| `GUMROAD_SELLER_ID` | Your Gumroad seller ID |
| `GUMROAD_PRODUCT_ID_SCORE_WATCH` | Gumroad product_id for Score-Watch |
| `LISTMONK_API_URL` | `https://lists.compassionbenchmark.com` |
| `LISTMONK_API_USER` | Listmonk admin username |
| `LISTMONK_API_TOKEN` | Listmonk admin API token |
| `LISTMONK_SCORE_WATCH_LIST_UUID` | UUID of score-watch subscriber list |
| `LISTMONK_WELCOME_TEMPLATE_ID` | Listmonk template ID for welcome email |
| `ADMIN_NOTIFY_EMAIL` | phil@mediafier.ai |
| `UNSUBSCRIBE_HMAC_SECRET` | Long random hex string (sign unsubscribe links) |
| `INTERNAL_API_TOKEN` | Long random hex string (for send-alerts.mjs) |
| `ADMIN_API_TOKEN` | Long random hex string (for /admin/status) |

### Deploy the Worker

```bash
cd worker
npm install
npx wrangler deploy
```

### Gumroad configuration

1. Create a Score-Watch product in Gumroad (subscription, $79/yr)
2. Under Settings → Advanced → Ping URL, set:
   `https://api.compassionbenchmark.com/gumroad/webhook`
3. Copy the product URL into `site/src/data/gumroad.ts`
4. Flip `SCORE_WATCH.useGumroad = true` in `site/src/data/gumroad.ts`

### Nightly alert integration

The alert pipeline runs after the existing nightly `digest` step:

```bash
# Add to nightly pipeline trigger (after digest):
SCORE_WATCH_INTERNAL_TOKEN=<token> \
LISTMONK_API_URL=https://lists.compassionbenchmark.com \
LISTMONK_API_USER=<user> \
LISTMONK_API_TOKEN=<token> \
LISTMONK_ALERT_TEMPLATE_ID=<id> \
UNSUBSCRIBE_HMAC_SECRET=<secret> \
node research/scripts/send-alerts.mjs
```

To test without sending:
```bash
node research/scripts/send-alerts.mjs --dry-run
```

To replay a specific entity/subscriber:
```bash
node research/scripts/send-alerts.mjs --date 2026-05-17 --entity apple-inc --dry-run
```

### Verify Worker is running

```bash
# Health check
curl "https://api.compassionbenchmark.com/admin/status?token=YOUR_ADMIN_TOKEN"

# Badge test
curl "https://api.compassionbenchmark.com/badge/apple-inc.svg"
```

### Score data export (prebuild)

`site/package.json` now includes a `prebuild` script that runs before `next build`:

```bash
node scripts/export-public-data.mjs
```

This generates `site/public/data/scores/<slug>.json` for every entity.
The Worker badge endpoint reads these files. They are committed as static assets
and served by Nginx alongside the site HTML.

### Weekly integrity check

Run weekly to verify independence guarantees are intact:

```bash
node research/scripts/integrity-check.mjs
# Report: research/integrity-reports/<date>.md
```

### Cross-references

- Full Worker runbook: `worker/README.md`
- Email templates: `research/templates/README.md`
- Architecture: `docs/ARCHITECTURE_MONETIZATION.md`
- Alert pipeline: `research/scripts/send-alerts.mjs`
