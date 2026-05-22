# Improvement Backlog

Ranked candidates for the continuous improvement loop. Scoring rubric:

**Priority Score = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk + Aging − DefectClassRepetition**

Each axis 1–5. Higher = more attractive. Risk + Effort subtract.

**Aging multiplier (added Loop 4 per meta-coordinator):** +1 score per 5 cycles open. An item open ≥5 cycles gets +1; ≥10 cycles +2; ≥15 cycles +3; ≥20 cycles +4. Resets when item is in progress.

**Defect-class repetition penalty (added Loop 4 per meta-coordinator):** −2 if the last 2 completed loops both touched the same agent OR the same defect class. Prevents recency anchoring (Loops 1–3 all targeted the May 21 reviewer-language slip class).

**Honest post-hoc re-scoring (added Loop 4 per meta-coordinator):** After completion, re-score Effort and Risk based on actual experience. If predicted vs actual diverge by ≥1 on either axis, log as a calibration signal in the iteration log.

Strategic alignment for Compassion Benchmark = determinism, traceability, evidence linkage, system correctness, polish on public surface.

---

## Status Legend

- **Open** — candidate available for selection
- **In Progress** — selected in current loop
- **Done** — implemented + validated + logged
- **Deferred** — explicitly deprioritized with reason

---

## Backlog (ranked by Priority Score, descending)

| # | Title | Type | Impact | Strat | Learn | Conf | Effort | Risk | Base | Aging | Repeat | **Score** | Status |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | Stale-baseline drift guard in score-updater | fix | 5 | 5 | 4 | 5 | 2 | 1 | 16 | – | – | **16** | ✅ Done (Loop 1) |
| 2 | Mandate SYSTEM_HEALTH.md + IMPROVEMENT_BACKLOG.md exist (foundational) | improvement | 3 | 5 | 4 | 5 | 1 | 1 | 15 | – | – | **15** | ✅ Done (Loop 1) |
| 3 | Build-time PUBLIC DAILY JSON RULES validator | improvement | 4 | 5 | 3 | 5 | 2 | 1 | 14 | – | – | **14** | ✅ Done (Loop 3) |
| 4 | Extend PUBLIC DAILY JSON RULES coverage to `boundaryWatch[].note` and `emergingRisks[].risk` | fix | 4 | 5 | 3 | 5 | 1 | 1 | 15 | – | – | **15** | ✅ Done (Loop 2) |
| 5 | Symmetric scanner field standardization (`compassionImprovementsDetected`) | improvement | 3 | 4 | 3 | 4 | 2 | 1 | 11 | 0 | 0 | **11** | Open |
| 6 | Forward-trigger calendar artifact (`research/FORWARD_TRIGGERS.md`) | improvement | 3 | 4 | 3 | 5 | 1 | 1 | 13 | 0 | 0 | **13** | Open |
| 7 | Open Bionics math-hygiene formula audit (18-cycle blocking defect) | fix | 4 | 4 | 3 | 3 | 1 | 1 | 9 | +3 | 0 | **12** | ✅ Done (Loop 4) — FALSE POSITIVE; Effort re-scored 3→1, Risk 2→1 (post-hoc calibration) |
| 8 | Incremental score-file regeneration (only changed entities) | improvement | 3 | 3 | 2 | 4 | 3 | 3 | 6 | 0 | 0 | **6** | Open |
| 9 | Boundary watch dashboard / API endpoint | experiment | 3 | 3 | 3 | 4 | 3 | 2 | 8 | 0 | 0 | **8** | Open |
| 10 | Cycle-over-cycle drift report (catches accumulated sub-threshold drift) | improvement | 4 | 4 | 4 | 3 | 4 | 2 | 9 | 0 | 0 | **9** | Open |
| 11 | Test harness for nightly pipeline agents (NEW — meta-coord recommendation) | improvement | 4 | 4 | 4 | 3 | 2 | 1 | 12 | – | – | **12** | ✅ Done (Loop 5) — Effort 4→2, Risk 2→1 post-hoc |
| 12 | Worker badge endpoint health check + alert-pipeline monitoring (NEW — meta-coord recommendation) | improvement | 3 | 3 | 3 | 4 | 3 | 2 | 8 | – | – | **8** | Open |
| 13 | Extract `FORBIDDEN_*` rule constants into shared `site/scripts/lib/lint-rules.mjs` (Loop 5 follow-up) | improvement | 2 | 4 | 2 | 5 | 1 | 1 | 11 | – | – | **11** | ✅ Done (Loop 6) — Effort 1→1, Risk 1→2 post-hoc (wrapper-signature regression briefly broke tests; caught instantly, 1-line fix) |
| 14 | Test harness for score-updater drift guard (Loop 5 follow-up) | improvement | 3 | 5 | 3 | 4 | 3 | 2 | 10 | – | – | **10** | Open |

---

## Evidence Anchors

### Item 1 — Stale-baseline drift guard
- **Evidence:** May 21 WIDE cycle, 2 of 8 proposals (25%) held when score-updater detected stale baselines. US proposal referenced 54.5; index actual was 25.0 (from April 17 application). Pakistan proposal referenced 22.7; index actual was 17.2. Applying either would have inverted the intended downgrade.
- **Root cause:** `.claude/agents/score-updater.md` PROCESS Step 2b reads index but doesn't compare proposal baseline to current composite before writing.
- **Fix scope:** Update agent definition (`score-updater.md`) to add Step 2b.5 — baseline drift verification — with documented refusal behavior and PENDING_CHANGES.md logging.

### Item 2 — Mandated artifact creation
- **Evidence:** CLAUDE.md requires IMPROVEMENT_BACKLOG.md, SYSTEM_HEALTH.md, ITERATION_LOG.md. Only ITERATION_LOG.md existed pre-loop.
- **Fix scope:** Create both files with seed content.

### Item 3 — Build-time JSON validator
- **Evidence:** May 21 cycle: 4 reviewer-facing phrases reached the public JSON before coordinator manually grep'd them out. Manual catch worked once; not reliable.
- **Fix scope:** `site/scripts/lint-daily-briefings.mjs` — fails build if forbidden phrases / status / actionType / cycleType / pipeline-key found in `site/src/data/updates/daily/*.json`.

### Item 4 — Extend PUBLIC DAILY JSON RULES
- **Evidence:** Same May 21 incident. Rules cover `topSignals` well but underspecify `boundaryWatch[].note` and `emergingRisks[].risk` fields.
- **Fix scope:** Add field-shape-specific examples to `.claude/agents/overnight-digest.md` PUBLIC DAILY JSON RULES section.

### Item 7 — Open Bionics math-hygiene
- **Evidence:** May 19 cycle log: "16 cycles CRITICAL BLOCKING". May 21 cycle: "Cycle 18 CRITICAL BLOCKING". Aging defect.

### Item 8 — Incremental score regeneration
- **Evidence:** May 21 deployment commit: 1,152 files changed / 1,144 public score files when only 6 entities had actual scoring changes. Wasteful, slow to diff.

---

## Selection Rationale (Loop 1)

**Selected: Item 1 — Stale-baseline drift guard.**

Why:
- Highest scored item (16).
- Bit production this exact cycle. Concrete evidence in front of us.
- Strengthens all three Ledgerium priorities: determinism, traceability, correctness.
- Lowest-risk fix (purely additive guard, no behavior change for non-drift cases).
- Highest confidence (we know the exact failure mode and exact code paths).

**Also in scope (forced by loop discipline):** Item 2 — creating IMPROVEMENT_BACKLOG.md (this file) and SYSTEM_HEALTH.md, both of which are required by Step 8 of the improvement loop. Treating these as foundational scaffolding for the loop itself rather than scope expansion.
