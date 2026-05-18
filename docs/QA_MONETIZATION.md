# QA Report — Monetization Build (Score-Watch End-to-End + Monetization Expansion)

**QA Date:** 2026-05-18  
**Build:** e17ccd7 (main, dirty)  
**Validated by:** QA Engineer agent  
**Recommendation:** CONDITIONAL PASS — launch-blocked on 3 items, pre-launch-blocked on 4 items

---

## Overall Verdict

The frontend build is clean and the static export is correct. Core Score-Watch CTA routing, gating logic, and fallback paths work correctly in code. The independence topology is structurally sound. However, three issues must be fixed before this build is committed for deploy:

1. **BadgeEmbedWidget generates broken entity URLs** (wrong URL path segment)
2. **Welcome email's unsubscribe URL in the Worker contains an unresolved Listmonk template placeholder** (`{{ .Data.unsubscribe_token }}`) — the token is never supplied in the tx data, so every welcome email unsubscribe link is broken
3. **Integrity-check Check 3 is a false positive** — but it flags `send-alerts.mjs` for referencing protected paths in comment text, not live reads. The check regexp needs adjustment so it doesn't alert on comment-only references

---

## 1. Build Status

**Result: PASS — 0 errors, 129 warnings (all pre-existing band-boundary class)**

```
Validation: 12,749 checks passed, 0 errors, 129 warnings
Next.js build: ✓ Compiled successfully in 6.2s
TypeScript: Finished with 0 errors
Static pages: 1,223 generated
```

**New warnings vs baseline:** 18 cross-index slug collision WARNs from `export-public-data.mjs` are new but expected (documented in the architecture). These are not build errors — they are operational observations.

Prebuild (`export-public-data.mjs`) runs successfully on this checkout and produces 1,156 entity score JSON files plus `site/public/data/index.json`.

---

## 2. Acceptance Criteria Walkthrough

### PRD §3 Story P0-A.1 — Investor subscribes from entity page

| AC | Status | Evidence |
|---|---|---|
| Entity detail page CTA button links to Gumroad with entity slug pre-populated | [CONDITIONAL] | `EntityDetail.tsx` line 429–453: when `SCORE_WATCH.useGumroad === true`, calls `buildScoreWatchUrl(entity.slug, KIND_CONFIG[entity.kind].indexSlug, entity.name)` which appends `?entity=&index=&name=`. Correct. When `useGumroad === false`, routes to `/contact-sales` with slug/kind/name params. Both paths work. |
| Checkout completes and produces a Gumroad order record | [CANNOT VERIFY] | Requires live Gumroad product (not yet created). |
| Welcome email arrives within 15 minutes of purchase | [CANNOT VERIFY] | Requires deployed Worker + Listmonk. |
| Welcome email names the entity I purchased a watch for | [VERIFIED IN TEMPLATE] | `score-watch-welcome.md` passes `entity_name` field; subject is `Score-Watch active: {{ .Data.entity_name }}`. Field supplied by `syncListmonk()` in `worker/src/index.ts` line 549. |
| Welcome email states the watch expiry date | [VERIFIED IN TEMPLATE] | `expires_at` field passed at `worker/src/index.ts` line 554. Template renders it in meta-grid. |

### PRD §3 Story P0-A.2 — Subscriber receives alert email when score changes

| AC | Status | Evidence |
|---|---|---|
| Alert email sent same calendar day as change proposal | [CANNOT VERIFY] | Requires live nightly run + deployed Worker + Listmonk. |
| Alert subject contains entity name and score delta | [VERIFIED IN TEMPLATE] | `score-watch-alert.md` subject: `Score change: {{ .Data.entity_name }} \| {{ .Data.old_score }} → {{ .Data.new_score }} ({{ .Data.delta_formatted }})` |
| Alert body includes old score, new score, delta, band change status, at least 1 evidence item, entity detail URL | [VERIFIED IN TEMPLATE] | All fields present in template. `buildAlertTemplateData()` in `send-alerts.mjs` populates all fields including `evidence_1/2/3`, `band_change`, `entity_detail_url`. |
| Alert email includes one-click unsubscribe link | [VERIFIED IN TEMPLATE] | `unsubscribe_url` rendered in both HTML and plaintext. Field built by `buildUnsubscribeUrl()` in `send-alerts.mjs` (HMAC-signed). |

### PRD §3 Story P0-A.3 — Subscriber cancels

| AC | Status | Evidence |
|---|---|---|
| Gumroad cancellation link present in every alert email and welcome email | [VERIFIED IN TEMPLATE] | Both templates render `{{ .Data.gumroad_manage_url }}` which resolves to `https://app.gumroad.com/library`. |
| After cancellation, no further alerts sent | [VERIFIED IN CODE] | `send-alerts.mjs` line 440–444: `if (subscriber.status === "refunded")` skip; `worker/src/index.ts` marks status `"cancelled"` on Gumroad cancellation webhook. `send-alerts.mjs` line 446: checks `expires_at` but does not re-check `status === 'cancelled'` as a skip condition. Per architecture, `cancelled` still receives alerts until `expires_at` — only `refunded` is immediately suppressed. This is correct per ARCHITECTURE §2.5. |
| Cancellation within 24 hours of Gumroad cancellation event | [CANNOT VERIFY] | Requires deployed Worker. Code path exists. |

### PRD §3 Story P0-A.4 — Visitor on /score-watch subscribes without sales conversation

| AC | Status | Evidence |
|---|---|---|
| Hero Subscribe button does NOT route to contact-sales when useGumroad is true | [VERIFIED] | `score-watch/page.tsx` line 35–37: `heroCta` resolves to `/indexes#pick-entity-to-watch` when `useGumroad === true`. Currently `useGumroad === false` so it routes to `/contact-sales` — this is correct pre-launch behavior. |
| Clicking Subscribe from /score-watch routes to entity browser with visible prompt | [VERIFIED] | `/indexes#pick-entity-to-watch` is the target. `PickEntityCallout` in `indexes/page.tsx` is rendered at the `id="pick-entity-to-watch"` section (line 146). The callout is visible only when `window.location.hash === "#pick-entity-to-watch"`. |
| Refund policy visible on /score-watch page | [VERIFIED] | `score-watch/page.tsx` has a dedicated `#refund-policy` section (line 232) with all three tiers documented: 14-day full refund, 15–90 day pro-rated, after 90 days no refund. |

### PRD §3 Story P0-B.1 — Policy researcher purchases U.S. States Index

| AC | Status | Evidence |
|---|---|---|
| Gumroad product created for U.S. States Index | [NOT MET — PRE-LAUNCH] | `GUMROAD.usStatesIndex = "https://compassionbenchmark.gumroad.com/l/TODO-us-states"` (placeholder). Not a code bug — requires Phil to create product. |
| `GUMROAD.usStatesIndex` key exists in `gumroad.ts` | [VERIFIED] | `gumroad.ts` line 28. |
| `/purchase-research` shows U.S. States as live purchasable card (not coming soon) | [CONDITIONAL] | `purchase-research/page.tsx` uses `resolveProductLink()` which routes to `/contact-sales?product=us-states-index` when `US_STATES_INDEX.useGumroad === false`. Once Phil flips the flag, it routes to Gumroad. Currently shows "Request report" (correct fallback). |
| U.S. States entity detail pages show correct `gumroadUrl` | [VERIFIED] | `KIND_CONFIG["us-state"].gumroadUrl = GUMROAD.usStatesIndex` in `entities.ts` line 134. |
| Gumroad product delivers downloadable file on purchase | [CANNOT VERIFY] | Requires Gumroad product to exist. |

### PRD §3 Story P0-B.2 — Civic analyst purchases U.S. Cities Index

| AC | Status | Evidence |
|---|---|---|
| `GUMROAD.usCitiesIndex` key exists | [VERIFIED] | `gumroad.ts` line 21. |
| `/purchase-research` shows U.S. Cities as live purchasable card | [CONDITIONAL] | Same `resolveProductLink()` pattern. Correct fallback in place. |
| U.S. Cities entity detail pages show correct `gumroadUrl` | [VERIFIED] | `KIND_CONFIG["us-city"].gumroadUrl = GUMROAD.usCitiesIndex`. |

### PRD §1.9 Analytics

| AC | Status | Evidence |
|---|---|---|
| `score_watch_click` fires on entity-page CTA click with `{entity_slug, entity_kind, entity_name}` | [VERIFIED] | `EntityDetail.tsx` line 437–442: `trackAs="score_watch_click"` with correct `trackData`. `analytics.ts` `EVENTS.SCORE_WATCH_CLICK = "score_watch_click"`. |
| `score_watch_purchase_confirmed` fires on Gumroad success redirect | [PARTIAL] | `ThankYouClient.tsx` fires `purchase_confirmed` (not `score_watch_purchase_confirmed`). PRD §1.9 says `score_watch_purchase_confirmed`; code fires `purchase_confirmed` with `{product: "score-watch", entity}`. Event name mismatch — Umami dashboard will log it under `purchase_confirmed` not `score_watch_purchase_confirmed`. Minor deviation, not a blocker. |
| Alert open rate tracked via Listmonk | [CANNOT VERIFY] | Requires Listmonk campaign stats. |

---

## 3. Independence Safeguard Audit

### Integrity check result (run: 2026-05-18T02:27:39Z)

```
Check 1: Index files modified only by assessment pipeline — FAIL
Check 2: Commercial keywords confined to send-alerts.mjs    — PASS
Check 3: send-alerts.mjs does not read indexes/change-proposals — FAIL
Check 4: Worker source contains no GITHUB_TOKEN reference   — PASS
Check 5: Worker has no VPS filesystem or git write bindings — PASS
```

**Check 1 analysis — FALSE POSITIVE / KNOWN STATE:**
The 25 flagged commits are all legitimate founder-authored research-cycle commits (e.g., "May 15 research cycle applied — Anthropic boundary-down + 4 score changes"). None match the allowedPattern (`scanner|assessor|digest|founder|score-updater`). The pattern does not include the word "applied" or "research cycle." These commits are authored by Phil (founder) doing manual pipeline application — they are correctly categorized in intent but the commit message pattern does not match the filter. This check needs the pattern updated to also match "research cycle applied" or "Apply.*score". This is a check calibration issue, not a structural violation.

**Check 3 analysis — FALSE POSITIVE:**
`send-alerts.mjs` references `indexes/`, `change-proposals/`, and `assessments/` ONLY in the opening comment block (lines 8–10) documenting what the script must NOT do. The regex `pattern.test(source)` matches comment text. The script contains zero actual reads from those paths — confirmed by reading the full source. The only data read is `BRIEFING_PATH = join(REPO_ROOT, "site", "src", "data", "updates", "daily", ...)`. The check is a false positive due to checking string patterns instead of AST/import analysis.

**Manual code-level verification of architecture §8 guarantees:**

| Guarantee | Verified | How |
|---|---|---|
| `send-alerts.mjs` does NOT import from `site/src/data/indexes/*` | VERIFIED | Only import-like operation is `readFileSync(BRIEFING_PATH)` where `BRIEFING_PATH` points to `updates/daily/`. No other readFileSync paths touch indexes. |
| `send-alerts.mjs` does NOT read `research/change-proposals/*` | VERIFIED | No such path string in executable code. |
| `send-alerts.mjs` does NOT write to `indexes/` or `change-proposals/` | VERIFIED | All `writeFileSync` calls target `DELIVERIES_DIR = research/alert-deliveries/`. |
| `worker/src/index.ts` has no GITHUB_TOKEN | VERIFIED | Grep confirmed clean. |
| Worker has no VPS write path | VERIFIED | No SSH_KEY, VPS_, or DB_URL bindings in wrangler.toml. |
| Assessment pipeline cannot read subscriber state | VERIFIED (by topology) | Worker/KV credentials exist only in `worker/` and `research/scripts/send-alerts.mjs`. No assessor script imports them. |

**Independence verdict: STRUCTURALLY SOUND.** The two check failures are both false positives from check implementation defects, not architecture violations.

---

## 4. Bugs Found

### BUG-001 — BLOCKER
**BadgeEmbedWidget generates broken entity detail page URLs**

File: `site/src/components/entity/BadgeEmbedWidget.tsx` line 23

```
const entityUrl = `https://compassionbenchmark.com/${indexSlug.replace(/-/g, "-")}/${slug}`;
```

The `.replace(/-/g, "-")` call is a no-op — it replaces hyphens with hyphens. The intent appears to be converting the `indexSlug` to its route prefix, but `indexSlug` (e.g., `"global-cities"`, `"fortune-500"`, `"us-cities"`) does not equal the route segment used in entity URLs (e.g., `"city"`, `"company"`, `"us-city"`).

**Effect:** The embed snippet generated for every entity will produce a dead link. Examples:
- For a global city (Oslo): generates `compassionbenchmark.com/global-cities/oslo` → 404. Correct URL: `compassionbenchmark.com/city/oslo`
- For a Fortune 500 company: generates `compassionbenchmark.com/fortune-500/apple-inc` → 404. Correct: `compassionbenchmark.com/company/apple-inc`
- For a US city: generates `compassionbenchmark.com/us-cities/seattle` → 404. Correct: `compassionbenchmark.com/us-city/seattle`

**Fix:** The component already receives `entityKind` as a prop. Use `KIND_CONFIG[entityKind].route` to get the correct route segment, or pass `indexRoute` directly. The fix requires importing `KIND_CONFIG` from `@/data/entities`.

---

### BUG-002 — BLOCKER
**Welcome email unsubscribe link is broken — `unsubscribe_token` never supplied**

File: `worker/src/index.ts` lines 735–741 (function `buildUnsubscribeUrl`) and line 556

`buildUnsubscribeUrl()` in the Worker returns:
```
https://api.compassionbenchmark.com/unsubscribe?email={{ .Subscriber.Email }}&entity=${entitySlug}&token={{ .Data.unsubscribe_token }}
```

This URL is passed as the `unsubscribe_url` value in the Listmonk `/api/tx` data payload. But the `data` object does NOT contain `unsubscribe_token`. The Listmonk template would render a literal `{{ .Data.unsubscribe_token }}` in the URL — which means every welcome email unsubscribe link will contain an unresolved placeholder that fails HMAC verification in the Worker.

The alert email's unsubscribe URL is computed correctly (in `send-alerts.mjs` via `buildUnsubscribeUrl()` using Node.js HMAC at send time). But the welcome email URL is generated at webhook time in the Worker using Web Crypto — and the HMAC secret would need to be computed there and passed as `unsubscribe_token` in the tx data object.

**Fix options:**
1. Generate the real HMAC in the Worker (`generateHmac(email + ":" + entitySlug, env.UNSUBSCRIBE_HMAC_SECRET)`), include the hex result as `unsubscribe_token` in the `data` object, and use `{{ .Data.unsubscribe_token }}` in the template (as currently written). This is the correct fix.
2. Or pre-build the full unsubscribe URL in the Worker and pass it directly as `unsubscribe_url` (removing the `{{ .Subscriber.Email }}` placeholder pattern).

---

### BUG-003 — PRE-LAUNCH
**Integrity check Check 3 is a false positive — comment text triggers regex**

File: `research/scripts/integrity-check.mjs` line 191–196

The forbidden pattern check uses `pattern.test(source)` on the full source string including comments. `send-alerts.mjs` lines 8–10 contain `indexes/`, `change-proposals/`, and `assessments/` in a documentation comment explaining what the script must NOT access. This causes Check 3 to always fail, which will generate false-alarm violation reports every time the check runs.

**Fix:** Exclude comment lines from the source before pattern matching, or use a more specific pattern that would only match live code (e.g., require the pattern be preceded by `readFileSync`, `require`, or `import`).

---

### BUG-004 — PRE-LAUNCH
**`purchase-research/page.tsx` catalog table incorrectly claims "All 50 states and DC" for U.S. States Index**

File: `site/src/app/purchase-research/page.tsx` line 332

```
["U.S. States Index", "All 50 states and DC", ...]
```

Only 21 of 51 states are scored. The product card on the same page (line 219) correctly states "21 of 51 states scored to date." The catalog table row contradicts this. Per PRD §6 risk table: "US States data gap — Gumroad product and page copy must state '21 states scored to date.'"

This inconsistency could trigger refund disputes or misrepresentation claims.

---

### BUG-005 — PRE-LAUNCH
**`score-watch/page.tsx` lists Fortune 500 count as "447 companies" but the index has 448 entities**

File: `site/src/app/score-watch/page.tsx` line 19

```
{ label: "Fortune 500", href: "/fortune-500", count: "447 companies" },
```

The build output confirms 448 entities in `fortune-500.json`. The purchase-research page (line 24) also shows "447 major U.S. corporations." The source-of-truth count is the JSON file. Both pages need updating.

---

### BUG-006 — PRE-LAUNCH
**Integrity check Check 1 will permanently fail due to commit message pattern mismatch**

The `checkIndexCommitAuthors()` function in `integrity-check.mjs` (line 88) only allows commit messages matching `scanner|assessor|digest|founder|score-updater`. Phil's actual commit messages follow the format "research cycle applied" or "Apply approved score changes" — none contain the word "founder." This means every weekly integrity check will report 25+ violations in perpetuity, degrading the signal value of the check.

**Fix:** Update the allowed pattern to include Phil's actual commit message format, e.g., add `apply|research.cycle|score.update` to the pattern, or document that "Phil Kling" as git author constitutes "founder" and filter by git author name rather than commit message.

---

### BUG-007 — POST-LAUNCH
**18 cross-index slug collisions — badge endpoint serves the last-written index's data**

`export-public-data.mjs` logs 18 slug collisions across indexes (e.g., "boston", "seattle", "new-york-city" in both global-cities and us-cities). For these slugs, the badge at `/badge/boston.svg` will serve us-cities data (the last written), regardless of which index the badge was embedded from. This is a display bug (wrong composite score shown for the wrong index) not a crash.

Since the Worker's `handleBadgeSvg` fetches from `https://compassionbenchmark.com/data/scores/${slug}.json` which will serve the last-written collision winner, any entity embed from the losing index will show incorrect scores.

**Mitigation in architecture:** Not addressed in the current architecture. The badge URL would need to include the index slug (e.g., `/badge/global-cities/boston.svg`) to disambiguate. Defer to post-launch unless one of the 18 colliding entities is a high-visibility target for badge embedding.

---

### BUG-008 — POST-LAUNCH
**`score_watch_purchase_confirmed` event name mismatch between PRD and implementation**

PRD §1.9 specifies tracking event `score_watch_purchase_confirmed`. `ThankYouClient.tsx` line 79 fires `purchase_confirmed`. `analytics.ts` defines `EVENTS.PURCHASE_CONFIRMED = "purchase_confirmed"`. The Umami dashboard will not have a `score_watch_purchase_confirmed` event; only `purchase_confirmed` with a `product: "score-watch"` property. Low severity — filterable in Umami — but creates a discrepancy between PRD and dashboard.

---

### BUG-009 — POST-LAUNCH
**ThankYouClient analytics guard prevents firing when only one of product/entity is set**

File: `site/src/app/thank-you/ThankYouClient.tsx` line 78

```typescript
if (!product && !entity) return; // wait for params to load (or there are none)
```

This uses `&&` (both must be empty to skip). If `product="score-watch"` and `entity=""` (buyer had no entity param), it fires. If both are empty (visitor lands on `/thank-you` with no params), it correctly skips. The guard behavior is correct for the normal case. However: if a buyer arrives at `/thank-you` before the `useEffect` has populated `product` from `window.location.search` (first render), both are empty strings from `useState("")`, so the guard fires `return` on the first render tick, and then the second useEffect re-evaluates once `product`/`entity` are set. This is correct React behavior — no bug. Flagged for clarity only.

---

## 5. Tests

No test files exist for any of the new code. The following should be covered before the Worker is put into production:

**Worker (`worker/src/index.ts`):**
- `handleGumroadWebhook`: seller_id mismatch → 403; missing sale_id/email → 400; duplicate sale_id → 200 (replay); refunded=true path; cancelled=true path; missing entity/index → admin notify + 200; happy path KV write + reverse index update
- `handleUnsubscribe`: missing params → 400; invalid HMAC → 403; valid HMAC + existing KV → cancelled + reverse index removal; valid HMAC + missing KV → idempotent 200
- `handleBadgeSvg`: slug with `/` → 400; invalid style → 400; upstream 404 → placeholder badge; valid → SVG with correct band color
- `handleSubscribersQuery`: wrong token → 403; missing entity → 400; empty reverse index → `{subscribers:[]}` 
- `appendReverseIndex` / `removeFromReverseIndex`: deduplication logic

**`send-alerts.mjs`:**
- `buildAlertTemplateData`: band change formatting; evidence fallback when no keyEvidence; delta formatting (positive/negative)
- `indexToRoute`: all 7 index slugs map to correct route
- Expiry check: subscriber with `expires_at` in the past is skipped; in the future is processed
- Refunded subscriber is suppressed; cancelled subscriber is NOT suppressed (correct per architecture)
- `--dry-run` flag produces no Listmonk calls

**`export-public-data.mjs`:**
- Slug collision detection produces correct WARN output
- Intra-index duplicate slug disambiguation matches entities.ts logic
- All 7 index files are processed; missing file → process.exit(1)

**`BadgeEmbedWidget`:**
- Copy button calls `navigator.clipboard.writeText` with correct snippet
- Snippet uses correct entity route prefix (after BUG-001 fix)
- Tracks `badge_embed_copy` event on copy

---

## 6. Issue Classification

### BLOCKER (must fix before committing/deploying)

| ID | Issue | File | Line |
|---|---|---|---|
| BUG-001 | BadgeEmbedWidget generates 404 entity URLs (wrong route segment) | `site/src/components/entity/BadgeEmbedWidget.tsx` | 23 |
| BUG-002 | Welcome email unsubscribe link contains unresolved Listmonk placeholder — `unsubscribe_token` never passed to tx data | `worker/src/index.ts` | 556, 740 |

### PRE-LAUNCH (must fix before Phil creates Gumroad products + deploys Worker)

| ID | Issue | File | Line |
|---|---|---|---|
| BUG-003 | Integrity check Check 3 always fires false positive — comment text triggers pattern | `research/scripts/integrity-check.mjs` | 191–196 |
| BUG-004 | purchase-research catalog table claims "All 50 states and DC" (incorrect: 21 states) | `site/src/app/purchase-research/page.tsx` | 332 |
| BUG-005 | Fortune 500 count shown as 447 on score-watch page; index has 448 entities | `site/src/app/score-watch/page.tsx` | 19 |
| BUG-006 | Integrity check Check 1 will permanently fail — commit message pattern mismatches Phil's actual commit style | `research/scripts/integrity-check.mjs` | 88 |

### POST-LAUNCH (track in backlog)

| ID | Issue |
|---|---|
| BUG-007 | 18 cross-index slug collisions — badge serves wrong index data for colliding slugs |
| BUG-008 | Analytics event name `purchase_confirmed` does not match PRD spec `score_watch_purchase_confirmed` |

---

## 7. Additional Observations

**Gated products are correctly gated.** All four new products (Score-Watch, US Cities Index, US States Index, Supporter, Pro API) have `useGumroad: false` guards. When false, all CTAs route to `/contact-sales` with appropriate query params — no live TODO URLs are ever exposed to users. The TODO placeholder URLs in `gumroad.ts` are never reached in the current code paths. This is correct pre-launch behavior.

**Footer community links verified.** `nav.ts` exports `footerLinks.community` with `supporters` → `/supporters` and `api-access` → `/api-access`. Both pages exist as static routes. `Footer.tsx` renders the community section correctly (lines 86–98).

**Thank-you page handles missing query params gracefully.** Falls back to `DEFAULT_COPY` when `product` is not in `PRODUCT_COPY`. `noindex` metadata is set correctly.

**`KIND_CONFIG` coverage for `buildScoreWatchUrl`.** All 7 entity kinds (`company`, `country`, `us-state`, `ai-lab`, `robotics-lab`, `city`, `us-city`) have `indexSlug` defined in `KIND_CONFIG`. The call at `EntityDetail.tsx` line 431 `KIND_CONFIG[entity.kind].indexSlug` is safe for all entity kinds.

**HMAC algorithm consistency.** Both `send-alerts.mjs` (Node.js `createHmac("sha256", ...)` → `.digest("hex")`) and `worker/src/index.ts` (`crypto.subtle` HMAC-SHA256 → hex Array.from) produce the same 64-character lowercase hex string for the same input. The algorithms are compatible.

**Unsubscribe endpoint in Worker is correctly HMAC-verified** with constant-time comparison. The per-entity unsubscribe architecture (rather than global list unsubscribe) is correctly implemented for the alert email path via `send-alerts.mjs`. The welcome email path has BUG-002.

**`PickEntityCallout` on `/indexes` is client-side only** (hash detection via `useEffect`). This is correct for static export — no server-side rendering issue. The callout is aria-live="polite" for accessibility.
