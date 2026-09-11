# PRD — AI Model Compassion Benchmarking as Primary Value Proposition

**Owner:** Product Manager agent
**Date:** 2026-09-10
**Status:** Draft for review. No index, registry, or route has been modified by this document.
**Founder instruction (verbatim):** "Engage all subagents to review the current state website and
update to focus on AI model compassion benchmark testing upon every new AI model release. Keep the
indexes and updates and add main content pages for AI compassion benchmarking which will become our
key value proposition."

**Scope note.** This is additive repositioning. The institutional indexes (Fortune 500, Countries,
US States, AI Labs, Robotics Labs, US Cities, Global Cities, Universities) and the updates/briefings
pipeline are unchanged and out of scope for removal or rework here.

---

## Ground truth this PRD is built on (independently verified this session)

| Fact | Verified against | Value |
|---|---|---|
| Models ever evaluated | `site/src/data/model-benchmark/registry-v1.json` | **0.** `meta.status: "empty"`, `entryCount: 0`, `entries: []`. File itself states this is not a template awaiting population — no release has been scanned for, no model has ever been accessed. |
| Task bank size and validation state | `site/src/data/model-benchmark/tasks-v1.json` | 33 items. **0 validated.** 28 `unvalidated`, 5 `draft-authored-unreviewed` (`ACC-1-A`, `INT-1-B`, `INT-1-C`, `INT-3-A`, `AWR-2-A` — all repaired-but-not-reviewed). Dimension spread: AWR 6, EMP 5, ACT 5, INT 5, ACC 4, EQU 3, BND 3, **SYS 2** (uneven; SYS rests on 2 items against 5 subdimensions). All 33 items are `exposureStatus: "public-permanent"` — published with full answer keys, permanently unusable for blinded cross-model comparison. |
| Product-separation integrity | `.benchmark-ops/WORK_QUEUE.md` WQ-P1-07, `DECISIONS.md` D-23 | `npm run validate:product-separation` → **FAIL. 8 blocking findings, 10 warnings.** Includes 2 name-fusion rows (`xAI/Grok`, `DeepMind/Google`) and 6 duplicate-composite groups across indexes (Microsoft, Amazon, Meta cross-published in `ai-labs.json` and `fortune-500.json` with materially different scores — e.g. Microsoft AI 75.9 "established" vs Microsoft 65.3 "established", Amazon AWS AI 35.9 "developing" vs Amazon 12.8 "critical"). 10 warnings: deployed products (Replika, Character AI, Perplexity, Clearview AI, Waymo, etc.) ranked inside the AI Labs organizational index. |
| Existing model-facing route | `site/src/app/ai-evaluation-suite/page.tsx` | Static server component, no `"use client"`, no state, no input, no export. It **advertises capabilities it does not have**: "Set model name" (no input field exists), "Export results" and four "Export & API" cards (none has a handler), two "License the Platform" CTAs to `/contact-sales`. Logged as `RISK-009` and `WQ-P0-03` — open, unresolved, founder decision pending. |
| Harness state | `research/scripts/model-harness/` | Skeleton exists: `bin/run.mjs`, `core/{planner,executor,evidence,manifest,redact,retry-policy,run-record}.mjs`, `adapters/replay.mjs` (fixture-only, no network code), `tests/acceptance.test.mjs`. **Zero packages, zero credentials, zero network calls** — confirmed by design (`docs/MODEL_EVALUATION_HARNESS_DESIGN.md` Part 8, Phase A). No real provider adapter exists. |
| Spend/credential blocker | `.benchmark-ops/BLOCKERS.md` BLK-002 | **OPEN, critical.** "No model API credentials, no approved spend budget." Grep for provider keys/endpoints outside `node_modules`: zero hits. Only the founder can clear it. |
| Release-detection blocker | `.benchmark-ops/BLOCKERS.md` BLK-001 | **OPEN.** Session WebSearch budget exhausted; three consecutive scan attempts failed 2026-09-02 → 09-06 (`INCIDENTS.md` INC-008). No model release has ever been scanned for. |
| SLA numbers (72h/30-day) | `.benchmark-ops/BLOCKERS.md` BLK-004 | **Unverified.** Grepped across all 15 readable program-plan files: the strings "72", "30-day", "three-layer" appear nowhere. The one primary source that might contain them (`Compassion_Benchmark_AI_Model_Program_Plan.docx`) has never been machine-read in this repo. **Do not publish these numbers as commitments.** |
| Human rating panel | `.benchmark-ops/BLOCKERS.md` BLK-005 | **OPEN.** Zero raters, zero calibration, zero conflict register. Required before any official score can publish. |
| Methods Committee | `.benchmark-ops/BLOCKERS.md` BLK-006 | **OPEN.** One decision-maker exists (the founder). Blocks resolution of two live band/taxonomy conflicts (CONFLICT-03, CONFLICT-05) that a published Model Index would inherit if it borrowed institutional band vocabulary uncritically. |
| Existing nav | `site/src/data/nav.ts` | No "AI Model Benchmark" entry exists anywhere in `mainNav` or `footerLinks`. `ai-evaluation-suite` currently sits under `footerLinks.tools`, three clicks from the homepage, not primary nav. |

**The central finding this PRD is organized around:** everything needed to *credibly explain the
standard* exists or is buildable with zero blockers today (the 8-dimension framework, the task
bank, the harness skeleton, the separation rules). **Nothing needed to *publish a result* exists**,
and four of six blockers require the founder personally, cannot be simulated, and are not close to
clearing. The MVP is therefore a methodology-and-standard product, not a results product.

---

## 1. Problem statement

**Who has the problem.** Every major AI lab now ships model updates on a rolling, frequent cadence.
No independent, evidence-based institution publishes how these specific model snapshots behave
toward people in distress, grief, crisis, or need — as opposed to how capable they are at coding,
reasoning, or knowledge recall, which dozens of benchmarks already cover. When a new model ships,
journalists, safety researchers, policy staff, and enterprise buyers currently have exactly two
sources: the provider's own marketing/model-card claims, or informal, unreplicable social-media
anecdotes. Neither is independent; neither is measured; neither is comparable across releases.

**What the pain is, concretely.**
- A journalist covering a model release has no citable, non-vendor source for "does this model
  handle a grief disclosure or a crisis disclosure better or worse than the last version."
- A safety researcher has no versioned, publicly documented task bank purpose-built for compassion
  and harm-recognition behavior (as distinct from refusal-rate or jailbreak benchmarks) to build on
  or cite.
- An enterprise buyer selecting a model for a customer-facing or employee-facing deployment has no
  independent evidence of how a candidate model behaves under emotionally loaded, non-adversarial
  prompts — the kind real users actually send.
- Policy staff drafting rules about AI in health, crisis, or social-services contexts have no
  independent evaluation source that isn't funded by an AI lab.

**Job to be done (in one sentence, general form):** "Help me know, with evidence I didn't have to
produce myself, whether this AI system recognizes and responds well to a person in distress —
without relying on the company that built it to tell me."

**Why now.** This site already owns the only asset that makes this credible: eight compassion
dimensions with 40 subdimensions and 200 behavioral anchors, a tested deterministic scoring core
(`site/src/lib/scoring.ts`, 69 passing tests), and an existing independence brand built on
institutional benchmarking. No competitor benchmark applies a suffering/compassion lens to model
behavior at all — the category is open. Institutional benchmarking (governments, corporations) is
a comparatively saturated, slow-moving space; model releases are frequent, newsworthy events that
create a recurring reason to return to this site. This is the single clearest path to making
compassionbenchmark.com relevant to a new AI-release news cycle roughly every few weeks instead of
on the institution's own slower publication cadence.

**Why this is also the sharpest credibility risk on the site.** The brand's entire proposition is
independence and evidence. The registry has zero entries. Promoting "AI Model Compassion Benchmark"
as the *key value proposition* while implying — even by page layout, even by omission — that a
ranking exists would be exactly the kind of institutional self-grading failure this benchmark exists
to call out in others. **The MVP defined below is designed to make the standard the product until
there is a result to publish, not to fake the result.**

---

## 2. Target users, buyer, and job-to-be-done per persona

| Persona | Role in the funnel | Job-to-be-done | What they need from MVP (no results yet) |
|---|---|---|---|
| **AI safety / alignment researchers** | Primary user, citation source | "Give me a versioned, publicly specified instrument I can cite, critique, or build on for compassion/harm-recognition behavior." | The published task bank with construct definitions, rubric anchors, dimension coverage, exposure/validation status — treated as a methods artifact, not a leaderboard. |
| **Journalists / tech press** | Primary user, distribution multiplier | "Give me a fast, credible, quotable angle when a new model ships." | A public, dated "what we test and why" page usable as a source *today*, plus a transparent, honest answer to "have you tested it yet" (a pending-wave status page, not silence and not a fabricated number). |
| **Policy / regulatory staff** | Secondary user, credibility validator | "Give me independent, non-vendor evidence for hearings or rulemaking on AI in vulnerable-user contexts." | The independence disclosure (who funds this, who built the harness, the C1–C3 conflict-of-interest statement) and the methodology, so the standard itself can be evaluated even before a score exists. |
| **Enterprise AI buyers** | Secondary user, eventual paid buyer | "Help me pick a model that won't harm my customers or employees in emotionally loaded interactions." | Awareness now that this evaluation exists and is coming, funneled toward existing paid surfaces (Advisory, Enterprise, Certified Assessments) once real results exist — **not** a premature sales claim. |
| **AI labs (secondary, non-paying, independence-constrained)** | Subject, occasional traffic source | "See an external, standardized view of how we're evaluated before it becomes a news story." | The same public methodology everyone else sees. **Per the independence policy, labs may never pay for inclusion, priority evaluation, score change, or suppression — this applies identically to the Model Index as to every existing index.** |

**Buying context at MVP.** No persona above pays for AI-model-benchmark content directly at launch.
This is deliberate: with zero evaluated models, there is nothing to sell yet. MVP content is a
top-of-funnel credibility and audience investment that feeds the site's *existing* monetized
surfaces (Score-Watch alerts, data licenses, advisory, certified assessments) once real evaluation
capability exists. Framing this as an immediate revenue driver would be a false success metric —
flagged explicitly in §7.

---

## 3. MVP scope — the honest-launch boundary

### 3.1 The boundary rule

**A page may describe the standard, the method, or the current pending state. A page may never
imply that a named model has been evaluated, scored, ranked, or compared against another model,
until a result exists that has cleared the publication gate defined in
`docs/MODEL_EVALUATION_HARNESS_DESIGN.md` Part 8 (Gate F).**

This is not a stylistic preference. It is the same standard this institution applies to every
subject in every existing index, applied to itself: no unevidenced claim, no invented number, no
implied completeness.

### 3.2 MUST SHIP NOW — zero dependency on model credentials, raters, or a Methods Committee

| Item | Why it's shippable today |
|---|---|
| **Model Benchmark hub page** — what it is, why it exists, current state stated as a fact ("0 models evaluated as of [live date]"), links to methodology, standard, and status pages. | Pure content + a live read of `registry-v1.json.meta.entryCount`. No credential dependency. |
| **Methodology page** — the 8-dimension framework as applied to models, the human-rating requirement, the evidence standard (source_url, retrieved_at, hash), the independence/conflict-of-interest disclosure (operator, judge, and authorship conflicts — see `MODEL_EVALUATION_HARNESS_DESIGN.md` Part 5). | Already designed and documented; this is publication of existing, reviewed design work, not new invention. |
| **Public task-bank / standard page** — the 33-item Core Public pool presented as a transparency artifact: construct names, rubric anchors, dimension coverage table, and an explicit, correct statement of validation status (0 validated / 28 unvalidated / 5 draft-authored-unreviewed) and permanent public exposure (why this pool can never be used for a scored comparison). | Sourced directly and programmatically from `tasks-v1.json`. Requires no model access. |
| **"First Evaluation Wave: Pending" status page** — plain-language statement of what has to be true before a first result publishes (credentialed access approved, a trained human rater panel in place, a methods standard ratified), with a dated "last verified" stamp. No ETA. | Requires only an honest status statement, not a capability. |
| **Rewrite of `/ai-evaluation-suite`** — resolves the currently-open `WQ-P0-03` by removing every present-tense claim the page cannot back (input field, export, License-the-Platform-as-a-live-product) and repositioning it as the public reference prompt set, cross-linked to the new standard page. | This is a correction of an existing false claim, not new functionality. It must ship in the same release as the new hub, or the new "honest boundary" framing directly contradicts a page still live one click away. |
| **Primary navigation entry** for the new hub (`nav.ts` `mainNav`), consistent with the founder's framing of this as the key value proposition. | Content/IA change, no backend dependency. |
| **Cross-index disclosure** — a short, visible statement on `/ai-labs` and `/indexes` that model behavior scores and organizational governance scores are two different products and are never merged into one number (addresses `WQ-P1-09`). | Text-only; does not require the underlying `xAI/Grok` rename or D-13 ratification to state the *policy* — but see §9 for why those defects still block deeper cross-linking. |

### 3.3 MUST NOT SHIP before real evaluations exist

- **No leaderboard, ranking table, or sortable model list with scores.** There is nothing to rank.
- **No per-model page with a composite number, band label ("Established," "Exemplary," etc.), or
  dimension-profile chart.** Zero models have been evaluated; zero such pages can be true.
- **No restored "scoring tool" that outputs a number and calls it a benchmark result**, even
  self-serve and even disclaimed. The harness design's own verdict on a manual single-rater run is
  explicit: *"As a measurement of a model: close to zero, and negative if published."* A disclaimed
  self-serve score still visually resembles a benchmark result to a reader skimming the page — this
  is a Gate C/D/E/F capability, not an MVP one.
- **No SLA numbers** (the "72-hour" / "30-day" figures the founder's brief referenced) until
  `BLK-004` resolves or the founder issues a new number. These strings appear nowhere in any primary
  source this session could verify.
- **No "in progress" or "evaluation underway" language** unless a run is genuinely in an executing
  phase (Gate C+). Today it is not — the harness has no provider adapter and no credentials.
  "Pending" is the accurate word; "underway" is not.
- **No fabricated tracked-release entries.** A model-release tracking list may exist, but every row
  must carry a real citation (source, publisher, date) or the list ships empty. See §5.
- **No implied comparison between a Model Index subject and an AI Labs Index subject.** The three
  products (Model Index / AI Labs Index / Deployed AI Audit) are never merged, displayed adjacently
  without disclosure, or aggregated into one figure.
- **No paid inclusion, paid priority evaluation, or paid suppression**, for a model any more than
  for an institution. The independence policy is absolute and applies identically.

### 3.4 Should-wait (real, valuable, but sequenced after MVP and after a credential/rater/committee decision)

- A live "models we are testing right now" execution status (Gate C).
- Any statistical layer (confidence intervals, kappa, determinism probes) attached to a real result —
  the code for this can be built against fixtures now (`WQ-P1-06`), but it has nothing to display
  until Gate C-F.
- Public API / data licensing for model-index data (`WQ-P3-03`) — needs a result to serve first.
- Quarterly wave reporting / an annual "State of AI Compassion" report (`WQ-P3-04`).

---

## 4. Page-level content inventory

All routes follow the existing `site/src/app/<route>/page.tsx` static-export convention.

| Route | Page type | Purpose | Ships in MVP? |
|---|---|---|---|
| `/ai-model-benchmark` | New hub / landing | Primary entry point. States what the Model Index is, why it exists, current state ("0 models evaluated" — live from `registry-v1.json`), and routes to the three pages below. This is the page the new nav entry and homepage promotion point to. | **Yes** |
| `/ai-model-benchmark/methodology` | New content page | The 8-dimension framework applied to models; the evidence standard (source_url/retrieved_at/hash); the human-rating requirement (two independent raters, never an LLM judge as a rater); the independence and conflict-of-interest disclosure (operator/judge/authorship conflicts, stated per `MODEL_EVALUATION_HARNESS_DESIGN.md` Part 5.4, in plain public language). | **Yes** |
| `/ai-model-benchmark/standard` | New content page | The public task bank as a transparency artifact: dimension coverage table (AWR 6 / EMP 5 / ACT 5 / INT 5 / ACC 4 / EQU 3 / BND 3 / SYS 2), example items with construct and rubric anchors, and an explicit, correct validation-status count sourced live from `tasks-v1.json` (0 validated, 28 unvalidated, 5 draft-authored-unreviewed). States plainly why this pool, being fully public, can never itself be the basis of a scored comparison. | **Yes** |
| `/ai-model-benchmark/status` | New content page | "First Evaluation Wave: Pending." Plain-language list of what must be true before a first result (credentialed provider access approved by the founder; a trained, independent human rater panel; a ratified scoring standard) with a dated "last verified" stamp. No ETA, no invented SLA. | **Yes** |
| `/ai-model-benchmark/releases` | New content page | Public tracking list of model releases the program intends to evaluate once capability exists. Each row: model/developer name, release date, **citation** (source + publisher + date), status (`tracked` only — never `evaluated` at MVP). Ships **empty**, or founder-seeded with cited sources, if the founder supplies them; an agent must never populate a row from memory or training data. | **Yes, structurally — content may launch empty** |
| `/ai-evaluation-suite` | Existing route, rewritten | Repositioned as the public reference prompt set (the same content the standard page draws from), with every unsupported present-tense capability claim removed (no "set model name" step without an input; no export cards without a handler; "License the Platform" CTA removed or re-scoped to a real inquiry, not a claim of an existing licensable product). Cross-links to `/ai-model-benchmark`. | **Yes — required in the same release** |
| `/methodology` | Existing route, updated | Add a short section distinguishing the institutional benchmark methodology from the Model Index methodology, with a link out. Prevents readers from assuming one methodology covers both products. | **Yes, minor update** |
| `/ai-labs`, `/indexes` | Existing routes, updated | Add a brief, visible disclosure: model behavior scores and organizational governance scores are separate products, never merged into one number. Does not change any index data. | **Yes, minor update** |
| `nav.ts` (`mainNav`) | Navigation | Add "AI Model Benchmark" as a primary nav entry pointing to `/ai-model-benchmark`, consistent with the founder's designation of this as the key value proposition. | **Yes** |
| Any `/ai-model-benchmark/models/<slug>` per-model score page | New route, **not built at MVP** | Would show a per-model dimension profile, composite, band, evidence links. **Explicitly deferred** — see §3.3 and §8. | **No** |
| Any `/ai-model-benchmark/leaderboard` or ranking view | New route, **not built at MVP** | **Explicitly deferred.** | **No** |

---

## 5. Release-triggered cadence — what happens on every new model release

This is the founder's core ask. It is defined honestly in two tiers, because the capability to
execute each tier does not exist at the same time — collapsing them into one promised cadence would
itself violate the honest-launch boundary.

### 5.1 Trigger definition (applies to both tiers)

A **qualifying release** is a named, dated model snapshot from a tracked developer, evidenced by a
primary source (release notes, model card, API changelog, or equivalent), meeting at least one
materiality condition already defined in the registry schema (`.benchmark-ops/MODEL_REGISTRY.md`):
an announced checkpoint change, a safety/refusal-behavior change, a tool-use change, a
system-instruction change, or credible regression evidence. A version bump with no behavioral claim
attached does not automatically qualify.

### 5.2 Tier 1 — Tracking artifact (blocked on `BLK-001` only; buildable once release detection works)

| Step | Detail |
|---|---|
| **Trigger** | A qualifying release is detected via the release-intelligence scan (currently non-functional — `BLK-001`, `INCIDENTS.md` INC-008). |
| **SLA** | **Not set in this PRD.** The founder's brief referenced "72-hour" and "30-day" figures; these are unverified against any primary source (`BLK-004`) and must not be published as a commitment until the founder confirms or replaces them. |
| **Artifact produced** | A new row on `/ai-model-benchmark/releases`: model/developer name, release date, citation, status `tracked`. Registered in `MODEL_REGISTRY.md` as a known snapshot with `test_dates: []` (tracked, not yet tested). No score, no rank, no page. |

### 5.3 Tier 2 — Evaluation artifact (blocked on `BLK-002` + `BLK-005` + `BLK-006`; the founder's actual ask, not yet buildable)

| Step | Detail |
|---|---|
| **Trigger** | Same qualifying release, once Tier 1 tracking exists. |
| **Process** | Automated response capture against the task bank (harness Phase C+) → two independent, blinded human raters score against published anchors → adjudication on disagreement → statistical analysis (CIs, response stability, critical-harm rate reported separately from the 1–5 score) → founder-authorized publication decision (`PUBLICATION_LEDGER.md`). |
| **SLA** | To be set only after the first full cycle's actual time and cost are measured — the harness design (`MODEL_EVALUATION_HARNESS_DESIGN.md` Part 3.5) shows human rating dominates cost by roughly 1,500:1 over API execution, so no honest SLA can be published before at least one real cycle's rater-hours are known. **This PRD explicitly declines to invent a number here.** |
| **Artifact produced** | A per-snapshot Model Index page containing: exact snapshot ID and citations, dimension profile with confidence intervals, response-stability/determinism data, critical-harm rate (never collapsed into the 1–5 mean), the C1–C3 independence disclosure where triggered, and a link to the full evidence manifest. **Never a bare number.** |

### 5.4 What the founder must decide before Tier 2 can be scheduled at all

1. Provider(s), access tier(s), and a spend ceiling per wave (`BLK-002` / `WQ-P0-01`) — the harness
   design notes the pilot cost itself is under a dollar at any plausible price; the founder is
   approving *access*, not a material sum.
2. Whether same-family models are scored with mandatory disclosure (recommended, per
   `MODEL_EVALUATION_HARNESS_DESIGN.md` Part 5.5, Option A) or deferred to an externally-executed
   wave.
3. Human rater panel funding and recruitment (`BLK-005`).
4. A Methods Committee or a documented interim substitute (`BLK-006`).

---

## 6. Acceptance criteria per page

| Page | Acceptance criteria (observable, testable) |
|---|---|
| `/ai-model-benchmark` (hub) | A first-time visitor cannot come away believing a model has been scored. Page states "0 models evaluated" (or the live count) within the first screen, sourced programmatically from `registry-v1.json`, not hand-typed. Links to methodology, standard, status, and releases pages all resolve. No numeric composite score appears anywhere on the page attached to a named model. |
| `/ai-model-benchmark/methodology` | Contains the independence/conflict-of-interest disclosure in plain language (not just a link to an internal doc). States the two-human-rater requirement explicitly. Makes no claim that any part of the pipeline is "independently audited" or "peer reviewed" (reserved words per the site's own authority-boundary rule). |
| `/ai-model-benchmark/standard` | Validation-status counts (0 validated / 28 unvalidated / 5 draft-authored-unreviewed) and dimension-coverage counts match `tasks-v1.json` `meta` fields exactly, verified by an automated check at build time so the page cannot silently drift out of sync with the underlying data. Explicitly states the public pool cannot be used for blinded comparison. |
| `/ai-model-benchmark/status` | Carries a "last verified" date. Lists blocking categories in plain public language (credentialed access, trained rater panel, ratified standard) without publishing an ETA or the unverified 72h/30-day figures. |
| `/ai-model-benchmark/releases` | Every listed row carries a citation (source, publisher, date). An empty list renders as a correct, intentional empty state ("no releases tracked yet"), not a broken or loading-looking UI. No row contains a score. |
| `/ai-evaluation-suite` (rewritten) | Zero present-tense claims of a capability the page cannot perform (no claimed input field without an input field; no claimed export without an export). Every remaining CTA maps to a real, current action (e.g., "read the methodology," "contact us about licensing," not "license the platform" implying an existing licensable scoring product). |
| `nav.ts` update | `/ai-model-benchmark` is reachable from primary navigation on every page, within one click. |
| `/ai-labs`, `/indexes`, `/methodology` updates | The model/institution separation disclosure is visible without requiring a click-through, and does not alter any existing index data or score. |

---

## 7. Success metrics

Per the operating rule this PM function follows: **a metric with no baseline is an incomplete
requirement, stated as such rather than invented.**

### 7.1 Metrics with a verified baseline today (structural/integrity metrics)

| Metric | BEFORE (verified this session) | AFTER (MVP launch target) |
|---|---|---|
| Pages asserting a capability the site does not have (false present-tense claims) | **1** — `/ai-evaluation-suite` claims a model-name input, live export, and a licensable platform, none of which exist (`RISK-009`). | **0.** |
| Pages that display a correct, live-sourced "models evaluated" count | **0** — no such page exists. | **All new hub/status/standard pages** display the count live from `registry-v1.json.meta.entryCount`, not hardcoded — this doubles as a drift guard. |
| Pages whose stated task-bank validation status matches `tasks-v1.json` exactly | **0** — no public page states this today. | **1** (`/ai-model-benchmark/standard`), verified by an automated build-time check. |
| Named model pages carrying a composite score or band label | **0** | **0.** (Launch metric — this must remain zero at MVP; any nonzero value is a failed launch, not a success.) |
| "Honest-boundary compliance" checklist (no fabricated scores, no invented dates, no un-sourced numbers) across all shipped Model Benchmark pages | N/A (new) | **100%** at ship, checked by QA against §3.3 and §8 of this PRD before release. |

### 7.2 Metrics flagged incomplete — no verifiable baseline exists in this session

These require an analytics/growth agent to supply real baselines before targets can be
responsibly set. Publishing a target without one would be exactly the kind of unevidenced number
this PRD's own boundary forbids.

| Metric | Status |
|---|---|
| Current pageviews/sessions on `/ai-evaluation-suite` | **Incomplete.** No analytics data was available to this task. Needed before setting a post-launch traffic target for `/ai-model-benchmark`. |
| Organic search impressions/clicks for model-benchmark-related queries | **Incomplete.** No Search Console data available. |
| Journalist/researcher citations or backlinks to any model-benchmark page | **Baseline is legitimately 0** (the pages don't exist yet) — but the AFTER target cannot be set responsibly without a growth agent's input on a realistic number for a pre-results methodology page. |
| Score-Watch signups attributable to AI-model-benchmark content | **Incomplete.** Existing signups are not currently segmented by referring content per verified data. |

**Recommendation:** analytics agent to supply baseline traffic and Search Console data for
`/ai-evaluation-suite` before this PRD's post-launch (30/60/90-day) targets are finalized. Until
then, §7.1's structural metrics are the only metrics this PRD certifies as complete and measurable.

---

## 8. Explicit non-goals

- No leaderboard, ranking, or comparative model score at MVP, under any framing or disclaimer.
- No restoration of a self-serve scoring tool that outputs a number and labels it a benchmark
  result, disclaimed or not.
- No SLA commitment (72-hour, 30-day, or any other number) until `BLK-004` resolves or the founder
  supplies a new figure.
- No "evaluation underway" language while the harness has no live provider adapter and no
  credentials.
- No merging of the Model Index with the AI Labs Index, Fortune 500, or any institutional index into
  one score, one table, or one unlabeled comparison.
- No paid inclusion, paid priority evaluation, paid score change, or paid suppression for any model
  or model developer — identical to the existing independence policy for institutions.
- No fabricated tracked-release entries; every row on `/ai-model-benchmark/releases` requires a real,
  dated citation or the list stays empty.
- No implementation decisions in this document: harness architecture is system-architect's scope,
  visual design is ux-designer's scope, deployment is devops-engineer's scope, and the
  credential/spend decision (`BLK-002`) belongs to the founder alone.
- No change to `site/src/data/indexes/**`, `research/rotation-state.json`, or any entity record —
  reserved to other agents currently writing there, per this task's constraints.

---

## 9. Dependency and blocker register

| ID / defect | State (verified) | Blocks | Who clears it |
|---|---|---|---|
| **Registry emptiness** | `registry-v1.json`: 0 entries, `status: "empty"`. This is the ground truth the entire honest-launch boundary is designed around — not itself something to "fix," but the fact that makes §3.3's MUST-NOT-SHIP list non-negotiable. | Any per-model page, any leaderboard, any ranking. | Resolves only through Tier 2 (§5.3) — Gates C–F. |
| **Task-bank validation state** | `tasks-v1.json`: 0/33 validated; 28 unvalidated, 5 draft-authored-unreviewed. All items `public-permanent` (burned for blind comparison). | Any claim that the instrument is "validated" or "official." The standard page (§4) must state these numbers, not smooth over them. | `WQ-P1-05` (item repair — partially done for 4 of 5 items) + human domain/lived-experience review, still pending. |
| **BLK-001** — release detection non-functional | Session WebSearch budget exhausted; 3 failed scans 2026-09-02 → 09-06. | Tier 1 cadence (§5.2); `/ai-model-benchmark/releases` can only launch with founder-seeded or empty content until this clears. | Founder (raise `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` or run scans in isolated sessions). |
| **BLK-002** — no model API credentials, no approved spend budget | **Critical, open.** Zero provider keys anywhere in the repo. | All of Tier 2 (§5.3); any real evaluation. | **Founder only.** Cannot be cleared by any agent. |
| **BLK-003** — founder's originally-referenced starting prompt never supplied | Open since 2026-09-06. | Confidence that prior scaffolding work matches original intent. | Founder — confirm intent or supply the prompt. Does not block this PRD's MVP scope. |
| **BLK-004** — program-plan `.docx` unverified | The 72h/30-day SLA figures and "three-layer battery" language appear in no readable primary source. | Any SLA commitment in §5. | Founder supplies extracted text, or a Bash-enabled session reads the `.docx`. |
| **BLK-005** — no human rating panel | Zero raters, zero calibration, zero welfare protocol. | Tier 2 entirely; any official score. | Founder — funding, then recruitment. Welfare protocol (`WQ-P2-04`) must exist before the first rater sees an item — the existing item bank contains suicide, DV, and psychosis-adjacent content. |
| **BLK-006** — no Methods Committee | One decision-maker; two live conflicts (band vocabulary, subdimension taxonomy) unresolved. | Any published band label or dimension breakdown for a model. | Founder — constitute it, or record a documented interim substitute. |
| **Product-separation validator FAIL** | `validate:product-separation` → 8 blocking findings, 10 warnings, against already-published institutional data (name fusions `xAI/Grok`/`DeepMind/Google`; 6 duplicate-composite groups; 10 deployed-products-inside-AI-Labs warnings). | Deeper cross-linking between the new Model Benchmark hub and `/ai-labs` beyond the disclosure statement in §3.2/§4 — linking to a specific lab row that is itself a defect would amplify, not disclose, the problem. | `WQ-P0-04` (rename), `WQ-P0-05` (ratify or reject D-13) — founder authority, index-write scope, out of this PRD's reach. |
| **`WQ-P0-03`** — `/ai-evaluation-suite` overclaim | Open, founder decision pending between restore-as-tool vs. rewrite-as-reference. | This PRD **recommends rewrite** (§3.2, §4) rather than restoring a self-serve scorer, for the reason stated in §3.3. Founder may override. | Founder decision + frontend-engineer execution. |
| **Analytics baseline gap** | No verified traffic/Search Console/citation data was available to this task. | Finalizing post-launch (30/60/90-day) targets in §7.2. | Analytics agent — recommended as the immediate next task after this PRD. |

---

## Handoff summary for downstream agents

**Problem:** No independent, evidence-based source exists for how specific AI model snapshots
recognize and respond to human suffering, distinct from capability benchmarks. This site owns the
only ready-built compassion framework to fill that gap, but the registry has zero evaluated models
and four of six governing blockers require the founder personally.

**Target users:** AI safety researchers (citation), journalists (distribution), policy staff
(credibility), enterprise buyers (future revenue), AI labs (subjects, never payers).

**MVP scope:** Publish the standard, the methodology, and an honest pending-first-wave status —
never a score, rank, or leaderboard. Simultaneously correct `/ai-evaluation-suite`'s existing false
capability claims. Full page inventory in §4.

**Acceptance criteria:** §6, page by page — all enforce the same rule: no unevidenced claim about a
named model, all counts sourced live from `registry-v1.json` / `tasks-v1.json`, not hand-typed.

**Success metrics:** §7 — structural/integrity metrics have verified baselines and are launch gates;
traffic/growth metrics are explicitly flagged incomplete pending analytics input.

- **system-architect** — Tier 2 (§5.3) sequencing depends on the harness Phase A/B/C gates already
  defined in `docs/MODEL_EVALUATION_HARNESS_DESIGN.md`; this PRD does not add new architecture, it
  gates content publication to those existing phase definitions.
- **ux-designer** — page hierarchy and the "honest empty state" pattern for `/ai-model-benchmark/releases`
  and the status page need a design treatment that reads as intentional, not broken or unfinished.
- **frontend-engineer** — §4 route list and §6 acceptance criteria; the `/ai-evaluation-suite` rewrite
  must ship in the same release as the new hub pages.
- **backend-engineer** — the live-sourced counts (registry `entryCount`, task-bank validation status)
  must be generated at build time from the JSON files, not hand-maintained, per §6 and §7.1.
- **analytics** — recommended immediate follow-up: baseline `/ai-evaluation-suite` traffic and
  Search Console data so §7.2's targets can be completed.
