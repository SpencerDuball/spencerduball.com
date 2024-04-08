import React from "react";
import { reducer, ZGlobalCtxState, Types, type IGlobalCtxState, type Actions } from "./reducer";
import { useMedia } from "~/hooks/react-use";
import { useHydrated } from "remix-utils/use-hydrated";
import Cookies from "js-cookie";
// @ts-ignore
import ms from "ms"; // TODO: The type definitions are broken and we just have to wait another few years before this is merged :D https://github.com/vercel/ms/issues/184

const PREFERENCES_KEY = "__preferences";

/* ------------------------------------------------------------------------------------------------------------------
 * Define GlobalCtx, GlobalCtxProvider
 * ------------------------------------------------------------------------------------------------------------------ */

// define initial GlobalCtxState
const InitialGlobalCtxState: IGlobalCtxState = {
  preferences: { theme: "system", _theme: "dark", codeTheme: "system", _codeTheme: "dark" },
};

// create GlobalCtx
const GlobalCtx = React.createContext<[IGlobalCtxState, React.Dispatch<Actions>]>([InitialGlobalCtxState, () => null]);

interface GlobalCtxProviderProps {
  _theme: "light" | "dark";
  _codeTheme: "light" | "dark";
  children: React.ReactNode;
}

function GlobalCtxProvider({ _theme, _codeTheme, children }: GlobalCtxProviderProps) {
  // Define the state of the context and ensure that the _theme and _codeTheme from the cookie are injected as part of
  // the initial value, or else there will be theme flashes.
  const [state, dispatch] = React.useReducer(reducer, {
    ...InitialGlobalCtxState,
    preferences: { ...InitialGlobalCtxState.preferences, _theme, _codeTheme },
  });

  // run effects
  useSitePreferences(dispatch, state.preferences);

  return <GlobalCtx.Provider value={[state, dispatch]}>{children}</GlobalCtx.Provider>;
}

export { InitialGlobalCtxState, GlobalCtx, GlobalCtxProvider };
export type { GlobalCtxProviderProps };

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
    // Setup a default if nothing is in localStorage
    let prefs: IGlobalCtxState["preferences"] = InitialGlobalCtxState.preferences;

    try {
      // retrieve the preferences, base64 decode them, and parse for valid JSON
      let localStoragePrefs = JSON.parse(atob(localStorage.getItem(PREFERENCES_KEY) || ""));
      // update the preferences if they are valid
      prefs = { ...prefs, ...ZGlobalCtxState.shape.preferences.partial().parse(localStoragePrefs) };
    } catch (e) {}

    // update the context
    dispatch({ type: Types.PutPreferences, payload: prefs });
  }, []);

  // Compute Resolved Theme
  // ----------------------
  // After client-side hydration, this effect tracks and computes the "_theme" and "_codeTheme" based on the "theme"
  // and "codeTheme" respectively.
  //
  // [Order-Dependent 2/2]
  const prefersDark = useMedia("(prefers-color-scheme: dark)", true);
  const isHydrated = useHydrated();

  React.useEffect(() => {
    if (isHydrated) {
      // determien the new resolved theme: _theme & _codeTheme
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
      dispatch({ type: Types.PutPreferences, payload: { ...preferences, _theme, _codeTheme } });
    }
  }, [preferences.theme, preferences.codeTheme, prefersDark, isHydrated]);
}
