import { useEffect, useRef, useState } from "react";
import { RiCheckLine, RiClipboardLine } from "react-icons/ri";
import { IconButton, Icon, useClipboard, LightMode, chakra, Grid, Text, Box } from "@chakra-ui/react";
import type { IconButtonProps } from "@chakra-ui/react";
import { ScrollBox } from "~/components/scroll-box";
import type { ScrollBoxProps } from "~/components/scroll-box";
import { z } from "zod";
import theme from "prism-react-renderer/themes/nightOwl";
import Highlight, { defaultProps } from "prism-react-renderer";
import type { Language } from "prism-react-renderer";

const CopyButton = (props: IconButtonProps & { code: string }) => {
  const { code, ...rest } = props;
  const { onCopy, hasCopied } = useClipboard(code, 3000);
  return (
    <IconButton
      icon={hasCopied ? <Icon as={RiCheckLine} h={4} w={4} /> : <Icon as={RiClipboardLine} h={4} w={4} />}
      size="sm"
      variant="ghost"
      onClick={onCopy}
      colorScheme="_grayDark"
      {...rest}
    />
  );
};

const useComputeScrollHeight = () => {
  const nameRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("100%");
  useEffect(() => {
    if (nameRef && nameRef.current) setHeight(`calc(100% - ${nameRef.current.clientHeight}px)`);
  }, []);

  return { nameRef, height };
};

// CodeBlock
////////////////////////////////////////////////////////////////////////////////
export interface CodeBlockProps extends ScrollBoxProps {
  name?: string;
}

export const CodeBlock = (props: ScrollBoxProps) => {
  const { children, name, ...rest } = props;

  let { children: codeString, className } = z
    .object({ children: z.string(), className: z.string() })
    .parse(props.children.props);
  const highlightProps = { codeString, language: "txt", theme };

  // set the optionally specified language
  const RE = /language-[a-zA-Z]+/;
  if (className.search(RE) !== -1) {
    const [language] = className.match(RE)!;
    highlightProps.language = language.replace("language-", "");
  }

  // compute scrollbox height
  const { nameRef, height } = useComputeScrollHeight();

  return (
    <Box position="relative" my={8} borderRadius="lg" bg="slateDark.3" overflow="hidden" {...rest}>
      {name && (
        <Grid ref={nameRef} bg="whiteA.4" borderBottom="1px solid" borderBottomColor="whiteA.7" px={5} py={3}>
          <Text color="_grayDark.12" fontWeight="bold">
            {name}
          </Text>
        </Grid>
      )}
      <ScrollBox height={height}>
        <Grid p={5}>
          <Highlight
            {...defaultProps}
            code={highlightProps.codeString}
            language={highlightProps.language as Language}
            theme={theme}
          >
            {({ className, tokens, getLineProps, getTokenProps }) => (
              <chakra.pre className={className} fontSize="sm" lineHeight="short">
                {tokens.map((line, i) => {
                  const isLastLine = i === tokens.length - 1;
                  const isLineEmpty = line[0].empty;
                  if (isLastLine && isLineEmpty) return null;
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
        </Grid>
      </ScrollBox>
      <LightMode>
        <CopyButton aria-label="Copy" position="absolute" code={highlightProps.codeString} top={2} right={2} />
      </LightMode>
    </Box>
  );
};
