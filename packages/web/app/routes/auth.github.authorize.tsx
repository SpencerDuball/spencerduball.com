import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { ZOAuthStateCode } from "@spencerduballcom/db/ddb";
import { Config } from "sst/node/config";
import { logRequest, getLogger, getDdbClient } from "~/lib/util/utilities.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await logRequest(request);

  // get the return location
  const reqUrl = new URL(request.url);
  const search = new URLSearchParams(reqUrl.search);
  const returnLocation = search.has("redirect_uri") ? search.get("redirect_uri")! : "/";

  // get utilities
  const logger = getLogger();
  const ddb = getDdbClient();

  // create a state code
  logger.info("Creating the oauth_state_code in the database ...");
  const stateCode = await ddb.entities.oauthStateCode
    .update({ redirect_uri: returnLocation }, { returnValues: "ALL_NEW" })
    .catch((e) => {
      logger.error("There was an issue querying the database.");
      logger.error(e);
      throw redirect(returnLocation);
    })
    .then(async ({ Attributes }) =>
      ZOAuthStateCode.parseAsync(Attributes).catch((e) => {
        logger.error("The oauth_state_code did not match the expected schema.");
        logger.error(e);
        throw redirect(returnLocation);
      })
    );
  logger.info("Success: Created the oauth_state_code.");

  return redirect(`/?success=true`);
};
