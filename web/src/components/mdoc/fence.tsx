import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const pre = tv({
  base: "text-grey-200 bg-grey-800 dark:text-grey-300 overflow-x-auto dark:bg-[oklch(0_0_0/0.5)]",
  variants: {
    size: {
      sm: "mt-5 mb-5 rounded-[3.5rem] text-[0.75rem] leading-5",
      base: "",
      lg: "",
      xl: "",
      "2xl": "",
    },
  },
});

const code = tv({
  base: "rounded-none border-none bg-transparent p-0 before:content-none after:content-none",
  variants: {
    size: {
      sm: "",
      base: "",
      lg: "",
      xl: "",
      "2xl": "",
    },
  },
});

interface FenceProps extends React.ComponentProps<"pre"> {
  content: string;
  language: string;
}

export function Fence({ content, language, className, ...props }: FenceProps) {
  return (
    <pre data-language={language} className={pre({ size: "base", className })} {...props}>
      <code className={code({ size: "base", className })}>{content}</code>
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
