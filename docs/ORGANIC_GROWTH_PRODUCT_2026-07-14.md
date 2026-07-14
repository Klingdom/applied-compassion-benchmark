# Organic Growth Content Product Roadmap
**Version:** 1.0 · **Date:** 2026-07-14 · **Owner:** Product (PM Agent)
**Status:** Recommendation — no build authorized. Downstream: system-architect (new indexes), special-briefing agent (briefings), benchmark-research (entity lists/scoring), growth/analytics (measurement).

**Context this builds on:** CLAUDE.md (8 published indexes), `site/src/data/indexRegistry.ts` (canonical index registry, consolidated 2026-07-12), `docs/PRD_UNIVERSITY_INDEX.md` + `docs/ARCHITECTURE_UNIVERSITY_INDEX.md` (how the 8th index was scoped and wired), `docs/SPECIAL_BRIEFING_CADENCE.md`, `docs/SPECIAL_BRIEFING_CANDIDATES_MASTER_2026-06-16.md`, `research/special-briefings/*.md` (16 shipped briefings + flagship), `docs/GROWTH_UNIVERSITY_INDEX_LAUNCH.md`, `docs/REVENUE_MODEL.md`, `docs/NONPROFIT_SIMPLIFY_MASTER_2026-07-12.md` (the site is shedding the commercial plane), `docs/GROWTH_MASTER_2026-06-15.md` and `docs/SEO_AEO_TOP10_STRATEGY_2026-06-11.md` (organic/AEO diagnosis this roadmap must not duplicate).

**Success definition for this doc (per the nonprofit reframe):** every candidate below is scored on **citation reach + organic/AEO traffic + free-subscriber/donor growth** — NOT revenue. Where a candidate's rationale in an older doc was commercial (e.g. Score-Watch upsell), that rationale is dropped here.

---

## 0. What NOT to repeat (read before proposing anything new)

**16 special briefings + 1 flagship already shipped** (`research/special-briefings/`): floor-and-critical, exemplars, layoffs-despite-profits, ai-governance, allegation-indictment-ruling, what-the-product-is-for (robotics/AI purpose), state-of-exception, middle-of-the-scale, equity-tax, aid-obstruction, university-index + introducing-the-university-index (launch pair), the-denial-machine (health-insurer prior-auth denials), famine-as-a-scored-event, america-at-250, and the flagship state-of-institutional-compassion-2026. Any new briefing must be **distinct** from all 16, not a repackaging.

**8 published indexes** (`indexRegistry.ts`): countries, us-states, fortune-500, ai-labs, robotics-labs, us-cities, global-cities, universities.

**Unshipped runners-up already identified** (`SPECIAL_BRIEFING_CANDIDATES_MASTER_2026-06-16.md`): The Agentic Gap, The Extractive Discount, The Recovery Arc, The Wellbeing Gap/Integrity Delta. I re-scored these below rather than re-discovering them from scratch.

**Already-recommended organic infrastructure this doc does NOT re-propose** (still open, owned by growth/SEO, not PM): RSS feed bug fix, `sameAs` seeding for 967 entities, entity-page peer-hub linking, Wikidata entity, CC-BY embeds, per-dimension explainer pages (I do include the explainer-pages content product below because it is a genuine repeatable content type, but the SEO wiring around it is growth's job, not a new one here).

**Architectural constraint that affects every new-index candidate:** adding a 9th index still touches ~9-11 locations even after the 2026-07-12 `indexRegistry.ts` consolidation (`entities.ts` EntityKind union, `entityHref.ts` KIND_TABLE, sitemap, `export-public-data.mjs`, `validate-indexes.mjs`, `build-llms.mjs`, `entityCount.ts`, chart/render maps, nav) — per `ARCHITECTURE_UNIVERSITY_INDEX.md` §1. This is real, non-trivial engineering effort, not a data-entry task. Every index candidate below is rated with this floor in mind.

---

## 1. Prioritized candidate table

**Priority = Impact (1-5) + Confidence (1-5) − Effort (1-5).** Higher = do sooner. Impact is measured against citation reach + organic traffic + subscriber/donor growth only.

| ID | Candidate | Type | Organic + citation rationale | Data/evidence availability | Impact | Effort | Confidence | Priority |
|----|-----------|------|-------------------------------|------------------------------|:--:|:--:|:--:|:--:|
| C1 | Monthly "Biggest Movers" digest | content product | Fully automated recurring freshness signal; "who moved and why" is exactly what journalists come back for monthly; zero new methodology | Derived entirely from existing score-change/PENDING_CHANGES data | 4 | 1 | 5 | **8** |
| C2 | The Extractive Discount (F500 by business model) | briefing | Most data-backed unshipped candidate on file; clean sector-mean gradient (Coal 13.3 → Insurance 63.1) is an instant, defensible headline for business press | 100% derived from published `fortune-500.json`; no new evidence needed | 4 | 1 | 5 | **8** |
| C3 | Per-dimension explainer pages (8 pages: AWR/EMP/ACT/EQU/BND/ACC/SYS/INT) | content product | Owns the informational-query class ("what does Equity mean in a compassion score"); evergreen AEO asset, cited by every future briefing that uses the vocabulary | `dimensions.ts` already has full anchors/rubrics — this is packaging, not research | 4 | 2 | 5 | **7** |
| C4 | Annual "State of Institutional Compassion 2027" (2nd edition, committing the cadence) | content product | The CPI/Freedom House mechanism only works if it repeats; a 2nd edition proves this is an institution, not a one-off, and is the strongest Wikipedia-notability evidence available | Reuses the 2026 template + a full year of new score deltas | 5 | 3 | 5 | **7** |
| C5 | Forward Watchlist ("Entities Approaching a Band Crossing, Q_ 2026") | content product | Turns the existing forward-trigger/PENDING_CHANGES data into a return-visit hook; "did X cross the line" is a checkable prediction, which is unusually citable | Reuses existing forward-watch/trigger data already computed for Score Watch | 3 | 1 | 4 | **6** |
| C6 | The Downgrade Arc ("How Institutions Fall" — Humana, Bolivia, El Salvador as a cross-sector narrative pattern) | briefing | A longitudinal, narrative-journalism-friendly read using 3 real band-crossing case studies already in the record; distinct from the static floor-and-critical briefing | Fully interpretive over published history/deltas already in the daily-research record | 4 | 2 | 4 | **6** |
| C7 | What It Takes to Hit the Floor (the genocide/atrocity-finding evidentiary taxonomy) | briefing | A trust/methodology deep-dive: what specific adjudicated-finding classes (ICC/ICJ/UN Commission of Inquiry) actually trigger the 0.0 floor vs. what doesn't — the rigor story that earns skeptical-journalist citations | Interpretive; draws on existing floor-cohort evidence files, sharpened into a taxonomy | 4 | 2 | 4 | **6** |
| C8 | The Transparency Cliff (AI-lab governance/disclosure practices) | briefing | Named directly in the daily-research pattern log; distinct from the published "AI Governance" and "What the Product Is For" briefings — this one is specifically about disclosure/opacity as its own scored signal | Interpretive over `ai-labs.json` + public disclosure/enforcement record | 4 | 2 | 3 | **5** |
| C9 | Hospitals & Health Systems Index | index | Largest untapped organic vertical on the roadmap — "is my hospital safe/ethical" is a mass-market search behavior; direct narrative continuation of the already-published Denial Machine briefing (insurers deny → do hospitals also fail patients?); healthcare journalism is a huge, hungry beat | Strong: CMS Hospital Compare star ratings, Leapfrog Safety Grades, OSHA, NLRB filings, medical-debt-suit records, charity-care-ratio filings (990s for nonprofit systems) | 5 | 4 | 4 | **5** |
| C10 | The Recovery Arc ("Does Effort Count?" — Hungary +22pts in 6 weeks, still Functional) | briefing | Evergreen framework-teaching piece (the counterpart to the Downgrade Arc); explains why improvement is graded on outcome, not effort — a defensible, citable methodology stance | Interpretive over one existing published score-history sequence | 3 | 2 | 4 | **5** |
| C11 | Sports Leagues Index | index | Genuinely unoccupied lane — no comparator scores sports leagues on institutional conduct (player safety, concussion litigation, minor-league wage suits, labor disputes); small N keeps effort low; sports-labor journalism crossover is a real, underused citation channel | Moderate: CBA text, union grievances, concussion-litigation settlements, minor-league wage class actions — thinner than corporate/government but workable for ~20-30 major leagues | 3 | 2 | 4 | **5** |
| C12 | The Sahel Calibration Question (low-evidence-region scoring honesty) | briefing | Named directly in the prompt's pattern list; a transparency/trust piece parallel to the University Index's "confidence" flag — explains publicly how the benchmark handles sparse-evidence regions instead of hiding the uncertainty | Interpretive over existing Sahel-cohort evidence + the University Index confidence-flag precedent | 3 | 2 | 3 | **4** |
| C13 | The Response Window (time-to-relief across the floor/disaster cohort) | briefing | A concrete, citable operational metric ("days from disaster onset to verified relief access") layered on top of the Aid Obstruction and Famine-as-Scored-Event briefings without repeating either | Interpretive; needs a light timeline-reconstruction pass across several already-scored disaster events | 3 | 2 | 3 | **4** |
| C14 | Global Banks Index (top 100 by assets, non-US-heavy) | index | Post-2008 public interest in bank conduct is durable; strong enforcement-record evidence base (OCC/Fed/CFPB, redlining settlements) | Good, but **~40-50% entity overlap with Fortune 500** (JPMorgan, BofA, Citi, Wells Fargo, Goldman already scored) — needs a dedup rule before this is a real "new" index, not a partial re-list | 4 | 4 | 3 | **3** |
| C15 | Tech Platforms & Social Media Index | index | High policy-press interest (child safety, content moderation, EU DSA enforcement); a real, unoccupied lane if scoped to platforms not already in F500/AI-labs | **Significant overlap risk**: Meta, Alphabet, Amazon, Microsoft, Apple are likely already F500 entities; the genuinely novel set (ByteDance/TikTok, X, Discord, Telegram, Tencent/WeChat) is smaller than it first appears | 5 | 4 | 3 | **4** |
| C16 | NGOs & Foundations Index (the self-referential/meta angle) | index | Intriguing "who watches the watchers" citation hook, but scoring the same sector class the benchmark's own funders and grant relationships sit within is a direct independence-policy hazard (see `GRANT_FUNDER_MAP` logic) | Uneven; large NGOs file 990s and have some enforcement/watchdog record, but many operate with little public scrutiny | 3 | 3 | 2 | **2** |
| C17 | Media Organizations Index | index | Awkward positioning — the outlets that would cover/cite this index are also its subjects; low incremental organic pull relative to the reputational complexity | Uneven; newsroom labor disputes and ownership-conduct records exist but are patchy | 2 | 3 | 2 | **1** |
| C18 | US Counties Index | index | Cannibalizes existing US States/US Cities traffic rather than opening new demand; ~3,143 entities is a scale/evidence mismatch — most counties have almost no independently verifiable public-conduct evidence | Weak for the median county; only the largest ~100 counties would have workable evidence, which reproduces US Cities rather than adding a genuine new vertical | 2 | 4 | 2 | **0** |

---

## 2. Reads on the index candidates that need a scope call before anything else

Several "obvious" new-index ideas from the brainstorm are **already inside Fortune 500** as a subset, not a new entity universe:
- **Airlines, pharma, defense contractors, insurers, retailers, energy majors** — the individual companies (Delta, Pfizer, Lockheed, UnitedHealth, Walmart, ExxonMobil) are almost certainly already scored F500 entities. Building a "new index" here would either duplicate existing entities under a second `kind` (a data-integrity problem the `indexRegistry.ts` invariant guard is specifically designed to catch and reject) or require a costly dedup layer.
- **The correct product for these sectors is a sector-cut report or briefing** (re-slice existing F500 data by sector, no new entities, no new pipeline) — see C2 (Extractive Discount) as the proof of concept. The Denial Machine briefing (already shipped) is the same move applied to health insurers.
- **Global Banks and Tech Platforms (C14, C15)** are the two candidates where a genuine net-new entity set exists (non-US banks; non-US-listed/private platforms) but the overlap is still 40%+ — flagged explicitly in the table so benchmark-research scopes the entity list as "net-new only" before committing, not as a duplicate re-list.

**Recommendation:** do not build airline/pharma/defense/insurer/retailer/energy "indexes." Redirect that appetite into sector-cut briefings and reports (see §4), which are lower effort, higher confidence, and reuse the F500 pipeline with zero new methodology risk.

---

## 3. Recommended next index to build: Hospitals & Health Systems Index (C9)

### Justification
- **Matches the University Index precedent exactly**: institution-level scoring (not per-hospital-campus), a population with acute personal stakes (patients, nurses, residents), strong public-record evidence (CMS Hospital Compare, Leapfrog Safety Grades, OSHA citations, NLRB filings, nonprofit-hospital charity-care-ratio 990 data, medical-debt-lawsuit records), and a natural press hook.
- **It is a narrative sequel, not a cold start.** The already-shipped Denial Machine briefing established "insurers deny care" as a scored finding; a Hospitals index lets the benchmark ask the natural follow-up question the reader already has: "the insurer denied it — did the hospital itself treat the patient with dignity along the way?" That continuity is a built-in press and social hook the University Index did not have at launch.
- **Organic demand is mass-market, not niche.** "Is [hospital name] safe" / "best hospital for [condition] near me" is one of the highest-volume local-search behaviors that exists; a compassion-specific cut is differentiated from existing prestige/clinical-outcome rankings (US News Hospital Rankings, Leapfrog) the same way the University Index differentiated from US News.
- **Entity count is tractable**: ~100-150 largest US hospital systems (legal parent entity, mirroring the University Index's flagship-institution rule) keeps effort bounded — not the full ~6,000 US hospitals.

### What is explicitly NOT in scope (flag now, decide before benchmark-research starts)
- Per-campus/per-facility scoring within a system (same exclusion as University Index's per-school rule).
- Non-US health systems in v1 (US-only keeps evidence-availability consistent; international expansion is a v2 decision).
- Physician- or department-level scoring.

### Missing / assumption flags
- ASSUMPTION: benchmark-research compiles the ~100-150 entity list using a composite of CMS/Leapfrog/Definitive Healthcare system-size rankings, mirroring the three-source-composite method used for Universities.
- MISSING: no baseline organic traffic for hospital-adjacent queries on the site today — success targets should be absolute, not lift-based, exactly as the University Index PRD handled this gap.
- MISSING: a confirmed system-architect estimate of the 9-11-touchpoint wiring cost post-`indexRegistry.ts` consolidation — get this before committing a launch date.

### Success measures (citation/traffic/subscriber only — no revenue metric)
- **Launch (30 days):** 500 unique visitors to the index page; 1 inbound media citation (health-journalism beat: Kaiser Health News/KFF Health News, STAT, Modern Healthcare).
- **90 days:** 2,000 unique visitors; 3 external citations; 25 free Score-Watch/newsletter subscriptions attributable to `source=hospitals-index`.
- **Success is incomplete if:** no citation occurs in 90 days (diagnose: score compression or insufficient outreach, not the index itself) — same diagnostic discipline as the University Index PRD.

A full PRD (entity-selection method, per-entity schema, 8-dimension signal map, acceptance criteria) should follow the exact structure of `docs/PRD_UNIVERSITY_INDEX.md` if this is approved — that document is the template, not a one-off.

---

## 4. 6-briefing editorial calendar

Sequenced for **fastest credible cadence first**, then trust-building, then narrative, ending on an index-launch companion (which depends on §3 shipping — swap order if the index timeline slips).

| # | Briefing | Why this slot | Depends on |
|---|----------|----------------|------------|
| 1 | **The Extractive Discount** (C2) | Zero new evidence work, ships fastest, rebuilds monthly cadence momentum immediately | Nothing — data already published |
| 2 | **What It Takes to Hit the Floor** (C7) | A methodology-trust piece early in the sequence signals rigor before more narrative pieces run | Nothing — interpretive over existing floor cohort |
| 3 | **The Downgrade Arc** (C6) | Cross-sector narrative (Humana, Bolivia, El Salvador) — needs the floor taxonomy from #2 as shared vocabulary | Loosely follows #2 for shared framing, not a hard dependency |
| 4 | **The Transparency Cliff** (C8) | Extends the AI-lab lane the benchmark already owns uniquely; keeps that unique-asset citation channel active between University/Hospitals index news cycles | Nothing |
| 5 | **The Recovery Arc** (C10) | The counterpart to the Downgrade Arc — pairs naturally with #3 in reader recall and social sharing | Nothing — but sequenced after #3 for narrative contrast |
| 6 | **Hospitals & Health Systems Index launch companion** ("First, Do No Harm: Introducing the Hospitals & Health Systems Index") | Mirrors the `introducing-the-university-index` launch-pair pattern; slot 6 assumes the index (§3) ships on a ~2-3 month build timeline | **Hard dependency: the index itself must exist first** |

If the Hospitals index build slips past this calendar, promote **The Sahel Calibration Question** (C12) or **The Response Window** (C13) into slot 6 — both are fully interpretive, zero-dependency, and ready to ship on demand.

---

## 5. Handoff summary

**To system-architect:** scope the Hospitals & Health Systems Index (C9) wiring cost against the current post-`indexRegistry.ts` touchpoint list before a launch date is set; flag any additional consolidation opportunity the 9th index makes newly worth doing (same pattern as the University Index making the registry-consolidation debt "concrete" per `ARCHITECTURE_UNIVERSITY_INDEX.md` §1).

**To benchmark-research:** entity-selection method and 8-dimension signal map for Hospitals & Health Systems should follow the University Index PRD template; do NOT start Global Banks or Tech Platforms entity lists until the F500-overlap dedup rule (§2) is resolved.

**To special-briefing agent:** calendar in §4 is ready to execute in order; all six are interpretive-only (no re-scoring), consistent with the existing integrity discipline.

**To growth/analytics:** measurement for every item above is citation reach + organic sessions + free-subscriber/donor growth, never revenue — this is a deliberate departure from the pre-nonprofit framing in `GROWTH_UNIVERSITY_INDEX_LAUNCH.md` §5 (which still includes a Score-Watch-CTA revenue-intent metric); carry forward its M1-M3 citation/traffic/subscriber metrics, drop its M4 commercial-intent metric for future launches.

---

*Document owner: PM Agent. Next review: after founder approves a subset for build.*
