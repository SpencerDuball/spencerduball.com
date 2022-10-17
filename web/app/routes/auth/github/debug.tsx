import type { LoaderFunction } from "@remix-run/node";
import { json, createSession } from "@remix-run/node";
import { sessionCookie } from "~/cookies.server";
import { createSessionStorage } from "@remix-run/node";

export const createDdbSessionStorage = () =>
  createSessionStorage({
    cookie: sessionCookie,
    async createData(data, expires) {
      console.log("createData - data: ", data);
      console.log("createData - expires: ", expires);
      return "new-id";
    },
    async readData(id) {
      console.log("readData - id: ", id);
      return {};
    },
    async updateData(id, data, expires) {
      console.log("updateData - id: ", id);
      console.log("updateData - data: ", data);
      console.log("updateData - expires: ", expires);
    },
    async deleteData(id) {
      console.log("deleteData - id: ", id);
    },
  });

const { getSession, commitSession, destroySession } = createDdbSessionStorage();

export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionCookie.serialize("12345", { domain: new URL(request.url).origin });

  const expires = new Date(Date.now());
  const newSession = createSession({ user_id: "sup" });
  const sessString = await commitSession(newSession, { expires });

  return json({
    session,
    commitSession: await sessionCookie.parse(sessString),
    createSession: createSession({ user_id: "sup" }),
  });
};
