import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Strikethrough({ className, ...props }: React.ComponentProps<"s">) {
  return <s className={cn("", className)} {...props} />;
}

export const s: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Strikethrough", attributes, children);
  },
};
