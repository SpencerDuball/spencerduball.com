import React from "react";
import { reducer, ZPrefs, type Actions, type IPrefs, type IResolvedTheme } from "./reducer";
import { ZJsonString } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media";

const PREFERENCES_KEY = "preferences-f01f6ffd";

// create the context
const PrefsCtx = React.createContext<IPrefs>(getInitialPrefs());
const PrefsDispatchCtx = React.createContext<React.Dispatch<Actions>>(() => null);

// create the provider
interface PrefsCtxProviderProps {
  prefs: IPrefs;
  children: React.ProviderProps<IPrefs>["children"];
}

/**
 * The preferences context provider.
 */
export function PrefsCtxProvider({ prefs, children }: PrefsCtxProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, prefs);

  useTrackSystemTheme(state, dispatch);
  useSyncAppTheme(state.theme.app.resolved);
  useSyncToLocalStorage(state);

  return (
    <PrefsCtx value={state}>
      <PrefsDispatchCtx value={dispatch}>{children}</PrefsDispatchCtx>
    </PrefsCtx>
  );
}

// -------------------------------------------------------------------------------------
// Internal
// -------------------------------------------------------------------------------------

/**
 * Creates a full preferences object with optional resolved themes.
 *
 * @param theme The initial resolved themes.
 */
function getInitialPrefs(theme?: { app: IResolvedTheme; code: IResolvedTheme }): IPrefs {
  return {
    theme: {
      app: { actual: "system", resolved: theme?.app || "dark" },
      code: { actual: "system", resolved: theme?.code || "dark" },
    },
  };
}

/**
 * Dispatches events to the context reducer when the system theme changes.
 *
 * @param prefs The preferences state.
 * @param dispatch The dispatch function.
 */
function useTrackSystemTheme(prefs: IPrefs, dispatch: React.Dispatch<Actions>) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", true);

  React.useEffect(() => {
    if (prefs.theme.app.actual === "system")
      dispatch({ type: "theme.app.set", payload: { resolved: prefersDark ? "dark" : "light" } });
    if (prefs.theme.code.actual === "system")
      dispatch({ type: "theme.code.set", payload: { resolved: prefersDark ? "dark" : "light" } });
  }, [prefersDark]);
}

/**
 * Syncs the resolved app theme to the HTML element.
 *
 * @param theme The resolved app theme.
 */
function useSyncAppTheme(theme: IPrefs["theme"]["app"]["resolved"]) {
  React.useEffect(() => {
    const html = window.document.documentElement;
    if (theme === "light") {
      html.classList.remove("dark");
      if (!html.classList.contains("light")) html.classList.add("light");
    } else if (theme === "dark") {
      html.classList.remove("light");
      if (!html.classList.contains("dark")) html.classList.add("dark");
    }
  }, [theme]);
}

/**
 * Writes the preferences to localStorage upon changes.
 *
 * @param prefs The full preferences object.
 */
function useSyncToLocalStorage(prefs: IPrefs) {
  React.useEffect(() => localStorage.setItem(PREFERENCES_KEY, btoa(JSON.stringify(prefs))), [prefs]);
}

// -------------------------------------------------------------------------------------
// Utilities
// -------------------------------------------------------------------------------------

/**
 * A hook for accessing the value of the preferences context.
 */
export function usePrefs() {
  return React.useContext(PrefsCtx);
}

/**
 * A hook for accessing the dispatch of the preferences context.
 */
export function usePrefsDispatch() {
  return React.useContext(PrefsDispatchCtx);
}

/**
 * This function runs in a loader and retrives the theme from localStorage **before**
 * React runs. With the return of this function we can correctly initialize our context
 * before initial paint.
 */
export function getThemeInLoader(): IPrefs {
  // retrieve the preferences, base64 decode them, and parse for valid JSON
  const prefs = ZJsonString.pipe(ZPrefs)
    .catch(() => getInitialPrefs())
    .parse(atob(localStorage.getItem(PREFERENCES_KEY) || ""));

  // determine the resolved themes
  if (prefs.theme.app.actual === "system")
    prefs.theme.app.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  else prefs.theme.app.resolved = prefs.theme.app.actual;

  if (prefs.theme.code.actual === "system")
    prefs.theme.code.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  else prefs.theme.code.resolved = prefs.theme.code.actual;

  // initially set the HTML element with the resolved app theme, this is *critical* as
  // setting this here will run before paint!
  const html = window.document.documentElement;
  if (prefs.theme.app.resolved === "light") {
    html.classList.remove("dark");
    if (!html.classList.contains("light")) html.classList.add("light");
  } else if (prefs.theme.app.resolved === "dark") {
    html.classList.remove("light");
    if (!html.classList.contains("dark")) html.classList.add("dark");
  }

  return prefs;
}
