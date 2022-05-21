import {
  Box,
  BoxProps,
  Container,
  HStack,
  Link,
  LinkProps,
  IconButton,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { RiSunFill, RiMoonFill } from "react-icons/ri";
import NextLink from "next/link";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { useRouter } from "next/router";

const NavLink = (props: LinkProps & { href: string }) => {
  const { href, ...rest } = props;
  const c = useThemedColor();
  const { pathname } = useRouter();
  return (
    <NextLink href={href} passHref>
      <Link
        fontWeight="semibold"
        _hover={{ textDecoration: "none", color: c("_gray.12") }}
        color={pathname === href ? c("_gray.12") : c("_gray.10")}
        {...rest}
      />
    </NextLink>
  );
};

export const Header = (props: BoxProps) => {
  const router = useRouter();
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <Box as="header" w="full" {...props}>
      <Container
        maxW="container.lg"
        w="full"
        h="20"
        display="grid"
        gridAutoFlow="column"
        justifyContent="space-between"
      >
        {/* Navigation */}
        <HStack as="nav" spacing={{ base: "4", sm: "8" }}>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          {/* <NavLink href="/iot">IoT</NavLink> */}
        </HStack>
        {/* Site Controls */}
        <HStack>
          <IconButton
            icon={
              <Icon
                as={colorMode === "light" ? RiMoonFill : RiSunFill}
                h="45%"
                w="45%"
              />
            }
            aria-label="Toggle theme"
            variant="ghost"
            onClick={toggleColorMode}
            w="min-content"
          />
        </HStack>
      </Container>
    </Box>
  );
};
