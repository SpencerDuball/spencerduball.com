import { expect, test } from "@playwright/test";

test("login as admin user", async ({ page }) => {
  // Ensure the user is not logged in.
  await page.goto("/");
  await expect(page.getByText("Dashboard")).not.toBeVisible();

  // Login as an admin user.
  await page.getByLabel("Open login modal").click();
  await page.getByText("Sign in with Github").click();
  await page.waitForURL(/\/mock\/github\/login\/oauth\/authorize.*/);
  await page.getByText("Alf Kling").click();

  // Ensure the user is logged in.
  await page.waitForURL("/");
  await expect(page.getByText("Dashboard")).toBeVisible();
});
