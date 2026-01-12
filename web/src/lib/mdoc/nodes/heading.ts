import { MarkdocUtil } from "../index";
import Markdoc, { type Schema } from "@markdoc/markdoc";

export const heading: Schema = {
  attributes: {
    level: { type: Number, required: true, default: 1 },
  },
  transform(node, config) {
    const { id, ...attributes } = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const updatedId = attributes.id ?? MarkdocUtil.slugify(MarkdocUtil.extractText(node));
    return new Markdoc.Tag("Heading", { id: updatedId, ...attributes }, children);
  },
};
