import type { Schema } from "@markdoc/markdoc";
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";

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
        <table className="w-full table-auto border-collapse lining-nums tabular-nums">{children}</table>
      </ScrollViewport>
    </ScrollArea>
  );
}
