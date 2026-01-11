import { type Node } from "@markdoc/markdoc";
import { z } from "zod/v4";

// -------------------------------------------------------------------------------------
// Globals
// -------------------------------------------------------------------------------------

/**
 * The runtime validated environment variables on the server.
 */
export const serverEnv = z.object({ NODE_ENV: z.enum(["development", "production", "test"]) }).parse(process.env);

// -------------------------------------------------------------------------------------
// Markdoc
// -------------------------------------------------------------------------------------

interface TocItem {
  title: string;
  id: string;
  level: number;
  children: TocItem[];
}

export class MarkdocUtil {
  /**
   * Removes the margin and padding from the first and last elements of the tree.
   *
   * Note that this function modifies the AST in place and returns a reference to the AST.
   *
   * @params The AST of the markdoc.
   */
  public static clearBoundaryMargins(ast: Node) {
    // filter out non-renderable nodes
    const nodes = ast.children.filter((node) => !["document", "comment", "error"].includes(node.type));

    // add classes to remove the margins as necessary
    const first = nodes.length > 0 ? nodes.at(0) : undefined;
    const last = nodes.length > 1 ? nodes.at(-1) : undefined;
    if (first) first.attributes["class"] = first.attributes["class"] ? `${first.attributes["class"]} mt-0` : "mt-0";
    if (last) last.attributes["class"] = last.attributes["class"] ? `${last.attributes["class"]} mb-0` : "mb-0";

    return ast;
  }

  /**
   * Extracts the text from a tree node recursively.
   *
   * @param node The AST tree node to process.
   */
  private static extractText(node: Node): string {
    let text: string = node.attributes["content"] ? node.attributes["content"] : "";
    for (const child of node.children) text += this.extractText(child);
    return text;
  }

  /**
   * Slugifies some text.
   *
   * @param text The text to slugify.
   */
  private static slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // /**
  //  * Takes in an AST and returns a TocHeading array.
  //  *
  //  * @param ast The AST node to process.
  //  */
  // public static getTableOfContents(ast: Node, sections: TocHeading[] = []) {
  //   // if this is a heading node, extract it's data
  //   if (ast.type === "heading") {
  //     const attrs = ast.attributes;
  //     const title = this.extractText(ast);
  //     const id = attrs.id && typeof attrs.id === "string" ? attrs.id : this.slugify(title);
  //     const level = attrs.level ?? 1;
  //     sections.push({ title, id, level });
  //   }

  //   // recursively check all children
  //   for (const child of ast.children ?? []) this.getTableOfContents(child, sections);

  //   return sections;
  // }

  public static buildToc(ast: Node): TocItem[] {
    const toc: TocItem[] = [];
    const stack: TocItem[] = [];

    for (const node of ast.walk()) {
      if (node.type === "heading") {
        // create the TocItem
        const level: number = node.attributes.level;
        const title = this.extractText(node);
        const id =
          node.attributes.id && typeof node.attributes.id === "string" ? node.attributes.id : this.slugify(title);
        const item: TocItem = { title, id, level, children: [] };

        // determine nesting logic
        if (stack.length === 0) {
          // this is the first heading we've encountered
          toc.push(item);
          stack.push(item);
        } else {
          // pop from stack until we find the parent (a lower level number)
          while (stack.length > 0 && stack.at(-1)!.level >= level) stack.pop();

          if (stack.length === 0) toc.push(item);
          else stack.at(-1)!.children.push(item);

          stack.push(item);
        }
      }
    }

    return toc;
  }
}
