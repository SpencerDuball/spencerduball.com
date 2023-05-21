import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  /* -----------------------------------------------------------------------------------------------------
   * Create Normal Tables
   * ----------------------------------------------------------------------------------------------------- */

  /**
   *  The Users table.
   * @relation many-to-many UserRole "user"-to-"role" = "user_roles".
   * @relation one-to-many  UserBlogPosts "user"-to-"blogpost".
   */
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("username", "varchar", (col) => col.notNull())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("avatar_url", "varchar", (col) => col.notNull())
    .addColumn("github_url", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The Roles table.
   * @relation many-to-many UserRoles "user"-to-"role" = "user_roles".
   */
  await db.schema
    .createTable("roles")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The BlogPost table.
   * @relation many-to-many BlogPostTags "blogpost"-to-"tag"  = "blogpost_tags"
   * @relation one-to-many Attachments "blogpost"-to-"attachment"
   */
  await db.schema
    .createTable("blogposts")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("image_url", "varchar", (col) => col.notNull())
    .addColumn("body", "text", (col) => col.notNull())
    .addColumn("author_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("views", "integer", (col) => col.defaultTo(0).notNull())
    .addColumn("published", "boolean", (col) => col.defaultTo(false).notNull())
    // the first time the blogpost's 'published' attribute is set to true
    .addColumn("first_published_at", "timestamp", (col) => col.defaultTo(null))
    // updated anytime the 'body' attribute is updated
    .addColumn("content_modified_at", "timestamp", (col) => col.defaultTo(sql`now()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The Tag table.
   * @relation many-to-many BlogPostTags "blogpost"-to-"tag"  = "blogpost_tags"
   */
  await db.schema
    .createTable("tags")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The Attachment table.
   * @relation many-to-one Attachment "attachment"-to-"blogpost"
   */
  await db.schema
    .createTable("attachments")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("url", "varchar", (col) => col.notNull())
    .addColumn("blogpost_id", "integer", (col) => col.references("blogposts.id").onDelete("cascade").notNull())
    .addColumn("is_unused", "boolean", (cb) => cb.notNull())
    .addColumn("expires_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /* -----------------------------------------------------------------------------------------------------
   * Create Linker Tables
   * ----------------------------------------------------------------------------------------------------- */

  // Add many-to-many linker table for "user_role"
  await db.schema
    .createTable("user_roles")
    .addColumn("user_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("role_id", "varchar(255)", (col) => col.references("roles.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("user_roles_pk", ["user_id", "role_id"])
    .execute();

  // Add many-to-many linker table for "blogpost_tag"
  await db.schema
    .createTable("blogpost_tags")
    .addColumn("blogpost_id", "integer", (col) => col.references("blogposts.id").onDelete("cascade").notNull())
    .addColumn("tag_id", "varchar(255)", (col) => col.references("tags.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("blogpost_tags_pk", ["blogpost_id", "tag_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("roles").execute();
  await db.schema.dropTable("blogposts").execute();
  await db.schema.dropTable("tags").execute();
  await db.schema.dropTable("attachments").execute();
  await db.schema.dropTable("user_roles").execute();
  await db.schema.dropTable("blogpost_tags").execute();
}
