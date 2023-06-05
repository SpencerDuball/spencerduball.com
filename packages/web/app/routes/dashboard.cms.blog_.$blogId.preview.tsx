import * as React from "react";
import { LoaderArgs, ActionArgs, json, Response } from "@remix-run/node";
import { useFetcher, useLoaderData, ShouldRevalidateFunction } from "@remix-run/react";
import { cn } from "~/lib/util";
import { logRequest, getLogger } from "~/lib/util.server";
import { getSessionInfo } from "~/lib/session.server";
import { useMeasure } from "react-use";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import { z } from "zod";
import * as Popover from "@radix-ui/react-popover";
import { IconButton } from "~/components/ui/button";
import { RiTwitterLine, RiLinkM } from "react-icons/ri";
import { colorFromName } from "~/lib/util";
import { Tag, TagProps, tagConfig } from "~/components/ui/tag";
import { CmsEditorCtx } from "~/components/app/cms-editor-ctx";
import { BlogCtx } from "./dashboard.cms.blog_.$blogId";
import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import { config, components } from "~/components/app/markdoc";
import { validateFrontmatter } from "~/model/blog.server";

const ColorList = Object.keys(tagConfig.variants.colorScheme) as NonNullable<TagProps["colorScheme"]>[];

// define the payload structure
const ZPostPayload = z.object({
  body: z.string(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ request }: ActionArgs) {
  await logRequest(request);

  // ensure user is admin
  const session = await getSessionInfo(request);
  if (!session) return new Response(undefined, { status: 401 });
  else if (!session.roles.includes("admin")) return new Response(undefined, { status: 403 });

  // get utilities
  const logger = getLogger();

  switch (request.method) {
    case "POST": {
      // get request info
      logger.info("Validating the payload ...");
      let data: IPostPayload;
      try {
        const formData = await request.formData();
        data = ZPostPayload.parse(Object.fromEntries(formData.entries()));
      } catch (e) {
        const json = await request.json();
        data = await ZPostPayload.parseAsync(json).catch((e) => {
          logger.info("Failure: The payload is not valid.");
          throw new Response(undefined, { status: 400, statusText: "Bad Request" });
        });
      }
      logger.info("Success: The payload is valid.");

      // bundle the blog
      // generate the markdoc
      // ----------------------------------------------
      logger.info("Bundling the blog ...");
      // (1) parse
      const ast = Markdoc.parse(data.body);
      // (2) validate
      const frontmatter = validateFrontmatter(ast.attributes.frontmatter);
      const errors = Markdoc.validate(ast, config);
      if (errors.length > 0) throw errors;
      // (3) build
      const content = Markdoc.transform(ast, config);
      logger.info("Success: Bundled the blog.");

      return json({ content, frontmatter });
    }
  }

  throw new Response(undefined, { status: 400, statusText: "Bad Request" });
}

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  return { request_url: request.url };
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction, defaultShouldRevalidate }) => {
  if (formAction?.match(/\/dashboard\/cms\/blog\/\d+\/preview/)) return false;
  return defaultShouldRevalidate;
};

/** Get the blog content. */
function useCompileBlog() {
  // compile the blog
  const [state] = React.useContext(CmsEditorCtx);
  const compileBlog = useFetcher<{
    content: RenderableTreeNode;
    frontmatter: ReturnType<typeof validateFrontmatter>;
  }>();
  React.useEffect(() => {
    if (state.data.value) compileBlog.submit({ body: state.data.value }, { method: "POST" });
  }, [state.data.value]);

  // get the MDX component
  const Content = React.useMemo(() => {
    if (compileBlog.data?.content) return Markdoc.renderers.react(compileBlog.data.content, React, { components });
    else return null;
  }, [compileBlog.data]);

  return { compileBlog, Content, frontmatter: compileBlog.data?.frontmatter };
}

export default function Preview() {
  // retrieve the data
  const { request_url } = useLoaderData<typeof loader>();
  const { compileBlog, Content, frontmatter } = useCompileBlog();
  const [blog] = React.useContext(BlogCtx);

  // define the refs
  const [containerRef, { height, width }] = useMeasure<HTMLDivElement>();
  const scrollViewportRef = React.useRef<HTMLDivElement>(null!);

  // compute urls
  const blog_url = new URL(request_url).origin + `/blog/${blog.id}`;
  const tweetUrl = new URL(`https://twitter.com/intent/tweet?url=${blog_url}`);

  // control popover
  const [popover, setPopover] = React.useState<{ open: boolean }>({ open: false });

  if (compileBlog.state !== "idle" || !Content || !frontmatter || !Content) {
    return (
      <div ref={containerRef} className={cn("h-full overflow-hidden rounded-lg")}>
        <ScrollArea style={{ height: `${height}px`, width: `${width}px` }}>
          <ScrollViewport ref={scrollViewportRef}>
            <div className="w-full py-6 grid gap-6 place-items-center animate-pulse">
              {/* Introduction */}
              <div className="grid max-w-3xl w-full px-4 sm:px-6 md:px-0 gap-2 md:gap-4">
                <div className="grid text-slate-11 leading-relaxed text-sm md:text-md gap-1.5">
                  <div className="h-4 w-[8ch] bg-slate-3 rounded" />
                  <div className="h-4 w-[16ch] bg-slate-3 rounded" />
                </div>
                {/* Title */}
                <div className="grid gap-2">
                  <div className="h-10 w-full bg-slate-3 rounded" />
                  <div className="h-10 w-3/4 bg-slate-3 rounded" />
                </div>
                <div className="grid grid-flow-col auto-cols-max items-center gap-1 md:gap-2 py-1 md:py-2">
                  <div className="h-8 w-8 rounded-full bg-slate-3" />
                  <div className="h-8 w-8 rounded-full bg-slate-3" />
                  <p className="text-sm md:text-md leading-relaxed text-slate-3">&#11825;</p>
                  <div className="h-6 w-[8ch] bg-slate-3 rounded" />
                </div>
              </div>
              {/* Image */}
              <div className="aspect-[2/1] max-w-5xl w-full rounded overflow-hidden bg-slate-3" />
              {/* Tags */}
              <div className="grid max-w-3xl w-full px-4 sm:px-6 md:px-0">
                <ScrollArea>
                  <ScrollViewport>
                    <div className="flex gap-2">
                      {[...Array(3).keys()].map((key) => (
                        <div key={key} className="h-6 w-16 bg-slate-3 rounded" />
                      ))}
                    </div>
                  </ScrollViewport>
                </ScrollArea>
              </div>
              {/* Content */}
              <div className="grid max-w-3xl w-full px-4 sm:px-6 md:px-0 gap-5">
                <div className="grid gap-2">
                  {[...Array(4).keys()].map((key) => (
                    <div key={key} className="w-full h-5 bg-slate-3 rounded" />
                  ))}
                </div>
                <div className="grid gap-2">
                  {[...Array(4).keys()].map((key) => (
                    <div key={key} className="w-full h-5 bg-slate-3 rounded" />
                  ))}
                </div>
                <div className="grid gap-2">
                  {[...Array(4).keys()].map((key) => (
                    <div key={key} className="w-full h-5 bg-slate-3 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </ScrollViewport>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("h-full overflow-hidden rounded-lg")}>
      <ScrollArea style={{ height: `${height}px`, width: `${width}px` }}>
        <ScrollViewport ref={scrollViewportRef}>
          <div className="w-full py-6 grid gap-6 place-items-center">
            {/* Introduction */}
            <div className="grid max-w-3xl w-full gap-2 md:gap-4 px-2 sm:px-3 md:px-0">
              <div className="grid text-slate-11 leading-relaxed text-sm md:text-md">
                <p className="text-xs font-semibold">POSTED</p>
                <p>
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-9">{frontmatter.title}</h1>
              <div className="grid grid-flow-col auto-cols-max items-center gap-1 md:gap-2 py-1 md:py-2">
                <a href={tweetUrl.toString()} target="_blank" rel="noopener noreferrer">
                  <IconButton
                    aria-label="share on twitter"
                    variant="subtle"
                    size="sm"
                    className="rounded-full"
                    icon={<RiTwitterLine />}
                  />
                </a>
                <Popover.Root
                  open={popover.open}
                  onOpenChange={(open) => (open ? setTimeout(() => setPopover({ open: false }), 1000) : null)}
                >
                  <Popover.Trigger
                    asChild
                    onClick={async () =>
                      await navigator.clipboard.writeText(blog_url).then(() => setPopover({ open: !popover.open }))
                    }
                  >
                    <IconButton
                      aria-label="copy link"
                      variant="subtle"
                      size="sm"
                      className="rounded-full"
                      icon={<RiLinkM />}
                    />
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      align="center"
                      className="rounded-lg p-2 bg-slate-2 border border-slate-6 border-radius-6 shadow"
                    >
                      <p className="text-xs text-slate-11">Copied to Cliboard</p>
                      <Popover.Arrow asChild>
                        <div className="relative h-3 w-3 origin-center rounded-br-sm border-b border-r border-slate-6 bg-slate-2 rotate-45 -translate-y-[0.375rem]" />
                      </Popover.Arrow>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
                <p className="text-sm md:text-md text-slate-11 leading-relaxed">&#11825;</p>
                <p className="text-sm md:text-md text-slate-11 leading-relaxed">{blog.views} Views</p>
              </div>
            </div>
            {/* Image */}
            <img
              className="aspect-[2/1] max-w-5xl w-full rounded overflow-hidden object-cover"
              src={frontmatter.image_url}
            />
            {/* Tags */}
            {frontmatter.tags.length > 0 ? (
              <div className="grid max-w-3xl w-full px-4 sm:px-6 md:px-0">
                <ScrollArea>
                  <ScrollViewport>
                    <div className="flex gap-2">
                      {frontmatter.tags.sort().map((tag) => (
                        <Tag
                          key={tag}
                          className="border border-slate-4"
                          variant="subtle"
                          colorScheme={colorFromName({ name: tag, colors: ColorList })}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </ScrollViewport>
                </ScrollArea>
              </div>
            ) : null}
            {/* Content */}
            <div className="grid max-w-3xl w-full px-2 sm:px-3 md:px-0">{Content}</div>
          </div>
        </ScrollViewport>
      </ScrollArea>
    </div>
  );
}

export { ErrorBoundary } from "~/components/app/error-boundary";
