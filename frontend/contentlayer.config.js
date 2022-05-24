import {
  defineDocumentType,
  defineNestedType,
  makeSource,
} from "contentlayer/source-files";
import { computeReadingTimeOfPost } from "./utils/markdown-utils";

const Author = defineNestedType(() => ({
  name: "Author",
  fields: {
    image: { type: "string", required: true },
    name: { type: "string", required: true },
  },
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "blog/**/*.md",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true,
    },
    sample: {
      type: "string",
      description: "A paragraph sample of the blog post.",
      required: true,
    },
    published: {
      type: "date",
      description: "The publish date of the post",
      required: true,
    },
    updated: {
      type: "date",
      description: "The latest date the post was updated",
    },
    tags: {
      type: "list",
      of: { type: "string" },
    },
    author: {
      type: "nested",
      of: Author,
      required: true,
    },
  },
  computedFields: {
    url: {
      type: "string",
      description: "The url of the post",
      resolve: (post) => `/${post._raw.flattenedPath}`,
    },
    readingTime: {
      type: "number",
      description: "The reading time in minutes",
      resolve: (post) => computeReadingTimeOfPost(post.body.raw),
    },
  },
}));

export default makeSource({
  contentDirPath: "pages",
  contentDirInclude: ["blog"],
  documentTypes: [Post],
});
