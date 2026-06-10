# UPDATES Daily Briefing — Second-Round PM Review
**Date:** 2026-06-10
**Author:** Product Manager agent
**Scope:** Content depth and product improvements for /updates after Wave A+B are shipped
**Does not cover:** Visual design, engineering implementation, infrastructure architecture
**Independence policy baseline:** CLAUDE.md — "Entities never pay for inclusion, score changes, or suppression of findings. Commercial services support access, interpretation, and institutional use only."

---

## Evidence base read for this review

- `CLAUDE.md` — independence policy
- `docs/DAILY_BRIEFING_SCHEMA.md` — full rich contract v1.0
- `docs/UPDATES_BACKLOG_2026-05-29.md` — round-1 backlog and shipped wave summary
- `docs/UPDATES_REVIEW_PM_2026-05-29.md` — round-1 PM review
- `site/src/components/updates/DailyBriefing.tsx` — current Wave B layout (sections 1–17)
- `site/src/components/entity/EntityDetail.tsx` — entity page component
- `site/src/components/entity/HistoryTimeline.tsx` — entity score history component
- `site/src/data/updates/daily/2026-06-10.json` — today's briefing (confirmation-heavy cycle)
- `site/src/data/updates/daily/2026-06-08.json` — June 8 briefing (band-crossing day, UAE −5.0)
- `research/templates/score-watch-alert.md` — Score-Watch email template
- `docs/REVENUE_REVIEW_PM_2026-05-28.md` — monetization PM review

---

## Shipped state (do not re-propose)

Wave A: cadence fix, feed enrichment, canonical URLs, OG metadata, empty topSignals fallback.
Wave B: StatOfTheDay, TodayInBrief (above-fold), synthesis-first section reorder, BriefingJumpNav, ReadingProgress, CompletionBlock, collapsible audit trail.

The shipped layout (DailyBriefing.tsx lines 244–398) now orders: Header → JumpNav → OpeningQuestion → LeadSignalCard → BrutalInsightCard → HighCompassionContrast → TodaysAnalysisSection → SignalStack → SectorTrends → EmergingRisks → FailureModeCard → MethodologyInnovationList → ForwardSignalsList → InsightsSection → ScoreMovementDashboard → BoundaryWatch → LegacyScoreChangesSection → EvidenceLedger → FloorConductSection → AuditTrail (collapsible) → CompletionBlock → SubscribeCTA.

---

## Structural observations from 2026-06-10 and 2026-06-08 briefings

**2026-06-10 (confirmation-heavy cycle):**
- `pipeline.scoreChanges = 0`, `bandCrossingsApplied = 0`. All 20 assessments are confirmations or floor reinforcements.
- `topSignals[]` has 10 entries with full `primaryEvidenceUrl` on most items. Wave A topSignals fix is working.
- `recentAssessments[]` has 17 items, every one with a non-empty `whyHeadline` and a `primaryEvidenceUrl` on most. Empty-card problem is resolved.
- `methodologyNotes[]` has 8 entries, each applying a named ruling (IPO-CORPORATE-STRUCTURE-NET-NEUTRAL, NATURAL-DISASTER-OVERLAY-NON-DOUBLE-COUNT, SAME-PATTERN-REINFORCEMENT-ON-APPLIED-SCORE, etc.) with a full prose description and a `version: "v1.2"` marker.
- `forwardTriggers[]` has 14 entries across named entities and dated events (June 15, July 31, August 2).
- `dailyOpeningQuestion` is fully populated with a 55-word interrogative, themes, tiedToEntities, and a tensionFraming prefix. `forwardResolutionDate: null` and `eveningResolution: null` — both still unused fields.

**2026-06-08 (band-crossing day — UAE Developing → Critical, −5.0):**
- First application of `ACTIVE-COMPLICITY-IN-MASS-ATROCITY-BY-PROXY` ruling. Both the `topSignals` entry and the `recentAssessments` entry for UAE carry the evidence reasoning.
- `recentAssessments[0]` (UAE) has `primaryEvidenceUrl`, `dominantDimension`, `distanceToBoundary`, and `nextForwardSignal` fully populated.
- The June 10 follow-up briefing tracks UAE as same-pattern-reinforcement on the applied score — a multi-day narrative arc is already present in the raw data but has no surface that makes it visible to a reader comparing the two days.

---

## Candidates

---

### 1. Forward Triggers as a Tracked Predictions Ledger

**Type:** New feature

**Problem:**
The `forwardTriggers[]` array is one of the richest daily outputs. The June 10 briefing has 14 forward triggers with named entities, hard dates (June 15, July 31, August 2), and specific outcome descriptions ("WARN Act sign-or-forfeit window closes", "Ebola peak window through July", "EU AI Act GPAI obligations take full effect"). The June 8 briefing has 11. These triggers are displayed once in the daily briefing's synthesis section and then effectively disappear — a reader who visits on June 13 cannot see that June 15 was predicted as Oracle's critical trigger two days prior. They cannot see which June 10 forward trigger came true, which did not, and what the benchmark said about each in advance.

This is the benchmark's own accountability surface. The benchmark makes observable predictions in the form of forward triggers — "this event, on or around this date, will or will not cause a scoring action." Currently, there is no place on the site that holds the benchmark publicly accountable for those predictions. The archive shows past briefings, but does not surface a structured "open triggers vs. closed triggers" ledger.

Evidence of richness: `forwardTriggers[]` in 2026-06-10.json includes Oracle/June 15, 3M/July 31, DRC/July 31, Uganda/July 31, AI Labs/August 2, UAE/TBD, Bolivia/TBD, US/TBD, Microsoft/TBD, UnitedHealth/TBD, Anthropic/TBD, Cigna/TBD, Myanmar/TBD. These are verifiable commitments. None of them is surfaced anywhere as a living record.

**Proposed change:**
Build a "Forward Watch" ledger page (or section in /updates) at `/updates/forward-watch`. At build time, aggregate all `forwardTriggers[]` items from the last 90 days of daily JSON files, deduplicate by entity+trigger text similarity, sort by date (hard dates first, TBD last), and render as a table: entity, index, trigger description, first-appeared date, most-recently-confirmed date, status (open/triggered/resolved). When a trigger resolves (a score change fires on or after the trigger date, on the named entity), the ledger row can be marked as "triggered." This is fully computable from existing JSON at build time — no new data schema required.

A secondary surface: add a "This trigger was first flagged on [date]" note to score-change cards in the daily briefing whenever the entity appears in a prior day's `forwardTriggers[]`. This creates a visible "we called this" chain between prediction and outcome.

**Reader value / why it drives return and trust:**
The forward ledger is a transparency mechanism that no competitor offers. Freedom House, Bloomberg, and MSCI do not publish their own prediction ledgers. A publicly accessible record of "we predicted this, here is whether we were right" is a direct, auditable trust signal — stronger than any prose claim about rigor. It also gives regular readers a concrete reason to return: "Oracle's June 15 trigger fires in five days — will I come back to see the result?" That is a pull mechanic, not a push mechanic. It also strengthens the conversion argument for Score-Watch: "We told you June 15 mattered. If you had been subscribed to Oracle alerts, you would have received that trigger in your email."

**Independence-policy check:** PASS. The ledger surfaces the benchmark's own prediction record. No entity pays to be included or excluded from the ledger. No entity can influence whether a trigger resolves as "triggered" or "not triggered" — that determination follows from whether a scoring event fires. The transparency effect strengthens independence rather than compromising it.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **14** |

---

### 2. Evidence/Interpretation Separation in Score-Change and Assessment Cards

**Type:** Improvement (deferred from round-1 backlog item #6)

**Problem:**
The round-1 backlog flagged this as deferred Wave C content work (score: 13). It now sits on the shipped baseline as the highest-priority remaining independence-strengthening item.

The current `recentAssessments[]` cards surface `whyHeadline` (what happened) and `primaryEvidenceUrl` (where to verify) but conflate observation with conclusion. The UAE June 8 card reads: "UAE arming, financing, and supplying mercenaries to RSF; UN FFM found genocide hallmarks." This is already excellent — but "what we saw" and "what we concluded from it" are fused into a single line. The `topSignals[0]` description for UAE (June 8) is 270 words that move fluidly between evidence statement and scoring rationale. A skeptical institutional reader — the buyer persona documented in REVENUE_REVIEW_PM §1 (ESG analyst, compliance officer, freedom advocate) — cannot audit the evidence independently of the scoring conclusion because the two are not separated.

The June 10 briefing's `methodologyNotes[0]` (IPO-CORPORATE-STRUCTURE-NET-NEUTRAL) is a working example of the right separation: it names the ruling, states what the evidence is, and explicitly states what the ruling concludes and why the ruling applies. That pattern exists in `methodologyNotes[]` but not consistently in `recentAssessments[]` or `topSignals[]`.

**Proposed change:**
Add two structured sub-fields to `recentAssessments[]` items in the schema, presented distinctly in the card display:

- `evidenceSummary` (what the evidence shows, observer-voice, no scoring language) — e.g., "Conflict Insights Group confirmed UAE weapons reached RSF via Libya/Chad/Uganda; Amnesty documented re-export of Chinese arms in breach of UN embargo; Sudan filed ICJ application alleging complicity."
- `scoringConclusion` (what the benchmark concluded and the key reasoning step) — e.g., "ACTIVE-COMPLICITY-IN-MASS-ATROCITY-BY-PROXY ruling applied; external-sponsorship pattern meets the INT/ACC/SYS/EMP penalty threshold; ICJ unadjudication caps magnitude below floor designation."

These fields would be surfaced in the card as two clearly labelled paragraphs. Both are already implicitly present in the `topSignals[].description` prose — the schema change is a structural decomposition, not new content.

On confirmation-heavy days (like June 10), the same decomposition applies to floor-reinforcement cards: "Evidence shows: [Fortify Rights documents Bago monastery airstrike, 28 civilians killed]" vs. "We concluded: [fourth documented civilian target category, deepens floor record, floor cannot move lower under the methodology]."

**Reader value / why it drives return and trust:**
An ESG analyst at a $500M fund is not just consuming the conclusion — they need to defend it to their investment committee. They need to distinguish "what happened" from "how the benchmark interpreted it." The current conflated format requires the reader to perform that decomposition mentally. Providing the decomposition explicitly does two things: (1) it demonstrates that the benchmark itself distinguishes observation from judgment, which is the core independence claim; (2) it gives the institutional reader the citation structure they need to quote the benchmark's work. This is directly aligned with the paid-product argument that "Score-Watch subscribers get research-grade analysis" — the decomposition is what makes the analysis research-grade.

**Independence-policy check:** PASS. This change makes the evidence chain more visible, not less. It does not alter scoring. It strengthens the separation between "what the evidence shows" and "what we concluded," which is the exact independence-policy principle stated in CLAUDE.md.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **13** |

---

### 3. Opening Question Evening Resolution and Cross-Day Narrative Loop

**Type:** New feature (completes an explicitly reserved schema slot)

**Problem:**
`dailyOpeningQuestion.eveningResolution` and `forwardResolutionDate` are reserved in the schema (DAILY_BRIEFING_SCHEMA.md §2j). Both fields are present in every post-cutoff briefing and always null. The June 10 question asks whether the Bago monastery airstrike constitutes evidence for an ICC referral pathway — `forwardResolutionDate: null`. The June 8 question (not read but inferable from that day's band-crossing context) asked a question about UAE complicity and the ICJ case — a question that has observable resolution criteria.

The UPDATES_REVIEW_PM round-1 review scored this at 12 and flagged the Hungary Sulyok example as a concrete near-term opportunity (at the time, June 1–7 window). That window has since passed. The same structural opportunity now exists for Oracle's June 15 WARN Act trigger (explicitly in `forwardTriggers[]` and in the June 10 opening question context), for the EU AI Act August 2 deadline (five AI labs in `emergingRisks[]`), and for the UAE ICJ case.

The problem is compounded by the briefing's current one-directional time structure. Every briefing opens a question and never looks back. The June 9 opening question (whatever it was) received no resolution surface on June 10 even though June 10 assessed several of the same entities (Bolivia, US, UAE). A reader who engaged with the June 9 question has no product reason to return to that briefing URL after the resolution date.

**Proposed change:**
Two components:

1. Pipeline: after the primary overnight digest runs, a lightweight secondary pass checks all briefings from the last 14 days for `dailyOpeningQuestion` items where `forwardResolutionDate` is within the last 48 hours OR is null but the named `tiedToEntities` entity received a scoring action today. If a resolution condition is met, populate `eveningResolution` on the prior briefing's JSON with: `{resolvedDate, resolvedBriefiingDate, outcomeText, scoringAction}`. The resolution text is observer-voice, limited to the same observer-voice rules as the rest of the schema.

2. Briefing display: add a "Previous question resolved" module at the top of the daily briefing (above the OpeningQuestion section) when the prior day's question has a populated `eveningResolution`. This is a short card: "Yesterday we asked [question text]. Here is what happened: [outcomeText]." With a link to the prior briefing.

The pipeline logic is the hardest part. The display component is small. The schema already supports it.

**Missing assumption flagged:** The secondary pass needs to handle the case where the resolution is "the event did not occur by the trigger date" — i.e., a non-event resolution. This is an equally important transparency case (Oracle's WARN Act window closes June 15 and no adjudication fires — the benchmark should close that prediction explicitly rather than letting it expire silently). The schema should allow `eveningResolution.outcomeText` to include "The predicted trigger did not fire within the specified window; carry-forward watch continues."

**Reader value / why it drives return and trust:**
This is the single highest-leverage daily-return mechanic available. A reader who engaged with the June 10 question about Myanmar's ICC referral pathway has a concrete reason to return on the day the question resolves — to see whether the prediction was useful. The "did the benchmark's forward signal prove accurate?" narrative is the epistemological core of the product's trust case. Without resolution, forward signals are noise. With resolution, they are a verifiable track record.

**Independence-policy check:** PASS. Resolution text is derived from the same evidence-grounded pipeline. No entity can influence whether its question resolves positively. The non-event resolution case (trigger did not fire) is explicitly required — this prevents selectively only closing questions when the benchmark was "right."

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |
| **Priority Score** | **12** |

---

### 4. "One Source on the Ground" — A Single Cited Human-Testimony Quote per Briefing

**Type:** New feature (deferred from round-1 backlog item #11)

**Problem:**
The round-1 backlog scored this at 10 (Competitive lens) and deferred it to Wave C. It is worth re-evaluating at this round with specificity.

The current briefing's evidence is institutional: Fortify Rights reports, OHCHR data, Amnesty documentation, UN Fact-Finding Mission findings, IPC phase designations. This is exactly right for a benchmark institution — institutional evidence is auditable, replicable, and comparable. However, the absence of any human voice in the briefing creates a tonal gap. The June 10 briefing documents that 28 people were killed in the Bago monastery airstrike, that 60,659 civilians have been killed and wounded in Ukraine YTD, and that 2 million people face famine in Sudan — all without a single sentence written by or attributed to a person who was present. This is methodologically correct but editorially cold.

The competitive review (UPDATES_REVIEW_COMPETITIVE_2026-05-29) identified this as one of the distinguishing features of Freedom House's daily output and the ICIJ's investigation coverage: they use a single direct quote from a named source — a local civil society leader, an affected family member, a UN field coordinator — to anchor the institutional evidence in human reality. This is not editorial editorializing — it is the opposite. A cited human-testimony quote with full attribution is more auditable than unnamed institutional summary.

**Proposed change:**
Add an optional `groundVoice` field to the daily briefing schema:

```
groundVoice: {
  quote: string,          // ≤60 words, direct quote
  attributedTo: string,   // name, role, organization
  context: string,        // one sentence setting the quote in the day's evidence
  entitySlug: string,     // the entity the quote relates to
  sourceUrl: string       // direct link to the published source
} | null
```

The field is null on days where no suitable primary-source quote is available. When populated, it is rendered immediately after the LeadSignalCard, before BrutalInsightCard — a brief, one-card module. The quote must be from a named source in a published document (not inferred or paraphrased). The source URL must be present. The field is populated by the overnight digest agent when a primary source contains a directly quotable statement from an identified person.

Evidence of supply: the June 10 Fortify Rights report on the Bago monastery airstrike is a primary source that typically includes direct testimony from survivors and witnesses. The Refugees International June 8 report on UAE/Sudan typically includes statements from Sudanese civil society or displaced persons. The OHCHR civilian casualty updates cite named field coordinators. Supply is not a constraint on days with Tier 1 human-rights evidence.

**Reader value / why it drives return and trust:**
A single precise quote from a named person in the affected community is the most effective device for grounding a data-dense briefing in human reality. It does not replace the institutional evidence — it contextualizes it. Readers who might scroll past a chart of civilian casualty numbers are more likely to pause at a sentence from a named survivor or field coordinator. This drives engagement, sharing, and the kind of reflective reading that distinguishes this briefing from a data feed. It also signals editorial seriousness: a benchmark that quotes primary sources by name is harder to dismiss as an algorithmic output.

**Independence-policy check:** PASS, with one condition. The quote must be attributed to a named person in a published source document — never to an anonymous source, never paraphrased, never from a compensated contributor. The entity to which the quote is related must not pay for the quote to appear or disappear. Selection is by the overnight pipeline on the basis of relevance and source quality, not by any commercial relationship. These conditions are enforceable as lint rules on the `sourceUrl` field (must be present) and the `attributedTo` field (must not be empty or contain "anonymous").

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **10** |

---

### 5. "This Week in Compassion" — Weekly Synthesis as a Recurring Anchor

**Type:** New feature

**Problem:**
The briefing currently has no longitudinal narrative product. Each daily briefing is a self-contained cycle. A reader who visited on June 8 (UAE band crossing) and June 10 (UAE same-pattern reinforcement, four floor confirmations) sees two briefings with no explicit "here is the arc of the week" synthesis. The June 10 `sectorAlerts[]` does some of this implicitly — "three-entity corporate boundary cluster from June 9 narrows to two active corporate cases" — but this is embedded in an individual sector alert, not a dedicated weekly synthesis.

The briefing archive (30 days of daily JSON) contains everything needed for a weekly synthesis at build time: score changes, band crossings, methodology rulings introduced and closed, forward triggers opened and resolved, sector-level patterns. Currently none of this is aggregated into a weekly view.

The competitive landscape review (UPDATES_REVIEW_COMPETITIVE_2026-05-29) identified the weekly synthesis format as a key retention driver: Freedom House's "This Week in Freedom" column, MSCI's "ESG Week in Review," and Morning Brew's Friday briefing all use the weekly summary as the anchor that makes the daily product feel like part of a longer conversation rather than a stream of unrelated outputs.

**Proposed change:**
Publish a "This Week in Compassion" JSON entry each Friday (or Saturday) as a distinct briefing type (`cycleType: "weekly-synthesis"`). The weekly synthesis aggregates from the preceding Monday–Friday briefings: (1) most significant score changes (delta ≥ 3.0 or band crossings), (2) methodology rulings introduced this week (new named rulings from `methodologyNotes[]`), (3) forward triggers opened vs. closed this week, (4) sector patterns across the week (which sectors saw the most activity), (5) a "question of the week" that synthesizes the most consequential unresolved question from the week's opening questions. The weekly is shorter than a daily — it is synthesis, not new assessment.

The weekly synthesis also serves as the natural anchor for the Score-Watch email product: a weekly digest email ("here is everything that changed for your tracked entities this week") could be derived from the weekly synthesis JSON, giving Score-Watch subscribers a cadenced weekly summary in addition to real-time alerts.

**Missing assumption flagged:** The weekly synthesis requires the overnight digest agent to run a separate weekly pass on Friday or Saturday. This is a pipeline scope change that requires digest-agent specification work before implementation. The PM spec covers the product definition; pipeline execution is an implementation dependency.

**Reader value / why it drives return and trust:**
The weekly synthesis creates a habitual return point that does not require reading every daily briefing. A reader with an 80-minute daily reading budget cannot read the full daily briefing every day. But they can read a 10-minute Friday synthesis and stay current. This is a new reading cadence that expands the audience from "daily power users" to "weekly engaged readers" — a larger and arguably more commercially valuable segment (ESG analysts, journalists, policy researchers). It also makes the archive useful: the weekly synthesis entries are the natural navigational layer above the daily entries.

**Independence-policy check:** PASS. The weekly synthesis aggregates from the same evidence-grounded pipeline outputs as the daily briefing. No entity is included, excluded, or prominently featured based on commercial activity. The synthesis reflects what happened, not what any entity wants to have said about it.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### 6. Methodology Rulings as a Living Changelog — Surfacing the "How the Benchmark Evolves" Thread

**Type:** New feature

**Problem:**
The `methodologyNotes[]` array has become one of the richest and most institutionally credible sections of the briefing. The June 10 briefing contains 8 named rulings: IPO-CORPORATE-STRUCTURE-NET-NEUTRAL (first application), NATURAL-DISASTER-OVERLAY-NON-DOUBLE-COUNT, SAME-PATTERN-REINFORCEMENT-ON-APPLIED-SCORE (third application), FLOOR-MULTI-CATEGORY-REINFORCEMENT, ACTIVE-PERPETRATION-FLOOR-REINFORCEMENT, PRICED-CONTINUATION, FILED-BUT-UNADJUDICATED, ROTATION-CONFIRM. Each ruling includes a `version: "v1.2"` marker.

These rulings are currently surfaced only within the daily briefing in which they appear. There is no place on the site where a reader can see: (a) the full set of named rulings currently in the methodology, (b) when each ruling was first introduced, (c) how many times each has been applied, (d) which entities have been scored under each ruling. This is a significant trust gap. The benchmark's methodology is one of its primary differentiators — it is specific, named, versioned, and applied consistently. But its evolution is invisible to any reader who does not read every daily briefing.

Evidence from the schema: `methodologyNotes[].version` is already "v1.2" — this implies v1.0 and v1.1 existed and changed. The `status` field ("active") implies a lifecycle. The `description` field for each ruling is already written at encyclopedia length (200–400 words). This is documented content waiting for an appropriate surface.

**Proposed change:**
Build a `/updates/methodology-changelog` page, generated at build time from all daily briefings' `methodologyNotes[]` arrays. The page surfaces:

- A table of all named rulings, with: ruling name, version, first-application date, total application count, most recent application date, and a link to the briefing where it was first introduced.
- For each ruling, an expandable detail view showing the full `description` from the most recent application (as the canonical definition).
- A "Ruling history" section: when did the benchmark introduce the concept of "COMPELLED-REMEDY-NOT-SELF-CORRECTION"? What changed between v1.0 and v1.2?

This page requires no new schema. It is purely an aggregation and display of existing `methodologyNotes[]` content across the briefing archive.

**Reader value / why it drives return and trust:**
Institutional buyers — the ESG analyst, the freedom advocate, the academic researcher — need to understand the methodology before they can rely on the scores. A methodology changelog answers the question "how does this benchmark decide?" in a concrete, auditable way that no competitor offers. MSCI's methodology documentation runs to hundreds of pages of PDF — it is not navigable. Freedom House's methodology documentation is a static FAQ. A living changelog that shows how the benchmark has refined its rulings over time — with dates, version numbers, and application counts — is a new category of transparency for the industry.

This page is also a natural conversion surface for the paid products. A researcher who understands the methodology deeply enough to follow the ruling changelog is a high-intent prospect for Observer and Analyst tiers.

**Independence-policy check:** PASS. The methodology changelog documents the benchmark's own reasoning process. No entity influences which rulings are included or how they are described. The change-over-time transparency (versions) could theoretically expose cases where the methodology changed in a way that benefited or harmed a specific entity — this is a feature, not a bug, of the independence policy.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **14** |

---

### 7. Connecting the Briefing to the Score-Watch Conversion Path

**Type:** Improvement

**Problem:**
The daily briefing and the Score-Watch email product are currently separate experiences with no explicit connection in the briefing itself. A reader on June 10 who sees Oracle at 20.6 with a 5-day WARN Act trigger — a high-stakes, time-bounded forward event — has no in-briefing prompt to subscribe to Oracle Score-Watch alerts. The CompletionBlock (Wave B, bottom of page) includes a SubscribeCTA, but it is a generic subscribe prompt, not a contextual "track this specific entity" prompt linked to what the reader just read.

Evidence: `score-watch-alert.md` shows the email template sends the reader to `entity_detail_url` — the entity page — but the briefing itself does not offer a Score-Watch subscription entry point tied to any of the 10–17 entities assessed in a given cycle. `EntityDetail.tsx` lines 9–10 import `SCORE_WATCH` and `buildScoreWatchUrl` from gumroad.ts, confirming the per-entity Score-Watch subscription URL pattern is live. The briefing component does not use these.

**Proposed change:**
Add a per-entity "Track this entity" inline CTA to two high-value locations in the briefing:

1. In the `recentAssessments[]` card for each entity (the section rendered by ScoreMovementDashboard), add a small "Track Oracle alerts" link using `buildScoreWatchUrl(slug)` from gumroad.ts. The link appears below the `whyHeadline` and `nextForwardSignal` fields. It is a low-weight inline link, not a button — a single line: "Get Score-Watch alerts for Oracle →".

2. In the `forwardTriggers[]` section, add the same inline link beside each trigger item: the trigger has a date and an entity — the entity's Score-Watch URL is known. "Get alerted when this trigger fires →".

Both locations are where a reader's intent to track is highest — they just read why Oracle matters and when the trigger fires. The CTA at the moment of maximum engagement is the right conversion placement.

This requires no new schema fields — `buildScoreWatchUrl(slug)` is already in gumroad.ts. The only question is whether `slug` in `recentAssessments[]` and `forwardTriggers[]` reliably maps to a Score-Watch-compatible slug. In June 10, all slugs are standard entity slugs (oracle, anthropic, myanmar, etc.) — they do map.

**Missing assumption flagged:** This improvement assumes the per-entity Score-Watch URL is live and functional. `gumroad.ts` shows `SCORE_WATCH.useGumroad` was false at the round-1 review. Confirm that Score-Watch is live before placing CTAs.

**Reader value / why it drives return and trust:**
Score-Watch is the primary paid product in the revenue model. The daily briefing is the highest-intent surface for Score-Watch conversion — a reader who just read that Oracle is 5 days from a band-crossing trigger is the exact buyer for an Oracle alert subscription. Making the conversion path explicit at the moment of maximum reader engagement is a standard growth mechanic. Currently, the reader who wants to track Oracle must navigate from the briefing → entity page → Score-Watch CTA — three steps with no guarantee they make the journey. An inline CTA in the briefing closes that gap.

**Independence-policy check:** PASS. The CTA is an access service — it offers the reader the ability to be notified when the benchmark publishes a score change for that entity. The CTA does not influence scores, does not offer selective inclusion, and does not give paying subscribers any different assessment than non-paying readers. The independence-firewall language in the score-watch-alert template ("Score changes are determined by evidence review and are not initiated by, or influenced by, commercial activity") applies identically.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **12** |

---

## Priority matrix

| # | Title | Type | Priority Score | Independence |
|---|---|---|---|---|
| 1 | Forward Triggers as a Tracked Predictions Ledger | New feature | **14** | PASS |
| 6 | Methodology Rulings as a Living Changelog | New feature | **14** | PASS |
| 2 | Evidence/Interpretation Separation in Score-Change Cards | Improvement | **13** | PASS |
| 3 | Opening Question Evening Resolution and Cross-Day Narrative Loop | New feature | **12** | PASS |
| 7 | Connecting the Briefing to the Score-Watch Conversion Path | Improvement | **12** | PASS |
| 5 | "This Week in Compassion" Weekly Synthesis | New feature | **11** | PASS |
| 4 | "One Source on the Ground" — Single Cited Human-Testimony Quote | New feature | **10** | PASS (with conditions) |

---

## Missing assumptions and explicit flags

1. **Score-Watch live status:** Candidate 7 requires confirmed live Score-Watch per-entity subscription URLs before placing inline CTAs. Placing CTAs for a non-live product is a credibility risk.

2. **Weekly synthesis pipeline dependency:** Candidate 5 requires digest-agent specification for a Friday weekly-pass run. This is a pipeline scope change that PM cannot fully spec without digest-agent input on what the secondary pass would examine.

3. **Evening resolution non-event case:** Candidate 3 requires explicit handling of the "trigger did not fire" resolution. If this case is omitted, the benchmark will only visibly close questions it "got right," which is a bias that would undermine the trust benefit. Schema spec must require the non-event closure.

4. **Forward Watch ledger deduplication logic:** Candidate 1's build-time aggregation across 90 days of `forwardTriggers[]` will encounter many near-duplicate entries for the same entity/trigger (e.g., Oracle's WARN Act appears in every briefing from June 1–15). Deduplication by entity+trigger-category (not exact text) is required, or the ledger will be 200+ rows of near-identical entries. The deduplication rule needs to be specified before implementation.

5. **Ground voice attribution discipline:** Candidate 4's lint rule that `attributedTo` must not be empty and `sourceUrl` must be present are necessary but not sufficient. The pipeline needs a check that the quote is a direct quotation (marked with quotation marks in the source document) rather than a paraphrase. Paraphrased attributions are legally and editorially problematic.

---

## Success metrics

These metrics cannot be baselined without instrumentation. They are the right metrics to instrument at launch of each candidate.

| Candidate | Primary metric | Leading indicator |
|---|---|---|
| 1 (Predictions Ledger) | Return visits to `/updates/forward-watch` within 7 days of trigger resolution events | Page views per day of resolved triggers |
| 6 (Methodology Changelog) | Time on `/updates/methodology-changelog` page | Pages-per-session from briefing → changelog |
| 2 (Evidence/Interpretation Separation) | Scroll depth to assessment card section on band-crossing days | Exit rate at assessment card section |
| 3 (Evening Resolution) | Return visits to prior briefing URLs after resolution date | Click-through rate on "Previous question resolved" module |
| 7 (Score-Watch CTA in Briefing) | Score-Watch conversion rate from briefing page vs. entity page | Click rate on in-briefing "Track this entity" CTAs |
| 5 (Weekly Synthesis) | Weekly synthesis page views as share of total /updates traffic | Email open rate on Score-Watch weekly digest |
| 4 (Ground Voice Quote) | Social share rate on briefings containing groundVoice vs. not | Scroll depth on days with groundVoice present |
