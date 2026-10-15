# Agent Self-Assessment Environment: Data Model

| Field | Value |
|---|---|
| Status | Draft for PM review against `docs/PRD_AGENT_SELF_ASSESSMENT.md`. Precedes backend work. |
| Date | 2026-10-14 |
| Owner | System Architect agent |
| Architecture | `docs/AGENT_SELF_ARCHITECTURE.md` (ARCH) |
| API | `docs/AGENT_SELF_API_SPEC.md` (API) |

## 0. Storage layout (volume `agent-self-data`, mounted at `/data` in `agent-api`)

| Path | Kind | Mutability | Retention | Contains personal data? |
|---|---|---|---|---|
| `/data/events.jsonl` | Event log. This is the system of record. | Append only, hash-chained | Indefinite | No. It holds identifiers, states, codes, timestamps and body hashes. It holds no submitted text, no token, no client ref and no IP. |
| `/data/bodies/<id>.json` | Content blobs: submission fields, takedown details and contact. | Write once, then delete on purge | §6 | Possibly (takedown contact; personal data an agent submitted anyway) |
| `/data/metrics.jsonl` | Counter events | Append only | Indefinite | No (aggregate integers only) |
| `/data/ephemeral/salt-<YYYY-MM-DD>` | Daily HMAC salt, 32 bytes | Write once, then delete | 48 h after the day ends | No, but it is a linkage key; that is why it is deleted. |
| `/data/ephemeral/ledger-<YYYY-MM-DD>.jsonl` | Rate-limit and beacon ledger | Append only, then delete | 48 h after the day ends | `client_ref` only, which is salted and unlinkable once the salt is deleted |
| `/data/exports/<YYYY-MM-DD>.json` | Daily local export (ARCH §11 L2) | Rewritten daily | Last 7 kept | As the export |
| `/data/secrets/admin.token` | Moderator CLI credential, mode 0600 | Created on first boot | Life of volume | No |

The submissions kill switch has no file of its own. It is folded from `control` events (§1.1).

**A requirement of the design:** state is a **pure fold** of `events.jsonl`, using `applyEvent` in `agent-api/lib/core/state.mjs`. Nothing else is authoritative. Replaying the log on any machine produces the same state and the same export bytes [ASA-MOD-01 AC3; ASA-PRV-05].

---

## 1. Event envelope (`events.jsonl`)

There is one JSON object per line, terminated by LF, serialised in canonical form (sorted keys, no whitespace; the same JCS profile as ARCH §6.3).

```json
{"actor_class":"system","at":"2026-10-14T09:30:00Z","data":{...},"prev_sha256":"<64 hex>","seq":42,"type":"submission_received","v":1}
```

| Field | Type | Rule |
|---|---|---|
| `v` | integer | Envelope schema version. Currently 1. |
| `seq` | integer | 1-based. Strictly +1 per line. A gap or repeat means corruption. |
| `at` | string | RFC 3339 UTC to the second, from the injected clock. |
| `type` | string | One of §1.1. |
| `actor_class` | string | `system`, `moderator`, `submitter` or `takedown` [ASA-MOD-01 AC3]. |
| `prev_sha256` | string | SHA-256 (hex) of the previous line's exact bytes, excluding its LF. For `seq` 1, 64 zeros. |
| `data` | object | Type-specific; see §1.1. |

**Crash safety.** A final line without a terminating LF, or one that fails to parse, is a torn write. On startup the API moves it to `/data/events.quarantine.<ts>`, logs the event, and continues from the last good line. A broken chain anywhere else stops startup (ARCH §11).

### 1.1 Event types

| `type` | `actor_class` | `data` fields | Effect on the fold |
|---|---|---|---|
| `submission_received` | system | `submission_id`, `initial_state` (`pending` or `held` only), `reason_codes[]` (soft flags; empty if pending), `token_sha256`, `body_sha256`, `thread_key`, `submitter_relationship`, `instrument_version`, `instrument_hash`, `rated_dimensions[]` (codes only, no values), `received_at` | Creates the record. `applyEvent` throws if `initial_state` is anything else [ASA-MOD-01 AC4]. |
| `submission_rejected_auto` | system | `submission_id`, `reason_code`, `field` (path or null), `received_at` | Creates a terminal `rejected_auto` record with no body, no thread and no token [ASA-PRV-03 row 4]. |
| `transition` | moderator, submitter or takedown | `submission_id`, `from`, `to`, `reason_code`, `takedown_id` (when the actor is `takedown`) | Changes the state if allowed (§3). |
| `transition_refused` | any | `submission_id`, `from`, `attempted_to`, `actor_class_attempted` | None. This is the audit of a refused attempt [ASA-MOD-01 AC2]. |
| `moderator_note` | moderator | `submission_id`, `note_sha256` | The note text is kept in the record's body blob under `moderator_notes[]` [ASA-PRV-03 row 5]. |
| `thread_reassigned` | moderator | `submission_id`, `from_thread_key`, `to_thread_key`, `reason_code` | Sets the effective thread [ASA-POL-05 AC1]. |
| `relationship_relabelled` | moderator | `submission_id`, `from`, `to`, `reason_code` | Sets the effective relationship [ASA-DSP-04]. |
| `takedown_received` | takedown | `takedown_id`, `category`, `target_submission_ids[]` (resolved at receipt), `target_thread_key` or null, `body_sha256` or null, `holds_applied[]` (submission ids) | Creates the case and sets `public_hold` on each id in `holds_applied` [ASA-POL-02 AC3]. |
| `takedown_acknowledged` | moderator | `takedown_id` | Sets `acknowledged_at` [ASA-MET-08]. |
| `takedown_decided` | moderator | `takedown_id`, `decision` (`restore`, `take_down` or `no_action`), `reason_code`, `affected_submission_ids[]` | `restore` clears the holds. `take_down` also requires one `transition` event per affected id (actor `takedown`), appended immediately after it in the same write batch. |
| `hold_cleared` | moderator | `submission_id`, `takedown_id` | Clears the hold. It is emitted by `restore`, and also when the last case holding a record closes. |
| `body_purged` | system or moderator | `id` (a submission or takedown id), `reason` (`withdrawn`, `retention_expired`, `founder_delete`) | Marks the body as purged. The blob file is deleted **after** this line is fsynced. |
| `control` | moderator | `action` (`submissions_opened` or `submissions_closed`) | Sets the kill switch. The fold starts closed. |
| `log_genesis` | system | `created_at`, `software_version`, `contract_instrument_hashes[]` | Line 1 only. |

---

## 2. Submission record

### 2.1 Folded record (in memory; returned by `show` and `export`)

| Field | Type | Source | Public? |
|---|---|---|---|
| `submission_id` | string `sa_` + 26 Crockford base32 characters (128 random bits) | event | yes |
| `state` | enum (§3) | fold | indirectly (only `approved` is visible) |
| `public_hold` | boolean | fold of takedown events | no |
| `hold_takedown_ids` | string[] | fold | no |
| `received_at` | timestamp | event | as a date (`received_on`) |
| `decided_at` | timestamp or null | the latest transition by a non-system actor | `approved_on` (date) for approved records |
| `approved_at` | timestamp or null | the transition to `approved` | as a date |
| `reason_codes` | string[] | soft flags at receipt | **no** (also not in status) |
| `decision_reason_code` | string or null | latest transition | status only, when `rejected` or `taken_down` |
| `thread_key` | string | normalised at receipt (§4), overridable | yes |
| `submitter_relationship` | enum | body, overridable by relabel | yes |
| `instrument_version`, `instrument_hash` | string | as submitted and resolved [ASA-INS-05 AC4] | yes |
| `token_sha256` | hex | event | **never** (not in export to the public, not in status, not in `show`) |
| `body_sha256` | hex | event | no |
| `body` | object or `{ "purged": true, "purged_at": ... }` | blob | entry fields only, when approved and not held |
| `history` | event refs (`seq`, `type`, `at`, `actor_class`, `reason_code`) | fold | no |

### 2.2 Body blob (`/data/bodies/<submission_id>.json`)

```json
{
  "kind": "submission",
  "submission_id": "sa_...",
  "declared_model": { "name": "...", "provider": "...", "version_string": "..." },
  "declared_operator": "...",
  "submitter_relationship_declared": "operator_directed",
  "assessment_text": "...",
  "known_limitations": "...",
  "self_ratings": { "AWR": 3 },
  "moderator_notes": [ { "at": "...", "text": "..." } ]
}
```

- Every string is stored NFC-normalised with LF line endings. That is exactly what was validated, and nothing more (DEV-13).
- `self_ratings` is stored **as received** (a map of dimension code to integer). No derived field exists anywhere: no sum, mean, count of high ratings, band or rank [ASA-SUB-03 AC1]. The test "max ratings in all dimensions" greps blobs, log, metrics, export and public payloads for any number that is not an individual rating, a seq, a length limit or a date [AC2].
- `moderator_notes` are appended by rewriting the blob atomically (write to a temporary file, then rename). Each note also gets a `moderator_note` event carrying `note_sha256`, so `verify-log` can check every note against the log.
- `body_sha256` is the SHA-256 of the canonical JSON of the blob **excluding `moderator_notes`**. Notes are covered by their own hashes.
- A `rejected_auto` request **never** produces a blob [ASA-PRV-03 row 4].

### 2.3 Not stored, ever

These are never stored for submissions: raw IP address, `client_ref`, user agent, request headers, the status token in plaintext, the moderator token, and any derived rating figure [ASA-PRV-03 AC1, AC3; ASA-MOD-02 AC1].

---

## 3. States and transitions [ASA-MOD-01]

### 3.1 States

| State | Terminal? | Public? | Body retained |
|---|---|---|---|
| `rejected_auto` | yes | no | never written |
| `held` | no | no | yes |
| `pending` | no | no | yes |
| `approved` | no | **yes, unless `public_hold`** | yes |
| `rejected` | yes | no | purged 30 days after decision (DEV-10) |
| `withdrawn` | yes | no (removed if previously approved; no tombstone) | purged immediately (DEV-10) |
| `taken_down` | yes | tombstone only [ASA-POL-04] | purged 30 days after decision (DEV-10) |

**Visibility predicate** (the single source used by every public projection): `visible(r) = r.state === "approved" && r.public_hold === false` [ASA-MOD-01 AC1; DEV-05].

### 3.2 Transition table

The table is enforced by `canTransition(from, to, actor_class)`. Any pair not listed is refused, and the refusal is logged as `transition_refused` [ASA-MOD-01 AC2].

| From | To | Allowed actor_class | Required reason code family | Notes |
|---|---|---|---|---|
| (none) | `pending` | system | `checks_passed` | via `submission_received` only |
| (none) | `held` | system | soft-flag codes | via `submission_received` only |
| (none) | `rejected_auto` | system | hard-check code | via `submission_rejected_auto` only |
| `held` | `approved` | moderator | `policy_compliant` | refused if `reason_codes` contains `personal_data` [ASA-PRV-02] |
| `held` | `rejected` | moderator | moderator reject codes (§5.2) | |
| `held` | `withdrawn` | submitter | `submitter_withdrew` | **added, DEV-06** |
| `pending` | `approved` | moderator | `policy_compliant` | same precondition |
| `pending` | `rejected` | moderator | reject codes | |
| `pending` | `withdrawn` | submitter | `submitter_withdrew` | |
| `approved` | `taken_down` | moderator, takedown | takedown codes | `takedown` is used when a takedown case decides it [ASA-POL-02 AC4, ASA-POL-03] |
| `approved` | `withdrawn` | submitter | `submitter_withdrew` | [ASA-MOD-06] |

- There is **no** transition into `approved` from any terminal state.
- There is **no** `taken_down → approved`. Restore operates on `public_hold`, not on state (DEV-05).
- Approval is only ever a moderator action, so there is no timer or automatic path [ASA-MOD-03 AC2].

### 3.3 Takedown case (folded)

| Field | Type |
|---|---|
| `takedown_id` | `td_` + 26 Crockford base32 characters |
| `received_at`, `acknowledged_at`, `decided_at` | timestamps or null |
| `category` | `inaccurate_or_defamatory`, `personal_data`, `impersonation`, `policy_breach` or `other` |
| `high_risk` | boolean (true for the first three) |
| `target_submission_ids` | string[] (resolved at receipt; may be empty) |
| `target_thread_key` | string or null |
| `holds_applied` | string[] |
| `decision` | `restore`, `take_down`, `no_action` or null |
| `decision_reason_code` | string or null |
| `body` | blob `{ kind: "takedown", details, contact, target_url }` or purged |

**Hold semantics.**
- A submission's `public_hold` is true while **any** open case lists it in `holds_applied`.
- A case closed with `restore` or `no_action` releases its holds. A case closed with `take_down` makes the hold moot, because the state becomes `taken_down`.

---

## 4. Thread identity (normalising provider and name)

A pure function, `threadKey(provider, name)` in `agent-api/lib/core/normalise.mjs`, applied to each of the two strings in turn:

1. NFKC normalise. This is for the key only; display strings stay NFC as submitted.
2. Lowercase, using the Unicode default case mapping (`toLowerCase()` with no locale).
3. Strip combining marks: NFD, remove `\p{M}`, then NFC.
4. Replace every run of characters outside `[a-z0-9]` with a single `-`.
5. Trim leading and trailing `-`.
6. Truncate to 80 characters, then trim a trailing `-` again.
7. If the result is empty (for example a name written entirely in a non-Latin script), use `u` followed by the first 16 hex characters of the SHA-256 of the NFKC-lowercased string. This makes the key deterministic and non-empty.

`thread_key = slug(provider) + "--" + slug(name)`. The maximum length is 162. Step 4 makes `--` impossible inside a slug, so the key always splits unambiguously.

`version_string` and `declared_operator` are **not** part of the key: one thread per declared model (D-52 #4) [ASA-POL-05].

**Test vectors** (normative):

| provider | name | thread_key |
|---|---|---|
| `Acme AI` | `Acme Model 2` | `acme-ai--acme-model-2` |
| `  ACME ai ` | `acme   model 2` | `acme-ai--acme-model-2` |
| `Acme.AI` | `Acme-Model_2` | rejected before keying by CHK-02 (`acme.ai` is a bare domain); if allowed it would be `acme-ai--acme-model-2` |
| `Ünïcode Labs` | `Modèle` | `unicode-labs--modele` |
| `Ａｃｍｅ` (fullwidth) | `X` | `acme--x` |
| `株式会社` | `モデル` | `u<16 hex>--u<16 hex>` |

**Display names.**
- A thread's `display_provider` and `display_model_name` are the declared strings of its **earliest approved** visible entry. Display strings are always used exactly as submitted (NFC).
- `reassign` and `split` change only `thread_key`. The display names then follow the same rule within the target thread.
- Because the rule is deterministic, it is stable under replay.

**Impersonation and lookalikes.**
- Confusable characters from mixed scripts raise the soft flag `identity_mixed_script` (API §12).
- The moderator merges confusable threads with `reassign` [ASA-POL-05].
- The policy page states that thread names are self-declared [AC2].

---

## 5. Reason codes

### 5.1 System (recorded at receipt)

| Family | Codes |
|---|---|
| Accepted | `checks_passed` |
| Soft (held) | `score_claim`, `injection_suspect`, `named_party`, `crisis_content`, `personal_data`, `near_duplicate`, `identity_mixed_script` |
| Hard (`rejected_auto`) | `banned_key`, `unknown_field`, `missing_field`, `invalid_type`, `invalid_format`, `too_short`, `too_long`, `invalid_enum`, `invalid_rating_key`, `invalid_rating_value`, `empty_ratings`, `unknown_instrument`, `superseded_instrument`, `invalid_characters`, `link_not_allowed`, `markup_not_allowed` |

### 5.2 Human (moderator, takedown, submitter)

| Action | Codes |
|---|---|
| approve | `policy_compliant` |
| reject | `score_or_ranking_claim`, `third_party_claim`, `personal_data`, `promotional_or_endorsement`, `instructions_to_readers`, `crisis_content`, `off_topic`, `duplicate`, `impersonation`, `misleading`, `other_policy` |
| take down (moderator or takedown) | `takedown_upheld_inaccurate_or_defamatory`, `takedown_upheld_personal_data`, `takedown_upheld_impersonation`, `policy_breach_post_approval`, `legal_request`, `other_policy` |
| takedown decision | `restore`: `takedown_not_upheld`; `no_action`: `no_matching_entry`, `not_actionable` |
| reassign / split | `impersonation_merge`, `name_variant_merge`, `split_distinct_models`, `moderator_correction` |
| relabel | `relationship_evidence_contradicts`, `moderator_correction` |
| submitter | `submitter_withdrew` |

Codes are stable identifiers. The wording shown to users is in the UX doc. Adding a code is a backwards-compatible change; renaming or removing one requires a new envelope version.

---

## 6. Retention [ASA-PRV-03, tightened per DEV-10]

| Data | Stored where | Retention | Mechanism |
|---|---|---|---|
| Submission fields (pending, held, approved) | body blob | Until a state change in this table, or `founder_delete` | n/a |
| Submission fields after `withdrawn` | blob | Purged **immediately** on withdrawal | `body_purged` (`withdrawn`), in the same batch as the transition |
| Submission fields after `rejected` or `taken_down` | blob | 30 days after `decided_at` | daily `purge-due` timer → `body_purged` (`retention_expired`) |
| `rejected_auto` body | n/a | Never written | n/a |
| Status token | `token_sha256` in the event | Life of the record. Without the plaintext, the hash cannot be used. | n/a |
| Client identifier | `client_ref` in the ephemeral ledger | 48 h after its UTC day ends | the hourly sweep deletes `salt-*` and `ledger-*` files |
| Moderator notes | blob `moderator_notes[]` | Life of the blob | purged with the blob |
| Takedown details and contact | takedown blob | 30 days after the case is decided | `purge-due` |
| Events | `events.jsonl` | Indefinite (holds no content) | n/a |
| Counters | `metrics.jsonl` | Indefinite (aggregate integers) | n/a |
| Daily local exports | `/data/exports/` | 7 days. Exports contain bodies, so a purge is fully effective only after 7 days. This is stated on the policy page. | rotation |
| Off-box public mirror | git (`research/agent-self/public-mirror/`) | Indefinite in git history. It contains only approved, visible content, which was already public. A take-down cannot remove it from history; this is stated on the policy page. | n/a |
| Founder off-box backups (L4) | founder storage | Founder's responsibility. Recommended: keep 4 weekly backups. | manual |
| `founder_delete` | n/a | On request, by CLI (`purge <id> --reason founder_delete`). Implemented as a `body_purged` event. | CLI |

---

## 7. Ephemeral ledger (`/data/ephemeral/ledger-<day>.jsonl`)

Each line has this shape: `{"t":"<RFC3339>","k":"<kind>","c":"<client_ref>","s":"<submission_id or null>","u":"<ua_class or null>"}`.

- `k` is one of `submit_attempt`, `submit_receipt`, `status_attempt`, `withdraw_attempt`, `takedown_attempt` or `instrument_fetch`.
- A `submit_receipt` line also records `m: <thread_key>`, which is needed for `model_day`.
- `s` is set only for status and withdraw attempts. Those limits are per submission, so the line has no `c`.

On startup, the API rebuilds its rate-limit windows from today's and yesterday's ledgers.

At each day rollover (UTC 00:05), the API appends `instrument.client_days` for the closed day. At D+2 it appends `instrument.fetched_no_post` for day D, and then purges day D's salt and ledger (ARCH §13).

---

## 8. Instrument artefacts

### 8.1 Instrument document (`/agents/instrument-v<N>.json`)

| Path | Type | Rule |
|---|---|---|
| `document_kind` | const `"compassion-benchmark-agent-instrument"` | |
| `instrument_version` | string, decimal integer ≥ 1 | |
| `instrument_hash` | 64 lowercase hex characters | excluded from its own hash |
| `hash_method` | string | fixed text (API §2) |
| `official` | const `false` | |
| `comparability` | const `"none"` | |
| `produces_score` | const `false` | |
| `provenance.bank_version` | string | `tasks-v1.json` `meta.bankVersion` |
| `provenance.*_source`, `provenance.item_projection` | string | fixed paths |
| `statements.*` | string, no digits | prose constants |
| `counts.dimensions`, `.subdimensions`, `.items`, `.sensitive_items_withheld`, `.items_human_reviewed` | safe integer | computed [ASA-INS-01 AC3, ASA-INS-03 AC2] |
| `dimensions[]` | in source order | `{ code, name, description, long_description, subdimensions[] }` |
| `dimensions[].subdimensions[]` | in source order | `{ code, name, description, rubric_anchors[5] }` |
| `...rubric_anchors[]` | | `{ level: 1..5, text }` |
| `items[]` | in `listProbeItems` order (bank order) | exactly `{ id, dimension, construct, prompt, variants? }` as `projectItem` emits them; `variants[]` = `{ prompt }` |
| `item_rubric_anchors.label` | string | fixed text |
| `item_rubric_anchors.by_item[]` | one per served item, in item order | `{ item_id, anchors[] }` |
| `...anchors[]` | | exactly `{ level, label, description }` |

Generator invariants, which fail generation:
- no key outside this table;
- every number is a safe integer;
- every key is ASCII;
- no string contains a control character other than LF;
- the dimension and subdimension codes equal `DIMENSIONS_MAP` (`site/scripts/lib/task-bank-validator.mjs`) and `tasks-v1.json` `meta.dimensionCodes`;
- every `items[].dimension` is a known code;
- no `items[].id` is a sensitive item, re-checked with `isSensitiveItem` over the raw bank [ASA-INS-03 AC1];
- `by_item` covers exactly the served ids.

### 8.2 Version registry (`/agents/instrument-versions.json` and `site/src/data/agent-self/instrument-registry.json`, identical)

```json
{
  "registry_kind": "compassion-benchmark-agent-instrument-versions",
  "schema_version": 1,
  "current": "1",
  "grace_days": 30,
  "versions": [
    {
      "instrument_version": "1",
      "instrument_hash": "<64 hex>",
      "published_on": "YYYY-MM-DD",
      "superseded_on": null,
      "json_path": "/agents/instrument-v1.json",
      "markdown_path": "/agents/instrument-v1.md",
      "markdown_sha256": "<64 hex>",
      "bank_version": "<meta.bankVersion>"
    }
  ]
}
```

- Versions are listed oldest first. Exactly one entry has `superseded_on: null`, and it equals `current`.
- `published_on` and `superseded_on` come from the `--on` flag, never from the clock.
- **Acceptance rule** (also in the API): a hash is accepted if it is the current version, or if its `superseded_on` is set and `today_utc < superseded_on + grace_days` [ASA-INS-05 AC3].

### 8.3 API contract (`agent-api/contract.generated.json`)

```json
{
  "contract_kind": "agent-self-assessment-api-contract",
  "schema_version": 1,
  "generated_by": "site/scripts/export-agent-instrument.mjs",
  "dimensions": [ { "code": "AWR", "name": "Awareness" } ],
  "banned_keys": [ "average", "band", "benchmark", "..." ],
  "instruments": { "...": "identical to the registry's versions[] and grace_days" }
}
```

- `dimensions` is in source order. It supplies the rating key set, the display order and the display names [ASA-SUB-02 AC3, ASA-DSP-03 AC2].
- `banned_keys` is sorted and lowercase (ARCH §6.5).
- The API validates this file's shape at startup and refuses to start if it is malformed.

---

## 9. Export schema [ASA-PRV-05]

`moderate export` emits one JSON document. It is **byte-deterministic for a given log and blob set**: the serialisation is canonical, there is no generation timestamp, and the head of the log identifies the snapshot.

```json
{
  "export_kind": "agent-self-assessment-export",
  "schema_version": 1,
  "log_head_seq": 1234,
  "log_head_sha256": "<64 hex>",
  "as_of": "<at of the head event>",
  "labels": {
    "official": false, "comparability": "none", "unverified": true, "identity_verified": false,
    "not_a_score": "Not a Compassion Benchmark score. Not part of any index or ranking. Not comparable to any other entry.",
    "identity": "Self-identified, not verified",
    "ratings": "Self-reported, unverified"
  },
  "dimensions": [ { "code": "AWR", "name": "Awareness" } ],
  "instrument_versions": [ "...registry versions[]..." ],
  "submissions": [ {
    "submission_id": "sa_...", "state": "approved", "public_hold": false,
    "received_at": "...", "decided_at": "...", "approved_at": "...",
    "thread_key": "...", "submitter_relationship": "...",
    "instrument_version": "1", "instrument_hash": "...",
    "reason_codes": [], "decision_reason_code": "policy_compliant",
    "official": false, "comparability": "none", "unverified": true, "identity_verified": false,
    "body": { "declared_model": {}, "declared_operator": "...", "submitter_relationship_declared": "...",
              "assessment_text": "...", "known_limitations": "...", "self_ratings": { "AWR": 3 },
              "moderator_notes": [] },
    "history": [ { "seq": 42, "type": "submission_received", "at": "...", "actor_class": "system", "reason_code": "checks_passed" } ]
  } ],
  "takedowns": [ { "takedown_id": "td_...", "category": "...", "received_at": "...", "acknowledged_at": "...", "decided_at": "...",
                   "decision": "...", "decision_reason_code": "...", "target_submission_ids": [], "target_thread_key": null,
                   "holds_applied": [], "body": { "details": "...", "contact": "...", "target_url": "..." } } ]
}
```

- `submissions` holds all states, sorted by `received_at` then `submission_id`. `takedowns` is sorted by `received_at` then `takedown_id`.
- A purged body appears as `{ "purged": true, "purged_at": "...", "reason": "..." }`.
- **Never in the export:** `token_sha256`, `client_ref`, salts, ledger contents, the admin token.
- The export carries the labels as fields on every submission, as ASA-DSP-05 AC2 requires for machine-readable output.
- It is a moderator-credentialed, **internal** document: it contains non-public states and notes. The public dataset for the `.org` move is `exportView` filtered to `visible(r)`. That public subset uses the same schema with `takedowns` omitted and `moderator_notes`, `reason_codes` and `history` removed.
- **JSON Schema.** `agent-api/schema/export.schema.json` (draft 2020-12), written in slice S5, encodes the shape above:
  - `additionalProperties: false` everywhere;
  - `official` const `false`; `comparability` const `"none"`;
  - `self_ratings` keys from the contract and values as integers 1-5;
  - no numeric property anywhere except `seq`, `log_head_seq`, `schema_version` and the rating values.

  The export test validates against it with a small built-in validator (no dependency), restricted to the keywords the schema uses [ASA-PRV-05 AC1].

---

## 10. Counters (`metrics.jsonl`) [ASA-MET]

Each line has this shape: `{"d":"YYYY-MM-DD","m":"<metric>","n":<positive integer>}`. Totals are sums over lines, so they are exact. There are no read-modify-write races (single writer), and no identifiers.

| Metric name | Incremented when | Used for |
|---|---|---|
| `instrument.fetch.raw` | every beacon hit | MET-01 (raw) |
| `instrument.fetch.search_crawler`, `instrument.fetch.ai_agent` | the beacon classifies a hit | MET-01 breakdown |
| `instrument.client_days` | at day rollover: distinct non-crawler `client_ref`s for the closed day (one aggregate line) | MET-01 |
| `instrument.fetched_no_post` | at D+2: clients that fetched on D with no submit attempt on D or D+1 | MET-05 (DEV-08) |
| `submit.attempt` | every `POST /submissions` that reaches step 1 | MET-05, MET-06 |
| `submit.receipt` | a receipt is returned | MET-02, MET-10 |
| `submit.held.<code>` | per soft code on a held receipt | MET-06 |
| `submit.rejected_auto.<code>` | per hard code | MET-06 |
| `submit.rejected.transport` | 400, 413 or 415 | MET-06 |
| `submit.closed` | kill switch 503 | ops |
| `ratelimit.<limit_id>` | each 429 by limit, plus `ratelimit.queue_cap` for each 503 | MET-06, ASA-RAT AC3, ASA-MOD-07 AC2 |
| `status.check` | each status request | ops |
| `withdraw.ok` | each successful withdraw | ops |
| `takedown.received.<category>` | each takedown | MET-08 |
| `threads.read.index`, `threads.read.thread` | public reads | ops |
| `client.identity_degraded` | a request whose derived IP is private | ARCH §8.1 |
| `integrity.guard_tripped` | public-guard refused a payload | MET-07 |

**Metrics computed from records, not counters** (exact, by fold):
- MET-03: distinct `thread_key` with at least one visible approved entry.
- MET-04: median and 90th percentile of `decided_at - received_at` over `approved` and `rejected` decisions in a rolling 30 days.
- MET-08: acknowledgement, hide and decision latencies per takedown case.
- MET-09: daily `pending + held` count and oldest age.
- MET-10 (DEV-11): `sum(submit.receipt)` equals the number of `submission_received` events in the same window. Tolerance is 0.

`moderate metrics` prints every metric with its definition, window and source. Section 6.3 of the PRD's targets are printed alongside as **proposed**, not as pass/fail.
