# CLAUDE.md — Compassion Benchmark

## What this project is

Compassion Benchmark (compassionbenchmark.com) is an independent benchmark institution that measures how institutions recognize, respond to, and reduce suffering. The site publishes comparative rankings across governments, corporations, AI labs, and robotics labs, and sells digital research assets.

## Tech stack

- **Framework**: Next.js 16 (App Router, TypeScript, static export)
- **Styling**: Tailwind CSS v4 with custom theme in globals.css
- **Data**: Structured JSON files in `site/src/data/indexes/`
- **Deployment**: Docker (multi-stage: Node build → Nginx Alpine) on Hostinger VPS
- **SSL**: Let's Encrypt via Certbot container
- **Payments**: Gumroad (external links, no server-side integration)

## Folder structure

```
applied-compassion-benchmark/
├── site/                          # Next.js application
│   ├── src/
│   │   ├── app/                   # 25 route pages
│   │   ├── components/
│   │   │   ├── ui/                # 10 shared UI primitives
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── index/             # RankingTable, IndexHero
│   │   │   ├── purchase/          # ResearchConfigurator
│   │   │   └── assessment/        # SelfAssessment
│   │   └── data/
│   │       ├── indexes/           # 7 JSON ranking data files
│   │       ├── nav.ts             # Navigation link definitions
│   │       ├── gumroad.ts         # Centralized Gumroad URLs
│   │       └── dimensions.ts      # 8 dimensions, 40 subdimensions
│   ├── scripts/
│   │   └── extract-rankings.mjs   # HTML → JSON extraction script
│   ├── next.config.ts             # output: 'export'
│   └── package.json
├── legacy-html/                   # Original static HTML (reference)
├── Dockerfile                     # Multi-stage build
├── docker-compose.yml             # Web + Certbot containers
├── nginx.conf                     # HTTP config
├── nginx-ssl.conf                 # HTTPS config with redirects
├── deploy.sh                      # One-step VPS deployment
└── .claude/agents/                # Specialist agent definitions
```

## Dev commands

```bash
cd site
npm install          # Install dependencies
npm run dev          # Dev server at localhost:3000
npm run build        # Static export to out/
npm run extract      # Re-extract ranking data from legacy HTML
```

## Key conventions

- All pages are statically exported (no server-side rendering)
- Internal links use Next.js paths without .html extensions
- External links use `external` prop on Button or plain `<a target="_blank">`
- Gumroad URLs are centralized in `site/src/data/gumroad.ts`
- Ranking data lives in JSON, not hardcoded in pages
- UI components in `components/ui/` match the legacy CSS design system exactly
- The design is dark theme only — all colors defined in globals.css @theme
- Nginx handles legacy URL redirects (.html extensions, renamed routes)

## Independence policy (product rule)

Entities never pay for inclusion, score changes, or suppression of findings. Commercial services support access, interpretation, and institutional use only. This separation must be preserved in all content and code.

## Data notes

- Fortune 500: 447 companies with full scores
- Countries: 193 of 207 (14 not in source HTML)
- US States: 21 of 51 (ranks 9-38 not in source HTML)
- AI Labs: 50 labs with HQ and sector
- Robotics Labs: 50 labs with category and country
- US Cities: 144 cities with region
- Global Cities: 250 cities with country and region
