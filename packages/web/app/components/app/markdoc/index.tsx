import { ConfigType } from "@markdoc/markdoc";
import { heading, Heading } from "./components/Heading";
import { paragraph, Paragraph } from "./components/Paragraph";
import { hr, Hr } from "./components/Hr";
import { image, Image } from "./components/Image";
import { fence, Fence } from "./components/Fence";
import { blockquote, Blockquote } from "./components/Blockquote";
import { strong, Strong } from "./components/Strong";
import { list, List } from "./components/List";
import { table, Table } from "./components/Table";
import { th, Th } from "./components/Th";
import { td, Td } from "./components/Td";
import { link, Link } from "./components/Link";
import { code, Code } from "./components/Code";
import { video, Video } from "./components/Video";
import { callout, Callout } from "./components/Callout";
import { tag, Tag } from "./components/Tag";

export const config = {
  tags: {
    video,
    callout,
    tag,
  },
  nodes: {
    heading,
    paragraph,
    hr,
    image,
    fence,
    blockquote,
    list,
    table,
    th,
    td,
    strong,
    link,
    code,
  },
} satisfies ConfigType;

export const components = {
  Heading,
  Paragraph,
  Hr,
  Image,
  Fence,
  Blockquote,
  List,
  Table,
  Th,
  Td,
  Strong,
  Link,
  Code,
  Video,
  Callout,
  Tag,
};
