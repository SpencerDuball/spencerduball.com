import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This function does a tailwind merge and input filtering. Thanks shadcn!
 *
 * @param inputs Strings of 'className'.
 * @returns Single, merged, className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
