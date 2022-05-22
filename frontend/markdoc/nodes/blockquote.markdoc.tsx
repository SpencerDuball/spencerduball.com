import { Alert, AlertProps } from "@chakra-ui/react";

const Blockquote = (props: AlertProps) => (
  <Alert
    as="blockquote"
    status="warning"
    variant="left-accent"
    rounded="lg"
    mt={4}
    px={5}
    py={4}
    my={6}
    {...props}
  />
);

export const blockquote = {
  render: Blockquote,
};
