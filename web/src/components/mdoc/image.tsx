import Markdoc, { type Schema } from "@markdoc/markdoc";

interface ImageProps extends React.ComponentProps<"img"> {
  src: string;
  alt?: string;
  title?: string;
}

export function Image(props: ImageProps) {
  return <img {...props} />;
}

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
