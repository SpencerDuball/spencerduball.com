import { LoaderFunctionArgs, json } from "@remix-run/node";
import { logger, db } from "~/lib/util/globals.server";
import { z } from "zod";
import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import { tagsTfmr, coverImgTfmr, ZBlogMeta } from "~/model/blogs";
import Markdoc from "@markdoc/markdoc";
import { config } from "~/lib/ui/markdoc";
import { ZYamlString } from "~/lib/util/utils";
import { useLoaderData } from "@remix-run/react";

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
      .selectAll()
      .select(db.fn.agg<string>("group_concat", ["blog_tags.name"]).as("tags")),
  )
    .then((res) => takeFirstOrThrow(res))
    .then((blog) => ({ ...blog, tags: tagsTfmr(blog.tags), cover_img: coverImgTfmr(blog.cover_img) }))
    .catch((e) => {
      log.info(e, `Failure: Blog with id ${blogId} does not exist.`);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });
  log.info("Success: Retrieved the blog.");

  //-------------------------------------------------------------------------------------------------------------------
  // Generate Markdoc
  //---------------------
  // To generate the markdoc content we will:
  // 1. Parse - parse the input string into an AST
  // 2. Validate - validate that the frontmatter and markdoc are valid
  // 3. Build - transform the AST into renderable content with custom config (custom components)
  //-------------------------------------------------------------------------------------------------------------------
  // 1. Parse the string into an AST
  log.info("Building the blog ...");
  const ast = Markdoc.parse(body);

  // 2. Validate the frontmatter and body
  const meta = ZYamlString.pipe(ZBlogMeta).parse(ast.attributes.frontmatter);
  const errors = Markdoc.validate(ast, config);
  if (errors.length > 0) {
    log.error(errors, "Failed to validate the markdoc content.");
    throw errors;
  }

  // 3. Build the AST into renderable content
  const content = Markdoc.transform(ast, config);
  log.info("Success: Built the blog.");

  return json({ blog, meta, content });
}

export default function Blog() {
  const { blog, meta, content } = useLoaderData<typeof loader>();

  return (
    <>
      <p>{JSON.stringify(blog)}</p>
      <br />
      <p>{JSON.stringify(meta)}</p>
      <br />
      <p>{JSON.stringify(content)}</p>
    </>
  );
}
