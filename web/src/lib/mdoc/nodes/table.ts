import Markdoc, { type Schema } from "@markdoc/markdoc";

export const table: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Table", attributes, children);
  },
};

export const thead: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("TableHead", attributes, children);
  },
};

export const tbody: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("TableBody", attributes, children);
  },
};

export const tr: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("TableRow", attributes, children);
  },
};

export const td: Schema = {
  attributes: {
    align: { type: String, required: false },
    colspan: { type: Number, required: false },
    rowspan: { type: Number, required: false },
  },
  transform(node, config) {
    const { colspan, rowspan, ...attributes } = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("TableData", { colSpan: colspan, rowSpan: rowspan, ...attributes }, children);
  },
};

export const th: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("TableHeader", attributes, children);
  },
};
