import { type Config } from "@markdoc/markdoc";
import { heading, Heading } from "./heading";
import { paragraph, Paragraph } from "./paragraph";
import { hr, HorizontalRow } from "./hr";
import { image, Image } from "./image";
import { fence, Fence } from "./fence";
import { blockquote, Blockquote } from "./blockquote";
import { list, List, item, ListItem } from "./list";
import {
  table,
  Table,
  thead,
  TableHead,
  tbody,
  TableBody,
  tr,
  TableRow,
  td,
  TableData,
  th,
  TableHeader,
} from "./table";
import { strong, Strong } from "./strong";
import { em, Emphasis } from "./em";
import { s, Strikethrough } from "./s";
import { link, Link } from "./link";
import { code, Code } from "./code";
import { hardbreak, Hardbreak } from "./hardbreak";

export const MarkdocConfig: Config = {
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

export const components = {
  Heading,
  Paragraph,
  HorizontalRow,
  Image,
  Fence,
  Blockquote,
  List,
  ListItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableData,
  TableHeader,
  Strong,
  Emphasis,
  Strikethrough,
  Link,
  Code,
  Hardbreak,
};
