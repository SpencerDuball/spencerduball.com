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
      className="focus-outline underline hover:no-underline text-slate-12 hover:text-slate-11 transition-colors ease-in-out break-all"
      href={href}
      children={children}
    />
  );
}
