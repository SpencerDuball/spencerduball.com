import { json } from "@remix-run/node";
import { bundleMDX } from "mdx-bundler";
import type { ZodError } from "zod";
import { z } from "zod";

const ZBlogPostBundle = z.object({
  code: z.string(),
  frontmatter: z.object({
    title: z.string().min(3),
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
    .then(async (mdx) => ZBlogPostBundle.parseAsync(await bundleMDX({ source: mdx })))
    .then((bundle) => json(bundle))
    .catch((e: ZodError) => json({ errorMessage: e.message }, 400));
}
