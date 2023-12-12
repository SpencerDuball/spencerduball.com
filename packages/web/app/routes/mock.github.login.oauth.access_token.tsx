import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z, ZodError } from "zod";
import { ddb, logger, logRequest } from "~/lib/util/utilities.server";
import { Config } from "sst/node/config";
import { ZOAuthAccessToken, ZOAuthOTC } from "@spencerduballcom/db/ddb";

const ZFormData = z.object({ client_id: z.string(), client_secret: z.string(), code: z.string() });

export async function action({ request }: ActionFunctionArgs) {
  const log = logger();
  await logRequest(log, request);

  // parse the form data
  let data: z.infer<typeof ZFormData>;
  try {
    log.info("Parsing the form data ...");
    data = ZFormData.parse(Object.fromEntries(await request.formData()));
    log.info("Success: Parsed valid form data.");
  } catch (e) {
    if (e instanceof ZodError) {
      log.info("Failure: Did not receive valid form data.");
      log.info(e);
      return json({ message: e.message }, { status: 400 });
    } else {
      log.error("Failure: Did not receive valid form data.");
      log.error(e);
      return json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
    }
  }

  // Check For Accept Header
  // -----------------------
  // If a header of { Accept: "application/json" } is not passed to Github in exchange for an access_token then a
  // format other than JSON will be supplied. Check for this in the MOCK to prevent any surprises in the actual API.
  log.info("Checking for 'Accept' header ...");
  if (request.headers.get("Accept") === "application/json") {
    log.info("Failure: { Accept: 'application/json' } not supplied.");
    return json(
      { message: "WARNING: 'Accept' header is missing and will cause issues with actual Github API." },
      { status: 500 }
    );
  }
  log.info("Success: Checked for 'Accept' header successfully.");

  // Validate The Request Content
  // ----------------------------
  // To validate the request is valid we need to ensure that the passed client_id and client_secret are valid and match
  // our credentials. Next we need to check that the OTC exists in the database. If it does, we can create an
  // access_token the user can use to make Github requests. If it doesn't, this request should be failed.

  // (1) Confirm the server credentials
  log.info("Checking Github credentials ...");
  if (Config.GITHUB_CLIENT_ID !== data.client_id || Config.GITHUB_CLIENT_SECRET !== data.client_secret) {
    log.info("Failure: Github credentials did not match.");
    return json({ message: "Client credentials don't match." }, { status: 400 });
  }
  log.info("Success: Github credentials matched.");

  // (2) Retrieve the OTC from the database
  let otc: z.infer<typeof ZOAuthOTC>;
  try {
    log.info("Retrieveing the OTC from the database ...");
    otc = await ddb()
      .entities.oauthOTC.get({ pk: `oauth_otc#${data.code}`, sk: `oauth_otc#${data.code}` })
      .then(({ Item }) => ZOAuthOTC.parse(Item));
    log.info("Success: Retrieved the OTC from the database.");
  } catch (e) {
    log.info("Failure: The OTC does not exist in the database.");
    return json({ message: "The OTC did not exist, aborting signin." }, { status: 400 });
  }

  // (3) Create the access_token for the user
  let access_token: z.infer<typeof ZOAuthAccessToken>;
  try {
    log.info("Creating the access_token for the user in the ddb ...");
    access_token = await ddb()
      .entities.oauthAccessToken.update({ user_id: otc.user_id, scope: otc.scope }, { returnValues: "ALL_NEW" })
      .then(({ Attributes }) => ZOAuthAccessToken.parse(Attributes));
    log.info("Success: Created the access_token for the user in ddb.");
  } catch (e) {
    if (e instanceof ZodError) {
      log.info("Failure: Failed to create the access_token.");
      log.info(e);
      return json({ message: e.message }, { status: 400 });
    } else {
      log.error("Failure: Failed to create the access_token record.");
      log.error(e);
      return json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
    }
  }

  return json({ access_token: access_token.id, scope: access_token.scope, token_type: "Bearer" });
}
