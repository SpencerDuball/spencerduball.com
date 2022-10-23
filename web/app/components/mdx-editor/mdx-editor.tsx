import React, { useState, useEffect } from "react";
import { vim, Vim } from "@replit/codemirror-vim";
import type { BoxProps } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton, ButtonGroup, Icon, Box, useBreakpointValue } from "@chakra-ui/react";
import { ScrollBox } from "~/components";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { DiVim } from "react-icons/di";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubLight, githubDark, githubLightBg, githubDarkBg } from ".";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { z } from "zod";

// settings
const MdxEditorSettingsKey = "mdx-editor-settings";
const ZMdxEditorSettings = z.object({
  isVim: z.boolean(),
  theme: z.literal("light").or(z.literal("dark")).or(z.literal("system")),
});
type MdxEditorSettingsType = z.infer<typeof ZMdxEditorSettings>;

// Vim Command - this is the vim command component styles, ex: "--insert-- :w"
const CmPanelStyles: BoxProps["sx"] = { position: "absolute", bottom: 0, left: 0 };

// Toolbar Button
////////////////////////////////////////////////////////////////////////////////
interface ToolbarButtonProps extends IconButtonProps {
  isActive: boolean;
}

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { isActive, ...rest } = props;
  const c = useThemedColor();
  return (
    <IconButton colorScheme="_gray" shadow="sm" size="lg" color={isActive ? c("gray.11") : c("grayA.5")} {...rest} />
  );
};

// Toolbar
////////////////////////////////////////////////////////////////////////////////
interface ToolbarProps extends BoxProps {
  settings: MdxEditorSettingsType;
  setSettings: (settings: MdxEditorSettingsType) => void;
}
const Toolbar = (props: ToolbarProps) => {
  const { settings, setSettings, ...rest } = props;
  const flexDir = useBreakpointValue({ base: "column", sm: "row" } as const);

  return (
    <Box display="flex" flexDir={flexDir} gap={2} {...rest}>
      <ButtonGroup
        isAttached
        flexDir={flexDir}
        sx={{
          "& > button:first-of-type": {
            borderBottomRadius: flexDir === "column" ? 0 : undefined,
            borderTopRadius: flexDir === "column" ? "md !important" : undefined,
          },
          "& > button:last-of-type": {
            borderBottomRadius: flexDir === "column" ? "md !important" : undefined,
            borderTopRadius: flexDir === "column" ? 0 : undefined,
          },
        }}
      >
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
    </Box>
  );
};

// MdxEditor
////////////////////////////////////////////////////////////////////////////////
const useEditorSettings = () => {
  const { colorMode } = useColorMode();
  const [settings, setSettings] = useState<MdxEditorSettingsType>({
    isVim: false,
    theme: "system",
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

const useFileStorage = () => {
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    [...e.dataTransfer.items].forEach(async (item, i) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(`file = ${file!.name}`);
        console.log(e);
      }
    });
  };
  const onDragOver = async (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return { handlers: { onDrop, onDragOver } };
};

interface MdxEditorProps extends BoxProps {}

export const MdxEditor = (props: MdxEditorProps) => {
  const { isDark, settings, setSettings } = useEditorSettings();
  const { handlers } = useFileStorage();

  // define special commands
  Vim.defineEx("write", "w", () => {
    alert("Have writtin to the db!");
  });

  return (
    <ScrollBox
      sx={{ "& .cm-panels": CmPanelStyles }}
      bg={isDark ? githubDarkBg : githubLightBg}
      borderRadius="xl"
      {...handlers}
      {...props}
    >
      <CodeMirror
        theme={isDark ? githubDark : githubLight}
        extensions={[
          ...(settings.isVim ? [vim()] : []),
          markdown({ base: markdownLanguage, codeLanguages: languages }),
        ]}
        height="100%"
        style={{ height: "100%", paddingBottom: "50%", fontSize: "16px" }}
      />
      <Toolbar position="absolute" top={4} right={4} settings={settings} setSettings={setSettings} />
    </ScrollBox>
  );
};
