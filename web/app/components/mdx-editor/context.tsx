import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { z } from "zod";
import type { StringEnum } from "~/ts-utils";
import { createContext, useContext, useRef } from "react";
import type { ReactNode, FC } from "react";
import { proxy, useSnapshot } from "valtio";

// attachments
export const ZAttachment = z.object({
  type: z.enum(["local", "remote"]),
  id: z.string(),
  mime: z.string(),
  url: z.string(),
});
export type IAttachment = z.infer<typeof ZAttachment>;

export const ZRemoteAttachment = ZAttachment.extend({ type: z.literal("remote") });
export type IRemoteAttachment = z.infer<typeof ZRemoteAttachment>;

export const ZLocalAttachment = ZAttachment.extend({ type: z.literal("local") });
export type ILocalAttachment = z.infer<typeof ZLocalAttachment>;

export const ZImageAttachment = ZAttachment.extend({
  mime: z.custom<`image/${string}`>((val) => (val as string).startsWith("image/")),
});
export type IImageAttachment = z.infer<typeof ZImageAttachment>;

export const ZVideoAttachment = ZAttachment.extend({
  mime: z.custom<`video/${string}`>((val) => (val as string).startsWith("video/")),
});
export type IVideoAttachment = z.infer<typeof ZVideoAttachment>;

// editor state
export interface IMdxEditorState {
  settings: {
    isVimMode: boolean;
    theme: StringEnum<"system" | "light" | "dark">;
    view: StringEnum<"code" | "preview" | "attachments">;
  };
  editor: {
    value: string;
    editor: ReactCodeMirrorRef["state"];
    scrollPos: { x: number; y: number };
    attachments: IAttachment[];
  };
}
const initialState: IMdxEditorState = {
  settings: {
    isVimMode: false,
    theme: "system",
    view: "code",
  },
  editor: {
    value: "",
    editor: undefined,
    scrollPos: { x: 0, y: 0 },
    attachments: [],
  },
};

// context
export const MdxEditorContext = createContext<IMdxEditorState>(initialState);

export const MdxEditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const state = useRef<IMdxEditorState>(proxy(initialState)).current;
  return <MdxEditorContext.Provider value={state}>{children}</MdxEditorContext.Provider>;
};

export const useMdxEditorState = () => useContext(MdxEditorContext);
export const useMdxEditorStore = () => useSnapshot(useContext(MdxEditorContext));