import {
  Box,
  Grid,
  Flex,
  Text,
  Button,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
} from "@chakra-ui/react";
import type { GridProps } from "@chakra-ui/react";
import { getUser } from "~/session.server";
import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { Stat } from "~/components";
import { Form, useLoaderData } from "@remix-run/react";
import { RiEqualizerFill, RiSearchLine, RiAddFill } from "react-icons/ri";
import { createBlog, deleteBlog, getBlogs, GetBlogsSortOptions } from "~/model/blog.server";
import { z } from "zod";
import { Link as RemixLink } from "@remix-run/react";
import { HttpError } from "~/util";

const blogTemplate = `---
title: New Blog Post
image: /images/default-splash-bg.png
tags:
  - water
  - fire
  - earth
  - wind
---

# New Blog Post

This is a new blog post, edit the content and click the "save" button when ready. You may also
drag and drop images onto the editor, or upload them directly in the "attachments" tab. After images
are added to the "attachments" they will be uploaded to S3 automatically.
`;

export const action = async ({ request }: ActionArgs) => {
  const user = await getUser(request, "required");

  // ensure user is admin
  if (!user.roles?.includes("admin")) throw redirect("/");

  // get form data
  const formData = await request.formData();

  switch (request.method) {
    case "POST": {
      return createBlog({ mdx: blogTemplate, authorId: user.id })
        .then(() => null)
        .catch((e) => {
          if (e instanceof HttpError) return json({ message: e.message }, { status: e.statusCode });
        });
    }
    case "DELETE": {
      return deleteBlog(z.string().parse(formData.get("id")))
        .then(() => null)
        .catch((e) => {
          if (e instanceof HttpError) return json({ message: e.message }, { status: e.statusCode });
        });
    }
  }

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  // ensure user is admin
  const user = await getUser(request, "required");
  if (!user.roles?.includes("admin")) throw redirect("/");

  // ensure required params are present
  const search = new URL(request.url).searchParams;
  if (!search.get("page")) throw redirect(`${request.url}?page=1`);

  // get the search params
  const page = await z
    .number()
    .parseAsync(parseInt(search.get("page") || ""))
    .catch(() => 1);
  const limit = await z
    .number()
    .parseAsync(parseInt(search.get("limit") || ""))
    .catch(() => 50);
  const published = await z
    .string()
    .transform((str) => str === "true")
    .parseAsync(search.get("published"))
    .catch(() => false);
  const sort = await z
    .enum(GetBlogsSortOptions)
    .parseAsync(search.get("sort"))
    .catch(() => "created-desc" as const);

  // fetch the blogs
  const blogs = await getBlogs({ page, published, limit, sort });

  return json({ totalBlogPosts: 13, blogs });
};

// WelcomeCard
////////////////////////////////////////////////////////////////////////////////
interface WelcomeCardProps extends GridProps {}

const WelcomeCard = (props: WelcomeCardProps) => {
  const { totalBlogPosts } = useLoaderData<typeof loader>();
  const { colorMode } = useColorMode();
  const c = useThemedColor();

  // get the colors for the linear gradient background
  const firstColor = colorMode === "light" ? "var(--chakra-colors-yellowA-6)" : "var(--chakra-colors-yellowDarkA-6)";
  const secondColor = colorMode === "light" ? "var(--chakra-colors-crimsonA-6)" : "var(--chakra-colors-crimsonDarkA-6)";

  return (
    <Grid
      gap={4}
      sx={{
        "@media screen and (max-width: 650px)": { "&": { gridTemplateColumns: "1fr", p: 4 } },
        "@media screen and (min-width: 650px)": { "&": { gridTemplateColumns: "1fr max-content", p: 6 } },
      }}
      borderRadius="lg"
      boxShadow="md"
      bg={`linear-gradient(120deg, ${firstColor}, ${secondColor})`}
      {...props}
    >
      <Flex
        flexDir="column"
        sx={{ "@media screen and (max-width: 650px)": { "&": { gridRow: "1 / span 1" } } }}
        gap={2}
      >
        <Text fontSize="5xl" fontWeight="black">
          Blog
        </Text>
        <Flex gap={4} alignItems="center" wrap="wrap">
          <Button variant="link" color={c("_gray.12")}>
            Blog
          </Button>
          <Button variant="link">Software</Button>
          <Button variant="link">3D Print</Button>
          <Button variant="link">Electronics</Button>
        </Flex>
      </Flex>
      <Stat
        sx={{ "@media screen and (max-width: 650px)": { "&": { w: "full", gridRow: "2 / span 1" } } }}
        w={{ base: "3xs", md: "xs" }}
        label="Blog Posts"
        bg={colorMode === "dark" ? "blackA.10" : "whiteA.10"}
        value={totalBlogPosts.toString()}
      />
    </Grid>
  );
};

// Blog
////////////////////////////////////////////////////////////////////////////////
export default function Blog() {
  const { blogs } = useLoaderData<typeof loader>();
  const c = useThemedColor();

  return (
    <Box display="grid" gap={6}>
      <WelcomeCard />
      <Grid gap={4}>
        <Flex gap={3}>
          <IconButton aria-label="open search settings menu" size="lg" icon={<Icon as={RiEqualizerFill} />} />
          <InputGroup size="lg" variant="filled">
            <InputLeftElement pointerEvents="none" children={<Icon as={RiSearchLine} />} />
            <Input placeholder="Search ..." />
          </InputGroup>
          <Form method="post">
            <IconButton type="submit" aria-label="create a new blog post" size="lg" icon={<Icon as={RiAddFill} />} />
          </Form>
        </Flex>
        <Flex flexDir="column" gap={2}>
          {blogs
            ? blogs.map((item) => (
                <Box key={item.id} w="full" p={4} bg={c("_gray.3")}>
                  <Text fontSize="lg" fontWeight="medium">
                    {item.title} - {item.id}
                  </Text>
                  <Flex gap={2}>
                    <Form method="delete">
                      <Button name="id" value={item.id} colorScheme="red" type="submit">
                        Delete
                      </Button>
                    </Form>
                    <Button as={RemixLink} to={`/dashboard/blog/${item.id}`} colorScheme="slate">
                      Edit
                    </Button>
                    <Button colorScheme="slate">View</Button>
                  </Flex>
                </Box>
              ))
            : null}
        </Flex>
      </Grid>
    </Box>
  );
}
