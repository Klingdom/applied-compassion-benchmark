# Architecture Audit — 2026-04-24

Read-only audit. Cited paths are absolute repo paths from `C:\Users\philk\applied-compassion-benchmark\`.

---

## Top 3 Critical Findings

1. **Independence policy is enforced only by code separation, not by code contract.** The published score data (`site/src/data/indexes/*.json`) and the commercial Gumroad mapping (`site/src/data/gumroad.ts`) are technically separate files, but **both are imported into the same module** at `site/src/data/entities.ts` lines 15-22, where each `EntityKind` row sets `gumroadUrl` next to score data. The two domains share an integration surface. There is no test, lint rule, schema, or boundary enforcement that prevents a future change from making score-derived behavior depend on Gumroad state (or vice versa). For an institution whose credibility *is* the product, this rule deserves an explicit machine-checkable boundary.

2. **The score-update pipeline mixes two numeric scales (raw 0–5 vs. scaled 0–100) with no schema and no validation, and silently coerces between them.** Live indexes store dimension scores as raw 0–5 (e.g. `site/src/data/indexes/countries.json` Israel: `"AWR": 1.4`). Change proposals store dimensions as scaled 0–100 (e.g. `research/change-proposals/israel.json`: `"AWR": 10`). The `score-updater` agent (`.claude/agents/score-updater.md`, line 56) performs `raw = (scaled / 100) * 4 + 1` inline, in prose, with no canonical implementation. Multiple recent log entries already record proposal/JSON drift (`research/score-update-log.md` Batches 7-8: "proposal stated old composite 90.9 but JSON already reflected a prior correction to 62.2 … applied verbatim"). This is the single biggest source of recurring pipeline bugs.

3. **`research/` is a junk drawer of artifacts and ad-hoc working files.** The CLAUDE.md mandates artifact-driven workflow with named artifacts (`PRD.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, etc.). `research/` does have several of these (`ARCHITECTURE.md`, `DATA_MODEL.md`, `IMPLEMENTATION_SEQUENCE.md`, `ITERATION_LOG.md`, `PENDING_CHANGES.md`, `APPLIED_CHANGES.md`, `score-update-log.md`) but they are interleaved with one-off dated files (`GROWTH_CANDIDATES_2026-04-18.md`, `ANALYTICS_CANDIDATES_2026-04-18.md`, `UX_CANDIDATES_2026-04-18.md`, `MARKET_CANDIDATES_2026-04-18.md`, `IMPROVEMENT_BACKLOG_2026-04-18.md`, `NEWSLETTER_DESIGN_SPEC_V2.md`, `NEWSLETTER_V2_AUDIT.md`, `NEWSLETTER_RESEARCH_V3.md`, `NEWSLETTER_TEMPLATE.md`, `SCHEDULING.md`). Nothing distinguishes "system contract" from "yesterday's working notes." There are also two parallel append-only logs of applied changes (`APPLIED_CHANGES.md` and `score-update-log.md`) that record the same events in different formats.

---

## Detailed Findings

### 1. Folder structure quality

**Current state.**
The repo has two clean halves and a soft middle:
- `site/` — well-organized Next.js app (`app/`, `components/{ui,layout,index,entity,seo,purchase,assessment,updates}/`, `data/{indexes,updates,evidence-reviews}/`, `lib/`). This is genuinely good.
- Root-level Docker / nginx / deploy files — appropriate at this scale.
- `research/` — see Finding 3, this is the weakest area.
- `.claude/agents/` — see Finding 6, this is mid-tier; multiple unused agents and contradictions with the Compassion Benchmark domain.

**Specific issues.**
- `legacy-html/` lives at the repo root. It's pure reference data and is not part of any build path (verified — only nginx redirects rewrite away from `.html`). It should live under `archive/` or `reference/` so a new contributor sees the live system at the top level.
- `error-pages/` (`error-pages\404.html`, `error-pages\50x.html`) is a third top-level static-content directory peer to `legacy-html/` and `site/`, with no obvious wiring to `nginx-ssl.conf` from filename alone. Either move under `nginx/error-pages/` or document the linkage.
- `research/` has no internal hierarchy (see Finding 3).
- `research/init-rotation-state.mjs` is a bootstrap script; it should be in `research/scripts/` per the contract written in `research/IMPLEMENTATION_SEQUENCE.md` line 20 ("Write a script `research/scripts/init-rotation-state.mjs`"). The directory `research/scripts/` does not exist, but the spec presumes it.
- `site/src/data/` mixes three lifecycles: human-curated `dimensions.ts`, `nav.ts`, `gumroad.ts`; agent-written `indexes/*.json`, `updates/`, `evidence-reviews/`. There is no `README` or naming convention to signal which is which (see Finding 4).
- `.claude/agents/CLAUDE.md` and `.claude/system.md` exist alongside agent prompts. Useful, but `system.md` is at a level above agents and is not referenced from `CLAUDE.md` at the repo root.

**Recommendation.**
1. Move `legacy-html/` and `error-pages/` to `archive/legacy-html/` and `nginx/error-pages/`.
2. Introduce internal structure inside `research/`:
   ```
   research/
   ├── contracts/                   # ARCHITECTURE.md, DATA_MODEL.md, IMPLEMENTATION_SEQUENCE.md (renamed)
   ├── pipeline/                    # scans/, assessments/, change-proposals/, digests/, manifests/
   ├── pipeline/state/              # rotation-state.json, run-pipeline.sh, init-rotation-state.mjs
   ├── ledger/                      # APPLIED_CHANGES.md, score-update-log.md (consolidated), ITERATION_LOG.md
   ├── reviews/                     # PENDING_CHANGES.md (the human queue)
   ├── working/                     # *_CANDIDATES_*, NEWSLETTER_*, V2/V3 drafts
   └── audit-2026-04-24/            # this folder
   ```
3. Add `research/README.md` explaining each subfolder's lifecycle and ownership.

**Effort.** 0.5 day (mostly `git mv` and a README).
**Priority.** Medium. Not a correctness issue, but every new specialist agent currently has to re-derive the layout.

---

### 2. Data model coherence

**Current state — partially mischaracterized in the audit prompt.**

All 7 index JSONs do in fact share the same top-level shape: `{ meta, bands, rankings }`.
Verified at:
- `site/src/data/indexes/countries.json` lines 1-51
- `site/src/data/indexes/fortune-500.json` lines 1-51
- `site/src/data/indexes/ai-labs.json` lines 1-51
- `site/src/data/indexes/us-states.json` lines 1-51
- `site/src/data/indexes/robotics-labs.json` lines 1-51
- `site/src/data/indexes/us-cities.json` lines 1-51
- `site/src/data/indexes/global-cities.json` lines 1-51

**The actual incoherence is at three levels below the top wrapper:**

**A. Per-entity attribute drift.** Each index has its own ad-hoc set of fields:
| Index | Extra fields per entity |
|---|---|
| countries | `region` |
| us-states | `region` |
| fortune-500 | `f500Rank`, `sector` |
| ai-labs | `hq`, `sector` |
| robotics-labs | `country`, `category` |
| us-cities | `state`, `region` |
| global-cities | `country`, `region` |

`fortune-500` is the outlier with `f500Rank` (external rank) shadowing `rank` (internal). Already accommodated in `site/src/data/entities.ts` lines 91, 127, 139, 151 by per-kind `metadataFields` arrays — tolerable, but it means every consumer must know the per-kind contract. There is no TypeScript schema for the JSON files.

**B. Two scales for the same field.** Dimension scores are stored as raw 1–5 in indexes, but as scaled 0–100 in change proposals. Verified:
- `site/src/data/indexes/countries.json` line 2978-2992 (Israel post-update): `AWR: 1.4` etc., composite 8.8.
- `research/change-proposals/israel.json` lines 8-35: `published_scores.dimensions.AWR: 37.5` (which back-converts to raw 1.5), `proposed_scores.dimensions.AWR: 10` (back-converts to raw 1.4).
- The conversion exists only as English prose in `.claude/agents/score-updater.md` line 56.

**C. Band casing drift.** `countries.json` uses `"band": "exemplary"` (lowercase). `research/change-proposals/israel.json` uses `"band": "Critical"` and `"band": "Developing"` (titlecase). `entities.ts` line 55-63 has a `normalizeBand()` function that papers over this at read time. The asymmetry is a rounding error today, but it is the kind of thing that breaks when a tenth agent assumes either form.

**Recommendation: a canonical index schema.**

Define one TypeScript-typed JSON Schema for all 7 indexes in `site/src/data/indexes/_schema.ts` and validate at build time:

```ts
type Band = "exemplary" | "established" | "functional" | "developing" | "critical";
type DimCode = "AWR" | "EMP" | "ACT" | "EQU" | "BND" | "ACC" | "SYS" | "INT";

interface IndexFile<MetaExtra = {}> {
  meta: {
    title: string;
    year: number;
    entityCount: number;
    meanScore: number;     // 0-100 scale
    medianScore: number;   // 0-100 scale
    dimensions: DimCode[]; // always all 8, in canonical order
  };
  bands: Array<{ name: string; range: string; count: number; pct: string }>;
  rankings: Array<{
    rank: number;                       // internal, sorted by composite desc
    name: string;
    composite: number;                  // 0-100
    band: Band;                         // ALWAYS lowercase
    scores: Record<DimCode, number>;    // ALWAYS 0-5, one decimal
    attributes: Record<string, string | number | undefined>;
                                        // ALL non-canonical fields go here
                                        // (sector, hq, region, country, category, state, f500Rank)
  }>;
}
```

And an analogous canonical proposal schema where dimension scores are also stored on the **0–5 raw scale** (not 0-100) so producer and consumer use the same numeric space. The 0-100 representation should exist only as a derived view. If the methodology owner wants to keep 0-100 in proposals, then provide a single shared converter in `site/src/lib/scoring.ts` and require both the assessor (`.claude/agents/overnight-assessor.md`) and the score-updater to import it via `node`, not implement it in prose.

**Effort.** 2 days for the schema + Zod/Ajv validation in build + per-kind `attributes` migration. The `entities.ts` reader already has the moral equivalent — this is largely making it explicit and applied at write time.
**Priority.** High. This is the source of recurring pipeline bugs cited in `research/score-update-log.md`.

---

### 3. Artifact-driven development enforcement

**Current state.** The `research/` folder partly follows the artifact discipline mandated by `.claude/agents/CLAUDE.md`. It has:

- Pipeline contracts: `research/ARCHITECTURE.md`, `research/DATA_MODEL.md`, `research/IMPLEMENTATION_SEQUENCE.md`.
- Operational ledgers: `research/ITERATION_LOG.md`, `research/APPLIED_CHANGES.md`, `research/score-update-log.md`, `research/PENDING_CHANGES.md`.
- Pipeline outputs: `research/scans/`, `research/assessments/`, `research/change-proposals/` (+ `history/`), `research/digests/`, `research/newsletters/`.

**Specific issues.**
1. **Two parallel applied-change ledgers.** `research/APPLIED_CHANGES.md` (lines 1-41, simple table) and `research/score-update-log.md` (1-99, batch-narrative form) record the same events in different formats. Either could be source of truth for an audit. They are both append-only and neither references the other. `score-updater.md` line 79-83 only writes to `APPLIED_CHANGES.md`; `score-update-log.md` is being written by some other agent or by the founder by hand.
2. **One-off dated working files clutter the contract layer.** `research/GROWTH_CANDIDATES_2026-04-18.md`, `ANALYTICS_CANDIDATES_2026-04-18.md`, `UX_CANDIDATES_2026-04-18.md`, `MARKET_CANDIDATES_2026-04-18.md`, `IMPROVEMENT_BACKLOG_2026-04-18.md` — none of these are referenced from any agent prompt or from `CLAUDE.md`. They are working artifacts of one improvement loop frozen in place.
3. **Newsletter artifacts are a separate workstream.** `NEWSLETTER_DESIGN_SPEC_V2.md`, `NEWSLETTER_V2_AUDIT.md`, `NEWSLETTER_RESEARCH_V3.md`, `NEWSLETTER_TEMPLATE.md` — internally inconsistent versioning (V2, V3) with no current-state pointer.
4. **The lifecycle of `change-proposals/` vs. `change-proposals/history/` is implicit.** `score-updater.md` line 87 says "Update Rotation State" but does not say "move applied proposal to history/." Yet many applied proposals do live under `history/` (e.g. `research/change-proposals/history/openai-2026-04-15.json`), implying a manual step.
5. **No SUCCESS_METRICS.md, no METRICS.md, no PRD.md** at repo root. CLAUDE.md mandates these for major work. The audit prompt itself implies an institution-grade system; that system has never produced a PRD-level artifact for, e.g., the Score-Watch product (it is currently described only by a TODO in `site/src/data/gumroad.ts` lines 7-15).

**Recommendation.**
1. Consolidate `APPLIED_CHANGES.md` and `score-update-log.md` into one file. Keep the score-update-log narrative form (it's richer); generate the table form on demand.
2. Move the dated `*_CANDIDATES_*` and `NEWSLETTER_V2/V3` files to `research/working/{date}/` with a 30-day retention policy.
3. Make the `change-proposals/` → `change-proposals/history/{slug}-{date}.json` move an explicit step in `score-updater.md`. Today the agent leaves applied proposals in the active folder (verified — `research/change-proposals/alphabet.json` has `status: "applied", applied_date: "2026-04-19"`).
4. Add `research/contracts/PIPELINE_PRD.md` describing the daily flow's product goals and success metrics — at minimum, the metrics already implicitly tracked in `digests/` (proposals/night, confirmations/night, error rate).

**Effort.** 1 day.
**Priority.** Medium-high. This is the kind of decay that makes a repo unteachable to a successor.

---

### 4. Agent-written vs. human-curated boundary

**Current state.** Mixed. The boundary exists conceptually but is unmarked.

**Agent-written (mutable, regenerable) — verified:**
- `site/src/data/indexes/*.json` — written by `score-updater` (`.claude/agents/score-updater.md` lines 69-71).
- `site/src/data/updates/daily/*.json` and `latest.json` — written by `overnight-digest`.
- `site/src/data/evidence-reviews/*.json` and `latest.json` — written by `overnight-scanner` (`.claude/agents/overnight-scanner.md` lines 211-225).
- `site/src/data/updates/manifest.json` — generated.
- `research/scans/`, `research/assessments/`, `research/change-proposals/`, `research/digests/`, `research/newsletters/`.
- `research/rotation-state.json` — written by all three pipeline agents.
- `research/APPLIED_CHANGES.md` — append-only by score-updater.

**Human-curated (stable, versioned):**
- `site/src/data/dimensions.ts` — methodology source of truth.
- `site/src/data/nav.ts` — site navigation.
- `site/src/data/gumroad.ts` — commercial mapping.
- `site/src/lib/scoring.ts` — scoring math.
- `.claude/agents/*.md` — agent prompts (these *are* the methodology).
- `research/ARCHITECTURE.md`, `research/DATA_MODEL.md`, `research/IMPLEMENTATION_SEQUENCE.md`.
- `CLAUDE.md`, `site/CLAUDE.md`, `site/AGENTS.md`.

**Specific issues.**
1. **Nothing in the file or folder name signals lifecycle.** A new contributor cannot tell from `site/src/data/indexes/countries.json` whether it is hand-edited or regenerated. They cannot tell from `research/rotation-state.json` either. The score-updater currently writes both files.
2. **Methodology files and run files share a folder.** `.claude/agents/` has both run-time agents (sonnet/opus prompts that *execute* nightly: `overnight-scanner.md`, `overnight-assessor.md`, `overnight-digest.md`, `score-updater.md`) and design-time advisor agents (sonnet/opus prompts that are invoked by humans on demand: `system-architect.md`, `product-manger.md`, `qa-engineer.md`, etc.). The latter are not being invoked nightly; the former are. This is not visible from listings.
3. **Some agent-written files are committed to git** (every JSON above), which is fine for traceability but means rebases/merges hit hot paths every night. There is no `.gitattributes` declaration of merge strategy for `latest.json`, which is overwritten every day.

**Recommendation.**
1. Add a header comment to every agent-written JSON: `"_generated_by": "overnight-scanner@2026-04-24"`.
2. Split `.claude/agents/` into `.claude/agents/pipeline/` (the four nightly agents) and `.claude/agents/specialists/` (the rest). The pipeline agents are operationally critical; the specialists are advisory.
3. Add `.gitattributes` rules to mark agent-written files with `merge=ours` to avoid manual conflict resolution on `latest.json` and `manifest.json`.
4. Add a one-page `OWNERSHIP.md` matrix: file → owner (human/agent name) → trigger → cadence → consumer.

**Effort.** 0.5 day.
**Priority.** Medium. Pure operability win for the "next founder" scenario.

---

### 5. Independence policy enforcement

**Current state.** The independence rule ("entities never pay for inclusion, score changes, or suppression of findings") is **enforced by convention only**. There is no code-level guard.

**Specific findings.**
1. **Score data and Gumroad data co-mingle in `entities.ts`.** `site/src/data/entities.ts` lines 80-160 binds each `EntityKind` to *both* index data and a Gumroad URL inside the same `KIND_CONFIG` object. Today this is read-only on both sides. But the colocation means any future change to make ranking display conditional on Gumroad fields, or vice versa, is a one-line edit, not a boundary breach. The two domains share an import graph and a config object.
2. **Per-entity Score-Watch CTAs are entity-keyed but not entity-paywall-keyed.** `site/src/app/score-watch/page.tsx` and the `scoreWatch` URL in `gumroad.ts` route customers to a Gumroad page parameterized by `?entity={slug}`. The slug here matches the slug in `site/src/data/indexes/*.json`. There is no code path today that uses payment status to alter score data. Good. But there is also no test or contract asserting this property.
3. **`SCORE_WATCH.useGumroad: false`** in `gumroad.ts` line 30 routes alerts to `/contact-sales?product=score-watch` for manual fulfillment until a real Gumroad product is created. This is a gray zone the audit should flag: any future "manual fulfillment" path is a place where a paying entity could ask the founder to review/adjust their listing. The mitigation is a written commitment + a public log; today there is no such log.
4. **The change-proposal pipeline has no commercial input.** `research/change-proposals/*.json` schemas (verified across `israel.json`, `alphabet.json`, `xai-grok.json`) carry no `customer`, `payer`, `requested_by`, `commercial_relationship` field — good. The scanner (`overnight-scanner.md`) sources only from public web search. The assessor (`overnight-assessor.md`) sources only from public evidence. The audit trail at `research/score-update-log.md` records `reviewed_by: founder` consistently. This is the actual independence enforcement, and it's reasonable for current scale.
5. **There is no `INDEPENDENCE_POLICY.md` artifact.** The rule appears in `CLAUDE.md` lines 68-70 as a single paragraph and is not cross-referenced from agent prompts or from any test.

**Recommendation.**
1. Create `INDEPENDENCE_POLICY.md` at repo root, defining the rule, the prohibited code patterns, and the disclosure obligations.
2. Add a build-time test that asserts `site/src/data/indexes/*.json` contents do not import from, reference, or read fields from `site/src/data/gumroad.ts`. This is a static-analysis test (grep + AST), not runtime.
3. Refactor `entities.ts` so `KIND_CONFIG` is split into `INDEX_CONFIG` (score-side: route, indexLabel, indexSlug, metadataFields) and `COMMERCE_CONFIG` (gumroadUrl, gumroadPrice). Two separate exports, each importable independently. Pages compose the two; the boundary becomes machine-grep-able.
4. Log every manually-fulfilled Score-Watch order in a public quarterly transparency report (which the institution should be doing anyway).

**Effort.** 1 day for items 1-3.
**Priority.** High — this is the core institutional differentiator and the only place where the architecture is *required* to encode a value claim.

---

### 6. Agent definitions quality

**Current state.** 24 agent files in `.claude/agents/`. Heterogeneous in style, scope, and applicability to Compassion Benchmark.

**Specific issues.**

**A. Domain mismatch.**
Several agents reference "Ledgerium AI" (a different product), not Compassion Benchmark:
- `.claude/agents/competitive-researcher.md` line 3: "Monitors process intelligence, process mining, workflow capture, and AI-native infrastructure landscape relevant to Ledgerium AI."
- `.claude/agents/meta-coordinator.md` line 3: "Meta-level optimization agent for the Ledgerium AI improvement system."
- `.claude/agents/coordinator.md` is generic-SaaS and doesn't mention Compassion Benchmark.

These are inherited from another repo and have not been ported. They will give wrong advice if invoked.

**B. Overlapping responsibilities.**
- `competitive-researcher.md` and `market-research.md` both own competitor analysis. Different prompts, no division of labor.
- `coordinator.md` and `meta-coordinator.md` both claim orchestration ownership.
- `customer-success.md`, `support-ops.md`, and `analytics.md` all touch retention/funnel, with no defined seam.

**C. Format inconsistency.**
Some agents use the YAML-front-matter `description:` field (e.g. `system-architect.md`, `product-manger.md`); others use `summary:` (e.g. `data-engineer.md`, `billing-pricing.md`, `customer-success.md`, `support-ops.md`, `security-engineer.md`). Some declare `tools:`; others do not. Some declare `model:`; others do not. This is a registry hygiene issue.

**D. The four pipeline agents are well-defined and consistent.**
`overnight-scanner.md`, `overnight-assessor.md`, `overnight-digest.md`, `score-updater.md`, `benchmark-research.md` — all use `description:`, `tools:`, `model:`, and have explicit step-by-step process sections. These are the agents that actually run nightly and they are the cleanest in the registry.

**E. Misnamed file.**
`.claude/agents/product-manger.md` (typo, should be `product-manager.md`).

**F. The CLAUDE.md coordinator instruction is not the coordinator agent.**
`CLAUDE.md` repo root describes the artifact-driven workflow but never mentions which agent is the coordinator. `.claude/agents/coordinator.md` and `.claude/agents/meta-coordinator.md` both exist; `.claude/system.md` describes a "Coordinator Agent (system lead)" but is not referenced from `CLAUDE.md`. There is no wiring between the principles in `CLAUDE.md` and the agent that should enforce them.

**Recommendation.**
1. Delete or fully rewrite `competitive-researcher.md` and `meta-coordinator.md` to be Compassion-Benchmark-specific. As-is they are misleading.
2. Merge `competitive-researcher.md` into `market-research.md`, or define a clear seam (e.g., one is web-search-only intelligence, the other does synthesis).
3. Pick one front-matter convention (`description:` is more common in the well-defined agents) and migrate all to it. Add a lint script.
4. Rename `product-manger.md` → `product-manager.md`.
5. Reorganize `.claude/agents/` into:
   - `pipeline/` — the four nightly agents + benchmark-research.
   - `specialists/` — design-time advisory agents.
   - `coordinator/` — coordinator + system.md.
6. Replace `CLAUDE.md` lines describing the coordination model with an explicit link to `.claude/agents/coordinator/coordinator.md`.

**Effort.** 1 day.
**Priority.** Medium. Pipeline agents work today; the cleanup unblocks the next contributor.

---

## World-Class Org Gap Analysis

If a senior infrastructure team owned this repo at, say, Series A:

| What they'd have | What this repo has | Gap |
|---|---|---|
| Typed schema for the JSON data layer (Zod / JSON Schema, validated in CI) | Implicit per-file shapes, three places where scale/casing differ | **Critical** — Finding 2 |
| Single canonical scoring library imported by both site code and pipeline agents | `site/src/lib/scoring.ts` for site; prose conversion in `score-updater.md` for pipeline | **Critical** — Finding 2 |
| One ledger of every score change with `(entity, before, after, evidence_url, reviewer, timestamp, signature)` | Two parallel logs (`APPLIED_CHANGES.md`, `score-update-log.md`), markdown only | **Critical** — Finding 3 |
| Independence policy as a code contract (test + lint rule) | Convention only | **High** — Finding 5 |
| OWNERSHIP.md / CODEOWNERS / file-lifecycle map | None | **Medium** — Finding 4 |
| Pipeline observability: per-night metrics, alerts, run dashboard | `digests/` markdown only; no metric extraction | **Medium** — implied across findings |
| Validated agent registry with defined roles, no Ledgerium leftovers | 24 agents, format drift, domain drift, typo in filename | **Medium** — Finding 6 |
| Build-time validation of all data files | None (no Zod, no Ajv, no validate-indexes invocation in CI for proposals) | **Medium** — Finding 2 |
| `legacy-html/` archived, not at root | At root, easy to mistake for live code | **Low** |
| Onboarding doc separating "what runs nightly" from "what humans edit" | Not present | **Medium** — Finding 4 |

**The 80/20.** Three high-leverage fixes get 80% of the way to world-class:

1. **Canonical schema for index files + canonical scoring library shared by agents and code** (Finding 2). Eliminates the recurring-bug class.
2. **Independence policy as a code contract: split `entities.ts`, add a static check, write `INDEPENDENCE_POLICY.md`** (Finding 5). Earns the right to claim institutional independence.
3. **One ledger, one queue, one structure inside `research/`** (Finding 3). Makes the system teachable to a successor.

The other findings are quality-of-life and operability improvements; they matter for scale but not for correctness today.

---

## Proposed Next 5 Architecture Tickets

In priority order. Each is bounded, implementable, and reversible.

### Ticket 1 — Canonical index schema + shared scoring library
**Rationale.** Two scales (raw 0-5 / scaled 0-100) and one prose-only conversion in `score-updater.md` are the documented source of recurring drift in `research/score-update-log.md` (Batches 7-8). One schema, one converter, one validator.
**Scope.**
- `site/src/data/indexes/_schema.ts` — Zod schema for the canonical `IndexFile` shape.
- `site/src/lib/scoring.ts` — add `rawFromScaled()`, `scaledFromRaw()`, `validateProposal()`.
- `research/scripts/validate-proposal.mjs` — CLI invoked by `score-updater` before write.
- Update `.claude/agents/score-updater.md` and `.claude/agents/overnight-assessor.md` to call the validator instead of converting in prose.
- Build step: `npm run validate-indexes` blocks deploy on schema failure.
**Effort.** 2 days.

### Ticket 2 — Independence policy as a code contract
**Rationale.** The institution's product *is* the credibility of the independence claim. It currently has no code-level enforcement.
**Scope.**
- `INDEPENDENCE_POLICY.md` at repo root — formal statement of the rule, prohibited patterns, disclosure obligations.
- Refactor `site/src/data/entities.ts` `KIND_CONFIG` into separate `INDEX_CONFIG` and `COMMERCE_CONFIG` exports.
- `site/scripts/check-independence.mjs` — CI check that asserts no file in `site/src/data/indexes/` or `research/change-proposals/` imports from `site/src/data/gumroad.ts`. Asserts no `customer`, `payer`, `commercial_relationship` field appears in proposal schemas.
- Quarterly transparency report template at `research/transparency/{YYYY}-Q{N}.md`.
**Effort.** 1 day.

### Ticket 3 — Consolidate `research/` into a teachable structure
**Rationale.** `research/` currently has 17 top-level markdown files mixing contracts, ledgers, working notes, and dated experiments. A successor cannot tell what is durable.
**Scope.**
- Reorganize per Finding 1 recommendation: `contracts/`, `pipeline/`, `pipeline/state/`, `ledger/`, `reviews/`, `working/`.
- Merge `APPLIED_CHANGES.md` into `score-update-log.md`. Keep one ledger.
- Move dated `*_CANDIDATES_*`, `IMPROVEMENT_BACKLOG_*`, `NEWSLETTER_V2/V3` files to `research/working/2026-04/`.
- Add `research/README.md` mapping subfolders to lifecycles.
- Update agent prompts that reference moved paths.
**Effort.** 1 day.

### Ticket 4 — Lifecycle metadata on agent-written files + ownership matrix
**Rationale.** No file in the repo signals "agent-regenerable" vs. "human-curated." This breaks rebases and onboarding.
**Scope.**
- Add `_generated_by` and `_generated_at` keys to every JSON written by a pipeline agent. Validate in build.
- `OWNERSHIP.md` at repo root — table of file path → owner → trigger → consumer.
- `.gitattributes` rules: `latest.json` and `manifest.json` use `merge=ours`.
- Split `.claude/agents/` into `pipeline/` and `specialists/`.
**Effort.** 0.5 day.

### Ticket 5 — Agent registry cleanup
**Rationale.** Two agents reference Ledgerium AI (wrong product). One filename is typoed. Front-matter is inconsistent. This makes the registry hard to reason about and gives wrong advice when invoked.
**Scope.**
- Rewrite or remove `.claude/agents/competitive-researcher.md` and `.claude/agents/meta-coordinator.md` for Compassion Benchmark.
- Rename `product-manger.md` → `product-manager.md`.
- Standardize all front-matter to `description:` + `tools:` + `model:`.
- Define the seam between `competitive-researcher` and `market-research` (or merge).
- Wire `CLAUDE.md` to point at the actual coordinator agent.
**Effort.** 1 day.

---

**Total proposed effort across all 5 tickets: ~5.5 days.**
**Highest-ROI first:** Tickets 1, 2, 3 — these eliminate the documented recurring bug class, encode the institutional differentiator in code, and make the repo teachable. Tickets 4 and 5 are quality-of-life.
