import type { Schema } from "@markdoc/markdoc";

export const hr: Schema = {
  render: "Hr",
};

export interface HrProps {}
export function Hr({}: HrProps) {
  return <hr className="my-16" />;
}
