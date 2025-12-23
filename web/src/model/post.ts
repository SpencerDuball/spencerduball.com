import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import path from "node:path";
import fs from "node:fs/promises";
import { ZYamlString } from "@/lib/utils";
import process from "node:process";

export const ZPostLi = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}$/),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.coerce.date(),
  modifiedAt: z.coerce.date().optional(),
});
export type TPostLi = z.infer<typeof ZPostLi>;

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
    const data = await fs.readFile(path.resolve(process.cwd(), "src", "data", "posts.yaml"), { encoding: "utf-8" });
    const posts = ZYamlString.pipe(ZPostLi.array()).parse(data);
    return posts.slice(start, end);
  });

/**
 * A static server function to retrieve the total number Post items.
 *
 * This function can be used to get the total number of posts from the yaml file. This is
 * the preferred way to get data because importing the entire file would mean the entire
 * file is sent for *every* route that imports the file.
 */
export const getTotalPostItems = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const data = await fs.readFile(path.resolve(process.cwd(), "src", "data", "posts.yaml"), { encoding: "utf-8" });
    const posts = ZYamlString.pipe(ZPostLi.array()).parse(data);
    return posts.length;
  });
