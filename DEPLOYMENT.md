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
