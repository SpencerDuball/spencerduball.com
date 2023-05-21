import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { getDdbClient, getLogger, getPgClient, ZEnv, logRequest } from "~/lib/util.server";
import { ZOAuthMock } from "~/lib/pkg/ddb.server";
import { z } from "zod";
import { Form, useLoaderData } from "@remix-run/react";

const ZSearch = z.object({
  client_id: z.string(),
  redirect_uri: z.string(),
  scope: z.string(),
  state: z.string(),
});

const ZFormData = z.object({
  id: z.string(),
  user_id: z.coerce.number(),
  search: z.preprocess((item) => ZSearch.parse(JSON.parse(z.string().parse(item))), ZSearch),
});

export async function action({ request }: ActionArgs) {
  // Create a record in ddb
  // --------------------------
  // This record will allow the mocked github apis to function correctly. The two apis that the created record
  // will facilitate are:
  // - https://github.com/login/oauth/access_token?code=<oauth_code_hash>
  // - https://api.github.com/user
  //
  // To get the access token an oauth state code will be passed that was created in the /auth/github/authorize route
  // of our app. This mocked api returns { access_token, token_type } responses. We will simply return the
  // oauth_state_code.id value as the { access_token }. We can use this to identify our authorization mock which will
  // use the { pk: `oauth_mock#<oauth_state_code.id>`, sk: `oauth_mock#<oauth_state_code.id>` }.
  //
  // The next api call to get the user will pass an Authorization header. This header will be in the format of a bearer
  // token. The access_code portion of the bearer token will contain the <oauth_state_code.id>, with this we can identify
  // this specific login interaction. Now, we have created a form on this web page where the user can select which
  // identity they want to sign in as. After selecting the preferred user and submitting the form we will create a ddb
  // record that stores the userId of the selected user:
  // Example - { pk: `oauth_mock#<oauth_state_code.id>`, sk: `oauth_mock#<oauth_state_code.id>`, userId: 1 }
  //
  // This mocked api can use the passed access_token (which is actually an oauth_mock id) and get the userId that should
  // be assumed.
  await logRequest(request);

  // get utilities
  const logger = getLogger();

  // get the form data
  logger.info("Parsing the form data ...");
  const data = await ZFormData.parseAsync(Object.fromEntries((await request.formData()) || {})).catch((e) => {
    logger.info("Failure: Did not recieve valid form data.");
    logger.info(e);
    throw e;
  });
  logger.info("Success: Parsed valid form data.");

  // create the ddb record
  logger.info("Creating the oauth_mock record in ddb ...");
  const ddb = await getDdbClient();
  const mockItem = await ddb.entities.oauthMock
    .update({ id: data.id, userId: data.user_id }, { returnValues: "ALL_NEW" })
    .then(async ({ Attributes }) => ZOAuthMock.parseAsync(Attributes))
    .catch((e) => {
      logger.info("Failure: Failed to create the oauth_mock record.");
      logger.info(e);
      throw e;
    });
  logger.info("Success: Created the oauth_mock record.");

  // redirect to /auth/github/callback
  const search = new URLSearchParams({ state: data.search.state, code: mockItem.id });
  return redirect(`/auth/github/callback?${search.toString()}`);
}

export async function loader({ request }: LoaderArgs) {
  await logRequest(request);

  // IMPORTANT!
  // ----------
  // If we are in a production environment, we do NOT want users to be able to access this mocked github oauth
  // expreience. We want this page to be invisible to public users, however, even if users found a way to get
  // to this page they authentication would fail in our callback response.
  const env = ZEnv.parse(process.env);
  if (env.STAGE === "prod") throw new Response(null, { status: 404, statusText: "Not Found" });

  // get the search params
  const url = new URL(request.url);
  const search = ZSearch.parse(Object.fromEntries(new URLSearchParams(url.search)));

  // get the id from the search.state
  const { id } = z.object({ id: z.string() }).parse(JSON.parse(search.state));

  // get the users
  const db = await getPgClient();
  const users = await db
    .selectFrom("users")
    .selectAll()
    .execute()
    .then(async (users) =>
      Promise.all(
        users.map(async (user) => {
          const roles = await db.selectFrom("user_roles").where("user_id", "=", user.id).selectAll().execute();
          return { ...user, roles: roles.map((role) => role.role_id) };
        })
      )
    );

  return json({ search, id, users });
}

export default function AuthorizeMock() {
  const { search, id, users } = useLoaderData<typeof loader>();

  return (
    <div className="grid w-full max-w-5xl py-6 px-4 gap-8">
      {/* Introduction */}
      <section className="grid max-w-3xl gap-3">
        <h1 className="text-5xl font-extrabold leading-snug text-slate-11">Github Mock</h1>
        <p className="text-blue-12">
          Click on one of the options to sign in, you can assume the person - or scenario for testing and development 😃
        </p>
      </section>
      {/* User Selection */}
      <Form method="post">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="search" value={JSON.stringify(search)} />
        <div className="flex flex-wrap gap-4">
          {users.map((user) => (
            <button
              className="h-48 w-48 bg-slate-3 rounded-md grid shadow-md focus-outline content-center hover:scale-105 hover:shadow-lg transition-all"
              key={user.id}
              name="user_id"
              value={user.id}
            >
              <h2>{user.name}</h2>
              <ul>
                {user.roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </Form>
    </div>
  );
}
