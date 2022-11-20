import { BoxProps, calc, useBreakpointValue, useToken } from "@chakra-ui/react";
import { Box, Container, HStack, IconButton, Icon, useColorMode, VStack } from "@chakra-ui/react";
import { RiSunFill, RiMoonFill } from "react-icons/ri";
import { useLoaderData } from "@remix-run/react";
import { loader } from "~/root";
import {
  MenuRoot,
  MenuList,
  MenuItem,
  MenuContent,
  MenuViewport,
  MenuIndicator,
  DesktopMenuLink,
  DesktopMenuTrigger,
  LinkCard,
  LinkCardLabel,
  LinkCardDescription,
  LinkCardSubLinks,
  LinkCardSubLink,
} from "./menu";

// Header
//////////////////////////////////////////////////////////////////////////
const PointerSize = 15;
export const ChakraHeaderHeight = 20;
export interface HeaderProps extends BoxProps {}

export const Header = (props: HeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <Box as="header" w="full" {...props}>
      <Container
        maxW="container.lg"
        w="full"
        h={ChakraHeaderHeight}
        display="grid"
        alignItems="center"
        gridAutoFlow="column"
        justifyContent="space-between"
      >
        {/* Desktop Nav Menu */}
        <MenuRoot display={useBreakpointValue({ base: "none", sm: undefined })} position="relative">
          <MenuList display="flex" gap={{ base: 4, sm: 8 }}>
            <MenuItem>
              <DesktopMenuLink to="/">Home</DesktopMenuLink>
            </MenuItem>
            <MenuItem>
              <DesktopMenuLink to="/blog">Blog</DesktopMenuLink>
            </MenuItem>
            <MenuItem>
              <DesktopMenuTrigger to="/projects">Projects</DesktopMenuTrigger>
              <MenuContent>
                <VStack alignItems="normal" spacing={2} p={4}>
                  <LinkCard to="/projects">
                    <LinkCardLabel>Projects</LinkCardLabel>
                    <LinkCardDescription>Check out some of the projects I work on.</LinkCardDescription>
                    <LinkCardSubLinks>
                      <LinkCardSubLink to="/projects/software">Software</LinkCardSubLink>
                      <LinkCardSubLink to="/projects/3d-print">3D Print</LinkCardSubLink>
                      <LinkCardSubLink to="/projects/electronics">Electronics</LinkCardSubLink>
                    </LinkCardSubLinks>
                  </LinkCard>
                </VStack>
              </MenuContent>
            </MenuItem>
            {isAdmin ? (
              <MenuItem>
                <DesktopMenuTrigger to="/dashboard">Dashboard</DesktopMenuTrigger>
                <MenuContent>
                  <VStack alignItems="normal" spacing={2} p={4}>
                    <LinkCard to="/dashboard">
                      <LinkCardLabel>Dashboard</LinkCardLabel>
                      <LinkCardDescription>Manage and view your site content.</LinkCardDescription>
                      <LinkCardSubLinks>
                        <LinkCardSubLink to="/dashboard/cms">CMS</LinkCardSubLink>
                        <LinkCardSubLink to="/projects/analytics">Analytics</LinkCardSubLink>
                      </LinkCardSubLinks>
                    </LinkCard>
                  </VStack>
                </MenuContent>
              </MenuItem>
            ) : null}
          </MenuList>
          <MenuIndicator />
          <MenuViewport w="container.sm" maxW={`calc(100vw - 2 * ${useToken("sizes", 4)})`} />
        </MenuRoot>
        <HStack>
          <IconButton
            icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
            aria-label="Toggle theme"
            variant={{ base: "solid", sm: "ghost" }}
            onClick={toggleColorMode}
            w="min-content"
          />
        </HStack>

        {/* <MenuRoot
          display="grid"
          gridAutoFlow="column"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
          delayDuration={100}
        >
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

          <Box display={{ base: "block", sm: "none" }}>
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
          </Box>

          <HStack>
            <IconButton
              icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
              aria-label="Toggle theme"
              variant={{ base: "solid", sm: "ghost" }}
              onClick={toggleColorMode}
              w="min-content"
            />
          </HStack>
            </MenuRoot> */}
      </Container>
    </Box>
  );
};
