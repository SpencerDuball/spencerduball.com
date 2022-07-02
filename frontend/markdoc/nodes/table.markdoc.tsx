import { Table as _Table, TableProps } from "@chakra-ui/react";
import { Scrollbox } from "components/scrollbox/scrollbox";

const Table = (props: TableProps) => {
  return (
    <Scrollbox maxW="calc(100vw - 2.25rem)">
      <_Table {...props} />
    </Scrollbox>
  );
};

export const table = {
  render: Table,
};
