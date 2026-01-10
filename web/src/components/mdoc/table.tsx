import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Table(props: React.ComponentProps<"table">) {
  return <table {...props} />;
}

export function TableHead(props: React.ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function TableRow(props: React.ComponentProps<"tr">) {
  return <tr {...props} />;
}

export function TableData(props: React.ComponentProps<"td">) {
  return <td {...props} />;
}

export function TableHeader(props: React.ComponentProps<"th">) {
  return <th {...props} />;
}

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
