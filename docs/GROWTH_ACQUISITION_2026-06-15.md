# Growth Acquisition Plan — Compassion Benchmark
**Date:** 2026-06-15
**Author:** Growth Strategist agent
**Scope:** Acquisition + Activation + Lifecycle. Traffic and engagement. Not monetization mechanics (see `docs/REVENUE_BACKLOG_2026-05-28.md`).
**Builds on (do not duplicate):**
- `docs/SEO_AEO_TOP10_STRATEGY_2026-06-11.md` — knowledge-graph, structured data, AEO citation mechanics
- `docs/REVENUE_REVIEW_GROWTH_2026-05-28.md` — conversion funnel fixes
- `docs/CONTENT_STRATEGY_CONVERSION_2026-06-10.md` — CTA hierarchy
- `docs/UPDATES_REVIEW_GROWTH_2026-05-29.md` — briefing distribution
- `docs/PATTERN_ANALYSIS_THEMES_2026-06-11.md` — editorial themes + special-briefing map

**Priority model (repo standard):** Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5; higher = better).

**Independence policy:** Earned authority only. No dark patterns. No pay-for-inclusion. Entities never pay for placement, framing, or suppression. Every growth move passes this check explicitly.

---

## 0. The growth thesis in one paragraph

Compassion Benchmark already has an unusually strong content moat — 1,160 entity pages, 7 indexes, a live daily briefing pipeline, and a body of methodology jurisprudence with no close substitute. The structural gap is **distribution and identity, not content**. The site produces the kind of findings journalists cite, researchers dataset-reuse, and professionals share — but the world does not yet know to reach for it by name. The acquisition strategy must therefore do three things in order: (1) make existing content more citable and more shareable, (2) create the recurring signature moments that concentrate authority and press coverage, and (3) build the habit loop that turns one-time visitors into a returning audience. All three work without a paid-acquisition budget.

---

## 1. Acquisition channels — ranked by fit

Channels scored on: reach × audience quality × cost × alignment with the site's content model and independence positioning.

### Channel 1 — Organic / AEO (Search + Answer Engines)

**Score: 19** | Impact 5 · Align 5 · Learning 4 · Confidence 5 − Effort 3 − Risk 1

**Why it fits.** The 1,160 entity pages are already the moat. Each entity page answers a specific high-intent query ("How does [country/company] score on institutional compassion?") that has no competitive substitute. The SEO/AEO upstream work (`SEO_AEO_TOP10_STRATEGY_2026-06-11.md`) identifies the precise on-site gap: pages score data but do not *lead with one liftable extractable sentence*. Answer engines lift the first clean, dated, factual sentence. Superlative queries ("most compassionate country 2026") are high-volume and currently unserved.

**Specific levers (from upstream SEO strategy, not duplicated here):**
- Answer-first entity leads + superlative index blocks (SEO #5, audit item 4.2)
- Complete typed JSON-LD, Dataset `distribution[]`, CC-BY license field (SEO #3)
- Wikidata entity registration → Knowledge Panel → `sameAs` wiring (SEO #1)

**What growth owns here:** Ensuring every new launch moment (Section 2) has a proper press/social SEO landing page, canonical OG tags, and a dated `Report` schema so each annual artifact accrues its own citation trail.

**Metric:** GSC impressions on non-branded queries; answer-engine attribution probe (test quarterly, using the protocol in SEO AEO audit).

---

### Channel 2 — The Signature Annual Launch Moment (State of Institutional Compassion)

**Score: 18** | Impact 5 · Align 5 · Learning 4 · Confidence 5 − Effort 4 − Risk 1 *(strategic value warrants the effort)*

**Why it fits.** CPI, Freedom House, and V-Dem did not earn authority by being findable in search; they earned it by publishing a **recurring, dated, methodology-forward artifact that journalists and academics *wait for***, which produces a concentrated burst of press mentions, citations, and inbound links every release cycle. Those citations compound year-over-year. The benchmark has all the raw material for this — seven indexes, daily data, and a growing methodology jurisprudence — but no crowning release artifact.

**The concept.** An annual "State of Institutional Compassion" report, published as:
- A dedicated landing page at a stable URL (`/reports/state-2026`)
- A downloadable PDF (methodology-forward, headline rankings, biggest movers, editorial narrative)
- An embeddable summary chart (CC-BY, backlink to the report — the OWID model)
- A `Report`/`Dataset` JSON-LD block that makes it citable by name
- A press release + "for media" resource kit (cite string, embeds, editorial contacts)

**The launch playbook:**
1. Pre-announce to the newsletter list 2 weeks ahead ("The first State of Institutional Compassion drops [date]").
2. Embargo to 3–5 journalists covering governance/ESG/AI ethics 48 hours before; offer exclusive data briefing with Phil.
3. Publish + send to entire list on day-of; post LinkedIn thread (findings, not just a link).
4. Pitch dataset to 2–3 data aggregators (Google Dataset Search, Kaggle, Harvard Dataverse) same week.

**Independence check:** PASS. The report is our own methodology applied to our own scores. Editorial narrative must follow the same sourcing standards as the daily briefing (no speculative characterizations). The "for media" kit must restate: "Entities never pay for inclusion, score changes, or suppression of findings."

**Metric:** Named press/media citations within 30 days of launch; external referring domains (GSC); report-page sessions.

---

### Channel 3 — Data Journalism and Press (Earned Media)

**Score: 16** | Impact 5 · Align 5 · Learning 3 · Confidence 4 − Effort 4 − Risk 1 *(relationship-intensive; founder-owned)*

**Why it fits.** The daily briefing regularly produces findings that are primary-source material for journalists: band crossings for the US (→17.5, Jun 9), UAE (→18.4, Jun 9), India, Turkey, Bolivia; the eight-insurer AZ AG cartel suit that could simultaneously reprice eight Fortune 500 health companies. These are genuine news events. The benchmark documents them with methodology reasoning and dated evidence. Journalists need exactly this: a credible, independent, dated primary source they can cite by name.

**The mechanic.** A standing press/journalist resource (`/for-media` page) offering:
- The embeddable summary charts (CC-BY, "via Compassion Benchmark") so a journalist can put a chart in their story with a single iframe
- A cite string ("Compassion Benchmark. [Entity Name]. compassionbenchmark.com/[slug]. Accessed [date]. Independence: entities never pay for inclusion.") — copy-pasteable, structured for AP style
- The report (Channel 2) as the standing reference document
- A direct contact path for data briefing requests

**The outreach strategy** (founder-led, per SEO #7):
- Target: journalists covering ESG/governance (Reuters, Bloomberg ESG, FT, The Guardian), AI-ethics reporters (MIT Tech Review, Wired), and policy researchers at think tanks (Brookings, Freedom House adjacent).
- Pitch not the product but **specific findings** — "The benchmark documented the largest single-quarter cluster of developed-democracy band-crossings into Critical since the index launched. I'd be happy to brief you on the methodology and provide the data." This is the CPI pitch, not a press release.
- Target academic researchers who publish on corporate accountability, AI governance, and democratic backsliding — offer the CC-BY dataset for citation in their work.

**Independence check:** PASS. Outreach offers data + methodology access only. No implied quid pro quo. The independence policy is the *pitch* ("The benchmark has no commercial relationship with any scored entity, which is why the data is citable").

**Metric:** Named press citations per quarter; .edu/.gov/.org referring domains (GSC); `utm_source=press` referral sessions.

---

### Channel 4 — Social (LinkedIn-first, using the shipped OG cards)

**Score: 14** | Impact 4 · Align 4 · Learning 4 · Confidence 4 − Effort 3 − Risk 1

**Why it fits.** LinkedIn is the validated channel (the SCORE_WATCH_LAUNCH and Microsoft case study demonstrated the format works). The OG cards are now shipped. The `LINKEDIN_UTM.md` attribution convention is in place. The gap is cadence: LinkedIn distribution is episodic (spike at launch, decays). The production infrastructure is already available in the daily briefing pipeline — every significant score change is already summarized with a headline and evidence chain.

**The cadence (systematized from `REVENUE_REVIEW_GROWTH_2026-05-28.md` Candidate 5):**
- Monday: one "Mover of the Week" post — entity name, score delta, evidence summary, what it means for the reader's professional domain. Drawn from the prior week's most significant finding. Uses `utm_campaign=entity-spotlight`. The format: a shareable number (the delta) + a 2-sentence headline + a "what a professional in [domain] needs to know" one-liner + a link to the full briefing (UTM-tagged).
- Thursday: one sector-trend or cross-index pattern post — drawn from the Pattern Analysis themes (T1–T11). These are the "meta-findings" above any single entity. Uses `utm_campaign=sector-trend`.

**The social-atom gap.** The briefing already generates share-ready content (the `topSignals[0].title` format: "Slovakia 33.6 → 31.6 (Δ -2.0): European Parliament votes…"). The gap is a one-click share UI: a "Copy & share" button on the lead signal card that pre-formats the social atom with UTM tags. This is a product lever for social, not just an authoring task. *(Raised by `UPDATES_REVIEW_GROWTH_2026-05-29.md` Candidate 6.)*

**Beyond LinkedIn:** The Pattern Analysis themes (especially T1, the synchronized democratic recession, and T3, the corporate enforcement-density cluster) are exactly the "institutional finding" that Substack writers, Axios writers, and policy newsletters excerpt and link. Establishing the benchmark as a *primary source for this class of finding* — via the cite-this affordance and the for-media page — converts social sharing into inbound links rather than just impressions.

**Independence check:** PASS. Posts report factual score changes with evidence. The SCORE_WATCH_LAUNCH format already includes the independence disclaimer.

**Metric:** LinkedIn referral sessions (Umami, `utm_source=linkedin`); week-over-week consistency (target: 2 posts/week maintained for 8 weeks).

---

### Channel 5 — Embeds-as-Distribution (the OWID flywheel)

**Score: 14** | Impact 5 · Align 5 · Learning 3 · Confidence 4 − Effort 4 − Risk 1

**Why it fits.** This is the single highest-leverage *passive* acquisition channel once built: each embeddable chart carries a permanent "via Compassion Benchmark →" backlink in every host page. It is the exact mechanic that built Our World in Data's authority. We have 7 indexes × up to 3 chart types (ranking chart, sparkline, band distribution) = up to 21 embeddable assets, each independently linkable. Every journalist, researcher, Substack writer, and NGO who embeds one becomes a permanent referring domain.

**The mechanism (upstream SEO #2):**
- An `<iframe>` of our own-domain SVG ranking/sparkline chart with a "via Compassion Benchmark →" attribution footer baked in.
- CC-BY-4.0 license on the rankings data — the downstream condition for embed reuse (founder decision #F2 from SEO strategy; required before this can ship).
- A `/embed/[index]` route returning a minimal HTML page with the chart, no navigation, and the attribution footer.
- A "Embed this chart" button on every index page + entity page generating the `<iframe>` snippet.

**The "Cite this" affordance** (separate from the embed but the same motion):
- A "Cite this page" button on every entity/index/report page generating a formatted citation string (AP, Chicago, APA variants), pre-filled with the page's `Organization` name, score, date, URL, and methodology link.
- A collapsed `<details>` "Cite this briefing" block at the bottom of each daily briefing (raised by `UPDATES_REVIEW_GROWTH_2026-05-29.md` Candidate 7).

**Independence check:** PASS. The CC-BY license covers rankings *data* only, not the paid PDF research reports. The attribution footer in every embed restates independence.

**Metric:** Referring domains from embeds (GSC, target 25 in 90 days); dataset downloads (Umami event).

---

### Channel 6 — Partnerships and Syndication

**Score: 11** | Impact 4 · Align 4 · Learning 3 · Confidence 3 − Effort 4 − Risk 1 *(lower confidence — relationship-dependent)*

**Why it fits (and its limits).** Academic partnerships (offering the CC-BY dataset to researchers who agree to cite the methodology in their work), NGO partnerships (offering the embed tool to organizations that report on governance/corporate accountability), and RSS/aggregator syndication (submitting the feed to Feedly, Inoreader, and domain-specific aggregators) are all legitimate distribution multipliers. But they are founder-led, relationship-intensive, and slow to materialize. They belong in the 8-12 week wave, after the embed infrastructure (Channel 5) and the for-media page (Channel 3) are built — because those are the actual assets the partnerships point to.

**The RSS gap (existing, urgent):** The RSS/JSON feeds are already built but the item descriptions are unusable ("0 formal score changes across 0 entities" — the pipeline's `entitiesScanned` field populates as 0). This is a serialization bug that makes the feed invisible to every journalist feed monitor and RSS reader. Fixing the feed description to use `summary` or `scoreChanges[0].headline` costs 30–45 minutes and unlocks the syndication channel permanently. *(Source: `UPDATES_REVIEW_GROWTH_2026-05-29.md` Candidate 2.)*

**Specific syndication targets:**
- Google Dataset Search (via Dataset schema `distribution[]` — already in the SEO strategy Wave 1)
- Harvard Dataverse / Zenodo (CC-BY dataset deposit — creates a DOI that academics cite)
- Feedly, Inoreader (RSS subscription — fix feed first)
- GIJN (Global Investigative Journalism Network) — data journalism resource listing

**Independence check:** PASS. Syndication shares our own dated findings; no commercial framing in the feed. Partnership offers are data + attribution only.

**Metric:** Feed subscribers; new referring domains from aggregators; Zenodo/Dataverse citations.

---

## 2. The activation path — first visit to subscriber

**The problem.** The activation funnel currently has three structural defects:
1. The primary subscribe ask is placed *before* value is delivered (the briefing header fires four equal CTAs before the reader has read the briefing — `DailyBriefingHeader.tsx`).
2. The intent peak — the "You're all caught up" completion block — has no CTA at all (`CompletionBlock.tsx` L80–98 is a dead end).
3. The highest-intent page on the site, `/updates/forward-watch` (a reader staring at dated triggers for named entities they care about), has zero conversion capture.

**The activation journey (corrected):**

```
Entry (search / LinkedIn / referral)
  ↓
[Entity page or Daily Briefing]
  — free value delivered first —
  — no ask until value demonstrated —
  ↓
[Intent peak: "You're all caught up" / score card / forward-watch trigger]
  — single, benefit-led subscribe ask —
  — copy: "Don't come back to find out — get the next one." —
  — action: one email field, one button —
  ↓
[Subscribed]
  — immediate: Welcome email (methodology context, what the score means) —
  — day 3: "Since you started watching [entity] — here is what moved" —
  — day 14: Score-Watch upgrade CTA —
```

### Activation fixes (in execution order)

**A1 — Move the primary CTA to the intent peak.**
The `CompletionBlock` ("You're all caught up") should contain one inline subscribe form (`NewsletterSignup variant="inline-compact"` `source="updates-completion"`). Benefit-led copy: "Don't come back to find out — get the next one. One email every Friday with the week's most consequential score moves. Free. ~1,160 entities, evidence-linked." This is the highest-priority conversion fix on the site. *(Source: `CONTENT_STRATEGY_CONVERSION_2026-06-10.md` Candidate 1, Priority 16.)*

**A2 — Add Score-Watch capture to `/updates/forward-watch`.**
A band above "Open triggers": "These dates won't email themselves. Watch any entity below and get the alert the morning its score actually moves." Per-row "Watch →" inline link for rows with a resolvable `slug`. *(Source: `CONTENT_STRATEGY_CONVERSION_2026-06-10.md` Candidate 3, Priority 14.)*

**A3 — Entity pages: close the evidence chain.**
Every entity score change card should link to the source briefing (`/updates/[date]`). The `latestChange.date` field is already present. This one link closes the entity → methodology reasoning gap and gives a returning visitor a path deeper into the product rather than a dead end. *(Source: `CONTENT_STRATEGY_PM_2026-06-10.md` Candidate 3, Priority 15.)*

**A4 — Make the `/updates/forward-watch` ledger discoverable.**
Add a persistent "View Scoring Outlook →" footer link inside `ForwardTriggerCountdown` and a secondary nav link under the date tabs. The accountability ledger exists but is currently invisible unless the visitor already knows the URL. *(Source: `CONTENT_STRATEGY_PM_2026-06-10.md` Candidate 5, Priority 16.)*

**A5 — Homepage: single primary action.**
The hero currently offers three equal buttons. The correct hierarchy: Explore Indexes (primary) → Read Methodology (secondary text link) → drop Purchase Research from the hero. The newsletter capture mid-page should be framed with a benefit headline, not left as a bare form. *(Source: `CONTENT_STRATEGY_CONVERSION_2026-06-10.md` Candidate 6, Priority 11.)*

### The aha moment

The aha moment for a first-time visitor is the moment they understand **what the score change means for something they care about**. It is not the methodology explainer and not the band taxonomy. It is the sentence: "UnitedHealth downgraded 11.4 → 10.2. CEO Witty departed abruptly mid-May amid expanding DOJ criminal probe." For an investor, a journalist, or an ESG analyst, that sentence is immediately recognizable as useful. Everything in the activation path must route the visitor to *that sentence about an entity they care about* as fast as possible, then catch them at the completion peak.

---

## 3. Lifecycle — newsletter and Score-Watch as a habit loop

### The habit loop (current state and gap)

The current email infrastructure:
- Listmonk is live
- Score-Watch alerts are transactional (entity-specific, trigger-driven)
- A weekly digest exists (Friday)
- No onboarding sequence from entity-page opt-in to Score-Watch purchase
- No daily send despite a daily publication cadence

The gap: **the return-visit forcing function is weak**. A subscriber who reads the Friday digest has no consistent reason to visit the site between Fridays. The daily briefing exists but has no push mechanism. Returning readers depend on: (1) manually checking the site, (2) RSS (currently broken — see Channel 6 fix), or (3) a LinkedIn post. None of these is a habit-forming push event.

### The habit loop to build

**Spine: the Friday weekly digest (existing, formalize)**
The weekly digest should be designed around the period's sharpest editorial finding — the week's biggest score change, with the exact entity, delta, band movement flag, and a 3-sentence "why it matters." Not a generic summary. The format: one "lead signal" (the largest or most consequential move), two "also notable" items, one "forward watch" trigger with a date. This is habit-forming because it is *specific*, *timely*, and *actionable*. The reader knows something that matters about an entity they track before the news cycle catches up.

**Trigger layer: Score-Watch alerts (existing, extend)**
Score-Watch alerts are already the highest-quality re-engagement mechanism: a subscriber gets a direct notification when an entity they specifically chose to watch changes score. The activation gap is that many entities change slowly or not at all, leaving Score-Watch subscribers with no engagement event. The lifecycle fix for "quiet entity" churn is an annual entity summary email (what the benchmark found about this entity over the year, forward triggers, related entities) sent at the 11-month mark before renewal.

**Onboarding sequence: free → paid (missing, build)**
A 3-email sequence triggered from entity-page opt-in:
- Email 1 (immediate): "You're watching [Entity Name] — here's its current score and what the 8 dimensions measure." Methodology context. No paid CTA.
- Email 2 (day 3, or on first score change, whichever comes first): "Since you started watching [Entity Name] — here's what moved / how it ranks in its peer group." Soft Score-Watch CTA: "Get this in your inbox the morning it happens, not in the weekly digest."
- Email 3 (day 14): "One thing about [Entity Name] worth knowing." Score summary + direct Score-Watch upgrade CTA with price.

This sequence requires only Listmonk template work. It converts the highest-quality leads (entity-scoped opt-ins) into paid Score-Watch subscribers at near-$0 CAC.

**Special-briefing cadence (new habit layer)**
The Pattern Analysis (`PATTERN_ANALYSIS_THEMES_2026-06-11.md`) identified 7 special-briefing concepts. The two highest-impact for subscriber retention and acquisition are:
- **SB-1 (The Democratic Recession Report)** — monthly, event-triggered on each new Critical band-crossing driven by governance. The T1 theme (US, India, Turkey, Bolivia, UAE band crossings) is exactly the signature finding that journalists, researchers, and engaged subscribers return for. This briefing becomes the primary "reason to forward to a colleague" content type.
- **SB-5 (What Good Looks Like: Exemplar + Reversal Briefing)** — monthly, counter-programming the downside-heavy daily flow. Systematic coverage of high-compassion exemplars and verified upward reversals. This addresses the editorial blind spot (zero upside coverage in 30 briefings) and creates a content type that ESG/CSR audiences will share and subscribe for.

Both briefings use existing pipeline infrastructure. The editorial cadence (publishing once/month on a predictable schedule) is the habit anchor, not the specific content.

### Cadence map

| Frequency | Channel | Content | Re-engagement purpose |
|---|---|---|---|
| Daily (internal only) | Pipeline | Daily briefing published to site | Content production |
| Weekly (Friday) | Email → Listmonk | Digest: lead signal + 2 notable + 1 forward trigger | Primary habit anchor |
| Monthly | Email + site | SB-1 Democratic Recession Report | Authority + subscriber retention |
| Monthly | Email + site | SB-5 Exemplar + Reversal Briefing | Share-worthy content |
| Event-triggered | Email → Listmonk | Score-Watch alert: entity score changed | Highest-value re-engagement |
| Event-triggered | Email → Listmonk | Forward-trigger resolution | Score-Watch re-engagement |
| 11-month mark | Email → Listmonk | Quiet-entity annual summary | Pre-renewal retention |

---

## 4. Growth experiments — ranked backlog

**Scoring model:** Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.

---

### Experiment 1 — RSS feed serialization fix + feed submission

**Hypothesis:** The RSS feed currently shows "0 formal score changes across 0 entities" in every item description because `pipeline.entitiesScanned` is 0 in the generated feed. Fixing it to use `summary` or `scoreChanges[0].headline` from the briefing JSON will make the feed usable to journalists, RSS readers, and aggregators, increasing feed subscribers and referral sessions.

**Mechanism:** One-line change in the feed generation script: replace the count sentence in `<description>` with a truncated `summary` field (≤250 chars) from the briefing JSON. Prefix item `<title>` with the date ("May 29: "). Apply the same fix to `feed.json`. Submit fixed feed to Feedly, Inoreader, and Google News.

**Target metric:** RSS/feed subscribers; "0 formal score changes" count in feed descriptions drops to zero; new feed subscriber count (measurable via Worker/Umami).

**Effort:** S (30–45 minutes). **Independence check:** PASS. Feed carries the same published content as the site.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 3 | 5 | 1 | 1 | **14** |

---

### Experiment 2 — "You're all caught up" completion-block subscribe capture

**Hypothesis:** Moving the primary newsletter subscribe ask from the briefing header (before value is delivered) to the `CompletionBlock` (immediately after the reader finishes the briefing — peak satisfaction) will materially increase subscribe-to-visit conversion rate.

**Mechanism:** Add `<NewsletterSignup variant="inline-compact" source="updates-completion" />` inside `CompletionBlock.tsx` with the copy "Don't come back to find out — get the next one." Remove the competing subscribe button from the briefing header (`DailyBriefingHeader.tsx`). Measure via `source=updates-completion` subscriber attribution in Listmonk.

**Target metric:** Weekly new subscribers attributed to `source=updates-completion` vs. the prior header baseline. Secondary: briefing-page bounce rate.

**Effort:** S (component placement + copy, 1–2 hours). **Independence check:** PASS. Free email, honestly framed.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 5 | 4 | 5 | 2 | 1 | **16** |

---

### Experiment 3 — One-click social share atom on the lead signal card

**Hypothesis:** The daily briefing's `topSignals[0].title` is already written in share-ready format ("Entity: old → new (Δ). Headline."). Adding a one-click "Copy & share" button that pre-formats this as a social atom with UTM parameters will increase LinkedIn sharing and referral sessions without requiring authoring effort beyond what the pipeline already produces.

**Mechanism:** A client-side "Copy" button in or below `LeadSignalCard.tsx` that calls `navigator.clipboard.writeText(preformatted)`. The pre-formatted text: `"{Entity}: {oldScore} → {newScore} (Δ {delta}). {headline} — Compassion Benchmark compassionbenchmark.com/updates/{date}?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content={leadSlug}"`. Optional: a LinkedIn share URL constructed with UTM params. Fire a `share_briefing` Umami event on click.

**Target metric:** `share_briefing` events per briefing (Umami); LinkedIn sessions with `utm_campaign=daily-briefing` (Umami, 14-day window).

**Effort:** S-M (client component, 60–90 minutes). **Independence check:** PASS. Share text reproduces published findings only.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 4 | 3 | 2 | 1 | **12** |

---

### Experiment 4 — Systematized "Mover of the Week" LinkedIn post cadence (8-week test)

**Hypothesis:** The SCORE_WATCH_LAUNCH and the Microsoft case study demonstrated the "entity moved, here is the evidence, here is what it means for your professional domain" LinkedIn format drives score_watch_click events. Running this format on a fixed weekly cadence (Monday entity spotlight + Thursday sector trend) for 8 consecutive weeks will increase LinkedIn referral sessions by ≥50% vs. the prior 8-week episodic baseline.

**Mechanism:** A weekly production commitment: every Monday, one "Mover of the Week" post using the existing format (entity, delta, evidence summary, professional-domain relevance, Score-Watch CTA). Every Thursday, one sector-trend post drawn from the Pattern Analysis themes (T1, T3, T4 are the highest-engagement candidates). All posts carry `utm_campaign=entity-spotlight` or `utm_campaign=sector-trend`. Source material: already generated by the daily pipeline.

**Target metric:** LinkedIn referral sessions (Umami, `utm_source=linkedin`) weeks 1–8 vs. prior 8-week baseline. Secondary: `score_watch_click` events traceable to `utm_campaign=entity-spotlight`.

**Effort:** M (ongoing; 30–45 minutes of authorial work per post, 2 posts/week). **Independence check:** PASS. Posts report factual score changes with evidence. Independence disclaimer in post footer.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 3 | 5 | 4 | 3 | 2 | 1 | **12** |

---

### Experiment 5 — Embeddable chart + "Cite this" widget (embed-as-backlink engine)

**Hypothesis:** Providing an embeddable CC-BY chart for each of the 7 indexes (with a permanent "via Compassion Benchmark →" backlink baked into the embed) will generate passive, compounding inbound backlinks from journalists, researchers, NGOs, and Substack writers who reuse the data — without requiring outreach to each individual publisher.

**Mechanism:** A `/embed/[index]` route returning a minimal, no-nav page with the index ranking chart and an attribution footer. An "Embed this chart" button on each index page generating the `<iframe>` snippet. A "Cite this page" affordance on each entity, index, and report page generating a formatted citation string. Requires the CC-BY-4.0 license decision (founder action #F2 from SEO strategy) as a prerequisite.

**Target metric:** Referring domains from embeds (GSC, target 25 in 90 days); `embed_chart_click` + `cite_this_click` events (Umami). Secondary: new referring domains as a share of total referring domains.

**Effort:** M-L (embed route + cite widget + chart-backlink component; 1–2 weeks engineering). **Independence check:** PASS. CC-BY covers rankings data only, not paid reports. Attribution footer restates independence.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 5 | 3 | 4 | 4 | 1 | **12** |

---

### Experiment 6 — Annual "State of Institutional Compassion" report launch (first edition)

**Hypothesis:** Publishing a dated, methodology-forward annual report as a stand-alone landing page + downloadable PDF + embeddable summary chart will concentrate press citations and inbound links in the same way that CPI, Freedom House, and V-Dem's annual releases do — producing a measurable spike in branded and non-branded search impressions, external citations, and newsletter subscriber growth within 30 days of launch.

**Mechanism:**
- Landing page at `/reports/state-2026` with `Report`/`Dataset` JSON-LD, canonical OG tags, and a press-ready format.
- PDF covering: headline rankings by index, biggest movers (and reversals), editorial narrative on the period's signature finding (the synchronized democratic recession), methodology notes.
- Embeddable summary chart (from Experiment 5).
- Press/media kit: cite string, embargo offer to 3–5 journalists, `/for-media` page.
- Newsletter promotion (2-week pre-announce + day-of send).
- LinkedIn thread on launch day.

**Target metric:** Named press/media citations in 30 days (baseline: 0 → target: 5); external referring domains delta post-launch (GSC); newsletter subscriber growth in launch week vs. trailing 4-week average.

**Effort:** L (editorial + design + press outreach; 3–4 weeks). **Independence check:** PASS. Report is our methodology applied to our data. Editorial narrative follows the same sourcing standards as the daily briefing. For-media kit restates independence policy.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 5 | 4 | 5 | 4 | 1 | **14** |

---

### Experiment 7 — Special briefing: "The Democratic Recession Report" (monthly, event-triggered)

**Hypothesis:** Publishing a monthly special briefing on the period's signature finding — the synchronized slide of democracies from Developing into Critical — will attract journalists, researchers, and engaged civic-sector subscribers who do not currently follow the daily cadence, and will generate the class of external citation (by name, by finding) that builds knowledge-graph authority.

**Mechanism:** A monthly special briefing (using the existing special-briefing infrastructure at `/updates/special`) covering: (1) all countries that crossed into or deepened in the Critical band on governance-driven rulings in the trailing month; (2) the methodology rulings that drove each crossing; (3) the Hungary counter-case (the only sustained sustained upgrade arc); (4) one forward trigger with a specific date. Published on a fixed day (first Thursday of the month). Promoted to the newsletter list and LinkedIn.

**Target metric:** Sessions from organic/social to special-briefing pages; newsletter subscriber growth attributable to SB-1 promotion; external citations of the Democratic Recession Report by name.

**Effort:** M (editorial production per edition; the data and rulings are already in the daily pipeline). **Independence check:** PASS. Editorial synthesis over published assessments. No scores are proposed or changed. Independence policy: entities never pay for coverage in the special briefing.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 5 | 4 | 4 | 3 | 1 | **13** |

---

### Experiment 8 — "For Media" page + journalist cite-string infrastructure

**Hypothesis:** A dedicated `/for-media` page offering the embeddable charts, the cite string, the methodology summary, and a data briefing request form will reduce the friction for journalists to cite the benchmark — increasing the rate of named press citations (currently near-zero) by providing what journalists actually need when they want to use data journalism primary sources.

**Mechanism:**
- A `/for-media` page (static, build-time) with: the cite string in copy-pasteable format; embed snippet generator; link to the CC-BY dataset; methodology summary (one-page PDF); contact path for data briefing requests.
- On every entity page and index page: a small "For media" link (below the cite affordance) routing to `/for-media`.
- The "Cite this" collapsed `<details>` block on each briefing page (replicating the Wikipedia citation standard for primary-source journalism use).

**Target metric:** `/for-media` page sessions; `cite_this_click` events; press citations per quarter (tracked manually in an AEO citation log).

**Effort:** M (one static page + cite widget). **Independence check:** PASS. The page provides access tools only. Independence policy is stated explicitly on the page.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 5 | 3 | 4 | 2 | 1 | **13** |

---

## 5. Experiment backlog — ranked summary

| # | Experiment | Priority | Effort | Metric it moves | Owner |
|---|---|---|---|---|---|
| 1 | Completion-block subscribe capture | **16** | S | Newsletter subscribers (source=updates-completion) | FE + Growth |
| 2 | RSS feed serialization fix + submission | **14** | S | Feed subscribers; referral sessions | BE/PIPE |
| 3 | Annual State of Institutional Compassion report | **14** | L | Press citations; referring domains; subscriber growth | FOUNDER + FE + Growth |
| 4 | Special briefing SB-1: Democratic Recession Report | **13** | M | Organic sessions; subscriber growth; press citations | PIPE + Growth |
| 5 | "For Media" page + cite-string infrastructure | **13** | M | Press citations; `/for-media` sessions | FE + Growth |
| 6 | One-click social share atom on lead signal card | **12** | S-M | `share_briefing` events; LinkedIn referral sessions | FE |
| 7 | Systematized LinkedIn cadence (8-week test) | **12** | M | LinkedIn referral sessions (50% lift target) | FOUNDER (authoring) |
| 8 | Embeddable chart + Cite-this widget | **12** | M-L | Referring domains (25 in 90 days); embed clicks | BE + FE + FOUNDER (CC-BY) |

---

## 6. The single highest-leverage growth move

**Ship the completion-block subscribe capture (Experiment 2).**

It is the only change that simultaneously fixes the biggest structural mistake in the current funnel (asking before value is delivered) and capitalizes on the site's strongest existing asset (a 40-50 briefing archive read by real humans who reach the end). It costs 1–2 hours of engineering, carries near-zero independence risk, and generates a clean, attributable learning signal via `source=updates-completion` subscriber tracking. Every visitor who reads a full briefing and clicks "You're all caught up" is at the highest possible point of demonstrated interest — and that moment currently captures nothing.

The other high-leverage move that cannot wait is the **RSS feed fix (Experiment 1)**: it is 30–45 minutes of work that permanently unlocks the syndication channel. Every briefing published while the feed shows "0 formal score changes" is a missed distribution event.

---

## 7. 90-day sequencing

**Weeks 0–2 (highest leverage, minimal effort — do these first):**
- Experiment 2: completion-block subscribe capture
- Experiment 1: RSS feed serialization fix + feed submission
- Activation fix A4: add forward-watch link from briefing `ForwardTriggerCountdown`
- Activation fix A3: entity page → source briefing link

**Weeks 2–6 (medium effort, high strategic alignment):**
- Experiment 3: one-click social share atom
- Experiment 4: systematized LinkedIn cadence (start the 8-week test)
- Experiment 7: Democratic Recession Report (SB-1) — first edition
- Experiment 8: `/for-media` page + cite-string infrastructure
- Activation fix A2: Score-Watch capture on `/updates/forward-watch`

**Weeks 6–12 (L-effort, compounding returns):**
- Experiment 6: annual "State of Institutional Compassion" report — plan, edit, launch
- Experiment 5: embeddable chart + cite-this widget (after CC-BY decision)
- Channel 3 outreach: press/journalist briefings, academic dataset offers
- Channel 6 syndication: Zenodo/Dataverse deposit, Feedly submission

**Ongoing:**
- Monday + Thursday LinkedIn cadence
- Monthly SB-1 Democratic Recession Report
- Monthly SB-5 Exemplar + Reversal Briefing

---

## 8. Independence guardrail (comprehensive)

Every growth move above passes the independence policy. The specific points of contact where independence must be actively maintained:

- **The for-media page and press outreach** must state explicitly: "Entities never pay for inclusion, score changes, or suppression of findings. Our research is funded by access and interpretation services, not by scored entities." This is the pitch, not a disclaimer to bury.
- **The CC-BY license** (required for Experiment 5) covers rankings data only. Paid research reports are explicitly out of scope. The license text must make this boundary clear so "free dataset" is never read as "pay for inclusion."
- **The annual report and special briefings** are editorial syntheses over published assessments. No scores are proposed or changed in the preparation of growth content. The methodology rulings that produced each finding are cited by name.
- **LinkedIn posts** report factual score changes with evidence. No characterizations that go beyond the methodology record. The SCORE_WATCH_LAUNCH format (independence disclaimer in the post footer) is the template for all entity-spotlight posts.
- **Wikidata and Wikipedia work** (Channel 1, SEO strategy #1): Wikidata items are neutrally sourced from real published methodology/data. No self-authored Wikipedia article. Authority is earned via independent secondary citations.

---

*Growth Strategist agent | 2026-06-15 | Downstream: coordinator, analytics, product-manager*
*Artifact path: `docs/GROWTH_ACQUISITION_2026-06-15.md`*
