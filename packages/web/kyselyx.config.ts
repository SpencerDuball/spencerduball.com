import { IConfigFile } from "kyselyx";
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";

if (!process.env.LIBSQL_URL) throw new Error("LIBSQL_URL environment variable is required.");

const config: IConfigFile = {
  db: new Kysely({ dialect: new LibsqlDialect({ url: process.env.LIBSQL_URL }) }),
};

export default config;
