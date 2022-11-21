import { z } from "zod";

export const BlogSchema = {
  name: "Blog",
  attributes: {
    pk: { partitionKey: true, type: "string", default: (data: { id: string }) => `blog#${data.id}` },
    sk: { sortKey: true, type: "string", default: (data: { id: string }) => `blog#${data.id}` },
    id: { type: "string", required: true },
    title: { type: "string", required: true },
    image_url: { type: "string", required: true },
    tags: { type: "list" },
    s3_url: { type: "string", required: true },
    author_id: { type: "string", required: true },
    views: { type: "number", required: true },
    content_modified: { type: "string", required: true },
    published: { type: "boolean", default: false },
  },
};

export const ZBlog = z.object({
  pk: z.string(),
  sk: z.string(),
  id: z.string(),
  title: z.string(),
  image_url: z.string(),
  tags: z.array(z.string()).optional(),
  s3_url: z.string(),
  author_id: z.string(),
  views: z.number(),
  content_modified: z.string(),
  published: z.boolean(),
});

export type BlogType = ReturnType<typeof ZBlog.parse>;
