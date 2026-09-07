# CB-MODEL — Cost Ledger

Single-authority file. Every unit of programme spend, and the authority it was spent under.

> ## EMPTY — NO BUDGET IS APPROVED AND NO MONEY HAS BEEN SPENT
>
> **Approved budget: none. Ceiling: not set. Cumulative spend: 0. Rows: 0.**
>
> No paid account exists. No provider credential exists. No API call has been made.
>
> `AI Benchmarking Program/HUMAN-AUTHORITY-BOUNDARY.md` requires owner approval before *"creating
> paid accounts, or committing funds beyond an approved budget."* `00-MASTER-CONDUCTOR` grants
> autonomy to run "benchmark jobs **within approved budgets**" — with no approved budget, that
> permission evaluates to **zero**. See `BLK-002`.
>
> **No cost estimate appears in this file.** Producing one would require inventing per-token
> prices, trial counts and item counts that no artifact in this repository supports. The founder
> sets a ceiling first; this ledger then records actuals against it.

**Last updated:** 2026-09-06 (created).

---

## Schema this file will hold

| Field | Notes |
|---|---|
| `entry_id` | immutable |
| `date` | ISO |
| `category` | `model_api` \| `human_rating` \| `infrastructure` \| `tooling` \| `review_panel` \| `other` |
| `run_id` | FK to `EVALUATION_LEDGER.md` where the cost is attributable to a run |
| `registry_id` | FK to `MODEL_REGISTRY.md` where attributable to a snapshot |
| `provider` | |
| `units` | tokens, rater-hours, instance-hours |
| `unit_cost` | as billed, not as estimated |
| `amount` | currency |
| `currency` | |
| `authority` | pointer to the approval this was spent under. **Required. An entry without an authority is an unauthorised commitment.** |
| `ceiling_at_time` | the approved ceiling when the cost was incurred |
| `cumulative_against_ceiling` | running total |
| `donated` | boolean — donated model access or compute. **Must be disclosed publicly** (`11-FUNDING`) |
| `donor` | where `donated` is true |

## Derived metrics to maintain once rows exist

Per `10-CONTINUOUS-IMPROVEMENT` §dashboards: **cost per model**, cost per wave, cost per rated item,
cost per published result, and spend against ceiling by category.

## Independence safeguards that bind this ledger

From `11-FUNDING-AND-PARTNERSHIPS`, and consistent with this repo's own independence policy
(`CLAUDE.md` §"Independence policy"):

- **No pay-to-rank. No suppression rights. No donor control of methods or publication.**
- **Donated model access and compute must be disclosed** — hence the `donated` and `donor` fields
  are first-class, not annotations.
- **No single model developer or affiliated source above 20% of annual programme funding after
  Year 1.** This ledger is where that ratio becomes checkable.
- **Sales are separated from scoring.** Entities never pay for inclusion, score changes, or
  suppression of findings.

**A note this ledger should force into view:** the programme will need paid access from the same
organisations it scores. That is not disqualifying — it is the ordinary condition of independent
benchmarking — but it must be visible in the ledger and disclosed on every model page
(`07-PUBLICATION` requires "funding disclosures" as a required field), not discovered later.

## Entries

*(empty)*

| entry_id | date | category | provider | amount | authority | donated |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

**0 rows. Cumulative spend: 0. Approved ceiling: none.**
