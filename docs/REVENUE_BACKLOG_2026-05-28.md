# Consolidated Revenue Backlog — 2026-05-28

Consolidated by coordinator from five parallel specialist reviews:
- `REVENUE_REVIEW_PM_2026-05-28.md` (packaging / SKU model)
- `REVENUE_REVIEW_GROWTH_2026-05-28.md` (acquisition / activation / conversion)
- `REVENUE_REVIEW_MARKET_2026-05-28.md` (demand / willingness-to-pay / pricing)
- `REVENUE_REVIEW_COMPETITIVE_2026-05-28.md` (adjacent monetization models)
- `REVENUE_REVIEW_ANALYTICS_2026-05-28.md` (measurement / funnel instrumentation)

Scoring model: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each 1–5).

---

## The convergent finding (read this first)

Three different agents independently produced the **same #1-scored item (16)**: the Monetization V2 engine is ~80% built but it **cannot currently transact and cannot be measured**.

- **Can't transact:** 5 Gumroad URLs are TODO placeholders, `useGumroad=false`, the `ENTITLEMENTS` KV is a placeholder, Worker secrets unprovisioned (QA Report LB-1..LB-5). Live Subscribe/Buy buttons currently lead to broken pages.
- **Can't measure:** UTM/session context is severed at the Gumroad redirect; `purchase_confirmed` may never fire if redirect params aren't configured; Umami may be emitting zero events if the env var is unset.
- **Leaky bucket:** free→paid email capture isn't on the highest-traffic surfaces (briefing pages) and there's no lifecycle sequence converting captured emails to purchases.

**Strategic conclusion:** Do not build new SKUs first. **Ship and instrument the funnel you already built**, then layer the high-ceiling new SKUs (Analyst $999, Badge License) once you can transact and measure.

---

## Ranked backlog (deduped across lenses)

| # | Item | Lens | Type | Score | Who can do it |
|---|------|------|------|-------|---------------|
| 1 | **Clear launch blockers: create 4 Gumroad products, flip `useGumroad`, provision KV + Worker secrets** | Growth/QA | fix | 16 | **Phil** (external) + eng (price labels) |
| 2 | **Verify/define Gumroad post-purchase redirect so `purchase_confirmed` fires** (param contract `product`,`entity`) | Analytics | fix | 16 | eng + Phil (Gumroad config) |
| 3 | **Embed `utm_source`/`campaign`/`content` in checkout URL → store on KV purchase record** (channel attribution from KV alone) | Analytics | fix | 16 | eng |
| 4 | **Free→paid email capture as a launch *precondition*** (ship before/with paid CTAs, not after) | PM | fix | 15 | eng + growth |
| 5 | **Free email opt-in on briefing pages + `/score-watch` + independence-safe success copy** | Growth | fix | 14 | eng |
| 6 | **Free→paid upgrade email sequence** (Listmonk: welcome → day-3 context → day-14 CTA); also mitigates quiet-entity churn | Growth | improvement | 14 | growth (templates) |
| 7 | **Activate Analyst tier ($999/yr, ~25 entities, 2 seats)** — fills the $250→$3,500 gap; ~12.6× Watcher ACV | Market | new-SKU | 14 | PM + eng (KV schema) |
| 8 | **Launch Briefing Archive Day 1 as the free-funnel anchor** (gate at 14d, soft-nudge counter, 7d vs 14d test) | Market/PM | improvement | 14 | eng + growth |
| 9 | **Raise AI Labs + Robotics Snapshot to $249** (Gartner MQ comp $1,495; zero eng) + AI-governance LinkedIn channel | Market | experiment | 13 | Phil (Gumroad) + growth |
| 10 | **Academic / NGO Data License ($500–$3,500/yr)** — low effort, high credibility/citation flywheel | Competitive/PM | new-SKU | 13 | PM + eng (bulk export) |
| 11 | **Verify Umami env var (`NEXT_PUBLIC_UMAMI_WEBSITE_ID`) set in Docker build** — else all client events = 0 | Analytics | fix | 12 | devops |
| 12 | **Quiet-entity annual summary email** (spec the "no movement" renewal email) — protects 65% renewal target | PM | improvement | 13 | PM + eng |
| 13 | **Certification Badge License (revenue-scaled, entity-side)** — highest revenue ceiling ($0.5–5M/yr), 6–12mo horizon | Competitive | new-SKU | 10 | PM + legal (later) |
| 14 | Media / Publisher Syndication License | Competitive | new-SKU | 8 | later |
| 15 | Institutional Founding-Member Program (conditional independence pass) | Competitive | new-SKU | 6 | later |

## Pricing verdicts (from market lens)
- **Watcher $79** — underpriced for professionals; correct as a low-friction acquisition price. Run $59/$79/$99 test.
- **Observer $249** — correctly priced; test $299 after 90 days.
- **Index Snapshot** — AI Labs & Robotics underpriced → raise to **$249**; keep $149 large indexes, $99 US States.
- **Briefing Archive $99** — underpriced vs comps but correct as acquisition anchor; test $149 after 50 subs.
- **Missing product:** Analyst tier (~$999/yr) for the ESG/governance analyst at a small/mid asset manager — the top underserved high-WTP segment.

## Recommended sequencing (3 waves)
- **Wave A — Make it transact & measurable (items 1,2,3,11):** unblock checkout + wire the conversion funnel. Nothing else earns until this is done.
- **Wave B — Stop the leak & convert (items 4,5,6,8):** free capture everywhere + lifecycle sequence + Archive as anchor.
- **Wave C — Raise the ceiling (items 7,9,10,12, then 13):** Analyst tier, snapshot repricing, Academic license, quiet-entity email; design Badge License for a 6–12mo launch.

## Independence check
All ranked items PASS the independence policy. Items 13–15 require explicit safeguards (public fee tables, score-band-only eligibility, "Partners/licensees do not influence scoring" statements, audit logs). The penalty in scoring should attach to *score influence*, not entity-side revenue per se.
