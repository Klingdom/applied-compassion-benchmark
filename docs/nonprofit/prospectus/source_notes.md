# Source Notes — Compassion Benchmark Funder Prospectus

**Purpose:** Single source of truth for the manuscript authors of the flagship funder prospectus. A structured digest of the useful facts, claims, numbers, frameworks, governance decisions, and funding logic drawn from the repository's source materials. Each item cites its source file. Status flags: **[BUILT]** = already operational; **[PLANNED]** = specified/intended but not yet implemented; **[ASPIRATIONAL]** = a stated ambition or future-state framing, not a present reality.

> **Authoring rule:** Do not copy source prose mechanically. Treat everything below as evidence and raw material. Where two sources disagree on a number, the discrepancies are flagged in §0 — resolve to the values marked canonical.

---

## 0. CRITICAL NUMBERS & DISCREPANCIES TO RESOLVE FIRST

The most important reconciliation for the manuscript: **the live catalog has grown past the figure the nonprofit/grant documents still cite.**

| Fact | Canonical value (use this) | Conflicting value in sources | Source of truth |
|---|---|---|---|
| **Total scored entities** | **1,256** | Nonprofit docs (ORGANIZATION_PLAN, GRANT_MODEL, both research docs) repeatedly say **1,155** | `site/src/data/entityCount.ts` computes the sum live from the 8 index JSONs; verified sum below |
| Fortune 500 index | **448** | CLAUDE.md says 447 | `site/src/data/indexes/fortune-500.json` meta.entityCount = 448 |
| Universities index | **100** | Not present in CLAUDE.md "Data notes" or nonprofit docs at all | `universities.json` meta = 100; added June 2026 |
| Composite formula base | base = `((mean of 8 dimension scores − 1) / 4) × 100` | legacy methodology.html says "base total out of 80" | `scoring.ts` / `scoring.mjs` (METHODOLOGY_VERSION v1.2); methodology-v1.2-additions.md |
| Integration premium cap | **+10** (`10 × consistencyMult × weaknessFactor`) | legacy methodology.html says "up to 20 additional points" | dimensions.ts `INTEGRATION_PREMIUM`; methodology-v1.2-additions.md |
| Band boundaries | Critical 0–20, Developing 20–40, Functional 40–60, Established 60–80, Exemplary 80–100 | legacy methodology.html uses 0–20 / 21–40 / 41–60 / 61–80 / 81–100 | dimensions.ts `BANDS` (canonical) |

**Verified live entity counts (from each index JSON `meta.entityCount`, confirmed 2026-06):**

| Index | Count | Title (from meta) |
|---|---|---|
| Countries | 193 | World Countries Index 2026 |
| Fortune 500 (companies) | 448 | Fortune 500 Index 2026 |
| Global Cities | 250 | Top 250 Cities Index 2026 |
| AI Labs | 50 | Top 50 AI Companies Index 2026 |
| Robotics Labs | 50 | Humanoid Robotics Labs Index 2026 |
| US States | 21 | United States Index 2026 |
| US Cities | 144 | (Top 150) US Cities Index 2026 |
| Universities | 100 | Top 100 Universities Index 2026 |
| **TOTAL SCORED** | **1,256** | — |

- **SCORED (1,256)** = citable "how many entities the benchmark scores/ranks/indexes/monitors." **SCANNED (~1,260)** = nightly scanner's slightly broader coverage; use only where copy literally says "scanned." (`entityCount.ts` header).
- Note: `entityCount.ts` has a *stale comment* showing `"1,156"` in one line; the live computed value is 1,256. Ignore the stale comment.
- **Decision for authors:** Cite **1,256** as the current scored-entity count throughout the prospectus. Where quoting the grant strategy verbatim, you may note the grant docs were written at the 1,155 baseline. (Source coverage: `entityCount.ts`, all 8 `indexes/*.json`, CLAUDE.md data notes.)

---

## 1. MISSION & PROBLEM

**What it is (one-line identity, reused in every grant application):** "Compassion Benchmark is an independent, AI-native benchmark institution that measures how [1,256] institutions recognize, respond to, and reduce suffering — and makes the scores public." (GRANT_MODEL.md §4.1; FUNDER_LANDSCAPE §3.2)

**Mission:** "Compassion Benchmark measures how institutions recognize, respond to, and reduce suffering — and makes the scores public." (ORGANIZATION_PLAN.md §2)

**Vision:** "A world in which the treatment of human suffering by governments, corporations, AI laboratories, robotics labs, and other institutions is measurably, comparably, and publicly accountable." (ORGANIZATION_PLAN.md §2)

**The problem / need statement (core):** There is no independent, comparable, standardized measurement system for how major institutions treat human suffering. Existing accountability indices (ESG ratings, human-rights rankings, AI ethics scorecards) are narrow, siloed, capturable by the rated entities, or paywalled. AI and robotics labs — among the most consequential actors of the decade — face virtually no standardized external accountability scoring on these dimensions. Result: institutions manage reputational optics without measurable accountability, and no shared vocabulary exists for comparing institutional behavior across sectors. (ORGANIZATION_PLAN.md §3; GRANT_MODEL.md §2; FUNDER_LANDSCAPE §3.2)

**Framing modules for the problem (swap per audience) (GRANT_MODEL.md §4 Section 2):**
- *Safety framing (SFF/LTFF/Schmidt):* AI/robotics labs operate without a standardized, independent external measure of how they treat human welfare — a gap in oversight infrastructure for transformative AI at the moment it's most needed.
- *Accountability/democracy framing (Knight/Mozilla):* institutional accountability for human-welfare outcomes is measured inconsistently, weakening civil-society oversight of governments, corporations, and AI labs that shape conditions for billions.
- *Data-public-good framing (Sloan/McGovern):* there is no public-domain, reproducible, cross-sector measurement standard for institutional treatment of suffering.

**Where the org sits in the funding landscape:** at the intersection of (a) AI governance & safety, (b) institutional accountability/transparency/public-interest tech, (c) data & measurement public goods, (d) human-rights/wellbeing/suffering-reduction measurement. Fits "governance & rights" and "accountability" buckets most cleanly, secondary claim on "safety" and "data public goods." (FUNDER_LANDSCAPE §0)

---

## 2. THE STANDARD — 8 DIMENSIONS / 40 SUBDIMENSIONS

**Source of truth:** `site/src/data/dimensions.ts` (canonical, used by the live site and pipeline). The legacy `methodology.html` and the daily-pipeline `benchmark-research` agent use the same 8×5 structure. Each subdimension is scored 0–5 on a behavioral-anchor scale (5 anchors per subdimension in dimensions.ts represent the 1→5 levels; 0 = active harm is a separate floor).

**One-line dimension definitions (legacy methodology.html "Framework overview" + dimensions.ts longDesc):**
- **Awareness** — reliably detects suffering before it has to be formally named.
- **Empathy** — genuinely models and honors the inner experience of affected people.
- **Action** — turns compassionate understanding into timely, effective, adequately resourced help.
- **Equity** — extends care fairly, accessibly, in proportion to need.
- **Boundaries** — keeps help ethical, sustainable, consent-based, autonomy-preserving (not dependency-creating).
- **Accountability** — acknowledges harm, corrects course, learns, repairs.
- **Systemic Thinking** — addresses root causes, second-order effects, structural conditions.
- **Integrity** — compassion is genuine, consistent under pressure, resilient over time.

**The complete 8 dimensions × 40 subdimensions (codes + names + assessment question, from dimensions.ts):**

**1. AWR — Awareness** (color #7dd3fc): *Does this entity reliably detect when others are in pain or need — before they name it?*
- A1 Suffering Detection — detects when the people it serves are in distress or need.
- A2 Contextual Sensitivity — adjusts awareness based on who it is actually serving.
- A3 Blind Spot Mitigation — actively seeks to discover the suffering it is currently missing.
- A4 Signal Amplification — makes visible the concerns of those who cannot easily speak for themselves.
- A5 Anticipatory Awareness — foresees potential harms before they manifest.

**2. EMP — Empathy** (#c084fc): *Does this entity genuinely connect with the inner experience of those it serves?*
- E1 Affective Resonance — people feel genuinely cared about, not just processed.
- E2 Perspective-Taking — models the inner experience of those it serves.
- E3 Non-Judgment — suspends judgment across identity/belief differences, under pressure.
- E4 Validation — affirms the legitimacy of others' experiences, especially when inconvenient.
- E5 Cultural Empathy — extends genuine empathy across cultural difference.

**3. ACT — Action** (#86efac): *Does compassionate understanding translate into real, proportional, effective help?*
- AC1 Responsiveness — identified needs get timely, appropriately prioritized responses.
- AC2 Proportionality — help is calibrated to actual need, not to what is easiest.
- AC3 Efficacy — the help actually works (vs. activity that looks like help).
- AC4 Resource Mobilization — brings genuinely adequate resources to bear.
- AC5 Follow-Through — persists rather than disengaging when attention moves on.

**4. EQU — Equity** (#fcd34d): *Is care distributed fairly — especially toward those with greatest need and least power?*
- EQ1 Universality — extends care to all people regardless of identity.
- EQ2 Priority for Vulnerable — prioritizes greatest need when resources are constrained.
- EQ3 Bias Awareness — actively identifies and corrects biases in who receives care.
- EQ4 Access Design — services genuinely accessible to those who need them most.
- EQ5 Historical Harm Acknowledgment — recognizes and takes responsibility for historical harms.

**5. BND — Boundaries** (#fb923c): *Is helping sustainable, ethical, and autonomy-preserving — not dependency-creating?*
- B1 Self-Sustainability — compassionate work comes from a stable, non-depleting foundation.
- B2 Autonomy Preservation — help builds capacity rather than creating dependency.
- B3 Scope Clarity — communicates honestly about what it can and cannot do.
- B4 Refusal Ethics — when it cannot help, declines with dignity and provides alternatives.
- B5 Consent Orientation — obtains genuine informed consent.

**6. ACC — Accountability** (#f472b6): *Does this entity own its failures, correct course, and make genuine repair?*
- AB1 Harm Acknowledgment — acknowledges harm without deflection.
- AB2 Correction Willingness — changes course when shown it is causing harm.
- AB3 Transparency — genuine transparency about performance and failures.
- AB4 Systemic Learning — institutionally learns from failures.
- AB5 Reparative Action — makes concrete repair to those it has harmed.

**7. SYS — Systemic Thinking** (#34d399): *Does compassion extend to root causes and structural change — not only symptom relief?*
- S1 Root Cause Orientation — addresses causes of suffering, not only symptoms.
- S2 Long-Term Impact — plans for and measures long-horizon effects.
- S3 Interconnection Awareness — understands how its actions affect adjacent systems.
- S4 Structural Critique — critically examines structures that perpetuate the suffering it addresses.
- S5 Coalitional Compassion — collaborates to amplify impact beyond its own capacity.

**8. INT — Integrity** (#a78bfa): *Is compassion genuine, consistent, and non-performative — especially when it costs something?*
- I1 Consistency Under Pressure — compassionate behavior holds when it is costly.
- I2 Non-Performance — compassion is genuine rather than reputationally driven.
- I3 Internal Consistency — treats internal stakeholders with the same compassion as external ones.
- I4 Values Alignment — decisions consistently aligned with stated values.
- I5 Resilience of Care — compassion persists across leadership change and institutional stress.

**Cross-sector adaptation:** the same 8/40 conceptual structure is preserved across sectors; what changes by entity type is the evidence model and assessment protocol, not the definition of compassion. (methodology.html "Framework overview"; methodology-v1.2 §2a)

---

## 3. SCORING (0–100), BANDS & EVIDENCE HIERARCHY

**Composite math (canonical, v1.2 — `scoring.ts`/`scoring.mjs`, methodology-v1.2-additions.md):**
- Each subdimension scored 0–5 on anchored behavioral scale; the five subdimensions roll up to a dimension score.
- **Base composite = `((mean of the 8 dimension scores − 1) / 4) × 100`.** When every dimension sits at the lowest anchor (1.0), base composite = 0; clamped to 0–100.
- **Integration premium (up to +10) = `10 × consistencyMult × weaknessFactor`:**
  - *Consistency factor* (std. dev. across 8 dimensions): ≤1.5 → 1.0; ≤3.0 → 0.75; ≤5.0 → 0.4; >5.0 → 0.1.
  - *Balance/weakness factor*: −0.2 for each dimension scoring below 4.0 (exemplary threshold), floor 0.
  - **Harm flag:** any single dimension at exactly 0 sets the premium to 0 (active documented harm cancels the consistency reward).
- Effect: a balanced 70/70-style profile can out-earn a spiky 90/40 profile — rewards even, sustained performance. (dimensions.ts `INTEGRATION_PREMIUM.short`/`.detail`)
- **One canonical formula, two enforced mirrors** (`compositeCore` consumed by site runtime + pipeline scripts; determinism test suite is the drift gate) — every published composite is reconstructible from its 8 dimension scores. (methodology-v1.2 §1)
- ⚠️ **Legacy discrepancy:** methodology.html still describes "base out of 80 + up to +20 premium." Outdated — use v1.2 above. (see §0)

**Subdimension anchors (0–5) (methodology.html "Rubric anchors"):**
- 0 Active Harm — specific documented harm; lead-assessor co-sign required.
- 1 Absent — no meaningful capacity.
- 2 Minimal — nominal capacity, fails under pressure.
- 3 Developing — good-faith capacity in some cases, not consistent.
- 4 Established — consistent operational capacity across most cases; community confirms.
- 5 Exemplary — outstanding, independently verified, sustained under significant pressure.

**Five public bands (dimensions.ts `BANDS`, canonical):**
- **Critical 0–20** — foundational compassion practices absent or documented active harm present (color #f87171).
- **Developing 20–40** — some practices emerging but inconsistent, reactive, or unevenly applied (#fb923c).
- **Functional 40–60** — core practices exist and meet a basic bar, with significant gaps remaining (#fcd34d).
- **Established 60–80** — practices systematic, documented, supported by consistent evidence (#86efac).
- **Exemplary 80–100** — practices independently verified, consistent, sustained under pressure (#7dd3fc).

**Evidence hierarchy — 5 tiers, "strong scores require stronger evidence" (methodology.html "Evidence hierarchy"; used as source-tier 1–5 in pipeline change proposals):**
- **Tier 1 (highest):** Independent external audit — third-party assessments, regulatory findings, academic studies.
- **Tier 2:** Verifiable outcome data — disaggregated service data, longitudinal surveys, resolution rates.
- **Tier 3:** Community testimony — affected populations, independent focus groups, structured interviews.
- **Tier 4 (moderate):** Policy and process documents — governing documents, training records, budget allocations.
- **Tier 5 (lowest):** Entity self-report — mission statements, annual reports; require corroboration.
- **Interpretation rule — "Evidence beats aspiration":** where paper claims and lived experience diverge, score the world as encountered, not the story as presented.

---

## 4. ASSESSMENT LIFECYCLE, MATURITY GATES & PRESSURE TESTS

**The pressure-test principle (core methodological principle, methodology.html):** Every dimension is assessed under adversarial conditions. For each subdimension, assessors look for at least one documented case where compassionate behavior was costly, legally risky, or institutionally inconvenient. **If no such case exists, the maximum subdimension score is capped at Developing**, even when the entity looks strong under favorable conditions. In plain terms: high performance when it is easy is not sufficient evidence of compassionate institutional character. (This is the key "maturity gate.")

**Lead-assessor review flags (maturity/quality gates, methodology.html):**
- Active harm — any subdimension scored 0 requires written documentation and lead-assessor co-sign.
- Rater discrepancy — inter-rater reliability discrepancy >1.5 on any subdimension triggers review.
- Unsupported high scores — a 4 or 5 without pressure-test evidence is flagged provisional.
- Leadership–community gap — significant differences between leadership narrative and community testimony must be resolved (community account is the primary reference point).
- Missing documents — refusal to provide requested documentation is itself a score-relevant event.
- Open discussion flags — any unresolved discussion note blocks finalization.

**Two assessment modes — IMPORTANT distinction for authors:**

1. **The Human Assessment Battery (ACB-HAB-001) — [ASPIRATIONAL / formal certified pathway].** A human-administered field guide: structured interviews, document review, observation, community testimony. Document ID ACB-HAB-001, v1.0; companions ACB-PAB-001, ACB-STD-001; administered by credentialed assessors; ~4–6 hours per entity across 2–3 sessions. A **7-session protocol** (1A leadership; 1B HR/ethics; 2A entity-selected frontline; 2B independently-selected frontline; 3A independently-recruited affected community; 3B solo document review; 4 lead-assessor synthesis). This is the formal/ideal method described on the methodology page and underpins paid Certified Assessments — it is **not** how the 1,256 public scores are produced day-to-day. (methodology.html)

2. **The automated nightly pipeline — [BUILT].** How the public indexes are actually scored and maintained at scale, using the same 8/40 framework and 5-tier evidence hierarchy. See §5. (.claude/agents/*, VPS_SCHEDULING.md)

**Attribution & subject rule (methodology-v1.2 §2):** Before scoring any harm event, settle *who is the subject* (the population the entity is responsible for) and *whose conduct the harm belongs to* (victim/perpetrator test). Harm inflicted *on* an entity by an external actor is attributed to the perpetrator, not scored against the victim; harm an entity inflicts *by its own choice* is scored against it. Worked examples: Harvard June 2026 (external DOJ action not scored; Harvard's own layoffs scored; composite held 52.3); strikes on Ukraine attributed to Russia. Scored subjects by index: countries→residents/people under state control; cities→residents served; companies→workers, customers, operating communities; AI/robotics labs→users and broader society affected by their systems; universities→students, workers (faculty/staff), surrounding communities.

**Evidence recency & decay (methodology-v1.2 §5):** The 14-day window is the *scan cadence*, not the lifespan of the evidence base. Baseline scores draw on a multi-year evidence base; adjudicated findings (court rulings, settlements) persist until superseded; uncorroborated allegations decay and cannot accumulate into a score change alone. **Positive-evidence search note:** desk research over-reports adverse events, so assessors must actively search for *structural positive evidence* (outcome data acted upon, independent audits with correction, durable access/equity infrastructure, worker-voice gains, commitments held at real cost) — not press releases.

**Floor designation & near-floor limitation (methodology-v1.2 §3–4):**
- **Two routes to composite 0.0:** (1) formula output when all 8 dimensions sit at the floor anchor; (2) **floor designation** — an editorial/data decision (through the human gate) to set all dimensions to the floor and attach a public "call out why" disclosure (`FloorDesignation` type in entities.ts).
- **Trigger criteria (all four required, documented across ≥3 independent assessment cycles):** multi-source T1/T2 corroboration; systemic (not episodic) pattern; harm active within recency window; no countervailing recognition/response above the floor anchor at any sub-dimension.
- **Reversible** via an exit protocol: evidence-of-care behavior at dimension level, applied across ≥2 consecutive cycles, from sources outside the entity's control. Performative statements don't register.
- **Near-floor limitation:** an entity already at/near the bottom of Critical has no scorable room to fall; unadjudicated adverse evidence is logged as an *evidence-tier upgrade* without moving the composite. Worked examples: UnitedHealth Group (10.2, Critical — DOJ probe expansion logged as tier upgrade, no composite change); Israel (0.0); Sudan (0.0).
- **Open methodological question (under review):** whether sheer density of pre-adjudication evidence should ever justify a floor move absent a formal charge. No such pathway exists today.

---

## 5. PLATFORM & PIPELINE  *(see companion digest from Explore agent; key facts below)*

**Tech stack [BUILT] (CLAUDE.md; ARCHITECTURE_MONETIZATION.md; worker/README.md):** Next.js 16 (App Router, TypeScript, static export) + Tailwind v4; data in structured JSON (`site/src/data/indexes/`); Docker multi-stage (Node build → Nginx Alpine) on Hostinger VPS; SSL via Let's Encrypt/Certbot; payments via Gumroad (external, no server-side integration); a single Cloudflare Worker for badge + subscriber API + Gumroad webhook + unsubscribe; Listmonk for transactional email; Cloudflare KV for subscriber state.

**The nightly automated evidence-scanning + assessment pipeline [BUILT]** — the central institutional asset and the leverage story for funders. Runs Mon–Sat ~02:00 local; four stages (`.claude/agents/`):
1. **overnight-scanner** — scans **all entities** (~1,256) for material evidence in a strict 14-day window; three-tier search strategy within a ~250-search budget; writes a per-entity `entity_reviews[]` provenance record for every entity plus a prioritized list (top ~15 to assess + ~5 rotation backfill). Runtime ~30 min, ~$2/night (Sonnet).
2. **overnight-assessor** — runs full benchmark-research assessments on ~15–20 priority entities using the official 8/40 methodology; emits assessment reports (all 40 subdimension evidence tables, raw 1–5 and scaled 0–100) and **change-proposals only when composite delta ≥5** and the proposal passes anti-false-positive screening (baseline-provenance check, directionality match, rationale-vs-history consistency) and math-hygiene validation against the canonical composite formula. Runtime ~2.25 hr, ~$25–60/night (Opus). Proposals are `status: pending` — never auto-applied.
3. **overnight-digest** — synthesizes into a rich public daily-briefing JSON (`topSignals`, `boundaryWatch`, `recentAssessments`, `emergingRisks`, `sectorAlerts`, `forwardTriggers`, etc.) and updates the internal `PENDING_CHANGES.md`. Plain-language contract enforced by `validate-daily-briefings.mjs` + `lint-daily-briefings.mjs` (wired into `npm run build`). Runtime ~5 min, ~$0.50/night (Sonnet).
4. **score-updater** — **human-triggered only, never automatic** (the human-approval gate). Applies founder-approved proposals to index JSONs with a **baseline-drift guard** (drift >2.0 → refuse / "stale-baseline hold"; direction-inversion check), recalculates rankings, logs to `APPLIED_CHANGES.md`.
- **Cost:** ~$27.50–62.50/night; ~$700–1,600/month research compute. (VPS_SCHEDULING.md) — the "near-zero marginal cost per entity at scale" argument.

**Cloudflare Worker [BUILT] (worker/src/index.ts; ARCHITECTURE_MONETIZATION.md §3):** base `https://api.compassionbenchmark.com`. Routes: `/gumroad/webhook` (POST; validates seller/product; 30-day idempotency; writes KV + Listmonk), `/badge/{slug}.svg` (GET; SVG score badge, 1-hr edge cache, fed by published `data/scores/{slug}.json`), `/unsubscribe` (HMAC-verified per-entity), `/api/v1/subscribers` (token-gated, read by alert pipeline), `/admin/status`. Free tier covers expected volume for years.

**Integrity / independence audit [PLANNED — spec complete, implementation partial]:** `research/scripts/integrity-check.mjs` — weekly automated audit verifying structural separation: index files modified only by the assessment pipeline; `send-alerts.mjs` never references subscriber/commercial state; Worker can't mutate indexes; scores derive only from the daily briefing JSON. Output: `research/integrity-reports/{DATE}.md`. (ARCHITECTURE_MONETIZATION.md §8.3) — Note: ORGANIZATION_PLAN/GRANT_MODEL describe this as "already operational / weekly automated"; the code is currently a spec + stub. **Flag for authors: describe as designed/in-rollout, not fully running, unless verified.**

**Two-plane independence architecture [BUILT, structural]:** assessment plane (local machine; reads the world, writes scores; no access to KV/Listmonk/subscriber data) is firewalled from the commercial plane (Worker + Listmonk + Gumroad; reads published scores only, writes nothing to assessment artifacts). Enforced by missing credentials, file-system permissions (`chmod a-w`), pre-commit hooks, and the Worker having no GitHub token. (ARCHITECTURE_MONETIZATION.md §8) — strongest concrete proof point for "independence is engineered, not promised."

**Score Watch [partially BUILT/LIVE]:** per-entity email alert; **$79/entity/year**; fires when overnight research moves a tracked entity's composite or crosses a band boundary; email contains delta, band change, evidence summary, links. Independence-compliant: purchase does not affect score; no early access vs. public briefing. (SCORE_WATCH.md; SCORE_WATCH_LAUNCH.md)

---

## 6. ENTITIES & INDEXES (EXACT COUNTS)

See §0 for the canonical table. Summary: **8 public indexes, 1,256 scored entities** — Countries 193, Fortune 500 448, Global Cities 250, AI Labs 50, Robotics Labs 50, US States 21, US Cities 144, Universities 100.

**Universities index [LIVE, June 2026] (PRD_UNIVERSITY_INDEX.md; ARCHITECTURE_UNIVERSITY_INDEX.md):** 100 universities, selected as the top 50 from each of Times Higher Education 2026, QS 2026, and ARWU/Shanghai 2026, deduplicated and ranked by average position (defends against single-source bias). Scored on the standard 8/40 framework, 0–100. Key findings: **mean 46.2 (Functional band); zero Exemplary institutions**; a confirmed "prestige–compassion gap" — USC 36.7 (Developing), NYU 39.1, Columbia 44.5, Harvard 52.3 (highest in the set). Carries a **confidence flag** per entity (High/Medium/Low by evidentiary completeness; "Low" published with explicit caveat). Permanent independence safeguards: no paid inclusion, no paid score improvement, no endorsement, no pre-publication review by ranked entities, public corrections.

**Coverage caveats (CLAUDE.md data notes — partially stale on counts):** Countries 193 of 207 (14 not in source); US States 21 of 51 (ranks 9–38 missing from source); Fortune 500 listed as 447 (live JSON: 448). The benchmark scores a representative-but-incomplete slice in some indexes — be honest in the prospectus.

---

## 7. INDEPENDENCE & GOVERNANCE

**The core product rule (CLAUDE.md; reused verbatim across docs):** "Entities never pay for inclusion, score changes, or suppression of findings. Commercial services support access, interpretation, and institutional use only. This separation must be preserved in all content and code."

**Why convert to nonprofit — make independence structurally durable (ORGANIZATION_PLAN.md §1):**
1. Independence becomes *legally locked, not policy-dependent* — embeddable in Articles + bylaws at a supermajority-amendment threshold, creating fiduciary obligations on every director.
2. Grant capital becomes *immediately accessible* — most foundations cannot grant to a for-profit without "expenditure responsibility."
3. The organization becomes *founder-independent and durable* — the automated pipeline + a real board + published methodology let it outlast the founder.
4. The existing revenue model is *fully preservable* as "substantially related" educational program activity.

**The independence bylaw (the legal lock) (ORGANIZATION_PLAN.md §6):** a supermajority-locked (two-thirds of full board) clause forbidding any payment in exchange for inclusion, score change, or suppression; any amendment must be publicly disclosed within 30 days. Makes selling a score *ultra vires*, not just off-policy.

**Board design (ORGANIZATION_PLAN.md §6; STRUCTURE_AND_COMPARABLES §2.2, §3.5):** 3–5 independent directors chosen for independence credibility over industry ties (AI Now model). Recommended seats: founder/ED (recuses from independence votes); ethics/welfare researcher; nonprofit-governance/legal expert; data-methods/AI researcher; journalist/transparency advocate. Majority unrelated (IRS public-charity requirement + anti-capture); 2-year staggered terms. Plus a separate **external Methodology Advisory Board** (3–5 credentialed experts; volunteer/honorarium; annual public methodology attestation — Stanford FMTI's 5-person model).

**Funding-acceptance / firewall policy — assembled from best comparable clauses (ORGANIZATION_PLAN.md §6; STRUCTURE_AND_COMPARABLES §1.5, §3.3):**
- No scored entity may be a material funder (ideally none at all) — AI Now bright line.
- No single funder >10% of annual revenue — Transparency International norm.
- "We can criticize our funders" — Bellingcat written clause.
- Scoring decisions made by research staff/pipeline independent of any donor — Freedom House editorial firewall.
- Public disclosure of all funders above $1,000 — TI threshold.
- Reverse due diligence on funders above $5,000 — Bellingcat.
- Core-scoring grants must be general-operating/unrestricted — AI Now.

**Methodological capture-resistance (the strongest safeguard) (V-Dem, Stanford FMTI):** published rubric/weights/sources; rules-based, logged scoring; retained, auditable evidence; documented & published score-change events; weekly integrity audits; external advisory board attestation. **The reproducibility test:** if the founder were replaced today, a successor must be able to reproduce any score from the published methodology and evidence record.

**Conflict-of-interest policy:** annual written disclosures; recusal; explicitly extended to funder conflicts (a director/major donor tied to a scored entity recuses from anything touching that entity).

---

## 8. REVENUE MODEL  *(REVENUE_MODEL.md; SALES_PLAN.md; PRICING_LANDSCAPE; gumroad.ts)*

**The hard rule:** every dollar comes from a *data USER* (investor, journalist, researcher, foundation, procurement team), never from a scored entity for inclusion/score/suppression. (REVENUE_MODEL.md §1, §9)

**Offer ladder (REVENUE_MODEL.md §2; status flags):**
| Tier | Product | Price | Status |
|---|---|---|---|
| 0 | Free funnel (Score-Watch free, daily briefing, 8 public indexes) | $0 | [LIVE] |
| 1 | Self-serve index report (Gumroad) | **$49 individual / $195 commercial** per index | [LIVE for 5 of 8; US Cities/US States/Universities TODO] |
| 2 | Score-Watch Alert | **$79/yr/entity** | [LIVE, 2026-06-22] |
| 3 | Pro subscription | **$59/mo or $590/yr** (solo); Pro Team 3–5 seats $500–$1k/mo | [partial — needs auth/gating] |
| 4 | Custom deep-dive report (1 entity/sector, all 40 subdims + evidence trail) | **$3,500** (range $2.5–5k) | [services-only, buildable now] |
| 5 | Institutional Data License / feed (CSV now, API later) | **$1,500/mo** (range $1–2k/mo; $12–20k/yr enterprise) | [CSV buildable now; API needs work] — **LEAD OFFER A** |
| 6 | Advisory / briefing retainer | **$2,500/mo** (range $2–5k/mo, 3-mo min) | [services-only] — **LEAD OFFER B** |
| 7 | Certified Assessment (sold TO an entity; paid *process & report only*, firewalled, publicly disclosed) | **$5,000–$15,000** | [LIVE but **deliberately de-emphasized** — perception risk] |

**The $10k MRR math:** 3 Data Licenses ($1.5k) + 2 Advisory retainers ($2.5k) = **$9,500 MRR from 5 deals** (60-day target); or 4 retainers = $10k in 4 deals. Self-serve (Score-Watch + Gumroad + Pro) = $500–2k/mo unpredictable spill. (REVENUE_MODEL.md §4; SALES_PLAN.md)

**Mission-aware pricing (UBIT-relevant):** academic/nonprofit/small-newsroom 30–50% off self-serve and License; annual prepay 10–15% off; reference newsroom deal at break-even for attribution. **No discount ever to or conditioned on a scored entity.** (REVENUE_MODEL.md §7)

**Target buyers (SALES_PLAN.md §1):** primary = ESG/impact investors (portfolio risk, fiduciary duty to flag non-financial risk; healthcare/AI/education exposure); secondary = investigative newsrooms (ProPublica, STAT, The Markup, KFF, Bloomberg). Sales hooks are triggered by real score movements (e.g., UHG 10.2 Critical; OpenAI 26.7 under 42-state AG subpoena; Humana downgrade; University Index launch).

**Pricing comp anchors (PRICING_LANDSCAPE):** Score-Watch $79/yr sits at Owler Pro floor ($35–99) but delivers a scored, evidence-backed signal; deliberately under institutional ESG monitoring (MSCI $25k+, Sustainalytics $10k+, RepRisk $15k+, EcoVadis $5k+). Data License $1.5k/mo (~$18k/yr) intentionally below every ESG-monitoring floor to win on price while the brand is young.

---

## 9. NONPROFIT PATH

**Recommended structure (STRUCTURE_AND_COMPARABLES Recommendation; ORGANIZATION_PLAN §5):** **US 501(c)(3) public charity with a related earned-revenue program**, launched via a **Model C fiscal sponsor** as a fast bridge to grants during the ~3–6 month IRS Form 1023 review. Reserve a **wholly-owned taxable subsidiary (Mozilla model)** only if commercial sales scale beyond what "related" activity comfortably covers — not at formation.

**Why public charity (not private foundation):** intended mix of grants + earned revenue + small donors maps to the public support test; required independent-board majority is itself an anti-capture mechanism. It's the form chosen by every close US analogue: ProPublica, Access Now, AI Now, Freedom House, Epoch AI. (STRUCTURE §1.1)

**UBIT / earned-revenue preservation (STRUCTURE §1.4; ORGANIZATION_PLAN §4):** selling research/datasets/interpretation is the *exempt educational activity itself* (university-/museum-analogy), so most is "substantially related" and non-taxable. Guardrails: keep core rankings + methodology free; sell only *derived* depth; mission-aware tiered pricing (ProPublica Data Store model); keep commerce incidental and subordinate; file Form 990-T on any genuinely unrelated lines. Use the **full Form 1023** (not 1023-EZ) to pre-clear the earned-revenue model with the IRS.

**Formation steps/timeline/cost (ORGANIZATION_PLAN §5):** choose state + name; draft Articles (501(c)(3) purpose + dissolution + independence clause); **recruit 3+ independent directors (the gating step)**; file Articles + adopt bylaws/COI + get EIN; sign Model C sponsor (4–10% fee); file Form 1023 ($600); register for state charitable solicitation (40 states + DC); receive determination letter (Month 4–9). Total cost ~$700–1,000 DIY / ~$2,500–6,000 with attorney. Realistic planning-to-operational: 2–8 months.

**Fiscal-sponsor shortlist:** Code for Science & Society, Players Philanthropy Fund, Social Good Fund, Anti-Entropy (closest to AI-safety/SFF-LTFF community). Treat as a bridge, not a home (Ranking Digital Rights cautionary tale — 3 sponsors). (ORGANIZATION_PLAN §5; STRUCTURE §1.2)

**Charitable purpose statement (501(c)(3)-ready):** educate the public by freely publishing transparent, independent, comparative benchmarks of how institutions recognize/respond-to/reduce human suffering; advance scientific understanding of institutional behavior via reproducible methodology; support journalists/researchers/policymakers/civil society; provide related educational tools. (ORGANIZATION_PLAN §2)

**16 comparable organizations studied — none charges the entities it ranks (category norm) (STRUCTURE Part 2):** World Benchmarking Alliance (cleanest template — single-purpose, grant-funded, benchmarked firms are "allies" not funders), V-Dem (method-level capture resistance via ~3,500 anonymous coders), Freedom House (flagship index takes no government money despite ~88% gov-funded org), Transparency International (no donor >10%), Our World in Data (4,000+ small donors), ProPublica (Data Store earned revenue), Bellingcat (training/workshops ~half its budget; "can criticize funders"), Mozilla (nonprofit-parent + taxable sub; cautionary ~86% single-counterparty revenue), Access Now (RightsCon paid convening), AI Now (categorical refusal of corporate money), MLCommons (membership dues — does NOT fit involuntary scoring), **Epoch AI (cautionary tale — undisclosed OpenAI funding + privileged benchmark access caused a credibility crisis)**, CAIS, Stanford FMTI/HELM (published 100-indicator rubric + external advisory board), AlgorithmWatch, Ranking Digital Rights.

**Theory of change (ORGANIZATION_PLAN §3; GRANT_MODEL §5):** *Problem* — no standardized independent measurement of how institutions treat suffering. *Intervention* — independent, automated, public benchmark scoring 1,256 entities across 8/40 with transparent methodology, nightly evidence, weekly integrity audits, strict independence. *Causal pathway:* inputs (founder + pipeline + methodology + compute) → activities (scanning, reassessment, audits, publishing) → outputs (entities scored, public rankings, logged score-change events, quarterly impact reports) → short-term outcomes (shared citable standard for journalists/researchers/policymakers) → medium-term (institutions respond to score moves; third parties cite scores) → long-term impact (measurable behavior shift; scores enter standard due-diligence vocabulary like Freedom House / TI's CPI). *Stated assumptions:* transparency drives accountability; independence is preserved & trusted; the pipeline produces credible scores at scale; third parties cite/embed scores.

**Risk register (ORGANIZATION_PLAN §9; STRUCTURE Part 3):** defamation/trade-libel (mitigated: every score anchored in sourced evidence; opinion-on-disclosed-facts is protected — *Bose Corp. v. Consumers Union*, NYT v. Sullivan actual-malice standard; anti-SLAPP state; media/D&O insurance); perceived bias (radical transparency + external advisory board); funder-influence (firewall policy); founder/key-person fragility (automated pipeline as durable asset + real board); UBIT/commerciality (core free, derived sold, full 1023); public-support-test failure (broad mix; 509(a)(2) fallback); Epoch-style conflict crisis (bright-line no scored-entity funder + public disclosure).

---

## 10. FUNDER LOGIC

**The core constraint (GRANT_MODEL §1; FUNDER_LANDSCAPE §0):** the prestige foundations (Ford, MacArthur, Open Society, Omidyar, Rockefeller, Hewlett, Sloan, Siegel, McGovern) are invite-only / relationship-gated — *pull, not push*. They are the destination, not the starting point. The accessible Year-1 money is in the AI-safety/longtermist regranting ecosystem, open RFPs, and accelerators.

**Three/four-phase strategy (GRANT_MODEL §1; FUNDER_LANDSCAPE §3.1):**
- **Phase A — fast cash (Months 0–3):** SFF Speculation Grant, EA LTFF, Manifund/Foresight, **Schmidt Multi-Agent Safety (HARD DEADLINE Aug 8, 2026)**.
- **Phase B — capacity/brand (Months 2–6):** Fast Forward accelerator (window Jul 30–Sep 8, 2026; $25k + capacity); publish 1–2 citable artifacts; recruit advisory board.
- **Phase C — mid-size thematic (Months 4–12):** Knight (open calls), Sloan (2-page LOI), McGovern Data Practice Accelerator (≤$125k), DRK Foundation (≤$300k/3yr; needs "path to ≥10k lives" framing).
- **Phase D — aspirational cultivation (Months 6–18, low-intensity):** Open Philanthropy unsolicited concept note; Ford/Omidyar/Siegel program-officer contact; Current AI / Humanity AI / MacArthur emerging mechanisms.

**Tier-1 funders (open application; accept fiscally-sponsored/non-501(c)(3)) (FUNDER_LANDSCAPE §1; GRANT_MODEL §2):**
- **SFF Speculation Grant** — $50k–150k; ~1-week decision; for-profit or nonprofit, global.
- **EA LTFF** — $50k–100k; rolling, 2–4 week turnaround.
- **Schmidt Sciences "Scaling AI Safety for a Multi-Agent World"** — Tier 1 ≤$300k (+ compute/API credits); full proposal due **Aug 8, 2026**; robotics-lab scoring = multi-agent oversight.
- **Manifund + Foresight Institute** — $10k–30k each; days-not-months.
- **Fast Forward** — $25k + accelerator; registered nonprofit (fiscal sponsor qualifies); apply Jul 30–Sep 8 2026.
- **Mozilla Democracy x AI Cohort** ($50k–300k, two-stage; 2027 cohort) and **McGovern AI for Humanity Prize** ($200k; 2027 cycle) — track for next cycle.

**Recommended first three to submit (GRANT_MODEL §3):** (1) SFF Speculation Grant, (2) EA LTFF (in parallel), (3) Schmidt Multi-Agent Safety. All accept non-501(c)(3)/fiscally-sponsored applicants; first two move in days–weeks; together they can cover the full Year-1 budget.

**Ask sizes & budget (GRANT_MODEL §7; FUNDER_LANDSCAPE §3.5):** first seed/general-operating ask **$150k–300k for 12 months**; Year-2 target $300k–750k blended across 2–3 funders; aspirational Tier-3 $500k–2M multi-year/relationship-gated. **Annual cost base ~$155k–330k:** founder comp $120–180k; pipeline compute/API $20–45k (offsettable by Schmidt credits); hosting/infra $5–10k; part-time contractor $0–60k; legal/accounting/integrity audits $5–30k; fiscal-sponsor fee 5–15% of grants; insurance (D&O + media) $3–10k.

**Headline KPIs to commit to (only what the pipeline can already track) (GRANT_MODEL §5, §8; ORGANIZATION_PLAN §11):** entities scored (1,256 maintained); nightly pipeline uptime 90%+; score-change accountability events documented 12+/yr; quarterly impact reports 4/yr; external citations 10+ (Yr1) → 25+ (Yr2); Score Watch subscribers 100+ → 500+; external sites/tools using badge/API 5+ → 15+; documented entity responses to their score 3+ → 10+. Independence KPIs are non-negotiable/always 100%: zero pay-for-inclusion instances; zero material funders tied to scored entities; all funders >$1,000 disclosed.

**The leverage story funders reward:** the automated pipeline gives an exceptionally low cost-per-entity-scored — 1,256 entities continuously monitored on a near-solo budget — high impact-per-dollar (Mulago/DRK/EA-aligned framing). The independence statement is load-bearing: include verbatim in the body (not an appendix) of every application; funders proactively ask "can a lab buy a better score?" (GRANT_MODEL §4 Section 5).

---

## 11. SOURCE FILE INVENTORY (for citation)

- `docs/nonprofit/ORGANIZATION_PLAN.md` — nonprofit conversion plan (mission, theory of change, programs, structure, governance, financial model, risk register, roadmap, KPIs, open decisions).
- `docs/nonprofit/GRANT_MODEL.md` — grant-pursuit model (strategy, tiered pipeline, first 3 applications, master proposal template, theory of change, impact metrics, 12-month calendar, ask sizes, budget narrative).
- `docs/nonprofit/research/STRUCTURE_AND_COMPARABLES.md` — legal structure, 16 comparable orgs, UBIT, defamation law, governance/independence design.
- `docs/nonprofit/research/FUNDER_LANDSCAPE_AND_GRANT_MODEL.md` — full funder landscape (tiers + URLs), grant mechanics, fiscal sponsorship, logic model, calendar.
- `CLAUDE.md` — product overview, tech stack, independence policy, data notes (some counts stale).
- `site/src/data/dimensions.ts` — **canonical** 8 dimensions / 40 subdimensions, anchors, BANDS, INTEGRATION_PREMIUM.
- `site/src/data/entityCount.ts` + `site/src/data/entities.ts` + `site/src/data/indexes/*.json` — **canonical** entity counts (1,256) and entity registry.
- `legacy-html/methodology.html` — pressure-test principle, evidence hierarchy (5 tiers), 7-session Human Assessment Battery, review flags, anchors/bands (note: scoring math is v1.1-era / outdated).
- `docs/methodology-v1.2-additions.md` — **canonical** current scoring (v1.2), attribution/subject rule, near-floor limitation, harm-flag/floor designation, evidence recency/decay, positive-evidence search.
- `docs/REVENUE_MODEL.md`, `docs/SALES_PLAN.md`, `docs/PRICING_LANDSCAPE_2026-04-20.md`, `site/src/data/gumroad.ts` — revenue/products/pricing/buyers.
- `docs/SCORE_WATCH.md`, `docs/SCORE_WATCH_LAUNCH.md` — Score Watch product & ops.
- `docs/ARCHITECTURE_MONETIZATION.md`, `docs/PRD_MONETIZATION.md`, `docs/VPS_SCHEDULING.md`, `docs/DAILY_BRIEFING_SCHEMA.md` — platform, pipeline, Worker, independence architecture.
- `docs/PRD_UNIVERSITY_INDEX.md`, `docs/ARCHITECTURE_UNIVERSITY_INDEX.md` — universities index (100 entities, June 2026).
- `docs/GRANT_FUNDER_MAP.md` — additional funder/independence notes (not yet read in depth; see gaps).
- `.claude/agents/{overnight-scanner,overnight-assessor,overnight-digest,score-updater,benchmark-research}.md` — pipeline agent specs.
- `research/scripts/{send-alerts,integrity-check}.mjs` — alert pipeline + integrity audit (spec/stub).

---

## 12. GAPS / MISSING MATERIALS (for manuscript authors)

- **`docs/GRANT_FUNDER_MAP.md`** (34 KB) — listed in the brief but not deep-read in this pass; the funder strategy was fully covered by GRANT_MODEL + FUNDER_LANDSCAPE, but authors should mine GRANT_FUNDER_MAP for any per-funder independence flags before the funding chapters.
- **No dedicated founder bio / founder-letter source.** Phil Kling is named as founder/ED throughout, but there is no biography, credentials, or origin-story document. **Front-matter item 4 (Founder letter) and Ch24 will need founder-supplied material.**
- **No visual-asset / brand spec was read in depth** beyond `docs/BRAND_VISUAL_IDENTITY.md` and `docs/logo-lab.html` existing in the tree — authors writing Appendix F (graphics/layout) and the cover should pull from `docs/BRAND_VISUAL_IDENTITY.md` (not yet digested here).
- **Integrity audit operational status is ambiguous:** nonprofit docs assert "weekly automated integrity audits" as operational; the code (`integrity-check.mjs`) is a spec/stub. Verify before claiming it runs.
- **`send-alerts.mjs` is partial** — Score Watch alert *delivery* is specified but not fully implemented; the alert product is sold but automated fulfillment is in-progress. Don't overclaim.
- **No external citations / press / impact evidence yet.** KPIs target "10+ citations" but baseline is "0 reported." Ch23 (Measuring Impact) and Ch25/Ch24 should treat impact as forward-looking, not achieved.
- **Counts in CLAUDE.md and all nonprofit docs are stale (1,155 vs live 1,256).** The prospectus should standardize on 1,256 (see §0).
- **No formal financial statements / actuals** — all revenue figures are *recommended prices and projections*, not booked revenue. Treat the financial-sustainability chapter as a model, not a track record.
- **Daily/special briefing examples** exist in `site/src/data/updates/` and `research/digests/` but were not individually catalogued; authors wanting concrete worked examples (e.g., a real score-change event narrative) should pull a recent digest.
