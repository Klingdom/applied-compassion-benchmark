# Overnight Research System -- Architecture

## System Overview

Three agents run in sequence overnight via Claude Code scheduled tasks. No database, no custom server. Everything is files committed to git.

```
                    NIGHTLY PIPELINE
                    ===============

  +-----------+     +-------------+     +------------+
  |  SCANNER  | --> |  ASSESSOR   | --> |  DIGEST    |
  |  Agent    |     |  Agent      |     |  Agent     |
  +-----------+     +-------------+     +------------+
       |                  |                   |
       v                  v                   v
  scan-results/     assessments/         digests/
  YYYY-MM-DD.json   {entity-slug}.md     YYYY-MM-DD.md
                    change-proposals/
                    {entity-slug}.json
                                         PENDING_CHANGES.md
                                         (human review queue)
```

### Phase 1: SCANNER (runs first, ~30 min)
- Searches the web for recent compassion-relevant news about entities in all 7 indexes
- Produces a prioritized list of entities that likely need reassessment
- Output: `research/scans/YYYY-MM-DD.json`

### Phase 2: ASSESSOR (runs second, ~5 min per entity)
- Takes the top N entities from the scanner output
- Runs full benchmark-research assessment for each
- Compares new scores against published scores
- Writes change proposals for any entity with significant score movement
- Output: `research/assessments/{slug}.md` + `research/change-proposals/{slug}.json`

### Phase 3: DIGEST (runs last, ~5 min)
- Reads all assessments and change proposals from tonight
- Generates a daily summary with highlights, trends, and recommended actions
- Updates the pending review queue
- Output: `research/digests/YYYY-MM-DD.md` + `research/PENDING_CHANGES.md`

---

## File and Folder Structure

```
research/
  scans/
    2026-04-15.json              # Scanner output: prioritized entity list
    2026-04-16.json
    ...
  assessments/
    anthropic.md                 # Full assessment reports (existing format)
    unitree.md
    norway.md
    ...
  change-proposals/
    anthropic.json               # Structured score change proposals
    unitree.json
    ...
  digests/
    2026-04-15.md                # Daily summary
    2026-04-16.md
    ...
  PENDING_CHANGES.md             # Accumulated proposals awaiting human review
  APPLIED_CHANGES.md             # Log of approved and applied changes
  rotation-state.json            # Tracks which entities were last scanned/assessed
```

---

## Scheduling Strategy

### Nightly Run (2:00 AM local time)

Claude Code supports scheduled triggers. Three sequential invocations:

```
02:00  claude --agent overnight-scanner "Run nightly scan for 2026-04-16"
02:45  claude --agent overnight-assessor "Run nightly assessments for 2026-04-16"
05:00  claude --agent overnight-digest "Generate digest for 2026-04-16"
```

### Capacity Budget

- Each full assessment takes ~5 minutes
- Nightly budget: 2 hours for assessments = ~20-24 entities per night
- At 20/night, full rotation through 1,155 entities takes ~58 nights (~2 months)
- Scanner targets the most impactful 10-15 entities; remaining 5-10 slots go to rotation

### Weekly Schedule

| Night     | Scanner focus                        | Rotation pool         |
|-----------|--------------------------------------|-----------------------|
| Mon       | Full news scan, all indexes          | Fortune 500 (batch A) |
| Tue       | Full news scan, all indexes          | Fortune 500 (batch B) |
| Wed       | Full news scan, all indexes          | Countries             |
| Thu       | Full news scan, all indexes          | AI Labs + Robotics    |
| Fri       | Full news scan, all indexes          | Cities                |
| Sat       | Deep scan: top movers from the week  | US States + backfill  |
| Sun       | No run (cost control)                | --                    |

---

## Prioritization Algorithm

The scanner assigns a priority score (0-100) to each entity based on four signals, then returns the top N.

### Signal 1: News Recency and Magnitude (0-40 points)

Search for: `"{entity name}" AND (lawsuit OR scandal OR layoff OR acquisition OR policy OR regulation OR investigation OR award OR humanitarian OR safety OR recall OR settlement OR whistleblower OR violation)`

Scoring:
- Major negative event in last 7 days: 40
- Major positive event in last 7 days: 30
- Moderate event in last 14 days: 20
- Minor mention in last 30 days: 10
- No relevant news: 0

### Signal 2: Staleness (0-25 points)

How long since this entity was last assessed:
- Never assessed by agent: 25
- Last assessed 60+ days ago: 20
- Last assessed 30-59 days ago: 15
- Last assessed 14-29 days ago: 5
- Last assessed <14 days ago: 0

### Signal 3: Score Volatility Risk (0-20 points)

Entities near band boundaries or with known volatility factors:
- Composite within 3 points of a band boundary: 10
- Entity is in a sector experiencing systemic change: 5
- Entity has a pending change proposal not yet reviewed: 5

### Signal 4: Index Importance (0-15 points)

Higher-traffic indexes get slight priority:
- Fortune 500: 15
- Countries: 12
- AI Labs: 10
- Global Cities: 8
- US Cities: 5
- Robotics Labs: 5
- US States: 3

### Final Priority = sum of all signals. Top 15 entities get assessed.

Remaining 5-10 assessment slots filled from rotation pool (entities not assessed in longest time).

---

## Rotation State Tracking

`research/rotation-state.json` tracks when each entity was last scanned and assessed:

```json
{
  "last_updated": "2026-04-16",
  "entities": {
    "anthropic": {
      "index": "ai-labs",
      "last_scanned": "2026-04-15",
      "last_assessed": "2026-04-10",
      "last_change_proposal": null
    },
    "norway": {
      "index": "countries",
      "last_scanned": "2026-04-15",
      "last_assessed": "2026-03-20",
      "last_change_proposal": "2026-03-20"
    }
  }
}
```

---

## Change Proposal Format

`research/change-proposals/{entity-slug}.json`:

```json
{
  "entity": "Unitree Robotics",
  "slug": "unitree",
  "index": "robotics-labs",
  "assessment_date": "2026-04-15",
  "assessment_file": "research/assessments/unitree.md",
  "published_scores": {
    "composite": 35.9,
    "band": "Developing",
    "rank": 39,
    "dimensions": {
      "AWR": 2.4, "EMP": 2.2, "ACT": 2.6, "EQU": 2.0,
      "BND": 2.2, "ACC": 2.0, "SYS": 2.8, "INT": 2.2
    }
  },
  "proposed_scores": {
    "composite": 21.3,
    "band": "Developing",
    "dimensions": {
      "AWR": 1.8, "EMP": 1.8, "ACT": 2.2, "EQU": 1.4,
      "BND": 1.6, "ACC": 1.6, "SYS": 2.4, "INT": 2.0
    }
  },
  "score_delta": -14.6,
  "band_change": false,
  "confidence": "medium",
  "key_evidence": [
    "No public safety incident reporting framework found",
    "Limited transparency on manufacturing labor practices",
    "Growing B2B defense sector partnerships without ethics review"
  ],
  "recommendation": "downgrade",
  "status": "pending",
  "reviewed_by": null,
  "reviewed_date": null,
  "decision": null
}
```

### Confidence Levels
- **high**: Multiple independent sources, clear evidence trail, large score delta
- **medium**: Some strong evidence, some gaps, moderate delta
- **low**: Limited evidence, small delta, or conflicting signals

### Recommendation Values
- **upgrade**: Proposed score is meaningfully higher than published
- **downgrade**: Proposed score is meaningfully lower than published
- **confirm**: Proposed score is close to published (within 5 points)
- **flag-for-review**: Evidence is ambiguous or conflicting

---

## Human Review Workflow

### PENDING_CHANGES.md (auto-generated, append-only until reviewed)

```markdown
# Pending Score Changes

## High Priority (band changes or delta > 15)

| Entity | Index | Published | Proposed | Delta | Confidence | Date | File |
|--------|-------|-----------|----------|-------|------------|------|------|
| Unitree | robotics | 35.9 | 21.3 | -14.6 | medium | 2026-04-15 | [proposal](change-proposals/unitree.json) |

## Standard (delta 5-15, no band change)

| Entity | Index | Published | Proposed | Delta | Confidence | Date | File |
|--------|-------|-----------|----------|-------|------------|------|------|
| ... | ... | ... | ... | ... | ... | ... | ... |

## Confirmations (delta < 5)

| Entity | Index | Published | Proposed | Delta | Date |
|--------|-------|-----------|----------|-------|------|
| ... | ... | ... | ... | ... | ... |
```

### Review Process

1. Human reads PENDING_CHANGES.md each morning
2. For each proposal, human opens the linked change-proposal JSON and assessment markdown
3. Human sets `status` to one of: `approved`, `rejected`, `deferred`
4. If approved, human runs: `claude --agent score-updater "Apply approved changes"`
5. The score-updater agent reads approved proposals, updates the JSON index files, and logs to APPLIED_CHANGES.md

### Score Update Agent (Phase 2 deliverable)

A simple agent that:
1. Reads all change-proposals where `status === "approved"`
2. Updates the corresponding entry in `site/src/data/indexes/{index}.json`
3. Recalculates rank ordering within the index
4. Moves the proposal to `status: "applied"`
5. Appends to `research/APPLIED_CHANGES.md`
6. The next site deploy picks up the updated JSON

---

## Daily Digest Format

`research/digests/YYYY-MM-DD.md`:

```markdown
# Compassion Benchmark Daily Digest -- 2026-04-16

## Entities Scanned: 1,155 (news scan) | Assessed: 18

## Significant Findings

### Score Changes Proposed
- **Unitree Robotics** (Robotics Labs): 35.9 -> 21.3 (-14.6) -- defense partnerships without ethics framework
- **Meta** (AI Labs): 62.0 -> 58.5 (-3.5) -- layoffs in responsible AI team

### Scores Confirmed
- **Anthropic** (AI Labs): 90.9 confirmed -- continued safety investment
- **Norway** (Countries): 88.2 confirmed

## Sector Trends
- **AI Labs**: 3 entities showed declining Accountability scores; sector mean ACC dropped 2.1 points
- **Fortune 500**: Healthcare sector showing improved Equity scores following new regulations

## Emerging Risks
- US executive order on AI safety may affect scores for 12 AI labs
- EU supply chain directive implementation affecting Fortune 500 companies with EU operations

## Assessment Queue
- 15 entities assessed from scanner priority list
- 5 entities assessed from rotation (Fortune 500 batch)
- Next rotation: Countries batch (Wed night)

## Operational Notes
- Scanner runtime: 28 min
- Assessor runtime: 1h 42min (18 entities)
- 2 assessments had low confidence due to limited public data
```

---

## Agent Definitions

Three new agents needed, plus one utility agent:

### 1. overnight-scanner

**File**: `.claude/agents/overnight-scanner.md`
**Tools**: WebSearch, Read, Write, Bash
**Model**: sonnet (cost-efficient for scanning)

**Responsibilities**:
- Read all 7 index JSON files to get the full entity list
- Read `research/rotation-state.json` for staleness data
- For each entity, run targeted web searches for recent compassion-relevant events
- Score each entity using the prioritization algorithm
- Write the prioritized list to `research/scans/YYYY-MM-DD.json`
- Update `research/rotation-state.json` with scan timestamps

**Key constraint**: The scanner does NOT assess entities. It only determines which ones need assessment. This keeps the scanner fast and cheap.

### 2. overnight-assessor

**File**: `.claude/agents/overnight-assessor.md`
**Tools**: WebSearch, WebFetch, Read, Write, Grep, Glob, Bash
**Model**: opus (quality matters for scoring)

**Responsibilities**:
- Read today's scan file to get the prioritized entity list
- For each of the top N entities, invoke the existing benchmark-research methodology
- Write assessment reports to `research/assessments/{slug}.md`
- Generate change proposals to `research/change-proposals/{slug}.json`
- Update `research/rotation-state.json` with assessment timestamps

**Key constraint**: This agent reuses the existing benchmark-research methodology exactly. It does not invent new scoring. It wraps the existing agent's logic with batch orchestration.

### 3. overnight-digest

**File**: `.claude/agents/overnight-digest.md`
**Tools**: Read, Write, Grep, Glob, Bash
**Model**: sonnet (synthesis, no web search needed)

**Responsibilities**:
- Read all assessments and change proposals from today
- Read recent digests for trend context
- Generate the daily digest
- Update PENDING_CHANGES.md with new proposals
- Flag any high-priority items (band changes, large deltas)

### 4. score-updater (utility, human-triggered)

**File**: `.claude/agents/score-updater.md`
**Tools**: Read, Write, Grep, Bash
**Model**: sonnet

**Responsibilities**:
- Read change proposals with `status: "approved"`
- Update the corresponding index JSON files
- Recalculate rank ordering
- Log changes to APPLIED_CHANGES.md
- Mark proposals as applied

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

1. Create the `research/` folder structure
2. Create `research/rotation-state.json` initialized from all 7 index files (1,155 entities, all with `last_scanned: null, last_assessed: null`)
3. Write the `overnight-scanner` agent definition
4. Test the scanner manually: `claude --agent overnight-scanner "Run nightly scan for 2026-04-16"`
5. Verify scan output format and prioritization

**Deliverables**: Scanner agent, rotation state file, scan output format validated
**Risk**: Web search rate limits or quality of news detection. Mitigate by testing with a small entity subset first.

### Phase 2: Assessment Pipeline (Week 2)

1. Write the `overnight-assessor` agent definition
2. Test with 3-5 entities from a real scan output
3. Validate that change proposals are generated correctly
4. Validate that assessment reports match existing format (compare with unitree.md)
5. Write the `score-updater` utility agent

**Deliverables**: Assessor agent, change proposal format validated, score-updater agent
**Risk**: Assessment quality variance. Mitigate by comparing agent scores against known published scores for well-documented entities.

### Phase 3: Digest and Review (Week 3)

1. Write the `overnight-digest` agent definition
2. Test digest generation from real assessment outputs
3. Create PENDING_CHANGES.md template
4. Test the full end-to-end flow: scan -> assess -> digest -> human review -> apply
5. Document the human review process

**Deliverables**: Digest agent, PENDING_CHANGES.md, end-to-end flow validated
**Risk**: Digest quality or usefulness. Mitigate by iterating on the digest format based on what the founder actually finds actionable.

### Phase 4: Scheduling and Automation (Week 4)

1. Set up Claude Code scheduled triggers for the three agents
2. Configure the nightly schedule (Mon-Sat, skip Sun)
3. Run for one full week with human monitoring
4. Tune the prioritization weights based on real results
5. Adjust entity-per-night budget based on observed runtimes and costs

**Deliverables**: Automated nightly runs, tuned parameters
**Risk**: Cost overruns from API usage. Mitigate by starting with 10 entities/night and scaling up.

### Phase 5: Hardening (Week 5+)

1. Add error handling: what happens when scanner or assessor fails mid-run
2. Add idempotency: re-running a night does not duplicate proposals
3. Add cost tracking: log API usage per run
4. Add quality monitoring: track confidence levels over time
5. Consider adding a weekly summary that rolls up daily digests

---

## Cost and Capacity Estimates

### Per-Night Budget (20 entities)

| Phase | Model | Est. tokens | Est. cost |
|-------|-------|-------------|-----------|
| Scanner | Sonnet | ~500K input, ~50K output | ~$2-3 |
| Assessor (20 entities) | Opus | ~2M input, ~400K output | ~$40-60 |
| Digest | Sonnet | ~100K input, ~10K output | ~$0.50 |
| **Total** | | | **~$45-65/night** |

### Monthly Budget
- 26 nights/month (Mon-Sat) x $55 avg = ~$1,430/month
- Full rotation through all 1,155 entities: ~58 nights (~2.2 months)

### Cost Reduction Options
- Use Sonnet for assessment of "confirm" entities (small expected delta): saves ~30%
- Reduce to 10 entities/night: halves cost to ~$700/month
- Skip rotation slots and only assess scanner-flagged entities: variable savings

---

## Open Risks and Decisions

### Risk 1: Scanner Accuracy
The scanner uses web search to detect news. Web search results are noisy and may miss important events or surface irrelevant ones. The prioritization algorithm will need tuning after observing real scan results.

**Mitigation**: Start with manual review of scanner output before trusting it to drive assessments.

### Risk 2: Score Consistency
Different assessment runs for the same entity may produce different scores due to web search variability and model nondeterminism. This could cause unnecessary change proposals.

**Mitigation**: Only generate change proposals when delta exceeds 5 points. Include confidence levels. Human review catches false positives.

### Risk 3: Cost Control
Opus-based assessments are expensive. If the scanner flags too many entities or assessments run long, costs could exceed budget.

**Mitigation**: Hard cap on entities per night (configurable). Use Sonnet for low-priority confirmations. Track cost per run.

### Risk 4: Evidence Staleness
The scanner searches for "recent" news, but the assessor does a full assessment using all available evidence. There is a risk the assessor finds no significant change even when the scanner flagged the entity.

**Mitigation**: This is acceptable. A "confirmation" result (no change) is still valuable. Track confirmation rate and adjust scanner thresholds.

### Risk 5: Git Repository Size
Assessment reports and change proposals accumulate over time. At 20 entities/night, that is ~600 markdown files and ~600 JSON files per month.

**Mitigation**: Archive old assessments quarterly. Keep only the latest assessment per entity in the active directory. Move older ones to `research/archive/YYYY-QN/`.

### Decision Needed: Public vs. Private Research
Should the `research/` directory be committed to the public repo? Assessment reports contain detailed evidence and scoring rationale. Change proposals reveal the review process.

**Recommendation**: Keep `research/` in a private branch or separate private repo. The published index JSON files are public; the research pipeline behind them should not be.
