import { Form, useLoaderData } from "@remix-run/react";
import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs, json } from "@remix-run/node";
import { ddb, logger, logRequest } from "~/lib/util/utilities.server";
import { Config } from "sst/node/config";
import { sqldb } from "~/lib/util/utilities.server";
import { sql } from "kysely";
import { ZodError, z } from "zod";
import * as Avatar from "@radix-ui/react-avatar";
import { IconButton } from "~/lib/ui/button";
import { RiLoginCircleLine } from "react-icons/ri/index.js"; // TODO: Remove the 'index.js' after this issue: https://github.com/remix-run/remix/discussions/7451
import { ZJsonString } from "~/lib/util/client";
import { ZMockGhUser, ZOAuthOTC } from "@spencerduballcom/db/ddb";

const ZSearch = z.object({
  client_id: z.string(),
  redirect_uri: z.string(),
  scope: z.string(),
  state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
});
const ZFormData = z.object({
  search: ZJsonString.pipe(ZSearch.extend({ state: z.object({ id: z.string(), redirect_uri: z.string() }) })),
  user_id: z.coerce.number(),
});

export async function action({ request }: ActionFunctionArgs) {
  const log = logger();
  await logRequest(log, request);

  // IMPORTANT!
  // ----------
  // If we are in a production environment, we do NOT want users to be able to access this mocked github oauth
  // endpoint. We want this page to be invisible to public users. Also if we are in any other environment that
  // does not have MOCKS_ENABLED we want to hide this page.
  if (Config.STAGE === "prod" || Config.MOCKS_ENABLED !== "TRUE") {
    if (Config.STAGE === "prod") log.info("In 'prod' environment, cannot use mocks here.");
    else log.info("Mocks are not enabled, check the MOCKS_ENABLED environment variable.");
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  switch (request.method) {
    case "POST": {
      // parse the form data
      let data: z.infer<typeof ZFormData>;
      try {
        const formData = await request.formData();
        log.info(formData, "Parsing the form data ...");
        data = ZFormData.parse(Object.fromEntries(formData));
        log.info("Success: Parsed valid form data.");
      } catch (e) {
        if (e instanceof ZodError) {
          log.info(e, "Failure: Did not receive valid form data.");
          return json({ message: e.message }, { status: 400 });
        } else {
          log.error(e, "Failure: There was an issue processing the request.");
          return json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
        }
      }

      // Validate the Client ID Matches
      // ------------------------------
      // Validate that the client_id matches our client credentials. If it doesn't then this response could be coming
      // from an app other than ours.
      log.info("Checking client_id matches ...");
      if (Config.GITHUB_CLIENT_ID !== data.search.client_id) {
        log.info("Faliure: client_id did not match.");
        throw redirect(data.search.state.redirect_uri);
      }

      // Issue the OTC
      // -------------
      // By checking the user exists we have simulated validating the user's credentials as Github would. Now we can issue
      // an OTC which the user may exchange for an access_token. First we will create the OTC in the database here.
      let otc: z.infer<typeof ZOAuthOTC>;
      try {
        log.info("Creating the OTC for the user in ddb ...");
        otc = await ddb()
          .entities.oauthOTC.update({ user_id: data.user_id, scope: data.search.scope }, { returnValues: "ALL_NEW" })
          .then(({ Attributes }) => ZOAuthOTC.parse(Attributes));
        log.info("Success: Created the OTC for the user in ddb.");
      } catch (e) {
        if (e instanceof ZodError) {
          log.info(e, "Failure: Failed to create the OTC record.");
          return json({ message: e.message }, { status: 400 });
        } else {
          log.error(e, "Failure: Failed to create the OTC record.");
          return json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
        }
      }

      // Redirect User with OTC
      // ----------------------
      // We have successfully validated the user, now we can redirect the user to the redirect_uri to finish authorizing
      // with the newly created OTC.
      log.info("Redirecting to redirect_uri ...");
      const search = new URLSearchParams({ state: JSON.stringify(data.search.state), code: otc.id });
      return redirect(`${data.search.redirect_uri}?${search.toString()}`);
    }
    default: {
      log.info("This method is not allowed, only POST is defined.");
      throw new Response(null, { status: 405, statusText: "Method Not Allowed" });
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const log = logger();
  await logRequest(log, request);

  // IMPORTANT!
  // ----------
  // If we are in a production environment, we do NOT want users to be able to access this mocked github oauth
  // endpoint. We want this page to be invisible to public users. Also if we are in any other environment that
  // does not have MOCKS_ENABLED we want to hide this page.
  if (Config.STAGE === "prod" || Config.MOCKS_ENABLED !== "TRUE") {
    if (Config.STAGE === "prod") log.info("In 'prod' environment, cannot use mocks here.");
    else log.info("Mocks are not enabled, check the MOCKS_ENABLED environment variable.");
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  // Ensure Required Search Params
  // -----------------------------
  // This route should only ever be hit as a result of the redirect from "/auth/signin/github" so the parameters
  // should all exist. If these parameters don't exist, we want to redirect either to the redirect URL from the
  // state code, or back to "/". We could check for these items in the browser, but we have all the data we need
  // in the HTTP request. Plus it's easier to just redirect from here rather than hitting the database and sending
  // a 200 response.
  let search: z.infer<typeof ZSearch>;
  try {
    log.info("Parsing the search parameters ...");
    const url = new URL(request.url);
    search = ZSearch.parse(Object.fromEntries(new URLSearchParams(url.search)));
    log.info("Success: Parsed the search parameters successfully.");
  } catch (e) {
    log.info(e, "Failure: Required search params are not present.");
    try {
      const url = new URL(request.url);
      const { redirect_uri } = ZSearch.shape.state.parse(url.searchParams.get("state"));
      throw redirect(redirect_uri);
    } catch (e) {
      throw redirect("/");
    }
  }

  // get the possible database users that the requester could assume
  log.info("Retrieving all users ...");
  const users = await sqldb()
    .selectFrom("users")
    .leftJoin("user_roles", "users.id", "user_roles.user_id")
    .select([
      "id",
      "username",
      "name",
      "avatar_url",
      "github_url",
      sql<string[]>`COALESCE(GROUP_CONCAT(user_roles.role_id), '')`.as("roles"),
    ])
    .groupBy("users.id")
    .execute()
    .catch((e) => {
      log.error(e, "Failure: There was an issue retrieving the users from the database.");
      throw json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
    });
  users.sort((curr, prev) => curr.id - prev.id);
  log.info("Success: Retrieved all users.");

  // Get Mock Github Users
  // ---------------------
  // We can get the entire set of mock github users which will allow us to test the signin flow too. After getting all
  // the mock users, filter the existing users from the list.
  // (1) get the mock users
  let ghUsers = await ddb()
    .entities.mockGhUser.query("mock_gh_user")
    .then(async ({ Items }) => ZMockGhUser.array().parseAsync(Items))
    .catch((e) => {
      log.error(e, "Failure: Getting mock db users failed.");
      throw json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
    });

  // (2) filter the useres
  const existingUserIds = users.map((users) => users.id);
  ghUsers = ghUsers.filter(({ id }) => !existingUserIds.includes(id));
  ghUsers.sort((curr, next) => curr.id - next.id);

  return { users, ghUsers, search };
}

export default function Authorize() {
  const { users, ghUsers, search } = useLoaderData<typeof loader>();

  return (
    <main className="grid w-full justify-items-center">
      <div className="grid w-full max-w-5xl py-6 px-4 gap-8">
        {/* Introduction */}
        <section className="grid max-w-3xl gap-3">
          <h1 className="text-5xl font-extrabold leading-snug text-slate-11">Github Mock</h1>
          <p className="text-slate-12">
            Click on one of the options to sign in, you can assume the person for testing and development 😃
          </p>
        </section>
        {/* User Selection */}
        <Form method="post">
          <input type="hidden" name="search" value={JSON.stringify(search)} />
          <h2 className="text-3xl font-bold text-blue-11 py-4">Existing Users</h2>
          <div className="flex flex-wrap gap-4">
            {users.map((user) => (
              <div
                key={user.id.toString()}
                className="p-4 bg-slate-2 border-slate-4 rounded-md grid grid-flow-col gap-4 w-80 grid-cols-[max-content_1fr_max-content] border"
              >
                <Avatar.Root className="text-md relative flex h-16 w-16 overflow-hidden rounded-full">
                  <Avatar.Image
                    className="aspect-square h-full w-full"
                    src={user.avatar_url}
                    alt={`A profile photo of ${user.name}`}
                  />
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-slate-3">
                    {user.name}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="grid content-center auto-rows-max">
                  <p className="leading-tight text-lg font-semibold">{user.name}</p>
                  <p>{user.roles}</p>
                </div>
                <IconButton
                  type="submit"
                  name="user_id"
                  value={user.id}
                  aria-label="sign in"
                  variant="subtle"
                  size="md"
                  icon={<RiLoginCircleLine />}
                  className="self-center justify-self-end"
                />
              </div>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-purple-11 py-4 mt-4">Non-Existing Users</h2>
          <div className="flex flex-wrap gap-4">
            {ghUsers.map((user) => (
              <div
                key={user.id.toString()}
                className="p-4 bg-slate-2 border-slate-4 rounded-md grid grid-flow-col gap-4 w-80 grid-cols-[max-content_1fr_max-content] border"
              >
                <Avatar.Root className="text-md relative flex h-16 w-16 overflow-hidden rounded-full">
                  <Avatar.Image
                    className="aspect-square h-full w-full"
                    src={user.avatar_url}
                    alt={`A profile photo of ${user.name}`}
                  />
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-slate-3">
                    {user.name}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="grid content-center auto-rows-max">
                  <p className="leading-tight text-lg font-semibold">{user.name}</p>
                </div>
                <IconButton
                  type="submit"
                  name="user_id"
                  value={user.id}
                  aria-label="sign in"
                  variant="subtle"
                  size="md"
                  icon={<RiLoginCircleLine />}
                  className="self-center justify-self-end"
                />
              </div>
            ))}
          </div>
        </Form>
      </div>
    </main>
  );
}
