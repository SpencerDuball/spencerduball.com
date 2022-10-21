import React, { useState } from "react";
import { vim, Vim } from "@replit/codemirror-vim";
import type { BoxProps } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { IconButton, ButtonGroup, Icon, Box, DarkMode } from "@chakra-ui/react";
import { ScrollBox } from "~/components";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { DiVim } from "react-icons/di";
import type { StringEnum } from "~/ts-utils";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubLight, githubDark } from ".";

// Vim Command - this is the vim command component styles, ex: "--insert-- :w"
const CmPanelStyles: BoxProps["sx"] = { position: "absolute", bottom: 0, left: 0 };

// Toolbar
////////////////////////////////////////////////////////////////////////////////
type EditorThemeType = StringEnum<"light" | "dark" | "system">;
interface ToolbarProps extends BoxProps {
  isVim: boolean;
  setIsVim: (isVim: boolean) => void;
  editorTheme: EditorThemeType;
  setEditorTheme: (theme: EditorThemeType) => void;
}
const Toolbar = (props: ToolbarProps) => {
  const { colorMode } = useColorMode();
  const { isVim, setIsVim, editorTheme, setEditorTheme, ...rest } = props;

  // determine button colors
  const colorScheme =
    editorTheme === "light" || (editorTheme === "system" && colorMode === "light") ? "grayDark" : "grayDarkA";
  const inactiveColor =
    editorTheme === "light" || (editorTheme === "system" && colorMode === "light") ? "grayDark.9" : "grayDarkA.8";
  const activeColor =
    editorTheme === "light" || (editorTheme === "system" && colorMode === "light") ? "gray.12" : "grayDarkA.12";

  return (
    <Box display="flex" gap={2} {...rest}>
      <DarkMode>
        <ButtonGroup isAttached size="lg" colorScheme={colorScheme}>
          <IconButton
            aria-label="Toggle Dark Mode"
            color={editorTheme === "dark" ? activeColor : inactiveColor}
            onClick={() => setEditorTheme(editorTheme === "dark" ? "system" : "dark")}
            icon={<Icon as={RiMoonFill} />}
          />
          <IconButton
            aria-label="Toggle Light Mode"
            color={editorTheme === "light" ? activeColor : inactiveColor}
            onClick={() => setEditorTheme(editorTheme === "light" ? "system" : "light")}
            icon={<Icon as={RiSunFill} />}
          />
        </ButtonGroup>
        <IconButton
          aria-label="Toggle Light Mode"
          size="lg"
          colorScheme={colorScheme}
          color={isVim ? activeColor : inactiveColor}
          onClick={() => setIsVim(!isVim)}
          icon={<Icon as={DiVim} />}
        />
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
    let [lightTheme, darkTheme] = [githubLight, githubDark];
    if (editorTheme === "dark" || (editorTheme === "system" && colorMode === "dark")) return darkTheme;
    else if (editorTheme === "light" || (editorTheme === "system" && colorMode === "light")) return lightTheme;
  };

  // determine editor mode
  const [isVim, setIsVim] = useState(true);

  return (
    <ScrollBox sx={{ "& .cm-panels": CmPanelStyles }} maxW="100vw" borderRadius="xl" {...props}>
      <CodeMirror
        theme={getTheme()}
        extensions={[...(isVim ? [vim()] : []), markdown({ base: markdownLanguage, codeLanguages: languages })]}
        height="100%"
        style={{ height: "100%" }}
      />
      <Toolbar
        position="absolute"
        top={4}
        right={4}
        isVim={isVim}
        setIsVim={setIsVim}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
      />
    </ScrollBox>
  );
};
