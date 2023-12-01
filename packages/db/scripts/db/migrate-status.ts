import { Kysely, Migrator, FileMigrationProvider, sql, MigrationInfo } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import pg from "postgres";
import ora, { Ora } from "ora";
import { Config } from "sst/node/config";
import path from "path";
import fs from "fs-extra";

/**
 * Clears all tables from the database.
 */
async function main() {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  const db = new Kysely({
    dialect: new PostgresJSDialect({ postgres: pg(Config.DATABASE_URL, { idle_timeout: 30 }) }),
  });

  // create the migrator
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = await migrator.getMigrations();
  spinner.stop();

  // collect a snapshot of the migration info
  let lastAppliedMigration: MigrationInfo | undefined = undefined;
  let totalAppliedMigrations = 0;
  for (let migration of migrations) {
    if (migration.executedAt !== undefined) {
      lastAppliedMigration = migration;
      totalAppliedMigrations = totalAppliedMigrations + 1;
    }
  }

  // display the information
  let statusLine = [
    `Total Migrations: ${migrations.length}`,
    `Applied Migrations: ${totalAppliedMigrations}`,
    `Last Migration: ${lastAppliedMigration?.name || "NONE"}`,
  ].join("     ");
  console.log(statusLine);
  console.log(Array(statusLine.length).fill("-").join(""));

  for (let migration of migrations) {
    if (migration.executedAt !== undefined) ora(`Migration ${migration.name} applied`).start().succeed();
    else ora(`Migration ${migration.name} not applied.`).start().fail();
  }

  // close the db connection
  await db.destroy();
}

main();
