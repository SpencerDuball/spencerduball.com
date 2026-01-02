import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Blockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return <blockquote className={cn("", className)} {...props} />;
}

export const blockquote: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Blockquote", attributes, children);
  },
};
