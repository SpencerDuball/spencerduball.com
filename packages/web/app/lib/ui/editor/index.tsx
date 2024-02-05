import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import CodeMirror, {
  ReactCodeMirrorProps,
  EditorView,
  lineNumbers,
  scrollPastEnd,
  EditorState,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { useHydrated } from "remix-utils/use-hydrated";
import React, { useMemo, useContext } from "react";
import { vim } from "@replit/codemirror-vim";
import { cn } from "~/lib/util/utils";
import { EditorCtx } from "./context";
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
import { Link, useHref, useLocation } from "@remix-run/react";
import p from "prettier/plugins/markdown";
import { formatWithCursor } from "prettier/standalone";

async function prettify(state: EditorState) {
  const beforeValue = state.doc.toString();
  const { formatted: afterValue, cursorOffset } = await formatWithCursor(beforeValue, {
    cursorOffset: state.selection.ranges[0].from ?? 0,
    parser: "markdown",
    plugins: [p],
  });
  return { value: afterValue, position: cursorOffset };
}

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
  const [ctx, dispatch] = useContext(EditorCtx);

  // determine the theme icon
  let themeIcon = <RxHalf2 />;
  if (ctx.settings.theme === "dark") themeIcon = <RiMoonFill />;
  else if (ctx.settings.theme === "light") themeIcon = <RiSunFill />;

  // define the navigation paths
  const { pathname } = useLocation();
  const editHref = useHref("edit");
  const previewHref = useHref("preview");
  const attachmentsHref = useHref("attachments");

  return (
    <div
      className={cn(
        "grid w-max grid-flow-col gap-1.5 rounded-lg border border-slate-4 bg-slate-2 p-1.5 shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Left Menu Items */}
      <div className="grid grid-flow-col gap-1.5">
        <IconButton size="sm" aria-label="Save content." variant="ghost" icon={<RiSaveLine />} />
        <IconButton
          size="sm"
          aria-label="Format content."
          variant="ghost"
          icon={<SiPrettier />}
          onClick={async () => {
            if (ctx.data.state) {
              const { value, position } = await prettify(ctx.data.state);
              dispatch({ type: Types.PatchData, payload: { state: ctx.data.state, value, cursor: position } });
              // new EditorView({ state: ctx.data.state }).dispatch({ selection: { anchor: position, head: position } });
            }
          }}
        />
      </div>
      {/* Divider */}
      <div className="h-full w-px bg-slate-5" />
      {/* Center Menu Items */}
      <div className="grid grid-flow-col gap-1.5">
        <Link to={editHref}>
          <IconButton
            isActive={pathname === editHref}
            size="sm"
            aria-label="Go to edit view."
            variant="ghost"
            icon={<RiCodeSSlashFill />}
          />
        </Link>
        <Link to={previewHref}>
          <IconButton
            isActive={pathname === previewHref}
            size="sm"
            aria-label="Go to preview view."
            variant="ghost"
            icon={<RiArticleLine />}
          />
        </Link>
        <Link to={attachmentsHref}>
          <IconButton
            isActive={pathname === attachmentsHref}
            size="sm"
            aria-label="Go to attachments view."
            variant="ghost"
            icon={<RiAttachment2 />}
          />
        </Link>
      </div>
      {/* Divider */}
      <div className="h-full w-px bg-slate-5" />
      {/* Right Menu Items */}
      <div className="grid grid-flow-col gap-1.5">
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
          isActive={ctx.settings.mode === "vim"}
          onClick={() => dispatch({ type: Types.ToggleMode })}
        />
        <IconButton
          size="sm"
          aria-label="Toggle text wrap."
          variant="ghost"
          icon={<RiTextWrap />}
          isActive={ctx.settings.lineWrap === true}
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
    gutterBackground: "#e7e9db",
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
    background: "#1A191B",
    foreground: "#c9d1d9",
    caret: "#c9d1d9",
    selection: "#003d73",
    selectionMatch: "#003d73",
    lineHighlight: "#36334280",
    gutterBackground: "#1A191B",
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

export interface EditorProps extends ReactCodeMirrorProps {}

export function Editor({
  className,
  onCreateEditor,
  onTouchStart,
  onBlur,
  onScrollCapture,
  onUpdate,
  ...props
}: EditorProps) {
  const isHydrated = useHydrated();
  const [ctx, dispatch] = useContext(EditorCtx);

  // Define Editor Extensions
  // ----------------------------------
  // Memoize the extensions as they are expensive to recompute on each render.
  // In development extensions sometimes cause styles to be lost on hot reloads, a full refresh may be needed.
  const extensions = useMemo(
    () => [
      // Add support for markdown syntax highlighting.
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      // Ensure lineNumbers gutter reserves space for at least 3 digits to prevent layout shift.
      lineNumbers({ formatNumber: (lineNo) => lineNo.toString().padStart(3, "\u00A0") }),
      // Allow editor to scroll past content
      scrollPastEnd(),
      ctx.settings.mode === "vim" ? vim() : [],
      ctx.settings.lineWrap ? EditorView.lineWrapping : [],
    ],
    [ctx.settings],
  );

  // Disable iOS Auto Zoom for Small Font
  // ------------------------------------
  // On iOS we will disable the zoom on touchStart, this will prevent the auto-zoom happening on text less than 16px.
  // We also need to re-enable the zoom onBlur as disabling this site-wide permanently is not accessible.
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

  // Determine Editor Theme
  // ----------------------
  // The editor theme can be toggled between "dark", "light", and "system". The system color will follow any setting
  // that the site "_theme" matches.
  let _theme: "light" | "dark" = "dark";
  const [{ preferences }] = useContext(GlobalCtx);
  if (ctx.settings.theme === "system") _theme = preferences._theme;
  else _theme = ctx.settings.theme;

  return isHydrated ? (
    <CodeMirror
      className={cn(
        "h-full min-h-0 w-full min-w-0 overflow-clip rounded-lg [&_.cm-editor]:h-full [&_.cm-editor]:w-full",
        "[&_.cm-scroller]:scrollbar-thin [&_.cm-scroller]:scrollbar-thumb-rounded-full",
        _theme === "dark"
          ? "[&_.cm-scroller]:scrollbar-track-slateDark-3 [&_.cm-scroller]:scrollbar-thumb-slateDark-6 [&_.cm-scroller]:scrollbar-corner-slateDark-3"
          : "[&_.cm-scroller]:scrollbar-track-slateLight-3 [&_.cm-scroller]:scrollbar-thumb-slateLight-6 [&_.cm-scroller]:scrollbar-corner-slateLight-3",
      )}
      extensions={extensions}
      basicSetup={{ autocompletion: false }}
      theme={_theme === "light" ? githubLight : githubDark}
      onCreateEditor={(view, state) => {
        view.scrollDOM.scrollTo({ left: ctx.data.scroll.x, top: ctx.data.scroll.y });
        view.dispatch({ selection: { anchor: ctx.data.cursor, head: ctx.data.cursor } });
        dispatch({ type: Types.PatchData, payload: { state } });
        onCreateEditor && onCreateEditor(view, state);
      }}
      onTouchStart={(e) => {
        disableIOSInputZoom(e);
        onTouchStart && onTouchStart(e);
      }}
      onBlur={(e) => {
        enableIOSInputZoom(e);
        onBlur && onBlur(e);
      }}
      value={ctx.data.value}
      onUpdate={(viewUpdate) => {
        const state = viewUpdate.state;
        const scroll = { x: viewUpdate.view.scrollDOM.scrollLeft, y: viewUpdate.view.scrollDOM.scrollTop };
        const value = viewUpdate.state.doc.toString();
        const cursor = viewUpdate.state?.selection.ranges[0].from;
        if (JSON.stringify(state) !== JSON.stringify(ctx.data.state)) {
          console.log("yo");
          dispatch({ type: Types.PatchData, payload: { scroll, value, cursor, state } });
        }
      }}
      onScrollCapture={(e) => {
        // TODO: When mounting scroll restore will fire twice, and for some reason the second will have less scroll
        // than the first. Need to debug why that is to fix scroll restore.
        const cmScroller = e.currentTarget.getElementsByClassName("cm-scroller")[0];
        if (cmScroller)
          dispatch({ type: Types.PutScroll, payload: { x: cmScroller.scrollLeft, y: cmScroller.scrollTop } });
        onScrollCapture && onScrollCapture(e);
      }}
      {...props}
    />
  ) : (
    <div className={cn("animate-pulse rounded-md bg-slate-3", className)} />
  );
}

export { EditorCtx, EditorProvider } from "./context";
