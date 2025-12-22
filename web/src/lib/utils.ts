import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod/v4";
import yaml from "js-yaml";

/**
 * The shadcn helper for merging classes
 *
 * @param inputs The class strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -------------------------------------------------------------------------------------
// Zod Utilities
// -------------------------------------------------------------------------------------

/**
 * Inputs a JSON string and transforms it into a JSON object in a typesafe manner.
 *
 * This function is useful to pipe into other validation functions. In the example below
 * we use this `ZJsonString` to parse a JSON string into an object & validate.
 * @example
 * ```ts
 * const ZString = z.object({
 *   state: ZJsonString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
 *   code: z.string()
 * });
 * ```
 */
export const ZJsonString = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as z.infer<typeof z.json>;
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid JSON string." });
    return z.NEVER;
  }
});

/**
 * Inputs a YAML string and transforms it into a JSON object in a typesafe manner.
 *
 * This function is useful to pipe into other validation functions. In the example below
 * we use the `ZYamlString` to parse a JSON string into an object & validate.
 * @example
 * ```ts
 * const ZString = z.object({
 *   state: ZYamlString.pipe(z.object({ id: z.string(), redirect_uri: z.string() })),
 *   code: z.string()
 * });
 * ```
 */
export const ZYamlString = z.string().transform((str, ctx) => {
  try {
    return yaml.load(str) as z.infer<typeof z.json>;
  } catch (e) {
    ctx.addIssue({ code: "custom", message: "Invalid YAML string." });
    return z.NEVER;
  }
});

// -------------------------------------------------------------------------------------
// TypeScript Utilities
// -------------------------------------------------------------------------------------

/**
 * Creates an action map from a passed object.
 *
 * Takes in a map of actions + their payloads and creates a new map with the action
 * represented as a type object. This is necessary when producing type unions where the
 * action string can be used as the discriminator in a discriminated union.
 */
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : undefined extends M[Key]
      ? { type: Key; payload?: M[Key] }
      : { type: Key; payload: M[Key] };
};

/**
 * Creates a discriminated union from a passed map.
 */
export type ActionUnion<M extends { [index: string]: any }> = ActionMap<M>[keyof ActionMap<M>];
