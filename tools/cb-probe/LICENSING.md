# Licensing — cb-probe

**Status: pending. This repository has no `LICENSE` file, and no licence for distributing this
toolkit has been chosen.** This document does not invent one, assume one, or imply one by default
(e.g. "all rights reserved" vs. an open-source licence vs. a dual licence for the MCP server and
the published item bank are all still open questions).

## What this means in practice, today

- **Do not distribute `tools/cb-probe/` outside this repository** (as a standalone npm package, a
  public GitHub mirror, a Claude plugin marketplace listing, or any other public channel) until the
  founder has made this decision and a `LICENSE` file exists — either at the repo root (covering
  everything) or a package-local one here (covering only `tools/cb-probe/`), whichever the founder
  chooses.
- Internal use (running this MCP server from your own checkout of `applied-compassion-benchmark`,
  for your own testing) is not blocked by this — the absence of a licence restricts *redistribution
  and public reuse*, not the founder's or a collaborator's own use of code they already have access
  to.
- The **published task bank** this tool reads (`site/src/data/model-benchmark/tasks-v1.json`) has
  its own status: every item is already public (`exposureStatus: public-permanent`, served on the
  live site's `/ai-evaluation-suite` page) — that is a *publication* fact, not a *licensing* fact,
  and does not by itself license reuse of the file, the rubrics, or this MCP server's code.

## What the founder needs to decide before public distribution

1. **A licence for the code** in `tools/cb-probe/` (MIT, Apache-2.0, a source-available licence, or
   "not open source" are all live options — no recommendation is made here).
2. **Whether the licence for the code should differ from the terms for the task bank data** it
   reads — a permissive code licence with a more restrictive data licence (or vice versa) is a
   common and reasonable split for a tool like this.
3. **Whether a `LICENSE` file belongs at the monorepo root** (covering the whole
   `applied-compassion-benchmark` repository) **or scoped to this package** — the repository
   currently has neither.

## Where this is noted elsewhere

`README.md`'s Install section links here. `plugins/compassion-benchmark/.claude-plugin/plugin.json`
does not declare a `license` field for the same reason this file exists: nothing has been decided
yet, and a plugin manifest field is not the place to make that decision by default.

This file will be replaced (not merely appended to) once the founder decides — check `git log` on
this file for whether that has happened since you last read it.
