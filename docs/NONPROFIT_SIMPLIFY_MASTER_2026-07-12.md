# Nonprofit Simplification — Master Backlog (Consolidated)

**Date:** 2026-07-12 · **Owner:** Coordinator · **Status:** Proposal for founder review — NO code changed.
**Inputs:** four parallel lens reviews —
- `docs/NONPROFIT_SIMPLIFY_PM_2026-07-12.md` (product/scope)
- `docs/NONPROFIT_SIMPLIFY_ARCH_2026-07-12.md` (architecture/infra)
- `docs/NONPROFIT_SIMPLIFY_UX_2026-07-12.md` (navigation/IA)
- `docs/NONPROFIT_SIMPLIFY_FRONTEND_2026-07-12.md` (code hygiene)

---

## 1. Executive summary

All four lenses converged on the same thesis: **the commercial plane can be deleted, not migrated.** The
site was built for a $10k-MRR solo-founder direct-sales motion; a nonprofit optimizes for the opposite —
maximum public trust + citation reach per unit of maintenance. The mission core (deterministic research
pipeline, 8 indexes, methodology, daily briefing, independence policy) is untouched by every proposal here.

**By the numbers (evidence-backed):**
- **~10 commercial routes + 2 licensed products + ~4,300 LOC** are cut/merge candidates.
- The monetization layer (`gumroad.ts`) has a **17-file blast radius**; the Cloudflare Worker is self-declared
  "purely commercial-plane infrastructure" with **no write path to scores** (safe to retire by construction).
- The VPS/Docker/Nginx/Certbot chain is **pure overhead** for a static `output:"export"` site and is the
  source of this week's deploy incidents.

**One live bug surfaced (fix regardless of the nonprofit decision):** the index-registry duplication
(11 hand-maintained copies) has already broken site search — `EntitySearch.tsx`, `NavbarSearch.tsx`, and the
drift-prevention test `test-entity-href.mjs` all still list **7 indexes, missing Universities** (live since
2026-06-19). ~100 universities are unsearchable; `npm run test` passes green while the bug is live.

---

## 2. The ONE decision that gates everything (founder, Phase 0)

Every commercial-removal item hinges on a single question the reviewers all independently raised:

> **Does the nonprofit go fully free/donation-only, or retain a reduced, firewalled earned-income line?**

Sub-questions to answer before Phase 2:
1. **501(c)(3)/fiscal-sponsor status** — determines whether `/supporters` can say "tax-deductible / donate."
2. **Funding runway** — Score-Watch ($79/yr) and Gumroad report sales are the only SKUs with live sales
   history. Cut immediately, or sunset on a timer (honor existing subscribers, stop new sales)?
3. **Keep free Score-Watch alerts?** — gates whether the Worker is fully retired (P-INFRA-1) or the alert
   pipeline is repointed to Listmonk directly.
4. **Existing paying customers** (Advisory / Certified Assessment / Enterprise / Data License / Score-Watch) —
   need a grandfather/refund/transition plan.

**Everything in Phase 1 below is independent of this decision and can start immediately.**

---

## 3. Consolidated ranked backlog

Priority Score = Impact + Strategic Alignment + Confidence − Effort − Risk (higher = do sooner).
"Lenses" shows cross-lens agreement (higher = more corroborated).

### PHASE 1 — Foundational quick wins (NO product decision needed — recommend starting now)

| ID | Item | Lenses | Impact | Effort | Risk | Why first |
|----|------|--------|:------:|:------:|:----:|-----------|
| **S1** | ✅ **DONE (92430e70, 2026-07-12)** — Consolidated the 11 index-registry copies into one typed `indexRegistry.ts`; fixed the live universities-unsearchable bug + the drifted test | Arch P1, FE #1 | 5 | 3 | 2 | Shipped: fail-loud module-load invariant prevents re-drift; tsc/validate-indexes/test(40/40)/build(1924) all pass; "Harvard" search resolves. |
| **S2** | **Fix the `/supporters` dead-end** — `SUPPORTER.useGumroad:false` + `TODO` URL make the donate CTA route to `/contact-sales`. Make checkout actually work. | PM #7, UX Q2, FE #6 | 5 | 2 | 1 | The nonprofit's future primary CTA is currently broken. Must be live *before* "Support" replaces "Contact Sales." |
| **S3** | **Delete dead Gumroad plumbing** — 3+ SKUs are literal `TODO-*` placeholders that never shipped (US Cities/States/Universities index reports, API Access) | PM #3, Arch P4, FE #6 | 3 | 2 | 1 | Trivial, independent; removes mixed-message dead storefronts. |
| **S4** | **Type the data-import layer** via the existing `IndexFileSchema` (depends on S1) | Arch P8, FE #7 | 3 | 2 | 2 | Fail-loud parity across all readers; removes ad-hoc `as {...}` casts. |
| **S5** | **Terminology: commit to "Daily Briefing"** everywhere (nav says "Updates", page says "Daily Briefing", archive says "Archive") | UX #8 | 2 | 1 | 1 | Nonprofit's most-cited asset deserves one stable name. Copy-only. |
| **S6** | **Pagefind exclusion consistency** — add `pricing` to `EXCLUDED_PAGE_NAMES` (or moot once pages deleted) | FE #8 | 2 | 1 | 1 | One-line self-contained fix. |

### PHASE 2 — Commercial-plane removal (NEEDS the Phase-0 decision)

| ID | Item | Lenses | Impact | Effort | Risk | Notes |
|----|------|--------|:------:|:------:|:----:|-------|
| **S7** | **Retire Certified Assessments entirely** — the only product taking money from a scored entity; highest independence risk (own REVENUE_MODEL.md §5.7 flags it) | PM #1, UX #1 | 5 | 2 | 2 | **P0 within Phase 2.** A 990-filing nonprofit selling "assessments" to entities it scores is the easiest attack on independence. Re-point the SelfAssessment CTA away from it. |
| **S8** | **Collapse the 7-page sales funnel → one page** (`/pricing`, `/services`, `/contact-sales`, `/enterprise`, `/data-licenses`, `/advisory`, `/assess-your-organization` → `/support` or `/about`) + retire `ResearchConfigurator`/`SalesInquiryForm` | PM #2, Arch P5, UX #1/#2/#4, FE #2 | 5 | 4 | 3 | ~2,900 LOC. Ship 301 redirects with it. Relocate the independence statement (lives on `/services`+`/pricing` today) to `/about`+`/methodology`. |
| **S9** | **Retire/replace `gumroad.ts` + the purchase layer** (17 importers; deepest = `KIND_CONFIG` per-entity CTA on ~1,256 pages) → single `DONATE_URL` | PM #3, Arch P4, UX #3, FE #3 | 5 | 4 | 4 | Highest blast radius. `grep -rn "gumroad" site/src` → 0 hits is the "done" signal. **Preserve** `BadgeEmbedWidget` (free, not commercial). |
| **S10** | **Decide Score-Watch: free alert vs retire** (the one genuinely live paid SKU) | PM #4, Arch P3, UX #3 | 4 | 3 | 3 | If kept free → repoint `send-alerts.mjs` to Listmonk directly (path already exists), preserve read-only independence + `alert-deliveries/` audit. Gates P-INFRA-1. |
| **S11** | **Retire AI Evaluation Suite + Prompting Suite for Humans** as licensed products (fold trimmed content into `/methodology` or delete) | PM #5, UX #9, FE #4 | 3 | 2 | 2 | 677 LOC; off-mission; hand-synced prompt libraries = duplicate-content debt. |
| **S12** | **Consolidate the 3 "get assessed" entry points** → keep only free `/self-assessment`; retire `/assess-your-organization` | UX #6, FE #5 | 3 | 2 | 2 | `/assess-your-organization` is a pure sales funnel with no informational content of its own. |

### PHASE 3 — Deploy/infra simplification (after Phase-0 alert decision)

| ID | Item | Lenses | Impact | Effort | Risk | Notes |
|----|------|--------|:------:|:------:|:----:|-------|
| **S13** | **Retire the Cloudflare Worker** (Gumroad webhook, KV subscribers, badge endpoint → static SVGs) | Arch P2 | 5 | 4 | 3 | Neutral to integrity by construction. Do S10 first if alerts are kept. Keep same `/badge/<slug>.svg` URLs if any external embeds exist. |
| **S14** | **Retire VPS/Docker/Nginx/Certbot → managed static host** (Cloudflare Pages/Netlify, Git-push deploy, auto-TLS) | Arch P6 | 5 | 4 | 3 | Kills the deploy fragility behind this week's "not live" incident. **Prereqs:** resolve Umami `/u` proxy replacement + where the nightly pipeline runner lives. Build gates run in CI. Keep VPS as warm rollback one cycle. |
| **S15** | **Single-branch deploy discipline** — make `main` the only deploy source, retire long-lived `page-improvements-*`, nightly commits via CI token not VPS SSH (depends on S14) | Arch P7 | 4 | 2 | 2 | Directly addresses the parallel-history divergence that caused real incidents this month. |

---

## 4. MUST PRESERVE (guardrails — no simplification may weaken these)

- **Deterministic research pipeline** (scanner → assessor → digest) with **human-in-the-loop score approval**;
  no autonomous score writes.
- **The three build gates**: `validate-indexes`, `validate-daily-briefings`, `lint-daily-briefings` — remain a
  hard deploy prerequisite (run in CI under managed hosting).
- **Module-load zod fail-loud parse** (`entities.ts` `parseIndex`/`IndexFileSchema`) — registry consolidation
  must keep this, not replace with silent casts.
- **Independence separation** — alert pipeline is read-only, cannot write scores/proposals/assessments.
- **All evidence & audit trails** — `research/assessments/`, `change-proposals/`, `alert-deliveries/`,
  `integrity-reports/`, `evidence-reviews/`, daily-briefing archive.
- **The independence policy statement** — must appear at least as prominently after transition (relocate, never
  delete, when `/services`+`/pricing` go). The `/supporters` "two independent technical planes" sentence is the
  strongest independence assurance on the site — reuse it wherever a donate CTA appears.
- **All 8 indexes + entity/history pages, `/methodology`, `/updates` + feeds, `/self-assessment`,
  `/media` citation, `BadgeEmbedWidget`, entity search, weekly `integrity-check`.**

---

## 5. Recommended sequencing

```
Phase 0 (founder decision, no code) ── gates Phase 2 & 3
   └─ free/donation-only vs. reduced earned income? + 501c3 status + runway + customers

Phase 1 (start now, independent):  S1 → S4,  S2, S3, S5, S6
   (S1 fixes the live search bug and unblocks everything that touches indexes/pages)

Phase 2 (after Phase 0):  S7 (independence P0) → S8 → S9 → {S10, S11, S12}
   (ship 301 redirects with S8; relocate independence statement; preserve BadgeEmbedWidget)

Phase 3 (after Phase 0 alert decision):  S10 → S13 → S14 → S15
   (S14 prereqs: Umami hosting + pipeline runner resolved)
```

**Dependency map:** S4→S1 · S8→S1,S3 · S9→S1 · S13→S10(if alerts kept) · S15→S14.
S1, S2, S3 have no upstream deps and unblock the most downstream work — **begin there.**

---

## 6. Implementation discipline

Per the improvement-loop rules: **implement ONE item per loop, validate, then stop.** No item here is
approved for implementation yet — this is a decision artifact. When the founder approves specific items,
each ships as its own validated change (tsc clean · `validate-indexes` unchanged pass count · build page-count
drops by exactly the deleted-route count · `grep gumroad` → 0 as the S9 done-signal · manual search-"Harvard"
smoke test as the S1 done-signal).

*Consolidated from four independent specialist reviews, 2026-07-12.*
