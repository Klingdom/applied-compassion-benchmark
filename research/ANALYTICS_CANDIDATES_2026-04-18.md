# Analytics Candidates — 2026-04-18

**Context:** LinkedIn is driving real engagement on daily update excerpts. Umami is installed and proxied through Nginx (`/u/` → umami container). The site is a Next.js static export. Gumroad handles payments externally. Newsletter signups go through Formspree. There is no server-side integration point.

---

## Current Instrumentation Audit

### What Umami gives you today (without any custom events)
- Page views and unique visitors by URL — `/updates`, `/updates/2026-04-18`, `/purchase-research`, etc.
- Referrer data, including `linkedin.com` as a referrer domain
- Browser, OS, device breakdowns
- Session-level visit counts

### What is dark today

| Signal | Status |
|---|---|
| LinkedIn post → site visit attribution (utm params) | DARK — no UTM convention in use; LinkedIn referrer shows up but post-level attribution is lost |
| Gumroad click-through rate from any page | DARK — `Button` with `external` prop renders a plain `<a>` tag, no Umami custom event fires |
| Which specific Gumroad product was clicked | DARK — 5 products, all indistinguishable in analytics |
| Newsletter signup conversion | DARK — Formspree submission fires no Umami event; `source` prop is sent to Formspree but not to Umami |
| Index page → purchase-research path rate | PARTIALLY DARK — page views exist but cross-session funnel is not constructed |
| Scroll depth / content engagement on `/updates` | DARK — no scroll tracking |
| Which entity cards on `/updates` are clicked (assessed entities grid) | DARK — those `<Link>` clicks are page navigations, visible as page views, but the source page context is lost |
| Contact-sales form submissions | DARK — no event fires on the `/contact-sales` form |

---

## Funnel Map (Conceptual)

```
LinkedIn post excerpt
        │
        ▼
[1] Site visit — /updates or /updates/[date]
        │  ← BIGGEST UNKNOWN: bounce rate, scroll depth, time on page
        ▼
[2] Content engagement — reads score movements, clicks entity cards, reads sector alerts
        │  ← DARK: no signal on which content sections are read
        ▼
[3] Purchase intent signal — clicks "Purchase Research" CTA or navigates to /purchase-research
        │  ← PARTIALLY VISIBLE: page view on /purchase-research exists
        ▼
[4] Gumroad click — clicks "Purchase — $195" on a specific product
        │  ← DARK: this is the last measurable step before payment
        ▼
[5] Gumroad checkout — external, no integration
        │  ← FULLY DARK: no purchase confirmation signal
        ▼
[6] Newsletter signup — parallel conversion path from /updates
        │  ← DARK: Formspree knows, Umami does not
```

The gap between step 3 and step 4 is the highest-value unknown. We know how many people visit `/purchase-research` but not how many click any product. A page view on `/purchase-research` with zero subsequent Gumroad clicks tells a very different story than a page view that converts at 20%.

---

## Candidates

---

### Candidate 1: Gumroad Outbound Click Tracking

**Measurement gap**
We have zero visibility into whether visitors to `/purchase-research` click any of the five Gumroad product buttons. We cannot compute a conversion rate from page visit to purchase intent action. We cannot know whether the Fortune 500 report or the AI Labs report drives more clicks. The entire bottom of the funnel is dark.

**Instrumentation approach**

Umami exposes a `window.umami.track()` client-side API. The `Button` component in `/site/src/components/ui/Button.tsx` renders external links as plain `<a>` tags. Adding an `onClick` handler that fires a custom Umami event before the navigation occurs captures this without any backend work.

File: `site/src/components/ui/Button.tsx`

Add an optional `trackEvent` prop to Button:

```tsx
type ButtonProps = {
  ...
  trackEvent?: string;
  trackProps?: Record<string, string>;
};
```

In the external link branch:
```tsx
if (href && external) {
  return (
    <a
      href={href}
      className={cls}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (trackEvent && typeof window !== "undefined" && (window as any).umami) {
          (window as any).umami.track(trackEvent, trackProps ?? {});
        }
      }}
    >
      {children}
    </a>
  );
}
```

Then in `purchase-research/page.tsx`, pass `trackEvent` on each Gumroad button:

```tsx
<Button
  href={r.link}
  variant="primary"
  full
  external
  trackEvent="gumroad_click"
  trackProps={{ product: r.title, page: "purchase-research" }}
>
  Purchase — $195
</Button>
```

Event name: `gumroad_click`
Properties: `product` (e.g., "Fortune 500 Index"), `page` (source page slug)

Also instrument any Gumroad buttons that appear in CTAs on `/updates` or index pages if they exist.

**Decision it unlocks**
- Which product gets the most click intent (informs which report to prioritize for completeness/quality)
- Conversion rate: `/purchase-research` page views ÷ `gumroad_click` events = purchase intent rate
- Whether LinkedIn-referred visitors click Gumroad at a different rate than direct visitors (requires combining with candidate 2)

**Scores**

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **23/30** |

---

### Candidate 2: LinkedIn UTM Convention

**Measurement gap**
LinkedIn referrer traffic shows up in Umami as `referrer: linkedin.com` but all post-level context is lost. We cannot tell whether the post about OpenAI drove more visits than the post about UnitedHealth, or whether posts mentioning specific entity names correlate with traffic spikes to the corresponding index pages. We cannot A/B test post formats (excerpt length, entity name in headline, score delta visible vs. hidden) because we have no way to attribute visits to individual posts.

**Instrumentation approach**
This requires no code change. It is a publishing convention applied to every LinkedIn post URL.

Standard UTM structure for daily update posts:
```
https://compassionbenchmark.com/updates?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content=2026-04-18
```

For posts that highlight a specific entity or index:
```
https://compassionbenchmark.com/updates?utm_source=linkedin&utm_medium=social&utm_campaign=daily-briefing&utm_content=openai-score-drop
```

Umami captures UTM parameters automatically as part of page view data without any additional instrumentation. The `utm_content` field is the flexible slot — use the date for routine posts, use `{entity}-{signal-type}` for entity-specific posts (e.g., `anthropic-upgrade`, `walmart-band-change`).

File changes: none. Publish convention change only.

**Decision it unlocks**
- Which LinkedIn post types (entity-specific vs. general briefing, upgrades vs. downgrades, specific sectors) drive more visits
- Whether entity-named posts drive traffic to that entity's index page (measurable by correlating utm_content with subsequent page views in session)
- Enables post format experimentation: you can now compare visit volume and downstream behavior across post variants

**Scores**

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **21/30** |

---

### Candidate 3: Newsletter Signup Event (Umami + Source Attribution)

**Measurement gap**
Newsletter signups go to Formspree. Formspree receives the `source` field (e.g., `newsletter-updates-score-movements`) but Umami receives nothing. We cannot answer: What percentage of `/updates` visitors subscribe? Does the inline-compact nudge after score movements convert better than the card placement after key highlights? Does LinkedIn-referred traffic subscribe at a higher rate than organic?

The `source` prop is already wired correctly in `NewsletterSignup.tsx` and `DailyBriefing.tsx` — this is an instrumentation gap of two lines, not an architecture gap.

**Instrumentation approach**

File: `site/src/components/ui/NewsletterSignup.tsx`

In the `handleSubmit` function, after `setStatus("success")`, add:

```tsx
if (typeof window !== "undefined" && (window as any).umami) {
  (window as any).umami.track("newsletter_signup", { source });
}
```

This fires on successful Formspree response only (not on submission attempt), matching actual conversions.

Event name: `newsletter_signup`
Properties: `source` (e.g., `updates-score-movements`, `updates-highlights`, `footer`)

**Decision it unlocks**
- Which placement converts: inline-compact after score movements vs. card after highlights vs. footer vs. other pages
- Newsletter conversion rate by traffic source (combine with utm_source from candidate 2)
- Whether to move the card placement earlier in the `/updates` page (currently it appears after Key Highlights, which is mid-page — if score-movements inline converts at 3x, the card may be redundant)
- Whether to add a newsletter CTA to index pages given LinkedIn-to-newsletter conversion data

**Scores**

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority Score** | **19/30** |

---

### Candidate 4: Updates Page Engagement Depth (Scroll + Section View)

**Measurement gap**
We know how many people visit `/updates`. We do not know how many read past the hero section, how many reach the score movements section (the most likely purchase-intent trigger), how many reach the purchase CTA Callout, or how many scroll to the newsletter card. For a content page that is the primary LinkedIn landing destination, this gap means we cannot distinguish "LinkedIn sends curious visitors who bounce" from "LinkedIn sends engaged readers who don't convert."

**Instrumentation approach**

File: `site/src/components/updates/DailyBriefing.tsx`

Use an `IntersectionObserver` in a small client component or a `useEffect` hook to fire section-view events when key sections scroll into view. Because this is a static export, the observer must live in a `"use client"` wrapper component.

Create `site/src/components/updates/SectionTracker.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";

export default function SectionTracker({ sectionId }: { sectionId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && typeof window !== "undefined" && (window as any).umami) {
          (window as any).umami.track("section_viewed", { section: sectionId });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId]);
  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />;
}
```

Place `<SectionTracker sectionId="score-movements" />` at the top of the score changes section, `<SectionTracker sectionId="purchase-cta-mid" />` at the Callout after score movements, `<SectionTracker sectionId="newsletter-card" />` before the newsletter card, and `<SectionTracker sectionId="end-cta" />` at the final Callout.

Event name: `section_viewed`
Properties: `section` (e.g., `score-movements`, `purchase-cta-mid`, `newsletter-card`, `end-cta`)

**Decision it unlocks**
- Drop-off map: what percentage of `/updates` visitors reach each section
- Whether to move the purchase CTA above the newsletter card or vice versa
- Whether score movements section reach rate correlates with Gumroad click rate (combine with candidate 1)
- Whether LinkedIn traffic reads deeper than direct traffic (combine with candidate 2)

**Scores**

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **16/30** |

---

### Candidate 5: Contact-Sales Form Submission Tracking

**Measurement gap**
The `/contact-sales` page accepts high-value inbound (annual bundles at $1,250+, institutional packs at $1,500–$5,000, custom packages). Premium products on `/purchase-research` link to `/contact-sales?product=annual-bundle` and similar. We do not know whether any of these links generate form submissions, which product inquiries are most common, or whether the LinkedIn-driven funnel ever reaches this path. A single institutional sale outweighs dozens of $195 self-serve purchases.

**Instrumentation approach**

Read the contact-sales page form structure first to confirm the submission handler, then add an Umami event on successful submission.

File: `site/src/app/contact-sales/page.tsx` (or its form component)

On form submit success:
```tsx
if (typeof window !== "undefined" && (window as any).umami) {
  (window as any).umami.track("contact_sales_submitted", {
    product: productParam ?? "general",
  });
}
```

The `product` value can be read from the URL query param (`?product=annual-bundle`) that the premium product cards already pass.

Event name: `contact_sales_submitted`
Properties: `product` (e.g., `annual-bundle`, `institutional-research-pack`, `custom-research-package`)

**Decision it unlocks**
- Whether the LinkedIn funnel ever generates high-value pipeline (not just $195 self-serve clicks)
- Which premium product generates the most inquiry volume (informs which to develop/market first)
- Whether to add a direct contact-sales link to the `/updates` page CTA block (currently absent — `/updates` CTAs link to `/purchase-research` and `/certified-assessments` but not `/contact-sales`)

**Scores**

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **21/30** |

---

## Implementation Order

Priority order based on scores and dependency logic:

1. **Candidate 2 — LinkedIn UTM convention** (effort: 1, no code, immediate). Do this before the next LinkedIn post. Every post published without UTMs is attribution data permanently lost.

2. **Candidate 1 — Gumroad click tracking** (effort: 2, ~1 hour). Adds `trackEvent` prop to `Button.tsx`, instruments 5 products in `purchase-research/page.tsx`. This is the single most important funnel visibility gap — the bottom of the funnel is entirely dark without it.

3. **Candidate 3 — Newsletter signup event** (effort: 1, ~15 minutes). Two lines in `NewsletterSignup.tsx`. Unlocks conversion rate by placement and by traffic source.

4. **Candidate 5 — Contact-sales submission tracking** (effort: 2, ~30 minutes). Read contact-sales page first to confirm form structure. Critical for detecting high-value pipeline.

5. **Candidate 4 — Scroll/section tracking** (effort: 3, ~2 hours). New component, more implementation surface. Do after candidates 1–3 are providing data, so section data can be correlated against purchase intent signals.

---

## Weekly KPIs (Once Instrumented)

| KPI | Source |
|---|---|
| `/updates` unique visitors (LinkedIn-attributed) | Umami page views filtered by `utm_source=linkedin` |
| Score movements section reach rate | `section_viewed{section:score-movements}` ÷ `/updates` page views |
| Purchase CTA click-through rate | `/purchase-research` page views ÷ `/updates` page views |
| Gumroad click rate by product | `gumroad_click` events grouped by `product` |
| Newsletter signup rate | `newsletter_signup` events ÷ `/updates` page views |
| Newsletter signup rate by placement | `newsletter_signup` events grouped by `source` |
| Contact-sales submission volume | `contact_sales_submitted` events grouped by `product` |

---

## Experiments Currently Blind To (Until Instrumented)

Without candidates 1–3, the following experiments cannot be run or evaluated:

- **Post format test**: Entity-specific LinkedIn posts vs. briefing-summary posts — which drives more `/updates` visits AND more Gumroad clicks? (Requires candidates 1 + 2)
- **CTA position test**: Move purchase Callout above newsletter card on `/updates` — does this increase Gumroad clicks without destroying newsletter signups? (Requires candidates 1 + 3 + 4)
- **Newsletter placement test**: Does inline-compact after score movements outperform the standalone card? (Requires candidate 3)
- **Product sequencing test**: Lead with AI Labs or Fortune 500 on `/purchase-research` — does card order affect which product gets clicked? (Requires candidate 1)
- **Contact-sales link test**: Add a contact-sales link to the `/updates` CTA block — does this generate institutional pipeline? (Requires candidate 5 to evaluate)
