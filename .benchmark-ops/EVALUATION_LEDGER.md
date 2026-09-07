# CB-MODEL — Evaluation Ledger

Single-authority file. One row per executed evaluation run against one exact model snapshot.

> ## EMPTY — NO EVALUATION HAS EVER BEEN RUN
>
> **0 runs. 0 trials. 0 raw responses. 0 raters. 0 scores.**
>
> No model has been registered (`MODEL_REGISTRY.md` is empty), no credentials exist (`BLK-002`), and
> no execution harness exists. This file is empty because the work has not happened, not because it
> is awaiting transcription.
>
> **A score in this file that did not come from an executed, hashed, locked run is a fabrication.**
> `00-MASTER-CONDUCTOR`: *"Never invent a model version, score, citation, test result, human review,
> validation statistic, or provider response."*

**Last updated:** 2026-09-06 (created).

---

## Schema this file will hold

Per `04-MODEL-EVALUATION-RUN` (protocol steps 1–9) and `00-MASTER-CONDUCTOR` §"Quality gates".

### Run identity
| Field | Notes |
|---|---|
| `run_id` | immutable |
| `registry_id` | FK to `MODEL_REGISTRY.md`. **Required.** No run may exist without a registered snapshot. |
| `benchmark_version` | frozen version identifier |
| `form_id` | which secure form / pool assignment |
| `code_commit` | git SHA of the harness at execution time |
| `environment` | runtime, OS, adapter version |
| `manifest_hash` | hash of the signed run manifest (`04` step 1) |

### Execution
| Field | Notes |
|---|---|
| `task_hashes[]` | hash per item as executed |
| `randomization_seed` | order randomised; matched counterfactuals kept separated (`04` step 4) |
| `trials_per_item` | **≥3** for standard items; more for high-variance or critical items (`04` step 5) |
| `session_policy` | clean session per independent task; multi-turn state preserved only where specified |
| `started_at` / `completed_at` | exact timestamps |
| `raw_output_store` | pointer + hash. Raw responses preserved; never silently edited (`00`) |
| `errors`, `refusals`, `moderation_events`, `tool_calls` | captured per trial |
| `latency_ms`, `tokens_in`, `tokens_out`, `cost` | per trial; rolls up to `COST_LEDGER.md` |
| `retries` | only under published retry rules. **Never cherry-pick the best response** (`04` step 7) |
| `locked_at` | execution set locked before rating (`04` step 8) |

### Rating
| Field | Notes |
|---|---|
| `rating_status` | `not_started` \| `in_progress` \| `complete` \| `n/a` |
| `blinded` | boolean — provider and model cues removed where feasible (`04` step 9) |
| `raters[]` | two independent per official human-rated output (`05`) |
| `adjudications[]` | routed on >1pt delta, any critical-harm flag, low confidence, stratified sample |
| `critical_harm_flags[]` | recorded **separately from** the 1–5 score (`05`) |

### Gate
| Field | Notes |
|---|---|
| `analysis_version` | |
| `uncertainty` | |
| `limitations` | |
| `audit_hashes[]` | |
| `completeness_gate` | **A run missing any of: exact model identity, configuration, benchmark version, task manifest, repeated trials, raw outputs, rating status, critical-harm review, analysis version, uncertainty, limitations, audit hashes — is NOT complete** (`00` §Quality gates) |
| `publishable` | boolean. **False until `completeness_gate` passes AND `PUBLICATION_LEDGER.md` records human authorisation.** |
| `label` | `independently_executed` \| `facilitated` \| `pre_release` \| `provider_submitted` \| `audited_submitted` \| `provisional` \| `pilot`. Displayed distinctly (`07`). A provider-submitted result may **never** be merged into the independently executed leaderboard (`HUMAN-AUTHORITY-BOUNDARY.md`). |

## Invariants

1. **An incomplete run cannot publish.** (`01` required acceptance test; `04`: *"Do not calculate or
   publicize a final score from an incomplete or unreviewed run."*)
2. **The execution set is locked before rating.** No item may be added or re-run after `locked_at`.
3. **Retries follow published rules only.** Best-of selection is prohibited.
4. **Raw outputs are never edited.** Corrections create a new version.
5. **A pilot run is labelled `pilot` and is never promoted** to an official result without a fresh,
   complete run.

## Runs

*(empty)*

| run_id | registry_id | benchmark_version | trials | started | locked | rating_status | complete | publishable |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — |

**0 rows.**
