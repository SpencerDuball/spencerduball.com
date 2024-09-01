import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("github_id", "integer", (col) => col.unique().notNull())
    .addColumn("username", "text", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("avatar_url", "text", (col) => col.notNull())
    .addColumn("github_url", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();
  await db.schema
    .createTable("roles")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("description", "text")
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();
  await db.schema
    .createTable("user_roles")
    .ifNotExists()
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("role_id", "text", (col) => col.references("roles.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("user_roles_pk", ["user_id", "role_id"])
    .execute();
  await db.schema
    .createTable("oauth_state_codes")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("redirect_uri", "text", (col) => col.notNull())
    .addColumn("expires_at", "text", (col) => col.defaultTo(sql`(datetime('now', '+15 minutes'))`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();
  await db.schema
    .createTable("sessions")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("roles", "text")
    .addColumn("expires_at", "text", (col) => col.defaultTo(sql`(datetime('now', '+3 months'))`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`(datetime('now'))`).notNull())
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("sessions").ifExists().execute();
  await db.schema.dropTable("oauth_state_codes").ifExists().execute();
  await db.schema.dropTable("user_roles").ifExists().execute();
  await db.schema.dropTable("roles").ifExists().execute();
  await db.schema.dropTable("users").ifExists().execute();
}

export { up, down };
