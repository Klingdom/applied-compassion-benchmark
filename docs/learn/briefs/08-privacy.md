# Brief 08 - Privacy and child safety (Learn)

Lens: children's privacy and safety for a section that collects no data. This is engineering analysis, not legal advice. Counsel should confirm the COPPA and UK points before launch.

## 1. Data flows a child's visit triggers today

I checked each one against the code. If Learn is built inside the current shell, every row applies.

| # | Flow | Evidence | Reaches a child on Learn? |
|---|---|---|---|
| 1 | **nginx access logs.** No `access_log` or `log_format` directive exists in `nginx.conf` or `nginx-ssl.conf`, so the image default applies: IP, user agent, URL and referrer, with retention unknown. TLS ends at an openresty proxy in front (`nginx.conf:7-16`) with its own logs. Nothing in the repo shows that proxy's retention. | `nginx.conf` | Yes, unavoidable. |
| 2 | **Umami.** The script is in `<head>` of the root layout on every route (`site/src/app/layout.tsx:116-121`). `/u/` is proxied to the Umami container and forwards `X-Real-IP` and `X-Forwarded-For` (`nginx.conf:37-43`; `nginx-ssl.conf:57`). Shared components fire `trackEvent` (`site/src/lib/analytics.ts:25-35`), including Button `trackAs` and `gumroad_click`. | | Yes, on every page. |
| 3 | **Newsletter form in the global Footer.** Every page renders `<NewsletterSignup variant="footer">` (`site/src/components/layout/Footer.tsx:30`). It POSTs the email to Formspree (`NewsletterSignup.tsx:54-65`) and to Listmonk if configured. It also writes the email to `localStorage` key `cb_newsletter` (`:115`, `:129`) and fires `newsletter_subscribed` to Umami. | | **Yes, zero clicks.** `ChromeGate` only hides chrome for `/nonprofit-alt` (`ChromeGate.tsx:17`). |
| 4 | **Commercial links.** The Footer "Services" column links to Pricing, Purchase Research and Contact Sales. The main nav has "Services" (`site/src/data/nav.ts:3-12, 35-44`). Gumroad URLs are centralised in `site/src/data/gumroad.ts`. External buttons open with `target="_blank" rel="noopener noreferrer"` (`Button.tsx:64-65`). | | Yes, one click. |
| 5 | **Self-Assessment.** It POSTs to Formspree (`site/src/components/assessment/SelfAssessment.tsx:126`) and is linked from Footer "Tools". | | Yes, two clicks, and it is a **submission** form. |
| 6 | **Other form.** `SalesInquiryForm.tsx:73` posts to Formspree. | | Reached via Contact Sales. |
| 7 | **Fonts and images.** The font stack is system fonts only (`site/src/app/globals.css:38`). I found no `next/font`, Google Fonts or remote image URLs in `site/src`. The badge URL `api.compassionbenchmark.com` is shown as text in `BadgeEmbedWidget.tsx:36` and is not loaded. | | No third-party asset requests. This is a good baseline to protect. |
| 8 | **Referrer.** `strict-origin-when-cross-origin` (`nginx.conf:29`) sends the origin to outbound sites. | | Yes, on any outbound click. |
| 9 | **Security headers.** There is **no CSP anywhere** (grep of both nginx files and `next.config.ts` found none). Any `location` that adds a header drops the server-level headers (`nginx.conf:197-198` says so). | | Gap. |
| 10 | **Privacy page.** None exists. Grep of `site/src/app` found no privacy route, and the Footer has no privacy link. | | Gap. |

**Net finding.** Today a child on a Learn page would have their IP logged, be tracked by Umami, and see an email box and a purchase funnel. That contradicts the binding rule "nothing a child types leaves the browser" (`PANEL_BRIEF.md` Privacy rule) unless Learn gets its own shell.

## 2. Assessment

**COPPA.**
- The test is whether the section is "directed to children". The factors include subject matter, visuals, language, and the intended audience.
- An Explorers band (about 8-11) with games and worksheets is **child-directed on its face**. A section can be directed to children even when the rest of the site is general-audience. Treat Explorers as strictly COPPA-grade.
- Persistent identifiers (IP, device IDs) count as personal information unless used only for internal operations. Umami's cookieless design helps. But it still processes IPs on a server, and the current layout sends event payloads and `newsletter_subscribed`. Keeping the "internal operations" exception defensible for children is not worth the analytics value.
- The newsletter email box is the most direct COPPA exposure. It would be knowing collection of an email address from a child.
- The amended COPPA Rule (finalised 2025) is stricter on retention and disclosure. Counsel should confirm current obligations.

**UK Children's Code** (applies to services "likely to be accessed by children"):
- *High privacy by default and data minimisation:* the Footer form and Umami fail this today.
- *Nudge techniques:* "Subscribe", Pricing and Gumroad CTAs, and the `READ_NEXT` / share / follow-on prompts in the analytics event list (`analytics.ts:49-75`) are engagement nudges. They must not appear on Learn.
- *Profiling and geolocation:* none intended. Umami derives coarse country from IP, which counts as geolocation. A DPIA is expected. A one-page DPIA stating "no processing" is cheap and strong.
- *Transparency:* needs a child-readable notice, which does not exist.

**GDPR Art. 8.**
- It applies only when an information-society service relies on consent. The age is 13-16 by member state.
- With no consent-based processing on Learn, Art. 8 is avoided by design. That is the strongest legal posture, and it holds only if Learn has no forms and no analytics that depend on consent or a legitimate-interests balance.
- IP addresses are personal data. Legitimate interests for analytics on children would have to be balanced against the child's interests, which is hard to win.

**Conclusion.** The cleanest position is that Learn processes no personal data beyond what is technically unavoidable in transport. The shell must be separate, the analytics absent, and the privacy statement short and true.

## 3. Recommendations

**PRIV-R1. Drop Umami entirely on /learn/\*.**
- Take no analytics, not even "anonymous". The script lives in the root layout, so the fix is not a nested layout. Options:
  - (a) Replace the hard-coded `<script>` with an `AnalyticsGate`, in the style of `ChromeGate`, that omits it for `/learn`.
  - (b) Split the app into route groups `(site)` and `(learn)` with two root layouts.
- Recommend (a) for cost, with a build assertion that proves the static HTML is clean (R12).
- Without analytics, measure Learn with qualitative educator feedback (an `mailto:` link) and aggregate request counts, as R3 describes.
- *Test:* the build check in R12.

**PRIV-R2. Give Learn its own chrome.**
- Extend the `ChromeGate` pattern with a `LearnChrome`. It has a minimal nav (Learn home, Methodology for Educators, Privacy for kids) and a footer with no `NewsletterSignup`, no Services column, no Self-Assessment link, no Contact Sales, and no Agent Hub or Community links.
- Any "Researchers" band links out to the main site through the interstitial in R7, never through the global nav.
- *Test:* a unit test over the Learn layout's rendered HTML asserts the absence of `<form`, `<input`, `type="email"`, `/pricing`, `/purchase-research`, `/contact-sales`, `/self-assessment`, and `/agent`.

**PRIV-R3. Server logging for /learn.**
- Add `location ^~ /learn/` with `access_log off;`, or a separate `log_format` that omits `$remote_addr` and `$http_user_agent` and a short rotation. `^~` is needed so the regex asset locations (`nginx.conf:206`) do not take precedence.
- Repeat the full security header set inside the block, since `add_header` there drops the server-level ones.
- The upstream openresty proxy's logs are outside the repo. The founder should state its retention in the privacy notice, or set it low (open question 1).
- *Test:* a CI config test (parse `nginx.conf`) asserts that the `/learn/` location has `access_log off` or the anonymised format, plus every header in the base set.

**PRIV-R4. CSP for /learn.**
- Serve this from the `^~ /learn/` block:
  `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'none'; frame-src 'none'; frame-ancestors 'self'; base-uri 'none'; object-src 'none'; manifest-src 'self'`
- Notes:
  - `connect-src 'self'` and not `'none'`, because Next client navigation and prefetch fetch same-origin payloads. `'none'` would break soft navigation. The alternative is `'none'` plus plain full-page loads. I recommend `'self'`, because it still blocks Formspree, Listmonk and Umami exfiltration. Same-origin `/u/` is the one gap, so also block it in nginx (R5).
  - `'unsafe-inline'` is needed by Next's inline hydration scripts. It can be tightened to hashes by a post-build step later (open question 3).
  - `form-action 'none'` enforces "no forms" in the browser itself.
- *Test:* a post-build script lists the response headers for `/learn/` from a local nginx container. A Playwright test loads each Learn page and fails on any non-same-origin request, or on any request to `/u/`, observed via `page.on('request')`.

**PRIV-R5. Neutralise the Umami proxy for Learn.**
- Add `location ^~ /u/` handling that returns 204 or 403 when `$http_referer` contains `/learn/`. This is defence in depth only, because Referer is spoofable and is advisory. The primary control is R1.
- *Test:* the Playwright run in R4 confirms no `/u/` request occurs.

**PRIV-R6. No commercial content on Learn.**
- No Pricing, Purchase, Gumroad, Score-Watch, Supporters, API access or Certified Assessments links or CTAs on any Learn page (all bands). Educators may find services on the main site.
- This also supports the independence/education firewall (`PANEL_BRIEF.md`, NONPROFIT doc §4.2).
- *Test:* a build check scans `out/learn/**` for each URL in `site/src/data/gumroad.ts` and any `gumroad.com` host. It also scans for hrefs to the routes in `footerLinks.services`, `footerLinks.community` (`nav.ts:35-53`), and `formspree.io`, `lists.compassionbenchmark.com` and `listmonk`.

**PRIV-R7. Outbound links: allowlist plus interstitial.**
- Explorers have no outbound links, except one educator-only block behind the interstitial.
- Investigators and above may have outbound links only to a short hand-reviewed allowlist (primary sources, standards bodies, the main-site methodology). Each goes through a static `/learn/leaving/<slug>` page.
- Use fixed slugs with a build-time table, not a `?to=` URL parameter, to avoid an open redirect.
- The interstitial says in plain words: "You are going to another website. We don't control it. Ask a grown-up if you're not sure." It then offers "Stay here" and "Go".
- All outbound anchors carry `rel="noopener noreferrer nofollow"` and `referrerpolicy="no-referrer"`.
- Add `Referrer-Policy: no-referrer` in the `/learn/` block.
- *Test:* lint that every `<a href="http` in Learn source goes through the allowlist component. A build check asserts that no external host appears in `out/learn/**` except those in the table.

**PRIV-R8. No storage on Explorers and Investigators.**
- Experiments hold state in memory only. No `localStorage`, `sessionStorage`, cookies or IndexedDB. Reload resets the slider.
- If a later "save progress" feature is wanted, it needs a separate decision, a disclosure, and no storage for under-13s.
- *Test:* a Playwright run asserts `document.cookie === ''` and empty storage after interaction. A grep over Learn source flags `localStorage` and `document.cookie`.

**PRIV-R9. No free-text input of any kind, no third-party code.**
- This matches the panel rule. The enforcement is mechanical: no `<form`, `<input>` (except range/radio/checkbox used for sliders and choices), `<textarea>`, `contenteditable`, `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `<iframe>`, `<embed>`, and no `@/lib/analytics` or `NewsletterSignup` import in Learn modules.
- The "assess your school" activity is client-side only and prints, with no network call. This is stricter than the existing `SelfAssessment.tsx:126` pattern, which must not be reused.
- *Test:* an ESLint `no-restricted-imports` / `no-restricted-syntax` rule scoped to `site/src/app/learn/**` and `site/src/components/learn/**`, plus the HTML scan.

**PRIV-R10. Child-readable privacy notice.**
- Add `/learn/privacy`, written at about a US grade 4 reading level, linked from every Learn page footer. Draft: "We do not ask your name. We do not ask for your email. We do not use cookies. Nothing you type here leaves your computer. Our computer that sends you the page keeps a short note that someone asked for a page, to keep the site working [and we delete it after N days]. We do not sell anything here. Questions? Ask a grown-up to email us."
- Add a fuller educator and parent version below it, covering the log retention, the openresty proxy, the lack of analytics, the legal posture, and a contact address.
- The site also needs a general privacy page (gap #10) to link to.
- *Test:* a reading-level check (Flesch-Kincaid) on the kid version as a CI warning. A test asserts the page exists and is linked from the Learn footer, and that the claims match the checks: the notice is only allowed to say "no cookies" while the cookie test (R8) is green.

**PRIV-R11. Printables and downloads.**
- PDFs and worksheets embed no remote resources and no tracking pixels, are generated from the repo, and carry no personal metadata (author field set to the organisation).
- *Test:* a script scans PDFs for URIs and requires the allowlist from R7.

**PRIV-R12. The Learn privacy gate (single CI check).**
- One script, `test:learn-privacy`, runs after `next build` over `site/out/learn/**/*.html` and fails on any of:
  - the `/u/script.js` or `data-website-id` string;
  - any Gumroad URL from `gumroad.ts`;
  - `formspree`, `listmonk`, `<form`, `type="email"`, `localStorage`;
  - any external `src=` or `href=` host outside the R7 table;
  - `agent-hub` links on Explorer/Investigator pages.
- Wire it into the pre-push chain alongside `test:no-stale-counts`.

**PRIV-R13. Band policy.** Challenge to the proposed bands: privacy risk steps up at 13 (GDPR Art. 8 lower bound) and 16-18. Keep Explorers and Investigators fully zero-collection. Analysts and Researchers may show a link to the main site's Self-Assessment and newsletter only through the interstitial. Never embed them.

## Top 3
1. **PRIV-R1 + R2:** a separate Learn shell with no Umami, no newsletter box and no commercial nav. Today's shell fails every standard above.
2. **PRIV-R4 + R12:** a CSP with `form-action 'none'` and `connect-src 'self'`, plus one CI scan of the built HTML. This turns the policy into something the build can enforce.
3. **PRIV-R10:** a short, true, child-readable privacy notice, with log retention decided and stated.

## What I would refuse to build
- Any Learn analytics, "anonymous" or not, including heatmaps, A/B tests, and per-child progress or streaks.
- Accounts, classroom codes, leaderboards, comments, shared results, and "submit your assessment".
- A newsletter or email capture on or reachable from Explorers pages.
- Social share buttons, embeds, remote fonts, CDNs, and third-party video.
- Gumroad, pricing or "upgrade" prompts, or badges that imply a child's school can raise a score.
- Age gates that ask for a birth date. They collect the data they claim to protect.

## Open questions (defaults)
1. **How long does the upstream openresty proxy keep logs, and can it be set to under 7 days or drop IPs for `/learn`?** Default: assume unknown. State "short-term server logs" in the notice, set the repo's nginx block to `access_log off`, and have the founder check the proxy.
2. **Should Learn live on a separate subdomain (`learn.compassionbenchmark.com`) with its own container, CSP and no Umami at all?** Default: no. Use `/learn` with R1 and R2, and revisit if the nginx header repetition proves fragile.
3. **Accept `'unsafe-inline'` in `script-src` for launch?** Default: yes, with a follow-up task to hash inline scripts post-build.
4. **Will counsel review the COPPA and UK positions before launch?** Default: yes, a one-hour review of this brief and the notice, before the founder approves publication (`AUTONOMY.md` gate).
5. **Is a main-site privacy page being written anyway?** Default: yes. It is a gap today, and Learn's notice should link to it.
6. **Should educator feedback use a plain `mailto:` link?** Default: yes. It is the only feedback path, with no form.
