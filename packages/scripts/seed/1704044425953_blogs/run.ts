import fs from "fs-extra";
import mime from "mime";
import { glob } from "glob";
import { clearBucket, type ScriptInput } from "../../db/lib";
import { Bucket } from "sst/node/bucket";
import { Config } from "sst/node/config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

const ZBlog = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cover_img: z.string(),
  body: z.string(),
  views: z.number(),
  published: z.boolean(),
  published_at: z.string().datetime().nullable(),
  body_modified_at: z.string().datetime(),
  created_at: z.string().datetime(),
  modified_at: z.string().datetime(),
  author_id: z.number(),
});

const ZBlogTag = z.object({
  name: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  blog_id: z.number(),
});

const ZBlogFile = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  alt: z.string(),
  size: z.number(),
  type: z.string(),
  expires_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  modified_at: z.string().datetime(),
  blog_id: z.number(),
});

/**
 * This procedure is meant to be called from the database scripts and will insert seed data. This includes data
 * that represents the state of the application at a given point in time (users/posts/comments/etc).
 */
export async function up({ sqldb, s3Client }: ScriptInput) {
  if (!sqldb) throw new Error("sqldb was not passed and is required.");
  if (!s3Client) throw new Error("s3Client was not supplied and is required.");

  // seed the "blogs" table
  const blogsFileUrl = new URL("./data/blogs.json", import.meta.url);
  const blogsData = await fs.readJson(blogsFileUrl).then((blogs) => ZBlog.array().parse(blogs));
  for (let blog of blogsData) {
    blog.cover_img = blog.cover_img.replace(/\{\{S3_BUCKET_URL\}\}/g, Config.BUCKET_URL);
    blog.body = blog.body.replace(/\{\{S3_BUCKET_URL\}\}/g, Config.BUCKET_URL);
  }
  await sqldb.insertInto("blogs").values(blogsData).execute();

  // seed the "blog_tags" table
  const blogTagsFileUrl = new URL("./data/blog_tags.json", import.meta.url);
  const blogTagsData = await fs.readJson(blogTagsFileUrl).then((blogTags) => ZBlogTag.array().parse(blogTags));
  await sqldb.insertInto("blog_tags").values(blogTagsData).execute();

  // ------------------------------------------------------------------------------------------------------------------
  // Seed Blog Files
  // ---------------
  // To seed the blog_files we need to upload info to the SQL database, and then we can upload the image files to S3.
  // ------------------------------------------------------------------------------------------------------------------
  // (1) seed the "blog_files" table
  const blogFilesFileUrl = new URL("./data/blog_files.json", import.meta.url);
  const blogFilesData = await fs.readJson(blogFilesFileUrl).then((blogFiles) => ZBlogFile.array().parse(blogFiles));
  for (let blogFile of blogFilesData) blogFile.url = blogFile.url.replace(/\{\{S3_BUCKET_URL\}\}/g, Config.BUCKET_URL);
  await sqldb.insertInto("blog_files").values(blogFilesData).execute();

  // (2) upload blog photos to S3
  const AssetsPath = new URL("./assets", import.meta.url);
  const assets = await glob(`${AssetsPath.pathname}/**/*`, { nodir: true });
  await Promise.all([
    assets.map(async (asset) => {
      const Key = asset.replace(new RegExp(`^${AssetsPath.pathname}`), "").replace(/^\//, "");
      const Body = await fs.readFile(asset);
      const ContentType = mime.getType(asset) || "text/plain";
      const options = { Bucket: Bucket.Bucket.bucketName, Key, Body, ContentType };
      return s3Client.send(new PutObjectCommand(options));
    }),
  ]);
}

/**
 * This procedure is meant to be called from the database scripts and will delete seed data.
 */
export async function down({ sqldb, s3Client }: ScriptInput) {
  if (!sqldb) throw new Error("sqldb was not passed and is required.");
  if (!s3Client) throw new Error("s3Client was not supplied and is required.");

  // delete items from all tables
  await sqldb.deleteFrom("blogs").execute();
  await sqldb.deleteFrom("blog_tags").execute();
  await sqldb.deleteFrom("blog_files").execute();

  // delete all S3 items
  await clearBucket({ Bucket: Bucket.Bucket.bucketName, s3Client, prefix: "blog/" });
}
