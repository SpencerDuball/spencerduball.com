import { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { Toolbar } from "./toolbar";
import { useMdxEditorState, useMdxEditorStore, useUploadAttachment, ZAttachment } from "./context";
import { useWindowSize } from "react-use";
import { MdxView } from "./mdx-view";
import { PreviewView } from "./preview-view";
import { z } from "zod";
import { AttachmentsView } from "./attachments-view";
import { subscribe } from "valtio";

// EditorSettings - constants and type safety
const MdxEditorSettingsKey = "mdx-editor-settings";
const ZMdxEditorSettings = z.object({
  isVimMode: z.boolean(),
  theme: z.enum(["system", "light", "dark"]),
  view: z.enum(["code", "preview", "attachments"]),
});

/** Saves and restores the editor settings to/from localStorage. */
const useRestoreSettings = () => {
  let state = useMdxEditorState();
  const store = useMdxEditorStore();

  // restore settings on initial render
  useEffect(() => {
    const storageSettingsString = localStorage.getItem(MdxEditorSettingsKey);
    if (storageSettingsString) {
      const storageSettings = ZMdxEditorSettings.safeParse(JSON.parse(storageSettingsString));
      if (storageSettings.success) state.settings = { ...storageSettings.data, view: "code" };
      else localStorage.setItem(MdxEditorSettingsKey, JSON.stringify(state.settings));
    }
  }, []);

  // update localStorage on settings update
  useEffect(() => localStorage.setItem(MdxEditorSettingsKey, JSON.stringify(store.settings)), [store.settings]);
};

/** Computes the non-dynamic height and width for the codemirror editor. */
const useCodeMirrorDimensions = () => {
  const [containerRef, toolbarRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  // will trigger a re-render on window resize, needed to trigger height recomputation
  const { height: h, width: w } = useWindowSize();

  // extract the heights in pixels into "dimensions"
  useEffect(() => {
    if (containerRef && containerRef.current && toolbarRef && toolbarRef.current) {
      const [container, toolbar] = [containerRef.current, toolbarRef.current];
      setDimensions({ height: container.clientHeight - toolbar.clientHeight, width: container.clientWidth });
    }
  }, [containerRef, toolbarRef, h, w]);

  // compute the height & width strings
  const height = dimensions.height ? `${dimensions.height}px` : "100%";
  const width = dimensions.width ? `${dimensions.width}px` : "100%";

  return { height, width, containerRef, toolbarRef };
};

/** Sets the initial value for the editor. */
const useSetInitialValue = (initialValue?: string) => {
  let state = useMdxEditorState();
  useEffect(() => {
    if (initialValue) state.editor.value = initialValue;
  }, []);
};

/** Listens and submits when attachments added. */
const useAttachmentUploader = () => {
  const state = useMdxEditorState();
  const uploadAttachment = useUploadAttachment();

  useEffect(() => {
    const unsubscribe = subscribe(state.editor.attachments, async (op) => {
      const [operation, path, value, prevValue] = op[0];
      const attachment = ZAttachment.safeParse(value);
      if (operation === "set" && attachment.success) {
        const res = await uploadAttachment(attachment.data.id);
      }
    });
    return unsubscribe;
  });
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
export interface MdxEditorProps extends BoxProps {
  initialValue?: string;
}

export const MdxEditor = (props: MdxEditorProps) => {
  const { initialValue, ...rest } = props;
  const store = useMdxEditorStore();

  // setup initial value
  useSetInitialValue(props.initialValue);

  // persist the editor settings
  useRestoreSettings();

  // listen when attachments added
  useAttachmentUploader();

  // compute the codemirror dimensions
  const { height, width, containerRef, toolbarRef } = useCodeMirrorDimensions();

  return (
    <Box ref={containerRef} display="grid" gridTemplateRows="max-content 1fr" {...rest}>
      <Toolbar ref={toolbarRef} />
      {store.settings.view === "code" ? <MdxView height={height} width={width} /> : null}
      {store.settings.view === "preview" ? <PreviewView /> : null}
      {store.settings.view === "attachments" ? <AttachmentsView height="full" /> : null}
    </Box>
  );
};
