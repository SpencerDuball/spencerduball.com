/* ------------------------------------------------------------------------------------------------------------
 * Define Context Types
 * ------------------------------------------------------------------------------------------------------------ */

// define the full context state
export interface IGlobalCtxState {
  preferences: {
    /** The theme on the client side can be "dark", "light", or "system". */
    theme: "dark" | "light" | "system";
    /** The actual theme displayed on the page, and saved to cookie can be either "dark" or "light". */
    _theme: "dark" | "light";
  };
}

/* ------------------------------------------------------------------------------------------------------------
 * Create ActionMap
 * ------------------------------------------------------------------------------------------------------------ */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  ToggleTheme = "TOGGLE_THEME",
  PatchPreferences = "PATCH_PREFERENCES",
}

export type Payload = {
  [Types.ToggleTheme]: undefined;
  [Types.PatchPreferences]: Partial<IGlobalCtxState["preferences"]>;
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

/* ------------------------------------------------------------------------------------------------------------
 * Create Reducer
 * ------------------------------------------------------------------------------------------------------------ */
export const reducer = (state: IGlobalCtxState, action: Actions) => {
  switch (action.type) {
    case Types.ToggleTheme: {
      let next = structuredClone(state);

      if (state.preferences.theme === "light") next.preferences.theme = "dark";
      else if (state.preferences.theme === "dark") next.preferences.theme = "system";
      else next.preferences.theme = "light";

      return next;
    }
    case Types.PatchPreferences: {
      let next = structuredClone(state);
      next.preferences = { ...next.preferences, ...action.payload };
      return next;
    }
    default: {
      return state;
    }
  }
};
