import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "@dub-stack/chakra-radix-colors";
import { Story } from "@storybook/react";

export const withChakraUi = (Story: Story) => (
  <>
    <ColorModeScript />
    <ChakraProvider theme={theme}>
      <Story />
    </ChakraProvider>
  </>
);
