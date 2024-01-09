import type { Schema } from "@markdoc/markdoc";

export const code: Schema = {
  render: "Code",
  attributes: { content: { type: String, render: true, required: true } },
};

export interface CodeProps {
  content: string;
}
export function Code({ content }: CodeProps) {
  return <code className="rounded-sm bg-slate-3 px-1 py-0.5 leading-normal text-slate-11">{content}</code>;
}
