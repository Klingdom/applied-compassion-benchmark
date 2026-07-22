# Change-Proposal Backlog Triage — 2026-07-21

**Trigger:** Founder request to (2) reconcile the already-published US-States 07-19 proposals and (3) triage the old April–June proposal backlog.

**Scope:** the 202 change-proposal files carrying `status` ∈ {`pending`, `proposed`, `approved`} — i.e. the raw, un-triaged backlog. Files already carrying a pipeline disposition (`auto-confirm-eligible`, `documented`, `requires-human-review`, `band-crossing-proposed`, `floor-confirmed`, …) were **left untouched** — they represent prior triage decisions, not raw backlog.

**Score impact: zero.** No published index was modified. This exercise changed only proposal-file `status`/`triage_note` fields. `score-updater` acts solely on `status: "approved"`, so none of the statuses set here can cause an apply.

---

## Task 2 — US-States 07-19 (already published)

51 proposals dated 2026-07-19 for the `us-states` index. Verified every one's `proposed_scores.composite` matches the live `us-states.json` **exactly** (0 mismatches, 0 not-found). These went live via the index rebuild in commit `613473b4`; the proposal files were simply never marked.

**Action:** all 51 set to `status: "applied"`, `applied_via` recording the index-rebuild provenance. Record-keeping only.

---

## Task 3 — April–June backlog triage

151 non-applied proposals analyzed (the 202 minus the 51 us-states). Classified deterministically by: (a) is a newer proposal or assessment present for the same entity? (b) does the proposal's assumed baseline still match the current published score? (c) is the proposed value actually different from the baseline?

| Disposition | Count | New status | Meaning |
|---|---|---|---|
| Superseded | 127 | `superseded` | An older duplicate, or superseded by a newer assessment. Current published score is authoritative. |
| Stale-baseline | 1 | `superseded` | Baseline no longer matches published; world moved. `score-updater` would have held it anyway. |
| No-op confirmation | 17 | `confirmed-no-change` | `proposed == published` (delta 0). Confirmation mislabeled as pending. Nothing to apply. |
| **Needs re-assessment** | **6** | `held-needs-reassessment` | **The only genuine decision items — see below.** |

**Key finding: not one of the 151 was a valid, still-applicable, unapplied score change.** The backlog was entirely superseded duplicates, no-op confirmations, one stale item, and 6 stale first-baselines.

---

## The 6 decision items (require your call — NOT auto-actioned)

These are `first-baseline-establish` assessments from mid-May that were never applied. Each is the newest record for its entity, backed by real evidence, but **~2 months stale**. The entities still carry pre-baseline placeholder scores. I did **not** apply them — applying a 2-month-old score blind is exactly the drift the pipeline guards against — and I did **not** reject them, because the evidence is real. They are held for an explicit decision.

| Entity | Index | Dated | Placeholder (published now) | Proposed baseline | Evidence anchor |
|---|---|---|---|---|---|
| xAI | ai-labs | 2026-05-21 | (see note) | **11.7** critical | "Grok generated CSAM and nonconsensual sexualized images at scale" (5 evidence items) |
| Johnson & Johnson | fortune-500 | 2026-05-21 | (see note) | 37.5 developing | "$700M settlement with 42 states + DC over talc safety misrepresentation" |
| Boston Dynamics | robotics-labs | 2026-05-21 | 65.6 | 40.6 functional | "Hyundai 30,000 Atlas units/year planned from 2028" |
| Agility Robotics | robotics-labs | 2026-05-21 | 60.9 | 43.8 functional | "Toyota Canada RaaS agreement Feb 2026" |
| Nicaragua | countries | 2026-05-21 | 7.8 | 9.4 critical | "5,000+ CSO closures since 2018" |
| Philippines | countries | 2026-05-21 | 32.8 | 37.5 developing | "UNGA co-sponsor vs domestic EJK / press-freedom counterweights" |

Note: xAI and J&J did not resolve to a current published composite under their proposal slug (`xai` → likely `xai-grok` in ai-labs; `johnson-johnson` → likely a different fortune-500 slug), so their placeholder value needs a slug reconciliation before any apply.

**Recommendation:** re-run these 6 through `benchmark-research` / the nightly assessor to refresh the evidence to an in-window date, then apply the fresh result — rather than applying a May score in July. xAI is the most consequential (a proposed critical-band CSAM finding sitting unapplied for two months) and should go first.

---

## What remains in the queue after this triage

- **0** items in raw `pending`/`proposed`/`approved` — the backlog is cleared.
- **6** `held-needs-reassessment` — the decision items above.
- **~140** with pre-existing pipeline dispositions (`auto-confirm-eligible` 69, `documented` 56, `requires-human-review` 12, `band-crossing-proposed` 6, …) — **untouched**, out of this task's scope. If you want these reviewed too, that is a separate, deliberate pass.

## Method note

Statuses set here (`superseded`, `confirmed-no-change`, `held-needs-reassessment`) are descriptive and each carries a `triage_note` with the reasoning and date. They are neither `pending` nor `approved`, so they are invisible to both `prepare-updates.mjs` (public briefing) and `score-updater` (apply) — safe by construction.
