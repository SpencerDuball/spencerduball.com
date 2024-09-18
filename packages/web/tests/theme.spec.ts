import { type BrowserContext, expect, test } from "@playwright/test";

/**
 * Gets the preferences cookie from the browser context.
 */
async function getPrefs(context: BrowserContext) {
  return context
    .cookies()
    .then((cookies) => cookies.find((cookie) => cookie.name == "__preferences"))
    .then((cookie) => {
      if (!cookie) throw new Error("Cookie not found");
      return JSON.parse(atob(decodeURIComponent(cookie.value)));
    });
}

test("first time visiting site, prefers-dark mode", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "dark" });

  await test.step("initial SSR in 'dark' theme", async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("hydrates to 'media' theme (dark)", async () => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("reload will SSR in 'dark' theme", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("hydrates to 'media' theme (dark)", async () => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });
});

test("first time visiting site, prefers-light mode", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "light" });

  await test.step("initial SSR in 'dark' theme", async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("hydrates to 'media' theme (light)", async () => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });

  await test.step("reload will SSR in 'light' theme", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });

  await test.step("hydrates to 'media' theme (light)", async () => {
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });
});

test("client side navigation, prefers-dark theme", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "dark" });

  await test.step("initial load in 'dark' theme", async () => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("navigate to the '/blog' page", async () => {
    await page.goto("/blog");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });
});

test("client side navigation, prefers-light theme", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "light" });

  await test.step("initial load in 'light' theme", async () => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });

  await test.step("navigate to the '/blog' page", async () => {
    await page.goto("/blog");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });
});

test("theme changes with prefers-color-scheme", async ({ page, context }) => {
  await page.emulateMedia({ colorScheme: "dark" });

  await test.step("initial load in 'dark' theme", async () => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("change to 'light' theme", async () => {
    // change to light theme
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");

    // reload will SSR in 'light' theme
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");

    // hydrates to 'media' theme (light)
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });

  await test.step("change back to 'dark' theme", async () => {
    // change to dark theme
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");

    // reload will SSR in 'dark' theme
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");

    // hydrates to 'media' theme (dark)
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });
});

test("theme changes with theme toggle", async ({ page, context }) => {
  // load the page
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await test.step("establish initial theme and button state", async () => {
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
    expect(await page.getByTestId("99bb47fc").getAttribute("aria-label")).toEqual("Toggle to light theme");
  });

  await test.step("toggle the theme to 'light'", async () => {
    // click to toggle theme
    await page.getByTestId("99bb47fc").click();

    // expect the theme to change to light
    expect(await page.getByTestId("99bb47fc").getAttribute("aria-label")).toEqual("Toggle to dark theme");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");

    // reload will SSR in 'light' theme
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });

  await test.step("toggle the theme to 'dark'", async () => {
    // click to toggle theme
    await page.getByTestId("99bb47fc").click();

    // expect the theme to change to dark
    expect(await page.getByTestId("99bb47fc").getAttribute("aria-label")).toEqual("Toggle to system theme");
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");

    // reload will SSR in 'dark' theme
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("dark");
    expect((await getPrefs(context))._theme).toEqual("dark");
  });

  await test.step("toggle the theme to 'system'", async () => {
    // click to toggle theme
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByTestId("99bb47fc").click();

    // expect the theme to change to dark
    expect(await page.getByTestId("99bb47fc").getAttribute("aria-label")).toEqual("Toggle to light theme");
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");

    // reload will SSR in 'light' theme
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass("light");
    expect((await getPrefs(context))._theme).toEqual("light");
  });
});
