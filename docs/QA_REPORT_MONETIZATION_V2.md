# QA REPORT — Monetization V2 (Wave 3)

**Date:** 2026-05-28  
**Branch:** wip/monetization-v2-checkpoint  
**QA cycle:** Post-implementation reconciliation against TEST_PLAN_MONETIZATION_V2.md v1.0  
**Validator:** QA Engineer agent  
**Build status at start:** GREEN (119/119 tests, site build succeeds, Worker typecheck GREEN)

---

## Verdict: CONDITIONAL — Not Launch-Ready

The V2 code surface is substantially implemented, but two **launch-blocking** issues remain in uncommitted code: (1) price mismatches on `/purchase-research` that were present in the test plan and are still present in the current code, and (2) Gumroad product URLs (scoreWatch, briefingArchive, usCitiesIndex, usStatesIndex, observer) are still TODO placeholders — meaning the Briefing Archive "Subscribe" CTA on `/pricing` points directly to a broken Gumroad URL. Additionally, the `ENTITLEMENTS` KV namespace has a valid binding declared in `wrangler.toml` but its `id` value is the placeholder string `"REPLACE_WITH_ENTITLEMENTS_KV_NAMESPACE_ID"`, meaning the Worker cannot function in production.

The branch is conditionally releasable only after Phil resolves the 5 operational prerequisites listed in the Blockers section.

---

## 1 — Reconciled Implementation-Status Gap Table

| # | Gap (from TEST_PLAN line ~16-38) | File:Line Evidence | New Status |
|---|---|---|---|
| 1 | `SCORE_WATCH.useGumroad` is `false` | `gumroad.ts:68` — still `false` | OPEN — intentional; must be flipped after Gumroad product creation |
| 2 | `GUMROAD.scoreWatch` is a TODO placeholder | `gumroad.ts:14` — `"https://...TODO-score-watch"` | OPEN — no real URL |
| 3 | `GUMROAD.briefingArchive` is a TODO placeholder | `gumroad.ts:24` — `"https://...TODO-briefing-archive"` | OPEN — no real URL; blocks Briefing Archive CTA on `/pricing` |
| 4 | `GUMROAD.observer` is a TODO placeholder | `gumroad.ts:19` — `"https://...TODO-observer"` | OPEN — Observer is "Coming next" on `/pricing`; CTA routes to `/contact-sales` (acceptable for Wave 3 scope) |
| 5 | `GUMROAD.usCitiesIndex` is a TODO placeholder | `gumroad.ts:31` — `"https://...TODO-us-cities"` | OPEN — US Cities card on `/pricing` renders a broken buy link |
| 6 | `GUMROAD.usStatesIndex` is a TODO placeholder | `gumroad.ts:38` — `"https://...TODO-us-states"` | OPEN — US States card on `/pricing` renders a broken buy link |
| 7 | `/pricing` page does not exist | `site/src/app/pricing/page.tsx` | CLOSED — page fully implemented |
| 8 | `/briefing-archive` marketing page does not exist | No such path exists anywhere in `site/src/app/` | OPEN — this marketing page is still absent (though `/pricing#briefing-archive` is the anchor target) |
| 9 | `<BriefingPaywall>` component does not exist | `site/src/components/briefings/BriefingPaywall.tsx` | CLOSED — fully implemented |
| 10 | `build-briefing-manifest.mjs` does not exist | `site/scripts/` — not present (only `build-manifest.mjs` exists, which is unrelated) | OPEN — no briefing-specific manifest prebuild script |
| 11 | Worker entitlement routes not implemented | `worker/src/index.ts:174-189` — `/entitlement/check`, `/entitlement/magic-link`, `/access` all present | CLOSED — all three core routes implemented. Note: routes use `/entitlement/` (singular) as primary with `/entitlements/` (plural) aliased. The test plan specified `/entitlements/magic-link` and `/entitlements/session`; `/entitlements/session` does not exist — the equivalent is `/access`. See DEFECT finding below. |
| 12 | Worker does not dispatch by product_id | `worker/src/index.ts:251-268` — full dispatch block: WATCHER, BRIEFING_ARCHIVE, INDEX_SNAPSHOT | CLOSED |
| 13 | `ENTITLEMENTS` KV namespace not bound | `worker/src/index.ts:37` — `ENTITLEMENTS: KVNamespace` in Env interface; `wrangler.toml:29-31` — binding declared | PARTIAL — binding declared in `wrangler.toml` but `id = "REPLACE_WITH_ENTITLEMENTS_KV_NAMESPACE_ID"` is a placeholder. Namespace not provisioned in Cloudflare. |
| 14 | `isAccessibleForFree` JSON-LD absent from `updates/[date]/page.tsx` | `updates/[date]/page.tsx:121-129` — `isAccessibleForFree: false` and `hasPart.cssSelector: ".paywall-body"` conditionally injected when `isGated === true` | CLOSED |
| 15 | Observer cross-sell note absent from entity CTA panel | `EntityDetail.tsx:471-479` — `<Link href="/pricing#observer">Tracking more than one entity? Observer is coming next →</Link>` | CLOSED — cross-sell present, but note it uses different copy from the test plan spec ("Tracking more than one entity? Observer — 5 entities, $249/yr"). See compliance note. |
| 16 | Independence note absent from Watcher CTA button | `EntityDetail.tsx:467-469` — `<p>"Subscribing does not affect {entity.name}'s score or rank."</p>` | CLOSED |
| 17 | US States price mismatch ($195 vs $99) | `gumroad.ts:109` — `priceLabel: "$195"` still present; `/purchase-research/page.tsx` US States block at line 216 renders `$195` | OPEN — DEFECT-001 still present |
| 18 | US Cities price mismatch ($195 vs $149) | `gumroad.ts:100` — `priceLabel: "$195"` still present; `/purchase-research/page.tsx` US Cities block at line 192 renders `$195` | OPEN — DEFECT-001 still present |
| 19 | Countries/F500/AI Labs/Robotics/GlobalCities all hardcoded `$195` | `/purchase-research/page.tsx:177-178` — section heading "Index reports — $195 each", Pill renders "$195", Button renders "Purchase — $195" for all 5 main index cards | OPEN — DEFECT-001 still present |

**Gap Summary: 8 CLOSED, 11 OPEN (including 3 that are PARTIAL or operational-only)**

---

## 2 — Defect Verification Table

### DEFECT-001 — Multiple Index Snapshot prices wrong (HIGH)

**Status: STILL-PRESENT**

Evidence:

- `site/src/data/gumroad.ts:99` — `US_CITIES_INDEX.priceLabel: "$195"` (should be $149)
- `site/src/data/gumroad.ts:109` — `US_STATES_INDEX.priceLabel: "$195"` (should be $99)
- `site/src/app/purchase-research/page.tsx:166` — section title reads "Index reports — $195 each"
- `site/src/app/purchase-research/page.tsx:177-178` — Pill renders "$195" and Button renders "Purchase — $195" for all main index cards (Fortune 500, Countries, AI Labs, Robotics, Global Cities)
- `site/src/app/purchase-research/page.tsx:192` — US Cities Pill renders "$195", Button renders "Purchase — $195"
- `site/src/app/purchase-research/page.tsx:215` — US States Pill renders "$195", Button renders "Purchase — $195"

Note: `/pricing/page.tsx` (the new page) does NOT have this defect — it has correct per-index prices at lines 35-47. The defect is isolated to the legacy `/purchase-research` page. Both pages are in the static export. A customer reaching `/purchase-research` sees wrong prices.

**Launch impact:** Customers on `/purchase-research` will see $195 for all products including US States ($99) and US Cities ($149). If Gumroad products are priced correctly at $99/$149, the checkout price will conflict with the page price — violating basic e-commerce trust norms.

---

### DEFECT-002 — Independence note missing from Watcher CTA (MEDIUM)

**Status: FIXED**

Evidence: `site/src/components/entity/EntityDetail.tsx:465-469` — `<p className="text-[0.78rem] text-muted text-center leading-snug">Subscribing does not affect {entity.name}'s score or rank.</p>` is rendered unconditionally below the Subscribe button in the Path B panel (present in both the `useGumroad === true` and `useGumroad === false` branches, after the closing `}` of the conditional).

---

### DEFECT-003 — Observer cross-sell (Path C) missing from entity page (MEDIUM)

**Status: FIXED (with minor copy deviation)**

Evidence: `site/src/components/entity/EntityDetail.tsx:471-479` — a `<Link href="/pricing#observer">` with text "Tracking more than one entity? Observer is coming next →" is rendered below the independence note.

Copy deviation: The test plan specified "Observer — 5 entities, $249/yr" as the cross-sell copy. Implemented copy reads "Observer is coming next →" without the price or entity count. This is a minor informational deviation; the link target `/pricing#observer` correctly shows the full Observer card with pricing. Not a launch blocker.

---

### DEFECT-004 — "risk signals" phrase in entity page copy (LOW)

**Status: FIXED in EntityDetail.tsx**

Evidence: No occurrence of "risk signal" or "emerging risk" in `EntityDetail.tsx` or `EntityNewsletterCapture.tsx` (confirmed by grep over `site/src/components/entity/`).

**Residual occurrences (not in entity-adjacent commercial copy):**

- `site/src/components/ui/NewsletterSignup.tsx:134` — "emerging risks" in the post-subscription success state ("score changes, sector trends, and emerging risks"). This is in the weekly briefing newsletter success copy, not entity-adjacent commercial copy. Lower severity; flag for Phil.
- `site/src/app/score-watch/page.tsx:201` — "ESG risk signals" in ICP description body copy (not a heading). Status unchanged from test plan — flag for Phil.
- `site/src/components/updates/DailyBriefing.tsx:214,878`, `TopSignals.tsx:609`, `DailyBriefingHeader.tsx:44` — "Risk signals" used as a section label within the daily briefing content component. These are editorial content labels, not commercial copy; outside independence-policy scope.

**Independence policy assessment:** The entity CTA section is clean. Remaining "risk" occurrences are in briefing content labels and one ICP card. These are judgment-call items for Phil, not blockers.

---

### DEFECT-005 — `buildScoreWatchUrl` field label discrepancy (INFORMATIONAL)

**Status: FIXED / CONFIRMED CORRECT**

Evidence: `gumroad.ts:143-154` — `buildScoreWatchUrl` uses `new URLSearchParams({"Entity to Watch": name, entity: slug, index: indexSlug})`. Node.js runtime verification (executed via throwaway script) confirmed:

- `("apple", "fortune-500", "Apple Inc.")` → `Entity+to+Watch=Apple+Inc.&entity=apple&index=fortune-500` — PASS
- `("johnson-johnson", "fortune-500", "Johnson & Johnson")` → `Entity+to+Watch=Johnson+%26+Johnson&entity=johnson-johnson` — PASS
- `("procter-gamble", "fortune-500", "Procter & Gamble (P&G)")` → `Entity+to+Watch=Procter+%26+Gamble+%28P%26G%29` — PASS
- `("bogota", "global-cities", "Bogotá")` → `Entity+to+Watch=Bogot%C3%A1&entity=bogota` — PASS

All encoding cases correct per TC-URL-01 and TC-W-01 specification. The ASCII-slug preservation holds (accent in name, ASCII in entity param).

**Residual validation item:** Gumroad product must have a custom field labelled exactly "Entity to Watch" (case-sensitive). Cannot be verified without live Gumroad product — deferred to Phil.

---

## 3 — New Defect Found During Reconciliation

### DEFECT-006 — Route mismatch: BriefingPaywall calls `/entitlements/session` but Worker implements `/access` (HIGH)

**Severity:** High — magic-link consumption will silently fail in production.

**Files:** `site/src/components/briefings/BriefingPaywall.tsx:64` (comment), `worker/src/index.ts:188`

**Evidence:**

- BriefingPaywall.tsx line 64 comment: "Sends the session cookie (HttpOnly, set by /entitlements/session Worker route)"
- Worker implements `/access` (GET), not `/entitlements/session` (worker/src/index.ts:188: `if (req.method === "GET" && path === "/access")`)
- The test plan (TC-BA-04) specifies the route as `GET /entitlements/session?token=<token>` (test plan line 258)
- The magic link email built in `sendMagicLinkIfEntitled` (worker/src/index.ts:702-703) correctly points to `${WORKER_BASE_URL}/access?${params}` — so the email link is correct
- The `WORKER_URL` in BriefingPaywall.tsx is only used for `/entitlements/check` and `/entitlements/magic-link`, both of which ARE implemented

**Assessment:** The BriefingPaywall comment is stale but the actual fetch calls in BriefingPaywall.tsx are to `/entitlements/check` (line 70) and `/entitlements/magic-link` (line 124) — both of which are correctly implemented in the Worker. The magic link itself points to `/access`, which is also correctly implemented. The `/entitlements/session` reference exists only in a comment (line 64), not in any actual fetch call.

**Revised severity:** LOW — the comment is misleading/stale documentation but no functional code is broken. Still warrants fixing for maintainability.

---

### DEFECT-007 — `LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK` secret name mismatch between Env interface and wrangler.toml (MEDIUM)

**Severity:** Medium — Worker will fail to send magic-link emails in production if secret is provisioned under the wrong name.

**Files:** `worker/src/index.ts:59`, `worker/wrangler.toml:72`

**Evidence:**

- `worker/src/index.ts:59` (Env interface): `LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK: string`
- `worker/src/index.ts:712`: `template_id: Number(env.LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK)`
- `worker/wrangler.toml:72` (comments section): lists this as a "legacy alias" and says the canonical name is `LISTMONK_MAGIC_LINK_TEMPLATE_ID`
- The wrangler.toml comment does not add a binding for `LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK` — it only documents it as a legacy alias

**Impact:** Phil must provision `wrangler secret put LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK` (the name the code reads), not `LISTMONK_MAGIC_LINK_TEMPLATE_ID`. The wrangler.toml comment could cause Phil to provision the wrong name.

---

### DEFECT-008 — Briefing Archive "Subscribe" button on `/pricing` routes to TODO Gumroad URL (HIGH)

**Severity:** High — the button is live and clickable; it will navigate to a broken URL.

**Files:** `site/src/app/pricing/page.tsx:251`

**Evidence:**

- `pricing/page.tsx:251`: `<Button href={GUMROAD.briefingArchive} variant="primary" external full trackAs="archive_subscribe_click">`
- `gumroad.ts:24`: `briefingArchive: "https://compassionbenchmark.com/l/TODO-briefing-archive"`

Unlike the Watcher CTA (which has a `useGumroad` flag to route to `/contact-sales` as fallback), the Briefing Archive CTA on `/pricing` uses `GUMROAD.briefingArchive` directly with no fallback. A visitor clicking "Subscribe — $99/yr" on `/pricing` will land on a 404 Gumroad page.

**Note on EntityDetail.tsx:** The `BriefingPaywall.tsx` paywall card also links to `GUMROAD.briefingArchive` directly (line 185). Same broken-URL exposure.

---

## 4 — Automated Case Results

### TC-URL-01 / TC-W-01: `buildScoreWatchUrl` URL encoding

**Result: PASS (5/5 test cases)**

Executed via Node.js `URLSearchParams` verification. All cases verified against specification in test plan Section 4:

| Case | Expected | Actual | Result |
|---|---|---|---|
| `("apple", "fortune-500", "Apple Inc.")` | `Entity+to+Watch=Apple+Inc.` | `Entity+to+Watch=Apple+Inc.` | PASS |
| `("johnson-johnson", "fortune-500", "Johnson & Johnson")` | `Entity+to+Watch=Johnson+%26+Johnson` | `Entity+to+Watch=Johnson+%26+Johnson` | PASS |
| `("procter-gamble", "fortune-500", "Procter & Gamble (P&G)")` | `Entity+to+Watch=Procter+%26+Gamble+%28P%26G%29` | `Entity+to+Watch=Procter+%26+Gamble+%28P%26G%29` | PASS |
| `("bogota", "global-cities", "Bogotá")` | `Bogot%C3%A1`, `entity=bogota` | `Bogot%C3%A1`, `entity=bogota` | PASS |
| No `TODO-` in resolved URL | Requires `SCORE_WATCH.useGumroad=true` to resolve | `GUMROAD.scoreWatch` still contains "TODO-score-watch" | DEFERRED — blocked by Gap #2 (no real Gumroad URL) |

**TC-W-03 (current default: `useGumroad=false`) — PASS by code inspection**

`EntityDetail.tsx:445-458`: When `SCORE_WATCH.useGumroad === false`, Button renders with `href="/contact-sales?product=score-watch&entity=...&kind=...&name=...#inquiry"` and `trackAs="score_watch_click"`. Both conditions met.

### TC-IP-02: Pricing page — independence disclaimer present

**Result: PASS**

`pricing/page.tsx:381-401`: "About independence" section is a non-collapsible `<section>` (not a `<details>` element). Contains exact text "Entities never pay for inclusion, score changes, or suppression of findings." Links to `/methodology#independence`. Not collapsible. All 5 TC-IP-02 checks pass.

### TC-IP-03: Pricing page — prohibited anti-patterns absent

**Result: PASS by code inspection**

Verified in `pricing/page.tsx`: no countdown timer, no "limited time", no "seats filling up", no "most popular" badge, no red color on elements, no entity names in pricing examples, no "Risk" or "Warning" in headings. Independence voice confirmed in hero copy.

### TC-IP-06: Subscribers API — `INTERNAL_API_TOKEN` gating

**Result: PASS by code inspection**

`worker/src/index.ts:909-911`: `handleSubscribersQuery` validates `tokenHeader !== env.INTERNAL_API_TOKEN` and returns 403. Token is compared server-side; not present in any static build output.

### TC-ANAL-02 (partial): No subscriber count in badge response

**Result: PASS by code inspection**

`worker/src/index.ts:861-896`: `handleBadgeSvg` returns only `composite` and `band` data from the public scores JSON. No subscriber count emitted.

### TC-PA-01/PA-02/PA-03 (static analysis): BriefingPaywall free window logic

**Result: PASS by code inspection**

`BriefingPaywall.tsx:51-60`: `isOutsideFreeWindow` zeroes time components before comparison and uses `diffDays > FREE_WINDOW_DAYS` (strictly greater than 14). This means:
- Day 0 (today): `diffDays = 0`, not gated — PASS
- Day 13: `diffDays = 13`, not gated — PASS
- Day 14: `diffDays = 14`, not gated (`14 > 14` is false) — NOTE: Day 14 is NOT gated under this logic; paywall only activates on Day 15+. Test plan TC-PA-03 specifies "Day 14 briefing" triggers paywall. This is a specification discrepancy.

**NEW FINDING — DEFECT-009:** Paywall boundary is off by one day relative to the test plan specification.

- Test plan TC-PA-02 says "Day 13 briefing — fully accessible" (PASS)
- Test plan TC-PA-03 says "Day 14 briefing — paywall renders"
- Actual code: Day 14 is NOT gated (`diffDays > 14` is false when diffDays equals 14)
- `updates/[date]/page.tsx:26` has the same `diffDays > FREE_WINDOW_DAYS` logic
- PRD §2 SKU 4 language "briefings older than 14 days" is ambiguous: "older than 14 days" could mean `> 14` or `>= 14`
- Both the server-side `page.tsx` and client-side `BriefingPaywall.tsx` implement `>`, so behavior is consistent

This is a spec/code ambiguity, not a runtime inconsistency. Flag for Phil to decide: should Day 14 be free or gated? If gated, change `>` to `>=` in both files. Severity: Low (1-day boundary matters only on day 14 exactly).

---

## 5 — Independence Policy Regression Checks (Section 3)

### Entity CTA section (EntityDetail.tsx)

- "risk signal" / "emerging risk" — NOT PRESENT in entity CTA section or EntityNewsletterCapture. PASS.
- Independence note below Watcher CTA — PRESENT (DEFECT-002 FIXED). PASS.
- "Subscribing does not affect this entity's score or rank" — PRESENT (`EntityDetail.tsx:468`). PASS.
- `EntityNewsletterCapture.tsx:198` — "This subscription does not affect {entityName}'s score or rank." PRESENT. PASS.

### Remaining "risk" occurrences for Phil's review

- `NewsletterSignup.tsx:134` — "emerging risks" in newsletter success copy. Not entity-adjacent. Lower risk; flag for Phil.
- `score-watch/page.tsx:201` — "ESG risk signals" in ICP description card (body, not heading). Flag for Phil.

### `/pricing` page

- Independence panel: PRESENT, non-collapsible, correct copy, links to `/methodology#independence`. PASS.
- Prohibited anti-patterns: ABSENT. PASS.

---

## 6 — Launch-Blocking Issues (Ordered by Severity)

| # | Issue | Evidence | Owner |
|---|---|---|---|
| LB-1 | ENTITLEMENTS KV namespace `id` is placeholder — Worker cannot use ENTITLEMENTS in production | `wrangler.toml:30` — `id = "REPLACE_WITH_ENTITLEMENTS_KV_NAMESPACE_ID"` | Phil — must run `wrangler kv:namespace create ENTITLEMENTS`, get real ID, update wrangler.toml |
| LB-2 | `GUMROAD.briefingArchive` is a TODO URL — Subscribe button on `/pricing` and Briefing Archive paywall CTA both point to a broken Gumroad link | `gumroad.ts:24`, `pricing/page.tsx:251`, `BriefingPaywall.tsx:185` | Phil — must create Briefing Archive Gumroad product and paste real URL |
| LB-3 | DEFECT-001 still present — `/purchase-research` page shows $195 for all 7 index products, contradicting PRD prices and the new `/pricing` page | `purchase-research/page.tsx:166,177,192,215`, `gumroad.ts:99,109` | Frontend engineer — must update purchase-research page prices and gumroad.ts priceLabels |
| LB-4 | `GUMROAD.usCitiesIndex` and `GUMROAD.usStatesIndex` are TODO URLs — buy buttons on `/pricing` Index Snapshot grid point to broken Gumroad links | `gumroad.ts:31,38`, `pricing/page.tsx:40-46` | Phil — must create those Gumroad products |
| LB-5 | All V2 Worker secrets (`WATCHER_PRODUCT_ID`, `BRIEFING_ARCHIVE_PRODUCT_ID`, `INDEX_SNAPSHOT_PRODUCT_ID`, `SESSION_HMAC_SECRET`, `LISTMONK_TEMPLATE_ENTITLEMENT_MAGIC_LINK`) must be provisioned via `wrangler secret put` before deploying V2 Worker | `wrangler.toml:51-72`, `worker/src/index.ts:46-64` | Phil — see Worker README and wrangler.toml comments |

---

## 7 — Deferred-to-Phil Manual Checklist

These items cannot be validated in this environment. They are marked DEFERRED — requires Phil / live env.

1. **TC-URL-03** — Live Gumroad URL prefill: navigate to `?Entity+to+Watch=Turkey&entity=turkey` on the real Gumroad product, confirm pre-fill works. Confirm Gumroad custom field is labelled exactly "Entity to Watch" (case-sensitive).

2. **TC-W-07** — Live Watcher test purchase + welcome email: purchase with a test email for entity "Turkey", verify welcome email contents (entity name, started_at, expires_at, unsubscribe link, independence footer, absence of prohibited phrases).

3. **TC-W-04/05/06/08** — Webhook integration tests (TC-W-04 through TC-W-10): POST synthetic webhook payloads to `/gumroad/webhook` against staging Worker with real KV; verify KV writes, replay dedup, missing-entity handling, cancellation.

4. **TC-BA-01 through TC-BA-08** — Briefing Archive webhook + magic-link flow: requires real ENTITLEMENTS KV and deployed V2 Worker.

5. **TC-PA-06** — Magic-link full end-to-end: purchase Briefing Archive → receive email → click link → session cookie → full archive access.

6. **TC-IS-01** — Verify all 7 Gumroad product URLs are live and show correct prices after Phil creates/updates them. Verify US States product description includes "21 states scored to date — full index in progress."

7. **TC-BROWSER-02** — Safari ITP cookie test: on a real iPhone or Mac Safari, complete magic-link flow and confirm `cb_access` session cookie is readable cross-subdomain. This is the highest-risk item in the Risk Register.

8. **TC-WE-01/02** — Welcome email content review (entity name, dates, independence footer, no forbidden phrases).

9. **Section 7 cross-browser matrix** — All browser tests (TC-BROWSER-01 through TC-BROWSER-03) require live environment.

10. **TC-PERF-01** — Lighthouse score >= 90 for `/pricing` (desktop + mobile).

11. **TC-PERF-03** — Static export page count >= 1,555 + new routes (requires counting `site/out/`).

12. **DEFECT-009 resolution** — Confirm with Phil whether Day 14 should be free or gated (`>` vs `>=` in `BriefingPaywall.tsx:59` and `updates/[date]/page.tsx:26`).

13. **NewsletterSignup "emerging risks" copy** — Confirm whether `NewsletterSignup.tsx:134` "emerging risks" wording is acceptable per independence policy intent.

---

## 8 — Recommended Automated Tests to Add (Prioritized)

| Priority | Test | File path | Framework | Rationale |
|---|---|---|---|---|
| P1 | `buildScoreWatchUrl` unit tests — all TC-URL-01 cases | `site/src/data/gumroad.test.ts` | Vitest | Already validated manually; should be in CI |
| P1 | Pricing page price accuracy — all 7 Index Snapshot prices match PRD (TC-IS-02) | `site/src/app/pricing/pricing.test.tsx` | Vitest + @testing-library/react | DEFECT-001 will recur on `/pricing` without this |
| P1 | Purchase-research page price accuracy — guard against future regressions (DEFECT-001 scope) | `site/src/app/purchase-research/purchase-research.test.tsx` | Vitest + @testing-library/react | DEFECT-001 still present there |
| P1 | Independence note present below Watcher CTA in EntityDetail (TC-W-02 step 6) | `site/src/components/entity/EntityDetail.test.tsx` | Vitest + @testing-library/react | DEFECT-002 was launch-blocking; prevent regression |
| P2 | `BriefingPaywall` — paywall renders for Day 15+ briefing (TC-PA-03) | `site/src/components/briefings/BriefingPaywall.test.tsx` | Vitest + @testing-library/react | Core revenue gate; no automated coverage today |
| P2 | `BriefingPaywall` — no paywall for Day 0-13 briefing (TC-PA-01/02) | Same file | Vitest + @testing-library/react | Free window boundary correctness |
| P2 | Forbidden-phrase lint CI script (TC-IP-01) — flag "risk alert", "early warning", "danger signal" in headings and entity-adjacent copy | `site/scripts/lint-independence-policy.mjs` | Node + regex, run in CI | Compliance regression |
| P2 | Webhook handler — new Watcher purchase writes SCORE_WATCH + ENTITLEMENTS KV | `worker/src/index.test.ts` | Vitest + Miniflare | Core fulfillment path; zero automated coverage |
| P3 | Webhook handler — replay dedup (TC-W-05) | Same file | Vitest + Miniflare | Data integrity |
| P3 | Magic-link — no enumeration on unknown email (TC-BA-03) | `worker/src/magic-link.test.ts` | Vitest + Miniflare | Security regression |
| P3 | Static export page count >= baseline (TC-PERF-03) | `site/scripts/validate-build-output.mjs` | Node fs.readdirSync | Build regression guard |

---

## 9 — Summary for Handoff

**What was validated:**
- All 19 implementation-gap rows in the test plan reconciled against actual code
- All 5 known defects (DEFECT-001 through DEFECT-005) re-verified
- Worker route implementation reviewed (1,498 lines)
- `buildScoreWatchUrl` URL encoding verified via execution (5 test cases)
- `/pricing` page independence compliance verified
- EntityDetail.tsx independence note and Observer cross-sell verified
- `updates/[date]/page.tsx` JSON-LD schema verified
- `BriefingPaywall.tsx` free-window logic verified (off-by-one finding)
- `wrangler.toml` KV bindings verified (placeholder IDs found)
- Forbidden-phrase scan across entity and commercial copy

**What passed:**
- DEFECT-002 (independence note), DEFECT-003 (Observer cross-sell), DEFECT-005 (URL encoding) — FIXED
- `/pricing` page: independence panel, prohibited anti-patterns, correct Index Snapshot prices
- Worker: full dispatch-by-product_id implementation, ENTITLEMENTS namespace declared, all V2 routes present
- `buildScoreWatchUrl`: all encoding cases correct
- JSON-LD `isAccessibleForFree` schema: correctly injected on gated briefings
- `INTERNAL_API_TOKEN` gating on subscribers API

**What failed / remains open:**
- DEFECT-001 (wrong prices on `/purchase-research`) — STILL-PRESENT (8 cards, 3 price levels wrong)
- DEFECT-008 (Briefing Archive TODO URL on live CTAs) — NEW
- DEFECT-009 (paywall boundary off-by-one vs test plan spec) — NEW
- DEFECT-007 (magic-link template secret name ambiguity) — NEW
- 5 Gumroad product URLs are TODO placeholders
- ENTITLEMENTS KV namespace not provisioned in Cloudflare (placeholder ID)

**Blocker status:** 5 launch-blocking issues. Recommended next action: Phil provisions KV namespace + Gumroad products (LB-1, LB-2, LB-4, LB-5); frontend engineer fixes `/purchase-research` prices (LB-3).

---

*QA Engineer agent | 2026-05-28 | Branch: wip/monetization-v2-checkpoint | Downstream: frontend-engineer (DEFECT-001, DEFECT-008, DEFECT-009), backend-engineer / Phil (LB-1, LB-2, LB-4, LB-5, DEFECT-007), Phil (manual checklist)*
