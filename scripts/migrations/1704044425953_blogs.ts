import { Kysely, sql } from "kysely";

async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("blogs")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("cover_img", "text", (col) => col.notNull()) // In the form "[alt text here](full/uri/to/image)"
    .addColumn("body", "text", (col) => col.notNull())
    .addColumn("views", "integer", (col) => col.defaultTo(0).notNull())
    .addColumn("published", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("published_at", "text", (col) => col.defaultTo(null))
    .addColumn("body_modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("author_id", "integer", (col) => col.references("users.id").onDelete("cascade").notNull())
    .execute();

  await db.schema
    .createTable("blog_tags")
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("blog_id", "integer", (col) => col.references("blogs.id").onDelete("cascade").notNull())
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addPrimaryKeyConstraint("blog_tags_pk", ["name", "blog_id"])
    .execute();

  await db.schema
    .createTable("blog_files")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull()) // The name of the image, should match with the url.
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("alt", "text", (col) => col.notNull()) // The alt text of the image.
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull()) // The MIME type of the attachment.
    .addColumn("expires_at", "text", (col) => col.defaultTo(null))
    .addColumn("created_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("modified_at", "text", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn("blog_id", "integer", (col) => col.references("blogs.id").onDelete("cascade").notNull())
    .execute();
}

async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("blog_files").execute();
  await db.schema.dropTable("blog_tags").execute();
  await db.schema.dropTable("blogs").execute();
}

export { up, down };
