import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Toolbar, EditorProvider } from "~/lib/ui/editor";
import { logger, db } from "~/lib/util/globals.server";
import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import { z } from "zod";

//---------------------------------------------------------------------------------------------------------------------
// Define Loader Function
//---------------------------------------------------------------------------------------------------------------------
// Define params
const ZLoaderParams = z.object({ blogId: z.coerce.number() });

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

function BlogId() {
  return (
    <main className="grid w-full justify-items-center">
      {/* For the height, we are subtracting the Header `theme(spacing.20)` and the Footer `theme(spacing.20)`. */}
      <section className="grid h-[calc(100dvh-theme(spacing.40))] w-full max-w-5xl grid-rows-[max-content_1fr] justify-items-center gap-2 px-4 py-4">
        <Toolbar />
        <Outlet />
      </section>
    </main>
  );
}

export default function BlogIdProvider() {
  const { blog } = useLoaderData<typeof loader>();

  return (
    <EditorProvider value={blog.body}>
      <BlogId />
    </EditorProvider>
  );
}
