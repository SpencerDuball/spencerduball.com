import CodeMirror from "@uiw/react-codemirror";
import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import { useMeasure } from "react-use";
import * as React from "react";
import { cn } from "~/lib/util";
import { GlobalContext } from "~/components/app/global-ctx";
import { CmsEditorCtx, Types, useCmsEditor } from "~/components/app/cms-editor-ctx";

// ------------------------------------------------------------------------------------------------------------
// Define Editor Themes
// ------------------------------------------------------------------------------------------------------------
const githubLightBg = "#e7e9db";
const githubLight = createTheme({
  theme: "light",
  settings: {
    background: "#e7e9db",
    foreground: "#24292e",
    selection: "#BBDFFF",
    selectionMatch: "#BBDFFF",
    gutterBackground: "transparent",
    gutterForeground: "#6e7781",
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

const githubDarkBg = "#0d1117";
const githubDark = createTheme({
  theme: "dark",
  settings: {
    background: githubDarkBg,
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

// ------------------------------------------------------------------------------------------------------------
// Editor View
// ------------------------------------------------------------------------------------------------------------

export default function Edit() {
  const [containerRef, { height, width }] = useMeasure<HTMLDivElement>();
  const [state] = React.useContext(CmsEditorCtx);
  const scrollBoxRef = React.useRef<HTMLDivElement>(null!);

  const { initialized, codeMirrorProps, scrollBoxProps } = useCmsEditor({ scrollBoxRef });

  // determine theme
  let _theme: "light" | "dark" = "dark";
  const [globalCtx] = React.useContext(GlobalContext);
  if (state.settings.theme === "system") _theme = globalCtx._theme;
  else _theme = state.settings.theme;

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full overflow-hidden rounded-lg",
        initialized ? "visible" : "invisible",
        _theme === "dark" ? "bg-[#0d1117]" : "bg-[#e7e9db]"
      )}
    >
      <ScrollArea style={{ height: `${height}px`, width: `${width}px` }} className="rounded-lg">
        <ScrollViewport ref={scrollBoxRef} {...scrollBoxProps}>
          <CodeMirror
            theme={_theme === "dark" ? githubDark : githubLight}
            style={{ paddingBottom: `${height * 0.95}px` }}
            className="[&_.cm-editor]:outline-0"
            {...codeMirrorProps}
          />
        </ScrollViewport>
      </ScrollArea>
    </div>
  );
}
