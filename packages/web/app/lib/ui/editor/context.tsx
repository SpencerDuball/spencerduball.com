import * as React from "react";
import { z } from "zod";
import { type Actions, reducer, EDITOR_SETTINGS_KEY, Types } from "./reducer";
import { EditorState } from "@uiw/react-codemirror";
import { IBlog } from "~/model/blogs";

//---------------------------------------------------------------------------------------------------------------------
// Define the editor types.
//---------------------------------------------------------------------------------------------------------------------
// define settings types
export const ZEditorSettings = z.object({
  /** The mode of the editor. */
  mode: z.enum(["vim", "normal"]),
  /** The theme of the editor, system will equal the global _theme. */
  theme: z.enum(["light", "dark", "system"]),
  /** If line wrapping is enabled. */
  lineWrap: z.boolean(),
});
export type IEditorSettings = z.infer<typeof ZEditorSettings>;

// define data types
export interface IEditorData {
  value: string;
  scroll: { x: number; y: number };
  cursor: number;
  state: EditorState | null;
}

// define effect types
export interface IEditorEffects {
  scroll: { x: number; y: number } | null;
  cursor: number | null;
  isMounted: boolean;
}

// define editor state
export interface IEditorState {
  settings: IEditorSettings;
  data: IEditorData;
  effects: IEditorEffects;
}

//---------------------------------------------------------------------------------------------------------------------
// Define editor context.
//---------------------------------------------------------------------------------------------------------------------
export const InitialEditorState: IEditorState = {
  settings: { mode: "normal", theme: "system", lineWrap: false },
  data: { value: "", scroll: { x: 0, y: 0 }, cursor: 0, state: null },
  effects: { scroll: null, cursor: null, isMounted: false },
};

export const EditorCtx = React.createContext<[IEditorState, React.Dispatch<Actions>]>([InitialEditorState, () => null]);

export interface EditorProviderProps {
  value: string;
  children: React.ReactNode;
}

export function EditorProvider({ value, children }: EditorProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, {
    ...InitialEditorState,
    data: { ...InitialEditorState.data, value },
  });

  // restore the settings
  useRestoreSettings(state, dispatch);

  return <EditorCtx.Provider value={[state, dispatch]}>{children}</EditorCtx.Provider>;
}

//---------------------------------------------------------------------------------------------------------------------
// Define hooks.
//---------------------------------------------------------------------------------------------------------------------
function useRestoreSettings(state: IEditorState, dispatch: React.Dispatch<Actions>) {
  React.useEffect(() => {
    let settings = { ...state.settings };
    try {
      const settingsStr = localStorage.getItem(EDITOR_SETTINGS_KEY);
      settings = ZEditorSettings.parse(JSON.parse(settingsStr || ""));
    } catch (e) {
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(settings));
    }
    dispatch({ type: Types.PatchState, payload: { settings } });
  }, []);
}
