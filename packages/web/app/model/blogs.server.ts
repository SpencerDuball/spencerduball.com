import { execute } from "~/lib/util/utils.server";
import { db } from "~/lib/util/globals.server";
import { sql } from "kysely";

//---------------------------------------------------------------------------------------------------------------------
// Database Actions
// ----------------
// The database actions hold abstractions for modifications to a blog.
//---------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// UPDATE
//-------------------------------------------------------------------------------------------------
export interface PatchBlogProps {
  /** The ID of the blog. */
  id: number;
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
  const updateCmd = db
    .updateTable("blogs")
    .set({
      views,
      published,
      published_at: published ? db.fn.coalesce("published_at", sql<string>`CURRENT_TIMESTAMP`) : undefined,
      modified_at: new Date().toString(),
    })
    .where("id", "=", id);
  return execute(updateCmd);
}

//-------------------------------------------------------------------------------------------------
// DELETE
//-------------------------------------------------------------------------------------------------
export interface DeleteBlogProps {
  /** The ID of the blog. */
  id: number;
}

/**
 * Deletes a blog.
 */
export async function deleteBlog({ id }: DeleteBlogProps) {
  const deleteCmd = db.deleteFrom("blogs").where("id", "=", id);
  return execute(deleteCmd);
}
