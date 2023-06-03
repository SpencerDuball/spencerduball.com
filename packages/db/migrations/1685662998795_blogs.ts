import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  /**
   * The 'blogs' table.
   *
   *           TYPE         | RELATION            | TABLE
   * @relation many-to-many | blogs-to-tags       | blog_tags
   * @relation one-to-many  | blog-to-attachments | n/a
   */
  await db.schema
    .createTable("blogs")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("image_url", "varchar", (col) => col.notNull())
    .addColumn("body", "text", (col) => col.notNull())
    .addColumn("author_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
    .addColumn("views", "integer", (col) => col.defaultTo(0).notNull())
    .addColumn("published", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("published_at", "timestamp", (col) => col.defaultTo(null))
    .addColumn("body_modified_at", "timestamp", (col) => col.defaultTo(sql`now()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The 'tags' table.
   *
   *           TYPE         | RELATION      | TABLE
   * @relation many-to-many | blogs-to-tags | blog_tags
   */
  await db.schema
    .createTable("tags")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  /**
   * The 'blog_tags' table, this is a many-to-many linker table.
   */
  await db.schema
    .createTable("blog_tags")
    .addColumn("blog_id", "integer", (col) => col.references("blogs.id").onDelete("cascade").notNull())
    .addColumn("tag_id", "varchar(255)", (col) => col.references("tags.id").onDelete("cascade").notNull())
    .addPrimaryKeyConstraint("blog_tags_pk", ["blog_id", "tag_id"])
    .execute();

  /**
   * The 'attachments' table.
   *
   *           TYPE        | RELATION            | TABLE
   * @relation one-to-many | blog-to-attachments | n/a
   */
  await db.schema
    .createTable("attachments")
    .addColumn("id", "uuid", (col) => col.defaultTo(sql`gen_random_uuid()`).primaryKey())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("url", "varchar", (col) => col.notNull())
    .addColumn("blog_id", "integer", (col) => col.references("blogs.id").onDelete("cascade"))
    .addColumn("is_unused", "boolean", (cb) => cb.notNull())
    .addColumn("expires_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("modified_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("blogs").execute();
  await db.schema.dropTable("tags").execute();
  await db.schema.dropTable("blog_tags").execute();
  await db.schema.dropTable("attachments").execute();
}

export { up, down };
