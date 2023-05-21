import arg from "arg";
import prompts from "prompts";
import pg from "pg";
import { Config } from "sst/node/config";
import { z } from "zod";
import { ConnectionString } from "connection-string";
import { Kysely, FileMigrationProvider, Migrator, PostgresDialect, sql } from "kysely";
import fs from "fs/promises";
import path from "path";
import { getClient } from "../src";
import users from "../seed/users.json";
import roles from "../seed/roles.json";
import user_roles from "../seed/user_roles.json";
import blogposts from "../seed/blogposts.json";
import tags from "../seed/tags.json";
import blogpost_tags from "../seed/blogpost_tags.json";

// define types
const ZUser = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  github_url: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
const ZRole = z.object({
  id: z.string(),
  description: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
const ZBlogPost = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  body: z.string(),
  author_id: z.number(),
  views: z.number(),
  published: z.boolean(),
  first_published_at: z.preprocess((v) => (v === null ? null : new Date(String(v))), z.date().or(z.null())),
  content_modified_at: z.coerce.date(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
const ZTag = z.object({
  id: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
const ZUserRole = z.object({
  user_id: z.number(),
  role_id: z.string(),
});
const ZBlogPostTag = z.object({
  blogpost_id: z.number(),
  tag_id: z.string(),
});

/** Applys all (or the remaining) migrations. */
async function migrate() {
  // create the connection
  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: Config.DATABASE_URL }) }),
  });

  // create the migrator
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder: path.resolve("migrations") }),
  });
  console.log(migrator);

  // migrate to latest
  const { error, results } = await migrator.migrateToLatest();
  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  // close the db connection
  await db.destroy();
}

/** Applys the next migration in the list. */
async function migrateUp() {
  // TODO: Need to implement stepping up a migration.
}

/** Removes the last migration in the list. */
async function migrateDown() {
  // TODO: Need to implement stepping down a migration.
}

/** Returns the status of the current migration. */
async function migrateStatus() {
  // TODO: Need to implement getting migration status.
}

/** Purges all data from all tables in the database, the tables themselves will stil exist. */
async function purge() {
  // parse the connection string
  const cnx = new ConnectionString(Config.DATABASE_URL);
  if (!cnx.path || !cnx.path[0])
    throw new Error(`Connection string does not specify a database: ${Config.DATABASE_URL}`);

  // connect to the client
  const client = new pg.Client({ connectionString: cnx.toString() });
  await client.connect();

  // get the tablenames to truncate
  const tablenames = await client
    .query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'kysely_%'`)
    .then(({ rows }) => rows.map(({ tablename }) => tablename));

  // truncate the tables
  for (let tablename of tablenames) await client.query(`TRUNCATE ${tablename} CASCADE`);

  // close the db connection
  await client.end();
}

/** Clears the entire database including the kysley tables. */
async function clear() {
  // parse the connection string
  const cnx = new ConnectionString(Config.DATABASE_URL);
  if (!cnx.path || !cnx.path[0])
    throw new Error(`Connection string does not specify a database: ${Config.DATABASE_URL}`);

  // connect to the client
  const client = new pg.Client({ connectionString: cnx.toString() });
  await client.connect();

  // get the tablenames to truncate
  const tablenames = await client
    .query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`)
    .then(({ rows }) => rows.map(({ tablename }) => tablename));

  // truncate the tables
  for (let tablename of tablenames) await client.query(`DROP TABLE ${tablename} CASCADE`);

  // close the db connection
  await client.end();
}

/** Loads the seed data into the db. */
async function seed() {
  // clear database
  await purge();

  // create the connection
  const db = getClient(Config.DATABASE_URL);

  // seed the database
  console.log("Seeding users ...");
  await Promise.all(
    ZUser.array()
      .parse(users)
      .map(async (user) => db.insertInto("users").values(user).executeTakeFirstOrThrow())
  );

  console.log("Seeding roles ...");
  await Promise.all(
    ZRole.array()
      .parse(roles)
      .map(async (role) => db.insertInto("roles").values(role).executeTakeFirstOrThrow())
  );

  console.log("Seeding user_roles ...");
  await Promise.all(
    ZUserRole.array()
      .parse(user_roles)
      .map(async (userRole) => db.insertInto("user_roles").values(userRole).executeTakeFirstOrThrow())
  );

  console.log("Seeding blogposts ...");
  await Promise.all(
    ZBlogPost.array()
      .parse(blogposts)
      .map(async (blogpost) => db.insertInto("blogposts").values(blogpost).executeTakeFirstOrThrow())
  );
  await db
    .selectFrom("blogposts")
    .select(sql<number>`setval(pg_get_serial_sequence('blogposts', 'id'), COALESCE(MAX(id) + 1, 1), false)`.as("index"))
    .executeTakeFirstOrThrow();

  console.log("Seeding tags ...");
  await Promise.all(
    ZTag.array()
      .parse(tags)
      .map(async (tags) => db.insertInto("tags").values(tags).executeTakeFirstOrThrow())
  );
  console.log("Seeding blogpost_tags ...");
  await Promise.all(
    ZBlogPostTag.array()
      .parse(blogpost_tags)
      .map(async (blogpost_tag) => db.insertInto("blogpost_tags").values(blogpost_tag).executeTakeFirstOrThrow())
  );

  console.log("Seeding attachments ...");
  await db
    .selectFrom("attachments")
    .select(
      sql<number>`setval(pg_get_serial_sequence('attachments', 'id'), COALESCE(MAX(id) + 1, 1), false)`.as("index")
    )
    .executeTakeFirstOrThrow();

  // close the db connection
  await db.destroy();
}

/** Runs migrate and seed into the db. */
async function setup() {
  // migrate the db
  console.log("Applying migrations to the database ...");
  await migrate();
  console.log("Success! Migrations applied.");

  // seed the db
  console.log("Seeding the database ...");
  await seed();
  console.log("Success! Seeded the database.");
}

/** Runs drop, and then setup for the db. */
async function reset() {
  await clear();
  await setup();
}

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
      type: "confirm",
      name: "shouldRunOnProd",
      message: "You are attempting to run this action on the production database, are you sure?",
    });
    if (!shouldRunOnProd) {
      console.log("Aborted the action attempted for the 'prod' database.");
      process.exit();
    }
  }

  // perform the action
  if (action === "migrate") await migrate();
  else if (action === "migrate:up") await migrateUp();
  else if (action === "migrate:down") await migrateDown();
  else if (action === "migrate:status") await migrateStatus();
  else if (action === "purge") await purge();
  else if (action === "clear") await clear();
  else if (action === "seed") await seed();
  else if (action === "setup") await setup();
  else if (action === "reset") await reset();

  // notify that it was successful
  console.log("All actions successfully performed!");
}

main();
