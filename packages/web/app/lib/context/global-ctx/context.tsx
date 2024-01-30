import React from "react";
import type { IGlobalCtxState, Actions } from "./reducer";
import { reducer, Types, ZGlobalCtxState } from "./reducer";
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
  preferences: { theme: "system", _theme: "dark", codeTheme: "system", _codeTheme: "dark" },
};

// create GlobalCtx
export const GlobalCtx = React.createContext<[IGlobalCtxState, React.Dispatch<Actions>]>([
  InitialGlobalCtxState,
  () => null,
]);

export interface GlobalCtxProviderProps {
  _theme: "light" | "dark";
  _codeTheme: "light" | "dark";
  children: React.ReactNode;
}

export function GlobalCtxProvider({ _theme, _codeTheme, children }: GlobalCtxProviderProps) {
  // Define the state of the context and ensure that the _theme and _codeTheme from the cookie are injected as part of
  // the initial value, or else there will be theme flashes.
  const [state, dispatch] = React.useReducer(reducer, {
    ...InitialGlobalCtxState,
    preferences: { ...InitialGlobalCtxState.preferences, _codeTheme, _theme },
  });

  // run effects
  useSitePreferences(dispatch, state.preferences);

  return <GlobalCtx.Provider value={[state, dispatch]}>{children}</GlobalCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------------ */

/**
 * This hook handles hydrating preferences upon initial site visit, keeping the localStorage and cookie in sync after
 * theme changes, and computing the new resolved theme.
 *
 * A theme consisits of two parts, the actual "theme" and the resolved "_theme". The actual theme can be
 * light/dark/system and the resolved theme must be either light/dark (system is not a value we actualy display!). This
 * hook consists of two parts:
 *   1. Restore Preferences    - Upon initial visit the preferences need to be retrieved from the localStorage.
 *   2. Compute Resolved Theme - With any change to the "theme", "codeTheme", or "prefersDark" we need to recompute the
 *                               resolved themes "_theme" and "_codeTheme".
 *
 * @param dispatch The dispatch function.
 * @param preferences The current theme.
 */
function useSitePreferences(dispatch: React.Dispatch<Actions>, preferences: IGlobalCtxState["preferences"]) {
  // Restore Preferences
  // -------------------
  // This effect restores the 'preferences' from localStorage if it exists. If the 'preferences' are not stored in
  // localStorage it will be defaulted to 'system'.
  //
  // [Order-Dependent 1/2]
  React.useEffect(() => {
    // Setup a default if nothing is in localStorage.
    let prefs: IGlobalCtxState["preferences"] = {
      ...preferences,
      theme: "system",
      codeTheme: "system",
    };

    try {
      // retrieve the preferences, base64 decode it, and parse for valid JSON
      let localStoragePrefs = JSON.parse(atob(localStorage.getItem(PREFERENCES_KEY)!));

      // update the preferences
      prefs = { ...prefs, ...ZGlobalCtxState.shape.preferences.partial().parse(localStoragePrefs) };
    } catch (e) {}

    // update the context
    dispatch({ type: Types.PatchPreferences, payload: prefs });
  }, []);

  // Compute Resolved Theme
  // ----------------------
  // After client-side hydration, this effect tracks and computes the "_theme" and "_codeTheme" based on the "theme" and
  // "codeTheme" respectively.
  //
  // [Order-Dependent 2/2]
  const prefersDark = useMedia("(prefers-color-scheme: dark)", true);
  const isHydrated = useHydrated();

  React.useEffect(() => {
    if (isHydrated) {
      // determine the new resolved theme: _theme & _codeTheme
      let _theme: typeof preferences.theme = "dark";
      if (preferences.theme === "light" || (preferences.theme === "system" && !prefersDark)) _theme = "light";

      let _codeTheme: typeof preferences.codeTheme = "dark";
      if (preferences.codeTheme === "light" || (preferences.codeTheme === "system" && _theme !== "dark"))
        _codeTheme = "light";

      // update localStorage and cookies
      localStorage.setItem(
        PREFERENCES_KEY,
        btoa(JSON.stringify({ theme: preferences.theme, codeTheme: preferences.codeTheme })),
      );
      Cookies.set(PREFERENCES_KEY, btoa(JSON.stringify({ _theme, _codeTheme })), {
        "Max-Age": String(ms("400d")),
        secure: false,
        domain: new URL(window.location.href).hostname.replace(/\:d+$/, ""),
        path: "/",
        sameSite: "lax",
      });

      // update context
      dispatch({ type: Types.PatchPreferences, payload: { _theme, _codeTheme } });
    }
  }, [preferences.theme, preferences.codeTheme, prefersDark, isHydrated]);
}
