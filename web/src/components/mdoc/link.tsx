import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Link(props: React.ComponentProps<"a">) {
  return <a {...props} />;
}

export const link: Schema = {
  attributes: {
    href: { type: String, required: true, default: "#" },
    title: { type: String, required: true, default: "" },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Link", attributes, children);
  },
};
