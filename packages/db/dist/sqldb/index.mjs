import { Kysely, SqliteAdapter, DummyDriver, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
export function createClient(url, authToken) {
    return new Kysely({ dialect: new LibsqlDialect({ url, authToken }) });
}
export const db = new Kysely({
    dialect: {
        createAdapter: () => new SqliteAdapter(),
        createDriver: () => new DummyDriver(),
        createIntrospector: (db) => new SqliteIntrospector(db),
        createQueryCompiler: () => new SqliteQueryCompiler(),
    },
});
