import { Box, BoxProps } from "@chakra-ui/react";

const Strong = (props: BoxProps) => (
  <Box as="span" fontWeight="bold" {...props} />
);

export const strong = {
  render: Strong,
};
