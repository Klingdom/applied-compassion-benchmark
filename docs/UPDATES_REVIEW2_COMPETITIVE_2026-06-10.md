# Updates Review 2 — Competitive / Next-Tier Benchmark (2026-06-10)

> Authored by competitive-researcher. Persisted by coordinator (agent returned content inline).
> Lens: what best-in-class data-journalism + index/benchmark publishers do BEYOND the smart-brevity basics already shipped (Wave A/B). Focus: data viz, accountability ledgers, shareable visuals, follow mechanics.

## Part A — Comparator table (next-tier mechanics)

| Comparator | Next-tier mechanic | Source |
|---|---|---|
| Our World in Data | Embeddable charts w/ copy-citation + archived stable URLs | ourworldindata.org/how-to-embed-charts |
| The Economist (@ECONdailycharts) | One-chart-per-day social PNG; Graphic Detail data open on GitHub | x.com/econdailycharts; github.com/TheEconomist/graphic-detail-data |
| FiveThirtyEight "Checking Our Work" | Public prediction track-record + calibration curves | projects.fivethirtyeight.com/checking-our-work |
| Metaculus / Good Judgment | Forecast accountability, calibration, resolution ledger | metaculus.com; goodjudgment.com |
| Freedom House (FIW) | 50-yr longitudinal timeline + per-entity score history | freedomhouse.org/report/freedom-world/50-Year-Timeline |
| S&P CreditWatch | Formal watch placement w/ hard deadline + trigger conditions | spglobal.com (CreditWatch criteria) |
| World Benchmarking Alliance | Filterable company scoreboard + downloadable data/API | worldbenchmarkingalliance.org/company-scoreboard |
| MSCI ESG | Analyst watchlists + score-change alerts | msci.com/.../esg-ratings |
| Transparency Intl (CPI) | Country profile score trend + peer comparison | transparency.org/en/cpi/2025 |
| Vercel OG / Next.js | Dynamic per-page social card (Satori → PNG) | vercel.com/docs/og-image-generation |

## Part B — Five adaptable next-tier mechanics (scored)

### C-1 — Forward-Trigger Countdown (CreditWatch-style hard-deadline accountability) — Priority 15
`forwardTriggers[]` already carries dated, named predictions (Oracle/June 15, 3M/July 31, EU AI Act/Aug 2, UAE ICJ). Surface as a countdown section + per-entity "Scoring Outlook" panel, color-coded by proximity. No benchmark institution publishes prospective hard-deadline accountability openly — genuine first-mover. UI-only; data exists. Independence: PASS (triggers are documented events, not pay-influenced).
Impact 5 · Align 5 · Learning 3 · Confidence 5 · Effort 2 · Risk 1 → **15**

### C-2 — Score-over-Time Sparkline / "Chart of the Day" — Priority 14
The briefing has **zero visual layer**. Render an inline SVG sparkline (band boundaries + crossings marked) for the lead signal, from the already-generated `site/public/data/history/<slug>.json`. Static-export safe (build-time SVG, no runtime D3). Add copy-embed + copy-citation (OWID model). Biggest gap vs OWID/Economist; enables social-share PNGs. Independence: PASS (downstream render of immutable scored data).
Impact 5 · Align 5 · Learning 4 · Confidence 4 · Effort 3 · Risk 1 → **14**

### C-3 — Dynamic per-briefing OG social card — Priority 12
`/updates/[date]` has OG metadata but no `og:image`. Add an endpoint on the already-deployed Cloudflare Worker (`/og/updates/:date`) rendering a 1200×630 PNG (Satori) from the public briefing JSON (lead entity + band badge + key stat + wordmark); point `og:image` at it. Static-export-safe (external URL). ~2–3× share CTR. Independence: PASS.
Impact 4 · Align 4 · Learning 2 · Confidence 5 · Effort 2 · Risk 1 → **12**

### C-4 — Methodology Track-Record Ledger ("is the scoring working?") — Priority 12
FiveThirtyEight/Metaculus-style public calibration. Build `/methodology/track-record` from historical `forwardTriggers` resolutions + boundary-watch→crossing rates. No benchmark institution audits its own prior calls publicly — credibility moat; reinforces independence (drift becomes visible). Independence: PASS.
Impact 4 · Align 5 · Learning 5 · Confidence 3 · Effort 3 · Risk 2 → **12**

### C-5 — Follow an Entity / sector alerts — Priority 9
Per-entity "Follow" → Worker KV `followers:{slug}` → targeted nightly alert on score change/trigger (distinct from weekly digest). Makes Score-Watch concrete (natural upsell). Independence: CONDITIONAL — requires disclosure "following does not affect score/priority."
Impact 4 · Align 4 · Learning 3 · Confidence 4 · Effort 4 · Risk 2 → **9**

## Strategic note
The top-3 (≥12) require **no new data infrastructure** — every one draws on structures already in the briefing JSON (`forwardTriggers`, `topSignals`, history JSON) or already-deployed infra (Cloudflare Worker). The next tier of value is a presentation/distribution problem, not a data problem. The Forward-Trigger Countdown is the single most differentiated mechanic vs every comparator.

Sources: ourworldindata.org/how-to-embed-charts · x.com/econdailycharts · github.com/TheEconomist/graphic-detail-data · projects.fivethirtyeight.com/checking-our-work · metaculus.com · goodjudgment.com · freedomhouse.org/report/freedom-world/50-Year-Timeline · spglobal.com CreditWatch · worldbenchmarkingalliance.org/company-scoreboard · msci.com esg-ratings · transparency.org/en/cpi/2025 · vercel.com/docs/og-image-generation · nextjs.org/docs (metadata-and-og-images)
