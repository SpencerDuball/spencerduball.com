import { Form, useLoaderData } from "@remix-run/react";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { logRequest } from "~/lib/util/utilities.server";
import { Config } from "sst/node/config";
import { pg } from "~/lib/util/utilities.server";
import { sql } from "kysely";
import { z } from "zod";
import * as Avatar from "@radix-ui/react-avatar";
import { Button } from "~/lib/ui/button";

const users = [
  {
    id: 1,
    username: "mamta_verma",
    name: "Mamta Verma",
    avatar_url:
      "https://dev-spencerduballcom-appstack-bucketd7feb781-uqu5hr97ecal.s3.amazonaws.com/mocks/users/1/avatar.png",
    github_url: "https://api.github.com/users/mamta_verma",
    roles: ["admin"],
  },
  {
    id: 2,
    username: "shiny_banana",
    name: "Shiny Banana",
    avatar_url:
      "https://dev-spencerduballcom-appstack-bucketd7feb781-uqu5hr97ecal.s3.amazonaws.com/mocks/users/2/avatar.png",
    github_url: "https://api.github.com/users/shiny_banana",
    roles: ["admin"],
  },
  {
    id: 3,
    username: "micro_flan",
    name: "Micro Flan",
    avatar_url:
      "https://dev-spencerduballcom-appstack-bucketd7feb781-uqu5hr97ecal.s3.amazonaws.com/mocks/users/3/avatar.png",
    github_url: "https://api.github.com/users/shiny_banana",
    roles: [],
  },
  {
    id: 4,
    username: "textured_tortoise",
    name: "Textured Toroise",
    avatar_url:
      "https://dev-spencerduballcom-appstack-bucketd7feb781-uqu5hr97ecal.s3.amazonaws.com/mocks/users/4/avatar.png",
    github_url: "https://api.github.com/users/textured_tortoise",
    roles: [],
  },
];

const ZSearch = z.object({ client_id: z.string(), redirect_uri: z.string(), scope: z.string(), state: z.string() });

export async function loader({ request }: LoaderFunctionArgs) {
  await logRequest(request);

  // IMPORTANT!
  // ----------
  // If we are in a production environment, we do NOT want users to be able to access this mocked github oauth
  // endpoint. We want this page to be invisible to public users. Also if we are in any other environment that
  // does not have MOCKS_ENABLED we want to hide this page.
  if (Config.STAGE === "prod" || Config.MOCKS_ENABLED !== "TRUE")
    throw new Response(null, { status: 404, statusText: "Not Found" });

  // Ensure Required Search Params
  // -----------------------------
  // This route should only ever be hit as a result of the redirect from "/auth/signin/github" so the parameters
  // should all exist. If these parameters don't exist, we want to redirect either to the redirect URL from the
  // state code, or back to "/". We could check for these items in the browser, but we have all the data we need
  // in the HTTP request. Plus it's easier to just redirect from here rather than hitting the database and sending
  // a 200 response.
  const url = new URL(request.url);
  const search = await ZSearch.parseAsync(Object.fromEntries(new URLSearchParams(url.search))).catch(() => {
    if (url.searchParams.has("redirect_uri")) throw redirect(url.searchParams.get("redirect_uri")!);
    else throw redirect("/");
  });

  // get the possible database users that the requester could assume
  // const users = await pg()
  //   .selectFrom("users")
  //   .leftJoin("user_roles", "users.id", "user_roles.user_id")
  //   .select([
  //     "id",
  //     "username",
  //     "name",
  //     "avatar_url",
  //     "github_url",
  //     // sql<string[]>`coalesce(array_agg(user_roles.role_id) filter (where user_roles.role_id is not null), '{}')`.as(
  //     sql<string[]>`array_remove(array_agg(user_roles.role_id), NULL)`.as("roles"),
  //   ])
  //   .groupBy("users.id")
  //   .execute();
  // users.sort((a, b) => a.id - b.id);

  return { users, search };
}

export default function Authorize() {
  const { users, search } = useLoaderData<typeof loader>();

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
        <span>{JSON.stringify(users)}</span>
        <span>{JSON.stringify(search)}</span>
        {/* User Selection */}
        <Form method="post">
          <input type="hidden" name="search" value={JSON.stringify(search)} />
          <div className="flex flex-wrap gap-4">
            {users.map((user) => (
              <div
                key={user.id.toString()}
                className="p-4 bg-slate-2 border-slate-6 shadow-md rounded-md hover:scale-105 hover:shadow-lg transition-all grid grid-flow-col gap-4 w-80 auto-cols-max"
              >
                <Avatar.Root className="text-md relative flex h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-full ">
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
                  <Button type="submit" colorScheme="slate" size="xs">
                    Sign In
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Form>
      </div>
    </main>
  );
}
