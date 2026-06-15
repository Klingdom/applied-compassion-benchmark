# On-Site Engagement + Retention Plan — 2026-06-15

**Owner:** Conversion Strategist (CTAs, conversion copy, funnel logic).
**Counterpart to:** the acquisition plan. This plan turns arriving visitors into engaged, RETURNING readers and subscribers.
**Hands-off boundaries:** information structure → knowledge-architect; visual layout → UX; component code → frontend-engineer. This doc is strategy only — no site code modified.
**Independence posture:** every move below must *increase* trust. The benchmark's credibility is the conversion asset. No dark patterns, no manufactured urgency, no alarmist hooks, no pay-to-influence implication.

---

## North-star metrics this plan moves

| Metric | Today's leak | The loop that fixes it |
|---|---|---|
| Pages / session | Entity pages dead-end into 2 footer links | Loop 1 (peer/related navigation) |
| Bounce on search entries | 1,160 entity pages are the top organic landing surface, with no honest onward path | Loop 1 + Loop 4 |
| Subscribe rate | Captures exist but message-match is generic ("weekly highlights") on the highest-intent surface (a specific entity) | Loop 3 |
| Return rate | Only return trigger is the Friday email; no cross-device anchor; Score-Watch (the killer hook) is not yet purchasable | Loop 2 + Loop 5 |
| Read-depth / time-on-page | Briefings instrument read-depth; entity + special pages do not, and comprehension affordances are buried in `<details>` | Loop 6 |

---

## The six engagement loops (ranked)

Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5).

---

### LOOP 1 — Peer / related-entity discovery on entity pages (the missing spine)

**Pages:** all 1,160 entity pages via `site/src/components/entity/EntityDetail.tsx` + `renderEntityPage.tsx`.

**Problem (file evidence):** `renderEntityPage.tsx` (lines 241–278) already computes `cohortStats` — the full sorted peer list, the entity's rank within sector/region/category, and `peers: number[]`. But in `EntityDetail.tsx` this becomes only a **percentile sentence** (lines 482–506) and an **anonymous `CohortRug` SVG** of un-clickable ticks (lines 548–568, 1290–1391). The entire page's onward navigation is two links in the footer (lines 1264–1278): "Back to {index}" and "Read the methodology". The cohort rug literally renders the slugs the reader most wants to click next as faceless tick marks. For an entity reached cold from search — which is the dominant entry pattern across 1,160 pages — there is no "who's near this entity" path, so the session ends.

**Proposed change — a "Compare across the field" related-entities block**, placed after the dimension section and *before* the Score-Watch CTA (so discovery happens at the curiosity peak, while the monetized ask stays the single primary action of its own section). Three honest, data-derived rails, each a row of linked entity chips:

- **"Closest peers in {cohort}"** — the 2 ranked directly above and 2 directly below within the cohort already computed in `cohortStats.peers`. Copy: *"{Entity} ranks {cohortRank} of {cohortSize} in {cohort}. See who's right above and below."*
- **"Nearest on the full {index}"** — the entities at rank −2…+2 on the overall index (data already on the entity object: `rank`, `indexTotal`).
- **"Top of {index}" / "Floor of {index}"** — link the #1 and the lowest entity, so a low-ranked search landing has an aspirational onward click and a high-ranked one has a contrast click.

Each chip shows name, composite, and band — verbatim public data. Wire `trackAs="related_entity_click"` with `{from_slug, to_slug, rail}` so we learn which rail drives depth.

**Conversion benefit:** converts every entity page from a terminal node into a hub. Directly lifts pages/session and slashes bounce on the highest-traffic, highest-bounce surface. It also *feeds* Loops 3 and 6 — a reader who clicks two more entities is far likelier to subscribe at the third.

**Independence-policy check: PASS.** Pure restatement of published scores/ranks; no ordering is purchased, no entity is promoted for money. Showing "who's near you" *strengthens* the comparative-benchmark proposition (comparability is the product). No urgency, no alarmism.

**Scores:** Impact 5 · Strategic Alignment 5 · Learning Value 4 · Confidence 5 · Effort 3 · Risk 1 → **Priority = 15**

---

### LOOP 2 — Score-Watch as the killer retention hook (unblock it, then make it the return engine)

**Pages:** entity CTA section `EntityDetail.tsx` lines 1136–1206; config `site/src/data/gumroad.ts` lines 50–63; `/score-watch`.

**Problem (file evidence):** `SCORE_WATCH.useGumroad` is `false` (`gumroad.ts` line 58) and `GUMROAD.scoreWatch` is a `TODO` placeholder (line 14). So the single most powerful RETURN mechanism on the site — "get told the moment *this specific entity* moves" — currently routes to a `/contact-sales` manual-fulfillment form (EntityDetail lines 1184–1196). That is a high-friction detour for a $79 reflexive purchase, and it means the most retention-relevant intent on the site cannot self-serve. Separately, the price ($79/yr/entity) is a hard ask against a free product when the reader has no lower-commitment "watch" rung.

**Proposed change (two parts):**
1. **Unblock the paid tier** (hand to Phil/ops): create the Gumroad product, paste the URL, flip `useGumroad` to true. This is the highest-leverage *unblocking* action — until then the killer hook is amputated.
2. **Add a free "Follow this entity" rung BELOW the paid alert** so retention isn't gated on a $79 decision. Free follow = the entity's slug appended to the existing newsletter subscription (the reader gets that entity's movements folded into the Friday email, or a lightweight per-entity flag stored with their Listmonk record). Copy under the paid card: *"Not ready to pay? Follow {Entity} free — we'll flag it in your Friday briefing when its score moves."* This reuses the existing `NewsletterSignup` + a `source=follow-{slug}` so it's measurable and zero new infra.

This gives a two-rung ladder: free follow (retention) → paid Score-Watch (revenue), message-matched to the one entity the reader is already looking at.

**Conversion benefit:** Score-Watch is the only mechanism that creates a *recurring reason to return* tied to a specific reader interest. The free rung captures the 95% who won't pay today but will come back via email; the paid rung monetizes the few with live stakes. Return rate is the metric most starved of levers today.

**Independence-policy check: PASS.** Alert/follow is a *monitoring* product — it reports score changes, it never sells a score change. Copy must avoid alarmist framing ("be first to know when X's score changes" — the existing line 1152 — is acceptable because it's neutral monitoring, not "X is in danger"). Keep it descriptive, not fear-based. The free rung explicitly removes a pay-wall, reinforcing free-first.

**Scores:** Impact 5 · Strategic Alignment 5 · Learning Value 4 · Confidence 4 · Effort 3 · Risk 2 → **Priority = 13**

---

### LOOP 3 — Message-match the newsletter capture to the surface that produced the intent

**Pages:** entity page "Free weekly briefing" card `EntityDetail.tsx` lines 1242–1255; `NewsletterSignup.tsx` inline/card copy (lines 195–243).

**Problem (file evidence):** The entity-page newsletter card (EntityDetail line 1247) says "Free — the Friday briefing" with generic body copy "the week's biggest score changes… across ~1,160 entities" — the *same* pitch a reader sees on the home page and the briefing. A reader on the Tesla page just spent 90 seconds on Tesla; the ask makes no reference to Tesla. Principle 3 (message match) is violated on the highest-intent surface. The capture works but converts below potential because the benefit isn't tied to the just-formed intent.

**Proposed change:** make the entity newsletter card's lead line entity-aware (data already in scope — `entity.name`, `config.indexLabel`):
> **"Track {Entity} and its {index} peers — free, every Friday."**
> *"One email with the week's biggest score moves across {indexLabel}. We'll surface {Entity} when it changes. Unsubscribe anytime."*

Pass `source={entity-${slug}}` (already wired, line 1254) so we can compare entity-matched vs generic capture conversion. Keep the "No spam / unsubscribe anytime" microcopy.

**Conversion benefit:** message-matched capture at the intent peak (after reading a score) is the textbook highest-converting subscribe moment. Lifts subscribe rate on the surface with the most traffic. Learning value is high — entity-matched vs generic is a clean A/B the analytics already support via `source`.

**Independence-policy check: PASS.** Benefit-led, honest cadence ("every Friday"), no urgency. Names the entity the reader chose — relevance, not manipulation.

**Scores:** Impact 4 · Strategic Alignment 4 · Learning Value 5 · Confidence 5 · Effort 2 · Risk 1 → **Priority = 15**

---

### LOOP 4 — Reduce bounce on cold search entries with an above-the-fold "what to do next" orientation

**Pages:** entity hero `EntityDetail.tsx` lines 439–615.

**Problem (file evidence):** A reader arriving cold from search sees a band, a score, a percentile, a sparkline, and a band-position strip — excellent comprehension, but the *first onward action* is invisible until they scroll past the entire dimension section to the CTA block (line 1136) and the footer (line 1260). For a low-intent searcher, the decision to stay-or-bounce is made in the hero. There is no in-hero "here's where to go next."

**Proposed change:** add a single, lightweight orientation line in the hero (subordinate to the score, not competing with it) — a one-tap onward path matched to context:
> *"See how {Entity} compares to its {cohort} peers ↓" (anchors to the Loop 1 related block)* — when cohort exists; otherwise *"See where {Entity} sits in the {index} ↓"* (anchors to the band-distribution block).

This is a quiet in-page jump link, not a CTA button — it tells a cold reader "there's more here for you" at the exact decision moment, without cluttering the score. It is explicitly *secondary* to the score readout (no competing visual weight).

**Conversion benefit:** directly attacks bounce at the moment it happens (the hero). Pairs with Loop 1 — the jump link is worthless without a destination, so ship Loop 1 first or together.

**Independence-policy check: PASS.** Navigational, factual, no pressure. Anchor-scroll only.

**Scores:** Impact 4 · Strategic Alignment 4 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 1 → **Priority = 11**

---

### LOOP 5 — Cross-device + return triggers that don't depend on the Friday email

**Pages:** site-wide; leans on `localStorage.cb_newsletter` (already set in `NewsletterSignup.tsx` lines 93, 107 and read by `MidBriefingSubscribe.tsx` line 23).

**Problem (file evidence):** The only return trigger today is the weekly email, and the only personalization signal is the `cb_newsletter` localStorage flag, which suppresses the mid-briefing ask but is otherwise unused. Two specific gaps:
1. **No RSS/JSON-feed surfacing.** `feed.xml` / `feed.json` exist (referenced in `updates/[date]/page.tsx` lines 64–66) but are never *offered* to the reader as a follow option — a high-intent, cross-device, no-account return mechanism that costs nothing and respects independence (no tracking).
2. **The localStorage signal is wasted.** A returning subscriber sees the same first-time CTAs.

**Proposed change:**
1. **Offer the feed as a first-class "follow" option** in the briefing completion block and the briefings index. Copy: *"Prefer your reader? Follow by RSS — no email, no account."* This is the most independence-aligned return trigger possible (zero data collection).
2. **Use the `cb_newsletter` flag to graduate the ask.** When set, swap the subscribe CTAs for the *next* funnel rung — "Follow specific entities with Score-Watch" or "Browse special briefings" — instead of re-asking for an email they already gave. This is the staged "reader → subscriber → supporter" path. (Coordinate the visual treatment with UX.)

**Conversion benefit:** adds return mechanisms for the email-averse (RSS) and stops wasting impressions on already-converted readers (graduated CTAs), advancing them down the funnel instead. Improves return rate without a single dark pattern.

**Independence-policy check: PASS.** RSS is the gold-standard independence follow (no data, no lock-in). Graduated CTAs reduce over-asking — the *opposite* of a dark pattern.

**Scores:** Impact 3 · Strategic Alignment 4 · Learning Value 3 · Confidence 4 · Effort 2 · Risk 1 → **Priority = 11**

---

### LOOP 6 — Honest read-depth + comprehension affordances (and instrument them)

**Pages:** entity pages (`EntityDetail.tsx`) and special reports (`updates/special/[slug]/page.tsx`); compare to daily briefing which already has `ReadingProgress` + `briefing_read_depth` (DailyBriefing line 212; analytics EVENTS lines 57–59).

**Problem (file evidence):** (a) The daily briefing instruments read-depth (`BRIEFING_READ_DEPTH`) and has a reading-progress bar; **entity pages and special reports have neither**, so we are blind to whether the new radar/cohort/explain-the-number affordances are actually read. (b) On entity pages, the richest comprehension content — the dimension behavioral-anchor explainers (lines 1038–1074), the deviation bars (1080–1103), the "how the composite is calculated" breakdown (936–978) — is collapsed inside `<details>` that *reset closed on every load*. That keeps the page scannable (good) but means the depth that creates honest time-on-page is one click away and unmeasured. We don't know if anyone opens them.

**Proposed change:**
1. **Instrument the existing affordances** before changing them: fire `entity_detail_expand` with `{section}` when a reader opens any `<details>` (dimension explainer, composite breakdown, deviation bars, band distribution, assessment record). Fire a `read_depth` event on entity + special pages mirroring the briefing. This is measurement, not manipulation — it tells us which comprehension content earns attention so we can promote the winners out of `<details>`.
2. **On special reports**, add the same `ReadingProgress` treatment the daily briefing has (the special page is a long-form read with a sticky TOC already, lines 152–155, but no progress signal).

This is deliberately the *lowest-impact, highest-learning* loop: it's the instrumentation that tells us whether Loops 1–5 actually deepened engagement, and which buried affordances deserve promotion. Sequence it early for the learning, not the lift.

**Conversion benefit:** indirect — it makes every other loop measurable and surfaces which comprehension content honestly holds readers. Honest time-on-page (people actually reading) is the only kind worth optimizing.

**Independence-policy check: PASS.** Umami is privacy-respecting and already in use; events are anonymous interaction counts. No engagement-inflation tricks (no auto-expand, no scroll-jacking) — we *measure* attention, we don't *coerce* it.

**Scores:** Impact 2 · Strategic Alignment 4 · Learning Value 5 · Confidence 5 · Effort 2 · Risk 1 → **Priority = 13**

---

## Ranked backlog (by Priority Score)

| # | Loop | Priority | Sequence note |
|---|---|---|---|
| 1 | **Loop 1 — Peer/related-entity discovery** | **15** | Ship first; everything else compounds on it |
| 2 | **Loop 3 — Entity-matched newsletter copy** | **15** | Trivial effort; ship alongside Loop 1 |
| 3 | Loop 2 — Score-Watch unblock + free-follow rung | 13 | Part 1 (unblock) is an ops action; do immediately in parallel |
| 4 | Loop 6 — Read-depth instrumentation | 13 | Ship early for the learning, before measuring 1–5 |
| 5 | Loop 4 — Hero "what next" orientation line | 11 | Bundle with Loop 1 (shared destination) |
| 6 | Loop 5 — RSS follow + graduated CTAs | 11 | Fast follow |

---

## Highest-intent moments currently UNDER-converted (and the ethical fix)

1. **End of a deep entity read** → today: 2 footer links. Fix: Loop 1 related block + Loop 3 entity-matched capture + Loop 2 free-follow. This is the single biggest cluster of wasted intent on the site.
2. **An entity at a band crossing** → the daily briefing flags band crossings ("Band crossing detected on lead signal", DailyBriefing line 264) but the *entity page itself* of a recently-crossed entity has no special onward hook. Fix (ethical): on entity pages where `latestScoreChangeEvent.bandChange` is true, surface a neutral *"{Entity} recently changed bands — follow it free / watch it"* prompt. This is message-matched and factual. **Do NOT** dramatize it ("Alert: X is collapsing") — that would be the exact alarmism the independence brand forbids. The white-hat version states the fact and offers the monitoring follow.
3. **End of a special report** → already has an end-CTA (`NewsletterSignup variant="card"`, special page lines 327–336) and companion links — this is the *model* the entity page should copy. Good as-is.

---

## Flagged independence / manipulation risks (and the white-hat alternative)

- **Score-Watch alarmist framing.** Risk: pitching alerts as "danger warnings" to drive urgency. White-hat: neutral monitoring language ("get told when {Entity}'s score changes"). The existing copy (EntityDetail line 1152) is already neutral — keep it that way; reject any future "risk/warning" reframing.
- **Band-crossing as bait.** Risk: using band crossings to manufacture urgency. White-hat: state the fact, offer the follow, no countdown, no "act now."
- **Forward-trigger countdowns.** `ForwardTriggerCountdown` color-codes proximity red ≤7 days (component lines 55–60). This is editorially legitimate (it's a research calendar, not a sales timer) — but it must **never** be repurposed as a conversion countdown ("X days to subscribe"). Keep it strictly informational.
- **Over-asking.** `MidBriefingSubscribe` already suppresses on `cb_newsletter` (good). Extend that discipline (Loop 5.2): never show a subscribed reader the same email ask twice — graduate them instead.

---

## The single highest-leverage engagement move site-wide

**Ship Loop 1 — the peer/related-entity discovery block on every entity page.**

The data is already computed (`renderEntityPage.tsx` lines 241–278) and currently thrown away as anonymous tick marks. The 1,160 entity pages are simultaneously the largest organic landing surface *and* the worst dead-ends on the site — their only onward links are "back to index" and "methodology." Turning each into a hub that links its nearest peers, index neighbours, and the top/floor of its index converts the site's biggest bounce liability into its biggest depth engine, in one component, using zero new data, with a clean PASS on independence (comparability *is* the product). It also unlocks Loops 3, 4, and 6, which all assume the reader has a reason to keep moving. Pair it with the one-line Loop 3 copy change and you address the highest-intent under-converted moment on the site — the end of a deep entity read — in a single shippable increment.

---

## Hand-offs

- **knowledge-architect:** confirm the related-entity rails' information hierarchy (which rail leads) and whether the band-crossing prompt belongs in the hero or the CTA section.
- **UX:** visual weight/placement of the Loop 1 block (must not compete with the Score-Watch primary CTA), the Loop 4 hero jump-link treatment, and the Loop 5.2 graduated-CTA states.
- **frontend-engineer:** Loop 1 component, Loop 3/4 copy + anchor, Loop 6 event wiring (`related_entity_click`, `entity_detail_expand`, entity/special `read_depth`), Loop 5 RSS-follow surfacing.
- **Phil / ops:** Loop 2 part 1 — create the Score-Watch Gumroad product and flip `SCORE_WATCH.useGumroad`. This is the gating action for the site's only recurring return mechanism.
- **analytics:** register the new event names alongside the existing `EVENTS` map (`site/src/lib/analytics.ts` lines 49–60).
