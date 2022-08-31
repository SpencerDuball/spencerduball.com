import { getPosts } from "~/model/posts.server";

export type Post = {
  slug: string;
  title: string;
};

export async function getPost(id: string): Promise<Post | null> {
  console.log("SLUG = ", id);
  return (await getPosts()).find((item) => item.slug === id) || null;
}
