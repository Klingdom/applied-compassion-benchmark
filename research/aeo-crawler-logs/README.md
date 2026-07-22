# AEO Crawler Logs

This directory holds **committed, dated summaries** of AI answer-engine
crawler traffic (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.),
produced nightly by `research/scripts/crawler-log-scan.mjs`.

## What's here

- `YYYY-MM-DD.json` — one file per day, append-only (never edited after the
  fact). Each file contains:
  - `summary` — totals per tracked bot, plus the date range covered by the
    log data available at scan time.
  - `bots` — per-bot breakdown: hits, and the top ~15 request paths crawled
    (so we can see which entity/index pages each answer engine is reading).
  - `answerEngineReferrals` — secondary signal: hits with a `Referer` header
    from a known answer-engine domain (chatgpt.com, perplexity.ai, etc.),
    meaning a human clicked through from that engine's answer UI.

## What's NOT here

Raw Nginx access logs are **never** committed. They live on the host at
`./logs/nginx/access.log` (mounted into the `web` container per
`docker-compose.yml`) and are excluded via `.gitignore` (`logs/`). Raw logs
contain visitor IP addresses and are large — only the derived, IP-agnostic
summaries in this directory are tracked in git.

## How the data gets here

`research/scripts/crawler-log-scan.mjs` reads the persisted access log,
parses Nginx's default `combined` format, tallies bot/referral hits, and
writes the dated JSON summary here. See that script's header comment for
usage and the recommended nightly schedule slot (documented in
`research/SCHEDULING.md`).
