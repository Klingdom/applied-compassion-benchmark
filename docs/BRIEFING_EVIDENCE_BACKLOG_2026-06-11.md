# Briefing Evidence & Analysis Expansion — Consolidated Plan (2026-06-11)

Goal: increase the daily briefing's **analysis and data collection** — centered on **verbatim direct quotes from evidence + source URLs** — and surface it on `/updates`. Consolidated by coordinator from six lenses:
- `BRIEFING_EVIDENCE_PIPELINE_2026-06-11.md` (data collection / schema / integrity)
- `BRIEFING_EVIDENCE_PM_2026-06-11.md`, `BRIEFING_EVIDENCE_KNOWLEDGE_2026-06-11.md`, `BRIEFING_EVIDENCE_UX_2026-06-11.md`, `BRIEFING_EVIDENCE_FRONTEND_2026-06-11.md`, `BRIEFING_EVIDENCE_COMPETITIVE_2026-06-11.md`

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

---

## The convergent finding
**The richest evidence already exists in the research pipeline but is discarded before publication.** Assessor change-proposals carry verbatim, attributed quotes inside free-text `key_evidence` strings (e.g. India: *"'several of them turned out to be Indian citizens…'"*), yet the public briefing surfaces only a single `primaryEvidenceUrl` and zero quotes. The `EvidenceLedger` component is built but **data-starved** (it reads `sources[]`/`evidence[]` arrays that the briefing JSON doesn't contain — so it renders nothing). The fix is a **structured evidence atom captured upstream and carried to the page** — which both raises analytical rigor *and* is independence-strengthening (verifiability = the operational form of independence).

## The structured evidence atom (the keystone)
```
EvidenceItem = {
  quote: string,        // VERBATIM, ≤~40 words, exact text from the source
  claim?: string,       // the factual claim it supports
  source: string,       // publisher/author ("OCHA", "Human Rights Watch")
  url: string,          // REQUIRED whenever quote is present
  publishedDate?: string,
  sourceTier?: 1|2|3|4|5,// gov/court/treaty > IO/UN > watchdog NGO > top journalism > trade/advocacy
  archivedUrl?: string  // Wayback snapshot (link-rot resistance)
}
```
Attached as `evidence[]` to: scanner `entity_reviews[]`, assessor change-proposals (replacing free-text `key_evidence`), and the public `topSignals[].evidence[]` + `recentAssessments[].evidence[]`.

## INTEGRITY GUARDS (non-negotiable — this is a fabrication-risk area)
- Every `quote` MUST have a `url` (build-gate ERROR otherwise).
- Quotes are **verbatim and accurately attributed** — never paraphrase-as-quote, never quote-from-memory. Agent-def rule + length ceiling to catch paraphrase-creep.
- Band-crossing / floor proposals require **≥2 distinct sources**, ≥1 at Tier ≥4.
- Every public evidence `url` must trace back to the internal change-proposal record (public surface = projection of an auditable internal record — closes the digest-stage fabrication loophole).

---

## Ranked backlog

### Wave F1 — Capture + enforce (pipeline & schema; the "data collection" core)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 1 | **`EvidenceItem` schema + `evidence[]` on assessor change-proposals** (structured quote+url+source+tier, replacing free-text key_evidence) | Pipeline (C1) | **16** | Low-Med |
| 2 | **Validator integrity guards** in validate-daily-briefings (quote⇒url; verbatim length ceiling; ≥2 sources for crossings; public url traces to internal record) | Pipeline (C2)+Frontend | **15** | Low |
| 3 | **Add `evidence[]` to topSignals + recentAssessments** in DAILY_BRIEFING_SCHEMA + the digest agent carries it from the change-proposal (not just primaryEvidenceUrl) | Pipeline+PM+Frontend | **16/13** | Low-Med |
| 4 | **Scanner/assessor/digest agent-def updates** to capture verbatim quotes + multiple sources + per-evidence dimension attribution + cause→effect chains | Pipeline (C5) | **14** | Med |
| 5 | **Backfill recent briefings' evidence** from existing change-proposal key_evidence (so current briefings show quotes+URLs) | Coordinator | — | Low |

### Wave F2 — Surface it (the `/updates` expansion)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 6 | **Fix the EvidenceLedger** to render (read primaryEvidenceUrl now; then full evidence[]) — it currently shows nothing on rich briefings | Knowledge+Frontend | **16** | Low |
| 7 | **Reusable `<EvidenceQuote>` + named source-chip** (publisher · date ↗, safe rel/target, URL validation); shared primitive across cards | Frontend+UX | 14 | Med |
| 8 | **Named source chips on ScoreMovementCard + LeadSignalCard** (replace the anonymous icon with "Reuters ↗") | UX (#3/#6) | 14 | Low |
| 9 | **Verbatim pull-quote block** on high-severity signals (styled blockquote + attribution) | PM+Knowledge+Competitive | 13 | Med |
| 10 | **Evidence/interpretation separation** ("what the evidence shows" vs "what we concluded") replacing the fake sentence-slice split | Knowledge+PM | 14 | Med |
| 11 | **Expandable "Sources (N)" disclosure** (native `<details>`) + EvidenceLedger quote column | Competitive+Frontend | 14/12 | Low-Med |
| 12 | **Evidence-tier badge** ("Primary source"/"Cross-referenced") + as a scoring-confidence modifier | Competitive | 13 | Med |

### Wave F3 — Depth & durability
- Cause→effect→evidence chain rendering (#6 competitive, 13) · counter-evidence "Room for Disagreement" note (12) · **archived-link (Wayback) capture** for link-rot resistance (12) · per-entity evidence trail (briefing ↔ entity page) · confidence-constraint field ("capped by ICJ unadjudicated").

## Recommended sequencing
1. **Wave F1 first** (the user's explicit ask = data collection): the `EvidenceItem` schema (#1, #3), the **integrity guards** (#2 — must land *with* the schema), the agent-def capture (#4), and a backfill (#5). This is what makes verbatim quotes + URLs *exist* in the briefings.
2. **Wave F2** surfaces it: fix the EvidenceLedger (#6 — cheap, immediate), the `<EvidenceQuote>`/source-chip primitive (#7–#8), pull-quotes (#9), evidence/interpretation separation (#10), Sources(N) (#11). Respect the Wave E1 density discipline — evidence adds value-per-pixel, not bloat.
3. **Wave F3** — depth (cause-chains, counter-evidence) + durability (archived links).

## Independence
All items PASS and most actively **strengthen** independence: verifiable primary sourcing makes "every score traces to a primary source" literally true on the page. The integrity guards (verbatim, url-required, traceable, no fabrication) are the safeguard — this is the one area where a shortcut would be catastrophic to credibility, hence the build-gate enforcement.

## Single highest-leverage move
**Ship the `EvidenceItem` schema + integrity-guard validator + carry evidence[] into the briefing (F1 #1–#3), then fix the EvidenceLedger to render it (F2 #6).** That makes verbatim quotes + linked, tiered sources both *captured* and *visible* — the founder's exact ask — with the fabrication risk locked down at the build gate.
