import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Emphasis({ className, ...props }: React.ComponentProps<"em">) {
  return <em className={cn("", className)} {...props} />;
}

export const em: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Emphasis", attributes, children);
  },
};
