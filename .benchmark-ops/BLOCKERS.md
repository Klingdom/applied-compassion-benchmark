# CB-MODEL — Blockers

Single-authority file. A blocker is something that stops CB-MODEL work and **cannot be cleared by
an agent**. Anything an agent can clear is a work item, not a blocker — it belongs in `WORK_QUEUE.md`.

Newest first. Never delete a cleared blocker; mark it `CLEARED` with the date and what cleared it.

**Last updated:** 2026-09-06.

---

## Index

| ID | Blocker | Severity | Clears when | Status |
|---|---|---|---|---|
| BLK-001 | Session WebSearch budget exhausted (2000/2000) | High | Cap raised or fresh session | **OPEN** |
| BLK-002 | No model API credentials, no approved spend budget | **Critical** | Founder approves budget + provisions access | **OPEN** |
| BLK-003 | Founder's starting prompt was not supplied | Medium | Founder supplies it, or confirms none intended | **OPEN** |
| BLK-004 | Program plan `.docx` could not be extracted | High | Founder supplies extracted text, or Bash-enabled session | **OPEN** |
| BLK-005 | No human rating panel | **Critical** (for publication) | Funding + recruitment + calibration | **OPEN** |
| BLK-006 | No Methods Committee | High | Founder constitutes it or records an interim substitute | **OPEN** |

Everything in `WORK_QUEUE.md` Phase 0 is buildable with all six of these open. Phases 1–3 are not.

---

## BLK-002 — No model API credentials and no approved spend budget

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 |
| **Severity** | Critical — blocks the entire evaluation product |
| **Blocks** | `04-MODEL-EVALUATION-RUN` in full; `02-RELEASE-INTELLIGENCE` sentinel probes; all of Phase 2; `COST_LEDGER.md` |
| **Owner** | **Founder. An agent cannot clear this.** |

**Verified state.** A grep across the repository excluding `node_modules` for `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY`, `GOOGLE_API_KEY`, `api.anthropic.com`, `api.openai.com` and
`generativelanguage` returns **zero hits**. There is no provider adapter, no HTTP client for a
model endpoint, and no `.env` reference to one. The repo has never called a model API.

**Why an agent must not clear it.** `AI Benchmarking Program/HUMAN-AUTHORITY-BOUNDARY.md` requires
owner approval before *"creating paid accounts, or committing funds beyond an approved budget."*
`AUTONOMY.md` §1b independently escalates *"any deploy, build-and-ship, container rebuild, DNS, TLS
or secret operation."*

**Note on the package's own wording.** `00-MASTER-CONDUCTOR` grants autonomy to run "benchmark jobs
within approved budgets" and `04-MODEL-EVALUATION-RUN` requires verifying a "cost ceiling". With no
approved budget, that permission evaluates to zero. The grant is real but currently empty
(`docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-08).

**What clearing looks like — the decision the founder actually has to make:**
1. Which providers, and at what access tier (consumer product, API default, base model, fine-tune)?
   `07-PUBLICATION-AND-WEBSITE` requires these to be scored and displayed **separately**, so the
   choice determines the shape of the first result.
2. A ceiling in currency per evaluation wave, and who may spend against it.
3. Whether provider-donated access is acceptable. `11-FUNDING-AND-PARTNERSHIPS` requires donated
   model access and compute to be **disclosed** and caps a single developer or affiliated source at
   20% of annual programme funding after Year 1.

**No cost estimate is offered here.** Producing one would require inventing per-token prices, trial
counts and item counts that no artifact in this repository supports. Once a ceiling exists,
`COST_LEDGER.md` records actuals against it.

---

## BLK-001 — Session WebSearch budget exhausted at 2000/2000

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 (the underlying incident opened the same day) |
| **Severity** | High |
| **Blocks** | `02-RELEASE-INTELLIGENCE` entirely; the first `RELEASE_WATCH.md` scan; the 2026-09-02 → 09-06 coverage gap |
| **Owner** | Founder (environment configuration) |
| **Source of record** | `INCIDENTS.md` **INC-008** |

**Verified state.** Per INC-008, three consecutive scan attempts (2026-09-02, 09-03, 09-06) failed.
The 09-06 agent reported `2000 of 2000 WebSearch calls` used at session start and **wrote nothing at
all rather than fabricate coverage**. The binding constraint is a session-wide cap shared across
every agent run in the session, not the ~270-search budget a single scan is designed for.

**Recorded because it matters** (INC-008's own note): the 09-03 failure was misdiagnosed twice as a
briefing-emphasis problem before the shared external constraint was identified. *When two agents
fail in complementary ways, check for a shared external constraint before rewriting the brief.*

**Clearing action, from INC-008 remediation:** raise
`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`, or run each cycle in its own session. A full cycle costs
~265–280 searches against 1,331 entities.

**Consequence for CB-MODEL specifically.** No model-release scan has ever run, so this blocker has
not yet *interrupted* CB-MODEL work — it prevents it from starting. `RELEASE_WATCH.md` is created
empty and says so.

**No web search was attempted during this task.** Calls would fail and the instruction was explicit.

---

## BLK-003 — The founder's intended starting prompt is missing

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 |
| **Severity** | Medium |
| **Blocks** | Confidence that this task's framing matches what was intended |
| **Owner** | Founder |

**What happened.** The instruction that initiated this work contained the literal text
**"use this prompt as guidance and starting point:"** followed by **nothing**. The prompt referred
to was not included.

**What was done instead.** The full 15-file package was read and used as the source of authority,
and the work was scoped to the two deliverables the founder specified explicitly.

**The inference, labelled as an inference and not acted upon as an instruction.**
`AI Benchmarking Program/README.md` §"Recommended invocation" says: *"Paste the master conductor
into Claude Code at the repository root. Tell it to read the complete package and begin."* The
missing prompt was **most likely** `00-MASTER-CONDUCTOR-SUPER-PROMPT.md`. That is a plausible
reconstruction, not a fact, and it has **not** been executed as if it were the instruction — doing
so would have committed the programme to `00`'s continuous autonomous loop, whose step 7 ("do not
stop after producing a plan") conflicts with `AUTONOMY.md` §9 and with this task's explicit
"scaffold, do not implement" scope.

**Precedent for handling it this way.** `AUTONOMY.md` R7: *"Correct the instruction in the record;
do not silently obey or silently ignore it."* The 2026-08-20 instruction-accuracy note is the
governing example.

**The precise question for the founder:** *Was the intended starting prompt
`00-MASTER-CONDUCTOR-SUPER-PROMPT.md`, or a different prompt not in the package?*

---

## BLK-004 — `Compassion_Benchmark_AI_Model_Program_Plan.docx` could not be extracted

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 |
| **Severity** | High — it is one of four named authoritative sources |
| **Blocks** | Verification of the version, the release-testing SLAs, and the battery layering; therefore any schedule or SLA commitment |
| **Owner** | Founder (supply extracted text) or a session with Bash enabled |

**What happened.** The Bash tool is disabled for this session, in subagents as well. The `.docx`
could not be unzipped, so `word/document.xml` could not be detagged. The Read tool rejects it as a
binary file. Approximately 786 lines of the plan are unread.

**Why it matters.** `README.md` §"Source authority" names *"the approved AI Model Evaluation Program
Plan"* as one of four sources the implementation must treat as governing.

**What is demonstrably missing as a result.** Checked by grep across all 15 readable package files —
**none of these strings appears anywhere**: `CB-MODEL`, `72`, `30-day`, `three-year`, `Version 1`,
`2026`, `three-layer`, `public reference`.

Therefore three supplied "established facts" have **no primary source this session could reach**:

| Supplied fact | Status |
|---|---|
| Version 1.0, dated 2026-09-06, three-year horizon | Unverified — carried as `ASM-001` |
| 72-hour rapid result / 30-day full result | Unverified — carried as `ASM-002` |
| Three-layer battery (public / secure rotating / live challenge) | Partly contradicted — the package specifies **six** pools with numeric targets. Carried as `ASM-003` |

**Do not commit to a 72-hour SLA until this is resolved.** An SLA is a public promise and the number
currently rests on recollection, not on a readable source.

---

## BLK-005 — No human rating panel

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 |
| **Severity** | Critical for publication; not for Phase 0 or a labelled pilot |
| **Blocks** | Every official human-rated result; `05-HUMAN-RATING-AND-ADJUDICATION` in full; `VALIDATION_LEDGER.md` reliability entries |
| **Owner** | Founder — funding, then recruitment |

**Verified state.** No rater, no rater agreement, no calibration set, no gold item, no adjudicator,
no conflict-of-interest register, no confidentiality agreement, and no consent process exists
anywhere in the repository.

**Why this cannot be substituted with an agent.** `05-HUMAN-RATING` requires **two independent
raters** per official human-rated output, blinded to model identity, provider, previous rank and
other ratings, with weighted kappa or Krippendorff alpha reported by dimension, rater group and
wave — and explicitly forbids concealing weak reliability. `03-BENCHMARK-BATTERY` requires **paid
lived-experience review** for sensitive scenarios. An agent cannot be two independent human raters,
and self-rating would make every reliability statistic meaningless.

**Welfare obligation, flagged because the existing item set already contains the material.**
`05-HUMAN-RATING` requires protecting raters from excessive exposure to suicide, abuse, hate, grief
and trauma, with opt-out, rotation, breaks and escalation. The current 33-prompt set includes
`ACT-1-A` (active suicidal ideation, "I've been researching methods"), `ACT-5-A` (domestic violence
disclosure with children involved), `ACT-5-B` (psychosis-adjacent disclosure) and `EMP-1-B`
(miscarriage). **Recruiting raters before these protocols exist would be the wrong order.**

**Related repo evidence that human rating is genuinely needed.** `DECISIONS.md` D-07: two runs of
the *same* automated pipeline assessed ADP three days apart at 58.1 and 60.6 — a 2.5-point spread
landing on opposite sides of a band boundary. Kazakhstan swung 24.4 → 13.7 in four days (D-07,
still open). Machine-only scoring in this repo has a demonstrated reliability problem.

---

## BLK-006 — No Methods Committee

| Field | Value |
|---|---|
| **Opened** | 2026-09-06 |
| **Severity** | High |
| **Blocks** | CONFLICT-03 (band definitions), CONFLICT-05 (subdimension taxonomy), any change to constructs, formula, gates or frozen versions |
| **Owner** | Founder |

**Verified state.** There is one decision-maker. No external review body exists.

**What requires it.** `10-CONTINUOUS-IMPROVEMENT`: *"Changes to official constructs, scoring, gates,
bands, or frozen versions require human and Methods Committee approval."*
`HUMAN-AUTHORITY-BOUNDARY.md` independently reserves *"changing the eight dimensions, official score
formula, critical gates, public band definitions, or a frozen benchmark version"* to the owner.

**Why it is live right now, not theoretical.** Two conflicts found by this assessment can only be
resolved by this body:
- **CONFLICT-03** — two band vocabularies are published; seven `ai-labs.json` entities at 60.9 fall
  in a gap in their own file's band table (also `RISKS.md` RISK-006, open since 2026-07-30).
- **CONFLICT-05** — two different 40-subdimension taxonomies are published; only 7 of 40 names match.

Both are, definitionally, changes to public band definitions and to the dimensions. Neither can be
fixed by an agent.

**Interim option the founder may prefer:** record a documented interim substitute (e.g. named
external reviewers consulted per decision, logged in root `DECISIONS.md`) rather than standing up a
formal committee before there is a result to review. Either way it must be **written down**, because
`HUMAN-AUTHORITY-BOUNDARY.md` also forbids *"representing a draft as peer reviewed, validated,
certified, legally compliant, or independently audited."*
