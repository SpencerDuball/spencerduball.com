import { json, type ActionArgs } from "@remix-run/node";
import { logRequest, getLogger } from "~/lib/util.server";
import { getSessionInfo } from "~/lib/session.server";
import { z } from "zod";
import { deleteAttachment, patchAttachment } from "~/model/attachment.server";

const ZParams = z.object({ attachmentId: z.string() });

// define the payload structure
const ZPatchPayload = z.object({
  is_unused: z
    .boolean()
    .or(z.enum(["true", "false"]).transform((value) => value === "true"))
    .optional(),
  expires_at: z.null().or(z.coerce.date()).optional(),
});
type IPatchPayload = z.infer<typeof ZPatchPayload>;

export async function action({ request, params }: ActionArgs) {
  await logRequest(request);

  // ensure user is admin
  const session = await getSessionInfo(request);
  if (!session) return new Response(undefined, { status: 401 });
  else if (!session.roles.includes("admin")) return new Response(undefined, { status: 403 });

  // get request info
  const { attachmentId } = await ZParams.parseAsync(params).catch((e) => {
    throw new Response(undefined, { status: 404, statusText: "Not Found" });
  });

  // get utilities
  const logger = getLogger();

  switch (request.method) {
    case "DELETE": {
      // delete the attachment
      logger.info("Deleting the attachment ...");
      const attachment = await deleteAttachment({ id: attachmentId });
      logger.info("Success: Deleted the attachment.");

      return json(attachment);
    }
    case "PATCH": {
      // get request info
      logger.info("Validating the payload ...");
      let data: IPatchPayload;
      try {
        const formData = await request.formData();
        data = ZPatchPayload.parse(Object.fromEntries(formData.entries()));
      } catch (e) {
        const json = await request.json();
        data = await ZPatchPayload.parseAsync(json).catch((e) => {
          logger.info("Failure: Failed to validate the payload.");
          throw new Response(undefined, { status: 400, statusText: "Bad Request" });
        });
      }
      logger.info("Success: Validated the payload.");

      // update the attachment
      logger.info("Updating the attachment ...");
      const attachment = await patchAttachment({ ...data, id: attachmentId }).catch((e) => {
        logger.info("Failure: Failed to update the attachment.");
        logger.info(e);
        throw new Response(undefined, { status: 400, statusText: "Bad Request" });
      });
      logger.info("Success: Updated the attachment.");

      return json(attachment);
    }
  }

  return new Response(undefined, { status: 400, statusText: "Bad Request" });
}
