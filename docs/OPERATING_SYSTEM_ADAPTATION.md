# Operating-System Adaptation — 6S Success → Compassion Benchmark

**Date:** 2026-08-24
**Source reviewed:** 52 top-level markdown files + 14 agent definitions in the 6S Success
`6s-success-claude-files` tree.
**Decision:** adapt the *structure*, populate with **this project's own history**. Copy nothing verbatim.

---

## Why not copy

The 6S corpus is a coherent operating system for a **live consumer SaaS** — events, an internal
API, mission control, cost governance, a customer journey. Compassion Benchmark is a different
machine: a **statically-exported site plus a nightly research pipeline** that publishes scored
judgments about real institutions.

Porting the corpus wholesale would install a second, contradictory constitution. `CLAUDE.md` there
opens *"6S Success Autonomous Operating System"* and defines a Values → Room → Micro-Zone → Quest
model; `METRICS.md` defines household-product metrics. Dropped here they would collide head-on with
this repo's own `CLAUDE.md`, `research/CHANGELOG.md` and independence policy.

So this adaptation asks one question per artifact: **does this repo have a real, evidenced problem
that the artifact solves?** Where the answer is no, it is not created.

---

## 1. Already covered — do not create

| 6S artifact | Compassion Benchmark equivalent |
|---|---|
| `CLAUDE.md` | `CLAUDE.md` + `.claude/agents/CLAUDE.md` |
| `CHANGELOG.md` | `research/CHANGELOG.md` |
| `BACKLOG.md` | `research/IMPROVEMENT_BACKLOG.md` |
| `LEARNINGS.md` | `research/ITERATION_LOG.md` (1,141 lines) |
| `STATUS.md`, `AUTONOMY-HEALTH.md` | `research/SYSTEM_HEALTH.md` |
| `SCHEDULER.md`, `AUTONOMY-SCHEDULER.md` | `research/SCHEDULING.md` |
| `RUNBOOK.md` | `DEPLOYMENT.md`, `worker/README.md` |
| `DATA-CONTRACTS.md`, `AUTONOMY-DATA-MODEL.md` | `research/DATA_MODEL.md`, `research/ARCHITECTURE.md` |
| — | `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md` — **no 6S equivalent; unique to this repo and central to it** |

## 2. Product-specific — do not port

`BUSINESS.md` · `STRATEGY.md` · `PRODUCT-CATALOG.md` · `6S_SUCCESS_PRODUCT-CATALOG.md` ·
`CONTENT-CATALOG.md` · `CUSTOMER-JOURNEY.md` · `GROWTH-ENGINE.md` · `METRICS.md` · `ROADMAP.md` ·
`EXPERIMENTS.md` · `DASHBOARD.md` · `EXECUTIVE-DASHBOARD.md` (+ duplicate) · `EXECUTIVE-BRIEF.md` ·
`OWNER-COMMAND-CENTER.md` · `OWNER-DIRECTIVES.md`

These describe a household-organisation product. This repo's product definition lives in
`docs/PRD_MONETIZATION.md`.

## 3. Over-engineered for this scale — do not port

`AUTONOMY-API.md` · `AUTONOMY-EVENTS.md` · `AUTONOMY-MEMORY-ARCHITECTURE.md` ·
`AUTONOMY-OPPORTUNITY-ENGIN.md` · `AUTONOMY-ORCHESTRATION.md` · `AUTONOMY-LEARNING-ENGINE.md` ·
`MISSION-CONTROL.md` · `AGENT-EVALUATIONS.md` · `SYSTEM-REGISTRY.md` · `COST-GOVERNANCE.md` ·
`SELF-IMPROVEMENT.md` · `AUTONOMY-DECISION-ENGINE.md`

There is no event bus, no internal API, no live service topology and no autonomous spend here. A
static export and a nightly pipeline do not need them. `SELF-IMPROVEMENT.md`'s function is already
served by `research/IMPROVEMENT_BACKLOG.md` + `research/ITERATION_LOG.md`.

---

## 4. Create — each answers a documented failure in this repo

| Artifact | The failure it addresses |
|---|---|
| **`AUTONOMY.md`** | **Highest value.** There is no written rule for what an agent may apply versus escalate. On 2026-08-16 `score-updater` refused a batch twice, and on 2026-08-20 it held 37 of 66 — each time correctly, each time rediscovering the boundary from first principles. The distinction that emerged (assessor *routing* is overridable; an explicit *self-veto* is not) exists only in commit messages. |
| **`INCIDENTS.md`** | The `Deploy to VPS` workflow failed **25+ consecutive runs from 2026-07-19** and had never once succeeded. It had two distinct causes in sequence (Node 20 type-stripping, then an invalid `VPS_SSH_KEY`) and the second looked like the first for weeks. There was nowhere to log it. |
| **`OBSERVABILITY.md`** | Between 2026-08-16 and 08-19 the live site served Uganda at 20.3 while `main` had 11.9 — across six pushes, with every health check green. Nothing watched whether production matched `main`. A freshness assertion was added on 08-19; the policy around it is unwritten. |
| **`DECISIONS.md`** | Load-bearing decisions live only in commit messages: the absence-of-disclosure convention (2 vs Cerebras's 3), the band-crossing filing clause, the founder-override precedent, the entity-record hold rule, index demarcation. `.claude/decisions.md` (142 lines) is a start and should be superseded. |
| **`RISKS.md`** | No register. Live risks include ~59% of published entities on placeholder scores, 50 held proposals, 12 entity-currency defects, a broken deploy pipeline, and two indexes containing the same company twice. |
| **`AGENT-ROUTING.md`** | 32 agents with no routing policy. Overlaps are unresolved (`analytics`/`analytics-intelligence`, `devops-engineer`/`devops-sre`), concurrency rules are ad hoc, and two agents writing the same index concurrently is a live corruption risk that has had to be managed by hand all session. |
| **`DISASTER-RECOVERY.md`** | No documented restore path for the VPS, the Cloudflare Worker, or `rotation-state.json` — which is `.gitignore`d yet tracked, and is the pipeline's baseline for 1,331 entities. |
| **`DATA-SOURCES.md`** | Evidence tiering (1–5), the undated-source rule, the World Report stale-year trap and the self-published-material exclusion are scattered across four agent specs. A single registry would have prevented at least four confirmed year-confusion defects. |

**Not created for now:** `TESTING.md`, `RELEASES.md`, `SECURITY.md`. The first two are largely
covered by the validator suite and `DEPLOYMENT.md`; `SECURITY.md` is worth writing but no security
incident has occurred to ground it, and an ungrounded policy document is the kind of artifact this
repo already has too many of.

---

## 5. Principle

Every created artifact must be **populated with real incidents, real decisions and real dates from
this repository**. A template with placeholder rows is worse than no file: it looks like governance
while asserting nothing, and future agents will treat it as authoritative.
