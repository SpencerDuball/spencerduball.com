import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { ScrollArea, type ScrollAreaProps, ScrollViewport } from "~/lib/ui/scroll-box";
import { useHydrated } from "remix-utils/use-hydrated";
import React, { useRef, useMemo, useContext } from "react";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vim } from "@replit/codemirror-vim";
import { cn } from "~/lib/util/utils";
import { EditorCtx, IEditorState } from "./context";
import { IconButton, type IconButtonProps } from "~/lib/ui/button";
import {
  RiSaveLine,
  RiCodeSSlashFill,
  RiArticleLine,
  RiAttachment2,
  RiTextWrap,
  RiMoonFill,
  RiSunFill,
} from "react-icons/ri";
import { SiPrettier } from "react-icons/si";
import { DiVim } from "react-icons/di";
import { RxHalf2 } from "react-icons/rx";
import { Types } from "./reducer";
import { GlobalCtx } from "~/lib/context/global-ctx";

//---------------------------------------------------------------------------------------------------------------------
// Toolbar
// -------
// This is the toolbar from which settings can be toggled, the markdown can be saved, and previews can be triggered.
//---------------------------------------------------------------------------------------------------------------------
export interface ToolbarProps extends React.ComponentProps<"div"> {
  save?: IconButtonProps;
  format?: IconButtonProps;
}

export function Toolbar({ className, ...props }: ToolbarProps) {
  const [state, dispatch] = useContext(EditorCtx);

  // determine the theme icon
  let themeIcon = <RxHalf2 />;
  if (state.settings.theme === "dark") themeIcon = <RiMoonFill />;
  else if (state.settings.theme === "light") themeIcon = <RiSunFill />;

  return (
    <div
      className={cn(
        "grid w-max grid-flow-col gap-1.5 rounded-lg border border-slate-4 bg-slate-2 p-1.5 shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Left Menu Items */}
      <div className="grid grid-flow-col gap-1">
        <IconButton size="sm" aria-label="Save content." variant="ghost" icon={<RiSaveLine />} />
        <IconButton size="sm" aria-label="Format content." variant="ghost" icon={<SiPrettier />} />
      </div>
      {/* Divider */}
      <div className="h-full w-px bg-slate-5" />
      {/* Center Menu Items */}
      <div className="grid grid-flow-col gap-1">
        <IconButton size="sm" aria-label="Go to edit view." variant="ghost" icon={<RiCodeSSlashFill />} />
        <IconButton size="sm" aria-label="Go to preview view." variant="ghost" icon={<RiArticleLine />} />
        <IconButton size="sm" aria-label="Go to attachments view." variant="ghost" icon={<RiAttachment2 />} />
      </div>
      {/* Divider */}
      <div className="h-full w-px bg-slate-5" />
      {/* Right Menu Items */}
      <div className="grid grid-flow-col gap-1">
        <IconButton
          size="sm"
          aria-label="Toggle editor theme."
          variant="ghost"
          icon={themeIcon}
          onClick={() => dispatch({ type: Types.ToggleTheme })}
        />
        <IconButton
          size="sm"
          aria-label="Toggle vim mode."
          variant="ghost"
          icon={<DiVim />}
          isActive={state.settings.mode === "vim"}
          onClick={() => dispatch({ type: Types.ToggleMode })}
        />
        <IconButton
          size="sm"
          aria-label="Toggle text wrap."
          variant="ghost"
          icon={<RiTextWrap />}
          isActive={state.settings.lineWrap === true}
          onClick={() => dispatch({ type: Types.ToggleLineWrap })}
        />
      </div>
    </div>
  );
}

//---------------------------------------------------------------------------------------------------------------------
// Editor
// ------
// This is the actual React editor that users will interface with.
//---------------------------------------------------------------------------------------------------------------------
// define light theme
const githubLight = createTheme({
  theme: "light",
  settings: {
    background: "#e7e9db",
    foreground: "#24292e",
    selection: "#BBDFFF",
    selectionMatch: "#BBDFFF",
    gutterBackground: "transparent",
    gutterForeground: "#6e7781",
    lineHighlight: "#C0DAE3",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: [t.comment, t.bracket], color: "#6a737d" },
    { tag: [t.className, t.propertyName], color: "#6f42c1" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "#005cc5" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "#d73a49" },
    { tag: [t.string, t.meta, t.regexp], color: "#032f62" },
    { tag: [t.name, t.quote], color: "#22863a" },
    { tag: [t.heading], color: "#24292e", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#24292e", fontStyle: "italic" },
    { tag: [t.deleted], color: "#b31d28", backgroundColor: "ffeef0" },
  ],
});

const githubDark = createTheme({
  theme: "dark",
  settings: {
    background: "#1A191B", // "#0d1117",
    foreground: "#c9d1d9",
    caret: "#c9d1d9",
    selection: "#003d73",
    selectionMatch: "#003d73",
    lineHighlight: "#36334280",
    gutterBackground: "transparent",
    gutterBorder: "transparent",
  },
  styles: [
    { tag: [t.comment, t.bracket], color: "#8b949e" },
    { tag: [t.className, t.propertyName], color: "#d2a8ff" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "#79c0ff" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "#ff7b72" },
    { tag: [t.string, t.meta, t.regexp], color: "#a5d6ff" },
    { tag: [t.name, t.quote], color: "#7ee787" },
    { tag: [t.heading], color: "#d2a8ff", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#d2a8ff", fontStyle: "italic" },
    { tag: [t.deleted], color: "#ffdcd7", backgroundColor: "ffeef0" },
  ],
});

export interface EditorProps extends ScrollAreaProps {
  cm?: ReactCodeMirrorProps;
}

export function Editor({ cm, className, ...props }: EditorProps) {
  const isHydrated = useHydrated();
  const viewportRef = useRef<HTMLDivElement>(null!);
  const [state] = useContext(EditorCtx);

  // Min Line Number Width
  // ---------------------
  // This TW class ensures that the line number display on the left of the editor will always be the width of at least
  // 3 characters. The 8px accounts for the padding size as well (pl=5px & lr=3px).
  const minCharsGutter = "[&_.cm-lineNumbers]:min-w-[calc(3ch+8px)]";

  // Scroll Past Margin
  // ------------------
  // This function adds padding to the bottom of content so that the user can scroll past the last line of content.
  // without this the user would need to write every new line at the bottom of the screen (where end of editor is).
  const setupScrollPastContent: ReactCodeMirrorProps["onCreateEditor"] = (view) => {
    const cmContent = view.dom.getElementsByClassName("cm-content")[0] as HTMLElement;
    if (cmContent && viewportRef.current) cmContent.style.paddingBottom = `${viewportRef.current.clientHeight}px`;
  };

  // Define Editor Extensions
  // ----------------------------------
  // Memoize the extensions as they are expensive to recompute on each render.
  // In development extensions sometimes cause styles to be lost on hot reloads, a full refresh may be needed.
  const extensions = useMemo(
    () => [markdown({ base: markdownLanguage, codeLanguages: languages }), state.settings.mode === "vim" ? vim() : []],
    [state.settings],
  );

  // Disable iOS Auto Zoom for Small Font
  // ------------------------------------
  // On iOS we will disable the zoom on touchStart, this will prevent the auto-zoom happening on text less than 16px.
  function disableIOSInputZoom(e: React.TouchEvent<HTMLDivElement>) {
    if (isHydrated) {
      const el = document.querySelector("meta[name=viewport]");

      if (el !== null) {
        let content = el.getAttribute("content") || "";
        const re = /maximum\-scale=[0-9\.]+/g;
        if (re.test(content)) content = content.replace(re, "maximum-scale=1.0");
        else {
          let items = content
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== "");
          content = [...items, "maximum-scale=1.0"].join(",");
        }
        el.setAttribute("content", content);
      }
    }
  }

  // Enable iOS Auto Zoom
  // --------------------
  // After disabling the zoom on touchStart, we need to reenable it for any future interactions.
  function enableIOSInputZoom(e: React.FocusEvent<HTMLDivElement, Element>) {
    if (typeof window !== undefined) {
      const el = document.querySelector("meta[name=viewport]");
      if (el !== null) {
        let content = el.getAttribute("content") || "";
        let re = /,?\w?maximum\-scale=[0-9\.]+/g;
        if (re.test(content)) content = content.replace(re, "");
        el.setAttribute("content", content);
      }
    }
  }

  // determine theme
  let _theme: "light" | "dark" = "dark";
  const [{ preferences }] = useContext(GlobalCtx);
  if (state.settings.theme === "system") _theme = preferences._theme;
  else _theme = state.settings.theme;

  return isHydrated ? (
    <ScrollArea className={cn("overflow-hidden rounded-lg", _theme, className)} {...props}>
      <ScrollViewport ref={viewportRef}>
        <CodeMirror
          minHeight="100%"
          className={cn(minCharsGutter)}
          extensions={extensions}
          theme={_theme === "light" ? githubLight : githubDark}
          onCreateEditor={(view, state) => {
            setupScrollPastContent(view, state);
            cm?.onCreateEditor && cm.onCreateEditor(view, state);
          }}
          onTouchStart={(e) => {
            disableIOSInputZoom(e);
            cm?.onTouchStart && cm.onTouchStart(e);
          }}
          onBlur={(e) => {
            enableIOSInputZoom(e);
            cm?.onBlur && cm.onBlur(e);
          }}
          {...cm}
        />
      </ScrollViewport>
    </ScrollArea>
  ) : (
    <div className={cn("animate-pulse rounded-md bg-slate-3", className)} />
  );
}

export { EditorCtx, EditorProvider } from "./context";
