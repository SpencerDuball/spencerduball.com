import { execute, takeFirstOrThrow } from "~/lib/util/utils.server";
import { db, getLogger } from "~/lib/util/globals.server";
import { sql } from "kysely";
import { compileMdx } from "~/model/blogs";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Config } from "sst/node/config";
import { Bucket } from "sst/node/bucket";
import crypto from "crypto";
// @ts-ignore
import ms from "ms"; // TODO: This package has types that aren't defined correctly when using "Bundler" module resolution strategy.

//---------------------------------------------------------------------------------------------------------------------
// Database Actions
// ----------------
// The database actions hold abstractions for modifications to a blog.
//---------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Blog
// ----
// All actions for the Blog items.
//-------------------------------------------------------------------------------------------------

// CREATE
// ----------------------------------------------------------------------------
export interface PostBlogProps {
  /** The ID of the author of this blog. */
  author_id: number;
  /** The body of the blog. */
  body: string;
}

/**
 * Creates a blog.
 */
export async function postBlog({ author_id, body }: PostBlogProps) {
  const log = getLogger();

  // ensure the blog compiles correctly
  const {
    frontmatter: { title, description, cover_img, tags },
  } = await compileMdx(body).catch((e) => {
    log.error(e, "Blog could not be successfully compiled.");
    throw e;
  });

  // generate the ID for the blog
  let id: string = "";
  while (!id) {
    const _id = crypto.randomBytes(4).toString("hex");
    const res = await execute(db.selectFrom("blogs").where("id", "=", id).where("id", "=", id).select("id"));
    if (res.length === 0) id = _id;
  }

  // create the blog
  const insertCmd = db
    .insertInto("blogs")
    .values({
      id,
      title,
      description,
      cover_img: JSON.stringify(cover_img),
      body,
      author_id,
    })
    .returning("id");
  const blog = await execute(insertCmd).then((res) => takeFirstOrThrow(res));

  // create the tags
  if (tags.length > 0) {
    const values = tags.map((name) => ({
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

  return blog;
}

/**
 * Gets the added and removed blog file ids from the difference of the stored and new body.
 *
 * @param storedBody The body of the blog that is stored in the database.
 * @param newBody The new body of the blog that is being updated.
 * @returns The added and removed blog file ids.
 */
function compareStoredAndNewBody(storedBody: string, newBody: string) {
  // parse the bucket links form each file
  const MatchBlogFiles = new RegExp(`${Config.BUCKET_URL}/blog/[0-9A-Fa-f]{8}/.+\-[0-9A-Fa-f]{8}\.[a-zA-Z]+`, "g");
  const oldFileBlogUrls = storedBody.match(MatchBlogFiles);
  const newFileBlogUrls = newBody.match(MatchBlogFiles);

  // find the difference between the old and new BlogUrls. Group the differences into added and removed, ignore unchanged.
  let addedBlogFileUrls: string[] = [];
  let removedBlogFileUrls: string[] = [];

  if (oldFileBlogUrls && newFileBlogUrls) {
    addedBlogFileUrls = newFileBlogUrls.filter((url) => !oldFileBlogUrls.includes(url));
    removedBlogFileUrls = oldFileBlogUrls.filter((url) => !newFileBlogUrls.includes(url));
  } else if (oldFileBlogUrls) {
    removedBlogFileUrls = oldFileBlogUrls;
  } else if (newFileBlogUrls) {
    addedBlogFileUrls = newFileBlogUrls;
  }

  // extract the added and removed blog file ids where the blog file id is the .+\-{BLOG_ID}\..+ portion of the url
  let addedBlogFileIds: string[] = [];
  let removedBlogFileIds: string[] = [];

  for (const url of addedBlogFileUrls) {
    const fileName = url.split("/").pop()!;
    const id = fileName.match(/.+\-([0-9A-Fa-f]{8})\..+$/);
    if (id) addedBlogFileIds.push(id[1]);
  }

  for (const url of removedBlogFileUrls) {
    const fileName = url.split("/").pop()!;
    const id = fileName.match(/.+\-([0-9A-Fa-f]{8})\..+$/);
    if (id) removedBlogFileIds.push(id[1]);
  }

  return { addedBlogFileIds, removedBlogFileIds };
}

// UPDATE
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
    // Get a diff of the stored body to the new body, parse for all references to the BlogFiles, then determine if a
    // BlogFile has been added:
    //
    // Added To Body - Need to ensure there is not an 'expires_at' for this BlogFile
    // Removed From Body - Need to ensure that the 'expires_at' has been updated to the current time.
    const { body: storedBody } = await execute(db.selectFrom("blogs").where("id", "=", id).select("body")).then((res) =>
      takeFirstOrThrow(res),
    );

    const { addedBlogFileIds, removedBlogFileIds } = compareStoredAndNewBody(storedBody, body);

    // remove the 'expires_at' for all added BlogFiles
    if (addedBlogFileIds.length > 0) {
      const updateCmd = db
        .updateTable("blog_files")
        .set({ expires_at: null })
        .where("blog_id", "=", id)
        .where("id", "in", addedBlogFileIds);
      await execute(updateCmd).catch((e) => {
        log.error(e, "There was an issue updating the blog_files in the database.");
        throw e;
      });
    }

    // update the 'expires_at' for all removed BlogFiles
    if (removedBlogFileIds.length > 0) {
      const updateCmd = db
        .updateTable("blog_files")
        .set({ expires_at: new Date(Date.now() + ms("30d")).toISOString() })
        .where("blog_id", "=", id)
        .where("id", "in", removedBlogFileIds);
      await execute(updateCmd).catch((e) => {
        log.error(e, "There was an issue updating the blog_files in the database.");
        throw e;
      });
    }

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

// DELETE
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

//-------------------------------------------------------------------------------------------------
// BlogFile
// --------
// All actions for the BlogFile items.
//-------------------------------------------------------------------------------------------------

// PUT
// ----------------------------------------------------------------------------
export interface PutBlogFileProps {
  /** The name of the blog file including the extension. */
  name: string;
  /** The size in bytes of the blog file. */
  size: number;
  /** The file extension of the blog file. */
  type: string;
  /** The blog that this blog file belongs to. */
  blogId: string;
  /** The expires_at time. */
  expires_at?: string | null;
}

/**
 * Adds a blog file.
 */
export async function putBlogFile({ name, size, type, blogId, expires_at }: PutBlogFileProps) {
  // generate the ID for the blog file
  let blogFileId: string = "";
  while (!blogFileId) {
    const id = crypto.randomBytes(4).toString("hex");
    const res = await execute(
      db.selectFrom("blog_files").where("blog_id", "=", blogId).where("id", "=", id).select("id"),
    );
    if (res.length === 0) blogFileId = id;
  }

  // get the file extension
  const ext = name.split(".").pop();
  if (!ext) throw new Error("The file name does not have an extension.");

  // create the url for the blog file
  const url = `${Config.BUCKET_URL}/blog/${blogId}/${name}-${blogFileId}.${ext}`;

  // Insert the record into SQL, by default it will expire in 30 days
  const insertCmd = db
    .insertInto("blog_files")
    .values({
      id: blogFileId,
      name,
      url,
      size,
      type,
      expires_at: expires_at === null ? null : new Date(Date.now() + ms("30d")).toISOString(),
      created_at: sql<string>`CURRENT_TIMESTAMP`,
      modified_at: sql<string>`CURRENT_TIMESTAMP`,
      blog_id: blogId,
    })
    .returningAll();
  const blogFile = await execute(insertCmd).then((res) => takeFirstOrThrow(res));

  // generate the presigned post url
  const s3 = new S3Client({});
  const Key = url.replace(new RegExp(`^${Config.BUCKET_URL}/`), "");
  const presignedPost = await createPresignedPost(s3, {
    Bucket: Bucket.Bucket.bucketName,
    Key,
    Fields: { "Content-Type": type },
  });

  return { presignedPost, blogFile };
}

// DELETE
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
  // Delete the record from SQL
  const deleteCmd = db.deleteFrom("blog_files").returning("url").where("blog_id", "=", blogId).where("id", "=", fileId);
  const { url } = await execute(deleteCmd).then((res) => takeFirstOrThrow(res));
  const Key = url.replace(new RegExp(`^${Config.BUCKET_URL}/`), "");

  // Delete the record from S3
  const s3 = new S3Client({});
  return s3.send(new DeleteObjectCommand({ Bucket: Bucket.Bucket.bucketName, Key }));
}
