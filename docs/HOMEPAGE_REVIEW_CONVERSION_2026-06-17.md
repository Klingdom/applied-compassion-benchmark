# Home Page — Conversion / Path-to-Action Review (2026-06-17)

Authored by conversion-strategist (returns findings inline; persisted by coordinator). Goals: G1 knowledge acquisition, G2 methodology understanding, G3 viewing the daily briefing. Surface: `site/src/app/page.tsx` (+ NewsletterSignup, latest.json, Button).

**Verdict:** all three goals are present but none is the *primary* action. The hero's CTAs are "Explore Indexes / Read Methodology / Purchase Research" — the daily briefing is not in the hero at all, first appears ~5 sections down, and on a zero-proposal day can fail to render. The freshest, most trust-building asset is buried and conditionally invisible.

**Highest-leverage move:** a live, always-on "Today's briefing" hero teaser using the real `headline` as the hook, with "Read today's briefing →" as the single primary CTA and "How the benchmark works" secondary.

## Ranked findings (Priority = I + SA + LV + C − E − R)
1. **P16 — Briefing teaser silently disappears on zero-proposal days (bug).** Section gated on `scoreChangesArr.length>0 || highlightsArr.length>0` (`page.tsx:203`); `scoreChangesArr` reads `updates.scoreChanges` which the current schema doesn't emit; the score-change cards render empty today. Make the section UNCONDITIONAL; lead with `headline`; fall back to `topSignals`/`recentAssessments`; "0 changes — 1,160 scanned, all confirmed" is itself a credible signal. [G3]
2. **P14 — Briefing absent from hero; primary CTA is "Explore Indexes."** Restructure: primary "Read today's briefing →" (/updates), secondary "How the benchmark works" (/methodology), tertiary "Browse indexes"; **drop "Purchase Research" from the hero**; add a one-line live hook from `updates.headline` + date. [G3/G1]
3. **P12 — Use the real headline; stop truncating.** Render `updates.headline` full as the teaser lead (not the generic "Today's research"); relabel eyebrow "Today's briefing · {date}". [G3]
4. **P12 — Collapse the two duplicate "View full briefing" CTAs** into one primary, benefit-framed ("Read the full June 17 briefing — 19 entities →"). [G3]
5. **P11 — Re-place the newsletter to the post-briefing intent peak** ("Liked today's briefing? Get the week's findings every Friday — free"); keep the (already strong) cadence honesty. [funnel]
6. **P11 — Final CTA → the daily-habit close**, not "Explore Indexes / Contact Sales"; demote Contact Sales to tertiary. [G3]
7. **P10 — Hero subhead benefit-first** ("score how ~1,160 governments, companies, AI labs & cities recognize and reduce suffering — re-examined every weekday, sourced, free"). [G1/G2]
8. **Trust audit: no dark patterns found** (no timers/scarcity/alarm bait; newsletter sets honest free/weekly expectations). One caution: keep the red/green score-change framing strictly delta-driven so a quiet day reads "confirmed," not alarm.

Independence: all moves PASS — they lead with free research, demote the commercial ask, and preserve the no-pay-for-rankings posture.
