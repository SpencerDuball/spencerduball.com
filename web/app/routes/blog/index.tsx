import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Flex, Grid, Text, IconButton, Icon, Container, Input, Badge } from "@chakra-ui/react";
import { RiAddFill } from "react-icons/ri";
import { getUser } from "~/session.server";

interface LoaderData {
  isAdmin: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  // check for admin role
  let isAdmin = false;
  if (user && user.roles && user.roles.includes("admin")) isAdmin = true;

  return json({ isAdmin });
};

export default function Posts() {
  const { isAdmin } = useLoaderData<LoaderData>();
  console.log(isAdmin);

  return (
    <Container maxW="container.md">
      {/* Posts Introduction */}
      <Grid gap={2}>
        <Flex alignItems="center" gap={2}>
          <Text fontSize="5xl" fontWeight="bold" flexGrow={1}>
            Posts
          </Text>
          {isAdmin ? (
            <IconButton icon={<Icon as={RiAddFill} />} aria-label="New Post" as={Link} to="/blog/new" />
          ) : null}
        </Flex>
        <Text>
          I write mostly about web development and cloud computing, and sometimes about 3D printing and circuits. I hope
          you find something useful!
        </Text>
        <Input variant="filled" placeholder="Search ..." />
        <Flex gap={2}>
          {[
            ["web", "red"],
            ["aws", "blue"],
            ["3d-print", "orange"],
            ["circuit", "green"],
          ].map(([title, color]) => (
            <Badge key={title} fontSize="sm" variant="subtle" colorScheme={color}>
              {title}
            </Badge>
          ))}
        </Flex>
      </Grid>
    </Container>
  );
}
