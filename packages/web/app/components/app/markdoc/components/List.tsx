import type { Schema } from "@markdoc/markdoc";

export const list: Schema = {
  render: "List",
  children: ["item"],
  attributes: {
    ordered: { type: Boolean, render: "ordered", required: true },
  },
};

export interface ListProps {
  ordered: boolean;
  children: React.ReactElement;
}
export function List({ children, ordered }: ListProps) {
  if (ordered) return <ol className="mt-2 ml-5 [&>**]:mt-1 list-decimal">{children}</ol>;
  else return <ul className="mt-2 ml-5 [&>**]:mt-1 list-disc">{children}</ul>;
}
