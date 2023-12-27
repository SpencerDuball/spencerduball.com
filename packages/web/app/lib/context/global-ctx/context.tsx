import React from "react";
import type { IGlobalCtxState, Actions } from "./reducer";
import { reducer, Types } from "./reducer";
import { z } from "zod";
import { useHydrated } from "remix-utils/use-hydrated";
import { useMedia } from "~/lib/hooks/react-use";
import Cookies from "js-cookie";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";

export const PREFERENCES_KEY = "__preferences";

/* ------------------------------------------------------------------------------------------------------------------
 * Define GlobalCtx, GlobalCtxProvider
 * ------------------------------------------------------------------------------------------------------------------ */
// define initial GlobalCtxState
export const InitialGlobalCtxState: IGlobalCtxState = {
  preferences: { theme: "system", _theme: "dark" },
};

// create GlobalCtx
export const GlobalCtx = React.createContext<[IGlobalCtxState, React.Dispatch<Actions>]>([
  InitialGlobalCtxState,
  () => null,
]);

export function GlobalCtxProvider({ children }: { children: React.ReactNode }) {
  // define the state
  const [state, dispatch] = React.useReducer(reducer, InitialGlobalCtxState);

  // run effects
  useSiteThemeHandler(dispatch, state.preferences.theme);

  return <GlobalCtx.Provider value={[state, dispatch]}>{children}</GlobalCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------------ */

/**
 * This hook handles hydrating the site theme, keeping the localStorage and cookie in sync, and preventing theme flash.
 *
 * The site theme consists of two parts: the 'theme' and the '_theme'. The 'theme' can be ['system', 'dark', 'light']
 * while the '_theme' may be only ['dark', 'light]. Since there are really only two themes (indicated by '_theme') we
 * need to compute what 'system' should evaluate to on the client side. This hook has two main purposes:
 * (1) Restoring Site Theme - This happens only once and should occur before Compute Resolved Theme or else we may have
 *     flash issue.
 * (2) Compute Resolved Theme ('_theme') - This happens any time the 'prefers-color-scheme' changes (system theme), or
 *     the 'theme' value is toggled. It will update the resolved '_theme' and keep the localStorage + cookie in sync.
 *
 * @param dispatch The dispatch function.
 * @param theme The current theme.
 */
function useSiteThemeHandler(dispatch: React.Dispatch<Actions>, theme: IGlobalCtxState["preferences"]["theme"]) {
  // Restore Site Theme
  // ------------------
  // This effect restores the site theme from localStorage if it exists. If the theme was not saved to localStorage,
  // default it to 'system'. This effect also initializes the initial '_theme' from the '__preferences' cookie value.
  //
  // [Order-Dependent 1/2]
  React.useEffect(() => {
    let theme: IGlobalCtxState["preferences"]["theme"] = "system";
    let _theme: IGlobalCtxState["preferences"]["_theme"] = "dark";

    // update the 'theme' from localStorage
    try {
      // retrieve the preferences, base64 decode it, and parse for valid JSON
      let prefs = JSON.parse(atob(localStorage.getItem(PREFERENCES_KEY)!));

      // extract the theme
      theme = z.object({ theme: z.enum(["light", "dark", "system"]) }).parse(prefs).theme;
    } catch (e) {}

    // update the '_theme' from the cookie value
    try {
      // retrieve the preferences cookie, base64 decode it, and parse for valid JSON
      let prefs = JSON.parse(atob(Cookies.get(PREFERENCES_KEY)!));

      // extract the theme
      _theme = z.object({ theme: z.enum(["light", "dark"]) }).parse(prefs).theme;
    } catch (e) {}

    // update the context
    dispatch({ type: Types.PatchPreferences, payload: { theme, _theme } });
  }, []);

  // Compute Resolved Theme
  // ----------------------
  // After client-side hydration, this effect tracks and computes the resolved theme "_theme" in response to the "theme"
  // changing, or when the theme preferences is changed.
  //
  // (1) Determine and upate the new 'globalCtx.preferences._theme'
  // (2) Store the new theme in the '__preferences' localStorage key
  // (3) Update the '__preferences' cookie
  //
  // [Order-Dependent 2/2]
  const prefersDark = useMedia("(prefers-color-scheme: dark)", true);
  const isHydrated = useHydrated();

  React.useEffect(() => {
    if (isHydrated) {
      // determine the new resolved theme: _theme
      let _theme: typeof theme = "dark";
      if (theme === "light" || (theme === "system" && !prefersDark)) _theme = "light";

      // update localStorage and cookies
      localStorage.setItem(PREFERENCES_KEY, btoa(JSON.stringify({ theme })));
      Cookies.set(PREFERENCES_KEY, btoa(JSON.stringify({ theme: _theme })), {
        "Max-Age": String(ms("400d")),
        secure: false,
        domain: new URL(window.location.href).hostname.replace(/\:d+$/, ""),
        path: "/",
        sameSite: "lax",
      });

      // update context
      dispatch({ type: Types.PatchPreferences, payload: { _theme } });
    }
  }, [theme, prefersDark, isHydrated]);
}
