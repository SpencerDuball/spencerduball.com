import { Schema, type Config } from "@markdoc/markdoc";
import { Heading } from "./heading.mdoc";

const heading: Schema = {
  children: ["inline"],
  attributes: {
    level: { type: Number, required: true, default: 1 },
  },
  render: "Heading",
};

export const MarkdocConfig: Config = {
  // These are the built-in CommonMark nodes that Markdoc supports. Refer to the docs:
  // https://markdoc.dev/docs/nodes#built-in-nodes
  nodes: {
    heading,
    // paragraph: { render: "Paragraph" },
    // hr: { render: "HorizontalRow" },
    // image: { render: "Image" },
    // fence: { render: "Fence" },
    // blockquote: { render: "Blockquote" },
    // list: { render: "List" },
    // item: { render: "ListItem" },
    // table: { render: "Table" },
    // thead: { render: "TableHead" },
    // tbody: { render: "TableBody" },
    // tr: { render: "TableRow" },
    // td: { render: "TableData" },
    // th: { render: "TableHeader" },
    // strong: { render: "Strong" },
    // em: { render: "Emphasis" },
    // s: { render: "Strikethrough" },
    // link: { render: "Link" },
    // code: { render: "Code" },
    // hardbreak: { render: "Hardbreak" },
  },
  tags: {},
};

export const components = {
  Heading,
};
