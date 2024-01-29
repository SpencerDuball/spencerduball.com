import * as React from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { logger, db } from "~/lib/util/globals.server";
import { z } from "zod";
import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import { parseBlog, compileMdx } from "~/model/blogs";
import { useLoaderData } from "@remix-run/react";
import { components } from "~/lib/ui/mdx";
import { runSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { BlogView } from "~/lib/app/blog-view";

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
  const { body, ...blog } = await execute(
    db
      .selectFrom("blogs")
      .leftJoin("blog_tags", "blog_tags.blog_id", "blogs.id")
      .where("id", "=", blogId)
      .where("published", "=", true)
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

  //-------------------------------------------------------------------------------------------------------------------
  // Validate Frontmatter and Compile Blog
  //--------------------------------------
  // To generate the markdoc content we will:
  // 1. Parse - parse the input string into an AST
  // 2. Validate - validate that the frontmatter and markdoc are valid
  // 3. Build - transform the AST into renderable content with custom config (custom components)
  //-------------------------------------------------------------------------------------------------------------------
  // 1. Parse the string into an AST
  log.info("Building the blog ...");

  const { content } = await compileMdx(body);

  return json({ blog, content, url: request.url });
}

export default function Blog() {
  const { blog, content, url } = useLoaderData<typeof loader>();

  return <BlogView data={{ url, content, ...parseBlog(blog) }} />;
}

export { ErrorBoundary } from "~/lib/app/error-boundary";
