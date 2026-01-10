import Markdoc, { type Schema } from "@markdoc/markdoc";

export function HorizontalRow(props: React.ComponentProps<"hr">) {
  return <hr {...props} />;
}

export const hr: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("HorizontalRow", attributes, children);
  },
};
