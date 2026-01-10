import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Strikethrough(props: React.ComponentProps<"s">) {
  return <s {...props} />;
}

export const s: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Strikethrough", attributes, children);
  },
};
