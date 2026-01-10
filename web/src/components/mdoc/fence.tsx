import Markdoc, { type Schema } from "@markdoc/markdoc";

interface FenceProps extends React.ComponentProps<"pre"> {
  content: string;
  language: string;
}

export function Fence({ content, language, ...props }: FenceProps) {
  return (
    <pre data-language={language} {...props}>
      <code>{content}</code>
    </pre>
  );
}

export const fence: Schema = {
  attributes: {
    content: { type: String, required: true, default: "" },
    language: { type: String, required: true, default: "txt" },
  },
  transform(node, config) {
    const { process, ...attributes } = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag("Fence", attributes, children);
  },
};
