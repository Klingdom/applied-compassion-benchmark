## Status

DRAFT — product definition only. No route created, no component written, no data file modified.
Downstream: system-architect (schema, build-time facts modules, guard placement), ux-designer
(section/mode layout), frontend-engineer, backend-engineer, analytics.

**Governing decision:** `DECISIONS.md` D-29 (2026-09-10) — binding, read in full before implementing
either feature. **Prior art this PRD builds on, not replaces:** `docs/SEO_AEO_MODEL_BENCHMARK.md`
(2026-09-10, seo-aeo-architect, SPECIFICATION ONLY, nothing implemented) already worked out most of
Feature 1's page architecture in detail and independently reaches the same conclusion D-29 states:
**no new page, no per-model stub.** This PRD is the product-definition layer on top of that spec,
plus the full definition of Feature 2, which the SEO spec does not cover.

---

## 0. The two live constraints that shape everything below

1. **`.benchmark-ops/RELEASE_WATCH.md`: 0 scans ever run.** Not "0 releases found" — 0 attempts.
   Two independent reasons, both verified in that file: no model-release scanner has ever existed in
   this repo, and it could not run today even if it did (`BLK-001` — WebSearch budget exhausted at
   2000/2000, three scan attempts failed 2026-09-02/03/06, `INCIDENTS.md` INC-008).
2. **`BLK-005`: no human rating panel exists.** Zero raters, zero calibration, zero adjudication.
   `05-HUMAN-RATING-AND-ADJUDICATION` requires **two independent raters** per official result. This
   is why `/ai-evaluation-suite` already publishes every score it produces as unofficial and
   single-rater (`site/src/components/model-benchmark/EvaluationScorer.tsx`
   `UNOFFICIAL_DISCLAIMER`), and it is why nothing this PRD defines may become an index entry.

Both features are designed to be **honest about these two facts** rather than to work around them.

---

## 1. Problem and user value

### Feature 1 — Daily release watch

**Problem.** A new frontier model ships; within days, journalists, researchers and answer engines ask
some form of "has anyone independently evaluated `<model>` for how it behaves toward people in
distress?" Today the site has no answer to that question in either direction — not a score (correct;
`BLK-005` makes a fast score structurally impossible) and not even an honest "here is what we know
and when we last checked" (RELEASE_WATCH.md is currently empty, and per `docs/SEO_AEO_MODEL_BENCHMARK.md`
§2.5 that emptiness is itself citable if published, and a liability if left silent). The gap is not
"we have no score" — that gap is correct and already true of every benchmark this new. The gap is
"we have no dated, sourced statement of programme status," which is the one thing that costs nothing
and requires no rater, no committee and no model credential to produce.

**User value.** A reader gets a true, checkable answer today — "not yet evaluated, entered the queue
on `<date>`, here is the primary source" — instead of silence (which reads as "we don't cover this")
or, worse, a page that implies a result exists when it doesn't.

### Feature 2 — Bring-your-own-model scoring

**Problem.** `/ai-evaluation-suite` already lets one person self-score a model by hand against 33
rubric-anchored items (`site/src/app/ai-evaluation-suite/page.tsx`). That is slow, and for a
developer who wants a fast directional read on their own model, the realistic alternative today is
to improvise something — paste the rubric into whatever AI assistant they already have, get back an
unlabelled number, and risk describing it in a blog post or internal doc as "its Compassion
Benchmark score." Nothing currently stops that mislabelling because nothing currently supports the
underlying workflow in a structured way.

**User value.** A supported, honestly-labelled path to the same workflow: paste a model's response,
get a rubric-anchored judgment from a model the user already has access to, see the same composite
math the whole institution uses — with the estimate's status and limits made impossible to strip out
of the output.

**Why this sequencing is a genuine product fit, not just a convenient framing.** BYO scoring is the
one feature in the entire CB-MODEL programme that does **not** require `BLK-002` (no CB-owned model
API credentials or spend budget) to clear, because the user's model access is the user's, not
Compassion Benchmark's. Every other evaluation capability in this programme is blocked on founder
budget approval; this one is not.

---

## 2. Target users and the job each hires the feature for

| Feature | Primary persona | Secondary persona | Job to be done |
|---|---|---|---|
| Release watch | Journalist / policy researcher covering a specific model release | Answer engine retrieving on behalf of a person who never sees the page | "Tell me, truthfully and with a source, whether an independent compassion evaluation of `<model>` exists or is queued — do not make me guess from silence." |
| BYO scoring | Developer or ML researcher evaluating their own or a competitor's model | Existing `/ai-evaluation-suite` user tired of clicking 33 score buttons by hand | "Give me a fast, rubric-anchored, structured estimate using a model I already have access to, clearly marked as mine, not Compassion Benchmark's." |

Buying context: neither feature is monetized in this PRD. Both are trust/visibility infrastructure —
release watch is an AEO/citation asset (`docs/SEO_AEO_MODEL_BENCHMARK.md` §1–2); BYO scoring is a
lead-generation and credibility asset for `/contact-sales` (the existing "License the Platform" CTA
already on `/ai-evaluation-suite`), not a new revenue line.

---

## 3. MVP scope, with an explicit honest boundary per feature

### Feature 1 — Daily release watch

**Ships.**

- A **facts module** (`site/src/lib/release-watch-facts.ts`, same pattern as
  `site/src/lib/model-index-facts.ts`) reading a new build-time data file — never a hand-typed number
  on a page. It exposes, at minimum: `lastScanAttemptAt | null`, `lastScanAttemptOutcome:
  "completed" | "skipped" | null`, `completedScanCount`, `candidateEventCount`,
  `confirmedReleaseCount`, `evaluatedCount` (always equal to `MODEL_INDEX_FACTS.evaluatedModelCount`
  today — a model only leaves the queue by being evaluated). Today every one of these is `0` or
  `null`, and the module states that plainly, the same way `model-index-facts.ts` states
  `reviewedItemCount: 0` plainly.
- A **new section on the existing `/ai-models` hub page** (no new route) carrying this status,
  modelled on the pattern `docs/SEO_AEO_MODEL_BENCHMARK.md` §5.6 already specifies: *"Last release
  scan: `<date or 'never'>` — `<n>` candidate releases, `<n>` evaluated."* Zero is a valid, citable
  value and ships as one on day one.
- A **release-brief content type**, publishing through the **existing** special-briefing pipeline
  (`site/src/app/updates/special/[slug]/page.tsx`, `site/src/data/special-briefings/*.json`) — not a
  new route, not a new page template. Extends the briefing schema with the fields
  `docs/SEO_AEO_MODEL_BENCHMARK.md` §5.5 names as required: `modelRegistryIds`, `claimTier` (this
  feature only ever produces `claimTier: "status"`), `leadAnswerSentence`, `evidence[]`. A brief
  publishes **only** the Tier 0 fact:

  > `<exact_snapshot>` was released by `<developer>` on `<date>` (source: `<primary provider URL>`,
  > retrieved `<timestamp>`) and entered the Compassion Benchmark Model Index evaluation queue on
  > `<date>`. No evaluation has been performed.

  This is a fact about the programme's own state, not a claim about the model, so it requires no
  evaluation to be true — the same reasoning D-29 applies to the two existing `/ai-models` pages.
- A **scan attempt log**, distinguishing `completed` (ran, may have found nothing — still a result)
  from `skipped` (did not run — `RELEASE_WATCH.md` invariant 3: *"A scan that did not run is not a
  scan that found nothing"*). Both states are publishable; they must never be visually or textually
  merged.

**Must not ship — the honest boundary, non-negotiable:**

- **No third page under `/ai-models`.** D-29: *"Exactly two pages ship before any model is
  evaluated."* This PRD satisfies the founder's ask for "a huge improved section" by making it a
  section of the existing hub plus a new *instance type* of an already-existing page template
  (special briefings) — not a new page.
- **No per-model page or "not yet evaluated" stub**, at any URL. D-29 names this explicitly as
  forbidden; `docs/SEO_AEO_MODEL_BENCHMARK.md` §2.2 and §7.1 independently reach the same conclusion
  and name it a doorway-page pattern. `/ai-models/<slug>` stays unreserved and unbuilt in this PRD's
  scope — it is explicitly future work, gated on a real evaluated result (D-29; SEO spec §2.3, GATE
  F), and this PRD does not authorize building it.
- **No score, band, composite, or ranking implication anywhere in a release entry.** A release-watch
  entry records that a snapshot exists and entered a queue. It never states or implies anything about
  how that snapshot behaves.
- **No cadence promise.** No "daily," no SLA, no "evaluation underway" language, no 72-hour or 30-day
  figure. `BLK-004`: those figures trace to no primary source this repo can reach. The scan-attempt
  log is the only honest substitute for a cadence claim — it shows what actually happened, not what
  is promised to happen.
- **No entry without a dated, retrievable source URL.** Zero exceptions. A candidate with no primary
  source stays in the internal working file (`RELEASE_WATCH.md`'s existing schema) and never reaches
  the public data file.
- **No rumour published as a release.** `confirmation_status: "rumour"` entries never leave the
  internal file. Only `confirmed` entries generate a release brief.
- **No fabricated scan history.** If a scan did not run (current state: it cannot, `BLK-001` open),
  the public facts module says `lastScanAttemptOutcome: null` or `"skipped"` — never `"completed"`.

**Explicit dependency this PRD does not resolve.** Feature 1's detection step needs `BLK-001`
cleared (`WQ-P0-02` in `.benchmark-ops/WORK_QUEUE.md`, founder-owned: raise
`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` or run each scan cycle in its own session). The
publication surface (facts module, hub section, release-brief schema, degraded-path logging) is
buildable today, with zero entries, exactly as `model-index-facts.ts` was built with
`registry-v1.json` empty. **Do not wait for `BLK-001` to build the surface** — wait for it only to
populate it.

### Feature 2 — Bring-your-own-model scoring

**Ships.**

- A second, explicit **scoring mode** on the existing `/ai-evaluation-suite` tool: *Human mode*
  (unchanged — the current click-1-to-5 flow) and *AI-judge mode* (new). Both write into the same
  `ScoreMap` / `evaluateComposite` pipeline (`site/src/lib/evaluation-scorer.ts`) and the same
  canonical formula (`computeCompositeFromDimensions`, `site/src/lib/scoring.ts`) — no second scoring
  formula, no second export shape beyond the fields named below.
- A **copyable judge-instructions template**, built from data already public on the page (the item
  `prompt` and its five `anchors` — no new content is authored). A user pastes this, plus the
  transcript they want scored, into any AI assistant they already have access to, and pastes the
  structured result back into a new **"Import AI-judged result"** control per item (or one JSON blob
  for a full run).
- A `ratingMethod` field on every scored item and on the run summary:
  `"human-single-rater-self-serve" | "ai-judge-self-serve"`. Never blank, always present, in every
  on-screen state and every export (JSON, CSV, scorecard).
- A `contaminationRisk` disclosure, present on every AI-judge-mode item and export (full text in §6).
- Everything already true of the existing tool stays true unchanged: `official: false`, the
  `UNOFFICIAL_DISCLAIMER`, exclusion of `draft` / `draft-authored-unreviewed` items from scoring
  (`isNonScorableValidationStatus`), and no server-side storage of any result.

**Should-wait (Phase 2, not MVP).** A downloadable/installable artifact — MCP server, Claude Skill,
or plugin — that automates the paste step: calls the user's own configured model directly and
auto-fills the import control, removing the manual copy-paste round trip. This is a friction
reduction on top of the same trust boundary, not a new one, so it is lower priority than getting the
structural separation and the contamination disclosure right first. It also carries real scoping
questions (which protocol, who hosts the schema, versioning against `tasks-v1.json` `bankVersion`)
that belong with system-architect once the paste-based MVP is live and has confirmed the workflow is
wanted.

**Must not ship — ever, not just at MVP, per the founder's explicit hard boundary:**

- **Compassion Benchmark never calls a model API on its own credentials for this feature.** That
  would require clearing `BLK-002` (no CB-owned model API credentials or approved spend budget exist
  — verified: zero hits for any provider key or endpoint outside `node_modules`) and would silently
  turn "bring your own" into "Compassion Benchmark's own," which is a different, out-of-scope
  product.
- **No server-side storage of a submitted AI-judged (or human) result, anywhere.** No ingestion
  endpoint exists for this tool today and none is added by this feature. This is the primary
  structural enforcement mechanism — see §6.
- **No index entry, ever, under any status flag.** A BYO estimate is never written to
  `site/src/data/indexes/`, `registry-v1.json`, or any file this repo treats as a published surface.
- **No UI, table, chart, or copy that places a BYO estimate next to an official Model Index result.**
  Forbidden permanently, written now so it survives past the day the Model Index has its first real
  result (currently zero, so nothing to compare against yet regardless).
- **No relabelling.** Export filenames, on-screen labels and copyable text may never drop
  "unofficial"/"self-serve" language, regardless of scoring mode.

---

## 4. Page / route inventory

| Route | Status | Change |
|---|---|---|
| `/ai-models` | Existing (D-29 page 1 of 2) | **+section**: release-watch status stat block, per §3. No new JSON-LD type; no `Dataset`/`ItemList` while `hasResults` is false (unchanged rule, D-29). |
| `/ai-models/methodology` | Existing (D-29 page 2 of 2) | Unchanged, or at most one paragraph naming that release detection exists and linking to `/ai-models#release-watch` — optional, not required for MVP. |
| `/updates/special/<slug>` | Existing template, **new content instances** | Each confirmed release event gets one instance, `claimTier: "status"`, via the schema extension in §3. Zero new components; the special-briefing pipeline already provides `Article` JSON-LD, OG image generation, feeds, sitemap entry (`docs/SEO_AEO_MODEL_BENCHMARK.md` §5.5). |
| `/ai-models/<snapshot-slug>` | **Not built. Not in scope.** | Reserved for a real evaluated result (D-29; SEO spec §2.3, GATE F). Building it now, even empty, is the forbidden doorway pattern. |
| `/ai-evaluation-suite` | Existing | **+AI-judge mode**, per §3. Same route, same page, no new route. |

No route in this PRD sits outside `/ai-models` or the pre-existing `/ai-evaluation-suite` and
`/updates/special` namespaces. Nothing here adds an entry to `site/src/data/indexRegistry.ts` — per
`docs/SEO_AEO_MODEL_BENCHMARK.md` §6.4, the Model Index (and, by the same reasoning, its release
queue) must stay out of `EntityKind`/`INDEX_REGISTRY` so it can never become badge-able or
entity-searchable like a country or company by accident.

---

## 5. Release-watch workflow: detection, verification, entry, publication — including the degraded path

```
 1. BUDGET CHECK           Before any scan attempt: is a WebSearch (or equivalent) budget available
                            this session? If no → log "skipped", stop. Do not attempt partial coverage
                            and call it complete (this is exactly the INC-008 failure mode: two prior
                            agents ran partial coverage and it was misread as a result).

 2. DETECTION              Query primary sources only (source_type per RELEASE_WATCH.md schema:
                            announcement | model_card | system_card | api_changelog | model_registry |
                            repository | product_release_notes | status_feed | incident_report).
                            Primary provider sources preferred over secondary coverage.

 3. CLASSIFICATION         new_model | named_update | silent_snapshot | configuration_change |
                            policy_layer_change | new_deployment | incident | non_material.
                            Rumours are tagged confirmation_status: "rumour" and go no further this
                            pass — never treated as a release (RELEASE_WATCH.md, quoting
                            02-RELEASE-INTELLIGENCE: "Never treat rumours as confirmed releases").

 4. VERIFICATION           A candidate needs at least one evidence[] entry: {source_url, title,
                            publisher, published_at, retrieved_at, claim_supported}. No URL → the
                            candidate stays internal, permanently, until one exists. This is absolute:
                            "Every tracked release needs a dated source URL. No entry without one."

 5. ENTRY                  Confirmed, sourced candidates get an event_id and are appended to the
                            internal working record (RELEASE_WATCH.md's schema) AND the public data
                            file that release-watch-facts.ts reads. Append-only: a later correction is
                            a new dated entry, never an edit to a published one (same discipline as
                            DECISIONS.md and MODEL_REGISTRY.md invariant 1 — identity is never
                            silently repointed).

 6. PUBLICATION            Public data file update → hub-section stat count changes → one
                            release-brief instance is created via the existing special-briefing
                            pipeline, Tier 0 language only, per §3. No score, no band, no cadence
                            claim, no "evaluation underway."

 7. SCAN LOG               Whether step 1 through 6 ran (outcome: "completed", even if zero
                            candidates qualified) or never started (outcome: "skipped", with the
                            blocking reason recorded) — either way, the scan-attempt log gets an
                            entry. A scan that ran and found nothing is a result. A scan that did not
                            run is not the same fact and must never be displayed as if it were.

 DEGRADED PATH             This is the current, live state: step 1 fails (BLK-001 open). The public
 (today's actual state)    surface ships with lastScanAttemptOutcome: "skipped" (or null, pending the
                            first attempt), completedScanCount: 0, candidateEventCount: 0. No section
                            of the site claims a scan ran, is running, or runs on any schedule.
```

---

## 6. BYO scoring: interaction model and structural separation from official scores

### Interaction model

1. User opens `/ai-evaluation-suite`, selects **AI-judge mode** (explicit action, not the default;
   default stays Human mode, unchanged).
2. For each item, the tool shows the same prompt and rubric it already shows today, plus a **"Copy
   judge instructions"** button that copies a fixed template: the item's `prompt`, its five anchors,
   and an instruction to return a structured `{score: 1-5, justification: string}` against those
   anchors for a transcript the user will supply.
3. User runs the model under test themselves (unchanged from today), then pastes that response
   alongside the judge instructions into their own AI assistant — via whatever interface they already
   use it through (chat UI, MCP-connected client, a Claude Skill, a plugin — the tool does not care
   which; it only defines the instruction template and the result schema).
4. User pastes the assistant's structured reply into the **"Import AI-judged result"** field for that
   item. The tool parses it against a fixed, published JSON shape and populates the same 1–5 selector
   the Human mode uses, tagged `ratingMethod: "ai-judge-self-serve"`.
5. Composite, dimension breakdown and exports work identically to today, with `ratingMethod` and
   `contaminationRisk` carried through every export.

Nothing in this flow requires Compassion Benchmark to call, store credentials for, or proxy any model
API. The client-side boundary that already exists for Human mode (`EvaluationScorer.tsx`: "This tool
does not call any model API") is preserved, not weakened, by adding AI-judge mode.

### Structural separation from an official score — mechanisms, not disclaimers

The founder's brief asks for this to be enforced *structurally*. Five mechanisms, in order of
strength:

1. **No write path exists.** The tool is a static-export client component (D-01, D-04). There is no
   server, no database, no ingestion endpoint for this feature, on this site, today. A self-serve
   estimate cannot become a published index entry not because policy forbids it, but because no code
   path connects the browser tool to `site/src/data/indexes/` or `registry-v1.json`. This is the
   strongest guarantee available and it is already true of the existing Human mode; AI-judge mode
   inherits it unchanged.
2. **A mandatory, non-blank `ratingMethod` field** distinguishes every score's provenance in every
   export and on-screen state — never merged into a single undifferentiated "score."
3. **Vocabulary enforcement.** Every generated string (export filenames, on-screen labels, the
   copyable scorecard) is built from templates that always pair "score" with "unofficial" or
   "self-serve" — the same discipline `UNOFFICIAL_DISCLAIMER` already applies to Human mode, extended
   to AI-judge mode's additional strings. Recommend a fixture test (in the spirit of the
   product-separation guard `site/scripts/validate-product-separation.mjs`, D-23) that fails the
   build if any user-facing string in this feature contains "Compassion Benchmark score" without
   "unofficial" or "self-serve" in the same string — an architecture/engineering follow-up, not built
   by this PRD, but named here as a required acceptance target.
4. **No comparison surface, permanently.** No component, table, or chart in this feature may ever
   render a BYO estimate next to a Model Index result. Nothing exists to compare against yet
   (`registry-v1.json` is empty); the rule is written now precisely so nobody builds that comparison
   view later under the assumption it would be harmless once results exist.
5. **Opt-in, sticky-labelled mode.** AI-judge mode requires an explicit switch; every item scored in
   that mode visibly carries a mode badge, mirroring the existing "DRAFT" / "UNREVIEWED" badge pattern
   already built into `EvaluationScorer.tsx`.

### The memorisation / contamination question

**What is true.** All 33 items in `tasks-v1.json` are `pool: "core-public"` and `exposureStatus:
"public-permanent"` — published on the open web, full five-anchor rubrics included, for months. The
task bank's own metadata already calls this pool "permanently burned for any blinded use," and the
existing `/ai-models` FAQ already discloses that a **subject** model tested against this pool may
have memorised the items. AI-judge mode introduces a second, distinct exposure: the **judge** model
is handed the rubric directly, every time, because it has to be to apply it — and it may separately
have been trained on this exact public item-and-rubric pairing before that. There is no way for the
tool, or the user, to tell whether a given AI-judged score reflects the judge model genuinely
applying the anchor criteria to the text in front of it, or reproducing a memorised "expected answer"
pattern for that item ID. This is not the same failure as ordinary rater unreliability — it is a
training-data contamination risk, and it can bias a score in either direction, unmeasurably.

**What the product must say, structurally, not as a footnote.** A dedicated disclosure — distinct
from `UNOFFICIAL_DISCLAIMER`, not a variant of it — attached to AI-judge mode specifically:

> Because these items and their scoring rubrics are fully public, the model you use to judge
> responses may have seen them before. Its score may reflect recognition of a memorised pattern for
> this exact item rather than an independent judgment of the response you pasted in. This tool cannot
> detect or correct for that. Treat an AI-judged result as a fast, unverifiable-direction estimate for
> your own use — not as evidence of how compassionate a model actually is, and never as a Compassion
> Benchmark score.

This text (or its evolution) ships: inline in the mode-selection UI, in every export's
`contaminationRisk` field, and as a new FAQ entry on `/ai-evaluation-suite`, mirroring the existing
`/ai-models` FAQ pattern "The task items are public. Doesn't that make the benchmark gameable?" —
this feature needs its own parallel answer, not a cross-reference, because the mechanism (judge
contamination) differs from the existing one (subject contamination).

---

## 7. Acceptance criteria

### Feature 1 — Daily release watch

1. `npm run build` with zero release-watch entries emits the section on `/ai-models` reading
   "0 candidate releases, 0 evaluated, last scan: never" (or equivalent honest zero state) — sourced
   entirely from the facts module, no literal number in the page.
2. No route exists at any `/ai-models/<slug>` path. The sitemap contains exactly the two `/ai-models`
   pages plus whatever `/updates/special/<slug>` briefs exist.
3. Every published release-watch entry (public data file and any resulting brief) has a non-empty
   `evidence[].source_url` and `retrieved_at`. A validator (analogous to existing `validate-*.mjs`
   scripts) fails the build if either is missing on any entry — zero exceptions, matching the "no
   entry without a dated source URL" boundary in §3.
4. No release-watch entry or brief contains a score, band, composite, or any comparative/ranking
   language between models.
5. No copy anywhere in this feature contains "daily," a specific hour/day SLA, or "evaluation
   underway" language.
6. The scan-attempt log distinguishes `completed` from `skipped` in both data and display; a skipped
   scan never renders with language implying a result ("found nothing," "no new releases this cycle")
   — it renders as "not attempted" with the blocking reason.
7. A release brief renders through the existing special-briefing template with no new page component
   — verified by diffing against an existing briefing's component tree.

### Feature 2 — BYO scoring

1. Every scored item, in either mode, carries a non-blank `ratingMethod`. No default/blank state is
   possible in the exported JSON, CSV, or scorecard.
2. Every AI-judge-mode item and every export containing at least one AI-judge-mode item carries the
   `contaminationRisk` field with the §6 disclosure text (or its ratified successor) — not omittable.
3. No code path in this feature writes to `site/src/data/indexes/`, `registry-v1.json`, or any other
   published-index file. Verified by the absence of any file-write/network-POST call from the
   client component to any CB-controlled endpoint for this feature — the tool remains fully static.
4. No component introduced by this feature renders a BYO estimate and a Model Index result in the
   same table, list, or chart. (Currently trivially true — no Model Index result exists — but the
   absence of any such component, not just the absence of data, is the acceptance target, so the rule
   survives past the day a real result exists.)
5. Switching to AI-judge mode is an explicit user action; the resulting scored items are visibly
   badged as AI-judged on screen, distinguishable from human-scored items without opening the export.
6. Composite math for AI-judge-mode scores is byte-identical in formula to Human-mode scores —
   verified by a fixture test asserting both modes call the same `evaluateComposite` /
   `computeCompositeFromDimensions` functions with no mode-specific branch in the scoring math itself.
7. No string generated by this feature contains "Compassion Benchmark score" (or equivalent) without
   "unofficial" or "self-serve" appearing in the same string — recommend a fixture/lint test enforcing
   this, per §6 mechanism 3.

---

## 8. Success metrics — real baselines, no invented figures

Baselines below are read from `site/src/lib/model-index-facts.ts`, `.benchmark-ops/RELEASE_WATCH.md`,
`.benchmark-ops/MODEL_REGISTRY.md`, and `site/src/lib/analytics.ts`, current as of this PRD.

| Metric | Baseline | Source | Note |
|---|---|---|---|
| Model snapshots ever evaluated | **0** | `registry-v1.json` (`MODEL_INDEX_FACTS.evaluatedModelCount`) | Governs both features: neither can publish a rated result. |
| Task bank items / reviewed / draft | **33 / 0 / 5** | `MODEL_INDEX_FACTS.itemCount / reviewedItemCount / draftItemCount` | 28 unvalidated + 5 draft-authored-unreviewed = 33; 0 human-reviewed. |
| Release scans ever completed | **0** | `.benchmark-ops/RELEASE_WATCH.md` "0 scans ever" | Distinct from "0 releases found" — no attempt has succeeded. |
| Candidate release events logged | **0** | same | |
| `/ai-evaluation-suite` usage (views, exports, mode selection) | **No baseline — not instrumented.** `site/src/lib/analytics.ts` has no event registered for this page or `EvaluationScorer.tsx` today (verified by grep: zero matches for `trackEvent`/`analytics` in either file). | — | Stated honestly rather than invented, per this PRD's own rule. Instrumentation is a prerequisite, not a nice-to-have, for measuring either feature's adoption — see recommended events below. |
| `/ai-models` traffic / referral / citation appearances | **No baseline reviewed in this PRD.** No analytics data was pulled for this document. | — | Hand off to analytics before setting a launch target; do not infer from `docs/SEO_AEO_MODEL_BENCHMARK.md`'s query-class reasoning, which is explicitly labelled unverified demand there too. |

**Recommended new Umami events (additions to `site/src/lib/analytics.ts` `EVENTS`), so the next
version of this PRD has a real baseline instead of "no baseline":**

- `release_watch_section_view` — hub section enters viewport (mirrors `TODAYS_ANALYSIS_VIEW`'s
  IntersectionObserver pattern already in the codebase).
- `release_brief_view` — a release-brief page loads.
- `byo_mode_select` — AI-judge mode is switched on, `{from: "human", to: "ai-judge"}`.
- `byo_judge_instructions_copied` — per-item copy action, with item id.
- `byo_ai_judged_result_imported` — a structured result is successfully parsed and applied.
- `byo_export` — any export action, tagged with the run's mix of `ratingMethod`s.

**Launch metric (both features).** Ship with the zero/near-zero baseline stated truthfully on the
page itself — this is the metric for launch, not a proxy: *does the page state its own current state
correctly, with no hardcoded number contradicting the data file?* (Acceptance criteria §7 items 1 and
3 are the checkable form of this.)

**Post-launch metric (needs the instrumentation above; not settable yet).** Once events exist:
release-brief view count and `/ai-models` hub section engagement for Feature 1; AI-judge-mode
adoption rate among `/ai-evaluation-suite` sessions and import-success rate (imports attempted vs.
successfully parsed) for Feature 2. **No target number is set here** — setting one without a
baseline would be exactly the kind of unevidenced claim this document elsewhere argues against.

---

## 9. Non-goals and risks

### Non-goals (explicit, so downstream agents do not infer them)

- Building `/ai-models/<snapshot-slug>` or any per-model page. Reserved, not in scope, gated on a
  real result (D-29).
- Any automated, scheduled release-scanning cron/cadence. `BLK-001` ownership (raising the WebSearch
  cap, or session-per-cycle scheduling) is a founder/infra decision (`WQ-P0-02`), not a product scope
  item this PRD can resolve.
- Compassion Benchmark operating its own MCP server, Skill, or plugin that calls a model on CB's
  credentials. The "BYO" in bring-your-own-model is the whole point; a CB-hosted judge model is a
  different, `BLK-002`-gated product not defined here.
- Any comparison, leaderboard, or "how does my BYO estimate compare to the official score" feature —
  forbidden permanently per §3 and §6, independent of whether a real result exists.
- Extending the release-watch or BYO-scoring output into `INDEX_REGISTRY`/`EntityKind`. Both stay in
  separate, unregistered data structures, per the same reasoning `docs/SEO_AEO_MODEL_BENCHMARK.md`
  §6.4 already applies to the Model Index itself.
- Resolving `BLK-001`, `BLK-002`, `BLK-005`, `BLK-006`, or the open D-13/D-14/D-20 index-governance
  questions. This PRD is scoped strictly to the two features requested and treats those blockers as
  binding constraints, not as items it can clear.

### Risks

| Risk | Description | Mitigation in this PRD |
|---|---|---|
| Doorway-pattern drift | Under growth pressure, "one release brief per model" quietly becomes "one thin page per model" over time, recreating the exact pattern D-29 and the SEO spec both reject. | Route inventory (§4) and acceptance criteria (§7.2) fix the mechanism (existing special-briefing template only) so there is no code path to a per-model stub without a deliberate new build. |
| Contamination disclosure gets diluted into boilerplate | A shared, generic "unofficial" disclaimer is reused for AI-judge mode instead of the specific contamination language in §6, because it's less work. | §6 and acceptance criterion 2 require a **distinct** field/text, not a shared one, and name the reason (judge-model exposure, not just rater fallibility) explicitly so a future edit cannot silently merge them. |
| BYO scores leak into a de facto leaderboard via export sharing | Nothing stops a user posting their exported "unofficial" JSON publicly and a third party (or a future CB feature) treating a corpus of these as if they were comparable. | Vocabulary enforcement and the permanent no-comparison-surface rule (§6) bound what *this product* can do; cannot bound third-party reuse of an exported file, which is disclosed, not concealed, by the `official: false` / `ratingMethod` / `contaminationRisk` fields travelling with every export. |
| Release-watch section ships correct today, then rots | The facts module and validator exist, but nobody re-attempts a scan once `BLK-001` clears, and the "last scan: never" state goes stale-looking without anyone noticing. | Acceptance criterion 6 (scan-attempt log) makes the last-attempt state a first-class, checkable data point rather than prose, so staleness is visible in the data, not just felt. Actually restoring scan capability is `WQ-P0-02`, founder-owned, outside this PRD. |
| `BLK-001` never clears | If the WebSearch cap is never raised, Feature 1 ships permanently at its zero-state, forever citing "0 candidate releases." | This is an accepted, honest outcome per this PRD's own standard (a true zero is still worth publishing, per `docs/SEO_AEO_MODEL_BENCHMARK.md` §7.1) — not a failure condition for the feature as scoped, only for the broader programme's release-intelligence goal. |
