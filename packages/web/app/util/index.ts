import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

/**
 * This function does a tailwind merge and input filtering. Thanks shadcn!
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -------------------------------------------------------------------------------------
// Define Zod Utilities
// -------------------------------------------------------------------------------------

// define JSON schema
const ZJsonPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type JsonPrimitive = z.infer<typeof ZJsonPrimitive>;
type JsonType = JsonPrimitive | { [key: string]: JsonType } | JsonType[];
export const ZJson: z.ZodType<JsonType> = z.lazy(() => z.union([ZJsonPrimitive, z.record(ZJson), z.array(ZJson)]));

/**
 * Inputs a string and transform it into JSON in a typesafe manner.
 *
 * This function is useful to pipe into other validation functions. In the example below
 * we use this `ZJsonString` to parse a JSON string into an object & validate.
 * @example
 * ```ts
 * const ZSearch = z.object({
 *   state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string()})),
 *   code: z.string(),
 * });
 * ```
 */
export const ZJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as JsonType;
  } catch (e) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON string." });
    return z.NEVER;
  }
});

export * from "./env";
