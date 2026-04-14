import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/about",
  "/advisory",
  "/ai-evaluation-suite",
  "/ai-labs",
  "/assess-your-organization",
  "/certified-assessments",
  "/contact",
  "/contact-sales",
  "/countries",
  "/data-licenses",
  "/enterprise",
  "/fortune-500",
  "/global-cities",
  "/indexes",
  "/methodology",
  "/prompting-suite-for-humans",
  "/purchase-research",
  "/research",
  "/robotics-labs",
  "/self-assessment",
  "/services",
  "/us-cities",
  "/us-states",
];

test.describe("All routes load", () => {
  for (const route of routes) {
    test(`${route} returns 200 and has content`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      // Every page should have the navbar brand
      await expect(page.locator("text=Compassion Benchmark").first()).toBeVisible();
    });
  }
});

test("404 page works for unknown routes", async ({ page }) => {
  const response = await page.goto("/nonexistent-page");
  expect(response?.status()).toBe(404);
});
