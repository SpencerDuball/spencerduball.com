import { Code as _Code, CodeProps } from "@chakra-ui/react";

const Code = (props: CodeProps & { content: string }) => {
  const { children, content, ...rest } = props;
  return (
    <_Code borderRadius="sm" {...rest}>
      {content}
    </_Code>
  );
};

export const code = {
  render: Code,
  attributes: {
    content: { type: String, required: true },
  },
};
