# Nonprofit Transition — Architecture Simplification Proposal

Owner: System Architect agent
Date: 2026-07-12
Status: Proposal (no code changed). Requires founder decision on nonprofit product surface before Phase 2+.

---

## 1. Framing

Compassion Benchmark is a **statically-exported, evidence-first benchmark institution**. Its
durable value is the deterministic research pipeline (scanner → assessor → digest, with
human-in-the-loop score approval) and the traceability of every published score back to
dated evidence. Everything else in the current stack exists to serve a **commercial plane**
that the nonprofit transition removes: Gumroad checkout, a Cloudflare Worker for paid
Score-Watch subscriptions, per-index paid "download" products, and a self-managed
VPS/Docker/Nginx/Certbot deploy chain that has already produced real incidents (broken SSH
auto-deploy → manual redeploy; nginx-ssl config must be re-applied after every rebuild).

The simplification thesis is narrow and defensible:

- **The commercial plane can be deleted, not migrated.** The Worker's own header declares it
  "purely commercial-plane infrastructure" with "NO write path" to scores. Removing it cannot
  weaken determinism or integrity by construction.
- **A static export does not need a VPS.** `next.config.ts` is `output: "export"`. The most
  incident-prone layer (VPS + Docker + Nginx + Certbot + broken SSH deploy) is pure overhead
  for a small team and can be replaced by managed static hosting with Git-push deploys.
- **Duplication is the standing maintenance tax.** The index list is duplicated across ~11
  sites (9 silent-on-miss); adding or retiring an index is error-prone. One typed registry
  removes that tax without touching any score.

Non-negotiable: the deterministic pipeline, the three build gates
(`validate-indexes`, `validate-daily-briefings`, `lint-daily-briefings`), the module-load
zod parse that fails the build on data drift, the independence separation (alert pipeline is
read-only and cannot write scores), and every evidence/audit trail must survive unchanged.

---

## 2. Proposals

Scales are 1–5. Impact = maintenance/complexity reduction. Effort = build cost. Risk =
chance of regression. "Det./trace." = effect on determinism, traceability, integrity.

| # | Title | Change | Rationale | Evidence (path) | Impact | Effort | Risk | Det./trace. impact |
|---|-------|--------|-----------|-----------------|:------:|:------:|:----:|--------------------|
| P1 | Single typed index registry | Create one `site/src/data/indexRegistry.ts` (kind, slug, file, route, label) as sole source; have `entities.ts` `KIND_CONFIG`, `nav.ts` footer, and the `.mjs` build scripts import it. Remove the 9 silent-on-miss ad-hoc lists. | The 11-place / 9-silent-on-miss duplication is the top standing tech-debt; index add/remove is error-prone for a small team. | `site/src/data/entities.ts` (KIND_CONFIG L150-247), `site/src/data/nav.ts` L12-21, `site/scripts/export-public-data.mjs` INDEXES L44-48, SYSTEM_HEALTH.md L19-21 | 5 | 3 | 2 | **Strengthens** traceability (one registry). No score impact; keep zod parse. |
| P2 | Retire the Cloudflare Worker | Decommission the whole Worker: Gumroad webhook, KV subscriber state, `/api/v1/subscribers`, `/admin/status`, HMAC unsubscribe, Listmonk sync. Delete `worker/`, KV namespace, wrangler, and all 12 Worker secrets. Replace dynamic `/badge/*.svg` with **static SVG badges** pre-generated at build. | The Worker is self-declared "purely commercial-plane infrastructure." Removing it deletes an entire deploy target, KV store, secret surface, and HMAC/Listmonk complexity. | `worker/src/index.ts` L11-15 header, `worker/wrangler.toml` L20-34 secrets | 5 | 4 | 3 | **Neutral by construction** — Worker has no write path to scores. Preserve alert-delivery audit + independence separation (see P3). |
| P3 | Worker-free Score-Watch (free alerts) | If alerts are kept as a public-good feature, repoint `send-alerts.mjs` to the **Listmonk API directly** (the `--use-listmonk-fallback` path already exists) as primary; drop the Worker/`INTERNAL_API_TOKEN` query and custom HMAC unsubscribe in favor of Listmonk-native subscribe/unsubscribe + double opt-in. | Keeps a mission-aligned feature while removing its commercial-era Worker/KV/HMAC coupling. | `research/scripts/send-alerts.mjs` L29-44 (options + env), L5-17 independence header | 4 | 3 | 3 | **Must preserve** read-only separation + `research/alert-deliveries/` audit log. No score path. |
| P4 | Delete dead Gumroad plumbing | Remove `gumroad.ts` placeholder products with fake `TODO-*` URLs (US Cities/States, Supporter, API Access, Universities) and `buildScoreWatchUrl`; collapse to (at most) a single donation link. | Dead plumbing with non-functional URLs is a documentation/maintenance hazard and mixed messaging for a nonprofit. | `site/src/data/gumroad.ts` L21-49, L76-146 | 3 | 2 | 1 | None (display-only config). |
| P5 | Collapse commercial pages/nav to one Support surface | Retire/redirect `pricing`, `purchase-research`, `data-licenses`, `advisory`, `certified-assessments`, `enterprise`, `contact-sales`, `api-access`, commercial `score-watch` framing → a single `/support` (donate + free-alerts signup). Update `nav.ts` `services`/`community`; add 301s for retired routes. | Nonprofit does not sell; the large paid-CTA surface is maintenance burden and off-mission. | `site/src/data/nav.ts` L35-53, 17 pages under `site/src/app/**` referencing gumroad | 4 | 4 | 2 | None to data. **Preserve** methodology/independence/about pages verbatim. |
| P6 | Retire VPS/Docker/Nginx/Certbot → managed static host | Deploy the `out/` export to a managed static platform (Cloudflare Pages / Netlify nonprofit tier) with Git-push auto-deploy + automatic TLS. Delete `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `nginx-ssl.conf`, `deploy.sh`, certbot; port legacy redirects to platform `_redirects`. | Removes the most incident-prone layer: broken SSH auto-deploy, manual rebuilds, cert renewal, and the re-apply-nginx-after-every-rebuild footgun. Static export needs none of it. | `next.config.ts` L4 (`output:"export"`), SYSTEM_HEALTH.md L76 (broken SSH), `scripts/nightly-pipeline.sh` L237-241 (nginx re-apply), `deploy.sh` L56-59 | 5 | 4 | 3 | **Neutral** — same static bytes. Build gates run in CI unchanged; verify Umami `/u` proxy replacement. |
| P7 | Single-branch deploy discipline | Make `main` the only deploy source; merge/retire the long-lived `page-improvements-*` branch; protect `main`; have the nightly pipeline commit via a CI token (from P6), not VPS SSH. | Two parallel lineages + manual deploy have caused real incidents. | Current branch `page-improvements-updates-methodology` vs `main`; SYSTEM_HEALTH.md L76 | 4 | 2 | 2 | **Strengthens** traceability (one deploy lineage = one auditable history). |
| P8 | Type the build-script data imports | Route the `.mjs` build scripts (`export-public-data`, `build-manifest`, `build-llms`, `build-entity-records`) through a shared loader that reads the P1 registry and zod-parses via `schema.ts` — matching `entities.ts` fail-loud behavior instead of silent-on-miss reads. | SYSTEM_HEALTH flags "untyped data imports"; these scripts are the 9 silent-on-miss sites. | SYSTEM_HEALTH.md L66 (type safety partial), `site/scripts/export-public-data.mjs`, `site/src/data/schema.ts` | 3 | 3 | 2 | **Strengthens** — fail-loud parity across all data readers. |

---

## 3. MUST PRESERVE (do not touch)

These are the benchmark's core-value guarantees. No simplification may weaken them.

1. **Deterministic research pipeline** — scanner → assessor → digest, with score changes
   emitted `status=pending` and applied only after human review
   (`scripts/nightly-pipeline.sh` L23-26, `research/PENDING_CHANGES.md`). No autonomous
   score writes.
2. **The three build gates** in `site/package.json` `build`:
   `validate-indexes.mjs` (12,750 checks), `validate-daily-briefings.mjs`,
   `lint-daily-briefings.mjs`. They must remain a hard prerequisite of any deploy, including
   under managed hosting (P6 runs them in CI).
3. **Module-load zod parse** — `entities.ts` `parseIndex()` aborts the export on any schema
   drift (`schema.ts` `IndexFileSchema`). Registry consolidation (P1/P8) must keep this
   fail-loud contract, not replace it with silent casts.
4. **Independence separation** — the alert pipeline is READ-ONLY and cannot write to
   `site/src/data/indexes/`, `research/change-proposals/`, or `research/assessments/`
   (`send-alerts.mjs` L5-17). Any Worker-free rewrite (P3) must preserve this structural
   guarantee.
5. **Evidence & audit trails** — `research/assessments/`, `research/change-proposals/`,
   `research/alert-deliveries/`, `research/integrity-reports/`,
   `site/src/data/evidence-reviews/`, and the daily briefing archive. These are the
   traceability spine; none may be dropped for convenience.
6. **Single-source metrics** — `site/src/data/entityCount.ts` (canonical catalog size) and
   the scanned-vs-scored distinction (SYSTEM_HEALTH.md L38-39).
7. **`weekly integrity-check`** (`research/scripts/integrity-check.mjs`) — the independence
   audit stays even though its commercial context shrinks.

---

## 4. Recommended sequencing

**Phase 0 — Decision (founder, no code).** Confirm the nonprofit product surface: (a) are
free Score-Watch alerts kept? (b) is there a donation/supporter path? These answers gate
P2/P3 and P5. Everything else can proceed regardless.

**Phase 1 — Foundational, low-risk, do first.**
- **P1 (index registry)** then **P8 (typed script loaders)** — P8 depends on P1. This is the
  highest-leverage internal cleanup and it de-risks every later edit that touches indexes or
  pages. No product-decision dependency; start immediately.
- **P4 (delete dead Gumroad plumbing)** — trivial, independent, do in the same pass.

**Phase 2 — Commercial-plane removal (needs Phase 0 answers).**
- **P2 (retire Worker)** + **P3 (Worker-free alerts)** are coupled: do P3 first if alerts are
  kept (repoint `send-alerts.mjs` to Listmonk and verify a real send), then P2 to
  decommission the Worker/KV/secrets. If alerts are dropped, P2 stands alone.
- **P5 (collapse commercial pages/nav)** — depends on P1 (pages read `KIND_CONFIG`/registry)
  and on P4 (removes the CTAs those pages render). Ship the 301 redirects with it so no link
  breaks.

**Phase 3 — Deploy simplification.**
- **P6 (managed static host)** — validate that the three build gates run in the platform's CI
  and that the Umami `/u` proxy has a replacement (Umami Cloud or a small proxy) before
  cutover. Keep the VPS as a warm rollback for one cycle.
- **P7 (single-branch discipline)** — finish once P6's CI deploy is proven; it removes the
  VPS-SSH commit path the nightly pipeline currently relies on. P7 depends on P6.

**Dependency summary:** P8→P1; P5→P1,P4; P2→P3(if alerts kept); P7→P6. P1 and P4 have no
upstream dependencies and unblock the most downstream work — begin there.

---

## 5. Open risks / ambiguities to resolve before locking

- **Alerts keep-or-kill (Phase 0)** determines whether P3 exists at all and how much of
  Listmonk stays. Flag before starting Phase 2.
- **Umami hosting under P6** — the current tracker is reverse-proxied through nginx `/u`
  (`nginx-ssl.conf` L57-63). A managed static host cannot reverse-proxy; decide between Umami
  Cloud, a tiny standalone proxy, or a static-friendly analytics option. Do NOT add a second
  tracker (SYSTEM_HEALTH.md L75).
- **Nightly pipeline host** — the pipeline needs a machine with the Claude CLI (Stage 2-4).
  P6 removes the VPS as the *web* host but the pipeline may still need a runner (VPS, CI cron,
  or local). Decide where it runs before P7 severs the VPS deploy path.
- **Badge consumers** — if any external site embeds `/badge/<slug>.svg`, static pre-generation
  (P2) must keep the same URLs (emit to `public/badge/<slug>.svg`) to avoid breaking hotlinks.
