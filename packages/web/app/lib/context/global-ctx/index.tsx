import React from "react";
import { useMedia } from "~/lib/hooks/react-use";
import { z } from "zod";
import Cookies from "js-cookie";
import { useHydrated } from "remix-utils/use-hydrated";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";

/* ------------------------------------------------------------------------------------------------------------
 * Define Context
 * ------------------------------------------------------------------------------------------------------------ */
// define the context types
interface IGlobalContextValue {
  theme: "dark" | "light" | "system";
  _theme: "dark" | "light";
}
type IGlobalContextDispatch = React.Dispatch<React.SetStateAction<IGlobalContextValue>>;
type IGlobalContext = [IGlobalContextValue, IGlobalContextDispatch];

// define the defaults
const DefaultGlobalContext: IGlobalContext = [{ theme: "system", _theme: "dark" }, () => {}];

// instantiate the context
const GlobalContext = React.createContext<IGlobalContext>(DefaultGlobalContext);

// create the provider
interface GlobalContextProviderProps {
  children: React.ReactNode;
}
const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
  const [globalCtx, setGlobalCtx] = React.useState<IGlobalContextValue>(DefaultGlobalContext[0]);

  // track the preferred color mode
  useTrackSystemColor([globalCtx, setGlobalCtx]);

  return <GlobalContext.Provider value={[globalCtx, setGlobalCtx]}>{children}</GlobalContext.Provider>;
};

/* ------------------------------------------------------------------------------------------------------------
 * Define Hooks
 * ------------------------------------------------------------------------------------------------------------ */
/** Allows the app to track and respect the user's preferred color scheme. */
function useTrackSystemColor([globalCtx, setGlobalCtx]: IGlobalContext) {
  const prefersDark = useMedia("(prefers-color-scheme: dark)", true);
  const isHydrated = useHydrated();

  // Theme from Local Storage
  // ------------------------
  // Resore the theme from the value in localStorage if it exists. If it does not exist in local storage, default the
  // context to 'dark'. Only do this once upon the inital hydration. Do this before determining the new context and
  // updating the localStorage + cookie for the '__preferences'.
  //
  // ORDER-DEPENDENT (1/2)
  React.useEffect(() => {
    try {
      // retrieve the preferences, base64 decode it, and parse for valid JSON
      let prefs = JSON.parse(atob(localStorage.getItem("__preferences")!));

      // extract the theme
      const { theme } = z.object({ theme: z.enum(["light", "dark", "system"]) }).parse(prefs);

      // update the context
      setGlobalCtx({ ...globalCtx, theme });
    } catch (e) {
      setGlobalCtx({ ...globalCtx, theme: "dark" });
    }
  }, []);

  // Track Theme Changes after Hydration
  // -----------------------------------
  // After the client-side hydration, track for updates to the 'globalCtx.theme'. This value is used to update the
  // 'globalCtx._theme' which is used to determine the displayed theme on the page.
  //
  // 1) Determine and update the new 'globalCtx._theme'
  // 2) Store the new theme in the '__preferences' localStorage key
  // 3) Update the '__preferences' cookie
  //
  // ORDER-DEPENDENT (2/2)
  React.useEffect(() => {
    if (isHydrated) {
      // determine the new resolved theme: _theme
      let _theme: typeof globalCtx._theme = "dark";
      if (globalCtx.theme === "light" || (globalCtx.theme === "system" && !prefersDark)) _theme = "light";

      // update localStorage and cookies
      localStorage.setItem("__preferences", btoa(JSON.stringify({ theme: globalCtx.theme })));
      Cookies.set("__preferences", btoa(JSON.stringify({ theme: _theme })), {
        expires: new Date(Date.now() + ms("400d")),
        secure: false,
        path: "/",
        // TODO: Need to add support for domain when this env var is configured.
        // domain: 'spencerduball.com'
        sameSite: "lax",
      });

      // update context
      if (globalCtx._theme !== _theme) setGlobalCtx({ ...globalCtx, _theme });
    }
  }, [globalCtx.theme, prefersDark]);
}

/* ------------------------------------------------------------------------------------------------------------
 * Create Helper Functions
 * ------------------------------------------------------------------------------------------------------------ */
function toggleTheme([{ theme, ...rest }, setGlobalCtx]: IGlobalContext) {
  if (theme === "light") setGlobalCtx({ ...rest, theme: "dark" });
  else if (theme === "dark") setGlobalCtx({ ...rest, theme: "system" });
  else setGlobalCtx({ ...rest, theme: "light" });
}

export type { IGlobalContextValue as IGlobalContext };
export { GlobalContext, GlobalContextProvider, toggleTheme };
