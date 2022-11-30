import { json } from "@remix-run/node";
import { bundleMDX } from "mdx-bundler";
import { ZodError } from "zod";
import { z } from "zod";
import { importRemarkGfm, importRemarkMdxCodeMeta } from "~/es-modules";
import { ZPreviewResponse } from "./blog.shared";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { BlogType, Table, ZBlog } from "table";
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import yaml from "js-yaml";
import { HttpError } from "~/util";
import axios from "axios";

// check for required environment variables
if (!process.env.REGION) throw new Error("'REGION' env-var is not defined.");
if (!process.env.TABLE_NAME) throw new Error("'TABLE_NAME' env-var is not defined.");
if (!process.env.BUCKET_NAME) throw new Error("'BUCKET_NAME' env-var is not defined.");

// create the aws-sdk clients
const ddbClient = new DynamoDB.DocumentClient({ region: process.env.REGION });
const table = new Table({ tableName: process.env.TABLE_NAME, client: ddbClient });
const s3Client = new S3Client({ region: process.env.REGION });

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
  const s3_url = `https://${process.env.BUCKETNAME}.s3.amazonaws.com/public/blog/${blogId}`;
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
    .send(new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: `public/blog/${blogId}/blog.mdx`, Body: mdx }))
    .catch(() => {
      throw new HttpError(500, "Error creating new blog record, please try again.");
    });
}

// Read
//////////////////////////////////////////////////////////////////////////
export interface GetBlogsProps {
  page: number;
  limit?: number;
}
export async function getBlogs(props: GetBlogsProps) {
  const blogsQuery = await table.table.query("blog", {
    limit: props.limit || 50,
    beginsWith: `published#false#created`,
    index: "gsi1",
  });

  const blogs = blogsQuery.Items?.map((item) => {
    const { entity, gsi1pk, gsi1sk, gsi2pk, gsi2sk, modified, pk, sk, ...rest } = ZBlog.parse(item);
    return rest;
  });

  return blogs || null;
}

export async function getBlog(id: string): Promise<BlogType | null>;
export async function getBlog(id: string, type: "withMdx"): Promise<(BlogType & { mdx: string }) | null>;
export async function getBlog(id: string, type?: "withMdx") {
  const blog = await table.entities.blog
    .get({ pk: `blog#${id}`, sk: `blog#${id}` })
    .then(({ Item }) => ZBlog.parse(Item))
    .catch(() => null);

  if (blog && type && type === "withMdx") {
    const { mdx } = await axios
      .get(`${blog.s3_url}/blog.mdx`)
      .then(({ data }) => parseMdx(data))
      .catch();
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
    const { title, image, tags } = ZBlogPostBundle.shape.frontmatter.parse(
      yaml.load(z.string().parse(mdx.split("---")[1]))
    );
    fieldsToUpdate = { title, image_url: image, tags, content_modified: new Date().toISOString(), ...fieldsToUpdate };
  }

  // update dynamodb record
  await table.entities.blog.update({ pk: `blog#${id}`, sk: `blog#${id}`, ...fieldsToUpdate });

  // update s3 blog.mdx
  await s3Client.send(
    new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: `public/blog/${id}/blog.mdx`, Body: mdx })
  );
}

// Delete
//////////////////////////////////////////////////////////////////////////
export async function deleteBlog(id: string) {
  // delete the dynamodb record
  table.entities.blog.delete({ pk: `blog#${id}`, sk: `blog#${id}` }).catch(() => {
    throw new HttpError(500, "Error deleting blog record, please try again.");
  });

  // delete the s3 items
  const s3Config = { Bucket: process.env.BUCKET_NAME };
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
