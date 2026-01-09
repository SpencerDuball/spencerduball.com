import Markdoc, { type Schema } from "@markdoc/markdoc";
import { tv } from "tailwind-variants";

const pre = tv({
  base: "text-grey-200 bg-grey-800 dark:text-grey-300 overflow-x-auto font-normal dark:bg-[oklch(0_0_0/0.5)]",
  variants: {
    size: {
      sm: "mt-5 mb-5 rounded-lg ps-4 pe-4 pt-2 pb-2 text-xs leading-5",
      base: "mt-6 mb-6 rounded-[0.375rem] ps-4 pe-4 pt-3 pb-3 text-sm leading-6",
      lg: "mt-8 mb-8 rounded-[0.375rem] ps-6 pe-6 pt-4 pb-4 text-base leading-7",
      xl: "mt-9 mb-9 rounded-xl ps-6 pe-6 pt-5 pb-5 text-lg leading-8",
      "2xl": "mt-10 mb-10 rounded-xl ps-8 pe-8 pt-6 pb-6 text-xl leading-9",
    },
  },
});

const code = tv({
  base: "rounded-none border-none bg-transparent p-0 before:content-none after:content-none",
  variants: {
    size: {
      sm: "text-xs",
      base: "text-sm",
      lg: "text-base",
      xl: "text-lg",
      "2xl": "text-lg",
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
