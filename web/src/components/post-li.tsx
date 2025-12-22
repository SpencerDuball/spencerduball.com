import { cn } from "@/lib/utils";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

export interface IPostLi {
  id: string;
  slug: string;
  title: string;
  summary: string;
  createdAt: Date;
  modifiedAt?: Date;
}

export interface PostLiProps extends React.ComponentProps<"li"> {
  data: IPostLi;
}

export function PostLi({ data, className, ...props }: PostLiProps) {
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

  return (
    <li className={cn("grid w-full auto-rows-max gap-1", className)} {...props}>
      <Link
        to="/posts/p/$slug"
        params={{ slug: `${data.slug}-${data.id}` }}
        className="text-primary w-fit text-xl font-medium decoration-dashed decoration-[3px] underline-offset-4 hover:underline active:underline"
      >
        {data.title}
      </Link>
      <div className="text-muted-foreground grid auto-cols-max grid-flow-col items-center gap-2">
        <HugeiconsIcon className="h-5 w-5" icon={Calendar01Icon} />
        <p className="text-muted-foreground text-sm italic">
          {data.modifiedAt ? "Updated: " : ""}
          {date.format(data.modifiedAt || data.createdAt)} ▪ {time.format(data.modifiedAt || data.createdAt)}
        </p>
      </div>
      <p>{data.summary}</p>
    </li>
  );
}
