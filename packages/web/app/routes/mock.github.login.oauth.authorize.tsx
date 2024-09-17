import { ActionFunctionArgs, json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { randomUUID } from "crypto";
import { sql } from "kysely";
import { z } from "zod";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { ZGithubUserInfo } from "~/models/github";
import { ZJsonString } from "~/util";
import { db, flash, getLogger, ZEnv } from "~/util/server";

const ZSearch = z.object({
  /**
   * The Github Client ID.
   */
  client_id: z.string(),
  /**
   * The URL to redirect the user after the authorization.
   */
  redirect_uri: z.string(),
  /**
   * The scope of the authorization.
   */
  scope: z.string(),
  /**
   * The state code to prevent CSRF attacks.
   */
  state: z.string(),
});

const ZFormData = z.object({
  /**
   * The search parameters.
   */
  search: ZJsonString.pipe(ZSearch),
  /**
   * The user's Github ID.
   */
  github_id: z.coerce.number(),
});

function errorFlashMessage(id: string) {
  return {
    type: "error",
    title: "Signin Failed",
    message: "Hmm, the request doesn't look to be formed correctly.",
    id,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // IMPORTANT!
  // -----------------------------------------------------------------------------------
  // This route should be used only when the `MOCKS_ENABLED` environment variable is set.
  // In a production environment, this route should be invisible to the user.
  if (!env.MOCKS_ENABLED) {
    logger.error({ traceId: "5f56090d" }, "Attempt to access the mock route without the `MOCKS_ENABLED = true`.");
    throw new Response(null, { status: 404 });
  }

  switch (request.method.toUpperCase()) {
    case "POST": {
      // parse the form data
      let data: z.infer<typeof ZFormData>;
      try {
        logger.info({ traceId: "5d13686a" }, "Parsing the form data ...");
        data = ZFormData.parse(Object.fromEntries((await request.formData()).entries()));
        logger.info({ traceId: "5e319581" }, "Success: Parsed the form data.");
      } catch (e) {
        if (e instanceof z.ZodError || e instanceof TypeError) {
          logger.info({ traceId: "caed7069", err: e }, "Failure: Form data is invalid.");
          const flashCookie = await flash.serialize(errorFlashMessage("ce8cdc86"));
          throw new Response(null, { status: 400, headers: [["Set-Cookie", flashCookie]] });
        } else {
          logger.error({ traceId: "41dec2d0", err: e }, "Failure: There was an issue processing the request.");
          const flashCookie = await flash.serialize(errorFlashMessage("e12a9b7a"));
          throw new Response(null, { status: 500, headers: [["Set-Cookie", flashCookie]] });
        }
      }

      // Validate the Client ID Matches
      // -------------------------------------------------------------------------------
      // Validate the client_id matches our client credentials. If it doesn't match then
      // this response could be coming from an app other than ours.
      logger.info({ traceId: "0cf68b4a" }, "Validating the client ID ...");
      if (data.search.client_id !== env.GITHUB_CLIENT_ID) {
        logger.warn({ traceId: "36b0484b" }, "Failure: The client ID does not match.");
        const flashCookie = await flash.serialize(errorFlashMessage("ce8cdc86"));
        throw new Response(null, { status: 400, headers: [["Set-Cookie", flashCookie]] });
      }

      // Issue the OTC
      // -------------------------------------------------------------------------------
      // By checking the user exists we have simulated validating the user's credentials
      // as Github would. Now we can issue an OTC which the user may exchange for an
      // access_token. First we will create the OTC in the database here.
      logger.info("Creating the OTC in the database ...");
      const otc = await db
        .insertInto("mock_gh_otcs")
        .values({ id: randomUUID(), scope: data.search.scope, github_id: data.github_id })
        .returning("id")
        .executeTakeFirstOrThrow()
        .catch((e) => {
          logger.error({ traceId: "b8194c99", err: e }, "Failed to create the OTC in the database.");
          throw new Response(null, { status: 500 });
        });
      logger.info("Success: Created the OTC in the database.");

      // Redirect User with OTC
      // -------------------------------------------------------------------------------
      // We have successfully validated the user, now we can redirect the user to the
      // redirect_uri to finish authorizing with the newly created OTC.
      logger.info({ traceId: "82001766" }, "Redirecting the user to the redirect_uri ...");
      const redirectUrl = new URL(data.search.redirect_uri);
      redirectUrl.searchParams.append("code", otc.id);
      redirectUrl.searchParams.append("state", data.search.state);
      return redirect(redirectUrl.toString());
    }
    default: {
      logger.info({ traceId: "f1b2e3a4" }, "This method is not allowed, only POST is defined.");
      throw new Response(null, { status: 405 });
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const logger = getLogger();
  const env = ZEnv.parse(process.env);

  // IMPORTANT!
  // -----------------------------------------------------------------------------------
  // This route should be used only when the `MOCKS_ENABLED` environment variable is set.
  // In a production environment, this route should be invisible to the user.
  if (!env.MOCKS_ENABLED) {
    logger.error({ traceId: "c1c3b2b3" }, "Attempt to access the mock route without the `MOCKS_ENABLED = true`.");
    throw new Response(null, { status: 404 });
  }

  // Ensure Required Search Params
  // -----------------------------------------------------------------------------------
  // This route should only ever be hit as a result of the redirect from
  // "/auth/signin/github" so the parameters should all exist. If these parameters don't
  // exist, we want to redirect either to the redirect URL from the state code, or back
  // to "/".
  let search: z.infer<typeof ZSearch>;
  try {
    logger.info({ traceId: "e2cb1b66" }, "Parsing the search parameters ...");
    const url = new URL(request.url);
    search = ZSearch.parse(Object.fromEntries(url.searchParams.entries()));
    logger.info({ traceId: "dbf8a6d7" }, "Success: Parsed the search parameters.");
  } catch (e) {
    logger.warn({ traceId: "735f9578", err: e }, "Failure: Required search params are not present.");
    const globalMessage = errorFlashMessage("527a0056");
    throw redirect("/", { headers: [["Set-Cookie", await flash.serialize(globalMessage)]] });
  }

  // Collect the Possible Users
  // -----------------------------------------------------------------------------------
  // We need to collect three types of users to present for selection:
  // 1. Admin users from the database.
  // 2. Standard users from the database.
  // 3. Random users from Github who are not in the database.

  // collect 10 admin users
  logger.info("Collecting the admin users ...");
  const adminUsers = await db
    .selectFrom("users")
    .selectAll("users")
    .innerJoin("user_roles", "users.id", "user_roles.user_id")
    .where("user_roles.role_id", "=", "admin")
    .limit(10)
    .execute();

  // collect 10 sandard users
  const standardUsers = await db
    .selectFrom("users")
    .selectAll("users")
    .leftJoin("user_roles", "users.id", "user_roles.user_id")
    .where("user_roles.role_id", "is", sql<null>`null`)
    .limit(10)
    .execute();

  // collect 10 random users from Github
  const githubUsers = await fetch("https://github.com/mock/users").then(async (res) =>
    ZGithubUserInfo.array().parse(await res.json()),
  );

  return json({ adminUsers, standardUsers, githubUsers, search });
}

export default function Authorize() {
  const { adminUsers, standardUsers, githubUsers, search } = useLoaderData<typeof loader>();

  return (
    <main className="grid w-full justify-items-center">
      <div className="grid w-full max-w-5xl gap-10 px-4 py-6">
        {/* Introduction */}
        <section className="grid max-w-3xl gap-3">
          <h1 className="text-5xl font-extrabold leading-snug text-slate-11 dark:text-slatedark-11">Github Mock</h1>
          <p className="text-slate-12 dark:text-slatedark-12">
            Click on one of the options to sign in, you can assume the person for testing and development 😃
          </p>
        </section>
        {/* User Selection */}
        <Form method="post">
          <input type="hidden" name="search" value={JSON.stringify(search)} />
          <h2 className="py-4 text-3xl font-bold text-blue-11 dark:text-bluedark-11">Admin Users</h2>
          <div className="flex flex-wrap gap-4">
            {adminUsers.map((user) => (
              <button
                key={user.id}
                name="github_id"
                value={user.github_id}
                className="grid w-full grid-cols-[max-content_1fr] gap-2 rounded-md border border-slate-4 bg-slate-2 p-2 dark:border-slatedark-4 dark:bg-slatedark-2 sm:w-[calc(50%-theme(spacing.4)/2)] md:w-[calc(33.3%-theme(spacing.8)/3)]"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                </Avatar>
                <div className="grid justify-start justify-items-start self-center">
                  <p className="text-md self-end overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                  <p className="self-start overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-11 dark:text-slatedark-11">
                    {user.username} &bull; Admin
                  </p>
                </div>
              </button>
            ))}
          </div>
          <h2 className="my-4 pt-4 text-3xl font-bold text-purple-11 dark:text-purpledark-11">Standard Users</h2>
          <div className="flex flex-wrap gap-4">
            {standardUsers.map((user) => (
              <button
                key={user.id}
                name="github_id"
                value={user.github_id}
                className="grid w-full grid-cols-[max-content_1fr] gap-2 rounded-md border border-slate-4 bg-slate-2 p-2 dark:border-slatedark-4 dark:bg-slatedark-2 sm:w-[calc(50%-theme(spacing.4)/2)] md:w-[calc(33.3%-theme(spacing.8)/3)]"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                </Avatar>
                <div className="grid justify-start justify-items-start self-center">
                  <p className="text-md self-end overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                  <p className="self-start overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-11 dark:text-slatedark-11">
                    {user.username}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <h2 className="my-4 py-4 text-3xl font-bold text-green-11 dark:text-greendark-11">Non-Existing Users</h2>
          <div className="flex flex-wrap gap-4">
            {githubUsers.map((user) => (
              <button
                key={user.id}
                name="github_id"
                value={user.id}
                className="grid w-full grid-cols-[max-content_1fr] gap-2 rounded-md border border-slate-4 bg-slate-2 p-2 dark:border-slatedark-4 dark:bg-slatedark-2 sm:w-[calc(50%-theme(spacing.4)/2)] md:w-[calc(33.3%-theme(spacing.8)/3)]"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                </Avatar>
                <div className="grid justify-start justify-items-start self-center">
                  <p className="text-md self-end overflow-hidden text-ellipsis whitespace-nowrap">{user.name}</p>
                  <p className="self-start overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-11 dark:text-slatedark-11">
                    {user.login}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Form>
      </div>
    </main>
  );
}
