import { Td as _Td, TableCellProps } from "@chakra-ui/react";

const Td = (props: TableCellProps & { colspan: number; rowspan: number }) => {
  const { colspan, rowspan, ...rest } = props;
  return <_Td colSpan={colspan} rowSpan={rowspan} {...rest} />;
};

export const td = {
  render: Td,
  attributes: {
    align: { type: String },
    colspan: { type: Number },
    rowspan: { type: Number },
  },
};
