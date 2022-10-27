import React, { useState, useEffect, useRef } from "react";
import { vim, Vim } from "@replit/codemirror-vim";
import { useColorMode } from "@chakra-ui/react";
import type { IconButtonProps, BoxProps } from "@chakra-ui/react";
import {
  IconButton,
  ButtonGroup,
  Icon,
  Box,
  css,
  Flex,
  useTheme,
  forwardRef,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RiMoonFill, RiSunFill, RiSaveFill, RiCodeSSlashFill, RiAttachment2 } from "react-icons/ri";
import { VscPreview } from "react-icons/vsc";
import { DiVim } from "react-icons/di";
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubLight, githubDark } from ".";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { useWindowSize } from "react-use";
import { ScrollBox } from "~/components";
import { z } from "zod";
import { useActionData, Form } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";

// settings
const MdxEditorSettingsKey = "mdx-editor-settings";
const ZMdxEditorSettings = z.object({
  isVim: z.boolean(),
  theme: z.literal("light").or(z.literal("dark")).or(z.literal("system")),
  view: z.literal("code").or(z.literal("preview")).or(z.literal("attachments")),
});
type MdxEditorSettingsType = z.infer<typeof ZMdxEditorSettings>;

// Vim Command - this is the vim command component styles, ex: "--insert-- :w"
const CmPanelStyles: BoxProps["sx"] = { position: "absolute", bottom: 0, left: 0 };

// Toolbar Button
////////////////////////////////////////////////////////////////////////////////
interface ToolbarButtonProps extends IconButtonProps {
  isActive?: boolean;
}

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { isActive, ...rest } = props;
  const c = useThemedColor();
  const size = useBreakpointValue({ base: "md", sm: "lg" });
  return (
    <IconButton
      isActive={isActive}
      colorScheme="_gray"
      shadow="sm"
      size={size}
      color={isActive ? c("gray.11") : c("grayA.5")}
      {...rest}
    />
  );
};

// Toolbar
////////////////////////////////////////////////////////////////////////////////
interface ToolbarProps extends BoxProps {
  settings: MdxEditorSettingsType;
  setSettings: (settings: MdxEditorSettingsType) => void;
}
const Toolbar = forwardRef((props: ToolbarProps, ref) => {
  const { settings, setSettings, ...rest } = props;
  const c = useThemedColor();

  return (
    <Box ref={ref} display="flex" justifyContent="center" gap={2} {...rest}>
      {/* Left Aligned */}
      <Flex gap={2}>
        <ToolbarButton color={c("gray.9")} aria-label="Save Post" icon={<Icon as={RiSaveFill} />} />
      </Flex>
      {/* Center Aligned */}
      <Flex gap={2}>
        <ButtonGroup isAttached>
          <ToolbarButton
            aria-label="Code View"
            icon={<Icon as={RiCodeSSlashFill} />}
            isActive={settings.view === "code"}
            onClick={() => setSettings({ ...settings, view: "code" })}
          />
          <ToolbarButton
            aria-label="View Preview"
            icon={<Icon as={VscPreview} />}
            isActive={settings.view === "preview"}
            onClick={() => setSettings({ ...settings, view: "preview" })}
            type="submit"
            name="_action"
            value="mdx-editor-preview"
          />
          <ToolbarButton
            aria-label="View Attachments"
            icon={<Icon as={RiAttachment2} />}
            isActive={settings.view === "attachments"}
            onClick={() => setSettings({ ...settings, view: "attachments" })}
          />
        </ButtonGroup>
      </Flex>
      {/* Right Aligned */}
      <Flex gap={2}>
        <ButtonGroup isAttached>
          <ToolbarButton
            aria-label="Toggle Dark Mode"
            icon={<Icon as={RiMoonFill} />}
            isActive={settings.theme === "dark"}
            onClick={() => setSettings({ ...settings, theme: settings.theme === "dark" ? "system" : "dark" })}
          />
          <ToolbarButton
            aria-label="Toggle Light Mode"
            icon={<Icon as={RiSunFill} />}
            isActive={settings.theme === "light"}
            onClick={() => setSettings({ ...settings, theme: settings.theme === "light" ? "system" : "light" })}
          />
        </ButtonGroup>
        <ToolbarButton
          aria-label="Toggle Vim Mode"
          icon={<Icon as={DiVim} />}
          isActive={settings.isVim}
          onClick={() => setSettings({ ...settings, isVim: !settings.isVim })}
        />
      </Flex>
    </Box>
  );
});

// Image Attachment
////////////////////////////////////////////////////////////////////////////////
type MdxRemoteImageType = { type: "remote"; name: string; url: string };
type MdxLocalImageType = { type: "local"; name: string; file: File };
type MdxImageType = MdxRemoteImageType | MdxLocalImageType;

interface ImageAttachmentProps extends BoxProps {
  image: MdxImageType;
}

const ImageAttachment = (props: ImageAttachmentProps) => {
  const { image, ...rest } = props;
  const c = useThemedColor();

  if (image.type === "local") {
    return <Box display="grid" borderRadius="lg" h="xs" w="2xs" boxShadow="md" bg={c("_gray.3")} {...rest}></Box>;
  }
  throw new Error("yo");
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
type EditorState = {
  value: string;
  editor: ReactCodeMirrorRef["state"];
  scrollPos: { x: number; y: number };
  images: MdxImageType[];
};

const useEditorSettings = () => {
  const { colorMode } = useColorMode();
  const [settings, setSettings] = useState<MdxEditorSettingsType>({
    isVim: false,
    theme: "system",
    view: "code",
  });

  // determine computed editor theme
  const isDark = settings.theme === "dark" || (settings.theme === "system" && colorMode === "dark");
  const isLight = !isDark;

  // load configuration on initial render
  useEffect(() => {
    const storageSettingsString = localStorage.getItem(MdxEditorSettingsKey);
    if (storageSettingsString) {
      const storageSettings = ZMdxEditorSettings.safeParse(JSON.parse(storageSettingsString));
      if (storageSettings.success) setSettings(storageSettings.data);
      else localStorage.setItem(MdxEditorSettingsKey, JSON.stringify(settings));
    }
  }, []);

  // update localStorage on settings update
  useEffect(() => {
    localStorage.setItem(MdxEditorSettingsKey, JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings, isDark, isLight };
};

const useEditorState = (editorRef: React.RefObject<ReactCodeMirrorRef>) => {
  const [editorState, setEditorState] = useState<EditorState>({
    value: "",
    editor: undefined,
    scrollPos: { y: 0, x: 0 },
    images: [],
  });

  const onChange: NonNullable<ReactCodeMirrorProps["onChange"]> = (value, viewUpdate) => {
    const scrollDOM = editorRef.current?.view?.scrollDOM;
    const scrollPos = scrollDOM ? { y: scrollDOM.scrollTop, x: scrollDOM.scrollLeft } : { x: 0, y: 0 };
    setEditorState({ ...editorState, value, editor: viewUpdate.state, scrollPos });
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // capture the file details
    const dtItem = e.dataTransfer.items[0];
    if (dtItem.kind === "file") {
      const file = dtItem.getAsFile();
      if (file) {
        let newImage = { type: "local", name: file.name, file } as const;
        setEditorState({ ...editorState, images: [...editorState.images, newImage] });
      }
    }
  };

  const onDragOver = async (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // restore scroll position
  useEffect(() => {
    setTimeout(() => {
      const scrollDOM = editorRef.current?.view?.scrollDOM;
      if (scrollDOM) {
        scrollDOM.scrollTo({ top: editorState.scrollPos.y, left: editorState.scrollPos.x });
      }
    }, 1);
  }, [editorRef.current]);

  return { editorState, setEditorState, handlers: { onChange, onDrop, onDragOver } };
};

const useCodeMirrorHeight = () => {
  const [containerRef, toolbarRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // will trigger a re-render on window resize, needed to trigger height recomputation
  useWindowSize();

  // compute the heights
  const containerHeight = containerRef && containerRef.current ? containerRef.current.clientHeight : 0;
  const toolbarHeight = toolbarRef && toolbarRef.current ? toolbarRef.current.clientHeight : 0;
  const height = containerHeight && toolbarHeight ? `${containerHeight - toolbarHeight}px` : "100%";

  return { height, containerRef, toolbarRef };
};

interface MdxEditorProps extends BoxProps {}

export const MdxEditor = (props: MdxEditorProps) => {
  // setup editor settings
  const { isDark, settings, setSettings } = useEditorSettings();

  // setup editor state
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const { editorState, handlers } = useEditorState(editorRef);

  // get the non-dynamic height of codemirror
  const { height, containerRef, toolbarRef } = useCodeMirrorHeight();

  // define codemirror styles
  const codeMirrorStyle = css({ height, fontSize: "16px", borderRadius: "lg", overflow: "hidden" })(useTheme());

  // define special commands
  Vim.defineEx("write", "w", () => {
    alert("Have writtin to the db!");
  });

  const data = useActionData();
  console.log(data);

  return (
    <Box
      ref={containerRef}
      sx={{ "& .cm-panels": CmPanelStyles }}
      display="grid"
      gridTemplateRows="min-content 1fr"
      {...props}
    >
      <Form method="post">
        <input name="mdx-editor-value" value={editorState.value} type="hidden" />
        <Toolbar ref={toolbarRef} pb={2} settings={settings} setSettings={setSettings} />
        {settings.view === "code" ? (
          <CodeMirror
            ref={editorRef}
            initialState={editorState.editor ? { json: editorState.editor.toJSON() } : undefined}
            value={editorState.value}
            theme={isDark ? githubDark : githubLight}
            extensions={[
              ...(settings.isVim ? [vim()] : []),
              markdown({ base: markdownLanguage, codeLanguages: languages }),
            ]}
            height={height}
            style={codeMirrorStyle}
            {...handlers}
          />
        ) : null}
        {settings.view === "preview" && data && data.code ? getMDXComponent(data.code)({ props: {} }) : null}
        {settings.view === "attachments" ? (
          <ScrollBox height="full">
            {editorState.images.length > 0
              ? editorState.images.map((img) => <ImageAttachment key={img.name} image={img} />)
              : "No images"}
          </ScrollBox>
        ) : null}
      </Form>
    </Box>
  );
};
