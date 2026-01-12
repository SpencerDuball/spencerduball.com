import Markdoc, { type Schema } from "@markdoc/markdoc";

export const list: Schema = {
  attributes: {
    ordered: { type: Boolean, required: true, default: false },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("List", attributes, children);
  },
};

export const item: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("ListItem", attributes, children);
  },
};
