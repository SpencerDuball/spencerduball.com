import ora from "ora";
import { clearBucket, clearDdb, type ScriptInput } from "../lib";
import { Migrator, FileMigrationProvider, Kysely, sql, NO_MIGRATIONS } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Config } from "sst/node/config";
import { S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { Ddb } from "@spencerduballcom/db/ddb";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import path from "path";
import fs from "fs-extra";
import { migrate } from "./migrate";
import { seed } from "./seed";
import { spawn, execSync } from "child_process";

/**
 * This function will reset the database, S3 bucket, and dynamodb to their original state. Everything will be removed
 * including migration files, habitat data, and seed data.
 */
export async function reset({ sqldb, s3Client, ddb }: ScriptInput) {
  let spinner = ora("Connecting to the database ...").start();

  // create the clients
  const db =
    sqldb ??
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // PART 1: Reset the SQL Database
  // ------------------------------
  // drop all migrations
  spinner.text = `Dropping all migrations from sql database ...`;
  const migrationFolder = path.resolve("migrations");
  const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) });
  const migrations = (await migrator.getMigrations()).filter((migration) => !!migration.executedAt);
  await migrator.migrateTo(NO_MIGRATIONS);
  if (migrations.length > 0) spinner.succeed(`All ${migrations.length} migrations from sql database dropped.`);
  else spinner.succeed(`No SQL migrations to drop.`);

  // close the connection if the db client was not passed into the function
  if (!sqldb) await db.destroy();
  spinner.stop();

  // PART 2: Clear the S3 Bucket
  // ---------------------------
  await clearBucket({ Bucket: Bucket.Bucket.bucketName, s3Client: s3 });

  // PART 3: Clear the DynamoDB Table
  // --------------------------------
  await clearDdb({ ddb: dynamo });
}

/**
 * This function will apply all migrations and then run the habitat and seed functions. This should be called after a
 * reset has run or from a clearn setup.
 */
export async function setup({ sqldb, s3Client, ddb }: ScriptInput) {
  // create the clients
  const db =
    sqldb ??
    new Kysely({ dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }) });
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // apply all migrations
  await migrate({ sqldb: db, s3Client: s3, ddb: dynamo });

  // apply all habitat and seed data
  await seed({ sqldb: db, s3Client: s3, ddb: dynamo });
}

export async function start() {
  // check if libsql is installed
  const libdInstalled = !!execSync("sqld --version", { encoding: "utf8" }).match(/^sqld sqld \d+\.\d+\.\d+/);
  if (!libdInstalled)
    console.error(
      "Missing! `sqld` program needs to be installed, please see the instructions here for installing this:",
      "https://github.com/tursodatabase/libsql/blob/main/docs/BUILD-RUN.md#build-and-install-with-homebrew",
    );

  // check if turso is installed
  const tursoInstalled = !!execSync("turso --version", { encoding: "utf8" }).match(/^turso version v\d+\.\d+\.\d+/);
  if (!tursoInstalled)
    console.error(
      "Missing! `turso` program needs to be installed, please see the instructions here for installing this:",
      "https://docs.turso.tech/reference/turso-cli#homebrew-macos-and-linux",
    );

  // start the database
  const url = new URL(Config.DATABASE_URL);
  if (url.hostname === "127.0.0.1" && url.port) {
    spawn(`turso`, ["dev", `--port=${url.port}`], { stdio: "inherit" });
  } else console.error("Check the DATABASE_URL, it doesn't match the localhost or is missing a port number.");
}
