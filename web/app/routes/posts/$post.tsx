import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { Box, Text, Link } from "@chakra-ui/react";
import type { Post as PostType } from "~/model/post.server";
import { getPost } from "~/model/post.server";

export const loader: LoaderFunction = async ({ params }) => {
  if (params.post) return json<PostType | null>(await getPost(params.post));
  else throw new Error("No post id was supplied.");
};

export default function Post() {
  const post = useLoaderData<PostType | null>();
  if (post)
    return (
      <Box>
        <Link as={RemixLink} to="/posts">
          Go back!
        </Link>
        <Text color="purple.11">{post.slug}</Text>
        <Text bg="purple.3">{post.title}</Text>
      </Box>
    );
  else return "Whyyyyyy";
}
