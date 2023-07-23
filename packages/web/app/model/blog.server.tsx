import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import Markdoc, { Node } from "@markdoc/markdoc";
import { config } from "~/components/app/markdoc";
import yaml from "js-yaml";
import { z } from "zod";
import { getLogger, getPgClient, getS3Client, ZEnv } from "~/lib/util.server";
import ms from "ms";
import { sql } from "kysely";

// ------------------------------------------------------------------------------------------------------------
// Markdoc
// ------------------------------------------------------------------------------------------------------------
export function validateFrontmatter(frontmatter: string) {
  return z
    .object({ title: z.string(), description: z.string(), image_url: z.string(), tags: z.string().array() })
    .parse(yaml.load(frontmatter));
}

// ------------------------------------------------------------------------------------------------------------
// CRUD Actions
// ------------------------------------------------------------------------------------------------------------

// CREATE
export interface ICreateBlogProps {
  /** The body of the blog. */
  body: string;
  /** The ID of the blog's author. */
  author_id: number;
}
export async function createBlog({ body, author_id }: ICreateBlogProps) {
  const db = await getPgClient();
  const logger = getLogger();

  // validate & parse body for parts
  const ast = Markdoc.parse(body);
  const { title, description, image_url, tags } = validateFrontmatter(ast.attributes.frontmatter);
  const errors = Markdoc.validate(ast, config);
  if (errors.length > 0) throw errors;

  // create the blog
  const blog = await db
    .insertInto("blogs")
    .values({ title, description, image_url, body, author_id })
    .returningAll()
    .executeTakeFirstOrThrow();

  // create/link the tags
  let blogTags: string[] = [];
  if (tags.length > 0) {
    // create the tags if they don't exist
    await db
      .insertInto("tags")
      .values(tags.map((id) => ({ id })))
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    // link the tags to the blog
    blogTags = await db
      .insertInto("blog_tags")
      .values(tags.map((id) => ({ tag_id: id, blog_id: blog.id })))
      .returning("tag_id")
      .execute()
      .then((tags) => tags.map(({ tag_id }) => tag_id));
  }

  return { ...blog, tags: blogTags };
}

// UPDATE
export interface IPatchBlogProps {
  /** The ID of the blog. */
  id: number;
  /** The body of the blog. */
  body?: string;
  /** The views count of the blog. */
  views?: number;
  /** The published status of the blog. */
  published?: boolean;
}
export async function patchBlog({ id, body, views, published }: IPatchBlogProps) {
  const db = await getPgClient();
  const logger = getLogger();

  if (body) {
    // validate & parse body for parts
    const ast = Markdoc.parse(body);
    const { title, description, image_url, tags } = validateFrontmatter(ast.attributes.frontmatter);
    const errors = Markdoc.validate(ast, config);
    if (errors.length > 0) throw errors;

    // Update Tags
    // -----------------------------------------------------------------------
    // get the tags to add/remove from the blog
    const existingTags = await db
      .selectFrom("blog_tags")
      .where("blog_id", "=", id)
      .select("tag_id")
      .execute()
      .then((tags) => tags.map((tag) => tag.tag_id));
    const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag));
    const tagsToAdd = tags.filter((tag) => !existingTags.includes(tag));

    // remove the tags from the blog
    if (tagsToRemove.length > 0) {
      // remove the relationship between the blog and tags
      await db.deleteFrom("blog_tags").where("blog_id", "=", id).where("tag_id", "in", tagsToRemove).execute();

      // delete all tags that are unused
      await db
        .deleteFrom("tags")
        .where("id", "in", (q) =>
          q
            .selectFrom("tags")
            .select("id")
            .leftJoin("blog_tags", "tags.id", "blog_tags.tag_id")
            .where("blog_tags.tag_id", "is", null)
        )
        .execute();
    }

    // add the tags to the blog
    if (tagsToAdd.length > 0) {
      // craete the tags if they don't dexist
      await db
        .insertInto("tags")
        .values(tagsToAdd.map((id) => ({ id, created_at: new Date(), modified_at: new Date() })))
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      // link the tags to the blog
      await db
        .insertInto("blog_tags")
        .values(tagsToAdd.map((tag_id) => ({ tag_id, blog_id: id })))
        .execute();
    }

    // Update Attachments
    // -----------------------------------------------------------------------
    // check which attachments are used in the blog
    const attachments = await db.selectFrom("attachments").where("blog_id", "=", id).selectAll().execute();
    const setToUsed = attachments.filter((attachment) => body.includes(attachment.url) && attachment.is_unused);
    const setToUnused = attachments.filter((attachment) => !body.includes(attachment.url) && !attachment.is_unused);

    // update the attachment records
    if (setToUsed.length > 0) {
      db.updateTable("attachments")
        .set({ is_unused: false, expires_at: null })
        .where(
          "id",
          "in",
          setToUsed.map((a) => a.id)
        )
        .execute();
    }
    if (setToUnused.length > 0) {
      db.updateTable("attachments")
        .set({ is_unused: true, expires_at: new Date(new Date().getTime() + ms("14d")) })
        .where(
          "id",
          "in",
          setToUnused.map((a) => a.id)
        )
        .execute();
    }

    // Update Blog
    // -----------------------------------------------------------------------
    await db
      .updateTable("blogs")
      .set({
        title,
        description,
        image_url,
        body,
        views,
        published,
        published_at: published ? db.fn.coalesce("published_at", sql<Date>`now()`) : undefined,
        body_modified_at: new Date(),
        modified_at: new Date(),
      })
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  } else {
    await db
      .updateTable("blogs")
      .set({
        views,
        published,
        published_at: published ? db.fn.coalesce("published_at", sql<Date>`now()`) : undefined,
        modified_at: new Date(),
      })
      .executeTakeFirstOrThrow();
  }

  // return the updated blog with tags
  return db
    .selectFrom("blogs")
    .leftJoin("blog_tags", "blog_tags.blog_id", "blogs.id")
    .select([
      "id",
      "title",
      "description",
      "published",
      "image_url",
      "author_id",
      "views",
      "created_at",
      sql<(string | null)[]>`array_agg(blog_tags.tag_id)`.as("tags"),
    ])
    .where("blogs.id", "=", id)
    .groupBy("blogs.id")
    .executeTakeFirstOrThrow();
}

// DELETE
export interface IDeleteBlogProps {
  /** The ID of the blog to delete. */
  id: number;
}
export async function deleteBlog(payload: IDeleteBlogProps) {
  const db = await getPgClient();
  const env = ZEnv.parse(process.env);
  const logger = getLogger();

  // Delete S3 Objects
  // -----------------------------------------------------------------------
  // get the keys to delete
  const keys = await db
    .selectFrom("attachments")
    .where("blog_id", "=", payload.id)
    .select("url")
    .execute()
    .then((items) => items.map(({ url }) => ({ Key: new URL(url).pathname.replace(/^\//, "") })));

  // batch into groups
  const MaxBatchSize = 1000;
  const batches = Array.from({ length: Math.ceil(keys.length / MaxBatchSize) }, (_, index) =>
    keys.slice(index * MaxBatchSize, (index + 1) * MaxBatchSize)
  ).map((batch) => batch.map(({ Key }) => ({ Key })));

  // delete the items
  const s3 = await getS3Client();
  await Promise.all(
    batches.map((batch) => s3.send(new DeleteObjectsCommand({ Bucket: env.BUCKET_NAME, Delete: { Objects: batch } })))
  ).catch((e) => {
    logger.error("There was an error deleting the S3 objects from the bucket: ");
    logger.error(e);
    throw e;
  });

  // Delete Blog Record
  // -----------------------------------------------------------------------
  const blog = await db
    .deleteFrom("blogs")
    .where("id", "=", payload.id)
    .returningAll()
    .executeTakeFirstOrThrow()
    .catch((e) => {
      logger.error("There was an error deleting the blog record from the database: ");
      logger.error(e);
      throw e;
    });

  // Remove All Orphaned Tags
  // -----------------------------------------------------------------------
  await db
    .deleteFrom("tags")
    .where("id", "in", (q) =>
      q
        .selectFrom("tags")
        .select("id")
        .leftJoin("blog_tags", "tags.id", "blog_tags.tag_id")
        .where("blog_tags.tag_id", "is", null)
    )
    .execute();

  return blog;
}
