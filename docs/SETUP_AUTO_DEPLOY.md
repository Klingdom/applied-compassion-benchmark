# Auto-Deploy Setup — One-Time

This document walks through enabling the GitHub Actions auto-deploy workflow
defined in `.github/workflows/deploy.yml`.

Once configured, every push to `main` automatically:

1. Runs the full test suite + Next.js build on a GitHub runner (catches
   broken commits before they touch production).
2. SSHes into the VPS, pulls latest, rebuilds the Docker image, restarts
   the container.
3. Health-checks the live site and fails the workflow if any probe fails.

No more manual SSH after this is set up.

---

## Prerequisites

- SSH access to the VPS (you already have this)
- Admin access to the GitHub repo (`Klingdom/applied-compassion-benchmark`)

---

## Step 1 — Generate a dedicated SSH key for GitHub Actions

Run **on your local machine** (Windows: Git Bash; or use the VPS terminal):

```bash
ssh-keygen -t ed25519 -f gh-actions-deploy -N "" -C "github-actions@compassionbenchmark"
```

This creates two files in your current directory:

- `gh-actions-deploy` — the **private** key (give to GitHub; never share)
- `gh-actions-deploy.pub` — the **public** key (paste into the VPS)

Why a dedicated key (not your personal one): if it's ever compromised, you
revoke just this key without losing your own access. Standard practice.

---

## Step 2 — Authorize the key on the VPS

SSH into the VPS:

```bash
ssh root@YOUR_VPS_IP
```

Append the public key to the authorized list:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_THE_CONTENTS_OF_gh-actions-deploy.pub_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

(Open `gh-actions-deploy.pub` locally, copy the entire single-line contents,
and paste it where it says `PASTE_THE_CONTENTS...`.)

Verify it works from your local machine:

```bash
ssh -i gh-actions-deploy root@YOUR_VPS_IP "echo OK from $(hostname)"
```

If you see `OK from <vps-hostname>`, the key is authorized.

---

## Step 3 — Add three secrets to GitHub

Open: https://github.com/Klingdom/applied-compassion-benchmark/settings/secrets/actions

Click **New repository secret** three times and add:

| Name           | Value                                                  |
|----------------|--------------------------------------------------------|
| `VPS_HOST`     | Your VPS IP address (e.g., `203.0.113.45`)             |
| `VPS_USER`     | `root`                                                 |
| `VPS_SSH_KEY`  | **Entire contents** of the private `gh-actions-deploy` file (open it in a text editor, copy everything from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----` inclusive) |

Optional fourth secret (only if your VPS uses a non-standard SSH port):

| Name           | Value           |
|----------------|-----------------|
| `VPS_SSH_PORT` | e.g., `2222`    |

If you don't add `VPS_SSH_PORT`, the workflow defaults to port 22.

---

## Step 4 — Trigger the first deploy

Two ways to test:

**A. Make any small commit and push.** The workflow runs automatically.

**B. Manually trigger from GitHub.** Go to:
https://github.com/Klingdom/applied-compassion-benchmark/actions/workflows/deploy.yml
→ Click **Run workflow** → branch `main` → **Run workflow**.

---

## Step 5 — Watch the deploy

https://github.com/Klingdom/applied-compassion-benchmark/actions

You'll see the workflow run with three jobs:

1. **Build + test (runner)** — ~2 min — runs `npm test` (80 cases) and
   `npm run build` on a GitHub runner.
2. **Deploy to VPS** — ~1-3 min — SSHes in, pulls, rebuilds, restarts.
3. **Post-deploy health check** — ~30s — curl probes the live site.

Green checkmarks across all three = deploy succeeded.
Red X anywhere = read the logs; the failure is intentional and informative
(e.g., a test regression, a Docker build error, or a missing live route).

---

## Failure-mode playbook

| Failure                                     | Likely cause                          | Fix                                                  |
|---------------------------------------------|---------------------------------------|------------------------------------------------------|
| `npm test` fails in job 1                   | Code regression in a commit           | Fix locally, push again                              |
| SSH connection refused in job 2             | Wrong `VPS_HOST` secret or port       | Verify secret value                                  |
| SSH permission denied in job 2              | Public key not in VPS `authorized_keys` | Re-run Step 2                                      |
| `git pull --ff-only` fails on VPS           | Someone made local edits on the VPS   | SSH in and reconcile (rare; should never happen)     |
| `docker compose up -d --build` fails        | Dockerfile or compose file broken     | Read logs; fix in repo; push again                   |
| Health check returns non-200                | Site genuinely down or container crashed | SSH in: `docker compose logs web`                  |

---

## Rolling back

If a deploy goes bad and you need to revert:

**Option A — revert via git (preferred):**

```bash
git revert HEAD
git push origin main
```

The auto-deploy will roll back to the prior state.

**Option B — emergency, SSH into VPS:**

```bash
ssh root@YOUR_VPS_IP
cd applied-compassion-benchmark
git reset --hard <previous-good-commit-sha>
docker compose up -d --build
```

---

## Disabling the workflow temporarily

If you ever need to pause auto-deploy (e.g., during a maintenance window):

https://github.com/Klingdom/applied-compassion-benchmark/actions/workflows/deploy.yml
→ Click `•••` (top right) → **Disable workflow**.

Re-enable the same way when ready.
