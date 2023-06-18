import React from "react";
import { json, type LoaderArgs, type V2_MetaFunction, type ActionArgs } from "@remix-run/node";
import { sql } from "kysely";
import { z } from "zod";
import { getLogger, getPgClient, logRequest } from "~/lib/util.server";
import Markdoc from "@markdoc/markdoc";
import { deleteBlog, patchBlog, validateFrontmatter } from "~/model/blog.server";
import { components, config } from "~/components/app/markdoc";
import { useLoaderData } from "@remix-run/react";
import { IconButton } from "~/components/ui/button";
import * as Popover from "@radix-ui/react-popover";
import { RiLinkM, RiTwitterLine } from "react-icons/ri";
import { Tag, colorFromName, ColorList } from "~/components/ui/tag";
import { ScrollArea, ScrollViewport } from "~/components/ui/scroll-box";
import { getSessionInfo } from "~/lib/session.server";

const ZParams = z.object({ blogId: z.coerce.number() });

// define the payload structure
const ZPatchPayload = z.object({
  body: z.string().optional(),
  published: z
    .boolean()
    .or(z.enum(["true", "false"]).transform((value) => value === "true"))
    .optional(),
});
type IPatchPayload = z.infer<typeof ZPatchPayload>;

export async function action({ request, params }: ActionArgs) {
  await logRequest(request);

  // ensure user is admin
  const session = await getSessionInfo(request);
  if (!session) return new Response(undefined, { status: 401 });
  else if (!session.roles.includes("admin")) return new Response(undefined, { status: 403 });

  // get request info
  const { blogId } = await ZParams.parseAsync(params).catch((e) => {
    throw new Response(undefined, { status: 404 });
  });

  // get utilities
  const logger = getLogger();

  switch (request.method) {
    case "DELETE": {
      // delete the blog
      logger.info("Deleting the blog ...");
      try {
        const blog = await deleteBlog({ id: blogId });
        logger.info("Success: Deleted the blog.");
        return json(blog);
      } catch (e) {
        logger.info("Failure: Failed to delete blog.");
        logger.info(e);
        return json({ message: "Failure deleting blog." }, { status: 500 });
      }
    }
    case "PATCH": {
      // get request info
      let data: IPatchPayload;
      try {
        data = ZPatchPayload.parse(Object.fromEntries((await request.formData()).entries()));
      } catch (e) {
        data = await ZPatchPayload.parseAsync(await request.json()).catch((e) => {
          throw new Response(undefined, { status: 400, statusText: "Bad Reqeust" });
        });
      }

      // update the blog
      logger.info("Updating the blog ...");
      const blog = await patchBlog({ id: blogId, ...data }).catch((e) => {
        logger.info("Failure: Failed to update the blog.");
        throw new Response(undefined, { status: 500, statusText: "Failure updating blog." });
      });
      logger.info("Success: Updated the blog.");

      return json(blog);
    }
  }

  return null;
}

export async function loader({ params, request }: LoaderArgs) {
  await logRequest(request);

  // get request info
  const { blogId } = await ZParams.parseAsync(params).catch((e) => {
    throw new Response(undefined, { status: 404, statusText: "Not Found" });
  });

  // instantiate utilities
  const logger = getLogger();
  const db = await getPgClient();

  // get the blog
  logger.info("Retrieving the blog ...");
  const blog = await db
    .selectFrom("blogs")
    .leftJoin("blog_tags", "blog_tags.blog_id", "blogs.id")
    .where("blogs.id", "=", blogId)
    .where("blogs.published", "=", true)
    .groupBy("blogs.id")
    .select([
      "blogs.author_id",
      "blogs.body",
      "blogs.published_at",
      "blogs.id",
      "blogs.image_url",
      "blogs.modified_at",
      "blogs.published",
      "blogs.title",
      "blogs.description",
      sql<(string | null)[]>`array_agg(blog_tags.tag_id)`.as("tags"),
    ])
    .executeTakeFirstOrThrow()
    .then((values) => ({ ...values, tags: values.tags.filter((t) => t !== null) as string[] }))
    .catch((e) => {
      logger.info(`Failure: Blogpost with id ${blogId} does not exist.`);
      logger.info(e);
      throw json({}, { status: 404, statusText: "Not Found" });
    });
  const views = await db
    .updateTable("blogs")
    .where("blogs.id", "=", blogId)
    .set({ views: ({ bxp }) => bxp("views", "+", 1) })
    .returning("views")
    .executeTakeFirstOrThrow()
    .then(({ views }) => views);
  logger.info("Success: Retrieved the blog.");

  // generate the markdoc
  // --------------------
  logger.info("Building the blog ...");
  // (1) parse
  const ast = Markdoc.parse(blog.body);
  // (2) validate
  validateFrontmatter(ast.attributes.frontmatter);
  const errors = Markdoc.validate(ast, config);
  if (errors.length > 0) throw errors;
  // (3) build
  const content = Markdoc.transform(ast, config);
  logger.info("Success: Build the blog.");

  return json({ blog: { ...blog, views }, content, request_url: request.url });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: `Not Found | Spencer Duball` }];
  return [
    { title: `${data.blog.title} | Spencer Duball` },
    { name: "description", content: data.blog.description },
    { name: "og:title", content: `${data.blog.title} | Spencer Duball` },
    { name: "og:description", content: data.blog.description },
    { name: "og:type", content: "website" },
    { name: "og:image", content: data.blog.image_url },
    { name: "robots", content: "index,follow" },
  ];
};

export default function Blog() {
  const { blog, content, request_url } = useLoaderData<typeof loader>();
  const Content = React.useMemo(() => Markdoc.renderers.react(content, React, { components }), [content]);

  // create tweet url
  const tweetUrl = new URL(`https://twitter.com/intent/tweet?url=${request_url}`);

  // control popover
  const [popover, setPopover] = React.useState(false);

  return (
    <div className="w-full py-6 px-4 grid gap-6 place-items-center">
      {/* Introduction */}
      <div className="grid max-w-3xl w-full gap-2 md:gap-4 px-2 sm:px-3 md:px-0">
        <div className="grid text-slate-11 leading-relaxed text-sm md:text-md">
          <p className="text-xs font-semibold">POSTED</p>
          <p>
            {blog.published_at
              ? new Date(blog.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Unpublished"}
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-9">{blog.title}</h1>
        <div className="grid grid-flow-col auto-cols-max items-center gap-1 md:gap-2 py-1 md:py-2">
          <a href={tweetUrl.toString()} target="_blank" rel="noopener noreferrer">
            <IconButton
              className="rounded-full"
              aria-label="share on twitter"
              variant="subtle"
              size="sm"
              icon={<RiTwitterLine />}
            />
          </a>
          <Popover.Root
            open={popover}
            onOpenChange={(open) => (open ? setTimeout(() => setPopover(false), 1000) : null)}
          >
            <Popover.Trigger
              asChild
              onClick={async () => await navigator.clipboard.writeText(request_url).then(() => setPopover(!popover))}
            >
              <IconButton
                className="rounded-full"
                aria-label="copy link"
                variant="subtle"
                size="sm"
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
        className="aspect-[2/1] max-w-5xl w-full rounded overflow-hidden object-cover bg-slate-2"
        src={blog.image_url}
      />
      {/* Tags */}
      {blog.tags.length > 0 ? (
        <div className="grid max-w-3xl w-full px-4 sm:px-6 md:px-0">
          <ScrollArea>
            <ScrollViewport>
              <div className="flex gap-2">
                {blog.tags.sort().map((tag) => (
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
      <div className="grid max-w-3xl px-2 sm:px-3 md:px-0 w-full">{Content}</div>
    </div>
  );
}

export { ErrorBoundary } from "~/components/app/error-boundary";