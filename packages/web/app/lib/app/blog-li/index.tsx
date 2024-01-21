import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { Link } from "@remix-run/react";
import * as React from "react";
import { cn } from "~/lib/util/utils";
import { ColorList, Tag, colorFromName } from "~/lib/ui/tag";
import { IBlog } from "~/model/blogs";

type IBlogLiData = Pick<
  IBlog,
  "tags" | "title" | "id" | "cover_img" | "views" | "published" | "published_at" | "author_id"
>;

export interface BlogLiProps extends React.ComponentProps<"li"> {
  hasControls?: boolean;
  data: IBlogLiData;
}

export function BlogLi({ hasControls, data, className, ...props }: BlogLiProps) {
  return (
    <li
      className={cn(
        // The BlogLi height is equal to the largest sub-item + padding height + border height.
        // This is h-24 (image height) + h-6 (padding height * 2) + 2px (border height * 2) = calc(30/4 + 2px)
        "grid h-[calc(7.5rem+2px)] max-w-4xl grid-flow-col grid-cols-1 gap-3 rounded-lg border border-slate-4 bg-slate-2 p-3 md:grid-cols-[max-content_1fr]",
        className,
      )}
      {...props}
    >
      {/* Image Section */}
      <div className="relative hidden pr-0 md:grid">
        <div className="h-24 w-48 animate-pulse rounded bg-slate-3" />
        <img
          className="absolute left-0 top-0 aspect-[2/1] h-24 w-48 overflow-hidden rounded bg-slate-3 object-cover"
          alt={data.cover_img.alt}
          src={data.cover_img.url}
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
          <p className="text-sm text-slate-9" suppressHydrationWarning>
            {data.published_at ? new Date(data.published_at).toLocaleDateString() : "Unpublished"} &#11825; {data.views}{" "}
            Views
          </p>
        </div>
      </div>
    </li>
  );
}
