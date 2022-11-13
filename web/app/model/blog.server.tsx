import { json } from "@remix-run/node";
import { bundleMDX } from "mdx-bundler";
import type { ZodError } from "zod";
import { z } from "zod";
import { importRemarkGfm, importRemarkMdxCodeMeta } from "~/es-modules";
import { ZPreviewResponse } from "./blog.shared";

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
