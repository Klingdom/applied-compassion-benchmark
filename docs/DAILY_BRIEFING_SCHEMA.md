# Daily Briefing JSON Schema Contract

**Version**: 1.0  
**Canonical source**: `site/src/data/updates/daily/YYYY-MM-DD.json`  
**Rich-required cutoff**: dates >= `2026-05-26` must satisfy the Full Rich contract.  
**Reference implementation**: `site/scripts/validate-daily-briefings.mjs`  
**Reference example**: `site/src/data/updates/daily/2026-05-25.json`

---

## Cutoff Policy

| Date range | Contract level | Violation treatment |
|---|---|---|
| All dates | Minimum contract (see below) | ERROR — build fails |
| `>= 2026-05-26` | Full Rich contract (see below) | ERROR — build fails |
| `< 2026-05-26` and flat | Flat shape tolerated | WARNING only — "legacy, grandfathered" |

---

## 1. Minimum Contract (all dates)

Every briefing JSON must satisfy ALL of the following, regardless of date. Violations are ERRORS.

| Check | Rule |
|---|---|
| Parse | File must be valid JSON |
| `date` | Non-empty string |
| Renderable lead | At least one of: non-empty `topSignals[]`, non-empty `scoreChanges[]`, non-empty `highlights[]`, or non-empty `confirmations[]` |

---

## 2. Full Rich Contract (dates >= `2026-05-26`)

All checks below are ERRORS for post-cutoff dates.

### 2a. Required top-level scalar fields

| Field | Type | Required | Quality bar |
|---|---|---|---|
| `date` | `string` (YYYY-MM-DD) | YES | Non-empty; matches filename date |
| `generatedAt` | `string` (ISO timestamp) | YES | Non-empty |
| `title` | `string` | YES | Non-empty; readable briefing title |
| `headline` | `string` | YES | Non-empty; one substantive sentence minimum |
| `summary` | `string` | YES | Non-empty; paragraph summarizing the cycle |

### 2b. `pipeline` object

| Field | Type | Required | Quality bar |
|---|---|---|---|
| `pipeline` | `object` | YES | Must be an object (not null, not array) |

No individual sub-field of `pipeline` is enforced at this contract level; the shape may vary by cycle type.

### 2c. `topSignals[]` array

| Requirement | Rule |
|---|---|
| Present and non-empty | YES — must have at least 1 item |
| Item shape | Each item must have all required sub-fields (see below) |

**`topSignals[]` item shape:**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `title` | `string` | YES | Non-empty |
| `whyItMatters` | `string` | Recommended | Plain "so what" in ≤40 words, no jargon, stakes-first. The card features this as the lead takeaway. Additive — legacy items without it fall back to the first sentence of `description`. |
| `description` | `string` | YES | Non-empty |
| `index` | `string` | YES | Non-empty |
| `slug` | `string` | YES | Non-empty |
| `severity` | `string` | YES | One of: `"critical"`, `"high"`, `"medium"`, `"low"` |
| `actionRequired` | `boolean` | YES | Explicit boolean |
| `actionType` | `string` | YES | Non-empty; one of approved status values (see observer-voice rules) |
| `evidence` | `EvidenceItem[]` | Optional | See §2c-evidence below; additive — legacy items without it remain valid |

### 2c-evidence. `EvidenceItem` atom (additive, optional)

An `evidence[]` array may appear on any `topSignals[]` item or any `recentAssessments[]` item. Its presence is optional and additive — briefings without it remain fully valid. When present, each item in the array must conform to the shape below.

**`EvidenceItem` shape:**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `quote` | `string` | YES (when item present) | Verbatim text from source, ~50 words max. MUST be exact text — never paraphrase-as-quote. |
| `claim` | `string` | Optional | The factual claim the quote supports; observer voice. |
| `source` | `string` | YES (when item present) | Publisher or author name ("OCHA", "Human Rights Watch", "Reuters"). |
| `url` | `string` | **REQUIRED when `quote` is non-empty** | Full http(s) URL to the source page. Omitting this when a quote is present is a build ERROR. |
| `publishedDate` | `string` | Optional | ISO date string (YYYY-MM-DD). |
| `sourceTier` | `1\|2\|3\|4\|5` | Optional | Source authority tier: 1 = gov/court/treaty, 2 = IO/UN body, 3 = watchdog NGO, 4 = top-tier journalism, 5 = trade/advocacy. |
| `archivedUrl` | `string` | Optional | Wayback Machine or equivalent snapshot URL for link-rot resistance. |

**Integrity rules enforced at build time (see `validate-daily-briefings.mjs`):**
- ERROR if `quote` is non-empty and `url` is absent (anti-fabrication guard).
- ERROR if `url` or `archivedUrl` is present but is not a valid `http(s)://` URL.
- ERROR if `source` is missing or empty when the item is present.
- WARNING if `quote` exceeds ~50 words (paraphrase-creep guard).
- WARNING if `sourceTier` is present but outside 1–5.

### 2d. `boundaryWatch[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`boundaryWatch[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `entity` | `string` | YES | Non-empty |
| `slug` | `string` | YES | Non-empty |
| `index` | `string` | YES | Non-empty |
| `score` | `number` | YES | Numeric composite score |
| `fromBand` | `string` | YES | Non-empty band name |
| `toBand` | `string` | YES | Non-empty band name |
| `direction` | `string` | YES | `"upward"` or `"downward"` |
| `status` | `string` | YES | Non-empty |
| `distance` | `number` | YES | Absolute distance to boundary in points |
| `cycle` | `number` | YES | Cycle count integer |
| `trigger` | `string` | YES | Non-empty observer-voice description |
| `note` | `string` | YES | Non-empty observer-voice note |

### 2e. `recentAssessments[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`recentAssessments[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `entity` | `string` | YES | Non-empty |
| `slug` | `string` | YES | Non-empty |
| `index` | `string` | YES | Non-empty |
| `date` | `string` | YES | Non-empty ISO date |
| `published` | `number` | YES | Published composite score |
| `assessed` | `number` | YES | Assessed composite score |
| `delta` | `number` | YES | Signed delta (may be 0) |
| `status` | `string` | YES | Non-empty; approved values: `"applied"`, `"documented"`, `"band-crossing-finding"`, `"band-crossing-proposed"`, `"boundary-watch"`, `"floor-confirmed"`, `"methodology-evolution"` |
| `whyHeadline` | `string` | Optional | Observer voice; ≤18 words preferred |
| `dominantDimension` | `object {code: string, delta: number}` | Optional | Present when evidence warrants |
| `primaryEvidenceUrl` | `string` | Optional | Omit when no credible primary URL |
| `distanceToBoundary` | `object {band: string, pointsAway: number, direction: string}` | Optional | Omit when distance exceeds 3.0 pts |
| `nextForwardSignal` | `object {date: string\|null, label: string}` | Optional | Omit when no forward signal known |
| `evidence` | `EvidenceItem[]` | Optional | See §2c-evidence above; same integrity rules apply |

### 2f. `emergingRisks[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`emergingRisks[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `risk` | `string` | YES | Non-empty observer-voice risk statement |
| `priority` | `string` | YES | One of: `"critical"`, `"high"`, `"medium"`, `"low"` |
| `entitiesAffected` | `string[]` | YES | Non-empty array of slugs |
| `detail` | `string` | YES | Non-empty elaboration |
| `forwardDate` | `string` | YES | Non-empty date string or `"TBD"` variant |

### 2g. `sectorAlerts[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`sectorAlerts[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `sector` | `string` | YES | Non-empty |
| `headline` | `string` | YES | Non-empty |
| `observations` | `string[]` | YES | Non-empty array |

### 2h. `methodologyNotes[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`methodologyNotes[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `name` | `string` | YES | Non-empty |
| `description` | `string` | YES | Non-empty |
| `version` | `string` | YES | Non-empty version string |
| `status` | `string` | YES | Non-empty |

### 2i. `forwardTriggers[]` array

| Requirement | Rule |
|---|---|
| Present | YES — must be an array (may be empty) |

**`forwardTriggers[]` item shape (when items present):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `date` | `string` | YES | Non-empty date string or `"TBD"` variant |
| `entity` | `string` | YES | Non-empty |
| `slug` | `string` | YES | Non-empty |
| `trigger` | `string` | YES | Non-empty observer-voice description |
| `priority` | `string` | YES | One of: `"critical"`, `"high"`, `"medium"`, `"low"` |

### 2j. `dailyOpeningQuestion` field

| Requirement | Rule |
|---|---|
| Present | YES — field must exist at top level |
| Value | Must be `null` OR an object with the shape below |

**`dailyOpeningQuestion` object shape (when not null):**

| Sub-field | Type | Required | Quality bar |
|---|---|---|---|
| `text` | `string` | YES | Non-empty; ≤55 words; interrogative sentence |
| `themes` | `string[]` | YES | 1–3 thematic labels |
| `tiedToEntities` | `string[]` | YES | At least 1 entity slug |
| `forwardResolutionDate` | `string\|null` | YES | YYYY-MM-DD or null |
| `eveningResolution` | `null` | YES | Always null |
| `tensionFraming` | `string` | Optional | ≤25-word framing prefix |

---

## 3. Forbidden Fields (post-cutoff briefings must not contain)

The following top-level keys are forbidden in public daily JSON. Their presence is an ERROR if found on post-cutoff dates (they belong only in `research/` internal artifacts):

- `scoreChangesPendingHumanReview`
- `bandChangesPendingReview`
- `humanReviewFlags`
- `mathHygieneFlags`
- `baselineCorrections`
- `holdsReleased`, `holdsActive`
- `priorityAssessments`, `rotationAssessments`
- `proposalsGenerated`, `searchesPerformed`

---

## 4. Approved `status` Values for `recentAssessments[].status`

| Value | Public surface reads |
|---|---|
| `"applied"` | Score updated this cycle |
| `"documented"` | Movement documented; remains within published score |
| `"band-crossing-finding"` | Boundary proximity documented |
| `"band-crossing-proposed"` | Band crossing proposed |
| `"boundary-watch"` | Boundary proximity documented |
| `"floor-confirmed"` | Floor state confirmed this cycle |
| `"methodology-evolution"` | Sub-anchor entering candidate methodology set |

Forbidden: `"held"`, `"pending-review"`, `"requires-review"`, `"flagged"`, `"escalated"`, `"requires-human-review"`, `"band-crossing-human-review-pending"`.

---

## 5. Observer Voice Rules (content quality)

These rules are enforced by `lint-daily-briefings.mjs` (phrase scanner). The schema validator (`validate-daily-briefings.mjs`) enforces structural shape only. Both must pass.

Forbidden phrases in any string field: "human review required", "requires human review", "founder decision", "flagged for review", "review queue", "Apply requires human review", and all variants documented in `.claude/agents/overnight-digest.md` under "PUBLIC DAILY JSON RULES".
