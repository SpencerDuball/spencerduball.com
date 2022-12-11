import { json } from "@remix-run/node";
import { bundleMDX } from "mdx-bundler";
import { ZodError } from "zod";
import { z } from "zod";
import { importRemarkGfm, importRemarkMdxCodeMeta } from "~/es-modules";
import { ZPreviewResponse } from "./blog.shared";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { Table, ZBlog } from "table";
import type { BlogType } from "table";
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomBytes } from "crypto";
import yaml from "js-yaml";
import { HttpError } from "~/util";
import axios from "axios";
import { IAttachment } from "~/components";

// check for required environment variables
if (!process.env.REGION) throw new Error("'REGION' env-var is not defined.");
if (!process.env.TABLE_NAME) throw new Error("'TABLE_NAME' env-var is not defined.");
if (!process.env.BUCKET_NAME) throw new Error("'BUCKET_NAME' env-var is not defined.");
const { BUCKET_NAME, TABLE_NAME, REGION } = process.env;

// create the aws-sdk clients
const ddbClient = new DynamoDB.DocumentClient({ region: REGION });
const table = new Table({ tableName: TABLE_NAME, client: ddbClient });
const s3Client = new S3Client({ region: REGION });

// Util
//////////////////////////////////////////////////////////////////////////
/**
 * Parses the MDX string and extracts the: title, image, and tags. This function also validates that
 * the MDX string has the proper frontmatter.
 *
 * @param mdx The mdx string.
 * @returns
 */
async function parseMdx(mdx: string) {
  const { title, image, tags } = await ZBlogPostBundle.shape.frontmatter
    .parseAsync(yaml.load(z.string().parse(mdx.split("---")[1])))
    .catch((e) => {
      if (e instanceof ZodError) {
        if (e.issues[0].path.includes("title"))
          throw new HttpError(400, "Frontmatter attribute 'title' must be supplied as a string.");
        if (e.issues[0].path.includes("image"))
          throw new HttpError(400, "Frontmatter attribute 'image' must be supplied as a string.");
        if (e.issues[0].path.includes("tags"))
          throw new HttpError(400, "Frontmatter attribute 'image' must be supplied as a string array.");
      }
      throw new HttpError(400, "Invalid MDX document was sent.");
    });
  return { title, image, tags, mdx };
}

// Preview
//////////////////////////////////////////////////////////////////////////
const mdxOptionsFn = async () => {
  const { default: remarkGfm } = await importRemarkGfm();
  const { default: remarkMdxCodeMeta } = await importRemarkMdxCodeMeta();
  const mdxOptions: Parameters<typeof bundleMDX>[0]["mdxOptions"] = (options, frontmatter) => {
    options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm, remarkMdxCodeMeta];
    options.rehypePlugins = [...(options.rehypePlugins ?? [])];
    return options;
  };
  return mdxOptions;
};

const ZBlogPostBundle = z.object({
  code: z.string(),
  frontmatter: z.object({
    title: z.string().min(3),
    image: z.string(),
    tags: z.string().array(),
  }),
});

/**
 * Takes the form data and return the code and frontmatter for preview.
 *
 * @param mdx The raw FormDataEntryValue.
 */
export async function preview(mdx: FormDataEntryValue | null) {
  return await z
    .string()
    .parseAsync(mdx)
    .then(async (mdx) => ZBlogPostBundle.parseAsync(await bundleMDX({ source: mdx, mdxOptions: await mdxOptionsFn() })))
    .then(async (bundle) => json(await ZPreviewResponse.parseAsync({ code: bundle.code, ...bundle.frontmatter })))
    .catch((e: ZodError) => json({ errorMessage: e.message }, 400));
}

// Create
//////////////////////////////////////////////////////////////////////////
export interface CreateBlogProps {
  mdx: string;
  authorId: string;
  published?: boolean;
}
export async function createBlog(props: CreateBlogProps) {
  // create a new blog id
  const blogId = randomBytes(5).toString("hex");

  // create the payload
  const { title, image, tags, mdx } = await parseMdx(props.mdx);
  const s3_url = `https://${BUCKET_NAME}.s3.amazonaws.com/public/blog/${blogId}`;
  let payload = {
    id: blogId,
    title,
    image_url: image,
    tags,
    s3_url,
    author_id: props.authorId,
    published: props.published ? props.published : false,
  };

  // create the blog record in dynamodb
  const ensureAuthorExistsTx = table.entities.user.conditionCheck(
    { pk: `user#${payload.author_id}`, sk: `user#${payload.author_id}` },
    { conditions: { attr: "pk", exists: true } }
  );
  const createBlogTx = table.entities.blog.putTransaction(payload, { conditions: [{ attr: "pk", exists: false }] });
  table.table.transactWrite([ensureAuthorExistsTx, createBlogTx]).catch(() => {
    throw new HttpError(500, "Error creating new blog record, please try again.");
  });

  // upload blog template to s3
  s3Client
    .send(new PutObjectCommand({ Bucket: BUCKET_NAME, Key: `public/blog/${blogId}/blog.mdx`, Body: mdx }))
    .catch(() => {
      throw new HttpError(500, "Error creating new blog record, please try again.");
    });
}

// Read
//////////////////////////////////////////////////////////////////////////
export const GetBlogsSortOptions = ["created-asc", "created-desc", "views-asc", "views-desc"] as const;
export interface GetBlogsProps {
  published: boolean;
  sort?: typeof GetBlogsSortOptions[number];
  startAt?: string;
  limit?: number;
}
export async function getBlogs(props: GetBlogsProps): Promise<BlogType[]>;
export async function getBlogs(props: GetBlogsProps, type: "withMdx"): Promise<(BlogType & { mdx: string })[]>;
export async function getBlogs(props: GetBlogsProps, type?: "withMdx") {
  const sort = !props.sort || props.sort.startsWith("created") ? "created" : "views";
  // collect configuration
  const config = {
    limit: props.limit || 50,
    reverse: props.sort && props.sort.endsWith("asc") ? true : false,
    index: sort === "created" ? "gsi1" : "gsi2",
  };

  // caputure blogs
  let blogsQuery = null;
  if (sort === "created")
    blogsQuery = table.table.query("blog", { ...config, beginsWith: `published#${props.published}#created` });
  else blogsQuery = table.table.query("blog", { ...config, beginsWith: `published#${props.published}#views` });

  // validate the blogs shape
  const blogs = await blogsQuery
    .then(({ Items }) => z.array(ZBlog).parse(Items))
    .catch(() => {
      throw new HttpError(500, "There was an issue retrieving the blogs, please try again.");
    });

  // get the mdx if specified
  if (type === "withMdx") {
    const blogsWithMdx = await Promise.all(
      blogs.map(async (blog) => {
        const { mdx } = await axios.get(`${blog.s3_url}/blog.mdx`).then(({ data }) => parseMdx(data));
        return { ...blog, mdx };
      })
    );

    return blogsWithMdx;
  } else return blogs;
}

export async function getBlog(id: string): Promise<BlogType | null>;
export async function getBlog(id: string, type: "withMdx"): Promise<(BlogType & { mdx: string }) | null>;
export async function getBlog(id: string, type?: "withMdx") {
  const blog = await table.entities.blog
    .get({ pk: `blog#${id}`, sk: `blog#${id}` })
    .then(({ Item }) => ZBlog.parse(Item))
    .catch(() => null);

  if (blog && type && type === "withMdx") {
    const { mdx } = await axios.get(`${blog.s3_url}/blog.mdx`).then(({ data }) => parseMdx(data));
    return { ...blog, mdx };
  } else return blog;
}

// Update
//////////////////////////////////////////////////////////////////////////
const ZBlogPartial = ZBlog.partial();
export interface UpdateBlogProps {
  author_id?: string;
  views?: number;
  published?: boolean;
  mdx?: string;
}
export async function updateBlog(id: string, props: UpdateBlogProps) {
  const { mdx, ...rest } = props;

  let fieldsToUpdate: z.infer<typeof ZBlogPartial> = { ...rest };

  // extract frontmatter
  if (mdx) {
    const { title, image, tags } = await parseMdx(mdx);
    fieldsToUpdate = { title, image_url: image, tags, content_modified: new Date().toISOString(), ...fieldsToUpdate };
  }

  // update dynamodb record
  const updateRecord = table.entities.blog.update({ pk: `blog#${id}`, sk: `blog#${id}`, ...fieldsToUpdate });
  const updateS3 = s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET_NAME, Key: `public/blog/${id}/blog.mdx`, Body: mdx })
  );
  await Promise.all([updateRecord, updateS3]);
}

// Delete
//////////////////////////////////////////////////////////////////////////
export async function deleteBlog(id: string) {
  // delete the dynamodb record
  table.entities.blog.delete({ pk: `blog#${id}`, sk: `blog#${id}` }).catch(() => {
    throw new HttpError(500, "Error deleting blog record, please try again.");
  });

  // delete the s3 items
  const s3Config = { Bucket: BUCKET_NAME };
  s3Client
    .send(new ListObjectsV2Command({ ...s3Config, Prefix: `public/blog/${id}` }))
    .then((items) => {
      const itemsToDelete = items.Contents?.map((item) => ({ Key: item.Key })) || null;
      if (itemsToDelete) s3Client.send(new DeleteObjectsCommand({ ...s3Config, Delete: { Objects: itemsToDelete } }));
    })
    .catch(() => {
      throw new HttpError(500, "Error deleting blog record, please try again.");
    });
}

// S3 Uploads
//////////////////////////////////////////////////////////////////////////
export async function getPresignedPost(blogId: string, attachment: IAttachment) {
  const ext = attachment.mime.split("/").pop();
  return createPresignedPost(s3Client, {
    Bucket: BUCKET_NAME,
    Key: `public/blog/${blogId}/attachments/${attachment.id}.${ext}`,
  });
}
