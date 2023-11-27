import { Kysely, sql } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import { Config } from "sst/node/config";
import { Bucket } from "sst/node/bucket";
import pg from "postgres";
import ora, { Ora } from "ora";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

/**
 * Clears all items from the bucket.
 */
async function clearBucket(spinner: Ora) {
  const MaxBatchSize = 1000;
  const s3 = new S3Client({});

  // get the Key of each item in the bucket
  spinner.text = "Getting the objects to delete ...";
  if (!spinner.isSpinning) spinner.start();
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
  spinner.text = `Deleting ${itemKeys.length} items from bucket ...`;
  const batchesToDelete = Array.from({ length: Math.ceil(itemKeys.length / MaxBatchSize) }, (_, index) =>
    itemKeys.slice(index * MaxBatchSize, (index + 1) * MaxBatchSize)
  ).map((batch) => batch.map((Key) => ({ Key })));

  // delete each batch of items
  await Promise.all(
    batchesToDelete.map((batch) =>
      s3.send(new DeleteObjectsCommand({ Bucket: Config.BUCKET_URL, Delete: { Objects: batch } }))
    )
  );
}

/**
 * Clears all tables from the database.
 */
async function clearPostgres(spinner: Ora) {
  // create the connection
  spinner.text = "Connecting to the database ...";
  if (!spinner.isSpinning) spinner.start();
  const db = new Kysely({
    dialect: new PostgresJSDialect({ postgres: pg(Config.DATABASE_URL, { idle_timeout: 30 }) }),
  });

  // get the tablenames to drop
  spinner.text = "Retrieving all tables to drop ...";
  const tablenames = await sql<any>`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`
    .execute(db)
    .then(({ rows }) => rows.map(({ tablename }) => tablename as string));

  // remove the tables
  for await (let [idx, tablename] of tablenames.entries()) {
    spinner.text = `(${idx + 1}/${tablenames.length}) Removing table ${tablename} ...`;
    await sql`DROP TABLE IF EXISTS ${sql.raw(tablename)} CASCADE`.execute(db);
  }

  // close the db connection
  await db.destroy();
}

/**
 * Removes all data, clears all tables, and even erases the migration tables. This will reset the database to a
 * 'like-new' state.
 */
async function main() {
  // create the spinner
  const spinner = ora();

  // clear the database tables
  await clearPostgres(spinner);

  // clear the bucket objects
  await clearBucket(spinner);

  // notify on success
  spinner.succeed("Reset the database and S3 bucket successfully!");
}

main();
