import React from "react";
import { getPost } from "@/model/post";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod/v4";
import Markdoc from "@markdoc/markdoc";
import { components } from "@/components/mdoc";
import { cn } from "tailwind-variants";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  notFoundComponent: NotFoundComponent,
});

interface TocItem {
  title: string;
  id: string;
  level: number;
  children: TocItem[];
}

/**
 * A Table of Contents component that recursively displays lists.
 */
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
  const { content, frontmatter } = Route.useLoaderData();
  const Content = React.useMemo(() => Markdoc.renderers.react(content, React, { components }), [content]);

  const router = useRouter();

  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = new Intl.DateTimeFormat("en-US", { timeStyle: "short" });

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
          <div className="grid w-full gap-3 md:gap-4">
            <h1 className="text-primary w-fit text-4xl font-bold md:text-5xl">{frontmatter.title}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{frontmatter.summary}</p>
            <div className="text-muted-foreground grid auto-cols-max grid-flow-col items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <p className="text-muted-foreground text-sm italic">
                {frontmatter.modifiedAt ? "Updated: " : ""}
                {date.format(frontmatter.modifiedAt || frontmatter.createdAt)} ▪{" "}
                {time.format(frontmatter.modifiedAt || frontmatter.createdAt)}
              </p>
            </div>
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

// -------------------------------------------------------------------------------------
// ErrorComponent
// -------------------------------------------------------------------------------------
function NotFoundComponent() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="grid gap-4">
        <h1 className="text text-8xl font-bold">404</h1>
        <Button size="lg" variant="link" nativeButton={false} render={<Link to="/" />}>
          Back To Home
        </Button>
      </div>
    </div>
  );
}
