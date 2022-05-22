import { ListItem, ListItemProps } from "@chakra-ui/react";

const Item = (props: ListItemProps) => <ListItem {...props} />;

export const item = {
  render: Item,
};
