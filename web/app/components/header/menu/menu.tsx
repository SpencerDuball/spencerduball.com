import { Children, useMemo, isValidElement, cloneElement } from "react";
import { Button, chakra, Link, Box, Text, Grid, useToken, keyframes, IconButton, Icon } from "@chakra-ui/react";
import type {
  PropsOf,
  LinkProps,
  ButtonProps,
  BoxProps,
  TextProps,
  GridProps,
  IconButtonProps,
} from "@chakra-ui/react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Link as RemixLink, useLocation } from "@remix-run/react";
import type { LinkProps as RemixLinkProps } from "@remix-run/react";
import { useThemedColor } from "@dub-stack/chakra-radix-colors";
import { RiMenu2Fill } from "react-icons/ri";

/**
 * Determines if the given path is part of the active path.
 *
 * @param to The href.
 */
const useIsActivePath = (to: string | undefined) => {
  const { pathname } = useLocation();
  return useMemo(() => (to && to === "/" ? pathname === to : pathname.startsWith(to!)), [pathname]);
};

// animation keyframes
const scaleIn = keyframes`
  from { opacity: 0; transform: rotateX(-30deg) scale(0.9); }
  to { opacity: 1; transform: rotateX(0deg) scale(1); }
`;
const scaleOut = keyframes`
  from { opacity: 1; transform: rotateX(0deg) scale(1); }
  to { opacity: 0; transform: rotateX(-30deg) scale(0.9); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// constants
const ChakraPointerSize = 3;
const ChakraPointerOffset = 2;

// Menu Components
//////////////////////////////////////////////////////////////////////////
const _MenuRoot = chakra(NavigationMenu.Root);
const _MenuSub = chakra(NavigationMenu.Sub);
const _MenuList = chakra(NavigationMenu.List);
const _MenuItem = chakra(NavigationMenu.Item);
const _MenuTrigger = chakra(NavigationMenu.Trigger);
const _MenuContent = chakra(NavigationMenu.Content);
const _MenuLink = chakra(NavigationMenu.Link);
const _MenuIndicator = chakra(NavigationMenu.Indicator);
const _MenuViewport = chakra(NavigationMenu.Viewport);

export interface MenuRootProps extends PropsOf<typeof _MenuRoot> {}
export const MenuRoot = (props: MenuRootProps) => (
  <_MenuRoot
    display="grid"
    gridAutoFlow="column"
    justifyContent="space-between"
    alignItems="center"
    position="relative"
    delayDuration={100}
    {...props}
  />
);

export interface MenuSubProps extends PropsOf<typeof _MenuSub> {}
export const MenuSub = (props: MenuSubProps) => <_MenuSub {...props} />;

export interface MenuListProps extends PropsOf<typeof _MenuList> {}
export const MenuList = (props: MenuListProps) => <_MenuList listStyleType="none" {...props} />;

export interface MenuItemProps extends PropsOf<typeof _MenuItem> {}
export const MenuItem = (props: MenuItemProps) => <_MenuItem {...props} />;

export interface MenuTriggerProps extends PropsOf<typeof _MenuTrigger> {}
export const MenuTrigger = (props: MenuTriggerProps) => <_MenuTrigger {...props} />;

export interface MenuContentProps extends PropsOf<typeof _MenuContent> {}
export const MenuContent = (props: MenuContentProps) => {
  const c = useThemedColor();
  return (
    <_MenuContent
      height="full"
      bg={c("_gray.3")}
      borderRadius="lg"
      boxShadow="lg"
      border="1px solid"
      borderColor={c("_gray.6")}
      {...props}
    />
  );
};

export interface MenuLinkProps extends PropsOf<typeof _MenuLink> {}
export const MenuLink = (props: MenuLinkProps) => <_MenuLink {...props} />;

export interface MenuIndicatorProps extends PropsOf<typeof _MenuIndicator> {}
export const MenuIndicator = (props: MenuIndicatorProps) => {
  const c = useThemedColor();
  return (
    <_MenuIndicator
      zIndex={useToken("zIndices", "dropdown") + 1}
      sx={{
        "&[data-state='visible']": { animation: `${fadeIn} 100ms ease` },
        "&[data-state='hidden']": { animation: `${fadeOut} 100ms ease` },
      }}
      transition="transform 250ms ease"
      {...props}
    >
      <Box
        position="relative"
        left="50%"
        bg={c("_gray.3")}
        w={ChakraPointerSize}
        h={ChakraPointerSize}
        transformOrigin="center"
        transform="rotate(45deg) translateX(-50%) translateY(-1px)"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderColor={c("_gray.6")}
        borderTopLeftRadius="2px"
        top={ChakraPointerSize / 2 + ChakraPointerOffset}
      />
    </_MenuIndicator>
  );
};

export interface MenuViewportProps extends PropsOf<typeof _MenuViewport> {}
export const MenuViewport = (props: MenuViewportProps) => (
  <_MenuViewport
    position="absolute"
    zIndex="dropdown"
    mt={`calc(${useToken("sizes", ChakraPointerSize)} / 2 + ${useToken("sizes", ChakraPointerOffset)})`}
    sx={{
      "&[data-state='open']": { animation: `${scaleIn} 200ms ease` },
      "&[data-state='closed']": { animation: `${scaleOut} 200ms ease` },
    }}
    {...props}
  />
);

//////////////////////////////////////////////////////////////////////////
// Desktop Components
//////////////////////////////////////////////////////////////////////////

// DesktopMenuLink
//////////////////////////////////////////////////////////////////////////
export interface DesktopMenuLinkProps extends LinkProps, Omit<RemixLinkProps, "color">, MenuLinkProps {
  to: string;
}
export const DesktopMenuLink = (props: DesktopMenuLinkProps) => {
  const { to, ...rest } = props;
  const isActive = useIsActivePath(to);
  const c = useThemedColor();

  return (
    <MenuLink asChild>
      <Link
        as={RemixLink}
        to={to}
        fontWeight="semibold"
        _hover={{ textDecoration: "none", color: c("_gray.12") }}
        color={isActive ? c("_gray.12") : c("_gray.10")}
        {...rest}
      />
    </MenuLink>
  );
};

// DesktopMenuTrigger
//////////////////////////////////////////////////////////////////////////
export interface DesktopMenuTriggerProps extends ButtonProps, MenuTriggerProps {
  to?: string;
}

export const DesktopMenuTrigger = (props: DesktopMenuTriggerProps) => {
  const { to, ...rest } = props;
  const isActive = useIsActivePath(to);
  const c = useThemedColor();

  return (
    <MenuTrigger asChild>
      <Button
        variant="link"
        borderRadius="none"
        _hover={{ textDecor: "none", color: c("_gray.12") }}
        color={isActive ? c("_gray.12") : c("_gray.10")}
        {...rest}
      />
    </MenuTrigger>
  );
};

//////////////////////////////////////////////////////////////////////////
// Mobile Components
//////////////////////////////////////////////////////////////////////////

// MobileMenuTrigger
//////////////////////////////////////////////////////////////////////////
export interface MobileMenuTriggerProps extends Omit<IconButtonProps, "aria-label">, MenuTriggerProps {}

export const MobileMenuTrigger = (props: MobileMenuTriggerProps) => (
  <MenuTrigger asChild>
    <IconButton
      w="min-content"
      aria-label="open navigation menu"
      icon={<Icon as={RiMenu2Fill} h="45%" w="45%" />}
      {...props}
    />
  </MenuTrigger>
);

//////////////////////////////////////////////////////////////////////////
// LinkCard Compound Components
//////////////////////////////////////////////////////////////////////////

// LinkCardLabel
//////////////////////////////////////////////////////////////////////////
export interface LinkCardLabelProps extends TextProps {}

export const LinkCardLabel = (props: LinkCardLabelProps) => <Text fontWeight="semibold" {...props} />;

// LinkCardDescription
//////////////////////////////////////////////////////////////////////////
export interface LinkCardDescriptionProps extends TextProps {}

export const LinkCardDescription = (props: LinkCardDescriptionProps) => <Text {...props} />;

// LinkCardSubLinks
//////////////////////////////////////////////////////////////////////////
export interface LinkCardSubLinksProps extends GridProps {}

export const LinkCardSubLinks = (props: LinkCardSubLinksProps) => <Grid gap={2} templateColumns="1fr 1fr" {...props} />;

// LinkCardSubLink
//////////////////////////////////////////////////////////////////////////
export interface LinkCardSubLink extends LinkProps, Omit<RemixLinkProps, "color"> {
  to: string;
}

export const LinkCardSubLink = (props: LinkCardSubLink) => {
  const { to, ...rest } = props;
  const isActive = useIsActivePath(to);
  const c = useThemedColor();

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

// LinkCard
//////////////////////////////////////////////////////////////////////////
export interface LinkCardProps extends BoxProps {
  to: string;
}

export const LinkCard = (props: LinkCardProps) => {
  const { to, children, ...rest } = props;
  const isActive = useIsActivePath(to);
  const c = useThemedColor();

  // define required elements
  let linkCardLabel: JSX.Element | null = null;
  let linkCardDescription: JSX.Element | null = null;
  let linkCardSubLinks: JSX.Element | null = null;

  // extract the required child elements
  Children.map(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === LinkCardLabel) {
      if (linkCardLabel) throw new Error("Only 1 `LinkCardLabel` may be specified per `LinkCard`.");
      else linkCardLabel = cloneElement(child, { ...child.props });
    }

    if (child.type === LinkCardDescription) {
      if (linkCardDescription) throw new Error("Only 1 `LinkCardDescription` may be specified per `LinkCard`.");
      else linkCardDescription = cloneElement(child, { ...child.props });
    }

    if (child.type === LinkCardSubLinks) {
      if (linkCardSubLinks) throw new Error("Only 1 `LinkCardSubLinks` may be specified per `LinkCard`.");
      else linkCardSubLinks = cloneElement(child, { ...child.props });
    }
  });

  // ensure required elements are defined
  if (!linkCardLabel) throw new Error("Must supply `LinkCardLabel` as a child to the card.");
  if (!linkCardDescription) throw new Error("Must supply `LinkCardDescription` as a child to the card.");

  return (
    <Box display="grid" borderRadius="lg" gap={2} p={4} bg={c("_gray.4")} {...rest}>
      <MenuLink asChild>
        <Link
          as={RemixLink}
          to={to}
          display="blog"
          _hover={{ textDecoration: "none", color: c("_gray.12") }}
          color={isActive ? c("_gray.12") : c("_gray.10")}
        >
          {linkCardLabel}
          {linkCardDescription}
        </Link>
      </MenuLink>
      {linkCardSubLinks}
    </Box>
  );
};
