import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Code({ content, ...props }: React.ComponentProps<"code">) {
  return <code {...props}>{content}</code>;
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
