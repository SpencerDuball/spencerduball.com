import { createSessionStorage } from "@remix-run/node";
import { sessionCookie } from "./cookies.server";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { Table, ZSession } from "table";

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
      console.log(data);
      if (ZSession.pick({ user_id: true }) && expires) {
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
