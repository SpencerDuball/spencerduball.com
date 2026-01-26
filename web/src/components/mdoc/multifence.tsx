import { cn } from "tailwind-variants";

export function MultiFence({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("multifence rounded-lg", className)} {...props}>
      <div className="py-1">Navigation</div>
      <hr />
      <div>{children}</div>
    </div>
  );
}

export function FenceFile({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("fencefile", className)} {...props} />;
}
