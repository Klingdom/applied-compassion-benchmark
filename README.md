# Compassion Benchmark

Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering.

**Live site:** [compassionbenchmark.com](https://compassionbenchmark.com)

## What this is

Compassion Benchmark publishes comparative rankings across:
- **207 countries** and territories
- **51 U.S. states** and DC
- **447 Fortune 500** corporations
- **50 AI labs**
- **50 humanoid robotics labs**
- **144 U.S. cities** and **250 global cities**

Rankings use an 8-dimension framework: Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systems Thinking, and Integrity.

## Tech stack

- **Next.js 16** (App Router, TypeScript, static export)
- **Tailwind CSS v4** (custom dark theme)
- **Docker** (multi-stage: Node build → Nginx Alpine)
- **Nginx** with SSL via Let's Encrypt
- **Hostinger VPS** deployment

## Quick start

```bash
cd site
npm install
npm run dev        # Dev server at localhost:3000
npm run build      # Static export to out/
```

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

```bash
# On VPS
git clone https://github.com/Klingdom/applied-compassion-benchmark.git
cd applied-compassion-benchmark
chmod +x deploy.sh && ./deploy.sh
```

## Project structure

```
site/src/
├── app/              # 25 route pages
├── components/       # Shared UI (10 primitives + layout + index + interactive)
└── data/             # JSON ranking data, navigation, Gumroad URLs, dimensions
```

## Revenue model

- Report sales (Gumroad, $95-$5K)
- Data licensing ($500-$20K)
- Advisory consulting ($1.5K-$50K)
- Certified assessments ($2.5K-$150K)
- Enterprise agreements ($10K-$250K/yr)
- Assessment tools licensing ($3.5K-$28K/yr)
