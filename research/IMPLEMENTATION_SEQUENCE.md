# Overnight Research System -- Implementation Sequence

## Delivery Order

Each phase produces testable artifacts. Do not proceed to the next phase until the current one works end-to-end.

---

## Phase 1: Scaffolding and Rotation State (Day 1)

**Owner**: backend-engineer or data-engineer

### Tasks

1. Create folder structure:
   ```
   mkdir -p research/scans research/assessments research/change-proposals research/digests research/archive
   ```

2. Write a script `research/scripts/init-rotation-state.mjs` that:
   - Reads all 7 index JSON files from `site/src/data/indexes/`
   - Generates a slug for each entity
   - Writes `research/rotation-state.json` with all 1,155 entities, all dates null

3. Write a script `research/scripts/slug-from-name.mjs` that defines the canonical slugging function (shared by all agents):
   - Lowercase
   - Replace spaces with hyphens
   - Strip Inc, Corp, Ltd, LLC, Co., Plc
   - Remove parenthetical suffixes
   - Collapse multiple hyphens
   - Examples: "Anthropic" -> "anthropic", "Johnson & Johnson" -> "johnson-johnson", "City of Portland" -> "city-of-portland"

4. Create empty template files:
   - `research/PENDING_CHANGES.md` with header only
   - `research/APPLIED_CHANGES.md` with header only

### Validation
- `rotation-state.json` has exactly 1,155 entities
- Every entity has a unique slug
- Every entity maps to one of the 7 index names

---

## Phase 2: Scanner Agent (Days 2-4)

**Owner**: system-architect writes the agent definition, then manual testing

### Tasks

1. Write `.claude/agents/overnight-scanner.md` with:
   - Full prioritization algorithm
   - Web search query templates per entity type
   - Output format specification
   - Rotation state update logic

2. Test with a small subset:
   ```
   claude --agent overnight-scanner "Scan only AI Labs index for 2026-04-16"
   ```

3. Validate output:
   - `research/scans/2026-04-16.json` exists and matches schema
   - Priority scores are reasonable
   - News summaries are relevant to compassion dimensions
   - Rotation state updated

4. Test full scan:
   ```
   claude --agent overnight-scanner "Run nightly scan for 2026-04-17"
   ```

5. Tune search queries based on results:
   - Are relevant events being detected?
   - Are irrelevant events being filtered?
   - Is the priority ordering sensible?

### Validation
- Scanner completes in under 45 minutes for full scan
- Priority list has reasonable ordering
- No duplicate entities in output
- Rotation state file is updated correctly

---

## Phase 3: Assessor Agent (Days 5-8)

**Owner**: system-architect writes definition, then testing

### Tasks

1. Write `.claude/agents/overnight-assessor.md` that:
   - Reads today's scan file
   - Takes the top N entities (configurable, default 15)
   - For each entity, runs the full benchmark-research assessment methodology
   - Writes assessment report to `research/assessments/{slug}.md`
   - Compares against published scores
   - Generates change proposal if delta > 5 points
   - Updates rotation state

2. Test with 3 entities from a real scan:
   ```
   claude --agent overnight-assessor "Assess top 3 entities from scan 2026-04-16"
   ```

3. Validate:
   - Assessment reports match existing format (compare with unitree.md)
   - Change proposals have correct schema
   - Published scores in proposals match actual index JSON values
   - Proposed scores are in raw (1-5) format
   - Composite calculations are correct

4. Test with a known entity (one that should confirm):
   - Run assessor on an entity where we expect no change
   - Verify it produces a "confirm" recommendation, not a false-positive change

### Validation
- Assessments complete in ~5 min each
- Change proposals only generated when warranted
- Score math is correct (raw to scaled conversions)
- Assessment format is identical to existing benchmark-research output

---

## Phase 4: Digest Agent (Days 9-10)

**Owner**: system-architect writes definition

### Tasks

1. Write `.claude/agents/overnight-digest.md` that:
   - Reads all assessments from today (by date in frontmatter)
   - Reads all change proposals from today
   - Reads recent digests for trend context (last 7 days)
   - Generates daily digest markdown
   - Regenerates PENDING_CHANGES.md from all pending proposals

2. Test with outputs from Phase 3:
   ```
   claude --agent overnight-digest "Generate digest for 2026-04-16"
   ```

3. Validate:
   - Digest is readable and actionable
   - PENDING_CHANGES.md correctly lists all pending proposals
   - Sector trends are based on real data, not hallucinated

### Validation
- Digest completes in under 10 minutes
- All assessed entities appear in the digest
- PENDING_CHANGES.md reflects actual proposal files

---

## Phase 5: Score Updater Agent (Day 11)

**Owner**: data-engineer or backend-engineer

### Tasks

1. Write `.claude/agents/score-updater.md` that:
   - Reads change proposals where `status === "approved"`
   - For each, updates the index JSON file
   - Recalculates ranks, band counts, mean/median
   - Marks proposal as "applied"
   - Appends to APPLIED_CHANGES.md

2. Test with a synthetic approved proposal:
   - Manually set a proposal's status to "approved"
   - Run the updater
   - Verify index JSON was updated correctly
   - Verify ranks were recalculated
   - Verify the proposal status changed to "applied"

3. Test rollback: verify the git diff is clean and reviewable before committing

### Validation
- Index JSON changes are correct and minimal
- Rank ordering is correct after update
- Band counts are recalculated
- No data corruption in the index file

---

## Phase 6: End-to-End Integration (Days 12-14)

### Tasks

1. Run the full pipeline manually in sequence:
   ```
   claude --agent overnight-scanner "Run nightly scan for 2026-04-18"
   claude --agent overnight-assessor "Run nightly assessments for 2026-04-18"
   claude --agent overnight-digest "Generate digest for 2026-04-18"
   ```

2. Review all outputs manually
3. Approve one change proposal and run the score updater
4. Verify site builds correctly with updated index data: `cd site && npm run build`
5. Fix any issues found

### Validation
- Full pipeline completes without errors
- All output files are correctly formatted
- Site builds and deploys with updated data
- Human review workflow is clear and practical

---

## Phase 7: Scheduling (Days 15-16)

### Tasks

1. Configure Claude Code scheduled triggers:
   - Mon-Sat 02:00: scanner
   - Mon-Sat 02:45: assessor (15 entities)
   - Mon-Sat 05:00: digest

2. Run for one full week with daily human review
3. Monitor:
   - Runtime per phase
   - API cost per night
   - False positive rate (change proposals that should be "confirm")
   - Scanner accuracy (does flagged news actually affect scores?)

4. Tune parameters:
   - Adjust priority weights
   - Adjust entity-per-night count
   - Adjust change proposal threshold (default: 5 point delta)

### Validation
- Scheduled runs complete reliably
- Cost is within budget (~$50-65/night)
- False positive rate is below 30%
- Human can review and act on outputs in under 15 minutes

---

## Phase 8: Hardening (Ongoing)

### Tasks

1. Add idempotency: if a night's run is interrupted and restarted, it does not duplicate work
2. Add error recovery: if assessor fails on entity 8 of 15, it can resume from entity 9
3. Add archiving: quarterly move old assessments to `research/archive/YYYY-QN/`
4. Add cost tracking: log model usage per run to `research/logs/YYYY-MM-DD.json`
5. Add weekly summary: a weekend agent that reads all daily digests and produces a weekly rollup
6. Consider a dashboard page on the site showing "Last updated" dates per index

---

## Critical Path

```
Phase 1 (scaffolding)
  |
  v
Phase 2 (scanner) -------> Phase 3 (assessor) -------> Phase 4 (digest)
                                    |
                                    v
                            Phase 5 (score updater)
                                    |
                                    v
                            Phase 6 (integration)
                                    |
                                    v
                            Phase 7 (scheduling)
                                    |
                                    v
                            Phase 8 (hardening)
```

Phase 2 and Phase 5 could be built in parallel since they have no dependency on each other. Everything else is sequential.
