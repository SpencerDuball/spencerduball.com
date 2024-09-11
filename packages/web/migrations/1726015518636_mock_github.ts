import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("mock_gh_otcs")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("scope", "text", (col) => col.notNull())
    .addColumn("github_id", "integer", (col) => col.notNull())
    .addColumn("expires_at", "text", (col) => col.defaultTo(sql`(datetime('now', '+15 minutes'))`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();

  await db.schema
    .createTable("mock_gh_access_tokens")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("scope", "text", (col) => col.notNull())
    .addColumn("user_id", "integer", (col) => col.notNull())
    .addColumn("expires_at", "text", (col) => col.defaultTo(sql`(datetime('now', '+15 minutes'))`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("mock_otcs").ifExists().execute();
}

export { up, down };
