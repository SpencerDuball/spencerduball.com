import { z } from "zod";

/* ------------------------------------------------------------------------------------------------------------------
 * Define Context Types
 * ------------------------------------------------------------------------------------------------------------------ */

// define the full context state
const ZGlobalCtxState = z.object({
  preferences: z.object({
    /** The theme on the client side can be "dark", "light", or "system". */
    theme: z.enum(["dark", "light", "system"]),
    /** The actual theme displayed on the page and saved to cookie can be either "dark" or "light". */
    _theme: z.enum(["dark", "light"]),
    /** The codeTheme on the client side can be "dark", "light", or "system". */
    codeTheme: z.enum(["dark", "light", "system"]),
    /** The actual codeTheme displayed on the page and saved to cookie can be either "dark" or "light". */
    _codeTheme: z.enum(["dark", "light"]),
  }),
});
type IGlobalCtxState = z.infer<typeof ZGlobalCtxState>;

/* ------------------------------------------------------------------------------------------------------------------
 * Create ActionMap
 * ------------------------------------------------------------------------------------------------------------------ */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

enum Types {
  ToggleTheme = "TOGGLE_THEME",
  ToggleCodeTheme = "TOGGLE_CODE_THEME",
  PutPreferences = "PUT_PREFERENCES",
}

type Payload = {
  [Types.ToggleTheme]: undefined;
  [Types.ToggleCodeTheme]: undefined;
  [Types.PutPreferences]: IGlobalCtxState["preferences"];
};

type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

/* ------------------------------------------------------------------------------------------------------------------
 * Create Reducer
 * ------------------------------------------------------------------------------------------------------------------ */
const reducer = (state: IGlobalCtxState, action: Actions): IGlobalCtxState => {
  switch (action.type) {
    case Types.ToggleTheme: {
      let next = structuredClone(state);

      if (state.preferences.theme === "light") next.preferences.theme = "dark";
      else if (state.preferences.theme === "dark") next.preferences.theme = "system";
      else next.preferences.theme = "light";

      return next;
    }
    case Types.ToggleCodeTheme: {
      let next = structuredClone(state);

      if (state.preferences.codeTheme === "light") next.preferences.codeTheme = "dark";
      else if (state.preferences.codeTheme === "dark") next.preferences.codeTheme = "system";
      else next.preferences.codeTheme = "light";

      return next;
    }
    case Types.PutPreferences: {
      let next = structuredClone(state);
      next.preferences = action.payload;
      return next;
    }
    default:
      return state;
  }
};

export { ZGlobalCtxState, Types, reducer };
export type { IGlobalCtxState, Payload, Actions };
