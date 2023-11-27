import fs from "fs-extra";
import { Kysely, Migrator, FileMigrationProvider } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import path from "path";
import { Config } from "sst/node/config";
import pg from "postgres";
import ora from "ora";

/**
 * Applies all migrations to the database.
 */
async function main() {
  // create the connection
  const connect = ora("Connecting to the database ...").start();
  const db = new Kysely<any>({
    dialect: new PostgresJSDialect({ postgres: pg(Config.DATABASE_URL, { idle_timeout: 30 }) }),
  });

  // apply the migrations
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const { error, results } = await migrator.migrateToLatest();
  connect.stop();

  // process the results
  results?.forEach((it) => {
    const spinner = ora(`Applying migration ${it.migrationName} ...`);
    if (it.status === "Success") spinner.succeed(`Applied migration ${it.migrationName} successfully!`);
    else if (it.status === "Error") spinner.fail(`Error applying ${it.migrationName}.`);
    else if (it.status === "NotExecuted") spinner.fail(`Migration not executed due to prior error ${it.migrationName}`);
  });

  if (error) {
    console.error(`Failed to migrate.`);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }

  // close the db connection
  await db.destroy();
}

main();
