import { Grid } from "@chakra-ui/react";
import { allPosts } from "contentlayer/generated";

export const getStaticProps = () => {
  // filter out the `body`, this is unnecessary to send to page
  let posts = allPosts.map((post) => {
    const { body, ...rest } = post;
    return rest;
  });

  return { props: { posts } };
};

const BlogsPage = () => {
  return <Grid>Hello!</Grid>;
};

export default BlogsPage;
