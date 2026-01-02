import { cn } from "@/lib/utils";

interface HeadingProps extends React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6"> {
  /** The heading level (1-6): `h1`, `h2`, `h3`, `h4`, `h5`, or `h6`. */
  level: number;
}

export function Heading({ level, className, ...props }: HeadingProps) {
  switch (level) {
    case 1:
      return <h1 className={cn("text-5xl", "in-[.sm\\:prose-xl]:text-red-600", className)} {...props} />;
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
