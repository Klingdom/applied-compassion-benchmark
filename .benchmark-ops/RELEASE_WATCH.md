# CB-MODEL — Release Watch

Single-authority file. Continuous detection of model releases and material behaviour changes.

> ## NO SCAN HAS EVER RUN
>
> **0 scans completed. 0 candidate events. 0 evaluation tickets. 0 sources registered.**
>
> Two independent reasons, both verified:
>
> 1. **No model-release scan has ever been attempted.** The repo's `overnight-scanner` monitors
>    *institutions* for compassion-relevant news across 8 indexes. It has never monitored provider
>    changelogs, model cards or system cards.
> 2. **It could not run today even if it existed.** `BLK-001` / `INCIDENTS.md` **INC-008**: the
>    session WebSearch budget is exhausted at **2000/2000**. Three consecutive scan attempts failed
>    on 2026-09-02, 09-03 and 09-06. The 09-06 agent wrote **nothing at all rather than fabricate
>    coverage** — the correct behaviour, and the reason this file is honestly empty rather than
>    plausibly populated.
>
> **No web search was performed during this task.** `02-RELEASE-INTELLIGENCE`: *"Never treat rumours
> as confirmed releases."* An entry written from training-data recollection of what models exist
> would be exactly that.

**Last updated:** 2026-09-06 (created). **Next scan:** blocked on `BLK-001`.

---

## Schema this file will hold

### Source registry
| Field | Notes |
|---|---|
| `source_id` | |
| `provider` | |
| `source_type` | `announcement` \| `model_card` \| `system_card` \| `api_changelog` \| `model_registry` \| `repository` \| `product_release_notes` \| `status_feed` \| `incident_report` |
| `url` | |
| `last_retrieved_at` | retrieval timestamp, always recorded (`02`) |
| `tier` | primary vs secondary. **Primary provider sources preferred** (`00` §Evidence discipline) |

### Candidate event
| Field | Notes |
|---|---|
| `event_id` | |
| `detected_at` / `retrieved_at` | |
| `provider`, `family`, `exact_model_id`, `version_or_snapshot`, `release_time` | `02` step 1 |
| `access_surfaces`, `regions`, `modalities`, `context`, `tools`, `safety_changes`, `predecessor` | `02` step 1 |
| `classification` | `new_model` \| `named_update` \| `silent_snapshot` \| `configuration_change` \| `policy_layer_change` \| `new_deployment` \| `incident` \| `non_material` (`02` step 2) |
| `materiality_basis` | announced checkpoint change \| sentinel drift \| safety/refusal change \| tool change \| system-instruction change \| new high-impact use \| credible regression evidence (`02` step 3) |
| `dedup_against` | `registry_id` in `MODEL_REGISTRY.md` (`02` step 4) |
| `priority` | **1 / 2 / 3** by reach, capability, high-impact use, novelty, public concern, feasibility (`02` step 5) |
| `confirmation_status` | `confirmed` \| `rumour` — **rumours are never treated as releases** |
| `evidence[]` | `{source_url, title, publisher, published_at, retrieved_at, archive_or_hash, claim_supported}` |
| `ticket` | rapid-check deadline, full-run deadline (`02` step 6) |

## Invariants

1. **A provider reusing a model name does not permit overwriting a prior record.** Behaviour change
   creates a **dated snapshot** (`02`).
2. **Sentinel probes run only when authorised and within cost limits** — currently never, since no
   budget exists (`BLK-002`).
3. **If no release qualifies, record the completed scan and continue other work** (`02`). A scan
   that finds nothing is a result and must be logged. **A scan that did not run is not a scan that
   found nothing** — the distinction INC-008 turns on.
4. Daily internal release briefs; immediate P0 alert for a severe incident or a major frontier
   release.

## Deadline parameters — UNVERIFIED, do not implement yet

`02` requires "rapid-check and full-run deadlines" but **names no numbers**. The 72-hour / 30-day
figures supplied in the founder's brief appear **nowhere** in the 15 readable package files (grep
for `72` and `30-day`: zero hits). They presumably come from the unextractable `.docx`.

Carried as `ASM-002`. **Do not commit to a 72-hour SLA until `BLK-004` clears** — an SLA is a public
promise and this one currently rests on recollection.

## Completed scans

*(none)*

| scan_id | date | window | sources checked | candidates | qualified | tickets | outcome |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

**0 scans.**

## Open candidate events

*(none — 0 rows)*

---

## Carried over from the institution pipeline

`INCIDENTS.md` INC-008 preserved four genuine findings from the two quarantined institution scans,
worth re-verifying in the next cycle. **They are institution findings, not model releases**, and are
noted here only so the 2026-09-02 → 09-06 coverage gap is not forgotten:

Boeing (FAA $3.1M fine paid January 2026) · Nepal (1,114 dead, early-warning failure) · Jamaica
(~$1B for 268 homes, Hurricane Melissa survivors — positive) · Los Angeles (LAHSA funding scandal).

Both quarantined scans are preserved in `research/scans/superseded/`.
