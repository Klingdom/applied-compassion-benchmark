# Overnight Research System -- Data Model

## Entities

All entities come from the existing 7 index JSON files. No new entity storage is needed. The index files are the source of truth for published scores.

### Entity Reference Format (used across all research files)

```
slug:  lowercase hyphenated identifier (e.g., "unitree", "anthropic", "city-of-portland")
index: one of "ai-labs" | "countries" | "fortune-500" | "global-cities" | "robotics-labs" | "us-cities" | "us-states"
```

Slugs are derived from entity names: lowercase, spaces to hyphens, strip Inc/Corp/Ltd, collapse special characters.

---

## File Schemas

### 1. Scan Result: `research/scans/YYYY-MM-DD.json`

```json
{
  "date": "2026-04-16",
  "scanner_model": "sonnet",
  "runtime_seconds": 1680,
  "entities_scanned": 1155,
  "entities_flagged": 47,
  "priority_list": [
    {
      "rank": 1,
      "slug": "meta",
      "name": "Meta Platforms",
      "index": "ai-labs",
      "priority_score": 78,
      "signals": {
        "news_recency": 40,
        "staleness": 20,
        "volatility_risk": 10,
        "index_importance": 8
      },
      "news_summary": "Laid off responsible AI team; FTC investigation into data practices",
      "news_sources": [
        "https://example.com/meta-rai-layoffs",
        "https://example.com/ftc-meta"
      ]
    }
  ],
  "rotation_fill": [
    {
      "slug": "walmart",
      "name": "Walmart",
      "index": "fortune-500",
      "reason": "rotation: last assessed 2026-02-10"
    }
  ]
}
```

### 2. Assessment Report: `research/assessments/{slug}.md`

Unchanged from existing format. See the benchmark-research agent definition for the full schema. Key fields in frontmatter:

```yaml
entity: "Entity Name"
type: "Company | Country | State | City | Municipality | Organization"
sector: "Sector/Domain"
date: "YYYY-MM-DD"
composite_score: number
band: "Critical | Developing | Functional | Established | Exemplary"
scores:
  AWR: number (0-100 scale)
  EMP: number
  ACT: number
  EQU: number
  BND: number
  ACC: number
  SYS: number
  INT: number
published_index: "Index name or null"
published_rank: number or null
published_composite: number or null
published_band: "Band or null"
```

### 3. Change Proposal: `research/change-proposals/{slug}.json`

```json
{
  "entity": "string -- display name",
  "slug": "string -- file identifier",
  "index": "string -- which index file",
  "assessment_date": "YYYY-MM-DD",
  "assessment_file": "string -- relative path to assessment md",

  "published_scores": {
    "composite": "number (0-100)",
    "band": "string",
    "rank": "number",
    "dimensions": {
      "AWR": "number (1-5 raw scale, as stored in index JSON)",
      "EMP": "number",
      "ACT": "number",
      "EQU": "number",
      "BND": "number",
      "ACC": "number",
      "SYS": "number",
      "INT": "number"
    }
  },

  "proposed_scores": {
    "composite": "number (0-100)",
    "band": "string",
    "dimensions": {
      "AWR": "number (1-5 raw scale, for index compatibility)",
      "EMP": "number",
      "ACT": "number",
      "EQU": "number",
      "BND": "number",
      "ACC": "number",
      "SYS": "number",
      "INT": "number"
    }
  },

  "score_delta": "number -- proposed composite minus published composite",
  "band_change": "boolean -- does the band change",
  "confidence": "high | medium | low",

  "key_evidence": [
    "string -- one-line summary of each major evidence point"
  ],

  "dimensions_changed": [
    {
      "dimension": "AWR",
      "published_raw": 2.4,
      "proposed_raw": 1.8,
      "delta_scaled": -15.0,
      "reason": "string -- why this dimension changed"
    }
  ],

  "recommendation": "upgrade | downgrade | confirm | flag-for-review",

  "status": "pending | approved | rejected | deferred | applied",
  "reviewed_by": "string or null",
  "reviewed_date": "YYYY-MM-DD or null",
  "decision_notes": "string or null",
  "applied_date": "YYYY-MM-DD or null"
}
```

### 4. Rotation State: `research/rotation-state.json`

```json
{
  "last_updated": "YYYY-MM-DD",
  "scan_cycle": 12,
  "entities": {
    "{slug}": {
      "name": "string",
      "index": "string",
      "last_scanned": "YYYY-MM-DD or null",
      "last_assessed": "YYYY-MM-DD or null",
      "last_change_proposal": "YYYY-MM-DD or null",
      "assessment_count": 0
    }
  }
}
```

### 5. Daily Digest: `research/digests/YYYY-MM-DD.md`

Markdown format. No structured schema -- generated narrative with tables. See ARCHITECTURE.md for format example.

### 6. Pending Changes Queue: `research/PENDING_CHANGES.md`

Markdown table format. Regenerated nightly by the digest agent from all change proposals with `status: "pending"`. See ARCHITECTURE.md for format.

### 7. Applied Changes Log: `research/APPLIED_CHANGES.md`

Append-only log:

```markdown
# Applied Score Changes

## 2026-04-16

| Entity | Index | Old Score | New Score | Delta | Approved By | Proposal |
|--------|-------|-----------|-----------|-------|-------------|----------|
| Unitree | robotics-labs | 35.9 | 21.3 | -14.6 | phil | [link](change-proposals/unitree.json) |
```

---

## Score Conversion Reference

Index JSON files store dimension scores as raw means on a 1-5 scale. Assessment reports use 0-100 scaled scores. Conversion:

```
scaled = ((raw - 1) / 4) * 100
raw = (scaled / 100) * 4 + 1
```

Change proposals must store dimensions in raw (1-5) format for direct index compatibility. The `composite` field is always on the 0-100 scale.

---

## File Lifecycle

```
Entity enters scan    -->  scan result (ephemeral, one per night)
Scan flags entity     -->  assessment report (latest kept, old archived)
Assessment differs    -->  change proposal (persists until reviewed)
Human approves        -->  index JSON updated, proposal marked "applied"
                           applied changes log updated
Quarterly             -->  old assessments archived to research/archive/
```

---

## Index JSON Update Contract

When the score-updater agent modifies an index JSON file, it must:

1. Update only the `scores` object and `composite` field for the target entity
2. Recalculate `band` based on the new composite using standard banding
3. Re-sort the `rankings` array by composite score descending
4. Reassign `rank` values (1-indexed, sequential)
5. Update `meta.meanScore` and `meta.medianScore`
6. Update band counts in the `bands` array
7. NOT modify any other fields (name, hq, sector, etc.)

This is a mechanical transformation. The agent reads the approved proposal, applies the numbers, and recalculates derived fields.
