import type {
  BoxProps,
  TextProps,
  ButtonProps,
  DividerProps,
  AlertProps,
  ListItemProps,
  CodeProps,
  ListProps,
  ImageProps,
} from "@chakra-ui/react";
import {
  Box,
  Text,
  Button,
  Divider,
  Alert,
  UnorderedList,
  OrderedList,
  Kbd,
  Thead,
  Td,
  ListItem,
  Code,
  Image,
} from "@chakra-ui/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { CodeBlock } from "./codeblock";
import type { ReactPlayerProps } from "react-player";
import ReactPlayer from "react-player";

const H1 = (props: TextProps) => {
  return (
    <Text as="h2" mt={16} mb={3} lineHeight="1.2" fontWeight="bold" fontSize="3xl" letterSpacing="tight" {...props} />
  );
};

const H2 = (props: TextProps) => (
  <Text
    as="h3"
    mt={8}
    mb={2}
    lineHeight="1.3"
    fontWeight="bold"
    fontSize="2xl"
    letterSpacing="tight"
    sx={{ "& + h3": { mt: 6 } }}
    {...props}
  />
);

const H3 = (props: TextProps) => (
  <Text as="h4" lineHeight="1.25" fontWeight="bold" fontSize="xl" letterSpacing="tight" mt={4} mb={1} {...props} />
);

const H4 = (props: TextProps) => (
  <Text as="h5" lineHeight="1.375" fontWeight="bold" fontSize="lg" mt={2} mb={0.5} {...props} />
);

const A = (props: ButtonProps) => <Button as="a" variant="link" colorScheme="blue" {...props} />;

const P = (props: TextProps) => <Text as="p" mt={5} lineHeight="1.7" sx={{ "blockquote &": { mt: 0 } }} {...props} />;

const Hr = (props: DividerProps) => <Divider {...props} />;

const Blockquote = (props: AlertProps) => {
  const c = useThemedColor();
  return (
    <Alert
      as="blockquote"
      variant="left-accent"
      borderColor={c("_gray.6")}
      bg="transparent"
      mt={4}
      px={5}
      py={4}
      my={6}
      sx={{ "& > p": { fontWeight: "semibold" } }}
      {...props}
    />
  );
};

const Ul = (props: ListProps) => (
  <UnorderedList mt={2} ml={5} sx={{ "blockquote &": { mt: 0 }, "& > * + *": { mt: 1 } }} {...props} />
);

const Ol = (props: ListProps) => (
  <OrderedList mt={2} ml={5} sx={{ "blockquote &": { mt: 0 }, "& > * + *": { mt: 1 } }} {...props} />
);

const Li = (props: ListItemProps) => <ListItem {...props} />;

const StyledCode = (props: CodeProps) => <Code borderRadius="md" {...props} />;

const Br = (props: BoxProps) => <Box as="br" height={6} {...props} />;

const Table = (props: any) => <Table {...props} />;

const Img = (props: ImageProps) => <Image {...props} />;

const Video = (props: ReactPlayerProps) => <ReactPlayer {...props} />;

export const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  a: A,
  p: P,
  hr: Hr,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
  code: StyledCode,
  kbd: Kbd,
  pre: CodeBlock,
  br: Br,
  table: Table,
  th: Thead,
  td: Td,
  img: Img,
  Video,
};
