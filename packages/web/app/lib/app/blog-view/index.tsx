import * as React from "react";
import { IconButton } from "~/lib/ui/button";
import { cn } from "~/lib/util/utils";
import { IBlog } from "~/model/blogs";
import { RiTwitterXFill, RiLinkM, RiCheckLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { ScrollArea, ScrollViewport } from "~/lib/ui/scroll-box";
import { Tag, colorFromName, ColorList } from "~/lib/ui/tag";
import { runSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { components } from "~/lib/ui/mdx";

type IBlogView = Omit<IBlog, "body"> & {
  url: string;
  content: string;
};

export interface BlogViewProps extends React.ComponentProps<"section"> {
  data: IBlogView;
}

export function BlogView({ data, className, ...props }: BlogViewProps) {
  // create share on X url
  const xUrl = new URL(`https://twitter.com/intent/tweet?url=${data.url}`);

  // setup hook to monitor for copy clicks
  const [copy, setCopy] = React.useState({ copied: false, timeoutId: -1 });
  async function onCopy() {
    if (copy.timeoutId > 0) window.clearTimeout(copy.timeoutId);
    await navigator.clipboard.writeText(data.url);
    const timeoutId = window.setTimeout(() => setCopy({ ...copy, copied: false }), 2000);
    setCopy({ copied: true, timeoutId });
  }

  // render the content
  const Content = React.useMemo(
    () => runSync(data.content, { ...runtime, Fragment: React.Fragment }).default,
    [data.content],
  );

  return (
    <section className={cn("grid h-full w-full justify-items-center", className)} {...props}>
      <div className="grid w-full max-w-5xl justify-items-center gap-10 px-4 py-6">
        {/* Meta Information */}
        <div className="grid max-w-5xl content-start justify-items-center gap-6">
          {/* Introduction */}
          <div className="grid w-full max-w-3xl gap-2 px-2 sm:px-4 md:gap-4 md:px-0">
            <div className="md:text-md grid text-sm leading-relaxed text-slate-11">
              <p className="text-xs font-semibold">POSTED</p>
              <p>
                {data.published_at
                  ? data.published_at.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "Unpublished"}
              </p>
            </div>
            <h1 className="text-pretty text-3xl font-bold leading-9 sm:text-4xl md:text-5xl">{data.title}</h1>
            <div className="grid auto-cols-max grid-flow-col items-center gap-1 py-1 md:gap-2 md:py-2">
              <IconButton
                className="rounded-full"
                aria-label="Copy link."
                variant="subtle"
                size="sm"
                onClick={onCopy}
                icon={copy.copied ? <RiCheckLine className="h-4 w-4 text-green-9" /> : <RiLinkM className="h-4 w-4" />}
              />
              <a href={xUrl.toString()} target="_blank" rel="noopener noreferrer">
                <IconButton
                  className="rounded-full"
                  aria-label="Share on X."
                  variant="subtle"
                  size="sm"
                  icon={<RiTwitterXFill className="h-4 w-4" />}
                />
              </a>
              <p className="md:text-md text-sm leading-relaxed text-slate-11">&#11825;</p>
              <p className="md:text-md text-sm leading-relaxed text-slate-11">{data.views} Views</p>
            </div>
          </div>
          {/* Image */}
          <img
            className="aspect-[2/1] w-full overflow-hidden rounded bg-slate-2 object-cover"
            src={data.cover_img.url}
            alt={data.cover_img.alt}
          />
          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="grid w-full max-w-3xl">
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
            </div>
          )}
        </div>
        {/* Content */}
        <div className="grid w-full max-w-3xl px-2 sm:px-3 md:px-0">
          <Content components={components} />
        </div>
      </div>
    </section>
  );
}
