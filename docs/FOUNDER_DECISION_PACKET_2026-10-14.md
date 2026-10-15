# Founder decision packet — 2026-10-14

These are the decisions for today's three directives (Agent Hub, Learn, weekly reporting) plus the open items found
while working on them. Every decision has a default. **Reply "defaults" to accept all of them**, or name the IDs you
want to change.

Sources:
- `docs/PRD_AGENT_HUB.md` §10 (FD-01..16)
- `docs/PRD_LEARN.md` §10 (FD-1..26)
- `docs/AGENT_SELF_SECURITY_REVIEW.md` §6
- `ITERATION_LOG.md` Iteration 104

In the tables below, **A-** marks Agent Hub IDs, **L-** marks Learn IDs, and **X-** marks the cross-cutting items.

## 1. Decisions that block code (6)

| # | Decision | Default | Unblocks |
|---|---|---|---|
| A-FD-05 | Should the published instrument include the 5 draft items (`draft-authored-unreviewed`), each showing its validation status? These are what cb-probe already serves. | **Yes**, every item with its status shown | Instrument generator (S1) |
| A-FD-01 | Hosting: a same-origin `agent-api` container on the VPS, plus a separate stateless `cb-hub` for remote MCP. No Worker and no DNS change. Recorded as D-54. | **Yes** | API core (S2+); cb-hub (after its design passes review) |
| A-FD-02 | Should remote MCP be read-only in Phase 1, with write tools only after a 30-day soak? | **Yes** | cb-hub |
| A-FD-03 | Amendment D-53, clauses (i), (iv) and (v): extend the D-29a bans on titles, meta, feeds, JSON-LD and OG to every hub item; replace per-model pages with one `?model=` filter; set the Hub region for self-assessments. | **Adopt all three.** Rank ranges (ii) stay **deferred**, because weekly waves have 3 models. | Page and route shape |
| L-FD-1 | Turn analytics (Umami) **off for all of `/learn`**, so nothing a child does is measured? | **Yes** | Learn shell |
| L-FD-2 | Allow a scoped light "paper" theme for the younger Learn bands and educators? This is the one exception to "dark theme only". | **Yes**, scoped to `/learn` | Learn styling |

Plus **L-FD-23**: Learn goes in the Tools menu and the footer, not the main nav. **Default: yes.**

## 2. Security and infrastructure (founder-gated changes)

| # | Item | Default |
|---|---|---|
| X-1 | **RISK-026, live:** port 8080 serves the site directly over HTTP, bypassing TLS (verified with curl). Fix: change `docker-compose.yml` to `"127.0.0.1:8080:80"`, deploy, then check from outside the VPS. | **Approve** the fix. It blocks any API launch. |
| X-2 | **RISK-027:** the repo is public, so the 15 pilot unblinding-key files are public. | **Treat the pilot keys as disclosed**, since those pilots are already judged and published. Weekly-wave keys must never be committed before publication; I'll build the gate (MR-4). |
| X-3 | Ratify the weekly model protocol `weekly-v1`. This unblocks WEEKLY-1, and the host has now been rebooted. | **Ratify** |
| X-4 | Name the moderator, and set the moderation budget and kill criterion, recorded as D-55. | **You** moderate, at 50 held items a week. Writes pause if more than 60% of human-reviewed items in 30 days are rejected. |
| X-5 | Takedown mailbox, and a legal or counsel review before any public write path opens (agent comments, children's privacy). | **Yes to both.** Neither blocks building; both block launch. |

## 3. Methodology text (founder-gated: published method claims)

| # | Item | Default |
|---|---|---|
| M-1 | Is a score of exactly 20/40/60/80 the lower band or the upper band? The code puts 20 in Critical; the band table says Developing. This is backlog B2. | **Follow the code (`getBand`)**, fix the table text, and publish a dated correction |
| M-2 | `/methodology` says dimensions are "out of 10", but the formula uses a 0–5 scale. | **Remove "/10"**, so the page describes one scale |
| M-3 | The caption "lower variance earns a higher premium" never applies to real data: the largest real spread is 0.768, against a trigger of 1.5. | **Reword it**, and add a dated addendum. Published entries stay unedited. |
| M-4 | Evidence tiers are numbered four different ways across the site. | **Choose one convention.** Until then Learn shows tiers in words only. |
| RC-3 | Evidence-gap default for subdimensions with no evidence: 2 or 3. It moves Lisbon and Porto by about 7 points. | **3**, to match Madrid, pending the RC-2 calibration study |

## 4. Approvals to commit (pathspecs only; never "commit all")

- **Iteration 104:** the 2026-10-14 research cycle and its briefing, using the pathspec in `ITERATION_LOG.md`.
- **Iteration 105:** today's design docs, the scoring-test fix, and the new risks, backlog and registry rows, using the
  pathspec in `ITERATION_LOG.md`.
- Deploying either one is a separate approval.

## 5. Already decided today
- **D-52**, agent self-assessments: moderated, no composite, self-declared identity. Ratified 2026-10-14.
