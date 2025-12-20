import React from "react";
import { reducer, ZPrefs, type Actions, type IPrefs, type IResolvedTheme } from "./reducer";
import { ZJsonString } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media";

const PREFERENCES_KEY = "preferences-f01f6ffd";

// create the context
const PrefsCtx = React.createContext<IPrefs>(getInitialPrefs());
const PrefsDispatchCtx = React.createContext<React.Dispatch<Actions>>(() => null);

// create the provider
interface PrefsProviderProps {
  children: React.ProviderProps<IPrefs>["children"];
}

/**
 * The preferences context provider.
 */
export function PrefsProvider({ children }: PrefsProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, useInitialPrefs());

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
 * A utility hook which reads the preferences from localStorage and ensures the HTML
 * element is in sync.
 *
 * @note This is used in conjunction with the `clientThemeScript`. This hook runs before
 * the second paint upon hyrdation, the `clientThemeScript` runs before the first paint
 * when FCP is sent to client.
 */
function useInitialPrefs(): IPrefs {
  const [prefs] = React.useState(() => {
    if (typeof window === "undefined") return getInitialPrefs();

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

    return prefs;
  });

  return prefs;
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
  if (typeof window === "undefined") return getInitialPrefs();

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

  return prefs;
}

/**
 * The blocking script that is run *before* the first paint of the browser.
 *
 * This script ensures that the HTML has the appropriate 'light' or 'dark' class based
 * upon the stored preferences in localStorage. Without this users would get a FOUC. This
 * script runs ONLY on the client and blocks a render pass until it completes.
 *
 * @example
 * ```tsx
 * function RootDocument({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en" suppressHydrationWarning>
 *       <head>
 *         <HeadContent />
 *         <script dangerouslySetInnerHTML={{ __html: clientThemeScript }} />
 *       </head>
 *       <body>
 *         {children}
 *          <TanStackDevtools
 *            config={{ position: "bottom-right" }}
 *            plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
 *          />
 *         <Scripts />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const clientThemeScript = `
(function () {
  let prefs = { theme: { app: { actual: "system", resolved: "dark" }, code: { actual: "system", resolved: "dark" } } };
  try {
    const stored = JSON.parse(atob(localStorage.getItem("${PREFERENCES_KEY}") || ""));

    // initialize the app theme
    if (stored && stored.theme && stored.theme.app) {
      const app = stored.theme.app;
      if (["system", "dark", "light"].includes(app.actual)) prefs.theme.app.actual = app.actual;
    }

    // initialize the code theme
    if (stored && stored.theme && stored.theme.code) {
      const code = stored.theme.code;
      if (["system", "dark", "light"].includes(code.actual)) prefs.theme.code.actual = code.actual;
    }
  } catch (e) {}

  // determine the resolved themes
  if (prefs.theme.app.actual === "system")
    prefs.theme.app.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  else prefs.theme.app.resolved = prefs.theme.app.actual;

  if (prefs.theme.code.actual === "system")
    prefs.theme.code.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  else prefs.theme.code.resolved = prefs.theme.code.actual;

  // initially set the HTML elementn with the resolved app theme, this is *critical* as
  // setting this here will run before paint!
  const html = window.document.documentElement;
  if (prefs.theme.app.resolved === "light") {
    html.classList.remove("dark");
    if (!html.classList.contains("light")) html.classList.add("light");
  } else if (prefs.theme.app.resolved === "dark") {
    html.classList.remove("light");
    if (!html.classList.contains("dark")) html.classList.add("dark");
  }
})();
`;
