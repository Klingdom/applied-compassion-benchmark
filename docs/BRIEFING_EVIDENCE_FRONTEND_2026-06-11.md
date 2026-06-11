# Briefing Evidence Frontend — Implementation Candidates
**Date**: 2026-06-11  
**Author**: Frontend Engineer agent  
**Scope**: Evidence rendering on /updates briefing — verbatim quotes + multiple sources per claim

---

## Current Evidence-Infra Health

**Components**: EvidenceLedger, SignalCard, SignalStack, ScoreMovementCard, LeadSignalCard, and the legacy LegacyScoreChangesSection inside DailyBriefing.tsx have distinct, partially overlapping evidence-handling paths. No shared `<EvidenceQuote>` primitive exists; each component re-implements its own source-link pattern (see lines 210–216 in EvidenceLedger.tsx, lines 756–769 in DailyBriefing.tsx, line 250–252 in ScoreMovementCard.tsx, lines 283–294 in EntityEvidenceCard.tsx).

**Schema gap**: `topSignals[]` items have no `sources` or `evidence[]` field in any live briefing. The `EvidenceLedger.extractSourcesFromSignals()` (EvidenceLedger.tsx:79–88) already reads `s.sources[]` from topSignals, but the live JSON does not supply it — the ledger silently stays empty unless `scoreChanges[].evidence[]` or `scoreChanges[].sources[]` are present. `recentAssessments[]` items carry only a single `primaryEvidenceUrl` string (no quote, no multiple sources). The validator (`validate-daily-briefings.mjs`) enforces none of these evidence fields — `sources`, `evidence`, `quote`, and `url` on topSignals or recentAssessments are completely outside the contract.

---

## Scoring Rubric

Each candidate is rated 1–5 on: Impact (user-visible value), Strategic Alignment (independence + credibility brand), Learning Value (diagnostic value for the research process), Confidence (feasibility certainty), Effort (1 = trivial, 5 = large), Risk (1 = safe, 5 = breakage-prone).

**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**

---

## Candidate 1: Add `evidence[]` Array to `topSignals[]` Items (Schema Extension)

**Type**: Schema extension + validator update

**Problem** (`file:line` evidence):
- `EvidenceLedger.tsx:79–88` reads `s.sources[]` from topSignals items, but no live `topSignals[]` item in `2026-06-08.json` (lines 22–111) carries a `sources` or `evidence` field. The ledger is structurally dead for topSignals today.
- `DAILY_BRIEFING_SCHEMA.md:62–72`: the `topSignals[]` item shape lists seven required fields (`title`, `description`, `index`, `slug`, `severity`, `actionRequired`, `actionType`) — no `evidence` or `sources` field exists in the contract.
- `validate-daily-briefings.mjs:160–183`: validates those exact seven fields; any `evidence[]` addition would pass silently unless the validator is updated to enforce it.

**Proposed change**:
Add an optional `evidence[]` field to the `topSignals[]` item shape in `DAILY_BRIEFING_SCHEMA.md` and in the validator. Shape:
```json
"evidence": [
  {
    "quote": "string — verbatim excerpt from the source, ≤280 chars",
    "source": "string — attribution label (e.g. 'UN Fact-Finding Mission, Feb 2026')",
    "url": "string — fully qualified HTTPS URL",
    "date": "string — YYYY-MM-DD, date of source publication"
  }
]
```
Validator rule: if `evidence[]` is present and non-empty, each item must have `url` (valid HTTPS URL). `quote` present without `url` is an ERROR. Zero evidence items is permitted (omit the field entirely).

**Benefit**: Unlocks all downstream rendering work. EvidenceLedger gains real data. Every component that reads topSignals gets access to per-claim verbatim quotes and multi-source attribution without changing the JSON shape for legacy briefings.

**Independence check**: Quotes are verbatim from primary sources (UN, Amnesty, ICJ filings). The field has no commercial meaning. No entity can pay to add or remove evidence items — the overnight digest populates this from the research pipeline.

**Scores**: Impact 4, Strategic Alignment 5, Learning Value 3, Confidence 4, Effort 2, Risk 1  
**Priority**: 4 + 5 + 3 + 4 − 2 − 1 = **13**

---

## Candidate 2: `<EvidenceQuote>` Shared Primitive Component

**Type**: New shared UI component (cheap)

**Problem** (`file:line` evidence):
- `DailyBriefing.tsx:756–769` (LegacyScoreChangesSection evidence rendering): renders source links with inline `<a>` with `target="_blank" rel="noopener noreferrer"` — no `<blockquote>` semantics, no quote text visible, no aria-label pattern.
- `ScoreMovementCard.tsx:244–269`: single `primaryEvidenceUrl` rendered as a 24×24 icon button with `aria-label="Open primary evidence ↗"`. No quote, no source label visible, just an SVG arrow.
- `EvidenceLedger.tsx:210–234`: renders "Open ↗" link with `aria-label={Open source: ${row.domain}}`. No quote surface.
- `EntityEvidenceCard.tsx:283–294`: renders `Source ↗` with `aria-label="Source: ${urlDomain(event.citationUrl)} (opens in new tab)"`.
- None of the four components share an abstraction. All re-implement `target="_blank" rel="noopener noreferrer"` independently.

**Proposed change**:
Create `site/src/components/updates/briefing/EvidenceQuote.tsx` (static, no `"use client"`):
```tsx
interface EvidenceItem {
  quote?: string;        // optional verbatim text
  source?: string;       // attribution label
  url: string;           // required — HTTPS only (validated at schema level)
  date?: string;         // YYYY-MM-DD
}

// Renders a <figure> with optional <blockquote> and a domain chip linking to the source.
// Uses <blockquote> + <cite> semantics when quote is present.
// Falls back to source-chip-only when quote is absent (backward compat).
export default function EvidenceQuote({ item }: { item: EvidenceItem }) { ... }
```
Source chip pattern: domain label + external-link SVG, `rel="noopener noreferrer" target="_blank"`. Chip colors reuse `inferSourceType` logic already in `EvidenceLedger.tsx:11–24`. Inline SVG is already present in EvidenceLedger; extract it to a shared `ExternalLinkIcon` micro-component.

**Benefit**: Eliminates four independent reimplementations. Provides consistent `<blockquote>` semantics (WCAG 1.3.1), `<cite>` attribution, `aria-label` with domain + "(opens in new tab)", and safe `rel`. Static component — zero runtime weight. All four call-sites can be migrated in one pass.

**Independence check**: No commercial copy. Does not surface scores or pricing. The `cite` text comes from the source label, not from any internal judgment about credibility.

**Scores**: Impact 3, Strategic Alignment 4, Learning Value 2, Confidence 5, Effort 2, Risk 1  
**Priority**: 3 + 4 + 2 + 5 − 2 − 1 = **11**

---

## Candidate 3: Render `evidence[]` in `SignalCard` and `LeadSignalCard` (Multi-Source Display)

**Type**: Component update (medium cost)

**Problem** (`file:line` evidence):
- `SignalCard.tsx:79–83`: renders only `signal.description` truncated to first sentence. No source links, no quotes. The component has no path to display evidence even if the schema carries it.
- `LeadSignalCard.tsx:67–71`: splits description into "What happened" (sentences 1–2) and "Why it matters" (sentences 3–4). Zero evidence surface. The lead signal for `2026-06-08.json` (UAE band crossing) cites Conflict Insights Group, Amnesty, Sudan ICJ filing — none of these appear in the rendered card.
- `SignalStack.tsx:80–90`: when building `allSignals`, sectorAlerts are normalized to a flat object — their `sources[]` are dropped (line 82–89). The normalized shape never carries evidence to SignalCard.

**Proposed change**:
After Candidate 1 adds `evidence[]` to the schema and Candidate 2 creates `<EvidenceQuote>`:

`LeadSignalCard.tsx`: add a "Primary sources" row below the "Why it matters" block. Render up to 3 `<EvidenceQuote>` chips (url + optional quote) from `lead.evidence[]`. Gate on `Array.isArray(lead.evidence) && lead.evidence.length > 0`. No layout change for briefings without evidence.

`SignalCard.tsx`: add a compact source-chip row below the summary. Render up to 2 source chips (url + domain label only, no quote expansion — space-constrained grid card). Gate on evidence array presence.

`SignalStack.tsx`: preserve `sources` when normalizing sectorAlerts (line 82–89), mapping them to `evidence[]` shape if they are plain URL strings.

**Benefit**: The lead signal card becomes a complete evidence disclosure for the highest-severity finding of the day. Readers can directly verify the UAE/RSF/UN FFM claim chain from the briefing page without navigating away.

**Independence check**: Verbatim quotes from primary sources reinforce the independence policy — the benchmark's assessment is traceable to named external evidence, not internal judgment.

**Scores**: Impact 4, Strategic Alignment 5, Learning Value 4, Confidence 4, Effort 3, Risk 2  
**Priority**: 4 + 5 + 4 + 4 − 3 − 2 = **12**

---

## Candidate 4: EvidenceLedger — Quote Column + Compact Multi-Source Aggregation

**Type**: Component update (cheap, additive)

**Problem** (`file:line` evidence):
- `EvidenceLedger.tsx:44–53` (`EvidenceRow` interface): has fields `url`, `domain`, `sourceType`, `entity`, `entitySlug?`, `index?`, `dimension?`, `tier?` — but no `quote` and no `date`. The table header (lines 147–179) has five columns: Source, Type, Entity, Dimension, Link. Verbatim quote is nowhere in the current structure.
- `EvidenceLedger.tsx:63–76` (`addUrl`): de-duplicates by URL and extracts domain, source type, entity, dimension — but quote is never extracted even when the source object carries it (lines 84–85 handle `src.url` but not `src.quote`).
- If `topSignals[].evidence[]` items are added (Candidate 1), the existing `addUrl` loop (lines 80–88) will process `src.url` for objects but silently drop `src.quote`.

**Proposed change**:
1. Extend `EvidenceRow` to add `quote?: string` and `sourceDate?: string`.
2. In `addUrl`, pass `quote` and `date` when the source object carries them.
3. In `extractSourcesFromSignals`, extend the topSignals loop (lines 80–88) to read `evidence[]` items (Candidate 1 shape) in addition to the current `sources[]` plain-URL shape.
4. Add a "Quote" column to the table, truncated to 120 chars with a `title` attribute for full text. When empty, render an em-dash. The column is the widest and should be `max-w-[260px]`. Use `<q>` element (inline quotation semantics) not `<blockquote>` (which expects block-level use).
5. The aggregate count in the subtitle already says "N sources linked" — update to "N sources · M with verbatim quotes" when at least one quote is present.

**Benefit**: Makes the Evidence Ledger the single verifiable audit log of the briefing cycle. Readers can see the actual text from the primary source alongside the domain classification, without leaving the page.

**Independence check**: Verbatim excerpts from primary sources. No editorial framing. The quote field is researcher-populated, not entity-supplied.

**Scores**: Impact 3, Strategic Alignment 5, Learning Value 3, Confidence 4, Effort 2, Risk 1  
**Priority**: 3 + 5 + 3 + 4 − 2 − 1 = **12**

---

## Candidate 5: Validator Evidence-Integrity Rules (quote → url enforcement)

**Type**: Build-gate update (cheap, high leverage)

**Problem** (`file:line` evidence):
- `validate-daily-briefings.mjs:150–183`: validates topSignals items for `title`, `description`, `index`, `slug`, `severity`, `actionRequired`, `actionType`. No evidence field is checked at all.
- `validate-daily-briefings.mjs:223–264`: validates recentAssessments items for `entity`, `slug`, `index`, `date`, `published`, `assessed`, `delta`, `status`. `primaryEvidenceUrl` is listed as optional in the schema (`DAILY_BRIEFING_SCHEMA.md:118`) but is never validated for URL format.
- If `evidence[]` is added (Candidate 1), nothing prevents a malformed briefing like `{ "quote": "..." }` (quote with no url) from shipping — silently breaking the `<EvidenceQuote>` render (the component would have a `<blockquote>` with text but an empty/missing `href`).
- `extractDomain` in `utils.ts:49–55` wraps `new URL()` in a try/catch — so a bad URL silently falls back to the raw string. This is appropriate for rendering but not for authoring.

**Proposed change**:
In `validate-daily-briefings.mjs`, add two new rule blocks inside `checkRichContract`:

```js
// Evidence integrity (post-cutoff only, optional field — only validate if present)
for (let i = 0; i < data.topSignals.length; i++) {
  const item = data.topSignals[i];
  if (Array.isArray(item.evidence)) {
    for (let j = 0; j < item.evidence.length; j++) {
      const ev = item.evidence[j];
      // quote present → url must be present
      if (typeof ev.quote === "string" && ev.quote.trim()) {
        if (typeof ev.url !== "string" || !ev.url.startsWith("https://")) {
          violations.push(violation("ERROR", `topSignals[${i}].evidence[${j}].url`,
            "url must be an https:// string when quote is present"));
        }
      }
      // url present → must be valid https
      if (typeof ev.url === "string" && ev.url.trim()) {
        try { new URL(ev.url); } catch {
          violations.push(violation("ERROR", `topSignals[${i}].evidence[${j}].url`,
            "url must be a valid URL"));
        }
        if (!ev.url.startsWith("https://")) {
          violations.push(violation("ERROR", `topSignals[${i}].evidence[${j}].url`,
            "url must use https:// scheme"));
        }
      }
    }
  }
}
```

Apply the same pattern for `recentAssessments[i].primaryEvidenceUrl`: validate it as a valid HTTPS URL when present (currently unchecked despite being in the schema doc).

**Benefit**: Guarantees that any briefing that reaches the build passes the quote→url invariant. Prevents silent broken links and blockquotes with no href. Cheap to implement; high leverage because it runs at build time on every date.

**Independence check**: Structural rule only. Does not evaluate content. Cannot be gamed by an entity.

**Scores**: Impact 3, Strategic Alignment 4, Learning Value 2, Confidence 5, Effort 1, Risk 1  
**Priority**: 3 + 4 + 2 + 5 − 1 − 1 = **12**

---

## Candidate 6: Per-Entity Evidence Trail — Link Briefing Evidence to Entity Page

**Type**: Cross-cutting feature (expensive)

**Problem** (`file:line` evidence):
- `EntityEvidenceCard.tsx:283–294`: renders a single `event.citationUrl` per scored event — no quotes, no multiple sources. The `HistoryEvent` type (`@/types/entity-history`) carries `citationUrl?: string` but not an `evidence[]` array.
- `ScoreMovementCard.tsx:91–94` (`primaryEvidenceUrl`): one URL per recentAssessment row. ScoreMovementCard is the primary entity-linked view inside the briefing; it has no path to multi-source evidence today.
- Entity pages currently link back to briefings via `EntityEvidenceCard` (`event.briefingPath` → `View briefing →`), but the reverse link — briefing evidence → entity page — is only via the entity name link in the signal/assessment row. There is no "evidence anchor" deep-link (e.g. `/updates/2026-06-08#united-arab-emirates`).
- The score-change detail card in DailyBriefing.tsx (LegacyScoreChangesSection, line 531) has per-entity `id={change.slug}` (line 576), so anchor deep-linking already exists for score changes. `recentAssessments` rows in ScoreMovementDashboard do not have per-entity anchors.

**Proposed change** (phased):

Phase A (cheap): Add per-entity `id` anchors to ScoreMovementCard wrapper article (`id={slug}` when slug is present). This costs one line. Entity pages can then deep-link into briefing score-movement rows.

Phase B (medium): Extend `HistoryEvent` in `@/types/entity-history` to carry `evidence?: Array<{quote?:string, source?:string, url:string, date?:string}>`. Populate from briefing JSON in the entity history data layer (`site/scripts/export-public-data.mjs`). Display up to 2 evidence chips in `EntityEvidenceCard` below the headline, using `<EvidenceQuote>` (Candidate 2).

Phase A is cheap and unblocked. Phase B depends on Candidates 1–2 and requires a data-pipeline change — treat as separate work.

**Benefit**: Closes the evidence chain between briefing and entity page. A reader on the UAE entity page can see the Conflict Insights Group + Amnesty + ICJ chain that drove the UAE band crossing — not just a score delta.

**Independence check**: Evidence display only, no score modification. Consistent with the entity evidence retention PRD (`docs/PRD_ENTITY_EVIDENCE_RETENTION.md`).

**Scores**: Impact 4, Strategic Alignment 5, Learning Value 4, Confidence 3, Effort 4, Risk 2  
**Priority**: 4 + 5 + 4 + 3 − 4 − 2 = **10**

---

## Candidate 7: Graceful Degradation for Legacy Briefings Without `evidence[]`

**Type**: Defensive rendering (trivial, zero risk)

**Problem** (`file:line` evidence):
- Legacy briefings (pre-2026-05-26) lack `topSignals[]` entirely. The `EvidenceLedger` already handles this gracefully at line 125 (`if (rows.length === 0) return null`).
- SignalCard, LeadSignalCard, and any new EvidenceQuote render must guard against `evidence` being `undefined`, `null`, or an empty array — JavaScript will not throw, but an unguarded `.map()` on `undefined` crashes the static build.
- `ScoreMovementCard.tsx:91–94`: uses optional-chaining pattern for `primaryEvidenceUrl`; the same `typeof x === "string"` guard is the right pattern. Future evidence array access must mirror this.
- `DailyBriefing.tsx:153–165`: already destructures with `= []` defaults for all array fields. The `evidence[]` addition to topSignals items does not need a top-level default — the item-level guard in components is sufficient.

**Proposed change**:
Document a standard guard pattern in a comment block in `EvidenceLedger.tsx` (or a shared utility) so all future evidence-array access follows the same idiom:
```ts
const evidence = Array.isArray(signal.evidence) ? signal.evidence : [];
```
This is one line per call-site. Apply it in LeadSignalCard, SignalCard, and ScoreMovementCard at the same time those components are updated (Candidate 3). No separate file needed — the pattern is trivial and already implicit in `EvidenceLedger.tsx:59–61`.

Additionally: for `recentAssessments` items without `primaryEvidenceUrl`, the ScoreMovementCard already omits the icon button (line 244: `{primaryEvidenceUrl && ...}`). The same conditional gate covers the multi-source case.

**Benefit**: Prevents static build crashes on legacy briefings. Zero user-visible change. Zero cost.

**Independence check**: Structural only.

**Scores**: Impact 1, Strategic Alignment 2, Learning Value 1, Confidence 5, Effort 1, Risk 1  
**Priority**: 1 + 2 + 1 + 5 − 1 − 1 = **7** (must-do, but as a task bundled with Candidate 3 — not standalone work)

---

## Priority Ranking Summary

| Rank | Candidate | Score | Effort | Type |
|---|---|---|---|---|
| 1 | C1: evidence[] schema extension + validator | 13 | Low | Schema |
| 2 | C3: Render evidence[] in SignalCard + LeadSignalCard | 12 | Medium | Component |
| 2 | C4: EvidenceLedger quote column | 12 | Low | Component |
| 2 | C5: Validator evidence-integrity rules | 12 | Trivial | Build gate |
| 3 | C2: EvidenceQuote shared primitive | 11 | Low | New component |
| 4 | C6: Per-entity evidence trail | 10 | High | Cross-cutting |
| 5 | C7: Graceful degradation guard pattern | 7 | Trivial | Bundle with C3 |

**Recommended sequencing**:
1. C1 (schema + validator stub) — unblocks everything downstream
2. C5 (validator integrity rules) — can be done alongside C1 in the same file
3. C2 (EvidenceQuote primitive) — needed before C3 and C4
4. C4 (EvidenceLedger quote column) — cheapest visible gain
5. C3 (LeadSignalCard + SignalCard evidence rows) — highest user impact, bundles C7
6. C6 Phase A (per-entity anchors) — one-line, anytime
7. C6 Phase B (entity history evidence chain) — separate PR, data-pipeline dependency

---

## Static-Export Safety Note

All proposed components are Server Components (no `"use client"` directive). `EvidenceQuote` must remain a Server Component. The only `"use client"` component in the briefing section is `SignalStack.tsx` (line 1) due to `useState` for filter chips — the evidence chip rows inside `SignalCard` are rendered server-side via the static grid. No hydration or runtime cost is introduced by any of candidates 1–5.

`new URL(url)` for validation in the build-gate validator runs in Node.js (ESM script), not in the browser, so there is no static-export concern.

## Accessibility Notes

- Verbatim quotes must use `<blockquote>` when rendering a full quoted paragraph, or `<q>` for inline quotes within a sentence. `<cite>` wraps the source attribution. These are the correct HTML semantics (WCAG 1.3.1 info and relationships).
- External links must have `aria-label` that includes the domain name and "(opens in new tab)". The existing EvidenceLedger pattern (`aria-label="Open source: ${row.domain} (opens in new tab)"`) is the right model — extend it to EvidenceQuote.
- Do not use `title` attribute as the primary accessibility carrier; use `aria-label` instead.

## Backend Gap Flagged

The evidence fields on `topSignals[]` items are populated by the overnight digest (`worker/src/index.ts` or the research pipeline). The frontend schema and validator changes (Candidates 1, 5) must be coordinated with whoever owns the digest prompt — the digest must output `evidence[]` items with real verbatim quotes and URLs for the frontend work to have live data. This is the blocking dependency for Candidates 3 and 4.
