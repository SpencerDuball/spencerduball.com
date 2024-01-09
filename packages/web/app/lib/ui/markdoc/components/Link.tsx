import type { Schema } from "@markdoc/markdoc";

export const link: Schema = {
  render: "Link",
  children: ["strong", "em", "s", "code", "text", "tag"],
  attributes: {
    href: { type: String, required: true },
    title: { type: String, render: "title" },
  },
};

export interface LinkProps {
  href: string;
  children: React.ReactElement;
}
export function Link({ href, children }: LinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={{ maxWidth: "10px" }}
      className="focus-outline break-all text-slate-12 underline transition-colors ease-in-out hover:text-slate-11 hover:no-underline"
      href={href}
      children={children}
    />
  );
}
