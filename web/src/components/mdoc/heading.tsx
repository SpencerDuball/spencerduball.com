import Markdoc, { type Schema } from "@markdoc/markdoc";

export function Heading({
  level,
  ...props
}: { level: number } & React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">) {
  const Tag = `h${level}` as any;
  return <Tag {...props} />;
}

export const heading: Schema = {
  attributes: {
    level: { type: Number, required: true, default: 1 },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Heading", attributes, children);
  },
};
