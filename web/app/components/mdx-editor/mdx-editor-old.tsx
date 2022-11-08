import React, { useState, useEffect, useRef } from "react";
import { vim, Vim } from "@replit/codemirror-vim";
import {
  Alert,
  AlertIcon,
  Grid,
  Image,
  useColorMode,
  IconButton,
  ButtonGroup,
  Icon,
  Box,
  css,
  Flex,
  useTheme,
  AspectRatio,
  forwardRef,
  useBreakpointValue,
  useClipboard,
  Link,
  LightMode,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import type { IconButtonProps, BoxProps, AspectRatioProps } from "@chakra-ui/react";
import {
  RiMoonFill,
  RiSunFill,
  RiSaveFill,
  RiCodeSSlashFill,
  RiAttachment2,
  RiLink,
  RiExternalLinkFill,
  RiCheckFill,
  RiImageAddFill,
  RiPlayFill,
  RiPauseFill,
  RiArticleLine,
} from "react-icons/ri";
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
import { useActionData, Form, useSubmit } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";
import { components } from "./preview-view/mdx-components";
import ReactPlayer from "react-player";
import type { OnProgressProps } from "react-player/base";

// constants
const InitialMdxContent = `---
title: New Blog Post
tags: []
---

# New Blog Post

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Velit egestas dui id ornare arcu odio ut. Vulputate odio ut enim
blandit volutpat maecenas volutpat blandit. Nulla pharetra diam sit amet nisl suscipit.
Suspendisse in est ante in nibh. Nunc lobortis mattis aliquam faucibus purus. Aliquam ut porttitor
leo a diam sollicitudin tempor id eu. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus. Justo
eget magna fermentum iaculis eu non diam phasellus. Laoreet suspendisse interdum consectetur
libero id faucibus nisl. Sagittis orci a scelerisque purus semper eget duis at.

## New Header have Arrived!

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Velit egestas dui id ornare arcu odio ut. Vulputate odio ut enim
blandit volutpat maecenas volutpat blandit. Nulla pharetra diam sit amet nisl suscipit.
Suspendisse in est ante in nibh. Nunc lobortis mattis aliquam faucibus purus. Aliquam ut porttitor
leo a diam sollicitudin tempor id eu. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus. Justo
eget magna fermentum iaculis eu non diam phasellus. Laoreet suspendisse interdum consectetur
libero id faucibus nisl. Sagittis orci a scelerisque purus semper eget duis at.

> Here is a blockquote, you never know when one of these babies might come in handy! - [Shakespeare](https://www.wikipedia.com)

\`\`\`js name="yooo" height="250px"
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

const extensions = [javascript({ jsx: true })];

export default function App() {
  return (
    <CodeMirror
      value="console.log('hello world!');"
      height="200px"
      theme={okaidia}
      extensions={[javascript({ jsx: true })]}
    />
  );
}
\`\`\`

### Make sure to have some inline code: \`var b = 123;\`.

Hello there \`let a = randomBytes()\` pumpkin!

# How About Them Apples?

Here is a list of number:

- one
- two
- three

Now we can do the list in order!

1. one
2. two
3. three
`;

// attachments
const ZAttachment = z.object({
  type: z.literal("local").or(z.literal("remote")),
  id: z.string(),
  mime: z.string(),
  url: z.string(),
});
type IAttachment = z.infer<typeof ZAttachment>;
const ZRemoteAttachment = ZAttachment.extend({
  type: z.literal("remote"),
});
type IRemoteAttachment = z.infer<typeof ZRemoteAttachment>;
const ZLocalAttachment = ZAttachment.extend({
  type: z.literal("local"),
});
type ILocalAttachment = z.infer<typeof ZLocalAttachment>;
const ZImageAttachment = ZAttachment.extend({
  mime: z.custom<`image/${string}`>((val) => (val as string).startsWith("image/")),
});
type IImageAttachment = z.infer<typeof ZImageAttachment>;
const ZVideoAttachment = ZAttachment.extend({
  mime: z.custom<`video/${string}`>((val) => (val as string).startsWith("video/")),
});
type IVideoAttachment = z.infer<typeof ZVideoAttachment>;

// settings
const MdxEditorSettingsKey = "mdx-editor-settings";
const ZMdxEditorSettings = z.object({
  isVim: z.boolean(),
  theme: z.literal("light").or(z.literal("dark")).or(z.literal("system")),
  view: z.literal("code").or(z.literal("preview")).or(z.literal("attachments")),
});
type MdxEditorSettingsType = z.infer<typeof ZMdxEditorSettings>;

// editor state
type EditorState = {
  value: string;
  editor: ReactCodeMirrorRef["state"];
  scrollPos: { x: number; y: number };
  attachments: IAttachment[];
};

// Vim Command - this is the vim command component styles, ex: "--insert-- :w"
const CmPanelStyles: BoxProps["sx"] = { position: "absolute", bottom: 0, left: 0 };
////////////////////////////////////////////////////////////////////////////////
// Toolbar
////////////////////////////////////////////////////////////////////////////////

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
  editorState: EditorState;
}
const Toolbar = forwardRef((props: ToolbarProps, ref) => {
  const { settings, setSettings, editorState, ...rest } = props;
  const c = useThemedColor();
  const submit = useSubmit();

  // switch to preview mode
  const toPreview = () => {
    setSettings({ ...settings, view: "preview" });
    let data = new FormData();
    data.append("mdx-editor-value", editorState.value);
    data.append("_action", "mdx-editor-preview");
    submit(data, { method: "post" });
  };

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
            icon={<Icon as={RiArticleLine} />}
            isActive={settings.view === "preview"}
            onClick={toPreview}
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

////////////////////////////////////////////////////////////////////////////////
// Attachments
////////////////////////////////////////////////////////////////////////////////

// Image Attachment
////////////////////////////////////////////////////////////////////////////////
interface ImageAttachmentProps extends BoxProps {
  image: IImageAttachment;
}

const ImageAttachment = (props: ImageAttachmentProps) => {
  const { image, ...rest } = props;
  const { hasCopied, onCopy } = useClipboard(image.url);

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      ratio={1}
      position="relative"
      sx={{ "&:hover > [data-image-overlay]": { visibility: "visible" } }}
      {...rest}
    >
      <>
        <Image src={image.url} h="full" w="full" objectFit="cover" />
        <Grid
          data-image-overlay
          visibility="hidden"
          position="absolute"
          top={0}
          left={0}
          h="full"
          w="full"
          _hover={{ bg: "blackA.9" }}
        >
          <Flex flexDir="column" position="absolute" top={2} right={2} gap={2}>
            <IconButton
              icon={<Icon as={hasCopied ? RiCheckFill : RiLink} />}
              onClick={onCopy}
              aria-label="copy url to clipboard"
            />
            <IconButton
              as={Link}
              href={image.url}
              icon={<Icon as={RiExternalLinkFill} />}
              aria-label="open image in new tab"
              isExternal
              target="_blank"
              rel="noopener noreferrer"
            />
          </Flex>
        </Grid>
      </>
    </AspectRatio>
  );
};

// Video Attachment
////////////////////////////////////////////////////////////////////////////////
interface IVideoState {
  playing: boolean;
  muted: boolean;
  played: number;
  loaded: number;
  duration: number;
  seeking: boolean;
}

interface VideoAttachmentProps extends BoxProps {
  video: IVideoAttachment;
}

const VideoAttachment = (props: VideoAttachmentProps) => {
  const ref = useRef<ReactPlayer>(null);
  const [vidState, setVidState] = useState<IVideoState>({
    playing: false,
    muted: true,
    played: 0,
    loaded: 0,
    duration: 0,
    seeking: false,
  });
  const { video, ...rest } = props;
  const { hasCopied, onCopy } = useClipboard(video.url);

  // define video callbacks
  const handleEnded = () => setVidState({ ...vidState, playing: false });
  const handlePlayPause = () => setVidState({ ...vidState, playing: !vidState.playing });
  const handleProgress = (e: OnProgressProps) => {
    if (!vidState.seeking) setVidState({ ...vidState, played: e.played, loaded: e.loaded });
  };
  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => setVidState({ ...vidState, seeking: true });
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLDivElement>) => setVidState({ ...vidState, seeking: false });
  const handleSeekChange = (value: number) => {
    setVidState({ ...vidState, played: value / 100 });
    if (ref && ref.current) ref.current.seekTo(value / 100);
  };

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      ratio={1}
      position="relative"
      sx={{ "&:hover > [data-image-overlay]": { visibility: "visible" }, "& video": { objectFit: "cover" } }}
      {...rest}
    >
      <>
        <ReactPlayer
          ref={ref}
          playing={vidState.playing}
          url={video.url}
          controls={false}
          onProgress={handleProgress}
          onEnded={handleEnded}
          height="100%"
          width="100%"
          style={{ objectFit: "cover" }}
        />
        <Grid
          data-image-overlay
          visibility="hidden"
          position="absolute"
          top={0}
          left={0}
          h="full"
          w="full"
          _hover={{ bg: "blackA.9" }}
        >
          <Flex flexDir="column" position="absolute" top={2} right={2} gap={2}>
            <IconButton
              icon={<Icon as={hasCopied ? RiCheckFill : RiLink} />}
              onClick={onCopy}
              aria-label="copy url to clipboard"
            />
            <IconButton
              as={Link}
              href={video.url}
              icon={<Icon as={RiExternalLinkFill} />}
              aria-label="open image in new tab"
              isExternal
              target="_blank"
              rel="noopener noreferrer"
            />
          </Flex>
          <LightMode>
            <IconButton
              aria-label="Play"
              size="lg"
              icon={<Icon as={vidState.playing ? RiPauseFill : RiPlayFill} />}
              isRound
              colorScheme="blackA"
              onClick={handlePlayPause}
            />
          </LightMode>
          <Grid templateColumns="1fr max-content" w="full" position="absolute" bottom={2} px={4}>
            <Slider
              aria-label="video seek"
              colorScheme="gray"
              value={Math.round(100 * vidState.played)}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onChange={handleSeekChange}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Grid>
        </Grid>
      </>
    </AspectRatio>
  );
};

// ImageUpload
////////////////////////////////////////////////////////////////////////////////
const useFileUpload = (
  editorState: EditorState,
  setEditorState: (value: React.SetStateAction<EditorState>) => void
) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const onDragOver = async (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // capture the file details
    const dtItem = e.dataTransfer.items[0];
    if (dtItem.kind === "file") {
      const file = dtItem.getAsFile();
      if (file) {
        let attachment = {
          type: "local",
          id: globalThis.crypto.randomUUID(),
          mime: file.type,
          url: URL.createObjectURL(file),
          file,
        } as const;
        setEditorState({ ...editorState, attachments: [...editorState.attachments, attachment] });
      }
    }
  };

  const onClick = async (e: React.MouseEvent<HTMLDivElement>) =>
    inputRef && inputRef.current && inputRef.current.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const attachment = {
        type: "local",
        id: globalThis.crypto.randomUUID(),
        mime: file.type,
        url: URL.createObjectURL(file),
        file,
      } as const;

      // save the attachment
      setEditorState({ ...editorState, attachments: [...editorState.attachments, attachment] });

      // reset the input
      e.target.value = "";
    }
  };

  return { buttonHandlers: { onDragOver, onDrop, onClick }, inputHandlers: { onChange }, inputRef };
};

interface ImageUploadProps extends AspectRatioProps {
  editorState: EditorState;
  setEditorState: (value: React.SetStateAction<EditorState>) => void;
}

const ImageUpload = (props: ImageUploadProps) => {
  const { editorState, setEditorState, ...rest } = props;
  const { buttonHandlers, inputHandlers, inputRef } = useFileUpload(editorState, setEditorState);
  const c = useThemedColor();

  return (
    <AspectRatio
      borderRadius="lg"
      overflow="hidden"
      borderStyle="dashed"
      borderWidth={4}
      borderColor={c("_grayA.6")}
      color={c("_grayA.6")}
      ratio={1}
      cursor="pointer"
      {...buttonHandlers}
      {...rest}
    >
      <Grid placeItems="center">
        <input style={{ display: "none" }} type="file" {...inputHandlers} ref={inputRef} />
        <Icon h="25%" w="25%" as={RiImageAddFill} />
      </Grid>
    </AspectRatio>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Code
////////////////////////////////////////////////////////////////////////////////
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
    value: InitialMdxContent,
    editor: undefined,
    scrollPos: { y: 0, x: 0 },
    attachments: [],
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
          const lines = editorState.value.split("\n");
          if (attachment.mime.includes("image/")) lines[lineIndex] += `![Add description ...](${attachment.url})`;
          if (attachment.mime.includes("video/")) lines[lineIndex] += `<Video controls url="${attachment.url}" />`;
          setEditorState({
            ...editorState,
            attachments: [...editorState.attachments, attachment],
            value: lines.join("\n"),
          });
        } else {
          // if input to editor as a whole, add a new line
          const lines = editorState.value.split("\n");
          if (attachment.mime.includes("image/")) lines.push(`![Add description ...](${attachment.url})`);
          if (attachment.mime.includes("video/")) lines.push(`<Video controls url="${attachment.url}" />`);
          setEditorState({
            ...editorState,
            attachments: [...editorState.attachments, attachment],
            value: lines.join("\n"),
          });
        }
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

const useCodeMirrorDimensions = () => {
  const [containerRef, toolbarRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // will trigger a re-render on window resize, needed to trigger height recomputation
  useWindowSize();

  // compute the heights
  const containerHeight = containerRef && containerRef.current ? containerRef.current.clientHeight : 0;
  const toolbarHeight = toolbarRef && toolbarRef.current ? toolbarRef.current.clientHeight : 0;
  const height = containerHeight && toolbarHeight ? `${containerHeight - toolbarHeight}px` : "100%";

  // compute the width
  const width = containerRef && containerRef.current ? `${containerRef.current.clientWidth}px` : `100%`;

  return { height, width, containerRef, toolbarRef };
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
interface MdxEditorProps extends BoxProps {}

export const MdxEditor = (props: MdxEditorProps) => {
  // setup editor settings
  const { isDark, settings, setSettings } = useEditorSettings();

  // setup editor state
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const { editorState, setEditorState, handlers } = useEditorState(editorRef);

  // get the non-dynamic height and width of codemirror
  const { height, width, containerRef, toolbarRef } = useCodeMirrorDimensions();

  // define codemirror styles
  const [fontSize, lineHeight] = ["16px", 1.4];
  const codeMirrorStyle = css({ height, width, fontSize, borderRadius: "lg", overflow: "hidden" })(useTheme());
  const CmContentStyles: BoxProps["sx"] = { pb: `calc(${height} - 2 * ${fontSize} * ${lineHeight})` };

  // define special commands
  Vim.defineEx("write", "w", () => alert("Have writtin to the db!"));

  const data = useActionData();
  let Component = null;
  if (data && data.code) Component = getMDXComponent(data.code);

  return (
    <Box
      ref={containerRef}
      sx={{ "& .cm-panels": CmPanelStyles, "& .cm-content": CmContentStyles }}
      display="grid"
      gridTemplateRows="min-content 1fr"
      {...props}
    >
      <Toolbar ref={toolbarRef} pb={2} settings={settings} setSettings={setSettings} editorState={editorState} />
      {settings.view === "code" ? (
        <Form method="post">
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
        </Form>
      ) : null}
      {settings.view === "preview" && Component ? (
        <Box>
          <Component components={{ ...(components as any), Alert: Alert, AlertIcon: AlertIcon }} />
        </Box>
      ) : null}
      {settings.view === "attachments" ? (
        <ScrollBox height="full">
          {editorState.attachments.length > 0 ? (
            <Grid templateColumns="1fr 1fr 1fr" gap={2}>
              {editorState.attachments.map((att) => {
                // display image attachment
                const safeImg = ZImageAttachment.safeParse(att);
                if (safeImg.success) return <ImageAttachment key={safeImg.data.id} image={safeImg.data} />;

                // display video attachment
                const safeVid = ZVideoAttachment.safeParse(att);
                if (safeVid.success) return <VideoAttachment key={safeVid.data.id} video={safeVid.data} />;

                return null;
              })}
              <ImageUpload editorState={editorState} setEditorState={setEditorState} />
            </Grid>
          ) : (
            <Grid placeItems="center" w="full">
              <ImageUpload w="full" maxW="container.sm" editorState={editorState} setEditorState={setEditorState} />
            </Grid>
          )}
        </ScrollBox>
      ) : null}
    </Box>
  );
};
