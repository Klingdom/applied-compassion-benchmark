# DevOps Audit — 2026-04-24

Auditor: DevOps agent
Commit audited: c73cb52 (today's successful deploy)
Files read: `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `nginx-ssl.conf`, `deploy.sh`, `.github/workflows/docker-image.yml`

---

## Top 3 Critical Findings

1. **deploy.sh is actively dangerous** — Running it on the current VPS would attempt to start a Certbot container and swap in `nginx-ssl.conf`, neither of which is valid under the upstream-proxy architecture; the script would also clobber any config the upstream proxy owns. Risk: operator under pressure runs it and breaks production. Evidence: `deploy.sh` lines 32–48, `docker-compose.yml` has no `certbot` service.

2. **No rollback path below git-revert** — Docker images are tagged with a Unix timestamp (`$(date +%s)`) and never pushed to a registry. If a bad deploy reaches production, the only recovery path is `git revert` + full `--no-cache` rebuild (estimated 5–10 minutes of downtime minimum). There is no saved image to `docker tag` back to. Evidence: `.github/workflows/docker-image.yml` line 18, no `docker push` step anywhere.

3. **Zero production error visibility** — `docker-compose.yml` defines no `logging` driver, no healthcheck, and no alerting. Nginx access/error logs are available only if you SSH in and run `docker logs`. Umami provides traffic counts but cannot surface HTTP 5xx rates, container OOM kills, or the Umami proxy being silently broken (`/u/` → `umami-analytics-vi0p-umami-1:3000` has a hardcoded container name that will silently 502 if that container is renamed or absent).

---

## Detailed Findings

### 1. Deploy automation gap

**Current state**
`.github/workflows/docker-image.yml` triggers on push to `main` and on PRs. It runs `docker build` with a timestamp tag. The image is never pushed to any registry. The workflow produces no artifact. Actual deploy is: SSH to VPS → `git pull && docker compose build --no-cache web && docker compose up -d web`.

**Gap**
Every release requires a human to be at a terminal. There is no audit trail of when deploys happened or who triggered them. The 3-command routine is not documented anywhere that survives the stale `deploy.sh`. The CI workflow burns ~3 minutes on every push to main for a build whose output is immediately discarded.

**Risk profile of auto-deploy-on-push**
For this product — a public static benchmark site with no server-side state, no database migrations, and a 5–10 minute rebuild — auto-deploy-on-main-push is acceptable risk. The blast radius of a bad auto-deploy is a broken static site, recoverable via `git revert` + trigger. That is acceptable.

**Recommendation**
Add a `workflow_dispatch` job (manual button in GitHub Actions UI) that SSHes to the VPS and runs the 3-command routine. This preserves the human gate while eliminating the need to be at a terminal. Required secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. Alternatively: a simple webhook endpoint on the VPS (e.g., a tiny shell script behind `adnanh/webhook`) that the CI job POSTs to after a successful build on `main`. The webhook approach avoids storing SSH keys in GitHub.

**Effort:** S
**Priority:** Medium — cost of status quo is ~5 minutes of operator time per release, which is tolerable at current release cadence. Becomes High if release frequency increases.

---

### 2. deploy.sh staleness

**Current state**
`deploy.sh` has four steps:
1. `git pull && docker compose build --no-cache web && docker compose up -d web` — correct for the current architecture.
2. `docker compose run --rm certbot certonly ...` — fails; no `certbot` service in `docker-compose.yml`.
3. `docker compose cp nginx-ssl.conf web:/etc/nginx/conf.d/default.conf && docker compose exec web nginx -s reload` — unnecessary and destructive; the container already bakes `nginx.conf` at build time. Running this would swap in `nginx-ssl.conf` which contains SSL certificate paths that don't exist inside the container.
4. `docker compose up -d certbot` — fails; no certbot service.

The script's own footer comment (lines 56–59) documents the correct 3-command redeploy routine, which is ironic: the correct procedure is in the `echo` block at the bottom of a script that would fail catastrophically if actually run.

**Recommendation**
Delete `deploy.sh`. Create `redeploy.sh` with exactly:

```bash
#!/bin/bash
set -e
# Redeploy compassion-benchmark web container on Hostinger VPS.
# SSL is terminated by the upstream reverse proxy — no Certbot steps needed here.
git pull origin main
docker compose build --no-cache web
docker compose up -d web
echo "Done. Verify: curl -I https://compassionbenchmark.com/"
```

That is the complete, correct procedure. Anything beyond this belongs in a separate `initial-setup.md` document, not an executable script that an operator might run thinking it is safe.

**Effort:** XS
**Priority:** High — the current file is a trap.

---

### 3. Rollback procedure

**Current state**
No Docker images are tagged by commit SHA or pushed to any registry. The GitHub Actions workflow tags with `$(date +%s)` and never pushes. `docker-compose.yml` uses `build: .` (build-from-source), not `image:` (pull-from-registry).

**Rollback path today**
1. SSH to VPS.
2. `git log --oneline` to identify the last good commit.
3. `git revert HEAD` (or `git checkout <sha> -- <file>` for targeted revert).
4. `docker compose build --no-cache web && docker compose up -d web`.

Estimated downtime: 5–10 minutes for a full `--no-cache` rebuild. The old container is replaced immediately on `up -d`, so there is no graceful cutover — the site is down during the build unless the upstream proxy has its own fallback.

**What the Luxembourg schema-drift scenario looks like**
A data file ships with a bad schema, the static export builds successfully (no runtime error), pages 404 or render corrupt data. `git revert` + rebuild is the correct path. Time to recovery: 5–10 minutes from SSH login. This is acceptable for a static benchmark site.

**What would make it better**
Push images to GitHub Container Registry (`ghcr.io`) tagged by commit SHA as part of CI. Change `docker-compose.yml` to use `image: ghcr.io/org/repo:${GIT_SHA}`. Rollback becomes: set `GIT_SHA` to the previous good value, `docker compose up -d web` — no rebuild, ~30-second cutover. This is the correct long-term fix but is not urgent given current release frequency.

**Effort:** S (image push to GHCR + compose file change)
**Priority:** Medium — 5–10 minute recovery is acceptable now; becomes High when the product has paid customers actively purchasing during business hours.

---

### 4. Observability baseline

**Current state**
- `docker-compose.yml`: no `logging` block, no `healthcheck` block. Docker default logging (json-file driver, no size limit, no rotation). Logs accessible via `docker logs compassion-benchmark`.
- `nginx.conf`: no custom `access_log` or `error_log` directives. Nginx defaults: access log to `/var/log/nginx/access.log`, error log to `/var/log/nginx/error.log`, both inside the container.
- No uptime monitoring configured in any repo file.
- Umami provides page view and session counts — useful for traffic, blind to errors.
- The Umami proxy (`/u/` → `umami-analytics-vi0p-umami-1:3000`) uses a hardcoded container name. If that container is renamed or absent, `location /u/` silently returns 502 to every analytics call. There is no alerting on this.

**Gaps**
- No HTTP 4xx/5xx rate signal.
- No container restart detection (the `restart: unless-stopped` policy will loop-restart a crashing container silently).
- No log rotation configured — a high-traffic event would fill the VPS disk with Docker json-file logs.
- No external uptime check (e.g., UptimeRobot free tier).

**Recommendations (in priority order)**
1. Add a free UptimeRobot (or equivalent) monitor on `https://compassionbenchmark.com/` with email alert. This covers the most critical failure mode (site down) with zero infrastructure cost. Effort: XS.
2. Add log rotation to Docker daemon config (`/etc/docker/daemon.json` on the VPS): `"log-opts": {"max-size": "10m", "max-file": "3"}`. Prevents disk exhaustion. Effort: XS.
3. Add a `healthcheck` to `docker-compose.yml` — a simple `curl -f http://localhost/ || exit 1` gives `docker ps` a health status column and enables restart policy health gates. Effort: XS.

**Effort:** XS per item
**Priority:** Log rotation is High (silent disk-fill risk). Uptime monitor is High. Healthcheck is Medium.

---

### 5. Secrets and environment

**Current state**
The `web` service in `docker-compose.yml` declares no `environment` block and no `env_file`. The application is a static export — no runtime environment variables are consumed by the running container. All configuration is baked into the HTML/JS at build time.

No secrets are referenced in `Dockerfile`, `docker-compose.yml`, `nginx.conf`, or `deploy.sh`. The Umami container name (`umami-analytics-vi0p-umami-1`) is hardcoded in both `nginx.conf` and `nginx-ssl.conf` — this is a configuration value, not a secret, but it is fragile (see Finding 4).

**Listmonk environment variables**
Listmonk is not present in any repo file reviewed. If it is running as a separate compose stack on the same VPS, it has no structural dependency on the `compassion-benchmark` container. No blocking concern from this repo's side. The founder-owned env-vars work is self-contained to the Listmonk stack.

**Assessment**
No secret hygiene problems exist in the current repo. The static-export architecture is an advantage here: no database URLs, API keys, or auth tokens in the runtime environment. The only operational risk is if a future feature introduces server-side env vars — at that point, a `.env` on the VPS and `env_file:` in `docker-compose.yml` must be established before deploy, not after.

**Effort:** N/A — no action required now.
**Priority:** Low — flag for future review if SSR or API routes are added.

---

### 6. Backup / disaster recovery

**Current state**
All ranking data (`site/src/data/indexes/*.json`) is checked into git. The Next.js application code, Nginx config, Dockerfile, and compose file are all in git. Recovery from a total VPS loss requires: provision a new VPS, install Docker, clone the repo, run the 3-command redeploy. Time to recovery: 15–30 minutes assuming DNS TTL is short and the operator knows the steps.

**What is NOT in git**
- The `proxy-net` Docker network (must be created manually: `docker network create proxy-net`).
- The upstream reverse proxy configuration (appears to be managed outside this repo).
- The Umami analytics container and its data (separate compose stack, not in this repo).
- Any Hostinger-side firewall or DNS configuration.

**VPS backup**
No evidence of automated VPS snapshots in any repo file. Hostinger provides manual and scheduled snapshots via their control panel — there is no confirmation these are enabled.

**Assessment**
Git as source of truth is correct and sufficient for the application itself. The VPS is stateless from the application's perspective (no database, no uploaded files). RTO is 15–30 minutes. This is acceptable for a benchmark publication site. The main DR gap is the undocumented external dependencies (proxy-net, upstream reverse proxy, Umami stack) — a new operator could not fully reconstruct production from this repo alone.

**Recommendation**
Create a `VPS_SETUP.md` (one-time, not a script) documenting: Docker network creation, upstream proxy identity, Umami stack location, and any Hostinger-side steps. This is a documentation gap, not an infrastructure gap.

**Effort:** XS
**Priority:** Medium — no immediate risk since the VPS is running and the founder knows the setup. Becomes High if a second operator is added or the VPS needs to be reprovisioned.

---

## Recommended Next-Quarter Roadmap

In priority order:

1. **Delete `deploy.sh`, create `redeploy.sh`** — Eliminate the dangerous stale script. Replace with the correct 3-command routine. [Effort: XS]

2. **Add UptimeRobot monitor + log rotation on VPS** — External uptime check covers the most critical failure mode. Log rotation prevents silent disk exhaustion. Neither requires code changes. [Effort: XS each]

3. **Add `healthcheck` to `docker-compose.yml`** — Gives `docker ps` a health signal and enables future deploy gating. [Effort: XS]

4. **Push Docker images to GHCR tagged by commit SHA** — Reduces rollback time from 5–10 minutes to ~30 seconds. Required before the product has paying customers making time-sensitive purchases. [Effort: S]

5. **Add `workflow_dispatch` deploy job to GitHub Actions** — Eliminates the need to SSH manually for every release while keeping the human gate. Stores `VPS_SSH_KEY` in GitHub secrets. [Effort: S]

---

## Minimum Acceptable State

If nothing else is done, these are the minimum actions to keep production safe:

- Delete or clearly mark `deploy.sh` as DO NOT RUN — risk of an operator running it under pressure is real.
- Enable log rotation on the VPS Docker daemon — silent disk-fill will eventually bring the site down.
- Set up one external uptime monitor (UptimeRobot free tier is sufficient) — currently there is no signal when the site goes down except a user reporting it.
- Document the `docker network create proxy-net` prerequisite somewhere visible — without this, any VPS reprovision will fail silently at `docker compose up`.
