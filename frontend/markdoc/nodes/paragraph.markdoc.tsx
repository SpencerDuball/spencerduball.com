import { Text, TextProps } from "@chakra-ui/react";

const P = (props: TextProps & { href: string }) => (
  <Text
    as="p"
    mt={5}
    lineHeight="1.7"
    sx={{ "blockquote &": { mt: 0 } }}
    {...props}
  />
);

export const paragraph = {
  render: P,
};
