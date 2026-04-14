# Architecture

## Default stack
- Frontend: Next.js or modern React framework
- Backend: FastAPI, Node.js, or equivalent service framework
- Database: Postgres
- Cache/queue: Redis where needed
- Auth: standard session or token-based auth with role-based access controls
- Infra: Docker, CI/CD, cloud deployment, managed storage, observability tooling

## Architectural principles
- Separate presentation, business logic, and persistence concerns.
- Prefer modular services over premature microservice sprawl.
- Keep APIs explicit and versionable.
- Use typed contracts between layers.
- Design for observability from the start.
- Protect user data and secrets.
- Default to idempotent, testable backend workflows.

## System concerns
- authentication and authorization
- tenant and account boundaries if SaaS is multi-tenant
- auditability for important actions
- rate limiting and abuse protection
- analytics instrumentation
- rollback-friendly deployment patterns

## Documentation expectations
Update this file when any of the following changes:
- major architectural pattern
- primary framework or infrastructure selection
- data model boundaries
- security model
- deployment topology
