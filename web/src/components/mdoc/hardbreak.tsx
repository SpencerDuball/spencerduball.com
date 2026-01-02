import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Hardbreak({ className, ...props }: React.ComponentProps<"br">) {
  return <br className={cn("", className)} {...props} />;
}

export const hardbreak: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Hardbreak", attributes, children);
  },
};
