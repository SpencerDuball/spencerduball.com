import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function HorizontalRow({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr className={cn("", className)} {...props} />;
}

export const hr: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("HorizontalRow", attributes, children);
  },
};
