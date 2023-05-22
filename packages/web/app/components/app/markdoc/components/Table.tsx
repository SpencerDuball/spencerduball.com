import type { Schema } from "@markdoc/markdoc";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";

export const table: Schema = {
  render: "Table",
};

export interface TableProps {
  children: React.ReactElement;
}
export function Table({ children }: TableProps) {
  return (
    <ScrollArea>
      <ScrollViewport>
        <table className="table-auto lining-nums tabular-nums border-collapse w-full">{children}</table>
      </ScrollViewport>
    </ScrollArea>
  );
}
