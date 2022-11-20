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
  MobileMenuTrigger,
} from "./menu";
import { ScrollBox } from "~/components";

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
                <VStack alignItems="normal" spacing={2} p={3}>
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
                  <VStack alignItems="normal" spacing={2} p={3}>
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

        {/* Mobile Nav Menu */}
        <MenuRoot display={useBreakpointValue({ base: undefined, sm: "none" })}>
          <MenuList>
            <MenuItem>
              <MobileMenuTrigger />
              <MenuContent>
                <ScrollBox height="100%" maxHeight={`calc(100vh - ${useToken("sizes", ChakraHeaderHeight)} * 2)`} p={3}>
                  <VStack as="nav" alignItems="normal" spacing={2}>
                    <LinkCard to="/">
                      <LinkCardLabel>Home</LinkCardLabel>
                      <LinkCardDescription>About me, site summary, and recent activity.</LinkCardDescription>
                    </LinkCard>
                    <LinkCard to="/blog">
                      <LinkCardLabel>Blog</LinkCardLabel>
                      <LinkCardDescription>Check out my blog posts.</LinkCardDescription>
                    </LinkCard>
                    <LinkCard to="/projects">
                      <LinkCardLabel>Projects</LinkCardLabel>
                      <LinkCardDescription>Check out some of the projects I work on.</LinkCardDescription>
                      <LinkCardSubLinks>
                        <LinkCardSubLink to="/projects/software">Software</LinkCardSubLink>
                        <LinkCardSubLink to="/projects/3d-print">3D Print</LinkCardSubLink>
                        <LinkCardSubLink to="/projects/electronics">Electronics</LinkCardSubLink>
                      </LinkCardSubLinks>
                    </LinkCard>
                    {isAdmin ? (
                      <LinkCard to="/dashboard">
                        <LinkCardLabel>Dashboard</LinkCardLabel>
                        <LinkCardDescription>Manage and view your site content.</LinkCardDescription>
                        <LinkCardSubLinks>
                          <LinkCardSubLink to="/dashboard/cms">CMS</LinkCardSubLink>
                          <LinkCardSubLink to="/projects/analytics">Analytics</LinkCardSubLink>
                        </LinkCardSubLinks>
                      </LinkCard>
                    ) : null}
                  </VStack>
                </ScrollBox>
              </MenuContent>
            </MenuItem>
          </MenuList>
          <MenuIndicator />
          <MenuViewport
            w={`calc(100vw - 2 * ${useToken("sizes", 4)})`}
            h="var(--radix-navigation-menu-viewport-height)"
          />
        </MenuRoot>

        {/* Right Side Controls */}
        <HStack>
          <IconButton
            icon={<Icon as={colorMode === "light" ? RiMoonFill : RiSunFill} h="45%" w="45%" />}
            aria-label="Toggle theme"
            variant={{ base: "solid", sm: "ghost" }}
            onClick={toggleColorMode}
            w="min-content"
          />
        </HStack>
      </Container>
    </Box>
  );
};
