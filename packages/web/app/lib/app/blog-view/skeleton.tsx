import * as React from "react";
import { cn } from "~/lib/util/utils";

export function BlogViewSkeleton({ className, ...props }: React.ComponentPropsWithoutRef<"section">) {
  return (
    <section className={cn("grid h-full w-full justify-items-center", className)} {...props}>
      <div className="grid w-full max-w-5xl justify-items-center gap-10 px-4 py-6">
        {/* Meta Information */}
        <div className="grid w-full max-w-5xl animate-pulse content-start justify-items-center gap-6">
          {/* Introduction */}
          <div className="grid w-full max-w-3xl gap-2 px-2 sm:px-4 md:gap-4 md:px-0">
            <div className="md:text-md grid gap-1 text-sm leading-relaxed text-slate-11">
              {/* POSTED - When the blog was posted indicator. */}
              <div className="h-4 w-[6ch] bg-slate-3" />
              {/* POSTED DATE - When the blog was posted. */}
              <div className="h-4 w-[16ch] bg-slate-3" />
            </div>
            {/* TITLE - The title of the blog. */}
            <div className="grid gap-1">
              <div className="h-12 w-full bg-slate-3" />
              <div className="h-12 w-full bg-slate-3" />
              <div className="h-12 w-1/3 bg-slate-3" />
            </div>
            <div className="grid auto-cols-max grid-flow-col items-center gap-1 py-1 md:gap-2 md:py-2">
              <div className="h-8 w-8 rounded-full bg-slate-3" />
              <div className="h-8 w-8 rounded-full bg-slate-3" />
              <div className="h-8 w-[10ch] bg-slate-3" />
            </div>
          </div>
          {/* Image */}
          <div className="aspect-[2/1] w-full overflow-hidden rounded bg-slate-3" />
          {/* Tags */}
          <div className="grid w-full max-w-3xl">
            <div className="flex gap-2">
              <div className="h-5 w-[5ch] rounded-md bg-slate-3" />
              <div className="h-5 w-[5ch] rounded-md bg-slate-3" />
              <div className="h-5 w-[5ch] rounded-md bg-slate-3" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="grid w-full max-w-3xl gap-6 px-2 sm:px-3 md:px-0">
          {/* Paragraph v1 */}
          <div className="grid gap-1.5">
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-2/3 bg-slate-3" />
          </div>
          {/* Paragraph v2 */}
          <div className="grid gap-1.5">
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-1/2 bg-slate-3" />
          </div>
          {/* Paragraph v2 */}
          <div className="grid gap-1.5">
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-full bg-slate-3" />
            <div className="h-4 w-3/4 bg-slate-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
