import * as React from "react";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { z } from "zod";
import { reducer, Actions } from "./reducer";
import { FetcherWithComponents, SubmitOptions } from "@remix-run/react";
import { IAttachment } from "~/model/attachment";
import { IAttachment as IAttachmentRecord } from "@spencerduballcom/db/pg";
import { Simplify, Selectable } from "kysely";

/* ------------------------------------------------------------------------------------------------------------
 * Define CmsEditorState Types
 * ------------------------------------------------------------------------------------------------------------ */
// define settings types
export const ZCmsEditorSettings = z.object({
  mode: z.enum(["vim", "normal"]),
  theme: z.enum(["light", "dark", "system"]),
  lineWrap: z.boolean(),
});
export type ICmsEditorSettings = z.infer<typeof ZCmsEditorSettings>;

// define editor state
export interface ICmsEditorState {
  settings: ICmsEditorSettings;
  editor: {
    state: ReactCodeMirrorRef["state"];
    pos: { x: number; y: number };
  };
  data: {
    value: string;
    attachments: IAttachment[];
  };
  server: {
    save: { fetcher: FetcherWithComponents<any>; submitOptions: SubmitOptions };
    attachment: {
      upload: (
        file: File
      ) => Promise<{ attachment: Simplify<Selectable<IAttachmentRecord>>; upload: () => Promise<any> }>;
    };
  } | null;
}

/* ------------------------------------------------------------------------------------------------------------
 * Define Initial CmsEditorState
 * ------------------------------------------------------------------------------------------------------------ */
export const InitialCmsEditorState: ICmsEditorState = {
  settings: { mode: "normal", theme: "system", lineWrap: true },
  editor: { state: undefined, pos: { x: 0, y: 0 } },
  data: { value: "", attachments: [] },
  server: null,
};

/* ------------------------------------------------------------------------------------------------------------
 * Create CmsEditorCtx
 * ------------------------------------------------------------------------------------------------------------ */
export const CmsEditorCtx = React.createContext<[ICmsEditorState, React.Dispatch<Actions>]>([
  InitialCmsEditorState,
  () => null,
]);

export function CmsEditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, InitialCmsEditorState);

  return <CmsEditorCtx.Provider value={[state, dispatch]}>{children}</CmsEditorCtx.Provider>;
}
