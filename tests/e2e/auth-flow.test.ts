import { test, expect } from "@playwright/test";

test.describe("Authentication and Navigation Guard E2E", () => {
  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("h1")).toContainText("Geeta University");
  });

  test("renders login form with university branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Branding Department — FMS Portal")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("button[type=submit]")).toBeVisible();
  });
});

