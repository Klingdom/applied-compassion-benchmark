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

  test("purchase link resolves correctly", async ({ page }) => {
    // Default config (countries, pdf, individual, 2026) should show Gumroad link
    const gumroadLink = page.locator('a:has-text("Purchase now on Gumroad")');
    await expect(gumroadLink).toBeVisible();
    const href = await gumroadLink.getAttribute("href");
    expect(href).toContain("gumroad.com");

    // Change license to enterprise — should fall back to contact-sales
    const licenseSelect = page.locator("select").last();
    await licenseSelect.selectOption("enterprise");
    await page.waitForTimeout(300);
    const contactLink = page.locator('a:has-text("Continue to purchase inquiry")');
    await expect(contactLink).toBeVisible();
    const contactHref = await contactLink.getAttribute("href");
    expect(contactHref).toContain("/contact-sales?");
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
