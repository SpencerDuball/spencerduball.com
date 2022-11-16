import { chakra } from "@chakra-ui/react";
import type { PropsOf } from "@chakra-ui/react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

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
export const MenuRoot = (props: MenuRootProps) => <_MenuRoot {...props} />;

export interface MenuSubProps extends PropsOf<typeof _MenuSub> {}
export const MenuSub = (props: MenuSubProps) => <_MenuSub {...props} />;

export interface MenuListProps extends PropsOf<typeof _MenuList> {}
export const MenuList = (props: MenuListProps) => <_MenuList listStyleType="none" {...props} />;

export interface MenuItemProps extends PropsOf<typeof _MenuItem> {}
export const MenuItem = (props: MenuItemProps) => <_MenuItem {...props} />;

export interface MenuTriggerProps extends PropsOf<typeof _MenuTrigger> {}
export const MenuTrigger = (props: MenuTriggerProps) => <_MenuTrigger {...props} />;

export interface MenuContentProps extends PropsOf<typeof _MenuContent> {}
export const MenuContent = (props: MenuContentProps) => <_MenuContent {...props} />;

export interface MenuLinkProps extends PropsOf<typeof _MenuLink> {}
export const MenuLink = (props: MenuLinkProps) => <_MenuLink {...props} />;

export interface MenuIndicatorProps extends PropsOf<typeof _MenuIndicator> {}
export const MenuIndicator = (props: MenuIndicatorProps) => <_MenuIndicator {...props} />;

export interface MenuViewportProps extends PropsOf<typeof _MenuViewport> {}
export const MenuViewport = (props: MenuViewportProps) => <_MenuViewport {...props} />;
