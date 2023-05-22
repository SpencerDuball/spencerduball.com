import type { Schema } from "@markdoc/markdoc";

export const th: Schema = {
  render: "Th",
  attributes: {
    width: { type: Number },
    align: { type: String },
  },
};

export interface TdProps {
  width?: number;
  align?: string;
  children: React.ReactNode;
}
export function Th({ width, align, children }: TdProps) {
  return (
    <th
      className="font font-bold uppercase tracking-wider text-left text-slate-9 border-b border-slate-6 [&[data-is-numeric=true]]:text-right text-xs"
      style={{ width, textAlign: align as CanvasTextAlign }}
    >
      {children}
    </th>
  );
}
