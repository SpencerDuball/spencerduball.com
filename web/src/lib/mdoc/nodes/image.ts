import Markdoc, { type Schema } from "@markdoc/markdoc";

export const image: Schema = {
  attributes: {
    src: { type: String, required: true },
    alt: { type: String, required: false },
    title: { type: String, required: false },
  },
  inline: false,
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Image", attributes, children);
  },
};
