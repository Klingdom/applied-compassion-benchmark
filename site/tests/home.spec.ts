import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero section renders with key content", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Benchmarking how institutions");
    await expect(page.locator("text=1,155")).toBeVisible();
    await expect(page.locator("text=Explore Indexes").first()).toBeVisible();
  });

  test("publication table shows all index families", async ({ page }) => {
    // Check the hero panel table has all index rows
    await expect(page.locator("td", { hasText: "World Countries" }).first()).toBeVisible();
    await expect(page.locator("td", { hasText: "Fortune 500" }).first()).toBeVisible();
    await expect(page.locator("td", { hasText: "AI Labs" }).first()).toBeVisible();
    await expect(page.locator("td", { hasText: "Robotics Labs" }).first()).toBeVisible();
    await expect(page.locator("td", { hasText: "U.S. Cities" }).first()).toBeVisible();
    await expect(page.locator("td", { hasText: "Global Cities" }).first()).toBeVisible();
  });

  test("index cards link to correct pages", async ({ page }) => {
    const countriesCard = page.locator('a[href="/countries"]').first();
    await expect(countriesCard).toBeVisible();

    const f500Card = page.locator('a[href="/fortune-500"]').first();
    await expect(f500Card).toBeVisible();

    const usCitiesCard = page.locator('a[href="/us-cities"]').first();
    await expect(usCitiesCard).toBeVisible();
  });

  test("services section renders", async ({ page }) => {
    await expect(page.locator("text=Purchase Research").first()).toBeVisible();
    await expect(page.locator("text=Data Licenses").first()).toBeVisible();
    await expect(page.locator("text=Enterprise Agreements").first()).toBeVisible();
  });

  test("8 benchmark dimensions are listed", async ({ page }) => {
    for (const dim of ["Awareness", "Empathy", "Action", "Equity", "Boundaries", "Accountability", "Systems Thinking", "Integrity"]) {
      await expect(page.locator(`text=${dim}`).first()).toBeVisible();
    }
  });
});
