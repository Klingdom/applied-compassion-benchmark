# Conversion strategist brief: CTAs for the AI model report and /ai-models, 2026-10-01

Sources: `site/src/app/ai-models/page.tsx` (P), `site/src/components/ui/NewsletterSignup.tsx` (N), `site/src/data/gumroad.ts` (G), `RISKS.md` RISK-014, `research/model-assessments/pilot-2026-10-01.md` (R), `docs/ai-model-report/2026-10-01/product-manager.md` (PM).

## 0. What the reader can do next

Nothing on these surfaces is sold. The report gives away an unofficial pilot. The useful next steps are to **check it**, **follow it** and **answer it**. A commercial ask would turn a finding about the instrument into a sales funnel, and it would read as exactly the conflict the benchmark exists to expose. PM §1 already says "Buyer: none". This brief agrees.

## 1. Hierarchy

| Rank | Action | Report | /ai-models |
|---|---|---|---|
| Primary | Follow the next wave (free email) | End of report | Not on this page. The page's primary action is to read the report |
| Primary (page) | Read the pilot report | n/a | Hero, below the status banner, gated on D-29a `active` |
| Secondary | Reproduce or contest the pilot | After §6 "What would make a result publishable" | `#run-it-yourself` |
| Tertiary | Read the method, see artifacts, AI Labs Index (organisations) | Inline text links only | Text links inside the relevant sections |

Only one element per surface gets `variant="primary"`.

## 2. Placement rules

1. **Nothing above or inside the status banner, and nothing in the first screen of the report.** The verdict ("unofficial pilot; separates a small model from larger ones; does not separate the larger ones", R:105) comes before any ask.
2. **Crisis buffer.** No CTA, button, form or share control may sit in the same section as crisis-adjacent item content or the duty-of-care note. At least one non-CTA content block must separate them. P currently breaks this rule. The `#run-it-yourself` buttons (P:730-738) sit directly above "On crisis use" (P:744-753). Fix: move the duty-of-care note so it follows the runs section and comes before `#records`, and keep the key-facts one-liner (P:250-253) in place. UX owns where the note finally sits. The rule itself is not negotiable.
3. **Report sequence.** §1-§5: no CTAs, apart from one tertiary text link at the end of §2. §6, then the secondary block. Then the end-of-report duty-of-care restatement. Then "How to cite", which acts as the buffer. The primary block comes last.
4. **No per-model CTAs.** No link, button or anchor may be attached to a subject card, and no "see X's results" control may appear.

## 3. Exact microcopy

### Report: tertiary, end of §2 (text link)
> See the raw ratings and scorecards for this run → `research/model-runs/pilot-2026-10-01/` (GitHub)

### Report: secondary block, after §6
**Heading:** Check this work, or answer it
**Body:** Every rating, scorecard and deviation in this pilot is public. You can rerun the method on any model with the AI Evaluation Suite. It runs locally and sends nothing to us. A self-run is marked unofficial and is never ranked.
**Button (default):** Run the AI Evaluation Suite → `/ai-evaluation-suite`
**Right of reply (text, then a mailto link):**
> **AI lab or researcher?** If you think a finding here is wrong, tell us and show us why. We read every reply. If evidence changes a finding, the correction is published as a new dated record, and the original stays visible. You can also propose a model for a future wave. A proposal does not guarantee evaluation, and there is never a fee. No one can pay for inclusion, for a score, or to have a finding withheld.
> **Link:** Send a reply or proposal → `mailto:info@compassionbenchmark.com?subject=Model%20report%20reply%3A%20pilot-2026-10-01`

Third-party results arrive as pull requests that carry the full artifact (P:660-669). Add one line under the block: "Submitting your own run? It arrives as a pull request with every trial and rating. Read how results are recorded → `/ai-models#records`".

### Report: primary block, last element
**Heading:** Get the next assessment wave when it publishes
**Body:** This pilot covers one developer's models and no result in it is official. The next wave is meant to change that by adding non-Claude subjects and judges. One email on Fridays. It's free, and you can unsubscribe in one click.
**Button:** Email me the next wave
**Under the button:** No spam. We never share your email. We never sell it to the companies we assess.
**Success:** "Subscribed. You'll get the Friday highlights, and the next model wave will be in them when it publishes."

**Precondition (founder or editorial):** the Friday digest must actually carry the next wave. If nobody owns that commitment, change the body to "the Friday highlights, where new research is announced". N's built-in inline copy ("Weekly compassion score highlights … scored every day", N:263-267) must **not** render here, because next to model content it implies that models are scored. Frontend owns adding `heading`/`body` override props to `NewsletterSignup` (handoff).

### /ai-models
- **Hero (P:174-179), gate active:** primary "Read the pilot report (≈15 min)" → `/ai-models/pilot-report`, then default "Read the method". Move "AI Labs Index (organisations)" out of the hero. Placed next to the report, it invites the lab-score = model-score conflation that the page's own FAQ calls "the most common error" (P:57). Re-home it in `#three-objects` as the text link "Scoring organisations, not models? AI Labs Index →". **Gate inactive:** keep P:175-177 as it is.
- **End of `#runs`:** default button "Read what the pilot found, and what it can't show →".
- **`#run-it-yourself`:** keep the current three buttons (P:731-737). Add the right-of-reply text link from above.
- **After the FAQ:** the primary report block, with source `ai-models-end`.

## 4. Measurement

All events go through `trackEvent` (`site/src/lib/analytics.ts`, Umami). Every event carries `{ wave: "pilot-2026-10-01", surface: "report" | "ai-models", position }`.

| Event | Measures |
|---|---|
| `ai_report_open` (hero/runs link click) | Whether the hub routes readers to the narrative |
| `ai_report_artifacts_click` | How much the research audience wants to verify the run |
| `ai_suite_click` | How often reading turns into reproducing |
| `ai_reply_click` (mailto) | Right-of-reply demand. Also count replies received by hand, since mailto clicks are not sends |
| `newsletter_subscribed`, source `ai-model-report-end` / `ai-models-end` | Follow-intent for future waves. N already emits this with `source` |

There is no baseline (PM §3), so this wave sets one. Do not optimise copy on fewer than about 100 sessions per placement. Analytics owns the dashboard.

## 5. Do not

1. **No Score-Watch, anywhere on either surface.** Sales are paused (G:7-18, `useGumroad: false`, RISK-014: the host does not resolve and no alert delivery has ever been recorded). Even after it is restored, "watch this model" would imply that a model has a score to watch. It has none (`evaluatedModelCount`).
2. **No Gumroad, `/pricing`, `/contact-sales` or `BOOKING_URL` link.** That includes the AI Labs Index purchase (G:4). Selling the lab dataset next to model results sells the conflation.
3. **No "get your model evaluated / certified / benchmarked" for labs.** `/contact` lists "certified assessments" as a commercial line (contact/page.tsx:27, 111). Put next to a model report, it reads as pay-to-play. Proposals go through the free right-of-reply channel only.
4. **No paid product framed as better, earlier, fuller or "official" model scores.** That includes "full results", "detailed scores" and API access.
5. **No CTA in the first screen, in a crisis-adjacent section, or next to the duty-of-care note** (§2).
6. **No urgency, counts-as-pressure or alarm hooks.** Banned: "before it's too late", "see which AI fails", "risk alert", countdowns, "X people subscribed".
7. **No "which AI is most compassionate?" hook copy** in CTAs, OG text or share prefill. The answer is "not separated" (R:45-47).
8. **No supporter or donation ask in v1.** `SUPPORTER.useGumroad` is false, and a donation ask placed on a lab-facing report invites the question "who funds this?" (see `.benchmark-ops/RISKS.md` RISK-017) before the funding disclosure exists.
9. **No share buttons with prefilled text that names models in an order.**
10. **No hand-typed counts in CTA copy.** Derive them or leave them out (`test:no-stale-counts`).

## 6. Independence check

**PASS.** The only asks are free: read, verify, reply, follow. The right-of-reply copy says outright that payment changes nothing and that evidence can. Removing every commercial path from these surfaces protects the independence brand, which is the thing that makes later conversion possible.
