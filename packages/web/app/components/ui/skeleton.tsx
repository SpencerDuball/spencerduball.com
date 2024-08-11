import { cn } from "~/util";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-slate-3 dark:bg-slatedark-3", className)} {...props} />;
}

export { Skeleton };
