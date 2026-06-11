# /updates + Special Report Pages — Consolidated Improvement Plan (2026-06-11)

Consolidated from four lenses (UX/frontend/knowledge/conversion: `docs/PAGES_REVIEW_*_2026-06-11.md`). Priority surface: the **Special Report pages** (`/updates/special/[slug]`), which had never been reviewed since launch.

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

---

## The convergent finding
The Special Reports are the institution's **best, deepest work** — but the page is **incomplete on every axis** the four lenses examined, and most fixes **reuse primitives we already shipped**:
- **No in-page navigation** for 8–9-section, 14–18-min reads (yet `BriefingJumpNav` is reusable; section anchors already exist). *(UX 14, Knowledge 14)*
- **No data-graphics** — the floor/exemplar reports are *literally about* band distributions and dimension profiles but render them as dense numeric tables. The Wave-G charts are the prime use case. *(Knowledge 14 "highest-leverage", UX 13, Frontend 13)*
- **Total conversion dead-end** — a reader who finishes a deep-dive (the highest-intent moment the site gets) is offered only two faint sitemap links. *(Conversion 16 — the biggest gap)*
- **The two reports don't link to each other** despite being an editor-declared inverse pair; no cross-links to daily briefings/entities. *(Conversion 15, UX 13)*
- **Blank social cards** (`og:image` empty) and **invisible to site search** (no `data-pagefind-body`). *(Frontend)*
- **Schema taught nowhere** — newcomers hit "EQU 1.125" / "Critical ≤20" cold; definitions sit unused in `dimensions.ts`. *(Knowledge 14)*

And the **shared charts serve BOTH surfaces** — build the SVG primitives once, use them on special reports' cohort/dimension content AND on `/updates` score cards.

---

## Ranked backlog

### Wave H1 — Special-report essentials + shared charts (mostly reuse; build first)
| # | Item | Lens(es) | Score | Effort |
|---|------|----------|-------|--------|
| 1 | **End-of-report CTA** — `NewsletterSignup variant="card"` (context-matched preamble) before the footer; the highest-intent, currently-0% moment | Conversion 16 | **16** | Low |
| 2 | **Shared chart primitives** — `BandDistributionBar` + `BandPositionStrip` + `DimensionProfileBar` (hand-rolled SVG, own data, CC-BY); used on special-report cohort/dimension sections AND `/updates` score cards | Knowledge 14 · Frontend 16 · UX 13 | **16** | Low-Med |
| 3 | **Section TOC / in-page nav** on special reports (reuse `BriefingJumpNav` over `bodySections`; anchors already exist) | UX 14 · Knowledge 14 | **14** | Low |
| 4 | **Band-distribution strip above the §2 cohort table** (turns "176 Critical / 23 floor of 1,156" into a picture; reveals the two reports as mirror images) | Knowledge 14 · Frontend 13 | **14** | Low |
| 5 | **Companion + cross-links** — "Read next: the companion analysis" card; report → related daily briefing(s) + entity pages; daily briefing → recent special reports (CompletionBlock panel) | Conversion 15 · UX 13 | **14** | Low |
| 6 | **Pagefind inclusion** for special reports (`data-pagefind-body` — they're currently invisible to site search) | Frontend 13 | **13** | Trivial |
| 7 | **Inline schema legend** (band scale + 8-dimension glossary as a shared `<details>`; defs already in dimensions.ts) reused on reports + `/updates` | Knowledge 14 | **14** | Low |

### Wave H2 — Shareability + depth
| # | Item | Lens(es) | Score |
|---|------|----------|-------|
| 8 | **Per-report OG image** (Satori/resvg build script → blank social cards fixed; also covers daily briefings) | Frontend | 13 |
| 9 | **8-dimension profile bars in the cohort/comparison tables** (carry the "same number, different meaning" thesis visually) | UX 13 · Knowledge 13 | 13 |
| 10 | **`/updates/special` index as a browsable library** + bottom capture; demote the exit link | Conversion 13 · UX | 13 |
| 11 | **"If you remember one thing" anchor** per report | Knowledge 13 | 13 |

### Wave H3 — `/updates` net-new + cleanup
- Wave G charts on `/updates` score cards (band-position + dimension profile) — Frontend DB-1 16 (delivered via #2's shared primitives) · expanded band-shaded trajectory · dead-code cleanup (`DailyBriefing.legacy.tsx`).

## Recommended sequencing
- **Wave H1 first** — it fixes the special reports on every axis the lenses flagged, and most of it **reuses shipped primitives** (BriefingJumpNav, NewsletterSignup, the ScoreSparkline SVG pattern, the `<details>` disclosure). The **shared chart primitives (#2)** are the linchpin — they light up the special reports *and* satisfy the top Wave-G item for `/updates` in one build. Respect Wave E1 density + the link-only evidence-image policy + dead-link discipline + graceful degradation.
- **Wave H2** — OG images (shareability), dimension bars in tables, the index-as-library.
- **Wave H3** — apply the charts across `/updates`, cleanup.

## Independence / integrity
All PASS. The charts are own-data SVG (CC-BY, no third-party imagery — per the evidence-image policy). The CTAs build trust (free weekly cadence, no dark patterns). Cross-links strengthen the evidence→score→analysis traceability.

## Single highest-leverage move
**Build the shared chart primitives (#2) + give the special reports a TOC (#3), a band-distribution strip (#4), an end CTA (#1), and companion/cross-links (#5).** That turns the special reports from a beautiful dead-end wall-of-text into a navigable, visual, converting, interconnected showcase — and the chart primitives simultaneously unlock the top graphics item for `/updates`.
