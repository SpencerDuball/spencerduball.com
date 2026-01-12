import React from "react";
import { getPost } from "@/model/post";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod/v4";
import Markdoc from "@markdoc/markdoc";
import { components } from "@/components/mdoc";
import { cn } from "tailwind-variants";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const Route = createFileRoute("/posts/p/$slug")({
  params: {
    parse: (params) => z.object({ slug: z.string() }).parse(params),
    stringify: (params) => ({ slug: params.slug.toString() }),
  },
  loader: async ({ params: { slug } }) => {
    const { content, frontmatter, toc } = await getPost({ data: { slug } });
    return { content, frontmatter, toc };
  },
  component: RouteComponent,
});

interface TocItem {
  title: string;
  id: string;
  level: number;
  children: TocItem[];
}

function TocList({ toc, className, ...props }: React.ComponentProps<"ul"> & { toc: TocItem[] }) {
  return (
    <ul className={cn("ps-6", className)} {...props}>
      {toc.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="hover:text-primary block px-1 py-0.5 text-base font-medium underline decoration-dashed decoration-2 underline-offset-3 hover:underline active:underline"
          >
            {item.title}
          </a>
          {/* If children exist, render another list inside this list item */}
          {item.children.length > 0 && <TocList toc={item.children} />}
        </li>
      ))}
    </ul>
  );
}

function RouteComponent() {
  const { content, frontmatter, toc } = Route.useLoaderData();
  const Content = React.useMemo(() => Markdoc.renderers.react(content, React, { components }), [content]);

  const router = useRouter();

  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

  const [tocOpen, setTocOpen] = React.useState(false);

  return (
    <div className="grid justify-items-center">
      <div className="grid w-full max-w-4xl gap-8 px-4 py-12">
        {/* Outline */}
        <div className="grid gap-4">
          <button
            onClick={() => router.history.back()}
            className="group hover:text-primary dark:hover:text-primary active:text-primary dark:active:text-primary grid w-fit grid-flow-col items-center gap-2"
          >
            <ArrowLeft className="transition-transform duration-200 ease-out group-hover:-translate-x-1" />
            Go Back
          </button>
          <div className="grid w-full gap-3">
            <h1 className="text-primary w-fit text-3xl font-extrabold md:text-4xl">{frontmatter.title}</h1>
            <div className="text-muted-foreground grid auto-cols-max grid-flow-col items-center gap-2 md:gap-3">
              <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-muted-foreground text-sm italic md:text-base">
                {frontmatter.modifiedAt ? "Updated: " : ""}
                {date.format(frontmatter.modifiedAt || frontmatter.createdAt)} ▪
                {time.format(frontmatter.modifiedAt || frontmatter.createdAt)}
              </p>
            </div>
          </div>
        </div>
        {/* Table of Contents */}
        <div className="grid gap-2">
          <p className="text-sm md:text-base">{frontmatter.summary}</p>
          <div className={cn("grid border border-transparent", tocOpen && "border-border")}>
            <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
              <CollapsibleTrigger
                render={
                  <button className={cn("grid w-full justify-start", tocOpen && "bg-secondary")}>
                    <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground focus-visible:border-ring focus-visible:ring-ring/50 group/button inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-none border border-transparent bg-clip-padding px-2.5 text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 aria-invalid:ring-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                      <ChevronRight
                        className={cn("rotate-0 transition-transform duration-200 ease-in-out", tocOpen && "rotate-90")}
                      />
                      Table of Contents
                    </div>
                  </button>
                }
              />
              <CollapsibleContent className="py-2">
                <TocList className="ps-1" toc={toc} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        {/* Content */}
        <article
          className={cn(
            "prose prose-sm md:prose-base prose-grey dark:prose-invert prose:first:mt-0 max-w-4xl overflow-hidden",
            /* Fix for ordered list markers. */ "prose-ol:pl-8",
          )}
        >
          {Content}
        </article>
        {/* Footer */}
      </div>
    </div>
  );
}
