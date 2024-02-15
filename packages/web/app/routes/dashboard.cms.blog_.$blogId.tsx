import * as React from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { type ToolbarProps, Toolbar, EditorProvider } from "~/lib/ui/editor";
import { logger, db } from "~/lib/util/globals.server";
import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import { z } from "zod";
import { BlogProvider, parseBlog } from "~/model/blogs";

export function shouldRevalidate({ nextUrl, currentUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  // Don't revalidate when switching between /edit, /preview, /attachments
  if (nextUrl.toString() !== currentUrl.toString()) return false;

  return defaultShouldRevalidate;
}

//---------------------------------------------------------------------------------------------------------------------
// Define Loader Function
//---------------------------------------------------------------------------------------------------------------------
// Define params
const ZLoaderParams = z.object({ blogId: z.string() });

export async function loader({ params, request }: LoaderFunctionArgs) {
  const log = logger(request);

  //-------------------------------------------------------------------------------------------------------------------
  // Retrieve Blog
  //--------------
  // Retrieve the blog with the id corresponding to the "blogId" parameter.
  //-------------------------------------------------------------------------------------------------------------------
  // collect the parameters
  const { blogId } = await ZLoaderParams.parseAsync(params).catch((e) => {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  });

  // retrieve the blog
  log.info("Retrieveing the blog ...");
  const blog = await execute(
    db
      .selectFrom("blogs")
      .leftJoin("blog_tags", "blog_tags.blog_id", "blogs.id")
      .where("id", "=", blogId)
      .groupBy("blogs.id")
      .selectAll("blogs")
      .select(db.fn.agg<string>("group_concat", ["blog_tags.name"]).as("tags")),
  )
    .then((res) => takeFirstOrThrow(res))
    .catch((e) => {
      log.info(e, `Failure: Blog with id ${blogId} does not exist.`);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });
  log.info("Success: Retrieved the blog.");

  return json({ blog });
}
export type LoaderType = typeof loader;

//---------------------------------------------------------------------------------------------------------------------
// Define Route
//---------------------------------------------------------------------------------------------------------------------

function BlogId() {
  const { blog } = useLoaderData<typeof loader>();

  // define the save function for the toolbar
  const onSave = React.useMemo<ToolbarProps["onSave"]>(
    () => (value, save) => {
      const data = new FormData();
      data.set("body", value);
      save.submit(data, { method: "PATCH", action: `/blog/${blog.id}` });
    },
    [],
  );

  // when save is successful, show a succes toast

  return (
    <main className="grid w-full justify-items-center">
      {/* For the height, we are subtracting the Header `theme(spacing.20)` and the Footer `theme(spacing.20)`. */}
      <section className="grid h-[calc(100dvh-theme(spacing.40))] w-full max-w-5xl grid-rows-[max-content_1fr] justify-items-center gap-2 px-4 py-4">
        <Toolbar onSave={onSave} />
        <Outlet />
      </section>
    </main>
  );
}

export default function BlogIdProvider() {
  const { blog } = useLoaderData<typeof loader>();

  return (
    <BlogProvider blog={parseBlog(blog)}>
      <EditorProvider value={blog.body}>
        <BlogId />
      </EditorProvider>
    </BlogProvider>
  );
}
