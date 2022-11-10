import { useTheme, css, useToken, Box, useColorMode } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import CodeMirror from "@uiw/react-codemirror";
import type { ReactCodeMirrorRef, ReactCodeMirrorProps } from "@uiw/react-codemirror";
import React, { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { githubLight, githubDark } from "./editorThemes";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vim, Vim } from "@replit/codemirror-vim";
import { useMdxEditorState, useMdxEditorStore } from "../context";
import { useTimeout } from "react-use";

/** Restore/store the scroll position of the editor. */
const useRestoreScroll = (ref: RefObject<ReactCodeMirrorRef>) => {
  const { scrollPos } = useMdxEditorStore().editor;
  let state = useMdxEditorState();

  // trigger rerun of  useEffects after mount
  const isReady = useTimeout(1)[0]();

  // store scroll position on scroll events
  useEffect(() => {
    const scrollDOM = ref.current?.view?.scrollDOM;

    // define event listener
    const handler = () => {
      state.editor.scrollPos = { x: scrollDOM?.scrollLeft || 0, y: scrollDOM?.scrollTop || 0 };
    };

    // setup event listener
    scrollDOM?.addEventListener("scroll", handler);
    return () => scrollDOM?.removeEventListener("scroll", handler);
  }, [ref, isReady, state.editor]);

  // restore the scroll position
  useEffect(() => {
    const scrollDOM = ref.current?.view?.scrollDOM;
    if (scrollDOM) scrollDOM.scrollTo({ top: scrollPos.y, left: scrollPos.x });
  }, [ref, isReady, scrollPos]);
};

/** Define the editor event handlers. */
const useEditorHandlers = (ref: RefObject<ReactCodeMirrorRef>) => {
  const state = useMdxEditorState();

  const onChange: NonNullable<ReactCodeMirrorProps["onChange"]> = (value, viewUpdate) => {
    const scrollDOM = ref.current?.view?.scrollDOM;
    const scrollPos = scrollDOM ? { y: scrollDOM.scrollTop, x: scrollDOM.scrollLeft } : { x: 0, y: 0 };
    state.editor = { ...state.editor, value, editor: viewUpdate.state, scrollPos };
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // captue the file details
    const dtItem = e.dataTransfer.items[0];
    if (dtItem.kind !== "file") return;

    // get the file
    const file = dtItem.getAsFile();
    if (!file) return;

    // create attachment & retrieve target
    let attachment = {
      type: "local",
      id: globalThis.crypto.randomUUID(),
      mime: file.type,
      url: URL.createObjectURL(file),
      file,
    } as const;
    const target = e.target as HTMLElement;

    if (target.className.includes("cm-line")) {
      // if input on specific line, append to that line
      const lineIndex = Array.from(target.parentNode!.children).indexOf(target);
      const lines = state.editor.value.split("\n");
      if (attachment.mime.includes("image/")) lines[lineIndex] += `![Add description ...](${attachment.url})`;
      if (attachment.mime.includes("video/")) lines[lineIndex] += `<Video controls url="${attachment.url}" />`;
      const attachments = [...state.editor.attachments, attachment];
      state.editor = { ...state.editor, value: lines.join("\n"), attachments };
    } else {
      // if input to editor as a whole, add a new line
      const lines = state.editor.value.split("\n");
      if (attachment.mime.includes("image/")) lines.push(`![Add description ...](${attachment.url})`);
      if (attachment.mime.includes("video/")) lines.push(`<Video controls url="${attachment.url}" />`);
      const attachments = [...state.editor.attachments, attachment];
      state.editor = { ...state.editor, value: lines.join("\n"), attachments };
    }
  };

  return { onChange, onDragOver, onDrop };
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
export interface MdxViewProps extends BoxProps {
  height: string;
  width: string;
}

export const MdxView = (props: MdxViewProps) => {
  const { height, width, ...rest } = props;
  const store = useMdxEditorStore();

  // setup scroll restore
  const ref = useRef<ReactCodeMirrorRef>(null);

  // restore scroll position when revisiting MdxView
  useRestoreScroll(ref);

  // get the handlers for the editor
  const handlers = useEditorHandlers(ref);

  // define codemirror styles
  const [fontSize, lineHeight] = ["16px", useToken("lineHeights", "short")];
  const styles = css({ height, width, fontSize, borderRadius: "lg", overflow: "hidden" })(useTheme());
  const wrapperStyles: BoxProps["sx"] = {
    // will place vim command mode at bottom of editor (without extending height)
    "& .cm-panels": { position: "absolute", bottom: 0, left: 0 },
    // will allow to scroll past content ensuring at least the last line is always shown
    "& .cm-content": { pb: `calc(${height} - 2 * ${fontSize} * ${lineHeight})` },
    // ensures the line height is in sync with '.cm-content' computation
    "& .cm-scroller": { lineHeight },
  };

  // define extensions
  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages as any }),
    ...(store.settings.isVimMode ? [vim()] : []),
  ];

  // determine theme
  const { colorMode } = useColorMode();
  const isDark = store.settings.theme === "dark" || (store.settings.theme === "system" && colorMode === "dark");

  return (
    <Box
      height={height}
      width={width}
      sx={wrapperStyles}
      borderRadius="lg"
      overflow="hidden"
      isolation="isolate"
      {...rest}
    >
      <CodeMirror
        ref={ref}
        initialState={store.editor.editor ? { json: store.editor.editor.toJSON() } : undefined}
        value={store.editor.value}
        theme={isDark ? githubDark : githubLight}
        extensions={extensions}
        style={styles}
        height={height}
        width={width}
        {...handlers}
      />
    </Box>
  );
};
