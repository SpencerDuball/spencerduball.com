import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A string that allows intellisense autocomplete, but also can pass a string value as input instead of an
 * OR'ed literal type.
 */
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
