import type { Schema } from "@markdoc/markdoc";

export const blockquote: Schema = {
  render: "Blockquote",
  children: ["heading", "paragraph", "image", "table", "tab", "fence", "blockquote", "list", "hr"],
};

export interface BlockquoteProps {
  children: string;
}
export function Blockquote({ children }: BlockquoteProps) {
  return <blockquote className="bg-slate-2 border-slate-5 border-l-4 px-5 py-4 my-6 [&>p]:mt-0">{children}</blockquote>;
}
