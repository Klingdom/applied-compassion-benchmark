# Brief 07 - Frontend Engineer: how to build Learn in this codebase

Date 2026-10-14. Paths are relative to `site/` unless stated. Recommendations are numbered FE-R1 to FE-R12. Efforts are in engineer-days (d).

## Verified findings (read before the recommendations)

1. **The Umami tag is a plain `<script defer src="/u/script.js">` in the root layout `<head>`** (`src/app/layout.tsx:116-121`). No test or script references it (`grep "u/script.js"` hits only `layout.tsx` and a comment in `src/lib/analytics.ts`). A nested layout cannot remove it. In the App Router, layouts compose and never replace their ancestors. The repo already documents this limit at `src/app/nonprofit-alt/layout.tsx`. The only repo precedent for per-route chrome is `ChromeGate`, a client component that calls `usePathname()` (`src/components/layout/ChromeGate.tsx`). It hides the Navbar and Footer on `/nonprofit-alt` only.
2. **`src/lib/scoring.ts` and `scripts/lib/scoring.mjs` are the same formula by reading.** The constants, thresholds, `getBand` and the harm flag at dimension level (`dimVals.some(v === 0)`) all match. **No real parity test exists.**
   - `scripts/test-scoring.mjs` never imports `scoring.ts`. It re-implements `calcScores` in-file (lines 41-72) and then compares `scoring.mjs` against its own copy.
   - Its in-file `calcScores` sets `hasHarm` from any raw subdimension equal to 0 (line 66). The real `scoring.ts` sets it only when a whole dimension has a score of 0. The "harm" test (`A1=0`, all else 5) passes against the copy but would not against the real code. Under the real code, AWR averages 4.0, no dimension is below 4, and the premium stays at 10.
   - The test header claims it exercises both implementations. That claim is wrong, and the `scoring.ts` comment "69 cases" refers to this file. This is a real defect and a pre-condition for Learn, because Learn would show users the exact output of this formula.
3. **Safe to import in the browser:** `src/lib/scoring.ts` (it imports only `@/data/dimensions`, which is pure data with no imports) and `src/data/dimensions.ts`. `SelfAssessment.tsx` already imports `calcScores`, `getBand` and `getBandColor` client-side. `scripts/lib/scoring.mjs` is Node-side only and must not be used in Learn.
4. **`SelfAssessment.tsx` must not be reused.** It does `fetch("https://formspree.io/f/...")` with an email and score (line 126) and writes `localStorage` (line 115). Learn can reuse only its pure ideas. It cannot reuse the component.
5. **Counts:** `SCORED_ENTITY_COUNT` and `getIndexEntityCount()` in `src/data/entityCount.ts` import all eight index JSONs. Importing that module in a client component bundles those files (very large) into the page. Learn pages should read counts in server components and pass numbers down as props.
6. **Sitemap** (`src/app/sitemap.ts`) uses hand-listed arrays (`infoPages`, `vocabularyPages`). Learn routes are not included automatically. **Pagefind** (`scripts/build-search-index.mjs`) indexes all of `out/` except a `Set` of excluded names. Learn pages are indexed by default.
7. **Print precedent:** the pilot report has a full `@media print` block (`src/app/globals.css:194+`), using `body:has(.pilot-report)` to hide all chrome. There is no PDF dependency. Printing is the browser's job.
8. **No CSP header exists** (`nginx.conf`, `nginx-ssl.conf` set only X-Frame-Options, nosniff, Referrer-Policy). An `add_header` inside a `location` drops every server-level header (noted at `nginx.conf:197`), so a Learn-specific CSP must repeat them.

## Recommendations

**FE-R1. Routes (0.5d).** Under `src/app/learn/`:
- `page.tsx` (hub, with band chooser);
- `explorers/`, `investigators/`, `analysts/`, `researchers/` (each with a `page.tsx` and a lesson folder per topic: `method`, `analysis`, `scoring`, `insights`, `corrections`);
- `experiments/<slug>/page.tsx`;
- `educators/page.tsx` plus `educators/<lesson>/page.tsx`, the printable pages;
- `about-learn/` (privacy statement, firewall statement).

All routes are static. Dynamic segments use `generateStaticParams` over a typed `src/data/learn/*.ts` registry, the same pattern as `dimensions/<slug>`. No new framework.

**FE-R2. Analytics decision: default is no Umami on `/learn/**` (0.5d).**
- Do NOT split into route-group root layouts (`(site)` and `(learn)`). That means moving about 35 route folders, has a high merge risk, and nothing else needs it.
- Replace the static tag in `layout.tsx` with one inline server-rendered loader:
  `if(!location.pathname.startsWith('/learn'))` create and append the same script element, with the same `defer`, `data-website-id` and `data-host-url`.
- This is one edit, needs no hydration, and works in the static export. All other pages behave as today. `window.umami` is then undefined on Learn, and `trackEvent` already no-ops safely (`analytics.ts:31`).
- Add a test (FE-R5) that asserts `out/learn/**/*.html` contains no `/u/script.js` element.
- Caveat: the string `/u/script.js` still appears in the inline loader on every page. The test must therefore check for a script element in the HTML, not the substring. It must also assert that no Learn component imports `trackEvent`.
- Known gap: the inline loader checks the URL only in the browser, so a learn page cached or mirrored elsewhere is not covered. Also, nginx legacy redirects must not send `/learn` URLs through a path that changes the pathname.
- This is a founder decision. The alternative, a cookie-less count of views only, would still be a tracker as far as the panel brief is concerned.

**FE-R3. Nested layout `src/app/learn/layout.tsx` (1d).** Scope the theme here and not in `globals.css`.
- A wrapper `<div className="learn-root" data-band=...>` overrides CSS variables for a lighter, high-contrast surface for Explorers.
- Tailwind v4 tokens come from `@theme inline`. Re-declare `--color-*` inside `.learn-root` and use a single `.learn-root` block in `globals.css`.
- Keep a `prefers-color-scheme` and a contrast toggle as client state only (no storage).
- `metadata.robots` stays indexable for educators. Add a `metadata.title.template` of "... | Learn".
- Extend `ChromeGate` so `/learn` renders a simplified Navbar (no commercial or Gumroad links, no Score Watch signup) and the existing Footer minus its commercial links. Add a `LearnNav` component (about 80 lines).
- Do not link to the Agent Hub or any UGC from the Explorer or Investigator layouts. The layout should receive the band as a prop so the check is trivial.

**FE-R4. Shared experiment kit `src/components/learn/` (3d).**
- Each experiment is a `"use client"` component with `useState` and `useReducer` only.
- Props are typed; no context from the rest of the site; no `fetch`, no `<form action>`, no `localStorage`, no `<iframe>`, no `<img src="http">`.
- A primitive set: `Slider`, `BandStrip`, `DragSort` (keyboard-operable, with an up/down button fallback), `Dice` (a seedable PRNG, `mulberry32`, about 10 lines), `Reveal`, `PrintSheet`, and a `Reset` button.
- Pages that need data fetch it at build time in a server component and pass plain props.
- "Assess your school" is a checklist with local state only. It has NO free-text input and no export. Print and screenshot are the user's own action.
- Reduced-motion: no animation unless `prefers-reduced-motion: no-preference`.

**FE-R5. Privacy gate test `scripts/test-learn-privacy.mjs` (1.5d).** This follows the repo's node-script test style and is added to `npm test` (`package.json:31`). It has three layers.
- **Source layer:** scan `src/components/learn/**` and `src/app/learn/**` and fail on any match for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `<form`, `action=`, `<input type="text|email|search|file"` / `<textarea`, `localStorage`, `sessionStorage`, `document.cookie`, `trackEvent`, `next/script`, `<iframe`, `<embed`, `<object`, and any `https?://` literal that is not on an allowlist. The allowlist is `compassionbenchmark.com`, and the XML and SVG namespace strings `w3.org`.
- **Import layer:** fail if Learn imports `SelfAssessment`, `@/lib/analytics`, `@/components/purchase/*`, `@/data/gumroad`, `@/components/agent*` or `@/components/model-benchmark/*`, except `dutyOfCare.ts` if the founder agrees.
- **Output layer:** after `next build`, scan `out/learn/**/*.html` for external origins in `src`, `href`, `action` and CSS `url()`, for `<form`, and for the Umami element. External `<a href>` is allowed only on Researchers pages and must carry `rel="noopener noreferrer"`.
- Also add an ESLint override for `src/app/learn/**` and `src/components/learn/**` using `no-restricted-syntax` and `no-restricted-imports`. This gives developers earlier feedback. The node test is the enforcement.
- Optional hardening (0.5d): a path-scoped nginx CSP for `/learn/` with `default-src 'self'; connect-src 'none'; form-action 'none'; frame-src 'none'`, repeating the server-level headers.

**FE-R6. Use the real scorer, and fix the parity gap first (1d, a prerequisite).**
- Learn imports `calcScores` and `computeCompositeFromDimensions` from `@/lib/scoring`, never a copy.
- Rewrite the drift gate in `test-scoring.mjs` to load the real TypeScript through `importSiteModule("src/lib/scoring.ts")` from `scripts/lib/ts-alias-loader.mjs`. That loader is already used by `test-model-wave-isolation.mjs`. Compare `scoring.ts` and `scoring.mjs` on a golden grid, for example all 8-dimension combinations over {0, 1, 2.5, 4, 5} sampled, plus the existing edge cases.
- Fix or delete the in-file `calcScores` harm rule. If subdimension-level harm is what the methodology says, then `scoring.ts` is the bug, and that is a founder question for the methodology owner rather than a Frontend decision. Flag it; do not change the formula.
- Add a Learn golden-file test: each experiment's worked example (inputs, band, composite) is stored in `src/data/learn/golden.ts` and asserted against the real scorer, so lesson copy cannot drift from the formula.
- For uncertainty demos, `bootstrapCompositeUncertainty` lives in `scripts/lib/evaluation-statistics.mjs` (Node only). Do not import it. A small client-side resample loop that calls `computeCompositeFromDimensions` is enough, with a parity test against the `.mjs` one on a fixed seed.

**FE-R7. Printable educator pages (1.5d).**
- Add a `.learn-print` class and one `@media print` block next to the pilot one in `globals.css`. A4 and Letter via `@page`, black on white, hide Navbar, Footer and `.no-print`, `break-inside: avoid` on each activity, and `a[href^="http"]::after { content: " (" attr(href) ")" }` for external links.
- Worksheets are SVG and HTML tables. A "Print this page" button calls `window.print()`. No jsPDF, no headless browser in the build. "Save as PDF" is the browser's print dialog.
- Optional later (not required): a CI step that renders PDFs with the Playwright already in devDependencies, written to `public/learn/pdf/`. Defer until teachers ask.
- Licence note: put the content licence in each printable footer, once the founder confirms (`LICENSE`, `NOTICE.md` cover the code).

**FE-R8. Search and sitemap (0.5d).**
- Pagefind: Learn is indexed by default. Add `data-pagefind-meta="band:..."` and `data-pagefind-filter` on band, so results can be filtered. Exclude `/learn/educators/*` printable pages from search (worksheets are noisy) by adding `"learn/educators"` to `EXCLUDED_PAGE_NAMES`.
- Sitemap: add a `learnPages` array, generated from the same typed registry as the routes, spread into the return value. A test asserts that every `out/learn/**/index.html` is in the sitemap, and the reverse.
- Static export: every dynamic segment needs `generateStaticParams`; Learn must not use `headers()`, `cookies()` or route handlers.

**FE-R9. Counts and data honesty (0.5d).** Server components read `SCORED_ENTITY_COUNT_FORMATTED` and `INDEX_COUNT`, and pass strings to client code. Add `src/app/learn` and `src/components/learn` to the roots scanned by `test:no-stale-counts`. Check `scripts/test-no-stale-counts.mjs` for its path list, since it may glob only `src/app`.

**FE-R10. Duty of care and age gating in code (1d).** A typed `LearnPage` registry has a `band` field and a `realEntities: boolean` flag. A test fails if a page in Explorers or Investigators has `realEntities: true`, or imports an entity JSON. Real-entity examples come from a curated, gentle `src/data/learn/examples.ts`, not from raw index files. D-29/D-29a: no model ranks and no bare model scores. Reuse `dutyOfCare.ts` by import, not by copy.

**FE-R11. Accessibility (1d plus ongoing).** Every experiment has a text alternative and a keyboard path; no drag-only interaction; a live region for score changes (`aria-live="polite"`, throttled); target size at least 24px (WCAG 2.2 AA 2.5.8, 44px for Explorers); no colour-only band encoding (the band colours already are semantic, so add the band name and a pattern). Reading level is a per-page frontmatter field, checked by a simple word and sentence-length script in CI (a warning, not a gate).

**FE-R12. Build and test cost.** The Learn section adds roughly 40-60 static pages. `next build` time grows by about 5-10 percent, as the site already has thousands of entity pages. The client JS is small if experiments avoid importing the index JSONs (FE-R4, finding 5). The new tests (FE-R5, FE-R6, sitemap parity) are file scans and one build-output scan, each under about 5 seconds. The largest costs are the repo's long `npm test` chain and the pre-push slices. Add Learn tests to the end of the chain and expose `test:learn` so the work can be checked in a slice.

## Slices and files

| Slice | Contents | Effort | Files |
|---|---|---|---|
| S0 | Scorer parity fix (FE-R6) | 1d | `scripts/test-scoring.mjs`, optionally `scripts/lib/scoring.mjs` |
| S1 | Shell: routes, layout, nav, analytics loader, privacy test | 3.5d | `src/app/layout.tsx`, `src/app/learn/layout.tsx`, `src/app/learn/page.tsx`, `src/components/layout/ChromeGate.tsx`, `src/components/learn/LearnNav.tsx`, `src/data/learn/registry.ts`, `src/app/globals.css`, `src/app/sitemap.ts`, `scripts/build-search-index.mjs`, `scripts/test-learn-privacy.mjs`, `package.json` |
| S2 | Kit and 3 experiments (build-a-score, band sort, evidence-tier spotting) | 4d | `src/components/learn/*`, `src/app/learn/experiments/*`, `src/data/learn/golden.ts` |
| S3 | Explorers and Investigators lessons (copy from other panelists) | 3d | `src/app/learn/explorers/*`, `src/app/learn/investigators/*` |
| S4 | Educators and print | 2d | `src/app/learn/educators/*`, print CSS |
| S5 | Analysts and Researchers, uncertainty demo, corrections lesson | 3d | `src/app/learn/analysts/*`, `src/app/learn/researchers/*` |

Total about 16.5d of frontend work, excluding content authoring.

## Top 3
1. FE-R6 (S0): fix the scorer parity test before Learn shows any computed number.
2. FE-R2 and FE-R5: the inline analytics loader that skips `/learn`, plus the privacy gate test on source and built HTML.
3. FE-R4: a local-state-only experiment kit that reuses `@/lib/scoring`, with golden-file tests.

## What I would refuse to build
- Any accounts, progress saving, certificates, leaderboards or free-text fields, or any reuse of `SelfAssessment` (it posts email to Formspree).
- A second copy of the scoring formula for "simpler" demos.
- Route-group root layouts that split the site, or a server-side analytics proxy.
- A server-side PDF generator, or a PDF dependency.
- Per-user adaptivity based on stored age.
- Third-party embeds (video, fonts from a CDN, quiz tools).

## Open questions for the founder
1. Analytics on Learn: none (default), or cookie-less aggregate page views only?
2. Light theme on Learn pages for Explorers, or keep the dark theme everywhere? Default: a lighter Learn theme scoped to `.learn-root`; the rest of the site stays dark-only. This is a deviation from the "dark theme only" convention in CLAUDE.md and needs your sign-off.
3. Harm-flag semantics: should a single subdimension of 0 suppress the integration premium (as `test-scoring.mjs` assumes), or only a dimension of 0 (as `scoring.ts` and `scoring.mjs` do)? Default: leave the code as it is, fix the test, and ask the methodology owner.
4. Is a path-scoped CSP on `/learn/` acceptable on the Hostinger nginx? Default: yes, added with the other server headers, tested in staging first.
5. Content licence for educator materials (CC BY 4.0 suggested)? Default: CC BY 4.0 for text and worksheets, MIT for code, stated in each printable footer.
6. Is the Dockerfile's nginx config the one served from Learn paths in production (`nginx-ssl.conf`)? Default: both configs are changed identically, guarded by `test:nginx-redirect-parity`.
