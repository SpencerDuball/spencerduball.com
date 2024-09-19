import { expect, test } from "@playwright/test";

// define constants to test ids
const SigninBtnId = "9e011d5f";
const SignInWithGithubId = "a3f6c3bb";
const ProfileBtnId = "081d7c19";

test.describe("mocks enabled", () => {
  test.skip(!/true/i.test(process.env.MOCKS_ENABLED || ""), "Mocks must be enabled for these tests.");

  test("sign in as admin user", async ({ page }) => {
    const sourcePage = "/";

    // open login modal, click on signin with github
    await page.goto(sourcePage);
    await page.getByTestId(SigninBtnId).click();
    await page.getByTestId(SignInWithGithubId).click();

    // signin as Alf Kling
    await page.waitForURL(/\/mock\/github\/login\/oauth\/authorize.*/);
    await page.getByText("Alf Kling").click();

    // wait till redirected back to source page
    await page.waitForURL(sourcePage);

    // check for SignedInModal indicating user is signed in
    await expect(page.locator("_react=SignedInModal")).toBeVisible();
    await expect(page.locator("_react=Toaster").locator('.toast[data-type="success"]')).toBeVisible();
    await expect(page.locator("_react=NavigationMenuItem").locator("text=Dashboard")).toBeVisible();
  });

  test("sign in as standard user", async ({ page }) => {
    const sourcePage = "/";

    // open login modal, click on signin with github
    await page.goto(sourcePage);
    await page.getByTestId(SigninBtnId).click();
    await page.getByTestId(SignInWithGithubId).click();

    // signin as Kevin Wilkinson
    await page.waitForURL(/\/mock\/github\/login\/oauth\/authorize.*/);
    await page.getByText("Keven Wilkinson").click();

    // wait till redirected back to source page
    await page.waitForURL(sourcePage);

    // check for SignedInModal indicating user is signed in
    await expect(page.locator("_react=SignedInModal")).toBeVisible();
    await expect(page.locator("_react=Toaster").locator('.toast[data-type="success"]')).toBeVisible();
    await expect(page.locator("_react=NavigationMenuItem").locator("text=Dashboard")).not.toBeVisible();
  });

  test.skip("sign in as a new user", async ({ page }) => {
    // TODO: Implement this, but setup SQLite :memory: database. Need to reconfigure the testing config.
  });

  test.describe("returns to page signed in from", () => {
    test("'/'", async ({ page }) => {
      const sourcePage = "/";

      // open login modal, click on signin with github
      await page.goto(sourcePage);
      await page.getByTestId(SigninBtnId).click();
      await page.getByTestId(SignInWithGithubId).click();

      // signin as Alf Kling
      await page.waitForURL(/\/mock\/github\/login\/oauth\/authorize.*/);
      await page.getByText("Alf Kling").click();

      // ensure redirected back to source page
      await page.waitForURL(sourcePage);
      expect(new URL(page.url()).pathname).toBe(sourcePage);
    });

    test("'/blog'", async ({ page }) => {
      const sourcePage = "/blog";

      // open login modal, click on signin with github
      await page.goto(sourcePage);
      await page.getByTestId(SigninBtnId).click();
      await page.getByTestId(SignInWithGithubId).click();

      // signin as Alf Kling
      await page.waitForURL(/\/mock\/github\/login\/oauth\/authorize.*/);
      await page.getByText("Alf Kling").click();

      // ensure redirected back to source page
      await page.waitForURL(sourcePage);
      expect(new URL(page.url()).pathname).toBe(sourcePage);
    });
  });

  test.describe("handles errors", () => {
    test("when missing required search params", async ({ request }) => {
      const res = await request.get("/auth/callback/github", { maxRedirects: 0 });
      expect(res.status()).toBe(302);
      expect(res.headers().location).toBe("/");
    });

    test("when oauth token is invalid", async ({ page, request }) => {
      // get the required search params ("client_id", "redirect_uri", "scope", "state")
      let res = await request.get("/auth/signin/github", { maxRedirects: 0 });
      const search = Object.fromEntries(new URL(res.headers().location).searchParams.entries());

      // simulate selecting Alf Kling to sign in as, get the ("code", "state")
      const alfKlingGhId = "57297095";
      res = await request.post("/mock/github/login/oauth/authorize", {
        form: { search: JSON.stringify(search), github_id: alfKlingGhId },
        maxRedirects: 0,
      });
      let { code, state } = Object.fromEntries(new URL(res.headers().location).searchParams.entries());

      // build the callback url with invalid state code
      state = "INAVLID_STATE_CODE";
      const callbackUrl = `/auth/callback/github?code=${code}&state=${state}`;

      // get the callback response in browser
      await page.goto(callbackUrl);
      await page.waitForURL("/");
      await expect(page.locator("_react=Toaster").locator('.toast[data-type="error"]')).toBeVisible();
    });

    test("when access code mismatches", async ({ page, request }) => {
      // get the required search params ("client_id", "redirect_uri", "scope", "state")
      let res = await request.get("/auth/signin/github", { maxRedirects: 0 });
      const search = Object.fromEntries(new URL(res.headers().location).searchParams.entries());

      // simulate selecting Alf Kling to sign in as, get the ("code", "state")
      const alfKlingGhId = "57297095";
      res = await request.post("/mock/github/login/oauth/authorize", {
        form: { search: JSON.stringify(search), github_id: alfKlingGhId },
        maxRedirects: 0,
      });
      let { code, state } = Object.fromEntries(new URL(res.headers().location).searchParams.entries());

      // build the callback url with invalid state code
      code = "INVALID_ACCESS_CODE";
      const callbackUrl = `/auth/callback/github?code=${code}&state=${state}`;

      // get the callback response in browser
      await page.goto(callbackUrl);
      await page.waitForURL("/");
      await expect(page.locator("_react=Toaster").locator('.toast[data-type="error"]')).toBeVisible();
    });
  });
});
