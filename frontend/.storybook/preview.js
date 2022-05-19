import { withChakraUi } from "./decorators/withChakraUi";
import { withPreferredStyling } from "./decorators/withPreferredStyling";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [withPreferredStyling, withChakraUi];
