# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> 404 page works for unknown routes
- Location: tests\routes.spec.ts:41:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 200
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - link "Compassion Benchmark" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: Compassion Benchmark
    - generic [ref=e9]:
      - link "Indexes" [ref=e10] [cursor=pointer]:
        - /url: /indexes
      - link "Methodology" [ref=e11] [cursor=pointer]:
        - /url: /methodology
      - link "Research" [ref=e12] [cursor=pointer]:
        - /url: /research
      - link "Services" [ref=e13] [cursor=pointer]:
        - /url: /services
      - link "About" [ref=e14] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=e15] [cursor=pointer]:
        - /url: /contact
      - link "Contact Sales" [ref=e16] [cursor=pointer]:
        - /url: /contact-sales
  - main [ref=e17]:
    - generic [ref=e19]:
      - heading "404" [level=1] [ref=e20]
      - heading "This page could not be found." [level=2] [ref=e22]
  - contentinfo [ref=e23]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - heading "Compassion Benchmark" [level=3] [ref=e26]
        - paragraph [ref=e27]: Independent benchmark research across governments, public systems, corporations, AI labs, and robotics institutions.
        - paragraph [ref=e28]: Public index publication is independent. Paid services support access, analysis, review, and institutional use.
      - generic [ref=e29]:
        - generic [ref=e30]:
          - heading "Indexes" [level=4] [ref=e31]
          - link "Countries Index" [ref=e32] [cursor=pointer]:
            - /url: /countries
          - link "U.S. States Index" [ref=e33] [cursor=pointer]:
            - /url: /us-states
          - link "Fortune 500" [ref=e34] [cursor=pointer]:
            - /url: /fortune-500
          - link "AI Labs" [ref=e35] [cursor=pointer]:
            - /url: /ai-labs
          - link "Robotics Labs" [ref=e36] [cursor=pointer]:
            - /url: /robotics-labs
          - link "U.S. Cities" [ref=e37] [cursor=pointer]:
            - /url: /us-cities
          - link "Global Cities" [ref=e38] [cursor=pointer]:
            - /url: /global-cities
        - generic [ref=e39]:
          - heading "Research" [level=4] [ref=e40]
          - link "Methodology" [ref=e41] [cursor=pointer]:
            - /url: /methodology
          - link "Research" [ref=e42] [cursor=pointer]:
            - /url: /research
          - link "About" [ref=e43] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e44] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e45]:
          - heading "Services" [level=4] [ref=e46]
          - link "Purchase Research" [ref=e47] [cursor=pointer]:
            - /url: /purchase-research
          - link "Data Licenses" [ref=e48] [cursor=pointer]:
            - /url: /data-licenses
          - link "Advisory" [ref=e49] [cursor=pointer]:
            - /url: /advisory
          - link "Certified Assessments" [ref=e50] [cursor=pointer]:
            - /url: /certified-assessments
          - link "Enterprise" [ref=e51] [cursor=pointer]:
            - /url: /enterprise
          - link "Contact Sales" [ref=e52] [cursor=pointer]:
            - /url: /contact-sales
        - generic [ref=e53]:
          - heading "Tools" [level=4] [ref=e54]
          - link "Self-Assessment" [ref=e55] [cursor=pointer]:
            - /url: /self-assessment
          - link "Prompting Suite for Humans" [ref=e56] [cursor=pointer]:
            - /url: /prompting-suite-for-humans
          - link "AI Evaluation Suite" [ref=e57] [cursor=pointer]:
            - /url: /ai-evaluation-suite
    - generic [ref=e58]: © 2026 Compassion Benchmark
  - alert [ref=e59]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const routes = [
  4  |   "/",
  5  |   "/about",
  6  |   "/advisory",
  7  |   "/ai-evaluation-suite",
  8  |   "/ai-labs",
  9  |   "/assess-your-organization",
  10 |   "/certified-assessments",
  11 |   "/contact",
  12 |   "/contact-sales",
  13 |   "/countries",
  14 |   "/data-licenses",
  15 |   "/enterprise",
  16 |   "/fortune-500",
  17 |   "/global-cities",
  18 |   "/indexes",
  19 |   "/methodology",
  20 |   "/prompting-suite-for-humans",
  21 |   "/purchase-research",
  22 |   "/research",
  23 |   "/robotics-labs",
  24 |   "/self-assessment",
  25 |   "/services",
  26 |   "/us-cities",
  27 |   "/us-states",
  28 | ];
  29 | 
  30 | test.describe("All routes load", () => {
  31 |   for (const route of routes) {
  32 |     test(`${route} returns 200 and has content`, async ({ page }) => {
  33 |       const response = await page.goto(route);
  34 |       expect(response?.status()).toBe(200);
  35 |       // Every page should have the navbar brand
  36 |       await expect(page.locator("text=Compassion Benchmark").first()).toBeVisible();
  37 |     });
  38 |   }
  39 | });
  40 | 
  41 | test("404 page works for unknown routes", async ({ page }) => {
  42 |   const response = await page.goto("/nonexistent-page");
> 43 |   expect(response?.status()).toBe(404);
     |                              ^ Error: expect(received).toBe(expected) // Object.is equality
  44 | });
  45 | 
```