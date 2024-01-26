import SQLite from "better-sqlite3";
import fs from "fs-extra";
import { FileMigrationProvider, Kysely, Migrator, SqliteDialect } from "kysely";
import ora from "ora";
import path from "path";
import { z } from "zod";
import url from "url";
import * as dotenv from "dotenv";

// esmodule fix for __filename and __dirname
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define constants
const SCRIPTS_DIR = path.resolve(__dirname, "..", "..");
const ROOT_DIR = path.resolve(SCRIPTS_DIR, "..");

// setup environment variables
dotenv.config({ path: path.resolve(SCRIPTS_DIR, ".env.local") });

/**
 * Applies all migrations up to the latest migration.
 */
export async function migrate() {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const DATABASE_URL = z.string().catch(path.resolve(ROOT_DIR, "sqlite.db")).parse(process.env.DATABASE_URL);
  fs.ensureDirSync(path.dirname(DATABASE_URL));
  const db = new Kysely({ dialect: new SqliteDialect({ database: new SQLite(DATABASE_URL) }) });

  // apply the migrations
  const migrationFolder = path.resolve(SCRIPTS_DIR, "migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const { error, results } = await migrator.migrateToLatest();
  spinner.stop();

  // process the results
  results?.forEach((it) => {
    spinner = ora(`Applying migration ${it.migrationName} ...`);
    if (it.status === "Success") spinner.succeed(`Applied migration ${it.migrationName} successfully!`);
    else if (it.status === "Error") spinner.fail(`Error applying ${it.migrationName}.`);
    else if (it.status === "NotExecuted")
      spinner.fail(`Migrations not executed due to prior error ${it.migrationName}.`);
  });

  if (error) {
    console.error(`Failed to migrate.`, error);
    await db.destroy();
    process.exit(1);
  }

  // close the connection
  await db.destroy();

  ora().succeed("All migrations applied successfully!");
}
