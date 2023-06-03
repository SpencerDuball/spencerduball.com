import { setupServer } from "msw/node";
import { rest } from "msw";
import { z } from "zod";
import { getDdbClient, getLogger, getPgClient } from "~/lib/util.server";
import { ZOAuthMock } from "@spencerduballcom/db/ddb";

const handlers = [
  rest.post("https://github.com/login/oauth/access_token", async (req, res, ctx) => {
    // get utilities
    const logger = getLogger();

    // get the mockId from the post object
    logger.info("Checking request for code ...");
    const ZReq = z.object({ client_id: z.string(), client_secret: z.string(), code: z.string() });
    const { code: mockId } = await ZReq.parseAsync(await req.json()).catch((e) => {
      logger.info("Failure: Code could not be retrieved.");
      logger.info(e);
      throw e;
    });
    logger.info("Success: Retrieved code successfully.");

    // we will return the { access_code, token_type }
    return res(ctx.status(200), ctx.json({ token_type: "bearer", access_token: mockId, scope: "user" }));
  }),
  rest.get("https://api.github.com/user", async (req, res, ctx) => {
    // get utilities
    const logger = getLogger();
    const ddb = await getDdbClient();
    const db = await getPgClient();

    // get the mockId from the Authorization header
    if (!req.headers.get("Authorization")) return res(ctx.status(400));
    const [, mockId] = req.headers.get("Authorization")!.split(" ");

    // get the oauth mock
    logger.info("Getting the oauth_mock record ...");
    const { userId } = await ddb.entities.oauthMock
      .get({ pk: `oauth_mock#${mockId}`, sk: `oauth_mock#${mockId}` })
      .then(({ Item }) => ZOAuthMock.parseAsync(Item))
      .catch((e) => {
        logger.info("Failure: Could not retrieve the oauth_mock record.");
        logger.info(e);
        throw e;
      });
    logger.info("Success: Retrieved the oauth_mock record.");

    // get the user
    logger.info("Getting the user from the database ...");
    const user = await db
      .selectFrom("users")
      .where("users.id", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow()
      .catch((e) => {
        logger.info("Failure: Could not retrieve the user.");
        logger.info(e);
        throw e;
      });
    logger.info("Failure: Could not retrieve the user from db.");

    // transform our database result to the expected github response
    const userGithubFormat = {
      id: user.id,
      login: user.username,
      name: user.name,
      avatar_url: user.avatar_url,
      html_url: user.github_url,
    };

    return res(ctx.status(200), ctx.json(userGithubFormat));
  }),
];

export const authMocks = () => setupServer(...handlers).listen({ onUnhandledRequest: "bypass" });
