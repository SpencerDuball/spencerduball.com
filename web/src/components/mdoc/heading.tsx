import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv, cn } from "tailwind-variants";

// https://play.tailwindcss.com/OPEUJYQM9Q

const h1 = tv({
  base: "font-extrabold [&>strong]:font-black [&>strong]:text-inherit [&>code]:text-inherit text-grey-800 dark:text-grey-200",
  variants: {
    size: {
      sm: "text-3xl mt-0 mb-6 leading-9",
      base: "text-4xl mt-0 mb-8 leading-10",
      lg: "text-5xl mt-0 mb-10 leading-12",
      xl: "text-[3.5rem] mt-0 mb-12 leading-14",
      "2xl": "text-[4rem] mt-0 mb-14 leading-14",
    },
  },
});

interface HeadingProps extends React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6"> {
  /** The heading level (1-6): `h1`, `h2`, `h3`, `h4`, `h5`, or `h6`. */
  level: number;
}

export function Heading({ level, className, ...props }: HeadingProps) {
  switch (level) {
    case 1:
      return <h1 className={h1({ size: "sm", className })} {...props} />;
    case 2:
      return <h2 className={cn("", className)} {...props} />;
    case 3:
      return <h3 className={cn("", className)} {...props} />;
    case 4:
      return <h4 className={cn("", className)} {...props} />;
    case 5:
      return <h5 className={cn("", className)} {...props} />;
    default:
      return <h6 className={cn("", className)} {...props} />;
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
