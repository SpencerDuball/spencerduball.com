import React from "react";
import { type ITheme, type Actions, reducer, ZTheme } from "./reducer";
import { z } from "zod/v4";

const THEME_KEY = "preferences-26915f4f";

// -------------------------------------------------------------------------------------
// Create Context
// -------------------------------------------------------------------------------------

const ThemeCtx = React.createContext<ITheme>({ actual: "system", resolved: "dark" });
const ThemeDispatchCtx = React.createContext<React.Dispatch<Actions>>(() => null);

interface ThemeProviderProps {
  theme: ITheme;
  children: React.ProviderProps<any>["children"];
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, theme);

  useTrackSystemTheme(state, dispatch);
  useSyncToHtml(state.resolved);
  useSyncToLocalStorage(state);

  return (
    <ThemeCtx value={state}>
      <ThemeDispatchCtx value={dispatch}>{children}</ThemeDispatchCtx>
    </ThemeCtx>
  );
}

// -------------------------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------------------------

/**
 * Tracks the state of a CSS media query.
 *
 * @example
 * ```ts
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 *
 * @param query The media query.
 * @param defaultSSR The default response when SSR.
 * @returns
 */
export function useMediaQuery(query: string, defaultSSR?: boolean): boolean {
  // memoize subscribe to prevent re-subscribing on every render
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener("change", callback);
      return () => matchMedia.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;

  // returning 'false' (or a default) for SSR to avoid hydration mismatches
  const getServerSnapshot = () => defaultSSR || false;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Dispatches events to the context reducer when the system theme changes.
 *
 * @param theme The theme.
 * @param dispatch The dispatch function.
 */
function useTrackSystemTheme(theme: ITheme, dispatch: React.Dispatch<Actions>) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  React.useEffect(() => {
    if (theme.actual === "system") dispatch({ type: "set", payload: { resolved: prefersDark ? "dark" : "light" } });
  }, [prefersDark]);
}

/**
 * Syncs the resolved app theme to the HTML element.
 *
 * @param theme The resolved app theme.
 */
function useSyncToHtml(theme: ITheme["resolved"]) {
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
 * Writes the theme to localStorage upon changes.
 *
 * @param theme The full theme object.
 */
function useSyncToLocalStorage(theme: ITheme) {
  React.useEffect(() => localStorage.setItem(THEME_KEY, btoa(JSON.stringify(theme))), [theme]);
}

// -------------------------------------------------------------------------------------
// Zod Utilities
// -------------------------------------------------------------------------------------

/**
 * Inputs a JSON string and transforms it into a JSON object in a typesafe manner.
 *
 * This function is useful to pipe into other validation functions. In the example below
 * we use this `ZJsonString` to parse a JSON string into an object & validate.
 * @example
 * ```ts
 * const ZString = z.object({
 *   state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
 *   code: z.string()
 * });
 * ```
 */
export const ZJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as z.infer<typeof z.json>;
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid JSON string." });
    return z.NEVER;
  }
});

// -------------------------------------------------------------------------------------
// Utilities
// -------------------------------------------------------------------------------------

/**
 * A hook for accessing the value of the theme context.
 */
export function useTheme() {
  return React.useContext(ThemeCtx);
}

/**
 * A hook for accessing the dispatch of the theme context.
 */
export function useThemeDispatch() {
  return React.useContext(ThemeDispatchCtx);
}

export function setThemeInLoader(): ITheme {
  // retrive the theme, base64 decode it, and parse for valid JSON
  const theme = ZJsonString.pipe(ZTheme)
    .catch(() => ({ actual: "system", resolved: "dark" }) as const)
    .parse(atob(localStorage.getItem(THEME_KEY) || ""));

  // determine the resolved theme
  if (theme.actual === "system")
    theme.resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  else theme.resolved = theme.actual;

  // set the bg-background class on the body element, we removed this to prevent the
  // incorrect theme appearing on the shell load
  const body = window.document.body;
  if (!body.classList.contains("bg-background")) body.classList.add("bg-background");

  // initially set the HTML element with the resolved app theme, this is _critical_ as
  // setting this here will run before paint!
  const html = window.document.documentElement;
  if (theme.resolved === "light") {
    html.classList.remove("dark");
    if (!html.classList.contains("light")) html.classList.add("light");
  } else if (theme.resolved === "dark") {
    html.classList.remove("light");
    if (!html.classList.contains("dark")) html.classList.add("dark");
  }

  return theme;
}
