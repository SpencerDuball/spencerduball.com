import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { logger, db } from "~/lib/util/globals.server";
import { z } from "zod";
import { execute, takeFirstOrThrow, getSessionInfo } from "~/lib/util/utils.server";
import { ZBooleanString } from "~/lib/util/utils";
import { parseBlog, compileMdx } from "~/model/blogs";
import { deleteBlog, patchBlog } from "~/model/blogs.server";
import { useLoaderData } from "@remix-run/react";
import { BlogView } from "~/lib/app/blog-view";

//---------------------------------------------------------------------------------------------------------------------
// Define Action Function
// ----------------------
// Define the action function and all associated utilties, validators, etc.
//---------------------------------------------------------------------------------------------------------------------
const ZPatchPayload = z.object({
  /** The body of the blog. */
  body: z.string().optional(),
  /** The views count of the blog. */
  views: z.coerce.number().optional(),
  /** The published status of the blog. */
  published: ZBooleanString.optional(),
});
type IPatchPayload = z.infer<typeof ZPatchPayload>;

const ZActionParams = z.object({ blogId: z.string() });

export async function action({ params, request }: ActionFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403, statusText: "Not Authorized" });

  switch (request.method) {
    case "PATCH": {
      const { blogId } = ZActionParams.parse(params);

      // Validate FormData
      // ----------------------------------------------------------------------
      // The information must be sent as FormData. We also need to validate that at least one updatable input was send
      // (body, views, published).
      log.info("Parsing the FormData from the request ...");
      let data: IPatchPayload;
      try {
        data = ZPatchPayload.parse(Object.fromEntries((await request.formData()).entries()));
      } catch (e) {
        log.info(e, "Invalid FormData was sent with the request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }
      if (!("body" in data || "views" in data || "published" in data)) {
        log.info(data, "Invalid FormData was sent with the request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }

      // Update Database
      // ----------------------------------------------------------------------
      // Send an update to the database.
      await patchBlog({ ...data, id: blogId }).catch((e) => {
        log.error(e, "There was an error updating the blog.");
        throw new Response(null, { status: 500, statusText: "Server Error" });
      });

      return new Response(null, { status: 200, statusText: "OK" });
    }
    case "DELETE": {
      const { blogId } = ZActionParams.parse(params);

      // Delete Blog
      // -----------
      await deleteBlog({ id: blogId }).catch((e) => {
        log.error(e, "There was an error deleting the blog.");
        throw json({}, { status: 500, statusText: "Server Error" });
      });

      return new Response(null, { status: 200, statusText: "OK" });
    }
    default: {
      log.info("This method is not allowed.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
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
  const blogId = await ZLoaderParams.parseAsync(params)
    .then(({ blogId }) => blogId.split("-").pop()!)
    .catch((e) => {
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
