import { z } from "zod";
import arg from "arg";
import prompts from "prompts";
import { Config } from "sst/node/config";
import ora from "ora";
import { Kysely, Migrator, FileMigrationProvider, MigrationInfo, sql } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import path from "path";
import fs from "fs-extra";
import {
  S3Client,
  type ListObjectsV2CommandOutput,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { createClient } from "../src/sqldb";
import { Ddb } from "../src/ddb";
import { Table } from "sst/node/table";
import { AttributeValue, DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { ScanCommandOutput, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

interface DbScriptProps {
  db?: Kysely<any>;
  s3?: S3Client;
  ddb?: Ddb;
}

/** Clears all items from the bucket. */
async function clearBucket({ s3 }: DbScriptProps) {
  const MaxBatchSize = 1000;
  s3 = s3 || new S3Client({});

  // get the Key of each item in the bucket
  let spinner = ora("Getting the objects to delete ...").start();
  const itemKeys: string[] = [];
  let nextToken: string | undefined = undefined;
  do {
    const { NextContinuationToken, Contents } = (await s3.send(
      new ListObjectsV2Command({ Bucket: Bucket.Bucket.bucketName, ContinuationToken: nextToken || undefined })
    )) as ListObjectsV2CommandOutput;
    Contents?.map(({ Key }) => Key && itemKeys.push(Key));
    nextToken = NextContinuationToken;
  } while (nextToken);

  // batch items to delete
  spinner.text = `Deleting ${itemKeys.length} items for bucket ...`;
  const batchesToDelete = Array.from({ length: Math.ceil(itemKeys.length / MaxBatchSize) }, (_, index) =>
    itemKeys.slice(index * MaxBatchSize, (index + 1) * MaxBatchSize)
  ).map((batch) => batch.map((Key) => ({ Key })));

  // delete each batch of items
  await Promise.all(
    batchesToDelete.map(
      (batch) => s3?.send(new DeleteObjectsCommand({ Bucket: Bucket.Bucket.bucketName, Delete: { Objects: batch } }))
    )
  );
  spinner.stop();
}

/** Clears all items from the DDB table. */
async function clearDdb() {
  const dynamodb = new DynamoDBClient({ region: Config.REGION });
  const spinner = ora("Staring to delete ddb items ...").start();

  // get all items
  let ExclusiveStartKey: Record<string, AttributeValue> | undefined = undefined;
  let count = 0;
  do {
    spinner.text = `Deleting batch ${count + 1} ...`;
    // get items in a batch
    const res = (await dynamodb.send(
      new ScanCommand({ TableName: Table.table.tableName, ProjectionExpression: "pk, sk", ExclusiveStartKey })
    )) as ScanCommandOutput;

    // delete the items
    if (res.Items && res.Items.length > 0) {
      const items = z
        .object({ pk: z.string(), sk: z.string() })
        .array()
        .parse(res.Items.map((item) => ({ pk: item.pk.S, sk: item.sk.S })));
      const deleteItems = items.map((item) => ({ DeleteRequest: { Key: { pk: item.pk, sk: item.sk } } }));
      const r = await dynamodb.send(new BatchWriteCommand({ RequestItems: { [Table.table.tableName]: deleteItems } }));
      spinner.text = `Deleted batch ${count + 1}.`;
    }
    ExclusiveStartKey = res.LastEvaluatedKey;
    count = count + 1;
  } while (ExclusiveStartKey);
  spinner.stop();
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:migrate:create
 * ------------------------------------------------------------------------------------------------------------------ */
const migrationTemplate = [
  `import { Kysely, sql } from "kysely";`,
  ``,
  `async function up(db: Kysely<any>): Promise<void> {}`,
  ``,
  `async function down(db: Kysely<any>): Promise<void> {}`,
  ``,
  `export { up, down };`,
].join("\n");

const runTemplate = [``].join("\n");

async function migrateCreate({}: DbScriptProps) {
  const spinner = ora("Generating the migration ...");

  // collect the args
  const migrationName = arg({})._[1];

  // ensure required args exist
  if (!migrationName) {
    spinner.fail("Must supply the migration name as the first positional argument.");
    process.exit();
  }

  // generate migration name
  const migrationId = `${Date.now()}_${migrationName}`;

  // write the migration file
  await fs.ensureDir("migrations");
  await fs.writeFile(path.resolve("migrations", `${migrationId}.ts`), migrationTemplate);

  // create the seed directory, run script, assets folder, and data folder
  await fs.ensureDir(path.resolve("seed", migrationId));
  await fs.writeFile(path.resolve("seed", migrationId, "run.ts"), runTemplate);
  await fs.ensureDir(path.resolve("seed", migrationId, "assets"));
  await fs.writeFile(path.resolve("seed", migrationId, "assets", ".keep"), "");
  await fs.ensureDir(path.resolve("seed", migrationId, "data"));
  await fs.writeFile(path.resolve("seed", migrationId, "data", ".keep"), "");

  spinner.succeed(`Created migration ${migrationId}.`);
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:migrate:status
 * ------------------------------------------------------------------------------------------------------------------ */
async function migrateStatus({ db }: DbScriptProps) {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  let dbase =
    db ||
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });

  // create the migrator
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db: dbase, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
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

  // close the connection if the db client was not passed into the function
  if (!db) dbase.destroy();
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:migrate
 * ------------------------------------------------------------------------------------------------------------------ */
async function migrate({ db }: DbScriptProps) {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  let dbase =
    db ||
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });

  // apply the migrations
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db: dbase, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
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
    if (!db) await dbase.destroy();
    process.exit(1);
  }

  // close the connection if the db client was not passed into the function
  if (!db) await dbase.destroy();
  ora().succeed("All migrations applied successfull!");
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:reset
 * ------------------------------------------------------------------------------------------------------------------ */
async function reset({ db }: DbScriptProps) {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  let dbase =
    db ||
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });

  // get the tablenames to drop
  spinner.text = "Retrieving all tables to drop ...";
  const tablenames = await sql<any>`SELECT name FROM sqlite_master WHERE type="table"`
    .execute(dbase)
    .then(({ rows }) => rows.map(({ name }) => name as string));

  // remove the tables
  for await (let [idx, tablename] of tablenames.entries()) {
    spinner.text = `(${idx + 1}/${tablenames.length}) Removing table ${tablename} ...`;
    await sql`DROP TABLE IF EXISTS ${sql.raw(tablename)}`.execute(dbase);
  }

  // close the connection if the db client was not passed into the function
  if (!db) await dbase.destroy();
  spinner.stop();

  // clear the bucket objects
  await clearBucket({});

  // notify on success
  ora().succeed("Reset the database and S3 bucket successfully!");
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:seed
 * ------------------------------------------------------------------------------------------------------------------ */
async function seed({}: DbScriptProps) {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  const db = createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);
  const s3 = new S3Client({});
  const ddb = new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });
  spinner.stop();

  // reset the seed data
  await seedReset({});

  // collect & run the transactions
  const transactions = await fs
    .readdir(path.join("seed"), { withFileTypes: true })
    .then((files) => files.filter((file) => file.isDirectory()));
  for (let tx of transactions) {
    spinner = ora(`Applying seed transaction '${tx.name}' ...`);
    const { main } = await import(path.resolve("seed", tx.name, "run.ts"));
    await main({ db, s3, ddb }).catch((e: any) => {
      spinner.fail(`Error applying seed transaction '${tx.name}.'`);
      console.error(e);
      process.exit(1);
    });
    spinner.succeed(`Applied seed transaction '${tx.name}'.`);
  }

  // close the connection
  await db.destroy();
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:seed:reset
 * ------------------------------------------------------------------------------------------------------------------ */
async function seedReset({}: DbScriptProps) {
  // create the connection
  let spinner = ora("Connecting to the database ...").start();
  let dbase = createClient(Config.DATABASE_URL, Config.DATABASE_AUTH_TOKEN);

  // get the tablenames to truncate
  spinner.text = "Clearing the database tables ...";
  const tablenames = await sql<any>`SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "kysely_%"`
    .execute(dbase)
    .then(({ rows }) => rows.map(({ name }) => name));

  // truncate the tables
  spinner.text = "Clearing the S3 objects ...";
  for await (let tablename of tablenames) await sql`DELETE FROM ${sql.table(tablename)}`.execute(dbase);
  if (tablenames.includes("blogs")) {
    // reset the serial sequence of the "blogs" table
    await sql`UPDATE sqlite_sequence SET seq = (SELECT COALESCE(MAX(col) +1, 1) FROM blogs) WHERE name="blogs"`.execute(
      dbase
    );
  }
  spinner.stop();

  // remove all items from the S3 bucket
  await clearBucket({});

  // remove all ddb items
  await clearDdb();

  // close the db connection
  await dbase.destroy();

  // notify on success
  ora().succeed("Reset the seed data successfully!");
}

/* ------------------------------------------------------------------------------------------------------------------
 * Script db:setup
 * ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------------------------
 * Define Database Actions & Main Function
 * ------------------------------------------------------------------------------------------------------------------ */
const DatabaseActions = [
  "db:migrate:create",
  "db:migrate:status",
  "db:migrate",
  "db:migrate:up",
  "db:migrate:down",
  "db:reset",
  "db:seed",
  "db:seed:reset",
  "db:setup",
] as const;

async function main() {
  // collect the type of database action
  const firstCliArg = arg({})._[0];
  const action = await z.enum(DatabaseActions).parseAsync(firstCliArg);

  // if running on "prod" confirm this action with the user
  if (Config.STAGE === "prod") {
    const ConfirmCode = "I realize this could break shit";
    const { shouldRun } = await prompts({
      type: "text",
      name: "shouldRun",
      message: `You are attempting to run the is action on the production database, please type '${ConfirmCode}' to confirm:`,
    });
    if (shouldRun === ConfirmCode) {
      console.log("Aborted the action.");
      process.exit();
    }
  }

  // perform the action
  if (action === "db:migrate:create") await migrateCreate({});
  else if (action === "db:migrate:status") await migrateStatus({});
  else if (action === "db:migrate") await migrate({});
  // else if (action === "db:migrate:up") await migrateUp({});
  // else if (action === "db:migrate:down") await migrateDown({});
  else if (action === "db:reset") await reset({});
  else if (action === "db:seed") await seed({});
  else if (action === "db:seed:reset") await seedReset({});
}

main();
