import type { IEditorData, IEditorEffects, IEditorState } from "./context";

export const EDITOR_SETTINGS_KEY = "EDITOR_SETTINGS";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

export enum Types {
  // state.settings
  ToggleTheme = "TOGGLE_THEME",
  ToggleMode = "TOGGLE_MODE",
  ToggleLineWrap = "TOGGLE_LINE_WRAP",
  // state.data
  PatchData = "PATCH_DATA",
  // state.data
  PatchEffects = "PATCH_EFFECTS",
  // an escape for updating the state
  PatchState = "PATCH_STATE",
}

type Payload = {
  // state.settings
  [Types.ToggleTheme]: undefined;
  [Types.ToggleMode]: undefined;
  [Types.ToggleLineWrap]: undefined;
  // state.data
  [Types.PatchData]: Partial<IEditorData>;
  // state.effects
  [Types.PatchEffects]: Partial<IEditorEffects>;
  // an excape for updating state
  [Types.PatchState]: Partial<IEditorState>;
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

export const reducer = (state: IEditorState, action: Actions) => {
  switch (action.type) {
    // state.settings
    case Types.ToggleTheme: {
      // determine next state
      let theme: typeof state.settings.theme = "light";
      if (state.settings.theme === "light") theme = "dark";
      else if (state.settings.theme === "dark") theme = "system";
      const next = { ...state, settings: { ...state.settings, theme } };

      // update settings localStorage
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(next.settings));

      return next;
    }
    case Types.ToggleMode: {
      // determine next state
      let mode: typeof state.settings.mode = "vim";
      if (state.settings.mode === "vim") mode = "normal";
      const next = { ...state, settings: { ...state.settings, mode } };

      // update settings localStorage
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(next.settings));

      return next;
    }
    case Types.ToggleLineWrap: {
      // determine next state
      const next = { ...state, settings: { ...state.settings, lineWrap: !state.settings.lineWrap } };

      // update settings localStorage
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(next.settings));

      return next;
    }
    // state.data
    case Types.PatchData: {
      const next = { ...state };
      next.data = { ...state.data, ...action.payload };
      return next;
    }
    // state.effects
    case Types.PatchEffects: {
      const next = { ...state };
      next.effects = { ...state.effects, ...action.payload };
      return next;
    }
    // an escape for updating state
    case Types.PatchState: {
      return { ...state, ...action.payload };
    }
    default:
      return state;
  }
};
