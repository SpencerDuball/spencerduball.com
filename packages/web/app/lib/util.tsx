import { Node } from "@markdoc/markdoc";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

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

//----------------------------------------------------------------------------
// Define Markdoc Utils
//----------------------------------------------------------------------------

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

export const ZHeadingInfo = z.object({
  level: z.number(),
  id: z.string(),
  label: z.string(),
});
export type IHeadingInfo = z.infer<typeof ZHeadingInfo>;

function getHeadingLabel(nodes: Node[]) {
  let content = "";
  for (let node of nodes) {
    if (node.type === "inline") {
      content += getHeadingLabel(node.children);
    } else if (node.type === "text") {
      content += node.attributes.content;
    }
  }
  return content.trim();
}
export function getHeadingInfo(ast: Node) {
  return ast.children
    .filter((node) => node.type === "heading")
    .map((heading) => {
      const label = getHeadingLabel(heading.children);
      const id = heading.attributes.id || idFromHeading(label);
      return ZHeadingInfo.parse({ label, id, level: heading.attributes.level });
    });
}
