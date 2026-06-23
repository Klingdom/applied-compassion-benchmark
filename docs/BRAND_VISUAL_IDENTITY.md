# Brand & Visual Identity Brief — Compassion Benchmark

Source: 6-lens design panel (ux-designer, dataviz-architect, growth-strategist, market-research, seo-aeo-architect, frontend-engineer), 2026-06-23. Consolidated by coordinator. This is the spec for the first real logo + visual-system elevation.

---

## 1. Positioning the identity must express (growth-strategist)

**Signal, in priority order:** Independent → Rigorous → Authoritative → Humane.

**Must NOT look like:** a charity/NGO (no hearts, hands, soft gradients, rounded type), an activist org (no fist/protest), an ESG-tech startup (no leaf-and-data icon, no navy+teal SaaS gradient), a government agency (no seals/crests), or an academic department.

**The tension, resolved:** "measurement institution" (gravitas) + "compassion" (human stakes) = **forensic gravity** — a precise instrument applied to a human subject. Cold precision, warm subject, held in one frame. The full name, legibly set, is the primary authority signal.

**The test for every decision:** *"Does this make a skeptical Financial Times journalist more likely to write 'according to the Compassion Benchmark'?"*

---

## 2. The recommended logo: "The Calibrated Arc" (ux-designer)

A graduated **arc** (gauge / protractor / scale = measurement) that is simultaneously an **open, upward, palm-up form** (offering, regard, attentiveness = compassion), with a **pivot dot** at the center (the single human at the heart of what is measured). One shape does both jobs; no symbol bolted onto another.

Why it wins: works at 16px (favicon), monochrome-safe, colorblind-safe (no color is load-bearing), three SVG elements, institutional not cute.

SVG construction sketch (36×36 viewBox):
- Arc: `d="M4,22 A14,14 0 0 1 32,22"`, stroke ~2.5, round caps.
- 7 radial ticks inward from the arc at 0/30/60/90/120/150/180°; the 90° (top/center) tick longer (the scale midpoint).
- Pivot dot: `cx=18 cy=22 r~2.5`, `fill=currentColor`.
- Favicon reduction (16px): arc + one center tick + pivot dot only.

Alternatives considered: "Vernier Scale" (collapses at favicon size), "Evidence Thread" (reads as a generic document icon). Both rejected.

**Wordmark:** "Compassion Benchmark" in a confident grotesque/transitional sans (DM Sans 700 suggested, OFL-licensed), tracking ~0.3px. "Compassion" in `--color-text`, "Benchmark" in `--color-muted` for a one-point hierarchy. Mark + wordmark lockup (horizontal for navbar, stacked for OG/badges). The name must read at footnote scale (10pt citations, chart credits, badges).

---

## 3. Color system + the critical fix (dataviz-architect)

**CRITICAL COLLISION (must fix):** the brand accent `--color-accent` is `#7dd3fc` — the **exact same hex as the "Exemplary" band color**. The brand color is literally a data verdict: every link, focus ring, and background glow silently reads "Exemplary," even on a page about a Critical (red) entity. This is an encoding-integrity failure for a benchmark.

**Resolution:** move the brand off cyan onto blue; let cyan mean *only* "Exemplary."
- `--brand-primary: #3b82f6` (logo mark, primary buttons, active nav)
- `--brand-deep: #1d4ed8` (gradient anchor, hover, dark-on-light logo)
- `--brand-tint: #93c5fd` (links/accent on dark — replaces `#7dd3fc` as `--color-accent`)
- Keep `--color-accent-2: #60a5fa` (already off the band scale; the page glows are already this blue).

**Keep (best-in-class already):** the navy ramp (`#0b1220`→`#1a2a46`), the text ramp (`#e8eefb`/`#b8c6de`/`#8fa3be`), the warm→cool 5-band sequence (red Critical → cyan Exemplary), and **red-as-bad** (correct for a suffering/harm scale).

**Colorblind safety (must add):** Critical-red `#f87171` and Established-green `#86efac` collapse together under deutan/protan vision — the single most important distinction on the site. Fix with redundancy (never color alone): band **label + left→right position** always present, a **monotonic luminance** ramp (legible in grayscale), and an **endpoint texture** (`<pattern>` hatch on Critical) in dense charts. Keep Exemplary on cyan (blue channel survives CVD).

**Light surfaces (OG/email/print):** add a parallel light token set + a darkened light-band ramp (e.g., Critical `#dc2626` … Exemplary `#0284c7`) so the brand survives off the dark theme.

> OPEN DECISION (the one real fork): dataviz recommends **blue** (low-risk; the site already feels blue; blue = institutional/trust). market-research notes the entire rating-agency cohort clusters on blue, so a **differentiated non-blue dark** (deep slate/graphite/indigo) would stand out more. Both fix the collision. Pick: *blue for trust-by-convention* vs *non-blue for distinctiveness.*

---

## 4. Best-in-class patterns to adopt (market-research)

Best institutional identities (MSCI, Morningstar, S&P/Moody's, Brookings, CFR, Bloomberg, Our World in Data) share: **wordmark or wordmark + minimal abstract geometric mark** (never pictorial), **extreme restraint** in the logo zone, **typographic confidence** (a grotesque/transitional sans — not geometric=tech, not humanist=NGO), **color discipline** (one primary + one accent), and **data visualization as the decorative layer** (no illustration/photography). Ownable gap: the rigorous-measurement register applied to *compassion* — "I've never seen an institution measure this, but this is exactly how one should look."

Website elevation worth adopting: data tables as first-class design objects; typographic hierarchy as the navigation system; color reserved for encoding meaning; editorial/briefing-register copy; methodology featured (not buried); print-quality PDF artifacts; data-viz as the primary imagery (no stock photos).

---

## 5. Visual-system elevation beyond the logo (ux-designer)

- **Typographic scale** (display/headline/title/body/label/micro) defined as tokens with `clamp()` for mobile.
- **Band palette as a brand signature:** a 3px red→cyan gradient hairline under the navbar (communicates the whole scale before a word is read); subtle band-colored glow behind top-ranked score badges. Never use band colors in nav/headings/buttons/body.
- **Spacing rhythm** on a 4px base; **panel elevation** system (3 depths + one S3 shadow for overlays); **micro-interaction restraint** (120ms ease only; NO scroll reveals, parallax, or score count-ups — those read "startup").
- **Imagery stance:** none. Data diagrams only. Keep dark-only (no light/dark toggle — it's an identity choice).
- **Accessibility:** add a global `:focus-visible` ring (2px `#7dd3fc`/brand-tint, offset 3px). Use `currentColor` throughout the mark for forced-colors mode.

---

## 6. Asset suite + discoverability (seo-aeo-architect)

Today's gaps: no logo asset; `Organization` JSON-LD omits `logo`; favicon.ico only; **entity + index pages have NO OG image** (only briefings do) → blank social cards on ~1,160 pages.

Asset matrix to produce from one SVG master: `favicon.ico` (16/32/48), `app/icon.svg`, `app/apple-icon.png` (180, opaque, padded), maskable PWA icons (192/512, art in 80% safe zone) + `app/manifest.ts`, **default OG 1200×630** (`public/og/default.png`), `public/logo.png` (≥512² for schema), mono + reversed marks, print/email PNGs.

Schema fix (once `logo.png` exists) — add to `organizationJsonLd` in `layout.tsx`, with a stable `@id` so every briefing's `publisher` can reference it:
```jsonc
"@id": "https://compassionbenchmark.com/#organization",
"logo": { "@type": "ImageObject", "url": "https://compassionbenchmark.com/logo.png", "width": 512, "height": 512, "caption": "Compassion Benchmark" },
"image": "https://compassionbenchmark.com/og/default.png"
```
Plus a site-wide default `openGraph.images` in root metadata → fixes blank cards on all entity/index pages at once. Highest-leverage non-favicon asset.

---

## 7. Implementation plan (frontend-engineer)

- **`<LogoMark>`** — single inline-SVG **server** component in `components/ui/`, props `size`, `variant` (color/mono/reversed), `markOnly`. Replaces the placeholder div in `Navbar.tsx`; add to `Footer.tsx`.
- **Tokens** — additive in the existing `@theme inline` block in `globals.css` (don't rename existing tokens). Decouple `--color-accent` from `#7dd3fc`.
- **Icons** — STATIC files only (`output: 'export'` blocks `icon.tsx`/Route Handlers): commit `app/icon.svg` + `public/logo.png`; rasterize `app/apple-icon.png` via the existing `@resvg/resvg-js` (already an optional dep).
- **OG** — share the mark's path via a `logoPath` constant so `build-og-images.mjs` can embed it (keep satori to basic `path`/`rect`; keep the try/catch-skip so the build never breaks).
- **Effort:** essential path (component + navbar/footer + static icon + schema) ≈ 3–4h; full asset suite + OG + color migration is a follow-on.

---

## Recommended sequence
1. Decide the **brand color** (blue vs differentiated non-blue) — the one open fork.
2. Build the **Calibrated Arc `<LogoMark>`** in the chosen color; wire Navbar + Footer.
3. **Decouple brand from cyan** in `globals.css` (fix the encoding collision) + colorblind redundancy in chart primitives.
4. Ship `logo.png` + the **Organization.logo schema fix** + the **default OG card** (fixes ~1,160 blank social cards).
5. Backfill icons (icon.svg/apple-icon/manifest/maskable) + the mark into OG cards.
6. Visual-system tokens (type scale, spacing, focus ring, band hairline).
