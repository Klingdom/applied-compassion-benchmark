# SaaS Development Operating System

This repository is designed to support agentic software development for websites, SaaS products, and supporting systems.

## What this repo contains
- Product and system context in root markdown files
- Execution memory and operating logs in `/.claude/`
- Specialist agent definitions in `/.claude/agents/`
- Loop definitions in `/.claude/loops/`

## How work should flow
1. Start with `/PROJECT.md`, `/ARCHITECTURE.md`, and `/CLAUDE.md`
2. Review active priorities in `/TASKS.md` and `/.claude/backlog.md`
3. Use the coordinator or a specialist agent to execute
4. Validate changes with build, test, lint, and runtime checks
5. Record learning in the Claude operating files

## Core operating files
- `/CLAUDE.md`: global operating contract
- `/PROJECT.md`: product definition and goals
- `/ARCHITECTURE.md`: technical design and constraints
- `/CONSTRAINTS.md`: non-negotiable guardrails
- `/TASKS.md`: active work queue
- `/EVALUATION.md`: success criteria
- `/.claude/system.md`: practical day-to-day execution rules
- `/.claude/memory.md`: evolving operational memory
- `/.claude/backlog.md`: prioritized backlog
- `/.claude/decisions.md`: decision log
- `/.claude/experiments.md`: experiment register
- `/.claude/metrics.md`: measurable outcomes
