import type { Schema } from "@markdoc/markdoc";

export const td: Schema = {
  render: "Td",
  attributes: {
    colspan: { type: Number },
    rowspan: { type: Number },
    align: { type: String },
  },
};

export interface TdProps {
  colspan?: number;
  rowspan?: number;
  align?: string;
  children: React.ReactNode;
}
export function Td({ colspan, rowspan, align, children }: TdProps) {
  return (
    <td
      className="text-left border-b border-slate-6 [&[data-is-numeric=true]]:text-right text-sm"
      style={{ textAlign: align as CanvasTextAlign }}
    >
      {children}
    </td>
  );
}
