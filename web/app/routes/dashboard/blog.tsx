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
import type { LoaderArgs } from "@remix-run/node";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { Stat } from "~/components";
import { useLoaderData } from "@remix-run/react";
import { RiEqualizerFill, RiSearchLine, RiAddFill } from "react-icons/ri";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request, "required");

  // ensure user is admin
  if (!user.roles?.includes("admin")) throw redirect("/");

  return json({ totalBlogPosts: 13 });
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
  return (
    <Box display="grid" gap={6}>
      <WelcomeCard />
      <Flex gap={2}>
        <IconButton aria-label="open search settings menu" size="lg" icon={<Icon as={RiEqualizerFill} />} />
        <InputGroup size="lg" variant="filled">
          <InputLeftElement pointerEvents="none" children={<Icon as={RiSearchLine} />} />
          <Input placeholder="Search ..." />
        </InputGroup>
        <IconButton aria-label="create a new blog post" size="lg" icon={<Icon as={RiAddFill} />} />
      </Flex>
    </Box>
  );
}
