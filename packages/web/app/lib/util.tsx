import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Allows user to have intellisense auto-complete, but also can pass a string value as input
// instead of an or'ed literal type.
export type AutoCompleteString<T> = T | (string & Record<never, never>);

/**
 * This function does a tailwind merge and input filtering. Thanks shadcn!
 *
 * @param inputs Strings of 'className'.
 * @returns Single, merged, className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ColorFromNameProps<T> {
  name: string;
  colors: T[];
}
/**
 * Will generate a predictable color from a list of supplied colors based upon the passed name.
 * @param name The name of the item.
 * @param colors The list of colors.
 * @returns Color
 */
export function colorFromName<T extends string>({ name, colors }: ColorFromNameProps<T>) {
  const nameId = Array.from(name)
    .map((char) => char.charCodeAt(0))
    .reduce((prev, curr) => prev + curr);
  const colorIdx = nameId % colors.length;
  return colors[colorIdx];
}
