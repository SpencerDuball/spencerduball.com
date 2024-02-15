import { execute } from "~/lib/util/utils.server";
import { db, getLogger } from "~/lib/util/globals.server";
import { sql } from "kysely";
import { compileMdx } from "~/model/blogs";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Config } from "sst/node/config";
import { Bucket } from "sst/node/bucket";

//---------------------------------------------------------------------------------------------------------------------
// Database Actions
// ----------------
// The database actions hold abstractions for modifications to a blog.
//---------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// UPDATE
//-------------------------------------------------------------------------------------------------

// Blog
// ----------------------------------------------------------------------------
export interface PatchBlogProps {
  /** The ID of the blog. */
  id: string;
  /** The body of the blog. */
  body?: string;
  /** The views count of the blog. */
  views?: number;
  /** The published status of the blog. */
  published?: boolean;
}

/**
 * Updates a blog.
 */
export async function patchBlog({ id, body, views, published }: PatchBlogProps) {
  const log = getLogger();

  if (body) {
    // ensure the blog compiles correctly
    const {
      frontmatter: { title, description, cover_img, tags },
    } = await compileMdx(body).catch((e) => {
      log.error(e, "Blog could not be successfully compiled.");
      throw e;
    });

    // Update Tags
    // ------------------------------------------------------------------------
    // get the tags to add/remove from the blog
    const existingTags = await execute(db.selectFrom("blog_tags").where("blog_id", "=", id).select("name"))
      .then((tags) => tags.map(({ name }) => name))
      .catch((e) => {
        log.error(e, "There was an error retrieving blog_tags from the database.");
        throw e;
      });
    const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag));
    const tagsToAdd = tags.filter((tag) => !existingTags.includes(tag));

    // remove the tags from the blog
    if (tagsToRemove.length > 0) {
      await execute(db.deleteFrom("blog_tags").where("blog_id", "=", id).where("name", "in", tagsToRemove)).catch(
        (e) => {
          log.error(e, "There was an error deleting the blog_tags from the database.");
          throw e;
        },
      );
    }

    // add the tags to the blog
    if (tagsToAdd.length > 0) {
      const values = tagsToAdd.map((name) => ({
        name,
        blog_id: id,
        created_at: sql<string>`CURRENT_TIMESTAMP`,
        modified_at: sql<string>`CURRENT_TIMESTAMP`,
      }));
      await execute(db.insertInto("blog_tags").values(values)).catch((e) => {
        log.error(e, "There was an issue adding blogs to the database.");
        throw e;
      });
    }

    // Update Blog Files
    // ------------------------------------------------------------------------
    // TODO: Implement this after implementing the files tab.

    // Update Blog
    // ------------------------------------------------------------------------
    // Finally update the blog itself.
    const updateCmd = db
      .updateTable("blogs")
      .set({
        title,
        description,
        cover_img: JSON.stringify(cover_img),
        body,
        views,
        published,
        published_at: published ? db.fn.coalesce("published_at", sql<string>`CURRENT_TIMESTAMP`) : undefined,
        modified_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id);

    return execute(updateCmd);
  } else {
    const updateCmd = db
      .updateTable("blogs")
      .set({
        views,
        published,
        published_at: published ? db.fn.coalesce("published_at", sql<string>`CURRENT_TIMESTAMP`) : undefined,
        modified_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id);

    return execute(updateCmd);
  }
}

// BlogFile
// ---------------------------------------------------------------------------
export interface PatchBlogFileProps {
  /** The ID of the blog. */
  blogId: string;
  /** The ID of the file. */
  fileId: string;
  /** The name of the file. */
  name?: string;
  /** The alt text of the file. */
  alt?: string;
}

/**
 * Patches a blog file.
 */
export async function patchBlogFile({ blogId, fileId, name, alt }: PatchBlogFileProps) {
  // Copy with new name, then delete old object in S3

  // Update the record in SQL
  const patchCmd = db
    .updateTable("blog_files")
    .set({ name, alt })
    .where("blog_id", "=", blogId)
    .where("id", "=", fileId);
  return execute(patchCmd);
}

//-------------------------------------------------------------------------------------------------
// DELETE
//-------------------------------------------------------------------------------------------------

// Blog
// ----------------------------------------------------------------------------
export interface DeleteBlogProps {
  /** The ID of the blog. */
  id: string;
}

/**
 * Deletes a blog.
 */
export async function deleteBlog({ id }: DeleteBlogProps) {
  // Update the record in SQL
  const deleteCmd = db.deleteFrom("blogs").where("id", "=", id);
  return execute(deleteCmd);
}

// BlogFile
// ----------------------------------------------------------------------------
export interface DeleteBlogFileProps {
  /** The ID of the blog. */
  blogId: string;
  /** The ID of the blog file. */
  fileId: string;
}

/**
 * Deletes a blog file.
 */
export async function deleteBlogFile({ blogId, fileId }: DeleteBlogFileProps) {
  // TODO: Delete the file from S3

  // Delete the record from SQL
  const deleteCmd = db.deleteFrom("blog_files").where("blog_id", "=", blogId).where("id", "=", fileId);
  return execute(deleteCmd);
}
