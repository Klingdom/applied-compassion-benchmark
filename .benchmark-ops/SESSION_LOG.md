# CB-MODEL — Session Log (SCOPED POINTER FILE)

> **Durable lessons belong in `research/ITERATION_LOG.md`** (1,141 lines, the repo's learning
> record). Incidents belong in `INCIDENTS.md`. This file holds **per-session CB-MODEL run records
> only** — what was done, what was verified, what was left. It does not fork either.

Rationale: `docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-01.

Newest first.

---

## Session 001 — 2026-09-06 — Assessment and scaffold

**Agent:** system-architect. **Type:** current-state assessment + operating-state scaffold.
**Authority:** `HUMAN-AUTHORITY-BOUNDARY.md` — stopped before anything that publishes a score or
commits funds.

### Scope as instructed
Two deliverables: `docs/CB_MODEL_INTEGRATION_2026-09-06.md`, and `.benchmark-ops/`. Explicitly **not**
an implementation of the three-year programme.

### What was read
- **15 of 16 package files in full.** `README.md`, `HUMAN-AUTHORITY-BOUNDARY.md`,
  `OPERATING-STATE-SPEC.md`, super-prompts `00`–`11`.
- **Repo:** `CLAUDE.md`, `AUTONOMY.md`, `DECISIONS.md`, `INCIDENTS.md`, `RISKS.md`,
  `AGENT-ROUTING.md` (§0–2), `docs/OPERATING_SYSTEM_ADAPTATION.md`, `research/ARCHITECTURE.md`,
  `research/DATA_MODEL.md`, `research/IMPROVEMENT_BACKLOG.md`, `research/ITERATION_LOG.md`,
  `research/SYSTEM_HEALTH.md`.
- **Code/data:** `site/src/app/ai-evaluation-suite/page.tsx` (all 373 lines),
  `legacy-html/ai-evaluation-suite.html` (scoring functions), `site/src/data/dimensions.ts` (all
  637 lines), `site/src/lib/scoring.ts` (all 166 lines), `site/src/data/indexes/ai-labs.json` (full
  roster + meta), targeted reads of `fortune-500.json`.

### What could NOT be read
`Compassion_Benchmark_AI_Model_Program_Plan.docx` (~786 lines). **Bash is disabled for this session**,
so the zip could not be opened and `word/document.xml` could not be detagged; the Read tool rejects
binary. Logged as `BLK-004`. **Consequence: three supplied "established facts" have no reachable
primary source** (ASM-001, ASM-002, ASM-003).

### Verification performed rather than trusted
- **Confirmed** the Microsoft/Amazon/Meta pairs by direct file read: 75.9/65.3, 35.9/12.8,
  26.3/7.8. Corrected one detail — the fortune-500 row is named "Meta Platforms", not "Meta".
- **Confirmed** the 33-prompt count by enumerating the `PROMPTS` array: AWR 6, EMP 5, ACT 5, EQU 3,
  BND 3, ACC 4, SYS 2, INT 5 = 33.
- **Re-derived** `ai-labs.json` band counts (3/8/16/18/5) and median (45.3) from the rows. They
  **agree** with the file's `meta`. Recorded as a positive finding rather than manufacturing a
  defect.
- **Checked** all seven supplied "established facts" against the package. Four verified, three not
  present anywhere in the readable files.
- **Grepped** for provider API keys and endpoints outside `node_modules`: **zero hits**.

### Findings that changed the picture
1. **The 33-prompt suite is presentation, and the tool it advertises was lost in the Next.js
   migration.** `legacy-html/ai-evaluation-suite.html` is a working manual scorer with
   `setScore`/`calcComposite`/`exportJSON`/`exportCSV`/`copyScorecard`. `page.tsx` is a static
   server component that kept the copy and dropped the behaviour. The four "Export & API" cards are
   inert prose next to two "License the Platform" CTAs.
2. **`xAI/Grok` at composite 0.0 is a literal published merge of a lab and a model in one row.**
   The clearest existing violation of the package's non-negotiable rule — and not one that was
   flagged in the brief.
3. **The Microsoft/Amazon/Meta pairs are *not* the model/lab merge.** Both sides are organisational
   governance scores. They are a duplicate-publication defect (already RISK-003 and D-13 R-SUB-3)
   plus an unratified-rule-enforced-selectively defect. The *real* model/lab risk is the name
   collision that fires on day one of publication (RISK-014).
4. **Two 40-subdimension taxonomies are published; 7 of 40 names match.** AWR, EQU, BND and INT
   overlap on zero. Not previously registered anywhere.
5. **Two composite formulas and two band functions are published.** Composite 60.5 bands as
   "Established" on one page and "Functional" on another.
6. **≥10 AI Labs rows are Deployed AI Audit subjects.** A genuine three-product separation failure
   already live in published data.
7. **`OPERATING-STATE-SPEC.md` lists 15 files, not 14.** All 15 created; discrepancy logged.

### What was written
`docs/CB_MODEL_INTEGRATION_2026-09-06.md` and 15 files under `.benchmark-ops/`.

### What was NOT done — deliberately
- **No web search.** Budget exhausted (`BLK-001`); the instruction was explicit.
- **No commit.**
- **No write** to `site/src/data/indexes/*.json`, `research/rotation-state.json`,
  `research/change-proposals/**`, `research/assessments/**`, `site/src/data/updates/**`, or any
  agent spec.
- **No model, version, score, evaluation result, rater, citation or cost invented.** All five
  ledgers are empty and each states why.
- **No fix applied** to any defect found. All five conflicts requiring a founder or Methods
  Committee decision were logged as drafts (D-23…D-28), not resolved.
- **The `BLK-003` inference was not acted upon.** The missing starting prompt was probably
  `00-MASTER-CONDUCTOR`, but executing it would have committed the programme to its continuous
  autonomous loop, which conflicts with `AUTONOMY.md` §9 and with this task's scope.

### Left in a runnable state
Yes. Nothing executable was modified. `.benchmark-ops/` is additive; `docs/` is additive.

### Handoff
`NEXT_ACTIONS.json` carries the exact next three actions. All three are founder actions — none is
agent-executable while `BLK-001`, `BLK-002` and `BLK-004` are open.
