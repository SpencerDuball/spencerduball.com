import { Box, Link, Grid, Flex, Text, Button, Icon } from "@chakra-ui/react";
import type { GridProps } from "@chakra-ui/react";
import { getUser } from "~/session.server";
import { json, LoaderArgs, redirect } from "@remix-run/node";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { Stat } from "~/components";
import { RiArrowRightLine } from "react-icons/ri";

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
      gap={4}
      sx={{
        "@media screen and (max-width: 650px)": { "&": { gridTemplateColumns: "1fr", p: 4 } },
        "@media screen and (min-width: 650px)": { "&": { gridTemplateColumns: "1fr max-content", p: 6 } },
      }}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={c("_gray.6")}
      bg={c("_gray.2")}
      {...props}
    >
      <Flex
        flexDir="column"
        sx={{ "@media screen and (max-width: 650px)": { "&": { gridRow: "1 / span 1" } } }}
        gap={2}
      >
        <Text fontSize="4xl">Welcome back, Spencer!</Text>
        <Flex gap={4} alignItems="center" wrap="wrap">
          <Button>Manage Content</Button>
          <Button variant="link" rightIcon={<Icon as={RiArrowRightLine} />}>
            View Analytics
          </Button>
        </Flex>
      </Flex>
      <Stat
        sx={{ "@media screen and (max-width: 650px)": { "&": { w: "full", gridRow: "2 / span 1" } } }}
        w={{ base: "3xs", md: "xs" }}
        bg={c("_gray.4")}
        label="Monthly Views"
        value="75"
      />
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
