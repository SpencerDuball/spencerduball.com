import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { z } from "zod";
import type { StringEnum } from "~/ts-utils";
import { createContext, useContext, useRef } from "react";
import type { ReactNode, FC } from "react";
import { proxy, useSnapshot } from "valtio";
import { useSubmit } from "@remix-run/react";
import axios from "axios";

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

// state hooks
export const useMdxEditorState = () => useContext(MdxEditorContext);
export const useMdxEditorStore = () => useSnapshot(useContext(MdxEditorContext));

// shared hooks
export const usePreviewMdx = () => {
  const state = useMdxEditorState();
  const submit = useSubmit();

  return () => {
    let data = new FormData();
    data.append("mdx", state.editor.value);
    data.append("_action", "preview");
    submit(data, { method: "post" });
  };
};

export const useSaveMdx = () => {
  const state = useMdxEditorState();
  const submit = useSubmit();

  return () => {
    let data = new FormData();
    data.append("mdx", state.editor.value);
    data.append("attachments", JSON.stringify(state.editor.attachments));
    data.append("_action", "save");
    submit(data, { method: "put" });
  };
};

export interface IPresignedPost {
  url: string;
  fields: {
    key: string;
    bucket: string;
    Policy: string;
    "X-Amz-Algorithm": string;
    "X-Amz-Credential": string;
    "X-Amz-Date": string;
    "X-Amz-Signature": string;
  };
}
export const useUploadAttachment = () => {
  const state = useMdxEditorState();
  const saveMdx = useSaveMdx();

  return async (id: string) => {
    // get the attachment
    const attachment = state.editor.attachments.find((att) => att.id === id);
    if (!attachment) throw new Error("Attachment does not exist.");

    // request the pre-signed s3 url
    let presignedPostForm = new FormData();
    presignedPostForm.append("attachment", JSON.stringify(attachment));
    presignedPostForm.append("_action", "upload-attachment");
    const { url, fields } = await axios
      .postForm<IPresignedPost>(`${location.pathname}?_data`, presignedPostForm)
      .then(({ data }) => data);

    // upload to s3
    const fileBlob = await axios.get(attachment.url, { responseType: "arraybuffer" }).then(({ data }) => data);
    const uploadRes = await axios.postForm(url, { ...fields, file: fileBlob });
    const remoteUrl = url + fields.key;

    // update the mdx links
    const regex = new RegExp(attachment.url, "g");
    console.log(regex);
    console.log(state.editor.value.match(regex));
    state.editor.value = state.editor.value.replace(regex, remoteUrl);

    // update the attachment
    const attIdx = state.editor.attachments.findIndex((att) => att.id === id);
    state.editor.attachments[attIdx].type = "remote";
    state.editor.attachments[attIdx].url = remoteUrl;

    // save the blog post
    saveMdx();
  };
};
