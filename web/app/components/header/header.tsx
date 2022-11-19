import { BoxProps, LinkProps, Grid, Button, ButtonProps, keyframes, useToken, forwardRef } from "@chakra-ui/react";
import { Box, Container, Text, HStack, Link, IconButton, Icon, useColorMode, VStack } from "@chakra-ui/react";
import { RiSunFill, RiMoonFill, RiMenu2Fill, RiArrowDownSLine } from "react-icons/ri";
import type { LinkProps as RemixLinkProps } from "@remix-run/react";
import { Link as RemixLink, useLocation, useLoaderData } from "@remix-run/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { loader } from "~/root";
import {
  MenuRoot,
  MenuList,
  MenuLink,
  MenuItem,
  MenuTrigger,
  MenuContent,
  MenuViewport,
  MenuIndicator,
  ScrollBox,
} from "~/components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: rotateX(-30deg) scale(0.9); }
  to { opacity: 1; transform: rotateX(0deg) scale(1); }
`;
const scaleOut = keyframes`
  from { opacity: 1; transform: rotateX(0deg) scale(1); }
  to { opacity: 0; transform: rotateX(-30deg) scale(0.9); }
`;

// NavLink
//////////////////////////////////////////////////////////////////////////
interface NavLinkProps extends LinkProps, Omit<RemixLinkProps, "color"> {
  to: string;
}

const NavLink = forwardRef((props: NavLinkProps, ref) => {
  const c = useThemedColor();
  const { to, children, ...rest } = props;
  const { pathname } = useLocation();

  let isActive = false;
  if (to === "/") isActive = pathname === to;
  else isActive = pathname.startsWith(to);

  return (
    <Link
      ref={ref}
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
});

// NavCardLink
//////////////////////////////////////////////////////////////////////////
interface NavCardLinkProps extends BoxProps {
  to: string;
  title: string;
  description: string;
}

const NavCardLink = (props: NavCardLinkProps) => {
  const { to, title, description, children, ...rest } = props;
  const { pathname } = useLocation();
  const c = useThemedColor();

  let isActive = false;
  if (to === "/") isActive = pathname === to;
  else isActive = pathname.startsWith(to);

  return (
    <Box
      display="grid"
      borderRadius="lg"
      minW="400px"
      gap={2}
      p={4}
      bg={isActive ? c("_gray.5") : c("_gray.4")}
      {...rest}
    >
      <MenuLink asChild>
        <Link
          as={RemixLink}
          to={to}
          display="block"
          _hover={{ textDecoration: "none" }}
          color={isActive ? c("_gray.12") : c("_gray.10")}
        >
          <Text fontWeight="semibold">{title}</Text>
          <Text>{description}</Text>
        </Link>
      </MenuLink>
      {children ? (
        <Grid gap={2} templateColumns="1fr 1fr">
          {children}
        </Grid>
      ) : null}
    </Box>
  );
};

// SubLink
//////////////////////////////////////////////////////////////////////////
interface SubLinkProps extends LinkProps, Omit<RemixLinkProps, "color"> {
  to: string;
}
const SubLink = (props: SubLinkProps) => {
  const { to, ...rest } = props;
  const { pathname } = useLocation();
  const c = useThemedColor();

  let isActive = false;
  if (to === "/") isActive = pathname === to;
  else isActive = pathname.startsWith(to);

  return (
    <MenuLink asChild>
      <Link
        as={RemixLink}
        to={to}
        p={2}
        textAlign="center"
        borderRadius="md"
        _hover={{ textDecoration: "none", color: c("_gray.12") }}
        bg={isActive ? c("_gray.7") : c("_gray.6")}
        fontWeight={isActive ? "semibold" : "normal"}
        color={isActive ? c("_gray.12") : c("_gray.10")}
        {...rest}
      />
    </MenuLink>
  );
};

// Header
//////////////////////////////////////////////////////////////////////////
const PointerSize = 15;
export const ChakraHeaderHeight = 20;
export interface HeaderProps extends BoxProps {}

export const Header = (props: HeaderProps) => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { isAdmin } = useLoaderData<typeof loader>();
  const c = useThemedColor();

  return (
    <Box as="header" w="full" {...props}>
      <Container maxW="container.lg" w="full" h={ChakraHeaderHeight} display="grid" alignItems="center">
        <MenuRoot
          display="grid"
          gridAutoFlow="column"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
          delayDuration={100}
        >
          {/* Desktop Navigation */}
          {/* <HStack as="nav" display={{ base: "none", sm: "initial" }} spacing={{ base: "4", sm: "8" }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            {isAdmin ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
          </HStack> */}

          {/* Desktop Navigation */}
          <Box display={{ base: "none", sm: "block" }}>
            <MenuList display="flex" gap={{ base: "4", sm: "8" }}>
              <MenuItem>
                <MenuLink asChild>
                  <NavLink to="/">Home</NavLink>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink asChild>
                  <NavLink to="/blog">Blog</NavLink>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuTrigger asChild>
                  <Button variant="link" borderRadius="none" _hover={{ textDecor: "none" }}>
                    Projects
                  </Button>
                </MenuTrigger>
                <MenuContent
                  height="full"
                  bg={c("_gray.3")}
                  borderRadius="lg"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={c("_gray.6")}
                >
                  <VStack alignItems="normal" spacing={2} p={4}>
                    <NavCardLink to="/" title="Home" description="About me, site summary, and recent activity." />
                    <NavCardLink to="/blog" title="Blog" description="See all of my blog posts." />
                    <NavCardLink
                      to="/projects"
                      title="Projects"
                      description="Check out some of the projects I have worked on."
                    />
                    {isAdmin ? (
                      <NavCardLink to="/dashboard" title="Dashboard" description="View the site dashboard.">
                        <SubLink to="/dashboard">Home</SubLink>
                        <SubLink to="/dashboard/analytics">Analytics</SubLink>
                        <SubLink to="/dashboard/cms">CMS</SubLink>
                      </NavCardLink>
                    ) : null}
                  </VStack>
                </MenuContent>
              </MenuItem>
              {isAdmin ? (
                <MenuItem>
                  <MenuTrigger asChild>
                    <Button variant="link" borderRadius="none" _hover={{ textDecor: "none" }}>
                      Dashboard
                    </Button>
                  </MenuTrigger>
                  <MenuContent
                    height="full"
                    bg={c("_gray.3")}
                    borderRadius="lg"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor={c("_gray.6")}
                  >
                    <ScrollBox p={3} height="100%" maxHeight="500px">
                      <VStack alignItems="normal" spacing={2}>
                        <NavCardLink to="/dashboard" title="Dashboard" description="View the site dashboard.">
                          <SubLink to="/dashboard">Home</SubLink>
                          <SubLink to="/dashboard/analytics">Analytics</SubLink>
                          <SubLink to="/dashboard/cms">CMS</SubLink>
                        </NavCardLink>
                      </VStack>
                    </ScrollBox>
                  </MenuContent>
                </MenuItem>
              ) : null}

              <MenuIndicator
                zIndex={useToken("zIndices", "dropdown") + 1}
                sx={{
                  "&[data-state='visible']": { animation: `${fadeIn} 100ms ease` },
                  "&[data-state='hidden']": { animation: `${fadeOut} 100ms ease` },
                }}
              >
                <Box
                  position="relative"
                  left="50%"
                  bg={c("_gray.3")}
                  w={`${PointerSize}px`}
                  h={`${PointerSize}px`}
                  mt={`calc(0.71 * ${PointerSize}px + ${PointerSize / 4}px)`}
                  transformOrigin="center"
                  transform="rotate(45deg) translateX(-50%)"
                  borderTop="1px solid"
                  borderLeft="1px solid"
                  borderColor={c("_gray.6")}
                  borderBottomLeftRadius="2px"
                />
              </MenuIndicator>
            </MenuList>

            <MenuViewport
              position="absolute"
              top="100%"
              mt={`calc(${PointerSize / 2}px)`}
              // w="var(--radix-navigation-menu-viewport-width)"
              // h="var(--radix-navigation-menu-viewport-height)"
              zIndex="dropdown"
              sx={{
                "&[data-state='open']": { animation: `${scaleIn} 100ms ease` },
                "&[data-state='closed']": { animation: `${scaleOut} 100ms ease` },
              }}
            />
          </Box>

          {/* Mobile Navigaion */}
          {/* <Box display={{ base: "block", sm: "none" }}>
            <MenuList>
              <MenuItem>
                <MenuTrigger asChild>
                  <IconButton
                    w="min-content"
                    aria-label="open navigation"
                    icon={<Icon as={RiMenu2Fill} h="45%" w="45%" />}
                  />
                </MenuTrigger>
                <MenuContent
                  height="full"
                  bg={c("_gray.3")}
                  borderRadius="lg"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={c("_gray.6")}
                >
                  <ScrollBox p={3} height="100%" maxHeight={`calc(100vh - ${useToken("sizes", ChakraHeaderHeight)})`}>
                    <VStack as="nav" alignItems="normal" spacing={2}>
                      <NavCardLink to="/" title="Home" description="About me, site summary, and recent activity." />
                      <NavCardLink to="/blog" title="Blog" description="See all of my blog posts." />
                      <NavCardLink
                        to="/projects"
                        title="Projects"
                        description="Check out some of the projects I have worked on."
                      />
                      {isAdmin ? (
                        <NavCardLink to="/dashboard" title="Dashboard" description="View the site dashboard.">
                          <SubLink to="/dashboard">Home</SubLink>
                          <SubLink to="/dashboard/analytics">Analytics</SubLink>
                          <SubLink to="/dashboard/cms">CMS</SubLink>
                        </NavCardLink>
                      ) : null}
                    </VStack>
                  </ScrollBox>
                </MenuContent>
              </MenuItem>
              <MenuIndicator
                zIndex={useToken("zIndices", "dropdown") + 1}
                sx={{
                  "&[data-state='visible']": { animation: `${fadeIn} 100ms ease` },
                  "&[data-state='hidden']": { animation: `${fadeOut} 100ms ease` },
                }}
              >
                <Box
                  position="relative"
                  left="50%"
                  bg={c("_gray.3")}
                  w={`${PointerSize}px`}
                  h={`${PointerSize}px`}
                  mt={`calc(0.71 * ${PointerSize}px + ${PointerSize / 4}px)`}
                  transformOrigin="center"
                  transform="rotate(45deg) translateX(-50%)"
                  borderTop="1px solid"
                  borderLeft="1px solid"
                  borderColor={c("_gray.6")}
                  borderBottomLeftRadius="2px"
                />
              </MenuIndicator>
            </MenuList>

            <MenuViewport
              position="absolute"
              top="100%"
              mt={`calc(0.71 * ${PointerSize}px + ${PointerSize / 4}px)`}
              w="100%"
              h="var(--radix-navigation-menu-viewport-height)"
              zIndex="dropdown"
              sx={{
                "&[data-state='open']": { animation: `${scaleIn} 100ms ease` },
                "&[data-state='closed']": { animation: `${scaleOut} 100ms ease` },
              }}
            />
          </Box> */}

          {/* Site Controls */}
          <HStack>
            <IconButton
              icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
              aria-label="Toggle theme"
              variant={{ base: "solid", sm: "ghost" }}
              onClick={toggleColorMode}
              w="min-content"
            />
          </HStack>
        </MenuRoot>
      </Container>
    </Box>
  );
};
