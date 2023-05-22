import type { Schema } from "@markdoc/markdoc";

export const hardbreak: Schema = {
  render: "Hardbreak",
};

export interface HardbreakProps {}
export function Hardbreak({}: HardbreakProps) {
  return <br className="my-4 h-px bg-slate-6" />;
}
