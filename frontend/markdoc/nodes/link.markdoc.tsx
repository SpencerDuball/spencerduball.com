import { Link, LinkProps } from "@chakra-ui/react";

const A = (props: LinkProps) => <Link color="blue.9" {...props} />;

export const link = {
  render: A,
  attributes: {
    title: { type: String, required: true },
    href: { type: String, required: true },
  },
};
