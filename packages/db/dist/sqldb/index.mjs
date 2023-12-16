import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
export function createClient(url, authToken) {
    return new Kysely({ dialect: new LibsqlDialect({ url, authToken }) });
}
