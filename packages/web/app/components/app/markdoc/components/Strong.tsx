import type { Schema } from "@markdoc/markdoc";

export const strong: Schema = {
  render: "Strong",
  children: ["em", "s", "link", "code", "text", "tag"],
};

export interface StrongProps {
  children: React.ReactNode;
}
export function Strong({ children }: StrongProps) {
  return <strong>{children}</strong>;
}
