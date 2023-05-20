import React from "react";
import { useMedia } from "react-use";
import cookies from "js-cookie";
import { z } from "zod";
import { Buffer } from "buffer";

/* ------------------------------------------------------------------------------------------------------------
 * Define Context
 * ------------------------------------------------------------------------------------------------------------ */
// define the context types
interface IGlobalContextValue {
  theme: "dark" | "light" | "system";
  _theme: "dark" | "light";
  clientLoaded: boolean;
}
type IGlobalContextDispatch = React.Dispatch<React.SetStateAction<IGlobalContextValue>>;
type IGlobalContext = [IGlobalContextValue, IGlobalContextDispatch];

// define the defaults
const DefaultGlobalContext: IGlobalContext = [{ theme: "system", _theme: "dark", clientLoaded: false }, () => {}];

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

  // set theme to user-prefs on initial render
  React.useEffect(() => {
    (async () => {
      const theme = await z
        .enum(["light", "dark", "system"])
        .parseAsync(localStorage.getItem("user-prefs"))
        .catch(() => "system" as const);
      const _theme = await z
        .enum(["light", "dark"])
        .parseAsync(JSON.parse(Buffer.from(cookies.get("user-prefs") || "", "base64").toString() || '""'))
        .catch(() => "dark" as const);

      setGlobalCtx({ ...globalCtx, theme, _theme, clientLoaded: true });
    })();
  }, []);

  // track changes to theme after client has loaded
  React.useEffect(() => {
    if (globalCtx.clientLoaded) {
      // determine the new resolved theme: _theme
      let _theme: typeof globalCtx._theme = "dark";
      if (globalCtx.theme === "light") _theme = "light";
      else if (globalCtx.theme === "system" && !prefersDark) _theme = "light";

      // update context
      if (globalCtx._theme !== _theme) setGlobalCtx({ ...globalCtx, _theme });
      localStorage.setItem("user-prefs", globalCtx.theme);
      cookies.set("user-prefs", Buffer.from(JSON.stringify(globalCtx._theme), "utf8").toString("base64"));
    }
  }, [globalCtx, prefersDark]);
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
