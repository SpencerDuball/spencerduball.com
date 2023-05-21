import { createSessionStorage, redirect, createCookie } from "@remix-run/node";
import { ZSession, SessionType } from "@spencerduballcom/ddb";
import { getDdbClient, getLogger } from "~/lib/util.server";
import { AutoCompleteString } from "~/lib/util";
import ms from "ms";

// "__session" cookie
const __session = createCookie("__session", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: true,
  expires: new Date(new Date().getTime() + ms("90d")),
});

const createDdbSessionStorage = () =>
  createSessionStorage({
    cookie: __session,
    async createData(data, expires) {
      console.log(data, expires);
      // get utilities
      const logger = getLogger();
      const ddb = await getDdbClient();

      const session = await ZSession.pick({
        userId: true,
        username: true,
        name: true,
        avatarUrl: true,
        githubUrl: true,
        roles: true,
      })
        .parseAsync(data)
        .then(async (data) => {
          // ensure there is a valid 'expires' session
          if (!expires) {
            logger.error("Session cannot be created without a valid 'expires' time.");
            const msg = "Error creating the user session, please try again after awhile.";
            throw msg;
          }

          // create the user session
          logger.info("Creating the user session in the database ...");
          const session = await ddb.entities.session
            .update({ ...data, ttl: Math.round(expires.getTime() / 1000) }, { returnValues: "ALL_NEW" })
            .then(async ({ Attributes }) =>
              ZSession.parseAsync(Attributes).catch((e) => {
                logger.error("There was an issue creating the session.");
                logger.error(e);
                const msg = "Error creating the user session, please try again after awhile.";
                throw msg;
              })
            );
          logger.info("Success: Created the user session in the database.");

          return session;
        });

      return session.id;
    },
    async readData(id) {
      // get utilities
      const logger = getLogger();
      const ddb = await getDdbClient();

      // get the session info
      logger.info("Retrieving the session info from the database ...");
      const info = await ddb.entities.session.get({ pk: `session#${id}`, sk: `session#${id}` }).then(({ Item }) => {
        const currentTimeInSeconds = new Date(Date.now()).getTime() / 1000;
        if (!Item || (Item && Item.ttl < currentTimeInSeconds)) {
          logger.info("The current session is expired.");
          return null;
        }

        return ZSession.parseAsync(Item).catch((e) => {
          logger.error("The session was not of the expected format.");
          logger.error(e);
          throw e;
        });
      });
      logger.info("Success: Retrieved the session info from the database.");

      return info;
    },
    async updateData(id, data, expires) {
      // get utilities
      const logger = getLogger();
      const ddb = await getDdbClient();

      if (expires) {
        const ttl = Math.round(expires.getTime() / 1000);
        await ddb.entities.session
          .update({ ...ZSession.parse(data), ttl, pk: `session#${id}`, sk: `session#${id}` })
          .catch((e) => {
            logger.error("There was an issue updating the session.");
            logger.error(e);
            const msg = "Error updating the user session, please try again after awhile.";
            throw msg;
          });
      } else {
        logger.error("Session cannot be upated without a valid 'expires' time.");
        const msg = "Error updating the user session, please try again after awhile.";
        throw msg;
      }
    },
    async deleteData(id) {
      // get utilities
      const logger = getLogger();
      const ddb = await getDdbClient();

      await ddb.entities.session.delete({ pk: `session#${id}`, sk: `session#${id}` }).catch((e) => {
        logger.error("There was an issue deleting the session.");
        logger.error(e);
        const msg = "Error deleting the user session, please try again after awhile.";
        throw msg;
      });
    },
  });

const { getSession, commitSession, destroySession } = createDdbSessionStorage();

/**
 * Gets the session info from the session cookie attached to the request. If session does not exist will return null.
 *
 * @param request The request object.
 * @returns User or null
 */
async function getSessionInfo(request: Request): Promise<SessionType | null>;
/**
 * Gets the session info from the session cookie attached to the request. If the session does not exist it will redirect the
 * user to Github to authenticate. After signing in the user will be redirected back to the url they are attempting to visit.
 *
 * @param request The request object
 * @param type "required"
 * @param type
 */
async function getSessionInfo(request: Request, type: "required"): Promise<SessionType>;
async function getSessionInfo(request: Request, type?: AutoCompleteString<"required">): Promise<SessionType | null> {
  // collect info for login redirect
  const loginUri = new URL(`${new URL(request.url).origin}/auth/github/authorize`);
  loginUri.searchParams.set("redirect_uri", request.url);

  // request the session from db
  const req = await getSession(request.headers.get("cookie")).then(({ data }) => ZSession.safeParse(data));

  // send user repsonse
  if (req.success) return req.data;
  else {
    if (type && type === "required") throw redirect(loginUri.toString());
    else return null;
  }
}

export { __session, getSession, commitSession, destroySession, getSessionInfo };
