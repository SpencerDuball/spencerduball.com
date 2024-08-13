import React from "react";
import { type Payload, type Actions, Types, ZGlobalCtxState, reducer, IGlobalCtxState } from "./reducer";
import { InitialGlobalCtxState, GlobalCtx } from "./context";
import Cookies from "js-cookie";
import { useMedia } from "react-use";
// @ts-ignore
import ms from "ms";

const PREFERENCES_KEY = "__preferences";

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
    preferences: { ...InitialGlobalCtxState.preferences, _theme, _codeTheme },
  });

  // run the effects
  useSitePreferences(dispatch, state.preferences);

  return <GlobalCtx.Provider value={[state, dispatch]}>{children}</GlobalCtx.Provider>;
}

/* ------------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------------ */

function useSitePreferences(dispatch: React.Dispatch<Actions>, preferences: IGlobalCtxState["preferences"]) {
  // Restore Preferences
  // -------------------
  // This effect restores the 'preferences' from localStorage if it exists. If the 'preferences' are not stored in the
  // localStorage it will be defaulted to 'system'.
  //
  // [Order-Dependent 1/2]
  React.useEffect(() => {
    let prefs: Payload[Types.PatchPreferences] | null = null;

    try {
      // retrieve the preferences, base64 decode them, and parse for valid JSON
      let localStoragePrefs = JSON.parse(atob(localStorage.getItem(PREFERENCES_KEY) || ""));
      // update the preferences if they are valid, throw if not
      prefs = { isRestored: true, ...ZGlobalCtxState.shape.preferences.partial().parse(localStoragePrefs) };
    } catch (e) {
      // set the default preferences if the localStorage preferences are invalid
      prefs = { isRestored: true, theme: preferences.theme, codeTheme: preferences.codeTheme };
    }

    // update the context
    dispatch({ type: Types.PatchPreferences, payload: prefs });
  }, []);

  // Compute Resolved Theme
  // ----------------------
  // After the site preferences are restored, this effect tracks the "theme" and "codeTheme" and computes the "_theme"
  // and "_codeTheme" based on the "theme" and "codeTheme" respectively.
  //
  // [Order-Dependent 2/2]
  const prefersDark = useMedia("(prefers-color-scheme: dark)", true);

  React.useEffect(() => {
    if (preferences.isRestored) {
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
  }, [preferences.isRestored, preferences.theme, preferences.codeTheme, prefersDark]);
}
