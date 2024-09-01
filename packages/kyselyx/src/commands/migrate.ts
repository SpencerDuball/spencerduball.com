import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { Migrator, MigrationInfo, FileMigrationProvider } from "kysely";
import { getConfig } from "../utilities/config.js";

const MIGRATION_TABLE_NAME = "kyselyx_migration";
const MIGRATION_LOCK_TABLE_NAME = "kyselyx_migration_locks";
const kyselyxTableNames = {
  migrationTableName: MIGRATION_TABLE_NAME,
  migrationLockTableName: MIGRATION_LOCK_TABLE_NAME,
};

const template = [
  `import { Kysely, sql } from "kysely";`,
  ``,
  `async function up(db: Kysely<any>): Promise<void> {}`,
  ``,
  `async function down(db: Kysely<any>): Promise<void> {}`,
  ``,
  `export { up, down };`,
].join("\n");

// -------------------------------------------------------------------------------------------------
// Define Script Functions
// -------------------------------------------------------------------------------------------------

/**
 * Applies all migrations up to the latest migration.
 */
export async function migrate() {
  const spinner = ora("Connecting to the database ...").start();
  const {
    sources: { db },
    migrationFolder: fld,
  } = getConfig();
  spinner.stopAndPersist({ text: "" });

  // apply the migrations
  const migrationFolder = path.resolve(fld);
  if (!fs.existsSync(migrationFolder)) {
    spinner.fail(`Migration folder not found: ${migrationFolder}`);
    process.exit(1);
  }
  const provider = new FileMigrationProvider({ fs, path, migrationFolder });
  const migrator = new Migrator({ db, provider, ...kyselyxTableNames });
  const { error, results } = await migrator.migrateToLatest();

  // process the results
  results?.forEach((it) => {
    if (it.status === "Success") spinner.succeed(`Applied migration ${it.migrationName} successfully!`);
    else if (it.status === "Error") spinner.fail(`Error applying ${it.migrationName}.`);
    else if (it.status === "NotExecuted")
      spinner.fail(`Migrations not executed due to prior error ${it.migrationName}.`);
  });

  // close the database connection
  await db.destroy();

  if (error) {
    spinner.fail(`Failed to migrate.`);
    console.error(error);
    process.exit(1);
  } else {
    spinner.succeed("All migrations applied successfully.");
  }
}

/**
 * Retrieves the status of all migrations available and displays which migrations
 * have been applied, and which have not.
 */
export async function status() {
  const spinner = ora("Connecting to the database ...").start();
  const {
    sources: { db },
    migrationFolder: fld,
  } = getConfig();

  // get the migrations
  const migrationFolder = path.resolve(fld);
  if (!fs.existsSync(migrationFolder)) {
    spinner.fail(`Migration folder not found: ${migrationFolder}`);
    process.exit(1);
  }
  const provider = new FileMigrationProvider({ fs, path, migrationFolder });
  const migrator = new Migrator({ db, provider, ...kyselyxTableNames });
  const migrations = await migrator.getMigrations();
  spinner.stop();

  // collect a snapshot of the migration info
  let lastAppliedMigration: MigrationInfo | null = null;
  let totalAppliedMigrations = 0;
  for (let migration of migrations) {
    if (migration.executedAt !== undefined) {
      lastAppliedMigration = migration;
      totalAppliedMigrations++;
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
    if (migration.executedAt) spinner.succeed(`Migration ${migration.name} applied.`);
    else spinner.fail(`Migration ${migration.name} not applied.`);
  }

  // close the database connection
  await db.destroy();
}

/**
 * Undoes the last migration or a specific migration if a name is provided.
 *
 * @param name The name of the migration to undo.
 */
export async function undo(name?: string) {
  const spinner = ora("Connecting to the database ...").start();
  const {
    sources: { db },
    migrationFolder: fld,
  } = getConfig();

  const migrationFolder = path.resolve(fld);
  if (!fs.existsSync(migrationFolder)) {
    spinner.fail(`Migration folder not found: ${migrationFolder}`);
    process.exit(1);
  }
  const provider = new FileMigrationProvider({ fs, path, migrationFolder });
  const migrator = new Migrator({ db, provider, ...kyselyxTableNames });
  const migrations = await migrator.getMigrations();
  spinner.stop();

  // Get the total applied migrations
  let totalAppliedMigrations = 0;
  for (let migration of migrations) migration.executedAt !== undefined && totalAppliedMigrations++;

  // If no name is provided, undo the last migration. If a name is provided,
  // undo all migrations including the specified migration.
  if (!name) {
    if (totalAppliedMigrations === 0) {
      spinner.fail(`Can't undo a migration because no migrations have been applied.`);
      process.exit(1);
    }

    // undo the last migration
    spinner.text = `Undoing last migration ...`;
    spinner.start();
    const { error, results } = await migrator.migrateDown();

    if (error || results === undefined) {
      spinner.fail(`Failed to undo last migration.`);
      if (error) console.error(error);
      process.exit(1);
    }

    for (let result of results) {
      if (result.status === "Success") {
        spinner.succeed(`Successful undo of migration ${result.migrationName}.`);
      } else {
        spinner.fail(`Failed to undo migration ${result.migrationName}.`);
      }
    }
  } else {
    // Find the migration to undo
    const migrationToUndo = migrations.find((m) => m.name === name) ?? null;
    if (migrationToUndo === null) {
      spinner.fail(`Migration ${name} not found.`);
      process.exit(1);
    } else if (migrationToUndo.executedAt === undefined) {
      spinner.fail(`Migration ${name} has not been applied.`);
      process.exit(1);
    }

    // Undo the migration
    spinner.text = `Undoing migration ${name} ...`;
    spinner.start();
    const { error, results } = await migrator.migrateTo(migrationToUndo.name);

    if (error || results === undefined) {
      spinner.fail(`Failed to undo migration ${name}.`);
      if (error) console.error(error);
      process.exit(1);
    }

    for (let result of results) {
      if (result.status === "Success") {
        spinner.succeed(`Successful undo of migration ${result.migrationName}.`);
      } else {
        spinner.fail(`Failed to undo migration ${result.migrationName}.`);
      }
    }
  }

  // close the database connection
  await db.destroy();
}

/**
 * Undoes all migrations that have been applied.
 */
export async function undoAll() {
  const spinner = ora("Connecting to the database ...").start();
  const {
    sources: { db },
    migrationFolder: fld,
  } = getConfig();

  const migrationFolder = path.resolve(fld);
  if (!fs.existsSync(migrationFolder)) {
    spinner.fail(`Migration folder not found: ${migrationFolder}`);
    process.exit(1);
  }
  const provider = new FileMigrationProvider({ fs, path, migrationFolder });
  const migrator = new Migrator({ db, provider, ...kyselyxTableNames });
  const migrations = await migrator.getMigrations();
  spinner.stop();

  // get the migration executed first
  let initialMigration: MigrationInfo | null = null;
  for (let migration of migrations) {
    if (migration.executedAt !== undefined) {
      if (!initialMigration) initialMigration = migration;
      else if (migration.executedAt < initialMigration.executedAt!) initialMigration = migration;
    }
  }

  // if no migrations have been applied
  if (!initialMigration) {
    spinner.fail(`No migrations have been applied.`);
    process.exit(1);
  }

  // migrate down to the initial migration
  spinner.text = `Undoing all migrations ...`;
  spinner.start();
  let { error, results } = await migrator.migrateTo(initialMigration.name);

  if (error || results === undefined) {
    spinner.fail(`Failed to undo all migrations.`);
    if (error) console.error(error);
    process.exit(1);
  }

  // migrate down the initial migration
  ({ error, results } = await migrator.migrateDown());

  if (error || results === undefined) {
    spinner.fail(`Failed to undo initial migration.`);
    if (error) console.error(error);
    process.exit(1);
  }

  for (let result of results) {
    if (result.status !== "Success") {
      spinner.fail(`Failed to undo migration ${result.migrationName}.`);
      process.exit(1);
    }
  }

  spinner.succeed(`All migrations undone successfully.`);

  // close the database connection
  await db.destroy();
}

/**
 * Creates a new migration file with the specified name.
 */
export async function generate(name: string) {
  const { migrationFolder } = getConfig();

  // Generate the migration file
  const spinner = ora(`Generating migration file ...`).start();
  const migrationId = `${Date.now()}_${name}`;
  await fs.ensureDir(migrationFolder);
  await fs.writeFile(path.resolve(migrationFolder, `${migrationId}.ts`), template);
  spinner.succeed(`Generated migration file: "${migrationId}.ts"`);
}
