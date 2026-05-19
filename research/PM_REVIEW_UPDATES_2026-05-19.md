# PM Review — Updates Page Content Strategy
Date: 2026-05-19
Author: PM Agent

---

## PART 1 — DAILY OPENING QUESTION

### 1. Schema Spec

```ts
dailyOpeningQuestion: {
  text: string                  // The question itself. One sentence. Interrogative.
  themes: string[]              // 2–4 thematic labels drawn from digest section headers
                                // (e.g., "methodology boundary", "reform arc", "conflict conduct").
                                // Used downstream for tag display and search indexing.
  tiedToEntities: string[]      // Slugs of entities directly named or implicated in the question.
                                // Drives entity-page cross-links and Score-Watch alert copy.
  forwardResolutionDate: string | null  // ISO date (YYYY-MM-DD) when the question can be answered,
                                        // if a specific event is known (e.g., summit, vote, deadline).
                                        // null if resolution is open-ended.
  eveningResolution: string | null      // Populated the following cycle. One sentence stating
                                        // what actually happened. Closes the loop for readers
                                        // who return the next day. null until populated.
}
```

**Field justifications:**

- `text` is the only reader-facing field. It must stand alone without the other fields being visible.
- `themes` lets the briefing system surface the question next to thematically related sections — the question should feel earned by what follows, not floating above it.
- `tiedToEntities` is load-bearing for two systems: the Score-Watch alert pipeline (a subscriber watching China should see the question in their alert) and entity-page cross-links.
- `forwardResolutionDate` makes the question falsifiable. If there is no known resolution date, the question is asking about an open evidence arc, which is a valid state — but must be flagged as such.
- `eveningResolution` closes the epistemic loop. Without it, the question is rhetorical. With it, the briefing becomes a daily record of what was uncertain and what resolved.

---

### 2. Three Editorial Patterns with Worked Examples

**Pattern A — Tension between two entities under similar pressure**

Frame: Two entities face structurally similar evidence; one has been scored and one has not (or they are scored differently). The question asks whether the methodology applies symmetrically.

> "Russia struck a Chinese-owned vessel the day before Putin's Beijing arrival, and China's public posture has been to absorb the strike without protest — does a state's silence in response to direct harm from an allied belligerent constitute an INT-dimension signal, and if so, does it apply to China the same way it would to a neutral third party?"

Entities: `china`, `russia`
Themes: ["conflict conduct", "INT dimension", "methodology symmetry"]
forwardResolutionDate: "2026-05-20"

**Pattern B — Test-of-methodology question raised by an emerging conduct category**

Frame: A new conduct category was generated this cycle. The question surfaces the methodological decision the category forces without editorializing about which answer is correct.

> "When an external accountability body (the EU) formally designates a state's commercial entities for supplying dual-use goods to a war-crimes-committing belligerent, does that external determination flow to the state's BND dimension score — or does it require a formalized methodology category before it can anchor a band crossing?"

Entities: `china`
Themes: ["methodology boundary", "BND dimension", "external accountability"]
forwardResolutionDate: null

**Pattern C — Boundary-watch question that asks "what should resolve this?"**

Frame: An entity is within scoring distance of a band boundary. A specific, falsifiable event is approaching. The question names what evidence would resolve the uncertainty.

> "Hungary has committed — in writing, with a specific date — to submitting a rule-of-law reform plan by approximately May 27 and passing legislation before May 31: is an institutional pledge, absent enacted law, sufficient evidence to cross the Functional threshold, or does the translation-from-promise test hold the score at 41.4 until the legislative window closes?"

Entities: `hungary`
Themes: ["reform arc", "boundary watch", "translation-from-promise"]
forwardResolutionDate: "2026-05-31"

---

### 3. Style Guide

**Max length:** 55 words for `text`. If the question exceeds 55 words it contains two questions — split or cut.

**Voice:** Interrogative throughout. Never declarative-then-interrogative ("X happened. Will Y follow?"). The question must stand on its own as a genuine open question, not a rhetorical one with an implied answer.

**Required elements:**
- At least one proper noun (entity name, institution name, or event name)
- One methodological reference (dimension name, category name, or threshold)
- One verb that implies observable outcome ("constitute", "flow to", "hold", "resolve")

**Prohibited phrasings:**
- "Is [entity] doing enough?" — evaluative, not methodological
- "Will [entity] survive?" — speculative without evidence basis
- Any phrasing implying the answer is known ("reveals", "confirms", "proves")
- Editorializing adjectives ("alarming", "unprecedented", "concerning")
- Questions that only a domain expert can parse — must be readable without knowing what BND stands for (use "boundary accountability dimension" in parentheses on first use if needed)

**When to use proper nouns vs. abstractions:** Use proper nouns when the question is specific to tonight's evidence. Use abstractions (e.g., "a state", "an external body") only when the question is testing a methodology principle that recurs across entities. Pattern B is the only pattern that permits abstractions as primary subjects.

---

### 4. Prompt Fragment for Overnight-Digest Agent

Add the following to the digest agent's system instructions, in the section that governs output structure:

---

```
## Daily Opening Question (required output field)

After completing all assessments, produce one `dailyOpeningQuestion` object. This object sets the interpretive frame for the entire briefing. It must be generated last, after all score movements and findings are known.

Rules:
1. The question must be specific to tonight's findings — it cannot be a generic or rotating question.
2. Choose the question pattern that best fits tonight's highest-stakes finding:
   - TENSION: Two entities share a structural condition but have received different treatment. Ask whether the methodology applies symmetrically.
   - METHODOLOGY: A new conduct category was generated tonight. Ask what evidence threshold would formalize it or whether tonight's anchor is sufficient.
   - BOUNDARY-WATCH: An entity is within 2pt of a band boundary with a specific forward event known. Ask exactly what evidence should move the score.
3. The question must name at least one entity slug, one dimension or methodology concept, and one observable event or outcome.
4. The question must be answerable in the next 1–7 days, OR explicitly marked as open-ended by setting forwardResolutionDate to null.
5. Do not assert an answer. Do not use evaluative language. Do not exceed 55 words.

Output format:
{
  "dailyOpeningQuestion": {
    "text": "<one interrogative sentence, ≤55 words>",
    "themes": ["<2–4 thematic labels>"],
    "tiedToEntities": ["<slug>", ...],
    "forwardResolutionDate": "<YYYY-MM-DD or null>",
    "eveningResolution": null
  }
}
```

---

## PART 2 — SCORE MOVEMENT CARD ENRICHMENT

### 1. Field-by-Field Analysis

The current card is a data label, not a research note. It tells you *that* something moved, not *why* it moved or *what it means*. The gap is three things: causation (why), proximity (how close to the next threshold), and trajectory (is this part of a pattern?).

### 2. Field Tiers

**P0 — Must add (card becomes a mini-research note)**

| Field | Description |
|-------|-------------|
| `dominantDimension` | Which of the 8 dimensions drove the movement (e.g., "BND"). One token. |
| `whyHeadline` | One sentence (≤18 words) stating the primary cause of movement or confirmation. No editorializing. |
| `primaryEvidenceUrl` | Single URL to the primary source cited in the proposal. Renders as a 1-tap "Source" link. |

**P1 — Should add (card earns section promotion)**

| Field | Description |
|-------|-------------|
| `distanceToBoundary` | Points to nearest band boundary (up or down), with direction. e.g., "+0.4 to Functional" |
| `nextForwardSignal` | Brief label of the next expected event and its date. e.g., "Xi-Putin joint statement — May 20" |
| `compositeSparkline` | Array of last 3–5 assessed composite scores with dates. Renders as a micro-line. |

**P2 — Nice to have**

| Field | Description |
|-------|-------------|
| `methodologyCategory` | Slug of new or applied methodology category, if any |
| `confidenceTrend` | Direction of confidence across last 3 assessments ("improving", "stable", "declining") |
| `resolutionCondition` | One sentence: what evidence would change the score next cycle |

### 3. Field Source Mapping

| Field | Source | New data required? |
|-------|--------|--------------------|
| `dominantDimension` | `change-proposals/<slug>.json` → dimensional delta comparison | No — derivable from existing dimensional scores |
| `whyHeadline` | `research/digests/<date>.md` → Significant Findings narrative | YES — digest agent must produce this as a structured field, not just prose |
| `primaryEvidenceUrl` | `change-proposals/<slug>.json` → `sources[0]` | No — already present in proposal schema |
| `distanceToBoundary` | `change-proposals/<slug>.json` → `proposed_scores.composite` + band table | No — computable from existing data |
| `nextForwardSignal` | `research/digests/<date>.md` → Emerging Risks section | YES — must be structured as `{label: string, date: string | null}` not prose |
| `compositeSparkline` | `public/data/scores/<slug>.json` (generated by export-public-data.mjs) | Partial — current per-entity files contain current score only; needs historical composite array added |
| `methodologyCategory` | `change-proposals/<slug>.json` → key_evidence or new field | YES — category slug is embedded in prose, not a discrete field |
| `confidenceTrend` | `change-proposals/<slug>-<date>.json` history files | No — computable from history/ directory |
| `resolutionCondition` | `research/digests/<date>.md` → Emerging Risks | YES — must be structured field |

**Flags:** Three fields require new structured output from the digest agent (`whyHeadline`, `nextForwardSignal`, `resolutionCondition`). The sparkline requires a backward-compatible schema addition to `public/data/scores/<slug>.json`. These are the blocking items for P1 and P2.

### 4. Per-Card Data Contract

Final schema each card needs from the digest's `recentAssessments[]` array:

```ts
{
  // Existing (keep)
  entity: string
  slug: string
  index: string
  publishedScore: number | null
  assessedScore: number | null
  delta: number
  band: string
  confidence: string
  status: string
  bandCrossing: boolean

  // P0 additions (new — digest agent must produce)
  dominantDimension: string           // e.g., "BND"
  whyHeadline: string                 // ≤18 words, no editorializing
  primaryEvidenceUrl: string | null   // sources[0] from change-proposal

  // P1 additions
  distanceToBoundary: {
    points: number                    // absolute distance
    direction: "up" | "down"
    targetBand: string
  } | null
  nextForwardSignal: {
    label: string
    date: string | null               // ISO date or null
  } | null
  compositeSparkline: {
    date: string
    composite: number
  }[]                                 // last 3–5 cycles, chronological

  // P2 additions
  methodologyCategory: string | null  // slug of new/applied category
  confidenceTrend: "improving" | "stable" | "declining" | null
  resolutionCondition: string | null  // ≤20 words
}
```

---

## PART 3 — POSITIONING DECISION

**Recommendation: Move Score Movements to after Score Change Detail, with P0+P1 implemented.**

Rationale:

The current card is too thin to earn prominent placement. Raw numbers without causation, proximity, or trajectory are lookup data — appropriate near the bottom. But the section's editorial potential is high: boundary cases, methodology firsts, and confirmation patterns are the most machine-readable evidence of whether the benchmark is working. They deserve to be read, not scrolled past.

P0 alone (`dominantDimension`, `whyHeadline`, `primaryEvidenceUrl`) transforms the card from a data label into a one-paragraph research note. A reader can now understand what moved and why in under ten seconds. That earns the section a position above the fold.

P1 (`distanceToBoundary`, `nextForwardSignal`, `sparkline`) makes each card forward-looking, not just backward-looking. Given that this briefing now opens with a daily question about what should resolve, cards that show distance to boundary and the next signal date complete the loop — the reader can see which cards are the answer candidates for the opening question.

P2 fields are analytically useful but not reader-facing at the card level. Defer to the full Score Change Detail card.

**Do not promote to above Score Change Detail.** Score Change Detail carries the entities with formal apply=true decisions — those are higher-stakes and higher-confidence. Score Movements includes confirmations and sub-threshold items. The hierarchy (Change Detail above Movement) matches the editorial hierarchy (decided above monitored).

**Implementation gate:** P0 is blocked only by the digest agent producing `whyHeadline` as a structured field and `primaryEvidenceUrl` from the existing `sources[0]` in change proposals. `dominantDimension` is derivable from existing dimensional scores without agent changes. P0 can ship in one cycle once the digest agent prompt is updated.
