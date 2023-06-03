import arg from "arg";
import prompts from "prompts";
import pg from "pg";
import { Config } from "sst/node/config";
import { z } from "zod";
import { Kysely, FileMigrationProvider, Migrator, PostgresDialect, sql } from "kysely";
import fs from "fs/promises";
import path from "path";

// --------------------------------------------------------------------------------------------------------------------
// Define All Actions
// --------------------------------------------------------------------------------------------------------------------

/** Applies all (or the remaining) migrations. */
async function migrate() {
  // create the connection
  const db = new Kysely({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: Config.DATABASE_URL, max: 1 }) }),
  });

  // create the migrator
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });

  // migrate to latest
  const { error, results } = await migrator.migrateToLatest();
  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error(`Failed to migrate.`);
    console.error(error);
    process.exit(1);
  }

  // close the db connection
  await db.destroy();
}

/** Applies the next migration in the list. */
async function migrateUp() {
  // TODO: Need to implement stepping up a migrations.
}

/** Removes the last migration in the list. */
async function migrateDown() {
  // TODO: Need to implement stepping down a migration.
}

/** Returns the status of the current migration. */
async function migrateStatus() {
  // TODO: Need to implement getting migration status.
}

/** Purges all data from all tables in the database, the tables themselves will still exist. */
async function purge() {
  // create the connection
  const db = new Kysely({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: Config.DATABASE_URL, max: 1 }) }),
  });

  // get the tablenames to truncate
  const tablenames =
    await sql<any>`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'kysely_%'`
      .execute(db)
      .then(({ rows }) => rows.map(({ tablename }) => tablename));

  // truncate the tables
  for await (let tablename of tablenames) await sql`TRUNCATE TABLE ${tablename} CASCADE`.execute(db);

  // TODO: Remove all items from the S3 bucket

  // close the db connection
  await db.destroy();
}

/** Clears the entire database including migration tables. */
async function clear() {
  // create the connection
  const db = new Kysely({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: Config.DATABASE_URL, max: 1 }) }),
  });

  // get the tablenames to drop
  const tablenames = await sql<any>`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`
    .execute(db)
    .then(({ rows }) => rows.map(({ tablename }) => tablename));

  // TODO: Remove all items from the S3 bucket

  // close the db connection
  await db.destroy();
}

/** Loads the seed data into the db. */
async function seed() {
  // TODO: Need to implement the seeding.
}

/** Runs migrate and seed into the db. */
async function setup() {
  await migrate();
  await seed();
}

/** Runs clear, then setup for the db. */
async function reset() {
  await clear();
  await setup();
}

// --------------------------------------------------------------------------------------------------------------------
// Create Main
// --------------------------------------------------------------------------------------------------------------------
const AvailableActions = [
  "migrate",
  "migrate:up",
  "migrate:down",
  "migrate:status",
  "purge",
  "clear",
  "seed",
  "setup",
  "reset",
] as const;

async function main() {
  // collect the type of database action
  const { _: argv } = arg({});
  const action = await z
    .enum(AvailableActions)
    .parseAsync(argv[0])
    .catch(() => {
      console.log(`Please choose an available action to run: ${AvailableActions}`);
      process.exit();
    });

  // if running on "prod" confirm this action with the user
  if (Config.STAGE === "prod") {
    const { shouldRunOnProd } = await prompts({
      type: "text",
      name: "shouldRunOnProd",
      message:
        "You are attempting to run this action on the production database, please type 'I am fasho dawg' to confirm:",
    });
    if (shouldRunOnProd === "I am fasho dawg") {
      console.log("Aborted the action attempted for the production database.");
    }
  }

  // perform the action
  if (action === "migrate") {
    console.log("Applying migrations ...");
    await migrate();
    console.log("Success! Applied migrations.");
  } else if (action === "migrate:up") {
    console.log("Migrating up ...");
    await migrateUp();
    console.log("Success! Successfully stepped up a migrations.");
  } else if (action === "migrate:down") {
    console.log("Migrating down ...");
    await migrateDown();
    console.log("Success! Successfully stepped down a migration.");
  } else if (action === "migrate:status") {
    console.log("Getting migration status ...");
    await migrateStatus();
    console.log("Success! Successfully retrieved migration status.");
  } else if (action === "purge") {
    console.log("Purging all data from all tables ...");
    await purge();
    console.log("Success! Purged all data from all tables.");
  } else if (action === "clear") {
    console.log("Clearing all tables (including migration tables) from the database ...");
    await clear();
    console.log("Success! Cleared all tables from the database.");
  } else if (action === "seed") {
    console.log("Applying seed data to the database ...");
    await seed();
    console.log("Success! Applied seed data to the database.");
  } else if (action === "setup") {
    console.log("Applying migrations and seeding the database ...");
    await setup();
    console.log("Sucecss! Database has been setup successfully.");
  } else if (action === "reset") {
    console.log("Clearing, migrating, and seeding the database ...");
    await reset();
    console.log("Success! The database has been reset.");
  }
}

main();
