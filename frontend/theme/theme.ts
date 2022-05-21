// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react";
import {
  StyleFunctionProps,
  SystemStyleFunction,
} from "@chakra-ui/theme-tools";
import { theme } from "@dub-stack/chakra-radix-colors";

// 2. Call `extendTheme` and pass your custom values
const newTheme = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  colors: {
    // add all of the colors in ...
    ...theme.colors,
  },
  components: {
    // add all of the components in
    ...theme.components,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      // add the default styles
      ...(theme.styles.global as SystemStyleFunction)(props),
    }),
  },
});

export default newTheme;
