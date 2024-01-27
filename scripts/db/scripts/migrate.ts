import fs from "fs-extra";
import { FileMigrationProvider, Migrator, MigrationInfo } from "kysely";
import ora from "ora";
import path from "path";
import { SCRIPTS_DIR, getDbClient } from "../lib";

const migrationTemplate = [
  `import { Kysely, sql } from "kysely";`,
  ``,
  `async function up(db: Kysely<any>): Promise<void> {}`,
  ``,
  `async function down(db: Kysely<any>): Promise<void> {}`,
  ``,
  `export { up, down };`,
].join("\n");

const seedTemplate = [
  `import { type ScriptInput } from "../../db/lib";`,
  ``,
  `/**`,
  ` * This procedure is meant to be called from the database scripts and will insert seed data. This includes data`,
  ` * that represents the state of the application at a given point in time (users/posts/comments/etc).`,
  ` */`,
  `export async function up({}: ScriptInput) {}`,
  ``,
  `/**`,
  ` * This procedure is meant to be called from the database scripts and will delete seed data.`,
  ` */`,
  `export async function down({}: ScriptInput) {}`,
  ``,
].join("\n");

/**
 * Creates a new migration file and seed script associated with the migration.
 */
export async function create(name: string) {
  const spinner = ora("Generating the migration and see ...").start();

  // generate migration ID
  const migrationId = `${Date.now()}_${name}`;

  // write the migration file
  await fs.ensureDir(path.resolve(SCRIPTS_DIR, "migrations"));
  await fs.writeFile(path.resolve(SCRIPTS_DIR, "migrations", `${migrationId}.ts`), migrationTemplate);

  // create the seed files
  await fs.ensureDir(path.resolve(SCRIPTS_DIR, "seed", migrationId));
  await fs.writeFile(path.resolve(SCRIPTS_DIR, "seed", migrationId, "run.ts"), seedTemplate);
  await fs.ensureDir(path.resolve(SCRIPTS_DIR, "seed", migrationId, "assets"));
  await fs.writeFile(path.resolve(SCRIPTS_DIR, "seed", migrationId, "assets", ".keep"), "");

  spinner.succeed(`Created migration and seed for: ${migrationId}.`);
}

/**
 * Applies all migrations up to the latest migration.
 */
export async function migrate() {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const db = getDbClient();

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

/**
 * Retrieves the status of all migrations available and displays which migrations have been applied and which have not.
 */
export async function status() {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const db = getDbClient();

  // create the migrator
  const migrationFolder = path.resolve(SCRIPTS_DIR, "migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = await migrator.getMigrations();
  spinner.stop();

  // collect a snapshot of the migration info
  let lastAppliedMigration: MigrationInfo | null = null;
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
    if (migration.executedAt) ora(`Migration ${migration.name} applied.`).succeed();
    else ora(`Migration ${migration.name} not applied.`).fail();
  }

  // close the connection
  await db.destroy();
}
