import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPosts } from "~/model/posts.server";

interface LoaderData {
  posts: Awaited<ReturnType<typeof getPosts>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  return json({ posts: await getPosts() });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => {
          const href = `/blog/${post.slug}`;
          return (
            <li key={href}>
              <a href={href}>{post.title}</a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
