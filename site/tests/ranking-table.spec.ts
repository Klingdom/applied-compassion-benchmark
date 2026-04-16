import { test, expect } from "@playwright/test";

test.describe("Fortune 500 RankingTable", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fortune-500");
  });

  test("renders ranking table with data", async ({ page }) => {
    const table = page.locator("table").last();
    await expect(table).toBeVisible();
    // Should have header row
    await expect(table.locator("th", { hasText: "Company" })).toBeVisible();
    await expect(table.locator("th", { hasText: "Score" })).toBeVisible();
    await expect(table.locator("th", { hasText: "Band" })).toBeVisible();
    // Should have data rows
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(10);
  });

  test("search filters results", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search company..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("TIAA");
    // Wait for filtering
    await page.waitForTimeout(300);
    const showingText = page.locator("text=Showing");
    await expect(showingText).toContainText(/Showing \d+ of 447/);
  });

  test("sector filter dropdown exists and has options", async ({ page }) => {
    const sectorSelect = page.locator("select").first();
    await expect(sectorSelect).toBeVisible();
    const options = sectorSelect.locator("option");
    expect(await options.count()).toBeGreaterThan(3);
  });

  test("sort by score reorders table", async ({ page }) => {
    // Get the sort select (last select on page)
    const sortSelect = page.locator("select").last();
    await sortSelect.selectOption("score");
    await page.waitForTimeout(300);
    // First data row should have a high score — find the score cell by header position
    const table = page.locator("table").last();
    const headers = await table.locator("thead th").allTextContents();
    const scoreIdx = headers.findIndex((h) => h.includes("Score"));
    const firstRow = table.locator("tbody tr").first();
    const scoreText = await firstRow.locator("td").nth(scoreIdx).textContent();
    expect(Number(scoreText)).toBeGreaterThan(50);
  });
});

test.describe("Countries RankingTable", () => {
  test("renders and has search/filter", async ({ page }) => {
    await page.goto("/countries");
    const searchInput = page.locator('input[placeholder="Search country..."]');
    await expect(searchInput).toBeVisible();
    // Region filter should exist
    const regionSelect = page.locator("select").first();
    await expect(regionSelect).toBeVisible();
  });
});

test.describe("AI Labs RankingTable", () => {
  test("renders with sector filter", async ({ page }) => {
    await page.goto("/ai-labs");
    const table = page.locator("table").last();
    await expect(table).toBeVisible();
    await expect(table.locator("th", { hasText: "Lab" })).toBeVisible();
  });
});
