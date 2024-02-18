import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { logger } from "~/lib/util/globals.server";
import { deleteBlogFile } from "~/model/blogs.server";
import { getSessionInfo } from "~/lib/util/utils.server";

//---------------------------------------------------------------------------------------------------------------------
// Define Action Function
// ----------------------
// Define the action function and all associated utilties, validators, etc.
//---------------------------------------------------------------------------------------------------------------------
const ZActionParams = z.object({
  /** The ID of the blog that the file belongs to. */
  blogId: z.string(),
  /** The ID of the file. */
  fileId: z.string(),
});
type IActionParams = z.infer<typeof ZActionParams>;

export async function action({ params, request }: ActionFunctionArgs) {
  const log = logger(request);

  // check if user is admin
  const session = await getSessionInfo(request);
  if (!session?.roles.includes("admin")) throw new Response(null, { status: 403, statusText: "Not Authorized" });

  switch (request.method) {
    case "DELETE": {
      const { blogId, fileId } = await ZActionParams.parseAsync(params).catch((e) => {
        log.info(e, "Invalid request sent.");
        throw new Response(null, { status: 400, statusText: "Bad Request" });
      });

      await deleteBlogFile({ blogId, fileId }).catch((e) => {
        log.error(e, "There was an error deleting the blog file.");
        throw new Response(null, { status: 500, statusText: "Server Error" });
      });

      return new Response(null, { status: 200, statusText: "OK" });
    }

    default: {
      log.info("This method is not allowed.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}
