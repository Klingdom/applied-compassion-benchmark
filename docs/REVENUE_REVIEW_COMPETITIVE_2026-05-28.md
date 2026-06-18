# Revenue Review — Competitive / Adjacent Monetization Models (2026-05-28)

> Authored by competitive-researcher. Persisted by coordinator (agent could not self-write).
> Lens: how comparable/adjacent institutions monetize, and which mechanics Compassion Benchmark can adapt without violating independence.

## Part A — Comparable Organizations

| Org | Category | Revenue Model | Key Price Points | Source |
|---|---|---|---|---|
| MSCI ESG | ESG ratings/index | Institutional subscription + index licensing + API | ESG seg ~$380M/yr; entry ~$25K/yr; platform $50K–$200K+/yr; AUM-based index fees | msci.com/data-and-analytics/sustainability-solutions/esg-ratings |
| Sustainalytics | ESG risk ratings | Subscription + corporate self-use license + API | Researcher ~$250–$750/yr; institutional $10K–$80K/yr; report $50–$200 | sustainalytics.com/esg-data |
| CDP | Disclosure/scoring | Free public; licensed packages; subsidized academic/NGO | Academic: cost-based subsidized; commercial custom | cdp.net/en/data-licenses |
| B Lab | Certification + badge | Annual revenue-scaled certification fee granting badge rights | $2,100/yr (<$5M rev) → $52,500/yr ($750M–$1B); est. $48M–$96M/yr total | usca.bcorporation.net/fees |
| Good On You | Ethical brand ratings | Affiliate + brand membership placement + data licensing | No public schedule; affiliate + custom | goodonyou.eco |
| GRI | Standards/framework | Software-vendor licensing + certification fees + membership | Software license custom; cert exam fees | globalreporting.org |
| Statista | Data platform | One-time report + tiered subscription + enterprise API | Report $149–$999; sub $468/yr; enterprise $750–$2,000+/mo | statista.com |
| Axios Pro | Paid research newsletter | Per-vertical subscription + All Access + corporate | $599/yr per vertical; $2,499/yr All Access; $2M ARR @ 3K subs | adweek.com; digiday.com |
| Morningstar | Financial/ESG research | Premium individual + institutional data feed + API | Individual $468/yr; Morningstar Direct ~$22K+/yr | morningstar.com/business/products/data |
| Stanford HAI / WBA | Index institutions | Institutional founding-member partnerships (no score influence) | HAI partners $100K–$500K+/yr; WBA tiered | hai.stanford.edu; worldbenchmarkingalliance.org |
| Ecomate | White-label ESG API | White-label API licensing + reseller | from €30,000/yr | ecomate.eu/en/esg-api-whitelabel |

## Part B — Adaptable Revenue Mechanics (candidates)

### Candidate C-1 — Certification Badge License (revenue-scaled, entity-side)
- **Type:** New-SKU
- **Opportunity:** B Lab earns its primary revenue from entities paying annual, revenue-scaled fees to display a badge ($2,100→$52,500/yr; est. $48–96M/yr). Compassion Benchmark earns $0 entity-side; top-band entities have no licensed way to display their score.
- **Proposed:** "Compassion Benchmark Verified" badge license, eligibility gated solely by score band, fee scaled to entity revenue ($500–$18,000/yr). Score set independently before any commercial relationship; losing the band loses eligibility at renewal.
- **Revenue:** 20 entities y1 @ ~$5K = ~$100K ARR; at 200 entities, $1–5M/yr.
- **Independence:** PASS — eligibility = score band only; cannot buy a score or band change. Must publish full fee table, state non-licensed entities are scored identically, and forbid "Certified by" framing (only "Scored X by").
- Impact 5 · Align 4 · Learning 3 · Confidence 4 · Effort 3 · Risk 3 → **Priority 10**

### Candidate C-2 — Academic / NGO Data License
- **Type:** New-SKU
- **Opportunity:** CDP/Sustainalytics monetize subsidized academic/NGO access (via WRDS etc.). Compassion Benchmark's public JSON is free but informal; researchers have no bulk export, citation framework, or formal channel.
- **Proposed:** Tiered license $500–$3,500/yr (individual researcher → campus-wide; NGO by budget). Grants bulk CSV/JSON export, citation framework, methodology PDF.
- **Revenue:** 15 licenses y1 @ ~$1,500 = ~$22.5K; at 100, ~$150K/yr. Secondary: citations = credibility + SEO backlinks.
- **Independence:** PASS — third-party observers; access/attribution rights only.
- Impact 3 · Align 5 · Learning 4 · Confidence 4 · Effort 2 · Risk 1 → **Priority 13** (note: revenue ceiling modest; high strategic/credibility leverage)

### Candidate C-3 — Media / Publisher Syndication License
- **Type:** New-SKU
- **Opportunity:** MSCI distributes ratings via licensed channels; publishers pay for premium syndication. No license governs editorial reuse of Compassion Benchmark scores today.
- **Proposed:** Press License $1,500–$3,000/yr; Data-Terminal License $6,000–$15,000/yr. Grants attributed display + machine-readable feed.
- **Revenue:** ~$16K y1; at scale $90–150K/yr. Primary value = distribution multiplier feeding institutional demand.
- **Independence:** PASS — passive redistribution of public scores; license forbids cherry-picking and "endorsed by" framing.
- Impact 3 · Align 4 · Learning 3 · Confidence 3 · Effort 3 · Risk 2 → **Priority 8**

### Candidate C-4 — Methodology Integration / Software-Vendor License (GRI model)
- **Type:** New-SKU
- **Opportunity:** GRI licenses its framework to reporting-software vendors. ESG/compliance tools could embed Compassion Benchmark dimension scores.
- **Proposed:** $5,000–$20,000/yr vendor license to display scores / "Powered by Compassion Benchmark Data" mark.
- **Revenue:** $8–16K y1; long (6–18mo) sales cycle; at scale ~$100K/yr.
- **Independence:** PASS.
- Impact 3 · Align 3 · Learning 2 · Confidence 2 · Effort 4 · Risk 2 → **Priority 4**

### Candidate C-5 — Institutional Founding-Member Program (Stanford HAI / WBA model)
- **Type:** New-SKU
- **Opportunity:** HAI/WBA fund operations via institutional partners ($10K–$500K/yr) who get early research access but no findings influence.
- **Proposed:** Research Partner $10K / Data Partner $25K / Strategic Partner $75K+ per year.
- **Revenue:** $30–45K y1; at 10 partners $250–500K/yr.
- **Independence:** CONDITIONAL PASS — highest risk (methodology-consultation tier). Requires strict safeguards: no entity-score requests, public partner list with "Partners do not influence scoring," audit log, removal-without-refund clause.
- Impact 5 · Align 4 · Learning 3 · Confidence 2 · Effort 4 · Risk 4 → **Priority 6**

## Strategic Implications
- **Threat:** ESG incumbents (MSCI, Sustainalytics) expanding into AI-governance scoring could outprice on ACV while matching credibility — 12–18mo window to own AI-Lab/Robotics scoring identity.
- **Threat:** A competitor adopting Good On You's pay-for-placement model would look cheaper to entities; defend the independence moat publicly and proactively.
- **Opportunity:** Badge licensing (B Lab) is the single most scalable mechanic not yet used. Even 1/100th of B Lab scale = $0.5–1M/yr.
- **Opportunity:** Axios Pro ($599/yr, $2M ARR @ 3K subs) validates the Briefing Archive price/packaging ceiling; the existing daily-briefing + Listmonk stack is the distribution layer.

## Scoring-system note (for meta-coordinator)
The penalty term should attach to *score influence*, not to *entity-side revenue* generally — otherwise clean mechanics like the Badge License are systematically under-scored. Consider explicitly weighting Strategic Alignment / Learning Value so low-effort, high-credibility items (Academic License) aren't buried under high-revenue/high-risk ones.
