import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  /**
   * The 'users' table.
   *
   *           TYPE         | RELATION       | TABLE
   * @relation many-to-many | users-to-roles | user_roles
   * @relation one-to-many  | users-to-blogs | n/a
   */
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("username", "text", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("avatar_url", "text", (col) => col.notNull())
    .addColumn("github_url", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  /**
   * The 'roles' table.
   *
   *           TYPE         | RELATION       | TABLE
   * @relation many-to-many | users-to-roles | user_roles
   */
  await db.schema
    .createTable("roles")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  /**
   * The 'user_roles' table, this is a many-to-many linker table.
   */
  await db.schema
    .createTable("user_roles")
    .addColumn("user_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("role_id", "text", (col) => col.references("roles.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("user_roles_pk", ["user_id", "role_id"])
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_roles").execute();
  await db.schema.dropTable("roles").execute();
  await db.schema.dropTable("users").execute();
}

export { up, down };
