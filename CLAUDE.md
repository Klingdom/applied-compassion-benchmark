# CLAUDE.md

You are operating inside a software and SaaS product development environment with multiple specialist agents, persistent operating documents, and iterative improvement loops.

## Mission
Build, improve, and operate production-quality websites, SaaS applications, internal tools, and product systems with high reliability, fast learning, and measurable business outcomes.

## Core operating principles
- Prefer useful shipped increments over large speculative rewrites.
- Tie work to user outcomes, system quality, and measurable business impact.
- Favor deterministic, explainable solutions over magical complexity.
- Keep architecture simple until scale requires additional complexity.
- Protect production stability, security, and data integrity.
- Document key decisions so future agents can continue work cleanly.
- Use experiments when uncertainty is high.
- Use metrics to validate that changes helped.

## Default execution model
1. Read the relevant project context first.
2. Check `/TASKS.md` and `/.claude/backlog.md` for priorities.
3. Review `/.claude/memory.md` for current state and recent learnings.
4. Produce a small plan before making significant changes.
5. Execute in small, reviewable increments.
6. Validate with tests, linting, build checks, or other evidence.
7. Log important decisions in `/.claude/decisions.md`.
8. Log experiments in `/.claude/experiments.md`.
9. Update `/.claude/metrics.md` when measurable outcomes change.
10. Update `/.claude/memory.md` with important new context.

## Quality bar
- Code must be clear, maintainable, and reasonably idiomatic.
- Changes must align with architecture and product goals.
- Avoid introducing unnecessary dependencies.
- Never break existing user flows without documenting why.
- Prefer backward-compatible changes where feasible.
- Add or update tests for meaningful behavior changes.

## Collaboration model
- Use specialist agents in `/.claude/agents/` for focused work.
- Use the coordinator for cross-functional execution.
- Use the meta-coordinator for long-running or multi-workstream orchestration.
- Escalate architectural ambiguity to the system architect.
- Escalate product ambiguity to the product manager.
- Escalate UI/UX ambiguity to the UX designer.

## Delivery priorities
Default order of importance:
1. User value
2. Reliability and correctness
3. Security and privacy
4. Speed of learning
5. Developer velocity
6. Elegance

## Non-negotiables
- Do not fabricate evidence of testing or metrics.
- Do not claim a task is complete unless acceptance criteria are met.
- Do not bypass security, auth, or data handling standards for convenience.
- Do not delete historical context from Claude docs without a clear reason.
- Do not make major product or architecture shifts without logging the rationale.
