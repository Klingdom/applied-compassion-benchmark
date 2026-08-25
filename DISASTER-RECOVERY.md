# Disaster Recovery

What is restorable in this system, from what, and what is honestly untested. Adapted in
structure from the 6S Success operating system; populated entirely from this repo's own
topology and incidents. See `docs/OPERATING_SYSTEM_ADAPTATION.md`, `INCIDENTS.md`,
`.claude/agents/vps-docker-manager.md`, `.claude/agents/github-manager.md`.

---

## 1. What must be restorable

| Component | Where it lives | Deploys via |
|---|---|---|
| VPS runtime (Docker, Nginx, Certbot) | Hostinger VPS, `~/applied-compassion-benchmark` | `git pull` + `docker compose up -d --build`, driven by `deploy.sh` (first deploy) or `.github/workflows/deploy.yml` (subsequent, currently broken — see INC-001) |
| Cloudflare Worker (`worker/`) | Cloudflare's edge network | `npx wrangler deploy`, **not** the VPS — a completely separate deploy target with its own secrets (see `worker/README.md`) |
| Let's Encrypt TLS certificates | Certbot container volume on the VPS | Auto-renews every 12h via the `certbot` container in `docker-compose.yml`; force-renewable with `docker compose run --rm certbot renew --force-renewal` |
| `research/rotation-state.json` | Committed to `main` (see §2 — this is itself a defect) | Restorable from git history like any other tracked file, for reasons that are not fully intentional |

---

## 2. `rotation-state.json` — the critical one, and it has a defect

**This file drives nightly scan prioritization and staleness calculation for all 1,331 tracked
entities** (verified live: `entity_count` field and the actual `entities` object key count both
read 1,331). Losing it without a seeding path would not corrupt published scores, but it would
blind the nightly pipeline: every entity would need to be re-classified for staleness from
scratch, and the pipeline has no other record of "when was this entity last actually assessed."

**The defect, stated plainly:** `.gitignore` lists it —

```
# Pipeline runtime state (297KB rewritten each run, bad for git history)
# The scan files already record what was processed each night for auditability
research/rotation-state.json
research/rotation-state.json.tmp
```

— but `git ls-files research/rotation-state.json` returns the file. **It is tracked.** The
ignore rule has never taken effect, most likely because the file was committed once before the
ignore rule was added, and `.gitignore` only prevents *new* tracking, not removal of an already-tracked
path.

**Both things below are simultaneously true, and this document does not resolve the tension:**

1. **Because the ignore is ineffective, the file is currently fully recoverable from git
   history**, exactly like every other tracked file. A fresh clone gets a working baseline for
   free.
2. **If someone "fixes" the hygiene defect** (runs `git rm --cached research/rotation-state.json`
   to make the ignore finally take effect, on the reasoning that a 297KB file rewritten every
   night is genuinely bad for git history) **without first building a seeding path, a fresh clone
   would have no `rotation-state.json` at all**, and the nightly pipeline would have nothing to
   compute staleness from.

**This is flagged as an unresolved architectural decision, not fixed here.** Both
`.claude/agents/github-manager.md` and `docs/OPERATING_SYSTEM_ADAPTATION.md` independently flag
the same tension. Do not `git rm --cached` this file without a seeding/bootstrap script that can
reconstruct a working baseline (e.g., derived from `research/assessments/*.md` filenames and the
published indexes) landing in the same change.

---

## 3. Rebuild-from-scratch path

Follow `DEPLOYMENT.md`'s "First Deploy" section, verified against the live files in this repo:

```bash
ssh root@YOUR_VPS_IP
git clone https://github.com/Klingdom/applied-compassion-benchmark.git
cd applied-compassion-benchmark
chmod +x deploy.sh
./deploy.sh
```

This performs, per `DEPLOYMENT.md` and `Dockerfile`: a multi-stage Docker build (Node 20-alpine
build stage → nginx:alpine serve stage, static export only — **no Node.js runtime in
production**), starts Nginx on port 80, requests a Let's Encrypt certificate, switches to the
HTTPS Nginx config (`nginx-ssl.conf`), and starts the Certbot auto-renewal container.

**Prerequisites, per `DEPLOYMENT.md`:** Docker + Docker Compose installed, DNS A records for
`compassionbenchmark.com` and `www.compassionbenchmark.com` pointing at the VPS IP, ports 80/443
open, SSH access.

**The Worker is separate and is not part of this path.** It must be redeployed independently:
`cd worker && npm install && npx wrangler deploy`, after re-provisioning its eleven secrets (see
`worker/README.md` "Secret names reference") — none of which are recoverable from git; they must
be re-obtained from Gumroad, Listmonk, and freshly generated random strings.

**Never assume secrets exist after a rebuild.** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (GitHub
Actions secrets) and all eleven Worker secrets must be re-provisioned manually; none are stored
in this repository and none of this document's commands can retrieve them.

---

## 4. Rollback

**The previous Docker image is the rollback artifact.** Per `.claude/agents/vps-docker-manager.md`,
capture its ID *before* rebuilding:

```bash
docker images | head -5          # note the prior image id, before building
cd ~/applied-compassion-benchmark
git log --oneline -5
git checkout <previous-good-sha>
docker compose up -d --build
```

Then re-run the data assertion (see `OBSERVABILITY.md` §2) against the value expected from the
*older* release, not the newer one.

**A VPS parked on a detached SHA breaks the next automated deploy.** The workflow uses
`git pull --ff-only`, deliberately, so that a divergent working tree fails loudly rather than
being silently overwritten. A VPS left checked out at a specific commit (not on `main`) is
divergent by definition — the next `--ff-only` pull will fail. **Return the box to `main` as soon
as a real fix lands.** Do not leave a rollback in place indefinitely as a substitute for fixing
forward.

`docs/SETUP_AUTO_DEPLOY.md` also documents an "Option A" rollback via `git revert HEAD` +
`git push origin main`, which is preferable when the automated pipeline is healthy, since it lets
the normal deploy path do the work. Given INC-001 (deploy pipeline currently non-functional past
the SSH stage), the manual VPS path above is the only one that currently works.

---

## 5. What a rollback does not fix

**Reverting a container does not unpublish a score.** If a bad score reached `main` and was
deployed, rolling the container back to a prior image restores the *old* score on the live site —
it does not correct the *new* one that is still sitting in `site/src/data/indexes/*.json` on
`main`. Data corrections go through `score-updater` and the normal proposal/approval path, not
through infrastructure rollback. This is stated as a non-negotiable rule in both
`.claude/agents/vps-docker-manager.md` and `.claude/agents/github-manager.md` independently.

---

## 6. What is untested — stated honestly

**No restore drill has been performed.** Nothing in this repository or its history documents an
actual, exercised recovery from a lost VPS, a lost Worker deployment, or a lost
`rotation-state.json`. Every procedure in sections 3 and 4 is derived from `DEPLOYMENT.md`,
`worker/README.md`, and the agent runbooks as written — none of them has been verified end-to-end
against a real failure in this project's history. Say so rather than implying assurance: **if the
VPS were lost today, the first execution of §3 would be the first time it has ever actually been
run.**

The one component with a partially-exercised equivalent is TLS: `docker compose run --rm certbot
renew --force-renewal` is a documented, low-risk operation, but even that is a renewal, not a
from-scratch certificate acquisition under `deploy.sh`, which has similarly never been re-run
against this specific domain since the original setup.
