import { useMemo } from "react";
import { theme } from "@dub-stack/chakra-radix-colors";
import { useLocation } from "@remix-run/react";

const uniqueColorPalettes = Object.keys(theme.colors).filter((item) => !(item.endsWith("Dark") || item.endsWith("A")));

/**
 * Will generate a predictable color palette from the list of uniqueColorPalettes based upon a supplied name.
 *
 * @param name Any string value.
 * @returns The color palette string.
 */
export function randomColorScheme(name: string) {
  const nameId = Array.from(name)
    .map((char) => char.charCodeAt(0))
    .reduce((prev, curr) => prev + curr);
  const colorPaletteIdx = nameId % uniqueColorPalettes.length;
  return uniqueColorPalettes[colorPaletteIdx];
}

/**
 * Determines if the given path is part of the active path.
 *
 * @param to The href.
 */
export const useIsActivePath = (to: string | undefined) => {
  const { pathname } = useLocation();
  return useMemo(() => (to && to === "/" ? pathname === to : pathname.startsWith(to!)), [pathname]);
};
