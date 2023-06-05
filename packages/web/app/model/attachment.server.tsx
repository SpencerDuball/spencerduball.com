import { ZEnv, getPgClient, getS3Client } from "~/lib/util.server";
import { sql } from "kysely";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

/* ------------------------------------------------------------------------------------------------------------
 * CRUD Actions
 * ------------------------------------------------------------------------------------------------------------ */

// CREATE
export interface ICreateAttachment {
  size: number;
  type: string;
  blog_id?: number;
  is_unused?: boolean;
  expires_at?: Date | null;
}
export async function createAttachment({ size, type, is_unused, expires_at, blog_id }: ICreateAttachment) {
  const db = await getPgClient();
  const env = ZEnv.parse(process.env);

  // assign object-specific properities
  let [urlPrefix, ext] = ["", type.split("/").pop()];
  if (blog_id) {
    urlPrefix = `${env.BUCKET_URL}/public/blog/${blog_id}/attachment/`;
  } else throw new Error("Attachments must be linked to another object.");

  // create the blogpost attachment sql record
  const id = randomUUID();
  const attachment = await db
    .insertInto("attachments")
    .values({
      id,
      size,
      type,
      url: `${urlPrefix}${id}.${ext}`,
      blog_id,
      is_unused: is_unused ? is_unused : true,
      expires_at: expires_at ? expires_at : null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // generate the presigned-post URL
  const s3Client = await getS3Client();
  const key = new URL(attachment.url).pathname.replace(/^\//, "");
  const presignedPost = await createPresignedPost(s3Client, {
    Bucket: env.BUCKET_NAME,
    Key: key,
    Fields: { "Content-Type": attachment.type },
  });

  return { attachment, presignedPost };
}

// UPDATE
export interface IPatchAttachment {
  id: string;
  is_unused?: boolean;
  expires_at?: Date | null;
}
export async function patchAttachment({ id, is_unused, expires_at }: IPatchAttachment) {
  const db = await getPgClient();

  // patch the attachment
  const attachment = await db
    .updateTable("attachments")
    .set({ is_unused, expires_at })
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return attachment;
}

// DELETE
export interface IDeleteAttachment {
  id: string;
}
export async function deleteAttachment({ id }: IDeleteAttachment) {
  const db = await getPgClient();

  // delete the attachment
  const attachment = await db.deleteFrom("attachments").where("id", "=", id).returningAll().executeTakeFirstOrThrow();

  // delete the s3 object
  const env = ZEnv.parse(process.env);
  const s3Client = await getS3Client();
  const key = new URL(attachment.url).pathname.replace(/^\//, "");
  await s3Client.send(new DeleteObjectCommand({ Bucket: env.BUCKET_NAME, Key: key }));

  return attachment;
}
