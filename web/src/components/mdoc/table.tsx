import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("", className)} {...props} />;
}

export function TableData({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("", className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("", className)} {...props} />;
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
