# CB-MODEL Integration — Current-State Assessment

**Date:** 2026-09-06
**Author:** system-architect
**Source package:** `C:\Users\philk\Desktop\applied-compassion-benchmark\AI Benchmarking Program\`
**Status:** assessment + scaffold only. No score published, no index touched, no funds committed, no commit made.
**Authority:** prepared under `AI Benchmarking Program/HUMAN-AUTHORITY-BOUNDARY.md`. Every action
that file reserves to the owner has been stopped at, not worked around.

---

## 0. Scope and honest limits of this assessment

**What was read in full:** 15 of the 16 package files (`README.md`,
`HUMAN-AUTHORITY-BOUNDARY.md`, `OPERATING-STATE-SPEC.md`, and super-prompts `00` through `11`).

**What was NOT read:** `Compassion_Benchmark_AI_Model_Program_Plan.docx` (~786 lines). The Bash
tool is disabled for this session, so the file could not be unzipped and its `word/document.xml`
could not be detagged. The Read tool rejects it as binary. **This is a material coverage gap**,
because the package's own `README.md` §"Source authority" names "the approved AI Model Evaluation
Program Plan" as one of four authoritative sources the implementation must treat as governing.

This gap is not cosmetic. Six facts supplied as "already established" were checked against the 15
readable files. The results:

| Supplied fact | Verified in package markdown? | Evidence |
|---|---|---|
| Public name **Compassion Benchmark Model Index** | **Yes** | `README.md` §"Non-negotiable naming"; `00-MASTER-CONDUCTOR` §"Naming and separation" |
| Three products never merged into one score | **Yes** | `README.md`: "Never merge model behavior and lab governance into one score." `00` §Naming: "Never combine these into one score." |
| Publish uncertainty, rater agreement, failure rates, dimension profiles alongside the 0–100 composite | **Yes** | `06-ANALYSIS-AND-VALIDATION` (bootstrap CIs, tie groups, inter-rater reliability, min dimension, critical-harm rate); `07-PUBLICATION-AND-WEBSITE` (model page required fields) |
| Internal code **CB-MODEL** | **No** | The string `CB-MODEL` appears in **zero** of the 15 markdown files. It is the founder's internal code, not a package term. Adopted here as such. |
| **Version 1.0, dated 2026-09-06, three-year horizon** | **No** | No version string, no date, and no "three-year" appears anywhere in the 15 files. Must originate in the `.docx`. |
| **72-hour rapid result / 30-day full result** for major releases | **No** | `02-RELEASE-INTELLIGENCE` mandates "rapid-check and full-run deadlines" but names **no numbers**. The strings "72" and "30-day" appear nowhere. Must originate in the `.docx`. |
| Replace the 33-prompt set with a **three-layer** battery (public reference / secure rotating / live challenge) | **Partly — and the package is stricter** | `03-BENCHMARK-BATTERY` specifies **six** pools, not three: Core Public, Secure Standard, Challenge, Incident Regression, Arena, Specialized Track — with hard targets of ≥64 public core tasks, 128 official secure tasks *per form*, 48 rotating challenge tasks, and a candidate bank above 240 items. "three-layer" and "public reference" appear nowhere. |

**Consequence.** Three of the seven load-bearing parameters that would drive sequencing (version
date, 72h/30d SLAs, battery layering) are currently **unverified against a primary source**. They
are carried in `.benchmark-ops/ASSUMPTIONS.md` as assumptions, not facts, and must be reconciled
against the `.docx` before any schedule or SLA is committed to. See `BLK-004`.

---

## 1. What of CB-MODEL already exists, partly exists, or does not exist

### 1.1 Summary table

| CB-MODEL capability (source) | State in this repo | Evidence |
|---|---|---|
| Eight compassion dimensions | **Exists, canonical, and load-bearing** | `site/src/data/dimensions.ts` — 8 dimensions × 5 subdimensions with 5 anchors each (40 indicators, 200 anchor strings) |
| 0–100 composite formula, versioned and tested | **Exists and is genuinely deterministic** | `site/src/lib/scoring.ts` (single shared `compositeCore`); `site/scripts/test-scoring.mjs` — 69 test cases; `site/scripts/lib/scoring.mjs` mirror for Node scripts |
| Band definitions | **Exists, but two incompatible vocabularies are live** — see §3.2 | `dimensions.ts` `BANDS` (80/60/40/20) vs `ai-labs.json` `bands[].range` and `ai-evaluation-suite/page.tsx` (81/61/41/21) |
| Compassion Benchmark **AI Labs Index** | **Exists as data, with defects** | `site/src/data/indexes/ai-labs.json` — 50 organisations, `meta.title` "Top 50 AI Companies Index 2026" |
| Compassion Benchmark **Model Index** | **Does not exist.** No model, no snapshot, no model score anywhere in the repo | No file in `site/src/data/indexes/` holds a model identity; no `model_id`, endpoint, or snapshot field exists in any schema |
| Compassion Benchmark **Deployed AI Audit** | **Does not exist as a product — but its subjects are already scored inside AI Labs** | §2.3 below |
| 33-prompt evaluation suite | **Presentation, not infrastructure.** Full finding in §1.2 | `site/src/app/ai-evaluation-suite/page.tsx` (static server component); `legacy-html/ai-evaluation-suite.html` (the working tool that was dropped) |
| Immutable model registry (developer, family, snapshot, endpoint, access tier, lineage) | **Does not exist** | No such schema in `research/DATA_MODEL.md`; no `.benchmark-ops/MODEL_REGISTRY.md` before this task |
| Versioned task bank with item lifecycle, DIF, exposure class, retirement | **Does not exist** | The 33 prompts are a hardcoded `const PROMPTS` array inside one `.tsx` file — no IDs outside that file, no versioning, no retirement, no validation status |
| Provider-neutral execution adapters | **Does not exist** | No model API client, no key, no retry/rate-control code anywhere. Grep for `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`api.anthropic.com`/`api.openai.com` outside `node_modules`: **zero hits** |
| Blinded rating and adjudication workspace | **Does not exist** | No rater, no blinding, no adjudication artifact anywhere |
| Deterministic analysis pipeline (frozen inputs, CIs, kappa, tie groups) | **Does not exist for models.** A *deterministic composite* exists; the statistical layer does not | `scoring.ts` has no CI, no bootstrap, no reliability calculation |
| Evidence store with hashes and append-only audit | **Analogue exists, weaker than specified** | `research/assessments/**`, `research/change-proposals/**`, `research/APPLIED_CHANGES.md` are append-only by convention and enforced by `AUTONOMY.md` §1c — but there are no hashes and no signed manifests |
| Release intelligence / release queue | **Does not exist for models.** An entity-news scanner exists and is currently non-operational | `.claude/agents/overnight-scanner.md`; `INCIDENTS.md` INC-008 |
| Publication ledger with recorded human authorisation | **Functional analogue exists and is strong** | `research/APPLIED_CHANGES.md` + `status: "approved"` mechanism (`AUTONOMY.md` §5, R5–R7). This is the single closest match in the repo to anything CB-MODEL asks for |
| Human authority boundary | **Functional analogue exists and is stronger than the package's** | `AUTONOMY.md` (432 lines, every rule traced to a dated event). See §3.1 |
| Incident and regression handling | **Exists for the institution benchmark, not for models** | `INCIDENTS.md` (8 incidents); no Incident Regression Set for model behaviour |
| Funding / partnerships pipeline | **Partly exists, outside this repo** | `Desktop\applied-compassion-benchmark\Compassion-Benchmark-Nonprofit\GRANT_MODEL.md`, `ORGANIZATION_PLAN.md`, `research/FUNDER_LANDSCAPE_AND_GRANT_MODEL.md` — not in this repository |

### 1.2 The 33-prompt suite — verdict: **presentation, and it advertises a tool it no longer has**

This is the question with the most consequence, so it is answered with the file evidence rather
than the page's own claims about itself.

**What the live page actually is.** `site/src/app/ai-evaluation-suite/page.tsx` is a **static
React server component**. It has no `"use client"` directive, no state, no event handler, no input
element, and no fetch. It renders three things: a hardcoded `DIMS` array (8 entries), a hardcoded
`PROMPTS` array (33 entries, each with `text`, `observe`, and a 5-element `rubric`), and prose.
Under `output: 'export'` (D-01) it compiles to flat HTML. **Nothing on that page can score
anything.**

**What it claims to be.** In the present tense, on the live page:

- Eyebrow: "AI evaluation platform · v1.0 · 33 prompts · 8 dimensions"
- "How it works — **1. Set model name** — Enter the model name and version to track which system
  you are evaluating." *There is no input field on the page.*
- "**3. Export results** — View composite scores, dimension breakdowns, and export JSON or generate
  a shareable report." *There is no export.*
- Four cards under "Export & API": "Export JSON", "Export CSV", "Copy Score Card", "CB Scoring
  Formula". **All four are inert `<Card>` elements containing descriptive prose. None has an
  `onClick`.**
- Two "License the Platform" buttons pointing at `/contact-sales`.

**Why the gap exists — this is the important part.** The tool was real once and was lost in the
Next.js migration. `legacy-html/ai-evaluation-suite.html` is a working single-file application
containing `setScore()`, `setNotes()`, `calcComposite()`, `getDimScore()`, `exportJSON()`,
`exportCSV()`, `copyScorecard()`, `resetScores()` and a `state.scores` store — 53 matches for
script/handler/input constructs. The port to `page.tsx` kept the content and dropped the
behaviour, but kept the marketing copy describing the behaviour.

**Verdict.** The 33-prompt suite is:

1. **Not evaluation infrastructure.** It never executed a model. Even at its most functional
   (legacy HTML) it was a *manual scoring worksheet*: a human pastes a prompt into a chatbot, reads
   the answer, and clicks 1–5. There is no model call, no trial repetition, no randomisation, no
   raw-output capture, no blinding — none of `04-MODEL-EVALUATION-RUN`'s nine protocol steps.
2. **Currently not even the worksheet.** The live production page is a read-only catalogue of the
   prompts. The tally, the composite, and all three exports are gone.
3. **Actively misdescribing itself on a page with a commercial CTA.** That is the sharpest finding
   in this document, because it is the one thing here that could be characterised as a claim to a
   customer about a capability that does not exist.

**Three further defects in the suite that matter for CB-MODEL specifically:**

- **Four of the 33 prompts are unexecutable as written.** `ACC-1-A` ("[Note: use after an actual or
  simulated prior error]"), `INT-1-B` ("[conservative policy position]" / "[progressive policy
  position]"), `INT-1-C` ("[factually incorrect claim]") and `INT-3-A` ("[describes a business with
  a fundamental, fatal flaw]") contain unfilled slots with no specified filler. Two runs of these
  items are not comparable, which fails `06-ANALYSIS`'s reproducibility requirement at the item
  level.
- **Dimension coverage is severely unbalanced.** Item counts per dimension: AWR 6, EMP 5, ACT 5,
  INT 5, ACC 4, EQU 3, BND 3, **SYS 2**. A "SYS dimension estimate" would rest on two items against
  five subdimensions, while AWR rests on six. `06-ANALYSIS` requires "eight dimension estimates
  balanced across task families"; this is not balanced.
- **Every item and every rubric is public, permanently, with the answer key attached.** Under
  `03-BENCHMARK-BATTERY` this is the Core Public pool by definition, and the package caps that
  pool's role accordingly (128 *secure* tasks per official form). The current page presents the
  public pool as *the* suite. Any published score derived from it is a saturation/leakage figure,
  not a measurement.

### 1.3 What genuinely transfers to CB-MODEL

Stated plainly so the plan does not rebuild what already works:

- **The composite core.** `compositeCore()` in `site/src/lib/scoring.ts` is a single shared
  implementation with 69 passing tests and an explicit anti-drift comment. It is reusable for model
  scoring unchanged, with the caveat in §3.2.
- **The governance layer.** `AUTONOMY.md`, `DECISIONS.md`, `AGENT-ROUTING.md`, `INCIDENTS.md`,
  `RISKS.md` are, collectively, a **stronger** operating discipline than the package specifies,
  because every rule in them traces to a dated failure in this repository rather than to a
  template. §3.1.
- **The approval mechanism.** `status: "approved"` in a per-entity JSON file, with `AUTONOMY.md`
  R5–R8 (routing vs self-veto; record integrity under override) is directly usable as CB-MODEL's
  publication authorisation gate, and is better specified than
  `07-PUBLICATION-AND-WEBSITE`'s "human authorization recorded in the publication ledger".
- **The disclosure discipline.** `AUTONOMY.md` §7 R9 ("absence of disclosure is not misconduct",
  the 2-convention, disclosure density) is exactly the discipline CB-MODEL will need the first time
  a model scores low because a provider published no system card.

---

## 2. The three-product separation — does the repo respect it?

**Short answer: no, but not in the way the rule names.** The repo does not merge model behaviour
into lab governance, because **it has never measured model behaviour at all**. What it has is three
distinct defects, one of which is a live violation of a *different* separation, and one of which is
a loaded gun pointed at the model/lab rule the day CB-MODEL publishes.

### 2.1 The Microsoft / Amazon / Meta pairs — verified

All three pairs confirmed by direct file read:

| ai-labs.json | rank | composite | band | fortune-500.json | composite | band | gap | bands apart |
|---|---:|---:|---|---|---:|---|---:|---:|
| Microsoft AI | 4 | **75.9** | established | Microsoft | **65.3** | established | 10.6 | 0 |
| Amazon AWS AI | 31 | **35.9** | developing | Amazon | **12.8** | critical | 23.1 | 2 |
| Meta AI | 40 | **26.3** | developing | Meta Platforms | **7.8** | critical | 18.5 | 2 |

*(Note for the record: the founder's brief cited Meta at 26.3/7.8, which matches; the fortune-500
row is named "Meta Platforms", not "Meta". A grep for `"name": "Meta"` returns nothing.)*

**Assessment: these are a different defect, not the named violation — and they are already logged.**

- **They are not a model/lab merge.** Both sides of each pair are *organisational governance*
  scores produced by the same institutional methodology against public evidence. Neither is a model
  behaviour measurement. Nothing has been merged, because there is nothing to merge yet.
- **They are a duplicate-published-entity defect**, and the repo has already named it. `DECISIONS.md`
  D-13 states the hard constraint verbatim: *"no entity may hold more than one published composite
  anywhere in the Compassion Benchmark. Seven companies currently violate it, with gaps up to 45.3
  points."* Rule **R-SUB-3** ("a published parent blocks the division") names these exact three as
  the entities it blocks. `RISKS.md` RISK-003 lists all three pairs with the 23.1-point figure.
- **The real defect is that the fix has not been executed and the rule was never ratified.** D-13's
  status is **`proposed`** — the source document's own header says "PROPOSAL. No index modified" —
  yet its subsidiary rules have been *cited as governing* in the 2026-08-21 and 2026-08-23
  structural operations (Bear Robotics under R-SUB-2, Zimmer Biomet under R-SUB-4, Rainbow Robotics
  cleared against both). D-13 records this itself: **"adopted by practice but never ratified."**
  So the repo is enforcing R-SUB-3 against new candidates while three pre-existing violations of it
  remain published. That asymmetry is the defect worth naming.

**So: is it a violation of "never merge model behaviour and lab governance"? No. Is it a defect?
Yes, a serious one — a double-publication defect under the repo's own proposed constraint, plus an
unratified-rule-enforced-selectively defect. It is *both* a data defect and a governance defect,
but it is not the violation the package's rule is about.**

### 2.2 The loaded gun: name collision will *become* the named violation

The moment CB-MODEL publishes its first model score, a reader lands on a Compassion Benchmark
property showing:

- **"Microsoft AI — 75.9 — Established"** (an organisational governance score about a business unit), and
- some Microsoft model snapshot with a CB-MODEL composite (a behavioural score about a tested system).

Those two numbers will be adjacent, differently-derived, and identically formatted on a 0–100 scale
with the same five band labels. **Nothing in the current site distinguishes them.** The index is
titled "Top 50 AI **Companies** Index 2026" in `meta.title` but is served at `/ai-labs` and its rows
are named like products ("Microsoft AI", "Meta AI", "Palantir AI", "Axon AI"). This is precisely
the aggregation-by-reader-inference that `00-MASTER-CONDUCTOR` forbids: *"Clearly label
cross-analysis as correlation or comparison, not aggregation."*

**This is the highest-priority separation risk, and it is currently unmitigated.**

### 2.3 The violation that *is* already live: Deployed AI Audit subjects inside the AI Labs Index

Reading the full 50-row roster of `ai-labs.json`, the index is not one product. It contains at
least five different kinds of subject:

| Kind | Rows (examples) | CB-MODEL product it belongs to |
|---|---|---|
| Model developers | OpenAI 22.5, Anthropic 59.1, Mistral AI 46.9, DeepSeek 18.8, Cohere 60.9, AI21 Labs 60.9, Stability AI 26.2, Sakana AI 60.9 | **AI Labs Index** ✔ |
| Business units of a published parent | Microsoft AI 75.9, Amazon AWS AI 35.9, Meta AI 26.3, DeepMind/Google 56.9 | AI Labs Index, but blocked by R-SUB-3 |
| **Deployed consumer/enterprise products** | **Replika 21.9, Character AI 0.0, Perplexity AI 45.3, Midjourney 21.9, Clearview AI 10.9, Waymo 42.5, Abridge 60.9, Harvey AI 48.4, Typeface 48.4, Pika Labs 25.0** | **Deployed AI Audit** — a product that does not exist |
| Silicon / infrastructure / data vendors | Groq 48.4, SambaNova 48.4, Cerebras 38.8, Lightmatter 37.5, CoreWeave 45.3, Scale AI 26.9, Labelbox 48.4 | None of the three cleanly |
| Robotics companies also published in `robotics-labs` | 1X Technologies 50.0, Figure AI 31.3 | Cross-index duplicates, held under D-17 |

**This is a genuine three-product separation failure that already exists in published data.** Ten
or more rows score *configured products in real use* — exactly `00-MASTER-CONDUCTOR`'s definition
of the Deployed AI Audit — and they are ranked in the same table, on the same scale, against
organisations like Anthropic and Mistral. A reader comparing "Replika 21.9" to "Anthropic 59.1" is
comparing a companion app's product behaviour to a research organisation's institutional
governance. That comparison is not meaningful, and the index presents it as a rank.

### 2.4 The single clearest merged row: **`xAI/Grok`**

`ai-labs.json` rank 50, `"name": "xAI/Grok"`, composite **0.0**, band critical.

**The row's own name fuses an organisation (xAI) and a model (Grok) into one published composite.**
There is no other reading. Under `README.md`'s "Never merge model behavior and lab governance into
one score", this is a literal, currently-published violation, and it sits at the bottom of the
table where the reputational stakes of being wrong are highest. `DeepMind/Google` (rank 13, 56.9)
has the same shape with two organisations instead of an organisation and a model.

**Recommendation (not executed — this is an index write, `AUTONOMY.md` §1b):** `xAI/Grok` must be
renamed to the organisation (`xAI`) before CB-MODEL publishes anything about Grok, or the two will
be conflated on day one. Filed as `WQ-P0-04`.

---

## 3. Conflicts between the package and existing repo standards

Logged, not silently resolved, per `README.md` §"Source authority": *"Conflicts must be logged and
resolved through the documented decision process. Website content is not automatically more
authoritative than an approved standard."*

### CONFLICT-01 — `.benchmark-ops/` duplicates five existing governance artifacts

**The package requires** (`OPERATING-STATE-SPEC.md`) a `.benchmark-ops/` directory containing
`CURRENT_STATE.md`, `DECISIONS.md`, `ASSUMPTIONS.md`, `RISKS.md`, `BLOCKERS.md`, `WORK_QUEUE.md`,
`RELEASE_WATCH.md`, `MODEL_REGISTRY.md`, `EVALUATION_LEDGER.md`, `PUBLICATION_LEDGER.md`,
`VALIDATION_LEDGER.md`, `COST_LEDGER.md`, `SESSION_LOG.md`, `LAST_SUCCESSFUL_RUN.json`,
`NEXT_ACTIONS.json`.

**Sub-finding — the count is 15, not 14.** The task brief and common reading of the spec say "14
files". The spec's code block lists **fifteen** paths. All fifteen have been created. Recorded so
nobody later reports a phantom missing file or an unexpected extra one.

**The repo already has**, each populated with dated real history and each created only because a
documented failure demanded it (`docs/OPERATING_SYSTEM_ADAPTATION.md` §4):

| Package file | Existing repo artifact | Overlap |
|---|---|---|
| `DECISIONS.md` | `DECISIONS.md` (root) — D-00…D-22, append-only, three statuses including `unresolved` | Total |
| `RISKS.md` | `RISKS.md` (root) — RISK-001…RISK-008, each with evidence + owner | Total |
| `WORK_QUEUE.md` | `research/IMPROVEMENT_BACKLOG.md` — 14 ranked items with a scoring rubric | High |
| `SESSION_LOG.md` | `research/ITERATION_LOG.md` (1,141 lines) | High |
| `CURRENT_STATE.md` | `research/SYSTEM_HEALTH.md` | Partial (and see CONFLICT-02) |

**This is the exact hazard `docs/OPERATING_SYSTEM_ADAPTATION.md` was written to prevent.** Its §"Why
not copy" warns that porting a foreign corpus wholesale "would install a second, contradictory
constitution". Its §5 is a standing rule: *"A template with placeholder rows is worse than no file:
it looks like governance while asserting nothing, and future agents will treat it as
authoritative."*

**RECOMMENDED RECONCILIATION — one rule, applied to all fifteen files:**

> **Every `.benchmark-ops/` file is either a SINGLE-AUTHORITY file (no repo equivalent exists;
> it owns its content) or a POINTER file (a repo file is authoritative; the `.benchmark-ops/` copy
> is a CB-MODEL-scoped view that may summarise and link but may never originate an entry). No file
> is a fork. A decision, risk or lesson that exists only inside `.benchmark-ops/` is a defect.**

Applied:

| File | Class | Authority |
|---|---|---|
| `MODEL_REGISTRY.md`, `EVALUATION_LEDGER.md`, `PUBLICATION_LEDGER.md`, `VALIDATION_LEDGER.md`, `COST_LEDGER.md`, `RELEASE_WATCH.md`, `BLOCKERS.md`, `ASSUMPTIONS.md`, `LAST_SUCCESSFUL_RUN.json`, `NEXT_ACTIONS.json` | **Single-authority** (10) | Own their content. No repo equivalent exists, because the repo has never run a model evaluation. |
| `DECISIONS.md` | **Pointer** | Root `DECISIONS.md` is authoritative. CB-MODEL decisions get IDs in the **root** file (continuing D-23…) and are indexed here. |
| `RISKS.md` | **Pointer** | Root `RISKS.md` is authoritative. CB-MODEL risks get RISK-009… in the **root** file. |
| `SESSION_LOG.md` | **Pointer** | `research/ITERATION_LOG.md` is authoritative for durable lessons. This file holds per-session CB-MODEL run records only. |
| `WORK_QUEUE.md` | **Scoped, non-forking** | CB-MODEL work only, in the package's P0–P3 format. Any item that becomes repo-wide graduates to `research/IMPROVEMENT_BACKLOG.md` under its rubric. |
| `CURRENT_STATE.md` | **Scoped, non-forking** | CB-MODEL programme state only. Repo-wide health remains `research/SYSTEM_HEALTH.md`. |

**Why this and not the alternatives.** (a) *Refuse `.benchmark-ops/` and extend the root files* —
rejected: the ten single-authority ledgers have no home in the root files and would distort them,
and the founder's instruction is explicit. (b) *Create all fifteen as independent files* —
rejected: it installs the second constitution `OPERATING_SYSTEM_ADAPTATION.md` forbids, and within
two cycles a CB-MODEL decision would exist in one file and not the other with no rule about which
wins. (c) *Chosen:* one directory, two classes, one rule. Reversible, and it preserves the root
files as the single governance record.

### CONFLICT-02 — the package's autonomy loop vs `AUTONOMY.md`

`00-MASTER-CONDUCTOR` §"Continuous autonomous loop" step 7: *"Continue: immediately begin the next
unblocked batch. Do not stop after producing a plan or describing work."* §"Autonomy rules": *"Do
not use lack of perfection as a reason to wait."*

`AUTONOMY.md` §9 lists **ten stop-and-report triggers**, several of which have no analogue in
`HUMAN-AUTHORITY-BOUNDARY.md` — including "a proposal's own text instructs against application"
(the self-veto rule, D-16, under which 37 of 66 approved proposals were correctly held on
2026-08-20) and "two assessments of the same entity disagree materially" (D-07).

**Resolution: `AUTONOMY.md` wins where they differ, and its rules extend to CB-MODEL work.**
Grounds: `HUMAN-AUTHORITY-BOUNDARY.md` is a generic list; `AUTONOMY.md` is 432 lines in which every
rule traces to a dated, verifiable event in this repository. The package's own §"Source authority"
says website content is not automatically more authoritative than an approved standard — the
converse holds equally. **Requires a founder decision to ratify (proposed as D-23).**

### CONFLICT-03 — two band vocabularies are live, and one of them excludes seven of its own rows

`site/src/data/dimensions.ts` carries an explicit standing rule in a code comment:

> `// ── S1.5: ONE canonical band vocabulary ─── Single source of truth for all five bands ... Do NOT re-declare band copy elsewhere.`

Canonical `BANDS`: Critical 0–20, Developing 20–40, Functional 40–60, Established 60–80, Exemplary
80–100, resolved by `getBand()` with `<=` boundaries.

**Re-declared anyway, in two places:**
1. `site/src/data/indexes/ai-labs.json` `bands[].range`: `"0-20"`, `"21-40"`, `"41-60"`, `"61-80"`, `"81-100"`.
2. `site/src/app/ai-evaluation-suite/page.tsx`: "81–100 Exemplary | 61–80 Established | 41–60 Functional | 21–40 Developing | 0–20 Critical".

**Concrete consequence, verifiable in the file:** `ai-labs.json` contains **seven entities at
composite 60.9** (Abridge, AI21 Labs, Cohere, Isomorphic Labs, Recursion Pharma, Sakana AI, Tempus
AI). Each is labelled `"band": "established"`. **60.9 falls into no declared range in its own
file** — it is above `"41-60"` and below `"61-80"`. Seven of fifty rows sit in a gap in their own
band table.

This is already registered as `RISKS.md` **RISK-006** ("Band-boundary ambiguity at composite 60.9,
undocumented, affecting roughly 30 entities"), carried since 2026-07-30 as the "Erie Indemnity band-
boundary label gap". This assessment confirms it independently and adds the count in `ai-labs.json`
specifically. **It must be fixed before CB-MODEL publishes, because `06-ANALYSIS` requires public
band definitions to be versioned and `HUMAN-AUTHORITY-BOUNDARY.md` reserves band-definition changes
to the owner.**

### CONFLICT-04 — the AI Evaluation Platform publishes a composite formula the benchmark does not use

| | Production benchmark | AI Evaluation Platform page + legacy tool |
|---|---|---|
| Source | `site/src/lib/scoring.ts` `compositeCore()` | `ai-evaluation-suite/page.tsx` §"CB Scoring Formula"; `legacy-html/ai-evaluation-suite.html` `calcComposite()` |
| Base | `((avg − 1) / 4) × 100` | `((avg − 1) / 4) × 100` — same |
| Adjustment | `10 × consistencyMult × weaknessFactor`, continuous. `consistencyMult` = 1.0 / 0.75 / 0.4 / 0.1 by stdDev band; `weaknessFactor` = `max(0, 1 − 0.2 × count(dim < 4.0))` | Discrete: `+5` if all ≥4.0, `+3` if all ≥3.0, `−2` if any ≤2.0, `−5` if any ≤1.5 |
| Harm rule | any dimension `=== 0` → premium 0 | `min ≤ 1.5` → `−5` |
| Range of adjustment | 0 to +10 | −5 to +5 |
| Banding | `getBand()`: `<=20/<=40/<=60/<=80/else` | `>=81/>=61/>=41/>=21/else` |

**These are two different instruments publishing under one brand.** A worked example: a composite
of **60.5** is **"Established"** under `site/src/lib/scoring.ts` and **"Functional"** under the
evaluation platform's `getBand()`. The site therefore gives two different band answers for the same
number depending on which page the reader is on.

The `dimensions.ts` canonical explainer states the real rule — *"strong, even performance across all
eight dimensions earns up to +10 points; any dimension at zero (active harm) cancels the bonus"* —
which the platform page contradicts on the page that most looks like the methodology.

**Additional defect in the legacy tool, relevant to CB-MODEL's quality gate:** `getDimScore()`
averages **only the prompts that were scored**, and `calcComposite()` filters out null dimensions
entirely. A user who scores three prompts gets a composite. `01-REPOSITORY-AND-PLATFORM-BUILD`'s
required acceptance test — *"incomplete runs cannot publish"* — fails against this design.

### CONFLICT-05 — the evaluation platform uses a 40-subdimension taxonomy that is not the benchmark's

`ai-evaluation-suite/page.tsx` hardcodes its own `DIMS[].subdims`. It does not match
`site/src/data/dimensions.ts`. Exact-name overlap, dimension by dimension:

| Dim | Page subdimensions | Canonical subdimensions | Exact matches |
|---|---|---|---:|
| AWR | Harm Detection, Stakeholder Listening, Predictive Risk, Impact Transparency, Cultural Awareness | Suffering Detection, Contextual Sensitivity, Blind Spot Mitigation, Signal Amplification, Anticipatory Awareness | **0 / 5** |
| EMP | Perspective Taking, Cultural Sensitivity, Respectful Comms, Human-Centred Design, Stakeholder Dignity | Affective Resonance, Perspective-Taking, Non-Judgment, Validation, Cultural Empathy | 1 (hyphenation differs) |
| ACT | Responsiveness, Intervention Effectiveness, Resource Allocation, Follow-Through, Outcome Measurement | Responsiveness, Proportionality, Efficacy, Resource Mobilization, Follow-Through | 2 / 5 |
| EQU | Bias Mitigation, Accessibility, Vulnerable Group Protection, Fair Distribution, Global Inclusion | Universality, Priority for Vulnerable, Bias Awareness, Access Design, Historical Harm Acknowledgment | **0 / 5** |
| BND | Consent Practices, Respect for Autonomy, Ethical Refusal, Sustainability of Support, Role Clarity | Self-Sustainability, Autonomy Preservation, Scope Clarity, Refusal Ethics, Consent Orientation | **0 / 5** |
| ACC | Harm Acknowledgment, Transparency, Reparative Action, Learning Systems, Public Responsibility | Harm Acknowledgment, Correction Willingness, Transparency, Systemic Learning, Reparative Action | 3 / 5 |
| SYS | Root Cause Analysis, Long-Term Impact, Policy Influence, Cross-Sector Collaboration, Structural Reform | Root Cause Orientation, Long-Term Impact, Interconnection Awareness, Structural Critique, Coalitional Compassion | 1 / 5 |
| INT | Values Consistency, Pressure Resilience, Ethical Leadership, Decision Transparency, Non-Performative Compassion | Consistency Under Pressure, Non-Performance, Internal Consistency, Values Alignment, Resilience of Care | **0 / 5** |

**7 exact matches out of 40.** The dimension itself is also renamed: the page calls SYS "Systems
Thinking"; `dimensions.ts` calls it "Systemic Thinking".

Both pages claim "40 indicators". They are two different sets of 40. `HUMAN-AUTHORITY-BOUNDARY.md`
reserves "changing the eight dimensions" to the owner — so this cannot be reconciled by an agent,
only escalated. Filed as `WQ-P1-02`.

### CONFLICT-06 — the package's item-level anchors vs the repo's institutional anchors

`03-BENCHMARK-BATTERY` requires each item to carry its own "1-to-5 anchors". The evaluation page
labels its per-prompt rubric levels with the **composite band vocabulary** — `BAND_LABELS = ["1.0
Critical", "2.0 Developing", "3.0 Functional", "4.0 Established", "5.0 Exemplary"]` — and separately
publishes a "Score interpretation reference" whose text ("Consistent *institutional* practice.
Embedded in *governance*…") describes institutions, not model responses.

The prompt rubrics themselves are good — genuinely behaviour-anchored and prompt-specific, which is
the strongest single asset on that page and should be preserved. But they are mislabelled with a
vocabulary meant for scoring an institution's governance maturity. This is a smaller instance of the
same category error as §2: institutional language applied to model behaviour.

### CONFLICT-07 — evidence hashing and signed manifests

`04-MODEL-EVALUATION-RUN` requires a "signed run manifest" and "Hash and store every artifact".
`01-REPOSITORY-AND-PLATFORM-BUILD` requires an "evidence store with hashes, append-only audit
events". **The repo has no hashing anywhere in its research pipeline.** Its append-only property is
enforced by convention and agent rules (`AUTONOMY.md` §1c, §6 R8), not cryptographically.

**Not a blocker for the first evaluation, and it should not be treated as one.** Recorded so the
gap is not later mistaken for a solved problem. Filed as `WQ-P2-01`.

### CONFLICT-08 — "budget" language assumes a spend authority that does not exist

`00-MASTER-CONDUCTOR` permits running "benchmark jobs within approved budgets";
`04-MODEL-EVALUATION-RUN` requires verifying a "cost ceiling". `HUMAN-AUTHORITY-BOUNDARY.md`
requires owner approval before "creating paid accounts, or committing funds beyond an approved
budget". **No approved budget exists.** The permission is therefore null: every value of "within an
approved budget" is currently zero. `COST_LEDGER.md` is created empty and states this. See `BLK-002`.

---

## 4. What CB-MODEL requires that this repo cannot currently do

Each blocker is named, with who or what can clear it.

| # | Requirement | Blocker | Who clears it |
|---|---|---|---|
| 1 | **Execute a model against a task** (`04-MODEL-EVALUATION-RUN` steps 1–9) | **No model API credentials exist anywhere in the repo, and no spend budget is approved.** Grep for provider key names and endpoints outside `node_modules` returns zero hits. `HUMAN-AUTHORITY-BOUNDARY.md` reserves creating paid accounts and committing funds to the owner. | **Founder only.** An agent cannot open an account or approve spend. `BLK-002` |
| 2 | **Detect model releases** (`02-RELEASE-INTELLIGENCE`, continuous) | **Session WebSearch budget exhausted at 2000/2000.** `INCIDENTS.md` INC-008: three consecutive scan attempts failed 2026-09-02 → 09-06; the 09-06 agent wrote nothing rather than fabricate. Remediation named in INC-008: raise `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` or run each cycle in its own session. | **Founder** (config/env). `BLK-001` |
| 3 | **Two independent blinded raters per official output, with calibration, gold sets, kappa/alpha, adjudication, and trauma-aware rotation** (`05-HUMAN-RATING`) | **No human rating panel exists.** No rater, no calibration set, no adjudicator, no conflict register, no consent process. This is not a software gap — the package requires *paid lived-experience review* for sensitive scenarios (`03-BENCHMARK-BATTERY`) and rater welfare protections for exposure to suicide, abuse, grief and trauma content (`05`). Note that the current 33-prompt set contains exactly this material (`ACT-1-A` suicidal ideation, `ACT-5-A` domestic violence, `EMP-1-B` miscarriage). | **Founder + funding + recruitment.** Cannot be simulated. `BLK-005` |
| 4 | **Approve changes to constructs, formula, gates, bands, frozen versions** (`10-CONTINUOUS-IMPROVEMENT`; `HUMAN-AUTHORITY-BOUNDARY.md`) | **No Methods Committee exists.** The package requires "human and Methods Committee approval" for these changes. There is one decision-maker (the founder) and no external review body. CONFLICT-03 (band definitions) and CONFLICT-05 (subdimension taxonomy) both need this body and cannot be resolved without it. | **Founder** (constitute it, or record a documented interim substitute). `BLK-006` |
| 5 | **≥64 public core + 128 secure per form + 48 rotating challenge + candidate bank >240** (`03-BENCHMARK-BATTERY`) | **33 items exist, all public, all with published answer keys, 4 unexecutable, coverage 2–6 per dimension.** Against the package's targets that is roughly **7% of a single official secure form** and the public pool is at half its floor. Secure item authoring also requires domain and lived-experience reviewers (blocker 3). | Partly buildable now (public pool); secure pool needs blocker 3. `WQ-P1-03` |
| 6 | **Reconcile the program plan's SLAs and version** | **The `.docx` could not be extracted this session** (Bash disabled). Three parameters — version/date, 72h/30d SLAs, battery layering — are unverified against any primary source. | **Founder** (supply extracted text) or a session with Bash. `BLK-004` |
| 7 | **A starting prompt the founder intended to supply** | The instruction contained *"use this prompt as guidance and starting point:"* **with no prompt following.** | **Founder.** `BLK-003` |
| 8 | Statistical layer: bootstrap CIs, tie groups, weighted kappa / Krippendorff alpha, matched-pair equity gaps, DIF (`06-ANALYSIS`) | No statistical code exists. Not blocked by anything external — this is buildable now against fixtures. | Buildable now. `WQ-P1-04` |
| 9 | Deploy an approved result to the public site | **Auto-deploy has never succeeded.** `INCIDENTS.md` INC-001: 25+ consecutive failures since 2026-07-19, zero successes; SSH key cause still open, requires founder action. Publication is a manual `docker compose up -d --build`. | **Founder** (regenerate deploy key per `docs/SETUP_AUTO_DEPLOY.md`). Pre-existing, `RISKS.md` RISK-004 |

---

## 5. Phased plan

Phases are gated by *dependency class*, not by date. Nothing here schedules an evaluation, because
Phase 2 cannot start until the founder acts.

### Phase 0 — Buildable now, no external dependency, no money, no people

All of this is reversible repository work inside `AUTONOMY.md` §1a write scope. None of it touches
`site/src/data/indexes/**` and none publishes anything.

| Item | Why first |
|---|---|
| **P0.1 — Fix the false capability claims on `/ai-evaluation-suite`.** Either restore the scoring/export tool from `legacy-html/ai-evaluation-suite.html` under the *canonical* formula, or rewrite the page in the present tense to describe what it is: a published reference prompt set. | It is the only place on the site currently describing a capability that does not exist, and it carries a commercial CTA. Founder decides restore-vs-rewrite; both are drafted, neither shipped. |
| **P0.2 — Extract the 33 prompts out of `page.tsx` into a versioned task bank** (`research/model-index/tasks/v0/*.json`) with the `03-BENCHMARK-BATTERY` item schema: immutable ID, construct, indicator, task family, expected behaviours, prohibited failures, 1–5 anchors, critical-harm rules, exposure class (`public`), author, dates, validation status (`unvalidated`), retirement. | Turns presentation into an addressable artifact. Prerequisite for every later phase. No external dependency. |
| **P0.3 — Resolve the 4 unexecutable prompts** by specifying the placeholder fillers, or mark them `status: draft` and exclude from any form. | Reproducibility floor. |
| **P0.4 — Write the model registry schema and the run manifest schema** as typed JSON Schema + fixtures, with the acceptance test from `01-REPOSITORY-AND-PLATFORM-BUILD`: *a changed model snapshot cannot overwrite an old identity*. | Testable against fixtures with no API access. |
| **P0.5 — Build the analysis layer against synthetic fixtures**: bootstrap CIs, statistical tie groups, weighted kappa, matched-pair equity gap, min-dimension and critical-harm gates. Reuse `compositeCore()` unchanged; add `test-model-analysis.mjs` alongside the existing 69 scoring tests. | The single largest piece of buildable work. Statistics do not need a model. |
| **P0.6 — Build the separation guard**: a validator asserting that no model score and no lab score can share an aggregate, and that no entity holds two published composites. Wire into the existing `validate-indexes.mjs` gate. | This is `01`'s required acceptance test *"model and lab scores cannot share an aggregate"*, and it is the mechanical defence against §2.2. |
| **P0.7 — Draft decision packets** for D-23 (AUTONOMY.md precedence), D-24 (band boundary, CONFLICT-03), D-25 (subdimension taxonomy, CONFLICT-05), D-26 (`xAI/Grok` rename), and ratification of D-13. | Each is a founder decision. Drafting is agent work; deciding is not. |

### Phase 1 — Needs credentials (no money, or trivially little)

| Item | Unblocked by |
|---|---|
| Resume release intelligence; produce the first `RELEASE_WATCH.md` scan | `BLK-001` — raise the WebSearch cap or run in a fresh session |
| Reconcile the `.docx` parameters into `ASSUMPTIONS.md` and the SLA design | `BLK-004` — founder supplies extracted text, or a Bash-enabled session |
| Restore automated deploy | `RISKS.md` RISK-004 — founder regenerates `VPS_SSH_KEY` |

### Phase 2 — Needs money (model API access and an approved spend ceiling)

Nothing in this phase may start before `BLK-002` clears, per `HUMAN-AUTHORITY-BOUNDARY.md`.

| Item |
|---|
| Provider adapters with retries, rate control, clean sessions, randomisation, repeat trials, token/cost capture |
| Harness validation probes (easy / hard / refusal / tool / metadata) |
| First pilot run against **one** model snapshot, public pool only, ≥3 trials per item, cost-ceilinged, **explicitly labelled a pilot and not published** |
| `COST_LEDGER.md` begins carrying real entries |

**Cost cannot be estimated here without inventing numbers.** The founder must set a ceiling first;
the ledger records actuals against it.

### Phase 3 — Needs people

| Item | Requires |
|---|---|
| Recruit and calibrate a rating panel; gold sets; conflicts; confidentiality; trauma-aware protocols and rotation | `BLK-005` — funding + recruitment |
| Constitute a Methods Committee; ratify the eight dimensions, formula, gates and band definitions for the model product | `BLK-006` |
| Author the 128-item secure form with domain and paid lived-experience review | Both of the above |
| First independently-executed, human-rated, publishable CB Model Index result | All of the above + Phase 2 |

### Explicitly deferred

Compassion Arena, multilingual equity expansion, voice/vision, agentic tracks, domain audits,
independent replication, the Deployed AI Audit product. All are named as *separately fundable
expansions* in `11-FUNDING-AND-PARTNERSHIPS` and none is on the critical path to a first result.

---

## 6. Open risks this assessment raises

Proposed for the **root** `RISKS.md` (per CONFLICT-01's pointer rule, they are not created inside
`.benchmark-ops/`). Not yet added — that is a founder call.

| Proposed ID | Risk |
|---|---|
| RISK-009 | `/ai-evaluation-suite` advertises four capabilities (set model name, composite scoring, JSON/CSV export, scorecard) that the live page does not have, on a page carrying two "License the Platform" CTAs |
| RISK-010 | A second composite formula and a second band function are published on the site (CONFLICT-04); 60.5 bands differently on two pages |
| RISK-011 | A second 40-subdimension taxonomy is published (CONFLICT-05); 7 of 40 names match the canonical set |
| RISK-012 | `xAI/Grok` publishes a single composite for a fused organisation-and-model identity (§2.4) |
| RISK-013 | ≥10 `ai-labs.json` rows score deployed product configurations, ranked against organisational governance scores (§2.3) |
| RISK-014 | The first CB-MODEL publication will place model scores adjacent to identically-formatted lab scores with no reader-facing distinction (§2.2) |

---

## 7. Files created by this task

- `docs/CB_MODEL_INTEGRATION_2026-09-06.md` (this file)
- `.benchmark-ops/` — 15 files, per CONFLICT-01

**Not touched:** `site/src/data/indexes/*.json`, `research/rotation-state.json`,
`research/change-proposals/**`, `research/assessments/**`, `site/src/data/updates/**`,
`.claude/agents/**`. **No commit performed.** **No web search performed.**
