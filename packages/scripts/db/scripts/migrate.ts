import ora from "ora";
import { type ScriptInput } from "../lib";
import fs from "fs-extra";
import path from "path";
import { FileMigrationProvider, Kysely, MigrationInfo, Migrator } from "kysely";
import { Config } from "sst/node/config";
import { LibsqlDialect } from "@libsql/kysely-libsql";

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
  `import { type ScriptInput } from "../../../db/lib";`,
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
 * Creates a new migration file and associated seed scripts.
 */
export async function create({}: ScriptInput, name: string) {
  const spinner = ora("Generating the migration and seed ...").start();

  // generate migration ID
  const migrationId = `${Date.now()}_${name}`;

  // write the migration file
  await fs.ensureDir("migrations");
  await fs.writeFile(path.resolve("migrations", `${migrationId}.ts`), migrationTemplate);

  await fs.ensureDir(path.resolve("seed", migrationId));
  await fs.writeFile(path.resolve("seed", migrationId, "run.ts"), seedTemplate);
  await fs.ensureDir(path.resolve("seed", migrationId, "assets"));
  await fs.writeFile(path.resolve("seed", migrationId, "assets", ".keep"), "");

  spinner.succeed(`Created migration and seed for: ${migrationId}.`);
}

/**
 * Retrieves the status of all migrations available and displays which migrations have been applied and which have not.
 */
export async function status({ sqldb }: ScriptInput) {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const db =
    sqldb ??
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });

  // create the migrator
  const migrationFolder = path.resolve("migrations");
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

  // close the connection if hte db client was not passed into the function
  if (!sqldb) db.destroy();
}

/**
 * Applies all migrations up to the latest migration.
 */
export async function migrate({ sqldb }: ScriptInput) {
  let spinner = ora("Connecting to the database ...").start();

  // create the connection
  const db =
    sqldb ??
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });

  // apply the migrations
  const migrationFolder = path.resolve("migrations");
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
    if (!sqldb) await db.destroy();
    process.exit(1);
  }

  // close the connection if the db client was not passed into the function
  if (!sqldb) await db.destroy();

  ora().succeed("All migrations applied successfully!");
}
