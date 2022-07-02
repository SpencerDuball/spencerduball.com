import { Th as _Th, TableColumnHeaderProps } from "@chakra-ui/react";

const Th = (props: TableColumnHeaderProps) => <_Th {...props} />;

export const th = {
  render: Th,
  attributes: {
    align: { type: String },
    width: { type: String },
  },
};
