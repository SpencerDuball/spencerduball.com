import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { Link } from "@remix-run/react";
import * as React from "react";
import { cn, parseMdLink } from "~/lib/util/utils";
import { ColorList, Tag, colorFromName } from "~/lib/ui/tag";

interface IBlogLiData {
  tags: string[];
  title: string;
  id: number;
  cover_img: string;
  views: number;
  published: boolean;
  published_at: string | null;
  author_id: number;
}
//h-[5.75rem] w-[11.5rem]

export interface BlogLiProps extends React.ComponentProps<"li"> {
  hasControls?: boolean;
  data: IBlogLiData;
}

export function BlogLi({ hasControls, data, className, ...props }: BlogLiProps) {
  const [alt, url] = parseMdLink(data.cover_img);
  return (
    <li
      className={cn(
        "grid max-w-4xl grid-flow-col grid-cols-1 gap-3 rounded-lg border border-slate-4 bg-slate-2 p-3 md:grid-cols-[max-content_1fr]",
        className,
      )}
      {...props}
    >
      {/* Image Section */}
      <div className="relative hidden pr-0 md:grid">
        <div className="h-24 w-48 animate-pulse rounded bg-slate-3" />
        <img
          className="absolute left-0 top-0 aspect-[2/1] h-24 w-48 bg-slate-3 object-cover md:overflow-hidden md:rounded"
          alt={alt}
          src={url}
        />
      </div>
      {/* Info Section */}
      <div className="grid auto-rows-max justify-start gap-[calc(theme(spacing.2)-2px)]">
        {data.tags.length > 0 && (
          <ScrollArea>
            <ScrollViewport>
              <div className="flex gap-2">
                {data.tags.map((name) => (
                  <Tag
                    key={name}
                    className="border border-slate-4"
                    variant="subtle"
                    size="sm"
                    colorScheme={colorFromName({ name, colors: ColorList })}
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            </ScrollViewport>
          </ScrollArea>
        )}
        <div className="grid auto-rows-[max-content] gap-1">
          <Link to={`/blog/${data.id}`} className="focus-outline line-clamp-2 text-xl font-semibold leading-[1.15]">
            {data.title}
          </Link>
          <p className="text-sm text-slate-9">
            {data.published_at ? new Date(data.published_at).toLocaleDateString() : "Unpublished"} &#11825; {data.views}{" "}
            Views
          </p>
        </div>
      </div>
    </li>
  );
}
