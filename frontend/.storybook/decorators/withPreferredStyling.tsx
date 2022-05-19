import { Box, IconButton, Icon, useColorMode } from "@chakra-ui/react";
import { RiSunFill } from "react-icons/ri";
import { Story } from "@storybook/react";

export const withPreferredStyling = (Story: Story) => {
  const { toggleColorMode } = useColorMode();
  return (
    <Box position="relative" minH="full" w="full">
      <IconButton
        aria-label="Change theme"
        icon={<Icon as={RiSunFill} />}
        position="absolute"
        top={0}
        right={0}
        onClick={toggleColorMode}
      />
      <Story />
    </Box>
  );
};
