import { faker } from "@faker-js/faker";
import path from "path";
import fs from "fs-extra";
import {
  ZTag,
  ZUser,
  ZUserRole,
  ZBlog,
  type IUser,
  type IBlogTag,
  type IBlog,
  type IAttachment,
} from "../seed-types.js";
import { randomUUID } from "crypto";
import { format } from "prettier";

/**
 * Given a probability, randomly determines if success or fail.
 *
 * @param n The probability 0.0 - 1.0 of success.
 * @returns True if successful.
 */
function probability(n: number) {
  return !!n && Math.random() <= n;
}

/**
 * Generates the set of combinations for the supplied items.
 *
 * @param items An array of items to compute the combinations from.
 * @returns
 */
function combinations<T>(items: T[]) {
  let results: T[][] = [];
  for (let slots = items.length; slots > 0; slots--) {
    for (let loop = 0; loop < items.length - slots + 1; loop++) {
      let key = results.length;
      results[key] = [];
      for (let i = loop; i < loop + slots; i++) {
        results[key].push(items[i]);
      }
    }
  }
  return results;
}

/**
 * Generates an attachment record. The two required options to be passed are
 * `blog_id` and `created_at`.
 *
 * @param options All attributes of an attachment.
 * @returns
 */
async function generateAttachment({
  blog_id,
  created_at,
  ...options
}: Partial<IAttachment> & Pick<IAttachment, "blog_id" | "created_at">) {
  // read all the splash images
  const splashImagesPath = path.join("scripts", "seed", "assets", "splash-images");
  const splashImages = await fs.readdir(splashImagesPath);

  // select a random splash image
  const id = randomUUID();
  const splashImage = splashImages[faker.number.int(splashImages.length - 1)];
  const size = await fs.stat(path.join(splashImagesPath, splashImage)).then(({ size }) => size);
  const ext = path.extname(splashImage);
  const type = `image/${ext.replace(/^\./, "")}`;

  return {
    id,
    size,
    type,
    url: `{{S3_BUCKET_URL}}/public/blog/${blog_id}/${id}${ext}`,
    blog_id,
    is_unused: false,
    expires_at: null,
    created_at,
    modified_at: created_at,
    _: { fileUri: path.join(splashImagesPath, splashImage) },
    ...options,
  } satisfies IAttachment;
}

interface IBlogGeneratorProps {
  blogId: number;
  author: IUser;
  tagIds: string[];
}
async function generateBlog({ blogId, author, tagIds }: IBlogGeneratorProps) {
  // create blog object, assign initial attributes
  let blog: Partial<IBlog> = {};
  blog.id = blogId;
  blog.author_id = author.id;
  blog.created_at = faker.date.future({ refDate: author.created_at, years: 4 });

  // Define Objects for Relation Records
  // -------------------------------------------------------------------------
  // A blog has relations [`blog_tags`, `attachments`]. Define objects to hold
  // these generated records which will be returned and used in the creation
  // of this blog.
  const blogTags: IBlogTag[] = [];
  const attachments: IAttachment[] = [];

  // Generate `published` & `published_at`
  // -------------------------------------------------------------------------
  // 1. `published` - The blog has an 80% chance of being published.
  // 2. `published_at`
  //    - If the blog is published, it will have been published sometime after
  //      it was created, probably within 6 months of creation.
  //    - It is possible to unpublish a post, so 20% of the time when the post
  //      is not published it may have been published in the past.
  const isPublished = probability(0.8);
  if (isPublished) {
    blog.published = true;
    blog.published_at = faker.date.future({ refDate: blog.created_at!, years: 0.5 });
  } else {
    blog.published = false;
    const hasBeenUnpublished = probability(0.2);
    if (hasBeenUnpublished) blog.published_at = faker.date.future({ refDate: blog.created_at, years: 0.5 });
    else blog.published_at = null;
  }

  // Generate `views`
  // -------------------------------------------------------------------------
  // If the post has been published at some point in the past, it might have
  // views. If the post has never been published, the views counter will be 0.
  blog.views = blog.published_at ? faker.number.int(15000) : 0;

  // Generate `body`
  // -------------------------------------------------------------------------
  // The body will contain frontmatter which will define the `blog_tags`
  // relations. The blog will also have an `image_url` attribute that may point
  // to an uploaded attachment. The blog may also have addtional attachments.

  // define `title` & `description`
  blog.title = faker.lorem.sentence({ min: 4, max: 12 });
  blog.description = faker.lorem.paragraph();

  // define the `image_url`
  const hasCustomBgImage = probability(0.9);
  if (hasCustomBgImage) {
    const attachment = await generateAttachment({ blog_id: blog.id, created_at: blog.created_at });
    attachments.push(attachment);
    blog.image_url = attachment.url;
  } else blog.image_url = "/images/default-splash-bg.png";

  // ~~~ Define `body` Content ~~~
  // define the frontmatter
  const tagStr = tagIds.length > 0 ? tagIds.reduce((prev, curr) => `${prev}, ${curr}`).replace(/^,\s+/, "") : [];
  const bodyArr = [
    `---`,
    `title: ${blog.title}`,
    `description: ${blog.description}`,
    `tags: [${tagStr}]`,
    `image_url: ${blog.image_url}`,
    `---`,
  ];

  // add an opening paragraph
  bodyArr.push(faker.lorem.paragraph({ min: 3, max: 7 }));

  const options = ["h1", "h2", "h3", "h4", "blockquote", "code", "fence", "hardbreak", "hr", "link", "list", "strong"];
  for (let _ of Array(faker.number.int({ min: 5, max: 10 })).keys()) {
    const randomOption = options[faker.number.int(options.length - 1)];
    if (randomOption === "h1") bodyArr.push(`# ${faker.lorem.sentence({ min: 3, max: 7 })}`);
    else if (randomOption === "h2") bodyArr.push(`## ${faker.lorem.sentence({ min: 3, max: 7 })}`);
    else if (randomOption === "h3") bodyArr.push(`### ${faker.lorem.sentence({ min: 3, max: 7 })}`);
    else if (randomOption === "h4") bodyArr.push(`#### ${faker.lorem.sentence({ min: 3, max: 7 })}`);
    else if (randomOption === "blockquote") bodyArr.push(`> ${faker.lorem.paragraph({ min: 2, max: 5 })}`);
    else if (randomOption === "code") bodyArr.push('Here is an example of a `const a = "some code"` inline here.');
    else if (randomOption === "fence") {
      bodyArr.push("```py");
      bodyArr.push(`myvar = "${faker.lorem.sentence()}"`);
      bodyArr.push(`myvar2 = "${faker.lorem.sentence()}"`);
      bodyArr.push(`result = 4 + 6`);
      bodyArr.push("```");
    } else if (randomOption === "hardbreak") bodyArr.push("\\");
    else if (randomOption === "hr") bodyArr.push("---");
    else if (randomOption === "link") {
      const url = new URL("https://www.google.com");
      url.searchParams.append("q", faker.airline.airplane().name);
      bodyArr.push(`Here is an example of a link to [An Airplane](${url.toString()})`);
    } else if (randomOption === "list") {
      const isOrderedList = probability(0.5);
      if (isOrderedList) {
        bodyArr.push(`1. ${faker.lorem.sentence()}`);
        bodyArr.push(`2. ${faker.lorem.sentence()}`);
        bodyArr.push(`3. ${faker.lorem.sentence()}`);
      } else {
        bodyArr.push(`- ${faker.lorem.sentence()}`);
        bodyArr.push(`- ${faker.lorem.sentence()}`);
        bodyArr.push(`- ${faker.lorem.sentence()}`);
      }
    } else if (randomOption === "strong") bodyArr.push(`In this case here i **strong set of content** here.`);
  }
  blog.body = bodyArr.join("\n");

  // Generate `body_modified_at`
  // -------------------------------------------------------------------------
  blog.body_modified_at = faker.date.soon({ refDate: blog.created_at, days: 45 });

  // Generate `modified_at`
  // -------------------------------------------------------------------------
  if (blog.published_at && blog.published_at.getTime() > blog.body_modified_at.getTime())
    blog.modified_at = blog.published_at;
  else blog.modified_at = blog.body_modified_at;

  // Generate `blogTags`
  // -------------------------------------------------------------------------
  tagIds.forEach((tag_id) => blogTags.push({ tag_id, blog_id: blog.id! }));

  return { blogTags, attachments, blog: ZBlog.parse(blog) };
}

async function main() {
  // read the users data this generator is dependent upon
  const usersTsxPath = path.join("scripts", "seed", "transactions", "1676222287000_users");
  const users = await fs.readJson(path.join(usersTsxPath, "users.json")).then((items) => ZUser.array().parse(items));
  const userRoles = await fs
    .readJson(path.join(usersTsxPath, "userRoles.json"))
    .then((items) => ZUserRole.array().parse(items));
  const blogsTsxPath = path.join("scripts", "seed", "transactions", "1685662998795_blogs");
  const tags = await fs.readJson(path.join(blogsTsxPath, "tags.json")).then((items) => ZTag.array().parse(items));

  // collect user options
  const adminUserIds = userRoles.filter((userRole) => userRole.role_id === "admin").map((userRole) => userRole.user_id);
  const userOptions = users.filter((user) => adminUserIds.includes(user.id));

  // collect tag options
  const tagOptions = combinations(tags.map((tag) => tag.id));

  // generate the records
  let attachmentRecords: IAttachment[] = [];
  let blogTagRecords: IBlogTag[] = [];
  let blogRecords: IBlog[] = [];

  for await (let idx of Array(100).fill("_").keys()) {
    const { blogTags, blog, attachments } = await generateBlog({
      blogId: idx + 1,
      author: userOptions[faker.number.int(userOptions.length - 1)],
      tagIds: tagOptions[faker.number.int(tagOptions.length - 1)],
    });
    attachmentRecords = attachmentRecords.concat(attachments);
    blogTagRecords = blogTagRecords.concat(blogTags);
    blogRecords.push(blog);
  }

  // write the records to JSON files
  const generatedPath = path.join("scripts", "seed", ".generated");
  await fs.emptyDir(generatedPath);
  await Promise.all([
    fs.writeFile(path.join(generatedPath, "blogs.json"), format(JSON.stringify(blogRecords), { parser: "json" })),
    fs.writeFile(path.join(generatedPath, "blogTags.json"), format(JSON.stringify(blogTagRecords), { parser: "json" })),
    fs.writeFile(
      path.join(generatedPath, "attachments.json"),
      format(JSON.stringify(attachmentRecords), { parser: "json" })
    ),
  ]);
}

main();
