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

/**
 * Implements a map of HTTP status codes to statusText messages.
 *
 * @param status The HTTP status.
 */
export function statusText(status: number) {
  switch (status) {
    case 100:
      return "Continue";
    case 101:
      return "Switching Protocols";
    case 102:
      return "Processing";
    case 103:
      return "Early Hints";
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 202:
      return "Accepted";
    case 203:
      return "Non-Authoratative Information";
    case 204:
      return "No Content";
    case 205:
      return "Reset Content";
    case 206:
      return "Partial Content";
    case 207:
      return "Multi-Status";
    case 208:
      return "Already Reported";
    case 226:
      return "IM Used";
    case 300:
      return "Multiple Choices";
    case 301:
      return "Moved Permanently";
    case 302:
      return "Found";
    case 303:
      return "See Other";
    case 304:
      return "Not Modified";
    case 305:
      return "Use Proxy";
    case 306:
      return "unused";
    case 307:
      return "Temporary Redirect";
    case 308:
      return "Permanent Redirect";
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 402:
      return "Payment Required";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 405:
      return "Method Not Allowed";
    case 406:
      return "Not Acceptable";
    case 407:
      return "Proxy Authentication Required";
    case 408:
      return "Request Timeout";
    case 409:
      return "Conflict";
    case 410:
      return "Gone";
    case 411:
      return "Length Required";
    case 412:
      return "Precondition Failed";
    case 413:
      return "Payload Too Large";
    case 414:
      return "URI Too Long";
    case 415:
      return "Unsupported Media Type";
    case 416:
      return "Range Not Satisfiable";
    case 417:
      return "Expectation Failed";
    case 418:
      return "I'm a teapot";
    case 421:
      return "Misdirected Request";
    case 422:
      return "Unprocessable Content";
    case 423:
      return "Locked";
    case 424:
      return "Failed Dependency";
    case 425:
      return "Too Early";
    case 426:
      return "Upgrade Required";
    case 428:
      return "Precondition Required";
    case 429:
      return "Too Many Requests";
    case 431:
      return "Request Header Fields Too Large";
    case 451:
      return "Unavailable For Legal Reasons";
    case 500:
      return "Internal Server Error";
    case 501:
      return "Not Implemented";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    case 504:
      return "Gateway Timeout";
    case 505:
      return "HTTP Version Not Supported";
    case 506:
      return "Variant Also Negotiates";
    case 507:
      return "Insufficient Storage";
    case 508:
      return "Loop Detected";
    case 510:
      return "Not Extended";
    case 511:
      return "Network Authentication Required";
    default:
      return "Unknown";
  }
}
