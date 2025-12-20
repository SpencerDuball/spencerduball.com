import { cn } from "@/lib/utils";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

export interface BlogLiProps extends React.ComponentProps<"li"> {
  data: {
    title: string;
    summary: string;
    created: Date;
    updated?: Date;
  };
}

export function BlogLi({ data, className, ...props }: BlogLiProps) {
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

  return (
    <li className={cn("grid w-full auto-rows-max", className)} {...props}>
      <Link
        to="."
        className="text-primary text-lg font-medium decoration-dashed decoration-2 underline-offset-4 hover:underline active:underline"
      >
        {data.title}
      </Link>
      <div className="text-muted-foreground grid auto-cols-max grid-flow-col items-center gap-2">
        <HugeiconsIcon className="h-5 w-5" icon={Calendar01Icon} />
        <p className="text-muted-foreground text-sm">
          {data.updated ? "Updated: " : ""}
          {date.format(data.updated || data.created)} ▪ {time.format(data.updated || data.created)}
        </p>
      </div>
      <p>{data.summary}</p>
    </li>
  );
}
