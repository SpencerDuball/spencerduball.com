import React, { useState } from "react";
import { SandpackProvider, SandpackThemeProvider, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { vim, Vim } from "@replit/codemirror-vim";
import { gruvboxLight, gruvboxDark } from "@codesandbox/sandpack-themes";
import type { BoxProps } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { IconButton, ButtonGroup, Icon, Box, chakra, DarkMode } from "@chakra-ui/react";
import { ScrollBox } from "~/components";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import type { StringEnum } from "~/ts-utils";

// Sandpack
const SpProvider = chakra(SandpackProvider);
const SpThemeProvider = chakra(SandpackThemeProvider);

// Vim Command - this is the vim command component styles, ex: "--insert-- :w"
const CmPanelStyles: BoxProps["sx"] = { position: "absolute", bottom: 0, left: 0 };

// Toolbar
////////////////////////////////////////////////////////////////////////////////
type EditorThemeType = StringEnum<"light" | "dark" | "system">;
interface ToolbarProps extends BoxProps {
  editorTheme: EditorThemeType;
  setEditorTheme: (theme: EditorThemeType) => void;
}
const Toolbar = (props: ToolbarProps) => {
  const { editorTheme, setEditorTheme, ...rest } = props;

  return (
    <Box display="flex" gap={2} {...rest}>
      <DarkMode>
        <ButtonGroup isAttached size="lg" colorScheme="grayDarkA">
          <IconButton
            aria-label="Toggle Dark Mode"
            color={editorTheme === "dark" ? undefined : "grayDarkA.8"}
            onClick={() => setEditorTheme(editorTheme === "dark" ? "system" : "dark")}
            icon={<Icon as={RiMoonFill} />}
          />
          <IconButton
            aria-label="Toggle Light Mode"
            color={editorTheme === "light" ? undefined : "grayDarkA.8"}
            onClick={() => setEditorTheme(editorTheme === "light" ? "system" : "light")}
            icon={<Icon as={RiSunFill} />}
          />
        </ButtonGroup>
      </DarkMode>
    </Box>
  );
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
interface MdxEditorProps extends BoxProps {}

export const MdxEditor = (props: MdxEditorProps) => {
  // define special commands
  Vim.defineEx("write", "w", () => {
    alert("Have writtin to the db!");
  });

  // determine the editor theme
  const { colorMode } = useColorMode();
  const [editorTheme, setEditorTheme] = useState<EditorThemeType>("system");
  let getTheme = () => {
    let [lightTheme, darkTheme] = [gruvboxLight, gruvboxDark];
    if (editorTheme === "dark" || (editorTheme === "system" && colorMode === "dark")) return darkTheme;
    else if (editorTheme === "light" || (editorTheme === "system" && colorMode === "light")) return lightTheme;
  };

  return (
    <ScrollBox sx={{ "& .cm-panels": CmPanelStyles }} maxW="100vw" borderRadius="xl" {...props}>
      <SpProvider>
        <SpThemeProvider theme={getTheme()} height="full">
          <SandpackCodeEditor
            initMode="immediate"
            extensions={[vim()]}
            style={{ height: "100%", paddingBottom: "100%" }}
          />
          <Toolbar position="absolute" top={4} right={4} editorTheme={editorTheme} setEditorTheme={setEditorTheme} />
        </SpThemeProvider>
      </SpProvider>
    </ScrollBox>
  );
};
