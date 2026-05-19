# Growth Review: /updates Redesign
**Date:** 2026-05-19  
**Scope:** Proposed section reorder for the daily briefing at compassionbenchmark.com/updates  
**Reviewer:** Growth Strategist

---

## A. Opening Question as a Hook

### (i) Above-the-fold conversion: tension-framed question vs thesis-led lede

The current structure opens with a thesis-led header (date, issue number, KPI grid) followed by a lead signal card and brutal insight. This is a competent intelligence-product layout. It answers "what happened" before the reader has a reason to care.

Moving the DailyQuestion to the opening inverts the read order: the reader is placed in a state of genuine uncertainty before they encounter the data. This is structurally closer to how Stratechery opens its best-performing pieces — with a question that has no obvious answer so that the essay earns its conclusion — and to how Lawfare frames geopolitical explainers, where the question establishes the legal or factual ambiguity that the analysis will resolve. Semafor's "Room for Disagreement" is structurally distinct (it stages opposing views) but produces a similar effect: the reader is suspended rather than informed, which increases dwell time.

The conversion implication is meaningful under specific conditions. The tension-framed opening question holds attention better when:
- The question is entity-specific and names a real event from today's cycle (not a generic methodological question from the rotation bank)
- The reader is in a browse or share context (social, email forward) rather than a direct-visit context where they already intend to read
- The briefing is short enough that the question's resolution feels reachable within the read session

The current QUESTION_ROTATION bank is deliberately generic — questions like "When an institution can measure suffering but chooses not to act, at what point does that choice become a form of conduct?" are philosophically interesting but do not produce the hook effect that a question like "Does a procedural verdict that never adjudicates the governance restructuring on its merits count as exoneration — and what does OpenAI's answer to that question imply for the $1T IPO?" produces. The redesign should mandate entity-specific, event-specific questions generated from the same overnight digest that produces the briefing, not pulled from a static rotation.

If the question is specific and tension-generating, the opening hook outperforms a thesis lede for new and returning readers in browse mode. If the question is generic, it performs worse than the thesis lede because it signals "this publication writes abstract sentences" rather than "this publication tracked something specific that happened last night."

### (ii) Share-ability advantage of a named, event-specific opening question

A closing philosophical question (current state) is private reading material. It is the kind of question someone might sit with but will not screenshot, because there is nothing in the image that signals urgency, specificity, or the reader's in-group standing.

A named, event-specific opening question is fundamentally different. Consider: "China crossed into Critical overnight — but the entire band crossing rests on a methodology category that does not yet exist in the rulebook. Should it count?" This question is screenshot-worthy because:

1. It names a specific entity that the reader's audience recognizes
2. It encodes a finding (band crossing, methodology ambiguity) that implies the reader has access to something substantive
3. It is falsifiable — the answer will be known soon, which creates urgency to share now

The qualitative gain is substantial. A thesis-led lede screenshotted produces: "this publication covered China." A named question screenshotted produces: "this publication noticed something real and is asking the right question before anyone else has framed it." The latter is the signal that drives follows, newsletter sign-ups from forwards, and PR mentions. The former does not circulate.

The current rotation questions cannot be screenshotted with any meaningful effect because they contain no proper nouns and no time stamp. Every question in the rotation bank should be replaced or supplemented with a digest-generated question that names at least one entity and one event from the most recent cycle.

### (iii) Subscription conversion: does the opening question raise or lower conversion?

It lowers conversion from free reader to Score-Watch or newsletter if the question is resolved entirely above the fold. The question functions as a hook only if the resolution requires reading further. If the digest's opening question is immediately followed by the full answer in the same visible scroll position, the reader is satisfied and exits.

Mitigations that belong in the new layout:

- The opening question should appear immediately below the briefing header (date/issue) but above Today's Analysis. It should be presented visually as a question, not as a heading that implies the answer is in the next paragraph.
- The section immediately following the question should begin Today's Analysis with a headline that invites further reading but does not fully resolve the question. The resolution of the question should emerge across the Score Change Detail and Evidence Ledger sections, not in the first two paragraphs.
- A minimal inline note beneath the question — for example, a single line reading "Full evidence record below — or receive score changes for [entity] the moment they happen" with a Score-Watch link — captures the conversion intent at peak reader engagement without interrupting the read flow.

---

## B. Reordering Risk Assessment

### (i) Score Change Detail after Signal Stack: burial or scan-match?

Signal Stack → Score Change Detail is the correct order for scan pattern. It matches how experienced readers actually read evidence-rich briefings: summary first to triage relevance, then detail for the entities that registered in the summary.

The risk is not burial — it is reader fatigue before reaching the detail. Signal Stack should be compressed enough that a reader who absorbed it can still bring curiosity to the Score Change Detail section. If Signal Stack runs long (many signals, all equally weighted), the reader arrives at Score Change Detail depleted. The fix is Signal Stack design (hierarchy, visual scannability) not section order.

For the May 18 cycle specifically — China band crossing, OpenAI hold lifted, Russia-Ukraine day 5 — the Signal Stack would reasonably surface 3-4 lead signals and 6-8 supporting signals. That is the right volume. Score Change Detail then delivers the China evidence record (EU sanctions chain, BND dock rationale, methodology category candidacy) to readers who already understand why they are reading it. This is the stronger presentation than leading with the full evidence record for an unfamiliar reader.

Verdict: keep Signal Stack before Score Change Detail. The evidence hierarchy is summary → interpretation → detail, not detail → summary.

### (ii) Score Movements near bottom: who reads it there?

The full assessed-entity list (Score Movement Dashboard) is not a general-audience section. The readers who want it are:

- **Power users:** researchers and analysts who scan the full entity list for movements in their coverage area. They will scroll to find it. An anchor link in the header matters to them.
- **Newsletter forwarders:** people who share the briefing to an audience that watches specific entities. They navigate to the section, screenshot or excerpt the relevant row, and share it. Anchor links serve them.
- **Subscribers considering Score-Watch:** they are looking for the entity they track to verify the briefing has covered it. They need fast access, not bottom-of-page discovery.

General readers — the largest group — do not need Score Movements at all; the Signal Stack and Lead Signal Card tell them the most important movements. Putting Score Movements near the bottom is correct for layout hierarchy but the section needs a header anchor prominently visible at or near the top of the page — specifically a jump link in the briefing header or date nav area.

Recommendation: add a "Jump to score movements" anchor in the DailyBriefingHeader component (the KPI grid area is the right visual location — it already summarizes entity count and change count). This converts a bottom-of-page section into a navigable destination without changing its position in the reading flow. The anchor should be visually small but present: "11 entities assessed — jump to movements" as a linked label beneath the KPI grid.

### (iii) Risk Signals last: does forward-looking close correctly for a rigor institution?

Risk Signals as a closing section produces a specific reader state: "I have been informed about the past and now I am uncertain about the future." For a general intelligence product, this is a strong close — it creates return-visit motivation. For an institution whose product is rigor, it creates a mild aftertaste of speculation, because the reader's final impression is of things that have not yet been assessed and may not materialize.

The correct closing note for a rigor institution is completeness, not anticipation. The Evidence Ledger, if placed near the end, closes with the message "this is what we know and where it came from." That is the institutional brand close. Risk Signals, placed last, closes with "and here is what we are guessing might happen next," which slightly undercuts the evidence-chain authority the rest of the briefing establishes.

Recommendation: move Risk Signals before the Evidence Ledger, not after it. The sequence becomes: Score Movements → Evidence Ledger → Sector Findings → Risk Signals is what the founder has mandated, but if there is flexibility, the preferred order is Score Movements → Risk Signals → Sector Findings → Evidence Ledger. Evidence Ledger as the final substantive section closes the briefing on provenance and documented record, which is the institutional personality this product should close on.

If the founder's mandate (Risk Signals last) is fixed: add a brief framing note to the Risk Signals section header — "Watch items tracked by the methodology pipeline" rather than "Risk signals." This shifts the register slightly from speculation to active monitoring, which is a more accurate description of what the section contains and reduces the speculation aftertaste.

---

## C. Copy and Messaging Changes Under the New Structure

### (i) Where should SubscribeCTA appear?

Currently last before legacy sections. In the new structure, the optimal placement is immediately after Score Change Detail and before Score Movements.

The scan pattern argument: a reader who has moved through the opening question, Today's Analysis, Signal Stack, and Score Change Detail has consumed the highest-value sections. They have seen the evidence, understood the methodology, and encountered the specific entities whose scores moved. This is the moment of peak engagement and peak relevance — they know what the briefing is and why it matters. Score Movements and Evidence Ledger are deep-reference sections that power users scroll to; casual readers have likely made their subscribe-or-leave decision before reaching them.

Placing SubscribeCTA after Score Change Detail captures readers at peak engagement before they hit the deep-reference taper. The current placement (last before legacy sections) captures only the readers who have scrolled the entire briefing — the most committed readers, who are also the least marginal (they would likely subscribe without a prompt).

The SubscribeCTA headline should also be rewritten for the new position. "Get the weekly compassion intelligence briefing" is accurate but passive. At the moment after reading the China band crossing evidence, the right message is closer to: "Receive score changes the moment they happen — not the next time you visit." This speaks directly to the information asymmetry the reader has just experienced.

### (ii) Headline pattern for "Today's Analysis"

The current SectionHead description is: "The most significant editorial findings in the [date] briefing." This reads as a label, not a thesis. A benchmark analysis headline should communicate that a judgment has been rendered and that the judgment is worth examining — not that findings are being cataloged.

Pattern to avoid: takeaway phrasing ("OpenAI hold lifted, score unchanged"). This resolves the question before the reader has a reason to care about the answer.

Pattern to use: thesis-with-tension phrasing that implies a judgment requiring evidence. The benchmark's institutional voice is "we have looked carefully at this and here is what we conclude, with the evidence that makes us confident and the uncertainty we are still tracking."

Three examples using May 19, 2026 themes:

1. "The procedural verdict that cleared OpenAI resolved nothing about whether the governance restructuring was sound — and the Delaware AG is now the only mechanism left to find out."

2. "China's narrowest possible band crossing raises the harder question: whether an un-formalized methodology category can bear the weight of an international accountability determination."

3. "On day 5 of the Russia-Ukraine arc, conduct distinctions are no longer episodic — they are a documented pattern, and the methodology now has a first instance of third-country vessel targeting to add to the record."

Each of these implies: (a) we assessed something, (b) we concluded something specific, (c) there is a reason this conclusion is not obvious, and (d) the evidence record below explains why we are confident. This is the structure that signals subscription value — the reader understands that tomorrow's briefing will contain another thesis like this one, and that the thesis is grounded in something real.

### (iii) Inline subscription nudge between Score Change Detail and Score Movements

Yes, an inline nudge should appear at this boundary, but at low density and in a form that is not visually interruptive.

The right form is a single-line contextual note, not a full SubscribeCTA block. For example, below the last Score Change card and above the Score Movements header:

"Watching one of these entities? Score-Watch alerts land before the briefing. $79/yr per entity."

This is one line, no form field, linked text to the Score-Watch page. It is not a conversion block — it is a contextual reminder at the exact moment the reader has just processed the evidence for an entity they may track professionally. The full SubscribeCTA block positioned earlier (after Score Change Detail, as recommended above) is the conversion surface. This nudge is the recall trigger for readers who scrolled past the CTA.

Density: once, at this one location. Do not repeat inline nudges within the deep-reference sections (Evidence Ledger, Sector Findings). Repeated nudges in reference sections signal desperation and disrupt the institutional tone.

---

## D. Lifecycle Metrics

### (i) Engagement KPIs for this redesign

Five primary KPIs, in order of decision relevance:

| KPI | Why it matters |
|---|---|
| Scroll depth to Evidence Ledger | Evidence Ledger is the deepest substantive section. Reaching it signals a reader who has engaged with the full research record, not just the summary. This is the proxy for "power user" identification. |
| Click rate on entity links within Score Change Detail | Entity link clicks are high-intent — the reader is following a specific institution across briefing and entity page. This is the closest behavioral proxy for Score-Watch purchase intent. |
| Click rate on evidence source links (external URLs in Evidence Ledger) | Source link clicks signal a reader who is verifying, not just consuming. This is the methodological trust signal — readers who click sources are more likely to treat the benchmark as authoritative and to share it as such. |
| Return visit within 7 days (return-visit-7d from /updates) | The briefing is a daily product. A reader who returns within 7 days has formed a habit or is in an active tracking posture. This is the leading indicator for newsletter conversion and Score-Watch conversion. |
| Newsletter sign-up from /updates (source=updates-subscribe-cta) | Direct conversion from briefing to newsletter. Already tracked via `source` param in NewsletterSignup. This is the most direct engagement-to-acquisition metric the redesign can move. |

### (ii) Targets

| KPI | Current baseline | Target (60 days post-redesign) | Rationale |
|---|---|---|---|
| Scroll depth to Evidence Ledger | Not measured; estimated 15-25% of sessions | 30%+ of sessions | Opening question hook and improved section hierarchy should extend active reading depth |
| Entity link click rate (Score Change Detail) | Not measured | 12%+ of sessions that reach the section | Named, linked entities in Score Change Detail + anchor accessibility from header should lift click rate meaningfully |
| Source link click rate (Evidence Ledger) | Not measured | 8%+ of sessions that reach Evidence Ledger | Source links are currently present; reaching the section is the constraint, not the link design |
| Return visit 7d | Not measured | 25%+ of new visitors return within 7 days | Tension-framed opening question creates explicit return motivation ("will China's band crossing be approved?") |
| Newsletter sign-up from /updates | Baseline in Listmonk by source | 1.5x current rate | SubscribeCTA repositioned to peak-engagement moment + rewritten headline should move this metric |

All targets are rough and should be treated as directional. Establish actual baselines in Umami for the first 30 days post-redesign before evaluating performance against targets.

### (iii) A/B test: one variant within the new structure

The highest-value A/B test within the new structure is: **opening question with entity names hyperlinked to their entity detail pages vs. opening question as plain text**.

- Control: opening question as a blockquote with no links (current DailyQuestion rendering, moved to top)
- Variant: opening question with entity slugs hyperlinked — e.g., "Does a procedural verdict that never adjudicated [OpenAI]'s governance restructuring on its merits count as exoneration?" where [OpenAI] links to /ai-lab/openai

Measurement:
- Primary: entity link click rate from the opening question (Umami event — can be added to the TrackedEntityLink component that already exists in the codebase)
- Secondary: newsletter sign-up rate from sessions where the opening question is the first interaction (scroll depth < 15% at time of sign-up click)
- Session duration difference between control and variant

Why this test: it isolates the value of named, linked entities in the opening hook. If the variant outperforms, it validates the share-ability hypothesis (named entities are the mechanism) and gives a clear directive for the question generation requirement in the overnight digest. If control wins, the question's value is reflective rather than navigational, and the entity-link investment in the question generator is deprioritized.

The test is implementable without engineering changes beyond a boolean prop on the DailyQuestion component — `linkEntities={true/false}` — which the digest data can drive via a flag in the JSON.

---

## Summary of Priority Actions

1. Mandate entity-specific, event-specific opening questions generated from the overnight digest — the rotation bank does not support the hook function.
2. Add "Jump to score movements" anchor link to DailyBriefingHeader KPI grid area.
3. Move SubscribeCTA to immediately after Score Change Detail; rewrite headline to speak to information asymmetry.
4. Add single-line Score-Watch nudge at the Score Change Detail / Score Movements boundary.
5. Rewrite Today's Analysis section headlines as thesis-with-tension statements, not takeaway labels.
6. If Risk Signals placement is flexible: move it before Evidence Ledger so Evidence Ledger closes the briefing on provenance.
7. Establish Umami baseline for all five KPIs on day 1 of redesign; run opening question A/B test for 30 days before drawing conclusions.
