import { ZSession } from "@spencerduballcom/db/ddb";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import YAML from "yaml";

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

/**
 * Inputs a string and transform it to JSON in typesafe manner. This result can then be piped into other validation fns.
 *
 * @example
 * const ZSearch = z.object({
 *   state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
 *   code: z.string(),
 * });
 */
export const ZJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as JsonType;
  } catch (e) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
    return z.NEVER;
  }
});

/**
 * Inputs a string and transform it to YAML in typesafe manner. This result can then be piped into other validation fns.
 *
 * @example
 * const ZBlogMeta = ZYamlString.pipe(z.object({ title: z.string(), description: z.string() }))
 */
export const ZYamlString = z.string().transform((str, ctx) => {
  try {
    return YAML.parse(str) as JsonType;
  } catch (e) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid YAML" });
    return z.NEVER;
  }
});

/* ------------------------------------------------------------------------------------------------------------------
 * Define Shared Zod Types
 * ------------------------------------------------------------------------------------------------------------------ */
// define markdown link utility
export const ZMdLink = z.custom<`[${string}](${string})`>(
  (val) => typeof val === "string" && /^\[.*\]\(.*\)/.test(val),
);

/* ------------------------------------------------------------------------------------------------------------------
 * Define Utilities
 * ------------------------------------------------------------------------------------------------------------------ */

/**
 * Parses the alt and url from a markdown link string.
 *
 * @param value A markdown link string [string](string).
 * @returns [alt, url]
 */
export function parseMdLink(value: string) {
  ZMdLink.parse(value);
  const alt = value.match(/^\[.*\]/)!.pop()!;
  const url = value.match(/\(.*\)$/)!.pop()!;
  return [alt.slice(1, -1), url.slice(1, -1)];
}

/**
 * Creates a URL-normalized ID from the input heading.
 *
 * @param heading The heading string.
 * @returns The URL normalized ID.
 */
export function idFromHeading(heading: string) {
  return heading
    .toLowerCase()
    .trim()
    .replace(/\s/g, "-")
    .replace(/[^a-z1-9-._~]/g, "");
}
