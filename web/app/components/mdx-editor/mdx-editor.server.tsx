import { bundleMDX } from "mdx-bundler";

export async function bundle(source: string) {
  return await bundleMDX({ source });
}
