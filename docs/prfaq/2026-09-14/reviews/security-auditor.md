# Security, Privacy and Integrity Review: CB-MODEL and the Continuous Research & Scoring Pipeline

**Reviewer:** security-auditor (independent)
**Date:** 2026-09-14
**Input for:** Amazon PR/FAQ, 12-reviewer panel
**Decision:** **APPROVED WITH NON-BLOCKING FINDINGS for the current static site.** **BLOCKED: INSUFFICIENT EVIDENCE** for any public claim that score changes are *verifiably* human-approved or that independence is *continuously audited*. Today neither claim can be proven from the artifacts.
**Live secrets found:** **None.** No Critical findings.

---

## 1. Scope and commands run

### 1.1 In scope
- **Secrets:** tracked tree, git history, gitignored local directories, `.gitignore` / `.dockerignore`, `site/public/`.
- **Worker:** `worker/src/index.ts` (861 lines, including the uncommitted `str()` typing change), `worker/src/badge.ts`, `wrangler.toml`, `worker/README.md`.
- **Deploy and edge:** `.github/workflows/deploy.yml` (including the uncommitted `worker-typecheck` job), `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `nginx-ssl.conf`, and live response headers.
- **Supply chain:** `site/package.json` + lockfile, `worker/package.json`, GitHub Actions references.
- **Research integrity:**
  - Governance docs: `AUTONOMY.md` R2–R8, `DECISIONS.md` D-00 and D-16, `.claude/agents/score-updater.md`.
  - The applied and proposed changes: `research/APPLIED_CHANGES.md`, `research/change-proposals/hong-kong-2026-09-14.json` (today's approval).
  - The independence audit: `research/scripts/integrity-check.mjs`, `research/integrity-reports/`, and `docs/ARCHITECTURE_MONETIZATION.md` §8–9.
  - Supporting records: `.benchmark-ops/CURRENT_STATE.md`, git signature and author data.
- **Independence and commerce:** `site/src/data/gumroad.ts`, `certified-assessments`, `advisory` and `supporters` pages, `send-alerts.mjs`.
- **CB-MODEL:** `docs/SECURITY_BYO_SCORING.md` (prior review, F-01..F-11), `tasks-v1.json`, `registry-v1.json`, `research/scripts/model-harness/` (adapters, secure-pool record handling).
- **Unattended pipeline:** `scripts/nightly-pipeline.sh`, `scripts/vps-bootstrap.sh`, `docs/VPS_SCHEDULING.md`.

### 1.2 Out of scope / not verified
- GitHub branch protection, repo secret-scanning settings, Cloudflare and Gumroad dashboards. These need authenticated access, which the review rules exclude.
- VPS host state: firewall, whether port 8080 is reachable, whether the VPS write deploy key still exists, the Umami admin password.
- `npm audit`. It makes a registry POST, which the rules exclude, so dependency CVE status is **unverified**.

### 1.3 Commands run (all read-only)
```
ls / cat           .gitignore .dockerignore Dockerfile docker-compose.yml deploy.sh nginx*.conf wrangler.toml package.json
git diff           .github/workflows/deploy.yml worker/src/index.ts research/change-proposals/hong-kong-2026-09-14.json
git ls-files       (tracked .env/.pem/.key/credentials; .claude/; site/public)
git log --all -G   '(sk-ant-api|ghp_…|github_pat_|AKIA…|BEGIN OPENSSH PRIVATE KEY)'   -> no hits
git log --all --diff-filter=A --name-only   (secret-like filenames ever added)   -> only .env.example
git log -200 --format=%G?                    -> 200 × "N" (unsigned)
git log --format='%an <%ae>' -- site/src/data/indexes   -> 54 commits, 1 identity
git log -p -- research/APPLIED_CHANGES.md | grep '^-'   -> 0 deleted lines across 43 commits
git check-ignore   .env worker/.env harness/.env research/.env site/.env.local worker/.dev.vars worker/.wrangler/ *.bak tmp/
rg (Grep tool)     key/token regexes over tracked tree (ripgrep respects .gitignore)
grep -rlI          same regexes over gitignored tmp/ research/logs/ .benchmark-ops/ .claude/   (only hits: minified node_modules)
node -e            key-name / length-only inspection of .claude/settings.local.json, tasks-v1.json, public score JSON shape
curl -D -          https://compassionbenchmark.com/  (+ a /_next/static JS asset, /u/login, /u/script.js,
                   /data/model-benchmark/registry-v1.json, /build-manifest.json, http:// redirect)
curl               https://api.compassionbenchmark.com/badge/slovakia.svg
nslookup           api.compassionbenchmark.com @1.1.1.1   -> NXDOMAIN
curl -w http_code  https://github.com/Klingdom/applied-compassion-benchmark  -> 200 (repo is public)
```

---

## 2. Controls that work (with evidence)

| # | Control | Evidence |
|---|---|---|
| C1 | **No secrets in the tracked tree or git history.** | Key-pattern pickaxe over `--all` history returned nothing. The only secret-like file ever added is `.env.example`, which has empty values. The two tracked "hits" are placeholders: `docs/VPS_SCHEDULING.md:190` (`sk-ant-...`) and `docs/SETUP_AUTO_DEPLOY.md:83` (PEM header text in instructions). |
| C2 | **F-01 fix holds.** | `git check-ignore`: `.env`, `worker/.env`, `harness/.env`, `research/.env` and `site/.env.local` are all IGNORED (root `.gitignore` lines 34–39). |
| C3 | **Worker admin alerts redact secrets before leaving the Worker (F-04).** | `worker/src/index.ts:692-745` redacts exact secret values plus shapes (Bearer/Basic, JWT, hex, b64) and caps alerts at 600 chars. It runs inside `notifyAdmin`, so future callers are covered too. |
| C4 | **Unsubscribe links are HMAC-signed and compared in constant time.** | `index.ts:274`, `790-799`. The secret never goes to Listmonk (`546-550`). |
| C5 | **Webhook idempotency; input sanitised before it reaches KV keys.** | Dedup on `webhook:<sale_id>` (`index.ts:163-167`). `entity`/`index` reduced to `[a-z0-9-]` (`132-140`). Product-id filter (`153`). |
| C6 | **Subscriber API returns only minimal fields.** | `index.ts:381-399`: email, dates, status, sale id. No names or attributes. |
| C7 | **The commercial plane cannot write scores.** | The Worker holds no GitHub token and no write binding (integrity report Checks 4–5 PASS). `wrangler.toml` has one KV binding only. |
| C8 | **CI gates deploy on tests; trusted trigger only.** | `deploy.yml`: `deploy.needs: test`. Triggers are `push: main` and `workflow_dispatch` only (no `pull_request_target`). Secrets reach the shell via `env:`, not `${{ }}` interpolation. `git pull --ff-only`. A freshness assertion checks the live site. |
| C9 | **Site dependencies locked.** | `site/package-lock.json` plus `npm ci` in Dockerfile and CI. `next`/`react` pinned to exact versions. |
| C10 | **Container posture is simple.** | Multi-stage build copies only `site/`. No `privileged`, no Docker socket mount, no secrets in image or compose. |
| C11 | **Product separation and release-watch validators are real code, wired into build and test.** | `site/package.json` `build` runs `validate-product-separation.mjs` and `validate-model-releases.mjs`. `test` runs the separation, waiver, task-bank, registry and harness suites. |
| C12 | **CB-MODEL holds no provider credentials; restricted-pool text never lands in the repo.** | `model-harness/adapters/` has only `replay.mjs` and no `process.env` key reads. Restricted-pool trial records keep hashes only (`bin/run.mjs:145-160`). Acceptance tests plant canary secrets and check they don't leak (`tests/acceptance.test.mjs:241,526`). |
| C13 | **BYO scoring cannot handle a key or emit a composite.** | Clipboard round-trip, no key field, no egress, no composite (D-30; `docs/SECURITY_BYO_SCORING.md` §4.0, §4.7). |
| C14 | **The written approval rules are strong, and the assessor's text survived today.** | D-00 drift guard (`DECISIONS.md:699`), D-16 self-veto (`:342`), R8 "never edit recommendation/notes" (`AUTONOMY.md:296`). Today's Hong Kong diff changed only `status/reviewed_by/reviewed_date/decision/applied_date`; `recommendation` and `notes` are untouched. |
| C15 | **The applied-changes ledger has never had a line deleted.** | 43 commits to `research/APPLIED_CHANGES.md`, zero deleted lines. Append-only is a convention, but the git record shows it has held. |
| C16 | **Published data is minimal.** | Public score JSON keys are only `slug, name, composite, band, indexSlug, kind, rank, updatedAt`. No evidence, reviewer names or internal notes. HTTP redirects to HTTPS (301). |
| C17 | **Per-index content hashes are published.** | Live `https://compassionbenchmark.com/build-manifest.json` carries a `sha256` for every index file. It is only partly useful; see SA-12. |

---

## 3. Findings

Severity is calibrated to *present* exploitability. "Latent" means the vulnerable component is not currently reachable.

### SA-01 · HIGH · Research integrity: a score change cannot be traced to a verifiable human approval

- **Finding.** The only authorisation for a score change is the string `"reviewed_by": "founder"` in a JSON file (`AUTONOMY.md:252-262`, R5). Any agent with write access can type it. Today's approval was written exactly that way by the coordinator, on an in-session instruction. The file does not record who wrote it, what instruction it rested on, or where that instruction came from.
- **Evidence.**
  - Today's approval: `research/change-proposals/hong-kong-2026-09-14.json:98-102` (uncommitted diff `pending → applied`, `null → "founder"`).
  - Commit signing: 200 of 200 recent commits are unsigned (`%G? = N`).
  - One identity for everything: all 54 commits touching `site/src/data/indexes/` share a single git identity, so human and agent commits look the same.
  - The team's own record agrees: `.benchmark-ops/CURRENT_STATE.md:30` ("By convention, not by hash") and `:42` ("No hashes, no signed run manifests").
- **Impact.**
  - The PR/FAQ cannot honestly claim "every score change is approved by a human" as a *verifiable* fact.
  - An unattended or prompt-injected agent could write an approval that looks identical to a real one.
  - Critics and subjects of a downgrade get nothing checkable to contest or confirm.
- **Likelihood.** The failure is not an outside attack. It is an agent misreading a broad instruction, which AUTONOMY.md §5 records twice (2026-08-16, 2026-08-20). Moderate.
- **Remediation.**
  1. Founder approvals become signed git commits from a founder-only signing key. Agents commit under a separate bot identity.
  2. Protect `main` so changes to `site/src/data/indexes/**` and `research/change-proposals/**` need a PR approved by the founder's GitHub account.
  3. Add an `approval` block that hashes the proposal content being approved (`sha256` of the canonical JSON minus review fields), so a later edit to the evidence invalidates the approval.
  4. Hash-chain `APPLIED_CHANGES.md` rows, each row carrying `prev_hash`.
- **Verification.** A CI validator rejects any index diff that has no matching APPLIED_CHANGES row, no approved proposal with a valid content hash, and no founder-signed commit or approving review. Test it with a synthetic unsigned "founder" edit, which must fail.

### SA-02 · HIGH · Independence: the audit is dead, its main check can't catch a violation, and a public claim goes further than the controls

- **Finding.** The independence audit (`research/scripts/integrity-check.mjs`), which CLAUDE.md describes as "weekly", has run once, on 2026-05-18. That run failed with 2 violations, and it has not been re-run or dispositioned in about 17 weeks.
- **Check design problems.**
  - Check 1 whitelists commits by *commit-message regex* (`integrity-check.mjs:88`: `/scanner|assessor|digest|founder|score-updater/`). Any commit mentioning "founder" passes, and a pay-to-influence edit with that word would pass too.
  - Check 3's FAIL is a false positive: it matched the doc comment in `send-alerts.mjs:8-10` that lists paths the script does *not* read. The only files it actually reads are the retry log and briefing JSON (`:374`, `:394`).
- **Controls claimed but absent.** `docs/ARCHITECTURE_MONETIZATION.md:766` says send-alerts runs as a separate Unix user and a pre-commit hook rejects its commits. No hooks exist (`.git/hooks` has only `.sample` files; no `core.hooksPath`). The §9.1 mitigation (a Gumroad IP allowlist) is not implemented either.
- **Public claim.** `site/src/app/supporters/page.tsx:87-91` says the assessment pipeline "has no access to supporter records, payment data, or any commercial system". The claim is directionally true today, largely because the commercial Worker is not deployed (SA-05). But it is not continuously checked, and it is not verifiable as the architecture doc promises (§8.4: "verifiable, not just asserted").
- **Impact.** This is the institution's core promise. One journalist request to "show me your last independence audit" would surface a May report that says FAIL, "critical incident", with no follow-up.
- **Remediation.**
  1. Disposition the 2026-05-18 FAILs in writing. Both look like check defects, not violations, and the record should say so.
  2. Rewrite Check 1 to use author identity plus the SA-01 approval link, not message text.
  3. Fix Check 3 to parse imports and file reads, not grep comments.
  4. Run the audit as a scheduled GitHub Action that commits its report and fails loudly.
  5. Correct ARCHITECTURE_MONETIZATION §8.2 to describe the controls that actually exist.
- **Verification.** Weekly reports appear in `research/integrity-reports/` with no gap over 8 days. A planted test commit to an index file under a non-approved identity produces FAIL.

### SA-03 · HIGH (conditional; MEDIUM if the VPS pipeline is confirmed decommissioned) · Unattended agents reading the web can push to `main`, and `main` auto-deploys to production

- **Finding.** The documented VPS pipeline does four things:
  - It runs three autonomous `claude --agent … --print` stages (`scripts/nightly-pipeline.sh:133-161`) as **root**.
  - It gives them `ANTHROPIC_API_KEY` from `/root/.bashrc` (`scripts/vps-bootstrap.sh:64`).
  - It sets up a GitHub deploy key **with write access** (`vps-bootstrap.sh:14`, `:77-82`).
  - It runs `git add research/ site/src/data/updates/` followed by `git push origin main` (`nightly-pipeline.sh:196`, `:218`).

  Any push to `main` triggers `deploy.yml`, which has no environment approval, so production updates with no human in the loop. The scanner and assessor read arbitrary third-party web content, which is an indirect prompt-injection surface.
- **Evidence.**
  - The last commit matching the VPS pipeline's message pattern is `9a5f3fbc` (2026-04-16). Current nightly commits come from the founder's workstation, so the VPS path is **probably dormant**.
  - Whether the write deploy key and the root-held API key still exist on the VPS is **unverified**.
  - `index` files are not in the `git add` scope, which is good. **Public daily briefings are in scope.**
- **Impact.** A web page crafted to steer the digest agent could publish defamatory or false briefing content about a named institution on compassionbenchmark.com within one pipeline cycle. A compromised VPS also gives an attacker a key that can write to the public repo, which then auto-deploys.
- **Remediation.**
  1. Confirm whether the VPS pipeline is disabled. If it is, revoke the deploy key in GitHub and remove the key from `/root/.bashrc`.
  2. If it is ever re-enabled: push to a `nightly/*` branch only, merge by founder-reviewed PR, run as a non-root user, and give the key a spend cap.
- **Verification.** GitHub's deploy-keys list shows no write-enabled key. Branch protection rejects a direct push to `main` from a non-founder identity.

### SA-04 · MEDIUM (latent: Worker not deployed) · The Gumroad webhook accepts forged purchases

- **Finding.** The only authentication is `seller_id === env.GUMROAD_SELLER_ID` (`worker/src/index.ts:146-149`). Gumroad pings are unsigned, the seller id is not a strong secret, and the configured ping URL carries no secret (`worker/README.md:254-255`). `ARCHITECTURE_MONETIZATION.md:798` acknowledges the gap; the mitigation it proposes does not exist.
- **Impact.**
  - A forged "purchase" for any email address creates a watch record.
  - It also creates a pre-confirmed Listmonk subscription (`preconfirm_subscriptions: true`, `:530`) and sends a welcome email to that address. That is abuse of CB's sending reputation and processing of a third party's personal data without consent.
  - Forged refund or cancel events can cancel a real subscriber's alerts, but only if the attacker knows the victim's `sale_id`.
- **Remediation.**
  1. Put a high-entropy secret in the ping URL (e.g. `/gumroad/webhook/<secret>`) and compare it in constant time.
  2. Before activating a watch, confirm the sale through Gumroad's sales API.
  3. Rate-limit the route.
- **Verification.** A POST with the correct seller id but no URL secret returns 403. A sale id unknown to Gumroad's API creates no KV record.

### SA-05 · MEDIUM · Commerce integrity: Score-Watch is on sale, but its fulfillment host doesn't resolve

- **Finding.** `site/src/data/gumroad.ts` marks Score-Watch `useGumroad: true` ("LIVE since 2026-06-22", $79/yr). Fulfillment depends on the Worker at `api.compassionbenchmark.com`, which returned **NXDOMAIN** from 1.1.1.1 on 2026-09-14. `send-alerts.mjs:88` defaults to that same host.
- **Impact.** Any purchase since launch would have gone unfulfilled: no watch record, no welcome email, no alerts, and Gumroad pings dropped. The benchmark is selling a product it cannot deliver, which is a trust and consumer-protection problem independent of any attacker. The number of sales could not be checked.
- **Remediation.** Either set `useGumroad: false` (the manual contact-sales path exists), or deploy the Worker after SA-04, SA-06 and SA-07 are fixed. Reconcile Gumroad sales against KV and email affected buyers.
- **Verification.** DNS resolves. A real test purchase produces a `watch:` record and a welcome email. The Gumroad ping log shows 200s.

### SA-06 · MEDIUM (latent) · Stored HTML injection on the Worker's unsubscribe page

- **Finding.**
  - `entity_name` is taken from the buyer-controlled `url_params[name]` and URI-decoded without validation (`index.ts:142-144`), then stored in KV.
  - It is written into HTML **unescaped** (`index.ts:303`, via `htmlResponse` at `:826-834`).
  - `badge.ts:56-57` also writes the path-derived `slug` into SVG unescaped. That is low risk because WHATWG path encoding covers `<`, `>` and `"`, but it is the pattern that gets copied.
- **Impact.** Combined with SA-04, an attacker can store script for any email address. It runs when that person clicks their legitimate unsubscribe link. The `api.` origin holds no cookies, so the realistic payoff is phishing under CB's domain.
- **Remediation.** HTML-escape every interpolation in `htmlResponse` and `badge.ts`. Validate `name` against a length cap and a character set, or better, look the entity name up from the public score JSON instead of trusting the checkout URL.
- **Verification.** Buy or simulate with `name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E`; the unsubscribe page must render it as literal text.

### SA-07 · MEDIUM (latent) · Internal and admin tokens travel in query strings and are compared in non-constant time

- **Finding.**
  - `/api/v1/subscribers?token=` (`index.ts:361-363`) and `/admin/status?token=` (`:411-412`) use `!==`.
  - `send-alerts.mjs:140` puts the internal token in the URL, and the runbook does the same (`DEPLOYMENT.md:235`).
  - There is no rate limiting anywhere in the Worker.
- **Impact.** Tokens end up in Cloudflare request logs, shell history and any proxy logs. Anyone holding `INTERNAL_API_TOKEN` can list every subscriber email for any entity. The timing side-channel is weak over the network, but the fix is trivial.
- **Remediation.** Move to `Authorization: Bearer`, compare in constant time (reuse the logic at `:790-799`), rotate both tokens once, and add a Cloudflare rate-limit rule.
- **Verification.** A query-string token returns 403. A header token returns 200. Worker logs show no token values.

### SA-08 · MEDIUM · The analytics admin console is publicly reachable on the main domain

- **Finding.** `nginx.conf:19-25` proxies all of `/u/` to the Umami container, not just `script.js` and `api/send`. `GET https://compassionbenchmark.com/u/login` returned **200**.
- **Impact.** An internet-facing admin login for the visitor analytics database, on the institution's primary origin. Whether default credentials were changed was not tested.
- **Remediation.** Proxy only `location = /u/script.js` and `location = /u/api/send`. Serve the Umami UI on a separate, IP-restricted hostname or over SSH tunnel. Confirm the default admin password was changed.
- **Verification.** `/u/login` returns 404 while the tracking script and event POSTs still work.

### SA-09 · MEDIUM · The live edge lacks HSTS and CSP, and the repo's TLS config is not the deployed one

- **Finding.**
  - Live headers (served by `openresty`) include no `Strict-Transport-Security` and no `Content-Security-Policy`, and still send the deprecated `X-XSS-Protection: 1; mode=block`.
  - The Dockerfile copies `nginx.conf`, which has no TLS or HSTS. `nginx-ssl.conf`, which does set HSTS, is not in the live path. TLS is terminated at an upstream proxy whose config is not in the repo.
  - `location` blocks that call `add_header` (`nginx.conf:58-67`) drop the server-level security headers for JS, CSS and SVG, as confirmed on a live asset.
  - A 404 redirect is issued to an `http://` URL (`registry-v1.json → http://compassionbenchmark.com/404`).
  - F-02 (no CSP) from the 2026-09-10 review is still open.
- **Impact.** A first-visit HTTPS downgrade window, and no XSS backstop just as the site adds untrusted-input features (the BYO import).
- **Remediation.** Set HSTS at the proxy that terminates TLS. Add CSP Stage 1 (`object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://formspree.io`). Set `absolute_redirect off`. Repeat security headers in child `location` blocks. Commit the upstream proxy config or document it.
- **Verification.** `curl -sI` on `/` and on a `/_next/static/*.js` asset both show HSTS, CSP and nosniff.

### SA-10 · MEDIUM · The drift guard, self-veto and approval gate are enforced only by the agent's prompt

- **Finding.** D-00 (drift above 2.0pt means hold), R2/D-16 (self-veto) and R5 (status must be approved) live only as prose in `.claude/agents/score-updater.md:52-61`. No script checks them; a grep of `site/scripts` and `research/scripts` for drift logic finds nothing related. The build validators check index shape and product separation, not approval linkage.
- **Impact.** The guards have worked because the agent followed them (`DECISIONS.md` records refusals). But a different agent, a manual edit, or a model regression would bypass them silently. For a benchmark, "the LLM remembered the rule" is not a control an outside party can rely on.
- **Remediation.** Add `validate-applied-changes.mjs` to `npm run build`. For every composite that differs from the previous release it must require: an APPLIED_CHANGES row, an approved proposal, recorded `published_scores.composite` within 2.0 of the prior index value, and no self-veto phrase unless an R3 override record exists.
- **Verification.** Fixture tests: drift 2.1 fails; a self-veto phrase without an override record fails; an index change with no proposal fails.

### SA-11 · MEDIUM · Supply chain: Worker deps unpinned, CI actions tag-pinned, token scope unset

- **Finding.**
  - `worker/` has no lockfile and uses caret ranges (`worker/package.json`).
  - The new CI job runs `npm ci || npm install` (uncommitted `deploy.yml` diff), which silently falls back to unpinned installs.
  - Actions are pinned by tag, not SHA. That includes the third-party `appleboy/ssh-action@v1.2.0`, which receives an SSH private key for a **root** VPS login (`docs/SETUP_AUTO_DEPLOY.md:82`).
  - There is no workflow-level `permissions:` block, no Dependabot config, and no CODEOWNERS (`.github/` has only `deploy.yml`).
- **Impact.** A re-tagged action or a malicious wrangler or TypeScript release reaches either the production-root SSH key or the machine that holds Cloudflare deploy credentials.
- **Remediation.**
  1. Commit `worker/package-lock.json` and use `npm ci` only.
  2. Pin actions by full SHA.
  3. Add `permissions: contents: read`.
  4. Put the `deploy` job behind a GitHub Environment with the SSH secrets scoped to it.
  5. Use a non-root deploy user.
  6. Enable Dependabot.
- **Verification.** CI fails when the lockfile is missing. `grep -E 'uses: .*@[0-9a-f]{40}'` matches every step.

### SA-12 · MEDIUM · Published score hashes are not bound to a commit

- **Finding.** The live `build-manifest.json` publishes a `sha256` per index, but reports `git.sha: "unknown"`, because `.dockerignore:1` excludes `.git` from the build context. Nothing signs the manifest or keeps its history.
- **Impact.** Outsiders cannot connect a live score to a specific reviewed commit. Silent drift, including the 2026-08-16 stale-deploy incident, is detectable only by CB itself.
- **Remediation.** Pass `GIT_SHA` as a build-arg. Publish an append-only, dated manifest history, e.g. `/data/manifests/<date>.json`. Later, sign it with Sigstore/cosign or a published key.
- **Verification.** The live manifest `git.sha` equals `main` HEAD, and the `deploy.yml` freshness step asserts it.

### SA-13 · MEDIUM · Independence: paid services to rated entities have no written firewall

- **Finding.** CB sells "Certified assessor review" ($5k–$15k), "Advanced advisory assessment" ($15k–$50k+) and an "Improvement roadmap package" ($10k+) to organisations it ranks publicly (`site/src/app/certified-assessments/page.tsx:59-64`). It explicitly targets an "Institution under review" (`advisory/page.tsx:150`).
  - The disclaimers are good (`certified-assessments/page.tsx:39`, `:94-101`).
  - No rule, in code or docs, says whether evidence submitted in a paid engagement can enter the public score.
  - Nothing bars a paying entity's assessor from reviewing that entity's public proposals.
  - No conflict register exists, and ARCHITECTURE_MONETIZATION §8 does not mention these services.
- **Impact.** This is the issuer-pays conflict that damaged credit-rating agencies. The independence policy allows "interpretation and institutional use", but "we assess you privately for $15k and also rank you publicly" needs a published boundary or it will be read as pay-to-influence.
- **Remediation.**
  1. A written rule: paid-engagement material never enters public scoring, or enters only through the same public-evidence path with disclosure.
  2. Assessor recusal for public review of that entity.
  3. A public register of engagements.
  4. A validator flagging proposals for entities on the register.
- **Verification.** The published policy page exists. A proposal fixture for a registered entity carries a disclosure flag in the build.

### SA-14 · MEDIUM (design, before BLK-002 lifts) · CB-MODEL has no restricted store for held-out items, and the official registry isn't served

- **Finding.**
  - All 33 items in `tasks-v1.json` are `core-public` / `public-permanent`, with rubric anchors published (contamination is recorded as RISK-017).
  - The harness correctly keeps restricted-pool records hash-only (`bin/run.mjs:145-160`), but no restricted storage location or access-control design exists. The repo is **public** (GitHub returns 200), so any held-out item committed here is permanently burned.
  - The positive control S5 from the BYO review is not live: `/data/model-benchmark/registry-v1.json` redirects to a 404.
- **Remediation.**
  1. Define a restricted pool store outside this repo (private repo or encrypted object store, access-logged, founder plus named raters only).
  2. Plant per-item canary strings to detect contamination.
  3. Add a CI guard that fails if any item with a restricted `exposureStatus` appears under a tracked path.
  4. Serve `registry-v1.json` publicly.
- **Verification.** Planting a restricted-pool fixture in `site/src/data/model-benchmark/` makes `npm test` fail. The registry URL returns 200 JSON.

### SA-15 · LOW · Agent permission file is tracked in a public repo

- **Finding.** `.claude/settings.local.json` is tracked, has 410 allow rules including an `ssh *` pattern, and carries a 288-line uncommitted diff. No secret patterns matched. Its only `env` key is `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.
- **Impact.** "Local" permission files commonly collect allow rules with inline tokens (e.g. `Bash(curl …?token=…)`). This one is one approval away from publishing one. It also discloses operational tooling.
- **Remediation.** `git rm --cached`, add it to `.gitignore`, and keep a sanitised `settings.json` if shared rules are needed.

### SA-16 · LOW · Residual ignore gaps

- `worker/.dev.vars` (wrangler's local secrets file) and `worker/.wrangler/` are **NOT ignored**.
- `research/rotation-state.json.bak` and `research/scans/*.json.bak` are untracked and not ignored, so a `git add -A` would sweep them in.
- **Remediation.** Add `.dev.vars`, `.wrangler/` and `*.bak` to root `.gitignore`.

### SA-17 · LOW · Unsubscribe token design

- Tokens never expire (`index.ts:805`), and unsubscribe fires on GET, so mail-security link scanners can unsubscribe people.
- The subscriber's email sits in the query string.
- **Remediation.** GET shows a confirmation page, POST performs the unsubscribe, and the token includes a version so it can be rotated.

### SA-18 · LOW · Credential storage pattern that CB-MODEL must not copy

- `ANTHROPIC_API_KEY` is kept in plaintext in `/root/.bashrc` (`vps-bootstrap.sh:64`).
- `docs/VPS_SCHEDULING.md:187-190` suggests putting it inline in the crontab.
- When model-provider keys arrive, this pattern would expose every key to every root process and agent.
- **Remediation.** Keep keys in a root-owned `0600` env file or a secret manager, scoped per provider with spend caps. Evaluation runners must not use an agent-shell environment.

---

## 4. Top 5 recommended improvements

Scoring: Impact, Strategic alignment, Learning value and Confidence are rated 1–5 (higher is better). Effort and Risk are rated 1–5 (higher is worse). Priority Score = Impact + Strategic + Learning + Confidence − Effort − Risk.

### 4.1 Verifiable approval provenance (signed founder approvals, protected `main`)
- **Type:** Research-integrity control / tamper-evidence
- **Problem:** A score change traces only to an unsigned string any agent can write (SA-01). Unattended agents could push to `main`, which auto-deploys (SA-03).
- **Expected benefit:** Every published score delta links to proposal content hash → founder-signed approval → commit → build manifest. Critics can check the chain themselves.
- **Evidence:** `hong-kong-2026-09-14.json:98-102`; 200/200 commits unsigned; one git identity; `CURRENT_STATE.md:30,42`; `nightly-pipeline.sh:218`.
- **Impact:** 5 · **Strategic alignment:** 5 (independence is the product) · **Learning value:** 4 · **Confidence:** 4 · **Effort:** 3 · **Risk:** 1
- **Priority Score: 14**

### 4.2 Revive the independence audit as a real CI gate and align public claims with it
- **Type:** Independence-policy enforcement
- **Problem:** The audit ran once (May, FAIL), its Check 1 can be passed by writing "founder" in a commit message, and the architecture doc claims controls that don't exist (SA-02).
- **Expected benefit:** An honest, dated, weekly artifact backing the `/supporters` claim. The PR/FAQ can then point to it.
- **Evidence:** `research/integrity-reports/` has one file; `integrity-check.mjs:88`; `ARCHITECTURE_MONETIZATION.md:766`; no git hooks; `supporters/page.tsx:87-91`.
- **Impact:** 4 · **Strategic alignment:** 5 · **Learning value:** 3 · **Confidence:** 5 · **Effort:** 2 · **Risk:** 1
- **Priority Score: 14**

### 4.3 Turn score-updater prompt rules into a build validator
- **Type:** Integrity guard (code, not prompt)
- **Problem:** D-00, R2 and R5 exist only as agent-spec prose (SA-10).
- **Expected benefit:** Any drift, self-veto or unapproved index change fails `npm run build`, whoever or whatever made the edit. It also works for CB-MODEL publication gates.
- **Evidence:** `score-updater.md:52-61`; no drift logic in scripts; build runs other validators but none for approval linkage.
- **Impact:** 4 · **Strategic alignment:** 4 · **Learning value:** 4 · **Confidence:** 4 · **Effort:** 3 · **Risk:** 2
- **Priority Score: 11**

### 4.4 CB-MODEL data and credential boundary, built before BLK-002 lifts
- **Type:** Future threat model / secure design
- **Problem:** No restricted store for held-out items in a **public** repo. The only credential precedent is `/root/.bashrc`. The official registry isn't served (SA-14, SA-18).
- **Expected benefit:** Model results that are not contaminated by construction; provider keys that cannot leak into agent transcripts or the repo; a public positive control against forged "CB scores".
- **Evidence:** `tasks-v1.json` 33/33 `public-permanent`; `run.mjs:145-160`; public GitHub repo; `vps-bootstrap.sh:64`; registry URL → 404.
- **Impact:** 5 · **Strategic alignment:** 5 · **Learning value:** 4 · **Confidence:** 3 · **Effort:** 4 · **Risk:** 2
- **Priority Score: 11**

### 4.5 Fix or pause the commercial plane before Score-Watch takes more money
- **Type:** Commerce integrity + application security
- **Problem:** The product is live but its fulfillment host is NXDOMAIN (SA-05). The webhook can be forged (SA-04), the unsubscribe page has stored HTML injection (SA-06), tokens sit in URLs (SA-07), and Worker deps are unpinned (SA-11).
- **Expected benefit:** No paid-but-unfulfilled customers. The Worker launches with authenticated ingress and safe output.
- **Evidence:** `gumroad.ts` `useGumroad: true`; `nslookup` NXDOMAIN; `index.ts:146-149, 142-144, 303, 361-363`; no `worker/package-lock.json`.
- **Impact:** 4 · **Strategic alignment:** 3 · **Learning value:** 2 · **Confidence:** 5 · **Effort:** 2 · **Risk:** 2
- **Priority Score: 10**

**Also required but outside the top 5:**
- SA-08: close the public Umami admin.
- SA-09: HSTS and CSP at the TLS-terminating proxy.
- SA-13: a published firewall for paid engagements. It is strategically important; for PR/FAQ purposes treat it as tied with 4.2.
- SA-15 / SA-16: hygiene.

---

## 5. PR/FAQ inputs

### 5.1 "Why should anyone trust these scores?" (honest draft answer)

> Because the parts that matter most are open. The method, the 8 dimensions and 40 subdimensions, the scoring formula (one shared implementation with fixture tests), the per-index content hashes of every published build, and the assessor's own dissent all sit in public files anyone can inspect. When the founder overrides an assessor's caution, the original text is kept word for word (AUTONOMY R8), and every applied change is appended to a ledger that git history shows has never had a line deleted. The software that takes money has no ability to write a score: the payment webhook runs on a separate platform with no repository access. The model benchmark holds no provider credentials today, and its self-run scoring tool cannot produce an official-looking composite.
>
> What we do **not** yet offer, and are building: cryptographic proof that each score change was approved by a named human (today it is a recorded field plus git history under one identity), a continuously running independence audit (it has run once), and a published firewall between paid assessment services and public scores. Until those ship, we ask you to trust an open record, not a signature. We will say so plainly rather than overstate it.

### 5.2 Hard FAQ questions, with honest answers

**Q1. Can an institution pay to raise its score, suppress a finding, or get left out?**
- No code path lets money change a score. The payment and alert systems cannot write to score files, and they hold no repository credentials.
- Honest caveat: CB also sells certified assessments and advisory work ($2.5k–$50k+) to institutions it ranks publicly.
- The pages disclaim any guaranteed score, but CB has **not yet published** a rule for whether paid-engagement material may enter public scoring, or a register of those engagements. It is publishing that firewall before any such engagement is signed.

**Q2. You say a human approves every score change. How would I verify that?**
- Today you can't, cryptographically.
- Approval is recorded as `reviewed_by: "founder"` in a public proposal file, and the change is logged in an append-only ledger.
- Commits are unsigned, and humans and agents share one git identity. Some approvals are written into the file by an AI coordinator on the founder's in-session instruction, as happened on 2026-09-14.
- CB is moving to founder-signed approvals and protected branches, so each change carries a verifiable signature.

**Q3. Your AI model task bank is public. Won't labs just train on it?**
- Yes. All 33 v1 items, including the scoring rubric, are public and permanent, so any v1 model result is contaminated by construction and will be labelled that way.
- Credible results need a held-out item pool stored outside the public repository, with contamination canaries. That pool does not exist yet, and no model has an official result: the registry has 0 entries.

**Q4. What stops someone publishing a fake "Compassion Benchmark score" for their model?**
- Nothing can stop a forged screenshot. What CB controls is its own tool and a public record to check claims against.
- The self-run tool never produces a 0–100 composite or band label (D-30), because it cannot verify which model produced a text or who judged it.
- The public check is an official registry anyone can consult. It exists but is **not yet published at a public URL**; that is a launch prerequisite.

**Q5. Will CB hold AI providers' API keys, and what if they leak?**
- CB holds none today, and the self-run scoring design never asks for one.
- When CB runs evaluations itself (currently blocked on budget, BLK-002), keys will live in a scoped secret store with per-provider spend caps. They will be unreachable from AI agents' environments and never in the repository or a shell profile.
- Leak response: revoke with the provider, rotate, check the provider usage logs for the exposure window, and disclose if any evaluation result could have been affected.

**Q6 (optional). Is the independence audit you describe actually running?**
- Not continuously. It ran once, in May 2026, and reported two failures.
- Both appear to be defects in the checks themselves: one matched commit-message text, one matched a code comment. Neither appears to be a real independence breach.
- They were never formally resolved. CB is fixing the checks, scheduling the audit weekly in CI, and publishing every report.

---

*No secret value was read into this document or reproduced. No exploitation, credential use, git write, build, or edit other than this file was performed. Live-site checks were limited to unauthenticated GET requests and a DNS lookup.*
