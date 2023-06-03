import { z } from "zod";

export const ZUser = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  avatar_url: z.string(),
  github_url: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type IUser = z.infer<typeof ZUser>;

export const ZRole = z.object({
  id: z.string(),
  description: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type IRole = z.infer<typeof ZRole>;

export const ZUserRole = z.object({
  user_id: z.number(),
  role_id: z.string(),
});
export type IUserRole = z.infer<typeof ZUserRole>;

export const ZBlog = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  body: z.string(),
  author_id: z.number(),
  views: z.number(),
  published: z.boolean(),
  published_at: z.null().or(z.coerce.date()),
  body_modified_at: z.coerce.date(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type IBlog = z.infer<typeof ZBlog>;

export const ZTag = z.object({
  id: z.string(),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
});
export type ITag = z.infer<typeof ZTag>;

export const ZBlogTag = z.object({
  blog_id: z.number(),
  tag_id: z.string(),
});
export type IBlogTag = z.infer<typeof ZBlogTag>;

export const ZAttachment = z.object({
  id: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
  blog_id: z.null().or(z.number()),
  is_unused: z.boolean(),
  expires_at: z.null().or(z.coerce.date()),
  created_at: z.coerce.date(),
  modified_at: z.coerce.date(),
  _: z.object({
    fileUri: z.string(),
  }),
});
export type IAttachment = z.infer<typeof ZAttachment>;
