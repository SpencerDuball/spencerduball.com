import { type Node, type Config } from "@markdoc/markdoc";
import { heading } from "./nodes/heading";
import { paragraph } from "./nodes/paragraph";
import { hr } from "./nodes/hr";
import { image } from "./nodes/image";
import { fence } from "./nodes/fence";
import { blockquote } from "./nodes/blockquote";
import { list, item } from "./nodes/list";
import { table, thead, tbody, tr, td, th } from "./nodes/table";
import { strong } from "./nodes/strong";
import { em } from "./nodes/em";
import { s } from "./nodes/s";
import { link } from "./nodes/link";
import { code } from "./nodes/code";
import { hardbreak } from "./nodes/hardbreak";

// -------------------------------------------------------------------------------------
// Utilities
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
  public static extractText(node: Node): string {
    let text: string = node.attributes["content"] ? node.attributes["content"] : "";
    for (const child of node.children) text += this.extractText(child);
    return text;
  }

  /**
   * Slugifies some text.
   *
   * @param text The text to slugify.
   */
  public static slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  /**
   * Creates a TOC structure from the AST.
   *
   * @param ast The markdoc AST.
   */
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

// -------------------------------------------------------------------------------------
// Config
// -------------------------------------------------------------------------------------

export const config: Config = {
  // These are the built-in CommonMark nodes that Markdoc supports. Refer to the docs:
  // https://markdoc.dev/docs/nodes#built-in-nodes
  nodes: {
    heading,
    paragraph,
    hr,
    image,
    fence,
    blockquote,
    list,
    item,
    table,
    thead,
    tbody,
    tr,
    td,
    th,
    strong,
    em,
    s,
    link,
    code,
    hardbreak,
  },
  tags: {},
};
