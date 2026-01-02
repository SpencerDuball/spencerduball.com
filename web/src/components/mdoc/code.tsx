import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Code({ content, className, ...props }: React.ComponentProps<"code">) {
  return (
    <code className={cn("", className)} {...props}>
      {content}
    </code>
  );
}

export const code: Schema = {
  attributes: {
    content: { type: String, required: true, default: "" },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Code", attributes, children);
  },
};
