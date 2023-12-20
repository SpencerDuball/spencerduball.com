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
  preferences: { theme: "dark", _theme: "dark" },
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
  useRestoreTheme(dispatch);
  useComputeResolvedTheme([state.preferences.theme, dispatch]);

  return <GlobalCtx.Provider value={[state, dispatch]}>{children}</GlobalCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------------ */
/**
 * Restores the theme from the localStorage if it exists. If the theme was not saved to localStorage, default it to
 * 'system'. Also used the initial "_theme" value from the "__preferences" cookie.
 *
 * NOTES -
 * This should run once before any other effects related to the 'preferences.theme' or 'preferences._theme'.
 */
function useRestoreTheme(dispatch: React.Dispatch<Actions>) {
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
}

/**
 * After client-side hydration, this function tracks and computes the resolved theme "_theme" in response to the
 * "theme" changing, or when the theme preferences changes.
 *
 * 1) Determine and update the new 'globalCtx.preferences._theme'
 * 2) Store the new theme in the '__preferences' localStorage key
 * 3) Update the '__preferences' cookie
 */
function useComputeResolvedTheme([theme, dispatch]: [
  IGlobalCtxState["preferences"]["theme"],
  React.Dispatch<Actions>,
]) {
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
