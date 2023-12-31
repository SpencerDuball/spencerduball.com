import * as React from "react";
import { z } from "zod";
import { type Actions, reducer, EDITOR_SETTINGS_KEY, Types } from "./reducer";

//---------------------------------------------------------------------------------------------------------------------
// Define the editor types.
//---------------------------------------------------------------------------------------------------------------------
// define settings types
export const ZEditorSettings = z.object({
  mode: z.enum(["vim", "normal"]),
  theme: z.enum(["light", "dark", "system"]),
  lineWrap: z.boolean(),
});
export type EditorSettingsType = z.infer<typeof ZEditorSettings>;

// define editor state
export interface IEditorState {
  settings: EditorSettingsType;
}

//---------------------------------------------------------------------------------------------------------------------
// Define editor context.
//---------------------------------------------------------------------------------------------------------------------
export const InitialEditorState: IEditorState = {
  settings: { mode: "normal", theme: "system", lineWrap: true },
};

export const EditorCtx = React.createContext<[IEditorState, React.Dispatch<Actions>]>([InitialEditorState, () => null]);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, InitialEditorState);

  // restore the settings
  React.useEffect(() => {
    let settings = { ...InitialEditorState.settings };
    try {
      const settingsStr = localStorage.getItem(EDITOR_SETTINGS_KEY);
      settings = ZEditorSettings.parse(JSON.parse(settingsStr || ""));
    } catch (e) {
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(settings));
    }
    dispatch({ type: Types.PatchState, payload: { settings } });
  }, []);

  return <EditorCtx.Provider value={[state, dispatch]}>{children}</EditorCtx.Provider>;
}
