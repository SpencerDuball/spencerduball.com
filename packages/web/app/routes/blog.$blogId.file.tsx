import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { logger } from "~/lib/util/globals.server";
import { putBlogFile } from "~/model/blogs.server";
import { getSessionInfo } from "~/lib/util/utils.server";

//---------------------------------------------------------------------------------------------------------------------
// Define Action Function
// ----------------------
// Define the action function and all associated utilties, validators, etc.
//---------------------------------------------------------------------------------------------------------------------
const ZActionParams = z.object({
  /** The ID of the blog that the file belongs to. */
  blogId: z.string(),
});
type IActionParams = z.infer<typeof ZActionParams>;

// POST
const ZPostPayload = z.object({
  /** The name of the blog file including the extension. */
  name: z.string(),
  /** The size in bytes of the blog file. */
  size: z.coerce.number(),
  /** The file extension of the blog file. */
  type: z.string(),
  /** The expires_at time. */
  expires_at: z.string().datetime().nullable(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ params, request }: ActionFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403, statusText: "Not Authorized" });

  switch (request.method) {
    case "POST": {
      const { blogId } = await ZActionParams.parseAsync(params).catch((e) => {
        log.info(e, "Invalid request sent.");
        throw new Response(null, { status: 400, statusText: "Bad Request" });
      });

      // Validate FormData
      log.info("Parsing the FormData from the request ...");
      let data: IPostPayload;
      try {
        data = ZPostPayload.parse(Object.fromEntries((await request.formData()).entries()));
      } catch (e) {
        log.info(e, "Invalid FormData was sent with the request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }

      log.info("Creating the blog file ...");
      const { presignedPost } = await putBlogFile({ blogId, ...data }).catch((e) => {
        log.error(e, "There was an error uploading the blog file.");
        throw new Response(null, { status: 500, statusText: "Server Error" });
      });

      return json({ presignedPost });
    }

    default: {
      log.info("This method is not allowed.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}
