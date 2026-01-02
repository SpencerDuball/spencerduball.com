import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const hrow = tv({
  base: "text-grey-200 dark:bg-[color-mix(in_oklch,var(--color-grey-50),transparent_90%)]",
  variants: {
    size: {
      sm: "mt-10 mb-10 [&+*]:mt-0",
      base: "mt-12 mb-12 [&+*]:mt-0",
      lg: "mt-14 mb-14 [&+*]:mt-0",
      xl: "mt-14 mb-14 [&+*]:mt-0",
      "2xl": "mt-18 mb-18 [&+*]:mt-0",
    },
  },
});

export function HorizontalRow({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr className={hrow({ size: "base", className })} {...props} />;
}

export const hr: Schema = {
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("HorizontalRow", attributes, children);
  },
};
