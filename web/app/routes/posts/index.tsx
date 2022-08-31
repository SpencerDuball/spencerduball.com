import { json } from "@remix-run/node";
import { Link as RmLink, useLoaderData } from "@remix-run/react";
import { Link } from "@chakra-ui/react";
import { getPosts } from "~/model/posts.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: await getPosts(),
  });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link as={RmLink} to={post.slug}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
