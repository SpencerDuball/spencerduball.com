import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Blockquote(props: React.ComponentProps<"blockquote">) {
  return <blockquote {...props} />;
}

export const blockquote: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Blockquote", attributes, children);
  },
};
