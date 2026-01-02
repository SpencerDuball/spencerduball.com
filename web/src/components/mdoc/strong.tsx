import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Strong({ className, ...props }: React.ComponentProps<"strong">) {
  return <strong className={cn("", className)} {...props} />;
}

export const strong: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Strong", attributes, children);
  },
};
