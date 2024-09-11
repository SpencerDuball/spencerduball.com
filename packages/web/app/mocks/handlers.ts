import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { http, HttpResponse } from "msw";
import { z, ZodError } from "zod";
import { ZEnv } from "~/util";
import { db } from "~/util/server";
import { sql } from "kysely";

// -------------------------------------------------------------------------------------
// Generate Mock Data
// -------------------------------------------------------------------------------------

faker.seed(70487); // seed for predictable randomness, can be any number

/**
 * Generates a random Github user.
 *
 * This factory generates a random Github user that would be returned from the Github
 * API with the "user" scope.
 */
function userFactory() {
  const githubAvatar = faker.image.avatarGitHub();

  const githubId = parseInt(/(?<github_id>\d+)$/.exec(githubAvatar)!.groups!.github_id);

  const first = faker.person.firstName();
  const last = faker.person.lastName();

  const id = githubId;
  const login = `${first}_${last}`;
  const name = `${first} ${last}`;
  const avatar_url = githubAvatar;
  const html_url = `https://github.com/${login}`;

  return { id, login, name, avatar_url, html_url };
}

const users = Array.from({ length: 10 }, userFactory);

// -------------------------------------------------------------------------------------
// Create Request Handlers
// -------------------------------------------------------------------------------------

const ZFormData = z.object({ client_id: z.string(), client_secret: z.string(), code: z.string() });

export const handlers = [
  http.post("https://github.com/login/oauth/access_token", async ({ request }) => {
    const Env = ZEnv.parse(process.env);

    // Parse the Form Data
    // ---------------------------------------------------------------------------------
    // The request should be a POST request with the following form data:
    // - client_id: The client ID provided by Github.
    // - client_secret: The client secret provided by Github.
    // - code: The code received from the Github OAuth flow.
    let data: z.infer<typeof ZFormData>;
    try {
      console.log("Parsing the form data ...");
      data = ZFormData.parse(Object.fromEntries(await request.formData()));
      console.log("Success: Parsed valid form data.");
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(e, "Failure: Did not receive valid form data.");
        return HttpResponse.json({ message: e.message }, { status: 400 });
      } else {
        console.log(e, "Failure: An unexpected error has occurred.");
        return HttpResponse.json({ message: "Oops! Looks like an error from our end." }, { status: 500 });
      }
    }

    // Check for Accept Header
    // ---------------------------------------------------------------------------------
    // If a header of 'Accept: application/json' is not present, return a 406 status code.
    // This is to ensure that the client is expecting a JSON response.
    console.log("Checking for 'Accept' header ...");
    if (request.headers.get("Accept") !== "application/json") {
      console.log(request.headers, "Failure: 'Accept: application/json' header is required.");
      return HttpResponse.json({ message: "The 'Accept: application/json' header is required." }, { status: 406 });
    }
    console.log("Success: Found 'Accept' header.");

    // Validate the Request Content
    // ---------------------------------------------------------------------------------
    // To validate the request is valid we need to ensure that the passed client_id and
    // client_secret match the ones provided by the environment variables. Next we will
    // check the OTC code is valid.

    // 1. Confirm server credentials
    console.log("Checking client_id and client_secret ...");
    if (Env.GITHUB_CLIENT_ID !== data.client_id || Env.GITHUB_CLIENT_SECRET !== data.client_secret) {
      console.log("Error: Invalid 'client_id' or 'client_secret'.");
      return new HttpResponse(null, { status: 401 });
    }
    console.log("Success: Valid 'client_id' and 'client_secret'.");

    // 2. Confirm OTC code
    console.log("Checking OTC code ...");
    const otc = await db
      .selectFrom("mock_gh_otcs")
      .selectAll()
      .where("id", "=", data.code)
      .where("expires_at", ">", sql<string>`(datetime('now'))`)
      .executeTakeFirstOrThrow()
      .catch((e) => {
        console.log(e, "Error: Invalid OTC code.");
        return new HttpResponse(null, { status: 401 });
      });
    if (otc instanceof HttpResponse) return otc;
    console.log("Success: Valid OTC code.");

    // 3. Create and Return Access Token
    console.log("Creating access token ...");
    const accessToken = await db
      .insertInto("mock_gh_access_tokens")
      .values({ id: randomUUID(), scope: otc.scope, user_id: otc.github_id })
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((e) => {
        console.log(e, "Error: Failed to create access token.");
        return new HttpResponse(null, { status: 500 });
      });
    if (accessToken instanceof HttpResponse) return accessToken;

    return HttpResponse.json({ access_token: accessToken.id, scope: accessToken.scope, token_type: "Bearer" });
  }),

  http.get("https://api.github.com/user", async ({ request }) => {
    // Ensure Required Authorization Header
    // ---------------------------------------------------------------------------------
    // The request should be called with a bearer token in the Authorization header.
    // This bearer token needs to be the access_token generated in the call to
    // 'https://github.com/login/oauth/access_token'.
    console.log("Checking for 'Authorization' header ...");
    const authHeader = /(?<type>(b|B)earer)\s+(?<token>[\w-]+)/.exec(request.headers.get("Authorization") || "");
    const [authType, authToken] = [authHeader?.groups?.type, authHeader?.groups?.token];
    if (!authType || !authToken) {
      console.log("Error: Missing 'Authorization' header.");
      return new HttpResponse(null, { status: 401 });
    }
    console.log("Success: Found 'Authorization' header.");

    // Ensure Access Token is Valid
    // ---------------------------------------------------------------------------------
    console.log("Checking access_token token ...");
    const accessToken = await db
      .selectFrom("mock_gh_access_tokens")
      .selectAll()
      .where("id", "=", authToken)
      .where("expires_at", ">", sql<string>`(datetime('now'))`)
      .executeTakeFirstOrThrow()
      .catch((e) => {
        console.log(e, "Error: Invalid access_token.");
        return new HttpResponse(null, { status: 401 });
      });
    if (accessToken instanceof HttpResponse) return accessToken;
    console.log("Success: Valid access_token.");

    // Get User Data
    // ---------------------------------------------------------------------------------
    // Now that access token is found and validated, we can get the github_id from the
    // token and return the user data. The user could be either in the database or not
    // so we will check for the database users first.

    // check database
    let user = await db
      .selectFrom("users")
      .selectAll()
      .where("github_id", "=", accessToken.user_id)
      .executeTakeFirstOrThrow()
      .then((u) => {
        return {
          id: u.github_id,
          login: u.username,
          name: u.name,
          avatar_url: u.avatar_url,
          html_url: u.github_url,
        };
      })
      .catch(() => null);

    // check mock users
    if (user === null) user = users.find((u) => u.id === accessToken.user_id) || null;

    // return if can't be found
    if (!user) {
      console.log("Error: User not found.");
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  http.get("https://github.com/mock/users", () => HttpResponse.json(users)),
];
