import Markdoc, { type Schema } from "@markdoc/markdoc";
import { codeToHtml } from "shiki";

export const fence: Schema = {
  attributes: {
    content: { type: String, required: true, default: "" },
    language: { type: String, required: true, default: "txt" },
  },
  async transform(node, config) {
    const { process, ...attributes } = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const content = await codeToHtml(attributes.content, {
      lang: attributes.language,
      theme: "dark-plus",
      structure: "inline",
    });
    return new Markdoc.Tag("Fence", { ...attributes, content }, children);
  },
};
