import { createSessionStorage, redirect } from "@remix-run/node";
import { sessionCookie } from "~/cookies.server";
import DynamoDB from "aws-sdk/clients/dynamodb";
import type { UserType } from "table";
import { Table, ZSession, ZUser } from "table";
import type { StringEnum } from "~/ts-utils";

// check for required environment variables
if (!process.env.REGION) throw new Error("'REGION' env-var is not defined.");
if (!process.env.TABLE_NAME) throw new Error("'TABLE_NAME' env-var is not defined.");

// create the aws-sdk clients
const ddbClient = new DynamoDB.DocumentClient({ region: process.env.REGION });
const table = new Table({ tableName: process.env.TABLE_NAME, client: ddbClient });

export const createDdbSessionStorage = () =>
  createSessionStorage({
    cookie: sessionCookie,
    async createData(data, expires) {
      if (ZSession.pick({ user_id: true }).parse(data) && expires) {
        const session = await table.entities.session
          .update({ user_id: data.user_id, ttl: Math.round(expires.getDate() / 1000) }, { returnValues: "ALL_NEW" })
          .then(({ Attributes }) => ZSession.parse(Attributes));
        return session.id;
      } else throw new Error("Incorrect parameters to create user session.");
    },
    async readData(id) {
      return await table.entities.session
        .get({ pk: `session#${id}`, sk: `session#${id}` })
        .then(({ Item }) => ZSession.parse(Item));
    },
    async updateData(id, data, expires) {
      const ttl = expires ? Math.round(expires.getDate() / 1000) : undefined;
      await table.entities.session.update({ ...ZSession.parse(data), ttl, pk: `session#${id}`, sk: `session${id}` });
    },
    async deleteData(id) {
      await table.entities.session.delete({ pk: `session#${id}`, sk: `session#${id}` });
    },
  });

export const { getSession, commitSession, destroySession } = createDdbSessionStorage();

/**
 * Gets the user from the session cookie attached to the request. If user does not exist will return null.
 *
 * @param request The request object.
 * @returns User or null
 */
export async function getUser(request: Request): Promise<UserType | null>;
/**
 * Gets the user from the session cookie attached to the request. If the user does not exist it will redirect the
 * user to Github to authenticate. After signing in the user will be redirected back to this url.
 *
 * @param request The request object
 * @param type "required"
 * @param type
 */
export async function getUser(request: Request, type: "required"): Promise<UserType>;
export async function getUser(request: Request, type?: StringEnum<"required">): Promise<UserType | null> {
  // collect info for redirect
  const redirect_uri = new URL(`${new URL(request.url).origin}/auth/github/authorize`);
  redirect_uri.searchParams.set("redirect_uri", request.url);

  // get the session
  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.id) {
    if (type && type === "required") throw redirect(redirect_uri.toString());
    else return null;
  }

  // get the user
  const user = await table.entities.user
    .get({ pk: `user#${session.data.user_id}`, sk: `user#${session.data.user_id}` })
    .then(({ Item }) => ZUser.parse(Item))
    .then((user) => ({
      ...user,
      roles: user.roles ? user.roles : [],
      permissions: user.permissions ? user.permissions : [],
    }))
    .catch(() => null);

  // return the user
  if (!user) throw redirect(redirect_uri.toString());
  else return user;
}
