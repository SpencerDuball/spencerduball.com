import { createCookie } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import ms from "ms";

const ChromeMaxExpiryLimit = "400d";

// "user-prefs" Cookie
const userPrefs = createCookie("user-prefs", {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
});
async function newUserPrefs(value: "light" | "dark", request: LoaderArgs["request"]) {
  const url = new URL(request.url);

  const secure = url.hostname === "localhost" ? false : true;
  const expires = new Date(Date.now() + ms(ChromeMaxExpiryLimit));

  return userPrefs.serialize(value, { secure, expires });
}

export { userPrefs, newUserPrefs };
