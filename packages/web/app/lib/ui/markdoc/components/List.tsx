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
  if (ordered) return <ol className="ml-5 mt-2 list-decimal [&_li]:mt-1">{children}</ol>;
  else return <ul className="ml-5 mt-2 list-disc [&_li]:mt-1">{children}</ul>;
}
