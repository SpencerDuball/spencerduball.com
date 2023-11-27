import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import pg from "postgres";
// TODO: The @ts-ignore can be removed after the ms@3 is released. This is caused because of this bug:
// https://github.com/vercel/ms/pull/191
// @ts-ignore
import ms from "ms";
export function createClient(connectionString) {
    return new Kysely({
        dialect: new PostgresJSDialect({ postgres: pg(connectionString, { max: 1, idle_timeout: ms("5m") / 1000 }) }),
    });
}
