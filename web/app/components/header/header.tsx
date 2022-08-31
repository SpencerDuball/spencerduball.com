import type { BoxProps, LinkProps, PropsOf } from "@chakra-ui/react";
import { Box, Container, HStack, Link, IconButton, Icon, useColorMode } from "@chakra-ui/react";
import { RiSunFill, RiMoonFill } from "react-icons/ri";
import { LinkProps as RemixLinkProps } from "@remix-run/react";
import { Link as RemixLink, useLocation } from "@remix-run/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";

// NavLink
//////////////////////////////////////////////////////////////////////////
interface NavLinkProps extends LinkProps, Omit<RemixLinkProps, "color"> {
  to: string;
}

const NavLink = (props: NavLinkProps) => {
  const c = useThemedColor();
  const { to, children, ...rest } = props;
  const { pathname } = useLocation();

  let isActive = false;
  if (to === "/") isActive = pathname === to;
  else isActive = pathname.startsWith(to);

  return (
    <Link
      as={RemixLink}
      to={to}
      fontWeight="semibold"
      _hover={{ textDecoration: "none", color: c("_gray.12") }}
      color={isActive ? c("_gray.12") : c("_gray.10")}
      {...rest}
    >
      {children}
    </Link>
  );
};

// Header
//////////////////////////////////////////////////////////////////////////
export interface HeaderProps extends BoxProps {}

export const Header = (props: HeaderProps) => {
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
          <NavLink to="/">Home</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </HStack>
        {/* Site Controls */}
        <HStack>
          <IconButton
            icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
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
