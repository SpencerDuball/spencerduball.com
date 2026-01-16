import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
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
    <li className={cn("grid w-full auto-rows-max gap-1.5", className)} {...props}>
      <Link
        to="/posts/p/$slug"
        params={{ slug: `${data.slug}-${data.id}` }}
        className="text-primary w-fit text-xl font-semibold decoration-dashed decoration-[3px] underline-offset-4 hover:underline active:underline"
      >
        {data.title}
      </Link>
      <p className="text-muted-foreground">{data.summary}</p>
      <div className="grid auto-cols-max grid-flow-col items-center gap-2">
        <CalendarDays className="text-muted-foreground h-5 w-5" />
        <p className="text-muted-foreground text-sm italic">
          {data.modifiedAt ? "Updated: " : ""}
          {date.format(data.modifiedAt || data.createdAt)} ▪ {time.format(data.modifiedAt || data.createdAt)}
        </p>
      </div>
    </li>
  );
}
