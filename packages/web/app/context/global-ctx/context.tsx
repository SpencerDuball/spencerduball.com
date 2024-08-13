import React from "react";
import { type IGlobalCtxState, type Actions } from "./reducer";

// define initial GlobalCtxState
const InitialGlobalCtxState: IGlobalCtxState = {
  preferences: { isRestored: false, theme: "system", _theme: "dark", codeTheme: "system", _codeTheme: "dark" },
};

// create GlobalCtx
const GlobalCtx = React.createContext<[IGlobalCtxState, React.Dispatch<Actions>]>([InitialGlobalCtxState, () => null]);

export { InitialGlobalCtxState, GlobalCtx };
