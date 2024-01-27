import { Kysely, SqliteDialect } from "kysely";
import { z } from "zod";
import url from "url";
import path from "path";
import fs from "fs-extra";
import SQLite from "better-sqlite3";

// esmodule fix for __filename and __dirname
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define constants
export const ROOT_DIR = path.resolve(__dirname, "..", "..", "..");
export const SCRIPTS_DIR = path.resolve(ROOT_DIR, "scripts");

export interface ScriptInput {
  /** The Kysely client for executing SQL commands. */
  db: Kysely<any>;
}

/**
 * Creates a database connection.
 *
 * @returns The Kysely database connection.
 */
export function getDbClient() {
  const LOCAL_DEV_DATABASE_URL = "app/sqlite.db";
  const DATABASE_URL = z.string().catch(LOCAL_DEV_DATABASE_URL).parse(process.env.DATABASE_URL);
  fs.ensureDirSync(path.dirname(DATABASE_URL));
  return new Kysely({ dialect: new SqliteDialect({ database: new SQLite(DATABASE_URL) }) });
}
