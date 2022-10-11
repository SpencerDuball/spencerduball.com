import { allPosts } from "~/../blog";

export type Post = {
  slug: string;
  title: string;
  content: string;
};

function postsFromModule(mod: any): Post {
  return {
    slug: mod.filename.replace(/\.mdx?$/, ""),
    title: mod.attributes.title,
    content: mod.default,
  };
}

export async function getPost(id: string): Promise<Post | null> {
  const posts = allPosts.map(postsFromModule);
  return posts.find((post) => post.slug === id) || null;
}
