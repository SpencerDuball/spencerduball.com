import Markdoc, { type Schema } from "@markdoc/markdoc";
import { cn } from "tailwind-variants";

interface HeadingProps extends React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6"> {
  /** The heading level (1-6): `h1`, `h2`, `h3`, `h4`, `h5`, or `h6`. */
  level: number;
}

export function Heading({ level, className, ...props }: HeadingProps) {
  switch (level) {
    case 1:
      return <h1 className={cn("", className)} {...props} />;
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
  children: ["inline"],
  attributes: {
    level: { type: Number, required: true, default: 1 },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Heading", attributes, children);
  },
};
