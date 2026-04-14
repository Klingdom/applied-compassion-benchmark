# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ranking-table.spec.ts >> AI Labs RankingTable >> renders with sector filter
- Location: tests\ranking-table.spec.ts:61:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('table').last()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('table').last()

```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Fortune 500 RankingTable", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/fortune-500");
  6  |   });
  7  | 
  8  |   test("renders ranking table with data", async ({ page }) => {
  9  |     const table = page.locator("table").last();
  10 |     await expect(table).toBeVisible();
  11 |     // Should have header row
  12 |     await expect(table.locator("th", { hasText: "Company" })).toBeVisible();
  13 |     await expect(table.locator("th", { hasText: "Score" })).toBeVisible();
  14 |     await expect(table.locator("th", { hasText: "Band" })).toBeVisible();
  15 |     // Should have data rows
  16 |     const rows = table.locator("tbody tr");
  17 |     expect(await rows.count()).toBeGreaterThan(10);
  18 |   });
  19 | 
  20 |   test("search filters results", async ({ page }) => {
  21 |     const searchInput = page.locator('input[placeholder="Search company..."]');
  22 |     await expect(searchInput).toBeVisible();
  23 |     await searchInput.fill("TIAA");
  24 |     // Wait for filtering
  25 |     await page.waitForTimeout(300);
  26 |     const showingText = page.locator("text=Showing");
  27 |     await expect(showingText).toContainText(/Showing \d+ of 447/);
  28 |   });
  29 | 
  30 |   test("sector filter dropdown exists and has options", async ({ page }) => {
  31 |     const sectorSelect = page.locator("select").first();
  32 |     await expect(sectorSelect).toBeVisible();
  33 |     const options = sectorSelect.locator("option");
  34 |     expect(await options.count()).toBeGreaterThan(3);
  35 |   });
  36 | 
  37 |   test("sort by score reorders table", async ({ page }) => {
  38 |     // Get the sort select (last select on page)
  39 |     const sortSelect = page.locator("select").last();
  40 |     await sortSelect.selectOption("score");
  41 |     await page.waitForTimeout(300);
  42 |     // First data row should have a high score
  43 |     const firstScore = page.locator("table").last().locator("tbody tr").first().locator("td").nth(-2);
  44 |     const scoreText = await firstScore.textContent();
  45 |     expect(Number(scoreText)).toBeGreaterThan(50);
  46 |   });
  47 | });
  48 | 
  49 | test.describe("Countries RankingTable", () => {
  50 |   test("renders and has search/filter", async ({ page }) => {
  51 |     await page.goto("/countries");
  52 |     const searchInput = page.locator('input[placeholder="Search country..."]');
  53 |     await expect(searchInput).toBeVisible();
  54 |     // Region filter should exist
  55 |     const regionSelect = page.locator("select").first();
  56 |     await expect(regionSelect).toBeVisible();
  57 |   });
  58 | });
  59 | 
  60 | test.describe("AI Labs RankingTable", () => {
  61 |   test("renders with sector filter", async ({ page }) => {
  62 |     await page.goto("/ai-labs");
  63 |     const table = page.locator("table").last();
> 64 |     await expect(table).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
  65 |     await expect(table.locator("th", { hasText: "Lab" })).toBeVisible();
  66 |   });
  67 | });
  68 | 
```