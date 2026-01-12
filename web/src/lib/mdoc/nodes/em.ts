import Markdoc, { type Schema } from "@markdoc/markdoc";

export const em: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Emphasis", attributes, children);
  },
};
