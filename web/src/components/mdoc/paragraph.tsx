import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Paragraph({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("", className)} {...props} />;
}

export const paragraph: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Paragraph", attributes, children);
  },
};
