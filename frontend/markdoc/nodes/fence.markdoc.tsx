// @ts-ignore
import theme from "prism-react-renderer/themes/nightOwl";
import { RefAttributes, ForwardRefExoticComponent } from "react";
import {
  chakra,
  BoxProps,
  IconButton,
  Icon,
  IconButtonProps,
  useClipboard,
  LightMode,
} from "@chakra-ui/react";
import Highlight, { defaultProps, Language, Prism } from "prism-react-renderer";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { RiClipboardLine, RiCheckLine } from "react-icons/ri";

// add extra language support
((typeof global !== "undefined" ? global : window) as any).Prism = Prism;
require("prismjs/components/prism-ada"); // This MUST be a require. If you use 'import' there will be errors compiling.

// setup the scroll-box
type ScrollAreaTypeFix = ForwardRefExoticComponent<
  Omit<ScrollAreaPrimitive.ScrollAreaProps, "dir"> &
    RefAttributes<HTMLDivElement>
>;
const ScrollArea = chakra<ScrollAreaTypeFix>(ScrollAreaPrimitive.Root);
const Viewport = chakra(ScrollAreaPrimitive.Viewport);
const Scrollbar = chakra(ScrollAreaPrimitive.Scrollbar, {
  baseStyle: {
    display: "flex",
    userSelect: "none",
    touchAction: "none",
    padding: 1,
    background: "whiteA.6",
    transition: "background 160ms ease-out",
    "&:hover": { background: "blackA.8" },
    '&[data-orientation="vertical"]': { width: 3, height: "100%" },
    '&[data-orientation="horizontal"]': {
      flexDirection: "column",
      height: 3,
      width: "100%",
    },
  },
});
const Thumb = chakra(ScrollAreaPrimitive.Thumb, {
  baseStyle: {
    flex: 1,
    background: "_gray.10",
    borderRadius: 10,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      height: "100%",
    },
  },
});

// create the copy button
const CopyButton = (props: IconButtonProps & { code: string }) => {
  const { onCopy, hasCopied } = useClipboard(props.code, 3000);
  return (
    <IconButton
      icon={
        hasCopied ? (
          <Icon as={RiCheckLine} h={4} w={4} />
        ) : (
          <Icon as={RiClipboardLine} h={4} w={4} />
        )
      }
      size="sm"
      variant="ghost"
      onClick={onCopy}
      colorScheme="_grayDark"
      _hover={{ bg: "_grayDark.5" }}
      {...props}
    />
  );
};

// create the container
function CodeContainer(props: BoxProps) {
  const { children, ...rest } = props;
  return (
    <ScrollArea
      padding="5"
      rounded="md"
      my="8"
      bg="slateDark.3"
      overflow="hidden"
      {...rest}
    >
      <Viewport width="full" height="full">
        {children}
      </Viewport>
      <Scrollbar orientation="vertical">
        <Thumb />
      </Scrollbar>
      <Scrollbar orientation="horizontal">
        <Thumb />
      </Scrollbar>
    </ScrollArea>
  );
}

/**
 * Renders a code block with copy, theme colors, and scroll support. This is intended
 * to be used primarily for .mdx code, but if you want to use it directly you must have
 * children with the following properties to render as you want.
 * @example
 * <CodeBlock>
 *   <code class="language-py">
 *     a = 42
 *     def myFunc():
 *       abc = "123"
 *   </code>
 * </CodeBlock>
 *
 *
 * @param props BoxProps
 * @returns A CodeBlock
 */
const CodeBlock = (
  props: BoxProps & { content: string; language: string | undefined }
) => {
  const { content, language, ...rest } = props;

  const lang = (language ? language : "none") as Language;

  return (
    <CodeContainer w="full" position="relative" {...rest}>
      {/* @ts-ignore */}
      <LightMode>
        <CopyButton
          aria-label="Copy"
          position="absolute"
          code={content}
          top={2}
          right={2}
        />
      </LightMode>
      <Highlight {...defaultProps} code={content} language={lang} theme={theme}>
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <chakra.pre className={className} fontSize="sm" lineHeight="short">
            {tokens.map((line, i) => {
              const isLastLine = i === tokens.length - 1;
              const isLineEmpty = line[0].empty;
              if (isLastLine && isLineEmpty) return null;
              else
                return (
                  <chakra.div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <chakra.span key={i} {...getTokenProps({ token, key })} />
                    ))}
                  </chakra.div>
                );
            })}
          </chakra.pre>
        )}
      </Highlight>
    </CodeContainer>
  );
};

export const fence = {
  render: CodeBlock,
  attributes: {
    content: { type: String, required: true },
    language: { type: String },
  },
};
