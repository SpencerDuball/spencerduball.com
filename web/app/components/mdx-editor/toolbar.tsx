import { IconButton, useBreakpointValue, forwardRef, Box, Flex, Icon, ButtonGroup } from "@chakra-ui/react";
import type { IconButtonProps, BoxProps } from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { RiSaveFill, RiCodeSSlashFill, RiArticleLine, RiAttachment2, RiMoonFill, RiSunFill } from "react-icons/ri";
import { DiVim } from "react-icons/di";
import { useMdxEditorStore, useMdxEditorState, usePreview } from "./context";

// ToolbarButton
////////////////////////////////////////////////////////////////////////////////
interface ToolbarButtonProps extends IconButtonProps {}

const ToolbarButton = (props: ToolbarButtonProps) => {
  const c = useThemedColor();
  const size = useBreakpointValue({ base: "md", sm: "lg" });
  const color = props.isActive ? c("gray.11") : c("grayA.5");

  return <IconButton colorScheme="_gray" shadow="sm" size={size} color={color} {...props} />;
};

// Toolbar
////////////////////////////////////////////////////////////////////////////////
export interface ToolbarProps extends BoxProps {}

export const Toolbar = forwardRef((props: ToolbarProps, ref) => {
  const c = useThemedColor();
  const state = useMdxEditorState();
  const store = useMdxEditorStore();
  const submit = usePreview();

  return (
    <Box ref={ref} pb={2} display="flex" justifyContent="center" gap={2} {...props}>
      {/* Left Aligned */}
      <Flex gap={2}>
        <ToolbarButton color={c("gray.9")} aria-label="Save Post" icon={<Icon as={RiSaveFill} />} />
      </Flex>
      {/* Center Aligned */}
      <Flex gap={2}>
        <ButtonGroup isAttached>
          <ToolbarButton
            aria-label="toggle code panel"
            icon={<Icon as={RiCodeSSlashFill} />}
            isActive={store.settings.view === "code"}
            onClick={() => (state.settings.view = "code")}
          />
          <ToolbarButton
            aria-label="toggle preview panel"
            icon={<Icon as={RiArticleLine} />}
            isActive={store.settings.view === "preview"}
            onClick={() => {
              state.settings.view = "preview";
              submit();
            }}
          />
          <ToolbarButton
            aria-label="toggle attachments panel"
            icon={<Icon as={RiAttachment2} />}
            isActive={store.settings.view === "attachments"}
            onClick={() => (state.settings.view = "attachments")}
          />
        </ButtonGroup>
      </Flex>
      {/* Right Aligned */}
      <Flex gap={2}>
        <ButtonGroup isAttached>
          <ToolbarButton
            aria-label="toggle dark mode"
            icon={<Icon as={RiMoonFill} />}
            isActive={store.settings.theme === "dark"}
            onClick={() => (state.settings.theme = store.settings.theme === "dark" ? "system" : "dark")}
          />
          <ToolbarButton
            aria-label="toggle light mode"
            icon={<Icon as={RiSunFill} />}
            isActive={store.settings.theme === "light"}
            onClick={() => (state.settings.theme = store.settings.theme === "light" ? "system" : "light")}
          />
        </ButtonGroup>
        <ToolbarButton
          aria-label="toggle vim mode"
          icon={<Icon as={DiVim} />}
          isActive={store.settings.isVimMode}
          onClick={() => (state.settings.isVimMode = !state.settings.isVimMode)}
        />
      </Flex>
    </Box>
  );
});
