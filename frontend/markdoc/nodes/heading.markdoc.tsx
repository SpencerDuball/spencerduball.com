import { generateIdFromText } from "utils/markdoc-helpers";
import { Text, TextProps } from "@chakra-ui/react";

const Heading = (props: TextProps & { level: number }) => {
  const { level, ...rest } = props;

  const id = generateIdFromText(props.children);

  if (level === 1) {
    return (
      <Text
        as="h1"
        id={id}
        mt={8}
        mb={1}
        lineHeight={1.2}
        fontWeight="bold"
        fontSize="3xl"
        {...rest}
      />
    );
  } else if (level === 2) {
    return (
      <Text
        as="h2"
        id={id}
        mt={8}
        mb={2}
        lineHeight={1.3}
        fontWeight="semibold"
        fontSize="2xl"
        letterSpacing="tight"
        sx={{ "& + h3": { mt: 6 } }}
        {...rest}
      />
    );
  } else if (level === 3) {
    return (
      <Text
        as="h3"
        id={id}
        mt={4}
        mb={1}
        lineHeight={1.25}
        fontWeight="semibold"
        fontSize="xl"
        letterSpacing="tight"
        {...rest}
      />
    );
  } else {
    return (
      <Text
        as="h4"
        id={id}
        mt={2}
        mb={0.5}
        lineHeight={1.375}
        fontWeight="semibold"
        fontSize="lg"
        {...rest}
      />
    );
  }
};

export const heading = {
  render: Heading,
  attributes: {
    id: { type: String },
    level: { type: Number, required: true, default: 1 },
  },
};
