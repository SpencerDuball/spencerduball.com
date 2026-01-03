import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const img = tv({
  base: "block",
  variants: {
    size: {
      sm: "mt-6 mb-6",
      base: "mt-8 mb-8",
      lg: "mt-8 mb-8",
      xl: "mt-10 mb-10",
      "2xl": "mt-12 mb-12",
    },
  },
});

interface ImageProps extends React.ComponentProps<"img"> {
  src: string;
  alt?: string;
  title?: string;
}

export function Image({ className, ...props }: ImageProps) {
  return <img className={img({ size: "base", className })} {...props} />;
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
