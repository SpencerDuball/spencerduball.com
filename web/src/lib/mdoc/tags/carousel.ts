import Markdoc, { Node, type Schema } from "@markdoc/markdoc";

function collectImages(node: Node, collector: Node[]) {
  if (node.type === "image") collector.push(node);
  else for (const child of node.children) collectImages(child, collector);
}

export const carousel: Schema = {
  render: "Carousel",
  children: ["image"],
  transform(node, config) {
    const attributes = node.transformAttributes(config);

    // extract the image nodes
    const childs: Node[] = [];
    for (const child of node.children) collectImages(child, childs);

    return new Markdoc.Tag("Carousel", attributes, Markdoc.transform(childs, config));
  },
};
