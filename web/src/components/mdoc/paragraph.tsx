import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const p = tv({
  variants: {
    size: {
      sm: "mt-4 mb-4 text-[0.875rem]",
      base: "mt-5 mb-5 text-[1rem]",
      lg: "mt-6 mb-6 text-[1.125rem]",
      xl: "mt-6 mb-6 text-[1.25rem]",
      "2xl": "mt-8 mb-8 text-[1.5rem]",
    },
  },
});

export function Paragraph({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={p({ size: "base", className })} {...props} />;
}

export const paragraph: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Paragraph", attributes, children);
  },
};
