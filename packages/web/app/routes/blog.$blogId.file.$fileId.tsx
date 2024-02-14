import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { logger } from "~/lib/util/globals.server";
import { patchBlogFile, deleteBlogFile } from "~/model/blogs.server";

//---------------------------------------------------------------------------------------------------------------------
// Define Action Function
// ----------------------
// Define the action function and all associated utilties, validators, etc.
//---------------------------------------------------------------------------------------------------------------------
const ZPatchPayload = z.object({
  /** The name of the file. */
  name: z.string().optional(),
  /** The alt text of the file. */
  alt: z.string().optional(),
});
type IPatchPayload = z.infer<typeof ZPatchPayload>;

const ZActionParams = z.object({
  /** The ID of the blog that the file belongs to. */
  blogId: z.coerce.number(),
  /** The ID of the file. */
  fileId: z.coerce.number(),
});
type IActionParams = z.infer<typeof ZActionParams>;

export async function action({ params, request }: ActionFunctionArgs) {
  const log = logger(request);

  switch (request.method) {
    case "PATCH": {
      const { blogId, fileId } = await ZActionParams.parseAsync(params).catch((e) => {
        log.info(e, "Invalid request sent.");
        throw new Response(null, { status: 400, statusText: "Bad Request" });
      });

      // Validate FormData
      // ----------------------------------------------------------------------
      // The information must be sent as FormData. We also need to validate that at least one updatable input was sent
      // (name, alt).
      log.info("Parsing the FormData from the request ...");
      let data: IPatchPayload;
      try {
        data = ZPatchPayload.parse(Object.fromEntries((await request.formData()).entries()));
      } catch (e) {
        log.info(e, "Invalid FormData was sent with this request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }

      if (!("name" in data || "alt" in data)) {
        log.info(data, "Invalid FormData was sent with the request.");
        throw json(
          { message: "Invalid FormData was sent with the request." },
          { status: 400, statusText: "Bad Request" },
        );
      }

      // Update Database
      // -----------------------------------------------------------------------
      // Send an update to the database
      await patchBlogFile({ blogId, fileId, ...data }).catch((e) => {
        log.error(e, "There was an error updating the blog file.");
        throw new Response(null, { status: 500, statusText: "Server Error" });
      });

      return json({}, { status: 200, statusText: "OK" });
    }
    case "DELETE": {
      const { blogId, fileId } = await ZActionParams.parseAsync(params).catch((e) => {
        log.info(e, "Invalid request sent.");
        throw new Response(null, { status: 400, statusText: "Bad Request" });
      });

      await deleteBlogFile({ blogId, fileId }).catch((e) => {
        log.error(e, "There was an error deleting the blog file.");
        throw new Response(null, { status: 500, statusText: "Server Error" });
      });

      return json({}, { status: 200, statusText: "OK" });
    }

    default: {
      log.info("This method is not allowed.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}
