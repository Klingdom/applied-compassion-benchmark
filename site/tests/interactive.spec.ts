import { test, expect } from "@playwright/test";

test.describe("Research Configurator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/purchase-research");
  });

  test("configurator renders with 4 dropdowns", async ({ page }) => {
    const selects = page.locator("#configurator select, section select");
    expect(await selects.count()).toBeGreaterThanOrEqual(4);
  });

  test("changing dropdowns updates summary", async ({ page }) => {
    // Default summary should contain countries in the summary box
    const summaryBox = page.locator("div.font-bold", { hasText: "Countries" });
    await expect(summaryBox).toBeVisible();

    // Change area to Fortune 500
    const areaSelect = page.locator("select").nth(1);
    await areaSelect.selectOption("fortune500");
    await page.waitForTimeout(300);

    // Summary should update to Fortune 500
    await expect(page.locator("div.font-bold", { hasText: "Fortune 500" })).toBeVisible();
  });

  test("purchase link includes query params", async ({ page }) => {
    const purchaseLink = page.locator('a:has-text("Continue to purchase inquiry")');
    const href = await purchaseLink.getAttribute("href");
    expect(href).toContain("/contact-sales?");
    expect(href).toContain("year=");
    expect(href).toContain("area=");
  });
});

test.describe("Self-Assessment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/self-assessment");
  });

  test("page loads with dimension content", async ({ page }) => {
    // Should have dimension-related content
    await expect(page.locator("text=Awareness").first()).toBeVisible();
    await expect(page.locator("text=Empathy").first()).toBeVisible();
    await expect(page.locator("text=Integrity").first()).toBeVisible();
  });

  test("has interactive elements", async ({ page }) => {
    // Should have clickable tabs or navigation
    const buttons = page.locator("button");
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
