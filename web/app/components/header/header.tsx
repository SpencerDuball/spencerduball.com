import { BoxProps, Hide, Show, LinkProps } from "@chakra-ui/react";
import { Box, Container, HStack, Link, IconButton, Icon, useColorMode, VStack } from "@chakra-ui/react";
import { RiSunFill, RiMoonFill, RiGithubFill, RiMenu2Line } from "react-icons/ri";
import type { LinkProps as RemixLinkProps } from "@remix-run/react";
import { Link as RemixLink, useLocation, useLoaderData } from "@remix-run/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { loader } from "~/root";
import { MenuRoot, MenuList, MenuItem, MenuTrigger, MenuContent, MenuViewport, MenuIndicator } from "~/components";

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
export const ChakraHeaderHeight = 20;
export interface HeaderProps extends BoxProps {}

export const Header = (props: HeaderProps) => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <Box as="header" w="full" {...props}>
      <Container maxW="container.lg" w="full" h={ChakraHeaderHeight} display="grid" alignItems="center">
        <MenuRoot
          display="grid"
          gridAutoFlow="column"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
        >
          {/* Desktop Navigation */}
          <HStack as="nav" display={{ base: "none", sm: "initial" }} spacing={{ base: "4", sm: "8" }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            {isAdmin ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
          </HStack>

          {/* Mobile Navigaion */}
          <MenuList display={{ base: "block", sm: "none" }}>
            <MenuItem>
              <MenuTrigger asChild>
                <IconButton aria-label="open navigation" icon={<Icon as={RiMenu2Line} />} />
              </MenuTrigger>
              <MenuContent width="full" zIndex="1000">
                <VStack as="nav" spacing={{ base: "4", sm: "8" }}>
                  <NavLink to="/">Home</NavLink>
                  <NavLink to="/blog">Blog</NavLink>
                  <NavLink to="/projects">Projects</NavLink>
                  {isAdmin ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
                </VStack>
              </MenuContent>
            </MenuItem>
            <MenuIndicator>
              <Box
                position="relative"
                left="50%"
                top="70%"
                bg="white"
                w="10px"
                h="10px"
                mt="10px"
                transformOrigin="center"
                transform="rotate(45deg) translateX(-50%)"
                borderTopLeftRadius="2px"
              />
            </MenuIndicator>
          </MenuList>
          <MenuViewport
            position="absolute"
            top="100%"
            mt="calc(15px - (0.7 * 5px))"
            w="100%"
            h="var(--radix-navigation-menu-viewport-height)"
            bg="white"
            zIndex="modal"
          />

          {/* Site Controls */}
          <HStack>
            <IconButton
              as="a"
              icon={<Icon as={RiGithubFill} h="45%" w="45%" />}
              aria-label="Sign In"
              variant="ghost"
              onClick={toggleColorMode}
              href="/auth/github/authorize"
              w="min-content"
              cursor="pointer"
            />
            <IconButton
              icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
              aria-label="Toggle theme"
              variant="ghost"
              onClick={toggleColorMode}
              w="min-content"
            />
          </HStack>
        </MenuRoot>
      </Container>
    </Box>
  );
};
