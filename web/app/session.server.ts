import { createSessionStorage } from "@remix-run/node";
import { sessionCookie } from "./cookies.server";

export const createDdbSessionStorage = () =>
  createSessionStorage({
    cookie: sessionCookie,
    async createData(data, expires) {
      return "";
    },
    async readData(id) {
      return {};
    },
    async updateData(id, data, expires) {},
    async deleteData(id) {},
  });
