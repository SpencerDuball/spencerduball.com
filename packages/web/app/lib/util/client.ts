import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

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

/* ------------------------------------------------------------------------------------------------------------------
 * Define Zod Utilities
 * ------------------------------------------------------------------------------------------------------------------ */

// define JSON schema
const ZJsonPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type JsonPrimitiveType = z.infer<typeof ZJsonPrimitive>;
type JsonType = JsonPrimitiveType | { [key: string]: JsonType } | JsonType[];
export const ZJson: z.ZodType<JsonType> = z.lazy(() => z.union([ZJsonPrimitive, z.array(ZJson), z.record(ZJson)]));

// define String-To-JSON schema
export const ZJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as JsonType;
  } catch (e) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
    return z.NEVER;
  }
});
