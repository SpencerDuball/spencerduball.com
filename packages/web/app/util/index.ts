import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This function does a tailwind merge and input filtering. Thanks shadcn!
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
