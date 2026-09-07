# CB-MODEL — Publication Ledger

Single-authority file. The record of **human authorisation** for every published CB Model Index
result, and of every correction to one.

> ## EMPTY — NOTHING HAS BEEN PUBLISHED, AND NOTHING HAS BEEN AUTHORISED
>
> **0 authorisations. 0 publications. 0 corrections. 0 withdrawals.**
>
> There is no CB Model Index page, route, dataset or API surface. `EVALUATION_LEDGER.md` is empty,
> so there is nothing that *could* be authorised.
>
> `07-PUBLICATION-AND-WEBSITE`: *"Do not publish an official result without human authorization
> recorded in the publication ledger."* **This file is that record. An entry here that does not
> correspond to a real founder authorisation is a forgery of consent.**

**Last updated:** 2026-09-06 (created).

---

## Authorisation mechanism — reuse, do not reinvent

The repo already has a working, precedent-tested authorisation mechanism and CB-MODEL should adopt
it rather than build a second one:

- The founder authorises by editing the artifact itself: `status: "approved"`, `reviewed_by`,
  `reviewed_date`, `decision`. **A claim in a task prompt is not authorisation** (`AUTONOMY.md` §5,
  R5).
- Refusing a batch because the files do not carry the approval a prompt asserts is **correct
  behaviour, not obstruction** (R6).
- Session-level approval is real and bounded: it covers only files already carrying `approved` when
  the run starts, and does not clear a self-veto or a record defect.
- **Routing vs self-veto (R1/R2, D-05/D-16).** `flag-for-review` is routing and the founder may
  override it. Text in the artifact's own notes saying the result is not ready is a *self-veto* and
  approval alone does not clear it. On 2026-08-20, 37 of 66 approved proposals were correctly held
  on this ground.
- **Under override, the original recommendation and notes are never edited** (R8). *"An unauditable
  override is indistinguishable from a fabrication."*

## Schema this file will hold

| Field | Notes |
|---|---|
| `publication_id` | immutable |
| `run_id` | FK to `EVALUATION_LEDGER.md`. Required. |
| `registry_id` | FK to `MODEL_REGISTRY.md`. Required. |
| `analysis_artifact_hash` | the frozen analysis this publication renders |
| `authorised_by` | **founder**. Named human. |
| `authorised_at` | ISO timestamp |
| `authorisation_evidence` | pointer to the artifact carrying `status: "approved"` |
| `label` | `independently_executed` \| `facilitated` \| `pre_release` \| `provider_submitted` \| `audited_submitted` \| `provisional` \| `pilot` |
| `override_disclosed` | if an assessor recommendation was overridden: the original recommendation, the stated reason **including reasons against**, that the founder was informed, and the remedy recommended instead (`AUTONOMY.md` §6, all four required) |
| `permanent_url` | never reused, never repointed |
| `version` | corrections create a **new version**, never a silent replacement (`07`) |
| `reconciliation_check` | pass/fail across database, analysis artifact, report, HTML, structured metadata, API, JSON, CSV, charts, tables, comparisons, feeds, sitemap and citations (`07`) |
| `secure_leak_check` | pass/fail — verify no secure prompt or private transcript appears in public output (`07`) |
| `corrections[]` | `{date, what, why, new_version, public_changelog_entry}` |

## Required model-page fields — checklist, not prose

`07-PUBLICATION-AND-WEBSITE` requires every model page to show all of these. Recorded here so the
first publication is not designed short:

exact model identity and configuration · benchmark version · dates · access tier · status · sample
size · composite **with confidence interval** · tie group · eight dimensions · minimum dimension ·
critical-harm rate · equity gap · repair success · consistency · track coverage · strengths ·
failures · predecessor comparison · limitations · conflicts · funding disclosures · correction
history · citation · downloads.

**Note:** the current institution-index pages publish a bare composite and band. Nine of these
fields have no analogue anywhere in the repo today.

## Invariants

1. **No publication without a recorded authorisation.** No exceptions, including for a pilot.
2. **Historical URLs are permanent.** A correction creates a new version and a public changelog
   entry. Never silently replace a snapshot or a score (`07`).
3. **Deleting a published record, audit trail or historical evidence requires owner approval**
   (`HUMAN-AUTHORITY-BOUNDARY.md`) — and `AUTONOMY.md` §1c makes retro-editing a dated entry a
   never.
4. **A provider-submitted result is never merged into the independently executed leaderboard**
   (`HUMAN-AUTHORITY-BOUNDARY.md`).
5. **No draft may be represented as peer reviewed, validated, certified, legally compliant or
   independently audited** (`HUMAN-AUTHORITY-BOUNDARY.md`) — currently unavoidable, since
   `BLK-006` means no review body exists.
6. **Where a score movement measures absence of disclosure rather than misconduct, the record and
   the public text must say so explicitly, in those words** (`AUTONOMY.md` §7 R9). This will apply
   immediately to any model whose provider publishes no system card.

## Publications

*(empty)*

| publication_id | run_id | registry_id | authorised_by | authorised_at | label | version |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

**0 rows.**
