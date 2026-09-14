# Growth Strategist Review — CB-MODEL and Continuous Research

**Reviewer:** growth-strategist agent
**Date:** 2026-09-14
**Lens:** distribution, launch, and lifecycle growth — tied to real product value, never at the expense of the independence policy.

---

## 1. Scope reviewed

Read directly for this review:

- `docs/PRD_MODEL_BENCHMARK.md` — the PM's honest-launch boundary and blocker register for CB-MODEL.
- `docs/UX_FLOWS_MODEL_BENCHMARK.md` — proposed `/model-index` IA (not what shipped; see §3).
- `site/src/app/ai-models/page.tsx` — the **actual shipped** CB-MODEL page (route is `/ai-models`, not `/model-index` or `/ai-model-benchmark` as the two design docs above proposed).
- `site/src/data/nav.ts` — primary nav (`mainNav`) and footer link groups.
- `site/src/data/updates/manifest.json`, `site/src/data/special-briefings/manifest.json` — briefing cadence, dated.
- `INCIDENTS.md` (INC-001 through INC-008) — deploy and research-pipeline incident history.
- `worker/src/index.ts` — Score-Watch Worker (Gumroad webhook, unsubscribe, badge SVG, subscriber query, admin status).
- `research/scripts/send-alerts.mjs` — alert pipeline script and its required env vars.
- `research/alert-deliveries/` — directory listing (empty; see Finding G-3).
- `site/src/app/score-watch/page.tsx`, `site/src/data/gumroad.ts` — Score-Watch product page and centralized commerce config.
- `site/src/components/entity/BadgeEmbedWidget.tsx`, `site/src/lib/analytics.ts` — badge-embed loop and the Umami event taxonomy.
- `site/src/components/model-benchmark/EvaluationScorer.tsx` (grepped) — BYO clipboard scorer's composite-withholding logic.
- `docs/ORGANIC_GROWTH_MASTER_2026-07-14.md` — prior growth-agent prioritization (read for continuity, not duplicated below).

Not read in full (out of scope / not needed to ground this review): `docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md`, `research/GROWTH_CANDIDATES_2026-04-18.md`, `docs/GRANT_PROPOSAL_2026-09.md`, the four `ORGANIC_GROWTH_*` sub-lens docs.

**Key correction to the shared brief:** the brief describes `/ai-models` as "pre-registration: method published, NO model scored" — confirmed true and shipped. But it also lists `docs/UX_FLOWS_MODEL_BENCHMARK.md`'s proposed route (`/model-index`) as part of the surface set. That route does not exist. The live route is `/ai-models`, and it already implements most of the honest-launch discipline the UX doc specified (answer-first honest lede, live-sourced stats, Three Objects device, disclosed coverage gaps, Release Watch section, FAQ with the independence-policy answer) — under different naming. This review is grounded in what is actually live, not the proposal documents.

---

## 2. Current distribution loops

| Loop | Status | Evidence |
|---|---|---|
| Daily briefings → `/updates` + RSS/JSON feed | **Degraded.** Daily every day 05-20→07-31, then only 7 catch-up dates in 45 days (08-01, 08-11, 08-18, 08-20, 08-26, 09-01, 09-14) | `site/src/data/updates/manifest.json` `.dates` array |
| Special/thematic briefings (news-hook content) | **Stalled.** All 14 entries in the manifest are dated 2026-06-11 through 2026-07-04; none since | `site/src/data/special-briefings/manifest.json` |
| Score-Watch email alerts (Listmonk + Worker) | **Never executed.** Pipeline requires 6 env vars (`SCORE_WATCH_INTERNAL_TOKEN`, `LISTMONK_API_URL/USER/TOKEN`, `LISTMONK_ALERT_TEMPLATE_ID`, `UNSUBSCRIBE_HMAC_SECRET`) that hard-exit the script if missing; `research/alert-deliveries/` (the script's own audit-log output directory) contains **zero files** | `research/scripts/send-alerts.mjs` lines 96–108; `Glob research/alert-deliveries/*` → no results |
| Score-Watch purchase → Gumroad webhook → Worker → Listmonk welcome email | **Code live, volume unmeasured.** `SCORE_WATCH.useGumroad: true` since 2026-06-22; Worker handles webhook, KV write, Listmonk sync, welcome tx email | `site/src/data/gumroad.ts` line 63; `worker/src/index.ts` `handleGumroadWebhook` |
| Embeddable score badge (`/badge/<slug>.svg`) | **Code live on every entity page, zero external adoption evidence.** `BadgeEmbedWidget` fires `badge_embed_copy` event on clipboard copy; no committed data shows any copy event has ever fired or any badge has ever been embedded off-site | `site/src/components/entity/BadgeEmbedWidget.tsx`; `site/src/lib/analytics.ts` `EVENTS.BADGE_EMBED_COPY` |
| Citation flywheel (`/cite`, copy-to-clipboard citation strings) | **Present on institutional pages, unmeasured for actual pickup.** No backlink or citation-count data committed anywhere in the repo | `docs/ORGANIC_GROWTH_MASTER_2026-07-14.md` G7/G14 (flagged as not-yet-built/unmeasured as of 2026-07-14; no later confirmation found) |
| BYO clipboard scoring (`/ai-evaluation-suite`, `EvaluationScorer.tsx`) | **Live, self-serve, deliberately non-viral by design.** Composite is explicitly withheld (`composite: null`) for AI-judge mode and shows `official: false` on every export — correct per independence policy, but it also means this surface cannot produce a shareable "my score is X" artifact the way a normal self-serve tool would | `site/src/components/model-benchmark/EvaluationScorer.tsx` lines 268, 290–307, 651–663 |
| Release Watch section (`/ai-models#release-watch`) | **Live, honestly empty.** Renders "No release scan has ever run" state; `RELEASE_WATCH_FACTS` reads real counts from `releases-v1.json` at build time, not hardcoded | `site/src/app/ai-models/page.tsx` lines 259–322 |
| Primary nav placement for CB-MODEL | **Resolved and live.** "AI Models" is its own top-level entry in `mainNav`, positioned second after "Indexes" — one click from every page | `site/src/data/nav.ts` lines 3–12 |
| Analytics instrumentation (Umami) | **Code exists; no dashboard data available to this review.** Named events cover score-watch clicks/signups, badge copies, pricing CTA clicks, briefing read-depth, share clicks | `site/src/lib/analytics.ts` `EVENTS` object |
| Auto-deploy (the pipe that gets any of the above in front of a reader) | **Restored 09-09 after 25+ consecutive failures since 2026-07-19.** For the ~7-week gap, every publication depended on manual SSH deploy | `INCIDENTS.md` INC-001 |

---

## 3. Findings

**F-1 (High, Both).** The daily-briefing habit loop has a 12-day silent gap (2026-08-01 → 2026-08-11 is the widest single jump; the whole 08-01→09-14 window has 7 dates covering 45 days, versus daily coverage for the prior ~10 weeks) with no on-site or in-feed acknowledgment that cadence changed. A subscriber who built a daily-check habit in June–July has had that habit broken for six weeks with no explanation surfaced to them. *Evidence:* `site/src/data/updates/manifest.json`; root-caused in `INCIDENTS.md` INC-008 (WebSearch session cap exhausted the research pipeline that feeds briefings) and INC-001 (deploy pipeline dead 07-19→09-09, meaning even a completed briefing may not have reached production on schedule).

**F-2 (High, Continuous Research).** The Score-Watch alert pipeline — the product's only "we'll tell you the moment it changes" mechanism, and the thing every paying $79/yr subscriber is actually buying — has **never sent a real alert**. The delivery-audit directory the script itself writes to is empty, and the script hard-fails without six Listmonk/HMAC secrets that the shared context confirms are not configured on the founder's workstation. This is not a degraded loop; it is an unbuilt-in-practice loop sitting behind a live product page and a live Gumroad checkout. *Evidence:* `research/scripts/send-alerts.mjs` lines 96–108; empty `research/alert-deliveries/`; `site/src/app/score-watch/page.tsx` (live pricing/CTA copy promising "Email the moment a tracked entity's Compassion Benchmark score moves").

**F-3 (High, CB-MODEL).** CB-MODEL's only credible near-term public milestone is Tier 1 (a tracked-release row with a citation, no score), and Tier 1 itself is blocked on a research-pipeline defect (BLK-001, INC-008's session WebSearch cap), the same defect degrading the daily briefing loop in F-1. The founder's original ask — a benchmark that reacts "upon every new AI model release" — currently has zero release-detection capability, confirmed live on the page itself ("No release scan has ever run"). Launch messaging for CB-MODEL must not imply reactive capability that does not exist. *Evidence:* `site/src/app/ai-models/page.tsx` lines 272–276; `docs/PRD_MODEL_BENCHMARK.md` §9 BLK-001.

**F-4 (Medium, CB-MODEL).** The badge-embed and citation loops are the two mechanisms that would let CB-MODEL's methodology-stage credibility compound for free (a researcher citing the task bank, a journalist embedding a badge once a result exists) — but both are currently unmeasured even for the *institutional* indexes that have had them live since June. Launching CB-MODEL without first instrumenting whether these loops work anywhere on the site means the growth team has no baseline to know if a CB-MODEL-specific push into the same loops is working. *Evidence:* `site/src/components/entity/BadgeEmbedWidget.tsx` (event exists, no data); `docs/ORGANIC_GROWTH_MASTER_2026-07-14.md` G14 (flagged not-yet-built as of 07-14, no confirmation of later completion found in files reviewed).

**F-5 (Medium, Both).** Two design documents (`UX_FLOWS_MODEL_BENCHMARK.md`, and by extension its route proposals) describe a product (`/model-index`, per-model pages, `ModelComparisonTable`) that was **not** what shipped. What shipped (`/ai-models`) is arguably a *better*, more conservative honest-launch execution — but any downstream marketing brief, ad copy, or press pitch drafted from the design docs rather than the live page would describe pages, routes, and interactions (e.g., `/model-index/task-bank`, a spotlight card at N=1) that do not exist. This is a live risk for whoever writes launch copy next without re-checking the shipped page. *Evidence:* diff between `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.1 route table and `Glob site/src/app/*/page.tsx` (no `model-index` directory exists; `ai-models` does).

**F-6 (Low, CB-MODEL).** The `/ai-models` FAQ correctly pre-empts the single most damaging overclaim risk ("Which AI model is the most compassionate?" → "No model has been scored... Any ranking... attributed to Compassion Benchmark today would be fabricated") and states the gameability of the public task bank plainly. This is a genuine growth asset: it is the rare page that a skeptical journalist or safety researcher can screenshot as evidence the institution polices its own overclaiming. Nothing to fix here — flagged as a strength to preserve, not erode, in any future marketing pass. *Evidence:* `site/src/app/ai-models/page.tsx` lines 30–71.

---

## 4. Top 5 recommended improvements

### 1. Instrument and honestly report the Score-Watch alert pipeline's real status on the product page itself

- **Type:** Product-connected trust fix (not a new campaign)
- **Problem:** `/score-watch` sells "Email the moment a tracked entity's score moves" for $79/yr. The pipeline that fulfills this has sent zero verified alerts (empty `alert-deliveries/`, missing required secrets). A subscriber who buys today and never receives an alert during a period when their entity's score genuinely moved has no way to know if that's because nothing changed or because the pipeline is dark.
- **Expected benefit:** Prevents a refund/trust incident before it happens; converts an invisible risk into a disclosed, defensible operating state (consistent with the site's own evidence discipline).
- **Evidence:** `research/scripts/send-alerts.mjs` lines 96–108; empty `research/alert-deliveries/`; `site/src/app/score-watch/page.tsx`.
- **Impact:** 5 (protects existing revenue and the site's core credibility claim)
- **Strategic alignment:** 5 (directly serves the independence/evidence-first operating principle)
- **Learning value:** 3 (once instrumented, first real alert cycle tells the team the true delivery rate)
- **Confidence:** 4 (the fix is operational, not speculative — secrets need configuring, not a new build)
- **Effort:** 2 (env var configuration + a `--dry-run` verification pass; the code path already exists)
- **Risk:** 2 (low risk to ship; the only risk is founder time to supply secrets)
- **Priority Score:** 5+5+3+4−2−2 = **13**

### 2. Publish a visible "what changed in our cadence" note on `/updates` and in the next briefing

- **Type:** Lifecycle trust communication
- **Problem:** The daily-briefing habit loop went from every day (05-20→07-31) to 7 dates in 45 days, with no acknowledgment on the reader-facing surface. Silent cadence collapse is the single fastest way to lose a habitual reader without ever learning why they left.
- **Expected benefit:** Converts an unexplained gap into a disclosed, credible operating note — the same honesty standard the site already applies to its own indexes. Retains subscribers who would otherwise assume the project died.
- **Evidence:** `site/src/data/updates/manifest.json`; `INCIDENTS.md` INC-008, INC-001.
- **Impact:** 4
- **Strategic alignment:** 5 (evidence-aware, not brand fluff)
- **Learning value:** 2
- **Confidence:** 4
- **Effort:** 1 (a short editorial note, no new infrastructure)
- **Risk:** 1
- **Priority Score:** 4+5+2+4−1−1 = **13**

### 3. Make Tier 1 (release tracking) the entire CB-MODEL launch story, and say so explicitly

- **Type:** Positioning / launch narrative
- **Problem:** The founder's ask was reactive coverage "upon every new AI model release." That capability doesn't exist yet (BLK-001, confirmed live on-page: "No release scan has ever run"). A launch pitch built around reactive cadence would overclaim.
- **Expected benefit:** A launch story that is 100% true today — "we publish the method and the standard before the result, and we track every release we can verify, honestly, starting now" — is a legitimate, differentiated pitch to safety researchers and journalists precisely because almost no benchmark does this stage publicly. It also sets correct expectations so the first real tracked release (once BLK-001 clears) is a visible, citable "it's alive" moment rather than a silent backend fix.
- **Evidence:** `site/src/app/ai-models/page.tsx` Release Watch section; `docs/PRD_MODEL_BENCHMARK.md` §5.
- **Impact:** 5
- **Strategic alignment:** 5
- **Learning value:** 3
- **Confidence:** 5 (this is describing what's already shipped, not proposing new build)
- **Effort:** 1 (messaging-only)
- **Risk:** 1
- **Priority Score:** 5+5+3+5−1−1 = **16**

### 4. Instrument badge-embed and citation loops with a baseline measurement pass before promoting CB-MODEL through them

- **Type:** Measurement infrastructure (prerequisite to a campaign, not a campaign itself)
- **Problem:** Both loops exist in code with tracking events wired, but no baseline usage data is available anywhere in the repo for the *institutional* indexes that have had them live since June. Pushing CB-MODEL content through the same untested loops risks investing in a channel with an unknown conversion floor.
- **Expected benefit:** A real number (even "0 badge copies in N weeks") turns an assumed channel into a measured one and tells the team whether to invest further or redesign the mechanism before scaling it to CB-MODEL.
- **Evidence:** `site/src/components/entity/BadgeEmbedWidget.tsx`; `site/src/lib/analytics.ts`.
- **Impact:** 3
- **Strategic alignment:** 4 (measurable, evidence-aware — core operating principle)
- **Learning value:** 5 (this is explicitly a learning-first recommendation)
- **Confidence:** 4
- **Effort:** 2 (pulling existing Umami data; no new instrumentation code needed)
- **Risk:** 1
- **Priority Score:** 3+4+5+4−2−1 = **13**

### 5. Correct any launch collateral drafted from `UX_FLOWS_MODEL_BENCHMARK.md` against the actual shipped `/ai-models` page before it goes external

- **Type:** Accuracy gate on downstream marketing work
- **Problem:** The UX design doc describes routes and interaction patterns (`/model-index`, `ModelComparisonTable`, an N=1 spotlight card) that were not built. If a press kit, ad, or landing page draft is produced by summarizing that doc rather than the live page, the resulting collateral will describe a product that does not exist — precisely the overclaiming risk this whole program is trying to avoid.
- **Expected benefit:** Prevents a self-inflicted credibility incident where a journalist or researcher clicks through from marketing copy to a 404 or a materially different page.
- **Evidence:** Diff between `docs/UX_FLOWS_MODEL_BENCHMARK.md` §1.1 and the actual `site/src/app/*/page.tsx` listing.
- **Impact:** 4
- **Strategic alignment:** 5
- **Learning value:** 1
- **Confidence:** 5
- **Effort:** 1 (a checklist step, not a build)
- **Risk:** 1
- **Priority Score:** 4+5+1+5−1−1 = **13**

---

## 5. PR/FAQ inputs

### Draft headline + subhead options (true today)

**Option A — leads with the honest boundary as the differentiator:**
> **Headline:** Compassion Benchmark publishes the standard for evaluating how AI models treat people in distress — before publishing a single score.
> **Subhead:** A public 33-item task bank, an 8-dimension framework, and a stated evaluation method exist today. Zero models have been scored. We say so on the page itself.

**Option B — leads with the separation device (safe, differentiated, no numeric claim):**
> **Headline:** Your AI lab's safety record and your model's actual behavior are not the same score. Compassion Benchmark measures both — separately, and never as one number.
> **Subhead:** The AI Labs Index scores organizational governance. The Model Index (in progress) will score what a specific model snapshot actually does under test. Today, only the method for the second is public.

**Option C — leads with the institution's broader base as CB-MODEL's on-ramp:**
> **Headline:** The only independent benchmark that already scores 1,156 governments, companies, and AI labs on how they treat people in need is building the same standard for AI models themselves.
> **Subhead:** Read the published method and task bank now. Be notified the moment the first model result publishes.

### Customer quote placeholder

> "[ILLUSTRATIVE — NOT A REAL QUOTE] As a safety researcher, I don't need another leaderboard — I need a task bank I can actually critique. Compassion Benchmark published theirs, coverage gaps and all, before they had a single result to defend. That's the order most benchmarks get backwards." — [ILLUSTRATIVE — NOT A REAL QUOTE, no such researcher, quote, or endorsement exists in the repo]

### Hard FAQ questions with honest answers

**Q: Has any AI model actually been scored yet?**
A: No. Zero models are in the registry. The task bank (33 items, 8 dimensions) and the scoring method are published; results are not, because the credentialed model access, human rater panel, and Methods Committee needed to produce a defensible score don't exist yet. This is stated on the live `/ai-models` page itself, not something disclosed only under questioning.

**Q: Why did the daily briefing cadence drop from every day to roughly once every six days over the last six weeks?**
A: The research pipeline that feeds daily briefings hit a session-wide search-tool cap that stalled scanning for a stretch in early September (documented as INC-008), compounding a separate seven-week span (07-19 → 09-09) where the automated deploy pipeline had never successfully run and every publish depended on a manual step (INC-001). Both are now addressed at the infrastructure level, but the reader-facing gap during that period was real and, as of this review, not yet explained on the site itself.

**Q: If a model developer doesn't like a future Model Index result, can they get it changed or suppressed?**
A: No. The independence policy is identical to every institutional index: no entity — company, government, or AI lab — ever pays for inclusion, a score change, or suppression of a finding. This is stated verbatim in the site's `/ai-models` FAQ today.

**Q: I subscribed to Score-Watch for an entity. How do I know I'll actually get an alert when the score changes?**
A: As of this review, the alert-delivery pipeline has no recorded successful sends in its own audit log, and the production secrets it requires to run are not yet configured. This is an internal operational gap, not a subscriber-facing disclosure today — it should become one (see Recommendation 1) rather than remain something only this review surfaces.

**Q: Doesn't publishing the full task bank, answer keys included, let a model "cheat" on the benchmark?**
A: Yes, and the site says so directly: any model trained since the task bank's publication may have absorbed both the questions and the target answers, so a score on this public pool mixes real behavior with memorization and can't support a valid comparison. That's why the public pool is framed as a transparency artifact and saturation sentinel, not the basis for a future leaderboard — a separate, unpublished item pool is required for real comparative scoring.

---

**Handoff:** coordinator, product-manager, analytics. Core message for downstream use: CB-MODEL's only defensible launch claim today is "the method and standard are public, the result is not, and here is exactly what has to happen before one exists" (Recommendation 3). Continuous Research's core lifecycle risk is a silent, unexplained cadence drop that should be disclosed rather than left for readers to notice on their own (Recommendation 2). The Score-Watch alert pipeline needs an operational fix before any messaging expansion around it, and should not be promoted more heavily than it already is until it has sent at least one verified real alert (Recommendation 1).
