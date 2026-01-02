import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod/v4";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import path from "node:path";
import process from "node:process";
import fg, { type Entry } from "fast-glob";
import { difference, intersection } from "@/lib/set";
import fs from "node:fs/promises";
import { serverEnv } from "@/lib/utils.server";
import Markdoc from "@markdoc/markdoc";
import { ZYamlString } from "@/lib/utils";

// -------------------------------------------------------------------------------------
// Validation
// -------------------------------------------------------------------------------------

export const ZPost = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}$/),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date().optional(),
});
export type TPostLi = z.infer<typeof ZPost>;

// -------------------------------------------------------------------------------------
// Local Methods
// -------------------------------------------------------------------------------------

/**
 * The relative path to the data folder for the environment.
 */
const RelDataPath = serverEnv.NODE_ENV === "production" ? "prod" : serverEnv.NODE_ENV === "test" ? "test" : "dev";

const cache: Map<string, { mtime: Date; post: TPostLi }> = new Map();

/**
 * Returns all posts to delete, update, and create.
 *
 * @param posts
 */
function getPostActions(posts: Entry[]) {
  const cacheKeys = new Set(cache.keys());
  const postKeys = new Set(posts.map((p) => p.path));

  const [toDelete, toUpdate, toCreate]: [string[], string[], string[]] = [[], [], []];
  toDelete.push(...difference(cacheKeys, postKeys));
  toCreate.push(...difference(postKeys, cacheKeys));

  const existing = intersection(cacheKeys, postKeys);
  for (const post of posts.filter((p) => p.path in existing))
    if (cache.get(post.path)!.mtime.getTime() < post.stats!.mtime.getTime()) toUpdate.push(post.path);

  return { toDelete, toUpdate, toCreate };
}

// -------------------------------------------------------------------------------------
// Server Functions
// -------------------------------------------------------------------------------------

/**
 * A static server function to retrieve a subset of the Post items.
 *
 * This function can be used to get a slice of the data from the posts yaml file. This is
 * the preferred way to get data because importing the entire file would mean the entire
 * file is sent for *every* route that imports the file.
 */
export const getPostItems = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { start: number; end: number }) => data)
  .handler(async ({ data: { start, end } }) => {
    // collect all posts and determine which need updated
    const postEntries = await fg.glob(path.resolve(process.cwd(), "data", RelDataPath, "posts", "*.mdoc"), {
      stats: true,
    });
    const { toDelete, toUpdate, toCreate } = getPostActions(postEntries);

    // update the cache for each post
    for (const post of toDelete) cache.delete(post);
    for (const post of [...toUpdate, ...toCreate]) {
      const { mtime } = await fs.stat(post);
      const ast = await fs.readFile(post, { encoding: "utf-8" }).then((src) => Markdoc.parse(src));
      const frontmatter = ZYamlString.pipe(ZPost).parse(ast.attributes?.frontmatter);
      cache.set(post, { mtime, post: frontmatter });
    }

    // create an array sorted by createdAt time
    const sortDesc = (curr: TPostLi, next: TPostLi) => next.createdAt.getTime() - curr.createdAt.getTime();
    const posts = Array.from(cache.values())
      .map(({ post }) => post)
      .sort(sortDesc);

    return posts.slice(start, end);
  });

/**
 * A static server function to retrieve the total number Post items.
 */
export const getTotalPostItems = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const posts = await fg.glob(path.resolve(process.cwd(), "data", RelDataPath, "posts", "*.mdoc"));
    return posts.length;
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data: { slug } }) => {
    // extract the ID
    const id = slug.match(/.*-(?<id>[0-9a-zA-Z]{8})$/)?.groups?.id;
    if (!id) throw notFound();

    // find the file path
    const fpath = await fg
      .glob(path.resolve(process.cwd(), "data", RelDataPath, "posts", `*-${id}.mdoc`))
      .then((res) => res.pop());
    if (!fpath) throw notFound();

    // read in the file & extract ast
    const ast = await fs.readFile(fpath, { encoding: "utf-8" }).then((src) => Markdoc.parse(src));

    // extract the content & frontmatter
    const content = z.string().parse(JSON.stringify(Markdoc.transform(ast)));
    const frontmatter = ZYamlString.pipe(ZPost).parse(ast.attributes?.frontmatter);

    return { content: JSON.parse(content), frontmatter };
  });
