import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Link({ className, ...props }: React.ComponentProps<"a">) {
  return <a className={cn("", className)} {...props} />;
}

export const link: Schema = {
  attributes: {
    href: { type: String, required: true, default: "#" },
    title: { type: String, required: true, default: "" },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Link", attributes, children);
  },
};
