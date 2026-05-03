# Assessor Session Log — 2026-05-01

**Pipeline stage:** Assessor (Stage 2 of 2)
**Methodology version:** v1.2
**Recency window:** 2026-04-17 → 2026-05-01 (14 days)
**Session start:** 2026-05-01T03:00:00Z
**Session end:** 2026-05-01T04:35:00Z
**Entities assessed:** 20 (15 priority + 5 rotation backfill)
**Change proposals generated:** 1 (anthropic — band-boundary exception)

---

## Pre-flight Reconciliations Applied

The scanner flagged multiple `rotation-state.json` ↔ live-canonical mismatches. All resolved this cycle:

| Entity | rotation-state (stale) | live-JSON canonical | Reconciled to |
|---|---|---|---|
| deepmind-google | 76.4 / established / rank 4 | 58.4 / functional / rank 14 | 58.4 / functional / rank 14 |
| palantir-ai | 19.9 / critical / rank 46 | 0 / critical / rank 49 (floor 2026-04-30) | 0 / critical / rank 49 |
| xai-grok | 2.2 / critical / rank 50 | 0 / critical / rank 50 (floor 2026-04-30) | 0 / critical / rank 50 |
| openai | 31.3 / developing / rank 42 | 27.5 / developing / rank 43 | 27.5 / developing |
| amazon | 21.6 / developing / rank 350 | 17.8 / critical / rank 350 | 17.8 / critical |
| hungary | 23.1 / developing / rank 125 | 28.1 / developing / rank 125 | 28.1 / developing |
| oracle | null / null / rank null | 28.4 / developing / rank 316 | 28.4 / developing / rank 316 |
| france | 65.5 / established / rank 25 | 62.5 / established / rank 25 | 62.5 / established |
| czech-republic | 65.5 / established / rank 26 | 62.5 / established / rank 26 | 62.5 / established |
| slovenia | 65.5 / established / rank 27 | 62.5 / established / rank 27 | 62.5 / established |
| latvia | 65.5 / established / rank 28 | 62.5 / established / rank 28 | 62.5 / established |
| lithuania | 65.5 / established / rank 29 | 62.5 / established / rank 29 | 62.5 / established |
| united-states | 25 (already corrected) | 25 / developing / rank 77 | 25 / developing (already aligned) |

`rotation-state.json` `last_updated` set to 2026-05-01.
12 entities had composite/band/rank fields reconciled to live-JSON canonical.
20 entities had `last_assessed` set to 2026-05-01.
1 entity (anthropic) had `last_change_proposal` set to 2026-05-01.

---

## Pending Proposal Resolutions

The scanner flagged 3 unresolved pending change proposals from prior cycles. Status confirmed:

- **palantir-ai (2026-04-27 proposal)** — STATUS: `applied`, `applied_date: 2026-04-27`. Subsequent floor designation 2026-04-30 superseded the proposal. Resolved.
- **deepmind-google (2026-04-30 proposal)** — STATUS: `applied`, `decision: approved`, `applied_date: 2026-04-30`. Live JSON now reflects 58.4/functional. Rotation-state reconciled this cycle (was stale at 76.4). Resolved.
- **myanmar (2026-04-30 proposal)** — STATUS: `applied`, `decision: approved`, `applied_date: 2026-04-30`. Floor designation active. First post-application confirmation cycle: floor pattern holds, no exit criteria. Resolved.

All 3 prior pending proposals are now closed.

---

## Floor Cluster Verification (6 entities)

Floor exit criteria checked: independent investigation present? structural reform implemented? treaty-body engagement active? verifiable behavioral change documented?

| Entity | In-window evidence | Exit criteria | Decision |
|---|---|---|---|
| **xai-grok** | Pentagon $200M classified access (Feb 2026), NY AG child-safety demand active, ICO investigation, LCHB CSAM class action (March 2026) | NONE met. Investigations ≠ structural remediation. | CONFIRM floor |
| **palantir-ai** | Apr 18-20 Karp 'technofascism' manifesto; Apr 24 Intercept IRS data-mining contract; Apr 25 employee Slack ICE-question auto-deletion | NONE met. Manifesto reinforces harm doctrine; IRS contract corroborates general-population surveillance scope. | CONFIRM floor |
| **sudan** | War year-4; 700+ civilian drone deaths Q1 2026; RSF Port Sudan attacks; Apr 13 Darfur strikes (20 killed); Apr 25 El Obeid strikes (7 killed); 33.7M needing assistance | NONE met. | CONFIRM floor |
| **south-sudan** | Apr 30 UNMISS Resolution 2824 troop ceiling cut 17,000 → 12,500 (vote 13-0, China/Russia abstained); civil war resumed under Kiir; OHCHR urgent civilian protection call | NONE met. Mandate weakening is regression, not exit-criteria. | CONFIRM floor |
| **israel** | OHCHR Commission Apr 2026 statement on continuing rights violations; ICC judges rejected Israel's bid to halt Gaza probe; 200+ civilians killed since Feb 28 ceasefire; warrants for Netanyahu/Gallant maintained | NONE met. | CONFIRM floor |
| **myanmar** | Junta airstrikes ongoing (982 civilian deaths in 2025 alone, +53% YoY, 287 children); martial law in 60 townships (Aug 2025); 12M+ acute hunger; HRW year-anniversary Sagaing report | NONE met. Crisis Group flags possible regional détente — not yet ceasefire. | CONFIRM floor (1st post-designation cycle) |

**Floor cluster summary:** 6/6 confirmed. No exit criteria triggered for any floor entity. All floor designations hold.

---

## Per-Entity Assessor Notes

### Priority 1: Palantir AI (slug: palantir-ai)
- **Live canonical:** 0 / critical / floor-designated 2026-04-30
- **In-window:** Apr 18 manifesto release, Apr 20 Al Jazeera 'technofascism' framing, Apr 24 Intercept IRS contract, Apr 25 employee Slack auto-deletion. Manifesto bullet points endorse arms manufacturing, draft reinstatement, anti-cultural-pluralism, and elite victimhood — the canonical I2 Non-Performance anchor 1 pattern (compassionate practices only where reputationally beneficial; Karp openly disavowing compassion as a doctrine). IRS data-mining contract reinforces general-population financial surveillance scope.
- **Decision:** Confirm floor. No proposal.

### Priority 2: Anthropic (slug: anthropic)
- **Live canonical:** 61.6 / established / rank 5
- **Assessed:** 59.7 / functional
- **Delta:** -1.9 (sub-threshold) **but band crosses 60-boundary**
- **Drivers:** BND -0.2 (B3 scope-clarity gap re: capacity vs. expansion); ACC -0.3 (AB3 transparency gap on Mythos breach 24 days post-incident); INT -0.1 (I2/I4 partial offset by sustained I1 Pentagon-stance integrity)
- **Mitigating:** Continued ethical stance against autonomous weapons targeting bears real Pentagon-contract cost (I1 anchor 3 holds)
- **Decision:** **PROPOSAL GENERATED** (band-boundary exception). File: `research/change-proposals/anthropic-2026-05-01.json`. Confidence medium. Recommendation: downgrade.

### Priority 3: OpenAI (slug: openai)
- **Live canonical:** 27.5 / developing / rank 43 (rotation-state was stale at 31.3 — reconciled this cycle)
- **In-window:** Trial Days 1-4 (Apr 27-30) Musk v. Altman testimony; Musk's "stolen the charity" claim weakened on cross-exam; Microsoft counsel cross-exam targeted; expert witness Stuart Russell scheduled for Day 5+. EyesOnOpenAI coalition challenging $300B charitable-asset use.
- **Methodology rule applied:** Score only on what is established in court record, not anticipated outcomes. Pre-verdict trial testimony alone does not warrant scoring movement at this point — weakly negative on ACC (governance contested in public record) but already priced into 27.5 baseline.
- **Decision:** Confirm. No proposal. Re-queue next cycle for Day 5+ testimony.

### Priority 4: Google DeepMind (slug: deepmind-google)
- **Live canonical:** 58.4 / functional / rank 14 (post-Apr-30 application)
- **rotation-state RECONCILIATION APPLIED:** 76.4 → 58.4
- **In-window beyond what was already scored Apr 30:** No structurally new events Apr 29 - May 1. Continued employee opposition coverage (CBS, HRGrapevine, Euronews, IBTimes); senior DeepMind scientist Andreas Kirsch publicly "incredibly ashamed" — already incorporated into Apr 30 INT scoring.
- **Decision:** Confirm. No proposal. Last cycle's 58.4 holds.

### Priority 5: Meta Platforms (slug: meta-platforms)
- **Live canonical:** 10.9 / critical / rank 412 (Fortune 500)
- **In-window:** Apr 21 keystroke/mouse-monitoring announcement (Bloomberg); Apr 23 8,000-job reduction with Trust & Safety concentration, $135B AI capex, $921M executive stock options; cuts effective May 20.
- **Scoring impact:** EMP, BND, INT directly affected. Modeled adjustment AWR 1.4 / EMP 1.3 / ACT 1.5 / EQU 1.2 / BND 1.4 / ACC 1.3 / SYS 1.4 / INT 1.2 → composite 8.4
- **Delta:** -2.5 (sub-threshold; no band change — both Critical)
- **Decision:** Confirm. No proposal. Note: floor-designation candidacy not yet warranted (pattern doesn't match Palantir/xAI scale despite severe negative trajectory).

### Priority 6: Amazon (slug: amazon)
- **Live canonical:** 17.8 / critical / rank 350 (rotation-state was stale at 21.6 — reconciled this cycle)
- **In-window:** Apr 2 NLRB historic JFK8 bargaining order (positive EMP); Apr 9 NLRB cleared Amazon's path to challenge in federal court (resistance to compliance, weakens 'genuine' signal). Mar 31 strike settlement is OUTSIDE the 14-day window.
- **Modeled adjustment:** EMP +0.2 → composite 18.1, delta +0.3
- **Decision:** Confirm. No proposal.

### Priority 7: Microsoft (slug: microsoft)
- **Live canonical:** 66.4 / established / rank 34
- **In-window:** Apr 23-24 voluntary retirement program for ~8,750 US employees (~7%); first-ever voluntary buyout in 51-year history; 30-day decision window; "Rule of 70" formula. **AI Ethics & Society team elimination is a 2023 event, NOT in-window** — scanner flag confirmed. Out-of-window evidence cannot drive scoring.
- **Modeled adjustment:** Voluntary buyout structurally distinct from forced layoff (genuine consent window per B5); modest negative on EMP/BND. Composite 65.0, delta -1.4.
- **Decision:** Confirm. No proposal.

### Priority 8: Hungary (slug: hungary)
- **Live canonical:** 28.1 / developing / rank 125 (rotation-state was stale at 23.1 — reconciled this cycle)
- **In-window:** Apr 12 TISZA two-thirds supermajority (138/199 seats); Apr 13 Magyar ICC return pledge; Apr 14 HRW called for rule-of-law restoration; Magyar said Netanyahu would be arrested if he visits.
- **Methodology rule applied:** Score only on election result and publicly stated pledges — NOT on anticipated legislative actions. Magyar not sworn in until May 9.
- **Modeled adjustment:** Modest positive on AB1, I1, S4 from democratic-mandate signal. Composite 30.6, delta +2.5 (sub-threshold).
- **Decision:** Confirm. No proposal. **Schedule mandatory reassessment ~30 days post-May-9 swearing-in (approximately June 8) per scanner directive.**

### Priority 9: South Sudan (slug: south-sudan) — Floor cluster
- See Floor Cluster Verification table above.

### Priority 10: Sudan (slug: sudan) — Floor cluster
- See Floor Cluster Verification table above.

### Priority 11: United States (slug: united-states)
- **Live canonical:** 25 / developing / rank 77 (rotation-state already aligned ✓)
- **In-window:** Apr 17 NPR record ICE custody deaths (29 since Oct, surpassing 2004 record); Apr 21 Democracy Now 17 deaths YTD on ~1/week pace; Apr 28 Trump EO militarizing local law enforcement; ICE detention pop +70% above end-Biden baseline; DOJ rescinded police-oversight investigations.
- **Modeled adjustment:** Modest negative on EQU, BND, ACC, SYS. Composite 22.5, delta -2.5 (sub-threshold).
- **Decision:** Confirm. No proposal.

### Priority 12: Oracle Corporation (slug: oracle) — First-cycle confirmation
- **Live canonical:** 28.4 / developing / rank 316 (applied 2026-04-30, first baseline)
- **In-window:** Missouri WARN investigation **CLOSED** (Strauss Borrelli — no lawsuit filed); Washington investigation status: still flagged active, but no new lawsuit as of scan date. ~30 days post-layoff; no new mass adverse events.
- **Modeled adjustment:** Missouri closure is mild positive (resolves one accountability vector). Composite ~28.4 (unchanged).
- **Decision:** Confirm first baseline. No proposal. **Re-queue 30 days from now (~May 30) for Washington WARN 60-day window expiration (60-day notice from March 31 layoff).**

### Priority 13: Israel (slug: israel) — Floor cluster
- See Floor Cluster Verification table above.

### Priority 14: Myanmar (slug: myanmar) — Floor cluster, 1st post-designation cycle
- See Floor Cluster Verification table above.
- **Note:** Crisis Group April 2026 flagged "looming regional détente" possibility — monitor next cycle for ceasefire signals. No structural change yet.

### Priority 15: xAI/Grok (slug: xai-grok) — Floor cluster
- See Floor Cluster Verification table above.

### Rotation backfill (5 first-baselines)

All 5 are rank 25-29 European countries with identical published composite 62.5 (this uniformity is itself suspicious — likely placeholder baseline values from initial index population that have not been individually validated). First agent-cycle for all five.

| Entity | In-window evidence | Net signal | Decision |
|---|---|---|---|
| **France** | Housing crisis (350K homeless 2024 baseline); 9,350 racist/xenophobic offenses 2024 (+11% YoY); 4-government instability post-2024 elections; ongoing tensions over 2024 immigration law | Modest negative (62.5 may be optimistic) | Confirm baseline; flag for evidence-driven differentiation |
| **Czech Republic** | New unified social benefit (Jan 2026); same-sex marriage recognition; National Strategy for Social Inclusion | Modest positive | Confirm baseline |
| **Slovenia** | 19% national-government trust (lowest in EU); Stagnator democracy designation (Liberties EU 2026) | Modest negative (S5 / I5 concerns) | Confirm baseline |
| **Latvia** | Hard Worker designation (Liberties EU 2026); civil unions established 2023; Latvian-only public-media restriction (Jan 1 2026) is concerning | Mixed | Confirm baseline |
| **Lithuania** | Stagnator designation (Liberties EU 2026); Gini 35.7% (above EU avg 29.6%) | Modest negative on EQ1/EQ2 | Confirm baseline |

**Decision for all 5:** Confirm 62.5 baseline as first-cycle rotation pass. No proposals (in-window evidence insufficient to drive >5pt deltas under conservative scoring). All flagged for evidence-driven differentiation in subsequent cycles. Rotation-state reconciled from 65.5 to 62.5.

---

## Methodology Compliance Check

- [x] All assessments used recency window 2026-04-17 → 2026-05-01 (14 days)
- [x] No out-of-window evidence drove proposal generation (Microsoft AI Ethics 2023 and Amazon Mar 31 strike settlement excluded as documented)
- [x] Floor exit criteria evaluated for all 6 floor entities
- [x] No verdict-pending evidence scored (OpenAI trial verdict ~May 21; Anthropic DC Circuit May 2026)
- [x] Hungary scored on election/pledge only, not anticipated legislation
- [x] Composite math validated (Anthropic: ((3.3875-1)/4)*100 = 59.6875 → 59.7)
- [x] Drift validation: Anthropic raw-score drift -0.6 across 8 dimensions; -1.9 composite — well within 2.0-point per-cycle ceiling
- [x] Integration premium cap (+10) not applied — no integration-bonus events this cycle
- [x] Sub-5-point proposals only generated for band-boundary or first-baseline cases (Anthropic = band-boundary)

---

## Sector-Level Cross-Reference

**AI Labs Pentagon AI governance crisis:** Spans Anthropic (resisting), Google DeepMind (signed classified deal Apr 28), xAI/Grok (Feb classified access), Palantir AI (manifesto + IRS contract). The sector pattern is documented in last cycle's deepmind-google proposal and reinforced this cycle by Anthropic's Mythos breach + White House block. The cluster shows two opposing INT trajectories: Anthropic bears costs to maintain limits; the others either embrace military integration (DeepMind, xAI) or ideologize harm (Palantir). This sectoral context informs Anthropic's modest downgrade proposal — without the I1 sustained-cost evidence, the BND/ACC drift would have been larger.

**Fortune 500 Tech AI-driven labor displacement:** Meta 8K + Microsoft 8.75K (voluntary) + Oracle 30K (March) + Amazon NLRB resistance + Microsoft AI Ethics history. Sector-level pattern documented across multiple proposals. No new sector-level proposal generated this cycle (individual-entity adjustments below threshold).

**Active conflict zones:** Sudan/South Sudan/Myanmar/Israel — all confirmed floor. UNMISS troop reduction and Sudan war year-4 are structural deteriorations but cannot push composites below 0.

---

## Open Items for Next Cycle (2026-05-02)

1. **Hungary** — May 9 swearing-in is ~8 days out. Schedule mandatory reassessment ~June 8 (30 days post-formation). Monitor June 2 ICC withdrawal effective date.
2. **Oracle** — Re-queue for ~May 30 Washington WARN Act 60-day window expiration.
3. **OpenAI** — Trial liability phase verdict expected ~May 21. Re-queue.
4. **Anthropic** — DC Circuit hearing on Pentagon dispute pending May 2026. Watch for Mythos breach structural remediation disclosure.
5. **DeepMind/Google** — Re-queue for any new in-window structural events; current 58.4 holds.
6. **Myanmar** — Crisis Group regional-détente flag — monitor for ceasefire signals.
7. **France/Czech Republic/Slovenia/Latvia/Lithuania** — All assessed first-baseline this cycle. Schedule individual evidence-driven differentiation cycles to test whether the uniform 62.5 holds entity-by-entity.
8. **rotation-state.json validation** — Recommend a one-pass validator to detect rotation-state ↔ live-JSON drift before next cycle. 12 entries reconciled this cycle suggests systematic drift.

---

## Disclaimer

This assessor session and the resulting change proposal are based on publicly available information and do not constitute formal Compassion Benchmark Certified Assessments. Proposals are pending human review prior to application to the published indexes.
