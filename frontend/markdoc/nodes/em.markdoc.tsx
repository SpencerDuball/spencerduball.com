import { Box, BoxProps } from "@chakra-ui/react";

const Em = (props: BoxProps) => <Box as="span" fontStyle="italic" {...props} />;

export const em = {
  render: Em,
};
