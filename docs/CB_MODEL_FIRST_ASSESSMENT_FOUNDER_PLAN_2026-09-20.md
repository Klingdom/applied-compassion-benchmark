# CB-MODEL — how the first model assessment actually gets done

**For:** Phil. **From:** coordinator, 2026-09-20. **Companion to:** `docs/CB_MODEL_FIRST_ASSESSMENT_PLAN_2026-09-20.md`
(the technical sequence). This document is the decision half: what only you can do, what I can do, and the order.

**Nothing in here has been executed.** No model was called, no store written, no score produced.

---

## 1. The one-paragraph answer

The instrument, the planner, the scorer, the statistics and the completeness gates **already exist and work**. Three
things do not: **a way to call a model** (the harness ships a replay adapter only — `bin/run.mjs:218` throws for any
other adapter, and there is no HTTP call anywhere in it), **a paid credential and a spend ceiling**, and **a human
rating panel**. The first is mine to build, the second and third are yours. Until all three exist, the honest output
is a **labelled pilot**, not a published score — and publishing a score today would contradict D-29 as ratified.

## 2. Two goals, very different costs

| | **Track A — pilot** | **Track B — publishable assessment** |
|---|---|---|
| Purpose | Prove the chain end to end; measure the one unknown cost input (response length) | An official, citable compassion score for a named model |
| Needs from you | One credential, one small ceiling | Everything in Track A **plus** a rating panel, welfare protocols, and a method authority |
| Human rating | None — machine-only, clearly labelled | **Two independent blinded raters + adjudication**, reliability reported |
| Published? | **No.** `--label pilot`, never promoted | Yes, with its snapshot id, item-bank version and seed |
| Realistic cost | Fractions of a cent to a few dollars | API cost stays trivial; **rater time is ~1,500× the API cost** (9–23 rater-hours) |
| Blocked by | BLK-002 only | BLK-002, BLK-005, BLK-006, and the bank freeze |

**The expensive part of this benchmark is not the model. It is the people.**

## 3. What I can do without you (and will, on your word)

| # | Work | Why it is safe to do now |
|---|---|---|
| A1 | **Build the live provider adapter** behind the existing interface, with offline fixtures for every error class (timeout, rate limit, refusal, truncation, malformed). | No credential needed to write it; it stays inert until a key exists. AUTONOMY §1a — non-published code. |
| A2 | **Run pilot A: the zero-cost dry run** — replay adapter, 1 item, 3 trials. Success is the gates **failing correctly**: insufficient bootstrap, 7 dimensions missing, completeness gate FAIL. | No spend, no publication. Proves the plumbing before any money. |
| A3 | **Build the determinism probe and the rating workspace** (blinded transcripts, per-item rubric, two-rater capture, disagreement queue) — the thing your raters will actually use. | Tooling, not judgement. |
| A4 | **Repair the two broken EQU rubrics** as a proposal for your ratification (MB-5). | Methodology change ⇒ I draft, you ratify. |
| A5 | **Write the rater welfare protocol** — opt-out, rotation, break cadence, escalation, exposure caps — as a draft for you to approve before anyone is recruited. | Required by your own rules before recruitment; drafting it is not deciding it. |

## 4. What only you can do

| # | Decision | Smallest form of the answer | Blocks |
|---|---|---|---|
| **F1** | **Provider and access tier** — which model, and whether the consumer product, the API default, or a base model. Your publication rules require these to be **scored and displayed separately**, so this choice defines the first result's shape. | "Provider X, api_default, snapshot as of <date>." | Everything |
| **F2** | **Spend ceiling and who may spend it.** The agents' standing permission to run jobs "within approved budgets" currently evaluates to **zero**. | "Up to $N per wave; agent may spend against it." | Any live call |
| **F3** | **The credential.** | A key in the environment — never pasted into chat or a file I write. | Any live call |
| **F4** | **Donated access?** Allowed only if disclosed, and capped at 20% of annual funding after Year 1. | "Yes, disclose it" / "No." | F1 |
| **F5** | **What "validated" means for a task item** (the protocol proposed 09-18: two reviewers, blind-rate 3 responses, agreement rules, kappa floor 0.6). | "Approved" or your amendments. | The bank freeze |
| **F6** | **The rating panel**: funding, recruitment, and **paid lived-experience review** for sensitive items. | "Budget $N, recruit M raters" — after F7. | Track B only |
| **F7** | **Approve the welfare protocol** (I draft it, A5) before any rater sees an item. Your item set already contains active suicidal ideation, a domestic-violence disclosure with children, a psychosis-adjacent disclosure and a miscarriage. | "Approved." | F6 |
| **F8** | **Method authority** (BLK-006): who rules on method questions — you alone, or a named committee. | "Me, recorded in DECISIONS.md." | Publication |
| **F9** | **Ratify the bank freeze**: the 9 drafted items, the EQU repair, and a version bump. Must happen **before** any paid run — `item_hash` is computed from the bank version, so a later bump invalidates cross-run comparison. | "Freeze at v1.1 with these items." | Track B |
| **F10** | **Two small unblocks**: the starting prompt you intended for this programme was never supplied (BLK-003), and `Compassion_Benchmark_AI_Model_Program_Plan.docx` could not be read (BLK-004) — paste its text and I'll reconcile the plan against it. | Paste, or "none intended". | Alignment |

## 5. The sequence

1. **F1 + F2 + F3** (one sitting, ~10 minutes) → unblocks every live call.
2. **A1 + A2** in parallel with your decision — the adapter and the zero-cost dry run can be built today.
3. **Pilot B, the first live call**: one short item, 3 trials plus a 20-call determinism probe ≈ 23 calls, **fractions of a cent**. This measures response length — the only genuinely unknown cost input — and turns every later estimate from arithmetic into measurement.
4. **F5 + F9** → freeze the bank. Then, and only then, a full machine-rated wave.
5. **F7 → F6** → recruit raters, run the two-rater wave, report reliability.
6. **F8** → publication decision, which also needs D-29 revisited, since it currently forbids publishing a model score at all.

## 6. Sizing, computed from the real bank (not estimated)

- **28 scorable items** — the other 5 are `draft-authored-unreviewed` and the planner excludes them automatically.
- Prompt corpus: **761 words ≈ 1,000 tokens** across those 28 items.
- A full single-model wave at 5 trials = **140 calls**, ~5,700 tokens in, and 32k–256k tokens out depending on how
  verbose the model is. **Total 38k–262k tokens** — trivial money at any current price. Price per million tokens is
  your input; I will not invent one.
- **Rating is the real cost**: 280 ratings at two raters ≈ **9–23 rater-hours**, roughly **1,500× the API spend**.

## 7. The uncomfortable part you should see before spending anything

Among the 28 **scorable** items: **SYS has 2, INT has 2, EQU has 3** — and **two of those three EQU items cannot be
scored as written** (their rubrics demand a comparison arm the items do not contain, MB-5). So today a composite would
rest on 2 items for one dimension, 2 for another, and **effectively 1 for Equity**, with **none of the 33 items
reviewed by a human**.

That is publishable as a **pilot** and indefensible as a **benchmark**. The fix is F5 + F9 + the 9 drafted items +
the EQU repair — which is why the bank freeze sits *before* the paid run in the sequence, not after.

## 8. Two contradictions in the repo, flagged not resolved

1. **`.benchmark-ops/` is about two weeks stale** — `CURRENT_STATE.md`, `WORK_QUEUE.md` and `LAST_SUCCESSFUL_RUN.json`
   describe the harness, bank and analysis layer as absent when they exist. Anyone reading those files first gets a
   false picture. Needs a refresh pass.
2. **`AUTONOMY.md` §1b never names `site/src/data/model-benchmark/**`.** The index files are protected by name; the
   model stores are not. That is a gap: today, writing a model score is not explicitly founder-gated the way writing
   an institution score is. I have treated it as gated regardless. **Recommend closing this in writing.**
