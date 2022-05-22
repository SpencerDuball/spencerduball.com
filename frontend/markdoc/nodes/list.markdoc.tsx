import { OrderedList, UnorderedList, ListProps } from "@chakra-ui/react";

const List = (props: ListProps & { ordered: boolean }) => {
  const { ordered, ...rest } = props;
  return ordered ? (
    <OrderedList
      mt={2}
      ml={5}
      sx={{ "blockquote &": { mt: 0 }, "& > * + *": { mt: 1 } }}
      {...rest}
    />
  ) : (
    <UnorderedList
      mt={2}
      ml={5}
      sx={{ "blockquote &": { mt: 0 }, "& > * + *": { mt: 1 } }}
      {...rest}
    />
  );
};

export const list = {
  render: List,
  attributes: {
    ordered: { type: Boolean },
  },
};
