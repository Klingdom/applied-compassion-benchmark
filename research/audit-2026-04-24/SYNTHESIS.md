# Audit Synthesis — 2026-04-24
**Scope:** 6 parallel specialist audits (qa, devops, architecture, frontend, analytics, ux)
**Live site smoke test:** all tested routes return 200; `/updates/2026-04-24` renders all 6 applied entities

## Headline Assessment

Compassion Benchmark is in a **healthy working state** with **three classes of technical debt** that each have a disproportionately low effort : impact ratio. No blocking issues in today's deployed state. Every gap identified is a forward-looking risk, not a current failure.

The system is functioning exactly as designed. What's missing is the scaffolding that makes it safe to scale, monetize, and hand off.

---

## Cross-Cutting Themes (flagged by ≥2 audits)

### Theme 1 — Score-Watch monetization is broken
**Audits:** analytics, ux
**Evidence:** `site/src/data/gumroad.ts` has `scoreWatch: "TODO-score-watch"` with `useGumroad: false`. Every "Subscribe — $79/yr" CTA on entity pages routes to a contact form instead of Gumroad. The product you are actively setting up is **unreachable from the self-serve path**.
**Business impact:** This is the highest-frequency monetization touchpoint and it has zero conversion capability today. The planned LinkedIn campaign will drive traffic to a dead funnel.

### Theme 2 — No schema gate for the daily pipeline
**Audits:** qa, architecture
**Evidence:** `scripts/validate-indexes.mjs` exists and is thorough, but nothing validates `site/src/data/updates/daily/*.json` or `latest.json` before `npm run build`. GitHub Actions and `deploy.sh` go straight to `docker build`. This is the direct cause of the 2026-04-21 and 2026-04-22 incidents.
**Business impact:** The next schema-drift incident will crash production. Implementation cost is ~30 minutes.

### Theme 3 — Dual scoring scale (0-5 and 0-100) with no shared library
**Audits:** qa, architecture
**Evidence:** Index JSONs use 0-5; change-proposal JSONs use 0-100; conversion is a prose instruction in `.claude/agents/score-updater.md:56` rather than a shared function. Documented as the source of bugs in `research/score-update-log.md` Batches 7-8.
**Business impact:** Every cycle risks off-by-20× errors. Two of the 4-night Luxembourg-style baseline drifts have been caught manually; the next one may not be.

### Theme 4 — Prerender safety partially addressed, not completed
**Audits:** qa, frontend
**Evidence:** `DailyBriefing.tsx` lines 131-141 now defaults all ARRAY fields to `[]` (fix cf2a00a), but lines 206-209 destructure `pipeline` without a default. A daily JSON missing `pipeline` crashes every `/updates/[date]` prerender. `page.tsx:47` still casts to `any`; scalar field renames inject `undefined` into JSON-LD silently.
**Business impact:** Wider blast radius than the 2026-04-21 incident. One-line fix.

### Theme 5 — Independence policy has no code-level enforcement
**Audits:** architecture, ux
**Evidence:** The rule "entities never pay for inclusion" is a product rule in CLAUDE.md. In code: `site/src/data/entities.ts` lines 80-160 colocates score data with Gumroad URLs in one config object. There is no boundary contract; it is guaranteed only by founder vigilance.
**Business impact:** Institutional trust = product differentiator. First discovery of a data-path that crosses this boundary (even accidentally) would be reputationally expensive.

### Theme 6 — Zero production error visibility
**Audits:** devops
**Evidence:** `docker-compose.yml` has no `logging` block, no `healthcheck`, no external uptime monitor. Umami gives traffic counts only — it cannot surface HTTP 5xx, container restarts, or a broken `/u/` proxy. Docker json-file logs have no size limit; a traffic spike silently fills the VPS disk.
**Business impact:** A silent outage could run for hours before discovery. A full disk would take down production.

---

## Prioritized Punch List

Scoring model (per CLAUDE.md): `Priority = Impact + Strategic + Learning + Confidence − Effort − Risk`.

| # | Item | Audit | Impact | Strat | Learn | Conf | Effort | Risk | **Score** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Schema validator `validate-daily.mjs` + prebuild hook** | qa, architecture | 5 | 4 | 3 | 5 | 1 | 1 | **15** |
| 2 | **Unblock Score-Watch (flip `useGumroad`, wire CTAs)** | analytics, ux | 5 | 5 | 4 | 3 | 2 | 2 | **13** |
| 3 | **UptimeRobot + Docker log rotation** | devops | 3 | 3 | 2 | 5 | 1 | 1 | **11** |
| 4 | **Delete `deploy.sh`, write 5-line `redeploy.sh`** | devops | 2 | 3 | 2 | 5 | 1 | 1 | **10** |
| 5 | **Canonical `DailyBriefingData` type + shared types** | frontend, architecture | 4 | 4 | 3 | 4 | 3 | 2 | **10** |
| 6 | **Guard `pipeline` destructure in DailyBriefing.tsx** | qa, frontend | 3 | 2 | 1 | 5 | 1 | 1 | **9** |
| 7 | **Custom 404 page (`not-found.tsx`)** | ux | 3 | 2 | 1 | 5 | 1 | 1 | **9** |
| 8 | **Shared `scoring-lib` (0-5 ↔ 0-100 conversion)** | architecture | 4 | 4 | 3 | 4 | 3 | 2 | **10** |
| 9 | **Independence-policy code contract** | architecture, ux | 3 | 5 | 3 | 3 | 3 | 2 | **9** |
| 10 | **Entity-page "why did this change?" block w/ evidence** | ux | 4 | 4 | 3 | 4 | 3 | 2 | **10** |

---

## Recommended Execution Sequence

### Tier 1 — Ship in the next working session (combined <90 min)
**Rationale:** Each is XS effort and each shields a concrete documented incident class.

1. **#6 Pipeline destructure guard** (2 min edit) — closes the widest-blast-radius latent crash
2. **#1 Schema validator + prebuild hook** (~30 min) — eliminates the incident class that caused 2026-04-21 and 2026-04-22
3. **#4 redeploy.sh rewrite** (5 min) — removes the dangerous deploy.sh and documents the real routine
4. **#7 Custom 404 page** (~20 min) — recovers every dead link into the site's funnel

### Tier 2 — Revenue unblock (30-60 min once Gumroad product exists)
5. **#2 Score-Watch unblock** — blocked on founder completing Gumroad product creation per `docs/SCORE_WATCH_GUMROAD_SETUP.md`, then flip the flag in `gumroad.ts` and add `score_watch_click` instrumentation at the new CTA points.

### Tier 3 — Operational hygiene (external service setup + config)
6. **#3 UptimeRobot + log rotation** — one form submission + one `/etc/docker/daemon.json` edit on the VPS.

### Tier 4 — Strategic structural work (1-3 days)
7. **#5 + #8** together as one work package: canonical types + shared scoring-lib. These address the dual-scale bug class at the root. One change-proposal formats → one shared module → one canonical type → one validator.
8. **#10** entity-page evidence block — unlocks the #1 UX journey gap (analyst visiting `/company/becton-dickinson` after a big move).
9. **#9** independence-policy code contract — brand integrity. Could be a unit test that asserts no index JSON field name overlaps with any `gumroad.ts` field name plus a schema-level separation.

### Tier 5 — Deferred / watchlist (audit-flagged but not urgent)
- Docker image registry push (GHCR tags with commit SHA) — roll-back path. Recommended but current risk is manageable.
- Responsive ranking-table collapse — real UX problem on mobile, but desktop is primary persona for this product at this stage.
- Agent registry cleanup (stale `competitive-researcher.md`, `meta-coordinator.md` with Ledgerium refs; typo `product-manger.md`).

---

## What's Working Well (do not disturb)

- **Next.js 16 compliance** — all dynamic routes use `params: Promise<{slug}>` + `await params`. No deprecated patterns.
- **`strict: true` in tsconfig** — discipline is enforced at the compiler.
- **Today's commit (c73cb52) integrity** — all 4 modified index files pass rank contiguity, composite range [0-100], and band validity.
- **Normalized `sectorTrends` dual-shape coercion** — cf2a00a fix is in place and working.
- **Manifest/file alignment** — all 10 manifest dates have corresponding daily JSONs.
- **Newsletter + contact-sales instrumentation** — fully wired end-to-end with `source` + `variant` + `service_interest` properties.
- **UTM convention** — clean, consistent, Umami-compatible.
- **Slug-based URLs** — rank reshuffling does not break any URL. Vermont rank 1 → 6 shipped cleanly.
- **Agent-driven research pipeline** — 10 consecutive nights with traceable artifacts.

---

## Recommended Decision for This Session

Per the improvement-loop rule (one item per loop), I recommend executing **Tier 1 as a single coordinated batch** because:
- Each item is XS effort (< 30 min)
- Each addresses a documented incident class
- All four can be shipped, validated, and deployed in one session with one commit
- The combined shield value covers ~70% of the near-term risk surface identified by all 6 audits

If you want to treat this as a strict one-item improvement loop, the selection is **#1 Schema validator + prebuild hook** (score 15, highest in the punch list).

Awaiting your selection.
