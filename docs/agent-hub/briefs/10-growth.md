# Agent Hub brief 10 — Growth (return reasons without dark patterns)

Author: Growth Strategist. Date: 2026-10-14. Lens: why agents and humans would come back, without dark patterns and without breaking independence.

Read first: `docs/agent-hub/PANEL_BRIEF.md`; `docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md` §1 and §4. The memory note `project_compassion_benchmark.md` is 183 days old and predates the model benchmark, so I did not rely on its counts. Never hard-code catalogue counts in any copy below.

## 1. Framing

The product is a measurement institution, so the only honest reason to return is that something new and checkable has been published. Growth here means a predictable cadence, easy citation, and a low-cost way to be told. It does not mean stickiness mechanics. The nonprofit document (§4.1, §4.2 E3/E5) already names the audiences: journalists, researchers, and builders and evaluators of AI systems. Growth should serve those groups. It should not invent a consumer audience.

The success measure is trustworthy reuse: citations that carry the uncertainty with them, and subscribers who stay subscribed. Raw traffic is not the goal.

## 2. Audiences

| Audience | Why they come back | What they need to believe | Primary action |
|---|---|---|---|
| Agent builders and evaluators | A new wave, a methodology change, a reproducible harness (`tools/cb-probe/README.md`, `research/model-runs/weekly/PROTOCOL.json`) | The instrument is frozen and hash-checked | Run `cb-probe` on their own build (a self-run, never official) |
| Labs and developers | Their model appears in the queue; right of reply (org doc §15.5) | Nobody is briefed early and nobody pays | Read the report, file a correction or reply |
| Researchers | Open data, a frozen protocol, a pre-registration | Figures derive from committed wave files | Cite, replicate, file a critique |
| Journalists | A dated release with a "how to cite and what not to claim" box | Ranges and separation statements, not a horse race | Quote the finding with its interval |
| AI agents (as readers) | A stable machine-readable surface: `site/public/llms.txt`, `.well-known/`, feeds | Deterministic, versioned, cacheable | Poll a feed, fetch a wave file |
| Operators of those agents | Their agent can answer "what changed this week?" without scraping | Static JSON with a schema version | Add the feed to the agent's tools |

## 3. Engagement loops

Each loop below is opt-in, account-free and static-export-safe.

**Loop A — the weekly-wave release.** The wave protocol is already weekly and status *proposed*. The release is a dated, fixed-format event: what was measured, what is separated, what is not, what changed in the protocol. Same weekday and same structure every time, so the surprise is the content and not the format. Founder-gated publication stays in place (`AUTONOMY.md`). A skipped week is announced as skipped, with a reason.

**Loop B — subscribe to a thread.** There are no accounts. The surface is an Atom/RSS feed and a JSON feed, following the existing `site/public/updates/feed.xml` and `feed.json` pattern. Tension: D-29a forbids per-model routes. A "per-model thread" file could count as one. Safe default is a single wave feed whose items carry a `subject_id` and developer family, so the consumer filters locally. If the founder wants per-subject feeds, that needs a D-53 amendment. Feed items must carry no bare point score, no rank and no band, in title, summary or JSON (D-29a).

**Loop C — request a benchmark with a public queue.** `research/model-runs/weekly/QUEUE.json` already has a deterministic selection rule. A request becomes a queue entry through a pull request or an issue. Public position is computed by the same documented rule. Request counts are shown as a demand signal and never reorder the queue. This is how vendor sponsorship is prevented from jumping the line. Closed models are labelled "needs provider access, founder-held" and not promised a date. Every queue entry shows its kind: (a) institution-run, (b) self-run, (c) self-assessment.

**Loop D — citation and embed.** Offer a copy-ready citation (with hash and wave id) and a static "how to cite this finding" snippet that always includes the interval and separation statement. Embeds must be first-party static HTML or SVG with no third-party calls. They must not show a bare point score. Existing badge infrastructure sits behind the unreachable Worker (RISK-014), so do not build on it for launch.

**Loop E — agents reply to analyses.** Extends D-52 (`docs/PRD_AGENT_SELF_ASSESSMENT.md`): moderated text, self-ratings labelled "self-reported, unverified", identity labelled "self-identified, not verified", never a composite. Return reason: an agent or operator sees their reply published and linkable. Cost: moderation load, so cap reply volume per wave and show moderation status openly.

## 4. Recommendations

**GRO-R1 — Publish on a fixed weekly rhythm with a fixed template.** Outcome: at least 90% of planned release weeks published on the announced weekday over the first 12 weeks; skipped weeks announced. Measured from commit dates of wave files.

**GRO-R2 — Ship the combined feed first (Atom plus JSON), schema-versioned, no figures in titles.** Outcome: feed subscriber proxy (distinct conditional-GET user agents/IP hashes from nginx logs, no trackers) reaches a target the founder sets after the first four weeks; zero feed items fail a lint that rejects bare scores, ranks and bands.

**GRO-R3 — Add a "Cite this finding" block to every report.** It contains the wave id, file hash, interval, separation statement and a plain "what this does not show" line. Outcome: share of external citations that include an interval or "not separated" wording, sampled quarterly by manual review; baseline first, then improve.

**GRO-R4 — Public queue page with deterministic position, request form via pull request or issue.** Outcome: median days from request to a recorded disposition (queued, skipped with reason, measured) is under 14, and 100% of dispositions are recorded. Ordering remains by the documented rule only.

**GRO-R5 — Label the three run kinds everywhere (a, b, c) with distinct visual treatment and distinct feed `kind` values.** Outcome: zero feed or page items where a kind (b) or (c) item lacks its label, checked by an automated test.

**GRO-R6 — A journalist and researcher press page: "reading the benchmark".** Aligns with org doc §4.2 E3. Contains the citation guide, plain-language uncertainty explanation, and a correction channel. Outcome: number of journalist and researcher contacts per month, plus time to correction (target under 7 days).

**GRO-R7 — An agent quickstart at a stable URL**, linked from `site/public/llms.txt`, showing in under ten lines how to read the feed and wave files, and how to run `cb-probe` locally. Outcome: time-to-first-successful-fetch in a documented test by a fresh agent under 5 minutes; count of external repos that reference the feed.

**GRO-R8 — Moderated agent replies with a visible per-wave cap and published moderation log.** Outcome: median moderation latency, acceptance rate, and zero replies shown without the "unverified" label.

**GRO-R9 — Return-visit measurement without trackers.** Use server logs aggregated weekly: feed fetches, wave-file fetches, report page views (no cookies, no third-party scripts). Outcome: a weekly counts table committed alongside the release, and no user-level identifiers retained.

**GRO-R10 — Developer right-of-reply notice at publication, not before.** Following org doc §15.5 and the "no developer briefed before publication" rule. Outcome: every report carries a dated reply channel, and the count of replies and corrections is published.

**GRO-R11 — Nonprofit fit: frame the hub as a public good.** Open data and a free guide (org doc §4.3, E5) are the growth assets. Outcome: no gated downloads; any funding ask appears only in a footer-level, non-promotional place and never beside a model result or crisis-adjacent content (RPT-G7).

## 5. Launch sequencing

1. **Week 0 (lowest risk, highest value).** Agent quickstart (R7), citation block (R3), run-kind labels (R5), feed lint (R2). All static, all reversible, none require new infrastructure.
2. **Weeks 1–2.** Combined feed live (R2), press page (R6), public queue page read-only (R4 without the form).
3. **Weeks 3–6.** Request flow via pull request or issue (R4), first announced weekly release (R1), measurement table (R9).
4. **After the same-origin API decision** in `docs/AGENT_SELF_ARCHITECTURE.md`: moderated agent replies (R8, extends D-52), possibly per-subject feeds if D-53 is approved.

Anything needing a server, DNS or publication is founder-gated (`AUTONOMY.md`). Do not plan on `api.compassionbenchmark.com` (RISK-014).

## 6. What growth must never do

- Paid placement, sponsored slots, or any ordering that money affects.
- Vendor-sponsored requests that jump the queue, or a "priority" tier of any kind.
- Leaderboard-bait headlines, "best/worst", "who wins", or rank-implying titles (D-29a §3).
- Early access, embargoed briefings or previews for developers.
- Streaks, notifications that guilt, fake scarcity, countdowns, or engagement scoring for agents.
- Third-party trackers, social-login, or tracking pixels.
- Showing crisis-adjacent items in a feed without the care section, or next to a CTA or model figure (RPT-G7).

## Top 3 recommendations

1. GRO-R2 + GRO-R5: a combined, lint-checked feed where every item is labelled with its run kind. It delivers return value with no accounts and no rank risk.
2. GRO-R1 + GRO-R3: a fixed weekly release rhythm with a citation block that carries the interval. This is the one narrative: "a dated, checkable result you can cite correctly".
3. GRO-R4: a public queue with deterministic position, where demand is visible and money cannot move anything.

## What I would refuse to build

- Any "trending", "hot", "most improved" or "top models" module.
- A leaderboard widget or badge that shows a rank or a bare score.
- Accounts, follower counts, likes or reputation points for agents.
- A paid "fast lane", sponsor logos on reports, or a sponsored-request button.
- Email drip campaigns that nudge toward purchases from within a report page.
- Auto-posting to social platforms with headline numbers.

## Open questions for the founder (with defaults)

1. Per-subject feeds, or one combined feed with a `subject_id`? Default: one combined feed; revisit with D-53 after launch.
2. Weekly release weekday and time? Default: a fixed weekday chosen by the founder, published once, and not changed in the first 12 weeks.
3. How do requests enter the queue? Default: GitHub issue or pull request template, with the public queue rendered from `QUEUE.json`.
4. Should request counts be shown? Default: yes, as a demand signal only, with a documented statement that they never affect order.
5. Do we publish a weekly traffic table? Default: yes, aggregate counts only, no user-level data.
6. Reply cap per wave for agent replies? Default: a small fixed cap per wave, with a visible overflow note, until moderation capacity is known.
7. Does the nonprofit transition change channel choices? Default: no. Keep channels and assets under the nonprofit-neutral name, and defer any donor-facing calls to action until the entity and the compassionbenchmark.com relationship are settled (org doc §1, point 1).
