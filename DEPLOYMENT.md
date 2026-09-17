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

## IMPORTANT: `nginx.conf` — not `nginx-ssl.conf` — is the config production actually runs (LC-1a, 2026-09-17)

There are two nginx config files in this repo and they are **not interchangeable
in practice**, even though both are meant to describe the same site:

- **`nginx.conf`** is baked into the Docker image at build time:
  `Dockerfile` does `COPY nginx.conf /etc/nginx/conf.d/default.conf`. Both the
  automated CI deploy (`docker compose up -d --build`, `.github/workflows/deploy.yml`)
  and any manual `docker compose up -d --build` rebuild the image from this file.
  **This is the config production is actually running the vast majority of the time**,
  and the only one CI's `nginx-config-syntax` job validates with `nginx -t`.
- **`nginx-ssl.conf`** is only ever applied by `deploy.sh` (the one-time first-deploy
  script), which does `docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf`
  **at runtime, inside the already-running container** — it never touches the
  image. That copy is real and takes effect immediately, but it does not
  survive: the **next CI rebuild** (any push to `main`) runs `docker compose
  up -d --build`, which rebuilds the image from `nginx.conf` and silently
  reverts the container back to it. `deploy.sh`'s copy is a one-shot, not a
  standing configuration.

**Consequence:** the two files had drifted (25 `/robotics-lab/<legal-name>`
redirects plus `/us-state/georgia` existed only in `nginx-ssl.conf`) and every
one of those 26 legacy URLs 404'd in production, indefinitely, because the
config CI actually ships never carried them — no matter how many times someone
"fixed" `nginx-ssl.conf`. As of 2026-09-17 both files carry the same 106
`rewrite` directives (verified by `site/scripts/test-nginx-redirect-parity.mjs`,
run as part of `npm test`), and CI's `verify` job now sweeps the live site for
all of them post-deploy — but nothing in the code prevents the same drift from
recurring if someone edits `nginx-ssl.conf` alone in the future. Treat
`nginx.conf` as the single source of truth; if you must edit `nginx-ssl.conf`
too (e.g. because `deploy.sh` is about to be re-run), edit both.

**Also note:** production's `Server:` response header is `openresty`, not this
container's `nginx` — TLS is terminated by a reverse proxy in front of the VPS
container (not by this repo's certbot/nginx-ssl setup for ordinary traffic),
and `http://` requests are upgraded to `https://` before they ever reach this
container. This container's own `listen 80` / SSL blocks and the certbot
container exist and are wired up, but day-to-day production traffic is
answered by nginx.conf's `listen 80` server behind the openresty proxy.
Confirming exactly how/where that proxy is configured (and whether
`nginx-ssl.conf`, certbot, and the `listen 443` blocks are still load-bearing
for anything) is a **founder-level follow-up**, not resolved by this change.

**Follow-ups deliberately NOT done in this pass (need founder sign-off):**
- Delete `nginx-ssl.conf` or stop shipping it, now that `nginx.conf` is a
  verified superset — LC-1b.
- Remove the `docker compose cp nginx-ssl.conf ...` line from `deploy.sh` —
  LC-1b. Until then, treat `deploy.sh`'s SSL switch as a temporary, CI-reversible
  state, not a deploy step to rely on.
- Fix `/404` returning HTTP 200 instead of 404 (soft 404) — noted, not fixed here.
- Determine and document exactly what the front-of-VPS openresty proxy is and
  who owns its config.

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
