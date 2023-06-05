import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { z } from "zod";
import { getSessionInfo } from "~/lib/session.server";
import { getLogger, logRequest } from "~/lib/util.server";
import { createAttachment } from "~/model/attachment.server";

// define the payload structure
const ZPostPayload = z.object({
  size: z.coerce.number(),
  type: z.custom<`image/${string}` | `video/${string}`>((val) => !!(val as string).match(/^(image|video)\//)),
  is_unused: z
    .boolean()
    .or(z.enum(["true", "false"]).transform((value) => value === "true"))
    .optional(),
  expires_at: z.null().or(z.coerce.date()).optional(),
  blog_id: z.coerce.number().optional(),
});
type IPostPayload = z.infer<typeof ZPostPayload>;

export async function action({ request, params }: ActionArgs) {
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
        const formData = await request.clone().formData();
        data = ZPostPayload.parse(Object.fromEntries(formData.entries()));
      } catch (e) {
        const json = await request.json();
        data = await ZPostPayload.parseAsync(json).catch((e) => {
          logger.info("Failure: Failed to validate the payload.");
          throw new Response(undefined, { status: 400, statusText: "Bad Request" });
        });
      }
      logger.info("Success: Validated the payload.");

      // create the attachment record
      logger.info("Creating the attachment record ...");
      const { attachment, presignedPost } = await createAttachment(data).catch((e) => {
        logger.info("Failed to create the attachment.");
        logger.info(e);
        throw new Response(undefined, { status: 400, statusText: "Bad Request" });
      });
      logger.info("Success: Created the attachment record.");

      return json({ attachment, presignedPost });
    }
  }

  return new Response(undefined, { status: 404 });
}
