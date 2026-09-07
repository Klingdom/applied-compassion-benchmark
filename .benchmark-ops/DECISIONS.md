# CB-MODEL — Decisions (POINTER FILE)

> ## THIS FILE IS A POINTER, NOT A DECISION LOG. DO NOT RECORD DECISIONS HERE.
>
> **The authoritative decision log is `DECISIONS.md` at the repository root.**
>
> It is append-only, newest-first, carries D-00 through D-22 with dates, alternatives considered,
> consequences and evidence, and supports a `unresolved` status for live conflicts that have no
> chosen resolution. CB-MODEL decisions continue that numbering as **D-23 onward, in that file**.

**Why this is a pointer and not a fork.** `OPERATING-STATE-SPEC.md` requires a `DECISIONS.md` inside
`.benchmark-ops/`. This repository already has one, populated with its own dated history. Creating a
second would install two decision records with no rule about which wins — which is precisely the
"second, contradictory constitution" that `docs/OPERATING_SYSTEM_ADAPTATION.md` §"Why not copy" was
written to prevent, and which its §5 calls out: *"A template with placeholder rows is worse than no
file: it looks like governance while asserting nothing, and future agents will treat it as
authoritative."*

The reconciliation rule is stated once, in `docs/CB_MODEL_INTEGRATION_2026-09-06.md` CONFLICT-01:
**single-authority files own their content; pointer files may summarise and link but may never
originate an entry.** A decision that exists only inside `.benchmark-ops/` is a defect.

**Last updated:** 2026-09-06 (created).

---

## Existing root decisions that already govern CB-MODEL

Read these before proposing anything. Each is in the root `DECISIONS.md`.

| ID | Decision | Status | Why CB-MODEL is bound by it |
|---|---|---|---|
| **D-13** | Index demarcation: primary-product test, R-SUB-1…4. **"No entity may hold more than one published composite anywhere in the Compassion Benchmark."** | **proposed** — "adopted by practice but never ratified" | The hard constraint is the mechanical form of the three-product separation. R-SUB-3 names Microsoft AI, Amazon AWS AI and Meta AI as blocked; all three are still published. `WQ-P0-05` |
| **D-16** | An assessor self-veto outranks `status: "approved"` | active | Becomes CB-MODEL's rule for an analysis artifact that says it is not ready to publish |
| **D-05** | The founder may override assessor routing; the override is disclosed, not hidden | active | Governs `PUBLICATION_LEDGER.override_disclosed` |
| **D-17** | Entity-record defects are held; approval cannot cure them | active | Model-identity defects inherit this: approval cannot make a score for a misidentified snapshot correct |
| **D-07** | Two conflicting assessments are resolved by a fresh assessment, never by picking one | active | Directly relevant to test–retest (`VAL-R-01`) |
| **D-14** | Absence of disclosure scores **2** — **two conventions are live simultaneously** | **unresolved** | CB-MODEL must pick one convention *before* its first run, or it will inherit an unresolved conflict into a new product |
| **D-12** | Floor entities are a scale-expressiveness problem, not a scoring problem | active | Relevant the first time a model scores 0.0 |
| **D-00** | Baseline drift > 2.0pt is always a hold | active | The analogue for a model re-test against a prior snapshot |
| **D-01…D-04** | Next.js static export, JSON-first data, Docker+VPS, defer backend | active | Constrain how a CB Model Index can be served at all |

## CB-MODEL decisions proposed by this assessment — DRAFTS, not decisions

Not yet recorded anywhere as decisions. Each needs the founder to accept, reject or amend, at which
point it is written into the **root** `DECISIONS.md` with the next available ID.

| Draft | Question | Recommendation | Source |
|---|---|---|---|
| **D-23 (draft)** | Where `AUTONOMY.md` and `HUMAN-AUTHORITY-BOUNDARY.md` differ, which governs CB-MODEL work? | **`AUTONOMY.md` governs, and its ten stop-and-report triggers extend to CB-MODEL.** Grounds: it is 432 lines in which every rule traces to a dated event here, whereas the package file is a generic list. Note the live conflict: `00-MASTER-CONDUCTOR` step 7 says "immediately begin the next unblocked batch, do not stop after producing a plan"; `AUTONOMY.md` §9 lists ten conditions under which stopping is mandatory. | CONFLICT-02 |
| **D-24 (draft)** | One band vocabulary, or two? | **One.** `dimensions.ts` `BANDS` is canonical and says so in its own comment; `ai-labs.json` and `/ai-evaluation-suite` re-declare it with different integer boundaries. Seven `ai-labs.json` rows at 60.9 fall in a gap in their own file's table. Requires `BLK-006`. | CONFLICT-03, RISK-006 |
| **D-25 (draft)** | One 40-subdimension taxonomy, or two? | **One.** Only 7 of 40 names currently match; AWR, EQU, BND and INT overlap on **zero**. `HUMAN-AUTHORITY-BOUNDARY.md` reserves dimension changes to the owner, so this cannot be resolved by an agent. Requires `BLK-006`. | CONFLICT-05 |
| **D-26 (draft)** | One composite formula, or two? | **One.** `scoring.ts` uses a continuous `10 × consistency × weakness` premium; `/ai-evaluation-suite` publishes discrete `+5/+3/−2/−5` and a different `getBand()`. Composite 60.5 bands differently on the two pages. | CONFLICT-04 |
| **D-27 (draft)** | Does `xAI/Grok` stay as a fused row? | **No.** Rename to the organisation before any model score publishes, as a structural operation with no score change (D-08 precedent). Same question for `DeepMind/Google`. | §2.4, `WQ-P0-04` |
| **D-28 (draft)** | Which convention does CB-MODEL use for absence of disclosure — 2 or 3? | **Decide before the first run.** D-14 is `unresolved` in the institution product; carrying an unresolved convention into a second product doubles the problem. | D-14 |
