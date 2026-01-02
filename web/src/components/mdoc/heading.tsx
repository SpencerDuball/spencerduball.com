import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const h1 = tv({
  base: "text-grey-800 dark:text-grey-200 font-extrabold [&>code]:text-inherit [&>strong]:font-black [&>strong]:text-inherit",
  variants: {
    size: {
      sm: "mt-0 mb-6 text-3xl leading-9",
      base: "mt-0 mb-8 text-4xl leading-10",
      lg: "mt-0 mb-10 text-5xl leading-12",
      xl: "mt-0 mb-12 text-[3.5rem] leading-14",
      "2xl": "mt-0 mb-14 text-[4rem] leading-14",
    },
  },
});

const h2 = tv({
  base: "text-grey-800 dark:text-grey-200 font-bold [&>code]:text-inherit [&>strong]:font-extrabold",
  variants: {
    size: {
      sm: "mt-8 mb-4 text-[1.25rem] leading-7 [&+*]:mt-0 [&>code]:text-[1.125rem]",
      base: "mt-12 mb-6 text-2xl leading-8 [&+*]:mt-0 [&>code]:text-[1.3125rem]",
      lg: "mt-14 mb-8 text-3xl leading-9 [&+*]:mt-0 [&>code]:text-[1.625rem]",
      xl: "mt-14 mb-5 text-4xl leading-10 [&+*]:mt-0 [&>code]:text-[1.9375rem]",
      "2xl": "mt-18 mb-10 text-5xl leading-13 [&+*]:mt-0 [&>code]:text-[2.625rem]",
    },
  },
});

const h3 = tv({
  base: "text-grey-800 dark:text-grey-200 font-semibold [&>code]:text-inherit [&>strong]:font-bold",
  variants: {
    size: {
      sm: "mt-7 mb-2 text-[1.125rem] leading-7 [&+*]:mt-0 [&>code]:text-[1rem]",
      base: "mt-8 mb-3 text-[1.25rem] leading-8 [&+*]:mt-0 [&>code]:text-[1.125rem]",
      lg: "mt-10 mb-4 text-[1.5rem] leading-9 [&+*]:mt-0 [&>code]:text-[1.3125rem]",
      xl: "mt-12 mb-5 text-[1.875rem] leading-10 [&+*]:mt-0 [&>code]:text-[1.6875rem]",
      "2xl": "mt-14 mb-6 text-[2.25rem] leading-11 [&+*]:mt-0 [&>code]:text-[2rem]",
    },
  },
});

const h4 = tv({
  base: "text-grey-800 dark:text-grey-200 font-semibold [&>code]:text-inherit [&>strong]:font-bold",
  variants: {
    size: {
      sm: "mt-5 mb-2 text-[0.875rem] leading-5 [&+*]:mt-0",
      base: "mt-6 mb-2 text-[1rem] leading-6 [&+*]:mt-0",
      lg: "mt-8 mb-2 text-[1.125rem] leading-7 [&+*]:mt-0",
      xl: "mt-9 mb-3 text-[1.25rem] leading-8 [&+*]:mt-0",
      "2xl": "mt-10 mb-4 text-[1.5rem] leading-9 [&+*]:mt-0",
    },
  },
});

export function Heading({
  level,
  className,
  ...props
}: { level: number } & React.ComponentProps<"h1" | "h2" | "h3" | "h4">) {
  switch (level) {
    case 1:
      return <h1 className={h1({ size: "base", className })} {...props} />;
    case 2:
      return <h2 className={h2({ size: "base", className })} {...props} />;
    case 3:
      return <h3 className={h3({ size: "base", className })} {...props} />;
    case 4:
      return <h4 className={h4({ size: "base", className })} {...props} />;
    default:
      const Tag = `h${level}` as any;
      return <Tag className={className} {...props} />;
  }
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
