import { theme } from "@dub-stack/chakra-radix-colors";

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
