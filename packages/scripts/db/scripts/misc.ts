import ora from "ora";
import { clearBucket, clearDdb, type ScriptInput } from "../lib";
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Config } from "sst/node/config";
import { S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { Ddb } from "@spencerduballcom/db/ddb";
import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { migrate } from "./migrate";
import { seed, replant } from "./seed";
import { spawn, execSync } from "child_process";
import { createClient } from "@libsql/client";

/**
 * This function will reset the database, S3 bucket, and dynamodb to their original state. Everything will be removed
 * including migration files, habitat data, and seed data.
 */
export async function reset({ s3Client, ddb }: ScriptInput) {
  let spinner = ora("Connecting to the database ...").start();

  // create the clients
  const raw = createClient({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN });
  const s3 = s3Client ?? new S3Client({});
  const dynamo =
    ddb ?? new Ddb({ tableName: Table.table.tableName, client: new DynamoDBClient({ region: Config.REGION }) });

  // PART 1: Reset the SQL Database
  // ------------------------------
  // To drop all tables in the database we need to turn the 'foreign_keys' checks off and then delete all the tables in
  // a single executing command string. We can't use the Kysely package because:
  //
  // 1. Multiple statements cannot be sent at once in a single query. This is an issue because the 'foreign_keys' pragma
  //    gets reset right after a query finishes.
  // 2. We can't use transactions with Kysely to ensure PRAGMA is turned off because Kysely will not allow PRAGMA in a
  //    transaction (might be a SQL restriction too, not sure).
  spinner.text = `Dropping all tables from sql database ...`;
  const dropTableCmds = await raw
    .execute(`SELECT name FROM sqlite_master WHERE type = 'table'`)
    .then(({ rows }) =>
      rows.filter(({ name }) => !/^sqlite_.+/.test(String(name))).map(({ name }) => `DROP TABLE IF EXISTS "${name}"`),
    );
  console.log(dropTableCmds);
  if (dropTableCmds.length > 0) {
    const dropAllTables = ["PRAGMA foreign_keys=0", ...dropTableCmds, "PRAGMA foreign_keys=1"].join(";") + ";";
    await raw.executeMultiple(dropAllTables);
    spinner.succeed(`All ${dropTableCmds.length} tables from SQL database dropped.`);
  } else spinner.succeed("No SQL tables to drop.");
  raw.close();

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
    spawn(`turso`, ["dev", `--port=${url.port}`], { stdio: "inherit" }).on("spawn", async () => {
      // create the clients
      const db = new Kysely({
        dialect: new LibsqlDialect({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN }),
      });
      const s3 = new S3Client({});
      const dynamo = new Ddb({
        tableName: Table.table.tableName,
        client: new DynamoDBClient({ region: Config.REGION }),
      });

      // migrate and replant the database
      await migrate({ sqldb: db, s3Client: s3, ddb: dynamo });
      await replant({ sqldb: db, s3Client: s3, ddb: dynamo });

      // destroy the database when finished
      await db.destroy();
    });
  } else console.error("Check the DATABASE_URL, it doesn't match the localhost or is missing a port number.");
}
