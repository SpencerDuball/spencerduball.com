import { Box, Link, Grid, Flex, Text, Button } from "@chakra-ui/react";
import type { GridProps } from "@chakra-ui/react";
import { getUser } from "~/session.server";
import { json, LoaderArgs, redirect } from "@remix-run/node";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { Stat } from "~/components";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request, "required");

  // ensure user is admin
  if (!user.roles?.includes("admin")) throw redirect("/");

  return json({ monthlyViews: 75 });
};

// WelcomeCard
////////////////////////////////////////////////////////////////////////////////
interface WelcomeCardProps extends GridProps {}

const WelcomeCard = (props: WelcomeCardProps) => {
  const c = useThemedColor();

  return (
    <Grid
      templateColumns="1fr max-content"
      p={8}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={c("_gray.6")}
      bg={c("_gray.2")}
      {...props}
    >
      <Flex flexDir="column" gap={2}>
        <Text fontSize="4xl">Welcome back, Spencer!</Text>
        <Flex gap={4} alignItems="center">
          <Button w="32" colorScheme="red">
            Logout
          </Button>
          <Link>View Analytics</Link>
        </Flex>
      </Flex>
      <Stat w="xs" bg={c("_gray.4")} label="Monthly Views" value="75" />
    </Grid>
  );
};

// Dashboard
////////////////////////////////////////////////////////////////////////////////
export default function Dashboard() {
  return (
    <Box>
      <WelcomeCard />
    </Box>
  );
}
