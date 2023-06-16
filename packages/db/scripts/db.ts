import arg from "arg";
import prompts from "prompts";
import pg from "pg";
import { getClient } from "../src/pg";
import { Config } from "sst/node/config";
import { z } from "zod";
import { Kysely, FileMigrationProvider, Migrator, PostgresDialect, sql } from "kysely";
import fs from "fs-extra";
import path from "path";
import { IAttachment, ZAttachment, ZBlog, ZBlogTag, ZRole, ZTag, ZUser, ZUserRole } from "./seed/seed-types";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Clears all items from the bucket.
 */
async function clearBucket() {
  const s3 = new S3Client({});
  const items = await s3.send(new ListObjectsV2Command({ Bucket: Config.BUCKET_NAME }));

  // batch items to delete
  const MaxBatchSize = 1000;
  const batchesToDelete =
    (items.Contents &&
      Array.from({ length: Math.ceil(items.Contents.length / MaxBatchSize) }, (_, index) =>
        items.Contents!.slice(index * MaxBatchSize, (index + 1) * MaxBatchSize)
      ).map((batch) => batch.map(({ Key }) => ({ Key })))) ||
    [];

  // delete each batch of items
  await Promise.all(
    batchesToDelete.map((batch) =>
      s3.send(new DeleteObjectsCommand({ Bucket: Config.BUCKET_NAME, Delete: { Objects: batch } }))
    )
  );
}

/**
 * Uploads attachments to the S3 bucket.
 *
 * @param attachments The attachments to upload.
 * @returns The request promise.
 */
async function uploadAttachments(attachments: IAttachment[]) {
  const s3 = new S3Client({});
  const requests = attachments.map(async (attachment) => {
    const Key = new URL(attachment.url).pathname.replace(/^\//, "");
    const file = await fs.readFile(attachment._.fileUri);
    const options = { Bucket: Config.BUCKET_NAME, Key, Body: file, ContentType: attachment.type };
    return s3.send(new PutObjectCommand(options));
  });
  return Promise.all(requests);
}

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
  for await (let tablename of tablenames) await sql`TRUNCATE TABLE ${sql(tablename)} CASCADE`.execute(db);
  if (tablenames.includes("blogs")) {
    await sql`SELECT setval(pg_get_serial_sequence('blogs', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM blogs`.execute(
      db
    );
  }

  // remove all items from the S3 bucket
  await clearBucket();

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

  // remove the tables
  for await (let tablename of tablenames) await sql`DROP TABLE IF EXISTS ${sql(tablename)} CASCADE`.execute(db);

  // remove all items from the S3 bucket
  await clearBucket();

  // close the db connection
  await db.destroy();
}

/** Loads the seed data into the db. */
async function seed() {
  // purge the database
  await purge();

  // connect to the client
  const db = getClient(Config.DATABASE_URL);

  // seed all transactions
  const transactions = await fs.readdir(path.join("scripts", "seed", "transactions"));
  for (let transaction of transactions) {
    const transactionPath = path.join("scripts", "seed", "transactions", transaction);

    // seed the 'users' table
    const usersFile = path.join(transactionPath, "users.json");
    const usersData = await fs
      .readJson(usersFile)
      .catch(() => [])
      .then((users) => ZUser.array().parse(users));
    if (usersData.length > 0) await db.insertInto("users").values(usersData).execute();

    // seed the 'roles' table
    const rolesFile = path.join(transactionPath, "roles.json");
    const rolesData = await fs
      .readJson(rolesFile)
      .catch(() => [])
      .then((roles) => ZRole.array().parse(roles));
    if (rolesData.length > 0) await db.insertInto("roles").values(rolesData).execute();

    // seed the 'user_roles' table
    const userRolesFile = path.join(transactionPath, "userRoles.json");
    const userRolesData = await fs
      .readJson(userRolesFile)
      .catch(() => [])
      .then((userRoles) => ZUserRole.array().parse(userRoles));
    if (userRolesData.length > 0) await db.insertInto("user_roles").values(userRolesData).execute();

    // seed the 'tags' table
    const tagsFile = path.join(transactionPath, "tags.json");
    const tagsData = await fs
      .readJson(tagsFile)
      .catch(() => [])
      .then((tags) => ZTag.array().parse(tags));
    if (tagsData.length > 0) await db.insertInto("tags").values(tagsData).execute();

    // seed the 'blogs' table
    const blogsFile = path.join(transactionPath, "blogs.json");
    const blogsData = await fs
      .readFile(blogsFile)
      .catch(() => Buffer.from("[]", "utf8"))
      .then((file) => JSON.parse(file.toString().replace(/\{\{S3_BUCKET_URL\}\}/g, Config.BUCKET_URL)))
      .catch(() => [])
      .then((blogs) => ZBlog.array().parse(blogs));
    if (blogsData.length > 0) {
      await db.insertInto("blogs").values(blogsData).execute();
      await sql`SELECT setval(pg_get_serial_sequence('blogs', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM blogs`.execute(
        db
      );
    }

    // seed the 'blog_tags' table
    const blogTagsFile = path.join(transactionPath, "blogTags.json");
    const blogTagsData = await fs
      .readJson(blogTagsFile)
      .catch(() => [])
      .then((blogTags) => ZBlogTag.array().parse(blogTags));
    if (blogTagsData.length > 0) await db.insertInto("blog_tags").values(blogTagsData).execute();

    // seed the 'attachments' table
    const attachmentsFile = path.join(transactionPath, "attachments.json");
    const attachmentsData = await fs
      .readFile(attachmentsFile)
      .catch(() => Buffer.from("[]", "utf8"))
      .then((file) => JSON.parse(file.toString().replace(/\{\{S3_BUCKET_URL\}\}/g, Config.BUCKET_URL)))
      .catch(() => [])
      .then((data) => ZAttachment.array().parse(data));
    if (attachmentsData.length > 0) {
      const attachments = ZAttachment.omit({ _: true }).array().parse(attachmentsData);
      await db.insertInto("attachments").values(attachments).execute();
      await uploadAttachments(attachmentsData);
    }
  }

  // close the connection
  await db.destroy();
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
    if (shouldRunOnProd !== "I am fasho dawg") {
      console.log("Aborted the action attempted for the production database.");
      process.exit();
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
