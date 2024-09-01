import { IConfigFile } from "kyselyx";
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";

if (!process.env.LIBSQL_URL) throw new Error("LIBSQL_URL environment variable is required.");

export interface IKyselyxSources {
  db: Kysely<any>;
}

export const config: IConfigFile<IKyselyxSources> = {
  sources: { db: new Kysely({ dialect: new LibsqlDialect({ url: process.env.LIBSQL_URL }) }) },
};
