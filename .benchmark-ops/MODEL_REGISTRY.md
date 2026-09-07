# CB-MODEL — Model Registry

Single-authority file. Immutable record of every exact model snapshot known to the programme.

> ## EMPTY — NO MODEL HAS EVER BEEN REGISTERED
>
> **0 models. 0 snapshots. 0 aliases.**
>
> This is not a template awaiting population by a later step that already ran. No model release has
> ever been scanned for (`BLK-001`), no model has ever been accessed (`BLK-002`), and no model
> identity exists anywhere in this repository. A grep for `model_id`, provider endpoints or API key
> names outside `node_modules` returns nothing relevant.
>
> **Do not add a row here from memory, from training data, or from a provider's marketing page.**
> `00-MASTER-CONDUCTOR` §"Evidence discipline": *"Never invent a model version, score, citation,
> test result, human review, validation statistic, or provider response."*

**Last updated:** 2026-09-06 (created).

---

## Schema this file will hold

Per `01-REPOSITORY-AND-PLATFORM-BUILD` ("Immutable model registry") and
`02-RELEASE-INTELLIGENCE` (event resolution, step 1).

| Field | Type | Required | Notes |
|---|---|---|---|
| `registry_id` | string, immutable | yes | Programme-assigned. Never reused, never re-pointed. |
| `developer` | string | yes | The organisation. **Must resolve to at most one AI Labs Index row** — this is the join key that keeps the two products separate rather than merged. |
| `family` | string | yes | e.g. the named product line. |
| `exact_snapshot` | string | yes | The provider's dated or hashed snapshot identifier. **A reused model name does not permit overwriting a prior record** (`02`). |
| `aliases` | string[] | no | Marketing names, prior names, per-surface names. |
| `endpoint` | string | yes | Exact endpoint tested. |
| `product_surface` | enum | yes | `consumer` \| `api_default` \| `base` \| `fine_tune` \| `agent` \| `deployed_system`. `07-PUBLICATION` requires these displayed **separately**, never pooled. |
| `access_tier` | string | yes | Account/plan tier. |
| `region` | string | yes | |
| `system_prompt_status` | enum | yes | `known` \| `unknown` \| `none` \| `provider_supplied`. |
| `moderation_layer` | enum | yes | `present` \| `absent` \| `unknown`. |
| `tools` | string[] | yes | Tools enabled during testing; empty array if none. |
| `sampling` | object | yes | temperature, top_p, seed, max tokens, context limit. |
| `first_seen` | ISO date | yes | Retrieval time of the source that established existence. |
| `test_dates` | ISO date[] | yes | Every date this exact snapshot was executed. |
| `lineage.predecessor` | `registry_id` \| null | yes | The nearest genuinely comparable predecessor, or explicit `null`. |
| `lineage.materiality_basis` | string | yes | Why this is a new snapshot: announced checkpoint change, sentinel drift, safety/refusal change, tool change, system-instruction change, or credible regression evidence (`02` step 3). |
| `evidence[]` | object[] | yes | `{source_url, title, publisher, published_at, retrieved_at, archive_or_hash, claim_supported}` (`00` §Evidence discipline). |
| `claim_class` | enum | yes | `fact` \| `provider_claim` \| `evaluator_observation` \| `inference` \| `unresolved`. |

## Invariants — enforceable as tests before any row exists

Written now so `WQ-P1-08` has an acceptance target, and so a future agent cannot quietly relax them.

1. **`registry_id` is immutable.** A changed `exact_snapshot` creates a **new** row. It may never
   overwrite an existing identity. (`01` required acceptance test.)
2. **A provider reusing a model name does not permit overwriting the prior record.** Behaviour
   change creates a dated snapshot. (`02`.)
3. **`developer` may map to at most one AI Labs Index row.** A model row and a lab row may be
   *compared*; they may never be *aggregated*. (`README.md`; `00` §Naming.)
4. **No row may be created without at least one `evidence[]` entry** carrying a `source_url` and a
   `retrieved_at`.
5. **A row with `claim_class: "inference"` may never be the identity of record for a published
   score.**

## Registry

*(empty)*

| registry_id | developer | family | exact_snapshot | product_surface | first_seen | test_dates | predecessor |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

**0 rows.**
