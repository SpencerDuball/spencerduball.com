import { cn } from "~/util/util";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-slate-3", className)} {...props} />;
}

export { Skeleton };
