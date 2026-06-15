# S1 Content Spec — Canonical Vocabulary & Dimension Legend

**Wave:** Simplify-and-Sharpen S1
**Items:** S1.5 (canonical band vocabulary + integration-premium sentence) · S1.1 (dimension legend)
**Type:** Authoring / spec. No site code changed in this doc — exact strings + formats for frontend-engineer.
**Source of truth:** `site/src/data/dimensions.ts` (`DIMENSIONS`, `BAND_DESCS`), `site/src/lib/scoring.ts` (`compositeCore`).
**Independence:** All copy is definitional restatement of existing rules. No new claims, no persuasion, no alarmism. Every band line and the premium sentence are evidence-first and accurate to `scoring.ts`.

---

## 0. Why this spec exists — the divergence map (file evidence)

Band copy and band *ranges* currently exist in **five** different forms. They disagree on wording, on tone (second-person "Your institution…" vs third-person), and on the numeric range boundaries (`20–40` vs `21–40`). This is the comprehension tax S1.5 removes.

| # | Location | Tone | Range style | Notes |
|---|----------|------|-------------|-------|
| 1 | `site/src/data/dimensions.ts` `BAND_DESCS` (L582–593) | 2nd-person ("Your institution is at a critical stage…") | no ranges | Self-assessment voice; wrong for public ranking/entity pages |
| 2 | `site/src/app/methodology/page.tsx` band cards (L462–467) | 3rd-person, terse ("Active harm or fundamental compassionate failure.") | `0–20 / 21–40 / 41–60 / 61–80 / 81–100` | Gap-free but uses `21/41/61/81` lower bounds |
| 3 | `site/src/components/ui/Band.tsx` (L1–24) | label only (renders `{level}` capitalized) | none | Just the word |
| 4 | `site/src/components/charts/ScoreLegend.tsx` `BANDS` (L16–47) | 3rd-person, longer ("…The top 5–8% of assessed entities globally.") | `0–20 / 21–40 / 41–60 / 61–80 / 81–100` | Most reader-friendly but verbose + an unverifiable "top 5–8%" claim |
| 5 | `site/src/components/seo/DefinedTermSetJsonLd.tsx` `SCORE_BANDS` (L25–31) + pulls `BAND_DESCS` for `description` | machine | `0–20 / 20–40 / 40–60 / 60–80 / 80–100` | Ranges disagree with #2/#4; descriptions inherit the 2nd-person `BAND_DESCS` |

Decision: **one canonical band string set (label + range + one-line desc), third-person, evidence-first**, defined once in `dimensions.ts` and consumed everywhere. Drop the unverifiable "top 5–8%" claim (independence: no unsupported statistical claim).

**Range convention (canonical):** lower-inclusive, upper-exclusive except the top band — written for readers as `0–20`, `20–40`, `40–60`, `60–80`, `80–100`. This matches `DefinedTermSetJsonLd` and `entities.ts normalizeBand()` semantics and is the least ambiguous (no `21` gap artifact). Methodology and ScoreLegend must be migrated to this style.

---

## 1. S1.5a — ONE canonical band vocabulary

### The five canonical strings (authoritative)

| Band | Range | Canonical one-line description (≤15 words, 3rd-person, evidence-first) |
|------|-------|------------------------------------------------------------------------|
| **Critical** | 0–20 | Foundational compassion practices are absent or documented active harm is present. |
| **Developing** | 20–40 | Some practices are emerging but remain inconsistent, reactive, or unevenly applied. |
| **Functional** | 40–60 | Core practices exist and meet a basic bar, with significant gaps remaining. |
| **Established** | 60–80 | Practices are systematic, documented, and supported by consistent evidence. |
| **Exemplary** | 80–100 | Practices are independently verified, consistent, and sustained under pressure. |

Each description is a *what the evidence shows* statement, not a verdict on the institution's worth, and not alarmist (Critical says "absent or documented active harm is present" — factual, not "failing/dangerous").

### Implementation-ready source (replace `BAND_DESCS` in `dimensions.ts`)

Introduce a single richer structure so range + label + desc travel together, and keep a back-compat `BAND_DESCS` map so existing imports do not break.

```ts
// site/src/data/dimensions.ts  — replaces the current BAND_DESCS block (L582–593)

export type BandName =
  | "Critical"
  | "Developing"
  | "Functional"
  | "Established"
  | "Exemplary";

export interface BandSpec {
  name: BandName;
  /** Reader-facing range, lower-inclusive / upper-exclusive (top band inclusive). */
  range: string;
  /** Composite lower bound, inclusive. */
  min: number;
  /** Composite upper bound, exclusive (except Exemplary, where 100 is inclusive). */
  max: number;
  /** Single canonical one-line description. 3rd-person, evidence-first, ≤15 words. */
  desc: string;
  /** Theme color (matches Band.tsx / methodology cards). */
  color: string;
}

export const BANDS: BandSpec[] = [
  { name: "Critical",    range: "0–20",   min: 0,  max: 20,  color: "#f87171",
    desc: "Foundational compassion practices are absent or documented active harm is present." },
  { name: "Developing",  range: "20–40",  min: 20, max: 40,  color: "#fb923c",
    desc: "Some practices are emerging but remain inconsistent, reactive, or unevenly applied." },
  { name: "Functional",  range: "40–60",  min: 40, max: 60,  color: "#fcd34d",
    desc: "Core practices exist and meet a basic bar, with significant gaps remaining." },
  { name: "Established", range: "60–80",  min: 60, max: 80,  color: "#86efac",
    desc: "Practices are systematic, documented, and supported by consistent evidence." },
  { name: "Exemplary",   range: "80–100", min: 80, max: 100, color: "#7dd3fc",
    desc: "Practices are independently verified, consistent, and sustained under pressure." },
];

/** Back-compat: name → desc. Existing importers keep working; same strings. */
export const BAND_DESCS: Record<BandName, string> = Object.fromEntries(
  BANDS.map((b) => [b.name, b.desc]),
) as Record<BandName, string>;
```

### Exactly what this supersedes (file-by-file change list for FE)

1. **`site/src/data/dimensions.ts` L582–593** — DELETE the current 2nd-person `BAND_DESCS` object. Replace with the `BANDS` array + derived `BAND_DESCS` above. (Removes "Your institution…" voice entirely.)

2. **`site/src/components/charts/ScoreLegend.tsx` L16–51** — DELETE the local `BANDS` array and the `void BAND_DESCS;` shim. Import `BANDS` from `@/data/dimensions` and map over it (it already has `name`, `range`, `color`, `desc`). This also removes the unverifiable "top 5–8% of assessed entities globally" line (independence fix).

3. **`site/src/app/methodology/page.tsx` L462–467** — DELETE the inline band-card array. Map over imported `BANDS`. Note the migration: current `label` strings (e.g. "Active harm or fundamental compassionate failure.") are replaced by the canonical `desc`; current ranges `21–40 / 41–60 / 61–80 / 81–100` change to `20–40 / 40–60 / 60–80 / 80–100`.

4. **`site/src/components/seo/DefinedTermSetJsonLd.tsx` L25–31, L57–61** — DELETE the local `SCORE_BANDS` array. Import `BANDS`; build each `DefinedTerm` from `b.name`, `b.range`, `b.desc`. This auto-fixes the range disagreement (`20–40` etc.) and stops the JSON-LD from inheriting 2nd-person `BAND_DESCS` text.

5. **`site/src/components/ui/Band.tsx`** — NO copy change (label-only component). Optional enhancement only: it may accept an optional `title` prop fed from `BANDS[i].desc` for a hover gloss; not required for S1.5.

After these edits there is exactly **one** band-vocabulary source.

---

## 2. S1.5b — ONE plain-language "integration premium" sentence

### Accuracy anchor (from `site/src/lib/scoring.ts` L32–69)

- `baseComposite` = average of the 8 dimension scores mapped to 0–100.
- `integrationPremium = hasHarm ? 0 : 10 * consistencyMult * weaknessFactor` (max +10).
- `consistencyMult` rewards low spread across dimensions (1.0× if std dev ≤1.5, down to 0.1×).
- `weaknessFactor` rewards few below-exemplary dimensions.
- `hasHarm` = any dimension exactly 0 → premium becomes **0** (cancelled, not reduced).
- `final = clamp(baseComposite + integrationPremium, 0, 100)`.

So the two teachable truths: (1) **consistency across dimensions earns up to +10**; (2) **any single dimension at zero zeroes the entire bonus.** The sentence below is exact to this.

### Canonical one-liner (≤25 words) — primary

```
The score rewards consistency: being good across all eight dimensions earns up to +10 bonus points, but any single dimension at zero (documented active harm) cancels the bonus entirely.
```
(28 words — if a stricter ≤25 cut is needed, use the variant below.)

```
Consistency is rewarded: strong, even performance across all eight dimensions earns up to +10 points; any dimension at zero (active harm) cancels the bonus.
```
(24 words. **Recommended canonical** — meets ≤25, accurate, plain.)

### One-line expansion for the `<details>` (the deeper rung)

```
The bonus is 10 × a consistency factor (lower variance across dimensions scores higher) × a balance factor (fewer weak dimensions scores higher), so a balanced 70/70 profile can beat a spiky 90/40 one; a single dimension at zero sets the bonus to 0.
```

### Implementation-ready source (define once)

```ts
// site/src/data/dimensions.ts  — append after BANDS

/** Canonical plain-language explainer for the composite integration premium. */
export const INTEGRATION_PREMIUM = {
  /** ≤25-word newcomer sentence. Reuse verbatim wherever the premium is introduced. */
  short:
    "Consistency is rewarded: strong, even performance across all eight dimensions earns up to +10 points; any dimension at zero (active harm) cancels the bonus.",
  /** One-line expansion for the deepest <details> rung. */
  detail:
    "The bonus is 10 × a consistency factor (lower variance across dimensions scores higher) × a balance factor (fewer weak dimensions scores higher), so a balanced 70/70 profile can beat a spiky 90/40 one; a single dimension at zero sets the bonus to 0.",
} as const;
```

### Exactly what this supersedes

1. **`site/src/app/page.tsx` L314–318** — REPLACE "…normalized to a 0–100 scale with an integration adjustment that rewards consistency and penalizes active documented harm." with `INTEGRATION_PREMIUM.short`.
2. **`site/src/components/entity/EntityDetail.tsx` L893–911** — LEAD the composite breakdown with `INTEGRATION_PREMIUM.short` *before* the `base + premium = composite` math line. Keep the live `buildConsistencyCallout` (L295–311) and the std-dev gate `<details>` (L935–965) unchanged — those are the entity-specific numbers, which the canonical sentence sets up.
3. **`site/src/app/methodology/page.tsx`** — where the premium/std-dev gate is introduced, prepend `INTEGRATION_PREMIUM.short`; the existing gate table becomes the deepest rung, optionally captioned with `INTEGRATION_PREMIUM.detail`.

---

## 3. S1.1 — `DimensionLegend` content + format

Goal: make the 8 bare acronym columns (`RankingTable.tsx` headers render raw `{col.label}`, L228–235) legible at a glance without violating Wave E1 density. Two layered surfaces: (a) `<abbr title>` on the header cells (zero added rows), (b) a single compact legend/disclosure strip above the table.

### 3a. The 8 codes → name → ≤6-word meaning (condensed from `dimensions.ts` `desc`)

| Code | Name | ≤6-word meaning (legend) | `title=` tooltip (full, = dimensions.ts `desc`) |
|------|------|--------------------------|--------------------------------------------------|
| AWR | Awareness | Detects suffering before it's named | "Does this entity reliably detect when others are in pain or need — before they name it?" |
| EMP | Empathy | Connects with others' inner experience | "Does this entity genuinely connect with the inner experience of those it serves?" |
| ACT | Action | Turns understanding into real help | "Does compassionate understanding translate into real, proportional, effective help?" |
| EQU | Equity | Distributes care fairly by need | "Is care distributed fairly — especially toward those with greatest need and least power?" |
| BND | Boundaries | Helps sustainably, without creating dependency | "Is helping sustainable, ethical, and autonomy-preserving — not dependency-creating?" |
| ACC | Accountability | Owns failures and makes repair | "Does this entity own its failures, correct course, and make genuine repair?" |
| SYS | Systemic Thinking | Addresses root causes, not symptoms | "Does compassion extend to root causes and structural change — not only symptom relief?" |
| INT | Integrity | Genuine, consistent, non-performative compassion | "Is compassion genuine, consistent, and non-performative — especially when it costs something?" |

Note: `SYS` `name` in `dimensions.ts` is "Systemic Thinking"; legend may abbreviate the visible name to **"Systems"** on the strip for width, but the `<abbr title>` and tooltip use the full name. Keep "Systemic Thinking" in JSON-LD / methodology.

### 3b. Recommended compact format

**Layer 1 — header tooltips (no new rows).** In `RankingTable.tsx`, when a column is a dimension score column, wrap the label in `<abbr>`:

```tsx
// inside the <th> render (RankingTable.tsx ~L228–235), for dimension columns:
<abbr
  title={dimensionFullName}      // e.g. "Awareness — detects suffering before it's named"
  className="no-underline cursor-help"
>
  {col.label}                    // AWR
</abbr>
```
`dimensionFullName` = `${dim.name} — ${legendMeaning}` so hover gives name + the ≤6-word gloss. (UX owns the dotted-underline styling decision.)

**Layer 2 — one-row legend strip above the table (always visible, single line).** Compact, scent-rich, no extra vertical chrome:

```
AWR Awareness · EMP Empathy · ACT Action · EQU Equity · BND Boundaries · ACC Accountability · SYS Systems · INT Integrity
```
Rendered as a single wrap-friendly row of `code + name` pairs (code in the dimension `color`, name in muted text), ≤1–2 lines on mobile. This is the `<DimensionLegend />` component.

**Layer 3 — the band scale, one click away (reuse, do not rebuild).** Place the existing `ScoreLegend` `<details>` ("How to read the scores") directly under the strip. It already renders the 5 bands + 8-dimension glossary; after S1.5 it reads from canonical `BANDS`. Do NOT duplicate band copy into the strip — the strip is dimensions only; bands live in the disclosure. This respects Wave E1 density (one visible line + one collapsed disclosure, not a wall).

**What goes where (density contract):**
- **Table header:** `<abbr title>` only — no visible change, hover reveals meaning.
- **Above table (always visible):** the single-row `DimensionLegend` strip (8 code+name pairs).
- **Expandable (`ScoreLegend` details, closed by default):** full dimension `desc` glossary + the 5 bands with ranges + the integration-premium sentence.

### 3c. Implementation-ready `DimensionLegend` source

```tsx
// site/src/components/index/DimensionLegend.tsx  (new, server component)
import { DIMENSIONS } from "@/data/dimensions";

// ≤6-word legend meanings, keyed by dimension code (single source for tooltips too).
export const DIMENSION_MEANINGS: Record<string, string> = {
  AWR: "Detects suffering before it's named",
  EMP: "Connects with others' inner experience",
  ACT: "Turns understanding into real help",
  EQU: "Distributes care fairly by need",
  BND: "Helps sustainably, without creating dependency",
  ACC: "Owns failures and makes repair",
  SYS: "Addresses root causes, not symptoms",
  INT: "Genuine, consistent, non-performative compassion",
};

// Short visible name override (width). Falls back to dim.name.
const SHORT_NAME: Record<string, string> = { SYS: "Systems" };

export default function DimensionLegend() {
  return (
    <p className="text-[0.8rem] text-muted leading-relaxed flex flex-wrap gap-x-3 gap-y-1 mb-3">
      {DIMENSIONS.map((d, i) => (
        <span key={d.code} className="whitespace-nowrap">
          <abbr
            title={`${d.name} — ${DIMENSION_MEANINGS[d.code]}`}
            className="no-underline font-bold"
            style={{ color: d.color }}
          >
            {d.code}
          </abbr>{" "}
          <span>{SHORT_NAME[d.code] ?? d.name}</span>
          {i < DIMENSIONS.length - 1 && <span className="text-muted-subtle"> ·</span>}
        </span>
      ))}
    </p>
  );
}
```

Place `<DimensionLegend />` then `<ScoreLegend />` immediately above the `<table>` in `RankingTable.tsx` (or render them on each index page just above the table — FE's call; the component is render-once, reuse-everywhere). UX owns final spacing/typography of the strip.

---

## 4. Reuse map — define once, import everywhere

| Canonical string | Defined in | Consumed by |
|------------------|------------|-------------|
| **5 band labels + ranges + descs** (`BANDS`, derived `BAND_DESCS`) | `site/src/data/dimensions.ts` | `components/charts/ScoreLegend.tsx` (band scale); `app/methodology/page.tsx` (band cards); `components/seo/DefinedTermSetJsonLd.tsx` (`DefinedTerm`s); optionally `components/ui/Band.tsx` (hover title); any future `<ScoreBandReference />` |
| **Integration-premium sentence** (`INTEGRATION_PREMIUM.short` / `.detail`) | `site/src/data/dimensions.ts` | `app/page.tsx` (home explainer); `components/entity/EntityDetail.tsx` (composite breakdown lead); `app/methodology/page.tsx` (premium intro) |
| **8 dimension code→name→meaning** (`DIMENSIONS` + `DIMENSION_MEANINGS`) | `dimensions.ts` (codes/names/desc) + `components/index/DimensionLegend.tsx` (≤6-word meanings) | `components/index/DimensionLegend.tsx` (strip + `<abbr title>` source); `components/index/RankingTable.tsx` (header tooltips); reusable on `ScoreLegend` glossary |

**Single source rule:** band copy, the premium sentence, and the dimension meanings each have exactly one definition file. No component re-types these strings. If a `<ScoreBandReference />` primitive is later extracted from `ScoreLegend`'s band section, it reads `BANDS` — never its own copy.

**Independence check (all items):** PASS. Every string restates an existing rule or definition; the only removals are the 2nd-person self-assessment voice and the unverifiable "top 5–8%" claim. Nothing added persuades or alarms.
