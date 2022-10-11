import { allPosts } from "~/../blog";

type PostMetadata = {
  slug: string;
  title: string;
};

function postsMetadataFromModule(mod: any): PostMetadata {
  return {
    slug: mod.filename.replace(/\.mdx?$/, ""),
    title: mod.attributes.title,
  };
}

export async function getPosts(): Promise<PostMetadata[]> {
  return allPosts.map(postsMetadataFromModule);
}
