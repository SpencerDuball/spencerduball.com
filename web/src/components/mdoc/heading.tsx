export function Heading({
  level,
  children,
  ...props
}: { level: number } & React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">) {
  const Tag = `h${level}` as any;
  return (
    <Tag {...props}>
      <a className="group no-underline" href={`#${props.id}`}>
        {children}{" "}
        <span className="invisible decoration-[3px] underline-offset-4 group-hover:visible group-hover:underline hover:underline active:underline">
          #
        </span>
      </a>
    </Tag>
  );
}
