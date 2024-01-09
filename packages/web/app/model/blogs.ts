import { IBlog } from "@spencerduballcom/db/sqldb";
import { z } from "zod";
import { ZJsonString } from "~/lib/util/utils";

//---------------------------------------------------------------------------------------------------------------------
// Zod Types
//---------------------------------------------------------------------------------------------------------------------

export const ZBlog = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cover_img: z.object({ alt: z.string(), url: z.string() }),
  body: z.string(),
  views: z.number(),
  published: z.boolean(),
  published_at: z.string().nullable(),
  body_modified_at: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  author_id: z.number(),
});

export const ZBlogWithTags = ZBlog.extend({
  tags: z.string().transform((str: string) => (str.length > 0 ? str.split(",") : [])),
});

export const ZBlogMeta = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  cover_img: ZBlog.shape.cover_img,
});

//---------------------------------------------------------------------------------------------------------------------
// Database Utilities
//---------------------------------------------------------------------------------------------------------------------
/**
 * Takes in the 'tags' string from the database and parses it into an array of tags.
 *
 * @param tags The CSV tags string from the database.
 * @returns An array of tags.
 */
export function tagsTfmr(tags: string) {
  return tags.length > 0 ? tags.split(",") : [];
}

/**
 * Takes in the 'cover_img' string from the database and parses it into the JSON object.
 *
 * @param cover_img The cover_img JSON string from the database.
 * @returns The cover_img object.
 */
export function coverImgTfmr(cover_img: string) {
  return ZJsonString.pipe(ZBlog.shape.cover_img).parse(cover_img);
}
