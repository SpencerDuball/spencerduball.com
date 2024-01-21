import { IBlog as _IBlog } from "@spencerduballcom/db/sqldb";
import { z } from "zod";
import { Simplify, Selectable } from "kysely";

//---------------------------------------------------------------------------------------------------------------------
// Zod Types
//---------------------------------------------------------------------------------------------------------------------

// The type of the full Blog as returned from a SQL query.
export interface ISqlBlog extends Selectable<_IBlog> {
  tags: string;
}

// The type of the full Blog after raw SQL response has been transformed into appropriate objects.
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
  tags: z.string().array(),
});
export type IBlog = z.infer<typeof ZBlog>;

// The type of the Blog's meta information contained in the frontmatter.
export const ZBlogMeta = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  cover_img: ZBlog.shape.cover_img,
});
export type IBlogMeta = z.infer<typeof ZBlogMeta>;

//---------------------------------------------------------------------------------------------------------------------
// Database Utilities
//---------------------------------------------------------------------------------------------------------------------

/**
 * This function takes in a SQL response and transforms it into a more accurate JavaScript object representation of the
 * Blog.
 */
export function parseBlog<T extends Partial<ISqlBlog>>(
  blog: T,
): Simplify<Pick<IBlog, keyof T extends Partial<keyof ISqlBlog> ? keyof T : never>> {
  const _blog = { ...blog } as any;
  if (blog.cover_img) _blog.cover_img = JSON.parse(blog.cover_img);
  if (blog.published_at) _blog.published_at = new Date(blog.published_at);
  if (blog.body_modified_at) _blog.body_modified_at = new Date(blog.body_modified_at);
  if (blog.created_at) _blog.created_at = new Date(blog.created_at);
  if (blog.modified_at) _blog.modified_at = new Date(blog.modified_at);
  if (blog.tags) _blog.tags = blog.tags.length > 0 ? blog.tags.split(",") : [];
  return _blog;
}
