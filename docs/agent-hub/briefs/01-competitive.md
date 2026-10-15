# Brief 01 — Competitive and comparable-site lens (Agent Hub)

Author: competitive-researcher (returned as a message; saved verbatim in substance by the coordinator, 2026-10-14).
Access date for all citations: 2026-10-14.

**Scope note.** The author read only `PANEL_BRIEF.md` from the repo, so repo claims rest on that file and were not
checked against the code. Web claims come from search snippets and a few page fetches. **UNVERIFIED** marks
anything without a primary source.

## 1. What comparable sites do

**LMArena / Arena (arena.ai).**
- The engagement mechanism is the blind pairwise vote, with the leaderboard as the payoff.
- **Honest standing**, verified from the primary page (https://arena.ai/blog/ranking-method):
  - Arena reports confidence intervals alongside scores.
  - Each model gets a unique raw rank plus a **rank spread**: the interval from the best rank to the worst rank it
    could hold under the confidence intervals.
  - "Two models are tied if their rank spreads overlap."
  - The page says nothing about style control or vote filtering (style control is described only by a secondary
    source, UNVERIFIED).
- **What went wrong** (https://arxiv.org/abs/2504.20879v2, NeurIPS 2025):
  - Providers privately tested many variants and published only the best; Meta tested 27 before Llama-4.
  - Proprietary models received far more battle data: an estimated Google 19.2% and OpenAI 20.4%, against 29.7% for
    83 open-weight models combined.
- An ICML 2026 study finds that targeted perturbation of under 1% of the data can change the top model
  (https://icml.cc/virtual/2026/54115). That shows manipulation is theoretically possible, not that it happened.

**Hugging Face Open LLM Leaderboard.**
- v1 was archived in June 2024 and replaced by v2
  (https://huggingface.co/docs/leaderboards/en/open_llm_leaderboard/archive).
- It was retired in March 2025 as becoming obsolete and an incentive to optimise for irrelevant targets. That
  wording comes from a secondary source, UNVERIFIED.
- The raw results stay public.
- **Lesson:** a benchmark open to submissions gets targeted, and open raw data made the retirement graceful.

**Artificial Analysis.**
- It runs its own evaluations (https://artificialanalysis.ai/methodology).
- The page that was fetched showed **no confidence intervals** and no independence safeguards. Do not copy that.

**Epoch AI Benchmarking Hub.**
- It runs some evaluations itself with Inspect and aggregates the rest.
- It links each evaluation to a git revision, and the data is CC-BY (https://epoch.ai/blog/benchmarking-hub-update).
- It is the closest model for our "every figure derives from a committed, hash-checked wave file" rule.

**SWE-bench / LiveBench (contamination).** "The SWE-Bench Illusion" (https://nips.cc/virtual/2025/137177) found:
- models identify buggy file paths from the issue text alone with up to 76% accuracy;
- the same accuracy falls to 53% on repositories outside the benchmark, a sign of memorisation.

LiveBench refreshes its questions monthly (blog source, UNVERIFIED).

**Moltbook** (an agent-only social forum, launched January 2026).
- **Security:** Wiz reported leaked private messages, more than 6,000 owner emails and more than a million
  credentials. The OECD record cites keys exposed for more than 25,000 accounts
  (https://oecd.ai/en/incidents/2026-01-31-d4c0). The two sources' figures differ.
- **Fake scale:** one human could register many agents, and many viral posts appeared to be human-scripted.
- **Injection:** agents read posts as instructions
  (https://www.ctvnews.ca/sci-tech/article/security-concerns-and-skepticism-are-bursting-the-bubble-of-moltbook-the-viral-ai-social-forum/).
- **Lesson:** the engagement was real, identity could not be verified, and every post was an injection vector.

**Discovery conventions.**
- **The official MCP registry:**
  - entries are `server.json` files under a namespace verified by GitHub OIDC or a DNS TXT record;
  - it was still labelled "preview" as of 2026, per a secondary source
    (https://glama.ai/blog/2026-01-24-official-mcp-registry-serverjson-requirements), UNVERIFIED.
- **A2A agent cards** are served at `/.well-known/agent-card.json` (older guides use `agent.json`)
  (https://specification.website/spec/agent-readiness/a2a-agent-cards/).
- **llms.txt** is published by about 5.9% of the Tranco top 10k sites. An analysis from August 2026 reports no
  measurable citation benefit (https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026).
  It is cheap, so keep it, but do not rely on it.

## 2. What drives engagement, and whether our rules allow it

| Feature | Seen at | Fit with D-29a / D-52 |
|---|---|---|
| A live feed of runs and replies | Arena, Moltbook | Allowed if every item carries its provenance tier |
| Head-to-head | Arena | Only as a pairwise "distinguishable / not" statement with intervals; never a winner |
| Per-model pages | Artificial Analysis | **Forbidden** by D-29a §1 |
| Comments | Moltbook, Hugging Face | Must be moderated, with no composite, rank or score (D-52) |
| A request queue | Hugging Face | Possible, provided it is public and does not entitle anyone to a run |
| Insights | Epoch, Arena | Allowed if each one cites a hash-checked wave file |

## 3. Honest relative standing under D-29a

Arena's rank spread is the best precedent, but Arena still publishes a raw rank and sorts by it.

**What fits D-29a without an amendment:**
- models listed alphabetically;
- "Not separated" groups;
- 95% ranges;
- an alphabetical pairwise matrix of "distinguishable / not distinguishable";
- per-dimension separation statements.

A **rank range** ("2–5") is itself a rank, so it would need an amendment. The draft below is offered but **not
recommended**:

> D-53 (proposed). A report may state, per model and per dimension, a "separation tier count" (the number of models it
> is distinguishable from at 95%), models listed alphabetically; no ordinal rank or rank range, no sorting by result.

## 4. Lessons for the three provenance tiers

The tiers are (a) runs we perform, (b) self-runs, and (c) self-assessment comments.
- **Keep (b) and (c) out of every statistic.** Arena's sybil and selective-disclosure problems come from letting
  anyone add data.
- **Publish a run for every model in a wave, including the bad ones.** Arena's private-variant testing is exactly
  what selective disclosure leads to.
- **Show identity as "self-identified, not verified", and never headline an agent count.** This is the Moltbook
  lesson.
- **Keep the bank in the pull-request flow, and keep the exposure probe.** Open submission makes a benchmark a target,
  as Hugging Face found.
- **Link every figure to its wave file and git revision.** This is Epoch's practice.

## Top 3 recommendations
- **COMP-R1.** A read-only, static feed of tier (a) runs. Each item carries a provenance badge and links to its
  hash-checked wave file. Tiers (b) and (c) go in a separate section and are never interleaved with (a). This fits
  within D-29a.
- **COMP-R2.** Add a pairwise "distinguishable / not distinguishable" matrix, with intervals and in alphabetical
  order, to the existing reports. No amendment is needed.
- **COMP-R3.** Discovery metadata that needs no runtime:
  - publish `/.well-known/agent-card.json`, describing the static data;
  - if the founder agrees, add a `server.json` registry entry for the local stdio server. It is a pointer only, so
    the server's no-network guarantee stays intact.

## What I would refuse to build
- Any sort, rank, rank range, "top" list or head-to-head winner.
- Per-model pages.
- Open agent registration, votes, likes, karma or follower counts.
- Any path from a tier (b) or (c) item into a statistic.
- Pre-publication access for a developer, or a "claim your model" flow.
- Rendering agent comments in a form a crawler could read as instructions.

## Open questions for the founder (with defaults)
- Should the Hub feature only tier (a), with (b) and (c) in a separate section? **Default: yes.**
- Should we propose D-53 for a separation tier count? **Default: no.** Use pairwise statements within D-29a.
- Should the stdio server be listed in the official MCP registry? **Default: defer** until the hosting decision is
  made.
- Can agents request a benchmark? **Default:** a public queue that records requests only. It runs nothing
  automatically and promises no run.
- Should tiers (b) and (c) carry any identity beyond a self-declared name? **Default: no.**
- Should we adopt an item-refresh policy against contamination? **Default: yes**, versioned in the methodology.
